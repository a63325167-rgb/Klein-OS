/**
 * Precision Management Utilities
 * Handles floating-point arithmetic and number formatting
 */

/**
 * Round to specified decimal places (avoids floating-point errors)
 */
export function roundToPrecision(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) {
    return 0;
  }
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

/**
 * Format number with specified decimal places
 */
export function formatNumber(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.00';
  }
  return roundToPrecision(value, decimals).toFixed(decimals);
}

/**
 * Format currency with locale awareness
 */
export function formatCurrency(value, currency = 'EUR', locale = 'de-DE', decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(0);
  }
  
  const roundedValue = roundToPrecision(value, decimals);
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(roundedValue);
}

/**
 * Format percentage
 */
export function formatPercentage(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.0%';
  }
  return `${formatNumber(value, decimals)}%`;
}

/**
 * Safely add multiple numbers (avoids floating-point errors)
 */
export function safeAdd(...numbers) {
  const decimals = 4; // Use 4 decimals internally for precision
  const multiplier = Math.pow(10, decimals);
  
  const sum = numbers.reduce((acc, num) => {
    const value = num === null || num === undefined || isNaN(num) ? 0 : num;
    return acc + Math.round(value * multiplier);
  }, 0);
  
  return sum / multiplier;
}

/**
 * Safely subtract numbers (avoids floating-point errors)
 */
export function safeSubtract(a, b) {
  const decimals = 4;
  const multiplier = Math.pow(10, decimals);
  
  const numA = a === null || a === undefined || isNaN(a) ? 0 : a;
  const numB = b === null || b === undefined || isNaN(b) ? 0 : b;
  
  return (Math.round(numA * multiplier) - Math.round(numB * multiplier)) / multiplier;
}

/**
 * Safely multiply numbers (avoids floating-point errors)
 */
export function safeMultiply(a, b) {
  const decimals = 4;
  const multiplier = Math.pow(10, decimals);
  
  const numA = a === null || a === undefined || isNaN(a) ? 0 : a;
  const numB = b === null || b === undefined || isNaN(b) ? 0 : b;
  
  return (Math.round(numA * multiplier) * Math.round(numB * multiplier)) / (multiplier * multiplier);
}

/**
 * Safely divide numbers (handles division by zero)
 */
export function safeDivide(a, b, defaultValue = 0) {
  const numA = a === null || a === undefined || isNaN(a) ? 0 : a;
  const numB = b === null || b === undefined || isNaN(b) ? 0 : b;
  
  if (numB === 0) {
    return defaultValue;
  }
  
  return numA / numB;
}

/**
 * Calculate percentage safely
 */
export function calculatePercentage(value, total, decimals = 2) {
  const result = safeDivide(value, total, 0) * 100;
  return roundToPrecision(result, decimals);
}

/**
 * Parse number from string (handles various formats)
 */
export function parseNumberSafe(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  
  // Handle string inputs with commas or spaces
  const cleaned = String(value).replace(/[,\s]/g, '');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Clamp number between min and max
 */
export function clamp(value, min, max) {
  const num = parseNumberSafe(value);
  return Math.max(min, Math.min(max, num));
}

/**
 * Check if two numbers are equal within tolerance
 */
export function isEqualWithTolerance(a, b, tolerance = 0.01) {
  return Math.abs(a - b) < tolerance;
}

/**
 * Currency conversion rates (can be extended)
 */
export const CURRENCY_RATES = {
  EUR: 1,
  USD: 1.08,
  GBP: 0.86,
  MAD: 10.85
};

/**
 * Convert between currencies
 */
export function convertCurrency(amount, fromCurrency = 'EUR', toCurrency = 'EUR') {
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  const inEUR = amount / (CURRENCY_RATES[fromCurrency] || 1);
  const converted = inEUR * (CURRENCY_RATES[toCurrency] || 1);
  
  return roundToPrecision(converted, 2);
}

