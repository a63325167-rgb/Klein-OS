/**
 * Optimal Order Quantity Calculator
 * Determines the best order size based on cash flow, storage, demand, and supplier constraints
 */

const formatCurrency = (value) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2
  }).format(value || 0);
};

/**
 * Calculate storage cost per month for given quantity
 */
function calculateStorageCost(quantity, dimensionalWeight = 0, weight = 0) {
  // Amazon storage fees (approximate)
  // Standard size: €0.75 per cubic meter per month (Jan-Sep), €1.20 (Oct-Dec)
  // Assume average €0.90 per cubic meter
  
  const effectiveWeight = Math.max(dimensionalWeight, weight);
  
  // Rough estimate: €0.50-2.00 per unit per month depending on size
  let costPerUnit;
  if (effectiveWeight < 1) {
    costPerUnit = 0.30; // Small items
  } else if (effectiveWeight < 5) {
    costPerUnit = 0.60; // Medium items
  } else if (effectiveWeight < 10) {
    costPerUnit = 1.00; // Large items
  } else if (effectiveWeight < 20) {
    costPerUnit = 1.50; // Very large items
  } else {
    costPerUnit = 2.50; // Oversized items
  }
  
  return quantity * costPerUnit;
}

/**
 * Calculate optimal order quantity
 */
