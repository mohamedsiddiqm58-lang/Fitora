import prisma from '../config/db.js';

/**
 * Retrieves the user's active subscription, automatically handling expiration
 * if currentPeriodEnd or expiryDate has passed.
 */
export async function getActiveUserSubscription(userId) {
  if (!userId) return { subscription: null, currentTier: 'BASIC', isExpired: false };

  // Fetch the latest active subscription
  const sub = await prisma.subscription.findFirst({
    where: { userId, status: 'ACTIVE' },
    include: { plan: true },
    orderBy: { createdAt: 'desc' }
  });

  if (!sub) {
    // Check if the most recent subscription for this user was expired
    const latestSub = await prisma.subscription.findFirst({
      where: { userId },
      include: { plan: true },
      orderBy: { createdAt: 'desc' }
    });
    const wasExpired = latestSub?.status === 'EXPIRED';
    return { subscription: null, currentTier: 'BASIC', isExpired: wasExpired };
  }

  // Check if non-free subscription has expired
  const now = new Date();
  const isFree = sub.billingInterval === 'FREE_FOREVER' || sub.planTier === 'BASIC';
  const isExpired = !isFree && (
    (sub.expiryDate && new Date(sub.expiryDate) < now) ||
    (sub.currentPeriodEnd && new Date(sub.currentPeriodEnd) < now)
  );

  if (isExpired) {
    // Lazily update database status to EXPIRED
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: 'EXPIRED' }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'SUBSCRIPTION_EXPIRED',
        resource: 'subscriptions',
        detailsJson: {
          subscriptionId: sub.id,
          planId: sub.planId,
          expiredAt: now
        }
      }
    });

    return { subscription: null, currentTier: 'BASIC', isExpired: true };
  }

  return { subscription: sub, currentTier: sub.planTier, isExpired: false };
}

/**
 * Activates or switches user to the Free Basic Plan.
 * Cancels/expires previous active subscriptions inside an atomic transaction.
 */
export async function selectBasicPlan(userId, userCategory = 'NORMAL') {
  // Find basic plan
  const basicPlan = await prisma.subscriptionPlan.findFirst({
    where: { tier: 'BASIC', isActive: true }
  });

  if (!basicPlan) {
    throw new Error('Basic subscription plan is not configured.');
  }

  const periodEnd = new Date('2099-12-31T23:59:59.000Z');

  return await prisma.$transaction(async (tx) => {
    // Expire any existing active subscriptions
    await tx.subscription.updateMany({
      where: { userId, status: 'ACTIVE' },
      data: { status: 'EXPIRED' }
    });

    // Create new active Basic subscription
    const newSub = await tx.subscription.create({
      data: {
        userId,
        planId: basicPlan.id,
        category: basicPlan.category || userCategory,
        planTier: 'BASIC',
        amount: 0,
        currency: 'INR',
        billingInterval: 'FREE_FOREVER',
        status: 'ACTIVE',
        startDate: new Date(),
        expiryDate: periodEnd,
        paymentReference: 'FREE_BASIC_SELECTION',
        currentPeriodStart: new Date(),
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false
      },
      include: { plan: true }
    });

    // Audit log
    await tx.auditLog.create({
      data: {
        userId,
        action: 'BASIC_PLAN_SELECTED',
        resource: 'subscriptions',
        detailsJson: {
          planId: basicPlan.id,
          tier: 'BASIC',
          timestamp: new Date()
        }
      }
    });

    return newSub;
  });
}

/**
 * Cancels or pauses auto-renewal for a user's active subscription.
 */
export async function cancelUserSubscription(userId, { immediate = false, reason = 'User requested cancellation' } = {}) {
  const activeSub = await prisma.subscription.findFirst({
    where: { userId, status: 'ACTIVE' },
    include: { plan: true }
  });

  if (!activeSub) {
    throw new Error('No active subscription found to cancel.');
  }

  if (activeSub.planTier === 'BASIC') {
    throw new Error('You are currently on the Free Basic Tier, which has no recurring charges.');
  }

  if (immediate) {
    // Cancel immediately and revoke paid access
    const updated = await prisma.subscription.update({
      where: { id: activeSub.id },
      data: {
        status: 'CANCELED',
        cancelAtPeriodEnd: true,
        expiryDate: new Date()
      },
      include: { plan: true }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'SUBSCRIPTION_IMMEDIATELY_CANCELED',
        resource: 'subscriptions',
        detailsJson: { subscriptionId: activeSub.id, reason }
      }
    });

    return {
      updated,
      message: 'Your subscription has been canceled immediately. Paid features have been deactivated.'
    };
  } else {
    // Pause auto-renewal at end of current period
    const updated = await prisma.subscription.update({
      where: { id: activeSub.id },
      data: { cancelAtPeriodEnd: true },
      include: { plan: true }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'SUBSCRIPTION_AUTO_RENEWAL_PAUSED',
        resource: 'subscriptions',
        detailsJson: { subscriptionId: activeSub.id, currentPeriodEnd: activeSub.currentPeriodEnd }
      }
    });

    return {
      updated,
      message: `Auto-renewal paused. Your subscription features will remain active until ${new Date(activeSub.currentPeriodEnd).toLocaleDateString()}.`
    };
  }
}

/**
 * Resumes auto-renewal if it was paused.
 */
export async function resumeUserSubscription(userId) {
  const activeSub = await prisma.subscription.findFirst({
    where: { userId, status: 'ACTIVE', cancelAtPeriodEnd: true },
    include: { plan: true }
  });

  if (!activeSub) {
    throw new Error('No paused subscription found to resume.');
  }

  const updated = await prisma.subscription.update({
    where: { id: activeSub.id },
    data: { cancelAtPeriodEnd: false },
    include: { plan: true }
  });

  return {
    updated,
    message: 'Auto-renewal has been successfully resumed.'
  };
}

/**
 * Returns payment gateway status and environment configuration.
 */
export function getGatewayStatus() {
  const keyId = process.env.RAZORPAY_KEY_ID || '';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
  const hasRealKeys = Boolean(keyId.trim() && keySecret.trim());

  return {
    isConfigured: hasRealKeys,
    isDevelopmentMode: !hasRealKeys,
    gatewayName: hasRealKeys ? 'Razorpay Live' : 'Fitora Development Sandbox Gateway',
    currency: 'INR',
    keyId: hasRealKeys ? keyId : 'rzp_test_demo_mode'
  };
}

/**
 * Feature inclusions per tier for consistent display and validation.
 */
export const TIER_FEATURES = {
  BASIC: [
    'Fitness & health profile questionnaire',
    'Standard workout and exercise library',
    'Hydration, sleep and habit tracking',
    'Medicine reminders with alert schedule',
    'Emergency call shortcut & guardian contacts',
    'AI Companion (5 free trial questions)'
  ],
  FREEMIUM: [
    'Everything in Basic Plan',
    'Unlimited 24/7 AI Fitness & Wellness Companion',
    'Scheduled daily check-ins & smart encouragement',
    'Personalized performance summaries',
    'Progressive habit coaching & streak analytics'
  ],
  PREMIUM: [
    'Everything in Freemium Plan',
    'Verified Partner Directory (Gyms, Hospitals, Nutritionists)',
    'Exclusive Partner Discounts & Guest Passes',
    'Direct appointment & consultation booking',
    'Advanced personalized sports nutrition & meal planning',
    'Custom adaptive workout programming'
  ]
};
