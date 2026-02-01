// src/utils/dataTransform.ts

import { BulkProductResult, RiskLevel } from '../types/upload';

/**
 * Formatted product for export with string representations
 */
export interface FormattedProduct {
  rowIndex: number;
  asin: string;
  name: string;
  price: string;
  cogs: string;
  velocity: string;
  returnRate: string;
  referralFee: string;
  fbaFee: string;
  vat: string;
  shippingCost: string;
  initialOrder: string;
  initialCash: string;
  competitorCount: string;
  rating: string;
  category: string;
  profitPerUnit: string;
  profitMargin: string;
  totalMonthlyProfit: string;
  breakEvenDays: string;
  cashRunway: string;
  turnoverDays: string;
  healthScore: string;
  profitabilityRisk: string;
  breakEvenRisk: string;
  cashFlowRisk: string;
  competitionRisk: string;
  inventoryRisk: string;
}

/**
 * Filter criteria for products
 */
export interface FilterCriteria {
  minProfit?: number;
  maxProfit?: number;
  minMargin?: number;
  maxMargin?: number;
  minHealthScore?: number;
  maxHealthScore?: number;
  riskLevels?: RiskLevel[];
  categories?: string[];
  minVelocity?: number;
  maxVelocity?: number;
}

/**
 * Category statistics
 */
export interface CategoryStats {
  category: string;
  count: number;
  totalProfit: number;
  averageMargin: number;
  averageHealthScore: number;
  riskDistribution: {
    red: number;
    yellow: number;
    green: number;
  };
}

/**
 * Format products for export with proper string formatting
 * 
 * @param products - Array of calculated products
 * @returns Array of formatted products with string values
 */
export function formatProductsForExport(products: BulkProductResult[]): FormattedProduct[] {
  return products.map(product => ({
    rowIndex: product.rowIndex,
    asin: product.asin,
    name: product.name,
    price: formatCurrency(product.price),
    cogs: formatCurrency(product.cogs),
    velocity: product.velocity.toString(),
    returnRate: formatPercentage(product.returnRate),
    referralFee: formatPercentage(product.referralFee),
    fbaFee: formatPercentage(product.fbaFee),
    vat: formatPercentage(product.vat),
    shippingCost: formatCurrency(product.shippingCost),
    initialOrder: product.initialOrder.toString(),
    initialCash: formatCurrency(product.initialCash),
    competitorCount: product.competitorCount.toString(),
    rating: product.rating.toFixed(1),
    category: product.category,
    profitPerUnit: formatCurrency(product.profitPerUnit),
    profitMargin: formatPercentage(product.profitMargin),
    totalMonthlyProfit: formatCurrency(product.totalMonthlyProfit),
    breakEvenDays: product.breakEvenDays.toString(),
    cashRunway: product.cashRunway.toString(),
    turnoverDays: product.turnoverDays.toString(),
    healthScore: product.healthScore.toString(),
    profitabilityRisk: product.profitabilityRisk,
    breakEvenRisk: product.breakEvenRisk,
    cashFlowRisk: product.cashFlowRisk,
    competitionRisk: product.competitionRisk,
    inventoryRisk: product.inventoryRisk
  }));
}

/**
 * Group products by category
 * 
 * @param products - Array of products
 * @returns Map of category to products
 */
export function groupByCategory(products: BulkProductResult[]): Map<string, BulkProductResult[]> {
  const grouped = new Map<string, BulkProductResult[]>();
  
  products.forEach(product => {
    const category = product.category || 'Uncategorized';
    if (!grouped.has(category)) {
      grouped.set(category, []);
    }
    grouped.get(category)!.push(product);
  });
  
  return grouped;
}

/**
 * Sort products by a specific metric
 * 
 * @param products - Array of products
 * @param metric - Metric to sort by
 * @param ascending - Sort order (default: false = descending)
 * @returns Sorted array of products
 */
export function sortByMetric(
  products: BulkProductResult[],
  metric: keyof BulkProductResult,
  ascending: boolean = false
): BulkProductResult[] {
  const sorted = [...products].sort((a, b) => {
    const aVal = a[metric];
    const bVal = b[metric];
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return ascending ? aVal - bVal : bVal - aVal;
    }
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return ascending ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    
    return 0;
  });
  
  return sorted;
}

/**
 * Filter products by criteria
 * 
 * @param products - Array of products
 * @param criteria - Filter criteria
 * @returns Filtered array of products
 */
