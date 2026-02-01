/**
 * Benchmark data for product metrics comparison
 * Provides industry standards for profit margin, ROI, fees, and shipping
 */

// Category-specific profit margin benchmarks
export const MARGIN_BENCHMARKS = {
  // Default/fallback benchmarks
  default: {
    low: 15,
    average: [20, 25],
    high: 30,
    exceptional: 35,
    percentiles: {
      25: 15,
      50: 22.5,
      75: 30,
      90: 35
    }
  },
  // Category-specific benchmarks
  electronics: {
    low: 10,
    average: [15, 20],
    high: 25,
    exceptional: 30,
    percentiles: {
      25: 10,
      50: 17.5,
      75: 25,
      90: 30
    }
  },
  fashion: {
    low: 20,
    average: [25, 35],
    high: 40,
    exceptional: 50,
    percentiles: {
      25: 20,
      50: 30,
      75: 40,
      90: 50
    }
  },
  beauty: {
    low: 25,
    average: [30, 40],
    high: 45,
    exceptional: 55,
    percentiles: {
      25: 25,
      50: 35,
      75: 45,
      90: 55
    }
  },
  home: {
    low: 15,
    average: [20, 30],
    high: 35,
    exceptional: 40,
    percentiles: {
      25: 15,
      50: 25,
      75: 35,
      90: 40
    }
  },
  toys: {
    low: 20,
    average: [25, 30],
    high: 35,
    exceptional: 40,
    percentiles: {
      25: 20,
      50: 27.5,
      75: 35,
      90: 40
    }
  },
  books: {
    low: 10,
    average: [15, 20],
    high: 25,
    exceptional: 30,
    percentiles: {
      25: 10,
      50: 17.5,
      75: 25,
      90: 30
    }
  },
  sports: {
    low: 15,
    average: [20, 30],
    high: 35,
    exceptional: 40,
    percentiles: {
      25: 15,
      50: 25,
      75: 35,
      90: 40
    }
  }
};

// ROI benchmarks by marketplace
export const ROI_BENCHMARKS = {
  // Default/fallback benchmarks
  default: {
    low: 30,
    average: [40, 60],
    high: 80,
    exceptional: 100,
    percentiles: {
      25: 30,
      50: 50,
      75: 80,
      90: 100
    }
  },
  // Marketplace-specific benchmarks
  amazon: {
    low: 30,
    average: [40, 60],
    high: 80,
    exceptional: 100,
    percentiles: {
      25: 30,
      50: 50,
      75: 80,
      90: 100
    }
  },
  ebay: {
    low: 25,
    average: [35, 50],
    high: 70,
    exceptional: 90,
    percentiles: {
      25: 25,
      50: 42.5,
      75: 70,
      90: 90
    }
  },
  shopify: {
    low: 40,
    average: [50, 70],
    high: 90,
    exceptional: 120,
    percentiles: {
      25: 40,
      50: 60,
      75: 90,
      90: 120
    }
  }
};

// Fee benchmarks by fulfillment method (% of revenue)
export const FEE_BENCHMARKS = {
  // Default/fallback benchmarks
  default: {
    low: 10,
    average: [15, 18],
    high: 20,
    veryHigh: 25,
    percentiles: {
      25: 10,
      50: 16.5,
      75: 20,
      90: 25
    }
  },
  // Fulfillment-specific benchmarks
  fba: {
    low: 15,
    average: [18, 22],
    high: 25,
    veryHigh: 30,
    percentiles: {
      25: 15,
      50: 20,
      75: 25,
      90: 30
    }
  },
  fbm: {
    low: 8,
    average: [10, 15],
    high: 18,
    veryHigh: 20,
    percentiles: {
      25: 8,
      50: 12.5,
      75: 18,
      90: 20
    }
  },
  dropshipping: {
    low: 5,
    average: [8, 12],
    high: 15,
    veryHigh: 18,
    percentiles: {
      25: 5,
      50: 10,
      75: 15,
      90: 18
    }
  }
};

