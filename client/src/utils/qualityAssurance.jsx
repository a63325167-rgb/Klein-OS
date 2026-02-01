/**
 * Quality Assurance and Testing Utilities
 * Verifies calculation accuracy and data integrity
 */

import { calculateProductAnalysis } from './calculations';
import { roundToPrecision } from './precision';

/**
 * Test datasets for verification
 */
export const TEST_DATASETS = [
  {
    name: 'Standard Product - Should be GOOD',
    product: {
      product_name: 'Standard Test Product',
      category: 'Electronics',
      buying_price: 25,
      selling_price: 69,
      destination_country: 'Germany',
      length_cm: 30,
      width_cm: 20,
      height_cm: 6,
      weight_kg: 0.8
    },
    expected: {
      smallPackageEligible: true,
      profitMargin: { min: 8, max: 15 },
      roi: { min: 20, max: 50 }
    }
  },
  {
    name: 'High Margin Product - Should be EXCELLENT',
    product: {
      product_name: 'High Margin Product',
      category: 'Books',
      buying_price: 10,
      selling_price: 50,
      destination_country: 'Germany',
      length_cm: 25,
      width_cm: 20,
      height_cm: 3,
      weight_kg: 0.5
    },
    expected: {
      smallPackageEligible: true,
      profitMargin: { min: 20, max: 40 },
      roi: { min: 80, max: 150 }
    }
  },
  {
    name: 'Low Margin Product - Should be POOR',
    product: {
      product_name: 'Low Margin Product',
      category: 'Food',
      buying_price: 15,
      selling_price: 20,
      destination_country: 'France',
      length_cm: 35,
      width_cm: 24,
      height_cm: 7,
      weight_kg: 0.9
    },
    expected: {
      smallPackageEligible: true,
      profitMargin: { min: -5, max: 5 },
      roi: { min: -10, max: 10 }
    }
  },
  {
    name: 'Oversized Product - Not Small Package',
    product: {
      product_name: 'Oversized Product',
      category: 'Default',
      buying_price: 45,
      selling_price: 115,
      destination_country: 'Germany',
      length_cm: 40,
      width_cm: 28,
      height_cm: 10,
      weight_kg: 1.2
    },
    expected: {
      smallPackageEligible: false,
      profitMargin: { min: 10, max: 20 },
      roi: { min: 30, max: 60 }
    }
  },
  {
    name: 'Premium Product - Should be EXCEPTIONAL',
    product: {
      product_name: 'Premium Product',
      category: 'Electronics',
      buying_price: 20,
      selling_price: 150,
      destination_country: 'Germany',
      length_cm: 28,
      width_cm: 22,
      height_cm: 5,
      weight_kg: 0.7
    },
    expected: {
      smallPackageEligible: true,
      profitMargin: { min: 30, max: 50 },
      roi: { min: 150, max: 300 }
    }
  }
];

/**
 * Run calculation test
 */
export function runCalculationTest(testData) {
  const { product, expected } = testData;
  
  try {
    const result = calculateProductAnalysis(product);
    const issues = [];

    // Verify Small Package eligibility
    if (result.smallPackageCheck.isEligible !== expected.smallPackageEligible) {
      issues.push({
        field: 'smallPackageCheck.isEligible',
        expected: expected.smallPackageEligible,
        actual: result.smallPackageCheck.isEligible,
        severity: 'error'
      });
    }

    // Verify profit margin range
    if (result.totals.profit_margin < expected.profitMargin.min || 
        result.totals.profit_margin > expected.profitMargin.max) {
      issues.push({
        field: 'totals.profit_margin',
        expected: `${expected.profitMargin.min}-${expected.profitMargin.max}%`,
        actual: `${result.totals.profit_margin.toFixed(2)}%`,
        severity: 'warning'
      });
    }

    // Verify ROI range
    if (result.totals.roi_percent < expected.roi.min || 
        result.totals.roi_percent > expected.roi.max) {
      issues.push({
        field: 'totals.roi_percent',
        expected: `${expected.roi.min}-${expected.roi.max}%`,
        actual: `${result.totals.roi_percent.toFixed(2)}%`,
        severity: 'warning'
      });
    }

    // Verify integrity check
    if (!result.integrityCheck.isValid) {
      issues.push({
        field: 'integrityCheck',
        expected: 'valid',
        actual: result.integrityCheck.message,
        severity: 'error'
      });
    }

    return {
      testName: testData.name,
      passed: issues.filter(i => i.severity === 'error').length === 0,
      warnings: issues.filter(i => i.severity === 'warning').length,
      issues,
      result
    };
  } catch (error) {
    return {
      testName: testData.name,
      passed: false,
      error: error.message,
      issues: [{
        field: 'calculation',
        expected: 'success',
        actual: 'error',
        severity: 'error',
        message: error.message
      }]
    };
  }
}

/**
 * Run all quality assurance tests
 */
