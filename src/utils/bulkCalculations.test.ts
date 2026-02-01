// src/utils/bulkCalculations.test.ts

import { calculateBulkProducts } from './bulkCalculations';
import { UploadRow } from '../types/upload';

describe('calculateBulkProducts', () => {
  // ============================================
  // TEST 1: HEALTHY PROFITABLE PRODUCT
  // ============================================
  
  test('calculates correct metrics for healthy profitable product', () => {
    const input: UploadRow[] = [{
      rowIndex: 2,
      asin: 'B08XYZ123',
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
    }];

    const results = calculateBulkProducts(input);
    const product = results[0];

    // Financial metrics
    // Revenue after returns: 79.99 * 0.95 = 75.99
    // Fees: 12.00 + 6.40 + 15.20 = 33.60
    // Profit: 75.99 - 25.00 - 33.60 - 2.00 = 15.39
    expect(product.profitPerUnit).toBeCloseTo(15.39, 1);
    
    // Margin: (15.39 / 79.99) * 100 = 19.2%
    expect(product.profitMargin).toBeCloseTo(19.2, 1);
    
    // Monthly profit: 15.39 * 45 = 692.55
    expect(product.totalMonthlyProfit).toBeCloseTo(692.55, 1);

    // Timing metrics
    expect(product.breakEvenDays).toBeGreaterThan(0);
    expect(product.breakEvenDays).toBeLessThan(999);
    expect(product.cashRunway).toBeGreaterThan(0);
    expect(product.turnoverDays).toBeCloseTo(60, 1); // (90/45)*30

    // Health score
    expect(product.healthScore).toBeGreaterThanOrEqual(0);
    expect(product.healthScore).toBeLessThanOrEqual(100);
    expect(product.healthScore).toBeGreaterThan(50); // Should be reasonably healthy

    // Risk levels - should be mostly green/yellow
    expect(product.profitabilityRisk).toBe('yellow'); // 19.2% margin
    expect(product.competitionRisk).toBe('green'); // 8 competitors
    
    // All calculated fields should be finite numbers
    expect(isFinite(product.profitPerUnit)).toBe(true);
    expect(isFinite(product.profitMargin)).toBe(true);
    expect(isFinite(product.healthScore)).toBe(true);
  });

  // ============================================
  // TEST 2: ZERO VELOCITY (NO SALES)
  // ============================================
  
  test('handles zero velocity without crashing', () => {
    const input: UploadRow[] = [{
      rowIndex: 2,
      asin: 'B08XYZ123',
      name: 'No Sales Product',
      price: 50.00,
      cogs: 20.00,
      velocity: 0, // ZERO VELOCITY
      returnRate: 5,
      referralFee: 15,
      fbaFee: 8,
      vat: 19,
      shippingCost: 2,
      initialOrder: 10,
      initialCash: 1000,
      competitorCount: 5,
      rating: 3.0,
      category: 'Test',
    }];

    const results = calculateBulkProducts(input);
    const product = results[0];

    // Break-even should be 999 (not Infinity)
    expect(product.breakEvenDays).toBe(999);
    
    // Turnover should be 999 (not Infinity)
    expect(product.turnoverDays).toBe(999);
    
    // Monthly profit should be zero
    expect(product.totalMonthlyProfit).toBe(0);
    
    // Health score should still be calculated (will be low)
    expect(product.healthScore).toBeGreaterThanOrEqual(0);
    expect(product.healthScore).toBeLessThanOrEqual(100);
    expect(isFinite(product.healthScore)).toBe(true);
    
    // All values should be finite (no NaN or Infinity)
    expect(isFinite(product.profitPerUnit)).toBe(true);
    expect(isFinite(product.profitMargin)).toBe(true);
    expect(isFinite(product.breakEvenDays)).toBe(true);
    expect(isFinite(product.turnoverDays)).toBe(true);
  });

  // ============================================
  // TEST 3: NEGATIVE PROFIT (UNPROFITABLE)
  // ============================================
  
  test('calculates red risks for unprofitable product', () => {
    const input: UploadRow[] = [{
      rowIndex: 2,
      asin: 'B08XYZ123',
      name: 'Loss Leader',
      price: 10.00,
      cogs: 15.00, // COGS higher than price!
      velocity: 100,
      returnRate: 5,
      referralFee: 15,
      fbaFee: 8,
      vat: 19,
      shippingCost: 2,
      initialOrder: 50,
      initialCash: 500,
      competitorCount: 20,
      rating: 2.0,
      category: 'Test',
    }];

    const results = calculateBulkProducts(input);
    const product = results[0];

    // Should have negative profit
    expect(product.profitPerUnit).toBeLessThan(0);
    
    // Margin should be negative
    expect(product.profitMargin).toBeLessThan(0);
    
    // Monthly profit should be negative
    expect(product.totalMonthlyProfit).toBeLessThan(0);
    
    // Risk levels should be red
    expect(product.profitabilityRisk).toBe('red'); // Negative margin
    expect(product.cashFlowRisk).toBe('red'); // Will burn cash
    expect(product.competitionRisk).toBe('yellow'); // 20 competitors
    
    // Health score should be very low
    expect(product.healthScore).toBeLessThan(30);
    
    // All values should still be finite
    expect(isFinite(product.profitPerUnit)).toBe(true);
    expect(isFinite(product.healthScore)).toBe(true);
  });

  // ============================================
  // TEST 4: LOW CASH SITUATION
  // ============================================
  
  test('handles low cash runway scenario correctly', () => {
    const input: UploadRow[] = [{
      rowIndex: 2,
      asin: 'B08XYZ123',
      name: 'Cash Constrained Product',
      price: 100.00,
      cogs: 60.00,
      velocity: 20,
      returnRate: 5,
      referralFee: 15,
      fbaFee: 8,
      vat: 19,
      shippingCost: 3,
      initialOrder: 100, // Large initial order
      initialCash: 2000, // But low cash
      competitorCount: 3,
      rating: 4.5,
      category: 'Test',
    }];

    const results = calculateBulkProducts(input);
    const product = results[0];

    // Cash runway should be low (0-3 months)
    expect(product.cashRunway).toBeLessThan(4);
    
    // Cash flow risk should be red or yellow
    expect(['red', 'yellow']).toContain(product.cashFlowRisk);
    
    // Health score should reflect cash constraints
    expect(product.healthScore).toBeLessThan(80);
    
    // Competition risk should be green (only 3 competitors)
    expect(product.competitionRisk).toBe('green');
  });

  // ============================================
  // TEST 5: HIGH COMPETITION
  // ============================================
  
  test('assigns red competition risk for high competitor count', () => {
    const input: UploadRow[] = [{
      rowIndex: 2,
      asin: 'B08XYZ123',
      name: 'Highly Competitive Product',
      price: 50.00,
      cogs: 20.00,
      velocity: 50,
      returnRate: 5,
      referralFee: 15,
      fbaFee: 8,
      vat: 19,
      shippingCost: 2,
      initialOrder: 100,
      initialCash: 5000,
      competitorCount: 35, // HIGH COMPETITION
      rating: 3.5,
      category: 'Test',
    }];

    const results = calculateBulkProducts(input);
    const product = results[0];

    // Competition risk should be red (>15 competitors)
    expect(product.competitionRisk).toBe('red');
    
    // Health score should be impacted by competition
    expect(product.healthScore).toBeLessThan(90);
    
    // Other metrics should still calculate correctly
    expect(product.profitPerUnit).toBeGreaterThan(0);
    expect(isFinite(product.healthScore)).toBe(true);
  });

  // ============================================
  // TEST 6: SLOW INVENTORY TURNOVER
  // ============================================
  
  test('assigns red inventory risk for slow turnover', () => {
    const input: UploadRow[] = [{
      rowIndex: 2,
      asin: 'B08XYZ123',
      name: 'Slow Moving Product',
      price: 200.00,
      cogs: 80.00,
      velocity: 5, // LOW VELOCITY
      returnRate: 5,
      referralFee: 15,
      fbaFee: 8,
      vat: 19,
      shippingCost: 5,
      initialOrder: 30, // Large order relative to velocity
      initialCash: 5000,
      competitorCount: 2,
      rating: 4.0,
      category: 'Test',
    }];

    const results = calculateBulkProducts(input);
    const product = results[0];

    // Turnover should be slow
    // (30 / 5) * 30 = 180 days
    expect(product.turnoverDays).toBeGreaterThan(45);
    
    // Inventory risk should be red (>45 days)
    expect(product.inventoryRisk).toBe('red');
    
    // Health score should be impacted by slow turnover
    expect(product.healthScore).toBeLessThan(100);
    
    // Other metrics should be fine
    expect(product.profitPerUnit).toBeGreaterThan(0);
    expect(product.competitionRisk).toBe('green'); // Low competition
  });

  // ============================================
  // TEST 7: ZERO INITIAL CASH
  // ============================================
  
  test('handles zero initial cash correctly', () => {
    const input: UploadRow[] = [{
      rowIndex: 2,
      asin: 'B08XYZ123',
      name: 'No Cash Product',
      price: 50.00,
      cogs: 20.00,
      velocity: 30,
      returnRate: 5,
      referralFee: 15,
      fbaFee: 8,
      vat: 19,
      shippingCost: 2,
      initialOrder: 50,
      initialCash: 0, // ZERO CASH
      competitorCount: 5,
      rating: 3.5,
      category: 'Test',
    }];

    const results = calculateBulkProducts(input);
    const product = results[0];

    // Cash runway should be 0 (can't afford initial inventory)
    expect(product.cashRunway).toBe(0);
    
    // Cash flow risk should be red
    expect(product.cashFlowRisk).toBe('red');
    
    // Other calculations should still work
    expect(product.profitPerUnit).toBeGreaterThan(0);
    expect(isFinite(product.healthScore)).toBe(true);
  });

  // ============================================
  // TEST 8: MULTIPLE PRODUCTS IN BATCH
  // ============================================
  
  test('processes multiple products correctly', () => {
    const input: UploadRow[] = [
      {
        rowIndex: 2,
        asin: 'B08XYZ001',
        name: 'Product 1',
        price: 50.00,
        cogs: 20.00,
        velocity: 30,
        returnRate: 5,
        referralFee: 15,
        fbaFee: 8,
        vat: 19,
        shippingCost: 2,
        initialOrder: 60,
        initialCash: 3000,
        competitorCount: 5,
        rating: 4.0,
        category: 'Category A',
      },
      {
        rowIndex: 3,
        asin: 'B08XYZ002',
        name: 'Product 2',
        price: 100.00,
        cogs: 40.00,
        velocity: 50,
        returnRate: 5,
        referralFee: 15,
        fbaFee: 8,
        vat: 19,
        shippingCost: 3,
        initialOrder: 100,
        initialCash: 5000,
        competitorCount: 10,
        rating: 4.5,
        category: 'Category B',
      },
    ];

    const results = calculateBulkProducts(input);

    // Should return 2 results
    expect(results).toHaveLength(2);

    // Each result should have all calculated fields
    results.forEach((product) => {
      expect(product).toHaveProperty('profitPerUnit');
      expect(product).toHaveProperty('profitMargin');
      expect(product).toHaveProperty('totalMonthlyProfit');
      expect(product).toHaveProperty('breakEvenDays');
      expect(product).toHaveProperty('cashRunway');
      expect(product).toHaveProperty('turnoverDays');
      expect(product).toHaveProperty('healthScore');
      expect(product).toHaveProperty('profitabilityRisk');
      expect(product).toHaveProperty('breakEvenRisk');
      expect(product).toHaveProperty('cashFlowRisk');
      expect(product).toHaveProperty('competitionRisk');
      expect(product).toHaveProperty('inventoryRisk');
      
      // All values should be finite
      expect(isFinite(product.profitPerUnit)).toBe(true);
      expect(isFinite(product.healthScore)).toBe(true);
    });

    // Products should have different calculations
    expect(results[0].profitPerUnit).not.toBe(results[1].profitPerUnit);
  });

  // ============================================
  // TEST 9: EDGE CASE - VERY HIGH PROFIT MARGIN
  // ============================================
  
  test('handles very high profit margin (>30%) correctly', () => {
    const input: UploadRow[] = [{
      rowIndex: 2,
      asin: 'B08XYZ123',
      name: 'Premium Product',
      price: 200.00,
      cogs: 30.00, // Very low COGS
      velocity: 40,
      returnRate: 5,
      referralFee: 15,
      fbaFee: 8,
      vat: 19,
      shippingCost: 3,
      initialOrder: 80,
      initialCash: 10000,
      competitorCount: 2,
      rating: 4.8,
      category: 'Premium',
    }];

    const results = calculateBulkProducts(input);
    const product = results[0];

    // Should have high profit margin
    expect(product.profitMargin).toBeGreaterThan(30);
    
    // Profitability risk should be green
    expect(product.profitabilityRisk).toBe('green');
    
    // Health score should be very high
    expect(product.healthScore).toBeGreaterThan(70);
    
    // Most risks should be green
    expect(product.competitionRisk).toBe('green');
  });

  // ============================================
  // TEST 10: EDGE CASE - EXACTLY AT THRESHOLD
  // ============================================
  
  test('handles threshold edge cases correctly', () => {
    const input: UploadRow[] = [{
      rowIndex: 2,
      asin: 'B08XYZ123',
      name: 'Threshold Test Product',
      price: 100.00,
      cogs: 79.00, // Will produce exactly 10% margin threshold
      velocity: 30,
      returnRate: 5,
      referralFee: 15,
      fbaFee: 8,
      vat: 19,
      shippingCost: 2,
      initialOrder: 60,
      initialCash: 5000,
      competitorCount: 15, // Exactly at yellow/red threshold
      rating: 4.0,
      category: 'Test',
    }];

    const results = calculateBulkProducts(input);
    const product = results[0];

    // Should handle threshold correctly
    expect(product.competitionRisk).toBe('yellow'); // 15 competitors = yellow
    
    // All values should be calculated
    expect(isFinite(product.profitPerUnit)).toBe(true);
    expect(isFinite(product.healthScore)).toBe(true);
    expect(product.healthScore).toBeGreaterThanOrEqual(0);
    expect(product.healthScore).toBeLessThanOrEqual(100);
  });
});
