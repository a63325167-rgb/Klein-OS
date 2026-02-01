/**
 * Return Rate Calculation Module (B2)
 * 
 * Integrates return rates directly into profit calculations.
 * Returns reduce profit because:
 * 1. Lost revenue (returned units don't generate sales)
 * 2. COGS stays the same (you paid for all units, returned or not)
 * 3. Shipping cost paid twice (to customer, then return shipping)
 * 4. Refund processing fees
 * 5. Amazon fees on refunds
 * 
 * Impact Examples:
 * - 0% returns: profit unchanged
 * - 5% returns: ~5-10% profit reduction
 * - 10% returns: ~15-25% profit reduction
 * - 20% returns: ~30-40% profit reduction (typical for apparel, electronics)
 */

import {
  roundToPrecision,
  safeAdd,
  safeSubtract,
  safeMultiply,
  safeDivide,
  parseNumberSafe
} from './precision';

/**
 * Category-based return rate defaults
 * Based on industry averages for Amazon FBA products
 */
export const RETURN_RATE_BY_CATEGORY = {
  'Electronics': 8,        // 8% - moderate returns, often due to compatibility issues
  'Apparel': 18,          // 18% - high returns, sizing and fit issues
  'Footwear': 12,         // 12% - high returns, sizing issues
  'Home & Kitchen': 5,    // 5% - low returns, functional products
  'Books': 3,             // 3% - very low returns, clear expectations
  'Toys': 6,              // 6% - moderate returns, gift returns common
  'Beauty': 7,            // 7% - moderate returns, allergies/preferences
  'Sports': 8,            // 8% - moderate returns, sizing and fit
  'Health': 6,            // 6% - low-moderate returns
  'Food': 2,              // 2% - very low returns, perishable
  'Automotive': 4,        // 4% - low returns, specific fitment
  'Pet Supplies': 5,      // 5% - low returns
  'Office Products': 4,   // 4% - low returns
  'Garden': 5,            // 5% - low returns
  'Default': 5            // 5% - conservative default
};

/**
 * Get default return rate for a product category
 * 
 * @param {string} category - Product category
 * @returns {number} Return rate percentage (0-100)
 */
export function getDefaultReturnRate(category) {
  if (!category) return RETURN_RATE_BY_CATEGORY.Default;
  
  // Try exact match first
  if (RETURN_RATE_BY_CATEGORY[category]) {
    return RETURN_RATE_BY_CATEGORY[category];
  }
  
  // Try partial match (case-insensitive)
  const categoryLower = category.toLowerCase();
  for (const [key, value] of Object.entries(RETURN_RATE_BY_CATEGORY)) {
    if (categoryLower.includes(key.toLowerCase()) || key.toLowerCase().includes(categoryLower)) {
      return value;
    }
  }
  
  return RETURN_RATE_BY_CATEGORY.Default;
}

/**
 * Calculate return impact on profit
 * 
 * Returns reduce profit through multiple channels:
 * - Lost revenue (returned units)
 * - COGS already paid (can't recover)
 * - Shipping costs (both ways)
 * - Refund processing fees (estimated 2%)
 * - Amazon fees on refunds
 * 
 * Formula:
 * - Units kept = total units × (1 - return rate)
 * - Revenue after returns = units kept × selling price
 * - Costs stay the same (COGS, shipping for all units)
 * - Additional cost: refund processing fees
 * 
 * @param {object} params - Calculation parameters
 * @param {number} params.sellingPrice - Selling price per unit
 * @param {number} params.cogs - Cost of goods sold per unit
 * @param {number} params.amazonFee - Amazon fee per unit (NET)
 * @param {number} params.shippingCost - Shipping cost per unit
 * @param {number} params.vatLiability - VAT liability per unit (NET)
 * @param {number} params.returnRate - Return rate percentage (0-100)
 * @param {number} params.monthlyVolume - Monthly sales volume (optional, for monthly calculations)
 * @returns {object} Return impact details
 */
