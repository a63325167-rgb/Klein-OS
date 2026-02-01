/**
 * Bulk Upload Preview Table Component
 * 
 * Displays parsed CSV product data in a clean, professional table.
 * Shows essential information before proceeding to analysis.
 * 
 * Features:
 * - Sortable columns
 * - Scrollable table with sticky header
 * - Net profit and margin calculations
 * - Clear and view analytics actions
 * - Empty state handling
 * 
 * @component
 */

import React, { useState, useMemo } from 'react';
import { Trash2, BarChart3, Upload, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

// ============================================
// CALCULATION HELPERS
// ============================================

/**
 * Calculate net profit for a single product
 * Formula: (sellingPrice - cost - fbaFees) * quantity
 * 
 * @param {Object} product - Product object from CSV parser
 * @returns {number} Net profit amount
 */
function calculateNetProfit(product) {
  const { sellingPrice, cost, fbaFees, quantity } = product;
  const profitPerUnit = sellingPrice - cost - fbaFees;
  const netProfit = profitPerUnit * quantity;
  return parseFloat(netProfit.toFixed(2));
}

/**
 * Calculate profit margin percentage
 * Formula: ((sellingPrice - cost - fbaFees) / sellingPrice) * 100
 * 
 * @param {Object} product - Product object from CSV parser
 * @returns {number} Profit margin percentage (1 decimal)
 */
function calculateMargin(product) {
  const { sellingPrice, cost, fbaFees } = product;
  
  if (sellingPrice <= 0) return 0;
  
  const profitPerUnit = sellingPrice - cost - fbaFees;
  const margin = (profitPerUnit / sellingPrice) * 100;
  return parseFloat(margin.toFixed(1));
}

// ============================================
// FORMATTING HELPERS
// ============================================

/**
 * Format number as currency (EUR)
 */
function formatCurrency(value) {
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

/**
 * Format number with thousands separator
 */
function formatNumber(value) {
  return new Intl.NumberFormat('de-DE').format(value);
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function BulkUploadPreviewTable({ products = [], onClear, onViewAnalytics }) {
  const [sortConfig, setSortConfig] = useState({ key: 'netProfit', direction: 'desc' });
  const [showClearModal, setShowClearModal] = useState(false);

  // ============================================
  // SORTING LOGIC
  // ============================================

  const sortedProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    const sorted = [...products];

    sorted.sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.key) {
        case 'asin':
          aValue = a.asin;
          bValue = b.asin;
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        case 'cost':
          aValue = a.cost;
          bValue = b.cost;
          break;
        case 'sellingPrice':
          aValue = a.sellingPrice;
          bValue = b.sellingPrice;
          break;
        case 'quantity':
          aValue = a.quantity;
          bValue = b.quantity;
          break;
        case 'daysInStock':
          aValue = a.daysInStock ?? -1; // Put N/A at end when ascending
          bValue = b.daysInStock ?? -1;
          break;
        case 'netProfit':
          aValue = calculateNetProfit(a);
          bValue = calculateNetProfit(b);
          break;
        case 'margin':
          aValue = calculateMargin(a);
          bValue = calculateMargin(b);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }, [products, sortConfig]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleClearClick = () => {
    setShowClearModal(true);
  };

  const handleConfirmClear = () => {
    setShowClearModal(false);
    if (onClear) {
      onClear();
    }
  };

  const handleCancelClear = () => {
    setShowClearModal(false);
  };

  // ============================================
  // RENDER HELPERS
  // ============================================

  const renderSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="w-4 h-4 opacity-40" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="w-4 h-4" />
      : <ArrowDown className="w-4 h-4" />;
  };

  // ============================================
  // EMPTY STATE
  // ============================================

  if (!products || products.length === 0) {
    return (
      <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-12 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Upload className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
              No products imported yet
            </h3>
            <p className="text-[var(--color-text-muted)] mb-4">
              Upload a CSV file to begin analyzing your products.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <div className="space-y-4">
      {/* Header with count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">📊</span>
          <h3 className="text-lg font-semibold text-[var(--color-text)]">
            Imported: {formatNumber(products.length)} products
          </h3>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] overflow-hidden">
        <div className="overflow-x-auto">
          <div className="max-h-[600px] overflow-y-auto">
            <table className="w-full">
              {/* Table Header - Sticky */}
              <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0 z-10">
                <tr>
                  {/* ASIN */}
                  <th 
                    className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-text)] cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => handleSort('asin')}
                  >
                    <div className="flex items-center space-x-2">
                      <span>ASIN</span>
                      {renderSortIcon('asin')}
                    </div>
                  </th>

                  {/* Category */}
                  <th 
                    className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-text)] cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center space-x-2">
                      <span>Category</span>
                      {renderSortIcon('category')}
                    </div>
                  </th>

                  {/* Cost */}
                  <th 
                    className="px-4 py-3 text-right text-sm font-semibold text-[var(--color-text)] cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => handleSort('cost')}
                  >
                    <div className="flex items-center justify-end space-x-2">
                      <span>Cost (€)</span>
                      {renderSortIcon('cost')}
                    </div>
                  </th>

                  {/* Selling Price */}
                  <th 
                    className="px-4 py-3 text-right text-sm font-semibold text-[var(--color-text)] cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => handleSort('sellingPrice')}
                  >
                    <div className="flex items-center justify-end space-x-2">
                      <span>Selling Price (€)</span>
                      {renderSortIcon('sellingPrice')}
                    </div>
                  </th>

                  {/* Quantity */}
                  <th 
                    className="px-4 py-3 text-right text-sm font-semibold text-[var(--color-text)] cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => handleSort('quantity')}
                  >
                    <div className="flex items-center justify-end space-x-2">
                      <span>Quantity</span>
                      {renderSortIcon('quantity')}
                    </div>
                  </th>

                  {/* Days in Stock */}
                  <th 
                    className="px-4 py-3 text-right text-sm font-semibold text-[var(--color-text)] cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => handleSort('daysInStock')}
                  >
                    <div className="flex items-center justify-end space-x-2">
                      <span>Days in Stock</span>
                      {renderSortIcon('daysInStock')}
                    </div>
                  </th>

                  {/* Profit */}
                  <th 
                    className="px-4 py-3 text-right text-sm font-semibold text-[var(--color-text)] cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => handleSort('netProfit')}
                  >
                    <div className="flex items-center justify-end space-x-2">
                      <span>Profit (€)</span>
                      {renderSortIcon('netProfit')}
                    </div>
                  </th>

                  {/* Margin % */}
                  <th 
                    className="px-4 py-3 text-right text-sm font-semibold text-[var(--color-text)] cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => handleSort('margin')}
                  >
                    <div className="flex items-center justify-end space-x-2">
                      <span>Margin (%)</span>
                      {renderSortIcon('margin')}
                    </div>
                  </th>

                  {/* Risk */}
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-text)]">
                    Risk
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-[var(--color-border)]">
                {sortedProducts.map((product, index) => {
                  const netProfit = calculateNetProfit(product);
                  const margin = calculateMargin(product);
                  const isProfitable = netProfit > 0;

                  return (
                    <tr 
                      key={product.asin || index}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                          {/* ASIN - Monospace font */}
                      <td className="px-4 py-3 text-sm font-mono text-[var(--color-text)]">
                        {product.asin}
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3 text-sm text-[var(--color-text)]">
                        {product.category}
                      </td>

                      {/* Cost */}
                      <td className="px-4 py-3 text-sm text-right font-mono text-[var(--color-text)]">
                        {formatCurrency(product.cost)}
                      </td>

                      {/* Selling Price */}
                      <td className="px-4 py-3 text-sm text-right font-mono text-[var(--color-text)]">
                        {formatCurrency(product.sellingPrice)}
                      </td>

                      {/* Quantity */}
                      <td className="px-4 py-3 text-sm text-right font-mono text-[var(--color-text)]">
                        {formatNumber(product.quantity)}
                      </td>

                      {/* Days in Stock */}
                      <td className="px-4 py-3 text-sm text-right font-mono text-[var(--color-text-muted)]">
                        {product.daysInStock !== null && product.daysInStock !== undefined
                          ? formatNumber(product.daysInStock)
                          : 'N/A'}
                      </td>

                      {/* Net Profit - Color coded */}
                      <td className={`px-4 py-3 text-sm text-right font-mono font-semibold ${
                        isProfitable 
                          ? 'text-[var(--color-success)]' 
                          : 'text-[var(--color-danger)]'
                      }`}>
                        {formatCurrency(netProfit)}
                      </td>

                      {/* Margin % */}
                      <td className="px-4 py-3 text-sm text-right font-mono text-[var(--color-text)]">
                        {margin.toFixed(1)}%
                      </td>

                      {/* Risk - Color coded dot */}
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center">
                          <span className={`w-3 h-3 rounded-full ${
                            margin >= 20 ? 'bg-green-500' : margin >= 10 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-3">
        {/* Clear Products Button */}
        <button
          onClick={handleClearClick}
          className="inline-flex items-center space-x-2 px-4 py-2 border border-[var(--color-border)] rounded-lg text-[var(--color-text)] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear Products</span>
        </button>

        {/* View Full Analytics Button */}
        <button
          onClick={onViewAnalytics}
          disabled={products.length === 0}
          className="inline-flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
        >
          <BarChart3 className="w-4 h-4" />
          <span>View Full Analytics</span>
        </button>
      </div>

      {/* Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
              Clear All Products?
            </h3>
            <p className="text-[var(--color-text-muted)] mb-6">
              This will delete all {products.length} imported products. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={handleCancelClear}
                className="px-4 py-2 border border-[var(--color-border)] rounded-lg text-[var(--color-text)] hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClear}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Clear Products
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
