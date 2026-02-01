/**
 * Audit Analysis Engine - Phase 2
 * 
 * Rules-based system that analyzes product portfolio and generates findings.
 * Detects 7 types of issues/opportunities and quantifies financial impact.
 * 
 * Finding Types:
 * 1. Dead Inventory (🔴 CRITICAL)
 * 2. Unsustainable Margin (🔴 CRITICAL)
 * 3. Slow Velocity (🟡 WARNING)
 * 4. Concentration Risk (🟡 WARNING)
 * 5. Scaling Opportunity (🟢 OPPORTUNITY)
 * 6. Pricing Gap (🟢 OPPORTUNITY)
 * 7. Low Volume Risk (🟡 WARNING)
 */

// ============================================
// FINDING DETECTION FUNCTIONS
// ============================================

/**
 * Finding Type #1: Dead Inventory
 * Trigger: (days > 180 AND margin < 15%) OR (days > 200 AND margin < 20%)
 */
function detectDeadInventory(products) {
  const affected = products.filter(p => {
    const days = p.daysInStock;
    const margin = p.margin || 0;
    
    if (days === null || days === undefined) return false;
    
    return (days > 180 && margin < 15) || (days > 200 && margin < 20);
  });

  if (affected.length === 0) return null;

  // Calculate impact: 50% profit loss due to holding costs
  const totalImpact = affected.reduce((sum, p) => {
    const profitLost = (p.profitPerUnit * p.quantity) * 0.5;
    return sum + profitLost;
  }, 0);

  const capitalTiedUp = affected.reduce((sum, p) => {
    return sum + (p.cost * p.quantity);
  }, 0);

  return {
    type: 'dead_inventory',
    severity: 'critical',
    title: 'Dead Inventory',
    icon: '🔴',
    description: `${affected.length} product${affected.length > 1 ? 's' : ''} with old inventory and low margins`,
    affectedProducts: affected.map(p => ({
      asin: p.asin,
      category: p.category,
      daysInStock: p.daysInStock,
      margin: p.margin,
      quantity: p.quantity,
      totalValue: p.cost * p.quantity
    })),
    impact: {
      annualProfitLoss: totalImpact,
      capitalTiedUp: capitalTiedUp,
      monthlyOpportunityCost: totalImpact / 12
    },
    details: {
      problem: 'Dead inventory ties up working capital and accumulates holding costs',
      whyItMatters: [
        'Storage fees accumulate monthly',
        'Capital could be invested in better products',
        'Inventory may become unsellable over time'
      ]
    }
  };
}

/**
 * Finding Type #2: Unsustainable Margin
 * Trigger: margin < 10%
 */
function detectUnsustainableMargin(products) {
  const affected = products.filter(p => (p.margin || 0) < 10);

  if (affected.length === 0) return null;

  const totalRevenueLoss = affected.reduce((sum, p) => {
    return sum + (p.sellingPrice * p.quantity);
  }, 0);

  return {
    type: 'unsustainable_margin',
    severity: 'critical',
    title: 'Unsustainable Margin',
    icon: '🔴',
    description: `${affected.length} product${affected.length > 1 ? 's' : ''} with margins below 10%`,
    affectedProducts: affected.map(p => ({
      asin: p.asin,
      category: p.category,
      margin: p.margin,
      profitPerUnit: p.profitPerUnit,
      quantity: p.quantity
    })),
    impact: {
      totalRevenue: totalRevenueLoss,
      avgMargin: affected.reduce((sum, p) => sum + p.margin, 0) / affected.length
    },
    details: {
      problem: 'Margins below 10% are not profitable for FBA after fees and costs',
      whyItMatters: [
        'Amazon FBA fees consume most profit',
        'No buffer for price competition',
        'Unsustainable for long-term business'
      ]
    }
  };
}

/**
 * Finding Type #3: Slow Velocity
 * Trigger: annualProfit < €500 AND days > 90
 */
function detectSlowVelocity(products) {
  const affected = products.filter(p => {
    const days = p.daysInStock;
    const annual = p.annualProfit;
    
    if (days === null || days === undefined || annual === null || annual === undefined) return false;
    
    return annual < 500 && days > 90;
  });

  if (affected.length === 0) return null;

  const totalLowProfit = affected.reduce((sum, p) => {
    return sum + (p.annualProfit || 0);
  }, 0);

  const capitalTiedUp = affected.reduce((sum, p) => {
    return sum + (p.cost * p.quantity);
  }, 0);

  return {
    type: 'slow_velocity',
    severity: 'warning',
    title: 'Slow Velocity',
    icon: '🟡',
    description: `${affected.length} product${affected.length > 1 ? 's' : ''} generating low annual profit`,
    affectedProducts: affected.map(p => ({
      asin: p.asin,
      category: p.category,
      annualProfit: p.annualProfit,
      daysInStock: p.daysInStock,
      quantity: p.quantity
    })),
    impact: {
      totalAnnualProfit: totalLowProfit,
      capitalTiedUp: capitalTiedUp,
      avgAnnualProfit: totalLowProfit / affected.length
    },
    details: {
      problem: 'Low ROI on inventory capital',
      whyItMatters: [
        'Capital could generate better returns elsewhere',
        'Slow movers take warehouse space',
        'Poor inventory efficiency'
      ]
    }
  };
}

