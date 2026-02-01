import React, { useState } from 'react';
import { FileSpreadsheet, Loader2, CheckCircle } from 'lucide-react';

/**
 * Export CSV Button Component
 * Triggers CSV generation and download for bulk product data
 * 
 * Note: This uses the Phase 2 CSV export engine from src/utils/exportCSV.ts
 * which exports all 30 fields in the exact order specified.
 */
const ExportCSVButton = ({ products, fileName }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState(null);

  const handleExport = async () => {
    if (!products || products.length === 0) {
      setExportStatus({ type: 'error', message: 'No products to export' });
      setTimeout(() => setExportStatus(null), 3000);
      return;
    }

    setIsExporting(true);
    setExportStatus(null);

    try {
      // Dynamically import the export function to avoid bundling issues
      const { exportToCSV } = await import('../../../src/utils/exportCSV');
      
      // Export CSV (this will trigger download automatically)
      exportToCSV(products, fileName);
      
      setExportStatus({ type: 'success', message: `CSV exported successfully! (${products.length} products)` });
      setTimeout(() => setExportStatus(null), 3000);
    } catch (error) {
      console.error('CSV Export error:', error);
      setExportStatus({ type: 'error', message: `Export failed: ${error.message}` });
      setTimeout(() => setExportStatus(null), 5000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleExport}
        disabled={isExporting || !products || products.length === 0}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm
          transition-all duration-200 shadow-md
          ${isExporting || !products || products.length === 0
            ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
            : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-lg hover:scale-105'
          }
        `}
      >
        {isExporting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating CSV...
          </>
        ) : exportStatus?.type === 'success' ? (
          <>
            <CheckCircle className="w-4 h-4" />
            Exported!
          </>
        ) : (
          <>
            <FileSpreadsheet className="w-4 h-4" />
            📊 Export CSV
          </>
        )}
      </button>

      {/* Status message */}
      {exportStatus && (
        <div
          className={`
            absolute top-full mt-2 right-0 px-4 py-2 rounded-lg text-sm font-medium
            whitespace-nowrap shadow-lg z-10
            ${exportStatus.type === 'success'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700'
              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700'
            }
          `}
        >
          {exportStatus.message}
        </div>
      )}
    </div>
  );
};

export default ExportCSVButton;
