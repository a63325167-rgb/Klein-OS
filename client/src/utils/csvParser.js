/**
 * CSV Parser for Bulk Product Upload
 * 
 * Validates and parses CSV/Excel files containing product data.
 * Enforces strict schema validation and returns structured product objects.
 * 
 * @module csvParser
 */

import * as XLSX from 'xlsx';

// ============================================
// CONSTANTS & CONFIGURATION
// ============================================

/**
 * Maximum file size: 10MB
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

/**
 * Default VAT rate for Germany
 */
const DEFAULT_VAT_RATE = 0.19; // 19%

/**
 * Required CSV columns (must exist and have valid data)
 * NEW SCHEMA: Users provide only raw input data, app calculates everything else
 */
const REQUIRED_COLUMNS = [
  'asin',
  'cost',
  'selling_price',
  'quantity',
  'category'
];

/**
 * Optional CSV columns (can be blank)
 */
const OPTIONAL_COLUMNS = [
  'inventory_purchase_date'
];

/**
 * Deprecated columns from old template (ignore if present, don't require)
 * These are calculated by the app, not provided by user
 */
const DEPRECATED_COLUMNS = [
  'name',
  'product_name',
  'monthly_sales',
  'profit_per_unit',
  'profit_margin',
  'total_monthly_profit',
  'health_score',
  'profitability_risk',
  'risk'
];

/**
 * Column name variations (case-insensitive mapping)
 * Maps various column names to standard format
 */
const COLUMN_ALIASES = {
  'asin': 'asin',
  'product_asin': 'asin',
  'amazon_asin': 'asin',
  
  'cost': 'cost',
  'buy_price': 'cost',
  'purchase_price': 'cost',
  'cost_price': 'cost',
  'buying_price': 'cost',
  
  'selling_price': 'selling_price',
  'sell_price': 'selling_price',
  'price': 'selling_price',
  'sale_price': 'selling_price',
  'sellingprice': 'selling_price',
  
  'quantity': 'quantity',
  'qty': 'quantity',
  'stock': 'quantity',
  'inventory': 'quantity',
  
  'category': 'category',
  'categories': 'category',
  'product_category': 'category',
  
  'inventory_purchase_date': 'inventory_purchase_date',
  'purchase_date': 'inventory_purchase_date',
  'date_purchased': 'inventory_purchase_date',
  'inventory_date': 'inventory_purchase_date',
  'inventorypurchasedate': 'inventory_purchase_date'
};

/**
 * FBA Fee lookup table by category
 * These are approximate fees - will be refined in Phase 4 with Amazon API
 */
const FBA_FEES_BY_CATEGORY = {
  'Electronics': 8.50,
  'Home & Kitchen': 6.50,
  'Books': 4.50,
  'Toys & Games': 7.00,
  'Sports & Outdoors': 7.50,
  'Clothing': 6.00,
  'Beauty': 5.50,
  'Health': 5.50,
  'Automotive': 7.00,
  'Tools': 7.00,
  'Garden': 6.50,
  'Pet Supplies': 6.00,
  'Baby': 6.50,
  'Office Products': 6.00,
  'Grocery': 5.00,
  'default': 6.50 // Default fee if category not found
};

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Validate ASIN format
 * Must be: B + 9 alphanumeric characters (e.g., B00ABCDEF9)
 * 
 * @param {string} asin - ASIN to validate
 * @returns {boolean} True if valid
 */
function validateASIN(asin) {
  if (!asin || typeof asin !== 'string') return false;
  
  // ASIN format: B followed by 9 alphanumeric characters
  const asinRegex = /^B[A-Z0-9]{9}$/;
  return asinRegex.test(asin.trim().toUpperCase());
}

/**
 * Validate cost/price value
 * Must be numeric, > 0, max 2 decimals
 * 
 * @param {any} value - Value to validate
 * @param {string} fieldName - Name of field for error messages
 * @returns {{ valid: boolean, value?: number, error?: string }}
 */
