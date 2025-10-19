/**
 * EU VAT Calculator - Type Definitions
 * 
 * Defines TypeScript interfaces and types for VAT calculations
 * across EU, UK, Switzerland, and Norway.
 * 
 * @version 1.0
 * @date 2025-10-18
 */

/**
 * ISO 3166-1 alpha-2 country codes supported by the VAT calculator
 */
export type CountryCode = 
  | 'AT' // Austria
  | 'BE' // Belgium
  | 'BG' // Bulgaria
  | 'HR' // Croatia
  | 'CY' // Cyprus
  | 'CZ' // Czech Republic
  | 'DK' // Denmark
  | 'EE' // Estonia
  | 'FI' // Finland
  | 'FR' // France
  | 'DE' // Germany
  | 'EL' // Greece
  | 'HU' // Hungary
  | 'IE' // Ireland
  | 'IT' // Italy
  | 'LV' // Latvia
  | 'LT' // Lithuania
  | 'LU' // Luxembourg
  | 'MT' // Malta
  | 'NL' // Netherlands
  | 'PL' // Poland
  | 'PT' // Portugal
  | 'RO' // Romania
  | 'SK' // Slovakia
  | 'SI' // Slovenia
  | 'ES' // Spain
  | 'SE' // Sweden
  | 'UK' // United Kingdom
  | 'CH' // Switzerland
  | 'NO'; // Norway

/**
 * Product categories for VAT rate determination
 * Phase 1 uses 'standard', Phase 2 will expand to specific categories
 */
export type ProductCategory = 
  | 'standard'
  | 'books'
  | 'food'
  | 'medicines'
  | 'children_clothing'
  | 'electronics'
  | 'accommodation'
  | 'cultural'
  | 'transport';

/**
 * VAT rate type classification
 */
export type VATRateType = 'standard' | 'reduced1' | 'reduced2' | 'super_reduced' | 'zero';

/**
 * Country-specific VAT rates structure
 */
export interface CountryVATRates {
  /** Country code */
  country: CountryCode;
  /** Country name */
  name: string;
  /** Standard VAT rate (as decimal, e.g., 0.19 for 19%) */
  standard: number;
  /** First reduced rate (if applicable) */
  reduced1?: number;
  /** Second reduced rate (if applicable) */
  reduced2?: number;
  /** Super-reduced rate (if applicable) */
  superReduced?: number;
  /** Notes about special rules or rate changes */
  notes?: string;
  /** Effective date for rate (if time-sensitive) */
  effectiveDate?: string;
}

/**
 * VAT rate lookup result
 */
export interface VATRate {
  /** The applicable VAT rate as decimal (e.g., 0.19 for 19%) */
  rate: number;
  /** The type of rate applied */
  rateType: VATRateType;
  /** The country where VAT applies */
  country: CountryCode;
  /** Explanation of which rule was applied */
  ruleApplied: string;
}

/**
 * Result of extracting net price from gross price
 */
export interface NetFromGrossResult {
  /** Net price (excluding VAT) */
  netPrice: number;
  /** VAT amount */
  vatAmount: number;
  /** VAT rate used (as decimal) */
  vatRate: number;
}

/**
 * Result of calculating VAT from net price
 */
export interface VATFromNetResult {
  /** VAT amount */
  vatAmount: number;
  /** Gross price (including VAT) */
  grossPrice: number;
  /** VAT rate used (as decimal) */
  vatRate: number;
}

/**
 * Parameters for VAT rate lookup
 */
export interface VATRateParams {
  /** Country where VAT applies */
  country: CountryCode;
  /** Product category */
  category: ProductCategory;
  /** Optional: calculation date (defaults to today) */
  calculationDate?: Date;
}

/**
 * Parameters for profitability calculation with VAT (Phase 3)
 */
export interface ProfitabilityParams {
  /** Price customer pays (gross, including VAT) */
  salePrice: number;
  /** What seller paid supplier (gross, including VAT) */
  cogs: number;
  /** Amazon's fees (gross if applicable) */
  amazonFees: number;
  /** Product category */
  category: ProductCategory;
  /** Seller's country */
  sellerCountry: CountryCode;
  /** Buyer's country */
  buyerCountry: CountryCode;
  /** Storage country (for FBA) - Phase 4 */
  storageCountry?: CountryCode;
  /** Is this a B2B transaction? - Phase 5 */
  isB2B?: boolean;
  /** Does buyer have valid VAT number? - Phase 5 */
  hasValidVATNumber?: boolean;
  /** Annual cross-border sales (for distance selling threshold) - Phase 4 */
  annualCrossBorderSales?: number;
  /** Calculation date (for time-sensitive rates) */
  calculationDate?: Date;
}

/**
 * Result of profitability calculation with VAT (Phase 3)
 */
export interface ProfitabilityResult {
  /** Sale price including VAT */
  revenueGross: number;
  /** Sale price excluding VAT */
  revenueNet: number;
  /** Cost of goods sold including VAT */
  cogsGross: number;
  /** Cost of goods sold excluding VAT */
  cogsNet: number;
  /** Amazon fees including VAT */
  feesGross: number;
  /** Amazon fees excluding VAT */
  feesNet: number;
  /** VAT collected from customer (output VAT) */
  outputVAT: number;
  /** Reclaimable VAT on COGS (input VAT) */
  inputVATCogs: number;
  /** Reclaimable VAT on fees (input VAT) */
  inputVATFees: number;
  /** Net VAT liability (what seller pays to tax authority) */
  netVATLiability: number;
  /** True profit after all VAT adjustments */
  netProfit: number;
  /** Profit margin as percentage */
  marginPercentage: number;
  /** VAT rate information */
  vatInfo: VATRate;
}

/**
 * Validation error for VAT calculations
 */
export interface VATValidationError {
  /** Error code for programmatic handling */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Field that caused the error */
  field?: string;
}

/**
 * Configuration options for VAT calculator
 */
export interface VATCalculatorConfig {
  /** Enable strict validation (default: true) */
  strictValidation?: boolean;
  /** Rounding precision for monetary values (default: 2) */
  roundingPrecision?: number;
  /** Enable rate change date logic (default: true) */
  enableRateChanges?: boolean;
}

