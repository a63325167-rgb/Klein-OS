/**
 * Metric Validation Utilities (B6)
 * 
 * Validates all metric calculations for accuracy and consistency.
 * Ensures formulas match terminology glossary definitions.
 */

import { getAllMetrics, getMetric, validateMetric as glossaryValidate } from './terminologyGlossary';

/**
 * Validate a calculated metric value
 * 
 * @param {string} metricKey - Key from terminology glossary
 * @param {number} value - Calculated value
 * @param {object} context - Additional context for validation
 * @returns {object} Validation result
 */
export function validateMetricValue(metricKey, value, context = {}) {
  const metric = getMetric(metricKey);
  
  if (!metric) {
    return {
      valid: false,
      error: `Unknown metric: ${metricKey}`,
      severity: 'error'
    };
  }

  // Use glossary validation
  const glossaryResult = glossaryValidate(metricKey, value);
  if (!glossaryResult.valid) {
    return {
      ...glossaryResult,
      severity: 'error',
      metricName: metric.name
    };
  }

  // Additional range checks
  const rangeCheck = validateRange(metricKey, value, metric);
  if (!rangeCheck.valid) {
    return {
      ...rangeCheck,
      severity: 'warning',
      metricName: metric.name
    };
  }

  return {
    valid: true,
    metricName: metric.name,
    value,
    units: metric.units
  };
}

/**
 * Validate metric is within reasonable range
 */
function validateRange(metricKey, value, metric) {
  // Percentage metrics
  if (metric.units === '%') {
    if (value < -100 || value > 100) {
      return {
        valid: false,
        error: `${metric.name} out of range: ${value}% (expected -100% to 100%)`
      };
    }
  }

  // Currency metrics (should be reasonable)
  if (metric.units?.includes('€')) {
    if (value < -10000 || value > 1000000) {
      return {
        valid: false,
        error: `${metric.name} out of reasonable range: €${value} (expected -€10,000 to €1,000,000)`
      };
    }
  }

  // Time metrics (days)
  if (metric.units === 'days') {
    if (value < 0 || value > 1825) { // 5 years max
      return {
        valid: false,
        error: `${metric.name} out of range: ${value} days (expected 0 to 1825 days)`
      };
    }
  }

  // Time metrics (months)
  if (metric.units === 'months') {
    if (value < 0 || value > 120) { // 10 years max
      return {
        valid: false,
        error: `${metric.name} out of range: ${value} months (expected 0 to 120 months)`
      };
    }
  }

  // Score metrics
  if (metric.units === 'score (0-100)') {
    if (value < 0 || value > 100) {
      return {
        valid: false,
        error: `${metric.name} out of range: ${value} (expected 0 to 100)`
      };
    }
  }

  return { valid: true };
}

/**
 * Audit all calculations in a product analysis result
 * 
 * @param {object} analysisResult - Product analysis result
 * @returns {object} Audit report
 */
