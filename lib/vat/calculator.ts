/**
 * EU VAT Calculator - Core Calculation Functions
 * 
 * Phase 1: Basic VAT calculations (gross/net conversions)
 * Formula accuracy requirement: ±0.01% of real-world values
 * 
 * @version 1.0
 * @date 2025-10-18
 */

import {
  NetFromGrossResult,
  VATFromNetResult,
  VATValidationError,
  CountryCode,
} from './types';
import { VAT_RATE_MIN, VAT_RATE_MAX } from './constants';
import { getStandardRate } from './rates';

/**
 * VAT-specific rounding utilities following European accounting standards
 */

/**
 * Round monetary amount to 2 decimal places
 * European standard for EUR amounts
 * 
 * @param amount - Amount to round
 * @returns Rounded amount
 */
export function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/**
 * Round VAT rate to 3 decimal places for display
 * 
 * @param rate - VAT rate as decimal
 * @returns Rounded rate
 */
export function roundRate(rate: number): number {
  return Math.round(rate * 1000) / 1000;
}

/**
 * Validate VAT calculation inputs
 * Returns error object if validation fails, null if valid
 * 
 * @param price - Price to validate
 * @param vatRate - VAT rate to validate
 * @returns Validation error or null
 */
function validateInputs(
  price: number,
  vatRate: number
): VATValidationError | null {
  if (typeof price !== 'number' || isNaN(price)) {
    return {
      code: 'INVALID_PRICE_TYPE',
      message: 'Price must be a valid number',
      field: 'price',
    };
  }

  if (price < 0) {
    return {
      code: 'NEGATIVE_PRICE',
      message: 'Price cannot be negative',
      field: 'price',
    };
  }

  if (typeof vatRate !== 'number' || isNaN(vatRate)) {
    return {
      code: 'INVALID_RATE_TYPE',
      message: 'VAT rate must be a valid number',
      field: 'vatRate',
    };
  }

  if (vatRate < VAT_RATE_MIN || vatRate > VAT_RATE_MAX) {
    return {
      code: 'RATE_OUT_OF_RANGE',
      message: `VAT rate must be between ${VAT_RATE_MIN * 100}% and ${VAT_RATE_MAX * 100}%`,
      field: 'vatRate',
    };
  }

  return null;
}

/**
 * Extract net price from gross price (VAT-inclusive price)
 * 
 * Formula: Net = Gross ÷ (1 + VAT Rate)
 * VAT Amount = Gross - Net
 * 
 * This is the most common operation for EU sellers who display
 * prices including VAT to customers.
 * 
 * @param grossPrice - Price including VAT (what customer pays)
 * @param vatRate - VAT rate as decimal (0.19 = 19%)
 * @returns Result object with netPrice and vatAmount, or error
 * 
 * @example
 * // German standard rate: 19%
 * extractNetFromGross(119, 0.19)
 * // Returns: { success: true, data: { netPrice: 100, vatAmount: 19, vatRate: 0.19 } }
 * 
 * @example
 * // French books: 5.5% reduced rate
 * extractNetFromGross(10.55, 0.055)
 * // Returns: { success: true, data: { netPrice: 10, vatAmount: 0.55, vatRate: 0.055 } }
 */
export function extractNetFromGross(
  grossPrice: number,
  vatRate: number
): { success: true; data: NetFromGrossResult } | { success: false; error: VATValidationError } {
  // Validate inputs
  const validationError = validateInputs(grossPrice, vatRate);
  if (validationError) {
    return { success: false, error: validationError };
  }

  // Calculate net price: Net = Gross ÷ (1 + VAT Rate)
  const netPrice = roundMoney(grossPrice / (1 + vatRate));
  
  // Calculate VAT amount: VAT = Gross - Net
  const vatAmount = roundMoney(grossPrice - netPrice);

  return {
    success: true,
    data: {
      netPrice,
      vatAmount,
      vatRate: roundRate(vatRate),
    },
  };
}

