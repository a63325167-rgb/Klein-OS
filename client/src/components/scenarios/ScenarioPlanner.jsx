import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Package, TrendingDown, ShoppingCart, RotateCcw, Info } from 'lucide-react';
import { useScenario } from '../../hooks/useScenario';
import ScenarioCard from './ScenarioCard';
import ScenarioSummaryCard from './ScenarioSummaryCard';
import { Caption, BodySmall } from '../ui/Typography';

/**
 * ScenarioPlanner Component (B3)
 * 
 * Main "What If" scenario analysis interface.
 * Allows users to adjust 4 key parameters and see real-time impact:
 * 1. COGS (Cost of Goods Sold)
 * 2. Selling Price
 * 3. Return Rate
 * 4. Monthly Volume
 * 
 * Features:
 * - Real-time recalculation with debouncing
 * - Integration with B1 (Health Score) and B2 (Return Rate)
 * - Visual comparison with baseline
 * - Cumulative impact summary
 * - Reset all functionality
 */
const ScenarioPlanner = ({ result }) => {
  // Check if we have valid result data
  if (!result || !result.input || !result.totals) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <div>
            <Caption className="text-yellow-700 dark:text-yellow-400 mb-1">
              No Calculation Data
            </Caption>
            <BodySmall className="text-yellow-600 dark:text-yellow-300">
              Please run a product calculation first to use the Scenario Planner.
            </BodySmall>
          </div>
        </div>
      </div>
    );
  }

  // Initialize scenario hook with baseline product data
  const {
    baseline,
    adjusted,
    scenarioData,
    validation,
    isAdjusted,
    updateAdjustment,
    resetToBaseline,
    resetAdjustment,
    getAdjustmentStatus
  } = useScenario(result.input);

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Get adjustment statuses
  const cogsStatus = getAdjustmentStatus('cogs');
  const priceStatus = getAdjustmentStatus('sellingPrice');
  const returnStatus = getAdjustmentStatus('returnRate');
  const volumeStatus = getAdjustmentStatus('monthlyVolume');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
            Scenario Planner
          </h2>
          <BodySmall className="text-slate-600 dark:text-slate-400">
            Adjust parameters below to see real-time impact on profitability, break-even, and health score.
          </BodySmall>
        </div>
        {isAdjusted && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={resetToBaseline}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset All
          </motion.button>
        )}
      </div>

      {/* Validation Errors/Warnings */}
      {validation && !validation.isValid && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <Caption className="text-red-700 dark:text-red-400 mb-2">
            ❌ Validation Errors
          </Caption>
          <ul className="list-disc list-inside space-y-1">
            {validation.errors.map((error, index) => (
              <li key={index} className="text-sm text-red-600 dark:text-red-300">
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {validation && validation.warnings && validation.warnings.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
          <Caption className="text-yellow-700 dark:text-yellow-400 mb-2">
            ⚠️ Warnings
          </Caption>
          <ul className="list-disc list-inside space-y-1">
            {validation.warnings.map((warning, index) => (
              <li key={index} className="text-sm text-yellow-600 dark:text-yellow-300">
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Scenario Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* COGS Adjustment */}
        <ScenarioCard
          title="Negotiate Lower COGS"
          description="What if you negotiated better supplier prices?"
          icon={Package}
          baselineValue={baseline?.cogs || 0}
          currentValue={adjusted?.cogs || 0}
          min={(baseline?.cogs || 0) * 0.5}
          max={(baseline?.cogs || 0) * 1.2}
          step={0.01}
          unit="€"
          formatValue={formatCurrency}
          onChange={(value) => updateAdjustment('cogs', value)}
          onReset={() => resetAdjustment('cogs')}
          results={scenarioData?.results}
          comparison={scenarioData?.comparison}
          isAdjusted={cogsStatus.isAdjusted}
          adjustmentPercent={cogsStatus.percent}
        />

        {/* Price Adjustment */}
        <ScenarioCard
          title="Adjust Selling Price"
          description="How would raising or lowering price impact profit?"
          icon={DollarSign}
          baselineValue={baseline?.sellingPrice || 0}
          currentValue={adjusted?.sellingPrice || 0}
          min={(baseline?.sellingPrice || 0) * 0.7}
          max={(baseline?.sellingPrice || 0) * 1.5}
          step={0.01}
          unit="€"
          formatValue={formatCurrency}
          onChange={(value) => updateAdjustment('sellingPrice', value)}
          onReset={() => resetAdjustment('sellingPrice')}
          results={scenarioData?.results}
          comparison={scenarioData?.comparison}
          isAdjusted={priceStatus.isAdjusted}
          adjustmentPercent={priceStatus.percent}
        />

        {/* Return Rate Adjustment */}
        <ScenarioCard
          title="Adjust Return Rate"
          description="How sensitive is profit to return rate changes?"
          icon={TrendingDown}
          baselineValue={baseline?.returnRate || 0}
          currentValue={adjusted?.returnRate || 0}
          min={0}
          max={30}
          step={0.5}
          unit="%"
          onChange={(value) => updateAdjustment('returnRate', value)}
          onReset={() => resetAdjustment('returnRate')}
          results={scenarioData?.results}
          comparison={scenarioData?.comparison}
          isAdjusted={returnStatus.isAdjusted}
          adjustmentPercent={returnStatus.percent}
        />

        {/* Volume Adjustment */}
        <ScenarioCard
          title="Adjust Order Quantity"
          description="How does order size affect cash flow and break-even?"
          icon={ShoppingCart}
          baselineValue={baseline?.monthlyVolume || 0}
          currentValue={adjusted?.monthlyVolume || 0}
          min={(baseline?.monthlyVolume || 0) * 0.5}
          max={(baseline?.monthlyVolume || 0) * 2}
          step={1}
          unit=" units"
          onChange={(value) => updateAdjustment('monthlyVolume', value)}
          onReset={() => resetAdjustment('monthlyVolume')}
          results={scenarioData?.results}
          comparison={scenarioData?.comparison}
          isAdjusted={volumeStatus.isAdjusted}
          adjustmentPercent={volumeStatus.percent - 100} // Adjust for display (100% = no change)
        />
      </div>

      {/* Summary Card - Shows cumulative impact */}
      {isAdjusted && scenarioData && (
        <ScenarioSummaryCard
          comparison={scenarioData.comparison}
          results={scenarioData.results}
          isAdjusted={isAdjusted}
        />
      )}

      {/* Help Text */}
      {!isAdjusted && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <Caption className="text-blue-700 dark:text-blue-400 mb-2">
                💡 How to Use Scenario Planner
              </Caption>
              <BodySmall className="text-blue-600 dark:text-blue-300 space-y-2">
                <p>
                  1. <strong>Adjust sliders</strong> to test different scenarios (e.g., lower COGS, higher price)
                </p>
                <p>
                  2. <strong>See real-time impact</strong> on profit, margin, break-even, and health score
                </p>
                <p>
                  3. <strong>Compare with baseline</strong> to understand trade-offs
                </p>
                <p>
                  4. <strong>Reset individual sliders</strong> or all at once to start over
                </p>
              </BodySmall>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScenarioPlanner;
