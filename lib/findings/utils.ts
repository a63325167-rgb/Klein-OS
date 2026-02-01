/**
 * Shared Utilities for Findings Detection Engines
 * 
 * Contains FBA rate constants and helper functions used across all detection engines.
 * All rates are based on 2024 Amazon FBA pricing for European marketplace.
 */

/**
 * Amazon FBA Rates for 2024 (European Marketplace)
 * 
 * These are conservative estimates based on standard Amazon FBA fees.
 * Actual fees may vary by category, size tier, and marketplace.
 */
export const FBA_RATES_2024 = {
  // Referral fee: 15% is Amazon's standard rate for most categories
  // Some categories (e.g., jewelry) may be higher
  referral_fee_percent: 0.15,
  
  // Fulfillment fees (pick, pack, ship)
  // Standard size: €2.50 (typical for items <500g)
  // Oversize: €4.50 (items >500g or bulky dimensions)
  fulfillment_fee_standard: 2.50,
  fulfillment_fee_oversize: 4.50,
  
  // Storage fees (per unit per month)
  // €0.87/unit/month for Q1-September (standard size)
  // Q4 rates are higher (~€1.20) but we use conservative Q1-Sept rate
  storage_fee_monthly: 0.87,
  
  // Opportunity cost assumption
  // 20% annual ROI is conservative for reinvested capital
  // This represents what you could earn deploying capital elsewhere
  market_return_assumption_percent: 20,
};

/**
 * Calculate net profit margin percentage
 * 
 * Formula: ((selling_price - cost - referral - fulfillment) / selling_price) × 100
 * 
 * @param sellingPrice - Amazon list price in EUR
 * @param costPerUnit - What you paid per unit in EUR
 * @param referralPercent - Amazon referral fee as decimal (default 0.15 = 15%)
 * @param fulfillmentFee - FBA fulfillment fee in EUR (default €2.50)
 * @returns Net margin as percentage (e.g., 25.5 means 25.5%)
 * 
 * @example
 * calculateNetMargin(29.99, 15.00, 0.15, 2.50)
 * // Returns: ~8.5% margin
 */
export function calculateNetMargin(
  sellingPrice: number,
  costPerUnit: number,
  referralPercent: number = FBA_RATES_2024.referral_fee_percent,
  fulfillmentFee: number = FBA_RATES_2024.fulfillment_fee_standard
): number {
  // Calculate Amazon's referral fee
  const referralFee = sellingPrice * referralPercent;
  
  // Calculate net profit per unit
  const netProfit = sellingPrice - costPerUnit - referralFee - fulfillmentFee;
  
  // Convert to percentage
  // Handle edge case: if selling price is 0, margin is 0
  if (sellingPrice === 0) return 0;
  
  const marginPercent = (netProfit / sellingPrice) * 100;
  
  // Round to 1 decimal place for readability
  return Math.round(marginPercent * 10) / 10;
}

/**
 * Calculate net profit per unit in EUR
 * 
 * Formula: selling_price - cost - referral - fulfillment
 * 
 * @param sellingPrice - Amazon list price in EUR
 * @param costPerUnit - What you paid per unit in EUR
 * @param referralPercent - Amazon referral fee as decimal (default 0.15)
 * @param fulfillmentFee - FBA fulfillment fee in EUR (default €2.50)
 * @returns Net profit per unit in EUR
 */
export function calculateNetProfit(
  sellingPrice: number,
  costPerUnit: number,
  referralPercent: number = FBA_RATES_2024.referral_fee_percent,
  fulfillmentFee: number = FBA_RATES_2024.fulfillment_fee_standard
): number {
  const referralFee = sellingPrice * referralPercent;
  const netProfit = sellingPrice - costPerUnit - referralFee - fulfillmentFee;
  
  // Round to 2 decimal places (cents precision)
  return Math.round(netProfit * 100) / 100;
}

/**
 * Infer monthly sales velocity from inventory data
 * 
 * Assumes all stock arrived at once (conservative estimate).
 * Formula: (quantity / days_in_stock) × 30
 * 
 * @param qtyInStock - Current quantity in inventory
 * @param daysInStock - Days since inventory was received/created
 * @returns Estimated monthly sales rate
 * 
 * @example
 * inferMonthlyVelocity(200, 165)
 * // Returns: ~36 units/month
 * // Logic: 200 units / 165 days = 1.21 units/day × 30 = 36.4 units/month
 */
export function inferMonthlyVelocity(
  qtyInStock: number,
  daysInStock: number
): number {
  // Edge cases: invalid inputs return 0
  if (daysInStock <= 0 || qtyInStock <= 0) return 0;
  
  // Calculate daily sales rate
  const dailyRate = qtyInStock / daysInStock;
  
  // Convert to monthly (30 days)
  const monthlyRate = dailyRate * 30;
  
  // Round to 1 decimal place
  return Math.round(monthlyRate * 10) / 10;
}

/**
 * Round price to psychological pricing endpoint
 * 
 * Converts price to nearest .99 or .95 ending for better conversion.
 * Example: 44.23 → 44.99 or 44.95
 * 
 * @param price - Raw calculated price
 * @param ending - Desired price ending (0.99 or 0.95)
 * @returns Rounded price with psychological ending
 * 
 * @example
 * roundPrice(44.23, 0.99)
 * // Returns: 44.99
 */
export function roundPrice(price: number, ending: 0.99 | 0.95 = 0.99): number {
  // Get the integer part (e.g., 44 from 44.23)
  const base = Math.floor(price);
  
  // Add the psychological ending
  const roundedPrice = base + ending;
  
  // Round to 2 decimal places
  return Math.round(roundedPrice * 100) / 100;
}

/**
 * Calculate impact priority score (1-100)
 * 
 * Higher priority = more urgent/valuable finding
 * Based on financial impact and severity
 * 
 * @param annualImpact - Annual financial impact in EUR
 * @param severity - Finding severity level
 * @returns Priority score from 1-100
 */
export function calculatePriority(
  annualImpact: number,
  severity: "critical" | "opportunity"
): number {
  // Base score from financial impact
  // €0 = 0, €1000 = 50, €5000 = 90, €10000+ = 100
  let score = Math.min(100, (annualImpact / 100));
  
  // Critical findings get +20 boost
  if (severity === "critical") {
    score = Math.min(100, score + 20);
  }
  
  // Ensure score is in valid range
  score = Math.max(1, Math.min(100, score));
  
  // Round to integer
  return Math.round(score);
}

/**
 * Get fulfillment fee based on size tier
 * 
 * @param sizeTier - Product size tier
 * @returns Fulfillment fee in EUR
 */
export function getFulfillmentFee(sizeTier?: "standard" | "oversize"): number {
  if (sizeTier === "oversize") {
    return FBA_RATES_2024.fulfillment_fee_oversize;
  }
  return FBA_RATES_2024.fulfillment_fee_standard;
}

/**
 * Format currency for display
 * 
 * @param amount - Amount in EUR
 * @returns Formatted string (e.g., "€1,234.56")
 */
export function formatCurrency(amount: number): string {
  return `€${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

/**
 * Validate product data has required fields
 * 
 * @param product - Product to validate
 * @returns true if valid, false otherwise
 */
export function isValidProduct(product: any): boolean {
  return !!(
    product &&
    typeof product.asin === 'string' &&
    typeof product.cost_per_unit === 'number' &&
    typeof product.selling_price === 'number' &&
    typeof product.quantity_in_stock === 'number' &&
    product.cost_per_unit >= 0 &&
    product.selling_price >= 0 &&
    product.quantity_in_stock >= 0
  );
}
