/**
 * Terminology Glossary (B6)
 * 
 * Master reference for ALL metrics in the platform.
 * Standardized to FBA industry language (Amazon Seller Central, accounting standards).
 * 
 * Each term includes:
 * - Industry-standard name
 * - Precise definition
 * - Exact formula
 * - Example calculation
 * - Display units
 * - Category
 * - Validation rules
 */

/**
 * CATEGORY 1: PROFITABILITY METRICS
 */
export const PROFITABILITY_METRICS = {
  profitPerUnit: {
    name: 'Net Profit Per Unit',
    shortName: 'PPU',
    industryStandard: true,
    amazonTerm: 'Net Profit Per Unit',
    definition: 'Revenue per unit (after returns) minus all costs including COGS, Amazon fees, VAT, and shipping',
    formula: 'PPU = (Selling Price × (1 - Return Rate %)) - COGS - (Selling Price × Referral Fee %) - (Selling Price × FBA Fee %) - VAT - Shipping Cost Per Unit',
    formulaCode: '(sellingPrice * (1 - returnRate)) - cogs - (sellingPrice * referralFee) - (sellingPrice * fbaFee) - vat - shippingCost',
    example: 'Price €50, COGS €20, 15% referral, 8% FBA, 19% VAT, €2 shipping, 5% returns → Revenue: €50 × 0.95 = €47.50, Costs: €20 + €7.50 + €4 + €9.50 + €2 = €43, PPU = €4.50',
    units: '€/unit',
    displayFormat: '€{value}/unit',
    category: 'Profitability',
    validate: (value) => typeof value === 'number' && !isNaN(value),
    thresholds: {
      excellent: 10,
      good: 5,
      acceptable: 2,
      poor: 0
    },
    notes: 'This is the CORE metric. All business decisions flow from this. Negative PPU = losing money on every sale.'
  },

  profitMargin: {
    name: 'Profit Margin %',
    shortName: 'Margin',
    industryStandard: true,
    amazonTerm: 'Profit Margin',
    definition: 'Net profit per unit as a percentage of selling price',
    formula: 'Margin % = (Profit Per Unit / Selling Price) × 100',
    formulaCode: '(profitPerUnit / sellingPrice) * 100',
    example: 'PPU €4.50, Price €50 → Margin = (€4.50 / €50) × 100 = 9%',
    units: '%',
    displayFormat: '{value}%',
    category: 'Profitability',
    validate: (value) => typeof value === 'number' && value >= -100 && value <= 100,
    thresholds: {
      green: 20,    // >= 20% = safe
      yellow: 10,   // 10-20% = warning
      red: 0        // < 10% = critical
    },
    notes: 'Industry benchmark: 15-25% is healthy for FBA. Below 10% is risky.'
  },

  totalMonthlyProfit: {
    name: 'Total Monthly Net Profit',
    shortName: 'Monthly Profit',
    industryStandard: true,
    amazonTerm: 'Monthly Net Income',
    definition: 'Profit per unit multiplied by monthly sales volume',
    formula: 'Total Profit = PPU × Monthly Sales Velocity',
    formulaCode: 'profitPerUnit * monthlySalesVelocity',
    example: 'PPU €4.50, Sales 100 units/month → Total = €4.50 × 100 = €450/month',
    units: '€/month',
    displayFormat: '€{value}/month',
    category: 'Profitability',
    validate: (value) => typeof value === 'number' && !isNaN(value),
    notes: 'Assumes linear sales velocity. Actual sales may vary seasonally.'
  },

  revenuePerUnit: {
    name: 'Revenue Per Unit (After Returns)',
    shortName: 'Revenue',
    industryStandard: true,
    amazonTerm: 'Net Revenue',
    definition: 'Selling price adjusted for return rate',
    formula: 'Revenue = Selling Price × (1 - Return Rate %)',
    formulaCode: 'sellingPrice * (1 - returnRate)',
    example: 'Price €50, Return Rate 5% → Revenue = €50 × 0.95 = €47.50',
    units: '€/unit',
    displayFormat: '€{value}/unit',
    category: 'Profitability',
    validate: (value) => typeof value === 'number' && value >= 0,
    notes: 'Returns directly reduce revenue. 5% return rate = 5 units lost per 100 sold.'
  }
};

