const jwt = require('jsonwebtoken');
const { db } = require('../database/init');

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-change-in-production';

/**
 * Middleware to authenticate JWT tokens
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

/**
 * Middleware to check if user has required plan
 */
const requirePlan = (requiredPlan) => {
  return (req, res, next) => {
    const userPlan = req.user.plan;
    const planHierarchy = { free: 0, premium: 1, pro: 2 };
    
    if (planHierarchy[userPlan] < planHierarchy[requiredPlan]) {
      return res.status(403).json({ 
        error: 'Insufficient plan level',
        required: requiredPlan,
        current: userPlan
      });
    }
    next();
  };
};

/**
 * Middleware to check API key authentication
 */
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  // Hash the provided key to compare with stored hash
  const crypto = require('crypto');
  const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');

  db.get(
    'SELECT u.*, ak.id as api_key_id FROM users u JOIN api_keys ak ON u.id = ak.user_id WHERE ak.key_hash = ? AND ak.revoked_at IS NULL',
    [hashedKey],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!user) {
        return res.status(403).json({ error: 'Invalid API key' });
      }
      req.user = user;
      req.apiKeyId = user.api_key_id;
      next();
    }
  );
};

/**
 * Middleware to check rate limits for API usage
 */
const checkApiRateLimit = (req, res, next) => {
  if (!req.apiKeyId) {
    return next();
  }

  const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
  
  db.get(
    'SELECT COUNT(*) as count FROM usage_logs WHERE api_key_id = ? AND created_at > ?',
    [req.apiKeyId, oneMinuteAgo],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Rate limit check failed' });
      }
      
      const rateLimit = parseInt(process.env.API_RATE_LIMIT) || 100;
      if (result.count >= rateLimit) {
        return res.status(429).json({ 
          error: 'Rate limit exceeded',
          limit: rateLimit,
          resetTime: new Date(Date.now() + 60 * 1000).toISOString()
        });
      }
      next();
    }
  );
};

/**
 * Middleware to log API usage
 */
const logApiUsage = (req, res, next) => {
  const originalSend = res.send;
  const startTime = Date.now();
  
  res.send = function(data) {
    const responseTime = Date.now() - startTime;
    
    if (req.apiKeyId) {
      db.run(
        'INSERT INTO usage_logs (api_key_id, user_id, endpoint, status_code, response_time_ms) VALUES (?, ?, ?, ?, ?)',
        [req.apiKeyId, req.user.id, req.path, res.statusCode, responseTime],
        (err) => {
          if (err) console.error('Failed to log API usage:', err);
        }
      );
      
      // Update usage count
      db.run(
        'UPDATE api_keys SET usage_count = usage_count + 1 WHERE id = ?',
        [req.apiKeyId],
        (err) => {
          if (err) console.error('Failed to update usage count:', err);
        }
      );
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

/**
 * Middleware to check daily calculation limits for free users
 */
const checkCalculationLimit = (req, res, next) => {
  if (req.user.plan !== 'free') {
    return next();
  }

  const today = new Date().toISOString().split('T')[0];
  
  db.get(
    'SELECT COUNT(*) as count FROM calculations WHERE user_id = ? AND DATE(created_at) = ?',
    [req.user.id, today],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to check calculation limit' });
      }
      
      const maxCalculations = parseInt(process.env.MAX_CALCULATIONS_FREE) || 3;
      if (result.count >= maxCalculations) {
        return res.status(429).json({ 
          error: 'Daily calculation limit exceeded',
          limit: maxCalculations,
          used: result.count,
          resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });
      }
      next();
    }
  );
};

module.exports = {
  authenticateToken,
  requirePlan,
  authenticateApiKey,
  checkApiRateLimit,
  logApiUsage,
  checkCalculationLimit
};

