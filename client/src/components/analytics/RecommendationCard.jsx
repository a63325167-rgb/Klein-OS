import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  TrendingUp,
  DollarSign,
  Package,
  Zap,
  BarChart3,
  Users,
  Award,
  ChevronDown,
  Calculator,
  Lightbulb
} from 'lucide-react';

const RecommendationCard = ({ recommendation, index }) => {
  const [showCalculation, setShowCalculation] = useState(false);

  const getIcon = (type) => {
    switch (type) {
      case 'pricing':
        return DollarSign;
      case 'cost':
        return TrendingUp;
      case 'logistics':
        return Package;
      case 'growth':
        return Zap;
      case 'tax':
        return BarChart3;
      case 'marketing':
        return Users;
      case 'operations':
        return Award;
      default:
        return Target;
    }
  };

  const getImpactStyle = (priority) => {
    switch (priority) {
      case 'high':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-300 dark:border-green-700',
          badge: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
          savingsBg: 'bg-green-600 dark:bg-green-500',
          savingsText: 'text-white'
        };
      case 'medium':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-300 dark:border-blue-700',
          badge: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
          savingsBg: 'bg-blue-600 dark:bg-blue-500',
          savingsText: 'text-white'
        };
      case 'low':
        return {
          bg: 'bg-slate-50 dark:bg-slate-800',
          border: 'border-slate-300 dark:border-slate-700',
          badge: 'bg-slate-100 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300',
          savingsBg: 'bg-slate-600 dark:bg-slate-500',
          savingsText: 'text-white'
        };
      default:
        return {
          bg: 'bg-slate-50 dark:bg-slate-800',
          border: 'border-slate-300 dark:border-slate-700',
          badge: 'bg-slate-100 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300',
          savingsBg: 'bg-slate-600 dark:bg-slate-500',
          savingsText: 'text-white'
        };
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const Icon = getIcon(recommendation.type);
  const styles = getImpactStyle(recommendation.priority);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.1,
        duration: 0.4,
        ease: 'easeOut'
      }}
      className={`relative ${styles.bg} border ${styles.border} rounded-xl overflow-hidden shadow-lg`}
    >
      {/* Header with Annual Savings */}
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{
                delay: index * 0.1 + 0.5,
                duration: 0.6,
                ease: 'easeInOut'
              }}
              className="w-10 h-10 bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-200 dark:border-slate-600"
            >
              <span className="text-2xl">{recommendation.icon}</span>
            </motion.div>
            <div className="flex-1">
              <h4 className="text-base font-semibold text-slate-800 dark:text-white mb-1">
                {recommendation.title}
              </h4>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${styles.badge}`}>
                  {recommendation.priority.toUpperCase()}
              </span>
                {recommendation.impact?.annual_savings && (
                  <div className={`px-3 py-1 rounded-md ${styles.savingsBg} ${styles.savingsText} text-sm font-bold`}>
                    {formatCurrency(recommendation.impact.annual_savings)}/year
                  </div>
                )}
              </div>
            </div>
          </div>
          <Icon className="w-5 h-5 text-slate-400 dark:text-slate-500 flex-shrink-0 ml-2" />
        </div>

        {/* Description */}
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
          {recommendation.description}
        </p>

        {/* Actionable Step */}
        {recommendation.actionable && (
          <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Action Step:
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {recommendation.actionable}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* How is this calculated? (Expandable) */}
      {recommendation.impact?.calculation && (
        <div className="border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setShowCalculation(!showCalculation)}
            className="w-full px-5 py-3 flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Calculator className="w-3.5 h-3.5" />
              How is this calculated?
            </span>
            <motion.div
              animate={{ rotate: showCalculation ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </button>
          
          <AnimatePresence>
            {showCalculation && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-4 bg-slate-100 dark:bg-slate-900/50">
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-mono text-slate-700 dark:text-slate-300 leading-relaxed">
                      {recommendation.impact.calculation}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default RecommendationCard;
