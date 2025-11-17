const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { generateAmazonOrders, generateShopifyOrders, generateNoonOrders } = require('../services/mockOrderGenerators');
const { calculateAmazonFees, calculateShopifyFees, calculateNoonFees } = require('../services/feeCalculators');

router.post('/api/mock-sync/orders', async (req, res) => {
  try {
    const { channels, quantity } = req.body;
    
    if (!channels || channels.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: "channels array required", 
        code: "INVALID_INPUT" 
      });
    }
    
    if (!quantity || quantity < 1 || quantity > 1000) {
      return res.status(400).json({ 
        success: false, 
        error: "quantity must be 1-1000", 
        code: "INVALID_QUANTITY" 
      });
    }
    
    let imported = 0;
    const breakdown = { amazon: 0, shopify: 0, noon: 0 };
    
    if (channels.includes('amazon')) {
      const amzOrders = generateAmazonOrders(quantity);
      for (const order of amzOrders) {
        await prisma.channelSale.create({
          data: {
            channel: 'amazon',
            sku: order.sku,
            productName: order.productName,
            quantity: order.quantity,
            sellingPrice: order.sellingPrice,
            margin: order.margin,
            createdAt: order.createdAt
          }
        });
      }
      breakdown.amazon = quantity;
      imported += quantity;
    }
    
    if (channels.includes('shopify')) {
      const shpOrders = generateShopifyOrders(quantity);
      for (const order of shpOrders) {
        await prisma.channelSale.create({
          data: {
            channel: 'shopify',
            sku: order.sku,
            productName: order.productName,
            quantity: order.quantity,
            sellingPrice: order.sellingPrice,
            margin: order.margin,
            createdAt: order.createdAt
          }
        });
      }
      breakdown.shopify = quantity;
      imported += quantity;
    }
    
    if (channels.includes('noon')) {
      const noonOrders = generateNoonOrders(quantity);
      for (const order of noonOrders) {
        await prisma.channelSale.create({
          data: {
            channel: 'noon',
            sku: order.sku,
            productName: order.productName,
            quantity: order.quantity,
            sellingPrice: order.sellingPrice,
            margin: order.margin,
            createdAt: order.createdAt
          }
        });
      }
      breakdown.noon = quantity;
      imported += quantity;
    }
    
    return res.status(200).json({
      success: true,
      imported: imported,
      breakdown: breakdown,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Data sync error:', error);
    return res.status(500).json({
      success: false,
      error: "Database error",
      code: "DB_ERROR",
      details: error.message
    });
  }
});

module.exports = router;
