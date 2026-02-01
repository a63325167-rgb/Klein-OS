/**
 * Risk Assessment Utility
 * Calculates product risk score (0-100, lower = riskier) based on multiple factors
 */

/**
 * Risk factor evaluation functions
 */

// 1. Low margin risk (<15%)
function evaluateMarginRisk(margin) {
  if (margin < 5) {
    return {
      points: -30,
      severity: 'critical',
      icon: '🔴',
      label: 'Critical margin risk',
      description: `Extremely low margin (${margin.toFixed(1)}%)`,
      impact: 'One cost increase wipes out all profit',
      recommendation: 'DO NOT PROCEED - Find better product'
    };
  } else if (margin < 10) {
    return {
      points: -25,
      severity: 'high',
      icon: '🔴',
      label: 'High margin risk',
      description: `Very low margin (${margin.toFixed(1)}%)`,
      impact: 'Minimal buffer for unexpected costs',
      recommendation: 'Negotiate 20%+ COGS reduction or increase price'
    };
  } else if (margin < 15) {
    return {
      points: -20,
      severity: 'medium',
      icon: '🟡',
      label: 'Medium margin risk',
      description: `Low margin (${margin.toFixed(1)}%)`,
      impact: 'Limited room for promotions or discounts',
      recommendation: 'Improve margin to 20%+ before scaling'
    };
  } else if (margin < 25) {
    return {
      points: 0,
      severity: 'low',
      icon: '🟡',
      label: 'Acceptable margin',
      description: `Medium margin (${margin.toFixed(1)}%)`,
      impact: 'One return = significant profit loss',
      recommendation: 'Monitor costs closely'
    };
  } else {
    return {
      points: 10,
      severity: 'none',
      icon: '🟢',
      label: 'Healthy margin',
      description: `Good margin (${margin.toFixed(1)}%)`,
      impact: 'Strong buffer for unexpected costs',
      recommendation: 'Good foundation for scaling'
    };
  }
}

// 2. High COGS risk (>€200)
function evaluateCOGSRisk(cogs) {
  if (cogs > 500) {
    return {
      points: -25,
      severity: 'high',
      icon: '🔴',
      label: 'Very high COGS',
      description: `Expensive product (€${cogs.toFixed(2)})`,
      impact: 'High capital requirement, slow inventory turns',
      recommendation: 'Requires €50k+ working capital to scale'
    };
  } else if (cogs > 200) {
    return {
      points: -20,
      severity: 'medium',
      icon: '🟡',
      label: 'High COGS',
      description: `High unit cost (€${cogs.toFixed(2)})`,
      impact: 'Significant capital tied up in inventory',
      recommendation: 'Start with small batch (25-50 units)'
    };
  } else if (cogs > 100) {
    return {
      points: -5,
      severity: 'low',
      icon: '🟡',
      label: 'Medium COGS',
      description: `Moderate unit cost (€${cogs.toFixed(2)})`,
      impact: 'Manageable inventory investment',
      recommendation: 'Standard inventory planning applies'
    };
  } else {
    return {
      points: 5,
      severity: 'none',
      icon: '🟢',
      label: 'Low COGS',
      description: `Affordable unit cost (€${cogs.toFixed(2)})`,
      impact: 'Easy to test and scale',
      recommendation: 'Low barrier to entry'
    };
  }
}

// 3. Heavy/bulky product risk (>10kg)
function evaluateWeightRisk(weight, dimensionalWeight) {
  const effectiveWeight = Math.max(weight, dimensionalWeight || 0);
  
  if (effectiveWeight > 100) {
    return {
      points: -20,
      severity: 'high',
      icon: '🔴',
      label: 'Extremely heavy product',
      description: `Very heavy (${effectiveWeight.toFixed(1)}kg)`,
      impact: 'Freight shipping required, very high storage fees',
      recommendation: 'Expect €100+ shipping, €50+ monthly storage'
    };
  } else if (effectiveWeight > 20) {
    return {
      points: -15,
      severity: 'medium',
      icon: '🟡',
      label: 'Heavy product',
      description: `Heavy (${effectiveWeight.toFixed(1)}kg)`,
      impact: 'High shipping + storage costs',
      recommendation: 'Factor €20-40 shipping, €15-30 monthly storage'
    };
  } else if (effectiveWeight > 10) {
    return {
      points: -10,
      severity: 'low',
      icon: '🟡',
      label: 'Medium-heavy product',
      description: `Medium weight (${effectiveWeight.toFixed(1)}kg)`,
      impact: 'Elevated shipping costs',
      recommendation: 'Shipping €10-20 per unit'
    };
  } else {
    return {
      points: 5,
      severity: 'none',
      icon: '🟢',
      label: 'Light product',
      description: `Light weight (${effectiveWeight.toFixed(1)}kg)`,
      impact: 'Low shipping and storage costs',
      recommendation: 'Cost-efficient logistics'
    };
  }
}