// Shipping benchmarks by weight class (€)
export const SHIPPING_BENCHMARKS = {
  // Weight class benchmarks (kg)
  ultraLight: { // <0.5kg
    low: 3,
    average: [4, 6],
    high: 7,
    veryHigh: 8,
    percentiles: {
      25: 3,
      50: 5,
      75: 7,
      90: 8
    }
  },
  light: { // 0.5-2kg
    low: 5,
    average: [5.5, 7.5],
    high: 8,
    veryHigh: 10,
    percentiles: {
      25: 5,
      50: 6.5,
      75: 8,
      90: 10
    }
  },
  medium: { // 2-5kg
    low: 7,
    average: [7.5, 9.5],
    high: 10,
    veryHigh: 12,
    percentiles: {
      25: 7,
      50: 8.5,
      75: 10,
      90: 12
    }
  },
  heavy: { // 5-10kg
    low: 10,
    average: [10.5, 12.5],
    high: 15,
    veryHigh: 18,
    percentiles: {
      25: 10,
      50: 11.5,
      75: 15,
      90: 18
    }
  },
  veryHeavy: { // 10-20kg
    low: 15,
    average: [16, 20],
    high: 25,
    veryHigh: 30,
    percentiles: {
      25: 15,
      50: 18,
      75: 25,
      90: 30
    }
  },
  freight: { // >20kg
    low: 25,
    average: [30, 50],
    high: 70,
    veryHigh: 100,
    percentiles: {
      25: 25,
      50: 40,
      75: 70,
      90: 100
    }
  }
};

// Weight class determination
export function getWeightClass(weightKg) {
  if (weightKg < 0.5) return 'ultraLight';
  if (weightKg < 2) return 'light';
  if (weightKg < 5) return 'medium';
  if (weightKg < 10) return 'heavy';
  if (weightKg < 20) return 'veryHeavy';
  return 'freight';
}

// Get category benchmark
export function getCategoryBenchmark(category) {
  const normalizedCategory = (category || '').toLowerCase();
  
  // Check if category contains any of our benchmark categories
  for (const [key, value] of Object.entries(MARGIN_BENCHMARKS)) {
    if (key !== 'default' && normalizedCategory.includes(key)) {
      return value;
    }
  }
  
  return MARGIN_BENCHMARKS.default;
}

// Get marketplace benchmark
export function getMarketplaceBenchmark(marketplace) {
  const normalizedMarketplace = (marketplace || '').toLowerCase();
  
  // Check if marketplace contains any of our benchmark marketplaces
  for (const [key, value] of Object.entries(ROI_BENCHMARKS)) {
    if (key !== 'default' && normalizedMarketplace.includes(key)) {
      return value;
    }
  }
  
  return ROI_BENCHMARKS.default;
}

// Get fulfillment benchmark
export function getFulfillmentBenchmark(fulfillment) {
  const normalizedFulfillment = (fulfillment || '').toLowerCase();
  
  if (normalizedFulfillment.includes('fba')) {
    return FEE_BENCHMARKS.fba;
  } else if (normalizedFulfillment.includes('fbm')) {
    return FEE_BENCHMARKS.fbm;
  } else if (normalizedFulfillment.includes('dropship')) {
    return FEE_BENCHMARKS.dropshipping;
  }
  
  return FEE_BENCHMARKS.default;
}

// Get shipping benchmark
export function getShippingBenchmark(weightKg) {
  const weightClass = getWeightClass(weightKg);
  return SHIPPING_BENCHMARKS[weightClass];
}

