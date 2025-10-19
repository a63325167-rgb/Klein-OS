/**
 * EU VAT Calculator - Rates Database
 * 
 * Complete database of VAT rates for all 30 supported countries.
 * Phase 1: Standard rates only
 * Phase 2: Will add reduced rates by category
 * 
 * @version 1.0
 * @date 2025-10-18
 */

import { CountryCode, CountryVATRates } from './types';
import { COUNTRY_NAMES, RATE_CHANGES } from './constants';

/**
 * Complete VAT rates database for all 30 countries
 * All rates are stored as decimals (e.g., 0.19 for 19%)
 * 
 * Source: EU VAT Directive, official government sources
 * Last verified: October 2025
 */
export const VAT_RATES_DATABASE: CountryVATRates[] = [
  {
    country: 'AT',
    name: COUNTRY_NAMES.AT,
    standard: 0.20,
    reduced1: 0.10, // Food, books, medicines
  },
  {
    country: 'BE',
    name: COUNTRY_NAMES.BE,
    standard: 0.21,
    reduced1: 0.06, // Food, books, medicines
  },
  {
    country: 'BG',
    name: COUNTRY_NAMES.BG,
    standard: 0.20,
    reduced1: 0.09, // Food, books, medicines
  },
  {
    country: 'HR',
    name: COUNTRY_NAMES.HR,
    standard: 0.25,
    reduced1: 0.05, // Food, books, medicines
  },
  {
    country: 'CY',
    name: COUNTRY_NAMES.CY,
    standard: 0.19,
    reduced1: 0.05, // Food, books
  },
  {
    country: 'CZ',
    name: COUNTRY_NAMES.CZ,
    standard: 0.21,
    reduced1: 0.12, // Food, medicines
  },
  {
    country: 'DK',
    name: COUNTRY_NAMES.DK,
    standard: 0.25,
    // No reduced rates in Denmark
    notes: 'Denmark has NO reduced rates. All products are 25% regardless of category.',
  },
  {
    country: 'EE',
    name: COUNTRY_NAMES.EE,
    standard: 0.22, // Changes to 24% on July 1, 2025
    reduced1: 0.09, // Books, medicines
    notes: 'Rate changes from 22% to 24% on July 1, 2025',
    effectiveDate: '2025-07-01',
  },
  {
    country: 'FI',
    name: COUNTRY_NAMES.FI,
    standard: 0.255,
    reduced1: 0.10, // Food, books
  },
  {
    country: 'FR',
    name: COUNTRY_NAMES.FR,
    standard: 0.20,
    reduced1: 0.055, // Food, books, medicines
    reduced2: 0.10, // Restaurant services, hotel
  },
  {
    country: 'DE',
    name: COUNTRY_NAMES.DE,
    standard: 0.19,
    reduced1: 0.07, // Food, books, newspapers, cultural events
  },
  {
    country: 'EL',
    name: COUNTRY_NAMES.EL,
    standard: 0.24,
    reduced1: 0.06, // Food, books, medicines
    reduced2: 0.13, // Restaurant services
  },
  {
    country: 'HU',
    name: COUNTRY_NAMES.HU,
    standard: 0.27, // Highest in EU
    reduced1: 0.05, // Food, medicines
    notes: 'Highest standard VAT rate in the EU',
  },
  {
    country: 'IE',
    name: COUNTRY_NAMES.IE,
    standard: 0.23,
    reduced1: 0.09, // Food, newspapers
    reduced2: 0.135, // Fuel, electricity
  },
  {
    country: 'IT',
    name: COUNTRY_NAMES.IT,
    standard: 0.22,
    reduced1: 0.10, // Food, medicines
    reduced2: 0.05, // Some social goods
  },
  {
    country: 'LV',
    name: COUNTRY_NAMES.LV,
    standard: 0.21,
    reduced1: 0.12, // Food, books
  },
  {
    country: 'LT',
    name: COUNTRY_NAMES.LT,
    standard: 0.21,
    reduced1: 0.05, // Books, medicines
  },
  {
    country: 'LU',
    name: COUNTRY_NAMES.LU,
    standard: 0.17, // Lowest in EU
    reduced1: 0.08, // Food, medicines
    notes: 'Lowest standard VAT rate in the EU',
  },
  {
    country: 'MT',
    name: COUNTRY_NAMES.MT,
    standard: 0.18,
    reduced1: 0.05, // Food, books
  },
  {
    country: 'NL',
    name: COUNTRY_NAMES.NL,
    standard: 0.21,
    reduced1: 0.09, // Food, books, medicines
  },
  {
    country: 'PL',
    name: COUNTRY_NAMES.PL,
    standard: 0.23,
    reduced1: 0.05, // Food, books
  },
  {
    country: 'PT',
    name: COUNTRY_NAMES.PT,
    standard: 0.23,
    reduced1: 0.06, // Food, books
    reduced2: 0.13, // Restaurant services
  },
  {
    country: 'RO',
    name: COUNTRY_NAMES.RO,
    standard: 0.19, // Changes to 21% on August 1, 2025
    reduced1: 0.05, // Food, books
    notes: 'Rate changes from 19% to 21% on August 1, 2025',
    effectiveDate: '2025-08-01',
  },
  {
    country: 'SK',
    name: COUNTRY_NAMES.SK,
    standard: 0.23, // Increased from 20% in Jan 2025
    reduced1: 0.10, // Food, books
    notes: 'Increased from 20% to 23% in January 2025',
  },
  {
    country: 'SI',
    name: COUNTRY_NAMES.SI,
    standard: 0.22,
    reduced1: 0.095, // Food, books
  },
  {
    country: 'ES',
    name: COUNTRY_NAMES.ES,
    standard: 0.21,
    reduced1: 0.10, // Food, books
    reduced2: 0.04, // Basic food (super-reduced)
  },
  {
    country: 'SE',
    name: COUNTRY_NAMES.SE,
    standard: 0.25,
    reduced1: 0.06, // Food, books
  },
  {
    country: 'UK',
    name: COUNTRY_NAMES.UK,
    standard: 0.20,
    reduced1: 0.05, // Food (some), books, children's items
    notes: 'Post-Brexit rates',
  },
  {
    country: 'CH',
    name: COUNTRY_NAMES.CH,
    standard: 0.081, // 8.1%
    reduced1: 0.026, // Food, medicines
    notes: 'Not EU member',
  },
  {
    country: 'NO',
    name: COUNTRY_NAMES.NO,
    standard: 0.25,
    reduced1: 0.15, // Food
    notes: 'Not EU member',
  },
];

