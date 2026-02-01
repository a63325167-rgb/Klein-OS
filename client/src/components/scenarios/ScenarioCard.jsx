import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, RotateCcw } from 'lucide-react';
import { Caption, BodySmall } from '../ui/Typography';
import { getComparisonColor } from '../../utils/scenarioCalculations';

/**
 * ScenarioCard Component (B3)
 * 
 * Interactive slider card for "What If" scenario analysis.
 * Shows real-time impact of adjustments on profit, margin, break-even, and health score.
 * 
 * Features:
 * - Slider with real-time value display
 * - Debounced recalculation (handled by parent)
 * - Before/after comparison with color coding
 * - Reset button to revert to baseline
 * - Visual feedback for improvements/declines
 */
const ScenarioCard = ({
  title,
  description,
  icon: Icon,
  baselineValue,
  currentValue,
  min,
  max,
  step,
  unit,
  formatValue,
  onChange,
  onReset,
  results,
  comparison,
  isAdjusted,
  adjustmentPercent
}) => {
  // Local state for immediate UI updates (before debounce)
  const [localValue, setLocalValue] = useState(currentValue);

  // Update local value when current value changes (from parent)
  useEffect(() => {
    setLocalValue(currentValue);
  }, [currentValue]);

  // Handle slider change
  const handleSliderChange = (e) => {
    const newValue = parseFloat(e.target.value);
    setLocalValue(newValue);
    onChange(newValue);
  };

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue)) {
      setLocalValue(newValue);
      onChange(newValue);
    }
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Get adjustment color
  const getAdjustmentColor = () => {
    if (!isAdjusted) return 'text-gray-600 dark:text-gray-400';
    if (adjustmentPercent > 0) return 'text-blue-600 dark:text-blue-400';
    if (adjustmentPercent < 0) return 'text-orange-600 dark:text-orange-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-slate-800 border-2 rounded-xl p-6 shadow-lg transition-all ${
        isAdjusted 
          ? 'border-blue-300 dark:border-blue-700' 
          : 'border-slate-200 dark:border-slate-700'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          {Icon && (
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-1">
              {title}
            </h3>
            <BodySmall className="text-slate-600 dark:text-slate-400">
              {description}
            </BodySmall>
          </div>
        </div>
        {isAdjusted && (
          <button
            onClick={onReset}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title="Reset to baseline"
          >
            <RotateCcw className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>
        )}
      </div>

      {/* Baseline Display */}
      <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
        <div className="flex justify-between items-center">
          <Caption className="text-slate-600 dark:text-slate-400">
            Baseline
          </Caption>
          <span className="text-sm font-semibold text-slate-800 dark:text-white">
            {formatValue ? formatValue(baselineValue) : `${baselineValue.toFixed(2)}${unit}`}
          </span>
        </div>
      </div>

      {/* Slider */}
      <div className="mb-4">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue}
          onChange={handleSliderChange}
          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer slider-thumb"
          style={{
            background: isAdjusted
              ? `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((localValue - min) / (max - min)) * 100}%, #e2e8f0 ${((localValue - min) / (max - min)) * 100}%, #e2e8f0 100%)`
              : undefined
          }}
        />
        <div className="flex justify-between items-center mt-2">
          <Caption className="text-slate-500 dark:text-slate-400">
            {formatValue ? formatValue(min) : `${min}${unit}`}
          </Caption>
          <Caption className="text-slate-500 dark:text-slate-400">
            {formatValue ? formatValue(max) : `${max}${unit}`}
          </Caption>
        </div>
      </div>

      {/* Current Value & Adjustment */}
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex justify-between items-center mb-2">
          <Caption className="text-blue-700 dark:text-blue-400">
            Current Value
          </Caption>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={localValue}
              onChange={handleInputChange}
              step={step}
              min={min}
              max={max}
              className="w-24 px-2 py-1 text-sm font-semibold text-right bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-700 rounded"
            />
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">
              {unit}
            </span>
          </div>
        </div>
        {isAdjusted && (
          <div className="flex justify-between items-center">
            <Caption className={getAdjustmentColor()}>
              Adjustment
            </Caption>
            <span className={`text-sm font-semibold ${getAdjustmentColor()}`}>
              {adjustmentPercent > 0 ? '+' : ''}{adjustmentPercent.toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* Results - Only show if adjusted */}
      <AnimatePresence>
        {isAdjusted && results && comparison && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 border-t border-slate-200 dark:border-slate-700 pt-4"
          >
            {/* Monthly Profit */}
            <div className="flex justify-between items-center">
              <Caption className="text-slate-600 dark:text-slate-400">
                Monthly Profit
              </Caption>
              <div className="text-right">
                <div className="text-sm font-semibold text-slate-800 dark:text-white">
                  {formatCurrency(results.totalMonthlyProfit)}
                </div>
                <div className={`text-xs font-semibold flex items-center gap-1 ${
                  getComparisonColor(comparison.profitDelta, 'profit').text
                }`}>
                  {comparison.profitDelta > 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : comparison.profitDelta < 0 ? (
                    <TrendingDown className="w-3 h-3" />
                  ) : (
                    <Minus className="w-3 h-3" />
                  )}
                  {comparison.profitDelta > 0 ? '+' : ''}{formatCurrency(comparison.profitDelta)}
                  {' '}({comparison.profitDeltaPercent > 0 ? '+' : ''}{comparison.profitDeltaPercent.toFixed(1)}%)
                </div>
              </div>
            </div>

            {/* Profit Margin */}
            <div className="flex justify-between items-center">
              <Caption className="text-slate-600 dark:text-slate-400">
                Profit Margin
              </Caption>
              <div className="text-right">
                <div className="text-sm font-semibold text-slate-800 dark:text-white">
                  {results.profitMarginPercent.toFixed(1)}%
                </div>
                <div className={`text-xs font-semibold ${
                  getComparisonColor(comparison.marginDelta, 'margin').text
                }`}>
                  {comparison.marginDelta > 0 ? '+' : ''}{comparison.marginDelta.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Break-Even */}
            <div className="flex justify-between items-center">
              <Caption className="text-slate-600 dark:text-slate-400">
                Break-Even
              </Caption>
              <div className="text-right">
                <div className="text-sm font-semibold text-slate-800 dark:text-white">
                  {results.daysToBreakEven.toFixed(0)} days
                </div>
                <div className={`text-xs font-semibold ${
                  getComparisonColor(comparison.breakEvenDelta, 'breakeven').text
                }`}>
                  {comparison.breakEvenDelta > 0 ? '+' : ''}{comparison.breakEvenDelta.toFixed(0)} days
                </div>
              </div>
            </div>

            {/* Health Score */}
            <div className="flex justify-between items-center">
              <Caption className="text-slate-600 dark:text-slate-400">
                Health Score
              </Caption>
              <div className="text-right">
                <div className="text-sm font-semibold text-slate-800 dark:text-white">
                  {results.healthScore.toFixed(0)}/100
                </div>
                <div className={`text-xs font-semibold ${
                  getComparisonColor(comparison.healthScoreDelta, 'health').text
                }`}>
                  {comparison.healthScoreDelta > 0 ? '+' : ''}{comparison.healthScoreDelta.toFixed(0)}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ScenarioCard;
