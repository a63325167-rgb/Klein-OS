/**
 * Risk Calculations (B5)
 * 
 * Comprehensive risk threshold and warning system.
 * Alerts sellers BEFORE they make catastrophic decisions.
 * 
 * 5 Risk Categories:
 * 1. Profitability Risk - Is profit margin sufficient?
 * 2. Break-Even Risk - How long until profitable?
 * 3. Cash Flow Risk - Will you run out of cash?
 * 4. Competition Risk - Too many sellers?
 * 5. Inventory Health Risk - Will inventory become dead stock?
 * 
 * Each category has clear thresholds:
 * - Red (🔴 Critical): Immediate action required
 * - Yellow (⚠️ Warning): Caution needed
 * - Green (✅ Safe): Proceed with confidence
 */

/**
 * Default risk thresholds
 */
export const DEFAULT_THRESHOLDS = {
  profitability: {
    green: 20,  // >= 20% margin = safe
    yellow: 10, // 10-20% margin = warning
    red: 0      // < 10% margin = critical
  },
  breakeven: {
    green: 14,  // < 14 days = safe
    yellow: 30, // 14-30 days = warning
    red: 999    // > 30 days = critical
  },
  cashflow: {
    green: 6,   // >= 6 months runway = safe
    yellow: 3,  // 3-6 months runway = warning
    red: 0      // < 3 months runway = critical
  },
  competition: {
    green: 5,   // <= 5 competitors = safe
    yellow: 15, // 5-15 competitors = warning
    red: 999    // > 15 competitors = critical
  },
  inventory: {
    green: 21,  // < 21 days turnover = safe
    yellow: 45, // 21-45 days turnover = warning
    red: 999    // > 45 days turnover = critical
  }
};

/**
 * Calculate Profitability Risk
 * 
 * Determines if profit margin is sufficient for sustainable business.
 * 
 * @param {number} profitMarginPercent - Profit margin as percentage
 * @param {number} sellingPrice - Current selling price
 * @param {number} profitPerUnit - Current profit per unit
 * @returns {object} Risk warning with level, message, and action items
 */
export function calculateProfitabilityRisk(profitMarginPercent, sellingPrice = 0, profitPerUnit = 0) {
  const thresholds = DEFAULT_THRESHOLDS.profitability;
  
  // Determine risk level
  let level = 'green';
  if (profitMarginPercent < thresholds.yellow) {
    level = 'red';
  } else if (profitMarginPercent < thresholds.green) {
    level = 'yellow';
  }

  // Calculate how much to improve
  const targetMargin = level === 'red' ? thresholds.yellow : thresholds.green;
  const marginGap = targetMargin - profitMarginPercent;
  const priceIncrease = sellingPrice > 0 ? (sellingPrice * marginGap / 100) : 0;
  const cogsReduction = profitPerUnit > 0 ? (marginGap * sellingPrice / 100) : 0;

  // Generate action items
  const actionItems = [];
  if (level === 'red') {
    actionItems.push(`🚨 Raise selling price by €${priceIncrease.toFixed(2)} to reach ${targetMargin}% margin`);
    actionItems.push(`🔻 OR negotiate COGS reduction of €${cogsReduction.toFixed(2)}`);
    actionItems.push('❌ Do NOT order this product—it will lose money');
    actionItems.push('📊 Review all costs: Are Amazon fees correct? VAT calculated?');
  } else if (level === 'yellow') {
    actionItems.push('⚠️ Monitor for price wars—one price drop eliminates profit');
    actionItems.push(`📈 Consider raising price by €${priceIncrease.toFixed(2)} to reach ${targetMargin}% margin`);
    actionItems.push('🤝 Negotiate better supplier terms to improve margins');
  } else {
    actionItems.push('✅ Healthy margin—proceed with confidence');
    actionItems.push('👀 Monitor competitor pricing to maintain advantage');
  }

  return {
    category: 'profitability',
    level,
    title: 'Profitability Risk',
    message: level === 'red'
      ? `Profit margin is dangerously low (${profitMarginPercent.toFixed(1)}%). This product will likely lose money.`
      : level === 'yellow'
      ? `Profit margin is thin (${profitMarginPercent.toFixed(1)}%). One price drop eliminates profit.`
      : `Profit margin is healthy (${profitMarginPercent.toFixed(1)}%). Good foundation for sustainable business.`,
    actionItems,
    metric: `${profitMarginPercent.toFixed(1)}% margin`,
    threshold: `> ${thresholds.green}% margin`,
    dismissed: false
  };
}

