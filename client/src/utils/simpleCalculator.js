/**
 * Simple Calculator for Amazon FBA Analysis
 * Wrapper around the centralized calculation service
 * Version: 2.0.0 - Enhanced with validation and precision management
 */

import { calculateProductAnalysis as coreCalculate } from './calculations';
import { validateProductData, hasErrors } from './validation';

// Amazon Fee rates by category
export const AMAZON_FEES = {
  'Electronics': 8,
  'Beauty': 15,
  'Jewelry': 20,
  'Health': 8,
  'Books': 15,
  'Apparel': 17,
  'Furniture': 15,
  'Food': 15,
  'Baby': 15,
  'Sports & Outdoors': 15,
  'Toys & Games': 15,
  'Home & Garden': 15,
  'Automotive': 12,
  'Office Supplies': 15,
  'Other': 15,
  'Default': 15
};

// VAT rates by country
export const VAT_RATES = {
  'Italy': 22,
  'Germany': 19,
  'France': 20,
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
  'Ireland': 23,
  'Default': 19
};

// Small Package limits
const KLEINPAKET_LIMITS = {
  MAX_LENGTH: 35.3,
  MAX_WIDTH: 25,
  MAX_HEIGHT: 8,
  MAX_WEIGHT: 1,
  MAX_PRICE: 60
};

// Shipping costs
const SHIPPING_COSTS = {
  KLEINPAKET: 3.79,
  STANDARD: 5.50,
  HEAVY: 15.50
};

/**
 * Calculate Amazon fee based on category
 */
export function calculateAmazonFee(category, sellingPrice) {
  const feeRate = AMAZON_FEES[category] || AMAZON_FEES.Default;
  return (sellingPrice * feeRate) / 100;
}

/**
 * Calculate shipping cost
 */
export function calculateShippingCost(product) {
  const { length_cm, width_cm, height_cm, weight_kg, selling_price } = product;
  
  // Check if Small Package eligible
  const isSmallPackageEligible = 
    length_cm <= KLEINPAKET_LIMITS.MAX_LENGTH &&
    width_cm <= KLEINPAKET_LIMITS.MAX_WIDTH &&
    height_cm <= KLEINPAKET_LIMITS.MAX_HEIGHT &&
    weight_kg <= KLEINPAKET_LIMITS.MAX_WEIGHT &&
    selling_price <= KLEINPAKET_LIMITS.MAX_PRICE;
  
  // Heavy items
  if (weight_kg > 20) {
    return {
      cost: SHIPPING_COSTS.HEAVY,
      type: 'Heavy',
      reason: 'Weight exceeds 20kg',
      isSmallPackageEligible: false
    };
  }
  
  // Small Package eligible
  if (isSmallPackageEligible) {
    return {
      cost: SHIPPING_COSTS.KLEINPAKET,
      type: 'Small Package',
      reason: 'Meets Small Package requirements',
      isSmallPackageEligible: true
    };
  }
  
  // Standard shipping
  return {
    cost: SHIPPING_COSTS.STANDARD,
    type: 'Standard',
    reason: 'Standard shipping',
    isSmallPackageEligible: false
  };
}

/**
 * Calculate VAT using EU methodology (VAT-inclusive pricing)
 * 
 * EU Standard: Prices include VAT
 * Formula: Net Price = Gross Price ÷ (1 + VAT Rate)
 *          VAT Amount = Gross Price - Net Price
 * 
 * For profitability:
 * - Output VAT = VAT collected from customer (on selling price)
 * - Input VAT = VAT reclaimable on costs (COGS, fees, shipping)
 * - Net VAT Liability = Output VAT - Input VAT
 * 
 * @param {string} country - Destination country
 * @param {number} grossPrice - Price including VAT (what customer pays)
 * @returns {object} Net price, VAT amount, and rate
 */
export function extractNetFromGross(country, grossPrice) {
  const vatRate = VAT_RATES[country] || VAT_RATES.Default;
  const vatRateDecimal = vatRate / 100;
  
  // Net Price = Gross ÷ (1 + VAT Rate)
  const netPrice = grossPrice / (1 + vatRateDecimal);
  
  // VAT Amount = Gross - Net
  const vatAmount = grossPrice - netPrice;
  
  return {
    rate: vatRate,
    gross: grossPrice,
    net: netPrice,
    vatAmount: vatAmount
  };
}

