import React from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Caption, BodySmall } from '../ui/Typography';

/**
 * Return Impact Card Component (B2)
 * 
 * Displays the impact of product returns on profitability.
 * Shows:
 * - Return rate percentage
 * - Loss per unit due to returns
 * - Total monthly loss
 * - Percentage reduction in profit
 * - Visual severity indicator
 */
const ReturnImpactCard = ({ result }) => {
  // Check if return impact data exists
  if (!result || !result.returnImpact) {
    return null; // Don't show card if no return data
  }
  
  const { returnImpact, totals } = result;
  
  // If no returns, show success message
  if (returnImpact.returnRate === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-6 shadow-lg"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <Caption uppercase className="text-green-700 dark:text-green-400 mb-1">
              No Returns Expected
            </Caption>
            <BodySmall className="text-green-600 dark:text-green-300">
              0% return rate - Excellent product quality. Profit not reduced by returns.
            </BodySmall>
          </div>
        </div>
      </motion.div>
    );
  }
  
  // Determine severity colors
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'minimal':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          text: 'text-green-700 dark:text-green-400',
          iconBg: 'bg-green-100 dark:bg-green-800',
          icon: 'text-green-600 dark:text-green-400',
          label: 'Minimal Impact'
        };
      case 'moderate':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-800',
          text: 'text-yellow-700 dark:text-yellow-400',
          iconBg: 'bg-yellow-100 dark:bg-yellow-800',
          icon: 'text-yellow-600 dark:text-yellow-400',
          label: 'Moderate Impact'
        };
      case 'significant':
        return {
          bg: 'bg-orange-50 dark:bg-orange-900/20',
          border: 'border-orange-200 dark:border-orange-800',
          text: 'text-orange-700 dark:text-orange-400',
          iconBg: 'bg-orange-100 dark:bg-orange-800',
          icon: 'text-orange-600 dark:text-orange-400',
          label: 'Significant Impact'
        };
      case 'severe':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          text: 'text-red-700 dark:text-red-400',
          iconBg: 'bg-red-100 dark:bg-red-800',
          icon: 'text-red-600 dark:text-red-400',
          label: 'Severe Impact'
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-900/20',
          border: 'border-gray-200 dark:border-gray-800',
          text: 'text-gray-700 dark:text-gray-400',
          iconBg: 'bg-gray-100 dark:bg-gray-800',
          icon: 'text-gray-600 dark:text-gray-400',
          label: 'Unknown'
        };
    }
  };
  
  const colors = getSeverityColor(returnImpact.impactSeverity);
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
      className={`border-2 rounded-xl p-6 shadow-lg ${colors.bg} ${colors.border}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className={`p-2 rounded-lg ${colors.iconBg}`}>
          <TrendingDown className={`w-5 h-5 ${colors.icon}`} />
        </div>
        <div className="flex-1">
          <Caption uppercase className={`${colors.text} mb-1`}>
            Return Impact Analysis
          </Caption>
          <BodySmall className={colors.text}>
            {colors.label} - {returnImpact.returnRate}% return rate
          </BodySmall>
        </div>
      </div>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Units Returned */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
          <Caption className="text-slate-600 dark:text-slate-400 mb-1">
            Units Returned
          </Caption>
          <div className="text-lg font-bold text-slate-800 dark:text-white">
            {returnImpact.unitsReturned} / {returnImpact.unitsReturned + returnImpact.unitsKept}
          </div>
          <Caption className="text-slate-500 dark:text-slate-400">
            {returnImpact.returnRate}% of sales
          </Caption>
        </div>
        
        {/* Loss Per Unit */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
          <Caption className="text-slate-600 dark:text-slate-400 mb-1">
            Loss Per Unit
          </Caption>
          <div className={`text-lg font-bold ${colors.text}`}>
            -{formatCurrency(returnImpact.returnLossPerUnit)}
          </div>
          <Caption className="text-slate-500 dark:text-slate-400">
            {returnImpact.returnLossPercentage.toFixed(1)}% reduction
          </Caption>
        </div>
      </div>
      
      {/* Profit Comparison */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
        <div className="space-y-3">
          {/* Without Returns */}
          <div className="flex justify-between items-center">
            <Caption className="text-slate-600 dark:text-slate-400">
              Profit (without returns)
            </Caption>
            <span className="font-semibold text-slate-800 dark:text-white">
              {formatCurrency(returnImpact.profitWithoutReturns)}
            </span>
          </div>
          
          {/* Return Loss */}
          <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
            <Caption className={colors.text}>
              Return Loss
            </Caption>
            <span className={`font-semibold ${colors.text}`}>
              -{formatCurrency(returnImpact.returnLossPerUnit)}
            </span>
          </div>
          
          {/* Final Profit */}
          <div className="flex justify-between items-center pt-2 border-t-2 border-slate-300 dark:border-slate-600">
            <Caption className="font-bold text-slate-800 dark:text-white">
              Net Profit (after returns)
            </Caption>
            <span className={`text-lg font-bold ${
              returnImpact.profitWithReturns >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {formatCurrency(returnImpact.profitWithReturns)}
            </span>
          </div>
        </div>
      </div>
      
      {/* Info Message */}
      <div className="mt-4 flex items-start gap-2">
        <Info className={`w-4 h-4 mt-0.5 flex-shrink-0 ${colors.icon}`} />
        <BodySmall className={colors.text}>
          Returns reduce profit because you pay for COGS and shipping on all units (including returns), 
          but only receive revenue from units kept. Refund processing fees add additional costs.
        </BodySmall>
      </div>
    </motion.div>
  );
};

export default ReturnImpactCard;
