/**
 * EU VAT Rules Engine
 * Determines which VAT rules apply based on transaction details
 * 
 * @version 1.0
 * @date 2025-10-18
 */

import { CountryCode } from './types';
import { DISTANCE_SELLING_THRESHOLD } from './constants';

/**
 * Parameters for VAT rule determination
 */
export interface VATRuleParams {
  /** Seller's country */
  sellerCountry: CountryCode;
  /** Buyer's country */
  buyerCountry: CountryCode;
  /** Storage country (for FBA) */
  storageCountry?: CountryCode;
  /** Fulfillment method */
  fulfillmentMethod: 'FBA' | 'FBM';
  /** Transaction type */
  transactionType: 'B2C' | 'B2B';
  /** Annual cross-border sales in EUR */
  annualCrossBorderSales?: number;
  /** Product selling price */
  sellingPrice?: number;
  /** Annual volume */
  annualVolume?: number;
}

/**
 * VAT rule description result
 */
export interface VATRuleResult {
  /** Descriptive text of the rule applied */
  ruleDescription: string;
  /** Which country's VAT rate applies */
  vatCountry: CountryCode;
  /** Whether this is a domestic sale */
  isDomestic: boolean;
  /** Whether distance selling threshold applies */
  isDistanceSelling: boolean;
  /** Whether reverse charge applies (B2B) */
  isReverseCharge: boolean;
  /** Whether local sale in storage country (FBA) */
  isLocalSale: boolean;
}

/**
 * Calculate VAT rule description based on transaction details
 * 
 * @param params - Transaction parameters
 * @returns VAT rule description and metadata
 */
export function calculateVATRuleDescription(params: VATRuleParams): VATRuleResult {
  const {
    sellerCountry,
    buyerCountry,
    storageCountry,
    fulfillmentMethod,
    transactionType,
    annualCrossBorderSales,
    sellingPrice = 0,
    annualVolume = 0
  } = params;

  // Calculate annual sales if not provided
  const annualSales = annualCrossBorderSales || (sellingPrice * annualVolume);
  
  // Check if this is a domestic sale
  const isDomestic = sellerCountry === buyerCountry;
  
  // Check if this is a B2B reverse charge transaction
  const isReverseCharge = transactionType === 'B2B' && !isDomestic;
  
  // Check if this is a local sale in storage country (FBA)
  const isLocalSale = fulfillmentMethod === 'FBA' && 
                     storageCountry && 
                     storageCountry === buyerCountry;
  
  // Check if distance selling threshold applies
  const isDistanceSelling = !isDomestic && 
                           !isReverseCharge && 
                           !isLocalSale && 
                           annualSales >= DISTANCE_SELLING_THRESHOLD;

  // Determine which country's VAT applies
  let vatCountry: CountryCode;
  let ruleDescription: string;

  if (isReverseCharge) {
    // B2B cross-border: Reverse charge (0% VAT)
    vatCountry = sellerCountry;
    ruleDescription = 'Reverse charge (buyer accounts for VAT)';
  } else if (isLocalSale) {
    // FBA with inventory stored in buyer's country: Local sale
    vatCountry = buyerCountry;
    ruleDescription = `Local sale in ${getCountryName(buyerCountry)} (FBA inventory stored in destination country)`;
  } else if (isDomestic) {
    // Same country: Domestic sale
    vatCountry = sellerCountry;
    ruleDescription = 'Domestic sale (seller and buyer in same country)';
  } else if (isDistanceSelling) {
    // Cross-border B2C above threshold: Destination country VAT
    vatCountry = buyerCountry;
    ruleDescription = `Destination country VAT (exceeds €${DISTANCE_SELLING_THRESHOLD.toLocaleString()} distance selling threshold)`;
  } else {
    // Cross-border B2C below threshold: Origin country VAT
    vatCountry = sellerCountry;
    ruleDescription = `Origin country VAT (below €${DISTANCE_SELLING_THRESHOLD.toLocaleString()} distance selling threshold)`;
  }

  return {
    ruleDescription,
    vatCountry,
    isDomestic,
    isDistanceSelling,
    isReverseCharge,
    isLocalSale
  };
}

/**
 * Get country name from country code
 */
function getCountryName(countryCode: CountryCode): string {
  const countryNames: Record<CountryCode, string> = {
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
    NO: 'Norway'
  };
  
  return countryNames[countryCode] || countryCode;
}

/**
 * Check if VAT registration is required
 * 
 * @param params - Transaction parameters
 * @returns Whether VAT registration is required and in which country
 */
export function checkVATRegistrationRequired(params: VATRuleParams): {
  required: boolean;
  countries: CountryCode[];
  reason: string;
} {
  const ruleResult = calculateVATRuleDescription(params);
  
  if (ruleResult.isReverseCharge) {
    return {
      required: false,
      countries: [],
      reason: 'No (reverse charge applies)'
    };
  }
  
  if (ruleResult.isDomestic) {
    return {
      required: true,
      countries: [params.sellerCountry],
      reason: `Yes (${getCountryName(params.sellerCountry)})`
    };
  }
  
  if (ruleResult.isLocalSale) {
    return {
      required: true,
      countries: [params.storageCountry!],
      reason: `Yes (${getCountryName(params.storageCountry!)})`
    };
  }
  
  if (ruleResult.isDistanceSelling) {
    return {
      required: true,
      countries: [params.buyerCountry],
      reason: `Yes (${getCountryName(params.buyerCountry)})`
    };
  }
  
  // Below threshold cross-border
  return {
    required: true,
    countries: [params.sellerCountry],
    reason: `Yes (${getCountryName(params.sellerCountry)})`
  };
}

/**
 * Check if OSS (One-Stop-Shop) is eligible
 * 
 * @param params - Transaction parameters
 * @returns Whether OSS is eligible
 */
export function checkOSSEligibility(params: VATRuleParams): {
  eligible: boolean;
  reason: string;
} {
  const ruleResult = calculateVATRuleDescription(params);
  
  if (ruleResult.isDomestic) {
    return {
      eligible: false,
      reason: 'No (domestic transaction)'
    };
  }
  
  if (ruleResult.isReverseCharge) {
    return {
      eligible: false,
      reason: 'No (B2B reverse charge)'
    };
  }
  
  if (ruleResult.isLocalSale) {
    return {
      eligible: false,
      reason: 'No (local sale in storage country)'
    };
  }
  
  // Cross-border B2C sales
  return {
    eligible: true,
    reason: 'Yes (cross-border B2C sale)'
  };
}