/**
 * Finding Type #4: Concentration Risk
 * Trigger: top 3 categories > 60% of total inventory value
 */
function detectConcentrationRisk(products) {
  // Calculate total inventory value by category
  const categoryValues = {};
  let totalValue = 0;

  products.forEach(p => {
    const value = p.cost * p.quantity;
    categoryValues[p.category] = (categoryValues[p.category] || 0) + value;
    totalValue += value;
  });

  // Sort categories by value
  const sortedCategories = Object.entries(categoryValues)
    .sort((a, b) => b[1] - a[1]);

  // Check if top 3 exceed 60%
  const top3Value = sortedCategories.slice(0, 3).reduce((sum, [_, value]) => sum + value, 0);
  const top3Percentage = (top3Value / totalValue) * 100;

  if (top3Percentage <= 60) return null;

  return {
    type: 'concentration_risk',
    severity: 'warning',
    title: 'Concentration Risk',
    icon: '🟡',
    description: `${top3Percentage.toFixed(0)}% of inventory concentrated in top 3 categories`,
    affectedProducts: sortedCategories.slice(0, 3).map(([category, value]) => ({
      category,
      value,
      percentage: ((value / totalValue) * 100).toFixed(1)
    })),
    impact: {
      concentrationPercentage: top3Percentage,
      totalValue: totalValue,
      top3Value: top3Value
    },
    details: {
      problem: 'Portfolio vulnerable to category underperformance',
      whyItMatters: [
        'Single category decline impacts entire business',
        'Seasonal risks amplified',
        'Less resilient to market changes'
      ]
    }
  };
}

/**
 * Finding Type #5: Scaling Opportunity
 * Trigger: margin > 28% AND days < 90 AND quantity > 20
 */
function detectScalingOpportunity(products) {
  const affected = products.filter(p => {
    const margin = p.margin || 0;
    const days = p.daysInStock;
    const qty = p.quantity || 0;
    
    // If days is null/undefined, consider it as good (fast-moving or new)
    const daysCheck = days === null || days === undefined || days < 90;
    
    return margin > 28 && daysCheck && qty > 20;
  });

  if (affected.length === 0) return null;

  const potentialRevenue = affected.reduce((sum, p) => {
    // Estimate 50% increase in sales with more investment
    return sum + (p.annualProfit || (p.profitPerUnit * p.quantity * 4));
  }, 0);

  return {
    type: 'scaling_opportunity',
    severity: 'opportunity',
    title: 'Scaling Opportunity',
    icon: '🟢',
    description: `${affected.length} high-margin, fast-moving product${affected.length > 1 ? 's' : ''} ready to scale`,
    affectedProducts: affected.map(p => ({
      asin: p.asin,
      category: p.category,
      margin: p.margin,
      daysInStock: p.daysInStock,
      quantity: p.quantity,
      annualProfit: p.annualProfit
    })),
    impact: {
      currentAnnualProfit: affected.reduce((sum, p) => sum + (p.annualProfit || 0), 0),
      potentialIncrease: potentialRevenue * 0.5,
      productCount: affected.length
    },
    details: {
      problem: 'High performers underutilized',
      whyItMatters: [
        'Could increase ad spend for growth',
        'Strong product-market fit proven',
        'Low risk expansion opportunity'
      ]
    }
  };
}

/**
 * Finding Type #6: Pricing Gap
 * Trigger: margin > 30% AND price < median in category
 */
