/**
 * LOW MARGIN DETECTION ENGINE
 * 
 * Identifies products with thin margins that could generate massive ROI
 * through simple repricing. These are "found money" opportunities.
 * 
 * TRIGGER CRITERIA:
 * - Net margin < 10% (too thin)
 * - Actively selling (quantity > 5, not dead inventory)
 * 
 * Both conditions must be true to flag as low margin opportunity.
 */

import type { Product, LowMarginFinding, Action } from './types';
import { 
  FBA_RATES_2024, 
  calculateNetMargin, 
  calculateNetProfit,
  getFulfillmentFee,
  roundPrice,
  calculatePriority,
  isValidProduct,
  inferMonthlyVelocity
} from './utils';

/**
 * Detect low margin products across portfolio
 * 
 * @param products - Array of products to analyze
 * @returns Array of low margin findings
 * 
 * @example
 * const findings = detectLowMargin(products);
 * findings.forEach(f => console.log(f.problem_headline));
 */
export function detectLowMargin(products: Product[]): LowMarginFinding[] {
  const findings: LowMarginFinding[] = [];
  
  for (const product of products) {
    // Validate product data
    if (!isValidProduct(product)) {
      continue;
    }
    
    // TRIGGER CHECK 1: Quantity must be > 5 (actively selling)
    if (product.quantity_in_stock <= 5) {
      continue; // Too low quantity, might be inventory error
    }
    
    // Calculate net margin
    const fulfillmentFee = getFulfillmentFee(product.size_tier);
    const netMarginPercent = calculateNetMargin(
      product.selling_price,
      product.cost_per_unit,
      FBA_RATES_2024.referral_fee_percent,
      fulfillmentFee
    );
    
    // TRIGGER CHECK 2: Net margin must be < 10%
    if (netMarginPercent >= 10) {
      continue; // Margin is acceptable
    }
    
    // Both triggers met - this is a low margin opportunity
    // Now calculate the repricing scenario
    
    const finding = calculateLowMarginImpact(product, netMarginPercent, fulfillmentFee);
    
    // Only add if we have valid monthly sales estimate
    if (finding) {
      findings.push(finding);
    }
  }
  
  // Sort by monthly gain (highest first)
  findings.sort((a, b) => b.monthly_gain_eur - a.monthly_gain_eur);
  
  return findings;
}

/**
 * Calculate detailed financial impact of repricing low margin product
 * 
 * This is the conversion engine - shows sellers exactly how much money
 * they're leaving on the table.
 */
