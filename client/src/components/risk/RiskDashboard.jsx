import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import RiskWarning from './RiskWarning';
import { Caption, BodySmall } from '../ui/Typography';
import { getRiskSummary } from '../../utils/riskCalculations';

/**
 * RiskDashboard Component (B5)
 * 
 * Displays comprehensive risk overview with all 5 categories:
 * 1. Profitability Risk
 * 2. Break-Even Risk
 * 3. Cash Flow Risk
 * 4. Competition Risk
 * 5. Inventory Health Risk
 * 
 * Shows:
 * - Risk summary (critical/caution/safe counts)
 * - Overall risk assessment
 * - Individual risk warnings grouped by severity
 * - Dismiss/Accept functionality
 */
const RiskDashboard = ({ warnings = [], onDismissWarning, onAcceptWarning }) => {
  // Get risk summary
  const summary = getRiskSummary(warnings);
  
  // Filter warnings by level (excluding dismissed)
  const criticalWarnings = warnings.filter(w => w.level === 'red' && !w.dismissed);
  const cautionWarnings = warnings.filter(w => w.level === 'yellow' && !w.dismissed);
  const safeWarnings = warnings.filter(w => w.level === 'green' && !w.dismissed);

  // Get overall color scheme
  const getOverallColors = () => {
    switch (summary.overallLevel) {
      case 'red':
        return {
          border: 'border-red-500 dark:border-red-600',
          bg: 'bg-red-50 dark:bg-red-900/20',
          text: 'text-red-700 dark:text-red-400',
          iconBg: 'bg-red-100 dark:bg-red-800',
          icon: 'text-red-600 dark:text-red-400'
        };
      case 'yellow':
        return {
          border: 'border-yellow-500 dark:border-yellow-600',
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          text: 'text-yellow-700 dark:text-yellow-400',
          iconBg: 'bg-yellow-100 dark:bg-yellow-800',
          icon: 'text-yellow-600 dark:text-yellow-400'
        };
      case 'green':
        return {
          border: 'border-green-500 dark:border-green-600',
          bg: 'bg-green-50 dark:bg-green-900/20',
          text: 'text-green-700 dark:text-green-400',
          iconBg: 'bg-green-100 dark:bg-green-800',
          icon: 'text-green-600 dark:text-green-400'
        };
      default:
        return {
          border: 'border-gray-500 dark:border-gray-600',
          bg: 'bg-gray-50 dark:bg-gray-900/20',
          text: 'text-gray-700 dark:text-gray-400',
          iconBg: 'bg-gray-100 dark:bg-gray-800',
          icon: 'text-gray-600 dark:text-gray-400'
        };
    }
  };

  const overallColors = getOverallColors();

  return (
    <div className="space-y-6">
      {/* Overall Risk Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`border-2 rounded-xl p-6 shadow-lg ${overallColors.border} ${overallColors.bg}`}
      >
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${overallColors.iconBg}`}>
            <Shield className={`w-6 h-6 ${overallColors.icon}`} />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
              Risk Assessment
            </h2>
            <BodySmall className={`text-lg font-semibold ${overallColors.text}`}>
              {summary.overallMessage}
            </BodySmall>
          </div>
        </div>

        {/* Risk Counts Grid */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {/* Critical Risks */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border-2 border-red-500 dark:border-red-600">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <Caption className="text-red-700 dark:text-red-400 font-semibold">
                Critical Risks
              </Caption>
            </div>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
              {summary.critical}
            </div>
            <BodySmall className="text-slate-600 dark:text-slate-400">
              Immediate action required
            </BodySmall>
          </div>

          {/* Warnings */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border-2 border-yellow-500 dark:border-yellow-600">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <Caption className="text-yellow-700 dark:text-yellow-400 font-semibold">
                Warnings
              </Caption>
            </div>
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {summary.caution}
            </div>
            <BodySmall className="text-slate-600 dark:text-slate-400">
              Proceed with caution
            </BodySmall>
          </div>

          {/* Safe Areas */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border-2 border-green-500 dark:border-green-600">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <Caption className="text-green-700 dark:text-green-400 font-semibold">
                Safe Areas
              </Caption>
            </div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {summary.safe}
            </div>
            <BodySmall className="text-slate-600 dark:text-slate-400">
              All clear
            </BodySmall>
          </div>
        </div>
      </motion.div>

      {/* Critical Warnings Section */}
      <AnimatePresence>
        {criticalWarnings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <h3 className="text-lg font-bold text-red-600 dark:text-red-400">
                🔴 Critical Issues ({criticalWarnings.length})
              </h3>
            </div>
            <div className="space-y-3">
              {criticalWarnings.map((warning) => (
                <RiskWarning
                  key={warning.category}
                  warning={warning}
                  onDismiss={() => onDismissWarning(warning.category)}
                  onAccept={() => onAcceptWarning(warning.category)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Caution Warnings Section */}
      <AnimatePresence>
        {cautionWarnings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <h3 className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                ⚠️ Caution Areas ({cautionWarnings.length})
              </h3>
            </div>
            <div className="space-y-3">
              {cautionWarnings.map((warning) => (
                <RiskWarning
                  key={warning.category}
                  warning={warning}
                  onDismiss={() => onDismissWarning(warning.category)}
                  onAccept={() => onAcceptWarning(warning.category)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Safe Areas Section */}
      <AnimatePresence>
        {safeWarnings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h3 className="text-lg font-bold text-green-600 dark:text-green-400">
                ✅ All Clear ({safeWarnings.length})
              </h3>
            </div>
            <div className="space-y-3">
              {safeWarnings.map((warning) => (
                <RiskWarning
                  key={warning.category}
                  warning={warning}
                  onDismiss={() => onDismissWarning(warning.category)}
                  onAccept={() => onAcceptWarning(warning.category)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Warnings Message */}
      {warnings.length === 0 && (
        <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-xl p-6 text-center">
          <Info className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <Caption className="text-gray-600 dark:text-gray-400 mb-2">
            No Risk Data Available
          </Caption>
          <BodySmall className="text-gray-500 dark:text-gray-500">
            Complete a product calculation to see risk assessment.
          </BodySmall>
        </div>
      )}
    </div>
  );
};

export default RiskDashboard;
