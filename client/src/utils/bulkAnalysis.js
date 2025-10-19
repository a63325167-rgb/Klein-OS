/**
 * Bulk Analysis Service
 * Handles multi-product analysis with aggregation and insights
 */

import { calculateProductAnalysis } from './calculations';
import { validateBulkData } from './validation';
import { roundToPrecision, safeAdd, safeDivide } from './precision';

/**
 * Process bulk upload data
 */
export function processBulkData(excelData) {
  // Validate the data
  const validation = validateBulkData(excelData);
  
  if (validation.errors.filter(e => e.type === 'error').length > 0) {
    return {
      success: false,
      errors: validation.errors,
      data: null
    };
  }
  
  // Process each row
  const results = [];
  const errors = [];
  
  // Skip header row
  excelData.slice(1).forEach((row, index) => {
    // Skip empty rows
    const hasData = row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== '');
    if (!hasData) return;
    
    try {
      const product = mapRowToProduct(row, index + 2);
      const analysis = calculateProductAnalysis(product);
      
      results.push({
        ...analysis,
        rowIndex: index + 2,
        units_sold: parseInt(row[3]) || 0,
        stock_left: parseInt(row[6]) || 0
      });
    } catch (error) {
      errors.push({
        row: index + 2,
        error: error.message
      });
    }
  });
  
  return {
    success: true,
    results,
    errors,
    validation,
    aggregates: calculateAggregates(results),
    insights: generateBulkInsights(results)
  };
}

/**
 * Map Excel row to product object
 */
function mapRowToProduct(row, rowIndex) {
  return {
    product_name: row[0] || `Product ${rowIndex}`,
    buying_price: parseFloat(row[1]) || 0,
    selling_price: parseFloat(row[2]) || 0,
    category: row[7] || 'Default',
    destination_country: row[8] || 'Germany',
    length_cm: parseFloat(row[9]) || 0,
    width_cm: parseFloat(row[10]) || 0,
    height_cm: parseFloat(row[11]) || 0,
    weight_kg: parseFloat(row[12]) || 0
  };
}

/**
 * Calculate aggregate statistics
 */
export function calculateAggregates(results) {
  if (!results || results.length === 0) {
    return null;
  }
  
  const totalRevenue = results.reduce((sum, r) => safeAdd(sum, r.input.selling_price), 0);
  const totalCosts = results.reduce((sum, r) => safeAdd(sum, r.totals.total_cost), 0);
  const totalProfit = results.reduce((sum, r) => safeAdd(sum, r.totals.net_profit), 0);
  
  const avgROI = safeDivide(
    results.reduce((sum, r) => safeAdd(sum, r.totals.roi_percent), 0),
    results.length
  );
  
  const avgMargin = safeDivide(
    results.reduce((sum, r) => safeAdd(sum, r.totals.profit_margin), 0),
    results.length
  );
  
  // Calculate median margin
  const sortedMargins = results.map(r => r.totals.profit_margin).sort((a, b) => a - b);
  const medianMargin = sortedMargins[Math.floor(sortedMargins.length / 2)];
  
  // Count Small Package eligible products
  const smallPackageEligible = results.filter(r => r.smallPackageCheck.isEligible).length;
  
  // Find top performers
  const topByROI = [...results]
    .sort((a, b) => b.totals.roi_percent - a.totals.roi_percent)
    .slice(0, 3);
  
  const topByProfit = [...results]
    .sort((a, b) => b.totals.net_profit - a.totals.net_profit)
    .slice(0, 3);
  
  // Find bottom performers
  const bottomPerformers = [...results]
    .filter(r => r.totals.roi_percent < 10)
    .sort((a, b) => a.totals.roi_percent - b.totals.roi_percent);
  
  // Performance distribution
  const performanceDistribution = {
    exceptional: results.filter(r => r.performance.tier === 'EXCEPTIONAL').length,
    excellent: results.filter(r => r.performance.tier === 'EXCELLENT').length,
    good: results.filter(r => r.performance.tier === 'GOOD').length,
    fair: results.filter(r => r.performance.tier === 'FAIR').length,
    poor: results.filter(r => r.performance.tier === 'POOR').length,
    critical: results.filter(r => r.performance.tier === 'CRITICAL').length
  };
  
  return {
    productCount: results.length,
    totalRevenue: roundToPrecision(totalRevenue, 2),
    totalCosts: roundToPrecision(totalCosts, 2),
    totalProfit: roundToPrecision(totalProfit, 2),
    avgROI: roundToPrecision(avgROI, 2),
    avgMargin: roundToPrecision(avgMargin, 2),
    medianMargin: roundToPrecision(medianMargin, 2),
    smallPackageEligible,
    smallPackagePercentage: roundToPrecision((smallPackageEligible / results.length) * 100, 1),
    topByROI,
    topByProfit,
    bottomPerformers,
    performanceDistribution
  };
}