export function auditCalculations(analysisResult) {
  const errors = [];
  const warnings = [];
  const validations = [];

  // Define expected metrics and their locations in result
  const metricsToAudit = [
    { key: 'profitPerUnit', path: 'totals.net_profit' },
    { key: 'profitMargin', path: 'totals.profit_margin' },
    { key: 'breakEvenDays', path: 'totals.break_even_units' }, // Note: may need conversion
    { key: 'totalMonthlyProfit', path: 'totals.monthly_profit' }
  ];

  metricsToAudit.forEach(({ key, path }) => {
    const value = getNestedValue(analysisResult, path);
    
    if (value === undefined || value === null) {
      warnings.push({
        metric: key,
        message: `Metric ${key} not found in analysis result at path: ${path}`
      });
      return;
    }

    const validation = validateMetricValue(key, value);
    validations.push({
      metric: key,
      ...validation
    });

    if (!validation.valid) {
      if (validation.severity === 'error') {
        errors.push({
          metric: key,
          error: validation.error
        });
      } else {
        warnings.push({
          metric: key,
          warning: validation.error
        });
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    validations,
    summary: {
      total: validations.length,
      passed: validations.filter(v => v.valid).length,
      failed: errors.length,
      warnings: warnings.length
    }
  };
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Verify formula accuracy by recalculating
 * 
 * @param {string} metricKey - Metric to verify
 * @param {object} inputs - Input values
 * @param {number} expectedValue - Expected result
 * @returns {object} Verification result
 */
export function verifyFormula(metricKey, inputs, expectedValue) {
  const metric = getMetric(metricKey);
  
  if (!metric) {
    return {
      valid: false,
      error: `Unknown metric: ${metricKey}`
    };
  }

  let calculatedValue;

  // Calculate based on metric key
  switch (metricKey) {
    case 'profitPerUnit':
      calculatedValue = calculateProfitPerUnit(inputs);
      break;
    case 'profitMargin':
      calculatedValue = calculateProfitMargin(inputs);
      break;
    case 'breakEvenDays':
      calculatedValue = calculateBreakEvenDays(inputs);
      break;
    case 'totalMonthlyProfit':
      calculatedValue = calculateTotalMonthlyProfit(inputs);
      break;
    default:
      return {
        valid: false,
        error: `Formula verification not implemented for: ${metricKey}`
      };
  }

  const tolerance = 0.01; // Allow 1 cent difference for rounding
  const difference = Math.abs(calculatedValue - expectedValue);
  const matches = difference <= tolerance;

  return {
    valid: matches,
    expected: expectedValue,
    calculated: calculatedValue,
    difference,
    formula: metric.formula,
    error: matches ? null : `Formula mismatch: expected ${expectedValue}, got ${calculatedValue}`
  };
}

/**
 * Formula implementations for verification
 */
function calculateProfitPerUnit(inputs) {
  const {
    sellingPrice,
    returnRate = 0,
    cogs,
    referralFee,
    fbaFee,
    vat,
    shippingCost
  } = inputs;

  const revenueAfterReturns = sellingPrice * (1 - returnRate);
  const referralCost = sellingPrice * referralFee;
  const fbaCost = sellingPrice * fbaFee;
  const totalCosts = cogs + referralCost + fbaCost + vat + shippingCost;

  return revenueAfterReturns - totalCosts;
}

function calculateProfitMargin(inputs) {
  const { profitPerUnit, sellingPrice } = inputs;
  return (profitPerUnit / sellingPrice) * 100;
}

function calculateBreakEvenDays(inputs) {
  const { initialInventoryCost, profitPerUnit, monthlySalesVelocity } = inputs;
  const dailySales = monthlySalesVelocity / 30;
  return initialInventoryCost / (profitPerUnit * dailySales);
}

function calculateTotalMonthlyProfit(inputs) {
  const { profitPerUnit, monthlySalesVelocity } = inputs;
  return profitPerUnit * monthlySalesVelocity;
}

/**
 * Check for deprecated metric usage
 * 
 * @param {string} code - Code to check
 * @returns {array} List of deprecated metrics found
 */
export function checkDeprecatedMetrics(code) {
  const deprecated = [
    { term: 'grossProfitPerUnit', pattern: /gross.*profit.*unit/gi },
    { term: 'grossMargin', pattern: /gross.*margin/gi },
    { term: 'netProfit(?!.*unit)', pattern: /\bnet\s*profit\b(?!.*unit)/gi } // "Net Profit" without "Per Unit"
  ];

  const found = [];

  deprecated.forEach(({ term, pattern }) => {
    const matches = code.match(pattern);
    if (matches) {
      found.push({
        term,
        occurrences: matches.length,
        matches: matches.slice(0, 5) // First 5 matches
      });
    }
  });

  return found;
}

/**
 * Generate metric audit report
 * 
 * @param {object} analysisResult - Product analysis result
 * @returns {string} Formatted audit report
 */
export function generateAuditReport(analysisResult) {
  const audit = auditCalculations(analysisResult);
  
  let report = '=== METRIC AUDIT REPORT ===\n\n';
  report += `Total Metrics: ${audit.summary.total}\n`;
  report += `Passed: ${audit.summary.passed}\n`;
  report += `Failed: ${audit.summary.failed}\n`;
  report += `Warnings: ${audit.summary.warnings}\n\n`;

  if (audit.errors.length > 0) {
    report += '❌ ERRORS:\n';
    audit.errors.forEach(({ metric, error }) => {
      report += `  - ${metric}: ${error}\n`;
    });
    report += '\n';
  }

  if (audit.warnings.length > 0) {
    report += '⚠️ WARNINGS:\n';
    audit.warnings.forEach(({ metric, warning }) => {
      report += `  - ${metric}: ${warning}\n`;
    });
    report += '\n';
  }

  if (audit.valid) {
    report += '✅ All metrics validated successfully!\n';
  }

  return report;
}

/**
 * Test cases for validation
 */
export const TEST_CASES = {
  profitPerUnit: {
    inputs: {
      sellingPrice: 50,
      returnRate: 0.05,
      cogs: 20,
      referralFee: 0.15,
      fbaFee: 0.08,
      vat: 9.50,
      shippingCost: 2
    },
    expected: 4.50,
    tolerance: 0.01
  },
  profitMargin: {
    inputs: {
      profitPerUnit: 4.50,
      sellingPrice: 50
    },
    expected: 9,
    tolerance: 0.1
  },
  breakEvenDays: {
    inputs: {
      initialInventoryCost: 2100,
      profitPerUnit: 4.50,
      monthlySalesVelocity: 90
    },
    expected: 156,
    tolerance: 1
  }
};
