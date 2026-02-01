/**
 * Scenario Calculation Utilities (B3 - Enhanced)
 * Provides "What If" calculations for different business scenarios
 * Integrates with B1 (Health Score) and B2 (Return Rate) calculations
 */

import { calculateProductAnalysis } from './calculations';
import { calculateProductHealthScore } from './productHealthScore';
import { calculateReturnImpact } from './returnRateCalculations';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2
  }).format(value || 0);
};

const formatPercent = (value) => {
  return `${value.toFixed(1)}%`;
};

/**
 * Calculate COGS discount scenario
 */
export function calculateCOGSScenario(result, discountPercent) {
  if (!result || !result.totals || !result.input) {
    return null;
  }

  const currentCOGS = parseFloat(result.input.buying_price) || 0;
  const sellingPrice = parseFloat(result.input.selling_price) || 0;
  const currentMargin = result.totals.profit_margin || 0;
  const currentProfit = result.totals.net_profit || 0;
  const annualVolume = parseInt(result.input.annual_volume) || 500;
  const totalCost = result.totals.total_cost || 0;

  // Calculate new COGS with discount
  const discount = Math.abs(discountPercent) / 100;
  const newCOGS = currentCOGS * (1 - discount);
  const cogsSavings = currentCOGS - newCOGS;

  // Calculate new total cost (reduce by COGS savings)
  const newTotalCost = totalCost - cogsSavings;
  
  // Calculate new profit and margin
  const newProfit = sellingPrice - newTotalCost;
  const newMargin = (newProfit / sellingPrice) * 100;
  
  // Calculate annual savings
  const annualSavings = cogsSavings * annualVolume;
  
  // Calculate margin improvement
  const marginImprovement = newMargin - currentMargin;
  const profitImprovement = newProfit - currentProfit;

  return {
    currentCOGS,
    newCOGS,
    cogsSavings,
    currentMargin,
    newMargin,
    marginImprovement,
    currentProfit,
    newProfit,
    profitImprovement,
    annualSavings,
    annualVolume,
    formatted: {
      currentCOGS: formatCurrency(currentCOGS),
      newCOGS: formatCurrency(newCOGS),
      cogsSavings: formatCurrency(cogsSavings),
      currentMargin: formatPercent(currentMargin),
      newMargin: formatPercent(newMargin),
      marginImprovement: formatPercent(marginImprovement),
      currentProfit: formatCurrency(currentProfit),
      newProfit: formatCurrency(newProfit),
      profitImprovement: formatCurrency(profitImprovement),
      annualSavings: formatCurrency(annualSavings)
    }
  };
}

/**
 * Calculate price change scenario
 */
