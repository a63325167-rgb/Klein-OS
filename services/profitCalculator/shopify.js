const { validateInput } = require('./validation');
const { formatOutput, roundCurrency } = require('./formatting');

const SHOPIFY_TRANSACTION_RATE = 0.029; // 2.9%
const SHOPIFY_FIXED_FEE = 0.3; // €0.30 per transaction

function calculateShopify(input) {
  const { values, warnings } = validateInput(input);
  const { price, cogs, quantity } = values;

  const percentageFees = roundCurrency(price * SHOPIFY_TRANSACTION_RATE * quantity);
  const fixedFees = roundCurrency(SHOPIFY_FIXED_FEE * quantity);
  const platformFee = roundCurrency(percentageFees + fixedFees);

  return formatOutput({
    platform: 'shopify',
    price,
    cogs,
    quantity,
    platformFee,
    fulfillmentFee: 0,
    shippingCost: 0,
    warnings,
    extraBreakdown: [
      { label: 'Transaction % Fee', amount: -percentageFees },
      { label: 'Transaction Fixed Fee', amount: -fixedFees }
    ]
  });
}

module.exports = {
  calculateShopify
};
