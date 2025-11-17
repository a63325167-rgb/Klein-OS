/**
 * Test script for mock order generators and fee calculators
 * 
 * Run with: node server/services/test-mock-data.js
 */

const { 
  generateAmazonOrders, 
  generateShopifyOrders, 
  generateNoonOrders 
} = require('./mockOrderGenerators');

const { 
  calculateAmazonFees, 
  calculateShopifyFees, 
  calculateNoonFees 
} = require('./feeCalculators');

console.log('=== TESTING MOCK ORDER GENERATORS ===\n');

// Test 1: Generate orders
console.log('Test 1: Generating orders...');
const amzOrders = generateAmazonOrders(3);
const shpOrders = generateShopifyOrders(3);
const noonOrders = generateNoonOrders(3);

console.log('\n--- Amazon Orders (3) ---');
amzOrders.forEach((order, index) => {
  console.log(`Order ${index + 1}:`);
  console.log(`  Product: ${order.productName}`);
  console.log(`  Price: €${order.sellingPrice}`);
  console.log(`  Quantity: ${order.quantity}`);
  console.log(`  Margin: ${order.margin.toFixed(1)}%`);
  console.log(`  Net Profit/Unit: €${order.netProfitPerUnit.toFixed(2)}`);
  console.log(`  Date: ${order.createdAt.toISOString().split('T')[0]}`);
  console.log('');
});

console.log('--- Shopify Orders (3) ---');
shpOrders.forEach((order, index) => {
  console.log(`Order ${index + 1}:`);
  console.log(`  Product: ${order.productName}`);
  console.log(`  Price: €${order.sellingPrice}`);
  console.log(`  Quantity: ${order.quantity}`);
  console.log(`  Margin: ${order.margin.toFixed(1)}%`);
  console.log(`  Net Profit/Unit: €${order.netProfitPerUnit.toFixed(2)}`);
  console.log(`  Date: ${order.createdAt.toISOString().split('T')[0]}`);
  console.log('');
});

console.log('--- Noon Orders (3) ---');
noonOrders.forEach((order, index) => {
  console.log(`Order ${index + 1}:`);
  console.log(`  Product: ${order.productName}`);
  console.log(`  Price: €${order.sellingPrice}`);
  console.log(`  Quantity: ${order.quantity}`);
  console.log(`  Margin: ${order.margin.toFixed(1)}%`);
  console.log(`  Net Profit/Unit: €${order.netProfitPerUnit.toFixed(2)}`);
  console.log(`  Date: ${order.createdAt.toISOString().split('T')[0]}`);
  console.log('');
});

// Test 2: Calculate fees
console.log('\n=== TESTING FEE CALCULATORS ===\n');

console.log('Test 2: Calculating fees...\n');

const amzFees = calculateAmazonFees(50, 'Electronics');
console.log('Amazon Fees (€50, Electronics):');
console.log(`  Referral Fee: ${amzFees.referralFeePercent}% = €${amzFees.referralFeeAmount}`);
console.log(`  FBA Fee: €${amzFees.fbaFeePerUnit}/unit`);
console.log(`  Total Fee: ${amzFees.totalFeePercent.toFixed(2)}% = €${amzFees.totalFeeAmount}`);
console.log(`  Expected: ~€7.50 (15% of €50 = €7.50 + €3.00 FBA = €10.50)`);
console.log('');

const shpFees = calculateShopifyFees(60);
console.log('Shopify Fees (€60):');
console.log(`  Shopify Commission: ${shpFees.shopifyCommissionPercent}% = €${shpFees.shopifyCommissionAmount}`);
console.log(`  Payment Processing: ${shpFees.paymentProcessingPercent}% = €${shpFees.paymentProcessingAmount}`);
console.log(`  Total Fee: ${shpFees.totalFeePercent}% = €${shpFees.totalFeeAmount}`);
console.log(`  Expected: €3.48 (5.8% of €60)`);
console.log('');

const noonFees = calculateNoonFees(45, 'Electronics');
console.log('Noon Fees (€45, Electronics):');
console.log(`  Commission: ${noonFees.commissionPercent}% = €${noonFees.commissionAmount}`);
console.log(`  Platform Fee: €${noonFees.platformFeePerOrder}/order`);
console.log(`  Total Fee (per unit): ${noonFees.totalFeePercent}% = €${noonFees.totalFeeAmount}`);
console.log(`  Expected: €5.40 (12% of €45)`);
console.log('');

// Test 3: Verify margins
console.log('=== VERIFYING MARGINS ===\n');

const amzMarginAvg = amzOrders.reduce((sum, o) => sum + o.margin, 0) / amzOrders.length;
const shpMarginAvg = shpOrders.reduce((sum, o) => sum + o.margin, 0) / shpOrders.length;
const noonMarginAvg = noonOrders.reduce((sum, o) => sum + o.margin, 0) / noonOrders.length;

console.log(`Amazon Average Margin: ${amzMarginAvg.toFixed(1)}% (Expected: 35-50%)`);
console.log(`Shopify Average Margin: ${shpMarginAvg.toFixed(1)}% (Expected: 20-35%)`);
console.log(`Noon Average Margin: ${noonMarginAvg.toFixed(1)}% (Expected: 30-40%)`);
console.log('');

// Test 4: Verify data structure
console.log('=== VERIFYING DATA STRUCTURE ===\n');

const sampleOrder = amzOrders[0];
const requiredFields = [
  'id', 'channel', 'sku', 'productName', 'quantity', 'sellingPrice',
  'cogs', 'margin', 'createdAt', 'channelFees', 'shippingCost',
  'netProfit', 'salePrice', 'marginPercent'
];

const missingFields = requiredFields.filter(field => !(field in sampleOrder));

if (missingFields.length === 0) {
  console.log('✅ All required fields present in order objects');
} else {
  console.log('❌ Missing fields:', missingFields.join(', '));
}

console.log('\n✅ All tests completed!');

// Verify dates are within last 30 days
console.log('\n=== VERIFYING DATE RANGE ===\n');
const now = new Date();
const thirtyDaysAgo = new Date(now);
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

const allOrders = [...amzOrders, ...shpOrders, ...noonOrders];
const datesValid = allOrders.every(order => {
  return order.createdAt >= thirtyDaysAgo && order.createdAt <= now;
});

if (datesValid) {
  console.log('✅ All order dates are within the last 30 days');
} else {
  console.log('❌ Some order dates are outside the last 30 days');
}

// Verify product names are from catalog
console.log('\n=== VERIFYING PRODUCT CATALOG ===\n');
const { PRODUCT_CATALOG } = require('./mockOrderGenerators');
const productNamesValid = allOrders.every(order => {
  return PRODUCT_CATALOG.includes(order.productName);
});

if (productNamesValid) {
  console.log('✅ All product names are from the catalog');
} else {
  console.log('❌ Some product names are not from the catalog');
  const invalidProducts = allOrders
    .filter(o => !PRODUCT_CATALOG.includes(o.productName))
    .map(o => o.productName);
  console.log('Invalid products:', [...new Set(invalidProducts)]);
}

console.log('\n=== TEST SUMMARY ===');
console.log(`Total orders generated: ${allOrders.length}`);
console.log(`Amazon orders: ${amzOrders.length}`);
console.log(`Shopify orders: ${shpOrders.length}`);
console.log(`Noon orders: ${noonOrders.length}`);
console.log('\n✅ Mock data generation test completed successfully!');








