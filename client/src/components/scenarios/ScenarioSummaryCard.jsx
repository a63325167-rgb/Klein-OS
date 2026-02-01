import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Target, Activity, DollarSign, Clock } from 'lucide-react';
import { Caption, BodySmall } from '../ui/Typography';
import { getComparisonColor } from '../../utils/scenarioCalculations';

/**
 * ScenarioSummaryCard Component (B3)
 * 
 * Displays cumulative impact of all scenario adjustments.
 * Shows key metrics comparison: profit, margin, break-even, health score.
 */
const ScenarioSummaryCard = ({ comparison, results, isAdjusted }) => {
  if (!isAdjusted || !comparison || !results) {
    return null;
  }

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Get overall impact sentiment
  const getOverallSentiment = () => {
    const positiveCount = [
      comparison.profitDelta > 0,
      comparison.marginDelta > 0,
      comparison.breakEvenDelta < 0, // Negative is good for break-even
      comparison.healthScoreDelta > 0
    ].filter(Boolean).length;

    if (positiveCount >= 3) return { color: 'green', label: 'Positive Impact', emoji: '✅' };
    if (positiveCount >= 2) return { color: 'yellow', label: 'Mixed Impact', emoji: '⚠️' };
    return { color: 'red', label: 'Negative Impact', emoji: '❌' };
  };

  const sentiment = getOverallSentiment();

  // Get sentiment colors
  const getSentimentColors = () => {
    switch (sentiment.color) {
      case 'green':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          text: 'text-green-700 dark:text-green-400',
          iconBg: 'bg-green-100 dark:bg-green-800'
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-800',
          text: 'text-yellow-700 dark:text-yellow-400',
          iconBg: 'bg-yellow-100 dark:bg-yellow-800'
        };
      case 'red':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          text: 'text-red-700 dark:text-red-400',
          iconBg: 'bg-red-100 dark:bg-red-800'
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-900/20',
          border: 'border-gray-200 dark:border-gray-800',
          text: 'text-gray-700 dark:text-gray-400',
          iconBg: 'bg-gray-100 dark:bg-gray-800'
        };
    }
  };

  const colors = getSentimentColors();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border-2 rounded-xl p-6 shadow-lg ${colors.bg} ${colors.border}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 rounded-lg ${colors.iconBg}`}>
          <Target className={`w-6 h-6 ${colors.text}`} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">
            Scenario Summary
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl">{sentiment.emoji}</span>
            <Caption className={colors.text}>
              {sentiment.label}
            </Caption>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Monthly Profit Impact */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <Caption className="text-slate-600 dark:text-slate-400">
              Monthly Profit
            </Caption>
          </div>
          <div className={`text-2xl font-bold ${
            getComparisonColor(comparison.profitDelta, 'profit').text
          }`}>
            {comparison.profitDelta > 0 ? '+' : ''}{formatCurrency(comparison.profitDelta)}
          </div>
          <BodySmall className={getComparisonColor(comparison.profitDelta, 'profit').text}>
            {comparison.profitDeltaPercent > 0 ? '+' : ''}{comparison.profitDeltaPercent.toFixed(1)}% change
          </BodySmall>
        </div>

        {/* Margin Impact */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <Caption className="text-slate-600 dark:text-slate-400">
              Profit Margin
            </Caption>
          </div>
          <div className={`text-2xl font-bold ${
            getComparisonColor(comparison.marginDelta, 'margin').text
          }`}>
            {comparison.marginDelta > 0 ? '+' : ''}{comparison.marginDelta.toFixed(1)}%
          </div>
          <BodySmall className={getComparisonColor(comparison.marginDelta, 'margin').text}>
            Margin {comparison.marginDelta > 0 ? 'improvement' : 'decline'}
          </BodySmall>
        </div>

        {/* Break-Even Change */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <Caption className="text-slate-600 dark:text-slate-400">
              Break-Even
            </Caption>
          </div>
          <div className={`text-2xl font-bold ${
            getComparisonColor(comparison.breakEvenDelta, 'breakeven').text
          }`}>
            {comparison.breakEvenDelta > 0 ? '+' : ''}{comparison.breakEvenDelta.toFixed(0)} days
          </div>
          <BodySmall className={getComparisonColor(comparison.breakEvenDelta, 'breakeven').text}>
            {comparison.breakEvenDelta < 0 ? 'Faster' : 'Slower'} recovery
          </BodySmall>
        </div>

        {/* Health Score Change */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <Caption className="text-slate-600 dark:text-slate-400">
              Health Score
            </Caption>
          </div>
          <div className={`text-2xl font-bold ${
            getComparisonColor(comparison.healthScoreDelta, 'health').text
          }`}>
            {comparison.healthScoreDelta > 0 ? '+' : ''}{comparison.healthScoreDelta.toFixed(0)}
          </div>
          <BodySmall className={getComparisonColor(comparison.healthScoreDelta, 'health').text}>
            {results.healthScore.toFixed(0)}/100 total
          </BodySmall>
        </div>
      </div>

      {/* Recommendation */}
      <div className="mt-4 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <Caption className="text-slate-600 dark:text-slate-400 mb-2">
          💡 Recommendation
        </Caption>
        <BodySmall className="text-slate-700 dark:text-slate-300">
          {sentiment.color === 'green' && (
            "These adjustments improve your product's profitability. Consider implementing these changes."
          )}
          {sentiment.color === 'yellow' && (
            "Mixed results. Some metrics improve while others decline. Review trade-offs carefully."
          )}
          {sentiment.color === 'red' && (
            "These adjustments negatively impact profitability. Consider alternative strategies."
          )}
        </BodySmall>
      </div>
    </motion.div>
  );
};

export default ScenarioSummaryCard;
