/**
 * Packaging Optimization Recommendation
 * 
 * Analyzes package dimensions and weight to identify Small Package qualification opportunities.
 * Provides quantified annual savings based on user's volume estimates.
 * 
 * Business Logic:
 * - Small Package eligibility: height ≤ 8cm AND weight ≤ 1kg
 * - Savings: €1.71 per unit (€5.50 standard - €3.79 small package)
 * - Only recommend if product is CLOSE to qualifying (not way off)
 */

/**
 * Round a number to specified decimal places
 * @param {number} value - Value to round
 * @param {number} decimals - Number of decimal places
 * @returns {number} Rounded value
 */
function roundToPrecision(value, decimals = 2) {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

/**
 * Small Package shipping rates (Kleinpaket)
 */
const SHIPPING_RATES = {
  SMALL_PACKAGE: 3.79,
  STANDARD_PACKAGE: 5.50,
  SAVINGS_PER_UNIT: 1.71
};

/**
 * Small Package eligibility thresholds
 */
const THRESHOLDS = {
  MAX_HEIGHT_CM: 8,
  MAX_WEIGHT_KG: 1.0
};

/**
 * Checks if product is "close" to qualifying (worth optimizing)
 * We only recommend if seller can realistically achieve Small Package status
 */
function isOptimizationFeasible(height_cm, weight_kg) {
  // Height is within 20% of threshold (up to 9.6cm = feasible)
  const heightFeasible = height_cm <= THRESHOLDS.MAX_HEIGHT_CM * 1.2;
  
  // Weight is within 30% of threshold (up to 1.3kg = feasible)
  const weightFeasible = weight_kg <= THRESHOLDS.MAX_WEIGHT_KG * 1.3;
  
  return heightFeasible && weightFeasible;
}

/**
 * Identifies specific dimension issues preventing Small Package eligibility
 */
function identifyDimensionIssues(height_cm, weight_kg) {
  const issues = [];
  
  if (height_cm > THRESHOLDS.MAX_HEIGHT_CM) {
    const excess = roundToPrecision(height_cm - THRESHOLDS.MAX_HEIGHT_CM, 1);
    issues.push({
      dimension: 'height',
      current: height_cm,
      target: THRESHOLDS.MAX_HEIGHT_CM,
      excess: excess,
      label: `Height: ${height_cm}cm → ${THRESHOLDS.MAX_HEIGHT_CM}cm (reduce by ${excess}cm)`
    });
  }
  
  if (weight_kg > THRESHOLDS.MAX_WEIGHT_KG) {
    const excess = roundToPrecision((weight_kg - THRESHOLDS.MAX_WEIGHT_KG) * 1000, 0); // in grams
    issues.push({
      dimension: 'weight',
      current: weight_kg,
      target: THRESHOLDS.MAX_WEIGHT_KG,
      excess: excess,
      label: `Weight: ${weight_kg}kg → ${THRESHOLDS.MAX_WEIGHT_KG}kg (reduce by ${excess}g)`
    });
  }
  
  return issues;
}

/**
 * Generates packaging optimization recommendation
 * 
 * @param {Object} result - Calculation result from simpleCalculator
 * @returns {Object|null} Recommendation object or null if not applicable
 */
function packagingOptimization(result) {
  const { input, smallPackageCheck, totals } = result;
  
  // Skip if already eligible for Small Package
  if (smallPackageCheck.isEligible) {
    return null;
  }
  
  // Extract dimensions
  const height_cm = parseFloat(input.height_cm) || 0;
  const weight_kg = parseFloat(input.weight_kg) || 0;
  const annual_volume = parseInt(input.annual_volume) || 500;
  
  // Skip if optimization is not feasible
  if (!isOptimizationFeasible(height_cm, weight_kg)) {
    return null;
  }
  
  // Identify specific issues
  const issues = identifyDimensionIssues(height_cm, weight_kg);
  
  if (issues.length === 0) {
    // No issues found but not eligible? Edge case, skip
    return null;
  }
  
  // Calculate quantified impact
  const savings_per_unit = SHIPPING_RATES.SAVINGS_PER_UNIT;
  const annual_savings = roundToPrecision(savings_per_unit * annual_volume, 0);
  const roi_increase = roundToPrecision((savings_per_unit / totals.total_cost) * 100, 1);
  
  // Build issue description
  const primaryIssue = issues[0];
  const issueDescription = issues.length === 1 
    ? primaryIssue.label
    : `${issues.map(i => i.label).join(' AND ')}`;
  
  // Build detailed description with math
  const description = `Your package ${issueDescription}. Optimizing for Small Package eligibility saves €${savings_per_unit.toFixed(2)}/unit (€${SHIPPING_RATES.STANDARD_PACKAGE} → €${SHIPPING_RATES.SMALL_PACKAGE}). At ${annual_volume.toLocaleString('de-DE')} units/year = €${annual_savings.toLocaleString('de-DE')} annual savings (+${roi_increase}% ROI per unit).`;
  
  // Calculate priority score
  // Higher savings = higher priority
  const priority_score = Math.min(annual_savings / 100, 100); // Cap at 100
  
  return {
    id: 'packaging-optimization',
    title: 'Packaging Redesign Opportunity',
    description: description,
    impact: {
      annual_savings: annual_savings,
      savings_per_unit: savings_per_unit,
      roi_increase_percent: roi_increase,
      calculation: `€${savings_per_unit.toFixed(2)}/unit × ${annual_volume.toLocaleString('de-DE')} units = €${annual_savings.toLocaleString('de-DE')}/year`,
      issues: issues
    },
    actionable: 'Consult with supplier about custom packaging dimensions. Options: (1) Reduce packaging material thickness, (2) Switch to flat-pack design, (3) Use vacuum-sealed packaging.',
    priority: annual_savings >= 1000 ? 'high' : 'medium',
    priority_score: priority_score,
    icon: '📦',
    type: 'logistics'
  };
}

export {
  packagingOptimization,
  SHIPPING_RATES,
  THRESHOLDS
};