/**
 * Get VAT rate for a specific country with time-sensitive rate changes
 * 
 * @param country - ISO 3166-1 alpha-2 country code
 * @param calculationDate - Date for calculation (defaults to today)
 * @returns Standard VAT rate as decimal (e.g., 0.19 for 19%)
 * 
 * @example
 * getStandardRate('DE') // Returns 0.19 (19%)
 * getStandardRate('EE', new Date('2025-06-30')) // Returns 0.22
 * getStandardRate('EE', new Date('2025-07-01')) // Returns 0.24
 */
export function getStandardRate(
  country: CountryCode,
  calculationDate: Date = new Date()
): number {
  // Handle time-sensitive rate changes
  if (country === 'EE') {
    const changeDate = RATE_CHANGES.EE.date;
    return calculationDate >= changeDate 
      ? RATE_CHANGES.EE.newRate 
      : RATE_CHANGES.EE.oldRate;
  }

  if (country === 'RO') {
    const changeDate = RATE_CHANGES.RO.date;
    return calculationDate >= changeDate 
      ? RATE_CHANGES.RO.newRate 
      : RATE_CHANGES.RO.oldRate;
  }

  // Get standard rate from database
  const countryData = VAT_RATES_DATABASE.find(r => r.country === country);
  
  if (!countryData) {
    throw new Error(`Unknown country code: ${country}`);
  }

  return countryData.standard;
}

/**
 * Get complete VAT rate information for a country
 * 
 * @param country - ISO 3166-1 alpha-2 country code
 * @returns Complete VAT rates object or undefined if not found
 */
export function getCountryRates(country: CountryCode): CountryVATRates | undefined {
  return VAT_RATES_DATABASE.find(r => r.country === country);
}

/**
 * Check if a country has reduced VAT rates available
 * 
 * @param country - ISO 3166-1 alpha-2 country code
 * @returns True if country has any reduced rates
 */
export function hasReducedRates(country: CountryCode): boolean {
  const rates = getCountryRates(country);
  return !!(rates?.reduced1 || rates?.reduced2 || rates?.superReduced);
}

