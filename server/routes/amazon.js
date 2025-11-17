/**
 * Amazon Product Routes
 * Handles Amazon product data fetching via Rainforest API
 */

const express = require('express');
const router = express.Router();
const rainforestClient = require('../services/rainforest/client');

/**
 * GET /api/amazon/product/:asin
 * Fetch Amazon product data by ASIN
 * 
 * Query params:
 *   - domain: Amazon domain (de, com, co.uk, fr, it, es, etc.) [default: de]
 * 
 * Example: GET /api/amazon/product/B08N5WRWNW?domain=de
 */
router.get('/product/:asin', async (req, res) => {
  try {
    const { asin } = req.params;
    const { domain = 'de', marketplace } = req.query;
    
    // Support both 'domain' and 'marketplace' for backwards compatibility
    const targetDomain = domain || marketplace || 'de';

    // Validate ASIN
    if (!asin || asin.length !== 10) {
      console.log(`[API] Invalid ASIN received: ${asin}`);
      return res.status(400).json({
        success: false,
        error: 'Invalid ASIN. ASIN must be 10 characters.'
      });
    }

    console.log(`[API] Fetching product: ${asin} from domain: amazon.${targetDomain}`);

    // Fetch product data
    const productData = await rainforestClient.getProduct(asin, targetDomain);

    // Check if the response contains an error
    if (productData && productData.error) {
      console.log(`[API] Product fetch returned error:`, productData.message);
      console.log(`[API] Error data:`, productData.data);
      return res.status(400).json({
        success: false,
        error: productData.message,
        details: productData.data
      });
    }

    console.log(`[API] Successfully fetched product: ${productData.title}`);

    return res.json({
      success: true,
      data: productData
    });

  } catch (error) {
    console.error('[API] Error fetching product:', error.message);
    console.error('[API] Full error:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch product data'
    });
  }
});

/**
 * GET /api/amazon/pricing/:asin
 * Fetch competitor pricing for a product
 * 
 * Query params:
 *   - marketplace: Amazon marketplace [default: de]
 */
router.get('/pricing/:asin', async (req, res) => {
  try {
    const { asin } = req.params;
    const { marketplace = 'de' } = req.query;

    // Validate ASIN
    if (!asin || asin.length !== 10) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ASIN. ASIN must be 10 characters.'
      });
    }

    console.log(`[API] Fetching pricing: ${asin} from marketplace: ${marketplace}`);

    // Fetch pricing data
    const pricingData = await rainforestClient.getCompetitorPricing(asin, marketplace);

    return res.json({
      success: true,
      data: pricingData
    });

  } catch (error) {
    console.error('[API] Error fetching pricing:', error.message);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch pricing data'
    });
  }
});

module.exports = router;

