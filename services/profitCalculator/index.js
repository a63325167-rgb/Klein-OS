const { calculateAmazonFBA, calculateAmazonFBM } = require('./amazon');
const { calculateShopify } = require('./shopify');
const { calculateEbay } = require('./ebay');
const { validateInput } = require('./validation');

function calculate(platform, input) {
  if (!platform || typeof platform !== 'string') {
    throw new Error('Platform must be a non-empty string');
  }

  const normalizedPlatform = platform.toLowerCase();

  switch (normalizedPlatform) {
    case 'amazon_fba':
      return calculateAmazonFBA(input);
    case 'amazon_fbm':
      return calculateAmazonFBM(input);
    case 'shopify':
      return calculateShopify(input);
    case 'ebay':
      return calculateEbay(input);
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

module.exports = {
  calculate,
  validateInput,
  calculateAmazonFBA,
  calculateAmazonFBM,
  calculateShopify,
  calculateEbay
};
