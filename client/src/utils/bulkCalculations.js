/**
 * Bulk Product Calculations (B7)
 * 
 * Calculates all metrics for 50-500 products in batch.
 * Integrates with B1 (Health Score), B2 (Returns), B3 (Scenarios), B4 (Cash Flow), B5 (Risks).
 */

import { calculateCashFlow } from './cashFlowCalculations';
import { 
  calculateProfitabilityRisk,
  calculateBreakevenRisk,
  calculateCashflowRisk,
  calculateCompetitionRisk,
  calculateInventoryRisk
} from './riskCalculations';

/**
 * Calculate all metrics for a single product
 * 
 * @param {Object} product - Product data from upload
 * @returns {Object} Product with all calculated metrics
 */
export function calculateProductMetrics(product) {
  const {
    asin,
    name,
    price,
    cogs,
    velocity,
    returnRate,
    referralFee,
    fbaFee,
    vat,
    shippingCost,
    initialOrder,
    initialCash,
    competitorCount,
    rating,
    category,
    rowIndex
  } = product;

  // Calculate revenue after returns (B2 integration)
  const revenueAfterReturns = price * (1 - returnRate / 100);
  
  // Calculate fees
  const referralFeeCost = price * (referralFee / 100);
  const fbaFeeCost = price * (fbaFee / 100);
  const vatCost = price * (vat / 100);
  
  // Calculate profit per unit (B6 standardized formula)
  const profitPerUnit = revenueAfterReturns - cogs - referralFeeCost - fbaFeeCost - vatCost - shippingCost;
  
  // Calculate profit margin % (B6 standardized)
  const profitMargin = (profitPerUnit / price) * 100;
  
  // Calculate total monthly profit
  const totalMonthlyProfit = profitPerUnit * velocity;
  
  // Calculate initial inventory cost
  const initialInventoryCost = (cogs * initialOrder) + (shippingCost * initialOrder);
  
  // Calculate break-even days (B6 standardized)
  const breakEvenDays = velocity > 0 
    ? (initialInventoryCost / (profitPerUnit * (velocity / 30)))
    : 999;
  
  // Calculate landed cost
  const landedCost = cogs + shippingCost;
  
  // Calculate cash flow (B4 integration - simplified for bulk)
  let cashRunway = 0;
  let cashPosition = initialCash;
  const monthlyReorderCost = (velocity * 1.2) * landedCost;
  
  for (let month = 0; month < 12; month++) {
    const inflow = month === 0 ? 0 : profitPerUnit * velocity; // 1-month lag
    const outflow = month === 0 ? initialInventoryCost : monthlyReorderCost;
    cashPosition += inflow - outflow;
    
    if (cashPosition >= 0) {
      cashRunway = month + 1;
    } else {
      // Interpolate fractional month
      const previousCash = cashPosition - inflow + outflow;
      if (previousCash > 0) {
        const fraction = previousCash / (previousCash - cashPosition);
        cashRunway = month + fraction;
      }
      break;
    }
  }
  
  // Calculate inventory turnover days (B6 standardized)
  const turnoverDays = velocity > 0 ? (initialOrder / velocity) * 30 : 999;
  
  // Calculate health score (B1 integration)
  const marginHealth = Math.max(0, Math.min(100, (profitMargin / 25) * 100));
  const breakEvenHealth = Math.max(0, Math.min(100, ((60 - breakEvenDays) / 60) * 100));
  const cashFlowHealth = Math.max(0, Math.min(100, (cashRunway / 6) * 100));
  const competitionHealth = Math.max(0, Math.min(100, ((20 - competitorCount) / 20) * 100));
  const inventoryHealth = Math.max(0, Math.min(100, ((60 - turnoverDays) / 60) * 100));
  
  const healthScore = (
    (marginHealth * 0.25) +
    (breakEvenHealth * 0.25) +
    (cashFlowHealth * 0.25) +
    (competitionHealth * 0.15) +
    (inventoryHealth * 0.10)
  );
  
  // Calculate risk levels (B5 integration)
  const profitabilityRisk = profitMargin >= 20 ? 'green' : profitMargin >= 10 ? 'yellow' : 'red';
  const breakEvenRisk = breakEvenDays < 14 ? 'green' : breakEvenDays < 30 ? 'yellow' : 'red';
  const cashFlowRisk = cashRunway >= 6 ? 'green' : cashRunway >= 3 ? 'yellow' : 'red';
  const competitionRisk = competitorCount <= 5 ? 'green' : competitorCount <= 15 ? 'yellow' : 'red';
  const inventoryRisk = turnoverDays < 21 ? 'green' : turnoverDays < 45 ? 'yellow' : 'red';
  
  // Count critical risks
  const criticalRisks = [
    profitabilityRisk,
    breakEvenRisk,
    cashFlowRisk,
    competitionRisk,
    inventoryRisk
  ].filter(r => r === 'red').length;
  
  return {
    // Original data
    rowIndex,
    asin,
    name,
    price,
    cogs,
    velocity,
    returnRate,
    referralFee,
    fbaFee,
    vat,
    shippingCost,
    initialOrder,
    initialCash,
    competitorCount,
    rating,
    category,
    
    // Calculated metrics
    profitPerUnit,
    profitMargin,
    totalMonthlyProfit,
    breakEvenDays,
    cashRunway,
    turnoverDays,
    healthScore,
    
    // Risk levels
    profitabilityRisk,
    breakEvenRisk,
    cashFlowRisk,
    competitionRisk,
    inventoryRisk,
    criticalRisks,
    
    // Additional metrics
    landedCost,
    initialInventoryCost,
    monthlyReorderCost,
    revenueAfterReturns
  };
}

