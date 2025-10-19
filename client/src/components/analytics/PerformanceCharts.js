import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { TrendingUp, PieChartIcon, BarChart3, Activity, FileSpreadsheet } from 'lucide-react';

const PerformanceCharts = ({ chartData, result }) => {
  const [activeChart, setActiveChart] = useState('distribution');

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatPercent = (value) => {
    return `${value.toFixed(1)}%`;
  };

  // Custom tooltip for better UX
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 backdrop-blur-sm border border-slate-300 dark:border-slate-600 rounded-lg p-3 shadow-xl"
        >
          <p className="text-sm font-medium text-slate-800 dark:text-white mb-1">{label || payload[0].name}</p>
          {payload.map((entry, index) => {
            // Calculate percentage of total costs for each slice
            const totalValue = chartData.profitDistribution.reduce((sum, item) => sum + item.value, 0);
            const percentageOfCosts = ((entry.value / totalValue) * 100).toFixed(1);
            
            return (
              <p key={index} className="text-sm" style={{ color: entry.color || '#3B82F6' }}>
                {entry.name}: {formatCurrency(entry.value)} ({percentageOfCosts}% of costs)
              </p>
            );
          })}
        </motion.div>
      );
    }
    return null;
  };

  // Chart selection buttons
  const chartButtons = [
    { id: 'distribution', label: 'Distribution', icon: PieChartIcon },
    { id: 'comparison', label: 'Comparison', icon: BarChart3 },
    { id: 'breakeven', label: 'Break-even', icon: TrendingUp }
  ];

  return (
    <div className="space-y-6">
      {/* Chart Selector */}
      <div className="flex flex-wrap gap-2">
        {chartButtons.map(({ id, label, icon: Icon }) => (
          <motion.button
            key={id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveChart(id)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
              activeChart === id
                ? 'bg-blue-600 dark:bg-blue-600 text-white shadow-lg'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </motion.button>
        ))}
      </div>

      {/* Charts Container */}
      <motion.div
        key={activeChart}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-lg"
      >
        {/* Profit Distribution Pie Chart */}
        {activeChart === 'distribution' && (
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Cost & Profit Distribution
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={chartData.profitDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={130}
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {chartData.profitDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  wrapperStyle={{ color: '#fff', fontSize: '14px' }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Distribution Stats */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
              {chartData.profitDistribution.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 rounded-lg p-3 border border-white/10"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-gray-400">{item.name}</span>
                  </div>
                  <div className="text-lg font-bold text-white">
                    {formatCurrency(item.value)}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Multi-Product Comparison - Coming Soon */}
        {activeChart === 'comparison' && (
          <div className="flex items-center justify-center py-20">
            <div className="max-w-2xl text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-blue-200 dark:border-blue-700"
              >
                <BarChart3 className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </motion.div>
              
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">
                Multi-Product Comparison Coming Soon
              </h3>
              
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                Upload multiple SKUs via <strong>Bulk Upload</strong> to compare profitability, 
                margins, and ROI side-by-side. Identify your top performers and optimize 
                underperforming products with visual analytics.
              </p>
              
              <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg px-4 py-2 text-sm text-blue-700 dark:text-blue-300">
                <FileSpreadsheet className="w-4 h-4" />
                <span>Try the Bulk Upload tab to analyze multiple products</span>
              </div>
            </div>
          </div>
        )}

        {/* Break-even Analysis */}
        {activeChart === 'breakeven' && (
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Break-even Analysis
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData.breakEvenData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis 
                  dataKey="units" 
                  stroke="#fff"
                  style={{ fontSize: '12px' }}
                  label={{ value: 'Units Sold', position: 'insideBottom', offset: -5, fill: '#fff' }}
                />
                <YAxis 
                  stroke="#fff"
                  style={{ fontSize: '12px' }}
                  label={{ value: 'Amount (€)', angle: -90, position: 'insideLeft', fill: '#fff' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ color: '#fff', fontSize: '14px' }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#00FFE0"
                  strokeWidth={3}
                  dot={{ fill: '#00FFE0', r: 4 }}
                  name="Revenue"
                  animationBegin={0}
                  animationDuration={1000}
                />
                <Line
                  type="monotone"
                  dataKey="costs"
                  stroke="#FF6B9D"
                  strokeWidth={3}
                  dot={{ fill: '#FF6B9D', r: 4 }}
                  name="Total Costs"
                  animationBegin={200}
                  animationDuration={1000}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#10B981"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#10B981', r: 3 }}
                  name="Profit"
                  animationBegin={400}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Break-even stats */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                <div className="text-sm text-cyan-400 mb-1">Break-even Point</div>
                <div className="text-2xl font-bold text-white">
                  ~{Math.ceil((result.input.fixed_costs || 500) / (result.totals.net_profit || 1))} units
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Based on €{result.input.fixed_costs || 500} setup costs + per-unit variable costs
                </div>
              </div>
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <div className="text-sm text-green-400 mb-1">Profit at 100 units</div>
                <div className="text-2xl font-bold text-white">
                  {formatCurrency((result.totals.net_profit * 100) - (result.input.fixed_costs || 500))}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  After €{result.input.fixed_costs || 500} setup costs
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Performance Gauge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-lg"
      >
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Performance Gauge</h3>
        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={200}>
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="100%"
              data={[
                { 
                  name: 'Margin', 
                  value: Math.min(result.totals.profit_margin, 50),
                  fill: result.totals.profit_margin >= 20 ? '#3B82F6' : result.totals.profit_margin >= 10 ? '#F59E0B' : '#EF4444'
                }
              ]}
              startAngle={180}
              endAngle={0}
            >
              <RadialBar
                minAngle={15}
                background
                clockWise
                dataKey="value"
                cornerRadius={10}
              />
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-3xl font-bold"
                fill="#fff"
              >
                {result.totals.profit_margin.toFixed(1)}%
              </text>
              <text
                x="50%"
                y="60%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-sm"
                fill="#9CA3AF"
              >
                Profit Margin
              </text>
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};

export default PerformanceCharts;