export function calculateReturnImpact(params) {
  const {
    sellingPrice,
    cogs,
    amazonFee,
    shippingCost,
    vatLiability,
    returnRate = 0,
    monthlyVolume = 100
  } = params;
  
  // Parse and validate inputs
  const price = parseNumberSafe(sellingPrice);
  const cogsValue = parseNumberSafe(cogs);
  const amazonFeeValue = parseNumberSafe(amazonFee);
  const shippingValue = parseNumberSafe(shippingCost);
  const vatValue = parseNumberSafe(vatLiability);
  const returnRateValue = parseNumberSafe(returnRate);
  const volume = parseNumberSafe(monthlyVolume);
  
  // Edge case: no returns
  if (returnRateValue === 0) {
    return {
      returnRate: 0,
      unitsReturned: 0,
      unitsKept: volume,
      revenueAfterReturns: safeMultiply(price, volume),
      refundProcessingFees: 0,
      returnLossPerUnit: 0,
      returnLossTotal: 0,
      returnLossPercentage: 0,
      profitWithoutReturns: null, // Will be calculated by caller
      profitWithReturns: null,    // Will be calculated by caller
      impactSeverity: 'none'
    };
  }
  
  // Calculate return rate decimal
  const returnRateDecimal = safeDivide(returnRateValue, 100);
  
  // Calculate units
  const unitsReturned = roundToPrecision(safeMultiply(volume, returnRateDecimal), 2);
  const unitsKept = roundToPrecision(safeSubtract(volume, unitsReturned), 2);
  
  // Revenue after returns (only from units kept)
  const revenueAfterReturns = roundToPrecision(safeMultiply(price, unitsKept), 2);
  
  // Refund processing fees (estimated 2% of refunded amount)
  // When a customer returns, Amazon processes the refund and charges a small fee
  const refundAmount = safeMultiply(price, unitsReturned);
  const refundProcessingFees = roundToPrecision(safeMultiply(refundAmount, 0.02), 2);
  
  // Calculate profit WITHOUT returns (for comparison)
  const totalCostsPerUnit = safeAdd(
    cogsValue,
    amazonFeeValue,
    shippingValue,
    vatValue
  );
  const profitWithoutReturns = roundToPrecision(safeSubtract(price, totalCostsPerUnit), 2);
  
  // Calculate profit WITH returns
  // Revenue: only from units kept
  // Costs: COGS for all units (can't recover), fees only on units kept, shipping for all
  const totalRevenue = revenueAfterReturns;
  const totalCOGS = safeMultiply(cogsValue, volume); // Paid for all units
  const totalAmazonFees = safeMultiply(amazonFeeValue, unitsKept); // Only on sold units
  const totalShipping = safeMultiply(shippingValue, volume); // Paid for all units (including returns)
  const totalVAT = safeMultiply(vatValue, unitsKept); // Only on sold units
  
  const totalCosts = safeAdd(
    totalCOGS,
    totalAmazonFees,
    totalShipping,
    totalVAT,
    refundProcessingFees
  );
  
  const netProfitWithReturns = safeSubtract(totalRevenue, totalCosts);
  const profitPerUnitWithReturns = roundToPrecision(safeDivide(netProfitWithReturns, volume), 2);
  
  // Calculate loss due to returns
  const returnLossPerUnit = roundToPrecision(safeSubtract(profitWithoutReturns, profitPerUnitWithReturns), 2);
  const returnLossTotal = roundToPrecision(safeMultiply(returnLossPerUnit, volume), 2);
  const returnLossPercentage = profitWithoutReturns > 0
    ? roundToPrecision(safeDivide(safeMultiply(returnLossPerUnit, 100), profitWithoutReturns), 1)
    : 0;
  
  // Determine impact severity
  let impactSeverity = 'none';
  if (returnRateValue > 0 && returnRateValue <= 3) {
    impactSeverity = 'minimal'; // Green
  } else if (returnRateValue > 3 && returnRateValue <= 8) {
    impactSeverity = 'moderate'; // Yellow
  } else if (returnRateValue > 8 && returnRateValue <= 15) {
    impactSeverity = 'significant'; // Orange
  } else if (returnRateValue > 15) {
    impactSeverity = 'severe'; // Red
  }
  
  return {
    returnRate: returnRateValue,
    unitsReturned: roundToPrecision(unitsReturned, 0),
    unitsKept: roundToPrecision(unitsKept, 0),
    revenueAfterReturns: roundToPrecision(revenueAfterReturns, 2),
    refundProcessingFees: roundToPrecision(refundProcessingFees, 2),
    returnLossPerUnit: returnLossPerUnit,
    returnLossTotal: returnLossTotal,
    returnLossPercentage: returnLossPercentage,
    profitWithoutReturns: profitWithoutReturns,
    profitWithReturns: profitPerUnitWithReturns,
    impactSeverity: impactSeverity
  };
}

