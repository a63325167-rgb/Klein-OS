// src/utils/export.test.ts

import { BulkProductResult } from '../types/upload';
import {
  formatProductsForExport,
  groupByCategory,
  sortByMetric,
  filterProducts,
  getCategoryStats,
  getHealthDistribution,
  getRiskDistribution,
  formatCurrency,
  formatPercentage,
  generateFilename
} from './dataTransform';
import { generateAnalytics } from './exportAnalytics';
import { exportToCSVBlob } from './exportCSV';
import { generateHTMLReport } from './generateReport';

// Sample test data
const sampleProducts: BulkProductResult[] = [
  {
    rowIndex: 2,
    asin: 'B08XYZ1234',
    name: 'Wireless Headphones',
    price: 79.99,
    cogs: 25.00,
    velocity: 45,
    returnRate: 5,
    referralFee: 15,
    fbaFee: 8,
    vat: 19,
    shippingCost: 2,
    initialOrder: 90,
    initialCash: 5000,
    competitorCount: 8,
    rating: 4.2,
    category: 'Electronics',
    profitPerUnit: 15.39,
    profitMargin: 19.25,
    totalMonthlyProfit: 692.76,
    breakEvenDays: 99,
    cashRunway: 5,
    turnoverDays: 60,
    healthScore: 58,
    profitabilityRisk: 'yellow',
    breakEvenRisk: 'yellow',
    cashFlowRisk: 'yellow',
    competitionRisk: 'green',
    inventoryRisk: 'yellow'
  },
  {
    rowIndex: 3,
    asin: 'B08ABC5678',
    name: 'USB-C Cable',
    price: 15.99,
    cogs: 5.00,
    velocity: 120,
    returnRate: 3,
    referralFee: 15,
    fbaFee: 8,
    vat: 19,
    shippingCost: 1.50,
    initialOrder: 240,
    initialCash: 5000,
    competitorCount: 25,
    rating: 4.5,
    category: 'Electronics',
    profitPerUnit: 3.21,
    profitMargin: 20.08,
    totalMonthlyProfit: 385.20,
    breakEvenDays: 120,
    cashRunway: 4,
    turnoverDays: 60,
    healthScore: 52,
    profitabilityRisk: 'yellow',
    breakEvenRisk: 'red',
    cashFlowRisk: 'yellow',
    competitionRisk: 'red',
    inventoryRisk: 'yellow'
  },
  {
    rowIndex: 4,
    asin: 'B08DEF9012',
    name: 'Yoga Mat',
    price: 29.99,
    cogs: 12.00,
    velocity: 0,
    returnRate: 8,
    referralFee: 15,
    fbaFee: 8,
    vat: 19,
    shippingCost: 3,
    initialOrder: 1,
    initialCash: 5000,
    competitorCount: 15,
    rating: 4.0,
    category: 'Sports',
    profitPerUnit: 5.12,
    profitMargin: 17.07,
    totalMonthlyProfit: 0,
    breakEvenDays: 999,
    cashRunway: 12,
    turnoverDays: 999,
    healthScore: 28,
    profitabilityRisk: 'yellow',
    breakEvenRisk: 'red',
    cashFlowRisk: 'green',
    competitionRisk: 'yellow',
    inventoryRisk: 'red'
  }
];

