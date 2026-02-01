/**
 * Amazon Service
 * Handles Amazon product data fetching via backend API
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * Fetch Amazon product by ASIN
 * @param {string} asin - Amazon Standard Identification Number (10 characters)
 * @param {string} domain - Amazon domain (de, com, co.uk, fr, it, es, etc.)
 * @returns {Promise<Object>} Product data
 * @throws {Error} If fetch fails or product not found
 */
export async function fetchProductByASIN(asin, domain = 'de') {
  console.log(`[Amazon Service] Fetching product: ${asin} from amazon.${domain}`);
  
  try {
    const url = `${API_BASE_URL}/api/amazon/product/${asin}?domain=${domain}`;
    console.log(`[Amazon Service] Request URL: ${url}`);
    
    const response = await fetch(url);
    
    console.log(`[Amazon Service] Response status: ${response.status}`);
    
    const data = await response.json();
    
    console.log(`[Amazon Service] Response data:`, data);
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch product data');
    }
    
    if (!data.data) {
      throw new Error('No product data returned');
    }
    
    console.log(`[Amazon Service] Successfully fetched product: ${data.data.title}`);
    
    return data.data;
  } catch (error) {
    console.error('[Amazon Service] Error:', error.message);
    throw new Error(error.message || 'Failed to fetch product from Amazon');
  }
}

/**
 * Fetch competitor pricing for a product
 * @param {string} asin - Amazon ASIN
 * @param {string} domain - Amazon domain
 * @returns {Promise<Array>} List of competitor prices
 */
export async function fetchCompetitorPricing(asin, domain = 'de') {
  console.log(`[Amazon Service] Fetching pricing: ${asin} from amazon.${domain}`);
  
  try {
    const url = `${API_BASE_URL}/api/amazon/pricing/${asin}?domain=${domain}`;
    console.log(`[Amazon Service] Request URL: ${url}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch pricing data');
    }
    
    return data.data;
  } catch (error) {
    console.error('[Amazon Service] Error:', error.message);
    throw new Error(error.message || 'Failed to fetch pricing from Amazon');
  }
}

export default {
  fetchProductByASIN,
  fetchCompetitorPricing
};









