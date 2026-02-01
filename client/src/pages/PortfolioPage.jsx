import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Trash2,
  Edit,
  BarChart3,
  DollarSign,
  Percent,
  Award,
  AlertCircle,
  CheckCircle,
  Clock,
  Lightbulb,
  Info,
  AlertTriangle
} from 'lucide-react';
import {
  getPortfolio,
  updateProductStatus,
  deleteFromPortfolio,
  calculatePortfolioMetrics,
  generatePortfolioInsights
} from '../utils/portfolioStorage';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(value || 0);
};

const formatPercent = (value) => {
  return `${value.toFixed(1)}%`;
};

const PortfolioPage = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Load portfolio on mount
  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = () => {
    const data = getPortfolio();
    setPortfolio(data);
  };

  // Calculate metrics
  const metrics = useMemo(() => calculatePortfolioMetrics(portfolio), [portfolio]);
  const insights = useMemo(() => generatePortfolioInsights(metrics), [metrics]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...portfolio];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'margin':
          aValue = a.totals.profit_margin || 0;
          bValue = b.totals.profit_margin || 0;
          break;
        case 'profit':
          aValue = a.totals.net_profit || 0;
          bValue = b.totals.net_profit || 0;
          break;
        case 'roi':
          aValue = a.totals.roi_percent || 0;
          bValue = b.totals.roi_percent || 0;
          break;
        case 'health':
          aValue = a.healthScore || 0;
          bValue = b.healthScore || 0;
          break;
        case 'date':
        default:
          aValue = a.timestamp || 0;
          bValue = b.timestamp || 0;
          break;
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [portfolio, searchTerm, statusFilter, sortBy, sortOrder]);

  // Handle status change
  const handleStatusChange = (productId, newStatus) => {
    updateProductStatus(productId, newStatus);
    loadPortfolio();
  };

  // Handle delete
  const handleDelete = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteFromPortfolio(productId);
      loadPortfolio();
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const badges = {
      active: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-700 dark:text-green-300',
        icon: CheckCircle
      },
      testing: {
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        text: 'text-yellow-700 dark:text-yellow-300',
        icon: Clock
      },
      stopped: {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-700 dark:text-red-300',
        icon: AlertCircle
      }
    };

    const badge = badges[status] || badges.active;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
              Product Portfolio
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Track and manage all your analyzed products in one place
          </p>
        </motion.div>

        {/* Portfolio Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Total Products</span>
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-slate-800 dark:text-white">
              {metrics.totalProducts}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {metrics.activeSelling} active • {metrics.testing} testing
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Avg Margin</span>
              <Percent className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-3xl font-bold text-slate-800 dark:text-white">
              {formatPercent(metrics.averageMargin)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Across all products
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Monthly Profit</span>
              <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-3xl font-bold text-slate-800 dark:text-white">
              {formatCurrency(metrics.totalMonthlyProfit)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              From active products
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Best Performer</span>
              <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="text-lg font-bold text-slate-800 dark:text-white truncate">
              {metrics.bestPerformer?.productName || 'N/A'}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {metrics.bestPerformer ? formatCurrency(metrics.bestPerformer.totals.net_profit) + '/unit' : 'No products yet'}
            </div>
          </motion.div>
        </div>

        {/* Portfolio Insights */}
        {insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8 space-y-3"
          >
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Portfolio Insights
            </h3>
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  insight.type === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                    : insight.type === 'warning'
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
                    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">
                    {insight.type === 'success' && <CheckCircle className="w-5 h-5 text-teal-600 dark:text-teal-500" />}
                    {insight.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
                    {insight.type === 'info' && <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                  </span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-800 dark:text-white mb-1">
                      {insight.title}
                    </h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                      {insight.message}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                      → {insight.action}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 mb-6"
        >
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="testing">Testing</option>
              <option value="stopped">Stopped</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
            >
              <option value="date">Date</option>
              <option value="margin">Margin</option>
              <option value="profit">Profit</option>
              <option value="roi">ROI</option>
              <option value="health">Health Score</option>
            </select>

            {/* Sort Order */}
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              {sortOrder === 'asc' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </button>
          </div>
        </motion.div>

        {/* Products Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
        >
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">
                No products found
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-500">
                {portfolio.length === 0
                  ? 'Start by analyzing your first product in the Calculator'
                  : 'Try adjusting your filters or search term'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Margin
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Profit
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      ROI
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Health
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredProducts.map((product, index) => (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-slate-800 dark:text-white">
                            {product.productName}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {product.input.category}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`font-semibold ${
                          product.totals.profit_margin >= 25
                            ? 'text-green-600 dark:text-green-400'
                            : product.totals.profit_margin >= 15
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {formatPercent(product.totals.profit_margin)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-800 dark:text-white">
                        {formatCurrency(product.totals.net_profit)}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-800 dark:text-white">
                        {formatPercent(product.totals.roi_percent)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {product.healthScore ? (
                          <span className={`font-semibold ${
                            product.healthScore >= 80
                              ? 'text-green-600 dark:text-green-400'
                              : product.healthScore >= 60
                              ? 'text-yellow-600 dark:text-yellow-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {product.healthScore}/100
                          </span>
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <select
                          value={product.status}
                          onChange={(e) => handleStatusChange(product.id, e.target.value)}
                          className="text-xs px-2 py-1 rounded-full border-0 bg-transparent font-semibold cursor-pointer"
                        >
                          <option value="active">Active</option>
                          <option value="testing">Testing</option>
                          <option value="stopped">Stopped</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PortfolioPage;