/**
 * Calculate Break-Even Risk
 * 
 * Determines how long until product becomes profitable.
 * Long break-even = high risk of dead inventory.
 * 
 * @param {number} daysToBreakeven - Days until break-even
 * @param {number} initialCash - Available cash reserve
 * @param {number} initialInventoryCost - Cost of initial inventory order
 * @param {number} profitPerUnit - Profit per unit
 * @param {number} sellingPrice - Selling price
 * @returns {object} Risk warning
 */
export function calculateBreakevenRisk(daysToBreakeven, initialCash = 0, initialInventoryCost = 0, profitPerUnit = 0, sellingPrice = 0) {
  const thresholds = DEFAULT_THRESHOLDS.breakeven;
  
  // Determine risk level
  let level = 'green';
  if (daysToBreakeven > thresholds.yellow) {
    level = 'red';
  } else if (daysToBreakeven > thresholds.green) {
    level = 'yellow';
  }

  // Calculate cash shortfall
  const cashShortfall = Math.max(0, initialInventoryCost - initialCash);
  
  // Calculate how much to improve
  const targetDays = level === 'red' ? thresholds.yellow : thresholds.green;
  const priceIncrease = profitPerUnit > 0 && sellingPrice > 0
    ? ((daysToBreakeven - targetDays) / daysToBreakeven) * sellingPrice * 0.1
    : 0;

  // Generate action items
  const actionItems = [];
  if (level === 'red') {
    actionItems.push(`⏰ Inventory will tie up cash for ${daysToBreakeven.toFixed(0)} days`);
    if (cashShortfall > 0) {
      actionItems.push(`💰 You need at least €${cashShortfall.toFixed(0)} more to cover this order`);
    }
    actionItems.push(`📈 Raise price by €${priceIncrease.toFixed(2)} to reach ${targetDays}-day break-even`);
    actionItems.push('⚠️ Only proceed if you have sufficient cash reserve (6+ months)');
  } else if (level === 'yellow') {
    actionItems.push(`⏳ Be prepared for ${daysToBreakeven.toFixed(0)} days of cash being tied up`);
    actionItems.push('💵 Ensure you have backup cash for emergencies');
    actionItems.push('📊 Consider smaller initial order to reduce risk');
  } else {
    actionItems.push(`✅ Fast break-even (${daysToBreakeven.toFixed(0)} days)—positive cash flow by week 2`);
    actionItems.push('🚀 Good candidate for scaling up order size');
  }

  return {
    category: 'breakeven',
    level,
    title: 'Break-Even Risk',
    message: level === 'red'
      ? `Very slow break-even (${daysToBreakeven.toFixed(0)} days). High risk of dead stock and cash crisis.`
      : level === 'yellow'
      ? `Slow break-even (${daysToBreakeven.toFixed(0)} days). Cash will be tied up for a month.`
      : `Fast break-even (${daysToBreakeven.toFixed(0)} days). Good cash flow expected.`,
    actionItems,
    metric: `${daysToBreakeven.toFixed(0)} days`,
    threshold: `< ${thresholds.green} days`,
    dismissed: false
  };
}

/**
 * Calculate Cash Flow Risk
 * 
 * Determines if seller will run out of cash before inventory sells.
 * Uses B4 cash runway calculation.
 * 
 * @param {number} cashRunway - Months until cash reaches zero (from B4)
 * @param {number} requiredReserve - Required cash for 6-month safety
 * @param {number} currentCash - Current available cash
 * @returns {object} Risk warning
 */