export function calculatePriceScenario(result, priceChange) {
  if (!result || !result.totals || !result.input) {
    return null;
  }

  const currentPrice = parseFloat(result.input.selling_price) || 0;
  const currentMargin = result.totals.profit_margin || 0;
  const currentProfit = result.totals.net_profit || 0;
  const totalCost = result.totals.total_cost || 0;
  const annualVolume = parseInt(result.input.annual_volume) || 500;

  // Calculate new price
  const newPrice = currentPrice + priceChange;
  
  // Calculate new profit and margin
  const newProfit = newPrice - totalCost;
  const newMargin = (newProfit / newPrice) * 100;
  
  // Estimate demand impact (simplified elasticity model)
  // Assume 1% price increase = 0.5% demand decrease
  const priceChangePercent = (priceChange / currentPrice) * 100;
  const demandImpactPercent = -priceChangePercent * 0.5;
  const newVolume = Math.round(annualVolume * (1 + demandImpactPercent / 100));
  
  // Calculate annual revenue impact
  const currentAnnualRevenue = currentPrice * annualVolume;
  const newAnnualRevenue = newPrice * newVolume;
  const revenueChange = newAnnualRevenue - currentAnnualRevenue;
  
  // Calculate annual profit impact
  const currentAnnualProfit = currentProfit * annualVolume;
  const newAnnualProfit = newProfit * newVolume;
  const profitChange = newAnnualProfit - currentAnnualProfit;
  
  // Calculate margin improvement
  const marginImprovement = newMargin - currentMargin;
  const profitImprovement = newProfit - currentProfit;

  // Determine optimal price zone
  let optimalPriceZone = 'Current price is optimal';
  if (newMargin > 35 && demandImpactPercent > -10) {
    optimalPriceZone = 'Good balance of margin and demand';
  } else if (newMargin < 20) {
    optimalPriceZone = 'Price too low - leaving money on table';
  } else if (demandImpactPercent < -20) {
    optimalPriceZone = 'Price too high - demand impact too severe';
  }

  return {
    currentPrice,
    newPrice,
    priceChange,
    currentMargin,
    newMargin,
    marginImprovement,
    currentProfit,
    newProfit,
    profitImprovement,
    currentVolume: annualVolume,
    newVolume,
    volumeChange: newVolume - annualVolume,
    demandImpactPercent,
    currentAnnualRevenue,
    newAnnualRevenue,
    revenueChange,
    currentAnnualProfit,
    newAnnualProfit,
    profitChange,
    optimalPriceZone,
    formatted: {
      currentPrice: formatCurrency(currentPrice),
      newPrice: formatCurrency(newPrice),
      priceChange: formatCurrency(priceChange),
      currentMargin: formatPercent(currentMargin),
      newMargin: formatPercent(newMargin),
      marginImprovement: formatPercent(marginImprovement),
      currentProfit: formatCurrency(currentProfit),
      newProfit: formatCurrency(newProfit),
      profitImprovement: formatCurrency(profitImprovement),
      demandImpactPercent: formatPercent(Math.abs(demandImpactPercent)),
      revenueChange: formatCurrency(revenueChange),
      profitChange: formatCurrency(profitChange)
    }
  };
}

/**
 * Calculate fee change scenario
 */
export function calculateFeeScenario(result, newFeePercent) {
  if (!result || !result.totals || !result.input) {
    return null;
  }

  const sellingPrice = parseFloat(result.input.selling_price) || 0;
  const currentMargin = result.totals.profit_margin || 0;
  const currentProfit = result.totals.net_profit || 0;
  const totalCost = result.totals.total_cost || 0;
  const annualVolume = parseInt(result.input.annual_volume) || 500;
  const amazonFee = result.amazonFee || { amount: 0 };
  
  // Calculate current fee
  const currentFeeAmount = amazonFee.amount || 0;
  const currentFeePercent = sellingPrice > 0 ? (currentFeeAmount / sellingPrice) * 100 : 0;
  
  // Calculate new fee
  const newFeeAmount = (sellingPrice * newFeePercent) / 100;
  const feeSavings = currentFeeAmount - newFeeAmount;
  
  // Calculate new total cost
  const newTotalCost = totalCost - feeSavings;
  
  // Calculate new profit and margin
  const newProfit = sellingPrice - newTotalCost;
  const newMargin = (newProfit / sellingPrice) * 100;
  
  // Calculate annual savings
  const annualSavings = feeSavings * annualVolume;
  
  // Calculate improvements
  const marginImprovement = newMargin - currentMargin;
  const profitImprovement = newProfit - currentProfit;

  return {
    currentFeePercent,
    newFeePercent,
    currentFeeAmount,
    newFeeAmount,
    feeSavings,
    currentMargin,
    newMargin,
    marginImprovement,
    currentProfit,
    newProfit,
    profitImprovement,
    annualSavings,
    annualVolume,
    formatted: {
      currentFeePercent: formatPercent(currentFeePercent),
      newFeePercent: formatPercent(newFeePercent),
      currentFeeAmount: formatCurrency(currentFeeAmount),
      newFeeAmount: formatCurrency(newFeeAmount),
      feeSavings: formatCurrency(feeSavings),
      currentMargin: formatPercent(currentMargin),
      newMargin: formatPercent(newMargin),
      marginImprovement: formatPercent(marginImprovement),
      currentProfit: formatCurrency(currentProfit),
      newProfit: formatCurrency(newProfit),
      profitImprovement: formatCurrency(profitImprovement),
      annualSavings: formatCurrency(annualSavings)
    }
  };
}

