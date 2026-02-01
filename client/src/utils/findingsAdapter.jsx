/**
 * FINDINGS ADAPTER
 * 
 * Bridges the TypeScript findings engines to the React UI.
 * Converts product data from UI format to findings engine format,
 * runs detection, and returns results.
 * 
 * This is a temporary adapter until TypeScript compilation is set up.
 */

/**
 * FBA Rates for 2024
 */
const FBA_RATES_2024 = {
  referral_fee_percent: 0.15,
  fulfillment_fee_standard: 2.50,
  fulfillment_fee_oversize: 4.50,
  storage_fee_monthly: 0.87,
  market_return_assumption_percent: 20,
};

/**
 * Calculate net margin percentage
 */
function calculateNetMargin(sellingPrice, costPerUnit, referralPercent = 0.15, fulfillmentFee = 2.50) {
  if (sellingPrice <= 0 || costPerUnit <= 0) return 0;
  
  const referralFee = sellingPrice * referralPercent;
  const profitPerUnit = sellingPrice - costPerUnit - referralFee - fulfillmentFee;
  const netMarginPercent = (profitPerUnit / sellingPrice) * 100;
  
  return netMarginPercent;
}

/**
 * Calculate net profit per unit
 */
function calculateNetProfit(sellingPrice, costPerUnit, referralPercent = 0.15, fulfillmentFee = 2.50) {
  const referralFee = sellingPrice * referralPercent;
  return sellingPrice - costPerUnit - referralFee - fulfillmentFee;
}

/**
 * Infer monthly velocity from days in stock
 */
function inferMonthlyVelocity(quantity, daysInStock) {
  if (!daysInStock || daysInStock <= 0) return 0;
  const dailySales = quantity / daysInStock;
  return dailySales * 30;
}

/**
 * Round price to psychological pricing (.99 or .95)
 */
function roundPrice(price) {
  const rounded = Math.ceil(price);
  return rounded - 0.01;
}

/**
 * Calculate priority score (0-100)
 */
function calculatePriority(financialImpact, severity) {
  const baseScore = Math.min(financialImpact / 50, 100);
  const severityMultiplier = severity === 'critical' ? 1.2 : 1.0;
  return Math.min(Math.round(baseScore * severityMultiplier), 100);
}

/**
 * DEAD INVENTORY DETECTION
 */
function detectDeadInventory(products) {
  const findings = [];
  
  for (const product of products) {
    const cost = product.cost || product.cost_per_unit || 0;
    const price = product.sellingPrice || product.selling_price || 0;
    const quantity = product.quantity || product.quantity_in_stock || 0;
    const days = product.daysInStock || product.days_in_stock || 0;
    
    if (cost <= 0 || price <= 0 || quantity <= 0 || days <= 0) continue;
    
    const netMargin = calculateNetMargin(price, cost);
    
    if (days <= 180 || netMargin >= 15) continue;
    
    const capitalTiedUp = quantity * cost;
    const monthlyStorage = quantity * FBA_RATES_2024.storage_fee_monthly;
    const annualStorage = monthlyStorage * 12;
    const annualOpportunityCost = capitalTiedUp * (FBA_RATES_2024.market_return_assumption_percent / 100);
    const totalAnnualCost = annualStorage + annualOpportunityCost;
    const monthlyBleed = totalAnnualCost / 12;
    
    findings.push({
      finding_type: 'dead_inventory',
      severity: 'critical',
      asin: product.asin || product.id || 'UNKNOWN',
      product_name: product.productName || product.product_name || 'Unknown Product',
      problem_headline: `€${Math.round(totalAnnualCost)}/year bleeding in storage + lost ROI`,
      problem_description: `${days} days in stock, ${netMargin.toFixed(1)}% margin`,
      days_in_stock: days,
      net_margin_percent: Math.round(netMargin * 10) / 10,
      capital_tied_up_eur: Math.round(capitalTiedUp * 100) / 100,
      monthly_storage_cost_eur: Math.round(monthlyStorage * 100) / 100,
      annual_storage_cost_eur: Math.round(annualStorage * 100) / 100,
      annual_opportunity_cost_eur: Math.round(annualOpportunityCost * 100) / 100,
      total_annual_cost_eur: Math.round(totalAnnualCost * 100) / 100,
      monthly_bleed_eur: Math.round(monthlyBleed * 100) / 100,
      financial_impact_annual_eur: Math.round(totalAnnualCost * 100) / 100,
      impact_priority: calculatePriority(totalAnnualCost, 'critical'),
      recommended_actions: [
        {
          title: 'Liquidate',
          effort_hours: 2,
          effort_level: 'quick',
          timeline: 'this week',
          estimated_gain_eur: capitalTiedUp,
          estimated_gain_description: 'Capital freed immediately',
          action_detail: 'List at current price, reduce by 5-10% if needed to move volume fast'
        }
      ]
    });
  }
  
  return findings;
}

