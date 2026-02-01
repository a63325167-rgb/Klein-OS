/**
 * Type Definitions for Recommendation Engine
 * Using JSDoc for type documentation in JavaScript
 */

/**
 * @typedef {Object} ProductInput
 * @property {number} selling_price - Selling price in EUR
 * @property {number} buying_price - Cost of goods in EUR
 * @property {number} length_cm - Package length in cm
 * @property {number} width_cm - Package width in cm
 * @property {number} height_cm - Package height in cm
 * @property {number} weight_kg - Package weight in kg
 * @property {number} annual_volume - Estimated annual sales volume
 * @property {string} [product_name] - Optional product name
 * @property {string} [category] - Optional product category
 */

/**
 * @typedef {Object} CalculationTotals
 * @property {number} total_cost - Total cost per unit
 * @property {number} net_profit - Net profit per unit
 * @property {number} profit_margin - Profit margin percentage
 * @property {number} roi_percent - Return on investment percentage
 */

/**
 * @typedef {Object} SmallPackageCheck
 * @property {boolean} isEligible - Whether product qualifies for Small Package
 * @property {Array<string>} failures - Array of failure reasons
 * @property {number} [savings] - Savings amount if eligible
 */

/**
 * @typedef {Object} CalculationResult
 * @property {ProductInput} input - Original input data
 * @property {CalculationTotals} totals - Calculated totals
 * @property {SmallPackageCheck} smallPackageCheck - Small package eligibility
 * @property {Object} amazonFee - Amazon fee details
 * @property {Object} shipping - Shipping cost details
 * @property {Object} vat - VAT details
 */

/**
 * @typedef {Object} RecommendationOutput
 * @property {string} id - Unique recommendation identifier
 * @property {string} title - Short recommendation title
 * @property {string} description - Detailed explanation with quantified impact
 * @property {Object} impact - Quantified impact metrics
 * @property {number} impact.annual_savings - Annual savings in EUR
 * @property {string} impact.calculation - How the savings were calculated
 * @property {string} actionable - Specific action the seller can take
 * @property {'high'|'medium'|'low'} priority - Priority level
 * @property {number} priority_score - Numeric score for sorting (higher = more important)
 * @property {string} icon - Emoji icon for visual representation
 */

/**
 * Recommendation function type
 * @callback RecommendationFunction
 * @param {CalculationResult} result - Calculation result
 * @returns {RecommendationOutput|null} Recommendation or null if not applicable
 */

module.exports = {};

