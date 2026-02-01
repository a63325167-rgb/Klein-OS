import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, TrendingUp, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { Caption, BodySmall } from '../ui/Typography';
import { getCashFlowColorClasses, formatCashFlowCurrency } from '../../utils/cashFlowCalculations';

/**
 * CashFlowCard Component (B4)
 * 
 * Displays precise 6-month cash runway analysis for FBA sellers.
 * Shows:
 * - Cash runway (months until cash = 0)
 * - Break-even month
 * - Required cash reserve
 * - Month-by-month cash position table
 * - Actionable recommendations
 * 
 * Color-coded by risk level:
 * - Green: >= 6 months runway (safe)
 * - Yellow: 3-6 months runway (caution)
 * - Red: < 3 months runway (crisis)
 */
const CashFlowCard = ({ cashFlowResult }) => {
  const [showMonthlyDetails, setShowMonthlyDetails] = useState(false);

  // Check if we have valid cash flow data
  if (!cashFlowResult || !cashFlowResult.isValid) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
          <div>
            <Caption className="text-gray-700 dark:text-gray-400 mb-1">
              Cash Flow Analysis Unavailable
            </Caption>
            <BodySmall className="text-gray-600 dark:text-gray-300">
              {cashFlowResult?.riskMessage || 'Complete product calculation to see cash flow runway.'}
            </BodySmall>
          </div>
        </div>
      </div>
    );
  }

  const {
    runway,
    runwayMonths,
    breakEvenMonth,
    monthlyDetails,
    requiredReserve,
    cashGap,
    riskLevel,
    riskMessage,
    recommendations,
    monthlyReorderCost,
    monthlyProfit,
    initialInventoryCost
  } = cashFlowResult;

  const colors = getCashFlowColorClasses(riskLevel);

  // Get icon based on risk level
  const getRiskIcon = () => {
    switch (riskLevel) {
      case 'green':
        return <CheckCircle className={`w-6 h-6 ${colors.icon}`} />;
      case 'yellow':
        return <AlertTriangle className={`w-6 h-6 ${colors.icon}`} />;
      case 'red':
        return <AlertTriangle className={`w-6 h-6 ${colors.icon}`} />;
      default:
        return <Wallet className={`w-6 h-6 ${colors.icon}`} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border-2 rounded-xl p-6 shadow-lg ${colors.border} ${colors.bg}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className={`p-2 rounded-lg ${colors.iconBg}`}>
          {getRiskIcon()}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">
            Cash Flow Health
          </h3>
          <BodySmall className={colors.text}>
            {riskMessage}
          </BodySmall>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Cash Runway */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <Caption className="text-slate-600 dark:text-slate-400 mb-1">
            Cash Runway
          </Caption>
          <div className={`text-3xl font-bold ${colors.text}`}>
            {runway.toFixed(1)}
          </div>
          <BodySmall className="text-slate-500 dark:text-slate-400">
            months
          </BodySmall>
        </div>

        {/* Break-Even Month */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <Caption className="text-slate-600 dark:text-slate-400 mb-1">
            Break-Even
          </Caption>
          <div className="text-3xl font-bold text-slate-800 dark:text-white">
            {breakEvenMonth >= 0 ? breakEvenMonth : '—'}
          </div>
          <BodySmall className="text-slate-500 dark:text-slate-400">
            {breakEvenMonth >= 0 ? `Month ${breakEvenMonth}` : 'Not in 12mo'}
          </BodySmall>
        </div>

        {/* Required Reserve */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <Caption className="text-slate-600 dark:text-slate-400 mb-1">
            Required Reserve
          </Caption>
          <div className="text-3xl font-bold text-slate-800 dark:text-white">
            {formatCashFlowCurrency(requiredReserve)}
          </div>
          <BodySmall className="text-slate-500 dark:text-slate-400">
            for 6mo safety
          </BodySmall>
        </div>

        {/* Cash Gap */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <Caption className="text-slate-600 dark:text-slate-400 mb-1">
            {cashGap > 0 ? 'Cash Needed' : 'Excess Cash'}
          </Caption>
          <div className={`text-3xl font-bold ${cashGap > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
            {formatCashFlowCurrency(Math.abs(cashGap))}
          </div>
          <BodySmall className="text-slate-500 dark:text-slate-400">
            {cashGap > 0 ? 'shortfall' : 'buffer'}
          </BodySmall>
        </div>
      </div>

      {/* Cash Flow Summary */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 mb-6">
        <Caption className="text-slate-600 dark:text-slate-400 mb-3">
          Monthly Cash Flow
        </Caption>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <BodySmall className="text-slate-600 dark:text-slate-400">
              Initial Inventory Cost
            </BodySmall>
            <span className="font-semibold text-red-600 dark:text-red-400">
              -{formatCashFlowCurrency(initialInventoryCost)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <BodySmall className="text-slate-600 dark:text-slate-400">
              Monthly Reorder Cost
            </BodySmall>
            <span className="font-semibold text-red-600 dark:text-red-400">
              -{formatCashFlowCurrency(monthlyReorderCost)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <BodySmall className="text-slate-600 dark:text-slate-400">
              Monthly Profit Inflow
            </BodySmall>
            <span className="font-semibold text-green-600 dark:text-green-400">
              +{formatCashFlowCurrency(monthlyProfit)}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
            <BodySmall className="font-bold text-slate-800 dark:text-white">
              Net Monthly Cash Flow
            </BodySmall>
            <span className={`text-lg font-bold ${
              monthlyProfit - monthlyReorderCost >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {monthlyProfit - monthlyReorderCost >= 0 ? '+' : ''}
              {formatCashFlowCurrency(monthlyProfit - monthlyReorderCost)}
            </span>
          </div>
        </div>
      </div>

      {/* Month-by-Month Details (Collapsible) */}
      <div className="mb-6">
        <button
          onClick={() => setShowMonthlyDetails(!showMonthlyDetails)}
          className="w-full flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <Caption className="font-semibold text-slate-800 dark:text-white">
            Month-by-Month Cash Position
          </Caption>
          {showMonthlyDetails ? (
            <ChevronUp className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          )}
        </button>

        <AnimatePresence>
          {showMonthlyDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-slate-300 dark:border-slate-700">
                      <th className="text-left py-2 px-2 font-semibold text-slate-700 dark:text-slate-300">
                        Month
                      </th>
                      <th className="text-right py-2 px-2 font-semibold text-slate-700 dark:text-slate-300">
                        Cash Start
                      </th>
                      <th className="text-right py-2 px-2 font-semibold text-slate-700 dark:text-slate-300">
                        Profit In
                      </th>
                      <th className="text-right py-2 px-2 font-semibold text-slate-700 dark:text-slate-300">
                        Reorder Out
                      </th>
                      <th className="text-right py-2 px-2 font-semibold text-slate-700 dark:text-slate-300">
                        Cash End
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyDetails.map((month) => (
                      <tr
                        key={month.month}
                        className={`border-b border-slate-200 dark:border-slate-800 ${
                          !month.isPositive ? 'bg-red-50 dark:bg-red-900/10' : ''
                        }`}
                      >
                        <td className="py-2 px-2 font-medium text-slate-700 dark:text-slate-300">
                          {month.month === 0 ? 'Start' : `Month ${month.month}`}
                        </td>
                        <td className="text-right py-2 px-2 text-slate-600 dark:text-slate-400">
                          {formatCashFlowCurrency(month.cashStart)}
                        </td>
                        <td className="text-right py-2 px-2 text-green-600 dark:text-green-400">
                          +{formatCashFlowCurrency(month.profitInflow)}
                        </td>
                        <td className="text-right py-2 px-2 text-red-600 dark:text-red-400">
                          -{formatCashFlowCurrency(month.reorderOutflow)}
                        </td>
                        <td className={`text-right py-2 px-2 font-bold ${
                          month.isPositive 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {formatCashFlowCurrency(month.cashEnd)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Recommendations */}
      <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
        <Caption className="font-semibold text-slate-800 dark:text-white mb-3">
          💡 Recommendations
        </Caption>
        <div className="space-y-2">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className={`flex items-start gap-2 p-3 rounded-lg ${
                rec.priority === 'critical' 
                  ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                  : rec.priority === 'high'
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                  : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
              }`}
            >
              <span className="text-lg">{rec.icon}</span>
              <BodySmall className={`flex-1 ${
                rec.priority === 'critical'
                  ? 'text-red-700 dark:text-red-300'
                  : rec.priority === 'high'
                  ? 'text-yellow-700 dark:text-yellow-300'
                  : 'text-blue-700 dark:text-blue-300'
              }`}>
                {rec.text}
              </BodySmall>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default CashFlowCard;
