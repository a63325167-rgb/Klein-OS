/**
 * Upload Template Generator (B7)
 * 
 * Creates downloadable CSV and Excel templates for bulk product upload.
 * Templates include headers, example row, and field descriptions.
 */

/**
 * Field definitions for bulk upload
 */
export const UPLOAD_FIELDS = {
  // REQUIRED FIELDS
  required: [
    { key: 'product_asin', label: 'Product ASIN', type: 'string', validation: 'Must be 10 characters' },
    { key: 'product_name', label: 'Product Name', type: 'string', validation: '1-200 characters' },
    { key: 'selling_price_eur', label: 'Selling Price (€)', type: 'number', validation: '>= 0.01' },
    { key: 'cogs_per_unit_eur', label: 'COGS Per Unit (€)', type: 'number', validation: '>= 0.01' },
    { key: 'monthly_sales_velocity', label: 'Monthly Sales (units)', type: 'number', validation: '>= 0' }
  ],
  
  // OPTIONAL FIELDS (with defaults)
  optional: [
    { key: 'return_rate_percent', label: 'Return Rate (%)', type: 'number', default: 5, validation: '0-100' },
    { key: 'referral_fee_percent', label: 'Referral Fee (%)', type: 'number', default: 15, validation: '0-100' },
    { key: 'fba_fee_percent', label: 'FBA Fee (%)', type: 'number', default: 8, validation: '0-100' },
    { key: 'vat_percent', label: 'VAT (%)', type: 'number', default: 19, validation: '0-100' },
    { key: 'shipping_cost_per_unit_eur', label: 'Shipping Cost (€/unit)', type: 'number', default: 2, validation: '>= 0' },
    { key: 'initial_order_quantity', label: 'Initial Order Qty', type: 'number', default: 'auto', validation: '>= 1' },
    { key: 'initial_cash_eur', label: 'Initial Cash (€)', type: 'number', default: 5000, validation: '>= 0' },
    { key: 'competitor_count', label: 'Competitor Count', type: 'number', default: 0, validation: '>= 0' },
    { key: 'average_rating_stars', label: 'Avg Rating (stars)', type: 'number', default: 3.5, validation: '0-5' },
    { key: 'category', label: 'Category', type: 'string', default: 'Uncategorized', validation: 'Optional' }
  ]
};

/**
 * Get all field headers
 */
export function getFieldHeaders() {
  return [
    ...UPLOAD_FIELDS.required.map(f => f.key),
    ...UPLOAD_FIELDS.optional.map(f => f.key)
  ];
}

/**
 * Generate example row data
 */
export function getExampleRow() {
  return {
    product_asin: 'B08XYZ1234',
    product_name: 'Premium Wireless Headphones - Noise Cancelling',
    selling_price_eur: 79.99,
    cogs_per_unit_eur: 25.00,
    monthly_sales_velocity: 45,
    return_rate_percent: 5,
    referral_fee_percent: 15,
    fba_fee_percent: 8,
    vat_percent: 19,
    shipping_cost_per_unit_eur: 2.50,
    initial_order_quantity: 90,
    initial_cash_eur: 5000,
    competitor_count: 12,
    average_rating_stars: 4.2,
    category: 'Electronics'
  };
}

/**
 * Generate CSV template
 * 
 * @returns {string} CSV content
 */
export function generateCSVTemplate() {
  const headers = getFieldHeaders();
  const example = getExampleRow();
  
  const headerRow = headers.join(',');
  const exampleRow = headers.map(key => {
    const value = example[key];
    // Quote strings that contain commas
    if (typeof value === 'string' && value.includes(',')) {
      return `"${value}"`;
    }
    return value;
  }).join(',');
  
  // Add field descriptions as comments
  const descriptions = [
    '# REQUIRED FIELDS: product_asin (10 chars), product_name, selling_price_eur (>= 0.01), cogs_per_unit_eur (>= 0.01), monthly_sales_velocity (>= 0)',
    '# OPTIONAL FIELDS: All other fields have defaults if left empty',
    '# EXAMPLE ROW: See row 2 below for a complete example',
    '# DELETE THIS LINE AND EXAMPLE ROW BEFORE UPLOADING YOUR DATA',
    ''
  ].join('\n');
  
  return `${descriptions}\n${headerRow}\n${exampleRow}`;
}

/**
 * Generate Excel template (requires xlsx library)
 * 
 * @returns {ArrayBuffer} Excel file buffer
 */
