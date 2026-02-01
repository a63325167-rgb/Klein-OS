import React, { useState } from 'react';
import { FileDown, Loader2, CheckCircle } from 'lucide-react';
import { exportAnalysisPDF } from '../../utils/pdfExport';

/**
 * Export PDF Button Component
 * Triggers PDF generation and download
 */
const ExportPDFButton = ({ result, userName = 'User' }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState(null);

  const handleExport = async () => {
    if (!result) return;

    setIsExporting(true);
    setExportStatus(null);

    try {
      const response = await exportAnalysisPDF(result, userName);
      
      if (response.success) {
        setExportStatus({ type: 'success', message: 'PDF exported successfully!' });
        setTimeout(() => setExportStatus(null), 3000);
      } else {
        setExportStatus({ type: 'error', message: `Export failed: ${response.error}` });
        setTimeout(() => setExportStatus(null), 5000);
      }
    } catch (error) {
      console.error('Export error:', error);
      setExportStatus({ type: 'error', message: 'Failed to generate PDF' });
      setTimeout(() => setExportStatus(null), 5000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleExport}
        disabled={isExporting || !result}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm
          transition-all duration-200 shadow-md
          ${isExporting || !result
            ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg hover:scale-105'
          }
        `}
      >
        {isExporting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating PDF...
          </>
        ) : exportStatus?.type === 'success' ? (
          <>
            <CheckCircle className="w-4 h-4" />
            Exported!
          </>
        ) : (
          <>
            <FileDown className="w-4 h-4" />
            📄 Export Analysis (PDF)
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

export default ExportPDFButton;
