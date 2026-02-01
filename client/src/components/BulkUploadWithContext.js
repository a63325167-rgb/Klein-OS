// client/src/components/BulkUploadWithContext.js
// Updated BulkUpload component using global ProductsContext

import React, { useState, useCallback, useRef } from 'react';
import { Upload, Download, FileText, Copy, Loader, X } from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
// Import the context hook
import { useProducts } from '../contexts/ProductsContext';

// ============================================
// FILE PARSING UTILITY
// ============================================

const parseUploadFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        
        // Transform to BulkProductResult format
        const products = jsonData.map((row, index) => ({
          rowIndex: index + 1,
          asin: row.ASIN || row.asin || `ASIN${index}`,
          name: row.Name || row.name || row['Product Name'] || 'Unknown Product',
          price: parseFloat(row.Price || row.price || row['Selling Price (€)'] || 0),
          cogs: parseFloat(row.COGS || row.cogs || row['Cost (€)'] || 0),
          velocity: parseInt(row.Velocity || row.velocity || row['Units Sold'] || 0),
          returnRate: parseFloat(row.ReturnRate || row.returnRate || row['Return Rate'] || 5),
          referralFee: parseFloat(row.ReferralFee || row.referralFee || 15),
          fbaFee: parseFloat(row.FBAFee || row.fbaFee || 8),
          vat: parseFloat(row.VAT || row.vat || 19),
          shippingCost: parseFloat(row.ShippingCost || row.shippingCost || row['Delivery Cost (€)'] || 2),
          initialOrder: parseInt(row.InitialOrder || row.initialOrder || 60),
          initialCash: parseFloat(row.InitialCash || row.initialCash || 5000),
          competitorCount: parseInt(row.CompetitorCount || row.competitorCount || 10),
          rating: parseFloat(row.Rating || row.rating || 4.0),
          category: row.Category || row.category || 'Default',
          // Calculated fields
          profitPerUnit: 0,
          profitMargin: 0,
          totalMonthlyProfit: 0,
          breakEvenDays: 0,
          cashRunway: 0,
          turnoverDays: 0,
          healthScore: 50,
          profitabilityRisk: 'yellow',
          breakEvenRisk: 'yellow',
          cashFlowRisk: 'yellow',
          competitionRisk: 'yellow',
          inventoryRisk: 'yellow'
        }));
        
        // Calculate metrics for each product
        products.forEach(p => {
          p.profitPerUnit = p.price - p.cogs - (p.price * p.referralFee / 100) - p.fbaFee - p.shippingCost;
          p.profitMargin = p.price > 0 ? (p.profitPerUnit / p.price) * 100 : 0;
          p.totalMonthlyProfit = p.profitPerUnit * p.velocity;
          p.healthScore = Math.min(100, Math.max(0, 50 + p.profitMargin));
          
          // Update risk levels based on calculations
          p.profitabilityRisk = p.profitMargin >= 20 ? 'green' : p.profitMargin >= 10 ? 'yellow' : 'red';
        });
        
        resolve(products);
      } catch (err) {
        reject(new Error('Failed to parse file: ' + err.message));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

// ============================================
// MAIN COMPONENT
// ============================================

const BulkUploadWithContext = ({ className = '' }) => {
  // ✅ USE GLOBAL CONTEXT instead of local state
  const { 
    products: globalProducts,
    analytics: globalAnalytics,
    loading: globalLoading,
    error: globalError,
    setProducts,
    clearProducts,
    setError: setGlobalError,
    setLoading: setGlobalLoading
  } = useProducts();
  
  // Local UI state (not shared globally)
  const [uploadedFile, setUploadedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  
  const fileInputRef = useRef(null);
  
  // ============================================
  // FILE HANDLING
  // ============================================
  
  const detectFileType = (file) => {
    const extension = file.name.split('.').pop().toLowerCase();
    if (extension === 'csv') return 'csv';
    if (extension === 'xlsx' || extension === 'xls') return 'excel';
    return 'invalid';
  };
  
  const handleFileSelect = async (file) => {
    if (!file) return;
    
    const fileType = detectFileType(file);
    if (fileType === 'invalid') {
      setGlobalError('Only CSV and Excel files are supported');
      toast.error('Only CSV and Excel files are supported');
      return;
    }
    
    setUploadedFile(file);
    setGlobalLoading(true);
    setGlobalError(null);
    
    try {
      const parsed = await parseUploadFile(file);
      
      if (!parsed || parsed.length === 0) {
        throw new Error('No valid products found in file');
      }
      
      // ✅ UPDATE GLOBAL STATE (this makes data available to all tabs!)
      setProducts(parsed);
      
      toast.success(`Successfully uploaded ${parsed.length} products!`);
    } catch (err) {
      console.error('Parse error:', err);
      setGlobalError(err.message);
      toast.error(err.message);
    } finally {
      setGlobalLoading(false);
    }
  };
  
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);
  
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);
  
  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);
  
  const handleClearFile = () => {
    setUploadedFile(null);
    clearProducts(); // ✅ Clear global state
    setCurrentPage(0);
    toast.info('Products cleared');
  };
  
  // ============================================
  // SORTING & PAGINATION
  // ============================================
  
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };
  
  const getSortedProducts = () => {
    if (!globalProducts) return [];
    
    const sorted = [...globalProducts].sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    return sorted;
  };
  
  const getPaginatedProducts = () => {
    const sorted = getSortedProducts();
    const start = currentPage * pageSize;
    const end = start + pageSize;
    return sorted.slice(start, end);
  };
  
  const totalPages = globalProducts ? Math.ceil(globalProducts.length / pageSize) : 0;
  
  // ============================================
  // EXPORT FUNCTIONS
  // ============================================
  
  const handleExportCSV = () => {
    if (!globalProducts || globalProducts.length === 0) {
      toast.error('No products to export');
      return;
    }
    
    const headers = ['ASIN', 'Name', 'Price', 'Profit/Unit', 'Margin %', 'Health Score', 'Risk'];
    const rows = globalProducts.map(p => [
      p.asin,
      p.name,
      p.price.toFixed(2),
      p.profitPerUnit.toFixed(2),
      p.profitMargin.toFixed(2),
      p.healthScore.toFixed(0),
      p.profitabilityRisk
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products-export-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('CSV exported successfully');
  };
  
  const handleExportJSON = () => {
    if (!globalAnalytics) {
      toast.error('No analytics to export');
      return;
    }
    
    const jsonContent = JSON.stringify(globalAnalytics, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('JSON exported successfully');
  };
  
  const handleCopySummary = () => {
    if (!globalAnalytics) {
      toast.error('No summary to copy');
      return;
    }
    
    const summary = `
Product Analysis Summary
========================
Total Products: ${globalAnalytics.summary.totalProducts}
Total Monthly Profit: €${globalAnalytics.summary.totalMonthlyProfit.toFixed(2)}
Average Profit Margin: ${globalAnalytics.summary.averageProfitMargin.toFixed(2)}%
Average Health Score: ${globalAnalytics.summary.averageHealthScore.toFixed(0)}/100

Risk Distribution:
- High Risk (Red): ${globalAnalytics.riskDistribution.red}
- Medium Risk (Yellow): ${globalAnalytics.riskDistribution.yellow}
- Low Risk (Green): ${globalAnalytics.riskDistribution.green}
    `.trim();
    
    navigator.clipboard.writeText(summary);
    toast.success('Summary copied to clipboard');
  };
  
  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  
  const getHealthScoreColor = (score) => {
    if (score >= 70) return 'bg-green-50 dark:bg-green-900/20';
    if (score >= 40) return 'bg-yellow-50 dark:bg-yellow-900/20';
    return 'bg-red-50 dark:bg-red-900/20';
  };
  
  const getRiskBadge = (product) => {
    const risk = product.profitabilityRisk;
    if (risk === 'red') return { text: '🔴 High Risk', color: 'text-red-600 dark:text-red-400' };
    if (risk === 'yellow') return { text: '🟡 Medium Risk', color: 'text-yellow-600 dark:text-yellow-400' };
    return { text: '🟢 Low Risk', color: 'text-green-600 dark:text-green-400' };
  };
  
  // ============================================
  // RENDER
  // ============================================
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bulk Upload</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Upload CSV or Excel files for bulk product analysis
          </p>
        </div>
        
        {globalProducts && globalProducts.length > 0 && (
          <button
            onClick={handleClearFile}
            className="flex items-center px-4 py-2 text-red-600 dark:text-red-400 
              hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 mr-2" />
            Clear All
          </button>
        )}
      </div>
      
      {/* ✅ GLOBAL ERROR DISPLAY */}
      {globalError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 
          rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{globalError}</p>
        </div>
      )}
      
      {/* File Upload Area */}
      {!uploadedFile && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors
            ${dragActive 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
            }`}
        >
          <Upload className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Drop your file here or click to browse
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Supports CSV, XLSX, XLS files
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => handleFileSelect(e.target.files[0])}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium 
              rounded-lg shadow transition-colors"
          >
            Select File
          </button>
        </div>
      )}
      
      {/* Loading State */}
      {globalLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">Processing file...</span>
        </div>
      )}
      
      {/* ✅ DISPLAY GLOBAL PRODUCTS DATA */}
      {globalProducts && globalProducts.length > 0 && !globalLoading && (
        <>
          {/* File Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {uploadedFile?.name || 'Products Loaded'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {globalProducts.length} products • {uploadedFile ? (uploadedFile.size / 1024).toFixed(2) + ' KB' : 'From global state'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Summary Metrics (from global analytics) */}
          {globalAnalytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Products</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {globalAnalytics.summary.totalProducts}
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Monthly Profit</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                  €{globalAnalytics.summary.totalMonthlyProfit.toFixed(2)}
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Profit Margin</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                  {globalAnalytics.summary.averageProfitMargin.toFixed(2)}%
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Health Score</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                  {globalAnalytics.summary.averageHealthScore.toFixed(0)}/100
                </p>
              </div>
            </div>
          )}
          
          {/* Preview Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Preview (First 5 rows)
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Showing 5 of {globalProducts.length} products
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">ASIN</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Profit/Unit</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Margin</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {globalProducts.slice(0, 5).map((product, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{product.asin}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{product.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">€{product.price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">€{product.profitPerUnit.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{product.profitMargin.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Export Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={handleExportCSV}
              className="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 
                text-white font-medium rounded-lg shadow transition-colors"
            >
              <Download className="w-5 h-5 mr-2" />
              Download CSV
            </button>
            
            <button
              onClick={() => toast.info('PDF export coming soon')}
              className="flex items-center justify-center px-6 py-3 bg-red-600 hover:bg-red-700 
                text-white font-medium rounded-lg shadow transition-colors"
            >
              <Download className="w-5 h-5 mr-2" />
              Download PDF
            </button>
            
            <button
              onClick={handleExportJSON}
              className="flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 
                text-white font-medium rounded-lg shadow transition-colors"
            >
              <Download className="w-5 h-5 mr-2" />
              Download JSON
            </button>
            
            <button
              onClick={handleCopySummary}
              className="flex items-center justify-center px-6 py-3 bg-purple-600 hover:bg-purple-700 
                text-white font-medium rounded-lg shadow transition-colors"
            >
              <Copy className="w-5 h-5 mr-2" />
              Copy Summary
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default BulkUploadWithContext;
