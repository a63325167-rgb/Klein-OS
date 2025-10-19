const express = require('express');
const { body, validationResult } = require('express-validator');
const { calculateProductAnalysis } = require('../utils/kleinpaket');
const { db } = require('../database/init');
const { checkCalculationLimit } = require('../middleware/auth');

const router = express.Router();

/**
 * Calculate product analysis
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
], checkCalculationLimit, (req, res) => {
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

    // Calculate analysis
    const result = calculateProductAnalysis(product, options);

    // Save calculation to database
    const inputJson = JSON.stringify(product);
    const outputJson = JSON.stringify(result);

    db.run(
      'INSERT INTO calculations (user_id, input_json, output_json, eligibility_boolean) VALUES (?, ?, ?, ?)',
      [req.user.id, inputJson, outputJson, result.eligibility],
      function(err) {
        if (err) {
          console.error('Failed to save calculation:', err);
          // Don't fail the request if saving fails
        }
        
        res.json({
          ...result,
          calculation_id: this.lastID
        });
      }
    );
  } catch (error) {
    console.error('Calculation error:', error);
    res.status(500).json({ error: 'Failed to calculate product analysis' });
  }
});

/**
 * Quick eligibility check (simplified version for free users)
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
], checkCalculationLimit, (req, res) => {
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

    // Return simplified response for free users
    const simplifiedResult = {
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

    res.json(simplifiedResult);
  } catch (error) {
    console.error('Quick check error:', error);
    res.status(500).json({ error: 'Failed to check eligibility' });
  }
});

/**
 * Get calculation by ID
 */
router.get('/:id', (req, res) => {
  const calculationId = req.params.id;

  db.get(
    'SELECT * FROM calculations WHERE id = ? AND user_id = ?',
    [calculationId, req.user.id],
    (err, calculation) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!calculation) {
        return res.status(404).json({ error: 'Calculation not found' });
      }

      res.json({
        id: calculation.id,
        input: JSON.parse(calculation.input_json),
        output: JSON.parse(calculation.output_json),
        eligibility: calculation.eligibility_boolean,
        created_at: calculation.created_at
      });
    }
  );
});

/**
 * Duplicate a calculation
 */
router.post('/:id/duplicate', (req, res) => {
  const calculationId = req.params.id;

  db.get(
    'SELECT * FROM calculations WHERE id = ? AND user_id = ?',
    [calculationId, req.user.id],
    (err, calculation) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!calculation) {
        return res.status(404).json({ error: 'Calculation not found' });
      }

      // Create a new calculation with the same input
      db.run(
        'INSERT INTO calculations (user_id, input_json, output_json, eligibility_boolean) VALUES (?, ?, ?, ?)',
        [req.user.id, calculation.input_json, calculation.output_json, calculation.eligibility_boolean],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to duplicate calculation' });
          }

          res.json({
            message: 'Calculation duplicated successfully',
            new_calculation_id: this.lastID
          });
        }
      );
    }
  );
});

module.exports = router;

