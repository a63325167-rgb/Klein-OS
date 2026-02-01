import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, DollarSign, Package, Percent, RotateCcw } from 'lucide-react';
import {
  calculateCOGSScenario,
  calculatePriceScenario,
  calculateFeeScenario,
  calculateReturnScenario
} from '../../utils/scenarioCalculations';

/**
 * Individual Scenario Slider Component
 */
const ScenarioSlider = ({ 
  title, 
  icon: Icon, 
  min, 
  max, 
  step, 
  value, 
  onChange, 
  unit = '', 
  prefix = '',
  scenario,
  color = 'blue'
}) => {
  if (!scenario) return null;

  const colorClasses = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-600 dark:text-blue-400',
      slider: 'accent-blue-600'
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-600 dark:text-green-400',
      slider: 'accent-green-600'
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-800',
      text: 'text-amber-600 dark:text-amber-400',
      slider: 'accent-amber-600'
    },
    red: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-600 dark:text-red-400',
      slider: 'accent-red-600'
    }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div className={`min-h-96 ${colors.bg} border ${colors.border} rounded-xl p-6 flex flex-col`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${colors.text} bg-white dark:bg-slate-800`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-slate-800 dark:text-white">{title}</h4>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Adjust: <span className="font-mono font-semibold">{prefix}{Math.abs(value)}{unit}</span>
          </div>
        </div>
      </div>

      {/* Slider */}
      <div className="mb-4">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${colors.slider}`}
        />
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>{prefix}{min}{unit}</span>
          <span>{prefix}{max}{unit}</span>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 space-y-3">
        {scenario.results.map((result, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">{result.label}:</span>
            <span className={`font-semibold ${result.highlight ? colors.text : 'text-slate-800 dark:text-white'}`}>
              {result.value}
              {result.change && (
                <span className={`ml-1 text-xs ${result.changePositive ? 'text-green-600' : 'text-red-600'}`}>
                  ({result.changePositive ? '+' : ''}{result.change})
                </span>
              )}
            </span>
          </div>
        ))}
      </div>

      {/* Action */}
      {scenario.action && (
        <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-start gap-2">
            <span className="text-sm">💡</span>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <span className="font-semibold">Action:</span> {scenario.action}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Main Scenario Calculator Component
 */
const ScenarioCalculator = ({ result }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [cogsDiscount, setCogsDiscount] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [feePercent, setFeePercent] = useState(15);
  const [returnRate, setReturnRate] = useState(3);

  if (!result || !result.totals) {
    return null;
  }

  // Initialize fee percent from actual data
  const actualFeePercent = result.amazonFee && result.input 
    ? (result.amazonFee.amount / result.input.selling_price) * 100 
    : 15;

  // Calculate scenarios
  const cogsScenario = calculateCOGSScenario(result, cogsDiscount);
  const priceScenario = calculatePriceScenario(result, priceChange);
  const feeScenario = calculateFeeScenario(result, feePercent);
  const returnScenario = calculateReturnScenario(result, returnRate);

  // Reset all sliders
  const handleReset = () => {
    setCogsDiscount(0);
    setPriceChange(0);
    setFeePercent(actualFeePercent);
    setReturnRate(3);
  };

  // Format scenario data for display
  const scenarios = [
    {
      title: 'Negotiate Lower COGS',
      icon: Package,
      min: -30,
      max: 0,
      step: 1,
      value: cogsDiscount,
      onChange: setCogsDiscount,
      unit: '%',
      color: 'green',
      results: cogsScenario ? [
        { label: 'Current COGS', value: cogsScenario.formatted.currentCOGS },
        { label: 'New COGS', value: cogsScenario.formatted.newCOGS, change: `-${cogsScenario.formatted.cogsSavings}`, changePositive: true },
        { label: 'Current Margin', value: cogsScenario.formatted.currentMargin },
        { label: 'New Margin', value: cogsScenario.formatted.newMargin, change: `+${cogsScenario.formatted.marginImprovement}`, changePositive: true, highlight: true },
        { label: `Annual Savings (${cogsScenario.annualVolume} units)`, value: `${cogsScenario.formatted.annualSavings} 💰`, highlight: true }
      ] : [],
      action: cogsDiscount < 0 ? `Ask supplier for volume discount at ${cogsScenario?.annualVolume}+ units` : null
    },
    {
      title: 'Adjust Selling Price',
      icon: DollarSign,
      min: -50,
      max: 100,
      step: 5,
      value: priceChange,
      onChange: setPriceChange,
      unit: '',
      prefix: '€',
      color: 'blue',
      results: priceScenario ? [
        { label: 'Current Price', value: priceScenario.formatted.currentPrice },
        { label: 'New Price', value: priceScenario.formatted.newPrice, change: priceScenario.formatted.priceChange, changePositive: priceChange > 0 },
        { label: 'Current Margin', value: priceScenario.formatted.currentMargin },
        { label: 'New Margin', value: priceScenario.formatted.newMargin, change: `${priceChange > 0 ? '+' : ''}${priceScenario.formatted.marginImprovement}`, changePositive: priceChange > 0, highlight: true },
        { label: 'Demand Impact', value: `${priceScenario.formatted.demandImpactPercent} ${priceChange > 0 ? 'decrease' : 'increase'}` },
        { label: 'Annual Profit Change', value: priceScenario.formatted.profitChange, highlight: true }
      ] : [],
      action: priceScenario ? priceScenario.optimalPriceZone : null
    },
    {
      title: 'Amazon Fee Change',
      icon: Percent,
      min: 5,
      max: 25,
      step: 0.5,
      value: feePercent,
      onChange: setFeePercent,
      unit: '%',
      color: 'amber',
      results: feeScenario ? [
        { label: 'Current Fee', value: `${feeScenario.formatted.currentFeeAmount} (${feeScenario.formatted.currentFeePercent})` },
        { label: 'New Fee', value: `${feeScenario.formatted.newFeeAmount} (${feeScenario.formatted.newFeePercent})`, change: feeScenario.feeSavings > 0 ? `-${feeScenario.formatted.feeSavings}` : `+${feeScenario.formatted.feeSavings}`, changePositive: feeScenario.feeSavings > 0 },
        { label: 'Current Margin', value: feeScenario.formatted.currentMargin },
        { label: 'New Margin', value: feeScenario.formatted.newMargin, change: `${feeScenario.marginImprovement > 0 ? '+' : ''}${feeScenario.formatted.marginImprovement}`, changePositive: feeScenario.marginImprovement > 0, highlight: true },
        { label: `Annual Impact (${feeScenario.annualVolume} units)`, value: feeScenario.formatted.annualSavings, highlight: true }
      ] : [],
      action: feePercent < actualFeePercent ? 'Consider FBM or alternative platforms for lower fees' : null
    },
    {
      title: 'Return Rate Impact',
      icon: RotateCcw,
      min: 0,
      max: 50,
      step: 1,
      value: returnRate,
      onChange: setReturnRate,
      unit: '%',
      color: 'red',
      results: returnScenario ? [
        { label: 'Return Rate', value: returnScenario.formatted.returnRatePercent },
        { label: 'Cost Per Return', value: returnScenario.formatted.costPerReturn },
        { label: 'Expected Returns', value: `${returnScenario.formatted.expectedReturns} units/year` },
        { label: 'Current Margin', value: returnScenario.formatted.currentMargin },
        { label: 'Real Margin (after returns)', value: returnScenario.formatted.adjustedMargin, change: returnScenario.formatted.marginImpact, changePositive: false, highlight: true },
        { label: 'Annual Return Cost', value: returnScenario.formatted.annualReturnCost, highlight: true }
      ] : [],
      action: returnRate > 10 ? 'Add sizing charts, better product photos, and detailed descriptions to reduce returns' : null
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">What If...? Scenario Calculator</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Model different business scenarios with interactive sliders</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-slate-200 dark:border-slate-700"
          >
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Adjust the sliders below to see how changes impact your profitability
                </p>
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset All
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {scenarios.map((scenario, index) => (
                  <motion.div
                    key={scenario.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ScenarioSlider {...scenario} scenario={scenario} />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScenarioCalculator;