export function calculateOptimalOrderQuantity(result, cashAvailable = null) {
  if (!result || !result.totals || !result.input) {
    return null;
  }

  // Extract data
  const buyingPrice = parseFloat(result.input.buying_price) || 0;
  const annualVolume = parseInt(result.input.annual_volume) || 500;
  const supplierMOQ = parseInt(result.input.supplier_moq) || 50;
  const weight = parseFloat(result.input.weight_kg) || 0;
  const dimensionalWeight = result.shipping?.dimensionalWeight || 0;
  const netProfit = result.totals.net_profit || 0;
  const setupCost = parseFloat(result.input.fixed_costs) || 500;
  
  // Calculate monthly sales forecast
  const monthlySales = Math.round(annualVolume / 12);
  
  // Default cash available (if not provided, estimate based on typical startup capital)
  const defaultCash = Math.max(buyingPrice * 100, 5000); // At least €5k or 100 units worth
  const cash = cashAvailable !== null ? cashAvailable : defaultCash;
  
  // Calculate constraints
  
  // 1. Cash flow constraint
  const maxByCash = Math.floor(cash / buyingPrice);
  
  // 2. Storage capacity constraint (3-month turnover ideal)
  const idealByStorage = monthlySales * 3;
  
  // 3. Demand forecast constraint (25% of annual for first order)
  const maxByDemand = Math.ceil(annualVolume * 0.25);
  
  // 4. Supplier MOQ constraint
  const minBySupplier = supplierMOQ;
  
  // Calculate optimal quantity
  // Take minimum of constraints, but not less than supplier MOQ
  let optimalQuantity = Math.min(maxByCash, idealByStorage, maxByDemand);
  optimalQuantity = Math.max(optimalQuantity, minBySupplier);
  
  // Round to nearest 5 or 10 for practical ordering
  if (optimalQuantity > 100) {
    optimalQuantity = Math.round(optimalQuantity / 10) * 10;
  } else if (optimalQuantity > 20) {
    optimalQuantity = Math.round(optimalQuantity / 5) * 5;
  }
  
  // Calculate metrics for this quantity
  const totalCost = optimalQuantity * buyingPrice;
  const monthlyStorageCost = calculateStorageCost(optimalQuantity, dimensionalWeight, weight);
  const weeksOfSupply = Math.round((optimalQuantity / monthlySales) * 4.33);
  const daysOfSupply = Math.round((optimalQuantity / annualVolume) * 365);
  
  // Calculate reorder point (2 weeks of supply)
  const reorderPoint = Math.ceil(monthlySales / 2);
  
  // Calculate next order size (scale up by 50-100%)
  let nextOrderSize = Math.round(optimalQuantity * 1.5);
  if (nextOrderSize > 100) {
    nextOrderSize = Math.round(nextOrderSize / 10) * 10;
  } else if (nextOrderSize > 20) {
    nextOrderSize = Math.round(nextOrderSize / 5) * 5;
  }
  
  // Determine limiting factor
  let limitingFactor;
  let limitingReason;
  
  if (optimalQuantity === maxByCash && maxByCash < idealByStorage) {
    limitingFactor = 'cash';
    limitingReason = `Cash available (${formatCurrency(cash)}) limits order to ${optimalQuantity} units`;
  } else if (optimalQuantity === idealByStorage && idealByStorage < maxByDemand) {
    limitingFactor = 'storage';
    limitingReason = `Optimal 3-month supply is ${optimalQuantity} units`;
  } else if (optimalQuantity === maxByDemand) {
    limitingFactor = 'demand';
    limitingReason = `Conservative first order (25% of annual forecast)`;
  } else if (optimalQuantity === minBySupplier) {
    limitingFactor = 'moq';
    limitingReason = `Supplier minimum order quantity is ${minBySupplier} units`;
  } else {
    limitingFactor = 'balanced';
    limitingReason = 'Balanced across all constraints';
  }
  
  // Generate scale plan
  const scalePlan = [];
  
  // First milestone: After initial order sells
  scalePlan.push({
    milestone: `After ${optimalQuantity} units sell`,
    action: `Order ${nextOrderSize} units`,
    benefit: 'Proven demand, reduce per-unit risk'
  });
  
  // Second milestone: Volume discount threshold
  const volumeDiscountThreshold = Math.max(100, Math.ceil(optimalQuantity * 2));
  scalePlan.push({
    milestone: `At ${volumeDiscountThreshold}+ units`,
    action: 'Negotiate 5-10% volume discount',
    benefit: `Save ${formatCurrency(buyingPrice * volumeDiscountThreshold * 0.075)}/order`
  });
  
  // Third milestone: Bulk ordering
  if (annualVolume > 500) {
    scalePlan.push({
      milestone: 'After 3 months of consistent sales',
      action: `Order ${Math.round(monthlySales * 6)} units (6-month supply)`,
      benefit: 'Reduce order frequency, better cash flow'
    });
  }
  
  // Calculate break-even for this order
  const unitsToBreakEven = Math.ceil((setupCost + totalCost) / (netProfit + buyingPrice));
  
  // Risk assessment for this quantity
  let riskLevel, riskColor, riskMessage;
  const cashUtilization = (totalCost / cash) * 100;
  
  if (cashUtilization > 80) {
    riskLevel = 'HIGH';
    riskColor = 'red';
    riskMessage = 'Using >80% of available cash - leaves no buffer for unexpected costs';
  } else if (cashUtilization > 60) {
    riskLevel = 'MEDIUM';
    riskColor = 'yellow';
    riskMessage = 'Moderate cash utilization - ensure you have reserve for reorders';
  } else {
    riskLevel = 'LOW';
    riskColor = 'green';
    riskMessage = 'Conservative cash utilization - good buffer for unexpected costs';
  }
  
  return {
    optimalQuantity,
    totalCost,
    monthlyStorageCost,
    weeksOfSupply,
    daysOfSupply,
    reorderPoint,
    nextOrderSize,
    limitingFactor,
    limitingReason,
    scalePlan,
    unitsToBreakEven,
    constraints: {
      cash: {
        available: cash,
        maxUnits: maxByCash,
        utilized: totalCost,
        utilizationPercent: cashUtilization,
        isLimiting: limitingFactor === 'cash'
      },
      storage: {
        idealUnits: idealByStorage,
        monthlyCost: monthlyStorageCost,
        weeksOfSupply,
        isLimiting: limitingFactor === 'storage'
      },
      demand: {
        annualForecast: annualVolume,
        monthlySales,
        maxFirstOrder: maxByDemand,
        isLimiting: limitingFactor === 'demand'
      },
      supplier: {
        moq: minBySupplier,
        isLimiting: limitingFactor === 'moq'
      }
    },
    risk: {
      level: riskLevel,
      color: riskColor,
      message: riskMessage
    },
    formatted: {
      optimalQuantity: optimalQuantity.toLocaleString('de-DE'),
      totalCost: formatCurrency(totalCost),
      monthlyStorageCost: formatCurrency(monthlyStorageCost),
      cashAvailable: formatCurrency(cash),
      reorderPoint: reorderPoint.toLocaleString('de-DE'),
      nextOrderSize: nextOrderSize.toLocaleString('de-DE'),
      annualVolume: annualVolume.toLocaleString('de-DE'),
      monthlySales: monthlySales.toLocaleString('de-DE')
    }
  };
}

/**
 * Calculate order quantity for a specific cash amount (for scenario testing)
 */
export function calculateOrderQuantityForCash(result, cashAmount) {
  return calculateOptimalOrderQuantity(result, cashAmount);
}
