import React from 'react';
import { motion } from 'framer-motion';
import { 
  PieChart, 
  BarChart3, 
  TrendingUp,
  Target,
  Euro,
  BarChart,
  LineChart,
  Activity
} from 'lucide-react';

const AnalyticsPreview = () => {
  const chartData = {
    pie: [
      { name: 'Net Profit', value: 28.4, color: '#10B981' },
      { name: 'Product Cost', value: 45.0, color: '#3B82F6' },
      { name: 'Amazon Fees', value: 12.6, color: '#F59E0B' },
      { name: 'VAT Liability', value: 8.2, color: '#8B5CF6' },
      { name: 'Shipping', value: 5.8, color: '#EF4444' }
    ],
    breakEven: [
      { units: 0, profit: -500, revenue: 0 },
      { units: 1, profit: -264, revenue: 100 },
      { units: 2, profit: -28, revenue: 200 },
      { units: 3, profit: 208, revenue: 300 },
      { units: 4, profit: 444, revenue: 400 },
      { units: 5, profit: 680, revenue: 500 },
      { units: 6, profit: 916, revenue: 600 },
      { units: 7, profit: 1152, revenue: 700 },
      { units: 8, profit: 1388, revenue: 800 },
      { units: 9, profit: 1624, revenue: 900 },
      { units: 10, profit: 1860, revenue: 1000 }
    ],
    roi: [
      { month: 'Jan', roi: 25 },
      { month: 'Feb', roi: 28 },
      { month: 'Mar', roi: 32 },
      { month: 'Apr', roi: 35 },
      { month: 'May', roi: 38 },
      { month: 'Jun', roi: 42 },
      { month: 'Jul', roi: 45 },
      { month: 'Aug', roi: 48 },
      { month: 'Sep', roi: 52 },
      { month: 'Oct', roi: 55 },
      { month: 'Nov', roi: 58 },
      { month: 'Dec', roi: 62 }
    ]
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const chartVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium mb-6">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics Preview
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            In-App Dashboard
            <span className="block text-blue-600 dark:text-blue-400">
              Preview
            </span>
          </h2>
          
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            See the powerful analytics and visualizations that help you make data-driven decisions 
            for your Amazon FBA business.
          </p>
        </motion.div>

        {/* Charts Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid lg:grid-cols-3 gap-8"
        >
          
          {/* Pie Chart - Cost Distribution */}
          <motion.div
            variants={chartVariants}
            whileHover={{ 
              y: -8,
              scale: 1.02,
              transition: { duration: 0.3 }
            }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <PieChart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Cost Distribution</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Profit vs Costs</p>
                </div>
              </div>
            </div>

            {/* Pie Chart Visualization */}
            <div className="relative w-48 h-48 mx-auto mb-6">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="8"
                />
                {chartData.pie.map((segment, index) => {
                  const total = chartData.pie.reduce((sum, item) => sum + item.value, 0);
                  const percentage = (segment.value / total) * 100;
                  const circumference = 2 * Math.PI * 40;
                  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
                  const strokeDashoffset = chartData.pie.slice(0, index).reduce((sum, item) => sum + (item.value / total) * circumference, 0);
                  
                  return (
                    <circle
                      key={index}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={segment.color}
                      strokeWidth="8"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={-strokeDashoffset}
                      transform="rotate(-90 50 50)"
                      className="transition-all duration-500"
                    />
                  );
                })}
              </svg>
              
              {/* Center Text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">28.4%</div>
                  <div className="text-xs text-slate-600 dark:text-slate-300">Profit Margin</div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2">
              {chartData.pie.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-600 dark:text-slate-300">{item.name}</span>
                  </div>
                  <span className="font-medium text-slate-900 dark:text-white">{item.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Line Chart - Break-Even Analysis */}
          <motion.div
            variants={chartVariants}
            whileHover={{ 
              y: -8,
              scale: 1.02,
              transition: { duration: 0.3 }
            }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <LineChart className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Break-Even Analysis</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Units vs Profit</p>
                </div>
              </div>
            </div>

            {/* Line Chart Visualization */}
            <div className="relative h-48 mb-6">
              <svg viewBox="0 0 300 200" className="w-full h-full">
                {/* Grid Lines */}
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E5E7EB" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                
                {/* Profit Line */}
                <polyline
                  points={chartData.breakEven.map((point, index) => 
                    `${(index / (chartData.breakEven.length - 1)) * 280 + 10},${200 - ((point.profit + 500) / 2360) * 180}`
                  ).join(' ')}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="3"
                  className="drop-shadow-sm"
                />
                
                {/* Break-even Point */}
                <circle
                  cx="85"
                  cy="200 - ((208 + 500) / 2360) * 180"
                  r="4"
                  fill="#10B981"
                  className="drop-shadow-sm"
                />
                
                {/* Labels */}
                <text x="85" y="200 - ((208 + 500) / 2360) * 180 - 10" textAnchor="middle" className="text-xs fill-slate-600">
                  Break-even: 3 units
                </text>
              </svg>
            </div>

            {/* Break-even Stats */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Break-even Point</span>
                <span className="text-lg font-bold text-green-800 dark:text-green-200">3 units</span>
              </div>
              <div className="text-xs text-green-600 dark:text-green-400">
                Break even at 3 units with €500 setup costs
              </div>
            </div>
          </motion.div>

          {/* Sparkline - ROI Trend */}
          <motion.div
            variants={chartVariants}
            whileHover={{ 
              y: -8,
              scale: 1.02,
              transition: { duration: 0.3 }
            }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">ROI Trend</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">12-Month Projection</p>
                </div>
              </div>
            </div>

            {/* Sparkline Visualization */}
            <div className="relative h-32 mb-6">
              <svg viewBox="0 0 300 120" className="w-full h-full">
                {/* Background Area */}
                <defs>
                  <linearGradient id="roiGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.05"/>
                  </linearGradient>
                </defs>
                
                {/* Area Fill */}
                <polygon
                  points={`10,120 ${chartData.roi.map((point, index) => 
                    `${(index / (chartData.roi.length - 1)) * 280 + 10},${120 - (point.roi / 70) * 100}`
                  ).join(' ')} 290,120`}
                  fill="url(#roiGradient)"
                />
                
                {/* Line */}
                <polyline
                  points={chartData.roi.map((point, index) => 
                    `${(index / (chartData.roi.length - 1)) * 280 + 10},${120 - (point.roi / 70) * 100}`
                  ).join(' ')}
                  fill="none"
                  stroke="#8B5CF6"
                  strokeWidth="2"
                />
                
                {/* Data Points */}
                {chartData.roi.map((point, index) => (
                  <circle
                    key={index}
                    cx={(index / (chartData.roi.length - 1)) * 280 + 10}
                    cy={120 - (point.roi / 70) * 100}
                    r="2"
                    fill="#8B5CF6"
                    className="opacity-0 hover:opacity-100 transition-opacity duration-200"
                  />
                ))}
              </svg>
            </div>

            {/* ROI Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">62%</div>
                <div className="text-xs text-slate-600 dark:text-slate-300">Current ROI</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">+37%</div>
                <div className="text-xs text-slate-600 dark:text-slate-300">Growth</div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Ready to See Your Analytics?
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Get instant access to these powerful analytics and make data-driven decisions 
              for your Amazon FBA business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <Target className="w-5 h-5 mr-2" />
                Start Free Analysis
              </button>
              <button className="inline-flex items-center px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <Activity className="w-5 h-5 mr-2" />
                View Live Demo
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AnalyticsPreview;
