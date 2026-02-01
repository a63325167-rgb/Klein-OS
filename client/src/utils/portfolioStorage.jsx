/**
 * Portfolio Storage Utility
 * Manages local storage of calculated products for portfolio tracking
 */

const STORAGE_KEY = 'storehero_product_portfolio';

/**
 * Get all products from portfolio
 */
export function getPortfolio() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading portfolio:', error);
    return [];
  }
}

/**
 * Add or update product in portfolio
 */
export function saveToPortfolio(result) {
  try {
    if (!result || !result.totals || !result.input) {
      console.error('Invalid result object');
      return false;
    }

    const portfolio = getPortfolio();
    
    // Create portfolio entry
    const productId = result.input.product_name || result.input.productName || `Product_${Date.now()}`;
    const timestamp = Date.now();
    
    const portfolioEntry = {
      id: productId,
      productName: productId,
      timestamp,
      status: 'active', // active, testing, stopped
      input: {
        product_name: result.input.product_name || result.input.productName,
        selling_price: parseFloat(result.input.selling_price) || 0,
        buying_price: parseFloat(result.input.buying_price) || 0,
        annual_volume: parseInt(result.input.annual_volume) || 0,
        category: result.input.category || 'General',
        weight_kg: parseFloat(result.input.weight_kg) || 0
      },
      totals: {
        net_profit: result.totals.net_profit || 0,
        profit_margin: result.totals.profit_margin || 0,
        roi_percent: result.totals.roi_percent || 0,
        total_cost: result.totals.total_cost || 0
      },
      healthScore: result.healthScore || null,
      riskScore: result.riskScore || null,
      notes: result.notes || ''
    };
    
    // Check if product already exists
    const existingIndex = portfolio.findIndex(p => p.id === productId);
    
    if (existingIndex >= 0) {
      // Update existing product
      portfolio[existingIndex] = {
        ...portfolio[existingIndex],
        ...portfolioEntry,
        updatedAt: timestamp
      };
    } else {
      // Add new product
      portfolio.push({
        ...portfolioEntry,
        createdAt: timestamp
      });
    }
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
    
    return true;
  } catch (error) {
    console.error('Error saving to portfolio:', error);
    return false;
  }
}

/**
 * Update product status
 */
export function updateProductStatus(productId, status) {
  try {
    const portfolio = getPortfolio();
    const productIndex = portfolio.findIndex(p => p.id === productId);
    
    if (productIndex >= 0) {
      portfolio[productIndex].status = status;
      portfolio[productIndex].updatedAt = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error updating product status:', error);
    return false;
  }
}

/**
 * Delete product from portfolio
 */
export function deleteFromPortfolio(productId) {
  try {
    const portfolio = getPortfolio();
    const filtered = portfolio.filter(p => p.id !== productId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting from portfolio:', error);
    return false;
  }
}

/**
 * Clear entire portfolio
 */
export function clearPortfolio() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing portfolio:', error);
    return false;
  }
}

/**
 * Calculate portfolio metrics
 */
