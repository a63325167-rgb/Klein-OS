/**
 * Centralized Calculation Service
 * Pure functions for all business calculations
 * Version: 2.0.0
 */

import {
  roundToPrecision,
  safeAdd,
  safeSubtract,
  safeMultiply,
  safeDivide,
  calculatePercentage,
  parseNumberSafe
} from './precision';
import { calculateVATBreakdown } from './simpleCalculator';

// Constants
export const CALCULATION_VERSION = '2.0.0';

export const KLEINPAKET_LIMITS = {
  MAX_LENGTH_CM: 35.3,
  MAX_WIDTH_CM: 25.0,
  MAX_HEIGHT_CM: 8.0,
  MAX_WEIGHT_KG: 1.0,
  MAX_PRICE_EUR: 60.0
};

export const SHIPPING_COSTS = {
  KLEINPAKET: 3.79,
  STANDARD: 5.50,
  REGISTERED: 9.99,
  EXPRESS: 19.99,
  HEAVY: 15.50
};

export const AMAZON_FEES_BY_CATEGORY = {
  'Electronics': 8,
  'Food': 15,
  'Health': 8,
  'Beauty': 15,
  'Books': 15,
  'Apparel': 17,
  'Default': 15
};

export const VAT_RATES_BY_COUNTRY = {
  'Germany': 19,
  'France': 20,
  'Italy': 22,
  'Spain': 21,
  'Netherlands': 21,
  'Belgium': 21,
  'Austria': 20,
  'Sweden': 25,
  'Denmark': 25,
  'Finland': 24,
  'Poland': 23,
  'Czech Republic': 21,
  'Hungary': 27,
  'Portugal': 23,
  'Greece': 24,
  'Slovakia': 20,
  'Slovenia': 22,
  'Croatia': 25,
  'Romania': 19,
  'Bulgaria': 20,
  'Lithuania': 21,
  'Latvia': 21,
  'Estonia': 20,
  'Cyprus': 19,
  'Malta': 18,
  'Luxembourg': 17,
  'Ireland': 23
};

export const DEFAULT_VALUES = {
  VAT_RATE: 19,
  RETURN_BUFFER_PERCENTAGE: 2,
  RETURN_BUFFER_BASE: 2.50,
  AMAZON_FEE: 15
};

/**
 * Check Small Package eligibility
 * @returns {object} Eligibility status and details
 */
export function checkSmallPackageEligibility(product) {
  const length = parseNumberSafe(product.length_cm);
  const width = parseNumberSafe(product.width_cm);
  const height = parseNumberSafe(product.height_cm);
  const weight = parseNumberSafe(product.weight_kg);
  const price = parseNumberSafe(product.selling_price);
  
  const failures = [];
  
  if (length > KLEINPAKET_LIMITS.MAX_LENGTH_CM) {
    failures.push(`Length ${length}cm exceeds ${KLEINPAKET_LIMITS.MAX_LENGTH_CM}cm`);
  }
  
  if (width > KLEINPAKET_LIMITS.MAX_WIDTH_CM) {
    failures.push(`Width ${width}cm exceeds ${KLEINPAKET_LIMITS.MAX_WIDTH_CM}cm`);
  }
  
  if (height > KLEINPAKET_LIMITS.MAX_HEIGHT_CM) {
    failures.push(`Height ${height}cm exceeds ${KLEINPAKET_LIMITS.MAX_HEIGHT_CM}cm`);
  }
  
  if (weight > KLEINPAKET_LIMITS.MAX_WEIGHT_KG) {
    failures.push(`Weight ${weight}kg exceeds ${KLEINPAKET_LIMITS.MAX_WEIGHT_KG}kg`);
  }
  
  if (price > KLEINPAKET_LIMITS.MAX_PRICE_EUR) {
    failures.push(`Price €${price} exceeds €${KLEINPAKET_LIMITS.MAX_PRICE_EUR}`);
  }
  
  const isEligible = failures.length === 0;
  const savings = isEligible ? roundToPrecision(SHIPPING_COSTS.STANDARD - SHIPPING_COSTS.KLEINPAKET, 2) : 0;
  
  return {
    isEligible,
    failures,
    message: isEligible
      ? `✅ Small Package Eligible - Save €${savings}`
      : `❌ Not Small Package eligible`,
    savings,
    limits: KLEINPAKET_LIMITS
  };
}

