/**
 * Fee Calculators for Cross-Channel Profitability SaaS
 * 
 * Calculates fees for Amazon, Shopify, and Noon channels
 * Reuses existing Amazon fee calculation logic
 */

// Amazon fee rates by category
// Note: Electronics can be 8-15% depending on product type
// For mock data, using 15% as default referral fee
const AMAZON_FEES_BY_CATEGORY = {
  'Electronics': 15, // Default 15% for mock data (can vary 8-15% in reality)
  'Food': 15,
  'Health': 8,
  'Beauty': 15,
  'Books': 15,
  'Apparel': 17,
  'Default': 15
};

/**
 * Round to 2 decimal places
 */
function roundToPrecision(value, decimals = 2) {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

/**
 * Validate input
 */
function validateInput(sellingPrice) {
  if (typeof sellingPrice !== 'number' || isNaN(sellingPrice)) {
    throw new Error('Selling price must be a valid number');
  }
  if (sellingPrice < 0) {
    throw new Error('Selling price must be greater than or equal to 0');
  }
}

/**
 * Calculate Amazon fees
 * 
 * Reuses existing Amazon fee calculation logic from the platform
 * 
 * @param {number} sellingPrice - Selling price per unit
 * @param {string} category - Product category (default: 'Electronics')
 * @returns {Object} Fee breakdown object
 */
function calculateAmazonFees(sellingPrice, category = 'Electronics') {
  validateInput(sellingPrice);
  
  // Get referral fee rate based on category
  const referralFeePercent = AMAZON_FEES_BY_CATEGORY[category] || AMAZON_FEES_BY_CATEGORY.Default;
  
  // Calculate referral fee amount
  const referralFeeAmount = roundToPrecision((sellingPrice * referralFeePercent) / 100);
  
  // FBA fee per unit (fulfillment + storage)
  // This is a simplified calculation - in production, this would use
  // the actual FBA fee calculator based on dimensions and weight
  // For MVP, we use a realistic average: €2.50-€4.00 per unit
  const fbaFeePerUnit = 3.00; // Average FBA fee for small electronics
  
  // Total fees
  const totalFeeAmount = roundToPrecision(referralFeeAmount + fbaFeePerUnit);
  const totalFeePercent = roundToPrecision((totalFeeAmount / sellingPrice) * 100);
  
  return {
    referralFeePercent: referralFeePercent,
    referralFeeAmount: referralFeeAmount,
    fbaFeePerUnit: fbaFeePerUnit,
    totalFeePercent: totalFeePercent,
    totalFeeAmount: totalFeeAmount,
    category: category
  };
}

/**
 * Calculate Shopify fees
 * 
 * @param {number} sellingPrice - Selling price per unit
 * @returns {Object} Fee breakdown object
 */
function calculateShopifyFees(sellingPrice) {
  validateInput(sellingPrice);
  
  // Shopify commission (2.9%)
  const shopifyCommissionPercent = 2.9;
  const shopifyCommissionAmount = roundToPrecision((sellingPrice * shopifyCommissionPercent) / 100);
  
  // Payment processing fee (2.9% - Stripe standard)
  const paymentProcessingPercent = 2.9;
  const paymentProcessingAmount = roundToPrecision((sellingPrice * paymentProcessingPercent) / 100);
  
  // Total fees
  const totalFeePercent = 5.8; // 2.9% + 2.9%
  const totalFeeAmount = roundToPrecision(shopifyCommissionAmount + paymentProcessingAmount);
  
  return {
    shopifyCommissionPercent: shopifyCommissionPercent,
    shopifyCommissionAmount: shopifyCommissionAmount,
    paymentProcessingPercent: paymentProcessingPercent,
    paymentProcessingAmount: paymentProcessingAmount,
    totalFeePercent: totalFeePercent,
    totalFeeAmount: totalFeeAmount
  };
}

/**
 * Calculate Noon fees
 * 
 * @param {number} sellingPrice - Selling price per unit
 * @param {string} category - Product category (default: 'Electronics', not used in MVP)
 * @returns {Object} Fee breakdown object
 */
function calculateNoonFees(sellingPrice, category = 'Electronics') {
  validateInput(sellingPrice);
  
  // Noon commission (12% fixed for MVP)
  const commissionPercent = 12;
  const commissionAmount = roundToPrecision((sellingPrice * commissionPercent) / 100);
  
  // Platform fee per order (fixed €0.50)
  // Note: This is per ORDER, not per unit
  // For per-unit calculation, we need to know quantity
  // This function returns per-unit fee, so platform fee is 0 here
  // It will be added when calculating total order fees
  const platformFeePerOrder = 0.50;
  
  // Total fees (commission only, platform fee added at order level)
  const totalFeePercent = commissionPercent;
  const totalFeeAmount = commissionAmount;
  
  return {
    commissionPercent: commissionPercent,
    commissionAmount: commissionAmount,
    platformFeePerOrder: platformFeePerOrder,
    totalFeePercent: totalFeePercent,
    totalFeeAmount: totalFeeAmount,
    category: category
  };
}

module.exports = {
  calculateAmazonFees,
  calculateShopifyFees,
  calculateNoonFees,
  AMAZON_FEES_BY_CATEGORY
};