export function runAllTests() {
  console.log('🧪 Running Quality Assurance Tests...\n');
  
  const results = TEST_DATASETS.map(testData => runCalculationTest(testData));
  
  const summary = {
    total: results.length,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => !r.passed).length,
    warnings: results.reduce((sum, r) => sum + (r.warnings || 0), 0),
    results
  };

  // Print results
  results.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.testName}`);
    
    if (result.issues && result.issues.length > 0) {
      result.issues.forEach(issue => {
        const icon = issue.severity === 'error' ? '  ❌' : '  ⚠️';
        console.log(`${icon} ${issue.field}: expected ${issue.expected}, got ${issue.actual}`);
      });
    }
    
    if (result.error) {
      console.log(`  ❌ Error: ${result.error}`);
    }
    console.log('');
  });

  console.log(`\n📊 Test Summary:`);
  console.log(`Total: ${summary.total}`);
  console.log(`Passed: ${summary.passed}`);
  console.log(`Failed: ${summary.failed}`);
  console.log(`Warnings: ${summary.warnings}`);
  
  return summary;
}

/**
 * Verify calculation consistency across multiple runs
 */
export function verifyConsistency(product, iterations = 5) {
  const results = [];
  
  for (let i = 0; i < iterations; i++) {
    results.push(calculateProductAnalysis(product));
  }

  // Check if all results are identical
  const firstResult = results[0];
  const inconsistencies = [];

  for (let i = 1; i < results.length; i++) {
    const current = results[i];
    
    if (current.totals.net_profit !== firstResult.totals.net_profit) {
      inconsistencies.push({
        field: 'net_profit',
        run1: firstResult.totals.net_profit,
        runN: current.totals.net_profit
      });
    }
    
    if (current.totals.roi_percent !== firstResult.totals.roi_percent) {
      inconsistencies.push({
        field: 'roi_percent',
        run1: firstResult.totals.roi_percent,
        runN: current.totals.roi_percent
      });
    }
  }

  return {
    consistent: inconsistencies.length === 0,
    iterations,
    inconsistencies
  };
}

/**
 * Verify mathematical accuracy
 */
export function verifyMathematicalAccuracy(result) {
  const issues = [];
  const tolerance = 0.02; // 2 cents tolerance

  // Verify: Revenue = Total Cost + Net Profit
  const calculatedRevenue = result.totals.total_cost + result.totals.net_profit;
  const actualRevenue = result.input.selling_price;
  const revenueDiff = Math.abs(calculatedRevenue - actualRevenue);

  if (revenueDiff > tolerance) {
    issues.push({
      check: 'Revenue = Total Cost + Net Profit',
      expected: actualRevenue.toFixed(2),
      calculated: calculatedRevenue.toFixed(2),
      difference: revenueDiff.toFixed(2)
    });
  }

  // Verify: Total Cost = Sum of all costs
  const sumOfCosts = result.input.buying_price + 
                     result.shipping.cost + 
                     result.amazonFee.amount + 
                     result.vat.amount + 
                     result.returnBuffer;
  const totalCostDiff = Math.abs(result.totals.total_cost - sumOfCosts);

  if (totalCostDiff > tolerance) {
    issues.push({
      check: 'Total Cost = Sum of Components',
      expected: sumOfCosts.toFixed(2),
      calculated: result.totals.total_cost.toFixed(2),
      difference: totalCostDiff.toFixed(2)
    });
  }

  // Verify: Profit Margin = (Net Profit / Revenue) * 100
  const calculatedMargin = (result.totals.net_profit / result.input.selling_price) * 100;
  const marginDiff = Math.abs(calculatedMargin - result.totals.profit_margin);

  if (marginDiff > 0.1) { // 0.1% tolerance
    issues.push({
      check: 'Profit Margin Calculation',
      expected: calculatedMargin.toFixed(2),
      calculated: result.totals.profit_margin.toFixed(2),
      difference: marginDiff.toFixed(2)
    });
  }

  // Verify: ROI = (Net Profit / Total Cost) * 100
  const calculatedROI = (result.totals.net_profit / result.totals.total_cost) * 100;
  const roiDiff = Math.abs(calculatedROI - result.totals.roi_percent);

  if (roiDiff > 0.1) { // 0.1% tolerance
    issues.push({
      check: 'ROI Calculation',
      expected: calculatedROI.toFixed(2),
      calculated: result.totals.roi_percent.toFixed(2),
      difference: roiDiff.toFixed(2)
    });
  }

  return {
    accurate: issues.length === 0,
    issues
  };
}

/**
 * Full system test
 */
export function runFullSystemTest() {
  console.log('🚀 Running Full System Test...\n');

  // Test 1: All test datasets
  const allTests = runAllTests();

  // Test 2: Consistency check
  console.log('\n🔄 Testing Consistency...');
  const consistencyTest = verifyConsistency(TEST_DATASETS[0].product, 10);
  console.log(consistencyTest.consistent ? '✅ Consistent' : '❌ Inconsistent');
  if (!consistencyTest.consistent) {
    console.log('Inconsistencies:', consistencyTest.inconsistencies);
  }

  // Test 3: Mathematical accuracy
  console.log('\n🧮 Testing Mathematical Accuracy...');
  TEST_DATASETS.forEach(testData => {
    const result = calculateProductAnalysis(testData.product);
    const accuracy = verifyMathematicalAccuracy(result);
    const status = accuracy.accurate ? '✅' : '❌';
    console.log(`${status} ${testData.name}`);
    if (!accuracy.accurate) {
      accuracy.issues.forEach(issue => {
        console.log(`  ❌ ${issue.check}: ${issue.difference} difference`);
      });
    }
  });

  return {
    testResults: allTests,
    consistency: consistencyTest,
    overallPass: allTests.failed === 0 && consistencyTest.consistent
  };
}

// Export for use in console or tests
if (typeof window !== 'undefined') {
  window.runQATests = runFullSystemTest;
}