/**
 * Generate insights from bulk analysis
 */
export function generateBulkInsights(results) {
  if (!results || results.length === 0) {
    return [];
  }
  
  const insights = [];
  const aggregates = calculateAggregates(results);
  
  // Portfolio health insight
  if (aggregates.avgROI >= 50) {
    insights.push({
      type: 'success',
      icon: '🎯',
      title: 'Strong Portfolio Performance',
      description: `Your portfolio has a healthy average ROI of ${aggregates.avgROI.toFixed(1)}%, indicating strong profitability across products.`
    });
  } else if (aggregates.avgROI < 25) {
    insights.push({
      type: 'warning',
      icon: '⚠️',
      title: 'Portfolio Needs Optimization',
      description: `Average ROI of ${aggregates.avgROI.toFixed(1)}% is below optimal levels. Consider reviewing underperforming products.`
    });
  }
  
  // Small Package optimization
  if (aggregates.smallPackagePercentage < 30) {
    insights.push({
      type: 'info',
      icon: '📦',
      title: 'Shipping Cost Opportunity',
      description: `Only ${aggregates.smallPackagePercentage.toFixed(0)}% of products qualify for Small Package. Optimizing packaging could save €${(results.length * 1.71 * 0.7).toFixed(0)} annually.`
    });
  } else if (aggregates.smallPackagePercentage > 70) {
    insights.push({
      type: 'success',
      icon: '✅',
      title: 'Excellent Shipping Optimization',
      description: `${aggregates.smallPackagePercentage.toFixed(0)}% of products qualify for Small Package, maximizing shipping cost efficiency.`
    });
  }
  
  // High fee products
  const highFeeProducts = results.filter(r => {
    const feePercentage = (r.amazonFee.amount / r.input.selling_price) * 100;
    return feePercentage > 15;
  });
  
  if (highFeeProducts.length > results.length * 0.3) {
    insights.push({
      type: 'warning',
      icon: '💳',
      title: 'High Fee Impact',
      description: `${highFeeProducts.length} products (${((highFeeProducts.length / results.length) * 100).toFixed(0)}%) have Amazon fees exceeding 15%. Consider category optimization.`
    });
  }
  
  // High shipping cost products
  const highShippingProducts = results.filter(r => {
    const shippingPercentage = (r.shipping.cost / r.totals.total_cost) * 100;
    return shippingPercentage > 20;
  });
  
  if (highShippingProducts.length > 0) {
    insights.push({
      type: 'info',
      icon: '🚚',
      title: 'Shipping Cost Alert',
      description: `${highShippingProducts.length} products have shipping costs exceeding 20% of total costs. Volume contracts could reduce this by 8-12%.`
    });
  }
  
  // Top performers highlight
  if (aggregates.topByROI.length > 0) {
    const topProduct = aggregates.topByROI[0];
    insights.push({
      type: 'success',
      icon: '🌟',
      title: 'Top Performer Identified',
      description: `"${topProduct.input.product_name}" leads with ${topProduct.totals.roi_percent.toFixed(1)}% ROI. Consider increasing inventory and marketing focus.`
    });
  }
  
  // Bottom performers warning
  if (aggregates.bottomPerformers.length > 0) {
    insights.push({
      type: 'danger',
      icon: '🚨',
      title: 'Underperforming Products',
      description: `${aggregates.bottomPerformers.length} products have ROI < 10%. Review pricing and costs, or consider discontinuation.`
    });
  }
  
  // Portfolio diversity
  const tierCount = Object.values(aggregates.performanceDistribution).filter(count => count > 0).length;
  if (tierCount >= 4) {
    insights.push({
      type: 'info',
      icon: '📊',
      title: 'Diverse Portfolio',
      description: `Products span ${tierCount} performance tiers. This diversification balances risk while maintaining growth opportunities.`
    });
  }
  
  return insights.slice(0, 6); // Return top 6 insights
}

/**
 * Export bulk results to structured format
 */
export function exportBulkResults(results, aggregates) {
  const exportData = {
    summary: {
      generatedAt: new Date().toISOString(),
      productCount: results.length,
      ...aggregates
    },
    products: results.map(r => ({
      name: r.input.product_name,
      buyingPrice: r.input.buying_price,
      sellingPrice: r.input.selling_price,
      totalCost: r.totals.total_cost,
      netProfit: r.totals.net_profit,
      roi: r.totals.roi_percent,
      margin: r.totals.profit_margin,
      tier: r.performance.tier,
      smallPackageEligible: r.smallPackageCheck.isEligible
    }))
  };
  
  return exportData;
}