/**
 * Calculate metrics for all products in batch
 * 
 * @param {Array} products - Array of product data from upload
 * @returns {Array} Products with all calculated metrics
 */
export function calculateBulkProducts(products) {
  return products.map(product => calculateProductMetrics(product));
}

/**
 * Get portfolio summary statistics
 * 
 * @param {Array} results - Calculated product results
 * @returns {Object} Summary statistics
 */
export function getPortfolioSummary(results) {
  if (results.length === 0) {
    return {
      totalProducts: 0,
      avgProfitPerUnit: 0,
      avgProfitMargin: 0,
      totalMonthlyProfit: 0,
      avgBreakEvenDays: 0,
      avgCashRunway: 0,
      avgHealthScore: 0,
      criticalRiskCount: 0,
      warningRiskCount: 0,
      healthyCount: 0
    };
  }
  
  const totalProducts = results.length;
  
  // Calculate averages
  const avgProfitPerUnit = results.reduce((sum, r) => sum + r.profitPerUnit, 0) / totalProducts;
  const avgProfitMargin = results.reduce((sum, r) => sum + r.profitMargin, 0) / totalProducts;
  const totalMonthlyProfit = results.reduce((sum, r) => sum + r.totalMonthlyProfit, 0);
  const avgBreakEvenDays = results.reduce((sum, r) => sum + r.breakEvenDays, 0) / totalProducts;
  const avgCashRunway = results.reduce((sum, r) => sum + r.cashRunway, 0) / totalProducts;
  const avgHealthScore = results.reduce((sum, r) => sum + r.healthScore, 0) / totalProducts;
  
  // Count risk levels
  const criticalRiskCount = results.filter(r => r.criticalRisks >= 1).length;
  const warningRiskCount = results.filter(r => 
    r.criticalRisks === 0 && 
    [r.profitabilityRisk, r.breakEvenRisk, r.cashFlowRisk, r.competitionRisk, r.inventoryRisk].includes('yellow')
  ).length;
  const healthyCount = results.filter(r => 
    r.criticalRisks === 0 && 
    ![r.profitabilityRisk, r.breakEvenRisk, r.cashFlowRisk, r.competitionRisk, r.inventoryRisk].includes('yellow')
  ).length;
  
  return {
    totalProducts,
    avgProfitPerUnit,
    avgProfitMargin,
    totalMonthlyProfit,
    avgBreakEvenDays,
    avgCashRunway,
    avgHealthScore,
    criticalRiskCount,
    warningRiskCount,
    healthyCount
  };
}

