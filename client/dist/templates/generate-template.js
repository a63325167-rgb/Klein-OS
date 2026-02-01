/**
 * Script to generate the new CSV template file
 * Run this with Node.js to create bulk_upload_template.xlsx
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Template data with correct schema
const templateData = [
  // Header row
  {
    'asin': 'asin',
    'cost': 'cost',
    'selling_price': 'selling_price',
    'quantity': 'quantity',
    'category': 'category',
    'inventory_purchase_date': 'inventory_purchase_date'
  },
  // Example row 1
  {
    'asin': 'B08XYZ1234',
    'cost': '25.00',
    'selling_price': '49.99',
    'quantity': '150',
    'category': 'Electronics',
    'inventory_purchase_date': ''
  },
  // Example row 2
  {
    'asin': 'B08ABC5678',
    'cost': '15.00',
    'selling_price': '29.99',
    'quantity': '200',
    'category': 'Home & Kitchen',
    'inventory_purchase_date': '2024-10-15'
  }
];

// Instructions data for second sheet
const instructionsData = [
  {
    'Column': 'asin',
    'Description': 'Product identifier (e.g., B08XYZ1234)',
    'Required': 'Yes',
    'Format': 'B + 9 alphanumeric characters'
  },
  {
    'Column': 'cost',
    'Description': 'What you paid per unit in EUR',
    'Required': 'Yes',
    'Format': 'Number with max 2 decimals (e.g., 25.00)'
  },
  {
    'Column': 'selling_price',
    'Description': 'Current Amazon price in EUR',
    'Required': 'Yes',
    'Format': 'Number with max 2 decimals (e.g., 49.99)'
  },
  {
    'Column': 'quantity',
    'Description': 'Units you have in stock',
    'Required': 'Yes',
    'Format': 'Whole number (e.g., 150)'
  },
  {
    'Column': 'category',
    'Description': 'Product category',
    'Required': 'Yes',
    'Format': 'Text (e.g., Electronics, Home & Kitchen)'
  },
  {
    'Column': 'inventory_purchase_date',
    'Description': 'When you bought inventory (OPTIONAL)',
    'Required': 'No',
    'Format': 'YYYY-MM-DD (e.g., 2024-10-15) or leave blank'
  }
];

// Create workbook
const wb = XLSX.utils.book_new();

// Create main template sheet
const ws = XLSX.utils.json_to_sheet(templateData, { skipHeader: true });

// Set column widths
ws['!cols'] = [
  { wch: 15 },  // asin
  { wch: 10 },  // cost
  { wch: 15 },  // selling_price
  { wch: 10 },  // quantity
  { wch: 20 },  // category
  { wch: 25 }   // inventory_purchase_date
];

// Add template sheet
XLSX.utils.book_append_sheet(wb, ws, 'Template');

// Create instructions sheet
const wsInstructions = XLSX.utils.json_to_sheet(instructionsData);

// Set column widths for instructions
wsInstructions['!cols'] = [
  { wch: 25 },  // Column
  { wch: 50 },  // Description
  { wch: 10 },  // Required
  { wch: 40 }   // Format
];

// Add instructions sheet
XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');

// Write to file
const outputPath = path.join(__dirname, 'bulk_upload_template.xlsx');
XLSX.writeFile(wb, outputPath);

console.log('✅ Template file created successfully!');
console.log(`📁 Location: ${outputPath}`);
console.log('\n📋 Template contains:');
console.log('  - Sheet 1: Template with example data');
console.log('  - Sheet 2: Instructions for each column');
console.log('\n💡 Users should:');
console.log('  1. Download this file');
console.log('  2. Fill in their product data (starting from row 2)');
console.log('  3. Upload the completed file');
