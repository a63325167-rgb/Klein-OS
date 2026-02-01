/**
 * Product Health Score Calculator (B1 - Enhanced Multi-Factor System)
 * 
 * Evaluates product viability on a 0-100 scale based on 4 weighted factors:
 * 1. Break-Even Health (30%) - How quickly product becomes profitable
 * 2. Profit Margin Health (30%) - Sustainability and cushion for market changes
 * 3. Cash Flow Health (20%) - Ability to maintain inventory without cash crisis
 * 4. Risk Assessment (20%) - External and operational risks
 * 
 * Each factor is scored 0-10, then weighted and summed to create final 0-100 score.
 * 
 * Visual Indicators:
 * - 0-40: Red (Poor) - High risk, reconsider product
 * - 40-70: Yellow (Fair) - Acceptable, monitor closely
 * - 70-100: Green (Good) - Healthy product, proceed with confidence
 */

/**
 * Calculate Break-Even Health Factor (0-10 points)
 * 
 * Measures how quickly the product becomes profitable after initial investment.
 * Faster break-even = lower risk and better cash flow.
 * 
 * Formula: days_to_breakeven = (Initial Inventory Cost) / (Profit Per Unit × Monthly Sales Velocity) × 30
 * 
 * Scoring:
 * - 0-7 days: 10 points (excellent, immediate profitability)
 * - 7-14 days: 8 points (very good)
 * - 14-30 days: 6 points (acceptable)
 * - 30-60 days: 4 points (slow, risky)
 * - 60+ days: 1 point (very slow, high risk)
 * - Negative profit: 0 points (not viable)
 * 
 * @param {number} profitPerUnit - Net profit per unit sold (€)
 * @param {number} initialInventoryCost - Total cost of initial inventory (COGS × quantity)
 * @param {number} monthlySalesVelocity - Estimated units sold per month
 * @returns {object} Score (0-10), label, status, and details
 */
function calculateBreakEvenHealth(profitPerUnit, initialInventoryCost, monthlySalesVelocity) {
  // Handle edge cases
  if (profitPerUnit <= 0) {
    return {
      score: 0,
      label: '❌ Break-Even',
      status: 'poor',
      details: 'Negative profit - product not viable at current price',
      daysToBreakEven: null
    };
  }
  
  if (monthlySalesVelocity <= 0 || initialInventoryCost <= 0) {
    return {
      score: 0,
      label: '❓ Break-Even',
      status: 'unknown',
      details: 'Insufficient data - need sales velocity and inventory cost',
      daysToBreakEven: null
    };
  }
  
  // Calculate days to break even
  const monthlyProfit = profitPerUnit * monthlySalesVelocity;
  const monthsToBreakEven = initialInventoryCost / monthlyProfit;
  const daysToBreakEven = Math.round(monthsToBreakEven * 30);
  
  // Score based on break-even speed
  let score, label, status, details;
  
  if (daysToBreakEven <= 7) {
    score = 10;
    label = '✅ Break-Even';
    status = 'excellent';
    details = `${daysToBreakEven} days - Immediate profitability`;
  } else if (daysToBreakEven <= 14) {
    score = 8;
    label = '✅ Break-Even';
    status = 'good';
    details = `${daysToBreakEven} days - Very fast recovery`;
  } else if (daysToBreakEven <= 30) {
    score = 6;
    label = '⚠️ Break-Even';
    status = 'fair';
    details = `${daysToBreakEven} days - Acceptable timeline`;
  } else if (daysToBreakEven <= 60) {
    score = 4;
    label = '⚠️ Break-Even';
    status = 'risky';
    details = `${daysToBreakEven} days - Slow, monitor cash flow`;
  } else {
    score = 1;
    label = '❌ Break-Even';
    status = 'poor';
    details = `${daysToBreakEven} days - Very slow, high risk`;
  }
  
  return { score, label, status, details, daysToBreakEven };
}