/**
 * CATEGORY 2: COST BREAKDOWN METRICS
 */
export const COST_METRICS = {
  landedCost: {
    name: 'Landed Cost',
    shortName: 'LC',
    industryStandard: true,
    amazonTerm: 'Landed Cost',
    definition: 'COGS plus inbound shipping and prep fees (per unit)',
    formula: 'LC = COGS + (Inbound Shipping / Order Quantity) + Prep Fee Per Unit',
    formulaCode: 'cogs + (inboundShipping / orderQuantity) + prepFee',
    example: 'COGS €20, Shipping €100 / 100 units, Prep €0.50 → LC = €20 + €1 + €0.50 = €21.50',
    units: '€/unit',
    displayFormat: '€{value}/unit',
    category: 'Costs',
    validate: (value) => typeof value === 'number' && value >= 0,
    notes: 'Used in break-even calculations. Includes all costs to get product to FBA warehouse.'
  },

  cogs: {
    name: 'Cost of Goods Sold (COGS)',
    shortName: 'COGS',
    industryStandard: true,
    amazonTerm: 'Product Cost',
    definition: 'Direct cost to manufacture or purchase product (excluding shipping)',
    formula: 'COGS = Supplier Cost Per Unit',
    formulaCode: 'supplierCost',
    example: 'Supplier charges €20/unit → COGS = €20',
    units: '€/unit',
    displayFormat: '€{value}/unit',
    category: 'Costs',
    validate: (value) => typeof value === 'number' && value >= 0,
    notes: 'This is your base cost before any fees or shipping.'
  },

  referralFee: {
    name: 'Amazon Referral Fee',
    shortName: 'Referral Fee',
    industryStandard: true,
    amazonTerm: 'Referral Fee',
    definition: 'Commission Amazon takes (15% for most categories, varies 6-45%)',
    formula: 'Referral Fee = Selling Price × Referral Fee %',
    formulaCode: 'sellingPrice * referralFeePercent',
    example: 'Price €50, Rate 15% → Fee = €50 × 0.15 = €7.50',
    units: '€ or %',
    displayFormat: '{percent}% (€{value})',
    category: 'Costs',
    validate: (value) => typeof value === 'number' && value >= 0,
    notes: 'Category-dependent. Check Amazon fee schedule for your category.'
  },

  fbaFee: {
    name: 'Amazon FBA Fee (Fulfillment)',
    shortName: 'FBA Fee',
    industryStandard: true,
    amazonTerm: 'FBA Fee',
    definition: 'FBA handling, packing, and shipping cost per unit (weight/size based)',
    formula: 'FBA Fee = Calculated by Amazon based on size tier',
    formulaCode: 'amazonFbaCalculator(weight, dimensions)',
    example: 'Small standard size → ~€3-5/unit',
    units: '€/unit',
    displayFormat: '€{value}/unit',
    category: 'Costs',
    validate: (value) => typeof value === 'number' && value >= 0,
    notes: 'Use Amazon FBA calculator for precise rates. Varies by size/weight tier.'
  },

  vat: {
    name: 'VAT (Value Added Tax)',
    shortName: 'VAT',
    industryStandard: true,
    amazonTerm: 'VAT',
    definition: 'Tax on selling price (15-25% depending on EU country)',
    formula: 'VAT = (Selling Price - Discount) × VAT Rate %',
    formulaCode: '(sellingPrice - discount) * vatRate',
    example: 'Price €50, Germany 19% → VAT = €50 × 0.19 = €9.50',
    units: '€',
    displayFormat: '{percent}% (€{value})',
    category: 'Costs',
    validate: (value) => typeof value === 'number' && value >= 0,
    notes: 'Country-specific. Germany 19%, France 20%, UK 20%, etc.'
  },

  shippingCost: {
    name: 'Shipping Cost Per Unit',
    shortName: 'Shipping',
    industryStandard: true,
    amazonTerm: 'Inbound Shipping',
    definition: 'Inbound shipping to FBA divided by order quantity',
    formula: 'Shipping = Total Inbound Shipping / Order Quantity',
    formulaCode: 'totalShipping / orderQuantity',
    example: 'Shipping €200, Order 100 units → €200 / 100 = €2/unit',
    units: '€/unit',
    displayFormat: '€{value}/unit',
    category: 'Costs',
    validate: (value) => typeof value === 'number' && value >= 0,
    notes: 'Larger orders = lower per-unit shipping cost.'
  }
};

