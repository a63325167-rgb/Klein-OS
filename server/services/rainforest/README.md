# Rainforest API Integration

This directory contains the Rainforest API client for fetching Amazon product data.

## Overview

The Rainforest API allows us to fetch real-time Amazon product information including:
- Product titles
- Prices
- Dimensions (length, width, height)
- Weight
- Categories
- Images
- Ratings and reviews
- Fulfillment type (FBA/FBM)

## API Configuration

### API Key
```
RAINFOREST_API_KEY=Y7BA02CB83B274132A7968F241D839111
```

### Base URL
```
https://api.rainforestapi.com
```

## File Structure

```
/services/rainforest/
  ├── client.js          # Main Rainforest API client
  └── README.md          # This file
```

## Usage

### Fetching Product Data

```javascript
const rainforestClient = require('./services/rainforest/client');

// Fetch product by ASIN
const productData = await rainforestClient.getProduct('B08N5WRWNW', 'de');

// Returns:
{
  asin: 'B08N5WRWNW',
  title: 'Product Title',
  category: 'Electronics',
  price: 29.99,
  currency: 'EUR',
  dimensions: {
    length: 15,
    width: 10,
    height: 5
  },
  weight: 0.5,
  imageUrl: 'https://...',
  brand: 'Brand Name',
  rating: 4.5,
  reviewCount: 1234,
  fulfillmentType: 'FBA'
}
```

### Fetching Competitor Pricing

```javascript
const pricingData = await rainforestClient.getCompetitorPricing('B08N5WRWNW', 'de');

// Returns array:
[
  {
    seller: 'Seller Name',
    price: 29.99,
    condition: 'New',
    fulfillment: 'FBA',
    shippingCost: 0
  },
  ...
]
```

## API Endpoints

### Backend Routes

#### GET `/api/amazon/product/:asin`
Fetch Amazon product data by ASIN.

**Query Parameters:**
- `marketplace` (optional): Amazon marketplace (de, com, co.uk, fr, it, es, etc.) [default: de]

**Example:**
```bash
GET /api/amazon/product/B08N5WRWNW?marketplace=de
```

**Response:**
```json
{
  "success": true,
  "data": {
    "asin": "B08N5WRWNW",
    "title": "Product Title",
    "category": "Electronics",
    "price": 29.99,
    "currency": "EUR",
    "dimensions": {
      "length": 15,
      "width": 10,
      "height": 5
    },
    "weight": 0.5,
    "imageUrl": "https://...",
    "brand": "Brand Name",
    "rating": 4.5,
    "reviewCount": 1234,
    "fulfillmentType": "FBA"
  }
}
```

#### GET `/api/amazon/pricing/:asin`
Fetch competitor pricing for a product.

**Query Parameters:**
- `marketplace` (optional): Amazon marketplace [default: de]

**Example:**
```bash
GET /api/amazon/pricing/B08N5WRWNW?marketplace=de
```

## Rate Limiting

The client implements rate limiting to comply with Rainforest API limits:
- **Rate:** 5 requests per second
- **Implementation:** Automatic delay between requests

## Error Handling

The client includes comprehensive error handling:
- HTTP errors
- API errors
- Network errors
- Invalid ASIN validation

All errors are logged to console and returned in a structured format.

## Marketplace Codes

Supported Amazon marketplaces:

| Country         | Code   | Domain         |
|-----------------|--------|----------------|
| Germany         | de     | amazon.de      |
| United States   | com    | amazon.com     |
| United Kingdom  | co.uk  | amazon.co.uk   |
| France          | fr     | amazon.fr      |
| Italy           | it     | amazon.it      |
| Spain           | es     | amazon.es      |
| Netherlands     | nl     | amazon.nl      |
| Poland          | pl     | amazon.pl      |
| Sweden          | se     | amazon.se      |
| Belgium         | com.be | amazon.com.be  |

## Data Extraction

The client automatically extracts and formats:

1. **Dimensions**: Extracted from product specifications
2. **Weight**: Extracted from specifications (converted from grams to kg if needed)
3. **Category**: First category from categories array
4. **Price**: Buybox winner price
5. **Fulfillment Type**: Detected from buybox winner fulfillment data

## Frontend Integration

### ASIN Input Component

The ProductForm component includes an ASIN fetch feature:

```javascript
const [asin, setAsin] = useState('');
const [loading, setLoading] = useState(false);

const fetchProduct = async () => {
  const response = await fetch(
    `http://localhost:5000/api/amazon/product/${asin}?marketplace=de`
  );
  const data = await response.json();
  
  if (data.success) {
    // Auto-fill form with product data
    setFormData({
      ...formData,
      product_name: data.data.title,
      selling_price: data.data.price,
      length_cm: data.data.dimensions.length,
      width_cm: data.data.dimensions.width,
      height_cm: data.data.dimensions.height,
      weight_kg: data.data.weight
    });
  }
};
```

## Environment Variables

Add to `.env` file:

```bash
RAINFOREST_API_KEY=Y7BA02CB83B274132A7968F241D839111
```

## Dependencies

- `node-fetch` or native `fetch` (Node.js 18+)
- No additional dependencies required

## Troubleshooting

### Common Issues

1. **Invalid ASIN Error**
   - Ensure ASIN is exactly 10 characters
   - ASINs are case-sensitive (use uppercase)

2. **Network Errors**
   - Check backend server is running
   - Verify CORS settings
   - Check API key is valid

3. **Missing Product Data**
   - Not all products have complete specifications
   - Some dimensions/weights may return 0
   - Handle missing data gracefully in frontend

## Future Enhancements

Potential improvements:
- Caching product data to reduce API calls
- Batch product lookups
- Historical pricing data
- Best Sellers Rank (BSR) tracking
- Review sentiment analysis

## Support

For Rainforest API documentation, visit:
https://rainforestapi.com/docs/product-data-api

For issues with this integration, contact the development team.









