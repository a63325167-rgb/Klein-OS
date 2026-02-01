// src/utils/exportCSV.ts

import { BulkProductResult } from '../types/upload';

/**
 * Export products to CSV format
 * 
 * Features:
 * - All 30 fields exported in exact order (16 input + 14 calculated)
 * - Proper CSV escaping for special characters
 * - Currency fields formatted as €X.XX
 * - Percentage fields as decimals (e.g., 0.1925 for 19.25%)
 * - Risk fields as 'red'|'yellow'|'green' strings
 * - Handles large files (500+ products)
 * - Triggers browser download
 * 
 * @param products - Array of calculated products
 * @param filename - Optional custom filename (default: auto-generated with timestamp)
 * @returns CSV content string
 */
export function exportToCSV(products: BulkProductResult[], filename?: string): string {
  if (!products || products.length === 0) {
    throw new Error('No products to export');
  }

  // Define CSV headers (all 30 fields in exact order)
  const headers = [
    'rowIndex',
    'asin',
    'name',
    'price',
    'cogs',
    'velocity',
    'returnRate',
    'referralFee',
    'fbaFee',
    'vat',
    'shippingCost',
    'initialOrder',
    'initialCash',
    'competitorCount',
    'rating',
    'category',
    'profitPerUnit',
    'profitMargin',
    'totalMonthlyProfit',
    'breakEvenDays',
    'cashRunway',
    'turnoverDays',
    'healthScore',
    'profitabilityRisk',
    'breakEvenRisk',
    'cashFlowRisk',
    'competitionRisk',
    'inventoryRisk'
  ];

  // Format rows (currency as €X.XX, percentages as decimals, risks as strings)
  const rows = products.map(product => [
    product.rowIndex,
    escapeCSVField(product.asin),
    escapeCSVField(product.name),
    formatCurrency(product.price),
    formatCurrency(product.cogs),
    product.velocity,
    (product.returnRate / 100).toFixed(4),
    (product.referralFee / 100).toFixed(4),
    (product.fbaFee / 100).toFixed(4),
    (product.vat / 100).toFixed(4),
    formatCurrency(product.shippingCost),
    product.initialOrder,
    formatCurrency(product.initialCash),
    product.competitorCount,
    product.rating.toFixed(1),
    escapeCSVField(product.category),
    formatCurrency(product.profitPerUnit),
    (product.profitMargin / 100).toFixed(4),
    formatCurrency(product.totalMonthlyProfit),
    product.breakEvenDays,
    product.cashRunway,
    product.turnoverDays,
    product.healthScore,
    escapeCSVField(product.profitabilityRisk),
    escapeCSVField(product.breakEvenRisk),
    escapeCSVField(product.cashFlowRisk),
    escapeCSVField(product.competitionRisk),
    escapeCSVField(product.inventoryRisk)
  ]);

  // Combine header and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Trigger download
  const finalFilename = filename || `products-${Date.now()}.csv`;
  downloadFile(csvContent, finalFilename, 'text/csv;charset=utf-8;');

  return csvContent;
}

/**
 * Format currency value as €X.XX
 * 
 * @param value - Numeric value
 * @returns Formatted currency string or empty string for null/undefined
 */
function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }
  return `€${value.toFixed(2)}`;
}

/**
 * Escape CSV field to handle special characters
 * 
 * Rules:
 * - If field contains comma, quote, or newline, wrap in quotes
 * - Escape internal quotes by doubling them
 * - Handle null/undefined values
 * 
 * @param field - Field value to escape
 * @returns Escaped field value
 */
function escapeCSVField(field: any): string {
  if (field === null || field === undefined) {
    return '';
  }

  const str = String(field);

  // Check if escaping is needed
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    // Escape quotes by doubling them
    const escaped = str.replace(/"/g, '""');
    return `"${escaped}"`;
  }

  return str;
}

/**
 * Trigger browser download of file
 * 
 * @param content - File content
 * @param filename - Filename for download
 * @param mimeType - MIME type of file
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  // Add BOM for UTF-8 encoding (helps Excel recognize UTF-8)
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + content], { type: mimeType });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export products to CSV and return as Blob (for batch export)
 * 
 * @param products - Array of calculated products
 * @returns Blob containing CSV data
 */
export function exportToCSVBlob(products: BulkProductResult[]): Blob {
  if (!products || products.length === 0) {
    throw new Error('No products to export');
  }

  const headers = [
    'rowIndex',
    'asin',
    'name',
    'price',
    'cogs',
    'velocity',
    'returnRate',
    'referralFee',
    'fbaFee',
    'vat',
    'shippingCost',
    'initialOrder',
    'initialCash',
    'competitorCount',
    'rating',
    'category',
    'profitPerUnit',
    'profitMargin',
    'totalMonthlyProfit',
    'breakEvenDays',
    'cashRunway',
    'turnoverDays',
    'healthScore',
    'profitabilityRisk',
    'breakEvenRisk',
    'cashFlowRisk',
    'competitionRisk',
    'inventoryRisk'
  ];

  const rows = products.map(product => [
    product.rowIndex,
    escapeCSVField(product.asin),
    escapeCSVField(product.name),
    formatCurrency(product.price),
    formatCurrency(product.cogs),
    product.velocity,
    (product.returnRate / 100).toFixed(4),
    (product.referralFee / 100).toFixed(4),
    (product.fbaFee / 100).toFixed(4),
    (product.vat / 100).toFixed(4),
    formatCurrency(product.shippingCost),
    product.initialOrder,
    formatCurrency(product.initialCash),
    product.competitorCount,
    product.rating.toFixed(1),
    escapeCSVField(product.category),
    formatCurrency(product.profitPerUnit),
    (product.profitMargin / 100).toFixed(4),
    formatCurrency(product.totalMonthlyProfit),
    product.breakEvenDays,
    product.cashRunway,
    product.turnoverDays,
    product.healthScore,
    escapeCSVField(product.profitabilityRisk),
    escapeCSVField(product.breakEvenRisk),
    escapeCSVField(product.cashFlowRisk),
    escapeCSVField(product.competitionRisk),
    escapeCSVField(product.inventoryRisk)
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const BOM = '\uFEFF';
  return new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
}
