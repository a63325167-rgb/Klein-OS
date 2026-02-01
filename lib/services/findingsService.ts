/**
 * FINDINGS AGGREGATOR SERVICE
 * 
 * Orchestrates all three detection engines and returns ranked findings.
 * This is the bridge between "calculate problems" and "show problems to user."
 * 
 * Flow:
 * 1. Run all three detection engines
 * 2. Merge findings into single array
 * 3. Deduplicate (same ASIN flagged by multiple engines)
 * 4. Sort by impact priority
 * 5. Calculate summary statistics
 * 6. Return clean findings object
 */

import type { Product, Finding } from '../findings/types';
import { detectDeadInventory } from '../findings/deadInventory';
import { detectLowMargin } from '../findings/lowMargin';
import { detectSlowVelocity } from '../findings/slowVelocity';

/**
 * Summary statistics for all findings
 */
export interface FindingsSummary {
  total_findings: number;
  critical_findings: number;
  opportunity_findings: number;
  total_annual_opportunity_eur: number;
  highest_impact_asin: string;
  highest_impact_amount_eur: number;
}

/**
 * Complete findings result with summary
 */
export interface FindingsResult {
  findings: Finding[];
  summary: FindingsSummary;
}

/**
 * Generate findings for a product portfolio
 * 
 * Runs all three detection engines, merges results, deduplicates,
 * sorts by priority, and calculates summary statistics.
 * 
 * @param products - Array of products to analyze
 * @returns FindingsResult with findings array and summary stats
 * 
 * @example
 * ```typescript
 * const result = generateFindings(products);
 * console.log(`Found ${result.summary.total_findings} issues`);
 * console.log(`Total opportunity: €${result.summary.total_annual_opportunity_eur}`);
 * ```
 */
export function generateFindings(products: Product[]): FindingsResult {
  // ============================================
  // STEP 1: Run Dead Inventory Detection
  // ============================================
  // Flags products >180 days in stock with <15% margin
  const deadInventoryFindings = detectDeadInventory(products);
  
  // ============================================
  // STEP 2: Run Low Margin Detection
  // ============================================
  // Flags products with <10% margin that are actively selling
  const lowMarginFindings = detectLowMargin(products);
  
  // ============================================
  // STEP 3: Run Slow Velocity Detection
  // ============================================
  // Flags products with good margins but slow turnover
  const slowVelocityFindings = detectSlowVelocity(products);
  
  // ============================================
  // STEP 4: Merge All Findings
  // ============================================
  // Combine all findings into single array
  let allFindings: Finding[] = [
    ...deadInventoryFindings,
    ...lowMarginFindings,
    ...slowVelocityFindings
  ];
  
  // ============================================
  // STEP 4.5: Deduplicate by ASIN
  // ============================================
  // If same ASIN appears in multiple findings, keep highest-impact one only
  allFindings = deduplicateFindings(allFindings);
  
  // ============================================
  // STEP 5: Sort by Impact
  // ============================================
  // Primary sort: impact_priority (highest first)
  // Secondary sort: financial_impact_annual_eur (highest first)
  allFindings.sort((a, b) => {
    // First compare by priority
    if (b.impact_priority !== a.impact_priority) {
      return b.impact_priority - a.impact_priority;
    }
    // If priority is same, compare by financial impact
    return b.financial_impact_annual_eur - a.financial_impact_annual_eur;
  });
  
  // ============================================
  // STEP 6: Calculate Summary Stats
  // ============================================
  const summary = calculateSummary(allFindings);
  
  // ============================================
  // STEP 7: Return Result
  // ============================================
  return {
    findings: allFindings,
    summary: summary
  };
}

/**
 * Deduplicate findings by ASIN
 * 
 * If same ASIN is flagged by multiple engines, keep only the
 * finding with highest financial impact.
 * 
 * @param findings - Array of findings (may contain duplicates)
 * @returns Deduplicated array
 */