/**
 * Calculate Profit Margin Health Factor (0-10 points)
 * 
 * Measures sustainability and cushion for price wars, fee changes, and market fluctuations.
 * Higher margins = more room for error and competitive pressure.
 * 
 * Formula: Profit Margin % = (Profit Per Unit / Selling Price) × 100
 * 
 * Scoring:
 * - > 30%: 10 points (excellent, well-cushioned)
 * - 25-30%: 9 points (very good)
 * - 20-25%: 8 points (solid, sustainable)
 * - 15-20%: 6 points (acceptable, moderate risk)
 * - 10-15%: 4 points (thin, risky)
 * - 5-10%: 2 points (very thin, one mistake ruins profit)
 * - < 5%: 0 points (not viable long-term)
 * 
 * @param {number} profitPerUnit - Net profit per unit (€)
 * @param {number} sellingPrice - Selling price per unit (€)
 * @returns {object} Score (0-10), label, status, and margin percentage
 */
function calculateProfitMarginHealth(profitPerUnit, sellingPrice) {
  // Handle edge cases
  if (sellingPrice <= 0) {
    return {
      score: 0,
      label: '❌ Profit Margin',
      status: 'poor',
      marginPercent: 0,
      details: 'Invalid selling price'
    };
  }
  
  // Calculate margin percentage
  const marginPercent = (profitPerUnit / sellingPrice) * 100;
  
  // Score based on margin
  let score, label, status, details;
  
  if (marginPercent > 30) {
    score = 10;
    label = '✅ Profit Margin';
    status = 'excellent';
    details = `${marginPercent.toFixed(1)}% - Excellent cushion`;
  } else if (marginPercent >= 25) {
    score = 9;
    label = '✅ Profit Margin';
    status = 'good';
    details = `${marginPercent.toFixed(1)}% - Very good margin`;
  } else if (marginPercent >= 20) {
    score = 8;
    label = '✅ Profit Margin';
    status = 'good';
    details = `${marginPercent.toFixed(1)}% - Solid and sustainable`;
  } else if (marginPercent >= 15) {
    score = 6;
    label = '⚠️ Profit Margin';
    status = 'fair';
    details = `${marginPercent.toFixed(1)}% - Acceptable, moderate risk`;
  } else if (marginPercent >= 10) {
    score = 4;
    label = '⚠️ Profit Margin';
    status = 'risky';
    details = `${marginPercent.toFixed(1)}% - Thin margin, risky`;
  } else if (marginPercent >= 5) {
    score = 2;
    label = '❌ Profit Margin';
    status = 'poor';
    details = `${marginPercent.toFixed(1)}% - Very thin, one mistake ruins profit`;
  } else {
    score = 0;
    label = '❌ Profit Margin';
    status = 'poor';
    details = `${marginPercent.toFixed(1)}% - Not viable long-term`;
  }
  
  return { score, label, status, marginPercent, details };
}

/**
 * Calculate Cash Flow Health Factor (0-10 points)
 * 
 * Measures whether seller can afford to maintain inventory without cash crisis.
 * Considers monthly profit vs reorder costs and sustainability duration.
 * 
 * Formula: months_sustainable = (Available Cash Reserve) / (Monthly Reorder Cost - Monthly Profit)
 * 
 * Scoring:
 * - 6+ months sustainable: 10 points (excellent cash cushion)
 * - 4-6 months: 8 points (good)
 * - 2-4 months: 6 points (acceptable)
 * - 1-2 months: 4 points (tight, risky)
 * - < 1 month: 2 points (very risky, any disruption = crisis)
 * - Negative cash flow: 0 points (unsustainable)
 * 
 * @param {number} monthlyProfit - Net profit per month (profit per unit × monthly sales)
 * @param {number} monthlyReorderCost - Cost to reorder inventory monthly (COGS × reorder quantity)
 * @param {number} cashReserve - Available cash reserve for inventory (€)
 * @returns {object} Score (0-10), label, status, and sustainability months
 */