export function calculateCashflowRisk(cashRunway, requiredReserve = 0, currentCash = 0) {
  const thresholds = DEFAULT_THRESHOLDS.cashflow;
  
  // Determine risk level
  let level = 'green';
  if (cashRunway < thresholds.yellow) {
    level = 'red';
  } else if (cashRunway < thresholds.green) {
    level = 'yellow';
  }

  // Calculate cash gap
  const cashGap = Math.max(0, requiredReserve - currentCash);
  const weeksUntilCrisis = cashRunway * 4.33; // Convert months to weeks

  // Generate action items
  const actionItems = [];
  if (level === 'red') {
    actionItems.push(`🚨 You will run out of cash in ${weeksUntilCrisis.toFixed(0)} weeks (Month ${Math.ceil(cashRunway)})`);
    actionItems.push('📉 Reduce reorder size immediately (order 50-70% of current batch)');
    actionItems.push('📈 Increase prices by 10-20% to boost profit per unit');
    if (cashGap > 0) {
      actionItems.push(`💰 Prepare cash injection of €${cashGap.toFixed(0)} (loan, investment, personal funds)`);
    }
    actionItems.push('⛔ Do NOT reorder until cash situation improves');
  } else if (level === 'yellow') {
    actionItems.push(`⏰ Plan cash injection by Month ${Math.ceil(cashRunway)}`);
    actionItems.push('📦 Consider smaller, more frequent reorder batches');
    actionItems.push('💵 Build cash buffer before scaling up');
    if (cashGap > 0) {
      actionItems.push(`Target: Add €${cashGap.toFixed(0)} to reach 6-month safety`);
    }
  } else {
    actionItems.push(`✅ Excellent cash position (${cashRunway.toFixed(1)} months runway)`);
    actionItems.push('🚀 You can sustain this product for 6+ months without external cash');
    actionItems.push('💼 Consider reinvesting profit into growth or new products');
  }

  return {
    category: 'cashflow',
    level,
    title: 'Cash Flow Risk',
    message: level === 'red'
      ? `Critical: Cash runway is only ${cashRunway.toFixed(1)} months. You'll be out of cash soon.`
      : level === 'yellow'
      ? `Caution: Cash runway is ${cashRunway.toFixed(1)} months. Plan ahead for cash needs.`
      : `Excellent: Cash runway is ${cashRunway.toFixed(1)} months. Strong financial position.`,
    actionItems,
    metric: `${cashRunway.toFixed(1)} months`,
    threshold: `≥ ${thresholds.green} months`,
    dismissed: false
  };
}

/**
 * Calculate Competition Risk
 * 
 * Determines if market is too crowded or has quality issues.
 * High competition = price wars = margin compression.
 * 
 * @param {number} competitorCount - Number of sellers
 * @param {number} averageRating - Average product rating (1-5 stars)
 * @param {number} returnRate - Return rate percentage
 * @returns {object} Risk warning
 */