function deduplicateFindings(findings: Finding[]): Finding[] {
  // Group findings by ASIN
  const findingsByAsin = new Map<string, Finding[]>();
  
  for (const finding of findings) {
    const asin = finding.asin;
    if (!findingsByAsin.has(asin)) {
      findingsByAsin.set(asin, []);
    }
    findingsByAsin.get(asin)!.push(finding);
  }
  
  // For each ASIN, keep only the highest-impact finding
  const deduplicatedFindings: Finding[] = [];
  
  for (const [asin, asinFindings] of findingsByAsin.entries()) {
    if (asinFindings.length === 1) {
      // Only one finding for this ASIN, keep it
      deduplicatedFindings.push(asinFindings[0]);
    } else {
      // Multiple findings for same ASIN, keep highest impact
      const highestImpact = asinFindings.reduce((prev, current) => {
        return current.financial_impact_annual_eur > prev.financial_impact_annual_eur
          ? current
          : prev;
      });
      deduplicatedFindings.push(highestImpact);
    }
  }
  
  return deduplicatedFindings;
}

/**
 * Calculate summary statistics for findings
 * 
 * @param findings - Array of findings (already deduplicated and sorted)
 * @returns Summary object with aggregate stats
 */
function calculateSummary(findings: Finding[]): FindingsSummary {
  // Handle empty findings array
  if (findings.length === 0) {
    return {
      total_findings: 0,
      critical_findings: 0,
      opportunity_findings: 0,
      total_annual_opportunity_eur: 0,
      highest_impact_asin: '',
      highest_impact_amount_eur: 0
    };
  }
  
  // Count findings by severity
  let criticalCount = 0;
  let opportunityCount = 0;
  
  for (const finding of findings) {
    if (finding.severity === 'critical') {
      criticalCount++;
    } else if (finding.severity === 'opportunity') {
      opportunityCount++;
    }
  }
  
  // Calculate total annual opportunity
  // This is the sum of ALL financial impacts (both critical and opportunity)
  const totalAnnualOpportunity = findings.reduce((sum, finding) => {
    return sum + finding.financial_impact_annual_eur;
  }, 0);
  
  // Round to 2 decimal places
  const totalAnnualOpportunityRounded = Math.round(totalAnnualOpportunity * 100) / 100;
  
  // Highest impact finding (first in sorted array)
  const highestImpactFinding = findings[0];
  
  return {
    total_findings: findings.length,
    critical_findings: criticalCount,
    opportunity_findings: opportunityCount,
    total_annual_opportunity_eur: totalAnnualOpportunityRounded,
    highest_impact_asin: highestImpactFinding.asin,
    highest_impact_amount_eur: Math.round(highestImpactFinding.financial_impact_annual_eur * 100) / 100
  };
}

/**
 * TEST VALIDATION FUNCTION
 * Run this to verify the aggregator works correctly
 */
