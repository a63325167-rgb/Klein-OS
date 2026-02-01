/**
 * Findings Detection Engines - Main Export
 * 
 * Three independent detection functions that identify portfolio problems:
 * 1. Dead Inventory - Capital bleeding through old inventory + low margins
 * 2. Low Margin - Money left on table through underpricing
 * 3. Slow Velocity - Capital inefficiency from slow turnover
 * 
 * Each function returns standardized finding objects with exact financial impact.
 * 
 * @example
 * ```typescript
 * import { detectDeadInventory, detectLowMargin, detectSlowVelocity } from './lib/findings';
 * 
 * const products = [...]; // Your product array
 * 
 * const deadInventoryFindings = detectDeadInventory(products);
 * const lowMarginFindings = detectLowMargin(products);
 * const slowVelocityFindings = detectSlowVelocity(products);
 * 
 * // Combine all findings
 * const allFindings = [
 *   ...deadInventoryFindings,
 *   ...lowMarginFindings,
 *   ...slowVelocityFindings
 * ];
 * ```
 */

// Detection engines
export { detectDeadInventory, testDeadInventory } from './deadInventory';
export { detectLowMargin, testLowMargin } from './lowMargin';
export { detectSlowVelocity, testSlowVelocity } from './slowVelocity';

// Types
export type { 
  Product, 
  Finding, 
  Action,
  DeadInventoryFinding,
  LowMarginFinding,
  SlowVelocityFinding
} from './types';

// Utilities (for advanced usage)
export { 
  FBA_RATES_2024,
  calculateNetMargin,
  calculateNetProfit,
  inferMonthlyVelocity,
  roundPrice,
  getFulfillmentFee,
  formatCurrency
} from './utils';

/**
 * Run all three detection engines on a product portfolio
 * 
 * @param products - Array of products to analyze
 * @returns Object containing all findings grouped by type
 * 
 * @example
 * ```typescript
 * const results = runAllDetections(products);
 * console.log(`Found ${results.deadInventory.length} dead inventory issues`);
 * console.log(`Found ${results.lowMargin.length} low margin opportunities`);
 * console.log(`Found ${results.slowVelocity.length} slow velocity products`);
 * ```
 */
export function runAllDetections(products: any[]) {
  const { detectDeadInventory } = require('./deadInventory');
  const { detectLowMargin } = require('./lowMargin');
  const { detectSlowVelocity } = require('./slowVelocity');
  
  return {
    deadInventory: detectDeadInventory(products),
    lowMargin: detectLowMargin(products),
    slowVelocity: detectSlowVelocity(products),
    
    // Combined array sorted by financial impact
    all: [
      ...detectDeadInventory(products),
      ...detectLowMargin(products),
      ...detectSlowVelocity(products)
    ].sort((a, b) => b.financial_impact_annual_eur - a.financial_impact_annual_eur)
  };
}

/**
 * Run all test suites
 * Validates that all detection engines produce expected results
 */
export function runAllTests() {
  console.log("=".repeat(60));
  console.log("RUNNING ALL FINDINGS DETECTION TESTS");
  console.log("=".repeat(60));
  console.log("");
  
  const { testDeadInventory } = require('./deadInventory');
  const { testLowMargin } = require('./lowMargin');
  const { testSlowVelocity } = require('./slowVelocity');
  
  testDeadInventory();
  console.log("");
  testLowMargin();
  console.log("");
  testSlowVelocity();
  
  console.log("");
  console.log("=".repeat(60));
  console.log("ALL TESTS COMPLETE");
  console.log("=".repeat(60));
}
