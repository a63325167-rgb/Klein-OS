/**
 * Amazon OAuth Routes (B8)
 * 
 * Handles OAuth flow for Amazon SP-API integration
 */

const express = require('express');
const router = express.Router();
const {
  getAuthorizationUrl,
  exchangeCodeForTokens,
  generateState,
  parseState,
  encryptToken,
  getSellerInfo
} = require('../services/amazonAuth');

/**
 * GET /api/amazon/connect
 * Redirect to Amazon OAuth consent screen
 */
router.get('/connect', async (req, res) => {
  try {
    // Get user from session/JWT
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User must be logged in to connect Amazon account'
      });
    }
    
    // Generate state for CSRF protection
    const state = generateState(userId);
    
    // Store state in session for validation
    req.session.amazonOAuthState = state;
    
    // Redirect to Amazon authorization
    const authUrl = getAuthorizationUrl(state);
    res.redirect(authUrl);
    
  } catch (error) {
    console.error('Amazon connect error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to initiate Amazon connection'
    });
  }
});

/**
 * GET /api/amazon/callback
 * Handle OAuth callback from Amazon
 */
router.get('/callback', async (req, res) => {
  try {
    const { code, state, error, error_description } = req.query;
    
    // Check for OAuth errors
    if (error) {
      console.error('Amazon OAuth error:', error, error_description);
      return res.redirect(`/integrations/amazon/error?error=${error}&description=${encodeURIComponent(error_description)}`);
    }
    
    // Validate state (CSRF protection)
    if (!state || state !== req.session.amazonOAuthState) {
      return res.redirect('/integrations/amazon/error?error=invalid_state');
    }
    
    // Clear state from session
    delete req.session.amazonOAuthState;
    
    // Parse state to get user ID
    const { userId } = parseState(state);
    
    // Exchange code for tokens
    const { accessToken, refreshToken, expiresIn } = await exchangeCodeForTokens(code);
    
    // Get seller info from SP-API
    const sellerInfo = await getSellerInfo(accessToken, 'eu'); // Default to EU, can be detected
    
    // Encrypt refresh token
    const encryptedRefreshToken = encryptToken(refreshToken);
    
    // Store seller in database
    const seller = await req.db.seller.upsert({
      where: {
        amazon_seller_id: sellerInfo.sellerId
      },
      update: {
        user_id: userId,
        lwa_refresh_token: encryptedRefreshToken,
        lwa_access_token: encryptToken(accessToken),
        lwa_access_token_expires_at: new Date(Date.now() + expiresIn * 1000),
        seller_name: sellerInfo.defaultMarketplace.name,
        default_marketplace_id: sellerInfo.defaultMarketplace.marketplaceId,
        last_sync_status: 'pending',
        sync_enabled: true,
        updated_at: new Date()
      },
      create: {
        user_id: userId,
        amazon_seller_id: sellerInfo.sellerId,
        lwa_refresh_token: encryptedRefreshToken,
        lwa_access_token: encryptToken(accessToken),
        lwa_access_token_expires_at: new Date(Date.now() + expiresIn * 1000),
        seller_name: sellerInfo.defaultMarketplace.name,
        default_marketplace_id: sellerInfo.defaultMarketplace.marketplaceId,
        last_sync_status: 'pending',
        sync_enabled: true
      }
    });
    
    // Enqueue initial sync job
    await req.syncQueue.add('full-sync', {
      sellerId: seller.id,
      type: 'full'
    });
    
    // Redirect to success page
    res.redirect(`/integrations/amazon/success?seller_id=${seller.id}`);
    
  } catch (error) {
    console.error('Amazon callback error:', error);
    res.redirect(`/integrations/amazon/error?error=callback_failed&description=${encodeURIComponent(error.message)}`);
  }
});

/**
 * GET /api/amazon/status
 * Get current sync status for user's Amazon connection
 */
router.get('/status', async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Get seller for user
    const seller = await req.db.seller.findFirst({
      where: { user_id: userId },
      include: {
        sync_jobs: {
          orderBy: { created_at: 'desc' },
          take: 5
        }
      }
    });
    
    if (!seller) {
      return res.json({
        connected: false,
        seller: null
      });
    }
    
    // Get product count
    const productCount = await req.db.product.count({
      where: { seller_id: seller.id, status: 'active' }
    });
    
    // Get latest sync job
    const latestSync = seller.sync_jobs[0];
    
    res.json({
      connected: true,
      seller: {
        id: seller.id,
        amazonSellerId: seller.amazon_seller_id,
        sellerName: seller.seller_name,
        defaultMarketplace: seller.default_marketplace_id,
        lastSyncAt: seller.last_sync_at,
        lastSyncStatus: seller.last_sync_status,
        lastSyncError: seller.last_sync_error,
        syncEnabled: seller.sync_enabled,
        productCount
      },
      latestSync: latestSync ? {
        id: latestSync.id,
        type: latestSync.job_type,
        status: latestSync.status,
        progress: {
          total: latestSync.total_items,
          processed: latestSync.processed_items,
          failed: latestSync.failed_items
        },
        startedAt: latestSync.started_at,
        completedAt: latestSync.completed_at,
        durationSeconds: latestSync.duration_seconds,
        error: latestSync.error_message
      } : null,
      recentSyncs: seller.sync_jobs.slice(1).map(job => ({
        id: job.id,
        type: job.job_type,
        status: job.status,
        completedAt: job.completed_at
      }))
    });
    
  } catch (error) {
    console.error('Amazon status error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve Amazon connection status'
    });
  }
});