/**
 * Calculate shipping cost
 * @returns {object} Shipping cost and details
 */
export function calculateShippingCost(product, smallPackageEligible = false) {
  const weight = parseNumberSafe(product.weight_kg);
  const length = parseNumberSafe(product.length_cm);
  const width = parseNumberSafe(product.width_cm);
  const height = parseNumberSafe(product.height_cm);
  
  // Calculate volume for freight check
  const volume = safeMultiply(safeMultiply(length, width), height);
  const isHeavy = weight > 20;
  const isOversized = volume > 50000; // 50L in cm³
  
  let cost, type, reason;
  
  if (isHeavy || isOversized) {
    cost = SHIPPING_COSTS.HEAVY;
    type = 'Heavy';
    reason = isHeavy ? 'Weight exceeds 20kg' : 'Volume exceeds 50L';
  } else if (smallPackageEligible) {
    cost = SHIPPING_COSTS.KLEINPAKET;
    type = 'Small Package';
    reason = 'Meets Small Package requirements';
  } else {
    cost = SHIPPING_COSTS.STANDARD;
    type = 'Standard';
    reason = 'Standard shipping';
  }
  
  return {
    cost: roundToPrecision(cost, 2),
    type,
    reason,
    isSmallPackageEligible: smallPackageEligible,
    alternatives: generateShippingAlternatives(smallPackageEligible, isHeavy || isOversized)
  };
}

/**
 * Generate shipping alternatives
 */
function generateShippingAlternatives(smallPackageEligible, isFreight) {
  const alternatives = [];
  
  if (smallPackageEligible) {
    alternatives.push({
      type: 'Small Package',
      cost: SHIPPING_COSTS.KLEINPAKET,
      speed: 'Default',
      tag: 'Economical',
      description: 'Economical shipping for small packages',
      savings: roundToPrecision(SHIPPING_COSTS.STANDARD - SHIPPING_COSTS.KLEINPAKET, 2)
    });
  }
  
  if (!isFreight) {
    alternatives.push({
      type: 'Standard',
      cost: SHIPPING_COSTS.STANDARD,
      speed: smallPackageEligible ? '+2d' : 'Default',
      tag: 'Reliable',
      description: 'Reliable standard shipping'
    });
    
    alternatives.push({
      type: 'Registered',
      cost: SHIPPING_COSTS.REGISTERED,
      speed: smallPackageEligible ? '+1d' : 'Default',
      tag: 'Insured',
      description: 'Insured and trackable'
    });
    
    alternatives.push({
      type: 'Express',
      cost: SHIPPING_COSTS.EXPRESS,
      speed: smallPackageEligible ? '-1d' : 'Default',
      tag: 'Fast',
      description: 'Fast delivery'
    });
  } else {
    alternatives.push({
      type: 'Freight',
      cost: SHIPPING_COSTS.HEAVY,
      speed: 'Default',
      tag: 'Heavy',
      description: 'For heavy/oversized items'
    });
  }
  
  return alternatives;
}

/**
 * Calculate Amazon fees (or platform fees if provided)
 * @returns {object} Fee amount and rate
 */
export function calculateAmazonFee(product) {
  // If platform fees are provided (from platform selector), use those instead
  if (product.platformFees !== undefined && product.platformFees !== null) {
    const sellingPrice = parseNumberSafe(product.selling_price);
    const platformFeeAmount = parseNumberSafe(product.platformFees);
    const platformFeeRate = sellingPrice > 0 ? (platformFeeAmount / sellingPrice) * 100 : 0;
    
    return {
      rate: roundToPrecision(platformFeeRate, 2),
      amount: roundToPrecision(platformFeeAmount, 2),
      category: product.category || 'Default',
      platform: product.platform || 'amazon',
      platformType: product.platformType || null,
      feeBreakdown: product.platformFeeBreakdown || {}
    };
  }
  
  // Default Amazon fee calculation (backward compatibility)
  const sellingPrice = parseNumberSafe(product.selling_price);
  const category = product.category || 'Default';
  
  const rate = AMAZON_FEES_BY_CATEGORY[category] || AMAZON_FEES_BY_CATEGORY.Default;
  const amount = safeMultiply(sellingPrice, rate / 100);
  
  return {
    rate,
    amount: roundToPrecision(amount, 2),
    category
  };
}

