// src/utils/bulkCalculations.ts

import { UploadRow, BulkProductResult, RiskLevel } from '../types/upload';

/**
 * Calculate all metrics for an array of products
 * Main engine that transforms raw input into actionable insights
 * 
 * @param rows - Array of raw product data from upload
 * @returns Array of fully calculated product results with all metrics
 */
export function calculateBulkProducts(rows: UploadRow[]): BulkProductResult[] {
  return rows.map((row) => calculateSingleProduct(row));
}

/**
 * Calculate all metrics for a single product
 * Pure function - same input always produces same output
 * 
 * @param row - Single raw product data
 * @returns Fully calculated product result
 */
function calculateSingleProduct(row: UploadRow): BulkProductResult {
  // ============================================
  // 1. FINANCIAL METRICS
  // ============================================
  
  // Revenue after accounting for returns
  const revenueAfterReturns = row.price * (1 - row.returnRate / 100);
  
  // Calculate all fees as absolute EUR amounts
  const referralFee = row.price * (row.referralFee / 100);
  const fbaFee = row.price * (row.fbaFee / 100);
  const vat = row.price * (row.vat / 100);
  
  // Net profit per unit sold (EUR)
  const profitPerUnit = 
    revenueAfterReturns - row.cogs - referralFee - fbaFee - vat - row.shippingCost;
  
  // Profit margin as percentage (0-100)
  const profitMargin = (profitPerUnit / row.price) * 100;
  
  // Total monthly profit based on velocity
  const totalMonthlyProfit = profitPerUnit * row.velocity;

  // ============================================
  // 2. TIMING METRICS
  // ============================================
  
  // Initial inventory investment with 2% buffer for fees
  const initialInventoryCost = row.cogs * row.initialOrder * 1.02;
  
  // Days to break even on initial inventory investment
  // Return 999 (not Infinity) for zero velocity case
  const breakEvenDays = 
    row.velocity > 0 
      ? (initialInventoryCost / (profitPerUnit * row.velocity)) * 30 
      : 999;

  // Simulate 12-month cash flow to determine runway
  const cashRunway = calculateCashRunway(
    row.initialCash,
    initialInventoryCost,
    profitPerUnit,
    row.velocity,
    row.cogs
  );

  // Days to sell through initial inventory at current velocity
  const turnoverDays = 
    row.velocity > 0 
      ? (row.initialOrder / row.velocity) * 30 
      : 999;

  // ============================================
  // 3. HEALTH SCORE (0-100)
  // ============================================
  
  const healthScore = calculateHealthScore(
    profitMargin,
    breakEvenDays,
    cashRunway,
    row.competitorCount,
    turnoverDays
  );

  // ============================================
  // 4. RISK LEVELS (traffic light system)
  // ============================================
  
  const profitabilityRisk = assessProfitabilityRisk(profitMargin);
  const breakEvenRisk = assessBreakEvenRisk(breakEvenDays);
  const cashFlowRisk = assessCashFlowRisk(cashRunway);
  const competitionRisk = assessCompetitionRisk(row.competitorCount);
  const inventoryRisk = assessInventoryRisk(turnoverDays);

  // ============================================
  // 5. RETURN CALCULATED RESULT
  // ============================================
  
  return {
    ...row, // Spread all input fields
    // Financial metrics
    profitPerUnit: roundToTwoDecimals(profitPerUnit),
    profitMargin: roundToTwoDecimals(profitMargin),
    totalMonthlyProfit: roundToTwoDecimals(totalMonthlyProfit),
    // Timing metrics
    breakEvenDays: roundToTwoDecimals(breakEvenDays),
    cashRunway,
    turnoverDays: roundToTwoDecimals(turnoverDays),
    // Health & risk metrics
    healthScore,
    profitabilityRisk,
    breakEvenRisk,
    cashFlowRisk,
    competitionRisk,
    inventoryRisk,
  };
}

/**
 * Simulate 12-month cash flow to determine how many months of sustainable operation
 * 
 * Algorithm:
 * - Month 0: Deduct initial inventory cost from starting cash
 * - Each month 1-12: Add profit, subtract reorder costs (with 20% safety stock)
 * - Return the month when cash runs out, or 12 if it lasts all year
 * 
 * @param initialCash - Starting cash available (EUR)
 * @param initialInventoryCost - Cost of initial inventory order (EUR)
 * @param profitPerUnit - Net profit per unit sold (EUR)
 * @param velocity - Monthly sales velocity (units)
 * @param cogs - Cost of goods sold per unit (EUR)
 * @returns Number of months business can sustain (0-12)
 */
function calculateCashRunway(
  initialCash: number,
  initialInventoryCost: number,
  profitPerUnit: number,
  velocity: number,
  cogs: number
): number {
  // Start with cash after initial inventory purchase
  let cashPosition = initialCash - initialInventoryCost;
  
  // Can't afford initial inventory
  if (cashPosition <= 0) {
    return 0;
  }

  // Simulate 12 months of operation
  for (let month = 1; month <= 12; month++) {
    // Monthly cash inflow from sales
    const inflow = profitPerUnit * velocity;
    
    // Monthly reorder cost with 20% safety stock
    const monthlyReorderCost = velocity * 1.2 * cogs;
    const outflow = monthlyReorderCost;

    // Update cash position
    cashPosition += inflow - outflow;

    // Check if we ran out of cash
    if (cashPosition < 0) {
      return month - 1; // Return previous month (last sustainable month)
    }
  }

  // Made it through all 12 months
  return 12;
}

