const express = require('express');
const { query, validationResult } = require('express-validator');
const { db } = require('../database/init');
const { requirePlan } = require('../middleware/auth');

const router = express.Router();

/**
 * Get calculation history with pagination and filters
 */
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().trim(),
  query('category').optional().trim(),
  query('country').optional().trim(),
  query('eligibility').optional().isIn(['true', 'false']).withMessage('Eligibility must be true or false'),
  query('shipping_type').optional().trim(),
  query('date_from').optional().isISO8601().withMessage('Date from must be a valid date'),
  query('date_to').optional().isISO8601().withMessage('Date to must be a valid date')
], requirePlan('premium'), (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      page = 1,
      limit = 20,
      search,
      category,
      country,
      eligibility,
      shipping_type,
      date_from,
      date_to
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = ['c.user_id = ?'];
    let params = [req.user.id];

    // Build WHERE conditions based on filters
    if (search) {
      whereConditions.push('(c.input_json LIKE ? OR c.output_json LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    if (category) {
      whereConditions.push('c.input_json LIKE ?');
      params.push(`%"category":"${category}"%`);
    }

    if (country) {
      whereConditions.push('c.input_json LIKE ?');
      params.push(`%"destination_country":"${country}"%`);
    }

    if (eligibility !== undefined) {
      whereConditions.push('c.eligibility_boolean = ?');
      params.push(eligibility === 'true');
    }

    if (shipping_type) {
      whereConditions.push('c.output_json LIKE ?');
      params.push(`%"chosen":"${shipping_type}"%`);
    }

    if (date_from) {
      whereConditions.push('c.created_at >= ?');
      params.push(date_from);
    }

    if (date_to) {
      whereConditions.push('c.created_at <= ?');
      params.push(date_to);
    }

    const whereClause = whereConditions.join(' AND ');

    // Get total count
    db.get(
      `SELECT COUNT(*) as total FROM calculations c WHERE ${whereClause}`,
      params,
      (err, countResult) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        const total = countResult.total;
        const totalPages = Math.ceil(total / limit);

        // Get calculations
        db.all(
          `SELECT c.*, 
                  json_extract(c.input_json, '$.product_name') as product_name,
                  json_extract(c.input_json, '$.category') as category,
                  json_extract(c.input_json, '$.destination_country') as destination_country,
                  json_extract(c.output_json, '$.shipping.chosen') as shipping_type,
                  json_extract(c.output_json, '$.totals.net_profit') as net_profit,
                  json_extract(c.output_json, '$.totals.roi_percent') as roi_percent
           FROM calculations c 
           WHERE ${whereClause}
           ORDER BY c.created_at DESC
           LIMIT ? OFFSET ?`,
          [...params, limit, offset],
          (err, calculations) => {
            if (err) {
              return res.status(500).json({ error: 'Database error' });
            }

            const formattedCalculations = calculations.map(calc => ({
              id: calc.id,
              product_name: calc.product_name,
              category: calc.category,
              destination_country: calc.destination_country,
              shipping_type: calc.shipping_type,
              net_profit: parseFloat(calc.net_profit || 0),
              roi_percent: parseFloat(calc.roi_percent || 0),
              eligibility: calc.eligibility_boolean,
              created_at: calc.created_at
            }));

            res.json({
              calculations: formattedCalculations,
              pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                total_pages: totalPages,
                has_next: page < totalPages,
                has_prev: page > 1
              }
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

/**
 * Get calculation statistics
 */
router.get('/stats', requirePlan('premium'), (req, res) => {
  try {
    db.all(
      `SELECT 
        COUNT(*) as total_calculations,
        COUNT(CASE WHEN eligibility_boolean = 1 THEN 1 END) as eligible_count,
        COUNT(CASE WHEN eligibility_boolean = 0 THEN 1 END) as ineligible_count,
        AVG(json_extract(output_json, '$.totals.net_profit')) as avg_profit,
        AVG(json_extract(output_json, '$.totals.roi_percent')) as avg_roi,
        MAX(created_at) as last_calculation
      FROM calculations 
      WHERE user_id = ?`,
      [req.user.id],
      (err, stats) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        const result = stats[0];
        res.json({
          total_calculations: result.total_calculations,
          eligible_count: result.eligible_count,
          ineligible_count: result.ineligible_count,
          eligibility_rate: result.total_calculations > 0 
            ? (result.eligible_count / result.total_calculations * 100).toFixed(1)
            : 0,
          avg_profit: parseFloat(result.avg_profit || 0).toFixed(2),
          avg_roi: parseFloat(result.avg_roi || 0).toFixed(2),
          last_calculation: result.last_calculation
        });
      }
    );
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

/**
 * Delete a calculation
 */
router.delete('/:id', requirePlan('premium'), (req, res) => {
  const calculationId = req.params.id;

  db.run(
    'DELETE FROM calculations WHERE id = ? AND user_id = ?',
    [calculationId, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Calculation not found' });
      }

      res.json({ message: 'Calculation deleted successfully' });
    }
  );
});

/**
 * Clear all calculations
 */
router.delete('/', requirePlan('premium'), (req, res) => {
  db.run(
    'DELETE FROM calculations WHERE user_id = ?',
    [req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({ 
        message: 'All calculations cleared successfully',
        deleted_count: this.changes
      });
    }
  );
});

/**
 * Export calculations as CSV
 */
router.get('/export/csv', requirePlan('premium'), (req, res) => {
  try {
    db.all(
      `SELECT 
        json_extract(input_json, '$.product_name') as product_name,
        json_extract(input_json, '$.category') as category,
        json_extract(input_json, '$.buying_price') as buying_price,
        json_extract(input_json, '$.selling_price') as selling_price,
        json_extract(input_json, '$.destination_country') as destination_country,
        json_extract(input_json, '$.length_cm') as length_cm,
        json_extract(input_json, '$.width_cm') as width_cm,
        json_extract(input_json, '$.height_cm') as height_cm,
        json_extract(input_json, '$.weight_kg') as weight_kg,
        eligibility_boolean,
        json_extract(output_json, '$.shipping.cost') as shipping_cost,
        json_extract(output_json, '$.totals.net_profit') as net_profit,
        json_extract(output_json, '$.totals.roi_percent') as roi_percent,
        created_at
      FROM calculations 
      WHERE user_id = ?
      ORDER BY created_at DESC`,
      [req.user.id],
      (err, calculations) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        // Generate CSV
        const csvHeader = 'Product Name,Category,Buying Price,Selling Price,Country,Length (cm),Width (cm),Height (cm),Weight (kg),Eligible,Shipping Cost,Net Profit,ROI (%),Created At\n';
        const csvRows = calculations.map(calc => 
          `"${calc.product_name}","${calc.category}",${calc.buying_price},${calc.selling_price},"${calc.destination_country}",${calc.length_cm},${calc.width_cm},${calc.height_cm},${calc.weight_kg},${calc.eligibility_boolean ? 'Yes' : 'No'},${calc.shipping_cost},${calc.net_profit},${calc.roi_percent},"${calc.created_at}"`
        ).join('\n');

        const csv = csvHeader + csvRows;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="calculations.csv"');
        res.send(csv);
      }
    );
  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

module.exports = router;