function validatePrice(value, fieldName = 'Price') {
  if (value === null || value === undefined || value === '') {
    return { valid: false, error: `${fieldName} is required` };
  }
  
  const numValue = parseFloat(value);
  
  if (isNaN(numValue)) {
    return { valid: false, error: `${fieldName} must be a number` };
  }
  
  if (numValue <= 0) {
    return { valid: false, error: `${fieldName} must be greater than 0` };
  }
  
  // Check max 2 decimals
  const decimalPart = value.toString().split('.')[1];
  if (decimalPart && decimalPart.length > 2) {
    return { valid: false, error: `${fieldName} can have maximum 2 decimal places` };
  }
  
  return { valid: true, value: parseFloat(numValue.toFixed(2)) };
}

/**
 * Validate quantity
 * Must be integer >= 0
 * 
 * @param {any} value - Value to validate
 * @returns {{ valid: boolean, value?: number, error?: string }}
 */
function validateQuantity(value) {
  if (value === null || value === undefined || value === '') {
    return { valid: false, error: 'Quantity is required' };
  }
  
  const numValue = parseInt(value, 10);
  
  if (isNaN(numValue)) {
    return { valid: false, error: 'Quantity must be a number' };
  }
  
  if (numValue < 0) {
    return { valid: false, error: 'Quantity cannot be negative' };
  }
  
  if (!Number.isInteger(parseFloat(value))) {
    return { valid: false, error: 'Quantity must be a whole number' };
  }
  
  return { valid: true, value: numValue };
}

/**
 * Validate category
 * Must have at least 1 character
 * 
 * @param {any} value - Value to validate
 * @returns {{ valid: boolean, value?: string, error?: string }}
 */
function validateCategory(value) {
  if (!value || value.toString().trim() === '') {
    return { valid: false, error: 'Category is required' };
  }
  
  const category = value.toString().trim();
  
  if (category.length === 0) {
    return { valid: false, error: 'Category must have at least 1 character' };
  }
  
  return { valid: true, value: category };
}

/**
 * Validate inventory purchase date (optional)
 * Must be YYYY-MM-DD format or blank
 * 
 * @param {any} value - Value to validate
 * @returns {{ valid: boolean, value?: string|null, daysInStock?: number, error?: string }}
 */
function validateInventoryDate(value) {
  // Blank is allowed
  if (!value || value.toString().trim() === '') {
    return { valid: true, value: null, daysInStock: null };
  }
  
  const dateStr = value.toString().trim();
  
  // Check format YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) {
    return { 
      valid: false, 
      error: 'Inventory Purchase Date must be in YYYY-MM-DD format (e.g., 2024-10-15)' 
    };
  }
  
  // Validate it's a real date
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Invalid date' };
  }
  
  // Check date is not in the future
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (date > today) {
    return { valid: false, error: 'Inventory Purchase Date cannot be in the future' };
  }
  
  // Calculate days in stock
  const diffTime = Math.abs(today - date);
  const daysInStock = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return { valid: true, value: dateStr, daysInStock };
}

/**
 * Calculate FBA fees based on category
 * 
 * @param {string} category - Category name
 * @returns {number} FBA fee amount
 */
function calculateFBAFees(category) {
  if (!category || typeof category !== 'string') {
    return FBA_FEES_BY_CATEGORY.default;
  }
  
  return FBA_FEES_BY_CATEGORY[category] || FBA_FEES_BY_CATEGORY.default;
}

// ============================================
// COLUMN MAPPING
// ============================================

/**
 * Normalize column names to standard format
 * Handles case-insensitive matching and aliases
 * Detects deprecated columns from old template
 * 
 * @param {string[]} columns - Original column names from CSV
 * @returns {{ mapping: Object, missingRequired: string[], hasDeprecatedColumns: boolean }}
 */
function normalizeColumns(columns) {
  const mapping = {};
  const foundColumns = new Set();
  const deprecatedFound = new Set();
  
  // Map each column to standard name
  columns.forEach((col, index) => {
    const normalized = col.trim().toLowerCase().replace(/[_\s]+/g, '_');
    const standardName = COLUMN_ALIASES[normalized];
    
    // Check if this is a deprecated column
    if (DEPRECATED_COLUMNS.includes(normalized)) {
      deprecatedFound.add(normalized);
      // Don't map deprecated columns
      return;
    }
    
    if (standardName) {
      mapping[index] = standardName;
      foundColumns.add(standardName);
    }
  });
  
  // Check for missing required columns
  const missingRequired = REQUIRED_COLUMNS.filter(req => !foundColumns.has(req));
  
  return { 
    mapping, 
    missingRequired,
    hasDeprecatedColumns: deprecatedFound.size > 0
  };
}

