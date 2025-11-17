/**
 * Calculation Adapter Service
 * 
 * Converts platform-specific input into normalized calculation payload
 * Isolates platform changes from existing calculation engine
 * Ensures zero breakage of existing calculation logic
 */

const platformConfig = require('./platformConfig');

/**
 * Normalize platform-specific input to calculation engine format
 * @param {Object} platformData - Platform selection and input data
 * @param {string} platformData.platform - Platform identifier (amazon, shopify, ebay, none)
 * @param {string} platformData.platformType - Platform subtype (fba, fbm for Amazon)
 * @param {Object} platformData.inputData - Platform-specific input fields
 * @returns {Object} Normalized calculation payload
 */
function normalizeCalculationInput(platformData) {
  const { platform, platformType, inputData } = platformData;
  
  const platformSpec = platformConfig[platform];
  if (!platformSpec) {
    throw new Error(`Unknown platform: ${platform}`);
  }
  
  // Validate all required fields present
  const fieldsToUse = platform === 'amazon' ? platformSpec.inputFields[platformType] : platformSpec.inputFields;
  const requiredFields = fieldsToUse.filter(f => f.required).map(f => f.name);
  
  for (const field of requiredFields) {
    if (inputData[field] === undefined || inputData[field] === null || inputData[field] === '') {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  
  // Calculate fees using platform-specific logic
  const fees = platformSpec.feeCalculation({ ...inputData, type: platformType });
  
  // Return normalized payload (same structure expected by existing calculation engine)
  // Maps platform-specific fields to existing calculation engine format
  return {
    selling_price: parseFloat(inputData.sellingPrice) || 0,
    buying_price: parseFloat(inputData.cogs) || 0, // COGS = buying_price in existing system
    category: inputData.category || 'Electronics',
    destination_country: inputData.destination_country || 'Germany',
    length_cm: parseFloat(inputData.length) || parseFloat(inputData.length_cm) || 0,
    width_cm: parseFloat(inputData.width) || parseFloat(inputData.width_cm) || 0,
    height_cm: parseFloat(inputData.height) || parseFloat(inputData.height_cm) || 0,
    weight_kg: parseFloat(inputData.weight) || parseFloat(inputData.weight_kg) || 0,
    // Platform-specific fee data
    totalPlatformFees: fees.totalFees || 0,
    shippingCost: fees.shippingCost || inputData.shippingCostPerUnit || 0,
    platform: platform,
    platformType: platformType,
    feeBreakdown: fees, // Keep full breakdown for reporting
    // Amazon-specific fields for backward compatibility
    amazon_fee_percent: platform === 'amazon' ? (parseFloat(inputData.referralFeePercent) || 15) : 0,
    fba_fee_per_unit: platform === 'amazon' && platformType === 'fba' ? (parseFloat(inputData.fbaFeePerUnit) || 0) : 0
  };
}

module.exports = { normalizeCalculationInput };