describe('Data Transformation', () => {
  // ============================================
  // TEST 1: FORMAT PRODUCTS FOR EXPORT
  // ============================================
  
  test('formats products with proper string formatting', () => {
    const formatted = formatProductsForExport(sampleProducts);
    
    expect(formatted).toHaveLength(3);
    expect(formatted[0].price).toBe('€79.99');
    expect(formatted[0].profitMargin).toBe('19.25%');
    expect(formatted[0].velocity).toBe('45');
  });

  // ============================================
  // TEST 2: GROUP BY CATEGORY
  // ============================================
  
  test('groups products by category', () => {
    const grouped = groupByCategory(sampleProducts);
    
    expect(grouped.size).toBe(2);
    expect(grouped.get('Electronics')).toHaveLength(2);
    expect(grouped.get('Sports')).toHaveLength(1);
  });

  // ============================================
  // TEST 3: SORT BY METRIC
  // ============================================
  
  test('sorts products by profit descending', () => {
    const sorted = sortByMetric(sampleProducts, 'profitPerUnit', false);
    
    expect(sorted[0].profitPerUnit).toBeGreaterThanOrEqual(sorted[1].profitPerUnit);
    expect(sorted[1].profitPerUnit).toBeGreaterThanOrEqual(sorted[2].profitPerUnit);
  });

  test('sorts products by profit ascending', () => {
    const sorted = sortByMetric(sampleProducts, 'profitPerUnit', true);
    
    expect(sorted[0].profitPerUnit).toBeLessThanOrEqual(sorted[1].profitPerUnit);
    expect(sorted[1].profitPerUnit).toBeLessThanOrEqual(sorted[2].profitPerUnit);
  });

  // ============================================
  // TEST 4: FILTER PRODUCTS
  // ============================================
  
  test('filters products by minimum profit', () => {
    const filtered = filterProducts(sampleProducts, { minProfit: 10 });
    
    expect(filtered).toHaveLength(1);
    expect(filtered[0].profitPerUnit).toBeGreaterThanOrEqual(10);
  });

  test('filters products by category', () => {
    const filtered = filterProducts(sampleProducts, { categories: ['Electronics'] });
    
    expect(filtered).toHaveLength(2);
    expect(filtered.every(p => p.category === 'Electronics')).toBe(true);
  });

  test('filters products by risk level', () => {
    const filtered = filterProducts(sampleProducts, { riskLevels: ['yellow'] });
    
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every(p => p.profitabilityRisk === 'yellow')).toBe(true);
  });

  // ============================================
  // TEST 5: CATEGORY STATISTICS
  // ============================================
  
  test('calculates category statistics', () => {
    const stats = getCategoryStats(sampleProducts);
    
    expect(stats.length).toBeGreaterThan(0);
    expect(stats[0]).toHaveProperty('category');
    expect(stats[0]).toHaveProperty('count');
    expect(stats[0]).toHaveProperty('totalProfit');
    expect(stats[0]).toHaveProperty('averageMargin');
    expect(stats[0]).toHaveProperty('riskDistribution');
  });

  // ============================================
  // TEST 6: HEALTH DISTRIBUTION
  // ============================================
  
  test('calculates health score distribution', () => {
    const distribution = getHealthDistribution(sampleProducts);
    
    expect(distribution).toHaveProperty('0-20');
    expect(distribution).toHaveProperty('20-40');
    expect(distribution).toHaveProperty('40-60');
    expect(distribution).toHaveProperty('60-80');
    expect(distribution).toHaveProperty('80-100');
    
    const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
    expect(total).toBe(sampleProducts.length);
  });

  // ============================================
  // TEST 7: RISK DISTRIBUTION
  // ============================================
  
  test('calculates risk distribution', () => {
    const distribution = getRiskDistribution(sampleProducts);
    
    expect(distribution).toHaveProperty('red');
    expect(distribution).toHaveProperty('yellow');
    expect(distribution).toHaveProperty('green');
    
    const total = distribution.red + distribution.yellow + distribution.green;
    expect(total).toBe(sampleProducts.length);
  });

  // ============================================
  // TEST 8: FORMATTING UTILITIES
  // ============================================
  
  test('formats currency correctly', () => {
    expect(formatCurrency(79.99)).toBe('€79.99');
    expect(formatCurrency(0.01)).toBe('€0.01');
    expect(formatCurrency(1000)).toBe('€1000.00');
  });

  test('formats percentage correctly', () => {
    expect(formatPercentage(19.25)).toBe('19.25%');
    expect(formatPercentage(0)).toBe('0.00%');
    expect(formatPercentage(100)).toBe('100.00%');
  });

  test('generates filename with timestamp', () => {
    const filename = generateFilename('test', 'csv');
    
    expect(filename).toContain('test_');
    expect(filename).toContain('.csv');
    expect(filename.length).toBeGreaterThan(10);
  });
});

describe('Analytics Export', () => {
  // ============================================
  // TEST 9: GENERATE ANALYTICS
  // ============================================
  
  test('generates complete analytics report', () => {
    const analytics = generateAnalytics(sampleProducts);
    
    expect(analytics.summary.totalProducts).toBe(3);
    expect(analytics.summary.totalMonthlyProfit).toBeGreaterThan(0);
    expect(analytics.summary.averageProfitMargin).toBeGreaterThan(0);
    expect(analytics.summary.averageHealthScore).toBeGreaterThan(0);
  });

  test('identifies profitable and unprofitable products', () => {
    const analytics = generateAnalytics(sampleProducts);
    
    expect(analytics.profitability.profitableCount).toBeGreaterThan(0);
    expect(analytics.profitability.profitableCount + analytics.profitability.unprofitableCount).toBe(3);
  });

  test('calculates profit and margin ranges', () => {
    const analytics = generateAnalytics(sampleProducts);
    
    expect(analytics.profitability.profitRange.min).toBeLessThanOrEqual(analytics.profitability.profitRange.max);
    expect(analytics.profitability.marginRange.min).toBeLessThanOrEqual(analytics.profitability.marginRange.max);
  });

  test('generates risk distribution', () => {
    const analytics = generateAnalytics(sampleProducts);
    
    expect(analytics.riskDistribution.red + analytics.riskDistribution.yellow + analytics.riskDistribution.green).toBe(3);
  });

  test('identifies top and bottom performers', () => {
    const analytics = generateAnalytics(sampleProducts);
    
    expect(analytics.topPerformers.length).toBeGreaterThan(0);
    expect(analytics.bottomPerformers.length).toBeGreaterThan(0);
    expect(analytics.topPerformers.length).toBeLessThanOrEqual(5);
  });

  test('generates alerts for problematic products', () => {
    const analytics = generateAnalytics(sampleProducts);
    
    expect(Array.isArray(analytics.alerts)).toBe(true);
    // Should have alerts for zero velocity product
    expect(analytics.alerts.length).toBeGreaterThan(0);
  });

  // ============================================
  // TEST 10: EMPTY DATA HANDLING
  // ============================================
  
  test('handles empty product array', () => {
    const analytics = generateAnalytics([]);
    
    expect(analytics.summary.totalProducts).toBe(0);
    expect(analytics.summary.totalMonthlyProfit).toBe(0);
    expect(analytics.topPerformers).toHaveLength(0);
    expect(analytics.alerts).toContain('No products to analyze');
  });
});

