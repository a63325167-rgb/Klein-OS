/**
 * Cash Flow Calculations (B4)
 * 
 * Precise 6-month runway model for FBA sellers.
 * Calculates month-by-month cash position accounting for:
 * - Initial inventory investment
 * - Monthly reorder costs
 * - Monthly profit inflow (with payment lag)
 * - Cash runway (months until cash = 0)
 * - Break-even month
 * - Required cash reserve
 * 
 * CRITICAL: This calculation determines business viability.
 * Underestimating cash needs can bankrupt a seller.
 */

/**
 * Calculate precise cash flow runway with month-by-month tracking
 * 
 * @param {object} input - Cash flow parameters
 * @param {number} input.initialCash - Starting cash reserve (€)
 * @param {number} input.cogsPerUnit - Cost of goods sold per unit (€)
 * @param {number} input.initialOrderUnits - Initial inventory order size (units)
 * @param {number} input.monthlySalesVelocity - Expected monthly sales (units/month)
 * @param {number} input.profitPerUnit - Net profit per unit after all costs (€) - from B2
 * @param {number} input.reorderBufferMultiplier - Safety buffer for reorders (typically 1.1-1.3)
 * @returns {object} Cash flow analysis with runway, break-even, and monthly details
 */
export function calculateCashFlow(input) {
  const {
    initialCash = 0,
    cogsPerUnit,
    initialOrderUnits,
    monthlySalesVelocity,
    profitPerUnit,
    reorderBufferMultiplier = 1.2
  } = input;

  // Validate inputs
  if (!cogsPerUnit || !initialOrderUnits || !monthlySalesVelocity || profitPerUnit === undefined) {
    return {
      runway: 0,
      runwayMonths: 0,
      breakEvenMonth: -1,
      monthlyDetails: [],
      requiredReserve: 0,
      riskLevel: 'red',
      riskMessage: '❌ Insufficient data to calculate cash flow. Please complete product analysis first.',
      isValid: false
    };
  }

  // Edge case: Zero or negative sales velocity
  if (monthlySalesVelocity <= 0) {
    return {
      runway: 0,
      runwayMonths: 0,
      breakEvenMonth: -1,
      monthlyDetails: [],
      requiredReserve: 0,
      riskLevel: 'red',
      riskMessage: '❌ No sales velocity. Cannot calculate cash runway.',
      isValid: false
    };
  }

  // Edge case: Negative profit (loss product)
  if (profitPerUnit < 0) {
    return {
      runway: 0,
      runwayMonths: 0,
      breakEvenMonth: -1,
      monthlyDetails: [],
      requiredReserve: Infinity,
      riskLevel: 'red',
      riskMessage: '🔴 Loss product. You lose money on every sale. Cash runway = 0. Do not proceed.',
      isValid: false
    };
  }

  // Step 1: Calculate initial costs
  // Initial inventory includes 2% prep/shipping fees
  const initialInventoryCost = (cogsPerUnit * initialOrderUnits) * 1.02;
  
  // Monthly reorder with buffer to avoid stockouts
  const monthlyReorderUnits = Math.ceil(monthlySalesVelocity * reorderBufferMultiplier);
  const monthlyReorderCost = monthlyReorderUnits * cogsPerUnit;
  
  // Monthly profit inflow
  const monthlyProfit = profitPerUnit * monthlySalesVelocity;

  // Step 2: Build 12-month cash flow model
  const monthlyDetails = [];
  let cashPosition = initialCash;
  let cumulativeProfit = 0;
  let cumulativeReorder = 0;
  let breakEvenMonth = -1;
  let lastPositiveMonth = -1;

  for (let month = 0; month <= 12; month++) {
    const cashStart = cashPosition;

    // Profit inflow (lagged by 1 month - Amazon payment delay)
    // Month 0: No profit yet
    // Month 1: No profit yet (payment lag)
    // Month 2: Receive Month 1 profit
    const profitInflow = month <= 1 ? 0 : monthlyProfit;
    cumulativeProfit += profitInflow;

    // Reorder outflow
    // Month 0: Initial inventory purchase
    // Month 1+: Regular reorders
    const reorderOutflow = month === 0 ? initialInventoryCost : monthlyReorderCost;
    cumulativeReorder += reorderOutflow;

    // Calculate end cash position
    const cashEnd = cashStart + profitInflow - reorderOutflow;
    const isPositive = cashEnd >= 0;

    // Track break-even (when cumulative profit exceeds cumulative costs)
    if (breakEvenMonth === -1 && cumulativeProfit > cumulativeReorder && month > 0) {
      breakEvenMonth = month;
    }

    // Track last positive month for runway calculation
    if (isPositive) {
      lastPositiveMonth = month;
    }

    monthlyDetails.push({
      month,
      cashStart,
      profitInflow,
      reorderOutflow,
      cashEnd,
      isPositive,
      cumulativeProfit,
      cumulativeReorder,
      netCumulative: cumulativeProfit - cumulativeReorder
    });

    cashPosition = cashEnd;

    // Stop if we've gone negative and stayed negative for 2 months
    if (!isPositive && month > lastPositiveMonth + 2) {
      break;
    }
  }

  // Step 3: Calculate precise runway (months until cash = 0)
  let runway = 0;
  
  if (lastPositiveMonth === -1) {
    // Never positive - ran out immediately
    runway = 0;
  } else if (lastPositiveMonth >= 12) {
    // Still positive after 12 months
    runway = 12;
  } else {
    // Calculate fractional month when cash runs out
    const lastPositive = monthlyDetails[lastPositiveMonth];
    const firstNegative = monthlyDetails[lastPositiveMonth + 1];
    
    if (firstNegative) {
      // Interpolate: How far into the month before running out?
      const cashAtStart = lastPositive.cashEnd;
      const totalOutflow = firstNegative.reorderOutflow - firstNegative.profitInflow;
      
      if (totalOutflow > 0) {
        const fractionOfMonth = cashAtStart / totalOutflow;
        runway = lastPositiveMonth + fractionOfMonth;
      } else {
        runway = lastPositiveMonth;
      }
    } else {
      runway = lastPositiveMonth;
    }
  }

  // Step 4: Calculate required reserve for 6-month safety
  // Formula: (monthly reorder × 6) - (monthly profit × 5)
  // Rationale: Need 6 months of reorders, minus 5 months of profit (1 month lag)
  const requiredReserve = Math.max(
    (monthlyReorderCost * 6) - (monthlyProfit * 5),
    0
  );

  // Step 5: Determine risk level
  let riskLevel = 'green';
  let riskMessage = '';

  if (runway >= 6) {
    riskLevel = 'green';
    riskMessage = `✅ Excellent. ${runway.toFixed(1)} months runway. You're safe for 6+ months.`;
  } else if (runway >= 3) {
    riskLevel = 'yellow';
    riskMessage = `⚠️ Caution. ${runway.toFixed(1)} months runway. Plan cash injection or reduce reorder size before Month ${Math.floor(runway)}.`;
  } else {
    riskLevel = 'red';
    riskMessage = `🔴 Crisis. ${runway.toFixed(1)} months runway. You'll run out of cash soon. Act immediately.`;
  }

  // Step 6: Generate recommendations
  const recommendations = generateRecommendations(
    riskLevel,
    runway,
    monthlyProfit,
    monthlyReorderCost,
    requiredReserve,
    initialCash
  );

  return {
    runway,
    runwayMonths: Math.floor(runway),
    breakEvenMonth,
    monthlyDetails: monthlyDetails.slice(0, 13), // Return up to 12 months + initial
    requiredReserve,
    cashGap: Math.max(requiredReserve - initialCash, 0),
    riskLevel,
    riskMessage,
    recommendations,
    isValid: true,
    // Additional metrics
    monthlyReorderCost,
    monthlyProfit,
    initialInventoryCost,
    profitToReorderRatio: monthlyProfit / monthlyReorderCost
  };
}