/**
 * Calculate return rate scenario
 */
export function calculateReturnScenario(result, returnRatePercent) {
  if (!result || !result.totals || !result.input) {
    return null;
  }

  const sellingPrice = parseFloat(result.input.selling_price) || 0;
  const currentMargin = result.totals.profit_margin || 0;
  const currentProfit = result.totals.net_profit || 0;
  const annualVolume = parseInt(result.input.annual_volume) || 500;
  const shipping = result.shipping || { cost: 0 };
  const cogs = parseFloat(result.input.buying_price) || 0;
  
  // Calculate cost per return (shipping + 10% restocking/processing)
  const shippingCost = shipping.cost || 0;
  const costPerReturn = shippingCost + (cogs * 0.1);
  
  // Calculate return impact
  const returnRate = returnRatePercent / 100;
  const expectedReturns = annualVolume * returnRate;
  const totalReturnCost = expectedReturns * costPerReturn;
  const returnCostPerUnit = totalReturnCost / annualVolume;
  
  // Calculate adjusted profit and margin
  const adjustedProfit = currentProfit - returnCostPerUnit;
  const adjustedMargin = (adjustedProfit / sellingPrice) * 100;
  
  // Calculate margin impact
  const marginImpact = adjustedMargin - currentMargin;
  const profitImpact = adjustedProfit - currentProfit;
  
  // Calculate annual impact
  const annualReturnCost = totalReturnCost;

  return {
    returnRatePercent,
    costPerReturn,
    expectedReturns,
    currentMargin,
    adjustedMargin,
    marginImpact,
    currentProfit,
    adjustedProfit,
    profitImpact,
    returnCostPerUnit,
    annualReturnCost,
    annualVolume,
    formatted: {
      returnRatePercent: formatPercent(returnRatePercent),
      costPerReturn: formatCurrency(costPerReturn),
      expectedReturns: Math.round(expectedReturns),
      currentMargin: formatPercent(currentMargin),
      adjustedMargin: formatPercent(adjustedMargin),
      marginImpact: formatPercent(marginImpact),
      currentProfit: formatCurrency(currentProfit),
      adjustedProfit: formatCurrency(adjustedProfit),
      profitImpact: formatCurrency(profitImpact),
      returnCostPerUnit: formatCurrency(returnCostPerUnit),
      annualReturnCost: formatCurrency(annualReturnCost)
    }
  };
}

/**
 * B3: Real-Time Scenario Recalculation Engine
 * 
 * Recalculates ALL metrics when user adjusts scenario sliders.
 * Integrates with B1 (Health Score) and B2 (Return Rate) automatically.
 * 
 * @param {object} baselineProduct - Original product data
 * @param {object} adjustments - Slider adjustments {cogs, sellingPrice, returnRate, monthlyVolume}
 * @returns {object} Complete recalculated results with comparison
 */
