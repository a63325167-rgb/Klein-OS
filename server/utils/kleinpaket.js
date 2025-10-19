/**
 * Kleinpaket Eligibility Checker
 * Core logic for determining if a product qualifies as Kleinpaket
 */

// Kleinpaket limits
const KLEINPAKET_LIMITS = {
  MAX_LENGTH_CM: 35.3,
  MAX_WIDTH_CM: 25.0,
  MAX_HEIGHT_CM: 8.0,
  MAX_WEIGHT_KG: 1.0,
  MAX_PRICE_EUR: 60.0
};

// Shipping options and costs
const SHIPPING_OPTIONS = {
  kleinpaket: {
    name: 'Kleinpaket',
    baseCost: 4.50,
    description: 'Economical shipping for small packages',
    deliveryTime: '2-3 days',
    reliability: '95%',
    savings: 3.50 // Savings compared to standard
  },
  standard: {
    name: 'Standard',
    baseCost: 7.99,
    description: 'Reliable standard shipping',
    deliveryTime: '3-7 days',
    reliability: '90%'
  },
  registered: {
    name: 'Registered',
    baseCost: 9.99,
    description: 'Insured and trackable',
    deliveryTime: '3-5 days',
    reliability: '98%'
  },
  express: {
    name: 'Express',
    baseCost: 19.99,
    description: 'Fast delivery',
    deliveryTime: '1-2 days',
    reliability: '99%'
  },
  freight: {
    name: 'Freight',
    baseCost: 25.00,
    description: 'For heavy/oversized items',
    deliveryTime: '5-10 days',
    reliability: '85%'
  }
};

