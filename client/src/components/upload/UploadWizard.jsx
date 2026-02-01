import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Upload, CheckCircle, AlertTriangle, X, FileText, Table } from 'lucide-react';
import { downloadTemplate } from '../../utils/uploadTemplate';
import { parseUploadFile, formatParseResultSummary } from '../../utils/uploadParser';

/**
 * Upload Wizard Component (B7)
 * 
 * 5-step wizard for bulk product upload:
 * 1. Download Template
 * 2. Upload File
 * 3. Validate Data
 * 4. Review Products
 * 5. Complete
 */

const WIZARD_STEPS = {
  DOWNLOAD: 'download',
  UPLOAD: 'upload',
  VALIDATE: 'validate',
  REVIEW: 'review',
  COMPLETE: 'complete'
};

const UploadWizard = ({ onComplete, onCancel, existingASINs = [] }) => {
  const [step, setStep] = useState(WIZARD_STEPS.DOWNLOAD);
  const [file, setFile] = useState(null);
  const [parseResult, setParseResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle template download
  const handleDownloadTemplate = (format) => {
    try {
      const filename = downloadTemplate(format);
      // Auto-advance to upload step after download
      setTimeout(() => setStep(WIZARD_STEPS.UPLOAD), 500);
    } catch (err) {
      setError(`Failed to download template: ${err.message}`);
    }
  };

  // Handle file selection
  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setIsLoading(true);

    try {
      const result = await parseUploadFile(selectedFile, existingASINs);
      setParseResult(result);
      
      // Auto-advance based on results
      if (result.errors.length === 0 && result.warnings.length === 0) {
        setStep(WIZARD_STEPS.REVIEW);
      } else {
        setStep(WIZARD_STEPS.VALIDATE);
      }
    } catch (err) {
      setError(err.message);
      setParseResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      // Simulate file input change
      handleFileSelect({ target: { files: [droppedFile] } });
    }
  };

  // Handle import confirmation
  const handleConfirmImport = () => {
    if (parseResult?.rows) {
      onComplete(parseResult.rows);
      setStep(WIZARD_STEPS.COMPLETE);
    }
  };

  // Get progress percentage
  const getProgress = () => {
    const steps = Object.values(WIZARD_STEPS);
    const currentIndex = steps.indexOf(step);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Bulk Product Upload
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex justify-between mb-2 text-xs font-semibold">
            <span className={step === WIZARD_STEPS.DOWNLOAD ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}>
              1. Download
            </span>
            <span className={step === WIZARD_STEPS.UPLOAD ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}>
              2. Upload
            </span>
            <span className={step === WIZARD_STEPS.VALIDATE ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}>
              3. Validate
            </span>
            <span className={step === WIZARD_STEPS.REVIEW ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}>
              4. Review
            </span>
            <span className={step === WIZARD_STEPS.COMPLETE ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}>
              5. Complete
            </span>
          </div>
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-600 dark:bg-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${getProgress()}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <AnimatePresence mode="wait">
            {/* STEP 1: Download Template */}
            {step === WIZARD_STEPS.DOWNLOAD && (
              <motion.div
                key="download"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                    Step 1: Download Template
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Start by downloading the CSV or Excel template. Fill it with your product data, then upload it here.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleDownloadTemplate('csv')}
                    className="p-6 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
                  >
                    <FileText className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
                    <p className="font-semibold text-slate-800 dark:text-white mb-1">Download CSV</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Simple format, works with Excel, Google Sheets
                    </p>
                  </button>

                  <button
                    onClick={() => handleDownloadTemplate('xlsx')}
                    className="p-6 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors group"
                  >
                    <Table className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-3" />
                    <p className="font-semibold text-slate-800 dark:text-white mb-1">Download Excel</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Full formatting, includes instructions
                    </p>
                  </button>
                </div>

                <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    📋 Template includes:
                  </p>
                  <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    <li>• All required fields (ASIN, Name, Price, COGS, Sales Velocity)</li>
                    <li>• Optional fields with defaults (Return Rate, Fees, VAT, etc.)</li>
                    <li>• Example row showing correct format</li>
                    <li>• Field descriptions and validation rules</li>
                  </ul>
                </div>

                <button
                  onClick={() => setStep(WIZARD_STEPS.UPLOAD)}
                  className="w-full px-4 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg font-semibold transition-colors"
                >
                  Skip to Upload →
                </button>
              </motion.div>
            )}

            {/* STEP 2: Upload File */}
            {step === WIZARD_STEPS.UPLOAD && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                    Step 2: Upload File
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Select your CSV or Excel file with product data.
                  </p>
                </div>

                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-12 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer"
                >
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-input"
                    disabled={isLoading}
                  />
                  <label htmlFor="file-input" className="cursor-pointer">
                    <Upload className="w-16 h-16 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                    <p className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      {isLoading ? 'Processing...' : 'Select CSV or Excel File'}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      or drag and drop here
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                      Maximum 500 rows per upload
                    </p>
                  </label>
                </div>

                {file && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <div className="flex-1">
                      <p className="font-semibold text-green-800 dark:text-green-300">
                        File selected: {file.name}
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-800 dark:text-red-300 mb-1">
                        Upload Error
                      </p>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {error}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(WIZARD_STEPS.DOWNLOAD)}
                    className="flex-1 px-4 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg font-semibold transition-colors"
                  >
                    ← Back
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Validate */}
            {step === WIZARD_STEPS.VALIDATE && parseResult && (
              <motion.div
                key="validate"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                    Step 3: Validation Results
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Review validation results before importing.
                  </p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Rows</p>
                    <p className="text-3xl font-bold text-slate-800 dark:text-white">
                      {parseResult.totalRows}
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                    <p className="text-xs text-green-600 dark:text-green-400 mb-1">Valid</p>
                    <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                      {parseResult.validRows}
                    </p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                    <p className="text-xs text-red-600 dark:text-red-400 mb-1">Errors</p>
                    <p className="text-3xl font-bold text-red-700 dark:text-red-300">
                      {parseResult.errorRows}
                    </p>
                  </div>
                </div>

                {/* Errors */}
                {parseResult.errors.length > 0 && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                    <p className="font-semibold text-red-800 dark:text-red-300 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      {parseResult.errorRows} rows have errors (will be skipped):
                    </p>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {parseResult.errors.slice(0, 10).map((error, idx) => (
                        <div key={idx} className="text-sm text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 rounded p-2">
                          <span className="font-semibold">Row {error.rowIndex}:</span> {error.field} - {error.error}
                        </div>
                      ))}
                      {parseResult.errors.length > 10 && (
                        <p className="text-sm text-red-600 dark:text-red-400 italic">
                          ... and {parseResult.errors.length - 10} more errors
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Warnings */}
                {parseResult.warnings.length > 0 && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                    <p className="font-semibold text-yellow-800 dark:text-yellow-300 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      {parseResult.warnings.length} warnings:
                    </p>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {parseResult.warnings.map((warning, idx) => (
                        <p key={idx} className="text-sm text-yellow-700 dark:text-yellow-300">
                          • {warning}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Duplicates */}
                {parseResult.duplicates.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                    <p className="font-semibold text-blue-800 dark:text-blue-300 mb-3">
                      🔄 {parseResult.duplicates.length} duplicate ASINs detected:
                    </p>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {parseResult.duplicates.map((dup, idx) => (
                        <p key={idx} className="text-sm text-blue-700 dark:text-blue-300">
                          • Row {dup.rowIndex}: {dup.asin} (already in system)
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(WIZARD_STEPS.UPLOAD)}
                    className="flex-1 px-4 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg font-semibold transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setStep(WIZARD_STEPS.REVIEW)}
                    disabled={parseResult.validRows === 0}
                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold text-white transition-colors"
                  >
                    Review {parseResult.validRows} Products →
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Review */}
            {step === WIZARD_STEPS.REVIEW && parseResult && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                    Step 4: Review Import
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Ready to import {parseResult.validRows} products. All metrics will be calculated automatically.
                  </p>
                </div>

                {/* Preview Table */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800">
                        <tr>
                          <th className="text-left px-4 py-3 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300">
                            ASIN
                          </th>
                          <th className="text-left px-4 py-3 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300">
                            Product
                          </th>
                          <th className="text-right px-4 py-3 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300">
                            Price
                          </th>
                          <th className="text-right px-4 py-3 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300">
                            Sales/mo
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {parseResult.rows.slice(0, 20).map((row, idx) => (
                          <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td className="px-4 py-2 text-slate-600 dark:text-slate-400 font-mono text-xs">
                              {row.asin}
                            </td>
                            <td className="px-4 py-2 text-slate-700 dark:text-slate-300 truncate max-w-xs">
                              {row.name}
                            </td>
                            <td className="px-4 py-2 text-right text-slate-700 dark:text-slate-300">
                              €{row.price.toFixed(2)}
                            </td>
                            <td className="px-4 py-2 text-right text-slate-700 dark:text-slate-300">
                              {row.velocity}
                            </td>
                          </tr>
                        ))}
                        {parseResult.rows.length > 20 && (
                          <tr>
                            <td colSpan={4} className="px-4 py-3 text-center text-slate-500 dark:text-slate-400 italic">
                              ... and {parseResult.rows.length - 20} more products
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(WIZARD_STEPS.VALIDATE)}
                    className="flex-1 px-4 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg font-semibold transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleConfirmImport}
                    className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-white transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Import {parseResult.validRows} Products
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 5: Complete */}
            {step === WIZARD_STEPS.COMPLETE && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 space-y-6"
              >
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                    Import Complete!
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {parseResult?.validRows} products have been imported successfully.
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    All metrics (health scores, risks, cash flow, break-even) have been calculated automatically.
                  </p>
                </div>
                <button
                  onClick={onCancel}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-white transition-colors"
                >
                  View Products →
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default UploadWizard;
