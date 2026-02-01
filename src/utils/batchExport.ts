// src/utils/batchExport.ts

import { BulkProductResult } from '../types/upload';
import { exportToCSVBlob } from './exportCSV';
import { exportToPDFBlob } from './exportPDF';
import { generateAnalytics } from './exportAnalytics';
import { generateHTMLReport } from './generateReport';

/**
 * Export format types
 */
export type ExportFormat = 'csv' | 'pdf' | 'json' | 'html';

/**
 * Batch export options
 */
export interface BatchExportOptions {
  formats: ExportFormat[];
  filenamePrefix?: string;
  zipFiles?: boolean;
}

/**
 * Export result for a single format
 */
export interface ExportResult {
  format: ExportFormat;
  filename: string;
  success: boolean;
  error?: string;
  blob?: Blob;
}

/**
 * Export products to multiple formats simultaneously
 * 
 * @param products - Array of calculated products
 * @param formats - Array of export formats to generate
 * @returns Promise resolving when all exports complete
 */
export async function exportAll(
  products: BulkProductResult[],
  formats: ExportFormat[]
): Promise<ExportResult[]> {
  if (!products || products.length === 0) {
    throw new Error('No products to export');
  }

  if (!formats || formats.length === 0) {
    throw new Error('No export formats specified');
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const results: ExportResult[] = [];

  // Export each format
  for (const format of formats) {
    try {
      const result = await exportSingleFormat(products, format, timestamp);
      results.push(result);
    } catch (error) {
      results.push({
        format,
        filename: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return results;
}

/**
 * Export products to a single format
 * 
 * @param products - Array of calculated products
 * @param format - Export format
 * @param timestamp - Timestamp for filename
 * @returns Export result
 */
async function exportSingleFormat(
  products: BulkProductResult[],
  format: ExportFormat,
  timestamp: string
): Promise<ExportResult> {
  let blob: Blob;
  let filename: string;

  switch (format) {
    case 'csv':
      blob = exportToCSVBlob(products);
      filename = `products_export_${timestamp}.csv`;
      break;

    case 'pdf':
      blob = await exportToPDFBlob(products);
      filename = `products_report_${timestamp}.pdf`;
      break;

    case 'json':
      const analytics = generateAnalytics(products);
      const jsonContent = JSON.stringify(analytics, null, 2);
      blob = new Blob([jsonContent], { type: 'application/json' });
      filename = `analytics_${timestamp}.json`;
      break;

    case 'html':
      const html = generateHTMLReport(products);
      blob = new Blob([html], { type: 'text/html' });
      filename = `report_${timestamp}.html`;
      break;

    default:
      throw new Error(`Unsupported export format: ${format}`);
  }

  // Trigger download
  downloadBlob(blob, filename);

  return {
    format,
    filename,
    success: true,
    blob
  };
}

/**
 * Download blob as file
 * 
 * @param blob - Blob to download
 * @param filename - Filename for download
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Export products with progress tracking
 * 
 * @param products - Array of calculated products
 * @param formats - Array of export formats
 * @param onProgress - Progress callback (format, progress 0-1)
 * @returns Promise resolving to export results
 */
export async function exportWithProgress(
  products: BulkProductResult[],
  formats: ExportFormat[],
  onProgress?: (format: ExportFormat, progress: number) => void
): Promise<ExportResult[]> {
  if (!products || products.length === 0) {
    throw new Error('No products to export');
  }

  if (!formats || formats.length === 0) {
    throw new Error('No export formats specified');
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const results: ExportResult[] = [];

  for (let i = 0; i < formats.length; i++) {
    const format = formats[i];

    try {
      // Report start
      if (onProgress) {
        onProgress(format, 0);
      }

      // Simulate progress for user feedback
      const progressInterval = setInterval(() => {
        if (onProgress) {
          onProgress(format, 0.5);
        }
      }, 100);

      const result = await exportSingleFormat(products, format, timestamp);
      clearInterval(progressInterval);

      // Report completion
      if (onProgress) {
        onProgress(format, 1);
      }

      results.push(result);
    } catch (error) {
      if (onProgress) {
        onProgress(format, 1);
      }

      results.push({
        format,
        filename: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return results;
}

/**
 * Create a ZIP file containing all exports
 * Note: Requires JSZip library (not implemented here, placeholder for future)
 * 
 * @param products - Array of calculated products
 * @param formats - Array of export formats
 * @returns Promise resolving to ZIP blob
 */
export async function exportAsZip(
  products: BulkProductResult[],
  formats: ExportFormat[]
): Promise<Blob> {
  // This would require JSZip library
  // For now, we'll just export files individually
  throw new Error('ZIP export not yet implemented. Use exportAll() to download files individually.');
}

/**
 * Get file extension for format
 * 
 * @param format - Export format
 * @returns File extension
 */
export function getFileExtension(format: ExportFormat): string {
  switch (format) {
    case 'csv': return 'csv';
    case 'pdf': return 'pdf';
    case 'json': return 'json';
    case 'html': return 'html';
    default: return 'txt';
  }
}

/**
 * Get MIME type for format
 * 
 * @param format - Export format
 * @returns MIME type
 */
export function getMimeType(format: ExportFormat): string {
  switch (format) {
    case 'csv': return 'text/csv';
    case 'pdf': return 'application/pdf';
    case 'json': return 'application/json';
    case 'html': return 'text/html';
    default: return 'text/plain';
  }
}

/**
 * Validate export formats
 * 
 * @param formats - Array of formats to validate
 * @returns True if all formats are valid
 */
export function validateFormats(formats: string[]): formats is ExportFormat[] {
  const validFormats: ExportFormat[] = ['csv', 'pdf', 'json', 'html'];
  return formats.every(format => validFormats.includes(format as ExportFormat));
}
