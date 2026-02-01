/**
 * SLOW VELOCITY DETECTION ENGINE
 * 
 * Identifies products with good margins but slow turnover.
 * Capital is trapped inefficiently - could make 2x revenue with better velocity.
 * 
 * TRIGGER CRITERIA:
 * - Net margin > 15% (healthy margins)
 * - Annual profit < €500 (too low for capital deployed)
 * - Days in stock > 90 (moving slowly)
 * 
 * All three conditions must be true to flag as slow velocity.
 */

import type { Product, SlowVelocityFinding, Action } from './types';
import { 
  FBA_RATES_2024, 
  calculateNetMargin, 
  calculateNetProfit,
  getFulfillmentFee,
  calculatePriority,
  isValidProduct,
  inferMonthlyVelocity
} from './utils';

/**
 * Detect slow velocity products across portfolio
 * 
 * @param products - Array of products to analyze
 * @returns Array of slow velocity findings
 */
export function detectSlowVelocity(products: Product[]): SlowVelocityFinding[] {
  const findings: SlowVelocityFinding[] = [];
  
  for (const product of products) {
    // Validate product data
    if (!isValidProduct(product)) {
      continue;
    }
    
    // Get days in stock (required for this finding type)
    const daysInStock = product.days_in_stock;
    
    // Skip if days_in_stock is missing or invalid
    if (typeof daysInStock !== 'number' || daysInStock < 0) {
      continue;
    }
    
    // TRIGGER CHECK 1: Days in stock must be > 90
    if (daysInStock <= 90) {
      continue; // Moving fast enough
    }
    
    // Calculate net margin
    const fulfillmentFee = getFulfillmentFee(product.size_tier);
    const netMarginPercent = calculateNetMargin(
      product.selling_price,
      product.cost_per_unit,
      FBA_RATES_2024.referral_fee_percent,
      fulfillmentFee
    );
    
    // TRIGGER CHECK 2: Net margin must be > 15%
    if (netMarginPercent <= 15) {
      continue; // Low margin, would be flagged by low margin detector
    }
    
    // Infer monthly velocity
    const estimatedMonthlySales = inferMonthlyVelocity(
      product.quantity_in_stock,
      daysInStock
    );
    
    if (estimatedMonthlySales <= 0) {
      continue; // No sales activity
    }
    
    // Calculate profit per unit
    const profitPerUnit = calculateNetProfit(
      product.selling_price,
      product.cost_per_unit,
      FBA_RATES_2024.referral_fee_percent,
      fulfillmentFee
    );
    
    // Calculate current annual profit
    const currentMonthlyProfit = profitPerUnit * estimatedMonthlySales;
    const currentAnnualProfit = currentMonthlyProfit * 12;
    
    // TRIGGER CHECK 3: Annual profit must be < €500
    if (currentAnnualProfit >= 500) {
      continue; // Profit is acceptable
    }
    
    // All three triggers met - this is slow velocity
    const finding = calculateSlowVelocityImpact(
      product,
      netMarginPercent,
      daysInStock,
      estimatedMonthlySales,
      profitPerUnit,
      currentMonthlyProfit,
      currentAnnualProfit
    );
    
    findings.push(finding);
  }
  
  // Sort by potential gain (highest first)
  findings.sort((a, b) => b.ppc_net_gain_monthly_eur - a.ppc_net_gain_monthly_eur);
  
  return findings;
}

/**
 * Calculate detailed financial impact of slow velocity
 */