export function recalculateScenario(baselineProduct, adjustments) {
  if (!baselineProduct || !adjustments) {
    return null;
  }

  // Create adjusted product data
  const adjustedProduct = {
    ...baselineProduct,
    buying_price: adjustments.cogs !== undefined ? adjustments.cogs : baselineProduct.buying_price,
    selling_price: adjustments.sellingPrice !== undefined ? adjustments.sellingPrice : baselineProduct.selling_price,
    return_rate: adjustments.returnRate !== undefined ? adjustments.returnRate : baselineProduct.return_rate,
    monthly_volume: adjustments.monthlyVolume !== undefined ? adjustments.monthlyVolume : baselineProduct.monthly_volume,
    annual_volume: adjustments.monthlyVolume !== undefined ? adjustments.monthlyVolume * 12 : baselineProduct.annual_volume
  };

  // Recalculate with adjusted values (uses B2 return rate integration automatically)
  const adjustedResult = calculateProductAnalysis(adjustedProduct);
  
  // Calculate health score (uses B1 calculation with B2-adjusted profit)
  const adjustedHealthScore = calculateProductHealthScore(adjustedResult);

  // Get baseline results for comparison
  const baselineResult = calculateProductAnalysis(baselineProduct);
  const baselineHealthScore = calculateProductHealthScore(baselineResult);

  // Extract key metrics
  const results = {
    // Profit metrics
    profitPerUnit: adjustedResult.totals.net_profit,
    profitPerUnitWithoutReturns: adjustedResult.totals.net_profit_without_returns,
    totalMonthlyProfit: adjustedResult.totals.net_profit * (adjustments.monthlyVolume || baselineProduct.monthly_volume || 100),
    profitMarginPercent: adjustedResult.totals.profit_margin,
    
    // Health & Break-even (from B1)
    healthScore: adjustedHealthScore.totalScore,
    daysToBreakEven: adjustedHealthScore.factors.find(f => f.name === 'Break-Even Health')?.daysToBreakEven || 0,
    
    // Return impact (from B2)
    returnRate: adjustedResult.input.return_rate,
    returnLossMonthly: adjustedResult.returnImpact ? adjustedResult.returnImpact.returnLossTotal : 0,
    
    // Cash flow
    monthlyInventoryCost: adjustedProduct.buying_price * (adjustments.monthlyVolume || baselineProduct.monthly_volume || 100),
    cashFlowHealth: adjustedHealthScore.factors.find(f => f.name === 'Cash Flow Health')?.score || 0,
    
    // ROI
    roiPercent: adjustedResult.totals.roi_percent
  };

  // Calculate comparison vs baseline
  const baselineMonthlyProfit = baselineResult.totals.net_profit * (baselineProduct.monthly_volume || 100);
  
  const comparison = {
    profitDelta: results.totalMonthlyProfit - baselineMonthlyProfit,
    profitDeltaPercent: baselineMonthlyProfit !== 0 
      ? ((results.totalMonthlyProfit - baselineMonthlyProfit) / baselineMonthlyProfit) * 100 
      : 0,
    marginDelta: results.profitMarginPercent - baselineResult.totals.profit_margin,
    breakEvenDelta: results.daysToBreakEven - (baselineHealthScore.factors.find(f => f.name === 'Break-Even Health')?.daysToBreakEven || 0),
    healthScoreDelta: results.healthScore - baselineHealthScore.totalScore,
    roiDelta: results.roiPercent - baselineResult.totals.roi_percent
  };

  // Calculate adjustment percentages for display
  const adjustmentPercents = {
    cogsAdjustPercent: baselineProduct.buying_price !== 0 
      ? ((adjustedProduct.buying_price - baselineProduct.buying_price) / baselineProduct.buying_price) * 100 
      : 0,
    priceAdjustPercent: baselineProduct.selling_price !== 0 
      ? ((adjustedProduct.selling_price - baselineProduct.selling_price) / baselineProduct.selling_price) * 100 
      : 0,
    returnAdjustPercent: adjustedProduct.return_rate - (baselineProduct.return_rate || 0),
    quantityAdjustPercent: (baselineProduct.monthly_volume || 100) !== 0 
      ? ((adjustedProduct.monthly_volume || 100) / (baselineProduct.monthly_volume || 100)) * 100 
      : 100
  };

  // Determine if any adjustment was made
  const isAdjusted = 
    Math.abs(adjustmentPercents.cogsAdjustPercent) > 0.01 ||
    Math.abs(adjustmentPercents.priceAdjustPercent) > 0.01 ||
    Math.abs(adjustmentPercents.returnAdjustPercent) > 0.01 ||
    Math.abs(adjustmentPercents.quantityAdjustPercent - 100) > 0.01;

  return {
    results,
    comparison,
    adjustmentPercents,
    isAdjusted,
    adjustedResult, // Full result object for detailed analysis
    baselineResult  // Baseline for reference
  };
}

