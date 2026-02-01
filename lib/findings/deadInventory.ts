/**
 * DEAD INVENTORY DETECTION ENGINE
 * 
 * Identifies products that are bleeding money through:
 * 1. Capital tied up in slow-moving inventory
 * 2. Monthly storage fees accumulating
 * 3. Opportunity cost of capital not deployed elsewhere
 * 
 * TRIGGER CRITERIA:
 * - Days in stock > 180 days (6+ months old)
 * - Net margin < 15% (low profitability)
 * 
 * Both conditions must be true to flag as dead inventory.
 */

import type { Product, DeadInventoryFinding, Action } from './types';
import { 
  FBA_RATES_2024, 
  calculateNetMargin, 
  calculateNetProfit,
  getFulfillmentFee,
  calculatePriority,
  isValidProduct
} from './utils';

/**
 * Detect dead inventory across product portfolio
 * 
 * @param products - Array of products to analyze
 * @returns Array of dead inventory findings
 * 
 * @example
 * const findings = detectDeadInventory(products);
 * findings.forEach(f => console.log(f.problem_headline));
 */
export function detectDeadInventory(products: Product[]): DeadInventoryFinding[] {
  const findings: DeadInventoryFinding[] = [];
  
  for (const product of products) {
    // Validate product data
    if (!isValidProduct(product)) {
      continue;
    }
    
    // Skip if quantity is 0 (no inventory to analyze)
    if (product.quantity_in_stock <= 0) {
      continue;
    }
    
    // Get days in stock (required for this finding type)
    const daysInStock = product.days_in_stock;
    
    // Skip if days_in_stock is missing or invalid
    if (typeof daysInStock !== 'number' || daysInStock < 0) {
      continue;
    }
    
    // TRIGGER CHECK 1: Days in stock must be > 180
    if (daysInStock <= 180) {
      continue; // Too young, not dead inventory
    }
    
    // Calculate net margin
    const fulfillmentFee = getFulfillmentFee(product.size_tier);
    const netMarginPercent = calculateNetMargin(
      product.selling_price,
      product.cost_per_unit,
      FBA_RATES_2024.referral_fee_percent,
      fulfillmentFee
    );
    
    // TRIGGER CHECK 2: Net margin must be < 15%
    if (netMarginPercent >= 15) {
      continue; // Margin is acceptable, not dead inventory
    }
    
    // Both triggers met - this is dead inventory
    // Now calculate the financial impact
    
    const finding = calculateDeadInventoryImpact(product, netMarginPercent, daysInStock);
    findings.push(finding);
  }
  
  // Sort by financial impact (highest first)
  findings.sort((a, b) => b.total_annual_cost_eur - a.total_annual_cost_eur);
  
  return findings;
}

/**
 * Calculate detailed financial impact of dead inventory
 * 
 * This is where the money math happens. Every calculation is documented.
 */
function calculateDeadInventoryImpact(
  product: Product,
  netMarginPercent: number,
  daysInStock: number
): DeadInventoryFinding {
  
  // ============================================
  // STEP 1: Calculate Capital Trapped
  // ============================================
  // This is the money you have locked up in inventory
  // Formula: quantity × cost_per_unit
  const capitalTiedUp = product.quantity_in_stock * product.cost_per_unit;
  
  // ============================================
  // STEP 2: Calculate Monthly Storage Cost
  // ============================================
  // Amazon charges €0.87/unit/month for standard size (Q1-Sept 2024)
  // Formula: quantity × storage_fee_monthly
  const monthlyStorageCost = product.quantity_in_stock * FBA_RATES_2024.storage_fee_monthly;
  
  // Annual storage cost
  const annualStorageCost = monthlyStorageCost * 12;
  
  // ============================================
  // STEP 3: Calculate Opportunity Cost
  // ============================================
  // This is the ROI you LOSE by having capital stuck in dead inventory
  // Assumption: 20% annual ROI is achievable with capital deployed elsewhere
  // Formula: capital_tied_up × 20%
  const annualOpportunityCost = capitalTiedUp * (FBA_RATES_2024.market_return_assumption_percent / 100);
  
  // ============================================
  // STEP 4: Calculate Total Annual Bleeding
  // ============================================
  // This is THE KEY NUMBER sellers see
  // Formula: annual_storage + annual_opportunity_cost
  const totalAnnualCost = annualStorageCost + annualOpportunityCost;
  
  // Monthly bleed (for easier comprehension)
  const monthlyBleed = totalAnnualCost / 12;
  
  // ============================================
  // STEP 5: Calculate Impact Priority
  // ============================================
  // Higher cost = higher priority
  const impactPriority = calculatePriority(totalAnnualCost, "critical");
  
  // ============================================
  // STEP 6: Generate Recommended Actions
  // ============================================
  const actions = generateDeadInventoryActions(product, capitalTiedUp, monthlyBleed);
  
  // ============================================
  // STEP 7: Build Finding Object
  // ============================================
  const finding: DeadInventoryFinding = {
    finding_type: "dead_inventory",
    severity: "critical",
    asin: product.asin,
    product_name: product.product_name,
    
    // Problem statement (what sellers see first)
    problem_headline: `€${Math.round(totalAnnualCost)}/year bleeding in storage + lost ROI`,
    problem_description: `${daysInStock} days in stock, ${netMarginPercent.toFixed(1)}% margin`,
    
    // Financial metrics (exact calculations)
    days_in_stock: daysInStock,
    net_margin_percent: netMarginPercent,
    capital_tied_up_eur: Math.round(capitalTiedUp * 100) / 100,
    monthly_storage_cost_eur: Math.round(monthlyStorageCost * 100) / 100,
    annual_storage_cost_eur: Math.round(annualStorageCost * 100) / 100,
    annual_opportunity_cost_eur: Math.round(annualOpportunityCost * 100) / 100,
    total_annual_cost_eur: Math.round(totalAnnualCost * 100) / 100,
    monthly_bleed_eur: Math.round(monthlyBleed * 100) / 100,
    
    // For sorting/prioritization
    financial_impact_annual_eur: Math.round(totalAnnualCost * 100) / 100,
    impact_priority: impactPriority,
    
    // Recommended actions
    recommended_actions: actions
  };
  
  return finding;
}

