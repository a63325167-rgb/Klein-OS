/**
 * Business Intelligence Engine
 * Generates dynamic insights, recommendations, and interpretations
 * Version: 3.0.0 - Quantified recommendations with real ROI impact
 */

import { roundToPrecision, safeDivide } from './precision';
import { generateRecommendations as generateNewRecommendations } from '../lib/recommendations';

/**
 * Generate performance tier analysis
 */
export function analyzePerformanceTier(result) {
  const { totals } = result;
  const margin = totals.profit_margin || 0;
  const roi = totals.roi_percent || 0;

  let tier = 'POOR';
  let emoji = '🔻';
  let color = 'red';
  let description = '';

  if (margin >= 30) {
    tier = 'EXCEPTIONAL';
    emoji = '🚀';
    color = 'green';
    description = 'Outstanding profitability with excellent scalability potential';
  } else if (margin >= 25) {
    tier = 'EXCELLENT';
    emoji = '⭐';
    color = 'green';
    description = 'Strong performance with healthy profit margins';
  } else if (margin >= 18) {
    tier = 'GOOD';
    emoji = '👍';
    color = 'blue';
    description = 'Solid performance with room for optimization';
  } else if (margin >= 12) {
    tier = 'FAIR';
    emoji = '⚠️';
    color = 'yellow';
    description = 'Moderate performance, cost optimization recommended';
  } else if (margin >= 0) {
    tier = 'POOR';
    emoji = '🔻';
    color = 'orange';
    description = 'Low margins, significant improvement needed';
  } else {
    tier = 'CRITICAL';
    emoji = '🚨';
    color = 'red';
    description = 'Losing money, immediate action required';
  }

  return {
    tier,
    emoji,
    color,
    description,
    score: Math.round((margin + roi) / 2)
  };
}

/**
 * Generate business insights
 */
export function generateInsights(result) {
  const { totals, smallPackageCheck, amazonFee, shipping } = result;
  const insights = [];

  // Profit margin insight
  const margin = totals.profit_margin || 0;
  if (margin >= 20) {
    insights.push({
      title: 'Profit Stability',
      description: `Your profit margin of ${margin.toFixed(1)}% indicates strong financial health. This is ${(margin - 20).toFixed(1)}% above the healthy threshold.`,
      type: 'success',
      icon: '📈'
    });
  } else if (margin >= 10) {
    insights.push({
      title: 'Profit Stability',
      description: `Your profit margin of ${margin.toFixed(1)}% is in the acceptable range, but there's room for improvement through cost optimization.`,
      type: 'warning',
      icon: '📊'
    });
  } else {
    insights.push({
      title: 'Profit Concern',
      description: `Your profit margin of ${margin.toFixed(1)}% is below optimal levels. Consider reducing costs or increasing selling price.`,
      type: 'danger',
      icon: '⚠️'
    });
  }

  // Shipping optimization
  if (smallPackageCheck.isEligible) {
    insights.push({
      title: 'Shipping Optimization',
      description: `Excellent! Your product qualifies for Small Package shipping, saving you €1.71 per unit. This represents a ${((1.71 / totals.total_cost) * 100).toFixed(1)}% cost reduction.`,
      type: 'success',
      icon: '📦'
    });
  } else if (smallPackageCheck.failures && smallPackageCheck.failures.length > 0) {
    const primaryIssue = smallPackageCheck.failures[0];
    insights.push({
      title: 'Shipping Opportunity',
      description: `Your product doesn't qualify for Small Package due to: ${primaryIssue}. Adjusting this could save €1.71 per unit in shipping costs.`,
      type: 'info',
      icon: '💡'
    });
  }

  // ROI analysis
  const roi = totals.roi_percent || 0;
  if (roi >= 35) {
    insights.push({
      title: 'Return on Investment',
      description: `Your ${roi.toFixed(1)}% ROI is EXCELLENT, well above the 25-35% industry benchmark for Amazon FBA. Your product is highly profitable—focus on scaling volume while maintaining quality.`,
      type: 'success',
      icon: '💰'
    });
  } else if (roi >= 25) {
    insights.push({
      title: 'Return on Investment',
      description: `Your ${roi.toFixed(1)}% ROI is GOOD and meets the healthy 25-35% industry benchmark for Amazon FBA. This product shows strong profitability potential.`,
      type: 'success',
      icon: '💵'
    });
  } else if (roi >= 15) {
    insights.push({
      title: 'Return on Investment',
      description: `Your ${roi.toFixed(1)}% ROI is FAIR and acceptable for Amazon FBA. Consider optimizing costs or pricing to reach the 25-35% industry benchmark.`,
      type: 'warning',
      icon: '📊'
    });
  } else {
    insights.push({
      title: 'ROI Optimization',
      description: `Your ${roi.toFixed(1)}% ROI is below the 15% minimum threshold for Amazon FBA. Focus on reducing acquisition costs or improving selling price to enhance returns.`,
      type: 'danger',
      icon: '📉'
    });
  }

  // Cost efficiency
  const amazonFeePct = (amazonFee.amount / totals.total_cost) * 100;
  const shippingPct = (shipping.cost / totals.total_cost) * 100;
  
  if (amazonFeePct > 30) {
    insights.push({
      title: 'Fee Structure',
      description: `Amazon fees represent ${amazonFeePct.toFixed(1)}% of your total costs. This is high - consider negotiating better rates or exploring alternative categories.`,
      type: 'warning',
      icon: '💳'
    });
  }

  if (shippingPct > 20) {
    insights.push({
      title: 'Logistics Efficiency',
      description: `Shipping costs are ${shippingPct.toFixed(1)}% of total costs. Optimizing package dimensions or weight could reduce this by 4-8%.`,
      type: 'info',
      icon: '🚚'
    });
  } else if (shippingPct < 10) {
    insights.push({
      title: 'Logistics Efficiency',
      description: `Excellent! Shipping costs are only ${shippingPct.toFixed(1)}% of total costs. Your logistics are well optimized.`,
      type: 'success',
      icon: '✅'
    });
  }

  return insights.slice(0, 4); // Return top 4 insights
}