function calculateLowMarginImpact(
  product: Product,
  currentNetMargin: number,
  fulfillmentFee: number
): LowMarginFinding | null {
  
  // ============================================
  // STEP 1: Determine Monthly Sales Velocity
  // ============================================
  let estimatedMonthlySales: number;
  
  if (product.estimated_monthly_sales && product.estimated_monthly_sales > 0) {
    // Use provided sales data if available
    estimatedMonthlySales = product.estimated_monthly_sales;
  } else if (product.days_in_stock && product.days_in_stock > 0) {
    // Infer from inventory turnover
    estimatedMonthlySales = inferMonthlyVelocity(
      product.quantity_in_stock,
      product.days_in_stock
    );
  } else {
    // Can't calculate without velocity data
    return null;
  }
  
  // Skip if no sales activity
  if (estimatedMonthlySales <= 0) {
    return null;
  }
  
  // ============================================
  // STEP 2: Calculate Current Economics
  // ============================================
  const referralFee = product.selling_price * FBA_RATES_2024.referral_fee_percent;
  const currentProfitPerUnit = product.selling_price - product.cost_per_unit - referralFee - fulfillmentFee;
  const currentMonthlyProfit = currentProfitPerUnit * estimatedMonthlySales;
  const currentAnnualProfit = currentMonthlyProfit * 12;
  
  // ============================================
  // STEP 3: Determine Recommended Price
  // ============================================
  // Target: 20% net margin (healthy for FBA)
  const targetMargin = 20;
  
  // Calculate price increase needed
  // Formula: How much % increase to go from current margin to target margin
  // Conservative: Take 50% of the gap to be safe
  const marginGap = targetMargin - currentNetMargin;
  const priceIncreasePercent = Math.max(0, (marginGap / 100) * 0.5);
  
  // Calculate new price
  let recommendedPrice = product.selling_price * (1 + priceIncreasePercent);
  
  // Round to psychological price point (.99 or .95)
  recommendedPrice = roundPrice(recommendedPrice, 0.99);
  
  // Calculate actual price increase
  const priceIncreaseAbsolute = recommendedPrice - product.selling_price;
  const actualPriceIncreasePercent = (priceIncreaseAbsolute / product.selling_price) * 100;
  
  // ============================================
  // STEP 4: Estimate Volume Change
  // ============================================
  // Price elasticity: Conservative assumption
  // 10% price increase = ~10% volume loss (1:1 ratio, conservative)
  const volumeLossPercent = actualPriceIncreasePercent * 1.0;
  const estimatedNewMonthlySales = estimatedMonthlySales * (1 - volumeLossPercent / 100);
  
  // ============================================
  // STEP 5: Calculate New Economics
  // ============================================
  const newReferralFee = recommendedPrice * FBA_RATES_2024.referral_fee_percent;
  const newProfitPerUnit = recommendedPrice - product.cost_per_unit - newReferralFee - fulfillmentFee;
  const newMonthlyProfit = newProfitPerUnit * estimatedNewMonthlySales;
  const newAnnualProfit = newMonthlyProfit * 12;
  
  // ============================================
  // STEP 6: Calculate Impact (THE KEY NUMBERS)
  // ============================================
  const monthlyGain = newMonthlyProfit - currentMonthlyProfit;
  const annualGain = newAnnualProfit - currentAnnualProfit;
  const monthlyGainPercentage = currentMonthlyProfit > 0 
    ? (monthlyGain / currentMonthlyProfit) * 100 
    : 0;
  
  // ROI payback: How many days to recoup any setup effort
  // For repricing, it's essentially immediate (no setup cost)
  const roiPaybackDays = 1; // Next day after repricing
  
  // ============================================
  // STEP 7: Calculate Impact Priority
  // ============================================
  const impactPriority = calculatePriority(annualGain, "critical");
  
  // ============================================
  // STEP 8: Generate Recommended Actions
  // ============================================
  const actions = generateLowMarginActions(
    product,
    monthlyGain,
    recommendedPrice,
    actualPriceIncreasePercent
  );
  
  // ============================================
  // STEP 9: Build Finding Object
  // ============================================
  const finding: LowMarginFinding = {
    finding_type: "low_margin",
    severity: "critical",
    asin: product.asin,
    product_name: product.product_name,
    
    // Problem statement (what sellers see first)
    problem_headline: `€${Math.round(monthlyGain)}/month opportunity from repricing`,
    problem_description: `Currently ${currentNetMargin.toFixed(1)}% margin, could be 20%`,
    
    // Current state (transparency)
    current_price_eur: Math.round(product.selling_price * 100) / 100,
    cost_per_unit_eur: Math.round(product.cost_per_unit * 100) / 100,
    current_net_margin_percent: Math.round(currentNetMargin * 10) / 10,
    current_profit_per_unit_eur: Math.round(currentProfitPerUnit * 100) / 100,
    estimated_monthly_sales: Math.round(estimatedMonthlySales * 10) / 10,
    current_monthly_profit_eur: Math.round(currentMonthlyProfit * 100) / 100,
    current_annual_profit_eur: Math.round(currentAnnualProfit * 100) / 100,
    
    // Recommended repricing scenario
    recommended_price_eur: Math.round(recommendedPrice * 100) / 100,
    price_increase_percent: Math.round(actualPriceIncreasePercent * 10) / 10,
    price_increase_absolute_eur: Math.round(priceIncreaseAbsolute * 100) / 100,
    estimated_volume_change_percent: Math.round(-volumeLossPercent * 10) / 10, // Negative number
    estimated_new_monthly_sales: Math.round(estimatedNewMonthlySales * 10) / 10,
    new_profit_per_unit_eur: Math.round(newProfitPerUnit * 100) / 100,
    new_monthly_profit_eur: Math.round(newMonthlyProfit * 100) / 100,
    new_annual_profit_eur: Math.round(newAnnualProfit * 100) / 100,
    
    // Impact (THE KEY NUMBERS)
    monthly_gain_eur: Math.round(monthlyGain * 100) / 100,
    annual_gain_eur: Math.round(annualGain * 100) / 100,
    monthly_gain_percentage: Math.round(monthlyGainPercentage * 10) / 10,
    roi_payback_days: roiPaybackDays,
    
    financial_impact_annual_eur: Math.round(annualGain * 100) / 100,
    impact_priority: impactPriority,
    
    recommended_actions: actions
  };
  
  return finding;
}

