/**
 * Input Validation Utility
 * Provides warnings and errors for calculator inputs to prevent garbage calculations
 */

/**
 * Validation severity levels
 */
export const SEVERITY = {
  ERROR: 'error',    // Blocks calculation
  WARNING: 'warning', // Shows warning but allows calculation
  INFO: 'info'       // Informational message
};

/**
 * Validate buying price (COGS)
 */
export function validateBuyingPrice(buyingPrice, sellingPrice) {
  const warnings = [];
  
  if (!buyingPrice || buyingPrice <= 0) {
    warnings.push({
      field: 'buying_price',
      severity: SEVERITY.ERROR,
      message: '❌ Buying price is required and must be greater than 0'
    });
  } else if (buyingPrice > 10000) {
    warnings.push({
      field: 'buying_price',
      severity: SEVERITY.WARNING,
      message: `⚠️ High COGS (€${buyingPrice.toLocaleString()}) - verify supplier quote. Typical range: €5-500`
    });
  } else if (sellingPrice && buyingPrice >= sellingPrice) {
    warnings.push({
      field: 'buying_price',
      severity: SEVERITY.ERROR,
      message: `❌ COGS (€${buyingPrice.toFixed(2)}) exceeds selling price (€${sellingPrice.toFixed(2)}) - product is unprofitable`
    });
  }
  
  return warnings;
}

/**
 * Validate selling price
 */
export function validateSellingPrice(sellingPrice) {
  const warnings = [];
  
  if (!sellingPrice || sellingPrice <= 0) {
    warnings.push({
      field: 'selling_price',
      severity: SEVERITY.ERROR,
      message: '❌ Selling price is required and must be greater than 0'
    });
  } else if (sellingPrice > 5000) {
    warnings.push({
      field: 'selling_price',
      severity: SEVERITY.WARNING,
      message: `⚠️ Luxury item (€${sellingPrice.toLocaleString()}) - ensure market demand exists`
    });
  } else if (sellingPrice < 5) {
    warnings.push({
      field: 'selling_price',
      severity: SEVERITY.WARNING,
      message: `⚠️ Very low price (€${sellingPrice.toFixed(2)}) - Amazon fees may exceed revenue`
    });
  }
  
  return warnings;
}

/**
 * Validate weight
 */
export function validateWeight(weight_kg) {
  const warnings = [];
  
  if (!weight_kg || weight_kg <= 0) {
    warnings.push({
      field: 'weight_kg',
      severity: SEVERITY.ERROR,
      message: '❌ Weight is required and must be greater than 0'
    });
  } else if (weight_kg > 300) {
    warnings.push({
      field: 'weight_kg',
      severity: SEVERITY.ERROR,
      message: `❌ Too heavy (${weight_kg}kg) for standard e-commerce fulfillment (max 300kg)`
    });
  } else if (weight_kg > 31.5) {
    warnings.push({
      field: 'weight_kg',
      severity: SEVERITY.WARNING,
      message: `⚠️ Freight shipping required (${weight_kg}kg) - costs estimated, get carrier quote for accuracy`
    });
  } else if (weight_kg < 0.01) {
    warnings.push({
      field: 'weight_kg',
      severity: SEVERITY.WARNING,
      message: `⚠️ Unusually light (${weight_kg}kg) - verify packaging weight is included`
    });
  }
  
  return warnings;
}

/**
 * Validate dimensions
 */
export function validateDimensions(length_cm, width_cm, height_cm) {
  const warnings = [];
  
  // Check if any dimension is missing or invalid
  if (!length_cm || length_cm <= 0 || !width_cm || width_cm <= 0 || !height_cm || height_cm <= 0) {
    warnings.push({
      field: 'dimensions',
      severity: SEVERITY.ERROR,
      message: '❌ All dimensions (length, width, height) are required and must be greater than 0'
    });
    return warnings;
  }
  
  // Check for oversized items
  const maxDimension = Math.max(length_cm, width_cm, height_cm);
  if (maxDimension > 200) {
    warnings.push({
      field: 'dimensions',
      severity: SEVERITY.ERROR,
      message: `❌ Oversized (${maxDimension}cm max dimension) - Amazon/DHL won't accept items over 200cm`
    });
  }
  
  // Check volume (bulky items)
  const volumeLiters = (length_cm * width_cm * height_cm) / 1000;
  if (volumeLiters > 200) {
    warnings.push({
      field: 'dimensions',
      severity: SEVERITY.WARNING,
      message: `⚠️ Bulky item (${volumeLiters.toFixed(0)}L volume) - storage fees will be high (€0.50-1.00/L/month)`
    });
  }
  
  return warnings;
}

/**
 * Validate profit margin and provide viability assessment
 */
