const express = require('express');
const { body, validationResult } = require('express-validator');
const { calculateProductAnalysis } = require('../utils/kleinpaket');
const { db } = require('../database/init');
const { authenticateApiKey, checkApiRateLimit, logApiUsage, requirePlan } = require('../middleware/auth');
const crypto = require('crypto');

const router = express.Router();

/**
 * Generate API key
 */
router.post('/keys', requirePlan('pro'), (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'API key name is required' });
    }

    // Generate API key
    const apiKey = crypto.randomBytes(32).toString('hex');
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

    // Save to database
    db.run(
      'INSERT INTO api_keys (user_id, key_hash, name) VALUES (?, ?, ?)',
      [req.user.id, keyHash, name.trim()],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to create API key' });
        }

        res.status(201).json({
          message: 'API key created successfully',
          api_key: apiKey, // Only return the key once
          key_id: this.lastID,
          name: name.trim(),
          created_at: new Date().toISOString()
        });
      }
    );
  } catch (error) {
    console.error('API key creation error:', error);
    res.status(500).json({ error: 'Failed to create API key' });
  }
});

/**
 * List API keys
 */
router.get('/keys', requirePlan('pro'), (req, res) => {
  try {
    db.all(
      'SELECT id, name, created_at, revoked_at, usage_count FROM api_keys WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id],
      (err, keys) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        const formattedKeys = keys.map(key => ({
          id: key.id,
          name: key.name,
          created_at: key.created_at,
          revoked_at: key.revoked_at,
          usage_count: key.usage_count,
          status: key.revoked_at ? 'revoked' : 'active'
        }));

        res.json({ api_keys: formattedKeys });
      }
    );
  } catch (error) {
    console.error('API keys fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch API keys' });
  }
});

/**
 * Revoke API key
 */
router.delete('/keys/:id', requirePlan('pro'), (req, res) => {
  try {
    const keyId = req.params.id;

    db.run(
      'UPDATE api_keys SET revoked_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
      [keyId, req.user.id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: 'API key not found' });
        }

        res.json({ message: 'API key revoked successfully' });
      }
    );
  } catch (error) {
    console.error('API key revocation error:', error);
    res.status(500).json({ error: 'Failed to revoke API key' });
  }
});

/**
 * API endpoint: Check eligibility
 */
router.post('/check', [
  body('product_name').trim().isLength({ min: 1 }).withMessage('Product name is required'),
  body('buying_price').isFloat({ min: 0 }).withMessage('Buying price must be a positive number'),
  body('selling_price').isFloat({ min: 0 }).withMessage('Selling price must be a positive number'),
  body('destination_country').trim().isLength({ min: 1 }).withMessage('Destination country is required'),
  body('length_cm').isFloat({ min: 0 }).withMessage('Length must be a positive number'),
  body('width_cm').isFloat({ min: 0 }).withMessage('Width must be a positive number'),
  body('height_cm').isFloat({ min: 0 }).withMessage('Height must be a positive number'),
  body('weight_kg').isFloat({ min: 0 }).withMessage('Weight must be a positive number')
], authenticateApiKey, checkApiRateLimit, logApiUsage, (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      product_name,
      buying_price,
      selling_price,
      destination_country,
      length_cm,
      width_cm,
      height_cm,
      weight_kg
    } = req.body;

    const product = {
      product_name,
      category: 'General',
      buying_price: parseFloat(buying_price),
      selling_price: parseFloat(selling_price),
      destination_country,
      length_cm: parseFloat(length_cm),
      width_cm: parseFloat(width_cm),
      height_cm: parseFloat(height_cm),
      weight_kg: parseFloat(weight_kg)
    };

    // Calculate basic analysis
    const result = calculateProductAnalysis(product);

    // Return simplified response for API
    const apiResponse = {
      eligibility: result.eligibility,
      eligibility_message: result.eligibility_message,
      failed_conditions: result.failed_conditions,
      shipping: {
        chosen: result.shipping.chosen,
        cost: result.shipping.cost,
        savings: result.eligibility ? 3.5 : 0
      },
      basic_totals: {
        buying_price: product.buying_price,
        selling_price: product.selling_price,
        estimated_profit: result.totals.net_profit
      }
    };

    res.json(apiResponse);
  } catch (error) {
    console.error('API check error:', error);
    res.status(500).json({ error: 'Failed to check eligibility' });
  }
});

/**
 * API endpoint: Full analysis
 */