/**
 * CATEGORY 3: BREAK-EVEN & TIME METRICS
 */
export const TIME_METRICS = {
  breakEvenDays: {
    name: 'Break-Even Days',
    shortName: 'Break-Even',
    industryStandard: true,
    amazonTerm: 'Days to Break-Even',
    definition: 'Days until cumulative profit equals initial inventory investment',
    formula: 'Days = (Initial Inventory Cost / (PPU × Daily Sales Velocity))',
    formulaCode: '(initialInventoryCost / (profitPerUnit * (monthlySalesVelocity / 30)))',
    example: 'Investment €2,100, PPU €4.50, Sales 3/day → Days = €2,100 / (€4.50 × 3) = 156 days',
    units: 'days',
    displayFormat: '{value} days',
    category: 'Time',
    validate: (value) => typeof value === 'number' && value >= 0 && value <= 1825, // 5 years max
    thresholds: {
      green: 14,    // < 14 days = safe
      yellow: 30,   // 14-30 days = warning
      red: 999      // > 30 days = critical
    },
    notes: 'Assumes linear sales. Faster break-even = faster cash recovery.'
  },

  initialInventoryCost: {
    name: 'Initial Inventory Cost',
    shortName: 'IIC',
    industryStandard: true,
    amazonTerm: 'Initial Investment',
    definition: 'Total upfront cost to order and ship initial inventory',
    formula: 'IIC = (COGS × Qty) + Inbound Shipping + (Prep Fee × Qty)',
    formulaCode: '(cogs * quantity) + inboundShipping + (prepFee * quantity)',
    example: 'COGS €20 × 100 + Shipping €100 + Prep €0.50 × 100 → €2,000 + €100 + €50 = €2,150',
    units: '€',
    displayFormat: '€{value}',
    category: 'Time',
    validate: (value) => typeof value === 'number' && value >= 0,
    notes: 'This is your startup capital requirement. Must have this cash available.'
  },

  monthlySalesVelocity: {
    name: 'Monthly Sales Velocity',
    shortName: 'Sales Velocity',
    industryStandard: true,
    amazonTerm: 'Monthly Units Sold',
    definition: 'Estimated units sold per month',
    formula: 'Monthly Sales = [User Input or Historical Data]',
    formulaCode: 'userInput || historicalAverage',
    example: '50 units/month',
    units: 'units/month',
    displayFormat: '{value} units/month',
    category: 'Time',
    validate: (value) => typeof value === 'number' && value >= 0,
    notes: 'This is an ASSUMPTION, not guaranteed. Use conservative estimates.'
  },

  inventoryTurnoverDays: {
    name: 'Inventory Turnover Days',
    shortName: 'Turnover',
    industryStandard: true,
    amazonTerm: 'Days of Inventory',
    definition: 'Days to sell through entire order quantity',
    formula: 'Turnover = (Order Quantity / Monthly Sales Velocity) × 30',
    formulaCode: '(orderQuantity / monthlySalesVelocity) * 30',
    example: 'Order 100 units, Sales 50/month → (100 / 50) × 30 = 60 days',
    units: 'days',
    displayFormat: '{value} days',
    category: 'Time',
    validate: (value) => typeof value === 'number' && value >= 0,
    thresholds: {
      green: 21,    // < 21 days = fast
      yellow: 45,   // 21-45 days = moderate
      red: 999      // > 45 days = slow
    },
    notes: 'Long turnover = cash tied up. Risk of obsolescence or storage fees.'
  }
};

