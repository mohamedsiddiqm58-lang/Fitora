import express from 'express';
import prisma from '../config/db.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Apply auth + requireAdmin to all routes in this router
router.use(authenticateToken);
router.use(requireAdmin);

// 1. System Overview Metrics
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalSubscriptions = await prisma.subscription.count({ where: { status: 'ACTIVE' } });
    const totalWorkoutsLogged = await prisma.workoutLog.count();
    const totalPartners = await prisma.partner.count();
    const totalPayments = await prisma.payment.findMany({ select: { amountInr: true } });
    const totalRevenueInr = totalPayments.reduce((acc, curr) => acc + curr.amountInr, 0);

    const usersByCategory = await prisma.userProfile.groupBy({
      by: ['selectedCategory'],
      _count: { selectedCategory: true }
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeSubscriptions: totalSubscriptions,
        totalWorkoutsLogged,
        totalPartners,
        totalRevenueInr,
        usersByCategory
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch admin stats.', error: err.message });
  }
});

// 2. User Management
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        profile: true,
        subscriptions: {
          where: { status: 'ACTIVE' },
          include: { plan: true },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    // Anonymize sensitive fields for admin privacy compliance
    const sanitized = users.map(u => ({
      id: u.id,
      email: u.email,
      role: u.role,
      fullName: u.profile?.fullName,
      category: u.profile?.selectedCategory,
      tier: u.subscriptions[0]?.planTier || 'BASIC',
      planName: u.subscriptions[0]?.plan?.name || 'Free Basic',
      createdAt: u.createdAt
    }));

    res.json({ success: true, count: sanitized.length, users: sanitized });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch user list.', error: err.message });
  }
});

// 3. Plan Configuration & Pricing
router.get('/plans', async (req, res) => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { priceInr: 'asc' }
    });
    res.json({ success: true, plans });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch plans.', error: err.message });
  }
});

router.put('/plans/:id', async (req, res) => {
  try {
    const { priceInr, name, isActive, billingCycle } = req.body;

    const updated = await prisma.subscriptionPlan.update({
      where: { id: req.params.id },
      data: {
        priceInr: priceInr !== undefined ? parseFloat(priceInr) : undefined,
        name: name || undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
        billingCycle: billingCycle || undefined
      }
    });

    res.json({ success: true, plan: updated, message: 'Plan price and settings updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update plan.', error: err.message });
  }
});

// 4. Partner Management
router.get('/partners', async (req, res) => {
  try {
    const partners = await prisma.partner.findMany({
      include: { services: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, partners });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch partners.', error: err.message });
  }
});

router.post('/partners', async (req, res) => {
  try {
    const { name, partnerType, description, city, phone, email, websiteUrl, discountOffer } = req.body;

    if (!name || !partnerType || !city) {
      return res.status(400).json({ success: false, message: 'Partner name, type, and city are required.' });
    }

    const partner = await prisma.partner.create({
      data: {
        name,
        partnerType,
        description: description || 'Verified Fitora wellness partner.',
        city,
        phone,
        email,
        websiteUrl,
        discountOffer,
        isVerified: true
      }
    });

    res.status(201).json({ success: true, partner, message: 'Partner registered and verified.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create partner.', error: err.message });
  }
});

router.patch('/partners/:id/verify', async (req, res) => {
  try {
    const partner = await prisma.partner.findUnique({ where: { id: req.params.id } });
    if (!partner) return res.status(404).json({ success: false, message: 'Partner not found.' });

    const updated = await prisma.partner.update({
      where: { id: partner.id },
      data: { isVerified: !partner.isVerified }
    });

    res.json({ success: true, partner: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to toggle partner verification.', error: err.message });
  }
});

// 5. System Audit Logs
router.get('/audit-logs', async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { user: { select: { email: true } } }
    });

    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch audit logs.', error: err.message });
  }
});

export default router;