// VAT rates by country (simplified - in reality this is more complex)
const VAT_RATES = {
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

// Default values
const DEFAULTS = {
  AMAZON_FEE_PERCENT: 15,
  DEFAULT_VAT_RATE: 19,
  RETURN_BUFFER: 3.5
};

/**
 * Check if a product is eligible for Kleinpaket shipping
 * @param {Object} product - Product details
 * @returns {Object} Eligibility result with details
 */
function checkKleinpaketEligibility(product) {
  const {
    length_cm,
    width_cm,
    height_cm,
    weight_kg,
    selling_price
  } = product;

  const failedConditions = [];
  let isEligible = true;

  // Check length
  if (length_cm > KLEINPAKET_LIMITS.MAX_LENGTH_CM) {
    failedConditions.push(`Length is too long (${length_cm} cm > ${KLEINPAKET_LIMITS.MAX_LENGTH_CM} cm)`);
    isEligible = false;
  }

  // Check width
  if (width_cm > KLEINPAKET_LIMITS.MAX_WIDTH_CM) {
    failedConditions.push(`Width is too wide (${width_cm} cm > ${KLEINPAKET_LIMITS.MAX_WIDTH_CM} cm)`);
    isEligible = false;
  }

  // Check height
  if (height_cm > KLEINPAKET_LIMITS.MAX_HEIGHT_CM) {
    failedConditions.push(`Height is too tall (${height_cm} cm > ${KLEINPAKET_LIMITS.MAX_HEIGHT_CM} cm)`);
    isEligible = false;
  }

  // Check weight
  if (weight_kg > KLEINPAKET_LIMITS.MAX_WEIGHT_KG) {
    failedConditions.push(`Weight exceeds limit (${weight_kg} kg > ${KLEINPAKET_LIMITS.MAX_WEIGHT_KG} kg)`);
    isEligible = false;
  }

  // Check price
  if (selling_price > KLEINPAKET_LIMITS.MAX_PRICE_EUR) {
    failedConditions.push(`Selling Price exceeds 60 € (${selling_price} € > ${KLEINPAKET_LIMITS.MAX_PRICE_EUR} €)`);
    isEligible = false;
  }

  const eligibilityMessage = isEligible
    ? "✅ Your product is Kleinpaket eligible! You will save 3.5 € on shipping."
    : "❌ Your product is NOT Kleinpaket eligible. One or more measurements exceed the allowed limits.";

  return {
    isEligible,
    eligibilityMessage,
    failedConditions,
    limits: KLEINPAKET_LIMITS
  };
}

/**
 * Calculate shipping costs and options
 * @param {Object} product - Product details
 * @param {boolean} isEligible - Whether product is Kleinpaket eligible
 * @returns {Object} Shipping options and costs
 */
function calculateShipping(product, isEligible) {
  const { weight_kg, length_cm, width_cm, height_cm } = product;
  
  // Determine if freight is needed (very large or heavy items)
  const isFreight = weight_kg > 5 || (length_cm * width_cm * height_cm) > 50000;
  
  let chosenOption = 'standard';
  let options = [];

  if (isEligible) {
    chosenOption = 'kleinpaket';
    options.push({
      type: 'Kleinpaket',
      cost: SHIPPING_OPTIONS.kleinpaket.baseCost,
      speed: 'Default',
      tag: 'Economical',
      description: SHIPPING_OPTIONS.kleinpaket.description,
      savings: SHIPPING_OPTIONS.kleinpaket.savings
    });
  }

  // Add other options
  if (!isFreight) {
    options.push({
      type: 'Standard',
      cost: SHIPPING_OPTIONS.standard.baseCost,
      speed: isEligible ? '+2d' : 'Default',
      tag: 'Reliable',
      description: SHIPPING_OPTIONS.standard.description
    });

    options.push({
      type: 'Registered',
      cost: SHIPPING_OPTIONS.registered.baseCost,
      speed: isEligible ? '+1d' : 'Default',
      tag: 'Insured',
      description: SHIPPING_OPTIONS.registered.description
    });

    options.push({
      type: 'Express',
      cost: SHIPPING_OPTIONS.express.baseCost,
      speed: isEligible ? '-1d' : 'Default',
      tag: 'Fast',
      description: SHIPPING_OPTIONS.express.description
    });
  } else {
    options.push({
      type: 'Freight',
      cost: SHIPPING_OPTIONS.freight.baseCost,
      speed: 'Default',
      tag: 'Heavy',
      description: SHIPPING_OPTIONS.freight.description
    });
    chosenOption = 'freight';
  }

  const chosenShipping = options.find(opt => opt.type === (isEligible ? 'Kleinpaket' : (isFreight ? 'Freight' : 'Standard')));
  
  const intelligence = isEligible
    ? `✅ Kleinpaket — Normal rates apply. Standard handling 2–3 days. Reliability: 95%.`
    : isFreight
    ? `📦 Freight — Required for oversized/heavy items. Extended handling 5-10 days.`
    : `📦 Standard — Reliable shipping option. Delivery 3-7 days. Reliability: 90%.`;

  return {
    chosen: chosenOption,
    cost: chosenShipping.cost,
    options,
    intelligence
  };
}

/**
 * Calculate VAT rate based on destination country
 * @param {string} country - Destination country
 * @returns {number} VAT rate percentage
 */
function getVATRate(country) {
  return VAT_RATES[country] || DEFAULTS.DEFAULT_VAT_RATE;
}

/**
 * Calculate all costs and profit analysis
 * @param {Object} product - Product details
 * @param {Object} shipping - Shipping details
 * @param {Object} options - Calculation options
 * @returns {Object} Complete cost breakdown and analysis
 */
function calculateCosts(product, shipping, options = {}) {
  const {
    buying_price,
    selling_price,
    destination_country
  } = product;

  const {
    amazon_fee_percent = DEFAULTS.AMAZON_FEE_PERCENT,
    return_buffer = DEFAULTS.RETURN_BUFFER
  } = options;

  // Calculate fees
  const amazonFee = selling_price * (amazon_fee_percent / 100);
  const vatRate = getVATRate(destination_country);
  const vatAmount = selling_price * (vatRate / 100);

  // Calculate totals
  const shippingCost = shipping.cost;
  const totalCost = buying_price + shippingCost + amazonFee + vatAmount + return_buffer;
  const netProfit = selling_price - totalCost;
  const roiPercent = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;
  const profitPerUnit = netProfit;

  return {
    shipping_cost: parseFloat(shippingCost.toFixed(2)),
    amazon_fee_percent: amazon_fee_percent,
    amazon_fee: parseFloat(amazonFee.toFixed(2)),
    vat_rate: vatRate,
    vat_amount: parseFloat(vatAmount.toFixed(2)),
    return_buffer: return_buffer,
    total_cost: parseFloat(totalCost.toFixed(2)),
    net_profit: parseFloat(netProfit.toFixed(2)),
    roi_percent: parseFloat(roiPercent.toFixed(2)),
    profit_per_unit: parseFloat(profitPerUnit.toFixed(2))
  };
}

/**
 * Generate analysis and insights based on profit calculations
 * @param {Object} totals - Cost and profit totals
 * @returns {Object} Analysis with category, grade, and insights
 */
function generateAnalysis(totals) {
  const { roi_percent, net_profit } = totals;

  let category, grade, marketPosition, risk, opportunities, warnings, color;

  if (roi_percent > 200 && net_profit > 200) {
    category = 'EXCEPTIONAL';
    grade = 'A+';
    marketPosition = 'Premium opportunity, low risk, scale ready';
    risk = 'Very Low';
    opportunities = 'High-volume scaling, premium positioning, market expansion';
    warnings = 'Monitor competition, maintain quality standards';
    color = 'green';
  } else if (roi_percent >= 100 && roi_percent <= 200) {
    category = 'GOOD';
    grade = 'A/B';
    marketPosition = 'Scale Ready / High Volume Candidate';
    risk = 'Low';
    opportunities = 'Volume scaling, process optimization, market penetration';
    warnings = 'Watch for margin compression, optimize costs';
    color = 'green';
  } else if (roi_percent >= 50 && roi_percent < 100) {
    category = 'MODERATE';
    grade = 'C';
    marketPosition = 'Niche Play / Lean Costs';
    risk = 'Medium';
    opportunities = 'Cost optimization, niche targeting, efficiency gains';
    warnings = 'Monitor margins closely, consider price adjustments';
    color = 'yellow';
  } else if (roi_percent >= 0 && roi_percent < 50) {
    category = 'POOR';
    grade = 'D';
    marketPosition = 'Razor margin / Reduce costs';
    risk = 'High';
    opportunities = 'Cost reduction, process automation, supplier negotiation';
    warnings = 'High risk of losses, consider alternative products';
    color = 'orange';
  } else {
    category = 'CRITICAL';
    grade = 'F';
    marketPosition = 'High risk, losing to competitors';
    risk = 'Very High';
    opportunities = 'Complete cost review, product redesign, market exit';
    warnings = 'Immediate action required, consider discontinuing';
    color = 'red';
  }

  const analysisText = `${category === 'EXCEPTIONAL' ? '✅' : category === 'CRITICAL' ? '🚨' : '⚠️'} ${category}, ROI: ${roi_percent}% (Grade ${grade}). ${marketPosition}. Risk: ${risk}. ${opportunities}. ${warnings}.`;

  return {
    category,
    grade,
    marketPosition,
    risk,
    opportunities,
    warnings,
    text: analysisText,
    color
  };
}

/**
 * Main calculation function that orchestrates all calculations
 * @param {Object} product - Product details
 * @param {Object} options - Calculation options
 * @returns {Object} Complete analysis result
 */
function calculateProductAnalysis(product, options = {}) {
  // Check Kleinpaket eligibility
  const eligibility = checkKleinpaketEligibility(product);
  
  // Calculate shipping
  const shipping = calculateShipping(product, eligibility.isEligible);
  
  // Calculate costs
  const totals = calculateCosts(product, shipping, options);
  
  // Generate analysis
  const analysis = generateAnalysis(totals);

  return {
    eligibility: eligibility.isEligible,
    eligibility_message: eligibility.eligibilityMessage,
    failed_conditions: eligibility.failedConditions,
    shipping: {
      chosen: shipping.chosen,
      cost: shipping.cost,
      alternatives: shipping.options,
      intelligence: shipping.intelligence
    },
    fees: {
      amazon_fee_percent: totals.amazon_fee_percent,
      amazon_fee: totals.amazon_fee,
      vat_rate: totals.vat_rate,
      vat_amount: totals.vat_amount,
      return_buffer: totals.return_buffer
    },
    totals: {
      shipping_cost: totals.shipping_cost,
      total_cost: totals.total_cost,
      net_profit: totals.net_profit,
      roi_percent: totals.roi_percent,
      profit_per_unit: totals.profit_per_unit
    },
    analysis: {
      category: analysis.category,
      grade: analysis.grade,
      text: analysis.text,
      color: analysis.color
    }
  };
}

module.exports = {
  checkKleinpaketEligibility,
  calculateShipping,
  calculateCosts,
  generateAnalysis,
  calculateProductAnalysis,
  KLEINPAKET_LIMITS,
  SHIPPING_OPTIONS,
  VAT_RATES,
  DEFAULTS
};

