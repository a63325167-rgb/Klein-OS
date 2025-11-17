const { validateInput } = require('./validation');
const { formatOutput, roundCurrency } = require('./formatting');

const REFERRAL_RATE = 0.15; // 15% of selling price
const FBM_AVERAGE_SHIPPING = 5; // €5 per unit
const FBA_MAX_WEIGHT_KG = 30;

const FBA_WEIGHT_BRACKETS = [
  { maxGrams: 250, fee: 1.5 },
  { maxGrams: 500, fee: 2.0 },
  { maxGrams: 750, fee: 2.5 },
  { maxGrams: 1000, fee: 3.0 }
];

function gramsFromKg(weightKg) {
  return Math.max(weightKg, 0) * 1000;
}

function calculateFbaFulfillmentFee(weightKg) {
  const grams = gramsFromKg(weightKg);

  for (const bracket of FBA_WEIGHT_BRACKETS) {
    if (grams <= bracket.maxGrams) {
      return bracket.fee;
    }
  }

  const cappedGrams = Math.min(grams, FBA_MAX_WEIGHT_KG * 1000);
  const extraGrams = Math.max(cappedGrams - 1000, 0);
  const extraSteps = Math.ceil(extraGrams / 250);
  return 3 + extraSteps * 0.5;
}

function calculateReferralFee(price, quantity) {
  return roundCurrency(price * REFERRAL_RATE * quantity);
}

function calculateFbaFulfillmentTotal(weightKg, quantity) {
  const perUnit = calculateFbaFulfillmentFee(weightKg);
  return roundCurrency(perUnit * quantity);
}

function calculateAmazonFBA(input) {
  const { values, warnings } = validateInput(input);
  const { price, cogs, weight, quantity } = values;

  const referralFee = calculateReferralFee(price, quantity);
  const fulfillmentFee = calculateFbaFulfillmentTotal(weight, quantity);

  const fbaWarnings = [];
  if (weight > FBA_MAX_WEIGHT_KG) {
    fbaWarnings.push({
      level: 'warning',
      message: 'Amazon FBA fees are only modeled up to 30kg. Rates have been capped at 30kg.'
    });
  }

  return formatOutput({
    platform: 'amazon_fba',
    price,
    cogs,
    quantity,
    platformFee: referralFee,
    fulfillmentFee,
    shippingCost: 0,
    warnings: warnings.concat(fbaWarnings)
  });
}

function calculateAmazonFBM(input) {
  const { values, warnings } = validateInput(input);
  const { price, cogs, weight, quantity } = values;

  const referralFee = calculateReferralFee(price, quantity);
  const shippingCost = roundCurrency(FBM_AVERAGE_SHIPPING * quantity);

  return formatOutput({
    platform: 'amazon_fbm',
    price,
    cogs,
    quantity,
    platformFee: referralFee,
    fulfillmentFee: 0,
    shippingCost,
    warnings
  });
}

module.exports = {
  calculateAmazonFBA,
  calculateAmazonFBM
};