/**
 * Calculate VAT
 * @returns {object} VAT amount and rate
 */
export function calculateVAT(product) {
  const sellingPrice = parseNumberSafe(product.selling_price);
  const country = product.destination_country || 'Germany';
  
  const rate = VAT_RATES_BY_COUNTRY[country] || DEFAULT_VALUES.VAT_RATE;
  const amount = safeMultiply(sellingPrice, rate / 100);
  
  return {
    rate,
    amount: roundToPrecision(amount, 2),
    country
  };
}

/**
 * Calculate return buffer
 * @returns {number} Return buffer amount
 */
export function calculateReturnBuffer(product) {
  const sellingPrice = parseNumberSafe(product.selling_price);
  
  const percentageAmount = safeMultiply(sellingPrice, DEFAULT_VALUES.RETURN_BUFFER_PERCENTAGE / 100);
  const total = safeAdd(percentageAmount, DEFAULT_VALUES.RETURN_BUFFER_BASE);
  
  return roundToPrecision(total, 2);
}

/**
 * Calculate total costs using EU VAT methodology
 * Uses NET values + Net VAT Liability
 * @returns {number} Total cost amount
 */
export function calculateTotalCost(product, shipping, amazonFee, vat, returnBuffer) {
  // For new VAT structure, use NET values + Net VAT Liability
  if (vat.netVATLiability !== undefined) {
    // Convert return buffer from GROSS to NET (it's calculated as gross)
    const vatRateDecimal = vat.rate / 100;
    const returnBufferNet = returnBuffer / (1 + vatRateDecimal);
    
    // New EU VAT methodology: NET costs + Net VAT Liability
    const total = safeAdd(
      vat.cogsNet,           // COGS (net)
      vat.amazonFeeNet,     // Amazon Fee (net)
      vat.shippingNet,      // Shipping (net)
      vat.netVATLiability,  // Net VAT Liability (actual cost)
      returnBufferNet       // Return Buffer (converted to net)
    );
    
    return roundToPrecision(total, 2);
  } else {
    // Fallback to old calculation for backward compatibility
    const buyingPrice = parseNumberSafe(product.buying_price);
    
    const total = safeAdd(
      buyingPrice,
      shipping.cost,
      amazonFee.amount,
      vat.amount,
      returnBuffer
    );
    
    return roundToPrecision(total, 2);
  }
}

/**
 * Calculate net profit
 * Formula: Net Profit = Revenue - Total Costs
 * @returns {number} Net profit amount
 */
export function calculateNetProfit(product, totalCost) {
  const sellingPrice = parseNumberSafe(product.selling_price);
  const netProfit = safeSubtract(sellingPrice, totalCost);
  
  return roundToPrecision(netProfit, 2);
}

/**
 * Calculate ROI
 * Formula: ROI (%) = ((Net Profit / Total Cost) × 100)
 * @returns {number} ROI percentage
 */
export function calculateROI(netProfit, totalCost) {
  if (totalCost <= 0) {
    return 0;
  }
  
  const roi = safeDivide(netProfit, totalCost) * 100;
  return roundToPrecision(roi, 2);
}

/**
 * Calculate profit margin
 * Formula: Profit Margin = (Net Profit / Revenue) × 100
 * @returns {number} Profit margin percentage
 */
export function calculateProfitMargin(netProfit, revenue) {
  if (revenue <= 0) {
    return 0;
  }
  
  const margin = safeDivide(netProfit, revenue) * 100;
  return roundToPrecision(margin, 2);
}

