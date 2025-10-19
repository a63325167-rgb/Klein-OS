/**
 * EU VAT Calculator - Main Export
 * 
 * Phase 1: Basic VAT calculations with standard rates
 * 
 * @version 1.0
 * @date 2025-10-18
 */

// Core calculation functions
export {
  extractNetFromGross,
  calculateVATFromNet,
  extractNetFromGrossForCountry,
  calculateVATFromNetForCountry,
  getVATRateForCountry,
  roundMoney,
  roundRate,
} from './calculator';

// Rates database
export {
  VAT_RATES_DATABASE,
  getStandardRate,
  getCountryRates,
  hasReducedRates,
} from './rates';

// Types
export type {
  CountryCode,
  ProductCategory,
  VATRateType,
  CountryVATRates,
  VATRate,
  NetFromGrossResult,
  VATFromNetResult,
  VATRateParams,
  ProfitabilityParams,
  ProfitabilityResult,
  VATValidationError,
  VATCalculatorConfig,
} from './types';

// Constants
export {
  COUNTRY_NAMES,
  EU_COUNTRIES,
  DISTANCE_SELLING_THRESHOLD,
  RATE_CHANGES,
  DEFAULT_PRECISION,
  VAT_RATE_MIN,
  VAT_RATE_MAX,
  NO_REDUCED_RATES,
} from './constants';