/**
 * Generate actionable recommendations based on cash flow health
 */
function generateRecommendations(riskLevel, runway, monthlyProfit, monthlyReorderCost, requiredReserve, initialCash) {
  const recommendations = [];

  if (riskLevel === 'red') {
    recommendations.push({
      priority: 'critical',
      icon: '🚨',
      text: `Reduce reorder size immediately. Order ${Math.floor(monthlyReorderCost / monthlyProfit * 0.7)}% of current batch to preserve cash.`
    });
    recommendations.push({
      priority: 'critical',
      icon: '💰',
      text: `Inject €${Math.ceil((requiredReserve - initialCash) / 100) * 100} external cash now (loan, investment, personal funds).`
    });
    recommendations.push({
      priority: 'high',
      icon: '📈',
      text: 'Raise price by 10-20% to increase profit per unit and extend runway.'
    });
    recommendations.push({
      priority: 'high',
      icon: '🔻',
      text: 'Negotiate lower COGS with supplier to improve margins.'
    });
  } else if (riskLevel === 'yellow') {
    recommendations.push({
      priority: 'high',
      icon: '⏰',
      text: `Plan cash injection before Month ${Math.floor(runway)}. You need €${Math.ceil((requiredReserve - initialCash) / 100) * 100} for 6-month safety.`
    });
    recommendations.push({
      priority: 'medium',
      icon: '📦',
      text: 'Consider smaller, more frequent reorders to preserve cash flow.'
    });
    recommendations.push({
      priority: 'medium',
      icon: '💵',
      text: 'Increase price or reduce COGS by 5-10% to improve profit margin.'
    });
    recommendations.push({
      priority: 'low',
      icon: '📊',
      text: 'Monitor sales velocity closely. Any drop will shorten runway.'
    });
  } else {
    recommendations.push({
      priority: 'low',
      icon: '✅',
      text: "You're in excellent shape. Maintain current strategy."
    });
    recommendations.push({
      priority: 'low',
      icon: '🚀',
      text: 'Consider scaling up reorders to capture more market share.'
    });
    recommendations.push({
      priority: 'low',
      icon: '💼',
      text: 'Reinvest profit into other product lines or marketing.'
    });
    recommendations.push({
      priority: 'low',
      icon: '🎯',
      text: `You have €${Math.ceil((initialCash - requiredReserve) / 100) * 100} excess cash. Consider growth investments.`
    });
  }

  return recommendations;
}

