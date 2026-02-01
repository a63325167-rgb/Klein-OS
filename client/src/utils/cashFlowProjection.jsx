const currencyFormatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0
});

const formatCurrency = (value) => currencyFormatter.format(value || 0);

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export function generateCashFlowProjection(result) {
  if (!result || !result.totals || !result.input) {
    return { months: [], reserveNeededFormatted: formatCurrency(0), needsReserve: false, negativeMonthCount: 0 };
  }

  const input = result.input;
  const totals = result.totals;

  const setupCosts = parseFloat(input.fixed_costs) || 500;
  const buyingPrice = parseFloat(input.buying_price) || 0;
  const sellingPrice = parseFloat(input.selling_price) || 0;
  const netProfitPerUnit = parseFloat(totals.net_profit) || 0;
  const annualVolume = parseInt(input.annual_volume, 10) || 500;

  const initialUnits = clamp(Math.round((annualVolume || 500) * 0.2), 50, 200);
  const reorderUnits = Math.round(initialUnits * 0.5);
  const monthlyUnits = Math.round(annualVolume / 12) || 40;

  const inventoryCost = buyingPrice * initialUnits;
  const reorderCost = buyingPrice * reorderUnits;

  const months = [];
  let cumulative = 0;
  let minCumulative = 0;

  const pushMonth = (data) => {
    cumulative += data.cashFlow;
    minCumulative = Math.min(minCumulative, cumulative);
    const status = cumulative >= 0
      ? (data.statusOverride || 'profit')
      : data.statusOverride || data.status;

    months.push({
      ...data,
      index: months.length,
      cumulative,
      cumulativeFormatted: formatCurrency(cumulative),
      cashFlowFormatted: formatCurrency(data.cashFlow),
      status
    });
  };

  pushMonth({
    label: 'Month 1',
    phase: 'Investment Phase',
    cashFlow: -(setupCosts + inventoryCost),
    status: 'invest',
    summary: `Setup costs (${formatCurrency(setupCosts)}) + initial inventory order (${formatCurrency(inventoryCost)})`
  });

  const month2Units = clamp(Math.round(initialUnits * 0.2), 20, 60);
  const month2Revenue = month2Units * sellingPrice;
  const payoutDelay = month2Revenue * 0.5; // 14 day delay => only half accessible
  pushMonth({
    label: 'Month 2',
    phase: 'Ramp-Up',
    cashFlow: payoutDelay - (inventoryCost * 0.1),
    status: 'waiting',
    summary: `${formatCurrency(month2Units * sellingPrice)} revenue with 14-day payout delay`
  });

  const month3Units = clamp(Math.round(initialUnits * 0.5), 40, 120);
  const month3Revenue = month3Units * sellingPrice;
  pushMonth({
    label: 'Month 3',
    phase: 'Break-Even',
    cashFlow: (month3Revenue * 0.8) - reorderCost,
    status: 'breakeven',
    summary: `Break-even achieved. Reorder ${reorderUnits} units (${formatCurrency(reorderCost)}).`
  });

  for (let i = 4; i <= 6; i++) {
    const revenue = monthlyUnits * sellingPrice;
    const profit = monthlyUnits * netProfitPerUnit;
    pushMonth({
      label: `Month ${i}`,
      phase: 'Profit Growth',
      cashFlow: profit,
      status: 'profit',
      summary: `${formatCurrency(revenue)} revenue (${monthlyUnits} units) - positive Amazon payouts`
    });
  }

  const negativeMonths = months.filter((m) => m.cumulative < 0);
  const needsReserve = negativeMonths.length >= 3;
  const reserveNeeded = Math.abs(minCumulative);

  return {
    months,
    reserveNeeded,
    reserveNeededFormatted: formatCurrency(reserveNeeded),
    needsReserve,
    negativeMonthCount: negativeMonths.length
  };
}