export function testFindingsService(): void {
  // Test with 4 products (1 healthy, 3 with issues)
  const testProducts: Product[] = [
    // Product 1: HEALTHY (good margin, fast turnover)
    {
      asin: "B08XYZ1234",
      product_name: "Healthy Product",
      cost_per_unit: 25.00,
      selling_price: 49.99,
      quantity_in_stock: 150,
      days_in_stock: 30,
      category: "Electronics",
      size_tier: "standard"
    },
    // Product 2: DEAD INVENTORY (426 days, 3.3% margin)
    {
      asin: "B08ABC5678",
      product_name: "Dead Inventory Item",
      cost_per_unit: 22.00,
      selling_price: 29.99,
      quantity_in_stock: 150,
      days_in_stock: 426,
      category: "Home & Kitchen",
      size_tier: "standard"
    },
    // Product 3: LOW MARGIN (9.1% margin, actively selling)
    {
      asin: "B08ABC5681",
      product_name: "Low Margin Product",
      cost_per_unit: 21.00,
      selling_price: 30.00,
      quantity_in_stock: 42,
      days_in_stock: 60,
      estimated_monthly_sales: 15,
      category: "Sports",
      size_tier: "standard"
    },
    // Product 4: SLOW VELOCITY (good margin, slow turnover)
    {
      asin: "B08ABC5680",
      product_name: "Slow Velocity Product",
      cost_per_unit: 12.00,
      selling_price: 34.99,
      quantity_in_stock: 200,
      days_in_stock: 165,
      category: "Sports",
      size_tier: "standard"
    }
  ];
  
  console.log("=== FINDINGS AGGREGATOR TEST ===");
  console.log(`Testing with ${testProducts.length} products...`);
  console.log("");
  
  // Run the aggregator
  const startTime = performance.now();
  const result = generateFindings(testProducts);
  const endTime = performance.now();
  const executionTime = endTime - startTime;
  
  console.log("=== RESULTS ===");
  console.log(`Total Findings: ${result.summary.total_findings} (expected 3)`);
  console.log(`Critical Findings: ${result.summary.critical_findings} (expected 2)`);
  console.log(`Opportunity Findings: ${result.summary.opportunity_findings} (expected 1)`);
  console.log(`Total Annual Opportunity: €${result.summary.total_annual_opportunity_eur} (expected ~€2,961)`);
  console.log(`Highest Impact ASIN: ${result.summary.highest_impact_asin} (expected B08ABC5678)`);
  console.log(`Highest Impact Amount: €${result.summary.highest_impact_amount_eur} (expected ~€2,226)`);
  console.log(`Execution Time: ${executionTime.toFixed(2)}ms (target <50ms)`);
  console.log("");
  
  console.log("=== FINDINGS DETAIL ===");
  result.findings.forEach((finding, index) => {
    console.log(`${index + 1}. ${finding.finding_type.toUpperCase()}`);
    console.log(`   ASIN: ${finding.asin}`);
    console.log(`   Severity: ${finding.severity}`);
    console.log(`   Impact: €${finding.financial_impact_annual_eur}/year`);
    console.log(`   Priority: ${finding.impact_priority}`);
    console.log(`   Headline: ${finding.problem_headline}`);
    console.log("");
  });
  
  // Validation checks
  const checks = {
    totalFindings: result.summary.total_findings === 3,
    criticalCount: result.summary.critical_findings === 2,
    opportunityCount: result.summary.opportunity_findings === 1,
    totalOpportunity: Math.abs(result.summary.total_annual_opportunity_eur - 2961) <= 300, // ±€300 tolerance
    highestImpactAsin: result.summary.highest_impact_asin === "B08ABC5678",
    sortedByPriority: result.findings.length === 0 || 
      result.findings.every((f, i) => 
        i === 0 || f.impact_priority <= result.findings[i - 1].impact_priority
      ),
    noDuplicates: new Set(result.findings.map(f => f.asin)).size === result.findings.length,
    performanceOk: executionTime < 50
  };
  
  console.log("=== VALIDATION CHECKS ===");
  console.log(`✓ Total Findings (3): ${checks.totalFindings ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`✓ Critical Count (2): ${checks.criticalCount ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`✓ Opportunity Count (1): ${checks.opportunityCount ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`✓ Total Opportunity (~€2,961): ${checks.totalOpportunity ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`✓ Highest Impact ASIN: ${checks.highestImpactAsin ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`✓ Sorted by Priority: ${checks.sortedByPriority ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`✓ No Duplicate ASINs: ${checks.noDuplicates ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`✓ Performance (<50ms): ${checks.performanceOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log("");
  
  const allPassed = Object.values(checks).every(v => v === true);
  
  if (allPassed) {
    console.log("✅ ALL TESTS PASSED: Findings Aggregator is working correctly");
  } else {
    console.error("❌ SOME TESTS FAILED: Review results above");
  }
}

/**
 * Test edge cases
 */
export function testEdgeCases(): void {
  console.log("=== EDGE CASE TESTS ===");
  console.log("");
  
  // Test 1: Empty product array
  console.log("Test 1: Empty product array");
  const emptyResult = generateFindings([]);
  console.log(`  Total findings: ${emptyResult.summary.total_findings} (expected 0)`);
  console.log(`  ${emptyResult.summary.total_findings === 0 ? '✅ PASS' : '❌ FAIL'}`);
  console.log("");
  
  // Test 2: All healthy products
  console.log("Test 2: All healthy products");
  const healthyProducts: Product[] = [
    {
      asin: "B08HEALTHY1",
      product_name: "Healthy Product 1",
      cost_per_unit: 20.00,
      selling_price: 49.99,
      quantity_in_stock: 100,
      days_in_stock: 30,
      category: "Electronics",
      size_tier: "standard"
    },
    {
      asin: "B08HEALTHY2",
      product_name: "Healthy Product 2",
      cost_per_unit: 15.00,
      selling_price: 39.99,
      quantity_in_stock: 80,
      days_in_stock: 45,
      category: "Home",
      size_tier: "standard"
    }
  ];
  const healthyResult = generateFindings(healthyProducts);
  console.log(`  Total findings: ${healthyResult.summary.total_findings} (expected 0)`);
  console.log(`  ${healthyResult.summary.total_findings === 0 ? '✅ PASS' : '❌ FAIL'}`);
  console.log("");
  
  console.log("✅ EDGE CASE TESTS COMPLETE");
}