// ============================================
// FILE PARSING
// ============================================

/**
 * Read and parse file (CSV or Excel)
 * 
 * @param {File} file - File object to parse
 * @returns {Promise<{ data: Array, columns: string[] }>}
 */
async function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array', raw: true });
        
        // Get first sheet
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Convert to JSON with header row
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { 
          header: 1,
          raw: false,
          defval: '' 
        });
        
        if (jsonData.length === 0) {
          reject(new Error('File is empty'));
          return;
        }
        
        // First row is headers
        const columns = jsonData[0];
        const rows = jsonData.slice(1);
        
        resolve({ data: rows, columns });
      } catch (error) {
        reject(new Error(`Failed to parse file: ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

// ============================================
// MAIN PARSER FUNCTION
// ============================================

/**
 * Parse and validate CSV/Excel file for bulk product upload
 * 
 * @param {File} file - File object to parse
 * @returns {Promise<{ valid: boolean, products?: Array, rowCount?: number, errors?: string[] }>}
 * 
 * @example
 * const result = await parseAndValidateCSV(file);
 * if (result.valid) {
 *   console.log(`Parsed ${result.rowCount} products`, result.products);
 * } else {
 *   console.error('Validation errors:', result.errors);
 * }
 */
export async function parseAndValidateCSV(file) {
  const errors = [];
  
  try {
    // ============================================
    // 1. FILE VALIDATION
    // ============================================
    
    // Check file exists
    if (!file) {
      return { valid: false, errors: ['No file provided'] };
    }
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return { 
        valid: false, 
        errors: [`File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB`] 
      };
    }
    
    // Check file type
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    const hasValidType = validTypes.includes(file.type) || 
                         file.name.match(/\.(csv|xlsx|xls)$/i);
    
    if (!hasValidType) {
      return { 
        valid: false, 
        errors: ['Invalid file format. Please upload a CSV or Excel file (.csv, .xlsx, .xls)'] 
      };
    }
    
    // ============================================
    // 2. READ AND PARSE FILE
    // ============================================
    
    const { data: rows, columns } = await readFile(file);
    
    if (rows.length === 0) {
      return { valid: false, errors: ['File contains no data rows'] };
    }
    
    // ============================================
    // 3. VALIDATE COLUMNS
    // ============================================
    
    const { mapping, missingRequired, hasDeprecatedColumns } = normalizeColumns(columns);
    
    if (missingRequired.length > 0) {
      return {
        valid: false,
        errors: [
          `Missing required columns: ${missingRequired.join(', ')}`,
          `Required columns are: ${REQUIRED_COLUMNS.join(', ')}`
        ]
      };
    }
    
    // Warn if old template detected
    const warnings = [];
    if (hasDeprecatedColumns) {
      warnings.push('⚠️ Detected old template. Profit values will be recalculated using current FBA fees.');
    }
    
    // ============================================
    // 4. PARSE AND VALIDATE ROWS
    // ============================================
    
    const products = [];
    const seenASINs = new Set();
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // +2 because: 0-indexed + header row
      
      // Skip empty rows
      if (row.every(cell => !cell || cell.toString().trim() === '')) {
        continue;
      }
      
      // Build row object from mapping
      const rowData = {};
      row.forEach((cell, colIndex) => {
        const columnName = mapping[colIndex];
        if (columnName) {
          rowData[columnName] = cell;
        }
      });
      
      // Validate ASIN
      const asinValue = rowData['asin'];
      if (!validateASIN(asinValue)) {
        errors.push(`Row ${rowNum}: Invalid ASIN format. Must be B followed by 9 alphanumeric characters (e.g., B08XYZ1234)`);
        continue;
      }
      
      const asin = asinValue.trim().toUpperCase();
      
      // Check for duplicate ASIN
      if (seenASINs.has(asin)) {
        errors.push(`Row ${rowNum}: Duplicate ASIN "${asin}" found`);
        continue;
      }
      seenASINs.add(asin);
      
      // Validate Cost
      const costValidation = validatePrice(rowData['cost'], 'cost');
      if (!costValidation.valid) {
        errors.push(`Row ${rowNum}: ${costValidation.error}`);
        continue;
      }
      const cost = costValidation.value;
      
      // Validate Selling Price
      const priceValidation = validatePrice(rowData['selling_price'], 'selling_price');
      if (!priceValidation.valid) {
        errors.push(`Row ${rowNum}: ${priceValidation.error}`);
        continue;
      }
      const sellingPrice = priceValidation.value;
      
      // Check Selling Price > Cost
      if (sellingPrice <= cost) {
        errors.push(`Row ${rowNum}: selling_price (€${sellingPrice}) must be greater than cost (€${cost})`);
        continue;
      }
      
      // Validate Quantity
      const qtyValidation = validateQuantity(rowData['quantity']);
      if (!qtyValidation.valid) {
        errors.push(`Row ${rowNum}: ${qtyValidation.error}`);
        continue;
      }
      const quantity = qtyValidation.value;
      
      // Validate Category
      const catValidation = validateCategory(rowData['category']);
      if (!catValidation.valid) {
        errors.push(`Row ${rowNum}: ${catValidation.error}`);
        continue;
      }
      const category = catValidation.value;
      
      // Validate Inventory Purchase Date (optional)
      const dateValidation = validateInventoryDate(rowData['inventory_purchase_date']);
      if (!dateValidation.valid) {
        errors.push(`Row ${rowNum}: ${dateValidation.error}`);
        continue;
      }
      const inventoryPurchaseDate = dateValidation.value;
      const daysInStock = dateValidation.daysInStock;
      
      // Calculate FBA fees based on category
      const fbaFees = calculateFBAFees(category);
      
      // Create product object with NEW SCHEMA
      const product = {
        asin,
        cost,
        sellingPrice,
        quantity,
        category,
        inventoryPurchaseDate,
        daysInStock,
        // System-provided fields
        vatRate: DEFAULT_VAT_RATE,
        fbaFees,
        // Calculated fields (set to null, calculated later)
        profitPerUnit: null,
        margin: null,
        totalProfit: null,
        healthScore: null,
        risk: null
      };
      
      products.push(product);
    }
    
    // ============================================
    // 5. RETURN RESULTS
    // ============================================
    
    // If we have errors but also some valid products, it's a partial success
    if (errors.length > 0 && products.length === 0) {
      return {
        valid: false,
        errors
      };
    }
    
    if (errors.length > 0 || warnings.length > 0) {
      // Some rows failed or old template detected
      const allWarnings = [...warnings, ...errors];
      return {
        valid: true,
        products,
        rowCount: products.length,
        warnings: allWarnings
      };
    }
    
    // All rows valid, no warnings
    return {
      valid: true,
      products,
      rowCount: products.length
    };
    
  } catch (error) {
    return {
      valid: false,
      errors: [error.message || 'An unexpected error occurred while parsing the file']
    };
  }
}

// ============================================
// HELPER EXPORTS
// ============================================

/**
 * Get CSV template data for download
 * NEW SCHEMA: Users provide only raw input data, app calculates profit/margin
 * 
 * @returns {Array<Object>} Template data with example rows
 */
export function getCSVTemplate() {
  return [
    {
      'asin': 'B08XYZ1234',
      'cost': '25.00',
      'selling_price': '49.99',
      'quantity': '150',
      'category': 'Electronics',
      'inventory_purchase_date': ''
    },
    {
      'asin': 'B08ABC5678',
      'cost': '15.00',
      'selling_price': '29.99',
      'quantity': '200',
      'category': 'Home & Kitchen',
      'inventory_purchase_date': '2024-10-15'
    }
  ];
}

/**
 * Get required columns list
 * 
 * @returns {string[]} Array of required column names
 */
export function getRequiredColumns() {
  return [...REQUIRED_COLUMNS];
}

/**
 * Get optional columns list
 * 
 * @returns {string[]} Array of optional column names
 */
export function getOptionalColumns() {
  return [...OPTIONAL_COLUMNS];
}

/**
 * Get info message about inventory date field
 * 
 * @returns {string} Info message for UI
 */
export function getInventoryDateInfoMessage() {
  return '📊 This information will allow us to identify hidden leaks that kill your profit silently.';
}
