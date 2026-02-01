import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowUpDown, 
  Download, 
  FileText, 
  Filter,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { 
  downloadCSV, 
  filterByRiskLevel, 
  sortProducts,
  getPortfolioSummary 
} from '../../utils/bulkCalculations';

/**
 * Bulk Products Table Component (B7)
 * 
 * Displays imported products with:
 * - Sortable columns
 * - Risk filtering
 * - Summary statistics
 * - Export functionality
 */

const BulkProductsTable = ({ results, onExport }) => {
  const [sortColumn, setSortColumn] = useState('healthScore');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterRisk, setFilterRisk] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Apply filters and sorting
  const filteredAndSorted = useMemo(() => {
    let filtered = filterByRiskLevel(results, filterRisk);
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        r.asin.toLowerCase().includes(term) ||
        r.name.toLowerCase().includes(term) ||
        r.category.toLowerCase().includes(term)
      );
    }
    
    return sortProducts(filtered, sortColumn, sortDirection);
  }, [results, filterRisk, searchTerm, sortColumn, sortDirection]);

  // Get summary statistics
  const summary = useMemo(() => getPortfolioSummary(filteredAndSorted), [filteredAndSorted]);

  // Handle column sort
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  // Get risk color classes
  const getRiskColor = (risk) => {
    switch (risk) {
      case 'red':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      case 'yellow':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      case 'green':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      default:
        return 'text-slate-600 dark:text-slate-400';
    }
  };

  // Get health score color
  const getHealthColor = (score) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
    if (score >= 60) return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
    if (score >= 40) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
    return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
  };

  // Render sort icon
  const SortIcon = ({ column }) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="w-4 h-4 opacity-30" />;
    }
    return sortDirection === 'asc' ? (
      <TrendingUp className="w-4 h-4" />
    ) : (
      <TrendingDown className="w-4 h-4" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Product Portfolio
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {filteredAndSorted.length} of {results.length} products
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Search */}
          <input
            type="text"
            placeholder="Search ASIN, name, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          {/* Risk Filter */}
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Products</option>
            <option value="critical">🔴 Critical Risk</option>
            <option value="warning">⚠️ Warnings</option>
            <option value="healthy">✅ Healthy</option>
          </select>

          {/* Export Buttons */}
          <button
            onClick={() => onExport('csv')}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={() => onExport('pdf')}
            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Avg. Profit/Unit</p>
          <p className="text-xl font-bold text-slate-800 dark:text-white">
            €{summary.avgProfitPerUnit.toFixed(2)}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Avg. Margin</p>
          <p className="text-xl font-bold text-slate-800 dark:text-white">
            {summary.avgProfitMargin.toFixed(1)}%
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Monthly</p>
          <p className="text-xl font-bold text-green-600 dark:text-green-400">
            €{summary.totalMonthlyProfit.toFixed(0)}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Avg. Health</p>
          <p className="text-xl font-bold text-slate-800 dark:text-white">
            {summary.avgHealthScore.toFixed(0)}/100
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Critical</p>
          <p className="text-xl font-bold text-red-600 dark:text-red-400">
            {summary.criticalRiskCount}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Healthy</p>
          <p className="text-xl font-bold text-green-600 dark:text-green-400">
            {summary.healthyCount}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900 sticky top-0">
              <tr>
                <th 
                  className="text-left px-4 py-3 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => handleSort('asin')}
                >
                  <div className="flex items-center gap-2">
                    ASIN
                    <SortIcon column="asin" />
                  </div>
                </th>
                <th 
                  className="text-left px-4 py-3 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    Product
                    <SortIcon column="name" />
                  </div>
                </th>
                <th 
                  className="text-right px-4 py-3 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Price
                    <SortIcon column="price" />
                  </div>
                </th>
                <th 
                  className="text-right px-4 py-3 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => handleSort('profitPerUnit')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Profit/Unit
                    <SortIcon column="profitPerUnit" />
                  </div>
                </th>
                <th 
                  className="text-right px-4 py-3 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => handleSort('profitMargin')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Margin %
                    <SortIcon column="profitMargin" />
                  </div>
                </th>
                <th 
                  className="text-right px-4 py-3 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => handleSort('totalMonthlyProfit')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Monthly
                    <SortIcon column="totalMonthlyProfit" />
                  </div>
                </th>
                <th 
                  className="text-right px-4 py-3 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => handleSort('breakEvenDays')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Break-Even
                    <SortIcon column="breakEvenDays" />
                  </div>
                </th>
                <th 
                  className="text-right px-4 py-3 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => handleSort('healthScore')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Health
                    <SortIcon column="healthScore" />
                  </div>
                </th>
                <th className="text-center px-4 py-3 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300">
                  Risks
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSorted.map((row, idx) => (
                <motion.tr
                  key={row.asin}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.01 }}
                  className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono text-xs">
                    {row.asin}
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300 max-w-xs truncate">
                    <div className="truncate">{row.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{row.category}</div>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">
                    €{row.price.toFixed(2)}
                  </td>
                  <td className={`px-4 py-3 text-right font-semibold ${row.profitPerUnit < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    €{row.profitPerUnit.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getRiskColor(row.profitabilityRisk)}`}>
                      {row.profitMargin.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">
                    €{row.totalMonthlyProfit.toFixed(0)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getRiskColor(row.breakEvenRisk)}`}>
                      {row.breakEvenDays.toFixed(0)}d
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getHealthColor(row.healthScore)}`}>
                      {row.healthScore.toFixed(0)}/100
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {row.criticalRisks > 0 ? (
                        <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-xs font-semibold">{row.criticalRisks}</span>
                        </span>
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredAndSorted.length === 0 && (
          <div className="py-12 text-center">
            <Filter className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-400">
              No products match your filters
            </p>
            <button
              onClick={() => {
                setFilterRisk('all');
                setSearchTerm('');
              }}
              className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkProductsTable;
