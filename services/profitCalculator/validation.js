const MAX_PRICE_WARNING_LOW = 0.5;
const MAX_PRICE_WARNING_HIGH = 5000;
const MAX_WEIGHT_KG = 100;
const MIN_WEIGHT_WARNING = 0.01;
const MAX_QUANTITY_WARNING = 100000;
const THIN_MARGIN_RATIO = 0.8;

function toNumber(value, fieldName) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    throw new Error(`${fieldName} must be a finite number`);
  }
  return number;
}

function normalizeReturnRate(raw) {
  if (raw == null) {
    return null;
  }

  let rate = Number(raw);
  if (!Number.isFinite(rate)) {
    throw new Error('returnRate must be numeric when provided');
  }

  if (rate > 1) {
    rate = rate / 100;
  }

  if (rate < 0) {
    throw new Error('returnRate cannot be negative');
  }

  return rate;
}

function validateInput(input = {}) {
  if (typeof input !== 'object' || input === null) {
    throw new Error('Input must be an object with price, cogs, weight, and quantity');
  }

  const warnings = [];

  const price = toNumber(input.price, 'price');
  const cogs = toNumber(input.cogs, 'cogs');
  const weight = toNumber(input.weight, 'weight');
  const quantity = input.quantity == null ? 1 : toNumber(input.quantity, 'quantity');
  const sellerRating = input.sellerRating == null ? null : toNumber(input.sellerRating, 'sellerRating');
  const returnRate = normalizeReturnRate(input.returnRate);

  if (price <= 0) {
    throw new Error('Price must be greater than 0');
  }

  if (price < MAX_PRICE_WARNING_LOW || price > MAX_PRICE_WARNING_HIGH) {
    warnings.push({
      level: 'warning',
      message: `Price (€${price.toFixed(2)}) is outside the typical €${MAX_PRICE_WARNING_LOW.toFixed(2)}-€${MAX_PRICE_WARNING_HIGH.toFixed(2)} range`
    });
  }

  if (cogs < 0) {
    throw new Error('COGS must be greater than or equal to 0');
  }

  if (cogs > price * THIN_MARGIN_RATIO) {
    warnings.push({
      level: 'warning',
      message: 'Very thin margin: COGS exceeds 80% of selling price'
    });
  }

  if (weight <= 0) {
    throw new Error('Weight must be greater than 0kg');
  }

  if (weight < MIN_WEIGHT_WARNING) {
    warnings.push({
      level: 'warning',
      message: `Weight (${weight}kg) is unusually low (< ${MIN_WEIGHT_WARNING}kg)`
    });
  }

  if (weight > MAX_WEIGHT_KG) {
    throw new Error(`Weight must be less than or equal to ${MAX_WEIGHT_KG}kg`);
  }

  if (quantity <= 0) {
    throw new Error('Quantity must be greater than 0');
  }

  if (quantity > MAX_QUANTITY_WARNING) {
    warnings.push({
      level: 'warning',
      message: `Monthly units (${quantity}) exceed the typical ${MAX_QUANTITY_WARNING.toLocaleString()} limit`
    });
  }

  if (returnRate != null && (returnRate < 0.02 || returnRate > 0.5)) {
    warnings.push({
      level: 'warning',
      message: `Return rate (${(returnRate * 100).toFixed(2)}%) is outside the usual 2%-50% range`
    });
  }

  const values = {
    price,
    cogs,
    weight,
    quantity,
    sellerRating,
    returnRate
  };

  return { values, warnings };
}

module.exports = {
  validateInput
};
