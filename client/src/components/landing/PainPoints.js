import React from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  Calculator, 
  FileSpreadsheet, 
  TrendingDown,
  Euro,
  Clock,
  Target
} from 'lucide-react';

const PainPoints = () => {
  const painPoints = [
    {
      icon: Calculator,
      title: "Inaccurate Profit Calculations",
      description: "Most tools ignore EU VAT complexity and input-VAT reclaim—costing you 10–20% of profit.",
      impact: "€4.17/unit average VAT error",
      color: "red",
      gradient: "from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20",
      borderColor: "border-red-200 dark:border-red-700",
      iconColor: "text-red-600 dark:text-red-400",
      textColor: "text-red-800 dark:text-red-200"
    },
    {
      icon: FileSpreadsheet,
      title: "Data Silos & Manual Spreadsheets",
      description: "Juggle Excel, Seller Central, and APIs. Wasted hours on fragmented data.",
      impact: "15+ hours/week on manual analysis",
      color: "amber",
      gradient: "from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20",
      borderColor: "border-amber-200 dark:border-amber-700",
      iconColor: "text-amber-600 dark:text-amber-400",
      textColor: "text-amber-800 dark:text-amber-200"
    },
    {
      icon: TrendingDown,
      title: "Guesswork vs Data",
      description: "No break-even, no scenario planning. You're flying blind on thousands of SKUs.",
      impact: "30% of products lose money",
      color: "purple",
      gradient: "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20",
      borderColor: "border-purple-200 dark:border-purple-700",
      iconColor: "text-purple-600 dark:text-purple-400",
      textColor: "text-purple-800 dark:text-purple-200"
    }
  ];

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
          <div className="inline-flex items-center px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-full text-sm font-medium mb-6">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Common Pain Points
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Are You Losing Money on
            <span className="block text-red-600 dark:text-red-400">
              Hidden Costs?
            </span>
          </h2>
          
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Most Amazon sellers lose 10-20% of their profits due to inaccurate calculations, 
            especially in complex EU markets with VAT complexity.
          </p>
        </motion.div>

        {/* Pain Points Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8"
        >
          {painPoints.map((point, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ 
                y: -8,
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
              className={`relative bg-gradient-to-br ${point.gradient} rounded-2xl p-8 border-2 ${point.borderColor} shadow-lg hover:shadow-xl transition-all duration-300`}
            >
              {/* Icon */}
              <div className="flex items-center justify-center w-16 h-16 bg-white dark:bg-slate-800 rounded-xl shadow-md mb-6">
                <point.icon className={`w-8 h-8 ${point.iconColor}`} />
              </div>

              {/* Title */}
              <h3 className={`text-xl font-bold ${point.textColor} mb-4`}>
                {point.title}
              </h3>

              {/* Description */}
              <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                {point.description}
              </p>

              {/* Impact Badge */}
              <div className={`inline-flex items-center px-3 py-2 bg-white dark:bg-slate-800 ${point.borderColor} rounded-lg text-sm font-medium ${point.textColor} shadow-sm`}>
                <Target className="w-4 h-4 mr-2" />
                {point.impact}
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-4 right-4 w-2 h-2 bg-current opacity-20 rounded-full"></div>
              <div className="absolute bottom-4 left-4 w-1 h-1 bg-current opacity-30 rounded-full"></div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-700 max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center gap-2">
                <Euro className="w-6 h-6 text-green-600 dark:text-green-400" />
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">€4.17</span>
                <span className="text-slate-600 dark:text-slate-300">average VAT error per unit</span>
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Stop Losing Money to Calculation Errors
            </h3>
            
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
              Our EU VAT calculator recovers an average of €4.17 per unit in hidden VAT savings— 
              that's €2,085 saved on just 500 units.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <Calculator className="w-5 h-5 mr-2" />
                Calculate Your Savings
              </button>
              
              <button className="inline-flex items-center px-6 py-3 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold rounded-lg border-2 border-slate-300 dark:border-slate-600 hover:border-blue-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <Clock className="w-5 h-5 mr-2" />
                See 2-Min Demo
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PainPoints;