// 4. High return category risk
function evaluateReturnRisk(category) {
  const highReturnCategories = {
    fashion: { rate: 35, label: 'Fashion/Apparel' },
    apparel: { rate: 35, label: 'Fashion/Apparel' },
    clothing: { rate: 35, label: 'Fashion/Apparel' },
    electronics: { rate: 20, label: 'Electronics' },
    tech: { rate: 20, label: 'Electronics' }
  };
  
  const categoryKey = (category || '').toLowerCase();
  const matchedCategory = Object.keys(highReturnCategories).find(key => 
    categoryKey.includes(key)
  );
  
  if (matchedCategory) {
    const categoryData = highReturnCategories[matchedCategory];
    return {
      points: -20,
      severity: 'high',
      icon: '🔴',
      label: 'High return category',
      description: `${categoryData.label} (${categoryData.rate}% avg returns)`,
      impact: 'Significant profit erosion from returns',
      recommendation: 'Add detailed sizing/specs, quality photos to reduce returns'
    };
  } else {
    return {
      points: 5,
      severity: 'none',
      icon: '🟢',
      label: 'Low return category',
      description: `${category} (5-10% avg returns)`,
      impact: 'Minimal return impact',
      recommendation: 'Standard return handling'
    };
  }
}

// 5. Seasonal product risk
function evaluateSeasonalRisk(productName) {
  const seasonalKeywords = [
    { keywords: ['christmas', 'xmas', 'holiday', 'advent'], season: 'Christmas' },
    { keywords: ['halloween', 'costume'], season: 'Halloween' },
    { keywords: ['summer', 'beach', 'pool', 'inflatable'], season: 'Summer' },
    { keywords: ['winter', 'snow', 'ski'], season: 'Winter' },
    { keywords: ['easter', 'egg'], season: 'Easter' },
    { keywords: ['valentine'], season: "Valentine's Day" }
  ];
  
  const name = (productName || '').toLowerCase();
  const matchedSeason = seasonalKeywords.find(s => 
    s.keywords.some(kw => name.includes(kw))
  );
  
  if (matchedSeason) {
    return {
      points: -10,
      severity: 'medium',
      icon: '🟡',
      label: 'Seasonal product',
      description: `${matchedSeason.season} seasonal item`,
      impact: 'Limited selling window, off-season storage costs',
      recommendation: 'Order only for peak season, plan clearance strategy'
    };
  } else {
    return {
      points: 0,
      severity: 'none',
      icon: '🟢',
      label: 'Year-round product',
      description: 'Non-seasonal demand',
      impact: 'Consistent sales throughout year',
      recommendation: 'Standard inventory planning'
    };
  }
}

// 6. Slow break-even risk (>20 units)
function evaluateBreakEvenRisk(setupCost, netProfit) {
  if (netProfit <= 0) {
    return {
      points: -30,
      severity: 'critical',
      icon: '🔴',
      label: 'Unprofitable',
      description: 'Negative profit per unit',
      impact: 'Current structure loses money on each sale',
      recommendation: 'Not recommended without improvements — product is not currently viable'
    };
  }
  
  const unitsToBreakEven = Math.ceil(setupCost / netProfit);
  
  if (unitsToBreakEven > 50) {
    return {
      points: -20,
      severity: 'high',
      icon: '🔴',
      label: 'Very slow break-even',
      description: `${unitsToBreakEven} units to recover setup costs`,
      impact: 'Capital likely tied up for an extended period',
      recommendation: 'Proceed only with strong demand validation and cost improvements'
    };
  } else if (unitsToBreakEven > 20) {
    return {
      points: -15,
      severity: 'medium',
      icon: '🟡',
      label: 'Slow break-even',
      description: `${unitsToBreakEven} units to recover setup costs`,
      impact: 'Moderate capital recovery timeline',
      recommendation: 'Pilot with minimum order quantity and monitor closely'
    };
  } else if (unitsToBreakEven > 10) {
    return {
      points: -5,
      severity: 'low',
      icon: '🟡',
      label: 'Medium break-even',
      description: `${unitsToBreakEven} units to recover setup costs`,
      impact: 'Reasonable capital recovery time',
      recommendation: 'Standard launch approach is reasonable'
    };
  } else {
    return {
      points: 10,
      severity: 'none',
      icon: '🟢',
      label: 'Fast break-even',
      description: `${unitsToBreakEven} units to recover setup costs`,
      impact: 'Quick capital recovery',
      recommendation: 'Low financial risk'
    };
  }
}