/**
 * Generate recommended actions for dead inventory
 * 
 * Three paths:
 * 1. Liquidate (fastest capital recovery)
 * 2. Discount 30% (balance recovery and loss)
 * 3. Bundle with winner (creative solution)
 */
function generateDeadInventoryActions(
  product: Product,
  capitalTiedUp: number,
  monthlyBleed: number
): Action[] {
  
  const actions: Action[] = [
    {
      title: "Liquidate",
      effort_hours: 2,
      effort_level: "quick",
      timeline: "this week",
      // Assume liquidation at 60% of cost (conservative)
      estimated_gain_eur: Math.round(capitalTiedUp * 0.6 * 100) / 100,
      estimated_gain_description: "Capital freed immediately (60% recovery)",
      roi_months: 0, // Immediate
      risk_level: "low"
    },
    {
      title: "Discount 30%",
      effort_hours: 0.1,
      effort_level: "trivial",
      timeline: "30-60 days",
      // Assume 75% capital recovery after 30% discount
      estimated_gain_eur: Math.round(capitalTiedUp * 0.75 * 100) / 100,
      estimated_gain_description: "Money recovered after discount (75% recovery)",
      roi_months: 2,
      risk_level: "low"
    },
    {
      title: "Bundle with winner",
      effort_hours: 3,
      effort_level: "moderate",
      timeline: "ongoing",
      estimated_gain_eur: null, // TBD - depends on bundle success
      estimated_gain_description: "TBD - depends on bundle success",
      roi_months: null,
      risk_level: "medium"
    }
  ];
  
  return actions;
}

/**
 * TEST VALIDATION FUNCTION
 * Run this to verify calculations match expected values
 */
export function testDeadInventory(): void {
  const testProduct: Product = {
    asin: "B08ABC5678",
    product_name: "Home & Kitchen Item",
    cost_per_unit: 22.00,  // Higher cost = lower margin (triggers <15%)
    selling_price: 29.99,
    quantity_in_stock: 150,
    days_in_stock: 426,
    category: "Home & Kitchen",
    size_tier: "standard"
  };
  
  const findings = detectDeadInventory([testProduct]);
  
  if (findings.length === 0) {
    console.error("❌ TEST FAILED: No findings detected");
    console.error("Product should trigger: 426 days (>180) AND margin should be <15%");
    return;
  }
  
  const finding = findings[0];
  
  console.log("=== DEAD INVENTORY TEST RESULTS ===");
  console.log(`Net Margin: ${finding.net_margin_percent}% (expected 3.3%)`);
  console.log(`Capital Tied Up: €${finding.capital_tied_up_eur} (expected €3,300)`);
  console.log(`Monthly Storage: €${finding.monthly_storage_cost_eur} (expected €130.50)`);
  console.log(`Annual Storage: €${finding.annual_storage_cost_eur} (expected €1,566)`);
  console.log(`Annual Opportunity Cost: €${finding.annual_opportunity_cost_eur} (expected €660)`);
  console.log(`Total Annual Cost: €${finding.total_annual_cost_eur} (expected €2,226)`);
  console.log(`Monthly Bleed: €${finding.monthly_bleed_eur} (expected €185.50)`);
  console.log(`Impact Priority: ${finding.impact_priority} (expected 85-95)`);
  
  // Validation (within 5% tolerance)
  const expectedTotal = 2226;
  const tolerance = expectedTotal * 0.05;
  const isValid = Math.abs(finding.total_annual_cost_eur - expectedTotal) <= tolerance;
  
  // Additional validations
  const marginValid = Math.abs(finding.net_margin_percent - 3.3) <= 0.2;
  const capitalValid = finding.capital_tied_up_eur === 3300.00;
  const storageValid = finding.annual_storage_cost_eur === 1566.00;
  const opportunityValid = finding.annual_opportunity_cost_eur === 660.00;
  
  console.log("");
  console.log("=== VALIDATION CHECKS ===");
  console.log(`✓ Net Margin: ${marginValid ? '✅ PASS' : '❌ FAIL'} (${finding.net_margin_percent}% vs 3.3%)`);
  console.log(`✓ Capital Tied Up: ${capitalValid ? '✅ PASS' : '❌ FAIL'} (€${finding.capital_tied_up_eur} vs €3,300)`);
  console.log(`✓ Annual Storage: ${storageValid ? '✅ PASS' : '❌ FAIL'} (€${finding.annual_storage_cost_eur} vs €1,566)`);
  console.log(`✓ Opportunity Cost: ${opportunityValid ? '✅ PASS' : '❌ FAIL'} (€${finding.annual_opportunity_cost_eur} vs €660)`);
  console.log(`✓ Total Annual Cost: ${isValid ? '✅ PASS' : '❌ FAIL'} (€${finding.total_annual_cost_eur} vs €2,226 ±5%)`);
  
  if (isValid && marginValid && capitalValid && storageValid && opportunityValid) {
    console.log("");
    console.log("✅ ALL TESTS PASSED: Dead Inventory detection is accurate");
  } else {
    console.error("");
    console.error("❌ SOME TESTS FAILED: Review calculations above");
  }
}