/**
 * Calculate VAT from net price (VAT-exclusive price)
 * 
 * Formula: VAT Amount = Net Price × VAT Rate
 * Gross Price = Net Price + VAT Amount
 * 
 * Used when seller knows their base price and needs to add VAT.
 * 
 * @param netPrice - Price excluding VAT (seller's base price)
 * @param vatRate - VAT rate as decimal (0.19 = 19%)
 * @returns Result object with vatAmount and grossPrice, or error
 * 
 * @example
 * // German standard rate: 19%
 * calculateVATFromNet(100, 0.19)
 * // Returns: { success: true, data: { vatAmount: 19, grossPrice: 119, vatRate: 0.19 } }
 * 
 * @example
 * // Luxembourg standard rate: 17% (lowest in EU)
 * calculateVATFromNet(100, 0.17)
 * // Returns: { success: true, data: { vatAmount: 17, grossPrice: 117, vatRate: 0.17 } }
 */
export function calculateVATFromNet(
  netPrice: number,
  vatRate: number
): { success: true; data: VATFromNetResult } | { success: false; error: VATValidationError } {
  // Validate inputs
  const validationError = validateInputs(netPrice, vatRate);
  if (validationError) {
    return { success: false, error: validationError };
  }

  // Calculate VAT amount: VAT = Net × VAT Rate
  const vatAmount = roundMoney(netPrice * vatRate);
  
  // Calculate gross price: Gross = Net + VAT
  const grossPrice = roundMoney(netPrice + vatAmount);

  return {
    success: true,
    data: {
      vatAmount,
      grossPrice,
      vatRate: roundRate(vatRate),
    },
  };
}

/**
 * Get standard VAT rate for a country (convenience wrapper)
 * 
 * @param country - ISO 3166-1 alpha-2 country code
 * @param calculationDate - Date for calculation (defaults to today)
 * @returns VAT rate as decimal or error
 * 
 * @example
 * // Germany standard rate
 * getVATRateForCountry('DE')
 * // Returns: { success: true, data: 0.19 }
 * 
 * @example
 * // Estonia after rate change (July 1, 2025)
 * getVATRateForCountry('EE', new Date('2025-07-02'))
 * // Returns: { success: true, data: 0.24 }
 */
export function getVATRateForCountry(
  country: CountryCode,
  calculationDate?: Date
): { success: true; data: number } | { success: false; error: VATValidationError } {
  try {
    const rate = getStandardRate(country, calculationDate);
    return { success: true, data: rate };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'UNKNOWN_COUNTRY',
        message: error instanceof Error ? error.message : 'Unknown country code',
        field: 'country',
      },
    };
  }
}

/**
 * Calculate net price from gross for a specific country
 * Combines country lookup and extraction in one call
 * 
 * @param grossPrice - Price including VAT
 * @param country - ISO 3166-1 alpha-2 country code
 * @param calculationDate - Date for calculation (defaults to today)
 * @returns Result with net price and VAT amount, or error
 * 
 * @example
 * // German product at €119 gross
 * extractNetFromGrossForCountry(119, 'DE')
 * // Returns: { success: true, data: { netPrice: 100, vatAmount: 19, vatRate: 0.19 } }
 */
export function extractNetFromGrossForCountry(
  grossPrice: number,
  country: CountryCode,
  calculationDate?: Date
): { success: true; data: NetFromGrossResult } | { success: false; error: VATValidationError } {
  const rateResult = getVATRateForCountry(country, calculationDate);
  
  if (!rateResult.success) {
    return { success: false, error: rateResult.error };
  }

  return extractNetFromGross(grossPrice, rateResult.data);
}

/**
 * Calculate VAT and gross price for a specific country
 * Combines country lookup and calculation in one call
 * 
 * @param netPrice - Price excluding VAT
 * @param country - ISO 3166-1 alpha-2 country code
 * @param calculationDate - Date for calculation (defaults to today)
 * @returns Result with VAT amount and gross price, or error
 * 
 * @example
 * // Hungarian product at €100 net (highest EU rate: 27%)
 * calculateVATFromNetForCountry(100, 'HU')
 * // Returns: { success: true, data: { vatAmount: 27, grossPrice: 127, vatRate: 0.27 } }
 */
export function calculateVATFromNetForCountry(
  netPrice: number,
  country: CountryCode,
  calculationDate?: Date
): { success: true; data: VATFromNetResult } | { success: false; error: VATValidationError } {
  const rateResult = getVATRateForCountry(country, calculationDate);
  
  if (!rateResult.success) {
    return { success: false, error: rateResult.error };
  }

  return calculateVATFromNet(netPrice, rateResult.data);
}