/**
 * CATEGORY 4: CASH FLOW METRICS
 */
export const CASH_FLOW_METRICS = {
  cashRunway: {
    name: 'Cash Runway',
    shortName: 'Runway',
    industryStandard: true,
    amazonTerm: 'Months of Cash',
    definition: 'Months of operations before cash reserves reach zero',
    formula: 'Runway = Month when cumulative cash goes negative (from B4 simulation)',
    formulaCode: 'calculateCashFlow(...).runway',
    example: '4.2 months',
    units: 'months',
    displayFormat: '{value} months',
    category: 'Cash Flow',
    validate: (value) => typeof value === 'number' && value >= 0 && value <= 120,
    thresholds: {
      green: 6,     // >= 6 months = safe
      yellow: 3,    // 3-6 months = warning
      red: 0        // < 3 months = critical
    },
    notes: 'From B4 calculation. Accounts for reorder cycles and payment lag.'
  },

  cashReserve: {
    name: 'Cash Reserve (Initial Cash)',
    shortName: 'Cash on Hand',
    industryStandard: true,
    amazonTerm: 'Working Capital',
    definition: 'Available cash to fund operations before first profit arrives',
    formula: 'Cash Reserve = [User Input]',
    formulaCode: 'userInputCash || 0',
    example: '€5,000',
    units: '€',
    displayFormat: '€{value}',
    category: 'Cash Flow',
    validate: (value) => typeof value === 'number' && value >= 0,
    notes: 'Critical for runway calculation. Default €0 if not specified.'
  },

  monthlyReorderCost: {
    name: 'Monthly Reorder Cost',
    shortName: 'Reorder Cost',
    industryStandard: true,
    amazonTerm: 'Monthly Inventory Spend',
    definition: 'Cost to reorder inventory monthly (maintains stock levels)',
    formula: 'MRC = (Monthly Sales × Reorder Buffer) × Landed Cost',
    formulaCode: '(monthlySalesVelocity * reorderBuffer) * landedCost',
    example: 'Sales 50, Buffer 1.2, LC €21.50 → (50 × 1.2) × €21.50 = €1,290',
    units: '€/month',
    displayFormat: '€{value}/month',
    category: 'Cash Flow',
    validate: (value) => typeof value === 'number' && value >= 0,
    notes: 'Buffer (1.1-1.3) prevents stockouts. Higher buffer = more cash needed.'
  },

  monthlyCashInflow: {
    name: 'Monthly Cash Inflow (Net Profit)',
    shortName: 'Monthly Inflow',
    industryStandard: true,
    amazonTerm: 'Monthly Net Income',
    definition: 'Profit per unit × monthly sales = monthly cash from operations',
    formula: 'Inflow = PPU × Monthly Sales Velocity',
    formulaCode: 'profitPerUnit * monthlySalesVelocity',
    example: 'PPU €4.50, Sales 50 → €4.50 × 50 = €225/month',
    units: '€/month',
    displayFormat: '€{value}/month',
    category: 'Cash Flow',
    validate: (value) => typeof value === 'number',
    notes: 'Assume 1-month payment lag (Month N profit received in Month N+1).'
  }
};

/**
 * CATEGORY 5: RISK & HEALTH METRICS
 */
