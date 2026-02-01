/**
 * Amazon OAuth2 / Login with Amazon (LWA) Service (B8)
 * 
 * Handles:
 * - OAuth consent flow
 * - Token exchange
 * - Token refresh
 * - Secure token storage
 */

const axios = require('axios');
const crypto = require('crypto');

// LWA endpoints
const LWA_TOKEN_URL = 'https://api.amazon.com/auth/o2/token';
const LWA_AUTHORIZE_URL = 'https://www.amazon.com/ap/oa';

// Configuration from environment
const LWA_CLIENT_ID = process.env.LWA_CLIENT_ID;
const LWA_CLIENT_SECRET = process.env.LWA_CLIENT_SECRET;
const LWA_REDIRECT_URI = process.env.LWA_REDIRECT_URI;

// Encryption key for storing refresh tokens
const ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY || crypto.randomBytes(32);
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';

/**
 * Generate authorization URL for seller to grant permissions
 * 
 * @param {string} state - State parameter for CSRF protection
 * @returns {string} Authorization URL
 */
function getAuthorizationUrl(state) {
  const scopes = [
    'sellingpartnerapi::migration', // Basic SP-API access
    'sellingpartnerapi::orders', // Orders API
    'sellingpartnerapi::reports', // Reports API
    'sellingpartnerapi::finances', // Finances API
    'sellingpartnerapi::listings' // Listings API
  ].join(' ');
  
  const params = new URLSearchParams({
    client_id: LWA_CLIENT_ID,
    scope: scopes,
    response_type: 'code',
    redirect_uri: LWA_REDIRECT_URI,
    state: state || ''
  });
  
  return `${LWA_AUTHORIZE_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 * 
 * @param {string} code - Authorization code from callback
 * @returns {Promise<Object>} Token response
 */
async function exchangeCodeForTokens(code) {
  try {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: LWA_REDIRECT_URI,
      client_id: LWA_CLIENT_ID,
      client_secret: LWA_CLIENT_SECRET
    });
    
    const response = await axios.post(LWA_TOKEN_URL, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresIn: response.data.expires_in, // Usually 3600 seconds (1 hour)
      tokenType: response.data.token_type
    };
  } catch (error) {
    console.error('LWA token exchange error:', error.response?.data || error.message);
    throw new Error(`Failed to exchange authorization code: ${error.response?.data?.error_description || error.message}`);
  }
}

/**
 * Refresh access token using refresh token
 * 
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<Object>} New access token
 */
async function refreshLwaToken(refreshToken) {
  try {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: LWA_CLIENT_ID,
      client_secret: LWA_CLIENT_SECRET
    });
    
    const response = await axios.post(LWA_TOKEN_URL, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    return {
      accessToken: response.data.access_token,
      expiresIn: response.data.expires_in
    };
  } catch (error) {
    console.error('LWA token refresh error:', error.response?.data || error.message);
    throw new Error(`Failed to refresh access token: ${error.response?.data?.error_description || error.message}`);
  }
}

/**
 * Encrypt refresh token before storing in database
 * 
 * @param {string} token - Plain refresh token
 * @returns {string} Encrypted token (base64)
 */
function encryptToken(token) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(token, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  const authTag = cipher.getAuthTag();
  
  // Return: iv:authTag:encrypted
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
}

/**
 * Decrypt refresh token from database
 * 
 * @param {string} encryptedToken - Encrypted token (base64)
 * @returns {string} Plain refresh token
 */
function decryptToken(encryptedToken) {
  const parts = encryptedToken.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted token format');
  }
  
  const iv = Buffer.from(parts[0], 'base64');
  const authTag = Buffer.from(parts[1], 'base64');
  const encrypted = parts[2];
  
  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Get seller info from SP-API using access token
 * 
 * @param {string} accessToken - LWA access token
 * @param {string} region - SP-API region ('eu', 'na', 'fe')
 * @returns {Promise<Object>} Seller info
 */
async function getSellerInfo(accessToken, region = 'eu') {
  const endpoints = {
    eu: 'https://sellingpartnerapi-eu.amazon.com',
    na: 'https://sellingpartnerapi-na.amazon.com',
    fe: 'https://sellingpartnerapi-fe.amazon.com'
  };
  
  const baseURL = endpoints[region];
  
  try {
    // Get seller account info
    const response = await axios.get(`${baseURL}/sellers/v1/marketplaceParticipations`, {
      headers: {
        'x-amz-access-token': accessToken,
        'Content-Type': 'application/json'
      }
    });
    
    const participations = response.data.payload || [];
    
    if (participations.length === 0) {
      throw new Error('No marketplace participations found for seller');
    }
    
    // Extract seller ID and marketplaces
    const firstParticipation = participations[0];
    const sellerId = firstParticipation.seller?.sellerId;
    const marketplaces = participations.map(p => ({
      marketplaceId: p.marketplace?.id,
      countryCode: p.marketplace?.countryCode,
      name: p.marketplace?.name,
      defaultCurrencyCode: p.marketplace?.defaultCurrencyCode,
      defaultLanguageCode: p.marketplace?.defaultLanguageCode
    }));
    
    return {
      sellerId,
      marketplaces,
      defaultMarketplace: marketplaces[0]
    };
  } catch (error) {
    console.error('Failed to get seller info:', error.response?.data || error.message);
    throw new Error(`Failed to retrieve seller information: ${error.message}`);
  }
}

/**
 * Validate that required environment variables are set
 */
function validateConfig() {
  const required = ['LWA_CLIENT_ID', 'LWA_CLIENT_SECRET', 'LWA_REDIRECT_URI'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  if (!process.env.TOKEN_ENCRYPTION_KEY) {
    console.warn('TOKEN_ENCRYPTION_KEY not set. Using random key (tokens will be lost on restart)');
  }
}

/**
 * Generate state parameter for CSRF protection
 * 
 * @param {string} userId - User ID to encode in state
 * @returns {string} State parameter
 */
function generateState(userId) {
  const timestamp = Date.now();
  const random = crypto.randomBytes(16).toString('hex');
  const payload = `${userId}:${timestamp}:${random}`;
  
  return Buffer.from(payload).toString('base64url');
}

/**
 * Parse state parameter
 * 
 * @param {string} state - State parameter from callback
 * @returns {Object} Parsed state
 */
function parseState(state) {
  try {
    const decoded = Buffer.from(state, 'base64url').toString('utf8');
    const [userId, timestamp, random] = decoded.split(':');
    
    // Validate timestamp (max 10 minutes old)
    const age = Date.now() - parseInt(timestamp);
    if (age > 10 * 60 * 1000) {
      throw new Error('State parameter expired');
    }
    
    return { userId, timestamp: parseInt(timestamp), random };
  } catch (error) {
    throw new Error('Invalid state parameter');
  }
}

// Validate configuration on module load
try {
  validateConfig();
} catch (error) {
  console.error('Amazon Auth configuration error:', error.message);
}

module.exports = {
  getAuthorizationUrl,
  exchangeCodeForTokens,
  refreshLwaToken,
  encryptToken,
  decryptToken,
  getSellerInfo,
  generateState,
  parseState,
  validateConfig
};