describe('CSV Export', () => {
  // ============================================
  // TEST 11: CSV BLOB GENERATION
  // ============================================
  
  test('generates CSV blob with correct MIME type', () => {
    const blob = exportToCSVBlob(sampleProducts);
    
    expect(blob.type).toBe('text/csv;charset=utf-8;');
    expect(blob.size).toBeGreaterThan(0);
  });

  test('throws error for empty products', () => {
    expect(() => exportToCSVBlob([])).toThrow('No products to export');
  });

  // ============================================
  // TEST 12: CSV CONTENT VALIDATION
  // ============================================
  
  test('CSV contains all required headers', async () => {
    const blob = exportToCSVBlob(sampleProducts);
    const text = await blob.text();
    
    expect(text).toContain('ASIN');
    expect(text).toContain('Name');
    expect(text).toContain('Price');
    expect(text).toContain('Profit Per Unit');
    expect(text).toContain('Health Score');
  });

  test('CSV contains product data', async () => {
    const blob = exportToCSVBlob(sampleProducts);
    const text = await blob.text();
    
    expect(text).toContain('B08XYZ1234');
    expect(text).toContain('Wireless Headphones');
    expect(text).toContain('79.99');
  });
});

describe('HTML Report', () => {
  // ============================================
  // TEST 13: HTML GENERATION
  // ============================================
  
  test('generates valid HTML report', () => {
    const html = generateHTMLReport(sampleProducts);
    
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html');
    expect(html).toContain('</html>');
  });

  test('includes product data in HTML', () => {
    const html = generateHTMLReport(sampleProducts);
    
    expect(html).toContain('B08XYZ1234');
    expect(html).toContain('Wireless Headphones');
    expect(html).toContain('Electronics');
  });

  test('includes summary metrics in HTML', () => {
    const html = generateHTMLReport(sampleProducts);
    
    expect(html).toContain('Total Monthly Profit');
    expect(html).toContain('Average Profit Margin');
    expect(html).toContain('Health Score');
  });

  test('includes risk distribution in HTML', () => {
    const html = generateHTMLReport(sampleProducts);
    
    expect(html).toContain('Risk Distribution');
    expect(html).toContain('Low Risk');
    expect(html).toContain('Medium Risk');
    expect(html).toContain('High Risk');
  });

  test('generates empty report for no products', () => {
    const html = generateHTMLReport([]);
    
    expect(html).toContain('No Products');
    expect(html).toContain('<!DOCTYPE html>');
  });
});

describe('Edge Cases', () => {
  // ============================================
  // TEST 14: SPECIAL CHARACTERS
  // ============================================
  
  test('handles products with special characters in name', () => {
    const specialProduct: BulkProductResult = {
      ...sampleProducts[0],
      name: 'Product with "quotes" and, commas'
    };
    
    const formatted = formatProductsForExport([specialProduct]);
    expect(formatted[0].name).toBe('Product with "quotes" and, commas');
  });

  // ============================================
  // TEST 15: LARGE DATASETS
  // ============================================
  
  test('handles large product arrays (100+ products)', () => {
    const largeArray: BulkProductResult[] = [];
    for (let i = 0; i < 100; i++) {
      largeArray.push({
        ...sampleProducts[0],
        rowIndex: i + 2,
        asin: `B08XYZ${String(i).padStart(4, '0')}`
      });
    }
    
    const analytics = generateAnalytics(largeArray);
    expect(analytics.summary.totalProducts).toBe(100);
    
    const blob = exportToCSVBlob(largeArray);
    expect(blob.size).toBeGreaterThan(1000);
  });

  // ============================================
  // TEST 16: NULL/UNDEFINED HANDLING
  // ============================================
  
  test('handles products with edge case values', () => {
    const edgeProduct: BulkProductResult = {
      ...sampleProducts[0],
      velocity: 0,
      profitPerUnit: -5,
      healthScore: 0
    };
    
    const analytics = generateAnalytics([edgeProduct]);
    expect(analytics.summary.totalProducts).toBe(1);
    expect(analytics.alerts.length).toBeGreaterThan(0);
  });
});

describe('Performance', () => {
  // ============================================
  // TEST 17: EXPORT PERFORMANCE
  // ============================================
  
  test('exports complete within reasonable time', () => {
    const startTime = Date.now();
    
    const analytics = generateAnalytics(sampleProducts);
    const blob = exportToCSVBlob(sampleProducts);
    const html = generateHTMLReport(sampleProducts);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Should complete in less than 1 second
    expect(duration).toBeLessThan(1000);
  });
});
