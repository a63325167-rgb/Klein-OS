// src/utils/exportAnalytics.ts

import { BulkProductResult } from '../types/upload';

/**
 * Analytics report structure
 */
export interface AnalyticsReport {
  summary: {
    totalProducts: number;
    totalMonthlyProfit: number;
    averageProfitMargin: number;
    averageHealthScore: number;
  };
  profitability: {
    profitableCount: number;
    unprofitableCount: number;
    profitRange: { min: number; max: number };
    marginRange: { min: number; max: number };
  };
  riskDistribution: {
    red: number;
    yellow: number;
    green: number;
    byCategory: Record<string, { red: number; yellow: number; green: number }>;
  };
  timing: {
    averageBreakEvenDays: number;
    averageCashRunway: number;
    averageTurnoverDays: number;
  };
  topPerformers: BulkProductResult[];
  bottomPerformers: BulkProductResult[];
  alerts: string[];
}

/**
 * Generate comprehensive analytics report from products
 * 
 * @param products - Array of calculated products
 * @returns Analytics report with all metrics
 */
export function generateAnalytics(products: BulkProductResult[]): AnalyticsReport {
  if (!products || products.length === 0) {
    return getEmptyAnalytics();
  }

  // Summary metrics
  const totalMonthlyProfit = products.reduce((sum, p) => sum + (p.totalMonthlyProfit || 0), 0);
  
  // Calculate averages, ignoring NaN/undefined
  const validMargins = products.filter(p => !isNaN(p.profitMargin) && p.profitMargin !== undefined);
  const averageProfitMargin = validMargins.length > 0
    ? validMargins.reduce((sum, p) => sum + p.profitMargin, 0) / validMargins.length
    : 0;
  
  const validHealthScores = products.filter(p => !isNaN(p.healthScore) && p.healthScore !== undefined);
  const averageHealthScore = validHealthScores.length > 0
    ? validHealthScores.reduce((sum, p) => sum + p.healthScore, 0) / validHealthScores.length
    : 0;

  // Profitability analysis
  const profitableProducts = products.filter(p => p.profitPerUnit > 0);
  const unprofitableProducts = products.filter(p => p.profitPerUnit <= 0);
  
  const profits = products.map(p => p.profitPerUnit);
  const margins = products.map(p => p.profitMargin);
  
  const profitRange = {
    min: Math.min(...profits),
    max: Math.max(...profits)
  };
  
  const marginRange = {
    min: Math.min(...margins),
    max: Math.max(...margins)
  };

  // Risk distribution - count ALL 5 risk dimensions per product
  const overallRiskDist = countAllRiskDimensions(products);
  const byCategory: Record<string, { red: number; yellow: number; green: number }> = {};
  
  // Group by category and count risks
  const categoryMap = new Map<string, BulkProductResult[]>();
  products.forEach(p => {
    const cat = p.category || 'Uncategorized';
    if (!categoryMap.has(cat)) {
      categoryMap.set(cat, []);
    }
    categoryMap.get(cat)!.push(p);
  });
  
  categoryMap.forEach((categoryProducts, category) => {
    byCategory[category] = countAllRiskDimensions(categoryProducts);
  });

  // Timing metrics
  const validBreakEvenDays = products.filter(p => p.breakEvenDays < 999);
  const averageBreakEvenDays = validBreakEvenDays.length > 0
    ? validBreakEvenDays.reduce((sum, p) => sum + p.breakEvenDays, 0) / validBreakEvenDays.length
    : 999;
  
  const averageCashRunway = products.reduce((sum, p) => sum + p.cashRunway, 0) / products.length;
  
  const validTurnoverDays = products.filter(p => p.turnoverDays < 999);
  const averageTurnoverDays = validTurnoverDays.length > 0
    ? validTurnoverDays.reduce((sum, p) => sum + p.turnoverDays, 0) / validTurnoverDays.length
    : 999;

  // Top and bottom performers (top 10 or all if < 10)
  const sortedByProfit = [...products].sort((a, b) => b.profitPerUnit - a.profitPerUnit);
  const topPerformers = sortedByProfit.slice(0, Math.min(10, products.length));
  const bottomPerformers = sortedByProfit.slice(-Math.min(10, products.length)).reverse();

  // Generate alerts
  const alerts = generateAlerts(products, averageHealthScore, overallRiskDist);

  return {
    summary: {
      totalProducts: products.length,
      totalMonthlyProfit,
      averageProfitMargin,
      averageHealthScore
    },
    profitability: {
      profitableCount: profitableProducts.length,
      unprofitableCount: unprofitableProducts.length,
      profitRange,
      marginRange
    },
    riskDistribution: {
      red: overallRiskDist.red,
      yellow: overallRiskDist.yellow,
      green: overallRiskDist.green,
      byCategory
    },
    timing: {
      averageBreakEvenDays,
      averageCashRunway,
      averageTurnoverDays
    },
    topPerformers,
    bottomPerformers,
    alerts
  };
}

