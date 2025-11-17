function roundCurrency(value, decimals = 2) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

function buildBreakdown({
  grossSales,
  platformFee,
  fulfillmentFee,
  shippingCost,
  productCost,
  extraBreakdown = []
}) {
  const breakdown = [
    { label: 'Selling Price', amount: roundCurrency(grossSales) },
    { label: 'Platform Fee', amount: roundCurrency(-platformFee) }
  ];

  if (fulfillmentFee > 0) {
    breakdown.push({ label: 'Fulfillment Fee', amount: roundCurrency(-fulfillmentFee) });
  }

  if (shippingCost > 0) {
    breakdown.push({ label: 'Shipping Cost', amount: roundCurrency(-shippingCost) });
  }

  breakdown.push({ label: 'COGS', amount: roundCurrency(-productCost) });

  return breakdown.concat(extraBreakdown.map((entry) => ({
    label: entry.label,
    amount: roundCurrency(entry.amount)
  }))); 
}

function formatOutput({
  platform,
  price,
  cogs,
  quantity,
  platformFee,
  fulfillmentFee = 0,
  shippingCost = 0,
  warnings = [],
  extraBreakdown = []
}) {
  const sanitizedQuantity = quantity || 1;

  const grossSales = roundCurrency(price * sanitizedQuantity);
  const productCost = roundCurrency(cogs * sanitizedQuantity);
  const totalFees = roundCurrency(platformFee + fulfillmentFee + shippingCost);

  const profit = roundCurrency(grossSales - totalFees - productCost);
  const margin = grossSales === 0 ? 0 : roundCurrency((profit / grossSales) * 100);

  return {
    platform,
    grossSales,
    feesCosts: {
      platformFee: roundCurrency(platformFee),
      fulfillmentFee: roundCurrency(fulfillmentFee),
      shippingCost: roundCurrency(shippingCost),
      totalFees
    },
    productCost,
    profit,
    margin,
    breakdown: buildBreakdown({
      grossSales,
      platformFee,
      fulfillmentFee,
      shippingCost,
      productCost,
      extraBreakdown
    }),
    warnings
  };
}

module.exports = {
  roundCurrency,
  formatOutput
};
