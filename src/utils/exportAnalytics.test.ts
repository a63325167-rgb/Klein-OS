// src/utils/exportAnalytics.test.ts

import { generateAnalytics, AnalyticsReport } from './exportAnalytics';
import { BulkProductResult } from '../types/upload';

// Sample test data factory
const createProduct = (overrides: Partial<BulkProductResult> = {}): BulkProductResult => ({
  rowIndex: 1,
  asin: 'B08TEST123',
  name: 'Test Product',
  price: 50,
  cogs: 20,
  velocity: 30,
  returnRate: 5,
  referralFee: 15,
  fbaFee: 8,
  vat: 19,
  shippingCost: 2,
  initialOrder: 60,
  initialCash: 5000,
  competitorCount: 10,
  rating: 4.0,
  category: 'Electronics',
  profitPerUnit: 10,
  profitMargin: 20,
  totalMonthlyProfit: 300,
  breakEvenDays: 50,
  cashRunway: 6,
  turnoverDays: 60,
  healthScore: 65,
  profitabilityRisk: 'green',
  breakEvenRisk: 'green',
  cashFlowRisk: 'green',
  competitionRisk: 'yellow',
  inventoryRisk: 'green',
  ...overrides
});

describe('exportAnalytics', () => {
  // ============================================
  // TEST 1: Empty array returns zeros and empty arrays
  // ============================================
  test('returns empty analytics for empty product array', () => {
    const result = generateAnalytics([]);
    
    expect(result.summary.totalProducts).toBe(0);
    expect(result.summary.totalMonthlyProfit).toBe(0);
    expect(result.summary.averageProfitMargin).toBe(0);
    expect(result.summary.averageHealthScore).toBe(0);
    
    expect(result.profitability.profitableCount).toBe(0);
    expect(result.profitability.unprofitableCount).toBe(0);
    
    expect(result.riskDistribution.red).toBe(0);
    expect(result.riskDistribution.yellow).toBe(0);
    expect(result.riskDistribution.green).toBe(0);
    expect(Object.keys(result.riskDistribution.byCategory).length).toBe(0);
    
    expect(result.topPerformers.length).toBe(0);
    expect(result.bottomPerformers.length).toBe(0);
    
    expect(result.alerts).toContain('No products to analyze');
  });

  // ============================================
  // TEST 2: Single product calculation
  // ============================================
  test('calculates analytics correctly for single product', () => {
    const product = createProduct({
      profitPerUnit: 15,
      profitMargin: 25,
      totalMonthlyProfit: 450,
      healthScore: 70
    });
    
    const result = generateAnalytics([product]);
    
    expect(result.summary.totalProducts).toBe(1);
    expect(result.summary.totalMonthlyProfit).toBe(450);
    expect(result.summary.averageProfitMargin).toBe(25);
    expect(result.summary.averageHealthScore).toBe(70);
    
    expect(result.profitability.profitableCount).toBe(1);
    expect(result.profitability.unprofitableCount).toBe(0);
    expect(result.profitability.profitRange.min).toBe(15);
    expect(result.profitability.profitRange.max).toBe(15);
    
    expect(result.topPerformers.length).toBe(1);
    expect(result.bottomPerformers.length).toBe(1);
  });

  // ============================================
  // TEST 3: Multiple products - summary is accurate
  // ============================================
  test('calculates accurate summary for multiple products', () => {
    const products = [
      createProduct({ profitPerUnit: 10, profitMargin: 20, totalMonthlyProfit: 300, healthScore: 60 }),
      createProduct({ profitPerUnit: 15, profitMargin: 30, totalMonthlyProfit: 450, healthScore: 75 }),
      createProduct({ profitPerUnit: 5, profitMargin: 10, totalMonthlyProfit: 150, healthScore: 45 })
    ];
    
    const result = generateAnalytics(products);
    
    expect(result.summary.totalProducts).toBe(3);
    expect(result.summary.totalMonthlyProfit).toBe(900); // 300 + 450 + 150
    expect(result.summary.averageProfitMargin).toBe(20); // (20 + 30 + 10) / 3
    expect(result.summary.averageHealthScore).toBe(60); // (60 + 75 + 45) / 3
    
    expect(result.profitability.profitableCount).toBe(3);
    expect(result.profitability.unprofitableCount).toBe(0);
    expect(result.profitability.profitRange.min).toBe(5);
    expect(result.profitability.profitRange.max).toBe(15);
    expect(result.profitability.marginRange.min).toBe(10);
    expect(result.profitability.marginRange.max).toBe(30);
  });

  // ============================================
  // TEST 4: Risk distribution by category is correct
  // ============================================
  test('counts risk distribution correctly across all 5 dimensions', () => {
    const products = [
      createProduct({
        category: 'Electronics',
        profitabilityRisk: 'red',
        breakEvenRisk: 'yellow',
        cashFlowRisk: 'green',
        competitionRisk: 'green',
        inventoryRisk: 'green'
      }),
      createProduct({
        category: 'Electronics',
        profitabilityRisk: 'green',
        breakEvenRisk: 'green',
        cashFlowRisk: 'green',
        competitionRisk: 'yellow',
        inventoryRisk: 'green'
      }),
      createProduct({
        category: 'Home',
        profitabilityRisk: 'red',
        breakEvenRisk: 'red',
        cashFlowRisk: 'yellow',
        competitionRisk: 'green',
        inventoryRisk: 'green'
      })
    ];
    
    const result = generateAnalytics(products);
    
    // Total: 3 red, 3 yellow, 9 green (15 total = 3 products × 5 dimensions)
    expect(result.riskDistribution.red).toBe(3);
    expect(result.riskDistribution.yellow).toBe(3);
    expect(result.riskDistribution.green).toBe(9);
    
    // Electronics: 1 red, 2 yellow, 7 green (10 total = 2 products × 5 dimensions)
    expect(result.riskDistribution.byCategory['Electronics'].red).toBe(1);
    expect(result.riskDistribution.byCategory['Electronics'].yellow).toBe(2);
    expect(result.riskDistribution.byCategory['Electronics'].green).toBe(7);
    
    // Home: 2 red, 1 yellow, 2 green (5 total = 1 product × 5 dimensions)
    expect(result.riskDistribution.byCategory['Home'].red).toBe(2);
    expect(result.riskDistribution.byCategory['Home'].yellow).toBe(1);
    expect(result.riskDistribution.byCategory['Home'].green).toBe(2);
  });

  // ============================================
  // TEST 5: Top/bottom performers sorted correctly
  // ============================================
  test('sorts top and bottom performers correctly', () => {
    const products = [
      createProduct({ name: 'Product A', profitPerUnit: 5 }),
      createProduct({ name: 'Product B', profitPerUnit: 20 }),
      createProduct({ name: 'Product C', profitPerUnit: 15 }),
      createProduct({ name: 'Product D', profitPerUnit: 2 }),
      createProduct({ name: 'Product E', profitPerUnit: 25 }),
      createProduct({ name: 'Product F', profitPerUnit: 10 })
    ];
    
    const result = generateAnalytics(products);
    
    // Top performers (descending by profit)
    expect(result.topPerformers.length).toBe(6);
    expect(result.topPerformers[0].name).toBe('Product E'); // 25
    expect(result.topPerformers[1].name).toBe('Product B'); // 20
    expect(result.topPerformers[2].name).toBe('Product C'); // 15
    
    // Bottom performers (ascending by profit)
    expect(result.bottomPerformers.length).toBe(6);
    expect(result.bottomPerformers[0].name).toBe('Product D'); // 2
    expect(result.bottomPerformers[1].name).toBe('Product A'); // 5
    expect(result.bottomPerformers[2].name).toBe('Product F'); // 10
  });

  test('limits top/bottom performers to 10 products', () => {
    const products = Array.from({ length: 25 }, (_, i) => 
      createProduct({ name: `Product ${i}`, profitPerUnit: i })
    );
    
    const result = generateAnalytics(products);
    
    expect(result.topPerformers.length).toBe(10);
    expect(result.bottomPerformers.length).toBe(10);
    
    // Top should be highest profits
    expect(result.topPerformers[0].profitPerUnit).toBe(24);
    expect(result.topPerformers[9].profitPerUnit).toBe(15);
    
    // Bottom should be lowest profits
    expect(result.bottomPerformers[0].profitPerUnit).toBe(0);
    expect(result.bottomPerformers[9].profitPerUnit).toBe(9);
  });

  // ============================================
  // TEST 6: Alert generation for various scenarios
  // ============================================
  test('generates alert for individual RED risk products', () => {
    const products = [
      createProduct({
        name: 'Risky Product',
        profitabilityRisk: 'red',
        breakEvenRisk: 'red',
        cashFlowRisk: 'green',
        competitionRisk: 'green',
        inventoryRisk: 'green'
      })
    ];
    
    const result = generateAnalytics(products);
    
    const riskAlert = result.alerts.find(a => a.includes('Risky Product'));
    expect(riskAlert).toBeDefined();
    expect(riskAlert).toContain('profitability');
    expect(riskAlert).toContain('break-even');
  });

  test('generates alert when >30% of portfolio is unprofitable', () => {
    const products = [
      createProduct({ profitPerUnit: -5 }),
      createProduct({ profitPerUnit: -3 }),
      createProduct({ profitPerUnit: 10 })
    ];
    
    const result = generateAnalytics(products);
    
    // 2 out of 3 = 66.67% unprofitable
    const unprofitableAlert = result.alerts.find(a => a.includes('unprofitable'));
    expect(unprofitableAlert).toBeDefined();
    expect(unprofitableAlert).toContain('67%');
  });

  test('generates alert when average health score < 50', () => {
    const products = [
      createProduct({ healthScore: 30 }),
      createProduct({ healthScore: 40 }),
      createProduct({ healthScore: 50 })
    ];
    
    const result = generateAnalytics(products);
    
    // Average = 40
    const healthAlert = result.alerts.find(a => a.includes('average health'));
    expect(healthAlert).toBeDefined();
    expect(healthAlert).toContain('40');
  });

  test('generates alert when >50% of products have RED in a dimension', () => {
    const products = [
      createProduct({ profitabilityRisk: 'red', breakEvenRisk: 'green', cashFlowRisk: 'green', competitionRisk: 'green', inventoryRisk: 'green' }),
      createProduct({ profitabilityRisk: 'red', breakEvenRisk: 'green', cashFlowRisk: 'green', competitionRisk: 'green', inventoryRisk: 'green' }),
      createProduct({ profitabilityRisk: 'green', breakEvenRisk: 'green', cashFlowRisk: 'green', competitionRisk: 'green', inventoryRisk: 'green' })
    ];
    
    const result = generateAnalytics(products);
    
    // 2 out of 3 = 66.67% have RED profitability risk
    const concentrationAlert = result.alerts.find(a => a.includes('concentration in profitability'));
    expect(concentrationAlert).toBeDefined();
    expect(concentrationAlert).toContain('67%');
  });

  // ============================================
  // TEST 7: Handles NaN/undefined gracefully
  // ============================================
  test('handles NaN and undefined values in calculations', () => {
    const products = [
      createProduct({ profitMargin: NaN, healthScore: undefined as any }),
      createProduct({ profitMargin: 20, healthScore: 60 }),
      createProduct({ profitMargin: 30, healthScore: 70 })
    ];
    
    const result = generateAnalytics(products);
    
    // Should ignore NaN/undefined and calculate average from valid values only
    expect(result.summary.averageProfitMargin).toBe(25); // (20 + 30) / 2
    expect(result.summary.averageHealthScore).toBe(65); // (60 + 70) / 2
  });

  test('handles null values in totalMonthlyProfit', () => {
    const products = [
      createProduct({ totalMonthlyProfit: null as any }),
      createProduct({ totalMonthlyProfit: 100 }),
      createProduct({ totalMonthlyProfit: 200 })
    ];
    
    const result = generateAnalytics(products);
    
    // Should treat null as 0
    expect(result.summary.totalMonthlyProfit).toBe(300); // 0 + 100 + 200
  });

  test('handles products with no category', () => {
    const products = [
      createProduct({ category: undefined as any }),
      createProduct({ category: '' }),
      createProduct({ category: 'Electronics' })
    ];
    
    const result = generateAnalytics(products);
    
    // Should group undefined/empty as 'Uncategorized'
    expect(result.riskDistribution.byCategory['Uncategorized']).toBeDefined();
    expect(result.riskDistribution.byCategory['Electronics']).toBeDefined();
  });

  // ============================================
  // TEST 8: Large dataset (100+ products) performs in <500ms
  // ============================================
  test('processes large dataset efficiently', () => {
    const products = Array.from({ length: 150 }, (_, i) => 
      createProduct({
        name: `Product ${i}`,
        profitPerUnit: Math.random() * 50,
        profitMargin: Math.random() * 40,
        totalMonthlyProfit: Math.random() * 1000,
        healthScore: Math.floor(Math.random() * 100),
        category: ['Electronics', 'Home', 'Sports', 'Books'][i % 4],
        profitabilityRisk: ['red', 'yellow', 'green'][i % 3] as any,
        breakEvenRisk: ['red', 'yellow', 'green'][(i + 1) % 3] as any,
        cashFlowRisk: ['red', 'yellow', 'green'][(i + 2) % 3] as any,
        competitionRisk: ['red', 'yellow', 'green'][i % 3] as any,
        inventoryRisk: ['red', 'yellow', 'green'][(i + 1) % 3] as any
      })
    );
    
    const startTime = performance.now();
    const result = generateAnalytics(products);
    const endTime = performance.now();
    
    const executionTime = endTime - startTime;
    
    // Should complete in less than 500ms
    expect(executionTime).toBeLessThan(500);
    
    // Verify results are correct
    expect(result.summary.totalProducts).toBe(150);
    expect(result.topPerformers.length).toBe(10);
    expect(result.bottomPerformers.length).toBe(10);
    
    // Should have 4 categories
    expect(Object.keys(result.riskDistribution.byCategory).length).toBe(4);
    
    // Total risk count should be 150 products × 5 dimensions = 750
    const totalRisks = result.riskDistribution.red + result.riskDistribution.yellow + result.riskDistribution.green;
    expect(totalRisks).toBe(750);
  });

  // ============================================
  // Additional Edge Cases
  // ============================================
  test('handles all unprofitable products', () => {
    const products = [
      createProduct({ profitPerUnit: -5 }),
      createProduct({ profitPerUnit: -10 }),
      createProduct({ profitPerUnit: -2 })
    ];
    
    const result = generateAnalytics(products);
    
    expect(result.profitability.profitableCount).toBe(0);
    expect(result.profitability.unprofitableCount).toBe(3);
    expect(result.profitability.profitRange.min).toBe(-10);
    expect(result.profitability.profitRange.max).toBe(-2);
  });

  test('handles timing metrics with extreme values', () => {
    const products = [
      createProduct({ breakEvenDays: 999, turnoverDays: 999 }), // Invalid/extreme
      createProduct({ breakEvenDays: 30, turnoverDays: 45 }),
      createProduct({ breakEvenDays: 60, turnoverDays: 90 })
    ];
    
    const result = generateAnalytics(products);
    
    // Should exclude 999 values from average
    expect(result.timing.averageBreakEvenDays).toBe(45); // (30 + 60) / 2
    expect(result.timing.averageTurnoverDays).toBe(67.5); // (45 + 90) / 2
  });

  test('calculates correct risk distribution for mixed categories', () => {
    const products = [
      createProduct({
        category: 'A',
        profitabilityRisk: 'red',
        breakEvenRisk: 'red',
        cashFlowRisk: 'red',
        competitionRisk: 'red',
        inventoryRisk: 'red'
      }),
      createProduct({
        category: 'B',
        profitabilityRisk: 'green',
        breakEvenRisk: 'green',
        cashFlowRisk: 'green',
        competitionRisk: 'green',
        inventoryRisk: 'green'
      })
    ];
    
    const result = generateAnalytics(products);
    
    // Overall: 5 red, 0 yellow, 5 green
    expect(result.riskDistribution.red).toBe(5);
    expect(result.riskDistribution.yellow).toBe(0);
    expect(result.riskDistribution.green).toBe(5);
    
    // Category A: all red
    expect(result.riskDistribution.byCategory['A'].red).toBe(5);
    expect(result.riskDistribution.byCategory['A'].yellow).toBe(0);
    expect(result.riskDistribution.byCategory['A'].green).toBe(0);
    
    // Category B: all green
    expect(result.riskDistribution.byCategory['B'].red).toBe(0);
    expect(result.riskDistribution.byCategory['B'].yellow).toBe(0);
    expect(result.riskDistribution.byCategory['B'].green).toBe(5);
  });
});
