/**
 * Input Validation Utilities
 * Validates user input before calculations
 */

import { parseNumberSafe } from './precision';

/**
 * Validation error structure
 */
export class ValidationError {
  constructor(field, message, type = 'error') {
    this.field = field;
    this.message = message;
    this.type = type; // 'error', 'warning'
  }
}

/**
 * Validate product name
 */
export function validateProductName(name) {
  const errors = [];
  
  if (!name || name.trim() === '') {
    errors.push(new ValidationError('product_name', 'Product name is required'));
  } else if (name.length < 2) {
    errors.push(new ValidationError('product_name', 'Product name must be at least 2 characters'));
  } else if (name.length > 100) {
    errors.push(new ValidationError('product_name', 'Product name must be less than 100 characters'));
  }
  
  return errors;
}

/**
 * Validate price (buying or selling)
 */
export function validatePrice(price, fieldName = 'price', minValue = 0.01) {
  const errors = [];
  const numPrice = parseNumberSafe(price);
  
  if (numPrice <= 0) {
    errors.push(new ValidationError(fieldName, `${fieldName} must be greater than 0`));
  } else if (numPrice < minValue) {
    errors.push(new ValidationError(fieldName, `${fieldName} must be at least €${minValue}`, 'warning'));
  } else if (numPrice > 100000) {
    errors.push(new ValidationError(fieldName, `${fieldName} seems unusually high (>€100,000)`, 'warning'));
  }
  
  return errors;
}

/**
 * Validate dimension (length, width, height)
 */
export function validateDimension(dimension, fieldName = 'dimension', minValue = 0.1, maxValue = 500) {
  const errors = [];
  const numDim = parseNumberSafe(dimension);
  
  if (numDim <= 0) {
    errors.push(new ValidationError(fieldName, `${fieldName} must be greater than 0`));
  } else if (numDim < minValue) {
    errors.push(new ValidationError(fieldName, `${fieldName} must be at least ${minValue} cm`));
  } else if (numDim > maxValue) {
    errors.push(new ValidationError(fieldName, `${fieldName} exceeds maximum (${maxValue} cm)`, 'warning'));
  }
  
  return errors;
}

/**
 * Validate weight
 */
export function validateWeight(weight, minValue = 0.01, maxValue = 100) {
  const errors = [];
  const numWeight = parseNumberSafe(weight);
  
  if (numWeight <= 0) {
    errors.push(new ValidationError('weight_kg', 'Weight must be greater than 0'));
  } else if (numWeight < minValue) {
    errors.push(new ValidationError('weight_kg', `Weight must be at least ${minValue} kg`));
  } else if (numWeight > maxValue) {
    errors.push(new ValidationError('weight_kg', `Weight exceeds maximum (${maxValue} kg)`, 'warning'));
  }
  
  return errors;
}

/**
 * Validate category
 */
export function validateCategory(category) {
  const errors = [];
  const validCategories = [
    'Electronics', 'Beauty', 'Jewelry', 'Health', 'Books', 'Apparel', 
    'Furniture', 'Food', 'Baby', 'Sports & Outdoors', 'Toys & Games', 
    'Home & Garden', 'Automotive', 'Office Supplies', 'Other', 'Default'
  ];
  
  if (!category || category.trim() === '') {
    errors.push(new ValidationError('category', 'Category is required'));
  } else if (!validCategories.includes(category)) {
    // Don't reject, just warn
    errors.push(new ValidationError('category', `Category "${category}" not in standard list`, 'warning'));
  }
  
  return errors;
}

/**
 * Validate country
 */
export function validateCountry(country) {
  const errors = [];
  const validCountries = [
    'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Belgium', 
    'Austria', 'Sweden', 'Denmark', 'Finland', 'Poland', 'Czech Republic',
    'Hungary', 'Portugal', 'Greece', 'Slovakia', 'Slovenia', 'Croatia',
    'Romania', 'Bulgaria', 'Lithuania', 'Latvia', 'Estonia', 'Cyprus',
    'Malta', 'Luxembourg', 'Ireland'
  ];
  
  if (!country || country.trim() === '') {
    errors.push(new ValidationError('destination_country', 'Destination country is required'));
  } else if (!validCountries.includes(country)) {
    errors.push(new ValidationError('destination_country', 'Invalid country selected'));
  }
  
  return errors;
}

/**
 * Validate price logic (selling > buying)
 */
export function validatePriceLogic(buyingPrice, sellingPrice) {
  const errors = [];
  const numBuying = parseNumberSafe(buyingPrice);
  const numSelling = parseNumberSafe(sellingPrice);
  
  if (numSelling <= numBuying) {
    errors.push(new ValidationError('selling_price', 'Selling price must be greater than buying price'));
  } else if (numSelling < numBuying * 1.1) {
    errors.push(new ValidationError('selling_price', 'Selling price is very close to buying price (margin < 10%)', 'warning'));
  }
  
  return errors;
}