/**
 * Calculate comprehensive VAT breakdown for profitability
 * Shows Output VAT, Input VAT (reclaimable), and Net VAT Liability
 */
export function calculateVATBreakdown(product) {
  const { 
    selling_price, 
    buying_price, 
    destination_country, 
    buyer_country,
    category 
  } = product;
  
  // Use buyer_country for VAT rate (where VAT is charged)
  // Fallback to destination_country for backward compatibility
  const vatCountry = buyer_country || destination_country;
  const vatRate = VAT_RATES[vatCountry] || VAT_RATES.Default;
  const vatRateDecimal = vatRate / 100;
  
  // 1. Output VAT (collected from customer on selling price)
  const sellingPriceNet = selling_price / (1 + vatRateDecimal);
  const outputVAT = selling_price - sellingPriceNet;
  
  // 2. Input VAT on COGS (reclaimable - assuming COGS is gross)
  const cogsNet = buying_price / (1 + vatRateDecimal);
  const inputVAT_COGS = buying_price - cogsNet;
  
  // 3. Input VAT on Amazon Fee (reclaimable)
  const amazonFeeRate = AMAZON_FEES[category] || AMAZON_FEES.Default;
  const amazonFeeGross = (selling_price * amazonFeeRate) / 100;
  const amazonFeeNet = amazonFeeGross / (1 + vatRateDecimal);
  const inputVAT_AmazonFee = amazonFeeGross - amazonFeeNet;
  
  // 4. Input VAT on Shipping (reclaimable)
  const shipping = calculateShippingCost(product);
  const shippingNet = shipping.cost / (1 + vatRateDecimal);
  const inputVAT_Shipping = shipping.cost - shippingNet;
  
  // 5. Input VAT on Return Buffer (reclaimable)
  const returnBufferGross = calculateReturnBuffer(selling_price);
  const returnBufferNet = returnBufferGross / (1 + vatRateDecimal);
  const inputVAT_ReturnBuffer = returnBufferGross - returnBufferNet;
  
  // 6. Total Input VAT (reclaimable)
  const totalInputVAT = inputVAT_COGS + inputVAT_AmazonFee + inputVAT_Shipping + inputVAT_ReturnBuffer;
  
  // 6. Net VAT Liability (what seller actually pays to tax authority)
  const netVATLiability = outputVAT - totalInputVAT;
  
  return {
    rate: vatRate,
    
    // Output VAT
    outputVAT: outputVAT,
    
    // Input VAT (reclaimable)
    inputVAT_COGS: inputVAT_COGS,
    inputVAT_AmazonFee: inputVAT_AmazonFee,
    inputVAT_Shipping: inputVAT_Shipping,
    inputVAT_ReturnBuffer: inputVAT_ReturnBuffer,
    totalInputVAT: totalInputVAT,
    
    // Net VAT Liability
    netVATLiability: netVATLiability,
    
    // Net values (for profitability calculation)
    sellingPriceNet: sellingPriceNet,
    cogsNet: cogsNet,
    amazonFeeNet: amazonFeeNet,
    shippingNet: shippingNet,
    returnBufferNet: returnBufferNet
  };
}

/**
 * Calculate return buffer
 */
export function calculateReturnBuffer(sellingPrice) {
  const percentage = (sellingPrice * 2) / 100; // 2% of selling price
  return percentage + 2.50; // + €2.50
}

/**
 * Check Small Package eligibility
 */
export function checkSmallPackageEligibility(product) {
  const { length_cm, width_cm, height_cm, weight_kg, selling_price } = product;
  
  const failures = [];
  
  if (length_cm > KLEINPAKET_LIMITS.MAX_LENGTH) {
    failures.push(`Length too long (${length_cm}cm > ${KLEINPAKET_LIMITS.MAX_LENGTH}cm)`);
  }
  
  if (width_cm > KLEINPAKET_LIMITS.MAX_WIDTH) {
    failures.push(`Width too wide (${width_cm}cm > ${KLEINPAKET_LIMITS.MAX_WIDTH}cm)`);
  }
  
  if (height_cm > KLEINPAKET_LIMITS.MAX_HEIGHT) {
    failures.push(`Height too tall (${height_cm}cm > ${KLEINPAKET_LIMITS.MAX_HEIGHT}cm)`);
  }
  
  if (weight_kg > KLEINPAKET_LIMITS.MAX_WEIGHT) {
    failures.push(`Weight too heavy (${weight_kg}kg > ${KLEINPAKET_LIMITS.MAX_WEIGHT}kg)`);
  }
  
  if (selling_price > KLEINPAKET_LIMITS.MAX_PRICE) {
    failures.push(`Price too high (€${selling_price} > €${KLEINPAKET_LIMITS.MAX_PRICE})`);
  }
  
  const isEligible = failures.length === 0;
  
  return {
    isEligible,
    failures,
    message: isEligible 
      ? "✅ Small Package Eligible - Save €1.71" 
      : `❌ Not eligible: ${failures.join(', ')}`
  };
}