router.post('/analyze', [
  body('product_name').trim().isLength({ min: 1 }).withMessage('Product name is required'),
  body('category').trim().isLength({ min: 1 }).withMessage('Category is required'),
  body('buying_price').isFloat({ min: 0 }).withMessage('Buying price must be a positive number'),
  body('selling_price').isFloat({ min: 0 }).withMessage('Selling price must be a positive number'),
  body('destination_country').trim().isLength({ min: 1 }).withMessage('Destination country is required'),
  body('length_cm').isFloat({ min: 0 }).withMessage('Length must be a positive number'),
  body('width_cm').isFloat({ min: 0 }).withMessage('Width must be a positive number'),
  body('height_cm').isFloat({ min: 0 }).withMessage('Height must be a positive number'),
  body('weight_kg').isFloat({ min: 0 }).withMessage('Weight must be a positive number'),
  body('return_buffer').optional().isFloat({ min: 0 }).withMessage('Return buffer must be a positive number'),
  body('amazon_fee_percent').optional().isFloat({ min: 0, max: 100 }).withMessage('Amazon fee must be between 0 and 100')
], authenticateApiKey, checkApiRateLimit, logApiUsage, (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      product_name,
      category,
      buying_price,
      selling_price,
      destination_country,
      length_cm,
      width_cm,
      height_cm,
      weight_kg,
      return_buffer,
      amazon_fee_percent
    } = req.body;

    const product = {
      product_name,
      category,
      buying_price: parseFloat(buying_price),
      selling_price: parseFloat(selling_price),
      destination_country,
      length_cm: parseFloat(length_cm),
      width_cm: parseFloat(width_cm),
      height_cm: parseFloat(height_cm),
      weight_kg: parseFloat(weight_kg)
    };

    const options = {};
    if (return_buffer !== undefined) options.return_buffer = parseFloat(return_buffer);
    if (amazon_fee_percent !== undefined) options.amazon_fee_percent = parseFloat(amazon_fee_percent);

    // Calculate full analysis
    const result = calculateProductAnalysis(product, options);

    // Save calculation to database
    const inputJson = JSON.stringify(product);
    const outputJson = JSON.stringify(result);

    db.run(
      'INSERT INTO calculations (user_id, input_json, output_json, eligibility_boolean) VALUES (?, ?, ?, ?)',
      [req.user.id, inputJson, outputJson, result.eligibility],
      function(err) {
        if (err) {
          console.error('Failed to save API calculation:', err);
          // Don't fail the request if saving fails
        }
        
        res.json({
          ...result,
          calculation_id: this.lastID
        });
      }
    );
  } catch (error) {
    console.error('API analyze error:', error);
    res.status(500).json({ error: 'Failed to analyze product' });
  }
});

/**
 * API endpoint: Get history
 */
router.get('/history', authenticateApiKey, checkApiRateLimit, logApiUsage, (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    db.all(
      `SELECT 
        id,
        json_extract(input_json, '$.product_name') as product_name,
        json_extract(input_json, '$.category') as category,
        json_extract(input_json, '$.destination_country') as destination_country,
        eligibility_boolean,
        json_extract(output_json, '$.totals.net_profit') as net_profit,
        json_extract(output_json, '$.totals.roi_percent') as roi_percent,
        created_at
      FROM calculations 
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?`,
      [req.user.id, limit, offset],
      (err, calculations) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        const formattedCalculations = calculations.map(calc => ({
          id: calc.id,
          product_name: calc.product_name,
          category: calc.category,
          destination_country: calc.destination_country,
          eligibility: calc.eligibility_boolean,
          net_profit: parseFloat(calc.net_profit || 0),
          roi_percent: parseFloat(calc.roi_percent || 0),
          created_at: calc.created_at
        }));

        res.json({
          calculations: formattedCalculations,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit)
          }
        });
      }
    );
  } catch (error) {
    console.error('API history error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

/**
 * API endpoint: Get usage statistics
 */
router.get('/usage', authenticateApiKey, (req, res) => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    db.all(
      `SELECT 
        COUNT(*) as total_requests,
        COUNT(CASE WHEN created_at > ? THEN 1 END) as requests_24h,
        COUNT(CASE WHEN created_at > ? THEN 1 END) as requests_7d,
        AVG(response_time_ms) as avg_response_time
      FROM usage_logs 
      WHERE api_key_id = ?`,
      [oneDayAgo, oneWeekAgo, req.apiKeyId],
      (err, stats) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        const result = stats[0];
        res.json({
          total_requests: result.total_requests,
          requests_24h: result.requests_24h,
          requests_7d: result.requests_7d,
          avg_response_time_ms: parseFloat(result.avg_response_time || 0).toFixed(2)
        });
      }
    );
  } catch (error) {
    console.error('API usage error:', error);
    res.status(500).json({ error: 'Failed to fetch usage statistics' });
  }
});

module.exports = router;