export function validateProfitMargin(margin) {
  const warnings = [];
  
  if (margin < 5) {
    warnings.push({
      field: 'profit_margin',
      severity: SEVERITY.ERROR,
      message: `❌ NOT VIABLE (${margin.toFixed(1)}% margin) - Risk too high, find better product`,
      badge: '🔴 CRITICAL',
      color: 'red'
    });
  } else if (margin < 15) {
    warnings.push({
      field: 'profit_margin',
      severity: SEVERITY.WARNING,
      message: `⚠️ RISKY (${margin.toFixed(1)}% margin) - One return wipes out profit from 3 sales`,
      badge: '🟠 RISKY',
      color: 'orange'
    });
  } else if (margin < 25) {
    warnings.push({
      field: 'profit_margin',
      severity: SEVERITY.INFO,
      message: `⚠️ ACCEPTABLE (${margin.toFixed(1)}% margin) - Optimize costs to improve margin`,
      badge: '🟡 ACCEPTABLE',
      color: 'yellow'
    });
  } else if (margin < 40) {
    warnings.push({
      field: 'profit_margin',
      severity: SEVERITY.INFO,
      message: `✅ GOOD (${margin.toFixed(1)}% margin) - Solid product, scale carefully`,
      badge: '🟢 GOOD',
      color: 'green'
    });
  } else {
    warnings.push({
      field: 'profit_margin',
      severity: SEVERITY.INFO,
      message: `🎉 EXCELLENT (${margin.toFixed(1)}% margin) - High-profit winner, scale aggressively`,
      badge: '💎 EXCELLENT',
      color: 'blue'
    });
  }
  
  return warnings;
}

/**
 * Validate ROI
 */
export function validateROI(roi) {
  const warnings = [];
  
  if (roi < 20) {
    warnings.push({
      field: 'roi',
      severity: SEVERITY.WARNING,
      message: `⚠️ Low ROI (${roi.toFixed(1)}%) - Consider products with 50%+ ROI for better returns`
    });
  }
  
  return warnings;
}

/**
 * Validate annual volume
 */
export function validateAnnualVolume(volume) {
  const warnings = [];
  
  if (!volume || volume <= 0) {
    warnings.push({
      field: 'annual_volume',
      severity: SEVERITY.WARNING,
      message: '⚠️ Annual volume not set - using default 500 units for calculations'
    });
  } else if (volume < 50) {
    warnings.push({
      field: 'annual_volume',
      severity: SEVERITY.INFO,
      message: `ℹ️ Low volume (${volume} units/year) - Consider if worth the setup effort`
    });
  } else if (volume > 10000) {
    warnings.push({
      field: 'annual_volume',
      severity: SEVERITY.INFO,
      message: `ℹ️ High volume (${volume.toLocaleString()} units/year) - Negotiate bulk discounts with suppliers`
    });
  }
  
  return warnings;
}

/**
 * Comprehensive validation of all inputs
 */
export function validateAllInputs(product, result = null) {
  const allWarnings = [];
  
  // Validate inputs
  allWarnings.push(...validateBuyingPrice(product.buying_price, product.selling_price));
  allWarnings.push(...validateSellingPrice(product.selling_price));
  allWarnings.push(...validateWeight(product.weight_kg));
  allWarnings.push(...validateDimensions(product.length_cm, product.width_cm, product.height_cm));
  allWarnings.push(...validateAnnualVolume(product.annual_volume));
  
  // Validate results if available
  if (result && result.totals) {
    allWarnings.push(...validateProfitMargin(result.totals.profit_margin));
    allWarnings.push(...validateROI(result.totals.roi_percent));
  }
  
  return allWarnings;
}

/**
 * Check if there are any blocking errors
 */
export function hasBlockingErrors(warnings) {
  return warnings.some(w => w.severity === SEVERITY.ERROR);
}

/**
 * Group warnings by severity
 */
export function groupWarningsBySeverity(warnings) {
  return {
    errors: warnings.filter(w => w.severity === SEVERITY.ERROR),
    warnings: warnings.filter(w => w.severity === SEVERITY.WARNING),
    info: warnings.filter(w => w.severity === SEVERITY.INFO)
  };
}

/**
 * Format warning for display
 */
export function formatWarning(warning) {
  const icons = {
    [SEVERITY.ERROR]: '❌',
    [SEVERITY.WARNING]: '⚠️',
    [SEVERITY.INFO]: 'ℹ️'
  };
  
  const colors = {
    [SEVERITY.ERROR]: 'red',
    [SEVERITY.WARNING]: 'yellow',
    [SEVERITY.INFO]: 'blue'
  };
  
  return {
    ...warning,
    icon: icons[warning.severity],
    color: warning.color || colors[warning.severity]
  };
}