function calculateCashFlowHealth(monthlyProfit, monthlyReorderCost, cashReserve = 2000) {
  // Handle edge cases
  if (monthlyProfit <= 0) {
    return {
      score: 0,
      label: '❌ Cash Flow',
      status: 'poor',
      monthsSustainable: 0,
      details: 'No profit - unsustainable'
    };
  }
  
  // Calculate net cash need per month
  const netCashNeedMonthly = monthlyReorderCost - monthlyProfit;
  
  // If profit covers reorder costs, cash flow is positive
  if (netCashNeedMonthly <= 0) {
    return {
      score: 10,
      label: '✅ Cash Flow',
      status: 'excellent',
      monthsSustainable: Infinity,
      details: 'Profit covers reorders - self-sustaining'
    };
  }
  
  // Calculate how many months can be sustained
  const monthsSustainable = cashReserve / netCashNeedMonthly;
  
  // Score based on sustainability
  let score, label, status, details;
  
  if (monthsSustainable >= 6) {
    score = 10;
    label = '✅ Cash Flow';
    status = 'excellent';
    details = `${monthsSustainable.toFixed(1)} months - Excellent cushion`;
  } else if (monthsSustainable >= 4) {
    score = 8;
    label = '✅ Cash Flow';
    status = 'good';
    details = `${monthsSustainable.toFixed(1)} months - Good reserve`;
  } else if (monthsSustainable >= 2) {
    score = 6;
    label = '⚠️ Cash Flow';
    status = 'fair';
    details = `${monthsSustainable.toFixed(1)} months - Acceptable`;
  } else if (monthsSustainable >= 1) {
    score = 4;
    label = '⚠️ Cash Flow';
    status = 'risky';
    details = `${monthsSustainable.toFixed(1)} months - Tight, risky`;
  } else {
    score = 2;
    label = '❌ Cash Flow';
    status = 'poor';
    details = `${monthsSustainable.toFixed(1)} months - Very risky`;
  }
  
  return { score, label, status, monthsSustainable, details };
}

/**
 * Calculate Risk Assessment Factor (0-10 points)
 * 
 * Measures external and operational risks through 4 sub-factors:
 * 1. Price Competition Risk (based on number of sellers)
 * 2. Review/Rating Risk (based on review count - product validation)
 * 3. Seasonal Risk (year-round vs seasonal products)
 * 4. Inventory Turnover Risk (fast vs slow moving inventory)
 * 
 * Each sub-factor scored 0-10, then averaged for final risk score.
 * 
 * @param {object} riskFactors - Object containing competition, reviews, seasonality, turnover
 * @returns {object} Score (0-10), label, status, and sub-factor breakdown
 */