function detectPricingGap(products) {
  // Calculate median price by category
  const categoryPrices = {};
  
  products.forEach(p => {
    if (!categoryPrices[p.category]) {
      categoryPrices[p.category] = [];
    }
    categoryPrices[p.category].push(p.sellingPrice);
  });

  const categoryMedians = {};
  Object.entries(categoryPrices).forEach(([category, prices]) => {
    const sorted = [...prices].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    categoryMedians[category] = sorted.length % 2 !== 0 
      ? sorted[mid] 
      : (sorted[mid - 1] + sorted[mid]) / 2;
  });

  // Find underpriced products
  const affected = products.filter(p => {
    const margin = p.margin || 0;
    const median = categoryMedians[p.category];
    return margin > 30 && p.sellingPrice < median;
  });

  if (affected.length === 0) return null;

  const potentialRevenue = affected.reduce((sum, p) => {
    const priceIncrease = categoryMedians[p.category] * 0.075; // 7.5% increase
    return sum + (priceIncrease * p.quantity);
  }, 0);

  return {
    type: 'pricing_gap',
    severity: 'opportunity',
    title: 'Pricing Gap',
    icon: '🟢',
    description: `${affected.length} product${affected.length > 1 ? 's' : ''} underpriced vs market`,
    affectedProducts: affected.map(p => ({
      asin: p.asin,
      category: p.category,
      currentPrice: p.sellingPrice,
      categoryMedian: categoryMedians[p.category],
      margin: p.margin,
      quantity: p.quantity
    })),
    impact: {
      potentialRevenue: potentialRevenue,
      avgPriceGap: affected.reduce((sum, p) => 
        sum + (categoryMedians[p.category] - p.sellingPrice), 0) / affected.length
    },
    details: {
      problem: 'Leaving money on the table with conservative pricing',
      whyItMatters: [
        'Could raise price by 5-10% without losing sales',
        'High margins indicate pricing power',
        'Market willing to pay more'
      ]
    }
  };
}

/**
 * Finding Type #7: Low Volume Risk
 * Trigger: quantity < 10 AND margin < 20%
 */
function detectLowVolumeRisk(products) {
  const affected = products.filter(p => {
    const qty = p.quantity || 0;
    const margin = p.margin || 0;
    return qty < 10 && margin < 20;
  });

  if (affected.length === 0) return null;

  return {
    type: 'low_volume_risk',
    severity: 'warning',
    title: 'Low Volume Risk',
    icon: '🟡',
    description: `${affected.length} product${affected.length > 1 ? 's' : ''} with low stock and low margins`,
    affectedProducts: affected.map(p => ({
      asin: p.asin,
      category: p.category,
      quantity: p.quantity,
      margin: p.margin,
      profitPerUnit: p.profitPerUnit
    })),
    impact: {
      totalProducts: affected.length,
      avgMargin: affected.reduce((sum, p) => sum + p.margin, 0) / affected.length,
      avgQuantity: affected.reduce((sum, p) => sum + p.quantity, 0) / affected.length
    },
    details: {
      problem: 'Low stock + low margin = cannot scale',
      whyItMatters: [
        'Not worth reordering at current margins',
        'Takes up SKU slots with little return',
        'Consider bundling or delisting'
      ]
    }
  };
}

// ============================================
// PORTFOLIO ANALYSIS
// ============================================

/**
 * Calculate portfolio KPIs
 */
export function calculatePortfolioKPIs(products) {
  if (!products || products.length === 0) {
    return {
      totalAnnualProfit: 0,
      averageMargin: 0,
      productsAtRisk: 0,
      opportunityScore: 0,
      totalProducts: 0,
      portfolioValue: 0
    };
  }

  // Total Annual Profit
  const totalAnnualProfit = products.reduce((sum, p) => {
    return sum + (p.annualProfit || 0);
  }, 0);

  // Average Margin (weighted by quantity)
  const totalQuantity = products.reduce((sum, p) => sum + (p.quantity || 0), 0);
  const weightedMargin = products.reduce((sum, p) => {
    return sum + ((p.margin || 0) * (p.quantity || 0));
  }, 0);
  const averageMargin = totalQuantity > 0 ? weightedMargin / totalQuantity : 0;

  // Products at Risk
  const productsAtRisk = products.filter(p => p.riskLevel === 'red').length;

  // Portfolio Value
  const portfolioValue = products.reduce((sum, p) => {
    return sum + ((p.cost || 0) * (p.quantity || 0));
  }, 0);

  // Opportunity Score (0-10)
  let opportunityScore = 5; // Base score
  
  // +1 if avg margin > 25%
  if (averageMargin > 25) opportunityScore += 1;
  
  // +1 if <20% products at risk
  const riskPercentage = (productsAtRisk / products.length) * 100;
  if (riskPercentage < 20) opportunityScore += 1;
  
  // +1 if >50% high-velocity products (days < 90)
  const highVelocity = products.filter(p => 
    p.daysInStock !== null && p.daysInStock !== undefined && p.daysInStock < 90
  ).length;
  if ((highVelocity / products.length) > 0.5) opportunityScore += 1;
  
  // +1 if good category diversity (top 3 < 60%)
  const categoryValues = {};
  let totalValue = 0;
  products.forEach(p => {
    const value = (p.cost || 0) * (p.quantity || 0);
    categoryValues[p.category] = (categoryValues[p.category] || 0) + value;
    totalValue += value;
  });
  const sortedCategories = Object.values(categoryValues).sort((a, b) => b - a);
  const top3Value = sortedCategories.slice(0, 3).reduce((sum, v) => sum + v, 0);
  if (totalValue > 0 && (top3Value / totalValue) < 0.6) opportunityScore += 1;
  
  // -1 if high concentration risk
  if (totalValue > 0 && (top3Value / totalValue) > 0.7) opportunityScore -= 1;
  
  // -1 if many slow movers (>30% with annual profit < 500)
  const slowMovers = products.filter(p => 
    p.annualProfit !== null && p.annualProfit !== undefined && p.annualProfit < 500
  ).length;
  if ((slowMovers / products.length) > 0.3) opportunityScore -= 1;
  
  // Clamp to 0-10
  opportunityScore = Math.max(0, Math.min(10, opportunityScore));

  return {
    totalAnnualProfit,
    averageMargin,
    productsAtRisk,
    opportunityScore,
    totalProducts: products.length,
    portfolioValue
  };
}