export function generateExcelTemplate() {
  // Check if xlsx is available
  if (typeof window === 'undefined' || !window.XLSX) {
    console.warn('XLSX library not loaded. Falling back to CSV.');
    return null;
  }
  
  const XLSX = window.XLSX;
  const headers = getFieldHeaders();
  const example = getExampleRow();
  
  // Create worksheet data
  const wsData = [
    // Header row
    headers,
    // Example row
    headers.map(key => example[key]),
    // Empty rows for user data
    ...Array(10).fill(headers.map(() => ''))
  ];
  
  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  
  // Set column widths
  ws['!cols'] = headers.map((header) => {
    if (header === 'product_name') return { wch: 40 };
    if (header === 'product_asin') return { wch: 12 };
    if (header === 'category') return { wch: 15 };
    return { wch: 18 };
  });
  
  // Add cell comments/notes for required fields
  const requiredFields = UPLOAD_FIELDS.required.map(f => f.key);
  headers.forEach((header, idx) => {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: idx });
    if (!ws[cellRef]) ws[cellRef] = { v: header };
    
    if (requiredFields.includes(header)) {
      ws[cellRef].c = [{
        a: 'System',
        t: 'REQUIRED FIELD - Cannot be empty'
      }];
    }
  });
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Products');
  
  // Add instructions sheet
  const instructionsData = [
    ['Bulk Product Upload Instructions'],
    [''],
    ['STEP 1: Fill in your product data'],
    ['- Delete the example row (row 2)'],
    ['- Add your products starting from row 2'],
    ['- Fill in all REQUIRED fields (marked in bold)'],
    ['- Optional fields will use defaults if left empty'],
    [''],
    ['STEP 2: Required Fields'],
    ['- product_asin: Amazon product ID (10 characters, e.g., B08XYZ1234)'],
    ['- product_name: Product title (1-200 characters)'],
    ['- selling_price_eur: Selling price in euros (>= €0.01)'],
    ['- cogs_per_unit_eur: Cost of goods per unit (>= €0.01)'],
    ['- monthly_sales_velocity: Units sold per month (>= 0)'],
    [''],
    ['STEP 3: Optional Fields (defaults shown)'],
    ...UPLOAD_FIELDS.optional.map(f => 
      [`- ${f.key}: ${f.label} (default: ${f.default})`]
    ),
    [''],
    ['STEP 4: Upload'],
    ['- Save this file'],
    ['- Go to Products page'],
    ['- Click "Bulk Upload"'],
    ['- Select this file'],
    ['- Review validation results'],
    ['- Import your products'],
    [''],
    ['STEP 5: After Import'],
    ['- All metrics calculated automatically'],
    ['- Health scores, risks, cash flow, break-even computed'],
    ['- Export results as CSV or PDF'],
    [''],
    ['TIPS:'],
    ['- You can upload 50-500 products at once'],
    ['- Validation catches errors before import'],
    ['- Duplicate ASINs will be detected'],
    ['- Invalid rows can be fixed and re-uploaded']
  ];
  
  const wsInstructions = XLSX.utils.aoa_to_sheet(instructionsData);
  wsInstructions['!cols'] = [{ wch: 80 }];
  XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');
  
  // Write to array buffer
  return XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
}

/**
 * Download template file
 * 
 * @param {string} format - 'csv' or 'xlsx'
 */
export function downloadTemplate(format = 'csv') {
  let data;
  let filename;
  let mimeType;
  
  if (format === 'xlsx') {
    data = generateExcelTemplate();
    if (!data) {
      // Fallback to CSV if Excel not available
      console.warn('Excel generation failed, downloading CSV instead');
      format = 'csv';
    } else {
      filename = 'products-template.xlsx';
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    }
  }
  
  if (format === 'csv') {
    data = generateCSVTemplate();
    filename = 'products-template.csv';
    mimeType = 'text/csv;charset=utf-8;';
  }
  
  // Create blob and download
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  return filename;
}

/**
 * Get field metadata
 */
export function getFieldMetadata(fieldKey) {
  const allFields = [...UPLOAD_FIELDS.required, ...UPLOAD_FIELDS.optional];
  return allFields.find(f => f.key === fieldKey);
}

/**
 * Validate field value
 */
export function validateFieldValue(fieldKey, value) {
  const field = getFieldMetadata(fieldKey);
  if (!field) return { valid: true };
  
  // Check required
  if (UPLOAD_FIELDS.required.some(f => f.key === fieldKey)) {
    if (value === null || value === undefined || value === '') {
      return { valid: false, error: `${field.label} is required` };
    }
  }
  
  // Type validation
  if (field.type === 'number') {
    const num = parseFloat(value);
    if (isNaN(num)) {
      return { valid: false, error: `${field.label} must be a number` };
    }
    
    // Range validation
    if (field.validation.includes('>=')) {
      const min = parseFloat(field.validation.split('>=')[1]);
      if (num < min) {
        return { valid: false, error: `${field.label} must be >= ${min}` };
      }
    }
    
    if (field.validation.includes('0-100')) {
      if (num < 0 || num > 100) {
        return { valid: false, error: `${field.label} must be between 0 and 100` };
      }
    }
    
    if (field.validation.includes('0-5')) {
      if (num < 0 || num > 5) {
        return { valid: false, error: `${field.label} must be between 0 and 5` };
      }
    }
  }
  
  if (field.type === 'string') {
    const str = String(value);
    
    if (fieldKey === 'product_asin' && str.length !== 10) {
      return { valid: false, error: 'ASIN must be exactly 10 characters' };
    }
    
    if (fieldKey === 'product_name' && (str.length < 1 || str.length > 200)) {
      return { valid: false, error: 'Product name must be 1-200 characters' };
    }
  }
  
  return { valid: true };
}