/**
 * Calculate break-even units
 * Formula: Break-even = Fixed Costs / (Price - Variable Cost per Unit)
 * @returns {number} Number of units to break even
 */
export function calculateBreakEven(netProfit, fixedCosts = 500) {
  if (netProfit <= 0) {
    return Infinity;
  }
  
  const units = safeDivide(fixedCosts, netProfit);
  return Math.ceil(units);
}

/**
 * Calculate recommended price for target ROI
 * @returns {number} Recommended selling price
 */
export function calculateRecommendedPrice(product, targetROI = 20) {
  const buyingPrice = parseNumberSafe(product.buying_price);
  
  // Simplified calculation (iterative approach would be more accurate)
  // Target: (Revenue - TotalCost) / TotalCost = targetROI/100
  // This is a rough estimate; actual price depends on VAT/fees which are based on price itself
  
  const estimatedOtherCosts = 15; // Estimated shipping + buffer
  const estimatedFeeRate = 0.20; // Estimated 20% for Amazon + VAT
  
  // Price = (TotalCost * (1 + targetROI/100)) / (1 - estimatedFeeRate)
  const totalCost = safeAdd(buyingPrice, estimatedOtherCosts);
  const targetRevenue = safeMultiply(totalCost, 1 + targetROI / 100);
  const recommendedPrice = safeDivide(targetRevenue, 1 - estimatedFeeRate);
  
  return roundToPrecision(recommendedPrice, 2);
}

/**
 * Main calculation function - orchestrates all calculations
 * @returns {object} Complete calculation result with metadata
 */