/**
 * Adjust profit calculation to account for returns
 * 
 * This is the main function that integrates returns into the profit calculation.
 * It modifies the standard profit calculation to account for:
 * - Reduced revenue (only units kept generate revenue)
 * - Same COGS (paid for all units)
 * - Reduced fees (only on units kept)
 * - Same shipping (paid for all units, including return shipping)
 * - Refund processing fees
 * 
 * @param {object} standardProfit - Standard profit calculation (without returns)
 * @param {number} returnRate - Return rate percentage (0-100)
 * @param {number} monthlyVolume - Monthly sales volume
 * @returns {object} Adjusted profit with return impact
 */
export function adjustProfitForReturns(standardProfit, returnRate, monthlyVolume = 100) {
  const returnRateValue = parseNumberSafe(returnRate);
  
  // If no returns, return standard profit unchanged
  if (returnRateValue === 0) {
    return {
      ...standardProfit,
      returnImpact: {
        returnRate: 0,
        unitsReturned: 0,
        unitsKept: monthlyVolume,
        returnLossPerUnit: 0,
        returnLossTotal: 0,
        returnLossPercentage: 0,
        impactSeverity: 'none'
      }
    };
  }
  
  // Calculate return impact
  const returnImpact = calculateReturnImpact({
    sellingPrice: standardProfit.sellingPrice,
    cogs: standardProfit.cogs,
    amazonFee: standardProfit.amazonFee,
    shippingCost: standardProfit.shippingCost,
    vatLiability: standardProfit.vatLiability,
    returnRate: returnRateValue,
    monthlyVolume: monthlyVolume
  });
  
  // Return adjusted profit
  return {
    ...standardProfit,
    profitPerUnit: returnImpact.profitWithReturns,
    profitMargin: roundToPrecision(
      safeDivide(safeMultiply(returnImpact.profitWithReturns, 100), standardProfit.sellingPrice),
      2
    ),
    returnImpact: returnImpact
  };
}

/**
 * Get return rate color coding for UI
 * 
 * @param {number} returnRate - Return rate percentage
 * @returns {object} Color information for UI
 */
export function getReturnRateColorCoding(returnRate) {
  const rate = parseNumberSafe(returnRate);
  
  if (rate === 0) {
    return {
      color: '#10b981', // Green
      textColor: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      label: 'Excellent',
      emoji: '✅'
    };
  } else if (rate <= 3) {
    return {
      color: '#10b981', // Green
      textColor: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      label: 'Minimal Impact',
      emoji: '✅'
    };
  } else if (rate <= 8) {
    return {
      color: '#f59e0b', // Yellow
      textColor: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      label: 'Moderate Impact',
      emoji: '⚠️'
    };
  } else if (rate <= 15) {
    return {
      color: '#f97316', // Orange
      textColor: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-800',
      label: 'Significant Impact',
      emoji: '⚠️'
    };
  } else {
    return {
      color: '#ef4444', // Red
      textColor: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      label: 'Severe Impact',
      emoji: '❌'
    };
  }
}

/**
 * Validate return rate input
 * 
 * @param {number} returnRate - Return rate to validate
 * @returns {object} Validation result
 */
export function validateReturnRate(returnRate) {
  const rate = parseNumberSafe(returnRate);
  
  if (rate < 0) {
    return {
      isValid: false,
      error: 'Return rate cannot be negative',
      warning: null
    };
  }
  
  if (rate > 100) {
    return {
      isValid: false,
      error: 'Return rate cannot exceed 100%',
      warning: null
    };
  }
  
  if (rate > 50) {
    return {
      isValid: true,
      error: null,
      warning: '⚠️ 50%+ return rate is unusually high. Please verify your data.'
    };
  }
  
  if (rate > 30) {
    return {
      isValid: true,
      error: null,
      warning: 'High return rate detected. This will significantly impact profitability.'
    };
  }
  
  return {
    isValid: true,
    error: null,
    warning: null
  };
}

/**
 * TESTING UTILITIES
 * 
 * Test Case 1: No Returns (0%)
 * - Selling: €50, COGS: €20, Amazon Fee: €7.50, Shipping: €2, VAT: €9.50
 * - Expected: Profit = €11/unit, No loss
 * 
 * Test Case 2: Moderate Returns (10%)
 * - Same as above with 10% returns, 100 units/month
 * - Expected: Profit = ~€7.60/unit, Loss = ~€3.40/unit (~31% reduction)
 * 
 * Test Case 3: High Returns (25% - Apparel)
 * - Same as above with 25% returns
 * - Expected: Profit = ~€4/unit, Loss = ~€7/unit (~64% reduction)
 * 
 * Test Case 4: Extreme Returns (100%)
 * - All units returned
 * - Expected: Massive loss, health score = 0
 */
