/**
 * EU VAT Calculator - Constants
 * 
 * Constants for VAT calculations including country mappings,
 * thresholds, and configuration values.
 * 
 * @version 1.0
 * @date 2025-10-18
 */

import { CountryCode } from './types';

/**
 * Country code to country name mapping
 */
export const COUNTRY_NAMES: Record<CountryCode, string> = {
  AT: 'Austria',
  BE: 'Belgium',
  BG: 'Bulgaria',
  HR: 'Croatia',
  CY: 'Cyprus',
  CZ: 'Czech Republic',
  DK: 'Denmark',
  EE: 'Estonia',
  FI: 'Finland',
  FR: 'France',
  DE: 'Germany',
  EL: 'Greece',
  HU: 'Hungary',
  IE: 'Ireland',
  IT: 'Italy',
  LV: 'Latvia',
  LT: 'Lithuania',
  LU: 'Luxembourg',
  MT: 'Malta',
  NL: 'Netherlands',
  PL: 'Poland',
  PT: 'Portugal',
  RO: 'Romania',
  SK: 'Slovakia',
  SI: 'Slovenia',
  ES: 'Spain',
  SE: 'Sweden',
  UK: 'United Kingdom',
  CH: 'Switzerland',
  NO: 'Norway',
};

/**
 * EU member states (excludes UK, CH, NO)
 */
export const EU_COUNTRIES: CountryCode[] = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'EL', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
];

/**
 * Distance selling threshold in EUR (Phase 4)
 * Cumulative annual cross-border sales threshold
 */
export const DISTANCE_SELLING_THRESHOLD = 10000;

/**
 * Rate change dates for time-sensitive countries
 */
export const RATE_CHANGES = {
  /** Estonia: 22% → 24% on July 1, 2025 */
  EE: {
    date: new Date('2025-07-01'),
    oldRate: 0.22,
    newRate: 0.24,
  },
  /** Romania: 19% → 21% on August 1, 2025 */
  RO: {
    date: new Date('2025-08-01'),
    oldRate: 0.19,
    newRate: 0.21,
  },
};

/**
 * Default rounding precision for monetary values
 */
export const DEFAULT_PRECISION = 2;

/**
 * Valid VAT rate range (0% to 30%)
 */
export const VAT_RATE_MIN = 0;
export const VAT_RATE_MAX = 0.30;

/**
 * Countries with no reduced rates
 */
export const NO_REDUCED_RATES: CountryCode[] = ['DK'];

