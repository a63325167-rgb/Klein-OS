/**
 * CSV Export Utility
 * Handles exporting product data to CSV format
 */

/**
 * Converts an array of objects to a CSV string
 * @param {Array} data - Array of objects to convert
 * @returns {string} - CSV formatted string
 */
const convertToCSV = (data) => {
  if (!data || !data.length) return '';
  
  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create header row
  const headerRow = headers.join(',');
  
  // Create data rows
  const rows = data.map(item => {
    return headers.map(header => {
      const value = item[header];
      // Handle null, undefined, and strings with commas
      if (value === null || value === undefined) {
        return '';
      }
      
      // Convert values to strings and handle special cases
      const stringValue = String(value);
      // Escape quotes and wrap in quotes if contains comma or quote
      if (stringValue.includes(',') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',');
  });
  
  // Combine header and data rows
  return [headerRow, ...rows].join('\n');
};

/**
 * Triggers download of CSV data as a file
 * @param {string} csvContent - CSV content to download
 * @param {string} fileName - Name for the downloaded file
 */
const downloadCSV = (csvContent, fileName) => {
  // Create blob and URL
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  // Create download link and trigger click
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName || 'export'}.csv`);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Main export function - converts data to CSV and triggers download
 * @param {Array} products - Array of product data objects 
 * @param {string} fileName - Name for the downloaded file
 */
export const exportToCSV = (products, fileName = 'product-analysis') => {
  if (!products || !products.length) {
    throw new Error('No products data to export');
  }
  
  const csvContent = convertToCSV(products);
  downloadCSV(csvContent, fileName);
};

export default {
  exportToCSV
};
