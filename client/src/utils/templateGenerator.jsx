/**
 * Template Generator Utility
 * Generates downloadable CSV/Excel template files for bulk upload
 */

import * as XLSX from 'xlsx';

/**
 * Generate and download CSV template
 * Simple CSV format for maximum compatibility
 */
export function downloadCSVTemplate() {
  const csvContent = `asin,cost,selling_price,quantity,category,inventory_purchase_date
B08XYZ1234,25.00,49.99,150,Electronics,
B08ABC5678,15.00,29.99,200,Home & Kitchen,2024-10-15`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', 'bulk_upload_template.csv');
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Generate and download Excel template
 * Excel format with instructions sheet
 */
export function downloadExcelTemplate() {
  // Template data
  const templateData = [
    {
      'asin': 'B08XYZ1234',
      'cost': 25.00,
      'selling_price': 49.99,
      'quantity': 150,
      'category': 'Electronics',
      'inventory_purchase_date': ''
    },
    {
      'asin': 'B08ABC5678',
      'cost': 15.00,
      'selling_price': 29.99,
      'quantity': 200,
      'category': 'Home & Kitchen',
      'inventory_purchase_date': '2024-10-15'
    }
  ];

  // Instructions data
  const instructionsData = [
    {
      'Column': 'asin',
      'Description': 'Product identifier (e.g., B08XYZ1234)',
      'Required': 'Yes',
      'Format': 'B + 9 alphanumeric characters',
      'Example': 'B08XYZ1234'
    },
    {
      'Column': 'cost',
      'Description': 'What you paid per unit in EUR',
      'Required': 'Yes',
      'Format': 'Number with max 2 decimals',
      'Example': '25.00'
    },
    {
      'Column': 'selling_price',
      'Description': 'Current Amazon price in EUR',
      'Required': 'Yes',
      'Format': 'Number with max 2 decimals',
      'Example': '49.99'
    },
    {
      'Column': 'quantity',
      'Description': 'Units you have in stock',
      'Required': 'Yes',
      'Format': 'Whole number',
      'Example': '150'
    },
    {
      'Column': 'category',
      'Description': 'Product category',
      'Required': 'Yes',
      'Format': 'Text',
      'Example': 'Electronics, Home & Kitchen'
    },
    {
      'Column': 'inventory_purchase_date',
      'Description': 'When you bought inventory (OPTIONAL)',
      'Required': 'No',
      'Format': 'YYYY-MM-DD or leave blank',
      'Example': '2024-10-15'
    }
  ];

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Create template sheet
  const ws = XLSX.utils.json_to_sheet(templateData);
  
  // Set column widths
  ws['!cols'] = [
    { wch: 15 },  // asin
    { wch: 10 },  // cost
    { wch: 15 },  // selling_price
    { wch: 10 },  // quantity
    { wch: 20 },  // category
    { wch: 25 }   // inventory_purchase_date
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Template');

  // Create instructions sheet
  const wsInstructions = XLSX.utils.json_to_sheet(instructionsData);
  
  // Set column widths for instructions
  wsInstructions['!cols'] = [
    { wch: 25 },  // Column
    { wch: 50 },  // Description
    { wch: 10 },  // Required
    { wch: 40 },  // Format
    { wch: 30 }   // Example
  ];

  XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');

  // Generate Excel file and trigger download
  XLSX.writeFile(wb, 'bulk_upload_template.xlsx');
}

/**
 * Get template info message
 * Display this near the download button
 */
export function getTemplateInfoMessage() {
  return {
    main: '📥 Download the template, fill in your product data, then upload it here.',
    tip: "💡 Tip: Leave 'inventory_purchase_date' blank if you don't track purchase dates. The app will calculate profit, margin, and risk automatically."
  };
}

/**
 * Get old template warning message
 * Show this when user uploads old format
 */
export function getOldTemplateWarning() {
  return "⚠️ Old template detected. We've recalculated all profit/margin values using current formulas. Download the new template for future uploads.";
}

/**
 * Get supported file formats
 */
export function getSupportedFormats() {
  return ['.xlsx', '.csv', '.xls'];
}

/**
 * Get file format description
 */
export function getFileFormatDescription() {
  return 'Supports Excel (.xlsx, .xls) and CSV (.csv) files';
}
