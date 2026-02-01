import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Package, TrendingUp, AlertCircle } from 'lucide-react';
import UploadWizard from '../components/upload/UploadWizard';
import BulkProductsTable from '../components/products/BulkProductsTable';
import { calculateBulkProducts, downloadCSV } from '../utils/bulkCalculations';

/**
 * Products Page (B7)
 * 
 * Main page for bulk product management:
 * - Bulk upload via CSV/Excel
 * - Product portfolio view
 * - Export functionality
 * - Portfolio analytics
 */

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [showWizard, setShowWizard] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load products from localStorage on mount
  useEffect(() => {
    const savedProducts = localStorage.getItem('bulk_products');
    if (savedProducts) {
      try {
        const parsed = JSON.parse(savedProducts);
        setProducts(parsed);
      } catch (err) {
        console.error('Failed to load saved products:', err);
      }
    }
  }, []);

  // Save products to localStorage when changed
  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem('bulk_products', JSON.stringify(products));
    }
  }, [products]);

  // Handle upload completion
  const handleUploadComplete = (uploadedRows) => {
    setIsLoading(true);
    
    try {
      // Calculate all metrics for uploaded products
      const calculatedProducts = calculateBulkProducts(uploadedRows);
      
      // Merge with existing products (avoid duplicates)
      const existingASINs = products.map(p => p.asin);
      const newProducts = calculatedProducts.filter(p => !existingASINs.includes(p.asin));
      
      setProducts([...products, ...newProducts]);
      setShowWizard(false);
      
      // Show success message
      if (newProducts.length < uploadedRows.length) {
        const duplicates = uploadedRows.length - newProducts.length;
        alert(`Imported ${newProducts.length} new products. ${duplicates} duplicates were skipped.`);
      }
    } catch (err) {
      console.error('Failed to process products:', err);
      alert(`Error processing products: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle export
  const handleExport = (format) => {
    if (format === 'csv') {
      downloadCSV(products);
    } else if (format === 'pdf') {
      // PDF export would be implemented here
      alert('PDF export coming soon! Use CSV export for now.');
    }
  };

  // Get existing ASINs for duplicate detection
  const existingASINs = products.map(p => p.asin);

  // Clear all products
  const handleClearAll = () => {
    if (confirm(`Are you sure you want to delete all ${products.length} products? This cannot be undone.`)) {
      setProducts([]);
      localStorage.removeItem('bulk_products');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
              Product Portfolio
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage and analyze your FBA products in bulk
            </p>
          </div>

          <div className="flex gap-3">
            {products.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => setShowWizard(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Bulk Upload
            </button>
          </div>
        </div>

        {/* Content */}
        {products.length > 0 ? (
          <BulkProductsTable results={products} onExport={handleExport} />
        ) : (
          <EmptyState onUploadClick={() => setShowWizard(true)} />
        )}

        {/* Upload Wizard Modal */}
        {showWizard && (
          <UploadWizard
            onComplete={handleUploadComplete}
            onCancel={() => setShowWizard(false)}
            existingASINs={existingASINs}
          />
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-xl">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-slate-700 dark:text-slate-300 font-semibold">
                Processing products...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Empty State Component
 */
const EmptyState = ({ onUploadClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-12 text-center"
    >
      <div className="max-w-md mx-auto space-y-6">
        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
          <Package className="w-10 h-10 text-blue-600 dark:text-blue-400" />
        </div>

        <div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
            No Products Yet
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Start by uploading your product data via CSV or Excel
          </p>
        </div>

        <button
          onClick={onUploadClick}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
        >
          <Upload className="w-5 h-5" />
          Upload Products
        </button>

        {/* Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 text-left">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
            <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400 mb-2" />
            <h4 className="font-semibold text-slate-800 dark:text-white mb-1 text-sm">
              Bulk Analysis
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Import 50-500 products at once
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
            <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
            <h4 className="font-semibold text-slate-800 dark:text-white mb-1 text-sm">
              Auto Calculations
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              All metrics calculated instantly
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
            <Package className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2" />
            <h4 className="font-semibold text-slate-800 dark:text-white mb-1 text-sm">
              Portfolio View
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Compare and rank products
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-left">
          <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
            📋 How it works:
          </p>
          <ol className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
            <li>1. Download CSV or Excel template</li>
            <li>2. Fill in your product data</li>
            <li>3. Upload and validate</li>
            <li>4. Review and import</li>
            <li>5. Analyze your portfolio</li>
          </ol>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductsPage;
