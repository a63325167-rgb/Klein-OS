import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import {
  Upload,
  FileSpreadsheet,
  Download,
  X,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Loader
} from 'lucide-react';
import { processBulkData } from '../../utils/bulkAnalysis';

const BulkUploader = () => {
  const [uploadedData, setUploadedData] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const processExcelData = (data) => {
    // Use the enhanced bulk analysis service
    return processBulkData(data);
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
          
          setUploadedData(jsonData);
          
          // Process the data with enhanced service
          const processed = processExcelData(jsonData);
          
          if (!processed.success) {
            const errorMessages = processed.errors
              .filter(e => e.type === 'error')
              .map(e => e.message)
              .join('; ');
            setError(errorMessages || 'Failed to process file');
            setIsProcessing(false);
            return;
          }
          
          setAnalysisResults(processed.results);
          setIsProcessing(false);
        } catch (err) {
          setError('Failed to parse file. Please ensure it matches the template format.');
          setIsProcessing(false);
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (err) {
      setError('Failed to read file. Please try again.');
      setIsProcessing(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    maxFiles: 1
  });

  const downloadTemplate = () => {
    const template = [
      ['Product Name', 'Cost (€)', 'Selling Price (€)', 'Units Sold', 'Delivery Cost (€)', 'Conversion Rate (%)', 'Stock Left', 'Category', 'Country', 'Length (cm)', 'Width (cm)', 'Height (cm)', 'Weight (kg)'],
      ['Smart Lamp', 25, 69, 122, 3.5, 3.2, 42, 'Electronics', 'Germany', 30, 20, 6, 0.8],
      ['Bamboo Tray', 12, 29, 84, 2.8, 2.4, 10, 'Default', 'Germany', 32, 22, 4, 0.5],
      ['Foldable Desk', 45, 115, 56, 4.2, 4.1, 6, 'Default', 'Germany', 40, 28, 10, 1.2]
    ];

    const ws = XLSX.utils.aoa_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    XLSX.writeFile(wb, 'bulk_analysis_template.xlsx');
  };

  const calculateAggregates = () => {
    if (!analysisResults || analysisResults.length === 0) return null;

    // Import the aggregate calculation from bulk analysis
    const { calculateAggregates: calcAgg } = require('../../utils/bulkAnalysis');
    return calcAgg(analysisResults);
  };

  const aggregates = calculateAggregates();

  const getPerformanceTier = (margin) => {
    if (margin >= 20) return { tier: 'A', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' };
    if (margin >= 10) return { tier: 'B', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' };
    if (margin >= 5) return { tier: 'C', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30' };
    return { tier: 'D', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
            Bulk Product Analysis
          </h3>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={downloadTemplate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-lg font-medium shadow-lg"
        >
          <Download className="w-4 h-4" />
          Download Template
        </motion.button>
      </motion.div>

      {/* Upload zone */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/20'
            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-400 dark:hover:border-blue-600'
        }`}
      >
        <input {...getInputProps()} />
        
        <motion.div
          animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <Upload className={`w-16 h-16 ${isDragActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
          </div>
          
          <div>
            <p className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
              {isDragActive ? 'Drop your file here...' : 'Drag & drop your Excel file here'}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              or click to browse • Supports .xlsx, .xls, .csv
            </p>
          </div>
        </motion.div>

        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl flex items-center justify-center"
          >
            <div className="text-center">
              <Loader className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-3" />
              <p className="text-slate-800 dark:text-white font-medium">Processing your data...</p>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-4"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <div>
                <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 mt-1"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {analysisResults && aggregates && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-6"
          >
            {/* Aggregate metrics */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-xl font-bold text-slate-800 dark:text-white">Portfolio Summary</h4>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <BarChart3 className="w-4 h-4" />
                  {aggregates.productCount} Products Analyzed
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                  <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Total Revenue</div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-white">
                    {formatCurrency(aggregates.totalRevenue)}
                  </div>
                </div>
                <div className="bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-4">
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Costs</div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-white">
                    {formatCurrency(aggregates.totalCosts)}
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                  <div className="text-sm text-green-600 dark:text-green-400 mb-1">Net Profit</div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-white">
                    {formatCurrency(aggregates.totalProfit)}
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                  <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Avg Margin</div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-white">
                    {aggregates.avgMargin.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                  <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Avg ROI</div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-white">
                    {aggregates.avgROI.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Product comparison table */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-lg overflow-hidden">
              <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Product Performance Comparison</h4>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left text-sm font-semibold text-slate-600 dark:text-slate-400 pb-3 pr-4">Product</th>
                      <th className="text-right text-sm font-semibold text-slate-600 dark:text-slate-400 pb-3 px-4">Revenue</th>
                      <th className="text-right text-sm font-semibold text-slate-600 dark:text-slate-400 pb-3 px-4">Cost</th>
                      <th className="text-right text-sm font-semibold text-slate-600 dark:text-slate-400 pb-3 px-4">Profit</th>
                      <th className="text-right text-sm font-semibold text-slate-600 dark:text-slate-400 pb-3 px-4">Margin</th>
                      <th className="text-right text-sm font-semibold text-slate-600 dark:text-slate-400 pb-3 px-4">ROI</th>
                      <th className="text-center text-sm font-semibold text-slate-600 dark:text-slate-400 pb-3 pl-4">Tier</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysisResults.map((product, index) => {
                      const tier = getPerformanceTier(product.totals.profit_margin);
                      return (
                        <motion.tr
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-2">
                              {product.smallPackageCheck.isEligible && (
                                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                              )}
                              <span className="text-slate-800 dark:text-white font-medium">{product.input.product_name}</span>
                            </div>
                          </td>
                          <td className="text-right py-4 px-4 text-slate-800 dark:text-white font-medium">
                            {formatCurrency(product.input.selling_price)}
                          </td>
                          <td className="text-right py-4 px-4 text-slate-600 dark:text-slate-400">
                            {formatCurrency(product.totals.total_cost)}
                          </td>
                          <td className="text-right py-4 px-4 text-green-600 dark:text-green-400 font-semibold">
                            {formatCurrency(product.totals.net_profit)}
                          </td>
                          <td className="text-right py-4 px-4 text-slate-800 dark:text-white">
                            {product.totals.profit_margin.toFixed(1)}%
                          </td>
                          <td className="text-right py-4 px-4 text-blue-600 dark:text-blue-400">
                            {product.totals.roi_percent.toFixed(1)}%
                          </td>
                          <td className="text-center py-4 pl-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${tier.bg} ${tier.color}`}>
                              {tier.tier}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Clear button */}
            <div className="flex justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setAnalysisResults(null);
                  setUploadedData(null);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-medium transition-colors"
              >
                <X className="w-4 h-4" />
                Clear Results
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BulkUploader;