/**
 * LOW MARGIN DETECTION
 */
function detectLowMargin(products) {
  const findings = [];
  
  for (const product of products) {
    const cost = product.cost || product.cost_per_unit || 0;
    const price = product.sellingPrice || product.selling_price || 0;
    const quantity = product.quantity || product.quantity_in_stock || 0;
    const monthlySales = product.estimated_monthly_sales || 0;
    
    if (cost <= 0 || price <= 0 || quantity <= 5 || monthlySales <= 0) continue;
    
    const netMargin = calculateNetMargin(price, cost);
    
    if (netMargin >= 10) continue;
    
    const currentProfit = calculateNetProfit(price, cost);
    const currentMonthlyProfit = currentProfit * monthlySales;
    const currentAnnualProfit = currentMonthlyProfit * 12;
    
    const targetMargin = 0.20;
    const recommendedPrice = roundPrice(cost / (1 - targetMargin - 0.15 - (2.50 / price)));
    const priceIncrease = ((recommendedPrice - price) / price) * 100;
    const volumeChange = -priceIncrease;
    const newMonthlySales = monthlySales * (1 + volumeChange / 100);
    const newProfit = calculateNetProfit(recommendedPrice, cost);
    const newMonthlyProfit = newProfit * newMonthlySales;
    const monthlyGain = newMonthlyProfit - currentMonthlyProfit;
    const annualGain = monthlyGain * 12;
    
    findings.push({
      finding_type: 'low_margin',
      severity: 'critical',
      asin: product.asin || product.id || 'UNKNOWN',
      product_name: product.productName || product.product_name || 'Unknown Product',
      problem_headline: `€${Math.round(Math.abs(monthlyGain))}/month left on table`,
      problem_description: `${netMargin.toFixed(1)}% margin, underpriced by €${(recommendedPrice - price).toFixed(2)}`,
      current_net_margin_percent: Math.round(netMargin * 10) / 10,
      current_monthly_profit_eur: Math.round(currentMonthlyProfit * 100) / 100,
      current_annual_profit_eur: Math.round(currentAnnualProfit * 100) / 100,
      recommended_price_eur: Math.round(recommendedPrice * 100) / 100,
      price_increase_percent: Math.round(priceIncrease * 10) / 10,
      estimated_volume_change_percent: Math.round(volumeChange * 10) / 10,
      monthly_gain_eur: Math.round(monthlyGain * 100) / 100,
      annual_gain_eur: Math.round(annualGain * 100) / 100,
      financial_impact_annual_eur: Math.round(annualGain * 100) / 100,
      impact_priority: calculatePriority(annualGain, 'critical'),
      recommended_actions: [
        {
          title: 'Reprice Up',
          effort_hours: 0.5,
          effort_level: 'trivial',
          timeline: 'today',
          estimated_gain_eur: monthlyGain,
          estimated_gain_description: `€${Math.round(monthlyGain)}/month gain`,
          action_detail: `Increase price to €${recommendedPrice.toFixed(2)}`
        }
      ]
    });
  }
  
  return findings;
}

/**
 * SLOW VELOCITY DETECTION
 */
