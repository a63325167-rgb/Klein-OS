import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileSpreadsheet, 
  Upload, 
  BarChart3, 
  TrendingUp,
  Target,
  Euro,
  CheckCircle,
  ArrowRight,
  Download,
  Eye
} from 'lucide-react';

const PortfolioView = () => {
  const portfolioData = [
    {
      product: "Bluetooth Headphones",
      category: "Electronics",
      margin: 28.4,
      roi: 38.9,
      netProfit: 23.68,
      vatLiability: 4.17,
      status: "Excellent",
      color: "green"
    },
    {
      product: "Baby Food Jars",
      category: "Baby Food",
      margin: 22.1,
      roi: 31.2,
      netProfit: 8.45,
      vatLiability: 1.89,
      status: "Good",
      color: "blue"
    },
    {
      product: "Print Books",
      category: "Books",
      margin: 15.8,
      roi: 24.6,
      netProfit: 3.20,
      vatLiability: 0.70,
      status: "Fair",
      color: "amber"
    },
    {
      product: "Children's Clothing",
      category: "Clothing",
      margin: 12.3,
      roi: 18.7,
      netProfit: 2.15,
      vatLiability: 1.25,
      status: "Fair",
      color: "amber"
    },
    {
      product: "Kitchen Gadgets",
      category: "Home & Garden",
      margin: 8.9,
      roi: 12.4,
      netProfit: 1.45,
      vatLiability: 2.10,
      status: "Poor",
      color: "red"
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Excellent': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'Good': return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
      case 'Fair': return 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30';
      case 'Poor': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      default: return 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/30';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const rowVariants = {
    hidden: { 
      opacity: 0, 
      x: -20
    },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.5,
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
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Portfolio Analysis
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Compare 500+ SKUs
            <span className="block text-blue-600 dark:text-blue-400">
              In Under 1 Minute
            </span>
          </h2>
          
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Upload your entire product portfolio and get instant profitability analysis 
            with side-by-side comparisons, performance rankings, and optimization opportunities.
          </p>
        </motion.div>

        {/* Portfolio Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
        >
          {/* Table Header */}
          <div className="bg-slate-50 dark:bg-slate-700 px-6 py-4 border-b border-slate-200 dark:border-slate-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300 ml-2">Portfolio Analysis Dashboard</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-slate-500 dark:text-slate-400">Live Analysis</div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Margin
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    ROI
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Net Profit
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    VAT Liability
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-600">
                <motion.tr
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200"
                >
                  {portfolioData.map((product, index) => (
                    <motion.tr
                      key={index}
                      variants={rowVariants}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-3">
                            <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900 dark:text-white">
                              {product.product}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-600 dark:text-slate-300">
                          {product.category}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {product.margin}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {product.roi}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          €{product.netProfit}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          €{product.vatLiability}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                          {product.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </motion.tr>
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="bg-slate-50 dark:bg-slate-700 px-6 py-4 border-t border-slate-200 dark:border-slate-600">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600 dark:text-slate-300">
                Showing 5 of 500+ products analyzed
              </div>
              <div className="flex items-center gap-4">
                <button className="inline-flex items-center px-3 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
                <button className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200">
                  <Eye className="w-4 h-4 mr-2" />
                  View All
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 grid md:grid-cols-4 gap-8"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">500+</div>
            <div className="text-slate-600 dark:text-slate-300">SKUs Analyzed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">45s</div>
            <div className="text-slate-600 dark:text-slate-300">Analysis Time</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">€12,450</div>
            <div className="text-slate-600 dark:text-slate-300">Total Net Profit</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-2">23.8%</div>
            <div className="text-slate-600 dark:text-slate-300">Average Margin</div>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Analyze Your Portfolio?
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Upload your product data and get instant profitability analysis for your entire 
              Amazon FBA portfolio in under 1 minute.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <Upload className="w-5 h-5 mr-2" />
                Upload Product Data
              </button>
              <button className="inline-flex items-center px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <TrendingUp className="w-5 h-5 mr-2" />
                See Live Demo
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PortfolioView;
