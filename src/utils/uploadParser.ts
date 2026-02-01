// src/utils/uploadParser.ts

import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { UploadRow, ParseError, ParseResult } from '../types/upload';
import { calculateBulkProducts } from './bulkCalculations';

/**
 * Parse CSV or Excel file and return validated product data
 * 
 * Supports:
 * - CSV files (comma, semicolon, tab delimited)
 * - Excel files (.xlsx, .xls)
 * 
 * Process:
 * 1. Detect file format
 * 2. Parse file content
 * 3. Validate required fields
 * 4. Apply defaults to optional fields
 * 5. Calculate all metrics
 * 6. Return results with errors and warnings
 * 
 * @param file - User's uploaded file (CSV or Excel)
 * @returns ParseResult with valid rows, errors, and warnings
 * @throws Error if file format unsupported or file is invalid
 */
export async function parseUploadFile(file: File): Promise<ParseResult> {
  // 1. Detect format
  const format = detectFileFormat(file.name, file.type);
  if (!format) {
    throw new Error('Unsupported file format. Please use CSV or Excel (.xlsx, .xls) files.');
  }

  // 2. Parse file
  const rows = await parseFile(file, format);
  if (rows.length === 0) {
    throw new Error('File is empty or contains no data rows.');
  }

  // 3. Validate and process rows
  const validRows: UploadRow[] = [];
  const errors: ParseError[] = [];
  const warnings: string[] = [];
  const seenASINs = new Set<string>();

  for (let i = 0; i < rows.length; i++) {
    const rawRow = rows[i];
    const rowIndex = i + 2; // 1-indexed (header=1, first data=2)

    // Skip empty rows
    if (isEmptyRow(rawRow)) continue;

    // Validate required fields
    const validationResult = validateRow(rawRow, rowIndex);
    if (validationResult.errors.length > 0) {
      errors.push(...validationResult.errors);
      continue; // Skip this row
    }

    // Create UploadRow with defaults
    const uploadRow = createUploadRow(rawRow, rowIndex);
    validRows.push(uploadRow);

    // Check for duplicate ASINs
    if (seenASINs.has(uploadRow.asin)) {
      warnings.push(`Row ${rowIndex}: Duplicate ASIN "${uploadRow.asin}" (same product listed multiple times)`);
    }
    seenASINs.add(uploadRow.asin);

    // Add warnings if needed
    const rowWarnings = generateWarnings(uploadRow, rowIndex);
    warnings.push(...rowWarnings);
  }

  // 4. Calculate all metrics
  const calculatedRows = calculateBulkProducts(validRows);

  // 5. Return result
  return {
    rows: calculatedRows,
    errors,
    warnings,
    totalRows: rows.length
  };
}

/**
 * Detect file format from filename and MIME type
 * 
 * @param fileName - Name of the file (e.g., 'products.csv')
 * @param mimeType - MIME type of the file
 * @returns 'csv' | 'excel' | null
 */
function detectFileFormat(fileName: string, mimeType: string): 'csv' | 'excel' | null {
  const ext = fileName.toLowerCase().split('.').pop();
  
  // Check CSV
  if (ext === 'csv' || mimeType === 'text/csv' || mimeType === 'application/csv') {
    return 'csv';
  }
  
  // Check Excel
  if (
    ['xlsx', 'xls'].includes(ext || '') ||
    mimeType.includes('spreadsheet') ||
    mimeType.includes('excel')
  ) {
    return 'excel';
  }
  
  return null;
}

/**
 * Parse file content based on format
 * 
 * @param file - File object
 * @param format - Detected format ('csv' or 'excel')
 * @returns Array of row objects
 */
async function parseFile(file: File, format: 'csv' | 'excel'): Promise<any[]> {
  if (format === 'csv') {
    return parseCSV(file);
  } else {
    return parseExcel(file);
  }
}

/**
 * Parse CSV file using Papa Parse
 * 
 * @param file - CSV file
 * @returns Array of row objects
 */
