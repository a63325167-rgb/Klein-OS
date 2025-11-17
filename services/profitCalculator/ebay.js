const { validateInput } = require('./validation');
const { formatOutput, roundCurrency } = require('./formatting');

const FINAL_VALUE_RATE = 0.128; // 12.8%
const PAYPAL_PERCENT_RATE = 0.0349; // 3.49%
const PAYPAL_FIXED_FEE = 0.35; // €0.35 per transaction
const EBAY_SHIPPING_AVERAGE = 5; // €5 per order for shipping (seller pays)

function calculateEbay(input) {
  const { values, warnings } = validateInput(input);
  const { price, cogs, quantity } = values;

  const grossSales = price * quantity;

  const platformFee = roundCurrency(grossSales * FINAL_VALUE_RATE);
  const paypalPercentFees = roundCurrency(grossSales * PAYPAL_PERCENT_RATE);
  const paypalFixedFees = roundCurrency(PAYPAL_FIXED_FEE * quantity);
  const paypalFees = roundCurrency(paypalPercentFees + paypalFixedFees);
  const shippingCost = roundCurrency(EBAY_SHIPPING_AVERAGE * quantity);

  return formatOutput({
    platform: 'ebay',
    price,
    cogs,
    quantity,
    platformFee: roundCurrency(platformFee + paypalFees),
    fulfillmentFee: 0,
    shippingCost,
    warnings,
    extraBreakdown: [
      { label: 'eBay Final Value Fee', amount: -platformFee },
      { label: 'PayPal % Fee', amount: -paypalPercentFees },
      { label: 'PayPal Fixed Fee', amount: -paypalFixedFees },
      { label: 'Shipping', amount: -shippingCost }
    ]
  });
}

module.exports = {
  calculateEbay
};