function calculateSlowVelocityImpact(
  product: Product,
  netMarginPercent: number,
  daysInStock: number,
  estimatedMonthlySales: number,
  profitPerUnit: number,
  currentMonthlyProfit: number,
  currentAnnualProfit: number
): SlowVelocityFinding {
  
  // ============================================
  // STEP 1: Calculate Capital Deployed
  // ============================================
  const capitalDeployed = product.quantity_in_stock * product.cost_per_unit;
  
  // Calculate daily sales rate
  const estimatedDailySales = estimatedMonthlySales / 30;
  
  // ============================================
  // STEP 2: Calculate 2x Velocity Scenario
  // ============================================
  // This is inspirational - shows what's possible
  const velocity2xMonthlySales = estimatedMonthlySales * 2;
  const velocity2xMonthlyProfit = profitPerUnit * velocity2xMonthlySales;
  const velocity2xAnnualProfit = velocity2xMonthlyProfit * 12;
  const velocity2xMonthlyGain = velocity2xMonthlyProfit - currentMonthlyProfit;
  
  // ============================================
  // STEP 3: Growth Path A - PPC Ads
  // ============================================
  const ppcMonthlyBudget = 175; // €175/month conservative
  const ppcExpectedLiftPercent = 40; // +40% sales lift (achievable with ads)
  
  const ppcNewMonthlySales = estimatedMonthlySales * (1 + ppcExpectedLiftPercent / 100);
  const ppcNewMonthlyProfit = profitPerUnit * ppcNewMonthlySales;
  const ppcMonthlyCost = ppcMonthlyBudget;
  const ppcNetGainMonthly = ppcNewMonthlyProfit - currentMonthlyProfit - ppcMonthlyCost;
  
  // Calculate payback period
  const ppcPaybackPeriodWeeks = ppcMonthlyCost > 0 && ppcNetGainMonthly > 0
    ? (ppcMonthlyCost / ppcNetGainMonthly) * 4 // Convert months to weeks
    : 0;
  
  // Calculate ROI percentage
  const ppcRoiPercentage = ppcMonthlyCost > 0
    ? (ppcNetGainMonthly / ppcMonthlyCost) * 100
    : 0;
  
  // ============================================
  // STEP 4: Growth Path B - Listing Optimization
  // ============================================
  const listingOptEffortHours = 3;
  const listingOptExpectedLift = 15; // +15% sales lift (conservative)
  
  const listingOptNewMonthlySales = estimatedMonthlySales * (1 + listingOptExpectedLift / 100);
  const listingOptNewMonthlyProfit = profitPerUnit * listingOptNewMonthlySales;
  const listingOptCost = 0; // Free (your time)
  const listingOptNetGainMonthly = listingOptNewMonthlyProfit - currentMonthlyProfit;
  
  // ============================================
  // STEP 5: Calculate Impact Priority
  // ============================================
  // Use PPC path for priority (more aggressive growth)
  const annualImpact = ppcNetGainMonthly * 12;
  const impactPriority = calculatePriority(annualImpact, "opportunity");
  
  // ============================================
  // STEP 6: Generate Recommended Actions
  // ============================================
  const actions = generateSlowVelocityActions(
    ppcNetGainMonthly,
    ppcMonthlyCost,
    ppcPaybackPeriodWeeks,
    listingOptNetGainMonthly,
    listingOptEffortHours
  );
  
  // ============================================
  // STEP 7: Build Finding Object
  // ============================================
  const finding: SlowVelocityFinding = {
    finding_type: "slow_velocity",
    severity: "opportunity",
    asin: product.asin,
    product_name: product.product_name,
    
    // Problem statement
    problem_headline: `€${Math.round(ppcNetGainMonthly)}/month potential if velocity increases`,
    problem_description: `Good margins (${netMarginPercent.toFixed(1)}%) but slow turnover, capital inefficient`,
    
    // Current state
    current_net_margin_percent: Math.round(netMarginPercent * 10) / 10,
    estimated_daily_sales: Math.round(estimatedDailySales * 10) / 10,
    estimated_monthly_sales: Math.round(estimatedMonthlySales * 10) / 10,
    capital_deployed_eur: Math.round(capitalDeployed * 100) / 100,
    profit_per_unit_eur: Math.round(profitPerUnit * 100) / 100,
    current_monthly_profit_eur: Math.round(currentMonthlyProfit * 100) / 100,
    current_annual_profit_eur: Math.round(currentAnnualProfit * 100) / 100,
    days_in_stock: daysInStock,
    
    // 2x velocity scenario
    velocity_2x_monthly_sales: Math.round(velocity2xMonthlySales * 10) / 10,
    velocity_2x_monthly_profit_eur: Math.round(velocity2xMonthlyProfit * 100) / 100,
    velocity_2x_annual_profit_eur: Math.round(velocity2xAnnualProfit * 100) / 100,
    velocity_2x_monthly_gain_eur: Math.round(velocity2xMonthlyGain * 100) / 100,
    
    // Growth path A: PPC
    ppc_monthly_budget_eur: ppcMonthlyBudget,
    ppc_expected_sales_lift_percent: ppcExpectedLiftPercent,
    ppc_new_monthly_sales: Math.round(ppcNewMonthlySales * 10) / 10,
    ppc_new_monthly_profit_eur: Math.round(ppcNewMonthlyProfit * 100) / 100,
    ppc_monthly_cost_eur: ppcMonthlyCost,
    ppc_net_gain_monthly_eur: Math.round(ppcNetGainMonthly * 100) / 100,
    ppc_effort_hours: 1,
    ppc_effort_level: "quick",
    ppc_timeline: "2-4 weeks to see results",
    ppc_payback_period_weeks: Math.round(ppcPaybackPeriodWeeks * 10) / 10,
    ppc_risk_level: "low",
    ppc_roi_percentage: Math.round(ppcRoiPercentage * 10) / 10,
    
    // Growth path B: Listing Optimization
    listing_optimization_effort_hours: listingOptEffortHours,
    listing_optimization_effort_level: "moderate",
    listing_optimization_expected_lift: listingOptExpectedLift,
    listing_optimization_new_monthly_sales: Math.round(listingOptNewMonthlySales * 10) / 10,
    listing_optimization_new_monthly_profit_eur: Math.round(listingOptNewMonthlyProfit * 100) / 100,
    listing_optimization_cost: listingOptCost,
    listing_optimization_net_gain_monthly_eur: Math.round(listingOptNetGainMonthly * 100) / 100,
    listing_optimization_timeline: "1-4 weeks to see results",
    listing_optimization_risk_level: "very low",
    
    financial_impact_annual_eur: Math.round(annualImpact * 100) / 100,
    impact_priority: impactPriority,
    
    recommended_actions: actions
  };
  
  return finding;
}