function detectSlowVelocity(products) {
  const findings = [];
  
  for (const product of products) {
    const cost = product.cost || product.cost_per_unit || 0;
    const price = product.sellingPrice || product.selling_price || 0;
    const quantity = product.quantity || product.quantity_in_stock || 0;
    const days = product.daysInStock || product.days_in_stock || 0;
    
    if (cost <= 0 || price <= 0 || quantity <= 0 || days <= 0) continue;
    
    const netMargin = calculateNetMargin(price, cost);
    
    if (netMargin < 15 || days <= 90) continue;
    
    const monthlySales = inferMonthlyVelocity(quantity, days);
    const profitPerUnit = calculateNetProfit(price, cost);
    const monthlyProfit = profitPerUnit * monthlySales;
    const annualProfit = monthlyProfit * 12;
    
    if (annualProfit >= 500) continue;
    
    const newMonthlySales = monthlySales * 1.4;
    const ppcCost = newMonthlySales * profitPerUnit * 0.25;
    const newMonthlyProfit = (profitPerUnit * newMonthlySales) - ppcCost;
    const monthlyGain = newMonthlyProfit - monthlyProfit;
    const annualGain = monthlyGain * 12;
    
    findings.push({
      finding_type: 'slow_velocity',
      severity: 'opportunity',
      asin: product.asin || product.id || 'UNKNOWN',
      product_name: product.productName || product.product_name || 'Unknown Product',
      problem_headline: `€${Math.round(monthlyGain)}/month growth potential`,
      problem_description: `${netMargin.toFixed(1)}% margin but only €${Math.round(annualProfit)}/year profit`,
      estimated_monthly_sales: Math.round(monthlySales * 10) / 10,
      profit_per_unit_eur: Math.round(profitPerUnit * 100) / 100,
      current_monthly_profit_eur: Math.round(monthlyProfit * 100) / 100,
      current_annual_profit_eur: Math.round(annualProfit * 100) / 100,
      ppc_new_monthly_sales: Math.round(newMonthlySales * 10) / 10,
      ppc_monthly_ad_cost_eur: Math.round(ppcCost * 100) / 100,
      ppc_new_monthly_profit_eur: Math.round(newMonthlyProfit * 100) / 100,
      ppc_net_gain_monthly_eur: Math.round(monthlyGain * 100) / 100,
      financial_impact_annual_eur: Math.round(annualGain * 100) / 100,
      impact_priority: calculatePriority(annualGain, 'opportunity'),
      recommended_actions: [
        {
          title: 'PPC Ads',
          effort_hours: 3,
          effort_level: 'moderate',
          timeline: 'ongoing',
          estimated_gain_eur: monthlyGain,
          estimated_gain_description: `€${Math.round(monthlyGain)}/month net gain`,
          action_detail: '40% volume increase via sponsored ads'
        }
      ]
    });
  }
  
  return findings;
}

/**
 * GENERATE FINDINGS (Main Function)
 * 
 * Runs all three detection engines and returns aggregated results
 */
export function generateFindings(products) {
  const deadInventory = detectDeadInventory(products);
  const lowMargin = detectLowMargin(products);
  const slowVelocity = detectSlowVelocity(products);
  
  let allFindings = [...deadInventory, ...lowMargin, ...slowVelocity];
  
  // Deduplicate by ASIN
  const findingsByAsin = new Map();
  for (const finding of allFindings) {
    const asin = finding.asin;
    if (!findingsByAsin.has(asin)) {
      findingsByAsin.set(asin, []);
    }
    findingsByAsin.get(asin).push(finding);
  }
  
  const deduplicatedFindings = [];
  for (const [asin, asinFindings] of findingsByAsin.entries()) {
    if (asinFindings.length === 1) {
      deduplicatedFindings.push(asinFindings[0]);
    } else {
      const highestImpact = asinFindings.reduce((prev, current) => 
        current.financial_impact_annual_eur > prev.financial_impact_annual_eur ? current : prev
      );
      deduplicatedFindings.push(highestImpact);
    }
  }
  
  // Sort by priority
  deduplicatedFindings.sort((a, b) => {
    if (b.impact_priority !== a.impact_priority) {
      return b.impact_priority - a.impact_priority;
    }
    return b.financial_impact_annual_eur - a.financial_impact_annual_eur;
  });
  
  // Calculate summary
  const criticalCount = deduplicatedFindings.filter(f => f.severity === 'critical').length;
  const opportunityCount = deduplicatedFindings.filter(f => f.severity === 'opportunity').length;
  const totalOpportunity = deduplicatedFindings.reduce((sum, f) => sum + f.financial_impact_annual_eur, 0);
  
  return {
    findings: deduplicatedFindings,
    summary: {
      total_findings: deduplicatedFindings.length,
      critical_findings: criticalCount,
      opportunity_findings: opportunityCount,
      total_annual_opportunity_eur: Math.round(totalOpportunity * 100) / 100,
      highest_impact_asin: deduplicatedFindings.length > 0 ? deduplicatedFindings[0].asin : '',
      highest_impact_amount_eur: deduplicatedFindings.length > 0 ? deduplicatedFindings[0].financial_impact_annual_eur : 0
    }
  };
}
