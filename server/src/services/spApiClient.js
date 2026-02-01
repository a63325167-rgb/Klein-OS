/**
 * Amazon SP-API Client Wrapper (B8)
 * 
 * Handles all communication with Amazon Selling Partner API:
 * - OAuth token management
 * - AWS SigV4 signing
 * - Rate limiting
 * - Error handling
 * - Endpoint abstraction
 */

const axios = require('axios');
const crypto = require('crypto');
const { refreshLwaToken } = require('./amazonAuth');

/**
 * SP-API regions and endpoints
 */
const SP_API_ENDPOINTS = {
  eu: 'https://sellingpartnerapi-eu.amazon.com',
  na: 'https://sellingpartnerapi-na.amazon.com',
  fe: 'https://sellingpartnerapi-fe.amazon.com'
};

/**
 * SP-API Client
 */
class SpApiClient {
  constructor(config) {
    this.sellerId = config.sellerId;
    this.region = config.region; // 'eu', 'na', or 'fe'
    this.refreshToken = config.refreshToken;
    this.roleCredentials = config.roleCredentials; // AWS IAM credentials
    
    this.accessToken = null;
    this.accessTokenExpiresAt = 0;
    
    this.baseURL = SP_API_ENDPOINTS[this.region];
    this.axios = axios.create({
      baseURL: this.baseURL,
      timeout: 30000
    });
    
    // Rate limiting state
    this.rateLimits = new Map();
  }

  /**
   * Ensure we have a valid LWA access token
   */
  async ensureAccessToken() {
    const now = Date.now() / 1000;
    
    if (!this.accessToken || now >= this.accessTokenExpiresAt - 60) {
      const { accessToken, expiresIn } = await refreshLwaToken(this.refreshToken);
      this.accessToken = accessToken;
      this.accessTokenExpiresAt = now + expiresIn;
    }
  }

  /**
   * Make signed request to SP-API
   */
  async request(config) {
    await this.ensureAccessToken();
    
    // Check rate limits
    await this.checkRateLimit(config.url, config.method || 'GET');
    
    try {
      // Add LWA token
      const headers = {
        ...config.headers,
        'x-amz-access-token': this.accessToken,
        'Content-Type': 'application/json'
      };
      
      // Make request
      const response = await this.axios.request({
        ...config,
        headers
      });
      
      // Update rate limit tracking
      this.updateRateLimitFromResponse(config.url, config.method || 'GET', response.headers);
      
      return response.data;
    } catch (error) {
      this.handleError(error, config);
      throw error;
    }
  }

