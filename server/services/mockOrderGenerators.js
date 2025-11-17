/**
 * Mock Order Generators for Cross-Channel Profitability SaaS
 * 
 * Generates realistic mock orders for Amazon, Shopify, and Noon channels
 * No real API calls - pure mock data generation
 */

const { v4: uuidv4 } = require('uuid');

// Product catalog (same 5 products across all channels)
const PRODUCT_CATALOG = [
  'Wireless Charger',
  'USB Cable',
  'Phone Stand',
  'Screen Protector',
  'Phone Case'
];

/**
 * Generate random number between min and max (inclusive)
 */
function randomFloat(min, max, decimals = 2) {
  const value = Math.random() * (max - min) + min;
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Generate random integer between min and max (inclusive)
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate random date within last N days
 */
function randomDate(daysAgo = 30) {
  const now = new Date();
  const daysBack = randomInt(0, daysAgo);
  const date = new Date(now);
  date.setDate(date.getDate() - daysBack);
  date.setHours(randomInt(9, 20)); // Business hours
  date.setMinutes(randomInt(0, 59));
  date.setSeconds(randomInt(0, 59));
  return date;
}

/**
 * Generate random SKU
 */
function generateSKU() {
  const digits = randomInt(100, 999);
  return `SKU-${digits}`;
}

/**
 * Generate Amazon orders
 * 
 * @param {number} count - Number of orders to generate (default: 20)
 * @returns {Array<Object>} Array of Amazon order objects
 */
function generateAmazonOrders(count = 20) {
  const orders = [];
  const productCount = PRODUCT_CATALOG.length;
  
  for (let i = 0; i < count; i++) {
    const productIndex = i % productCount;
    const productName = PRODUCT_CATALOG[productIndex];
    const sellingPrice = randomFloat(25, 50);
    const quantity = randomInt(1, 5);
    
    // Amazon-specific fees
    const amazonFeePercent = 15; // Referral fee
    const referralFeeAmount = (sellingPrice * amazonFeePercent) / 100;
    const fbaFeePerUnit = randomFloat(2.00, 4.00); // FBA fulfillment + storage
    const shippingCostToAmazon = randomFloat(0.50, 2.00); // Inbound shipping
    
    // Calculate total costs per unit
    const totalFeesPerUnit = referralFeeAmount + fbaFeePerUnit;
    const totalCostPerUnit = totalFeesPerUnit + shippingCostToAmazon;
    
    // Target margin: 35-50% for Amazon
    // Calculate COGS to achieve target margin
    const targetMarginPercent = randomFloat(35, 50);
    const targetNetProfit = (sellingPrice * targetMarginPercent) / 100;
    const cogs = sellingPrice - totalCostPerUnit - targetNetProfit;
    
    // Ensure COGS is realistic (30-45% of selling price for electronics)
    const minCogs = sellingPrice * 0.30;
    const maxCogs = sellingPrice * 0.45;
    const adjustedCogs = Math.max(minCogs, Math.min(maxCogs, cogs));
    
    const netProfitPerUnit = sellingPrice - totalCostPerUnit - adjustedCogs;
    const margin = (netProfitPerUnit / sellingPrice) * 100;
    
    const order = {
      id: `amz-${uuidv4()}`,
      channel: 'amazon',
      sku: generateSKU(),
      productName: productName,
      quantity: quantity,
      sellingPrice: Math.round(sellingPrice * 100) / 100,
      cogs: Math.round(adjustedCogs * 100) / 100,
      amazonFeePercent: amazonFeePercent,
      referralFeeAmount: Math.round(referralFeeAmount * 100) / 100,
      fbaFeePerUnit: Math.round(fbaFeePerUnit * 100) / 100,
      shippingCostToAmazon: Math.round(shippingCostToAmazon * 100) / 100,
      totalFeesPerUnit: Math.round(totalFeesPerUnit * 100) / 100,
      netProfitPerUnit: Math.round(netProfitPerUnit * 100) / 100,
      margin: Math.round(margin * 100) / 100,
      createdAt: randomDate(30),
      // Additional fields for normalization
      channelFees: Math.round((totalFeesPerUnit * quantity) * 100) / 100,
      shippingCost: Math.round((shippingCostToAmazon * quantity) * 100) / 100,
      netProfit: Math.round((netProfitPerUnit * quantity) * 100) / 100,
      salePrice: Math.round((sellingPrice * quantity) * 100) / 100,
      marginPercent: Math.round(margin * 100) / 100
    };
    
    orders.push(order);
  }
  
  return orders;
}

/**
 * Generate Shopify orders
 * 
 * @param {number} count - Number of orders to generate (default: 20)
 * @returns {Array<Object>} Array of Shopify order objects
 */
function generateShopifyOrders(count = 20) {
  const orders = [];
  const productCount = PRODUCT_CATALOG.length;
  
  for (let i = 0; i < count; i++) {
    const productIndex = i % productCount;
    const productName = PRODUCT_CATALOG[productIndex];
    // Shopify prices are 30-40% higher than Amazon
    const sellingPrice = randomFloat(35, 70);
    const quantity = randomInt(1, 3); // Lower quantity typical for Shopify
    
    // Shopify-specific fees
    const shopifyFeePercent = 2.9; // Shopify commission
    const paymentProcessingPercent = 2.9; // Stripe/Payment processor
    const shopifyCommissionAmount = (sellingPrice * shopifyFeePercent) / 100;
    const paymentProcessingAmount = (sellingPrice * paymentProcessingPercent) / 100;
    const shippingCostToCustomer = randomFloat(3.00, 8.00); // Customer pays shipping
    
    // Total fees per unit
    const totalFeesPerUnit = shopifyCommissionAmount + paymentProcessingAmount;
    const totalCostPerUnit = totalFeesPerUnit;
    
    // Target margin: 20-35% for Shopify (lower margins due to higher prices)
    // Calculate COGS to achieve target margin
    const targetMarginPercent = randomFloat(20, 35);
    const targetNetProfit = (sellingPrice * targetMarginPercent) / 100;
    const cogs = sellingPrice - totalCostPerUnit - targetNetProfit;
    
    // Ensure COGS is realistic (55-70% of selling price for premium products)
    const minCogs = sellingPrice * 0.55;
    const maxCogs = sellingPrice * 0.70;
    const adjustedCogs = Math.max(minCogs, Math.min(maxCogs, cogs));
    
    const netProfitPerUnit = sellingPrice - totalCostPerUnit - adjustedCogs;
    const margin = (netProfitPerUnit / sellingPrice) * 100;
    
    const order = {
      id: `shp-${uuidv4()}`,
      channel: 'shopify',
      sku: generateSKU(),
      productName: productName,
      quantity: quantity,
      sellingPrice: Math.round(sellingPrice * 100) / 100,
      cogs: Math.round(adjustedCogs * 100) / 100,
      shopifyFeePercent: shopifyFeePercent,
      shopifyCommissionAmount: Math.round(shopifyCommissionAmount * 100) / 100,
      paymentProcessingPercent: paymentProcessingPercent,
      paymentProcessingAmount: Math.round(paymentProcessingAmount * 100) / 100,
      shippingCostToCustomer: Math.round(shippingCostToCustomer * 100) / 100,
      totalFeesPerUnit: Math.round(totalFeesPerUnit * 100) / 100,
      netProfitPerUnit: Math.round(netProfitPerUnit * 100) / 100,
      margin: Math.round(margin * 100) / 100,
      createdAt: randomDate(30),
      // Additional fields for normalization
      channelFees: Math.round((totalFeesPerUnit * quantity) * 100) / 100,
      shippingCost: 0, // Customer pays shipping, not seller
      netProfit: Math.round((netProfitPerUnit * quantity) * 100) / 100,
      salePrice: Math.round((sellingPrice * quantity) * 100) / 100,
      marginPercent: Math.round(margin * 100) / 100
    };
    
    orders.push(order);
  }
  
  return orders;
}

/**
 * Generate Noon orders
 * 
 * @param {number} count - Number of orders to generate (default: 20)
 * @returns {Array<Object>} Array of Noon order objects
 */
function generateNoonOrders(count = 20) {
  const orders = [];
  const productCount = PRODUCT_CATALOG.length;
  
  for (let i = 0; i < count; i++) {
    const productIndex = i % productCount;
    const productName = PRODUCT_CATALOG[productIndex];
    // Noon prices are competitive with Amazon (slightly lower)
    const sellingPrice = randomFloat(22, 45);
    const quantity = randomInt(1, 4);
    
    // Noon-specific fees
    const noonCommissionPercent = 12; // Noon commission
    const commissionAmount = (sellingPrice * noonCommissionPercent) / 100;
    const platformFeePerOrder = 0.50; // Fixed platform fee
    const shippingCostToNoon = randomFloat(1.00, 2.50); // Inbound shipping
    
    // Total fees per unit (commission is per unit, platform fee is per order)
    const totalFeesPerUnit = commissionAmount + (platformFeePerOrder / quantity);
    const totalCostPerUnit = totalFeesPerUnit + shippingCostToNoon;
    
    // Target margin: 30-40% for Noon
    // Calculate COGS to achieve target margin
    const targetMarginPercent = randomFloat(30, 40);
    const targetNetProfit = (sellingPrice * targetMarginPercent) / 100;
    const cogs = sellingPrice - totalCostPerUnit - targetNetProfit;
    
    // Ensure COGS is realistic (45-55% of selling price)
    const minCogs = sellingPrice * 0.45;
    const maxCogs = sellingPrice * 0.55;
    const adjustedCogs = Math.max(minCogs, Math.min(maxCogs, cogs));
    
    const netProfitPerUnit = sellingPrice - totalCostPerUnit - adjustedCogs;
    const margin = (netProfitPerUnit / sellingPrice) * 100;
    
    const order = {
      id: `noon-${uuidv4()}`,
      channel: 'noon',
      sku: generateSKU(),
      productName: productName,
      quantity: quantity,
      sellingPrice: Math.round(sellingPrice * 100) / 100,
      cogs: Math.round(adjustedCogs * 100) / 100,
      noonCommissionPercent: noonCommissionPercent,
      commissionAmount: Math.round(commissionAmount * 100) / 100,
      platformFeePerOrder: platformFeePerOrder,
      shippingCostToNoon: Math.round(shippingCostToNoon * 100) / 100,
      totalFeesPerUnit: Math.round(totalFeesPerUnit * 100) / 100,
      netProfitPerUnit: Math.round(netProfitPerUnit * 100) / 100,
      margin: Math.round(margin * 100) / 100,
      createdAt: randomDate(30),
      // Additional fields for normalization
      channelFees: Math.round(((commissionAmount * quantity) + platformFeePerOrder) * 100) / 100,
      shippingCost: Math.round((shippingCostToNoon * quantity) * 100) / 100,
      netProfit: Math.round((netProfitPerUnit * quantity) * 100) / 100,
      salePrice: Math.round((sellingPrice * quantity) * 100) / 100,
      marginPercent: Math.round(margin * 100) / 100
    };
    
    orders.push(order);
  }
  
  return orders;
}

module.exports = {
  generateAmazonOrders,
  generateShopifyOrders,
  generateNoonOrders,
  PRODUCT_CATALOG
};