/**
 * Get opportunity score label
 */
export function getOpportunityScoreLabel(score) {
  if (score >= 8) return { label: 'EXCELLENT', color: 'green' };
  if (score >= 6) return { label: 'GOOD', color: 'teal' };
  if (score >= 4) return { label: 'MODERATE', color: 'yellow' };
  return { label: 'NEEDS WORK', color: 'red' };
}

// ============================================
// MAIN AUDIT ENGINE
// ============================================

/**
 * Run complete audit analysis on product portfolio
 * Returns all findings grouped by severity
 */
export function runAuditAnalysis(products) {
  if (!products || products.length === 0) {
    return {
      findings: [],
      kpis: calculatePortfolioKPIs([]),
      summary: null
    };
  }

  // Detect all finding types
  const findings = [
    detectDeadInventory(products),
    detectUnsustainableMargin(products),
    detectSlowVelocity(products),
    detectConcentrationRisk(products),
    detectScalingOpportunity(products),
    detectPricingGap(products),
    detectLowVolumeRisk(products)
  ].filter(f => f !== null);

  // Group by severity
  const critical = findings.filter(f => f.severity === 'critical');
  const warning = findings.filter(f => f.severity === 'warning');
  const opportunity = findings.filter(f => f.severity === 'opportunity');

  // Calculate KPIs
  const kpis = calculatePortfolioKPIs(products);

  // Generate summary
  const summary = generatePortfolioSummary(products, findings, kpis);

  return {
    findings: [...critical, ...warning, ...opportunity],
    critical,
    warning,
    opportunity,
    kpis,
    summary,
    generatedAt: new Date().toISOString()
  };
}

/**
 * Generate portfolio health summary
 */
function generatePortfolioSummary(products, findings, kpis) {
  const strengths = [];
  const concerns = [];

  // Analyze strengths
  if (kpis.averageMargin > 25) {
    strengths.push(`Average margin (${kpis.averageMargin.toFixed(1)}%) exceeds target (25%)`);
  }
  
  const healthyPercentage = ((products.length - kpis.productsAtRisk) / products.length) * 100;
  if (healthyPercentage >= 70) {
    strengths.push(`${healthyPercentage.toFixed(0)}% of products are healthy`);
  }

  // Check category diversity
  const categories = new Set(products.map(p => p.category));
  if (categories.size >= 3) {
    strengths.push('Good inventory diversity across categories');
  }

  // High margin products
  const highMargin = products.filter(p => (p.margin || 0) > 30).length;
  if (highMargin > 0) {
    strengths.push(`${highMargin} product${highMargin > 1 ? 's' : ''} with excellent margins (>30%)`);
  }

  // Analyze concerns
  const riskPercentage = (kpis.productsAtRisk / products.length) * 100;
  if (riskPercentage > 0) {
    concerns.push(`${riskPercentage.toFixed(0)}% of products at risk`);
  }

  const deadInventory = findings.find(f => f.type === 'dead_inventory');
  if (deadInventory) {
    concerns.push('Some dead inventory tying up capital');
  }

  const concentrationRisk = findings.find(f => f.type === 'concentration_risk');
  if (concentrationRisk) {
    concerns.push('High concentration in few categories');
  }

  const lowMargin = products.filter(p => (p.margin || 0) < 15).length;
  if (lowMargin > 0) {
    concerns.push(`${lowMargin} product${lowMargin > 1 ? 's' : ''} with concerning margins (<15%)`);
  }

  return {
    score: kpis.opportunityScore,
    scoreLabel: getOpportunityScoreLabel(kpis.opportunityScore),
    strengths,
    concerns
  };
}
