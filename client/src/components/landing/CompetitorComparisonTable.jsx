import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  Star, 
  Award,
  Target,
  Euro,
  BarChart3,
  Lightbulb,
  FileSpreadsheet,
  Globe,
  Zap
} from 'lucide-react';

const CompetitorComparisonTable = () => {
  const competitors = [
    {
      name: "Your SaaS",
      logo: "🚀",
      color: "blue",
      highlighted: true
    },
    {
      name: "Helium 10",
      logo: "🔍",
      color: "gray",
      highlighted: false
    },
    {
      name: "Jungle Scout",
      logo: "🌴",
      color: "gray",
      highlighted: false
    },
    {
      name: "Keepa",
      logo: "📊",
      color: "gray",
      highlighted: false
    }
  ];

  const features = [
    {
      name: "EU VAT Accuracy",
      description: "30 countries, country-specific rates",
      icon: Globe
    },
    {
      name: "Input VAT Reclaim",
      description: "Automatic COGS VAT calculation",
      icon: Euro
    },
    {
      name: "Break-Even Analysis",
      description: "Real-time scenario planning",
      icon: Target
    },
    {
      name: "FBA Logic",
      description: "Pan-EU FBA VAT rules",
      icon: BarChart3
    },
    {
      name: "Bulk Upload",
      description: "500+ SKUs in seconds",
      icon: FileSpreadsheet
    },
    {
      name: "AI Insights",
      description: "Actionable recommendations",
      icon: Lightbulb
    },
    {
      name: "Pricing",
      description: "Transparent, no hidden fees",
      icon: Zap
    }
  ];

  const featureComparison = {
    "EU VAT Accuracy": {
      "Your SaaS": { supported: true, detail: "30 countries" },
      "Helium 10": { supported: false, detail: "US only" },
      "Jungle Scout": { supported: false, detail: "US only" },
      "Keepa": { supported: false, detail: "US only" }
    },
    "Input VAT Reclaim": {
      "Your SaaS": { supported: true, detail: "Automatic" },
      "Helium 10": { supported: false, detail: "Not available" },
      "Jungle Scout": { supported: false, detail: "Not available" },
      "Keepa": { supported: false, detail: "Not available" }
    },
    "Break-Even Analysis": {
      "Your SaaS": { supported: true, detail: "Real-time" },
      "Helium 10": { supported: true, detail: "Basic" },
      "Jungle Scout": { supported: true, detail: "Basic" },
      "Keepa": { supported: false, detail: "Not available" }
    },
    "FBA Logic": {
      "Your SaaS": { supported: true, detail: "Pan-EU FBA" },
      "Helium 10": { supported: true, detail: "US FBA only" },
      "Jungle Scout": { supported: true, detail: "US FBA only" },
      "Keepa": { supported: false, detail: "Not available" }
    },
    "Bulk Upload": {
      "Your SaaS": { supported: true, detail: "500+ SKUs" },
      "Helium 10": { supported: true, detail: "100 SKUs" },
      "Jungle Scout": { supported: true, detail: "50 SKUs" },
      "Keepa": { supported: false, detail: "Not available" }
    },
    "AI Insights": {
      "Your SaaS": { supported: true, detail: "Advanced AI" },
      "Helium 10": { supported: true, detail: "Basic insights" },
      "Jungle Scout": { supported: true, detail: "Basic insights" },
      "Keepa": { supported: false, detail: "Not available" }
    },
    "Pricing": {
      "Your SaaS": { supported: true, detail: "€29/mo" },
      "Helium 10": { supported: true, detail: "$99/mo" },
      "Jungle Scout": { supported: true, detail: "$49/mo" },
      "Keepa": { supported: true, detail: "$20/mo" }
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
            <Award className="w-4 h-4 mr-2" />
            Feature Comparison
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Why Choose Our Platform?
            <span className="block text-blue-600 dark:text-blue-400">
              Feature Comparison
            </span>
          </h2>
          
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            See how our platform compares to the competition. We're the only solution 
            built specifically for EU Amazon sellers with accurate VAT calculations.
          </p>
        </motion.div>

        {/* Comparison Table */}
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
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300 ml-2">Feature Comparison Dashboard</span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Updated 2025</div>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700">
                <tr>
                  <th className="w-1/3 px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Features
                  </th>
                  {competitors.map((competitor, index) => (
                    <th key={index} className={`w-1/4 px-4 py-4 text-center text-xs font-medium uppercase tracking-wider ${
                      competitor.highlighted 
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' 
                        : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      <div className="flex flex-col items-center">
                        <div className="text-2xl mb-2">{competitor.logo}</div>
                        <div className="font-semibold">{competitor.name}</div>
                        {competitor.highlighted && (
                          <div className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium mt-2">
                            <Star className="w-3 h-3 mr-1" />
                            Best Choice
                          </div>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-600">
                {features.map((feature, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200"
                  >
                      <td className="w-1/3 px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-3">
                            <feature.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900 dark:text-white">
                              {feature.name}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {feature.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      {competitors.map((competitor, compIndex) => {
                        const featureData = featureComparison[feature.name][competitor.name];
                        return (
                          <td key={compIndex} className={`w-1/4 px-4 py-4 text-center ${
                            competitor.highlighted ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}>
                            <div className="flex flex-col items-center">
                              {featureData.supported ? (
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="w-5 h-5 text-green-500" />
                                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                                    {featureData.detail}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <XCircle className="w-5 h-5 text-red-500" />
                                  <span className="text-sm font-medium text-red-700 dark:text-red-300">
                                    {featureData.detail}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="bg-slate-50 dark:bg-slate-700 px-6 py-4 border-t border-slate-200 dark:border-slate-600">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600 dark:text-slate-300">
                * EU VAT accuracy and input-VAT reclaim are unique to our platform
              </div>
              <div className="flex items-center gap-4">
                <button className="inline-flex items-center px-3 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200">
                  Download Comparison
                </button>
                <button className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200">
                  Start Free Trial
                </button>
              </div>
            </div>
          </div>
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
              Ready to Experience the Difference?
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Join thousands of EU Amazon sellers who have switched to our platform for 
              accurate VAT calculations and increased profitability.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <Target className="w-5 h-5 mr-2" />
                Start Free Trial
              </button>
              <button className="inline-flex items-center px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <BarChart3 className="w-5 h-5 mr-2" />
                View Live Demo
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CompetitorComparisonTable;