/**
 * POST /api/amazon/sync
 * Trigger manual sync
 */
router.post('/sync', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { type = 'full' } = req.body; // full, orders, products, inventory, finances
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Get seller for user
    const seller = await req.db.seller.findFirst({
      where: { user_id: userId }
    });
    
    if (!seller) {
      return res.status(404).json({
        error: 'Not found',
        message: 'No Amazon seller account connected'
      });
    }
    
    if (!seller.sync_enabled) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Sync is disabled for this account'
      });
    }
    
    // Enqueue sync job
    const job = await req.syncQueue.add('seller-sync', {
      sellerId: seller.id,
      type
    });
    
    res.json({
      success: true,
      message: 'Sync started',
      jobId: job.id,
      type
    });
    
  } catch (error) {
    console.error('Amazon sync trigger error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to start sync'
    });
  }
});

/**
 * POST /api/amazon/disconnect
 * Disconnect Amazon account
 */
router.post('/disconnect', async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Delete seller and cascade to related data
    await req.db.seller.deleteMany({
      where: { user_id: userId }
    });
    
    res.json({
      success: true,
      message: 'Amazon account disconnected'
    });
    
  } catch (error) {
    console.error('Amazon disconnect error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to disconnect Amazon account'
    });
  }
});

/**
 * GET /api/amazon/products
 * Get products from SP-API with calculated metrics
 */
router.get('/products', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { 
      limit = 50, 
      offset = 0,
      sortBy = 'health_score',
      sortOrder = 'desc',
      riskFilter = 'all'
    } = req.query;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Get seller
    const seller = await req.db.seller.findFirst({
      where: { user_id: userId }
    });
    
    if (!seller) {
      return res.status(404).json({
        error: 'Not found',
        message: 'No Amazon seller account connected'
      });
    }
    
    // Build query
    const where = {
      seller_id: seller.id,
      status: 'active'
    };
    
    // Apply risk filter
    if (riskFilter !== 'all') {
      if (riskFilter === 'critical') {
        where.product_metrics = {
          critical_risks_count: { gte: 1 }
        };
      } else if (riskFilter === 'warning') {
        where.product_metrics = {
          critical_risks_count: 0,
          OR: [
            { profitability_risk_level: 'yellow' },
            { breakeven_risk_level: 'yellow' },
            { cashflow_risk_level: 'yellow' }
          ]
        };
      } else if (riskFilter === 'healthy') {
        where.product_metrics = {
          critical_risks_count: 0,
          profitability_risk_level: 'green',
          breakeven_risk_level: 'green',
          cashflow_risk_level: 'green'
        };
      }
    }
    
    // Get products with metrics
    const products = await req.db.product.findMany({
      where,
      include: {
        product_metrics: true
      },
      orderBy: {
        product_metrics: {
          [sortBy]: sortOrder
        }
      },
      skip: parseInt(offset),
      take: parseInt(limit)
    });
    
    const totalCount = await req.db.product.count({ where });
    
    res.json({
      products: products.map(p => ({
        id: p.id,
        asin: p.asin,
        sku: p.sku,
        title: p.title,
        category: p.category,
        status: p.status,
        currentPrice: p.current_price,
        metrics: p.product_metrics ? {
          sellingPrice: p.product_metrics.selling_price,
          profitPerUnit: p.product_metrics.profit_per_unit,
          profitMargin: p.product_metrics.profit_margin_percent,
          totalMonthlyProfit: p.product_metrics.total_monthly_profit,
          monthlySalesVelocity: p.product_metrics.monthly_sales_velocity,
          breakEvenDays: p.product_metrics.break_even_days,
          cashRunway: p.product_metrics.cash_runway_months,
          healthScore: p.product_metrics.health_score,
          risks: {
            profitability: p.product_metrics.profitability_risk_level,
            breakeven: p.product_metrics.breakeven_risk_level,
            cashflow: p.product_metrics.cashflow_risk_level,
            competition: p.product_metrics.competition_risk_level,
            inventory: p.product_metrics.inventory_risk_level,
            criticalCount: p.product_metrics.critical_risks_count
          },
          lastCalculated: p.product_metrics.last_calculated_at
        } : null,
        lastSynced: p.last_synced_at
      })),
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < totalCount
      }
    });
    
  } catch (error) {
    console.error('Amazon products error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve products'
    });
  }
});

module.exports = router;