/**
 * Calculate overall product health score (0-100)
 * Weighted average of 5 component scores
 * 
 * Weights:
 * - Profitability: 25%
 * - Break-even speed: 25%
 * - Cash flow sustainability: 25%
 * - Competition level: 15%
 * - Inventory turnover: 10%
 * 
 * @returns Integer score 0-100
 */
function calculateHealthScore(
  profitMargin: number,
  breakEvenDays: number,
  cashRunway: number,
  competitorCount: number,
  turnoverDays: number
): number {
  // Component 1: Profitability Score (25% weight)
  let profitabilityScore = 0;
  if (profitMargin >= 30) profitabilityScore = 100;
  else if (profitMargin >= 20) profitabilityScore = 75;
  else if (profitMargin >= 10) profitabilityScore = 50;
  else if (profitMargin >= 5) profitabilityScore = 25;
  else profitabilityScore = 0;

  // Component 2: Break-Even Score (25% weight)
  let breakEvenScore = 0;
  if (breakEvenDays < 14) breakEvenScore = 100;
  else if (breakEvenDays < 30) breakEvenScore = 75;
  else if (breakEvenDays < 60) breakEvenScore = 50;
  else if (breakEvenDays < 90) breakEvenScore = 25;
  else breakEvenScore = 0;

  // Component 3: Cash Flow Score (25% weight)
  let cashFlowScore = 0;
  if (cashRunway > 6) cashFlowScore = 100;
  else if (cashRunway > 3) cashFlowScore = 75;
  else if (cashRunway > 1) cashFlowScore = 50;
  else if (cashRunway > 0) cashFlowScore = 25;
  else cashFlowScore = 0;

  // Component 4: Competition Score (15% weight)
  let competitionScore = 0;
  if (competitorCount <= 5) competitionScore = 100;
  else if (competitorCount <= 10) competitionScore = 75;
  else if (competitorCount <= 20) competitionScore = 50;
  else if (competitorCount <= 30) competitionScore = 25;
  else competitionScore = 0;

  // Component 5: Inventory Score (10% weight)
  let inventoryScore = 0;
  if (turnoverDays <= 21) inventoryScore = 100;
  else if (turnoverDays <= 45) inventoryScore = 75;
  else if (turnoverDays <= 60) inventoryScore = 50;
  else if (turnoverDays <= 90) inventoryScore = 25;
  else inventoryScore = 0;

  // Calculate weighted average
  const healthScore =
    profitabilityScore * 0.25 +
    breakEvenScore * 0.25 +
    cashFlowScore * 0.25 +
    competitionScore * 0.15 +
    inventoryScore * 0.1;

  // Return as integer (0-100)
  return Math.round(healthScore);
}

/**
 * Assess profitability risk based on profit margin
 * 
 * Thresholds:
 * - Green: > 20% margin (healthy profit)
 * - Yellow: > 10% margin (acceptable profit)
 * - Red: <= 10% margin (low profit, risky)
 */
function assessProfitabilityRisk(profitMargin: number): RiskLevel {
  if (profitMargin > 20) return 'green';
  if (profitMargin > 10) return 'yellow';
  return 'red';
}

/**
 * Assess break-even risk based on days to recoup investment
 * 
 * Thresholds:
 * - Green: < 14 days (quick payback)
 * - Yellow: < 30 days (moderate payback)
 * - Red: >= 30 days (slow payback, risky)
 */
function assessBreakEvenRisk(breakEvenDays: number): RiskLevel {
  if (breakEvenDays < 14) return 'green';
  if (breakEvenDays < 30) return 'yellow';
  return 'red';
}

/**
 * Assess cash flow risk based on months of runway
 * 
 * Thresholds:
 * - Green: >= 6 months (6+ months sustainable)
 * - Yellow: >= 3 months (3-6 months sustainable)
 * - Red: < 3 months (less than 3 months, risky)
 */
function assessCashFlowRisk(cashRunway: number): RiskLevel {
  if (cashRunway >= 6) return 'green';
  if (cashRunway >= 3) return 'yellow';
  return 'red';
}

/**
 * Assess competition risk based on competitor count
 * 
 * Thresholds:
 * - Green: <= 5 competitors (low competition)
 * - Yellow: <= 15 competitors (moderate competition)
 * - Red: > 15 competitors (high competition, risky)
 */
function assessCompetitionRisk(competitorCount: number): RiskLevel {
  if (competitorCount <= 5) return 'green';
  if (competitorCount <= 15) return 'yellow';
  return 'red';
}

/**
 * Assess inventory risk based on turnover days
 * 
 * Thresholds:
 * - Green: < 21 days (fast turnover, low risk)
 * - Yellow: < 45 days (moderate turnover)
 * - Red: >= 45 days (slow turnover, capital locked up)
 */
function assessInventoryRisk(turnoverDays: number): RiskLevel {
  if (turnoverDays < 21) return 'green';
  if (turnoverDays < 45) return 'yellow';
  return 'red';
}

/**
 * Round number to 2 decimal places for monetary values
 * Ensures consistent precision across all calculations
 */
function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}
