# Mock Data Service Layer

## Overview

This service layer provides mock order generation and fee calculation for cross-channel profitability analysis. It supports three channels: Amazon, Shopify, and Noon.

## Files

### 1. `mockOrderGenerators.js`

Generates realistic mock orders for three e-commerce channels:

- **`generateAmazonOrders(count = 20)`**: Generates Amazon FBA orders
- **`generateShopifyOrders(count = 20)`**: Generates Shopify orders
- **`generateNoonOrders(count = 20)`**: Generates Noon marketplace orders

#### Order Structure

Each order includes:
- Channel-specific identifiers and metadata
- Product information (SKU, name, price, quantity)
- Fee breakdown (channel fees, shipping costs)
- Profitability metrics (COGS, net profit, margin)
- Normalized fields for database persistence

#### Margin Targets

- **Amazon**: 35-50% margin
- **Shopify**: 20-35% margin
- **Noon**: 30-40% margin

### 2. `feeCalculators.js`

Calculates fees for each channel:

- **`calculateAmazonFees(sellingPrice, category = 'Electronics')`**: Amazon referral + FBA fees
- **`calculateShopifyFees(sellingPrice)`**: Shopify commission + payment processing
- **`calculateNoonFees(sellingPrice, category = 'Electronics')`**: Noon commission + platform fee

#### Fee Structures

**Amazon**:
- Referral fee: 15% (Electronics, default)
- FBA fee: €3.00/unit (average)
- Total: ~18-20% of selling price

**Shopify**:
- Commission: 2.9%
- Payment processing: 2.9%
- Total: 5.8% of selling price

**Noon**:
- Commission: 12%
- Platform fee: €0.50/order
- Total: 12% + €0.50 per order

## Usage

### Generate Mock Orders

```javascript
const { generateAmazonOrders, generateShopifyOrders, generateNoonOrders } = require('./mockOrderGenerators');

// Generate 20 Amazon orders
const amazonOrders = generateAmazonOrders(20);

// Generate 20 Shopify orders
const shopifyOrders = generateShopifyOrders(20);

// Generate 20 Noon orders
const noonOrders = generateNoonOrders(20);
```

### Calculate Fees

```javascript
const { calculateAmazonFees, calculateShopifyFees, calculateNoonFees } = require('./feeCalculators');

// Calculate Amazon fees
const amazonFees = calculateAmazonFees(50, 'Electronics');
// Returns: { referralFeePercent: 15, referralFeeAmount: 7.50, fbaFeePerUnit: 3.00, ... }

// Calculate Shopify fees
const shopifyFees = calculateShopifyFees(60);
// Returns: { shopifyCommissionPercent: 2.9, shopifyCommissionAmount: 1.74, ... }

// Calculate Noon fees
const noonFees = calculateNoonFees(45, 'Electronics');
// Returns: { commissionPercent: 12, commissionAmount: 5.40, platformFeePerOrder: 0.50, ... }
```

## Testing

Run the test script to verify functionality:

```bash
node server/services/test-mock-data.js
```

### Test Coverage

✅ Order generation (all 3 channels)
✅ Fee calculations (all 3 channels)
✅ Margin verification (target ranges)
✅ Data structure validation
✅ Date range validation (last 30 days)
✅ Product catalog validation

## Data Schema Compatibility

Generated orders include normalized fields compatible with the `ChannelSale` Prisma schema:

- `salePrice`: Total sale price (sellingPrice × quantity)
- `channelFees`: Total channel fees
- `shippingCost`: Total shipping costs
- `netProfit`: Total net profit
- `marginPercent`: Profit margin percentage
- `saleDate`: Order date (createdAt)

## Product Catalog

All orders use products from a fixed catalog:
- Wireless Charger
- USB Cable
- Phone Stand
- Screen Protector
- Phone Case

## Notes

- All prices in EUR
- Dates are within the last 30 days
- Margins are calculated to meet target ranges while maintaining realistic COGS
- FBA fees are simplified (average €3.00/unit) - production should use actual FBA calculator
- Platform fees (Noon) are per-order, not per-unit

## Next Steps

1. ✅ Mock data generation - **COMPLETE**
2. ⏳ API endpoints for data ingestion
3. ⏳ PostgreSQL persistence layer
4. ⏳ Data normalization and validation
5. ⏳ Integration with existing calculation engine