// Calculate percentile ranking
export function calculatePercentileRanking(value, benchmarkData) {
  const { percentiles } = benchmarkData;
  
  if (value < percentiles[25]) {
    // Below 25th percentile
    return Math.round((value / percentiles[25]) * 25);
  } else if (value < percentiles[50]) {
    // Between 25th and 50th percentile
    const range = percentiles[50] - percentiles[25];
    const position = value - percentiles[25];
    return Math.round(25 + (position / range) * 25);
  } else if (value < percentiles[75]) {
    // Between 50th and 75th percentile
    const range = percentiles[75] - percentiles[50];
    const position = value - percentiles[50];
    return Math.round(50 + (position / range) * 25);
  } else if (value < percentiles[90]) {
    // Between 75th and 90th percentile
    const range = percentiles[90] - percentiles[75];
    const position = value - percentiles[75];
    return Math.round(75 + (position / range) * 15);
  } else {
    // Above 90th percentile
    return 90 + Math.min(Math.round((value - percentiles[90]) / (percentiles[90] * 0.2) * 10), 10);
  }
}

// Generate comparison result
export function generateComparison(value, benchmarkData, isHigherBetter = true) {
  const { low, average, high, exceptional, veryHigh } = benchmarkData;
  const [avgLow, avgHigh] = average;
  
  let status, message, emoji, color;
  const percentile = calculatePercentileRanking(value, benchmarkData);
  
  if (isHigherBetter) {
    // For metrics where higher is better (margin, ROI)
    if (value >= exceptional) {
      status = 'EXCEPTIONAL';
      emoji = '🎉';
      message = `Top ${100 - percentile}% of products`;
      color = 'emerald';
    } else if (value >= high) {
      status = 'ABOVE AVERAGE';
      emoji = '✨';
      message = `Better than ${percentile}% of sellers`;
      color = 'green';
    } else if (value >= avgLow) {
      status = 'AVERAGE';
      emoji = '✅';
      message = 'Within normal range';
      color = 'blue';
    } else if (value >= low) {
      status = 'BELOW AVERAGE';
      emoji = '⚠️';
      message = 'Room for improvement';
      color = 'yellow';
    } else {
      status = 'POOR';
      emoji = '❌';
      message = 'Significantly below average';
      color = 'red';
    }
  } else {
    // For metrics where lower is better (fees, shipping)
    const highThreshold = veryHigh || high;
    
    if (value <= low) {
      status = 'EXCEPTIONAL';
      emoji = '🎉';
      message = `Lower than ${percentile}% of products`;
      color = 'emerald';
    } else if (value <= avgLow) {
      status = 'BELOW AVERAGE';
      emoji = '✨';
      message = 'Better than average';
      color = 'green';
    } else if (value <= avgHigh) {
      status = 'AVERAGE';
      emoji = '✅';
      message = 'Within normal range';
      color = 'blue';
    } else if (value <= high) {
      status = 'ABOVE AVERAGE';
      emoji = '⚠️';
      message = 'Higher than average';
      color = 'yellow';
    } else {
      status = 'HIGH';
      emoji = '❌';
      message = 'Significantly above average';
      color = 'red';
    }
  }
  
  return {
    value,
    percentile,
    status,
    message,
    emoji,
    color,
    benchmark: {
      low,
      average: [avgLow, avgHigh],
      high,
      exceptional: exceptional || high * 1.2
    }
  };
}

// Generate margin comparison
export function compareMargin(margin, category) {
  const benchmark = getCategoryBenchmark(category);
  return generateComparison(margin, benchmark, true);
}

// Generate ROI comparison
export function compareROI(roi, marketplace = 'amazon') {
  const benchmark = getMarketplaceBenchmark(marketplace);
  return generateComparison(roi, benchmark, true);
}

// Generate fee comparison
export function compareFee(feePercent, fulfillment = 'fba') {
  const benchmark = getFulfillmentBenchmark(fulfillment);
  return generateComparison(feePercent, benchmark, false);
}

// Generate shipping comparison
export function compareShipping(shippingCost, weightKg) {
  const benchmark = getShippingBenchmark(weightKg);
  return generateComparison(shippingCost, benchmark, false);
}