export function calculateCompetitionRisk(competitorCount = 0, averageRating = 0, returnRate = 0) {
  const thresholds = DEFAULT_THRESHOLDS.competition;
  
  // Determine risk level
  let level = 'green';
  if (competitorCount > thresholds.yellow || (competitorCount > 10 && averageRating < 3.5)) {
    level = 'red';
  } else if (competitorCount > thresholds.green) {
    level = 'yellow';
  }

  // Additional risk factors
  const hasQualityIssues = averageRating > 0 && averageRating < 3.5;
  const hasHighReturns = returnRate > 15;

  // Generate action items
  const actionItems = [];
  if (level === 'red') {
    actionItems.push(`⚠️ High competition (${competitorCount} sellers)${hasQualityIssues ? ' with poor reviews' : ''}`);
    actionItems.push('💰 Price wars likely—prepare for 10-20% price drops');
    actionItems.push('📊 Only proceed if margins can absorb lower prices');
    if (hasHighReturns) {
      actionItems.push(`🔄 High return rate (${returnRate}%)—quality concerns`);
    }
    actionItems.push('🎯 Consider finding a less competitive product');
  } else if (level === 'yellow') {
    actionItems.push(`👥 Moderate competition (${competitorCount} sellers)—monitor pricing weekly`);
    actionItems.push('⭐ Improve product reviews to differentiate');
    actionItems.push('📈 Maintain price discipline—do not race to bottom');
  } else {
    actionItems.push(`✅ Low competition (${competitorCount || 'few'} sellers)—pricing power is yours`);
    actionItems.push('🎯 Good opportunity for market entry');
    actionItems.push('💎 Focus on quality to maintain advantage');
  }

  return {
    category: 'competition',
    level,
    title: 'Competition Risk',
    message: level === 'red'
      ? `Intense competition (${competitorCount} sellers). Price wars and margin compression likely.`
      : level === 'yellow'
      ? `Moderate competition (${competitorCount} sellers). Monitor pricing and differentiate.`
      : `Low competition (${competitorCount || 'few'} sellers). Favorable market conditions.`,
    actionItems,
    metric: `${competitorCount} competitors${averageRating > 0 ? `, ${averageRating.toFixed(1)}★` : ''}`,
    threshold: `< ${thresholds.green} competitors OR rating > 4.5★`,
    dismissed: false
  };
}

/**
 * Calculate Inventory Health Risk
 * 
 * Determines if inventory will move fast enough or become dead stock.
 * Slow turnover = cash tied up = opportunity cost.
 * 
 * @param {number} turnoverDays - Days to sell through inventory
 * @param {number} monthlySalesVelocity - Units sold per month
 * @param {number} orderQuantity - Initial order size
 * @returns {object} Risk warning
 */
export function calculateInventoryRisk(turnoverDays, monthlySalesVelocity = 0, orderQuantity = 0) {
  const thresholds = DEFAULT_THRESHOLDS.inventory;
  
  // Determine risk level
  let level = 'green';
  if (turnoverDays > thresholds.yellow || monthlySalesVelocity === 0) {
    level = 'red';
  } else if (turnoverDays > thresholds.green) {
    level = 'yellow';
  }

  // Calculate months of inventory
  const monthsOfInventory = turnoverDays / 30;

  // Generate action items
  const actionItems = [];
  if (level === 'red') {
    actionItems.push(`⏰ Inventory turnover is extremely slow (${turnoverDays.toFixed(0)} days = ${monthsOfInventory.toFixed(1)} months)`);
    actionItems.push('⚠️ Product may expire, become obsolete, or incur long-term storage fees');
    actionItems.push('💰 Consider 10-20% price reduction to accelerate sales');
    actionItems.push(`📦 OR reduce order size to ${Math.ceil(orderQuantity * 0.5)} units`);
    actionItems.push('🗑️ OR remove from FBA entirely if sales do not improve');
  } else if (level === 'yellow') {
    actionItems.push(`⏳ Inventory takes ${turnoverDays.toFixed(0)} days (${monthsOfInventory.toFixed(1)} months) to sell`);
    actionItems.push('💵 Plan for extended cash tie-up');
    actionItems.push('📊 Monitor sales velocity—adjust reorders if needed');
  } else {
    actionItems.push(`✅ Fast turnover (${turnoverDays.toFixed(0)} days)—cash converts quickly`);
    actionItems.push('🚀 Good candidate for increasing order size');
    actionItems.push('💰 Efficient capital utilization');
  }

  return {
    category: 'inventory',
    level,
    title: 'Inventory Health Risk',
    message: level === 'red'
      ? `Very slow inventory turnover (${turnoverDays.toFixed(0)} days). High dead stock risk.`
      : level === 'yellow'
      ? `Moderate turnover (${turnoverDays.toFixed(0)} days). Acceptable but watch for slowdowns.`
      : `Fast turnover (${turnoverDays.toFixed(0)} days). Healthy inventory movement.`,
    actionItems,
    metric: `${turnoverDays.toFixed(0)} days`,
    threshold: `< ${thresholds.green} days`,
    dismissed: false
  };
}