/**
 * Calculate overall risk score and assessment
 */
export function calculateRiskAssessment(result) {
  if (!result || !result.totals || !result.input) {
    return {
      score: 0,
      level: 'UNKNOWN',
      color: 'gray',
      emoji: '❓',
      factors: [],
      recommendation: 'Insufficient data for risk assessment'
    };
  }

  // Extract data
  const margin = result.totals.profit_margin || 0;
  const cogs = parseFloat(result.input.buying_price) || 0;
  const weight = parseFloat(result.input.weight_kg) || 0;
  const dimensionalWeight = result.shipping?.dimensionalWeight || 0;
  const category = result.input.category || '';
  const productName = result.input.product_name || result.input.productName || '';
  const setupCost = parseFloat(result.input.fixed_costs) || 500;
  const netProfit = result.totals.net_profit || 0;

  // Evaluate all risk factors
  const factors = [
    evaluateMarginRisk(margin),
    evaluateCOGSRisk(cogs),
    evaluateWeightRisk(weight, dimensionalWeight),
    evaluateReturnRisk(category),
    evaluateSeasonalRisk(productName),
    evaluateBreakEvenRisk(setupCost, netProfit)
  ];

  // Calculate total score (start at 100, subtract/add points)
  const baseScore = 100;
  const totalPoints = factors.reduce((sum, factor) => sum + factor.points, 0);
  const score = Math.max(0, Math.min(100, baseScore + totalPoints));

  // Determine risk level
  let level, color, emoji, recommendation, orderSize;
  
  if (score < 30) {
    level = 'Critical Risk - Action Required';
    color = 'red';
    emoji = '🔴';
    recommendation = 'Not recommended without improvements — too many risk factors. Address key issues or consider alternatives.';
    orderSize = 0;
  } else if (score < 50) {
    level = 'Elevated Risk - Review Carefully';
    color = 'red';
    emoji = '⚠️';
    recommendation = 'Elevated risk — limit to 25–50 units for a pilot. Scale only if demand is proven.';
    orderSize = 50;
  } else if (score < 65) {
    level = 'Moderate-High Risk - Monitor Closely';
    color = 'orange';
    emoji = '⚠️';
    recommendation = 'Moderate risk — consider 50–100 units for testing and monitor metrics closely.';
    orderSize = 100;
  } else if (score < 80) {
    level = 'Moderate Risk - Monitor Closely';
    color = 'yellow';
    emoji = '🟡';
    recommendation = 'Acceptable risk — 100–200 units with a standard launch approach.';
    orderSize = 200;
  } else if (score < 90) {
    level = 'Low Risk - Proceed with Confidence';
    color = 'green';
    emoji = '✅';
    recommendation = 'Low risk — 200–500 units recommended. Good candidate for scaling.';
    orderSize = 500;
  } else {
    level = 'Very Low Risk - Strong Candidate';
    color = 'emerald';
    emoji = '🎉';
    recommendation = 'Excellent risk profile — 500+ units appropriate. Scale with confidence.';
    orderSize = 1000;
  }

  // Filter out factors with no risk (severity: 'none' but keep positive ones)
  const significantFactors = factors.filter(f => 
    f.severity !== 'none' || f.points > 0
  );

  return {
    score,
    level,
    color,
    emoji,
    factors: significantFactors,
    recommendation,
    orderSize,
    breakdown: {
      margin: factors[0],
      cogs: factors[1],
      weight: factors[2],
      returns: factors[3],
      seasonal: factors[4],
      breakEven: factors[5]
    }
  };
}
