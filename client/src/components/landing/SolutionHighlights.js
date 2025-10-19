import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, 
  Euro, 
  BarChart3, 
  Lightbulb, 
  FileSpreadsheet,
  CheckCircle,
  ArrowRight,
  Info
} from 'lucide-react';

const SolutionHighlights = () => {
  const [hoveredFeature, setHoveredFeature] = useState(null);

  const features = [
    {
      icon: Globe,
      title: "EU VAT Mastery",
      description: "Accurate VAT calculations across 30 EU countries with country-specific rates and rules.",
      benefit: "Never miss VAT reclaim opportunities",
      tooltip: "Recover €4.17/unit VAT on average",
      color: "blue",
      gradient: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20",
      borderColor: "border-blue-200 dark:border-blue-700",
      iconColor: "text-blue-600 dark:text-blue-400",
      textColor: "text-blue-800 dark:text-blue-200"
    },
    {
      icon: Euro,
      title: "Input-VAT Reclaim",
      description: "Automatically calculate reclaimable VAT on COGS, fees, and shipping costs.",
      benefit: "Maximize your VAT refunds",
      tooltip: "Save €2,085 on 500 units",
      color: "green",
      gradient: "from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20",
      borderColor: "border-green-200 dark:border-green-700",
      iconColor: "text-green-600 dark:text-green-400",
      textColor: "text-green-800 dark:text-green-200"
    },
    {
      icon: BarChart3,
      title: "Break-Even & Scenario Planning",
      description: "Calculate break-even points and test pricing scenarios with real-time impact analysis.",
      benefit: "Make data-driven pricing decisions",
      tooltip: "Identify profitable price points",
      color: "amber",
      gradient: "from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20",
      borderColor: "border-amber-200 dark:border-amber-700",
      iconColor: "text-amber-600 dark:text-amber-400",
      textColor: "text-amber-800 dark:text-amber-200"
    },
    {
      icon: Lightbulb,
      title: "AI-Driven Recommendations",
      description: "Get actionable insights on pricing, packaging, and PPC optimization with quantified impact.",
      benefit: "Optimize every business decision",
      tooltip: "Average 15% profit increase",
      color: "purple",
      gradient: "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20",
      borderColor: "border-purple-200 dark:border-purple-700",
      iconColor: "text-purple-600 dark:text-purple-400",
      textColor: "text-purple-800 dark:text-purple-200"
    },
    {
      icon: FileSpreadsheet,
      title: "Portfolio Comparison",
      description: "Analyze 500+ SKUs simultaneously with bulk upload and side-by-side profitability comparison.",
      benefit: "Scale your product portfolio",
      tooltip: "Compare 500+ SKUs in seconds",
      color: "indigo",
      gradient: "from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20",
      borderColor: "border-indigo-200 dark:border-indigo-700",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      textColor: "text-indigo-800 dark:text-indigo-200"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const cardVariants = {
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
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="py-20 bg-white dark:bg-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm font-medium mb-6">
            <CheckCircle className="w-4 h-4 mr-2" />
            Our Solution
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Everything You Need to
            <span className="block bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Maximize Amazon Profits
            </span>
          </h2>
          
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            From EU VAT complexity to AI-powered insights—our platform handles every aspect 
            of Amazon FBA profitability analysis.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              onHoverStart={() => setHoveredFeature(index)}
              onHoverEnd={() => setHoveredFeature(null)}
              whileHover={{ 
                y: -8,
                scale: 1.05,
                transition: { duration: 0.3 }
              }}
              className={`relative bg-gradient-to-br ${feature.gradient} rounded-2xl p-6 border-2 ${feature.borderColor} shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group`}
            >
              {/* Icon */}
              <div className="flex items-center justify-center w-16 h-16 bg-white dark:bg-slate-800 rounded-xl shadow-md mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className={`w-8 h-8 ${feature.iconColor}`} />
              </div>

              {/* Title */}
              <h3 className={`text-lg font-bold ${feature.textColor} mb-3`}>
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-slate-600 dark:text-slate-300 mb-4 text-sm leading-relaxed">
                {feature.description}
              </p>

              {/* Benefit */}
              <div className={`inline-flex items-center px-3 py-2 bg-white dark:bg-slate-800 ${feature.borderColor} rounded-lg text-xs font-medium ${feature.textColor} shadow-sm mb-4`}>
                <CheckCircle className="w-3 h-3 mr-2" />
                {feature.benefit}
              </div>

              {/* Tooltip */}
              {hoveredFeature === index && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full bg-slate-900 dark:bg-slate-700 text-white text-xs px-3 py-2 rounded-lg shadow-lg z-10"
                >
                  <div className="flex items-center gap-2">
                    <Info className="w-3 h-3" />
                    <span>{feature.tooltip}</span>
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900 dark:border-t-slate-700"></div>
                </motion.div>
              )}

              {/* Hover Arrow */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ 
                  opacity: hoveredFeature === index ? 1 : 0,
                  x: hoveredFeature === index ? 0 : -10
                }}
                className="absolute bottom-4 right-4"
              >
                <ArrowRight className={`w-4 h-4 ${feature.iconColor}`} />
              </motion.div>

              {/* Decorative Elements */}
              <div className="absolute top-4 right-4 w-2 h-2 bg-current opacity-20 rounded-full group-hover:scale-150 transition-transform duration-300"></div>
              <div className="absolute bottom-4 left-4 w-1 h-1 bg-current opacity-30 rounded-full group-hover:scale-200 transition-transform duration-300"></div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-700"
        >
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">30</div>
              <div className="text-slate-600 dark:text-slate-300">EU Countries</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">€4.17</div>
              <div className="text-slate-600 dark:text-slate-300">Avg VAT Savings/Unit</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-2">15%</div>
              <div className="text-slate-600 dark:text-slate-300">Profit Increase</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">500+</div>
              <div className="text-slate-600 dark:text-slate-300">SKUs Analyzed</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SolutionHighlights;
