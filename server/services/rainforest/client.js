/**
 * Rainforest API Client
 * Handles communication with Rainforest API for Amazon product data
 * API Key: 7BA02CB83B274132A7968F241D839111
 */

const https = require('https');

class RainforestClient {
  constructor() {
    // Get API key from .env file or use default
    this.apiKey = process.env.RAINFOREST_API_KEY || '7BA02CB83B274132A7968F241D839111';
    this.baseUrl = 'https://api.rainforestapi.com';
    this.requestsPerSecond = 5; // Rate limit
    this.lastRequestTime = 0;
    this.maxRetries = 3;
    
    // Debug logging
    console.log('🔑 [Rainforest] API Key exists:', !!this.apiKey);
    console.log('🔑 [Rainforest] API Key (first 10 chars):', this.apiKey.substring(0, 10) + '...');
  }

  /**
   * Rate limiting: Ensure we don't exceed API limits
   */
  async rateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minInterval = 1000 / this.requestsPerSecond;

    if (timeSinceLastRequest < minInterval) {
      await new Promise(resolve => setTimeout(resolve, minInterval - timeSinceLastRequest));
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Make HTTPS request with retry logic
   */
  async makeRequest(url, retries = this.maxRetries) {
    return new Promise((resolve, reject) => {
      console.log(`[Rainforest] Making request: ${url.substring(0, 100)}...`);
      
      https.get(url, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed);
          } catch (error) {
            reject(new Error(`Failed to parse response: ${error.message}`));
          }
        });
      }).on('error', async (error) => {
        if (retries > 0) {
          console.log(`[Rainforest] Request failed, retrying... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          try {
            const result = await this.makeRequest(url, retries - 1);
            resolve(result);
          } catch (retryError) {
            reject(retryError);
          }
        } else {
          reject(error);
        }
      });
    });
  }

  /**
   * Main function: Get product by ASIN
   * @param {string} asin - Amazon Standard Identification Number
   * @param {string} domain - Amazon domain (de, com, co.uk, fr, it, es, etc.)
   * @returns {Promise<Object>} Formatted product data
   */
  async getProduct(asin, domain = 'de') {
    try {
      await this.rateLimit();

      // Build the URL with proper query parameters
      const params = new URLSearchParams({
        api_key: this.apiKey,
        type: 'product',
        asin: asin,
        amazon_domain: `amazon.${domain}`
      });
      
      const url = `${this.baseUrl}/request?${params.toString()}`;

      console.log('🌐 [Rainforest] Calling Rainforest API:', url);
      console.log('📦 [Rainforest] Fetching product:', asin, 'from amazon.' + domain);
      console.log('🔗 [Rainforest] Constructed API URL:', url);

      // Send request with retry logic
      const data = await this.makeRequest(url);

      console.log('📊 [Rainforest] Response status: 200 (success)');
      console.log('📋 [Rainforest] Response data:', JSON.stringify(data, null, 2));
      console.log('📄 [Rainforest] First 200 chars of response:', JSON.stringify(data).substring(0, 200));

      // Check if it worked
      if (data.error) {
        console.error('❌ [Rainforest] API returned error:', data.error);
        return { error: true, message: `Rainforest API error: ${data.error}`, data: data };
      }

      // Check for "Product not found" message
      if (data.message && data.message.includes('Product not found')) {
        console.error('❌ [Rainforest] Product not found:', asin);
        return { error: true, message: `Rainforest API error: Product not found on amazon.${domain}. Please verify the ASIN is correct and available in this marketplace.`, data: data };
      }

      if (!data.product) {
        console.error('❌ [Rainforest] No product data returned');
        console.error('❌ [Rainforest] Response data:', JSON.stringify(data, null, 2));
        return { error: true, message: 'Rainforest API error: No product data returned from API. The product may not be available.', data: data };
      }

      console.log('✅ [Rainforest] Successfully fetched product:', data.product.title);

      // Return the formatted product data
      return this.formatProduct(data.product);
    } catch (error) {
      console.error('💥 [Rainforest] API error:', error.message);
      console.error('💥 [Rainforest] Full error:', error);
      console.error('💥 [Rainforest] Error status code:', error.status || 'unknown');
      return { error: true, message: `Rainforest API error: ${error.message}`, data: null };
    }
  }

  /**
   * Format the data into a clean structure for our app
   * @param {Object} product - Raw product data from Rainforest
   * @returns {Object} Formatted product data
   */
  formatProduct(product) {
    return {
      asin: product.asin || null,
      title: product.title || null,
      category: this.extractCategory(product),
      price: this.extractPrice(product),
      currency: product.buybox_winner?.price?.currency || 'EUR',
      dimensions: {
        length: this.extractDimension(product, 'length') || null,
        width: this.extractDimension(product, 'width') || null,
        height: this.extractDimension(product, 'height') || null
      },
      weight: this.extractWeight(product) || null,
      imageUrl: product.main_image?.link || null,
      brand: product.brand || null,
      rating: product.rating || null,
      reviewCount: product.ratings_total || null,
      fulfillmentType: this.extractFulfillmentType(product)
    };
  }

  /**
   * Extract category from product data
   */
  extractCategory(product) {
    if (product.categories && product.categories.length > 0) {
      return product.categories[0].name;
    }
    return 'Unknown';
  }

  /**
   * Extract price from product data
   */
  extractPrice(product) {
    if (product.buybox_winner?.price?.value) {
      return product.buybox_winner.price.value;
    }
    return 0;
  }

  /**
   * Extract dimension from product specifications
   * @param {Object} product - Product data
   * @param {string} dim - Dimension type (length, width, height)
   * @returns {number} Dimension value in cm
   */
  extractDimension(product, dim) {
    if (!product.specifications) return 0;

    const spec = product.specifications.find(s => 
      s.name.toLowerCase().includes(dim) || 
      s.name.toLowerCase().includes('dimension')
    );

    if (spec) {
      const value = parseFloat(spec.value);
      return isNaN(value) ? 0 : value;
    }

    return 0;
  }

  /**
   * Extract weight from product specifications
   * @param {Object} product - Product data
   * @returns {number} Weight in kg
   */
  extractWeight(product) {
    if (!product.specifications) return 0;

    const spec = product.specifications.find(s => 
      s.name.toLowerCase().includes('weight') ||
      s.name.toLowerCase().includes('item weight')
    );

    if (spec) {
      let value = parseFloat(spec.value);
      
      // Convert grams to kg if necessary
      if (spec.value.toLowerCase().includes('g') && !spec.value.toLowerCase().includes('kg')) {
        value = value / 1000;
      }
      
      return isNaN(value) ? 0 : value;
    }

    return 0;
  }

  /**
   * Extract fulfillment type (FBA or FBM)
   * @param {Object} product - Product data
   * @returns {string} FBA or FBM
   */
  extractFulfillmentType(product) {
    if (product.buybox_winner?.fulfillment?.type === 'Amazon') {
      return 'FBA';
    }
    return 'FBM';
  }

  /**
   * Get competitor pricing for a product
   * @param {string} asin - Amazon ASIN
   * @param {string} marketplace - Amazon marketplace
   * @returns {Promise<Array>} List of competitor prices
   */
  async getCompetitorPricing(asin, marketplace = 'de') {
    await this.rateLimit();

    try {
      const url = `${this.baseUrl}/request?` + 
        `api_key=${this.apiKey}&` +
        `type=offers&` +
        `asin=${asin}&` +
        `amazon_domain=amazon.${marketplace}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      return this.formatOffers(data.offers || []);
    } catch (error) {
      console.error('[Rainforest] Pricing API error:', error.message);
      throw error;
    }
  }

  /**
   * Format offers data
   */
  formatOffers(offers) {
    return offers.map(offer => ({
      seller: offer.seller_name,
      price: offer.price?.value || 0,
      condition: offer.condition?.title || 'New',
      fulfillment: offer.fulfillment?.type || 'FBM',
      shippingCost: offer.shipping?.price?.value || 0
    }));
  }
}

module.exports = new RainforestClient();

