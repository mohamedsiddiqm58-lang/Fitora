import express from 'express';
import crypto from 'crypto';
import prisma from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { getGatewayStatus } from '../services/subscriptionService.js';

const router = express.Router();

// 1. Create order for subscription checkout
router.post('/create-order', authenticateToken, async (req, res) => {
  try {
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({ success: false, message: 'Plan ID is required.' });
    }

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId }
    });

    if (!plan || !plan.isActive) {
      return res.status(404).json({ success: false, message: 'Subscription plan not found or inactive.' });
    }

    const gatewayStatus = getGatewayStatus();
    // Unique server-side order identifier
    const orderId = `order_fit_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    res.json({
      success: true,
      isDevelopmentMode: gatewayStatus.isDevelopmentMode,
      gatewayName: gatewayStatus.gatewayName,
      keyId: gatewayStatus.keyId,
      order: {
        orderId,
        planId: plan.id,
        planName: plan.name,
        category: plan.category || req.user.category || 'NORMAL',
        tier: plan.tier,
        amountInr: plan.priceInr,
        currency: 'INR',
        billingCycle: plan.billingCycle,
        description: `Fitora ${plan.name} Subscription`,
        customerName: req.user.email
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to initiate checkout order.', error: err.message });
  }
});

// 2. Verify payment & activate subscription (Server-side validation)
router.post('/verify', authenticateToken, async (req, res) => {
  try {
    const {
      orderId,
      planId,
      paymentMethod = 'UPI / NetBanking',
      transactionRef,
      signature
    } = req.body;
    const userId = req.user.id;

    if (!orderId || !planId) {
      return res.status(400).json({ success: false, message: 'OrderId and PlanId are required for verification.' });
    }

    // Duplicate transaction protection
    const existingPayment = await prisma.payment.findFirst({
      where: { gatewayOrderId: orderId }
    });

    if (existingPayment) {
      return res.status(409).json({ success: false, message: 'This transaction order has already been processed.' });
    }

    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan || !plan.isActive) {
      return res.status(404).json({ success: false, message: 'Plan not found or inactive.' });
    }

    const gatewayStatus = getGatewayStatus();

    // Verify signature if live keys are present
    if (!gatewayStatus.isDevelopmentMode && process.env.RAZORPAY_KEY_SECRET) {
      if (!signature) {
        return res.status(400).json({ success: false, message: 'Gateway payment signature is required for live verification.' });
      }
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${orderId}|${transactionRef}`)
        .digest('hex');

      if (expectedSignature !== signature) {
        return res.status(400).json({ success: false, message: 'Payment signature verification failed.' });
      }
    }

    // Determine duration: 180 days for packages, 30 days for monthly
    const durationDays = plan.billingCycle.includes('6_MONTHS') ? 180 : 30;
    const periodEnd = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
    const paymentId = transactionRef || `pay_fit_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const receiptNumber = `REC-FIT-${Date.now().toString().slice(-6)}`;

    // Execute atomic update: expire existing active subscriptions and activate new one
    const { newSubscription, payment } = await prisma.$transaction(async (tx) => {
      // 1. Expire all current active subscriptions for this user
      await tx.subscription.updateMany({
        where: { userId, status: 'ACTIVE' },
        data: { status: 'EXPIRED' }
      });

      // 2. Create verified new active subscription with all required fields
      const sub = await tx.subscription.create({
        data: {
          userId,
          planId: plan.id,
          category: plan.category || req.user.category || 'NORMAL',
          planTier: plan.tier,
          amount: plan.priceInr,
          currency: 'INR',
          billingInterval: plan.billingCycle,
          status: 'ACTIVE',
          startDate: new Date(),
          expiryDate: periodEnd,
          paymentReference: paymentId,
          currentPeriodStart: new Date(),
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: false
        },
        include: { plan: true }
      });

      const gatewayLabel = gatewayStatus.isDevelopmentMode
        ? `Development Sandbox (${paymentMethod})`
        : `Razorpay Live (${paymentMethod})`;

      // 3. Create verified payment record
      const pay = await tx.payment.create({
        data: {
          userId,
          subscriptionId: sub.id,
          amountInr: plan.priceInr,
          currency: 'INR',
          status: 'SUCCESS',
          paymentGateway: gatewayLabel,
          gatewayOrderId: orderId,
          gatewayPaymentId: paymentId,
          receiptUrl: `/api/payments/receipt/${receiptNumber}`
        }
      });

      // 4. Audit log
      await tx.auditLog.create({
        data: {
          userId,
          action: 'SUBSCRIPTION_PURCHASED',
          resource: 'subscriptions',
          detailsJson: {
            planCode: plan.planCode,
            tier: plan.tier,
            amountInr: plan.priceInr,
            orderId,
            paymentId,
            mode: gatewayStatus.isDevelopmentMode ? 'SANDBOX' : 'LIVE'
          }
        }
      });

      return { newSubscription: sub, payment: pay };
    });

    res.json({
      success: true,
      message: `Congratulations! Your ${plan.name} is now active until ${periodEnd.toLocaleDateString()}.`,
      subscription: newSubscription,
      payment,
      receiptNumber
    });
  } catch (err) {
    console.error('Payment verification error:', err);
    res.status(500).json({ success: false, message: 'Payment verification failed.', error: err.message });
  }
});

// 3. Get digital receipt/invoice details
router.get('/receipt/:receiptNumber', authenticateToken, async (req, res) => {
  try {
    const payment = await prisma.payment.findFirst({
      where: {
        receiptUrl: { contains: req.params.receiptNumber },
        userId: req.user.id
      },
      include: {
        subscription: { include: { plan: true } },
        user: { include: { profile: true } }
      }
    });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Receipt not found.' });
    }

    const subtotal = Math.round((payment.amountInr / 1.18) * 100) / 100;
    const gstAmount = Math.round((payment.amountInr - subtotal) * 100) / 100;

    res.json({
      success: true,
      receipt: {
        receiptNumber: req.params.receiptNumber,
        date: payment.createdAt,
        customerName: payment.user.profile?.fullName || payment.user.email,
        customerEmail: payment.user.email,
        planName: payment.subscription?.plan?.name || 'Fitora Subscription',
        tier: payment.subscription?.planTier,
        billingCycle: payment.subscription?.billingInterval,
        amountInr: payment.amountInr,
        subtotalInr: subtotal,
        gstInr: gstAmount,
        currency: payment.currency,
        paymentGateway: payment.paymentGateway,
        gatewayPaymentId: payment.gatewayPaymentId,
        gatewayOrderId: payment.gatewayOrderId,
        status: payment.status
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve receipt.', error: err.message });
  }
});

export default router;
