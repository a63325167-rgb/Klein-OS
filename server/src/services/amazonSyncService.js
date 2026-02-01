/**
 * Amazon Sync Service (B8)
 * 
 * Orchestrates syncing data from SP-API:
 * - Orders
 * - Products (catalog/listings)
 * - Inventory
 * - Financial events (fees)
 * 
 * Recalculates B1-B7 metrics after sync.
 */

const { SpApiClient } = require('./spApiClient');
const { decryptToken } = require('./amazonAuth');
const { 
  calculateProductMetrics 
} = require('../utils/bulkCalculations');

/**
 * Sync orders for a seller
 * 
 * @param {Object} seller - Seller database record
 * @param {Object} db - Database connection
 * @param {Object} options - Sync options
 */
async function syncOrders(seller, db, options = {}) {
  const {
    daysBack = 30,
    marketplaceIds = [seller.default_marketplace_id]
  } = options;
  
  console.log(`[Sync] Starting orders sync for seller ${seller.amazon_seller_id}`);
  
  try {
    // Create SP-API client
    const refreshToken = decryptToken(seller.lwa_refresh_token);
    const client = new SpApiClient({
      sellerId: seller.amazon_seller_id,
      region: getRegionForMarketplace(marketplaceIds[0]),
      refreshToken,
      roleCredentials: getAwsCredentials()
    });
    
    // Calculate date range
    const createdAfter = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString();
    
    let nextToken = null;
    let totalOrders = 0;
    let totalItems = 0;
    
    do {
      // Fetch orders
      const response = await client.listOrders({
        marketplaceIds,
        createdAfter,
        maxResults: 100,
        nextToken
      });
      
      const orders = response.payload?.Orders || response.Orders || [];
      
      // Process each order
      for (const orderData of orders) {
        // Upsert order
        const order = await db.order.upsert({
          where: {
            amazon_order_id: orderData.AmazonOrderId
          },
          update: {
            seller_id: seller.id,
            marketplace_id: orderData.MarketplaceId,
            order_status: orderData.OrderStatus,
            fulfillment_channel: orderData.FulfillmentChannel,
            sales_channel: orderData.SalesChannel,
            order_type: orderData.OrderType,
            purchase_date: orderData.PurchaseDate,
            last_update_date: orderData.LastUpdateDate,
            currency_code: orderData.OrderTotal?.CurrencyCode,
            order_total_amount: parseFloat(orderData.OrderTotal?.Amount || 0),
            synced_at: new Date()
          },
          create: {
            seller_id: seller.id,
            amazon_order_id: orderData.AmazonOrderId,
            marketplace_id: orderData.MarketplaceId,
            order_status: orderData.OrderStatus,
            fulfillment_channel: orderData.FulfillmentChannel,
            sales_channel: orderData.SalesChannel,
            order_type: orderData.OrderType,
            purchase_date: orderData.PurchaseDate,
            last_update_date: orderData.LastUpdateDate,
            currency_code: orderData.OrderTotal?.CurrencyCode,
            order_total_amount: parseFloat(orderData.OrderTotal?.Amount || 0),
            synced_at: new Date()
          }
        });
        
        totalOrders++;
        
        // Fetch order items
        try {
          const itemsResponse = await client.getOrderItems(orderData.AmazonOrderId);
          const items = itemsResponse.payload?.OrderItems || itemsResponse.OrderItems || [];
          
          for (const itemData of items) {
            await db.order_item.upsert({
              where: {
                order_item_id: itemData.OrderItemId
              },
              update: {
                order_id: order.id,
                seller_id: seller.id,
                asin: itemData.ASIN,
                sku: itemData.SellerSKU,
                title: itemData.Title,
                quantity_ordered: itemData.QuantityOrdered,
                quantity_shipped: itemData.QuantityShipped || 0,
                currency_code: itemData.ItemPrice?.CurrencyCode,
                item_price_amount: parseFloat(itemData.ItemPrice?.Amount || 0),
                item_tax_amount: parseFloat(itemData.ItemTax?.Amount || 0),
                shipping_price_amount: parseFloat(itemData.ShippingPrice?.Amount || 0),
                shipping_tax_amount: parseFloat(itemData.ShippingTax?.Amount || 0),
                promotion_discount_amount: parseFloat(itemData.PromotionDiscount?.Amount || 0)
              },
              create: {
                order_id: order.id,
                seller_id: seller.id,
                order_item_id: itemData.OrderItemId,
                asin: itemData.ASIN,
                sku: itemData.SellerSKU,
                title: itemData.Title,
                quantity_ordered: itemData.QuantityOrdered,
                quantity_shipped: itemData.QuantityShipped || 0,
                currency_code: itemData.ItemPrice?.CurrencyCode,
                item_price_amount: parseFloat(itemData.ItemPrice?.Amount || 0),
                item_tax_amount: parseFloat(itemData.ItemTax?.Amount || 0),
                shipping_price_amount: parseFloat(itemData.ShippingPrice?.Amount || 0),
                shipping_tax_amount: parseFloat(itemData.ShippingTax?.Amount || 0),
                promotion_discount_amount: parseFloat(itemData.PromotionDiscount?.Amount || 0)
              }
            });
            
            totalItems++;
          }
        } catch (itemError) {
          console.error(`Failed to fetch items for order ${orderData.AmazonOrderId}:`, itemError.message);
        }
        
        // Rate limiting delay
        await sleep(200);
      }
      
      nextToken = response.payload?.NextToken || response.NextToken;
    } while (nextToken);
    
    console.log(`[Sync] Orders sync complete: ${totalOrders} orders, ${totalItems} items`);
    
    return {
      success: true,
      ordersCount: totalOrders,
      itemsCount: totalItems
    };
  } catch (error) {
    console.error('[Sync] Orders sync failed:', error.message);
    throw error;
  }
}

