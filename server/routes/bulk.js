const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { calculateProductAnalysis } = require('../utils/kleinpaket');
const { db } = require('../database/init');
const { requirePlan } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and Excel files are allowed'), false);
    }
  }
});

/**
 * Upload and process bulk file
 */
router.post('/upload', requirePlan('premium'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const originalName = req.file.originalname;
    const fileExt = path.extname(originalName).toLowerCase();

    // Create bulk session
    const sessionId = uuidv4();
    db.run(
      'INSERT INTO bulk_sessions (id, user_id, file_meta, status) VALUES (?, ?, ?, ?)',
      [sessionId, req.user.id, JSON.stringify({ originalName, size: req.file.size }), 'processing'],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to create bulk session' });
        }

        // Process file asynchronously
        processBulkFile(sessionId, filePath, fileExt, req.user.id)
          .then(() => {
            res.json({
              message: 'File uploaded successfully',
              session_id: sessionId,
              status: 'processing'
            });
          })
          .catch(error => {
            console.error('Bulk processing error:', error);
            res.status(500).json({ error: 'Failed to process file' });
          });
      }
    );
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

/**
 * Get bulk session status
 */
router.get('/session/:id', requirePlan('premium'), (req, res) => {
  const sessionId = req.params.id;

  db.get(
    'SELECT * FROM bulk_sessions WHERE id = ? AND user_id = ?',
    [sessionId, req.user.id],
    (err, session) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      res.json({
        id: session.id,
        file_meta: JSON.parse(session.file_meta || '{}'),
        total_rows: session.total_rows,
        processed_rows: session.processed_rows,
        errors_summary: JSON.parse(session.errors_summary || '[]'),
        status: session.status,
        created_at: session.created_at
      });
    }
  );
});

/**
 * Get bulk session results
 */
router.get('/session/:id/results', requirePlan('premium'), (req, res) => {
  const sessionId = req.params.id;
  const { page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;

  // Get calculations for this session
  db.all(
    `SELECT c.*, 
            json_extract(c.input_json, '$.product_name') as product_name,
            json_extract(c.input_json, '$.category') as category,
            json_extract(c.input_json, '$.destination_country') as destination_country,
            json_extract(c.output_json, '$.shipping.chosen') as shipping_type,
            json_extract(c.output_json, '$.totals.net_profit') as net_profit,
            json_extract(c.output_json, '$.totals.roi_percent') as roi_percent
     FROM calculations c 
     WHERE c.user_id = ? AND c.created_at >= (
       SELECT created_at FROM bulk_sessions WHERE id = ?
     )
     ORDER BY c.created_at DESC
     LIMIT ? OFFSET ?`,
    [req.user.id, sessionId, limit, offset],
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
          limit: parseInt(limit)
        }
      });
    }
  );
});

/**
 * Download bulk results as CSV
 */
router.get('/session/:id/download/csv', requirePlan('premium'), (req, res) => {
  const sessionId = req.params.id;

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
      json_extract(output_json, '$.analysis.category') as analysis_category,
      json_extract(output_json, '$.analysis.grade') as analysis_grade,
      created_at
    FROM calculations 
    WHERE user_id = ? AND created_at >= (
      SELECT created_at FROM bulk_sessions WHERE id = ?
    )
    ORDER BY created_at DESC`,
    [req.user.id, sessionId],
    (err, calculations) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      // Generate CSV
      const csvHeader = 'Product Name,Category,Buying Price,Selling Price,Country,Length (cm),Width (cm),Height (cm),Weight (kg),Eligible,Shipping Cost,Net Profit,ROI (%),Analysis Category,Analysis Grade,Created At\n';
      const csvRows = calculations.map(calc => 
        `"${calc.product_name}","${calc.category}",${calc.buying_price},${calc.selling_price},"${calc.destination_country}",${calc.length_cm},${calc.width_cm},${calc.height_cm},${calc.weight_kg},${calc.eligibility_boolean ? 'Yes' : 'No'},${calc.shipping_cost},${calc.net_profit},${calc.roi_percent},"${calc.analysis_category}","${calc.analysis_grade}","${calc.created_at}"`
      ).join('\n');

      const csv = csvHeader + csvRows;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="bulk_results_${sessionId}.csv"`);
      res.send(csv);
    }
  );
});