export function calculatePortfolioMetrics(portfolio) {
  if (!portfolio || portfolio.length === 0) {
    return {
      totalProducts: 0,
      activeSelling: 0,
      testing: 0,
      stopped: 0,
      averageMargin: 0,
      totalMonthlyProfit: 0,
      bestPerformer: null,
      worstPerformer: null,
      lowMarginProducts: [],
      topPerformers: []
    };
  }

  const activeProducts = portfolio.filter(p => p.status === 'active');
  const testingProducts = portfolio.filter(p => p.status === 'testing');
  const stoppedProducts = portfolio.filter(p => p.status === 'stopped');

  // Calculate average margin
  const totalMargin = portfolio.reduce((sum, p) => sum + (p.totals.profit_margin || 0), 0);
  const averageMargin = totalMargin / portfolio.length;

  // Calculate total monthly profit (active products only)
  const totalMonthlyProfit = activeProducts.reduce((sum, p) => {
    const monthlyVolume = (p.input.annual_volume || 0) / 12;
    const monthlyProfit = monthlyVolume * (p.totals.net_profit || 0);
    return sum + monthlyProfit;
  }, 0);

  // Find best and worst performers
  const sortedByProfit = [...portfolio].sort((a, b) => 
    (b.totals.net_profit || 0) - (a.totals.net_profit || 0)
  );
  
  const bestPerformer = sortedByProfit[0] || null;
  const worstPerformer = sortedByProfit[sortedByProfit.length - 1] || null;

  // Find low margin products (<20%)
  const lowMarginProducts = portfolio.filter(p => (p.totals.profit_margin || 0) < 20);

  // Find top 20% performers (by profit)
  const topCount = Math.max(1, Math.ceil(portfolio.length * 0.2));
  const topPerformers = sortedByProfit.slice(0, topCount);
  
  // Calculate what % of profit comes from top performers
  const topPerformersProfit = topPerformers.reduce((sum, p) => {
    const monthlyVolume = (p.input.annual_volume || 0) / 12;
    return sum + (monthlyVolume * (p.totals.net_profit || 0));
  }, 0);
  
  const topPerformersPercent = totalMonthlyProfit > 0 
    ? (topPerformersProfit / totalMonthlyProfit) * 100 
    : 0;

  return {
    totalProducts: portfolio.length,
    activeSelling: activeProducts.length,
    testing: testingProducts.length,
    stopped: stoppedProducts.length,
    averageMargin,
    totalMonthlyProfit,
    bestPerformer,
    worstPerformer,
    lowMarginProducts,
    topPerformers,
    topPerformersPercent
  };
}

/**
 * Generate portfolio insights
 */
export function generatePortfolioInsights(metrics) {
  const insights = [];

  // Pareto principle insight
  if (metrics.topPerformers.length > 0 && metrics.topPerformersPercent > 50) {
    insights.push({
      type: 'success',
      icon: '💡',
      title: 'Pareto Principle in Action',
      message: `Your top ${metrics.topPerformers.length} products (${Math.round((metrics.topPerformers.length / metrics.totalProducts) * 100)}%) generate ${metrics.topPerformersPercent.toFixed(0)}% of profit → Focus on scaling these`,
      action: 'Review top performers for scaling opportunities'
    });
  }

  // Low margin warning
  if (metrics.lowMarginProducts.length > 0) {
    insights.push({
      type: 'warning',
      icon: '⚠️',
      title: 'Low Margin Products',
      message: `${metrics.lowMarginProducts.length} products have <20% margin → Consider discontinuing or optimizing`,
      action: 'Review pricing or reduce costs on these products'
    });
  }

  // Portfolio diversification
  if (metrics.totalProducts < 5) {
    insights.push({
      type: 'info',
      icon: '📊',
      title: 'Portfolio Diversification',
      message: 'Consider adding more products to reduce risk and increase revenue streams',
      action: 'Analyze 3-5 new product opportunities'
    });
  }

  // Active vs testing ratio
  const activeRatio = metrics.activeSelling / metrics.totalProducts;
  if (activeRatio < 0.5 && metrics.totalProducts > 5) {
    insights.push({
      type: 'info',
      icon: '🚀',
      title: 'Launch More Products',
      message: `Only ${metrics.activeSelling} of ${metrics.totalProducts} products are active → Move more from testing to active`,
      action: 'Review testing products for launch readiness'
    });
  }

  // High performer concentration
  if (metrics.topPerformersPercent > 80) {
    insights.push({
      type: 'warning',
      icon: '⚠️',
      title: 'Revenue Concentration Risk',
      message: `${metrics.topPerformersPercent.toFixed(0)}% of profit from top products → High dependency risk`,
      action: 'Develop backup products to reduce concentration'
    });
  }

  return insights;
}
