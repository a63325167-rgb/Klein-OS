/**
 * KLEIN FINDINGS ENGINE - MAIN EXPORT
 * 
 * Complete system for detecting portfolio problems and opportunities.
 * 
 * Three detection engines:
 * 1. Dead Inventory - Capital bleeding through old inventory
 * 2. Low Margin - Money left on table through underpricing
 * 3. Slow Velocity - Capital inefficiency from slow turnover
 * 
 * One aggregator service:
 * - Runs all engines, merges, deduplicates, sorts, summarizes
 * 
 * @example
 * ```typescript
 * import { generateFindings } from './lib';
 * 
 * const products = [...]; // Your product data
 * const result = generateFindings(products);
 * 
 * console.log(`Found ${result.summary.total_findings} issues`);
 * console.log(`Total opportunity: €${result.summary.total_annual_opportunity_eur}`);
 * 
 * result.findings.forEach(finding => {
 *   console.log(finding.problem_headline);
 * });
 * ```
 */

// ============================================
// MAIN SERVICE (Use This)
// ============================================
export { 
  generateFindings,
  testFindingsService,
  testEdgeCases
} from './services/findingsService';

export type {
  FindingsResult,
  FindingsSummary
} from './services/findingsService';

// ============================================
// INDIVIDUAL DETECTION ENGINES (Advanced)
// ============================================
export { 
  detectDeadInventory,
  testDeadInventory 
} from './findings/deadInventory';

export { 
  detectLowMargin,
  testLowMargin 
} from './findings/lowMargin';

export { 
  detectSlowVelocity,
  testSlowVelocity 
} from './findings/slowVelocity';

// ============================================
// TYPES
// ============================================
export type { 
  Product, 
  Finding, 
  Action,
  DeadInventoryFinding,
  LowMarginFinding,
  SlowVelocityFinding
} from './findings/types';

// ============================================
// UTILITIES (Advanced)
// ============================================
export { 
  FBA_RATES_2024,
  calculateNetMargin,
  calculateNetProfit,
  inferMonthlyVelocity,
  roundPrice,
  getFulfillmentFee,
  formatCurrency
} from './findings/utils';

// ============================================
// LEGACY EXPORTS (Backward Compatibility)
// ============================================
export { runAllDetections, runAllTests } from './findings/index';