/**
 * Sync products for a seller
 * 
 * @param {Object} seller - Seller database record
 * @param {Object} db - Database connection
 * @param {Object} options - Sync options
 */
async function syncProducts(seller, db, options = {}) {
  const {
    marketplaceIds = [seller.default_marketplace_id]
  } = options;
  
  console.log(`[Sync] Starting products sync for seller ${seller.amazon_seller_id}`);
  
  try {
    const refreshToken = decryptToken(seller.lwa_refresh_token);
    const client = new SpApiClient({
      sellerId: seller.amazon_seller_id,
      region: getRegionForMarketplace(marketplaceIds[0]),
      refreshToken,
      roleCredentials: getAwsCredentials()
    });
    
    // Get inventory report (contains all active SKUs)
    const reportData = await client.getInventoryReport(marketplaceIds);
    
    // Parse CSV report
    const lines = reportData.data.split('\n');
    const headers = lines[0].split('\t');
    
    let totalProducts = 0;
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split('\t');
      const row = {};
      
      headers.forEach((header, idx) => {
        row[header] = values[idx];
      });
      
      // Extract product data
      const sku = row['seller-sku'] || row['sku'];
      const asin = row['asin'];
      const fnsku = row['fnsku'];
      const title = row['product-name'];
      const quantity = parseInt(row['Fulfillable Quantity'] || row['afn-fulfillable-quantity'] || 0);
      const condition = row['condition'];
      
      if (!sku || !asin) continue;
      
      // Upsert product
      await db.product.upsert({
        where: {
          seller_id_sku_marketplace_id: {
            seller_id: seller.id,
            sku,
            marketplace_id: marketplaceIds[0]
          }
        },
        update: {
          asin,
          fnsku,
          title,
          condition_type: condition?.toLowerCase() || 'new',
          status: 'active',
          fulfillment_channel: 'FBA',
          synced_from_sp_api: true,
          last_synced_at: new Date()
        },
        create: {
          seller_id: seller.id,
          marketplace_id: marketplaceIds[0],
          asin,
          sku,
          fnsku,
          title,
          condition_type: condition?.toLowerCase() || 'new',
          status: 'active',
          fulfillment_channel: 'FBA',
          synced_from_sp_api: true,
          last_synced_at: new Date()
        }
      });
      
      // Update inventory snapshot
      await db.inventory_snapshot.create({
        data: {
          product_id: (await db.product.findFirst({ where: { seller_id: seller.id, sku } })).id,
          seller_id: seller.id,
          marketplace_id: marketplaceIds[0],
          quantity_available: quantity,
          snapshot_date: new Date()
        }
      });
      
      totalProducts++;
    }
    
    console.log(`[Sync] Products sync complete: ${totalProducts} products`);
    
    return {
      success: true,
      productsCount: totalProducts
    };
  } catch (error) {
    console.error('[Sync] Products sync failed:', error.message);
    throw error;
  }
}

/**
 * Sync financial events (fees) for a seller
 * 
 * @param {Object} seller - Seller database record
 * @param {Object} db - Database connection
 * @param {Object} options - Sync options
 */