/**
 * Validate complete product data
 */
export function validateProductData(productData) {
  const errors = [];
  
  // Validate all fields
  errors.push(...validateProductName(productData.product_name));
  errors.push(...validatePrice(productData.buying_price, 'buying_price'));
  errors.push(...validatePrice(productData.selling_price, 'selling_price'));
  errors.push(...validateDimension(productData.length_cm, 'length_cm'));
  errors.push(...validateDimension(productData.width_cm, 'width_cm'));
  errors.push(...validateDimension(productData.height_cm, 'height_cm'));
  errors.push(...validateWeight(productData.weight_kg));
  errors.push(...validateCategory(productData.category));
  errors.push(...validateCountry(productData.destination_country));
  
  // Validate price logic
  if (errors.filter(e => ['buying_price', 'selling_price'].includes(e.field) && e.type === 'error').length === 0) {
    errors.push(...validatePriceLogic(productData.buying_price, productData.selling_price));
  }
  
  return errors;
}

/**
 * Check if validation has errors (not warnings)
 */
export function hasErrors(validationResults) {
  return validationResults.some(v => v.type === 'error');
}

/**
 * Get errors only (no warnings)
 */
export function getErrors(validationResults) {
  return validationResults.filter(v => v.type === 'error');
}

/**
 * Get warnings only
 */
export function getWarnings(validationResults) {
  return validationResults.filter(v => v.type === 'warning');
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(validationResults) {
  const errors = getErrors(validationResults);
  const warnings = getWarnings(validationResults);
  
  return {
    hasErrors: errors.length > 0,
    hasWarnings: warnings.length > 0,
    errors: errors.map(e => e.message),
    warnings: warnings.map(w => w.message),
    byField: validationResults.reduce((acc, v) => {
      if (!acc[v.field]) {
        acc[v.field] = [];
      }
      acc[v.field].push(v);
      return acc;
    }, {})
  };
}

/**
 * Validate bulk upload row
 */
export function validateBulkRow(row, rowIndex) {
  const errors = [];
  const requiredColumns = [
    'Product Name', 'Cost (€)', 'Selling Price (€)', 
    'Category', 'Country', 'Length (cm)', 'Width (cm)', 
    'Height (cm)', 'Weight (kg)'
  ];
  
  // Check for missing required columns
  requiredColumns.forEach((col, idx) => {
    if (!row[idx] || String(row[idx]).trim() === '') {
      errors.push(new ValidationError(
        `row_${rowIndex}_col_${idx}`,
        `Row ${rowIndex}: Missing ${col}`
      ));
    }
  });
  
  return errors;
}

/**
 * Validate bulk upload data
 */
export function validateBulkData(data) {
  const errors = [];
  
  if (!data || !Array.isArray(data) || data.length === 0) {
    errors.push(new ValidationError('bulk_data', 'No data found in file'));
    return errors;
  }
  
  // Validate header row
  const headers = data[0];
  const expectedHeaders = [
    'Product Name', 'Cost (€)', 'Selling Price (€)', 'Units Sold',
    'Delivery Cost (€)', 'Conversion Rate (%)', 'Stock Left', 
    'Category', 'Country', 'Length (cm)', 'Width (cm)', 
    'Height (cm)', 'Weight (kg)'
  ];
  
  expectedHeaders.forEach((expected, idx) => {
    if (!headers[idx] || !String(headers[idx]).includes(expected.split(' ')[0])) {
      errors.push(new ValidationError(
        'headers',
        `Expected column "${expected}" at position ${idx + 1}`,
        'warning'
      ));
    }
  });
  
  // Validate data rows (skip header)
  const dataRows = data.slice(1);
  let validRowCount = 0;
  
  dataRows.forEach((row, idx) => {
    // Skip empty rows
    const hasData = row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== '');
    if (!hasData) {
      return;
    }
    
    validRowCount++;
    const rowErrors = validateBulkRow(row, idx + 2); // +2 for header and 0-indexing
    errors.push(...rowErrors);
  });
  
  if (validRowCount === 0) {
    errors.push(new ValidationError('bulk_data', 'No valid data rows found'));
  }
  
  if (validRowCount > 500) {
    errors.push(new ValidationError(
      'bulk_data',
      'File contains more than 500 rows. Consider splitting for better performance.',
      'warning'
    ));
  }
  
  return {
    errors,
    validRowCount,
    totalRows: dataRows.length
  };
}

