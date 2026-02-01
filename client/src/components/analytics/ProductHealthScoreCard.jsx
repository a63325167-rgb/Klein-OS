import React from 'react';
import { motion } from 'framer-motion';
import { Award, AlertTriangle, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { calculateProductHealthScore } from '../../utils/productHealthScore';
import { Caption, MetricDisplay, BodySmall } from '../ui/Typography';

/**
 * Product Health Score Card Component (B1 - Enhanced)
 * Displays a comprehensive 0-100 score based on 4 weighted factors:
 * - Break-Even Health (30%)
 * - Profit Margin Health (30%)
 * - Cash Flow Health (20%)
 * - Risk Assessment (20%)
 */
const ProductHealthScoreCard = ({ result }) => {
  // Calculate the product health score
  const { totalScore, factors, indicator } = calculateProductHealthScore(result);
  
  // Get color classes based on zone (green/yellow/red)
  const getScoreColor = (zone) => {
    if (zone === 'green') return 'text-green-600 dark:text-green-400';
    if (zone === 'yellow') return 'text-yellow-600 dark:text-yellow-400';
    if (zone === 'red') return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };
  
  // Get background color based on zone
  const getScoreBgColor = (zone) => {
    if (zone === 'green') return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    if (zone === 'yellow') return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    if (zone === 'red') return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
  };
  
  // Get icon based on zone
  const getStatusIcon = (zone) => {
    if (zone === 'green') return <CheckCircle className="w-5 h-5" />;
    if (zone === 'yellow') return <AlertTriangle className="w-5 h-5" />;
    if (zone === 'red') return <XCircle className="w-5 h-5" />;
    return <AlertCircle className="w-5 h-5" />;
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className={`h-40 border-2 rounded-xl p-6 shadow-lg flex flex-col justify-center ${getScoreBgColor(indicator.zone)}`}
    >
      <div className="text-center mb-2">
        <Caption uppercase className="text-slate-800 dark:text-white flex items-center justify-center gap-2">
          <Award className={`w-4 h-4 ${getScoreColor(indicator.zone)}`} />
          Product Health
        </Caption>
      </div>
      
      <div className="flex flex-col items-center justify-center mb-2">
        <MetricDisplay size="small" className={`mb-1 ${getScoreColor(indicator.zone)}`}>
          {totalScore}/100
        </MetricDisplay>
        <Caption uppercase className={`font-semibold ${getScoreColor(indicator.zone)}`}>
          {indicator.status}
        </Caption>
      </div>
      
      <div className="text-center">
        <div className="flex items-center justify-center gap-2">
          <span className={`p-1 rounded-full ${getScoreColor(indicator.zone)} bg-white dark:bg-slate-800`}>
            {getStatusIcon(indicator.zone)}
          </span>
          <BodySmall as="span" className="font-medium">{indicator.recommendation}</BodySmall>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductHealthScoreCard;
