import React from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, ShieldAlert, ShieldCheck, ShieldX, TrendingDown } from 'lucide-react';
import { calculateRiskAssessment } from '../../utils/riskAssessment';
import { Caption, MetricDisplay, BodySmall } from '../ui/Typography';

/**
 * Risk Assessment Card Component
 * Displays product risk score and detailed risk factors
 */
const RiskAssessmentCard = ({ result }) => {
  // Calculate risk assessment
  const risk = calculateRiskAssessment(result);
  
  // Get color classes based on risk level
  const getColorClasses = () => {
    const colors = {
      red: {
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-300 dark:border-red-700',
        text: 'text-red-600 dark:text-red-400',
        badge: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
        score: 'text-red-700 dark:text-red-300'
      },
      orange: {
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        border: 'border-orange-300 dark:border-orange-700',
        text: 'text-orange-600 dark:text-orange-400',
        badge: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
        score: 'text-orange-700 dark:text-orange-300'
      },
      yellow: {
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        border: 'border-yellow-300 dark:border-yellow-700',
        text: 'text-yellow-600 dark:text-yellow-400',
        badge: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300',
        score: 'text-yellow-700 dark:text-yellow-300'
      },
      green: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-300 dark:border-green-700',
        text: 'text-green-600 dark:text-green-400',
        badge: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
        score: 'text-green-700 dark:text-green-300'
      },
      emerald: {
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        border: 'border-emerald-300 dark:border-emerald-700',
        text: 'text-emerald-600 dark:text-emerald-400',
        badge: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
        score: 'text-emerald-700 dark:text-emerald-300'
      },
      gray: {
        bg: 'bg-gray-50 dark:bg-gray-900/20',
        border: 'border-gray-300 dark:border-gray-700',
        text: 'text-gray-600 dark:text-gray-400',
        badge: 'bg-gray-100 dark:bg-gray-900/40 text-gray-700 dark:text-gray-300',
        score: 'text-gray-700 dark:text-gray-300'
      }
    };
    
    return colors[risk.color] || colors.gray;
  };
  
  const colors = getColorClasses();
  
  // Get icon based on risk level
  const getIcon = () => {
    if (risk.score < 50) {
      return <AlertTriangle className="w-5 h-5" />;
    } else if (risk.score < 80) {
      return <TrendingDown className="w-5 h-5" />;
    } else {
      return <Shield className="w-5 h-5" />;
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className={`h-40 border-2 rounded-xl p-6 shadow-lg flex flex-col justify-center ${colors.bg} ${colors.border}`}
    >
      <div className="text-center mb-2">
        <Caption uppercase className="text-slate-800 dark:text-white flex items-center justify-center gap-2">
          <div className={colors.text}>
            {getIcon()}
          </div>
          Risk Assessment
        </Caption>
      </div>
      
      <div className="flex flex-col items-center justify-center mb-2">
        <MetricDisplay size="small" className={`mb-1 ${colors.score}`}>
          {risk.score}/100
        </MetricDisplay>
        <Caption uppercase className={`font-semibold ${colors.text} flex items-center gap-2`}>
          <span>{risk.level}</span>
        </Caption>
      </div>
      
      {/* Recommendation */}
      <div className="text-center">
        <BodySmall className="font-medium text-slate-800 dark:text-white">
          {risk.recommendation}
        </BodySmall>
        {risk.orderSize > 0 && (
          <Caption className={`${colors.text} font-semibold mt-1`}>
            Test order: {risk.orderSize} units
          </Caption>
        )}
      </div>
    </motion.div>
  );
};

export default RiskAssessmentCard;