/**
 * Calculate all risks at once
 * 
 * @param {object} productData - Complete product analysis data
 * @returns {array} Array of all risk warnings
 */
export function calculateAllRisks(productData) {
  const {
    profitMarginPercent = 0,
    sellingPrice = 0,
    profitPerUnit = 0,
    daysToBreakeven = 0,
    initialCash = 0,
    initialInventoryCost = 0,
    cashRunway = 0,
    requiredReserve = 0,
    competitorCount = 0,
    averageRating = 0,
    returnRate = 0,
    turnoverDays = 0,
    monthlySalesVelocity = 0,
    orderQuantity = 0
  } = productData;

  return [
    calculateProfitabilityRisk(profitMarginPercent, sellingPrice, profitPerUnit),
    calculateBreakevenRisk(daysToBreakeven, initialCash, initialInventoryCost, profitPerUnit, sellingPrice),
    calculateCashflowRisk(cashRunway, requiredReserve, initialCash),
    calculateCompetitionRisk(competitorCount, averageRating, returnRate),
    calculateInventoryRisk(turnoverDays, monthlySalesVelocity, orderQuantity)
  ];
}

/**
 * Get overall risk summary
 * 
 * @param {array} warnings - Array of risk warnings
 * @returns {object} Summary statistics
 */
export function getRiskSummary(warnings) {
  const critical = warnings.filter(w => w.level === 'red' && !w.dismissed).length;
  const caution = warnings.filter(w => w.level === 'yellow' && !w.dismissed).length;
  const safe = warnings.filter(w => w.level === 'green' && !w.dismissed).length;
  
  let overallLevel = 'green';
  let overallMessage = '';
  
  if (critical >= 3) {
    overallLevel = 'red';
    overallMessage = `CRITICAL: ${critical} critical risks detected. Do NOT proceed with this product.`;
  } else if (critical >= 1) {
    overallLevel = 'red';
    overallMessage = `${critical} critical risk${critical > 1 ? 's' : ''} detected. Address before ordering.`;
  } else if (caution >= 3) {
    overallLevel = 'yellow';
    overallMessage = `${caution} warnings detected. Proceed with caution.`;
  } else if (caution >= 1) {
    overallLevel = 'yellow';
    overallMessage = `${caution} warning${caution > 1 ? 's' : ''} detected. Monitor closely.`;
  } else {
    overallLevel = 'green';
    overallMessage = 'All systems green. Product looks viable.';
  }
  
  return {
    critical,
    caution,
    safe,
    total: warnings.length,
    overallLevel,
    overallMessage
  };
}

/**
 * TEST CASES (B5)
 * 
 * Test Case 1: Product with 8% Margin
 * Input: profitMarginPercent: 8, sellingPrice: 50, profitPerUnit: 4
 * Expected: Profitability Risk = Red, "Raise price to €57 or reduce COGS by €5"
 * 
 * Test Case 2: Product with 150-Day Break-Even
 * Input: daysToBreakeven: 150, initialCash: 2000, initialInventoryCost: 2000
 * Expected: Break-Even Risk = Red, "Only proceed with sufficient cash reserve"
 * 
 * Test Case 3: Product with 2.5 Month Runway
 * Input: cashRunway: 2.5
 * Expected: Cash Flow Risk = Red, "You'll run out of cash in 10 weeks"
 * 
 * Test Case 4: Product with 25 Competitors, 3.2★ Rating
 * Input: competitorCount: 25, averageRating: 3.2
 * Expected: Competition Risk = Red, "Price wars likely"
 * 
 * Test Case 5: Product with 200-Day Turnover
 * Input: turnoverDays: 200, monthlySalesVelocity: 5
 * Expected: Inventory Risk = Red, "Consider lower price or remove from FBA"
 */
