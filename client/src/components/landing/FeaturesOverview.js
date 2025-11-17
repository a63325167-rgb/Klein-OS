import React from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, 
  Euro, 
  BarChart3, 
  Lightbulb, 
  FileSpreadsheet,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const FeaturesOverview = () => {
  const features = [
    {
      icon: Globe,
      title: "EU VAT Mastery",
      description: "30 countries, accurate rates",
      color: "blue",
      gradient: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20",
      borderColor: "border-blue-200 dark:border-blue-700",
      iconColor: "text-blue-600 dark:text-blue-400",
      textColor: "text-blue-800 dark:text-blue-200"
    },
    {
      icon: Euro,
      title: "Input-VAT Reclaim",
      description: "Maximize your refunds",
      color: "green",
      gradient: "from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20",
      borderColor: "border-green-200 dark:border-green-700",
      iconColor: "text-green-600 dark:text-green-400",
      textColor: "text-green-800 dark:text-green-200"
    },
    {
      icon: BarChart3,
      title: "Break-Even Analysis",
      description: "Real-time scenario planning",
      color: "amber",
      gradient: "from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20",
      borderColor: "border-amber-200 dark:border-amber-700",
      iconColor: "text-amber-600 dark:text-amber-400",
      textColor: "text-amber-800 dark:text-amber-200"
    },
    {
      icon: Lightbulb,
      title: "AI Recommendations",
      description: "Actionable insights",
      color: "purple",
      gradient: "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20",
      borderColor: "border-purple-200 dark:border-purple-700",
      iconColor: "text-purple-600 dark:text-purple-400",
      textColor: "text-purple-800 dark:text-purple-200"
    },
    {
      icon: FileSpreadsheet,
      title: "Bulk Analysis",
      description: "500+ SKUs in seconds",
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
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
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

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <section id="features" className="py-16 bg-slate-50 dark:bg-slate-900">
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
            <CheckCircle className="w-4 h-4 mr-2" />
            Key Features
          </div>
          
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
            Everything You Need for Amazon Success
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ 
                y: -8,
                scale: 1.05,
                transition: { duration: 0.3 }
              }}
              onClick={() => scrollToSection('demo')}
              className={`relative bg-gradient-to-br ${feature.gradient} rounded-xl p-6 border-2 ${feature.borderColor} shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group`}
            >
              {/* Icon */}
              <div className="flex items-center justify-center w-12 h-12 bg-white dark:bg-slate-800 rounded-lg shadow-md mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
              </div>

              {/* Title */}
              <h3 className={`text-lg font-bold ${feature.textColor} mb-2 text-center`}>
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-slate-600 dark:text-slate-300 text-sm text-center mb-4">
                {feature.description}
              </p>

              {/* Arrow */}
              <div className="flex justify-center">
                <ArrowRight className={`w-4 h-4 ${feature.iconColor} group-hover:translate-x-1 transition-transform duration-300`} />
              </div>

            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <button
            onClick={() => scrollToSection('demo')}
            className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            Try Interactive Demo
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesOverview;