export function calculateProductAnalysis(product, options = {}) {
  const timestamp = Date.now();
  const calculationId = `calc_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Step 1: Check Small Package eligibility
  const smallPackageCheck = checkSmallPackageEligibility(product);
  
  // Step 2: Calculate shipping
  // If platform provides shipping cost override, use it; otherwise calculate normally
  let shipping = calculateShippingCost(product, smallPackageCheck.isEligible);
  if (product.shipping_cost_override !== undefined && product.shipping_cost_override !== null) {
    // shipping_cost_override can be 0 (for FBA where Amazon handles shipping)
    shipping = {
      ...shipping,
      cost: parseNumberSafe(product.shipping_cost_override),
      chosen: product.platform === 'amazon' && product.platformType === 'fba' ? 'FBA (Amazon Handles Shipping)' : 'Platform Provided',
      type: product.platform === 'amazon' && product.platformType === 'fba' ? 'FBA' : 'Platform Provided'
    };
  }
  
  // Step 3: Calculate fees and taxes
  const amazonFee = calculateAmazonFee(product);
  const vat = calculateVATBreakdown(product);
  const returnBuffer = calculateReturnBuffer(product);
  
  // Step 4: Calculate totals
  const totalCost = calculateTotalCost(product, shipping, amazonFee, vat, returnBuffer);
  
  // Use NET selling price for profit calculations (EU VAT methodology)
  const sellingPriceNet = vat.sellingPriceNet || parseNumberSafe(product.selling_price);
  const netProfit = safeSubtract(sellingPriceNet, totalCost);
  const roi = calculateROI(netProfit, totalCost);
  const profitMargin = calculateProfitMargin(netProfit, sellingPriceNet);
  
  // Step 5: Additional metrics
  const fixedCosts = parseNumberSafe(product.fixed_costs) || 500;
  const breakEvenUnits = calculateBreakEven(netProfit, fixedCosts);
  const recommendedPrice = calculateRecommendedPrice(product, options.targetROI || 20);
  
  // Step 6: Performance categorization
  const performanceTier = categorizePerformance(roi, profitMargin, netProfit);
  
  // Step 7: Integrity check
  const integrityCheck = verifyCalculationIntegrity(product, totalCost, netProfit);
  
  return {
    // Metadata
    calculationId,
    timestamp,
    version: CALCULATION_VERSION,
    integrityCheck,
    
    // Input data (normalized)
    input: {
      product_name: product.product_name,
      category: product.category,
      buying_price: parseNumberSafe(product.buying_price),
      selling_price: parseNumberSafe(product.selling_price),
      destination_country: product.destination_country,
      country: product.destination_country || product.buyer_country || 'Germany',
      length_cm: parseNumberSafe(product.length_cm),
      width_cm: parseNumberSafe(product.width_cm),
      height_cm: parseNumberSafe(product.height_cm),
      weight_kg: parseNumberSafe(product.weight_kg),
      annual_volume: parseInt(product.annual_volume) || 500
    },
    
    // Calculations
    smallPackageCheck,
    shipping,
    amazonFee,
    vat,
    returnBuffer,
    
    // Results
    totals: {
      total_cost: totalCost,
      net_profit: netProfit,
      roi_percent: roi,
      profit_margin: profitMargin,
      break_even_units: breakEvenUnits,
      recommended_price: recommendedPrice
    },
    
    // Performance assessment
    performance: performanceTier
  };
}

/**
 * Categorize performance based on metrics
 */
function categorizePerformance(roi, margin, profit) {
  let tier, emoji, color;
  
  if (margin >= 30 && roi >= 150) {
    tier = 'EXCEPTIONAL';
    emoji = '🚀';
    color = 'green';
  } else if (margin >= 20 && roi >= 100) {
    tier = 'EXCELLENT';
    emoji = '⭐';
    color = 'green';
  } else if (margin >= 10 && roi >= 50) {
    tier = 'GOOD';
    emoji = '👍';
    color = 'blue';
  } else if (margin >= 5 && roi >= 25) {
    tier = 'FAIR';
    emoji = '⚠️';
    color = 'yellow';
  } else if (margin >= 0) {
    tier = 'POOR';
    emoji = '🔻';
    color = 'orange';
  } else {
    tier = 'CRITICAL';
    emoji = '🚨';
    color = 'red';
  }
  
  return { tier, emoji, color };
}

/**
 * Verify calculation integrity
 */
function verifyCalculationIntegrity(product, totalCost, netProfit) {
  const sellingPrice = parseNumberSafe(product.selling_price);
  const calculatedRevenue = safeAdd(totalCost, netProfit);
  
  const difference = Math.abs(sellingPrice - calculatedRevenue);
  const isValid = difference < 0.02; // Tolerance of 2 cents
  
  return {
    isValid,
    difference: roundToPrecision(difference, 2),
    message: isValid ? 'Calculation verified' : `Mismatch detected: €${roundToPrecision(difference, 2)}`
  };
}

/**
 * Calculate sensitivity analysis
 * Adjusts a parameter and recalculates
 */
export function calculateSensitivityAnalysis(product, parameter, adjustment) {
  const modifiedProduct = { ...product };
  
  switch (parameter) {
    case 'price':
      modifiedProduct.selling_price = safeAdd(parseNumberSafe(product.selling_price), adjustment);
      break;
    case 'cost':
      modifiedProduct.buying_price = safeAdd(parseNumberSafe(product.buying_price), adjustment);
      break;
    case 'weight':
      modifiedProduct.weight_kg = safeAdd(parseNumberSafe(product.weight_kg), adjustment);
      break;
    default:
      break;
  }
  
  return calculateProductAnalysis(modifiedProduct);
}

/**
 * Compare scenarios
 */
export function compareScenarios(baseProduct, scenarios) {
  const baseResult = calculateProductAnalysis(baseProduct);
  
  const scenarioResults = scenarios.map(scenario => {
    const modifiedProduct = { ...baseProduct, ...scenario.changes };
    const result = calculateProductAnalysis(modifiedProduct);
    
    return {
      name: scenario.name,
      result,
      deltas: {
        roi: roundToPrecision(result.totals.roi_percent - baseResult.totals.roi_percent, 2),
        margin: roundToPrecision(result.totals.profit_margin - baseResult.totals.profit_margin, 2),
        profit: roundToPrecision(result.totals.net_profit - baseResult.totals.net_profit, 2)
      }
    };
  });
  
  return {
    base: baseResult,
    scenarios: scenarioResults
  };
}

