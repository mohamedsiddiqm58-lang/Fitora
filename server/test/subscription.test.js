import test from 'node:test';
import assert from 'node:assert/strict';
import prisma from '../src/config/db.js';

const BASE_URL = 'http://localhost:5000/api';

test('FITORA Subscription & Feature Access Control Integration Test Suite', async (t) => {
  let athleteToken = '';
  let seniorToken = '';
  let athleteUserId = '';
  let seniorUserId = '';

  // 1. Authenticate test users
  await t.test('1. Setup & Authenticate Test Users (Athlete & Senior)', async () => {
    // Login as athlete
    const athleteRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'athlete@fitora.com', password: 'fitora123' })
    });
    assert.equal(athleteRes.status, 200);
    const athleteData = await athleteRes.json();
    assert.equal(athleteData.success, true);
    athleteToken = athleteData.token;
    athleteUserId = athleteData.user.id;

    // Login as senior
    const seniorRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'senior@fitora.com', password: 'fitora123' })
    });
    assert.equal(seniorRes.status, 200);
    const seniorData = await seniorRes.json();
    assert.equal(seniorData.success, true);
    seniorToken = seniorData.token;
    seniorUserId = seniorData.user.id;
  });

  // 2. Gateway Status Endpoint
  await t.test('2. Gateway Configuration: Return Sandbox/Development Mode Status', async () => {
    const res = await fetch(`${BASE_URL}/subscriptions/config`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.config);
    assert.equal(typeof data.config.isDevelopmentMode, 'boolean');
    assert.equal(data.config.currency, 'INR');
  });

  // 3. Test All 4 Categories & Pricing Specifications
  await t.test('3. Verify Plans for All 4 Categories (Athletes, Seniors, Gym Freaks, Normal)', async () => {
    const res = await fetch(`${BASE_URL}/subscriptions/plans`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    const { plans } = data;
    assert.ok(plans.length >= 8);

    // Free Basic Plan
    const basicPlan = plans.find((p) => p.tier === 'BASIC');
    assert.ok(basicPlan);
    assert.equal(basicPlan.priceInr, 0);

    // Athletes Plans: Freemium ₹99, Premium configurable
    const athleteFreemium = plans.find((p) => p.planCode === 'ATHLETE_FREEMIUM');
    assert.ok(athleteFreemium);
    assert.equal(athleteFreemium.priceInr, 99);
    assert.equal(athleteFreemium.category, 'ATHLETE');

    const athletePremium = plans.find((p) => p.planCode === 'ATHLETE_PREMIUM');
    assert.ok(athletePremium);
    assert.equal(athletePremium.tier, 'PREMIUM');

    // Senior Citizens Plans: Freemium ₹199, Premium ₹1,999 package
    const seniorFreemium = plans.find((p) => p.planCode === 'SENIOR_FREEMIUM');
    assert.ok(seniorFreemium);
    assert.equal(seniorFreemium.priceInr, 199);
    assert.equal(seniorFreemium.category, 'SENIOR');

    const seniorPremium = plans.find((p) => p.planCode === 'SENIOR_PREMIUM');
    assert.ok(seniorPremium);
    assert.equal(seniorPremium.priceInr, 1999);
    assert.ok(seniorPremium.billingCycle.includes('6_MONTHS'));

    // Gym Freaks Plans: Freemium configurable, Premium ₹299
    const gymFreemium = plans.find((p) => p.planCode === 'GYM_FREEMIUM');
    assert.ok(gymFreemium);
    const gymPremium = plans.find((p) => p.planCode === 'GYM_PREMIUM');
    assert.ok(gymPremium);
    assert.equal(gymPremium.priceInr, 299);

    // Normal People Plans: Freemium configurable, Premium ₹299
    const normalFreemium = plans.find((p) => p.planCode === 'NORMAL_FREEMIUM');
    assert.ok(normalFreemium);
    const normalPremium = plans.find((p) => p.planCode === 'NORMAL_PREMIUM');
    assert.ok(normalPremium);
    assert.equal(normalPremium.priceInr, 299);
  });

  // 4. Select Free Basic Plan & Database Persistence
  await t.test('4. Select Basic Plan: Atomic Activation and PostgreSQL Record', async () => {
    const res = await fetch(`${BASE_URL}/subscriptions/select-basic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${athleteToken}`
      }
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.currentTier, 'BASIC');
    assert.equal(data.subscription.planTier, 'BASIC');
    assert.equal(data.subscription.amount, 0);
    assert.equal(data.subscription.currency, 'INR');
    assert.equal(data.subscription.status, 'ACTIVE');

    // Verify in database
    const dbSub = await prisma.subscription.findFirst({
      where: { userId: athleteUserId, status: 'ACTIVE' }
    });
    assert.ok(dbSub);
    assert.equal(dbSub.planTier, 'BASIC');
    assert.equal(dbSub.amount, 0);
    assert.equal(dbSub.billingInterval, 'FREE_FOREVER');
  });

  // 5. Feature Access Restriction: Non-Premium cannot book partner consultation
  await t.test('5. Feature Access Control: Basic user rejected from partner booking (403)', async () => {
    const partnerRes = await fetch(`${BASE_URL}/partners`);
    const partnerData = await partnerRes.json();
    assert.ok(partnerData.partners.length > 0);
    const firstPartner = partnerData.partners[0];

    const bookRes = await fetch(`${BASE_URL}/partners/book`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${athleteToken}`
      },
      body: JSON.stringify({
        partnerId: firstPartner.id,
        bookingDate: new Date(Date.now() + 86400000).toISOString()
      })
    });

    assert.equal(bookRes.status, 403);
    const bookData = await bookRes.json();
    assert.equal(bookData.success, false);
    assert.equal(bookData.requiresUpgrade, true);
    assert.equal(bookData.requiredTier, 'PREMIUM');
  });

  // 6. Paid Checkout & Payment Verification Flow
  let targetOrderId = '';
  let targetPlanId = '';

  await t.test('6. Paid Checkout: Create Order & Verify Subscription (Sandbox/Gateway)', async () => {
    const plansRes = await fetch(`${BASE_URL}/subscriptions/plans?category=ATHLETE`);
    const plansData = await plansRes.json();
    const premiumPlan = plansData.plans.find((p) => p.planCode === 'ATHLETE_PREMIUM');
    assert.ok(premiumPlan);
    targetPlanId = premiumPlan.id;

    // Create Order
    const orderRes = await fetch(`${BASE_URL}/payments/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${athleteToken}`
      },
      body: JSON.stringify({ planId: premiumPlan.id })
    });
    assert.equal(orderRes.status, 200);
    const orderData = await orderRes.json();
    assert.equal(orderData.success, true);
    assert.ok(orderData.order.orderId);
    targetOrderId = orderData.order.orderId;

    // Verify Payment
    const verifyRes = await fetch(`${BASE_URL}/payments/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${athleteToken}`
      },
      body: JSON.stringify({
        orderId: targetOrderId,
        planId: targetPlanId,
        paymentMethod: 'UPI'
      })
    });
    assert.equal(verifyRes.status, 200);
    const verifyData = await verifyRes.json();
    assert.equal(verifyData.success, true);
    assert.equal(verifyData.subscription.status, 'ACTIVE');
    assert.equal(verifyData.subscription.planTier, 'PREMIUM');
    assert.equal(verifyData.subscription.amount, premiumPlan.priceInr);
    assert.equal(verifyData.subscription.currency, 'INR');
    assert.ok(verifyData.subscription.expiryDate);
    assert.ok(verifyData.subscription.paymentReference);

    // Verify database: only ONE active subscription exists for this user
    const activeSubs = await prisma.subscription.findMany({
      where: { userId: athleteUserId, status: 'ACTIVE' }
    });
    assert.equal(activeSubs.length, 1);
    assert.equal(activeSubs[0].id, verifyData.subscription.id);
  });

  // 7. Feature Access Control: Premium user CAN book partner consultation
  await t.test('7. Feature Access Control: Upgraded Premium user successfully books partner consultation', async () => {
    const partnerRes = await fetch(`${BASE_URL}/partners`);
    const partnerData = await partnerRes.json();
    const firstPartner = partnerData.partners[0];

    const bookRes = await fetch(`${BASE_URL}/partners/book`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${athleteToken}`
      },
      body: JSON.stringify({
        partnerId: firstPartner.id,
        bookingDate: new Date(Date.now() + 86400000).toISOString(),
        notes: 'Integration test consultation booking'
      })
    });

    assert.equal(bookRes.status, 201);
    const bookData = await bookRes.json();
    assert.equal(bookData.success, true);
    assert.ok(bookData.booking.id);
  });

  // 8. Auto-Renewal Pause & Resume
  await t.test('8. Subscription Management: Pause & Resume Auto-Renewal', async () => {
    // Pause auto-renewal
    const pauseRes = await fetch(`${BASE_URL}/subscriptions/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${athleteToken}`
      },
      body: JSON.stringify({ immediate: false })
    });
    assert.equal(pauseRes.status, 200);
    const pauseData = await pauseRes.json();
    assert.equal(pauseData.success, true);
    assert.equal(pauseData.subscription.cancelAtPeriodEnd, true);
    assert.equal(pauseData.subscription.status, 'ACTIVE'); // Remains active until period end

    // Resume auto-renewal
    const resumeRes = await fetch(`${BASE_URL}/subscriptions/resume`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${athleteToken}`
      }
    });
    assert.equal(resumeRes.status, 200);
    const resumeData = await resumeRes.json();
    assert.equal(resumeData.success, true);
    assert.equal(resumeData.subscription.cancelAtPeriodEnd, false);
  });

  // 9. Digital Receipt & Tax Breakdown
  await t.test('9. Digital Receipt: Retrieve Receipt with GST Breakdown', async () => {
    const currentRes = await fetch(`${BASE_URL}/subscriptions/current`, {
      headers: { Authorization: `Bearer ${athleteToken}` }
    });
    const currentData = await currentRes.json();
    assert.ok(currentData.paymentHistory.length > 0);
    const latestPayment = currentData.paymentHistory[0];
    const receiptNum = latestPayment.receiptUrl.split('/').pop();

    const receiptRes = await fetch(`${BASE_URL}/payments/receipt/${receiptNum}`, {
      headers: { Authorization: `Bearer ${athleteToken}` }
    });
    assert.equal(receiptRes.status, 200);
    const receiptData = await receiptRes.json();
    assert.equal(receiptData.success, true);
    assert.ok(receiptData.receipt.subtotalInr > 0);
    assert.ok(receiptData.receipt.gstInr > 0);
    assert.equal(receiptData.receipt.amountInr, latestPayment.amountInr);
  });

  // 10. Expired Subscriptions Automatically Revert to BASIC
  await t.test('10. Expiration Handling: Expired subscription loses paid features and downgrades to BASIC', async () => {
    // Manually simulate an expired subscription in DB by setting currentPeriodEnd and expiryDate in the past
    const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeSub = await prisma.subscription.findFirst({
      where: { userId: athleteUserId, status: 'ACTIVE' }
    });
    assert.ok(activeSub);

    await prisma.subscription.update({
      where: { id: activeSub.id },
      data: {
        currentPeriodEnd: pastDate,
        expiryDate: pastDate
      }
    });

    // Check /subscriptions/current: should detect expiration and return BASIC
    const currentRes = await fetch(`${BASE_URL}/subscriptions/current`, {
      headers: { Authorization: `Bearer ${athleteToken}` }
    });
    assert.equal(currentRes.status, 200);
    const currentData = await currentRes.json();
    assert.equal(currentData.currentTier, 'BASIC');
    assert.equal(currentData.isExpired, true);

    // In DB, status must now be marked EXPIRED
    const expiredSub = await prisma.subscription.findUnique({
      where: { id: activeSub.id }
    });
    assert.equal(expiredSub.status, 'EXPIRED');

    // And partner booking must now be rejected again
    const partnerRes = await fetch(`${BASE_URL}/partners`);
    const partnerData = await partnerRes.json();
    const firstPartner = partnerData.partners[0];

    const bookRes = await fetch(`${BASE_URL}/partners/book`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${athleteToken}`
      },
      body: JSON.stringify({
        partnerId: firstPartner.id,
        bookingDate: new Date(Date.now() + 86400000).toISOString()
      })
    });
    assert.equal(bookRes.status, 403);
  });
});