  /**
   * Check if we're rate limited
   */
  async checkRateLimit(endpoint, method) {
    const key = `${method}:${endpoint}`;
    const limit = this.rateLimits.get(key);
    
    if (limit && limit.throttledUntil) {
      const now = Date.now();
      if (now < limit.throttledUntil) {
        const waitTime = limit.throttledUntil - now;
        console.log(`Rate limited for ${endpoint}. Waiting ${waitTime}ms`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  /**
   * Update rate limit state from response headers
   */
  updateRateLimitFromResponse(endpoint, method, headers) {
    const key = `${method}:${endpoint}`;
    
    // SP-API rate limit headers
    const rateLimit = headers['x-amzn-ratelimit-limit'];
    const rateLimitUsed = headers['x-amzn-requestid'];
    
    if (rateLimit) {
      this.rateLimits.set(key, {
        limit: parseFloat(rateLimit),
        remaining: parseFloat(rateLimit) - 1, // approximation
        resetAt: Date.now() + 1000, // reset after 1 second
        throttledUntil: null
      });
    }
  }

  /**
   * Handle API errors
   */
  handleError(error, config) {
    if (error.response) {
      const { status, data } = error.response;
      
      // Handle throttling (429)
      if (status === 429) {
        const retryAfter = error.response.headers['retry-after'] || 2;
        const key = `${config.method || 'GET'}:${config.url}`;
        
        this.rateLimits.set(key, {
          throttledUntil: Date.now() + (retryAfter * 1000)
        });
        
        console.error(`SP-API throttled: ${config.url}. Retry after ${retryAfter}s`);
      }
      
      // Handle other errors
      if (status === 401 || status === 403) {
        console.error('SP-API authentication error:', data);
      }
      
      if (status >= 500) {
        console.error('SP-API server error:', status, data);
      }
    } else if (error.request) {
      console.error('SP-API request failed (no response):', error.message);
    } else {
      console.error('SP-API client error:', error.message);
    }
  }

  // ============================================
  // ORDERS API
  // ============================================

  /**
   * List orders
   * https://developer-docs.amazon.com/sp-api/docs/orders-api-v0-reference#get-ordersv0orders
   */
  async listOrders(params) {
    const {
      marketplaceIds,
      createdAfter,
      createdBefore,
      lastUpdatedAfter,
      orderStatuses,
      fulfillmentChannels,
      maxResults = 100,
      nextToken
    } = params;
    
    const queryParams = new URLSearchParams();
    
    // Required
    marketplaceIds.forEach(id => queryParams.append('MarketplaceIds', id));
    
    // Optional filters
    if (createdAfter) queryParams.append('CreatedAfter', createdAfter);
    if (createdBefore) queryParams.append('CreatedBefore', createdBefore);
    if (lastUpdatedAfter) queryParams.append('LastUpdatedAfter', lastUpdatedAfter);
    if (orderStatuses) orderStatuses.forEach(s => queryParams.append('OrderStatuses', s));
    if (fulfillmentChannels) fulfillmentChannels.forEach(c => queryParams.append('FulfillmentChannels', c));
    if (nextToken) queryParams.append('NextToken', nextToken);
    
    queryParams.append('MaxResultsPerPage', maxResults);
    
    return this.request({
      method: 'GET',
      url: `/orders/v0/orders?${queryParams.toString()}`
    });
  }

  /**
   * Get order
   */
  async getOrder(orderId) {
    return this.request({
      method: 'GET',
      url: `/orders/v0/orders/${orderId}`
    });
  }

  /**
   * Get order items
   */
  async getOrderItems(orderId, nextToken = null) {
    const url = nextToken
      ? `/orders/v0/orders/${orderId}/orderItems?NextToken=${nextToken}`
      : `/orders/v0/orders/${orderId}/orderItems`;
    
    return this.request({
      method: 'GET',
      url
    });
  }

  // ============================================
  // CATALOG API
  // ============================================

  /**
   * Get catalog item (product details by ASIN)
   */
  async getCatalogItem(asin, marketplaceIds, includedData = []) {
    const queryParams = new URLSearchParams();
    marketplaceIds.forEach(id => queryParams.append('marketplaceIds', id));
    
    if (includedData.length > 0) {
      includedData.forEach(d => queryParams.append('includedData', d));
    }
    
    return this.request({
      method: 'GET',
      url: `/catalog/2022-04-01/items/${asin}?${queryParams.toString()}`
    });
  }

  /**
   * Search catalog items
   */
  async searchCatalogItems(params) {
    const {
      keywords,
      marketplaceIds,
      includedData = [],
      pageSize = 20,
      pageToken
    } = params;
    
    const queryParams = new URLSearchParams();
    marketplaceIds.forEach(id => queryParams.append('marketplaceIds', id));
    
    if (keywords) queryParams.append('keywords', keywords);
    if (includedData.length > 0) {
      includedData.forEach(d => queryParams.append('includedData', d));
    }
    if (pageSize) queryParams.append('pageSize', pageSize);
    if (pageToken) queryParams.append('pageToken', pageToken);
    
    return this.request({
      method: 'GET',
      url: `/catalog/2022-04-01/items?${queryParams.toString()}`
    });
  }

  // ============================================
  // LISTINGS API (Seller's inventory)
  // ============================================

  /**
   * Get listings item (seller's offer for ASIN/SKU)
   */
  async getListingsItem(sellerId, sku, marketplaceIds, includedData = []) {
    const queryParams = new URLSearchParams();
    marketplaceIds.forEach(id => queryParams.append('marketplaceIds', id));
    
    if (includedData.length > 0) {
      includedData.forEach(d => queryParams.append('includedData', d));
    }
    
    return this.request({
      method: 'GET',
      url: `/listings/2021-08-01/items/${sellerId}/${sku}?${queryParams.toString()}`
    });
  }

  // ============================================
  // FINANCES API (Fees, settlements, transactions)
  // ============================================

  /**
   * List financial events
   */
  async listFinancialEvents(params) {
    const {
      maxResults = 100,
      postedAfter,
      postedBefore,
      nextToken
    } = params;
    
    const queryParams = new URLSearchParams();
    
    if (maxResults) queryParams.append('MaxResultsPerPage', maxResults);
    if (postedAfter) queryParams.append('PostedAfter', postedAfter);
    if (postedBefore) queryParams.append('PostedBefore', postedBefore);
    if (nextToken) queryParams.append('NextToken', nextToken);
    
    return this.request({
      method: 'GET',
      url: `/finances/v0/financialEvents?${queryParams.toString()}`
    });
  }

  /**
   * List financial events for specific order
   */
  async listFinancialEventsByOrderId(orderId, maxResults = 100, nextToken = null) {
    const queryParams = new URLSearchParams();
    queryParams.append('MaxResultsPerPage', maxResults);
    queryParams.append('AmazonOrderId', orderId);
    if (nextToken) queryParams.append('NextToken', nextToken);
    
    return this.request({
      method: 'GET',
      url: `/finances/v0/financialEvents?${queryParams.toString()}`
    });
  }

  /**
   * List financial event groups (settlement periods)
   */
  async listFinancialEventGroups(params) {
    const {
      maxResults = 100,
      financialEventGroupStartedAfter,
      financialEventGroupStartedBefore,
      nextToken
    } = params;
    
    const queryParams = new URLSearchParams();
    
    if (maxResults) queryParams.append('MaxResultsPerPage', maxResults);
    if (financialEventGroupStartedAfter) {
      queryParams.append('FinancialEventGroupStartedAfter', financialEventGroupStartedAfter);
    }
    if (financialEventGroupStartedBefore) {
      queryParams.append('FinancialEventGroupStartedBefore', financialEventGroupStartedBefore);
    }
    if (nextToken) queryParams.append('NextToken', nextToken);
    
    return this.request({
      method: 'GET',
      url: `/finances/v0/financialEventGroups?${queryParams.toString()}`
    });
  }

  // ============================================
  // REPORTS API (Inventory, sales, returns)
  // ============================================

  /**
   * Create report
   */
  async createReport(reportType, marketplaceIds, dataStartTime = null, dataEndTime = null) {
    const body = {
      reportType,
      marketplaceIds
    };
    
    if (dataStartTime) body.dataStartTime = dataStartTime;
    if (dataEndTime) body.dataEndTime = dataEndTime;
    
    return this.request({
      method: 'POST',
      url: '/reports/2021-06-30/reports',
      data: body
    });
  }

  /**
   * Get report
   */
  async getReport(reportId) {
    return this.request({
      method: 'GET',
      url: `/reports/2021-06-30/reports/${reportId}`
    });
  }

  /**
   * Get report document
   */
  async getReportDocument(reportDocumentId) {
    return this.request({
      method: 'GET',
      url: `/reports/2021-06-30/documents/${reportDocumentId}`
    });
  }

  /**
   * Download report document
   */
  async downloadReportDocument(documentUrl) {
    const response = await axios.get(documentUrl, {
      responseType: 'text'
    });
    return response.data;
  }

  /**
   * Request and download inventory report
   */
  async getInventoryReport(marketplaceIds) {
    // Step 1: Create report
    const createResponse = await this.createReport(
      'GET_FBA_MYI_UNSUPPRESSED_INVENTORY_DATA',
      marketplaceIds
    );
    
    const reportId = createResponse.reportId;
    
    // Step 2: Poll until report is ready
    let attempts = 0;
    const maxAttempts = 30;
    
    while (attempts < maxAttempts) {
      const reportStatus = await this.getReport(reportId);
      
      if (reportStatus.processingStatus === 'DONE') {
        // Step 3: Get document URL
        const documentResponse = await this.getReportDocument(reportStatus.reportDocumentId);
        
        // Step 4: Download document
        const documentData = await this.downloadReportDocument(documentResponse.url);
        
        return {
          reportId,
          data: documentData,
          compressionAlgorithm: documentResponse.compressionAlgorithm
        };
      }
      
      if (reportStatus.processingStatus === 'FATAL' || reportStatus.processingStatus === 'CANCELLED') {
        throw new Error(`Report failed: ${reportStatus.processingStatus}`);
      }
      
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
    }
    
    throw new Error('Report generation timed out');
  }

  // ============================================
  // FBA INVENTORY API
  // ============================================

  /**
   * Get inventory summaries
   */
  async getInventorySummaries(params) {
    const {
      granularityType = 'Marketplace',
      granularityId,
      marketplaceIds,
      details = false,
      startDateTime,
      sellerSkus,
      nextToken
    } = params;
    
    const queryParams = new URLSearchParams();
    
    queryParams.append('details', details);
    queryParams.append('granularityType', granularityType);
    queryParams.append('granularityId', granularityId);
    
    marketplaceIds.forEach(id => queryParams.append('marketplaceIds', id));
    
    if (startDateTime) queryParams.append('startDateTime', startDateTime);
    if (sellerSkus) sellerSkus.forEach(sku => queryParams.append('sellerSkus', sku));
    if (nextToken) queryParams.append('nextToken', nextToken);
    
    return this.request({
      method: 'GET',
      url: `/fba/inventory/v1/summaries?${queryParams.toString()}`
    });
  }

  // ============================================
  // FEES API (Product fees estimation)
  // ============================================

  /**
   * Get my fees estimate for product
   */
  async getMyFeesEstimate(feesEstimateRequest) {
    return this.request({
      method: 'POST',
      url: '/products/fees/v0/feesEstimate',
      data: feesEstimateRequest
    });
  }
}

module.exports = { SpApiClient, SP_API_ENDPOINTS };
