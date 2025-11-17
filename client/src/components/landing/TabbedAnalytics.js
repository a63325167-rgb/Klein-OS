import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  FileSpreadsheet, 
  Award,
  PieChart,
  LineChart,
  TrendingUp,
  Target,
  Euro,
  ArrowRight
} from 'lucide-react';

const TabbedAnalytics = () => {
  const [activeTab, setActiveTab] = useState('analytics');

  const tabs = [
    {
      id: 'analytics',
      label: 'Analytics Preview',
      icon: BarChart3,
      color: 'blue'
    },
    {
      id: 'portfolio',
      label: 'Portfolio View',
      icon: FileSpreadsheet,
      color: 'green'
    },
    {
      id: 'comparison',
      label: 'Comparison',
      icon: Award,
      color: 'purple'
    }
  ];

  const tabContent = {
    analytics: {
      title: "Live Analytics Dashboard",
      description: "Real-time profitability analysis with interactive charts and KPIs",
      features: [
        "Cost Distribution Pie Chart",
        "Break-Even Analysis",
        "ROI Trend Projection",
        "VAT Breakdown",
        "Performance Metrics"
      ],
      cta: "View Full Analytics"
    },
    portfolio: {
      title: "Bulk Portfolio Analysis",
      description: "Analyze 500+ SKUs simultaneously with side-by-side comparisons",
      features: [
        "500+ SKUs Analyzed",
        "45s Analysis Time",
        "€12,450 Total Profit",
        "23.8% Average Margin",
        "Export to Excel/PDF"
      ],
      cta: "Upload Your Portfolio"
    },
    comparison: {
      title: "Competitor Comparison",
      description: "See how our platform compares to the competition",
      features: [
        "EU VAT Accuracy",
        "Input VAT Reclaim",
        "Break-Even Analysis",
        "FBA Logic",
        "Bulk Upload",
        "AI Insights",
        "Pricing"
      ],
      cta: "View Full Comparison"
    }
  };

  const getTabColor = (color) => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-600',
          text: 'text-blue-600 dark:text-blue-400',
          border: 'border-blue-200 dark:border-blue-700',
          gradient: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20'
        };
      case 'green':
        return {
          bg: 'bg-green-600',
          text: 'text-green-600 dark:text-green-400',
          border: 'border-green-200 dark:border-green-700',
          gradient: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20'
        };
      case 'purple':
        return {
          bg: 'bg-purple-600',
          text: 'text-purple-600 dark:text-purple-400',
          border: 'border-purple-200 dark:border-purple-700',
          gradient: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20'
        };
      default:
        return {
          bg: 'bg-slate-600',
          text: 'text-slate-600 dark:text-slate-400',
          border: 'border-slate-200 dark:border-slate-700',
          gradient: 'from-slate-50 to-slate-100 dark:from-slate-900/20 dark:to-slate-800/20'
        };
    }
  };

  return (
    <section id="demo" className="py-20 bg-white dark:bg-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium mb-6">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics Dashboard
          </div>
          
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
            Powerful Analytics at Your Fingertips
          </h2>
          
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Choose your preferred view to explore our analytics capabilities and see how 
            our platform can transform your Amazon FBA business.
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex flex-col sm:flex-row justify-center mb-8">
          <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-1 flex flex-wrap justify-center">
            {tabs.map((tab) => {
              const colors = getTabColor(tab.color);
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-8"
          >
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              
              {/* Content */}
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  {tabContent[activeTab].title}
                </h3>
                
                <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                  {tabContent[activeTab].description}
                </p>

                {/* Features List */}
                <div className="space-y-3 mb-8">
                  {tabContent[activeTab].features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-slate-600 dark:text-slate-300">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <Target className="w-5 h-5 mr-2" />
                  {tabContent[activeTab].cta}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>

              {/* Visual Preview */}
              <div className="relative">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-600">
                  {activeTab === 'analytics' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <PieChart className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-slate-900 dark:text-white">Cost Distribution</span>
                      </div>
                      <div className="w-full h-32 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">Chart Preview</span>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'portfolio' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <FileSpreadsheet className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-slate-900 dark:text-white">Portfolio Table</span>
                      </div>
                      <div className="space-y-2">
                        {['Bluetooth Headphones', 'Baby Food Jars', 'Print Books'].map((item, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700 rounded">
                            <span className="text-sm text-slate-600 dark:text-slate-300">{item}</span>
                            <span className="text-sm font-medium text-green-600">28.4%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'comparison' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Award className="w-5 h-5 text-purple-600" />
                        <span className="font-semibold text-slate-900 dark:text-white">Feature Comparison</span>
                      </div>
                      <div className="space-y-2">
                        {['EU VAT Accuracy', 'Input VAT Reclaim', 'AI Insights'].map((item, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700 rounded">
                            <span className="text-sm text-slate-600 dark:text-slate-300">{item}</span>
                            <div className="flex gap-1">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default TabbedAnalytics;