export const HEALTH_METRICS = {
  healthScore: {
    name: 'Health Score',
    shortName: 'Health',
    industryStandard: false, // Custom metric
    amazonTerm: 'N/A (Proprietary)',
    definition: 'Composite score (0-100) based on margin, break-even, cash flow, competition, inventory',
    formula: 'Health = (Margin × 0.25) + (Break-Even × 0.25) + (Cash Flow × 0.25) + (Competition × 0.15) + (Inventory × 0.10)',
    formulaCode: 'calculateProductHealthScore(...)',
    example: '72/100',
    units: 'score (0-100)',
    displayFormat: '{value}/100',
    category: 'Health',
    validate: (value) => typeof value === 'number' && value >= 0 && value <= 100,
    thresholds: {
      excellent: 80,
      good: 60,
      acceptable: 40,
      poor: 0
    },
    notes: 'Proprietary metric. Hover to see component breakdown (B1).'
  },

  riskLevel: {
    name: 'Risk Level',
    shortName: 'Risk',
    industryStandard: true,
    amazonTerm: 'Risk Assessment',
    definition: 'Overall business risk across 5 categories (Profitability, Break-Even, Cash Flow, Competition, Inventory)',
    formula: 'See B5 Risk Calculations',
    formulaCode: 'calculateAllRisks(...)',
    example: '🔴 Critical / ⚠️ Warning / ✅ Safe',
    units: 'level',
    displayFormat: '{emoji} {level}',
    category: 'Health',
    validate: (value) => ['red', 'yellow', 'green'].includes(value),
    notes: 'Traffic-light system. Red = immediate action required.'
  },

  returnRate: {
    name: 'Return Rate %',
    shortName: 'Returns',
    industryStandard: true,
    amazonTerm: 'Return Rate',
    definition: 'Percentage of units returned by customers',
    formula: 'Return Rate = (Returned Units / Total Sold Units) × 100',
    formulaCode: '(returnedUnits / totalSold) * 100',
    example: '5% (5 units returned per 100 sold)',
    units: '%',
    displayFormat: '{value}%',
    category: 'Health',
    validate: (value) => typeof value === 'number' && value >= 0 && value <= 100,
    notes: 'Defaults to category average if unknown. Directly reduces profit.'
  }
};

/**
 * DEPRECATED METRICS (DO NOT USE)
 */
export const DEPRECATED_METRICS = {
  grossProfitPerUnit: {
    name: 'Gross Profit Per Unit',
    status: 'DEPRECATED',
    reason: 'Incomplete - does not account for returns, fees, VAT, shipping',
    replacement: 'Use "Net Profit Per Unit" instead',
    oldFormula: 'Selling Price - COGS',
    whyBad: 'Misleading. Makes products look profitable when they are not.',
    migrationPath: 'Replace all instances with profitPerUnit'
  },

  grossMargin: {
    name: 'Gross Margin',
    status: 'DEPRECATED',
    reason: 'Ambiguous - unclear if includes fees or not',
    replacement: 'Use "Profit Margin %" instead',
    oldFormula: '(Selling Price - COGS) / Selling Price',
    whyBad: 'Confusing. Industry uses "Net Margin" for FBA.',
    migrationPath: 'Replace with profitMargin'
  }
};

/**
 * Get all metrics as flat list
 */
export function getAllMetrics() {
  return {
    ...PROFITABILITY_METRICS,
    ...COST_METRICS,
    ...TIME_METRICS,
    ...CASH_FLOW_METRICS,
    ...HEALTH_METRICS
  };
}

/**
 * Get metric by key
 */
export function getMetric(key) {
  const allMetrics = getAllMetrics();
  return allMetrics[key] || null;
}

/**
 * Validate metric value
 */
export function validateMetric(key, value) {
  const metric = getMetric(key);
  if (!metric) {
    return { valid: false, error: `Unknown metric: ${key}` };
  }
  
  const isValid = metric.validate(value);
  return isValid
    ? { valid: true }
    : { valid: false, error: `${metric.name} validation failed: ${value}` };
}

/**
 * Format metric for display
 */
export function formatMetric(key, value, options = {}) {
  const metric = getMetric(key);
  if (!metric) return String(value);
  
  const { showUnits = true, precision = 2 } = options;
  
  // Format number
  const formatted = typeof value === 'number'
    ? value.toFixed(precision)
    : String(value);
  
  // Apply display format
  if (showUnits && metric.displayFormat) {
    return metric.displayFormat
      .replace('{value}', formatted)
      .replace('{percent}', formatted);
  }
  
  return formatted;
}