async function syncFinancialEvents(seller, db, options = {}) {
  const {
    daysBack = 30
  } = options;
  
  console.log(`[Sync] Starting financial events sync for seller ${seller.amazon_seller_id}`);
  
  try {
    const refreshToken = decryptToken(seller.lwa_refresh_token);
    const client = new SpApiClient({
      sellerId: seller.amazon_seller_id,
      region: getRegionForMarketplace(seller.default_marketplace_id),
      refreshToken,
      roleCredentials: getAwsCredentials()
    });
    
    // Calculate date range
    const postedAfter = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString();
    
    let nextToken = null;
    let totalEvents = 0;
    
    do {
      const response = await client.listFinancialEvents({
        postedAfter,
        maxResults: 100,
        nextToken
      });
      
      const events = response.payload?.FinancialEvents || response.FinancialEvents || {};
      
      // Process shipment events (contain order-level fees)
      if (events.ShipmentEventList) {
        for (const shipment of events.ShipmentEventList) {
          const orderId = shipment.AmazonOrderId;
          
          // Process item fees
          if (shipment.ShipmentItemList) {
            for (const item of shipment.ShipmentItemList) {
              const sku = item.SellerSKU;
              const asin = item.ASIN;
              
              // Process each fee
              if (item.ItemFeeList) {
                for (const fee of item.ItemFeeList) {
                  await db.financial_event.create({
                    data: {
                      seller_id: seller.id,
                      event_type: 'order_fee',
                      amazon_order_id: orderId,
                      asin,
                      sku,
                      fee_type: fee.FeeType,
                      currency_code: fee.FeeAmount?.CurrencyCode,
                      amount: parseFloat(fee.FeeAmount?.Amount || 0),
                      posted_date: shipment.PostedDate,
                      synced_at: new Date()
                    }
                  });
                  
                  totalEvents++;
                }
              }
            }
          }
        }
      }
      
      nextToken = response.payload?.NextToken || response.NextToken;
    } while (nextToken);
    
    console.log(`[Sync] Financial events sync complete: ${totalEvents} events`);
    
    return {
      success: true,
      eventsCount: totalEvents
    };
  } catch (error) {
    console.error('[Sync] Financial events sync failed:', error.message);
    throw error;
  }
}

/**
 * Recalculate metrics for all products
 * 
 * @param {string} sellerId - Seller ID
 * @param {Object} db - Database connection
 */