/**
 * Generate actionable recommendations with quantified ROI impact
 * 
 * NEW APPROACH (v3.0):
 * - Uses dedicated recommendation engine from lib/recommendations
 * - Each recommendation shows specific € savings with clear math
 * - Only shows top 3 most impactful recommendations
 * - All recommendations are actionable (seller can actually do this)
 */
export function generateRecommendations(result) {
  // Use new recommendation engine
  const newRecommendations = generateNewRecommendations(result);
  
  // If new engine returns recommendations, use them
  if (newRecommendations && newRecommendations.length > 0) {
    return newRecommendations;
  }
  
  // Fallback: generic recommendations (only if new engine returns nothing)
  const { totals } = result;
  const margin = totals.profit_margin || 0;
  const roi = totals.roi_percent || 0;

  const fallbackRecommendations = [];
  
  if (margin >= 25 && roi >= 100) {
    fallbackRecommendations.push({
      id: 'strong-performance',
      title: 'Strong Performance Detected',
      description: `Your product shows excellent margins (${margin.toFixed(1)}%) and ROI (${roi.toFixed(1)}%). Focus on scaling volume while maintaining quality.`,
      priority: 'medium',
      type: 'growth',
      icon: '⭐',
      priority_score: 50,
      actionable: 'Monitor inventory levels and consider increasing order volumes gradually.'
    });
  } else if (margin < 10 || roi < 25) {
    fallbackRecommendations.push({
      id: 'low-profitability',
      title: 'Profitability Optimization Needed',
      description: `Current margin (${margin.toFixed(1)}%) or ROI (${roi.toFixed(1)}%) is below optimal levels. Review pricing and costs.`,
      priority: 'high',
      type: 'pricing',
      icon: '⚠️',
      priority_score: 80,
      actionable: 'Analyze competitor pricing and negotiate with suppliers for better rates.'
    });
  } else {
    fallbackRecommendations.push({
      id: 'continue-monitoring',
      title: 'Healthy Performance',
      description: `Your product metrics are in acceptable ranges. Continue monitoring for optimization opportunities.`,
      priority: 'low',
      type: 'operations',
      icon: '✅',
      priority_score: 30,
      actionable: 'Review performance weekly and adjust strategy as needed.'
    });
}

  return fallbackRecommendations.slice(0, 3);
}

/**
 * Generate comparative data for charts
 */
export function generateChartData(result) {
  const { totals, amazonFee, shipping, vat, returnBuffer, input } = result;

  // Profit distribution
  const profitDistribution = [
    { name: 'Net Profit', value: Math.max(totals.net_profit, 0), color: '#00FFE0' },
    { name: 'Amazon Fee', value: amazonFee.amount, color: '#FF6B9D' },
    { name: 'Shipping', value: shipping.cost, color: '#8B5CF6' },
    { name: 'VAT', value: vat.netVATLiability || 0, color: '#F59E0B' },
    { name: 'Return Buffer', value: returnBuffer, color: '#EF4444' },
    { name: 'Product Cost', value: input.buying_price, color: '#6366F1' }
  ];

  // Revenue vs Cost comparison
  const revenueVsCost = [
    {
      category: 'Revenue',
      amount: input.selling_price,
      color: '#00FFE0'
    },
    {
      category: 'Total Costs',
      amount: totals.total_cost,
      color: '#FF6B9D'
    },
    {
      category: 'Net Profit',
      amount: Math.max(totals.net_profit, 0),
      color: '#10B981'
    }
  ];

  // Cost breakdown for stacked chart
  const costBreakdown = [
    {
      category: 'Product',
      Buying: input.buying_price,
      Shipping: 0,
      Fees: 0,
      Taxes: 0,
      Other: 0
    },
    {
      category: 'Logistics',
      Buying: 0,
      Shipping: shipping.cost,
      Fees: 0,
      Taxes: 0,
      Other: 0
    },
    {
      category: 'Platform',
      Buying: 0,
      Shipping: 0,
      Fees: amazonFee.amount,
      Taxes: 0,
      Other: 0
    },
    {
      category: 'Taxes',
      Buying: 0,
      Shipping: 0,
      Fees: 0,
      Taxes: vat.netVATLiability || 0,
      Other: 0
    },
    {
      category: 'Buffer',
      Buying: 0,
      Shipping: 0,
      Fees: 0,
      Taxes: 0,
      Other: returnBuffer
    }
  ];

  // Break-even analysis
  const fixedCosts = input.fixed_costs || 500; // Use fixed costs from form data
  const breakEvenData = [];
  for (let units = 0; units <= 100; units += 10) {
    const revenue = input.selling_price * units;
    const costs = (totals.total_cost * units) + fixedCosts;
    breakEvenData.push({
      units,
      revenue,
      costs,
      profit: revenue - costs
    });
  }

  return {
    profitDistribution,
    revenueVsCost,
    costBreakdown,
    breakEvenData
  };
}

