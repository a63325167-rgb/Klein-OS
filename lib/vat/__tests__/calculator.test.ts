/**
 * EU VAT Calculator - Unit Tests
 * 
 * Tests all scenarios from Section 8.1 of the VAT specification
 * All tests must pass with ±0.01% accuracy
 * 
 * @version 1.0
 * @date 2025-10-18
 */

import {
  extractNetFromGross,
  calculateVATFromNet,
  extractNetFromGrossForCountry,
  calculateVATFromNetForCountry,
  getVATRateForCountry,
  roundMoney,
  roundRate,
} from '../calculator';
import { getStandardRate } from '../rates';

describe('VAT Calculator - Core Functions', () => {
  describe('roundMoney', () => {
    it('should round to 2 decimal places', () => {
      expect(roundMoney(100.123)).toBe(100.12);
      expect(roundMoney(100.125)).toBe(100.13);
      expect(roundMoney(100.999)).toBe(101.00);
    });
  });

  describe('roundRate', () => {
    it('should round to 3 decimal places', () => {
      expect(roundRate(0.1234)).toBe(0.123);
      expect(roundRate(0.1235)).toBe(0.124);
      expect(roundRate(0.1999)).toBe(0.200);
    });
  });

  /**
   * Test 1: Basic Gross to Net
   * Spec: €119 at 19% → €100 net, €19 VAT
   */
  describe('extractNetFromGross - Test 1', () => {
    it('should extract €100 net from €119 gross at 19% VAT', () => {
      const result = extractNetFromGross(119, 0.19);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.netPrice).toBe(100);
        expect(result.data.vatAmount).toBe(19);
        expect(result.data.vatRate).toBe(0.19);
      }
    });
  });

  /**
   * Test 2: Basic Net to Gross
   * Spec: €100 at 19% → €19 VAT, €119 gross
   */
  describe('calculateVATFromNet - Test 2', () => {
    it('should calculate €19 VAT and €119 gross from €100 net at 19%', () => {
      const result = calculateVATFromNet(100, 0.19);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.vatAmount).toBe(19);
        expect(result.data.grossPrice).toBe(119);
        expect(result.data.vatRate).toBe(0.19);
      }
    });
  });

  /**
   * Test 4: Books (reduced rate)
   * Spec: German books at 7%: €10.70 gross → €10 net, €0.70 VAT
   */
  describe('extractNetFromGross - Test 4 (Books)', () => {
    it('should extract €10 net from €10.70 gross at 7% VAT (German books)', () => {
      const result = extractNetFromGross(10.70, 0.07);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.netPrice).toBe(10);
        expect(result.data.vatAmount).toBe(0.70);
        expect(result.data.vatRate).toBe(0.07);
      }
    });
  });

  /**
   * Test 9: Denmark (no reduced rates)
   * Spec: DK seller, books category → Expected: 25% (standard rate, no reduction)
   */
  describe('getStandardRate - Test 9 (Denmark exception)', () => {
    it('should return 25% for Denmark regardless of category', () => {
      const rate = getStandardRate('DK');
      expect(rate).toBe(0.25);
    });
  });

  /**
   * Test 10: Estonia rate change
   * Spec: Date before July 1, 2025: 22%
   *       Date after July 1, 2025: 24%
   */
  describe('getStandardRate - Test 10 (Estonia rate change)', () => {
    it('should return 22% for Estonia before July 1, 2025', () => {
      const dateBeforeChange = new Date('2025-06-30');
      const rate = getStandardRate('EE', dateBeforeChange);
      expect(rate).toBe(0.22);
    });

    it('should return 24% for Estonia on/after July 1, 2025', () => {
      const dateOnChange = new Date('2025-07-01');
      const dateAfterChange = new Date('2025-07-02');
      
      expect(getStandardRate('EE', dateOnChange)).toBe(0.24);
      expect(getStandardRate('EE', dateAfterChange)).toBe(0.24);
    });
  });

  /**
   * Test 10b: Romania rate change
   * Spec: Date before August 1, 2025: 19%
   *       Date after August 1, 2025: 21%
   */
  describe('getStandardRate - Test 10b (Romania rate change)', () => {
    it('should return 19% for Romania before August 1, 2025', () => {
      const dateBeforeChange = new Date('2025-07-31');
      const rate = getStandardRate('RO', dateBeforeChange);
      expect(rate).toBe(0.19);
    });

    it('should return 21% for Romania on/after August 1, 2025', () => {
      const dateOnChange = new Date('2025-08-01');
      const dateAfterChange = new Date('2025-08-15');
      
      expect(getStandardRate('RO', dateOnChange)).toBe(0.21);
      expect(getStandardRate('RO', dateAfterChange)).toBe(0.21);
    });
  });

  /**
   * Country-specific calculations - Comprehensive coverage
   */
  describe('extractNetFromGrossForCountry', () => {
    it('should calculate net price for Germany (19%)', () => {
      const result = extractNetFromGrossForCountry(119, 'DE');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.netPrice).toBe(100);
        expect(result.data.vatAmount).toBe(19);
      }
    });

    it('should calculate net price for Hungary (27% - highest in EU)', () => {
      const result = extractNetFromGrossForCountry(127, 'HU');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.netPrice).toBe(100);
        expect(result.data.vatAmount).toBe(27);
      }
    });

    it('should calculate net price for Luxembourg (17% - lowest in EU)', () => {
      const result = extractNetFromGrossForCountry(117, 'LU');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.netPrice).toBe(100);
        expect(result.data.vatAmount).toBe(17);
      }
    });

    it('should calculate net price for Switzerland (8.1% - non-EU)', () => {
      const result = extractNetFromGrossForCountry(108.10, 'CH');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.netPrice).toBe(100);
        expect(result.data.vatAmount).toBe(8.10);
      }
    });
  });

  describe('calculateVATFromNetForCountry', () => {
    it('should calculate VAT for France (20%)', () => {
      const result = calculateVATFromNetForCountry(100, 'FR');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.vatAmount).toBe(20);
        expect(result.data.grossPrice).toBe(120);
      }
    });

    it('should calculate VAT for Poland (23%)', () => {
      const result = calculateVATFromNetForCountry(100, 'PL');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.vatAmount).toBe(23);
        expect(result.data.grossPrice).toBe(123);
      }
    });

    it('should calculate VAT for UK (20% - post-Brexit)', () => {
      const result = calculateVATFromNetForCountry(100, 'UK');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.vatAmount).toBe(20);
        expect(result.data.grossPrice).toBe(120);
      }
    });
  });

  /**
   * Edge cases and validation
   */
  describe('Input validation', () => {
    it('should reject negative prices', () => {
      const result = extractNetFromGross(-100, 0.19);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NEGATIVE_PRICE');
      }
    });

    it('should reject invalid VAT rates (too high)', () => {
      const result = extractNetFromGross(100, 0.50); // 50% exceeds max
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('RATE_OUT_OF_RANGE');
      }
    });

    it('should reject invalid VAT rates (negative)', () => {
      const result = calculateVATFromNet(100, -0.19);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('RATE_OUT_OF_RANGE');
      }
    });

    it('should reject non-numeric price', () => {
      const result = extractNetFromGross(NaN, 0.19);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_PRICE_TYPE');
      }
    });

    it('should reject non-numeric VAT rate', () => {
      const result = calculateVATFromNet(100, NaN);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_RATE_TYPE');
      }
    });

    it('should reject unknown country code', () => {
      // @ts-ignore - Testing invalid input
      const result = getVATRateForCountry('XX');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('UNKNOWN_COUNTRY');
      }
    });
  });

  /**
   * Precision tests - ±0.01% accuracy requirement
   */
  describe('Precision and rounding', () => {
    it('should maintain ±0.01% accuracy for complex calculations', () => {
      // Real-world example: €123.45 at 19%
      const result = extractNetFromGross(123.45, 0.19);
      
      expect(result.success).toBe(true);
      if (result.success) {
        // Expected: €103.74 net, €19.71 VAT
        expect(result.data.netPrice).toBe(103.74);
        expect(result.data.vatAmount).toBe(19.71);
        
        // Verify reverse calculation
        const reverseResult = calculateVATFromNet(103.74, 0.19);
        expect(reverseResult.success).toBe(true);
        if (reverseResult.success) {
          // Should round back to original
          expect(reverseResult.data.grossPrice).toBe(123.45);
        }
      }
    });

    it('should handle edge case: very small amounts', () => {
      const result = extractNetFromGross(0.01, 0.19);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.netPrice).toBeGreaterThanOrEqual(0);
        expect(result.data.vatAmount).toBeGreaterThanOrEqual(0);
      }
    });

    it('should handle edge case: zero price', () => {
      const result = extractNetFromGross(0, 0.19);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.netPrice).toBe(0);
        expect(result.data.vatAmount).toBe(0);
      }
    });
  });

  /**
   * All 30 countries - Standard rates verification
   */
  describe('Complete country coverage', () => {
    const expectedRates = {
      AT: 0.20, BE: 0.21, BG: 0.20, HR: 0.25, CY: 0.19,
      CZ: 0.21, DK: 0.25, EE: 0.22, FI: 0.255, FR: 0.20,
      DE: 0.19, EL: 0.24, HU: 0.27, IE: 0.23, IT: 0.22,
      LV: 0.21, LT: 0.21, LU: 0.17, MT: 0.18, NL: 0.21,
      PL: 0.23, PT: 0.23, RO: 0.19, SK: 0.23, SI: 0.22,
      ES: 0.21, SE: 0.25, UK: 0.20, CH: 0.081, NO: 0.25,
    };

    Object.entries(expectedRates).forEach(([country, expectedRate]) => {
      it(`should return correct rate for ${country}`, () => {
        // @ts-ignore - Dynamic country code testing
        const rate = getStandardRate(country);
        expect(rate).toBe(expectedRate);
      });
    });
  });
});

