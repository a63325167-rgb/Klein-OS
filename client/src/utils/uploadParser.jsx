/**
 * Upload Parser and Validator (B7)
 * 
 * Parses CSV and Excel files, validates row-by-row, detects errors.
 * Supports 50-500 row uploads without crashing.
 */

import { validateFieldValue, UPLOAD_FIELDS } from './uploadTemplate';

/**
 * Parse CSV line (handles quoted fields with commas)
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

/**
 * Parse CSV file
 */
async function parseCSV(file) {
  const text = await file.text();
  const lines = text.split('\n').filter(line => {
    const trimmed = line.trim();
    // Skip empty lines and comment lines
    return trimmed && !trimmed.startsWith('#');
  });
  
  if (lines.length < 2) {
    throw new Error('File must contain at least a header row and one data row');
  }
  
  // Parse header
  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
  
  // Parse data rows
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row = {};
    
    headers.forEach((header, idx) => {
      row[header] = values[idx] || '';
    });
    
    data.push(row);
  }
  
  return data;
}

/**
 * Parse Excel file (requires xlsx library)
 */
async function parseExcel(file) {
  if (typeof window === 'undefined' || !window.XLSX) {
    throw new Error('Excel parsing requires XLSX library to be loaded');
  }
  
  const XLSX = window.XLSX;
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
  
  // Use first sheet
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Convert to JSON
  const data = XLSX.utils.sheet_to_json(worksheet, { 
    raw: false, // Keep as strings for validation
    defval: '' // Default empty cells to empty string
  });
  
  // Normalize keys to lowercase
  return data.map(row => {
    const normalized = {};
    Object.keys(row).forEach(key => {
      normalized[key.toLowerCase().trim()] = row[key];
    });
    return normalized;
  });
}

/**
 * Normalize field name (handle variations)
 */
function normalizeFieldName(rawName) {
  const normalized = rawName.toLowerCase().trim();
  
  // Map common variations
  const mappings = {
    'asin': 'product_asin',
    'name': 'product_name',
    'title': 'product_name',
    'price': 'selling_price_eur',
    'selling_price': 'selling_price_eur',
    'cogs': 'cogs_per_unit_eur',
    'cost': 'cogs_per_unit_eur',
    'velocity': 'monthly_sales_velocity',
    'sales': 'monthly_sales_velocity',
    'monthly_sales': 'monthly_sales_velocity',
    'return_rate': 'return_rate_percent',
    'returns': 'return_rate_percent',
    'referral_fee': 'referral_fee_percent',
    'referral': 'referral_fee_percent',
    'fba_fee': 'fba_fee_percent',
    'fba': 'fba_fee_percent',
    'vat': 'vat_percent',
    'shipping': 'shipping_cost_per_unit_eur',
    'shipping_cost': 'shipping_cost_per_unit_eur',
    'order_quantity': 'initial_order_quantity',
    'quantity': 'initial_order_quantity',
    'cash': 'initial_cash_eur',
    'initial_cash': 'initial_cash_eur',
    'competitors': 'competitor_count',
    'competition': 'competitor_count',
    'rating': 'average_rating_stars',
    'stars': 'average_rating_stars'
  };
  
  return mappings[normalized] || normalized;
}

/**
 * Extract field value from row data
 */
function extractFieldValue(rowData, fieldKey) {
  // Try exact match first
  if (rowData[fieldKey] !== undefined) {
    return rowData[fieldKey];
  }
  
  // Try normalized variations
  const normalized = normalizeFieldName(fieldKey);
  if (rowData[normalized] !== undefined) {
    return rowData[normalized];
  }
  
  // Try all keys to find match
  for (const key of Object.keys(rowData)) {
    if (normalizeFieldName(key) === fieldKey) {
      return rowData[key];
    }
  }
  
  return undefined;
}

/**
 * Parse and validate upload file
 * 
 * @param {File} file - CSV or Excel file
 * @param {Array} existingASINs - ASINs already in system (for duplicate detection)
 * @returns {Promise<ParseResult>}
 */