/**
 * Export results as CSV
 * 
 * @param {Array} results - Calculated product results
 * @returns {string} CSV content
 */
export function exportAsCSV(results) {
  const headers = [
    'product_asin',
    'product_name',
    'category',
    'selling_price_eur',
    'cogs_per_unit_eur',
    'monthly_sales_velocity',
    'profit_per_unit_eur',
    'profit_margin_percent',
    'total_monthly_profit_eur',
    'break_even_days',
    'cash_runway_months',
    'inventory_turnover_days',
    'health_score',
    'profitability_risk',
    'breakeven_risk',
    'cashflow_risk',
    'competition_risk',
    'inventory_risk',
    'critical_risks_count',
    'return_rate_percent',
    'competitor_count',
    'average_rating_stars'
  ];
  
  const rows = results.map(r => [
    r.asin,
    `"${r.name.replace(/"/g, '""')}"`, // Escape quotes
    r.category,
    r.price.toFixed(2),
    r.cogs.toFixed(2),
    r.velocity.toString(),
    r.profitPerUnit.toFixed(2),
    r.profitMargin.toFixed(1),
    r.totalMonthlyProfit.toFixed(2),
    r.breakEvenDays.toFixed(0),
    r.cashRunway.toFixed(1),
    r.turnoverDays.toFixed(0),
    r.healthScore.toFixed(0),
    r.profitabilityRisk,
    r.breakEvenRisk,
    r.cashFlowRisk,
    r.competitionRisk,
    r.inventoryRisk,
    r.criticalRisks.toString(),
    r.returnRate.toFixed(1),
    r.competitorCount.toString(),
    r.rating.toFixed(1)
  ]);
  
  return [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
}

/**
 * Download CSV file
 * 
 * @param {Array} results - Calculated product results
 * @param {string} filename - Optional filename
 */
export function downloadCSV(results, filename) {
  const csv = exportAsCSV(results);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `products-export-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Filter products by risk level
 * 
 * @param {Array} results - Calculated product results
 * @param {string} riskLevel - 'critical', 'warning', 'healthy', or 'all'
 * @returns {Array} Filtered results
 */
export function filterByRiskLevel(results, riskLevel) {
  if (riskLevel === 'all') return results;
  
  if (riskLevel === 'critical') {
    return results.filter(r => r.criticalRisks >= 1);
  }
  
  if (riskLevel === 'warning') {
    return results.filter(r => 
      r.criticalRisks === 0 && 
      [r.profitabilityRisk, r.breakEvenRisk, r.cashFlowRisk, r.competitionRisk, r.inventoryRisk].includes('yellow')
    );
  }
  
  if (riskLevel === 'healthy') {
    return results.filter(r => 
      r.criticalRisks === 0 && 
      ![r.profitabilityRisk, r.breakEvenRisk, r.cashFlowRisk, r.competitionRisk, r.inventoryRisk].includes('yellow')
    );
  }
  
  return results;
}

/**
 * Sort products by column
 * 
 * @param {Array} results - Calculated product results
 * @param {string} column - Column to sort by
 * @param {string} direction - 'asc' or 'desc'
 * @returns {Array} Sorted results
 */
export function sortProducts(results, column, direction = 'desc') {
  return [...results].sort((a, b) => {
    const aVal = a[column];
    const bVal = b[column];
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return direction === 'asc' ? aVal - bVal : bVal - aVal;
    }
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return direction === 'asc' 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    
    return 0;
  });
}

/**
 * Get top/bottom products by metric
 * 
 * @param {Array} results - Calculated product results
 * @param {string} metric - Metric to rank by
 * @param {number} count - Number of products to return
 * @param {string} type - 'top' or 'bottom'
 * @returns {Array} Top/bottom products
 */
export function getRankedProducts(results, metric, count = 10, type = 'top') {
  const sorted = sortProducts(results, metric, type === 'top' ? 'desc' : 'asc');
  return sorted.slice(0, count);
}