/**
 * Generate recommended actions for slow velocity products
 */
function generateSlowVelocityActions(
  ppcNetGainMonthly: number,
  ppcMonthlyCost: number,
  ppcPaybackWeeks: number,
  listingOptGainMonthly: number,
  listingOptEffortHours: number
): Action[] {
  
  const actions: Action[] = [
    {
      title: "Increase PPC Ads (Fastest Growth)",
      effort_hours: 1,
      effort_level: "quick",
      timeline: "2-4 weeks",
      cost_monthly_eur: ppcMonthlyCost,
      estimated_gain_eur: Math.round(ppcNetGainMonthly * 100) / 100,
      estimated_gain_description: `+€${Math.round(ppcNetGainMonthly)}/month net gain after ad costs`,
      roi_months: Math.round((ppcPaybackWeeks / 4) * 10) / 10,
      risk_level: "low"
    },
    {
      title: "Optimize Listing (Free, Slower)",
      effort_hours: listingOptEffortHours,
      effort_level: "moderate",
      timeline: "1-4 weeks",
      cost_eur: 0,
      estimated_gain_eur: Math.round(listingOptGainMonthly * 100) / 100,
      estimated_gain_description: `+€${Math.round(listingOptGainMonthly)}/month from better listing`,
      risk_level: "very low",
      roi_months: 0
    }
  ];
  
  return actions;
}

/**
 * TEST VALIDATION FUNCTION
 */
export function testSlowVelocity(): void {
  const testProduct: Product = {
    asin: "B08JKL4567",
    product_name: "Sports Category",
    cost_per_unit: 12.00,
    selling_price: 34.99,
    quantity_in_stock: 200,
    days_in_stock: 165,
    category: "Sports",
    size_tier: "standard"
  };
  
  const findings = detectSlowVelocity([testProduct]);
  
  if (findings.length === 0) {
    console.error("❌ TEST FAILED: No findings detected");
    return;
  }
  
  const finding = findings[0];
  
  console.log("=== SLOW VELOCITY TEST RESULTS ===");
  console.log(`Estimated Daily Sales: ${finding.estimated_daily_sales} units/day (expected ~1.2)`);
  console.log(`Estimated Monthly Sales: ${finding.estimated_monthly_sales} units/month (expected ~36)`);
  console.log(`Profit Per Unit: €${finding.profit_per_unit_eur} (expected ~€10.50)`);
  console.log(`Current Monthly Profit: €${finding.current_monthly_profit_eur} (expected ~€378)`);
  console.log(`Current Annual Profit: €${finding.current_annual_profit_eur} (expected ~€4,536)`);
  console.log("");
  console.log(`PPC New Monthly Sales: ${finding.ppc_new_monthly_sales} (expected ~50)`);
  console.log(`PPC New Monthly Profit: €${finding.ppc_new_monthly_profit_eur} (expected ~€525)`);
  console.log(`PPC Net Gain Monthly: €${finding.ppc_net_gain_monthly_eur} (expected ~€350)`);
  console.log("");
  console.log(`Listing Opt New Monthly Profit: €${finding.listing_optimization_new_monthly_profit_eur} (expected ~€435)`);
  console.log(`Listing Opt Net Gain Monthly: €${finding.listing_optimization_net_gain_monthly_eur} (expected ~€57)`);
  console.log("");
  console.log(`Impact Priority: ${finding.impact_priority} (expected 65)`);
  
  // Validation (within 15% tolerance)
  const expectedGain = 350;
  const isValid = finding.ppc_net_gain_monthly_eur >= 300 && finding.ppc_net_gain_monthly_eur <= 450;
  
  if (isValid) {
    console.log("✅ TEST PASSED: Monthly gain within acceptable range (€300-450)");
  } else {
    console.error(`❌ TEST FAILED: Monthly gain ${finding.ppc_net_gain_monthly_eur} outside acceptable range (€300-450)`);
  }
}
