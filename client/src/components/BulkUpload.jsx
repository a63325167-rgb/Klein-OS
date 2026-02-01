// client/src/components/BulkUpload.js

import React, { useState, useCallback, useRef } from 'react';
import { Upload, Download, FileText, Copy, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

// Import Phase 1 & 2 utilities (adjust paths as needed)
// These should be imported from your backend or utils
const parseUploadFile = async (file) => {
  // This is a placeholder - replace with actual Phase 1 parser
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
          // Calculated fields (simplified - replace with actual calculations)
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

const generateAnalytics = (products) => {
  const totalProducts = products.length;
  const totalMonthlyProfit = products.reduce((sum, p) => sum + (p.totalMonthlyProfit || 0), 0);
  const averageProfitMargin = products.reduce((sum, p) => sum + (p.profitMargin || 0), 0) / totalProducts;
  const averageHealthScore = products.reduce((sum, p) => sum + (p.healthScore || 0), 0) / totalProducts;
  
  return {
    summary: {
      totalProducts,
      totalMonthlyProfit,
      averageProfitMargin,
      averageHealthScore
    },
    riskDistribution: {
      red: products.filter(p => p.profitabilityRisk === 'red').length,
      yellow: products.filter(p => p.profitabilityRisk === 'yellow').length,
      green: products.filter(p => p.profitabilityRisk === 'green').length
    }
  };
};

const BulkUpload = ({ className = '' }) => {
  // State management
  const [uploadedFile, setUploadedFile] = useState(null);
  const [parsedProducts, setParsedProducts] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef(null);

  // ============================================
  // FILE HANDLING
  // ============================================

  const detectFileType = (file) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension === 'csv') return 'csv';
    if (extension === 'xlsx' || extension === 'xls') return 'excel';
    return 'invalid';
  };

  const handleFileSelect = async (file) => {
    setError(null);
    setLoading(true);

    try {
      // Validate file type
      const fileType = detectFileType(file);
      if (fileType === 'invalid') {
        throw new Error('Only CSV and Excel files are supported');
      }

      setUploadedFile(file);

      // Parse file
      const products = await parseUploadFile(file);
      
      if (!products || products.length === 0) {
        throw new Error('No valid products found in file');
      }

      setParsedProducts(products);
      setCurrentPage(0);
      toast.success('File uploaded and parsed successfully');
    } catch (err) {
      const errorMessage = err.message || 'Error parsing file';
      setError(`Error processing file: ${errorMessage}`);
      toast.error(errorMessage);
      setParsedProducts(null);
    } finally {
      setLoading(false);
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

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleClearFile = () => {
    setUploadedFile(null);
    setParsedProducts(null);
    setError(null);
    setCurrentPage(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
    if (!parsedProducts) return [];

    const sorted = [...parsedProducts].sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      // Handle string comparison
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

  const totalPages = parsedProducts ? Math.ceil(parsedProducts.length / pageSize) : 0;

  // ============================================
  // EXPORT HANDLERS
  // ============================================

  const handleExportCSV = () => {
    if (!parsedProducts) return;
    try {
      // Simple CSV export
      const headers = ['ASIN', 'Name', 'Price', 'Profit/Unit', 'Margin %', 'Health Score'];
      const rows = parsedProducts.map(p => [
        p.asin,
        p.name,
        p.price.toFixed(2),
        p.profitPerUnit.toFixed(2),
        p.profitMargin.toFixed(2),
        p.healthScore.toFixed(0)
      ]);
      
      const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `products-export-${Date.now()}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success('CSV downloaded successfully');
    } catch (err) {
      toast.error(`CSV export failed: ${err.message}`);
    }
  };

  const handleExportPDF = async () => {
    if (!parsedProducts) return;
    toast.info('PDF export feature coming soon');
  };

  const handleExportJSON = () => {
    if (!parsedProducts) return;
    try {
      const analytics = generateAnalytics(parsedProducts);
      const jsonContent = JSON.stringify(analytics, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('JSON downloaded successfully');
    } catch (err) {
      toast.error(`JSON export failed: ${err.message}`);
    }
  };

  const handleCopySummary = () => {
    if (!parsedProducts) return;
    try {
      const analytics = generateAnalytics(parsedProducts);
      const summary = `
StoreHero - Product Analysis Summary

Total Products: ${analytics.summary.totalProducts}
Total Monthly Profit: €${analytics.summary.totalMonthlyProfit.toFixed(2)}
Average Profit Margin: ${analytics.summary.averageProfitMargin.toFixed(2)}%
Average Health Score: ${analytics.summary.averageHealthScore.toFixed(0)}/100

Risk Distribution:
- Red: ${analytics.riskDistribution.red}
- Yellow: ${analytics.riskDistribution.yellow}
- Green: ${analytics.riskDistribution.green}
      `.trim();

      navigator.clipboard.writeText(summary);
      toast.success('Summary copied to clipboard');
    } catch (err) {
      toast.error(`Copy failed: ${err.message}`);
    }
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
    const risks = [
      product.profitabilityRisk,
      product.breakEvenRisk,
      product.cashFlowRisk,
      product.competitionRisk,
      product.inventoryRisk
    ];

    const redCount = risks.filter(r => r === 'red').length;
    const yellowCount = risks.filter(r => r === 'yellow').length;

    if (redCount >= 3) return { text: '🔴 High Risk', color: 'text-red-600 dark:text-red-400' };
    if (redCount >= 1 || yellowCount >= 3) return { text: '🟡 Medium Risk', color: 'text-yellow-600 dark:text-yellow-400' };
    return { text: '🟢 Low Risk', color: 'text-green-600 dark:text-green-400' };
  };

  // ============================================
  // RENDER
  // ============================================

  const analytics = parsedProducts ? generateAnalytics(parsedProducts) : null;

  return (
    <div className={`bulk-upload-container p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Bulk Product Analysis
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload your product data to analyze profitability, risks, and performance metrics
        </p>
      </div>

      {/* 1. FILE UPLOAD AREA */}
      <div className="mb-6">
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-all duration-200
            ${dragActive 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
            }
            ${uploadedFile ? 'bg-gray-50 dark:bg-gray-800' : ''}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {loading ? (
            <div className="flex flex-col items-center">
              <Loader className="w-12 h-12 text-blue-500 animate-spin mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Processing file...</p>
            </div>
          ) : uploadedFile ? (
            <div className="flex flex-col items-center">
              <FileText className="w-12 h-12 text-green-500 mb-4" />
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {uploadedFile.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {(uploadedFile.size / 1024).toFixed(2)} KB
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearFile();
                }}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                Clear and upload new file
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Drop CSV/Excel file here or click to select
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Supports .csv, .xlsx, .xls files
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* 2. PREVIEW TABLE */}
      {parsedProducts && parsedProducts.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            Data Preview
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Preview of 5 / {parsedProducts.length} rows
          </p>
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">ASIN</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">COGS</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Velocity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Category</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {parsedProducts.slice(0, 5).map((product, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{product.asin}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{product.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">€{product.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">€{product.cogs.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{product.velocity}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{product.category || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. SUMMARY METRICS STRIP */}
      {analytics && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            Summary Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Products */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Products</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {analytics.summary.totalProducts}
              </p>
            </div>

            {/* Card 2: Total Monthly Profit */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Monthly Profit</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                €{analytics.summary.totalMonthlyProfit.toFixed(2)}
              </p>
            </div>

            {/* Card 3: Average Profit Margin */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Profit Margin</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {analytics.summary.averageProfitMargin.toFixed(2)}%
              </p>
            </div>

            {/* Card 4: Average Health Score */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Health Score</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {analytics.summary.averageHealthScore.toFixed(0)}/100
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. FULL RESULTS TABLE */}
      {parsedProducts && parsedProducts.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              All Products ({parsedProducts.length})
            </h2>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">Show:</label>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(0);
                }}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => handleSort('asin')}
                  >
                    ASIN {sortBy === 'asin' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => handleSort('name')}
                  >
                    Name {sortBy === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => handleSort('price')}
                  >
                    Price {sortBy === 'price' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => handleSort('profitPerUnit')}
                  >
                    Profit/Unit {sortBy === 'profitPerUnit' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => handleSort('profitMargin')}
                  >
                    Margin {sortBy === 'profitMargin' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => handleSort('healthScore')}
                  >
                    Health Score {sortBy === 'healthScore' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Risk Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {getPaginatedProducts().map((product, index) => {
                  const riskBadge = getRiskBadge(product);
                  return (
                    <tr 
                      key={index} 
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${getHealthScoreColor(product.healthScore)}`}
                    >
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{product.asin}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {product.name.length > 40 ? product.name.substring(0, 37) + '...' : product.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">€{product.price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                        €{product.profitPerUnit.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {product.profitMargin.toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                        {product.healthScore.toFixed(0)}
                      </td>
                      <td className={`px-4 py-3 text-sm font-medium ${riskBadge.color}`}>
                        {riskBadge.text}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, parsedProducts.length)} of {parsedProducts.length} products
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. EXPORT BUTTONS */}
      {parsedProducts && parsedProducts.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            Export Options
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={handleExportCSV}
              className="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition-colors"
            >
              <Download className="w-5 h-5 mr-2" />
              Download CSV
            </button>

            <button
              onClick={handleExportPDF}
              className="flex items-center justify-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow transition-colors"
            >
              <FileText className="w-5 h-5 mr-2" />
              Download PDF
            </button>

            <button
              onClick={handleExportJSON}
              className="flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow transition-colors"
            >
              <Download className="w-5 h-5 mr-2" />
              Download JSON
            </button>

            <button
              onClick={handleCopySummary}
              className="flex items-center justify-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow transition-colors"
            >
              <Copy className="w-5 h-5 mr-2" />
              Copy Summary
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkUpload;