/**
 * Process bulk file (internal function)
 */
async function processBulkFile(sessionId, filePath, fileExt, userId) {
  try {
    let data = [];

    if (fileExt === '.csv') {
      data = await parseCSV(filePath);
    } else if (fileExt === '.xlsx' || fileExt === '.xls') {
      data = await parseExcel(filePath);
    }

    const totalRows = data.length;
    let processedRows = 0;
    const errors = [];

    // Update total rows
    db.run(
      'UPDATE bulk_sessions SET total_rows = ? WHERE id = ?',
      [totalRows, sessionId]
    );

    // Process each row
    for (let i = 0; i < data.length; i++) {
      try {
        const row = data[i];
        
        // Map CSV/Excel columns to product object
        const product = mapRowToProduct(row);
        
        if (product) {
          // Calculate analysis
          const result = calculateProductAnalysis(product);
          
          // Save to database
          const inputJson = JSON.stringify(product);
          const outputJson = JSON.stringify(result);
          
          await new Promise((resolve, reject) => {
            db.run(
              'INSERT INTO calculations (user_id, input_json, output_json, eligibility_boolean) VALUES (?, ?, ?, ?)',
              [userId, inputJson, outputJson, result.eligibility],
              function(err) {
                if (err) reject(err);
                else resolve();
              }
            );
          });
        }

        processedRows++;
        
        // Update progress every 10 rows
        if (processedRows % 10 === 0) {
          db.run(
            'UPDATE bulk_sessions SET processed_rows = ? WHERE id = ?',
            [processedRows, sessionId]
          );
        }
      } catch (error) {
        errors.push({
          row: i + 1,
          error: error.message,
          data: data[i]
        });
      }
    }

    // Update final status
    db.run(
      'UPDATE bulk_sessions SET processed_rows = ?, errors_summary = ?, status = ? WHERE id = ?',
      [processedRows, JSON.stringify(errors), 'completed', sessionId]
    );

    // Clean up file
    fs.unlink(filePath, (err) => {
      if (err) console.error('Failed to delete temp file:', err);
    });

  } catch (error) {
    console.error('Bulk processing error:', error);
    
    // Update status to failed
    db.run(
      'UPDATE bulk_sessions SET status = ?, errors_summary = ? WHERE id = ?',
      ['failed', JSON.stringify([{ error: error.message }]), sessionId]
    );
  }
}

/**
 * Parse CSV file
 */
function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

/**
 * Parse Excel file
 */
function parseExcel(filePath) {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(worksheet);
}

/**
 * Map CSV/Excel row to product object
 */
function mapRowToProduct(row) {
  // Common column mappings
  const mappings = {
    product_name: ['product_name', 'product name', 'name', 'product'],
    category: ['category', 'cat', 'type'],
    buying_price: ['buying_price', 'buying price', 'cost', 'purchase price'],
    selling_price: ['selling_price', 'selling price', 'price', 'sale price'],
    destination_country: ['destination_country', 'destination country', 'country', 'dest'],
    length_cm: ['length_cm', 'length', 'l', 'length (cm)'],
    width_cm: ['width_cm', 'width', 'w', 'width (cm)'],
    height_cm: ['height_cm', 'height', 'h', 'height (cm)'],
    weight_kg: ['weight_kg', 'weight', 'weight (kg)']
  };

  const product = {};
  let hasRequiredFields = false;

  Object.keys(mappings).forEach(key => {
    const possibleKeys = mappings[key];
    for (const possibleKey of possibleKeys) {
      if (row[possibleKey] !== undefined) {
        const value = row[possibleKey];
        if (value !== null && value !== '') {
          if (key.includes('price') || key.includes('cm') || key.includes('kg')) {
            product[key] = parseFloat(value);
          } else {
            product[key] = String(value).trim();
          }
          hasRequiredFields = true;
          break;
        }
      }
    }
  });

  // Check if we have minimum required fields
  const requiredFields = ['product_name', 'buying_price', 'selling_price', 'destination_country', 'length_cm', 'width_cm', 'height_cm', 'weight_kg'];
  const hasAllRequired = requiredFields.every(field => product[field] !== undefined);

  return hasAllRequired ? product : null;
}

module.exports = router;