/**
 * Compare two scenario results
 * 
 * @param {object} baseline - Baseline scenario results
 * @param {object} adjusted - Adjusted scenario results
 * @returns {object} Comparison deltas
 */
export function compareScenarios(baseline, adjusted) {
  if (!baseline || !adjusted) {
    return {
      profitDelta: 0,
      profitDeltaPercent: 0,
      marginDelta: 0,
      breakEvenDelta: 0,
      healthScoreDelta: 0,
      roiDelta: 0
    };
  }

  return {
    profitDelta: adjusted.totalMonthlyProfit - baseline.totalMonthlyProfit,
    profitDeltaPercent: baseline.totalMonthlyProfit !== 0 
      ? ((adjusted.totalMonthlyProfit - baseline.totalMonthlyProfit) / baseline.totalMonthlyProfit) * 100 
      : 0,
    marginDelta: adjusted.profitMarginPercent - baseline.profitMarginPercent,
    breakEvenDelta: adjusted.daysToBreakEven - baseline.daysToBreakEven,
    healthScoreDelta: adjusted.healthScore - baseline.healthScore,
    roiDelta: adjusted.roiPercent - baseline.roiPercent
  };
}

/**
 * Get color coding for comparison deltas
 * 
 * @param {number} delta - Change value
 * @param {string} metric - Metric type ('profit', 'margin', 'breakeven', 'health')
 * @returns {object} Color classes for UI
 */
export function getComparisonColor(delta, metric) {
  // For break-even, negative is good (faster break-even)
  if (metric === 'breakeven') {
    if (delta < -5) return { text: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', icon: '✅' };
    if (delta < 0) return { text: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', icon: '↗️' };
    if (delta > 5) return { text: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', icon: '❌' };
    if (delta > 0) return { text: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', icon: '↘️' };
    return { text: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-900/20', icon: '=' };
  }

  // For all other metrics, positive is good
  if (delta > 5) return { text: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', icon: '✅' };
  if (delta > 0) return { text: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', icon: '↗️' };
  if (delta < -5) return { text: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', icon: '❌' };
  if (delta < 0) return { text: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', icon: '↘️' };
  return { text: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-900/20', icon: '=' };
}

/**
 * Validate scenario adjustments
 * 
 * @param {object} adjustments - Proposed adjustments
 * @param {object} baseline - Baseline values
 * @returns {object} Validation result with errors/warnings
 */
export function validateScenarioAdjustments(adjustments, baseline) {
  const errors = [];
  const warnings = [];

  // Validate COGS
  if (adjustments.cogs !== undefined) {
    if (adjustments.cogs <= 0) {
      errors.push('COGS must be greater than 0');
    }
    if (adjustments.cogs > adjustments.sellingPrice) {
      warnings.push('COGS exceeds selling price - product will operate at a loss');
    }
  }

  // Validate selling price
  if (adjustments.sellingPrice !== undefined) {
    if (adjustments.sellingPrice <= 0) {
      errors.push('Selling price must be greater than 0');
    }
    if (adjustments.sellingPrice < adjustments.cogs) {
      warnings.push('Selling price below COGS - product will operate at a loss');
    }
  }

  // Validate return rate
  if (adjustments.returnRate !== undefined) {
    if (adjustments.returnRate < 0) {
      errors.push('Return rate cannot be negative');
    }
    if (adjustments.returnRate > 100) {
      errors.push('Return rate cannot exceed 100%');
    }
    if (adjustments.returnRate > 50) {
      warnings.push('Return rate above 50% is unusually high');
    }
  }

  // Validate monthly volume
  if (adjustments.monthlyVolume !== undefined) {
    if (adjustments.monthlyVolume <= 0) {
      errors.push('Monthly volume must be greater than 0');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