function parseCSV(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false, // Keep as strings for validation
      transformHeader: (header: string) => header.trim(),
      complete: (results: any) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV parsing error: ${results.errors[0].message}`));
        } else {
          resolve(results.data as any[]);
        }
      },
      error: (error: any) => reject(new Error(`CSV parsing error: ${error.message}`))
    });
  });
}

/**
 * Parse Excel file using XLSX
 * 
 * @param file - Excel file (.xlsx or .xls)
 * @returns Array of row objects
 */
async function parseExcel(file: File): Promise<any[]> {
  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    
    // Read first sheet
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      throw new Error('Excel file contains no sheets');
    }
    
    const worksheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, {
      raw: false, // Convert to strings for validation
      defval: '' // Default value for empty cells
    });
    
    return rows;
  } catch (error) {
    throw new Error(`Excel parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if row is empty (all values are null/empty/undefined)
 * 
 * @param row - Row object
 * @returns true if row is empty
 */
function isEmptyRow(row: any): boolean {
  if (!row || typeof row !== 'object') return true;
  return Object.values(row).every(v => 
    v === null || v === '' || v === undefined || String(v).trim() === ''
  );
}

/**
 * Validate all required fields in a row
 * 
 * @param rawRow - Raw row data from file
 * @param rowIndex - Row number (1-indexed)
 * @returns Object with errors array
 */
function validateRow(rawRow: any, rowIndex: number): { errors: ParseError[] } {
  const errors: ParseError[] = [];

  // Get field values (case-insensitive)
  const asin = getFieldValue(rawRow, 'asin');
  const name = getFieldValue(rawRow, 'name');
  const price = getFieldValue(rawRow, 'price');
  const cogs = getFieldValue(rawRow, 'cogs');
  const velocity = getFieldValue(rawRow, 'velocity');

  // Validate ASIN
  if (!validateASIN(asin)) {
    errors.push({
      rowIndex,
      field: 'asin',
      value: String(asin || ''),
      error: 'ASIN must be exactly 10 alphanumeric characters',
      fixable: false
    });
  }

  // Validate Name
  if (!validateName(name)) {
    errors.push({
      rowIndex,
      field: 'name',
      value: String(name || ''),
      error: 'Name must be 1-200 characters',
      fixable: false
    });
  }

  // Validate Price
  if (!validatePrice(price)) {
    errors.push({
      rowIndex,
      field: 'price',
      value: String(price || ''),
      error: 'Price must be a number ≥ €0.01',
      fixable: false
    });
  }

  // Validate COGS
  if (!validateCOGS(cogs)) {
    errors.push({
      rowIndex,
      field: 'cogs',
      value: String(cogs || ''),
      error: 'COGS must be a number ≥ €0.01',
      fixable: false
    });
  }

  // Validate Velocity
  if (!validateVelocity(velocity)) {
    errors.push({
      rowIndex,
      field: 'velocity',
      value: String(velocity || ''),
      error: 'Velocity must be a number ≥ 0',
      fixable: false
    });
  }

  return { errors };
}

/**
 * Create UploadRow object from raw row data
 * Applies default values to optional fields
 * 
 * @param rawRow - Raw row data from file
 * @param rowIndex - Row number (1-indexed)
 * @returns UploadRow object
 */
function createUploadRow(rawRow: any, rowIndex: number): UploadRow {
  const velocity = parseFloat(getFieldValue(rawRow, 'velocity'));

  return {
    rowIndex,
    asin: String(getFieldValue(rawRow, 'asin')).trim().toUpperCase(),
    name: String(getFieldValue(rawRow, 'name')).trim(),
    price: parseFloat(getFieldValue(rawRow, 'price')),
    cogs: parseFloat(getFieldValue(rawRow, 'cogs')),
    velocity,
    // Optional fields with defaults
    returnRate: parseFloatWithDefault(getFieldValue(rawRow, 'returnrate'), 5, 0, 100),
    referralFee: parseFloatWithDefault(getFieldValue(rawRow, 'referralfee'), 15, 0, 100),
    fbaFee: parseFloatWithDefault(getFieldValue(rawRow, 'fbafee'), 8, 0, 100),
    vat: parseFloatWithDefault(getFieldValue(rawRow, 'vat'), 19, 0, 100),
    shippingCost: parseFloatWithDefault(getFieldValue(rawRow, 'shippingcost'), 2, 0, 1000),
    initialOrder: parseFloatWithDefault(getFieldValue(rawRow, 'initialorder'), Math.max(1, velocity * 2), 1, 100000),
    initialCash: parseFloatWithDefault(getFieldValue(rawRow, 'initialcash'), 5000, 0, 1000000),
    competitorCount: parseFloatWithDefault(getFieldValue(rawRow, 'competitorcount'), 0, 0, 1000),
    rating: parseFloatWithDefault(getFieldValue(rawRow, 'rating'), 3.5, 0, 5),
    category: String(getFieldValue(rawRow, 'category') || 'Uncategorized').trim()
  };
}

/**
 * Generate warnings for a validated row
 * 
 * @param uploadRow - Validated UploadRow
 * @param rowIndex - Row number (1-indexed)
 * @returns Array of warning messages
 */
function generateWarnings(uploadRow: UploadRow, rowIndex: number): string[] {
  const warnings: string[] = [];

  // Zero velocity warning
  if (uploadRow.velocity === 0) {
    warnings.push(`Row ${rowIndex}: No sales velocity (0 units/month) - break-even and turnover calculations will show 999 days`);
  }

  // High competition warning
  if (uploadRow.competitorCount > 20) {
    warnings.push(`Row ${rowIndex}: High competition (${uploadRow.competitorCount} competitors) - may impact profitability`);
  }

  // Low rating warning
  if (uploadRow.rating < 3.0) {
    warnings.push(`Row ${rowIndex}: Low product rating (${uploadRow.rating} stars) - may affect sales`);
  }

  // Very high return rate warning
  if (uploadRow.returnRate > 15) {
    warnings.push(`Row ${rowIndex}: High return rate (${uploadRow.returnRate}%) - will significantly impact profit`);
  }

  return warnings;
}

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Validate ASIN format
 * Must be exactly 10 alphanumeric characters
 * 
 * @param value - ASIN value
 * @returns true if valid
 */
function validateASIN(value: any): boolean {
  if (!value) return false;
  const asin = String(value).trim().toUpperCase();
  return /^[A-Z0-9]{10}$/.test(asin);
}

/**
 * Validate product name
 * Must be 1-200 characters
 * 
 * @param value - Name value
 * @returns true if valid
 */
function validateName(value: any): boolean {
  if (!value) return false;
  const name = String(value).trim();
  return name.length >= 1 && name.length <= 200;
}

/**
 * Validate price
 * Must be a number >= €0.01
 * 
 * @param value - Price value
 * @returns true if valid
 */
function validatePrice(value: any): boolean {
  if (value === null || value === undefined || value === '') return false;
  const price = parseFloat(String(value));
  return !isNaN(price) && price >= 0.01;
}

/**
 * Validate COGS (Cost of Goods Sold)
 * Must be a number >= €0.01
 * 
 * @param value - COGS value
 * @returns true if valid
 */
function validateCOGS(value: any): boolean {
  if (value === null || value === undefined || value === '') return false;
  const cogs = parseFloat(String(value));
  return !isNaN(cogs) && cogs >= 0.01;
}

/**
 * Validate velocity
 * Must be a number >= 0 (can be 0)
 * 
 * @param value - Velocity value
 * @returns true if valid
 */
function validateVelocity(value: any): boolean {
  if (value === null || value === undefined || value === '') return false;
  const velocity = parseFloat(String(value));
  return !isNaN(velocity) && velocity >= 0;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get field value from row (case-insensitive)
 * 
 * @param row - Row object
 * @param fieldName - Field name to search for
 * @returns Field value or empty string
 */
function getFieldValue(row: any, fieldName: string): any {
  if (!row || typeof row !== 'object') return '';
  
  const lowerFieldName = fieldName.toLowerCase().replace(/\s/g, '');
  
  // Try exact match first
  if (row[fieldName] !== undefined) return row[fieldName];
  
  // Try case-insensitive match
  for (const key in row) {
    const lowerKey = key.toLowerCase().replace(/\s/g, '');
    if (lowerKey === lowerFieldName) {
      return row[key];
    }
  }
  
  return '';
}

/**
 * Parse float with default value and range validation
 * 
 * @param value - Value to parse
 * @param defaultValue - Default if parsing fails
 * @param min - Minimum allowed value (optional)
 * @param max - Maximum allowed value (optional)
 * @returns Parsed number or default
 */
function parseFloatWithDefault(
  value: any,
  defaultValue: number,
  min?: number,
  max?: number
): number {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  
  const parsed = parseFloat(String(value));
  
  if (isNaN(parsed)) {
    return defaultValue;
  }
  
  // Apply range constraints
  if (min !== undefined && parsed < min) {
    return defaultValue;
  }
  
  if (max !== undefined && parsed > max) {
    return defaultValue;
  }
  
  return parsed;
}
