import React from 'react';
import { motion } from 'framer-motion';
import { 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2,
  Info,
  Sparkles
} from 'lucide-react';

const InsightCard = ({ insight, index }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
      case 'danger':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Lightbulb className="w-5 h-5" />;
    }
  };

  const getColors = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-300 dark:border-green-700',
          icon: 'text-green-600 dark:text-green-400',
          title: 'text-green-700 dark:text-green-300'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-300 dark:border-yellow-700',
          icon: 'text-yellow-600 dark:text-yellow-400',
          title: 'text-yellow-700 dark:text-yellow-300'
        };
      case 'info':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-300 dark:border-blue-700',
          icon: 'text-blue-600 dark:text-blue-400',
          title: 'text-blue-700 dark:text-blue-300'
        };
      case 'danger':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-300 dark:border-red-700',
          icon: 'text-red-600 dark:text-red-400',
          title: 'text-red-700 dark:text-red-300'
        };
      default:
        return {
          bg: 'bg-slate-50 dark:bg-slate-800',
          border: 'border-slate-300 dark:border-slate-700',
          icon: 'text-slate-600 dark:text-slate-400',
          title: 'text-slate-700 dark:text-slate-300'
        };
    }
  };

  const colors = getColors(insight.type);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay: index * 0.1,
        duration: 0.4,
        ease: 'easeOut'
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className={`relative ${colors.bg} border ${colors.border} rounded-xl p-5 shadow-lg overflow-hidden group`}
    >
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start gap-3">
          <div className={`${colors.icon} mt-0.5 flex-shrink-0`}>
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ 
                delay: index * 0.1 + 0.5,
                duration: 0.5,
                ease: 'easeInOut'
              }}
            >
              <span className="text-2xl">{insight.icon}</span>
            </motion.div>
          </div>
          
          <div className="flex-1">
            <h4 className={`text-lg font-semibold ${colors.title} mb-2`}>
              {insight.title}
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {insight.description}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const InsightFeed = ({ insights, performanceTier }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
            Business Intelligence Insights
          </h3>
        </div>

        {/* Performance badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={`px-4 py-2 rounded-full border ${
            performanceTier.color === 'green' 
              ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300'
              : performanceTier.color === 'blue'
              ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
              : performanceTier.color === 'yellow'
              ? 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300'
              : performanceTier.color === 'orange'
              ? 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300'
              : 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300'
          }`}
        >
          <span className="text-lg mr-2">{performanceTier.emoji}</span>
          <span className="font-semibold">{performanceTier.tier}</span>
        </motion.div>
      </motion.div>

      {/* Performance description */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
      >
        <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
          {performanceTier.description}
        </p>
      </motion.div>

      {/* Insights grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, index) => (
          <InsightCard key={index} insight={insight} index={index} />
        ))}
      </div>

      {/* AI Analysis footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: insights.length * 0.1 + 0.3 }}
        className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
      >
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1">
              AI-Powered Analysis
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              These insights are generated in real-time based on your product data, market trends, and historical performance patterns. 
              They update dynamically as you modify your inputs to provide the most relevant recommendations.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default InsightFeed;