export async function parseUploadFile(file, existingASINs = []) {
  const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
  
  // Parse file
  let rawData;
  try {
    if (isExcel) {
      rawData = await parseExcel(file);
    } else {
      rawData = await parseCSV(file);
    }
  } catch (error) {
    throw new Error(`Failed to parse file: ${error.message}`);
  }
  
  if (rawData.length === 0) {
    throw new Error('File contains no data rows');
  }
  
  if (rawData.length > 500) {
    throw new Error(`File contains ${rawData.length} rows. Maximum is 500 rows per upload.`);
  }
  
  const rows = [];
  const errors = [];
  const warnings = [];
  const duplicates = [];
  
  // Process each row
  for (let i = 0; i < rawData.length; i++) {
    const rowData = rawData[i];
    const rowIndex = i + 2; // 1-indexed, +1 for header
    const rowErrors = [];
    
    // Extract and validate ASIN (required)
    const asin = String(extractFieldValue(rowData, 'product_asin') || '').trim();
    const asinValidation = validateFieldValue('product_asin', asin);
    if (!asinValidation.valid) {
      rowErrors.push({
        rowIndex,
        field: 'product_asin',
        value: asin,
        error: asinValidation.error,
        fixable: false
      });
    }
    
    // Check for duplicate ASIN
    if (asin && existingASINs.includes(asin)) {
      duplicates.push({
        rowIndex,
        asin,
        message: `ASIN ${asin} already exists in system`
      });
    }
    
    // Extract and validate name (required)
    const name = String(extractFieldValue(rowData, 'product_name') || '').trim();
    const nameValidation = validateFieldValue('product_name', name);
    if (!nameValidation.valid) {
      rowErrors.push({
        rowIndex,
        field: 'product_name',
        value: name,
        error: nameValidation.error,
        fixable: false
      });
    }
    
    // Extract and validate price (required)
    const priceStr = String(extractFieldValue(rowData, 'selling_price_eur') || '').trim();
    const price = parseFloat(priceStr);
    const priceValidation = validateFieldValue('selling_price_eur', price);
    if (!priceValidation.valid) {
      rowErrors.push({
        rowIndex,
        field: 'selling_price_eur',
        value: priceStr,
        error: priceValidation.error,
        fixable: false
      });
    }
    
    // Extract and validate COGS (required)
    const cogsStr = String(extractFieldValue(rowData, 'cogs_per_unit_eur') || '').trim();
    const cogs = parseFloat(cogsStr);
    const cogsValidation = validateFieldValue('cogs_per_unit_eur', cogs);
    if (!cogsValidation.valid) {
      rowErrors.push({
        rowIndex,
        field: 'cogs_per_unit_eur',
        value: cogsStr,
        error: cogsValidation.error,
        fixable: false
      });
    }
    
    // Extract and validate velocity (required)
    const velocityStr = String(extractFieldValue(rowData, 'monthly_sales_velocity') || '').trim();
    const velocity = parseFloat(velocityStr);
    const velocityValidation = validateFieldValue('monthly_sales_velocity', velocity);
    if (!velocityValidation.valid) {
      rowErrors.push({
        rowIndex,
        field: 'monthly_sales_velocity',
        value: velocityStr,
        error: velocityValidation.error,
        fixable: false
      });
    }
    
    // If any required field failed, skip this row
    if (rowErrors.length > 0) {
      errors.push(...rowErrors);
      continue;
    }
    
    // Warn about zero velocity
    if (velocity === 0) {
      warnings.push(`Row ${rowIndex}: Zero monthly sales velocity (break-even will be ∞)`);
    }
    
    // Warn about negative margin
    if (price <= cogs) {
      warnings.push(`Row ${rowIndex}: Selling price (€${price}) <= COGS (€${cogs}) - negative margin!`);
    }
    
    // Parse optional fields with defaults
    const returnRate = parseFloat(extractFieldValue(rowData, 'return_rate_percent') || '5');
    const referralFee = parseFloat(extractFieldValue(rowData, 'referral_fee_percent') || '15');
    const fbaFee = parseFloat(extractFieldValue(rowData, 'fba_fee_percent') || '8');
    const vat = parseFloat(extractFieldValue(rowData, 'vat_percent') || '19');
    const shippingCost = parseFloat(extractFieldValue(rowData, 'shipping_cost_per_unit_eur') || '2');
    const initialOrder = parseFloat(extractFieldValue(rowData, 'initial_order_quantity') || String(velocity * 2));
    const initialCash = parseFloat(extractFieldValue(rowData, 'initial_cash_eur') || '5000');
    const competitorCount = parseFloat(extractFieldValue(rowData, 'competitor_count') || '0');
    const rating = parseFloat(extractFieldValue(rowData, 'average_rating_stars') || '3.5');
    const category = String(extractFieldValue(rowData, 'category') || 'Uncategorized').trim();
    
    // Validate optional fields
    const optionalValidations = [
      { key: 'return_rate_percent', value: returnRate },
      { key: 'referral_fee_percent', value: referralFee },
      { key: 'fba_fee_percent', value: fbaFee },
      { key: 'vat_percent', value: vat },
      { key: 'shipping_cost_per_unit_eur', value: shippingCost },
      { key: 'competitor_count', value: competitorCount },
      { key: 'average_rating_stars', value: rating }
    ];
    
    let hasOptionalErrors = false;
    optionalValidations.forEach(({ key, value }) => {
      const validation = validateFieldValue(key, value);
      if (!validation.valid) {
        rowErrors.push({
          rowIndex,
          field: key,
          value: String(value),
          error: validation.error,
          fixable: true // Optional fields can use defaults
        });
        hasOptionalErrors = true;
      }
    });
    
    // If optional field errors, add to errors but continue with defaults
    if (hasOptionalErrors) {
      errors.push(...rowErrors);
    }
    
    // Add to valid rows
    rows.push({
      rowIndex,
      asin,
      name,
      price,
      cogs,
      velocity,
      returnRate: isNaN(returnRate) ? 5 : returnRate,
      referralFee: isNaN(referralFee) ? 15 : referralFee,
      fbaFee: isNaN(fbaFee) ? 8 : fbaFee,
      vat: isNaN(vat) ? 19 : vat,
      shippingCost: isNaN(shippingCost) ? 2 : shippingCost,
      initialOrder: isNaN(initialOrder) ? velocity * 2 : initialOrder,
      initialCash: isNaN(initialCash) ? 5000 : initialCash,
      competitorCount: isNaN(competitorCount) ? 0 : competitorCount,
      rating: isNaN(rating) ? 3.5 : rating,
      category
    });
  }
  
  return {
    rows,
    errors,
    warnings,
    duplicates,
    totalRows: rawData.length,
    validRows: rows.length,
    errorRows: errors.filter(e => !e.fixable).length,
    fixableRows: errors.filter(e => e.fixable).length
  };
}

/**
 * Format parse result summary
 */
export function formatParseResultSummary(result) {
  const { totalRows, validRows, errorRows, warnings, duplicates } = result;
  
  let summary = `Processed ${totalRows} rows:\n`;
  summary += `✅ ${validRows} valid\n`;
  
  if (errorRows > 0) {
    summary += `❌ ${errorRows} errors (skipped)\n`;
  }
  
  if (warnings.length > 0) {
    summary += `⚠️ ${warnings.length} warnings\n`;
  }
  
  if (duplicates.length > 0) {
    summary += `🔄 ${duplicates.length} duplicates detected\n`;
  }
  
  return summary;
}
