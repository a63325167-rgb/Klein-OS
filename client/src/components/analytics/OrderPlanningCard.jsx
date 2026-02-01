import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, DollarSign, TrendingUp, AlertCircle, CheckCircle, Calendar } from 'lucide-react';
import { calculateOptimalOrderQuantity } from '../../utils/orderQuantityCalculator';

/**
 * Order Planning Card Component
 * Displays optimal order quantity recommendation with detailed breakdown
 */
const OrderPlanningCard = ({ result }) => {
  const [customCash, setCustomCash] = useState('');
  const [useCustomCash, setUseCustomCash] = useState(false);
  
  if (!result || !result.totals) {
    return null;
  }

  // Calculate optimal order quantity
  const cashAmount = useCustomCash && customCash ? parseFloat(customCash) : null;
  const orderPlan = calculateOptimalOrderQuantity(result, cashAmount);
  
  if (!orderPlan) {
    return null;
  }

  const { constraints, risk, formatted, scalePlan } = orderPlan;

  // Get risk color classes
  const getRiskColorClasses = () => {
    const colors = {
      red: {
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-300 dark:border-red-700',
        text: 'text-red-600 dark:text-red-400',
        badge: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
      },
      yellow: {
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        border: 'border-yellow-300 dark:border-yellow-700',
        text: 'text-yellow-600 dark:text-yellow-400',
        badge: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300'
      },
      green: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-300 dark:border-green-700',
        text: 'text-green-600 dark:text-green-400',
        badge: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
      }
    };
    return colors[risk.color] || colors.green;
  };

  const riskColors = getRiskColorClasses();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 border-2 border-blue-200 dark:border-blue-700 rounded-xl overflow-hidden shadow-lg"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 px-6 py-4 border-b border-blue-200 dark:border-blue-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 dark:bg-blue-500 rounded-lg">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Recommended Order Quantity</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Optimized for cash flow, storage, and demand</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Main Recommendation */}
        <div className="text-center">
          <div className="text-sm text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide font-semibold">
            First Order
          </div>
          <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            {formatted.optimalQuantity} units
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Total Investment: {formatted.totalCost}
          </div>
        </div>

        {/* Cash Input (Optional) */}
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            <input
              type="checkbox"
              checked={useCustomCash}
              onChange={(e) => setUseCustomCash(e.target.checked)}
              className="rounded"
            />
            Customize available cash
          </label>
          {useCustomCash && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">€</span>
              <input
                type="number"
                value={customCash}
                onChange={(e) => setCustomCash(e.target.value)}
                placeholder="Enter available cash"
                className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
              />
            </div>
          )}
        </div>

        {/* Why This Quantity? */}
        <div>
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wide">
            Why This Quantity?
          </h4>
          
          <div className="space-y-3">
            {/* Cash Constraint */}
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${constraints.cash.isLimiting ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                <DollarSign className={`w-4 h-4 ${constraints.cash.isLimiting ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-800 dark:text-white">
                  Your cash: {formatted.cashAvailable} available
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  {constraints.cash.isLimiting 
                    ? `Enough for ${constraints.cash.maxUnits} units (limiting factor)`
                    : `Enough for ${constraints.cash.maxUnits} units (${constraints.cash.utilizationPercent.toFixed(0)}% utilized)`
                  }
                </div>
              </div>
            </div>

            {/* Demand Constraint */}
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${constraints.demand.isLimiting ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                <TrendingUp className={`w-4 h-4 ${constraints.demand.isLimiting ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-800 dark:text-white">
                  Demand: {formatted.annualVolume} units/year forecast
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  {formatted.optimalQuantity} units = {orderPlan.weeksOfSupply} weeks supply ({Math.round(orderPlan.daysOfSupply / 30)} months)
                </div>
              </div>
            </div>

            {/* Storage Constraint */}
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${constraints.storage.isLimiting ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                <Package className={`w-4 h-4 ${constraints.storage.isLimiting ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-800 dark:text-white">
                  Storage: {formatted.monthlyStorageCost}/month for {formatted.optimalQuantity} units
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  {constraints.storage.isLimiting 
                    ? 'Optimal 3-month turnover (limiting factor)'
                    : 'Within optimal storage range'
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className={`${riskColors.bg} border ${riskColors.border} rounded-lg p-4`}>
          <div className="flex items-start gap-3">
            {risk.level === 'LOW' ? (
              <CheckCircle className={`w-5 h-5 ${riskColors.text} mt-0.5`} />
            ) : (
              <AlertCircle className={`w-5 h-5 ${riskColors.text} mt-0.5`} />
            )}
            <div className="flex-1">
              <div className={`text-sm font-semibold ${riskColors.text} mb-1`}>
                {risk.level} RISK
              </div>
              <div className="text-sm text-slate-700 dark:text-slate-300">
                {risk.message}
              </div>
            </div>
          </div>
        </div>

        {/* Reorder Trigger */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">
                Reorder Trigger
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                When {formatted.reorderPoint} units remain (approximately 2 weeks of supply)
              </div>
            </div>
          </div>
        </div>

        {/* Scale Plan */}
        <div>
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wide flex items-center gap-2">
            💡 Scale Plan
          </h4>
          
          <div className="space-y-3">
            {scalePlan.map((step, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-800 dark:text-white">
                    {step.milestone}
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    → {step.action}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    {step.benefit}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Limiting Factor Note */}
        {orderPlan.limitingReason && (
          <div className="text-xs text-slate-500 dark:text-slate-400 italic border-t border-slate-200 dark:border-slate-700 pt-4">
            Note: {orderPlan.limitingReason}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default OrderPlanningCard;