function calculateRiskAssessment(riskFactors = {}) {
  const {
    competitorCount = 10,
    reviewCount = 50,
    isHighlySeasonal = false,
    inventoryTurnoverDays = 20
  } = riskFactors;
  
  // 1. Price Competition Risk (0-10)
  let competitionScore;
  if (competitorCount <= 3) {
    competitionScore = 9; // Low competition
  } else if (competitorCount <= 10) {
    competitionScore = 7; // Moderate competition
  } else if (competitorCount <= 20) {
    competitionScore = 4; // High competition
  } else {
    competitionScore = 1; // Extreme competition
  }
  
  // 2. Review/Rating Risk (0-10) - Product validation
  let reviewScore;
  if (reviewCount >= 500) {
    reviewScore = 10; // Excellent validation
  } else if (reviewCount >= 50) {
    reviewScore = 9; // Proven product
  } else if (reviewCount >= 10) {
    reviewScore = 6; // Some proof
  } else {
    reviewScore = 4; // Unproven
  }
  
  // 3. Seasonal Risk (0-10)
  const seasonalityScore = isHighlySeasonal ? 4 : 9;
  
  // 4. Inventory Turnover Risk (0-10)
  let turnoverScore;
  if (inventoryTurnoverDays <= 14) {
    turnoverScore = 9; // Fast turnover, low stagnation risk
  } else if (inventoryTurnoverDays <= 30) {
    turnoverScore = 7; // Moderate turnover
  } else {
    turnoverScore = 3; // Slow turnover, risk of dead stock
  }
  
  // Average all sub-factors
  const averageScore = (competitionScore + reviewScore + seasonalityScore + turnoverScore) / 4;
  const score = Math.round(averageScore);
  
  // Determine label and status
  let label, status, details;
  if (score >= 8) {
    label = '✅ Risk Assessment';
    status = 'excellent';
    details = 'Low risk profile';
  } else if (score >= 6) {
    label = '✅ Risk Assessment';
    status = 'good';
    details = 'Moderate risk, manageable';
  } else if (score >= 4) {
    label = '⚠️ Risk Assessment';
    status = 'fair';
    details = 'Elevated risk, monitor closely';
  } else {
    label = '❌ Risk Assessment';
    status = 'poor';
    details = 'High risk profile';
  }
  
  return {
    score,
    label,
    status,
    details,
    subFactors: {
      competition: competitionScore,
      reviews: reviewScore,
      seasonality: seasonalityScore,
      turnover: turnoverScore
    }
  };
}

/**
 * Get visual indicator (color, emoji, status) based on total health score
 * 
 * Visual Indicators:
 * - 70-100 (Green): Good Health - Healthy product, proceed with confidence
 * - 40-70 (Yellow): Fair Health - Acceptable, monitor closely, improve margins or turnover
 * - 0-40 (Red): Poor Health - High risk, reconsider this product
 * 
 * @param {number} totalScore - Final health score (0-100)
 * @returns {object} Color hex, emoji, status text, and recommendation
 */
function getHealthIndicator(totalScore) {
  if (totalScore >= 70) {
    return {
      color: '#10b981', // Green
      emoji: '✅',
      status: 'Good Health',
      recommendation: 'Healthy product. Proceed with confidence.',
      zone: 'green'
    };
  } else if (totalScore >= 40) {
    return {
      color: '#f59e0b', // Yellow/Amber
      emoji: '⚠️',
      status: 'Fair Health',
      recommendation: 'Acceptable, but monitor closely. Improve margins or turnover speed.',
      zone: 'yellow'
    };
  } else {
    return {
      color: '#ef4444', // Red
      emoji: '❌',
      status: 'Poor Health',
      recommendation: 'High risk. Reconsider this product or optimize costs/pricing.',
      zone: 'red'
    };
  }
}

/**
 * Calculate Complete Product Health Score (B1 - Enhanced System)
 * 
 * Weighted Multi-Factor Scoring:
 * - Break-Even Health: 30% weight
 * - Profit Margin Health: 30% weight
 * - Cash Flow Health: 20% weight
 * - Risk Assessment: 20% weight
 * 
 * Final Score = (Break-Even × 0.30 + Margin × 0.30 + Cash Flow × 0.20 + Risk × 0.20) × 10
 * 
 * @param {object} result - Calculation result object with totals, input, shipping, etc.
 * @returns {object} Complete health score with totalScore (0-100), factors, and visual indicator
 */