/**
 * Calculate all costs and profit using correct VAT methodology
 * 
 * EU Standard: All prices are VAT-inclusive (gross)
 * For profitability, we use NET values and only count NET VAT LIABILITY as a cost
 */
export function calculateProfit(product) {
  const { buying_price, selling_price, category, destination_country } = product;
  
  // Get comprehensive VAT breakdown
  const vatBreakdown = calculateVATBreakdown(product);
  
  // Calculate shipping (return buffer is already calculated in VAT breakdown)
  const shipping = calculateShippingCost(product);
  
  // Total costs using NET values + Net VAT Liability
  // Revenue (Net) = Selling Price Net
  // Costs (Net) = COGS Net + Amazon Fee Net + Shipping Net + Return Buffer Net + Net VAT Liability
  const totalCosts = 
    vatBreakdown.cogsNet + 
    vatBreakdown.amazonFeeNet + 
    vatBreakdown.shippingNet + 
    vatBreakdown.returnBufferNet + 
    vatBreakdown.netVATLiability;
  
  // Profit calculations based on NET values
  const netProfit = vatBreakdown.sellingPriceNet - totalCosts;
  const profitMargin = (netProfit / vatBreakdown.sellingPriceNet) * 100;
  const roi = (netProfit / vatBreakdown.cogsNet) * 100;
  
  // Performance tier
  let performanceTier = 'POOR';
  let tierColor = 'red';
  let tierEmoji = '🔻';
  
  if (profitMargin >= 20) {
    performanceTier = 'EXCELLENT';
    tierColor = 'green';
    tierEmoji = '⭐';
  } else if (profitMargin >= 10) {
    performanceTier = 'GOOD';
    tierColor = 'yellow';
    tierEmoji = '👍';
  }
  
  return {
    amazonFee: {
      rate: AMAZON_FEES[category] || AMAZON_FEES.Default,
      amount: vatBreakdown.amazonFeeNet,
      gross: (selling_price * (AMAZON_FEES[category] || AMAZON_FEES.Default)) / 100,
      net: vatBreakdown.amazonFeeNet
    },
    shipping: {
      ...shipping,
      gross: shipping.cost,
      net: vatBreakdown.shippingNet
    },
    vat: {
      rate: vatBreakdown.rate,
      outputVAT: vatBreakdown.outputVAT,
      inputVAT: vatBreakdown.totalInputVAT,
      netVATLiability: vatBreakdown.netVATLiability,
      breakdown: {
        inputVAT_COGS: vatBreakdown.inputVAT_COGS,
        inputVAT_AmazonFee: vatBreakdown.inputVAT_AmazonFee,
        inputVAT_Shipping: vatBreakdown.inputVAT_Shipping
      },
      // Net prices for display
      sellingPriceGross: selling_price,
      sellingPriceNet: vatBreakdown.sellingPriceNet,
      cogsGross: buying_price,
      cogsNet: vatBreakdown.cogsNet
    },
    returnBuffer: vatBreakdown.returnBufferNet,
    returnBufferGross: calculateReturnBuffer(selling_price),
    totalCosts,
    netProfit,
    profitMargin,
    roi,
    performanceTier,
    tierColor,
    tierEmoji
  };
}

/**
 * Main calculation function with validation
 */
export function calculateProductAnalysis(product) {
  // Validate input data
  const validationErrors = validateProductData(product);
  
  if (hasErrors(validationErrors)) {
    throw new Error(`Validation failed: ${validationErrors.map(e => e.message).join(', ')}`);
  }
  
  // Use the centralized calculation service
  return coreCalculate(product);
}