/**
 * Count all risk dimensions across products
 * Each product has 5 risk dimensions: profitability, breakEven, cashFlow, competition, inventory
 * 
 * @param products - Array of products
 * @returns Risk counts
 */
function countAllRiskDimensions(products: BulkProductResult[]): { red: number; yellow: number; green: number } {
  let red = 0;
  let yellow = 0;
  let green = 0;
  
  products.forEach(p => {
    // Count all 5 risk dimensions
    const risks = [
      p.profitabilityRisk,
      p.breakEvenRisk,
      p.cashFlowRisk,
      p.competitionRisk,
      p.inventoryRisk
    ];
    
    risks.forEach(risk => {
      if (risk === 'red') red++;
      else if (risk === 'yellow') yellow++;
      else if (risk === 'green') green++;
    });
  });
  
  return { red, yellow, green };
}

/**
 * Generate alerts for high-risk or problematic products
 * 
 * @param products - Array of products
 * @param averageHealthScore - Portfolio average health score
 * @param riskDist - Overall risk distribution
 * @returns Array of alert messages
 */
function generateAlerts(
  products: BulkProductResult[],
  averageHealthScore: number,
  riskDist: { red: number; yellow: number; green: number }
): string[] {
  const alerts: string[] = [];
  const totalProducts = products.length;
  
  // Individual product alerts for RED risks
  products.forEach(p => {
    const redRisks: string[] = [];
    if (p.profitabilityRisk === 'red') redRisks.push('profitability');
    if (p.breakEvenRisk === 'red') redRisks.push('break-even');
    if (p.cashFlowRisk === 'red') redRisks.push('cash flow');
    if (p.competitionRisk === 'red') redRisks.push('competition');
    if (p.inventoryRisk === 'red') redRisks.push('inventory');
    
    if (redRisks.length > 0) {
      alerts.push(`⚠️ High risk: ${p.name} (${redRisks.join(', ')})`);
    }
  });
  
  // Portfolio-level alerts
  const unprofitableCount = products.filter(p => p.profitPerUnit <= 0).length;
  const unprofitablePercent = (unprofitableCount / totalProducts) * 100;
  
  if (unprofitablePercent > 30) {
    alerts.push(`⚠️ ${unprofitablePercent.toFixed(0)}% of portfolio is unprofitable`);
  }
  
  // Average health score alert
  if (averageHealthScore < 50) {
    alerts.push(`⚠️ Portfolio average health is below 50 (${averageHealthScore.toFixed(0)})`);
  }
  
  // Risk concentration alerts (>50% RED in any dimension)
  const totalRiskCount = riskDist.red + riskDist.yellow + riskDist.green;
  const redPercent = totalRiskCount > 0 ? (riskDist.red / totalRiskCount) * 100 : 0;
  
  if (redPercent > 50) {
    alerts.push(`⚠️ Portfolio risk concentration: ${redPercent.toFixed(0)}% of all risk assessments are RED`);
  }
  
  // Check individual dimensions
  const dimensions = [
    { name: 'profitability', key: 'profitabilityRisk' as const },
    { name: 'break-even', key: 'breakEvenRisk' as const },
    { name: 'cash flow', key: 'cashFlowRisk' as const },
    { name: 'competition', key: 'competitionRisk' as const },
    { name: 'inventory', key: 'inventoryRisk' as const }
  ];
  
  dimensions.forEach(dim => {
    const redCount = products.filter(p => p[dim.key] === 'red').length;
    const dimPercent = (redCount / totalProducts) * 100;
    
    if (dimPercent > 50) {
      alerts.push(`⚠️ Portfolio risk concentration in ${dim.name}: ${dimPercent.toFixed(0)}% of products are RED`);
    }
  });
  
  return alerts;
}

/**
 * Get empty analytics report (for no products)
 * 
 * @returns Empty analytics report
 */
function getEmptyAnalytics(): AnalyticsReport {
  return {
    summary: {
      totalProducts: 0,
      totalMonthlyProfit: 0,
      averageProfitMargin: 0,
      averageHealthScore: 0
    },
    profitability: {
      profitableCount: 0,
      unprofitableCount: 0,
      profitRange: { min: 0, max: 0 },
      marginRange: { min: 0, max: 0 }
    },
    riskDistribution: {
      red: 0,
      yellow: 0,
      green: 0,
      byCategory: {}
    },
    timing: {
      averageBreakEvenDays: 0,
      averageCashRunway: 0,
      averageTurnoverDays: 0
    },
    topPerformers: [],
    bottomPerformers: [],
    alerts: ['No products to analyze']
  };
}

/**
 * Export analytics as JSON file
 * 
 * @param products - Array of calculated products
 * @param filename - Optional custom filename
 */
export function exportAnalyticsJSON(products: BulkProductResult[], filename?: string): void {
  const analytics = generateAnalytics(products);
  const jsonContent = JSON.stringify(analytics, null, 2);
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const finalFilename = filename || `analytics_${timestamp}.json`;
  
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = finalFilename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