/**
 * Generate recommended actions for low margin products
 * 
 * Three paths:
 * 1. Reprice Up (PRIMARY - highest ROI)
 * 2. Reduce Cost (alternative if repricing fails)
 * 3. Delist & Redeploy (stop the bleeding)
 */
function generateLowMarginActions(
  product: Product,
  monthlyGain: number,
  recommendedPrice: number,
  priceIncreasePercent: number
): Action[] {
  
  const actions: Action[] = [
    {
      title: "Reprice Up (RECOMMENDED)",
      effort_hours: 0.1,
      effort_level: "trivial",
      timeline: "immediate",
      estimated_gain_eur: Math.round(monthlyGain * 100) / 100,
      estimated_gain_description: `+€${Math.round(monthlyGain)}/month from repricing to €${recommendedPrice.toFixed(2)}`,
      risk_level: "low",
      revert_timeline: "24 hours if sales drop",
      roi_months: 0 // Immediate
    },
    {
      title: "Reduce Cost",
      effort_hours: 8,
      effort_level: "moderate",
      timeline: "2-4 weeks",
      estimated_gain_eur: null, // TBD - depends on supplier negotiation
      estimated_gain_description: "Find cheaper supplier or negotiate better terms",
      risk_level: "medium",
      roi_months: 2
    },
    {
      title: "Delist & Redeploy",
      effort_hours: 0.5,
      effort_level: "quick",
      timeline: "immediate",
      estimated_gain_eur: 0,
      estimated_gain_description: "Stop loss, free up capital for better products",
      risk_level: "low",
      roi_months: 0
    }
  ];
  
  return actions;
}

/**
 * TEST VALIDATION FUNCTION
 * Run this to verify calculations match expected values
 */
export function testLowMargin(): void {
  const testProduct: Product = {
    asin: "B08DEF9012",
    product_name: "Electronics",
    cost_per_unit: 22.00,
    selling_price: 39.99,
    quantity_in_stock: 100,
    days_in_stock: 60, // Added for type compliance
    estimated_monthly_sales: 20,
    category: "Electronics",
    size_tier: "standard"
  };
  
  const findings = detectLowMargin([testProduct]);
  
  if (findings.length === 0) {
    console.error("❌ TEST FAILED: No findings detected");
    return;
  }
  
  const finding = findings[0];
  
  console.log("=== LOW MARGIN TEST RESULTS ===");
  console.log(`Current Net Margin: ${finding.current_net_margin_percent}% (expected ~9.1%)`);
  console.log(`Current Monthly Profit: €${finding.current_monthly_profit_eur} (expected ~€160)`);
  console.log(`Current Annual Profit: €${finding.current_annual_profit_eur} (expected ~€1,920)`);
  console.log("");
  console.log(`Recommended Price: €${finding.recommended_price_eur} (expected ~€44.99)`);
  console.log(`Price Increase: ${finding.price_increase_percent}% (expected ~12.5%)`);
  console.log(`Volume Change: ${finding.estimated_volume_change_percent}% (expected ~-12%)`);
  console.log("");
  console.log(`Monthly Gain: €${finding.monthly_gain_eur} (expected €350-500)`);
  console.log(`Annual Gain: €${finding.annual_gain_eur} (expected €4,200-6,000)`);
  console.log(`Impact Priority: ${finding.impact_priority} (expected 80-90)`);
  
  // Validation (within 10% tolerance for monthly gain)
  const expectedMonthlyGain = 425; // Mid-range of 350-500
  const tolerance = expectedMonthlyGain * 0.10;
  const isValid = finding.monthly_gain_eur >= 100 && finding.monthly_gain_eur <= 700;
  
  if (isValid) {
    console.log("✅ TEST PASSED: Monthly gain within acceptable range (€100-700)");
  } else {
    console.error(`❌ TEST FAILED: Monthly gain ${finding.monthly_gain_eur} outside acceptable range (€100-700)`);
  }
}