/**
 * Calculate cash flow with scenario adjustments
 * Used by scenario planner to test "what if" changes
 */
export function calculateCashFlowWithScenario(baselineInput, adjustedInput) {
  const merged = { ...baselineInput, ...adjustedInput };
  return calculateCashFlow(merged);
}

/**
 * Get color classes for risk level
 */
export function getCashFlowColorClasses(riskLevel) {
  switch (riskLevel) {
    case 'green':
      return {
        border: 'border-green-500 dark:border-green-600',
        bg: 'bg-green-50 dark:bg-green-900/20',
        text: 'text-green-700 dark:text-green-400',
        iconBg: 'bg-green-100 dark:bg-green-800',
        icon: 'text-green-600 dark:text-green-400'
      };
    case 'yellow':
      return {
        border: 'border-yellow-500 dark:border-yellow-600',
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        text: 'text-yellow-700 dark:text-yellow-400',
        iconBg: 'bg-yellow-100 dark:bg-yellow-800',
        icon: 'text-yellow-600 dark:text-yellow-400'
      };
    case 'red':
      return {
        border: 'border-red-500 dark:border-red-600',
        bg: 'bg-red-50 dark:bg-red-900/20',
        text: 'text-red-700 dark:text-red-400',
        iconBg: 'bg-red-100 dark:bg-red-800',
        icon: 'text-red-600 dark:text-red-400'
      };
    default:
      return {
        border: 'border-gray-500 dark:border-gray-600',
        bg: 'bg-gray-50 dark:bg-gray-900/20',
        text: 'text-gray-700 dark:text-gray-400',
        iconBg: 'bg-gray-100 dark:bg-gray-800',
        icon: 'text-gray-600 dark:text-gray-400'
      };
  }
}

/**
 * Format currency for display
 */
export function formatCashFlowCurrency(value) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * TEST CASES (B4)
 * 
 * Test Case 1: Healthy Cash Flow
 * Input: initialCash: €10,000, COGS: €20, initialOrder: 100, monthlySales: 50, profit: €10
 * Expected: Runway ~8 months, Green risk level
 * 
 * Test Case 2: Tight Cash Flow (Red)
 * Input: initialCash: €3,000, COGS: €20, initialOrder: 100, monthlySales: 50, profit: €5
 * Expected: Runway ~1.5 months, Red risk level
 * 
 * Test Case 3: Scenario - Raise Price +20%
 * Input: Same as Test 1, but profit: €12 (was €10)
 * Expected: Runway extends to ~10 months
 * 
 * Test Case 4: Scenario - Reduce Reorder Size
 * Input: Same as Test 2, but reorderBuffer: 1.0 (was 1.2)
 * Expected: Runway improves slightly
 */
