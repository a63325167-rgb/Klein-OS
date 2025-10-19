/**
 * Unit Tests for Packaging Optimization Recommendation
 * 
 * Tests the business logic for generating packaging optimization recommendations
 * based on Small Package eligibility criteria.
 */

const { packagingOptimization, SHIPPING_RATES, THRESHOLDS } = require('../packagingOptimization');

describe('Packaging Optimization Recommendation', () => {
  
  // Test Case 1: Product that exceeds height threshold only
  test('should recommend optimization when height exceeds threshold', () => {
    const mockResult = {
      input: {
        selling_price: 18.99,
        buying_price: 7.60,
        height_cm: 9.5, // Exceeds 8cm threshold
        width_cm: 15,
        length_cm: 20,
        weight_kg: 0.5, // Within 1kg threshold
        annual_volume: 300
      },
      totals: {
        total_cost: 12.00,
        net_profit: 6.99,
        profit_margin: 36.8,
        roi_percent: 58.3
      },
      smallPackageCheck: {
        isEligible: false,
        failures: ['Height exceeds 8cm (current: 9.5cm)']
      }
    };
    
    const recommendation = packagingOptimization(mockResult);
    
    expect(recommendation).not.toBeNull();
    expect(recommendation.id).toBe('packaging-optimization');
    expect(recommendation.title).toBe('Packaging Redesign Opportunity');
    expect(recommendation.impact.annual_savings).toBe(513); // €1.71 × 300 units
    expect(recommendation.impact.savings_per_unit).toBe(1.71);
    expect(recommendation.priority).toBe('medium'); // < €1000 annual savings
    expect(recommendation.actionable).toContain('Consult with supplier');
  });
  
  // Test Case 2: Product that exceeds weight threshold only
  test('should recommend optimization when weight exceeds threshold', () => {
    const mockResult = {
      input: {
        selling_price: 69.99,
        buying_price: 26.75,
        height_cm: 7, // Within 8cm threshold
        width_cm: 18,
        length_cm: 12,
        weight_kg: 1.2, // Exceeds 1kg threshold
        annual_volume: 1100
      },
      totals: {
        total_cost: 42.50,
        net_profit: 27.49,
        profit_margin: 39.3,
        roi_percent: 64.7
      },
      smallPackageCheck: {
        isEligible: false,
        failures: ['Weight exceeds 1kg (current: 1.2kg)']
      }
    };
    
    const recommendation = packagingOptimization(mockResult);
    
    expect(recommendation).not.toBeNull();
    expect(recommendation.impact.annual_savings).toBe(1881); // €1.71 × 1100 units
    expect(recommendation.priority).toBe('high'); // ≥ €1000 annual savings
    expect(recommendation.description).toContain('1.2kg → 1kg');
  });
  
  // Test Case 3: Product that exceeds both height and weight
  test('should recommend optimization when both height and weight exceed thresholds', () => {
    const mockResult = {
      input: {
        selling_price: 29.99,
        buying_price: 12.50,
        height_cm: 9.5, // Exceeds 8cm threshold but within feasibility range
        width_cm: 20,
        length_cm: 15,
        weight_kg: 1.15, // Exceeds 1kg threshold
        annual_volume: 500
      },
      totals: {
        total_cost: 18.00,
        net_profit: 11.99,
        profit_margin: 40.0,
        roi_percent: 66.6
      },
      smallPackageCheck: {
        isEligible: false,
        failures: [
          'Height exceeds 8cm (current: 9.5cm)',
          'Weight exceeds 1kg (current: 1.15kg)'
        ]
      }
    };
    
    const recommendation = packagingOptimization(mockResult);
    
    expect(recommendation).not.toBeNull();
    expect(recommendation.impact.annual_savings).toBe(855); // €1.71 × 500 units
    expect(recommendation.impact.issues).toHaveLength(2);
    expect(recommendation.description).toContain('9.5cm → 8cm');
    expect(recommendation.description).toContain('1.15kg → 1kg');
  });
  
  // Test Case 4: Product already eligible for Small Package
  test('should NOT recommend optimization when already eligible', () => {
    const mockResult = {
      input: {
        selling_price: 18.99,
        buying_price: 7.60,
        height_cm: 7, // Within threshold
        width_cm: 15,
        length_cm: 20,
        weight_kg: 0.8, // Within threshold
        annual_volume: 300
      },
      totals: {
        total_cost: 10.29,
        net_profit: 8.70,
        profit_margin: 45.8,
        roi_percent: 84.5
      },
      smallPackageCheck: {
        isEligible: true,
        failures: [],
        savings: 1.71
      }
    };
    
    const recommendation = packagingOptimization(mockResult);
    
    expect(recommendation).toBeNull(); // No recommendation when already eligible
  });
  
  // Test Case 5: Product way too large (not feasible to optimize)
  test('should NOT recommend optimization when not feasible', () => {
    const mockResult = {
      input: {
        selling_price: 89.99,
        buying_price: 45.00,
        height_cm: 25, // Way too tall (>20% threshold)
        width_cm: 30,
        length_cm: 40,
        weight_kg: 3.5, // Way too heavy (>30% threshold)
        annual_volume: 200
      },
      totals: {
        total_cost: 65.00,
        net_profit: 24.99,
        profit_margin: 27.8,
        roi_percent: 38.4
      },
      smallPackageCheck: {
        isEligible: false,
        failures: [
          'Height exceeds 8cm (current: 25cm)',
          'Weight exceeds 1kg (current: 3.5kg)'
        ]
      }
    };
    
    const recommendation = packagingOptimization(mockResult);
    
    expect(recommendation).toBeNull(); // Not feasible, don't recommend
  });
  
  // Test Case 6: Edge case - just at the feasibility boundary
  test('should recommend when at feasibility boundary (height 9.6cm, weight 1.3kg)', () => {
    const mockResult = {
      input: {
        selling_price: 22.50,
        buying_price: 8.20,
        height_cm: 9.6, // Exactly at 20% boundary (8 × 1.2 = 9.6)
        width_cm: 18,
        length_cm: 12,
        weight_kg: 1.3, // Exactly at 30% boundary (1 × 1.3 = 1.3)
        annual_volume: 90
      },
      totals: {
        total_cost: 14.50,
        net_profit: 8.00,
        profit_margin: 35.6,
        roi_percent: 55.2
      },
      smallPackageCheck: {
        isEligible: false,
        failures: [
          'Height exceeds 8cm (current: 9.6cm)',
          'Weight exceeds 1kg (current: 1.3kg)'
        ]
      }
    };
    
    const recommendation = packagingOptimization(mockResult);
    
    expect(recommendation).not.toBeNull();
    expect(recommendation.impact.annual_savings).toBe(154); // €1.71 × 90 units
    expect(recommendation.priority).toBe('medium');
  });
  
  // Test Case 7: Verify calculation formula accuracy
  test('should calculate savings and ROI increase accurately', () => {
    const mockResult = {
      input: {
        selling_price: 50.00,
        buying_price: 20.00,
        height_cm: 9,
        width_cm: 15,
        length_cm: 20,
        weight_kg: 0.9,
        annual_volume: 1000
      },
      totals: {
        total_cost: 30.00,
        net_profit: 20.00,
        profit_margin: 40.0,
        roi_percent: 66.7
      },
      smallPackageCheck: {
        isEligible: false,
        failures: ['Height exceeds 8cm (current: 9cm)']
      }
    };
    
    const recommendation = packagingOptimization(mockResult);
    
    expect(recommendation).not.toBeNull();
    
    // Verify calculation: €1.71 × 1000 = €1710
    expect(recommendation.impact.annual_savings).toBe(1710);
    
    // Verify ROI increase: (€1.71 / €30.00) × 100 = 5.7%
    expect(recommendation.impact.roi_increase_percent).toBe(5.7);
    
    // Verify calculation string
    expect(recommendation.impact.calculation).toBe('€1.71/unit × 1.000 units = €1.710/year');
  });
  
  // Test Case 8: Low volume product
  test('should still recommend for low volume products if feasible', () => {
    const mockResult = {
      input: {
        selling_price: 15.00,
        buying_price: 6.00,
        height_cm: 8.5,
        width_cm: 10,
        length_cm: 15,
        weight_kg: 0.7,
        annual_volume: 50 // Very low volume
      },
      totals: {
        total_cost: 10.00,
        net_profit: 5.00,
        profit_margin: 33.3,
        roi_percent: 50.0
      },
      smallPackageCheck: {
        isEligible: false,
        failures: ['Height exceeds 8cm (current: 8.5cm)']
      }
    };
    
    const recommendation = packagingOptimization(mockResult);
    
    expect(recommendation).not.toBeNull();
    expect(recommendation.impact.annual_savings).toBe(86); // €1.71 × 50 units
    expect(recommendation.priority).toBe('medium'); // Low savings but still medium priority
  });
  
  // Test Case 9: Missing annual_volume (should default to 500)
  test('should use default volume when annual_volume is missing', () => {
    const mockResult = {
      input: {
        selling_price: 25.00,
        buying_price: 10.00,
        height_cm: 9,
        width_cm: 12,
        length_cm: 18,
        weight_kg: 0.8
        // annual_volume is missing
      },
      totals: {
        total_cost: 16.00,
        net_profit: 9.00,
        profit_margin: 36.0,
        roi_percent: 56.3
      },
      smallPackageCheck: {
        isEligible: false,
        failures: ['Height exceeds 8cm (current: 9cm)']
      }
    };
    
    const recommendation = packagingOptimization(mockResult);
    
    expect(recommendation).not.toBeNull();
    expect(recommendation.impact.annual_savings).toBe(855); // €1.71 × 500 (default)
  });
  
  // Test constants
  test('shipping rate constants should be correct', () => {
    expect(SHIPPING_RATES.SMALL_PACKAGE).toBe(3.79);
    expect(SHIPPING_RATES.STANDARD_PACKAGE).toBe(5.50);
    expect(SHIPPING_RATES.SAVINGS_PER_UNIT).toBe(1.71);
  });
  
  test('threshold constants should be correct', () => {
    expect(THRESHOLDS.MAX_HEIGHT_CM).toBe(8);
    expect(THRESHOLDS.MAX_WEIGHT_KG).toBe(1.0);
  });
});