export function filterProducts(
  products: BulkProductResult[],
  criteria: FilterCriteria
): BulkProductResult[] {
  return products.filter(product => {
    // Profit filter
    if (criteria.minProfit !== undefined && product.profitPerUnit < criteria.minProfit) {
      return false;
    }
    if (criteria.maxProfit !== undefined && product.profitPerUnit > criteria.maxProfit) {
      return false;
    }
    
    // Margin filter
    if (criteria.minMargin !== undefined && product.profitMargin < criteria.minMargin) {
      return false;
    }
    if (criteria.maxMargin !== undefined && product.profitMargin > criteria.maxMargin) {
      return false;
    }
    
    // Health score filter
    if (criteria.minHealthScore !== undefined && product.healthScore < criteria.minHealthScore) {
      return false;
    }
    if (criteria.maxHealthScore !== undefined && product.healthScore > criteria.maxHealthScore) {
      return false;
    }
    
    // Risk level filter
    if (criteria.riskLevels && criteria.riskLevels.length > 0) {
      const hasMatchingRisk = criteria.riskLevels.includes(product.profitabilityRisk);
      if (!hasMatchingRisk) return false;
    }
    
    // Category filter
    if (criteria.categories && criteria.categories.length > 0) {
      if (!criteria.categories.includes(product.category)) {
        return false;
      }
    }
    
    // Velocity filter
    if (criteria.minVelocity !== undefined && product.velocity < criteria.minVelocity) {
      return false;
    }
    if (criteria.maxVelocity !== undefined && product.velocity > criteria.maxVelocity) {
      return false;
    }
    
    return true;
  });
}

/**
 * Get statistics for each category
 * 
 * @param products - Array of products
 * @returns Array of category statistics
 */
export function getCategoryStats(products: BulkProductResult[]): CategoryStats[] {
  const grouped = groupByCategory(products);
  const stats: CategoryStats[] = [];
  
  grouped.forEach((categoryProducts, category) => {
    const totalProfit = categoryProducts.reduce((sum, p) => sum + p.totalMonthlyProfit, 0);
    const averageMargin = categoryProducts.reduce((sum, p) => sum + p.profitMargin, 0) / categoryProducts.length;
    const averageHealthScore = categoryProducts.reduce((sum, p) => sum + p.healthScore, 0) / categoryProducts.length;
    
    const riskDistribution = getRiskDistribution(categoryProducts);
    
    stats.push({
      category,
      count: categoryProducts.length,
      totalProfit,
      averageMargin,
      averageHealthScore,
      riskDistribution
    });
  });
  
  return stats.sort((a, b) => b.totalProfit - a.totalProfit);
}

/**
 * Get health score distribution
 * 
 * @param products - Array of products
 * @returns Distribution of health scores by range
 */
export function getHealthDistribution(products: BulkProductResult[]): {
  '0-20': number;
  '20-40': number;
  '40-60': number;
  '60-80': number;
  '80-100': number;
} {
  const distribution = {
    '0-20': 0,
    '20-40': 0,
    '40-60': 0,
    '60-80': 0,
    '80-100': 0
  };
  
  products.forEach(product => {
    const score = product.healthScore;
    if (score < 20) distribution['0-20']++;
    else if (score < 40) distribution['20-40']++;
    else if (score < 60) distribution['40-60']++;
    else if (score < 80) distribution['60-80']++;
    else distribution['80-100']++;
  });
  
  return distribution;
}

/**
 * Get risk distribution
 * 
 * @param products - Array of products
 * @returns Count of products by risk level
 */
export function getRiskDistribution(products: BulkProductResult[]): {
  red: number;
  yellow: number;
  green: number;
} {
  const distribution = {
    red: 0,
    yellow: 0,
    green: 0
  };
  
  products.forEach(product => {
    // Use profitability risk as primary indicator
    distribution[product.profitabilityRisk]++;
  });
  
  return distribution;
}

// ============================================
// FORMATTING UTILITIES
// ============================================

/**
 * Format number as currency (EUR)
 * 
 * @param value - Numeric value
 * @returns Formatted currency string
 */
export function formatCurrency(value: number): string {
  return `€${value.toFixed(2)}`;
}

/**
 * Format number as percentage
 * 
 * @param value - Numeric value (e.g., 15 for 15%)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

/**
 * Format date as ISO string
 * 
 * @param date - Date object
 * @returns ISO date string
 */
export function formatDate(date: Date = new Date()): string {
  return date.toISOString();
}

/**
 * Generate filename with timestamp
 * 
 * @param baseName - Base filename without extension
 * @param extension - File extension (e.g., 'csv', 'pdf')
 * @returns Filename with timestamp
 */
export function generateFilename(baseName: string, extension: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `${baseName}_${timestamp}.${extension}`;
}
