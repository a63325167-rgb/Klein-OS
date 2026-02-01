// client/src/components/AnalyticsWithContext.js
// Analytics component using global ProductsContext

import React from 'react';
import { BarChart3, TrendingUp, AlertTriangle, Package, DollarSign } from 'lucide-react';
import { useProducts } from '../contexts/ProductsContext';

const AnalyticsWithContext = () => {
  // ✅ ACCESS GLOBAL PRODUCTS STATE
  const { products, analytics, loading, error } = useProducts();
  
  // ============================================
  // EMPTY STATE
  // ============================================
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 
        rounded-lg p-6">
        <div className="flex items-center">
          <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Error</h3>
            <p className="text-red-600 dark:text-red-300 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!products || products.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center max-w-md">
          <Package className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Products Uploaded
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Upload products in the <strong>Bulk Upload</strong> tab to see analytics here.
          </p>
          <a
            href="#bulk-upload"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 
              text-white font-medium rounded-lg shadow transition-colors"
          >
            Go to Bulk Upload
          </a>
        </div>
      </div>
    );
  }
  
  // ============================================
  // ANALYTICS CALCULATIONS
  // ============================================
  
  const totalProducts = products.length;
  const profitableProducts = products.filter(p => p.profitPerUnit > 0).length;
  const unprofitableProducts = totalProducts - profitableProducts;
  
  const totalMonthlyProfit = analytics?.summary?.totalMonthlyProfit || 0;
  const avgProfitMargin = analytics?.summary?.averageProfitMargin || 0;
  const avgHealthScore = analytics?.summary?.averageHealthScore || 0;
  
  const riskDistribution = analytics?.riskDistribution || { red: 0, yellow: 0, green: 0 };
  
  // Top 5 products by profit
  const topProducts = [...products]
    .sort((a, b) => b.profitPerUnit - a.profitPerUnit)
    .slice(0, 5);
  
  // Bottom 5 products by profit
  const bottomProducts = [...products]
    .sort((a, b) => a.profitPerUnit - b.profitPerUnit)
    .slice(0, 5);
  
  // Category breakdown
  const categoryStats = products.reduce((acc, product) => {
    const cat = product.category || 'Uncategorized';
    if (!acc[cat]) {
      acc[cat] = { count: 0, totalProfit: 0 };
    }
    acc[cat].count++;
    acc[cat].totalProfit += product.totalMonthlyProfit || 0;
    return acc;
  }, {});
  
  const topCategories = Object.entries(categoryStats)
    .sort((a, b) => b[1].totalProfit - a[1].totalProfit)
    .slice(0, 5);
  
  // ============================================
  // RENDER
  // ============================================
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Analyzing {totalProducts} products from global state
        </p>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Products</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {totalProducts}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {profitableProducts} profitable
              </p>
            </div>
            <Package className="w-12 h-12 text-blue-600 dark:text-blue-400 opacity-20" />
          </div>
        </div>
        
        {/* Total Monthly Profit */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Profit</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                €{totalMonthlyProfit.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Projected revenue
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-green-600 dark:text-green-400 opacity-20" />
          </div>
        </div>
        
        {/* Avg Profit Margin */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Margin</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                {avgProfitMargin.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Profit margin
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-blue-600 dark:text-blue-400 opacity-20" />
          </div>
        </div>
        
        {/* Avg Health Score */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Health</p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                {avgHealthScore.toFixed(0)}/100
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Health score
              </p>
            </div>
            <BarChart3 className="w-12 h-12 text-purple-600 dark:text-purple-400 opacity-20" />
          </div>
        </div>
      </div>
      
      {/* Risk Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Risk Distribution
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* High Risk */}
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">🔴 High Risk</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                  {riskDistribution.red}
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {((riskDistribution.red / totalProducts) * 100).toFixed(1)}% of total
                </p>
              </div>
            </div>
          </div>
          
          {/* Medium Risk */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">🟡 Medium Risk</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                  {riskDistribution.yellow}
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  {((riskDistribution.yellow / totalProducts) * 100).toFixed(1)}% of total
                </p>
              </div>
            </div>
          </div>
          
          {/* Low Risk */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">🟢 Low Risk</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {riskDistribution.green}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {((riskDistribution.green / totalProducts) * 100).toFixed(1)}% of total
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Top Performers */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Top 5 Performers
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Products with highest profit per unit
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Profit/Unit</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Margin</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Health</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {topProducts.map((product, idx) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white">#{idx + 1}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{product.name}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-green-600 dark:text-green-400">
                    €{product.profitPerUnit.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {product.profitMargin.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {product.healthScore.toFixed(0)}/100
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Category Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Top Categories
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Categories by total monthly profit
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Products</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total Profit</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {topCategories.map(([category, stats], idx) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{category}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{stats.count}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-green-600 dark:text-green-400">
                    €{stats.totalProfit.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Bottom Performers */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
            Bottom 5 Performers
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Products needing attention
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Profit/Unit</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Margin</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Issue</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {bottomProducts.map((product, idx) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{product.name}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-400">
                    €{product.profitPerUnit.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {product.profitMargin.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 text-sm text-red-600 dark:text-red-400">
                    {product.profitPerUnit < 0 ? 'Unprofitable' : 'Low margin'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsWithContext;
