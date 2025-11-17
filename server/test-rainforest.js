/**
 * Test script for Rainforest API
 * Usage: node test-rainforest.js [ASIN] [domain]
 * Example: node test-rainforest.js B08N5WRWNW de
 */

const https = require('https');

// API Configuration
const API_KEY = '7BA02CB83B274132A7968F241D839111';
const ASIN = process.argv[2] || 'B08N5WRWNW';
const DOMAIN = process.argv[3] || 'de';

console.log('='.repeat(60));
console.log('Rainforest API Test Script');
console.log('='.repeat(60));
console.log(`API Key: ${API_KEY}`);
console.log(`ASIN: ${ASIN}`);
console.log(`Domain: amazon.${DOMAIN}`);
console.log('='.repeat(60));

// Build URL
const url = `https://api.rainforestapi.com/request?` + 
  `api_key=${API_KEY}&` +
  `type=product&` +
  `asin=${ASIN}&` +
  `amazon_domain=amazon.${DOMAIN}`;

console.log('\nRequest URL:', url);
console.log('\nMaking request...\n');

// Make request
https.get(url, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response received!');
    console.log('Status Code:', res.statusCode);
    console.log('\n' + '='.repeat(60));
    console.log('Response Body:');
    console.log('='.repeat(60));
    
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
      
      if (parsed.error) {
        console.log('\n❌ ERROR:', parsed.error);
      } else if (parsed.product) {
        console.log('\n✅ SUCCESS!');
        console.log('Product Title:', parsed.product.title);
        console.log('Price:', parsed.product.buybox_winner?.price?.value, parsed.product.buybox_winner?.price?.currency);
      }
    } catch (error) {
      console.log('Raw response:', data);
      console.log('\n❌ Failed to parse JSON:', error.message);
    }
    
    console.log('\n' + '='.repeat(60));
  });
}).on('error', (error) => {
  console.error('❌ Request failed:', error.message);
});









