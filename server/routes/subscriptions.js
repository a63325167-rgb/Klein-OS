const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../database/init');
const { requirePlan } = require('../middleware/auth');

const router = express.Router();

/**
 * Get subscription plans
 */
router.get('/plans', (req, res) => {
  try {
    const plans = [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        currency: 'EUR',
        interval: 'month',
        features: [
          'Basic profit calculation',
          'Simple shipping cost',
          '3 calculations per day',
          'Basic eligibility check'
        ],
        limitations: [
          'Limited to 3 calculations per day',
          'No advanced analytics',
          'No bulk uploads',
          'No history tracking'
        ]
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 19.99,
        currency: 'EUR',
        interval: 'month',
        features: [
          'Everything in Free',
          'Unlimited calculations',
          'Advanced analytics & insights',
          'Bulk Analysis & Export (CSV/XLSX/PDF)',
          'Historical Tracking',
          'Advanced shipping options',
          'Detailed profit analysis'
        ],
        popular: true
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 49.99,
        currency: 'EUR',
        interval: 'month',
        features: [
          'Everything in Premium',
          'API Access with API keys',
          'Custom formulas',
          'Multi-store analysis',
          'Team Collaboration',
          'Priority support',
          'Advanced reporting'
        ]
      }
    ];

    res.json({ plans });
  } catch (error) {
    console.error('Plans fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

/**
 * Get current user subscription
 */
router.get('/current', (req, res) => {
  try {
    db.get(
      'SELECT plan, plan_start, plan_expiry, demo_mode_flag FROM users WHERE id = ?',
      [req.user.id],
      (err, user) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        res.json({
          plan: user.plan,
          plan_start: user.plan_start,
          plan_expiry: user.plan_expiry,
          demo_mode: user.demo_mode_flag === 1,
          status: user.plan_expiry && new Date(user.plan_expiry) < new Date() ? 'expired' : 'active'
        });
      }
    );
  } catch (error) {
    console.error('Current subscription fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch current subscription' });
  }
});

/**
 * Update subscription (for demo mode)
 */
router.put('/update', [
  body('plan').isIn(['free', 'premium', 'pro']).withMessage('Invalid plan')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { plan } = req.body;

    // Check if demo mode is enabled
    if (process.env.DEMO_MODE !== 'true') {
      return res.status(400).json({ 
        error: 'Demo mode is not enabled. Please use the payment system for subscription changes.' 
      });
    }

    // Update user plan
    const now = new Date();
    const planExpiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    db.run(
      'UPDATE users SET plan = ?, plan_start = ?, plan_expiry = ?, demo_mode_flag = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [plan, now.toISOString(), planExpiry.toISOString(), req.user.id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to update subscription' });
        }

        res.json({
          message: `🔓 Test Mode: ${plan.charAt(0).toUpperCase() + plan.slice(1)} activated without payment for development purposes.`,
          plan,
          plan_start: now.toISOString(),
          plan_expiry: planExpiry.toISOString(),
          demo_mode: true
        });
      }
    );
  } catch (error) {
    console.error('Subscription update error:', error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});

/**
 * Cancel subscription
 */
router.delete('/cancel', (req, res) => {
  try {
    // Check if demo mode is enabled
    if (process.env.DEMO_MODE !== 'true') {
      return res.status(400).json({ 
        error: 'Demo mode is not enabled. Please use the payment system for subscription changes.' 
      });
    }

    // Downgrade to free plan
    db.run(
      'UPDATE users SET plan = ?, plan_start = NULL, plan_expiry = NULL, demo_mode_flag = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['free', req.user.id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to cancel subscription' });
        }

        res.json({
          message: 'Subscription cancelled successfully. You are now on the Free plan.',
          plan: 'free'
        });
      }
    );
  } catch (error) {
    console.error('Subscription cancellation error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

/**
 * Get usage statistics
 */
router.get('/usage', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = new Date().toISOString().substring(0, 7);

    // Get daily usage for free users
    if (req.user.plan === 'free') {
      db.get(
        'SELECT COUNT(*) as daily_usage FROM calculations WHERE user_id = ? AND DATE(created_at) = ?',
        [req.user.id, today],
        (err, result) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          res.json({
            plan: req.user.plan,
            daily_usage: result.daily_usage,
            daily_limit: 3,
            remaining_calculations: Math.max(0, 3 - result.daily_usage)
          });
        }
      );
    } else {
      // Get monthly usage for premium/pro users
      db.get(
        `SELECT 
          COUNT(*) as monthly_usage,
          COUNT(CASE WHEN DATE(created_at) = ? THEN 1 END) as daily_usage
        FROM calculations 
        WHERE user_id = ? AND created_at LIKE ?`,
        [today, req.user.id, `${thisMonth}%`],
        (err, result) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          res.json({
            plan: req.user.plan,
            monthly_usage: result.monthly_usage,
            daily_usage: result.daily_usage,
            unlimited: true
          });
        }
      );
    }
  } catch (error) {
    console.error('Usage fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch usage statistics' });
  }
});

/**
 * Get billing history (placeholder for future payment integration)
 */
router.get('/billing', (req, res) => {
  try {
    // This would integrate with Stripe or other payment providers
    // For now, return empty array
    res.json({
      invoices: [],
      message: 'Billing history will be available when payment integration is added'
    });
  } catch (error) {
    console.error('Billing history fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch billing history' });
  }
});

module.exports = router;