async function recalculateMetrics(sellerId, db) {
  console.log(`[Metrics] Recalculating metrics for seller ${sellerId}`);
  
  try {
    // Get all products for seller
    const products = await db.product.findMany({
      where: { seller_id: sellerId, status: 'active' },
      include: {
        order_items: {
          where: {
            created_at: {
              gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
            }
          }
        },
        financial_events: {
          where: {
            posted_date: {
              gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
            }
          }
        },
        inventory_snapshots: {
          orderBy: { snapshot_date: 'desc' },
          take: 1
        }
      }
    });
    
    for (const product of products) {
      // Derive monthly sales velocity from orders
      const monthlyVelocity = calculateMonthlyVelocity(product.order_items);
      
      // Derive return rate from order data
      const returnRate = calculateReturnRate(product.order_items);
      
      // Derive fees from financial events
      const { referralFeePercent, fbaFeePerUnit } = calculateAverageFees(product.financial_events, product.current_price || 0);
      
      // Get current price (from orders or listing)
      const currentPrice = product.current_price || deriveCurrentPrice(product.order_items);
      
      // Calculate all metrics using B1-B7 logic
      const metrics = calculateProductMetrics({
        asin: product.asin,
        name: product.title,
        price: currentPrice,
        cogs: product.cogs_per_unit || 0,
        velocity: monthlyVelocity,
        returnRate,
        referralFee: referralFeePercent,
        fbaFee: fbaFeePerUnit,
        vat: 19, // Default VAT, can be customized
        shippingCost: product.shipping_cost_per_unit || 2,
        initialOrder: monthlyVelocity * 2,
        initialCash: 5000, // Default, can be customized per seller
        competitorCount: 0, // Would come from external source
        rating: 3.5,
        category: product.category || 'Uncategorized'
      });
      
      // Upsert product metrics
      await db.product_metrics.upsert({
        where: {
          product_id: product.id
        },
        update: {
          marketplace_id: product.marketplace_id,
          selling_price: metrics.price,
          cogs_per_unit: metrics.cogs,
          landed_cost: metrics.landedCost,
          monthly_sales_velocity: metrics.velocity,
          return_rate_percent: metrics.returnRate,
          referral_fee_percent: metrics.referralFee,
          fba_fee_per_unit: metrics.fbaFee,
          revenue_after_returns: metrics.revenueAfterReturns,
          profit_per_unit: metrics.profitPerUnit,
          profit_margin_percent: metrics.profitMargin,
          total_monthly_profit: metrics.totalMonthlyProfit,
          break_even_days: metrics.breakEvenDays,
          cash_runway_months: metrics.cashRunway,
          inventory_turnover_days: metrics.turnoverDays,
          health_score: metrics.healthScore,
          profitability_risk_level: metrics.profitabilityRisk,
          breakeven_risk_level: metrics.breakEvenRisk,
          cashflow_risk_level: metrics.cashFlowRisk,
          competition_risk_level: metrics.competitionRisk,
          inventory_risk_level: metrics.inventoryRisk,
          critical_risks_count: metrics.criticalRisks,
          last_calculated_at: new Date()
        },
        create: {
          product_id: product.id,
          marketplace_id: product.marketplace_id,
          selling_price: metrics.price,
          cogs_per_unit: metrics.cogs,
          landed_cost: metrics.landedCost,
          monthly_sales_velocity: metrics.velocity,
          return_rate_percent: metrics.returnRate,
          referral_fee_percent: metrics.referralFee,
          fba_fee_per_unit: metrics.fbaFee,
          revenue_after_returns: metrics.revenueAfterReturns,
          profit_per_unit: metrics.profitPerUnit,
          profit_margin_percent: metrics.profitMargin,
          total_monthly_profit: metrics.totalMonthlyProfit,
          break_even_days: metrics.breakEvenDays,
          cash_runway_months: metrics.cashRunway,
          inventory_turnover_days: metrics.turnoverDays,
          health_score: metrics.healthScore,
          profitability_risk_level: metrics.profitabilityRisk,
          breakeven_risk_level: metrics.breakEvenRisk,
          cashflow_risk_level: metrics.cashFlowRisk,
          competition_risk_level: metrics.competitionRisk,
          inventory_risk_level: metrics.inventoryRisk,
          critical_risks_count: metrics.criticalRisks,
          last_calculated_at: new Date()
        }
      });
    }
    
    console.log(`[Metrics] Recalculation complete: ${products.length} products updated`);
    
    return {
      success: true,
      productsUpdated: products.length
    };
  } catch (error) {
    console.error('[Metrics] Recalculation failed:', error.message);
    throw error;
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function calculateMonthlyVelocity(orderItems) {
  if (!orderItems || orderItems.length === 0) return 0;
  
  const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity_ordered, 0);
  const daysCovered = 90; // Last 90 days
  const monthlyVelocity = (totalQuantity / daysCovered) * 30;
  
  return Math.round(monthlyVelocity * 10) / 10;
}

function calculateReturnRate(orderItems) {
  // Simplified - would need return data from refunds
  return 5; // Default 5%
}

function calculateAverageFees(financialEvents, sellingPrice) {
  if (!financialEvents || financialEvents.length === 0 || sellingPrice === 0) {
    return {
      referralFeePercent: 15,
      fbaFeePerUnit: 0
    };
  }
  
  const referralFees = financialEvents.filter(e => e.fee_type === 'ReferralFee');
  const fbaFees = financialEvents.filter(e => e.fee_type === 'FBAPerUnitFulfillmentFee');
  
  const avgReferralFee = referralFees.length > 0
    ? referralFees.reduce((sum, f) => sum + Math.abs(f.amount), 0) / referralFees.length
    : sellingPrice * 0.15;
  
  const avgFbaFee = fbaFees.length > 0
    ? fbaFees.reduce((sum, f) => sum + Math.abs(f.amount), 0) / fbaFees.length
    : 0;
  
  return {
    referralFeePercent: (avgReferralFee / sellingPrice) * 100,
    fbaFeePerUnit: avgFbaFee
  };
}

function deriveCurrentPrice(orderItems) {
  if (!orderItems || orderItems.length === 0) return 0;
  
  // Use median price from recent orders
  const prices = orderItems.map(item => item.item_price_amount / item.quantity_ordered);
  prices.sort((a, b) => a - b);
  
  const mid = Math.floor(prices.length / 2);
  return prices.length % 2 === 0
    ? (prices[mid - 1] + prices[mid]) / 2
    : prices[mid];
}

function getRegionForMarketplace(marketplaceId) {
  const euMarketplaces = ['A1PA6795UKMFR9', 'A1F83G8C2ARO7P', 'A13V1IB3VIYZZH', 'APJ6JRA9NG5V4', 'A1RKKUPIHCS9HS'];
  const naMarketplaces = ['ATVPDKIKX0DER', 'A2EUQ1WTGCTBG2', 'A1AM78C64UM0Y8'];
  const feMarketplaces = ['A39IBJ37TRP1C6', 'A1VC38T7YXB528'];
  
  if (euMarketplaces.includes(marketplaceId)) return 'eu';
  if (naMarketplaces.includes(marketplaceId)) return 'na';
  if (feMarketplaces.includes(marketplaceId)) return 'fe';
  
  return 'eu'; // Default
}

function getAwsCredentials() {
  return {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN
  };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  syncOrders,
  syncProducts,
  syncFinancialEvents,
  recalculateMetrics
};