export function calculateProductHealthScore(result) {
  // Safety check
  if (!result || !result.totals || !result.input) {
    return {
      totalScore: 0,
      factors: [],
      indicator: {
        color: '#6b7280', // Gray
        emoji: '❓',
        status: 'Insufficient Data',
        recommendation: 'Enter selling price, COGS, and sales velocity to calculate health score.',
        zone: 'gray'
      }
    };
  }

  // Extract data with safety defaults
  // B2: Use adjusted net profit (accounts for returns)
  const netProfit = result.totals.net_profit || 0;
  const sellingPrice = parseFloat(result.input.selling_price) || 0;
  const cogs = parseFloat(result.input.buying_price) || parseFloat(result.input.cogs) || 0;
  const fixedCosts = parseFloat(result.input.fixed_costs) || 500;
  const orderedQuantity = parseInt(result.input.ordered_quantity) || 100;
  
  // Use monthly volume from calculation (B2 integration)
  const monthlySalesVelocity = result.input.monthly_volume || result.input.monthly_sales_velocity || 20;
  
  // Calculate initial inventory cost
  const initialInventoryCost = cogs * orderedQuantity;
  
  // Calculate monthly metrics
  const monthlyProfit = netProfit * monthlySalesVelocity;
  const monthlyReorderCost = cogs * monthlySalesVelocity; // Assume reorder = monthly sales
  const cashReserve = result.input.cash_reserve || 2000; // Default €2000 reserve
  
  // Risk factors (these should ideally come from user input or market data)
  const riskFactors = {
    competitorCount: result.input.competitor_count || 10,
    reviewCount: result.input.review_count || 50,
    isHighlySeasonal: result.input.is_seasonal || false,
    inventoryTurnoverDays: result.input.turnover_days || 20
  };
  
  // Calculate all 4 health factors (each 0-10 points)
  const breakEvenHealth = calculateBreakEvenHealth(netProfit, initialInventoryCost, monthlySalesVelocity);
  const profitMarginHealth = calculateProfitMarginHealth(netProfit, sellingPrice);
  const cashFlowHealth = calculateCashFlowHealth(monthlyProfit, monthlyReorderCost, cashReserve);
  const riskAssessment = calculateRiskAssessment(riskFactors);
  
  // Apply weights and calculate final score (0-100)
  // Each factor is 0-10, multiply by weight, then by 10 to get 0-100 scale
  const weightedBreakEven = breakEvenHealth.score * 0.30;
  const weightedMargin = profitMarginHealth.score * 0.30;
  const weightedCashFlow = cashFlowHealth.score * 0.20;
  const weightedRisk = riskAssessment.score * 0.20;
  
  const totalScore = Math.round((weightedBreakEven + weightedMargin + weightedCashFlow + weightedRisk) * 10);
  
  // Compile all factors with weights
  const factors = [
    { ...breakEvenHealth, weight: '30%', weightedScore: weightedBreakEven * 10 },
    { ...profitMarginHealth, weight: '30%', weightedScore: weightedMargin * 10 },
    { ...cashFlowHealth, weight: '20%', weightedScore: weightedCashFlow * 10 },
    { ...riskAssessment, weight: '20%', weightedScore: weightedRisk * 10 }
  ];
  
  // Get visual indicator
  const indicator = getHealthIndicator(totalScore);
  
  return {
    totalScore,
    factors,
    indicator
  };
}

/**
 * TESTING UTILITIES
 * 
 * Test Case 1: High-Health Product (Expected: ~98/100)
 * - Selling: €50, COGS: €20, Profit: €15, Monthly sales: 50 units
 * - Margin: 30% → 10 pts, Break-even: 4 days → 10 pts
 * - Cash flow: Self-sustaining → 10 pts, Risk: Low → 9 pts
 * 
 * Test Case 2: Medium-Health Product (Expected: ~60/100)
 * - Selling: €30, COGS: €15, Profit: €4.50, Monthly sales: 20 units
 * - Margin: 15% → 6 pts, Break-even: 30 days → 6 pts
 * - Cash flow: 3 months → 6 pts, Risk: Moderate → 6 pts
 * 
 * Test Case 3: Low-Health Product (Expected: ~4/100)
 * - Selling: €20, COGS: €18, Profit: €0.50, Monthly sales: 5 units
 * - Margin: 2.5% → 0 pts, Break-even: 540 days → 0 pts
 * - Cash flow: 0.03 months → 0 pts, Risk: High → 2 pts
 */
