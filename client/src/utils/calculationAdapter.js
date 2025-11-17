/**
 * Client-Side Calculation Adapter
 * 
 * Converts platform-specific input into normalized calculation payload
 * Compatible with existing calculation engine
 */

const platformConfig = {
  amazon: {
    label: 'Amazon',
    feeCalculation: (data) => {
      const referralFee = data.sellingPrice * (data.referralFeePercent / 100);
      if (data.type === 'fba') {
        return { referralFee, fbaFee: data.fbaFeePerUnit, totalFees: referralFee + data.fbaFeePerUnit };
      } else {
        return { referralFee, shippingCost: data.shippingCostPerUnit, totalFees: referralFee };
      }
    }
  },
  shopify: {
    label: 'Shopify',
    feeCalculation: (data) => {
      const shopifyFee = data.sellingPrice * (data.shopifyCommissionPercent / 100);
      const paymentFee = data.sellingPrice * (data.paymentProcessingPercent / 100);
      return { shopifyFee, paymentFee, shippingCost: data.shippingCostPerUnit, totalFees: shopifyFee + paymentFee };
    }
  },
  ebay: {
    label: 'eBay',
    feeCalculation: (data) => {
      const finalValueFee = data.sellingPrice * (data.finalValueFeePercent / 100);
      const paymentFee = data.sellingPrice * (data.paymentProcessingPercent / 100);
      return { finalValueFee, paymentFee, shippingCost: data.shippingCostPerUnit, totalFees: finalValueFee + paymentFee };
    }
  },
  none: {
    label: 'No Platform Fees',
    feeCalculation: (data) => {
      return { totalFees: 0 };
    }
  }
};

/**
 * Normalize platform-specific input to calculation engine format
 * @param {Object} platformData - Platform selection and input data
 * @returns {Object} Normalized product data for calculation engine
 */
export function normalizeCalculationInput(platformData) {
  const { platform, platformType, inputData } = platformData;
  
  const platformSpec = platformConfig[platform];
  if (!platformSpec) {
    throw new Error(`Unknown platform: ${platform}`);
  }
  
  // Calculate platform fees
  const fees = platformSpec.feeCalculation({ ...inputData, type: platformType });
  
  // Determine platform fees and shipping costs separately
  let platformFees = 0;
  let shippingCostOverride = null;
  
  if (platform === 'amazon') {
    if (platformType === 'fba') {
      // FBA: Referral fee + FBA fee (shipping handled by Amazon, no shipping cost to merchant)
      platformFees = (fees.referralFee || 0) + (fees.fbaFee || 0);
      shippingCostOverride = 0; // FBA handles shipping, merchant pays 0 for shipping
    } else {
      // FBM: Referral fee only (merchant handles shipping separately)
      platformFees = fees.referralFee || 0;
      shippingCostOverride = parseFloat(inputData.shippingCostPerUnit) || 0;
    }
  } else if (platform === 'shopify') {
    // Shopify: Commission + payment processing (shipping is separate cost)
    platformFees = (fees.shopifyFee || 0) + (fees.paymentFee || 0);
    shippingCostOverride = parseFloat(inputData.shippingCostPerUnit) || 0;
  } else if (platform === 'ebay') {
    // eBay: Final value fee + payment processing (shipping is separate cost)
    platformFees = (fees.finalValueFee || 0) + (fees.paymentFee || 0);
    shippingCostOverride = parseFloat(inputData.shippingCostPerUnit) || 0;
  } else {
    // None: No platform fees, just shipping cost
    platformFees = 0;
    shippingCostOverride = parseFloat(inputData.shippingCostPerUnit) || 0;
  }
  
  // Map platform-specific fields to existing calculation engine format
  // The existing engine expects: buying_price, selling_price, category, destination_country, dimensions
  const normalizedData = {
    product_name: inputData.product_name || 'Product',
    buying_price: parseFloat(inputData.cogs) || 0,
    selling_price: parseFloat(inputData.sellingPrice) || 0,
    category: inputData.category || 'Electronics',
    destination_country: inputData.destination_country || 'Germany',
    length_cm: parseFloat(inputData.length) || parseFloat(inputData.length_cm) || 0,
    width_cm: parseFloat(inputData.width) || parseFloat(inputData.width_cm) || 0,
    height_cm: parseFloat(inputData.height) || parseFloat(inputData.height_cm) || 0,
    weight_kg: parseFloat(inputData.weight) || parseFloat(inputData.weight_kg) || 0,
    // Platform metadata
    platform: platform,
    platformType: platformType,
    // Platform fees (will be used to override Amazon fee calculation)
    platformFees: platformFees,
    platformFeeBreakdown: fees,
    // For Amazon FBA/FBM compatibility
    amazon_fee_percent: platform === 'amazon' ? (parseFloat(inputData.referralFeePercent) || 15) : 0,
    fba_fee_per_unit: platform === 'amazon' && platformType === 'fba' ? (parseFloat(inputData.fbaFeePerUnit) || 0) : 0,
    // Shipping (platform-specific or standard)
    // For FBA, shipping is 0 (Amazon handles it)
    // For other platforms, use provided shipping cost
    shipping_cost_override: shippingCostOverride !== null ? shippingCostOverride : undefined
  };
  
  return normalizedData;
}

/**
 * Check if platform data is provided
 * @param {Object} productData - Product data from form
 * @returns {boolean} True if platform data is present
 */
export function hasPlatformData(productData) {
  return productData && productData.platform && productData.platformType && productData.inputData;
}

export default { normalizeCalculationInput, hasPlatformData };

