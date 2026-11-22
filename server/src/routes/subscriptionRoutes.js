import express from 'express';
import prisma from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';
import {
  getActiveUserSubscription,
  selectBasicPlan,
  cancelUserSubscription,
  resumeUserSubscription,
  getGatewayStatus,
  TIER_FEATURES
} from '../services/subscriptionService.js';

const router = express.Router();

// List all active subscription plans optionally filtered by category
router.get('/plans', async (req, res) => {
  try {
    const { category } = req.query;

    const where = { isActive: true };
    if (category && category !== 'ALL') {
      where.OR = [
        { category: category },
        { category: null }
      ];
    }

    const plans = await prisma.subscriptionPlan.findMany({
      where,
      orderBy: { priceInr: 'asc' }
    });

    res.json({ success: true, plans });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch subscription plans.', error: err.message });
  }
});

// Gateway & Checkout configuration
router.get('/config', (req, res) => {
  try {
    const config = getGatewayStatus();
    res.json({ success: true, config });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch gateway config.', error: err.message });
  }
});

// Feature inclusions catalog
router.get('/features', (req, res) => {
  res.json({ success: true, features: TIER_FEATURES });
});

// Get user's current subscription details & invoices
router.get('/current', authenticateToken, async (req, res) => {
  try {
    const { subscription, currentTier, isExpired } = await getActiveUserSubscription(req.user.id);

    const paymentHistory = await prisma.payment.findMany({
      where: { userId: req.user.id },
      include: {
        subscription: {
          include: { plan: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 15
    });

    res.json({
      success: true,
      currentTier,
      isExpired,
      subscription: subscription || null,
      availableFeatures: TIER_FEATURES[currentTier] || TIER_FEATURES.BASIC,
      paymentHistory
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve subscription.', error: err.message });
  }
});

// Select / Downgrade to Free Basic Plan
router.post('/select-basic', authenticateToken, async (req, res) => {
  try {
    const userCategory = req.user.category || 'NORMAL';
    const newSub = await selectBasicPlan(req.user.id, userCategory);

    res.json({
      success: true,
      message: 'Free Basic Plan activated successfully! Lifetime core fitness features are active.',
      subscription: newSub,
      currentTier: 'BASIC'
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message || 'Failed to select basic plan.' });
  }
});

// Cancel subscription or pause auto-renewal
router.post('/cancel', authenticateToken, async (req, res) => {
  try {
    const { immediate = false, reason = 'User requested cancellation' } = req.body || {};
    const result = await cancelUserSubscription(req.user.id, { immediate, reason });

    res.json({
      success: true,
      subscription: result.updated,
      message: result.message
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message || 'Failed to cancel subscription.' });
  }
});

// Resume paused auto-renewal
router.post('/resume', authenticateToken, async (req, res) => {
  try {
    const result = await resumeUserSubscription(req.user.id);

    res.json({
      success: true,
      subscription: result.updated,
      message: result.message
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message || 'Failed to resume auto-renewal.' });
  }
});

export default router;
