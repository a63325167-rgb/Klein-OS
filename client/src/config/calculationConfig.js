/**
 * Centralized Configuration for Calculation Constants
 * All fee rates, VAT rates, and business rules in one place
 * Future: Can be synced with API for dynamic updates
 */

// 🔹 Amazon Fee Rates by Category
// TODO: Sync with API in production
export const AMAZON_FEES = {
  'Electronics': 8,
  'Beauty': 15,
  'Jewelry': 20,
  'Health': 8,
  'Books': 15,
  'Apparel': 17,
  'Furniture': 15,
  'Food': 15,
  'Baby': 15,
  'Sports & Outdoors': 15,
  'Toys & Games': 15,
  'Home & Garden': 15,
  'Automotive': 12,
  'Office Supplies': 15,
  'Other': 15,
  'Default': 15
};

// 🔹 VAT Rates by Marketplace/Country
// TODO: Sync with API for real-time tax updates
export const VAT_RATES = {
  'Germany': 19,
  'Amazon.de': 19,
  'France': 20,
  'Amazon.fr': 20,
  'Italy': 22,
  'Amazon.it': 22,
  'Spain': 21,
  'Amazon.es': 21,
  'Netherlands': 21,
  'Belgium': 21,
  'Austria': 20,
  'Sweden': 25,
  'Denmark': 25,
  'Finland': 24,
  'Poland': 23,
  'Czech Republic': 21,
  'Hungary': 27,
  'Portugal': 23,
  'Greece': 24,
  'Slovakia': 20,
  'Slovenia': 22,
  'Croatia': 25,
  'Romania': 19,
  'Bulgaria': 20,
  'Lithuania': 21,
  'Latvia': 21,
  'Estonia': 20,
  'Cyprus': 19,
  'Malta': 18,
  'Luxembourg': 17,
  'Ireland': 23,
  'Amazon.co.uk': 20,
  'Default': 19
};

// 🔹 Small Package Eligibility Limits
export const KLEINPAKET_LIMITS = {
  MAX_LENGTH: 35.3,    // cm
  MAX_WIDTH: 25.0,     // cm
  MAX_HEIGHT: 8.0,     // cm
  MAX_WEIGHT: 1.0,     // kg
  MAX_PRICE: 60.0      // EUR
};

// 🔹 Shipping Costs
export const SHIPPING_COSTS = {
  KLEINPAKET: 3.79,
  STANDARD: 5.50,
  HEAVY: 15.50
};

// 🔹 Default Values and Constants
export const DEFAULTS = {
  VAT_RATE: 19,
  AMAZON_FEE: 15,
  RETURN_BUFFER_PERCENTAGE: 2,
  RETURN_BUFFER_BASE: 2.50,
  TARGET_ROI: 20,
  MIN_PROFIT_MARGIN: 10
};

// 🔹 Performance Tier Thresholds
export const PERFORMANCE_TIERS = {
  EXCEPTIONAL: { margin: 30, roi: 150 },
  EXCELLENT: { margin: 20, roi: 100 },
  GOOD: { margin: 10, roi: 50 },
  FAIR: { margin: 5, roi: 25 },
  POOR: { margin: 0, roi: 0 }
};

// 🔹 Marketplace Options
export const MARKETPLACES = [
  { value: 'Amazon.de', label: 'Amazon Germany (DE)', country: 'Germany', vat: 19 },
  { value: 'Amazon.fr', label: 'Amazon France (FR)', country: 'France', vat: 20 },
  { value: 'Amazon.it', label: 'Amazon Italy (IT)', country: 'Italy', vat: 22 },
  { value: 'Amazon.es', label: 'Amazon Spain (ES)', country: 'Spain', vat: 21 },
  { value: 'Amazon.co.uk', label: 'Amazon UK', country: 'United Kingdom', vat: 20 }
];

// 🔹 Helper: Get VAT rate by country/marketplace
export const getVATRate = (countryOrMarketplace) => {
  return VAT_RATES[countryOrMarketplace] || VAT_RATES.Default;
};

// 🔹 Helper: Get Amazon fee rate by category
export const getAmazonFeeRate = (category) => {
  return AMAZON_FEES[category] || AMAZON_FEES.Default;
};

// 🔹 Export all constants as a single config object for easy import
export default {
  AMAZON_FEES,
  VAT_RATES,
  KLEINPAKET_LIMITS,
  SHIPPING_COSTS,
  DEFAULTS,
  PERFORMANCE_TIERS,
  MARKETPLACES,
  getVATRate,
  getAmazonFeeRate
};

