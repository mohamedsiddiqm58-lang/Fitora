import test from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = 'http://localhost:5000/api';

test('FITORA Full-Stack Integration Test Suite', async (t) => {
  let authToken = '';
  let userId = '';

  await t.test('1. Health Check Endpoint', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'ONLINE');
    assert.equal(data.postgresDatabase, 'Connected (fitora_db)');
  });

  await t.test('2. Authentication: Login as Demo Senior Citizen', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'senior@fitora.com', password: 'fitora123' })
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.token);
    assert.equal(data.user.profile.selectedCategory, 'SENIOR');
    authToken = data.token;
    userId = data.user.id;
  });

  await t.test('3. Dashboard: Fetch Personalized Senior Dashboard', async () => {
    const res = await fetch(`${BASE_URL}/dashboard`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.data.isSenior, true);
    assert.ok(data.data.medicineReminders.length > 0);
    assert.ok(data.data.water);
    assert.ok(data.data.habits);
  });

  await t.test('4. Hydration: Add Water Intake', async () => {
    const res = await fetch(`${BASE_URL}/water/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({ amountMl: 250 })
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.water.amountMl >= 250);
  });

  await t.test('5. Habits: Toggle Daily Habit Item', async () => {
    const res = await fetch(`${BASE_URL}/habits/toggle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({ habitId: 'water' })
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.today);
    assert.ok(data.streak);
  });

  await t.test('6. Medications: Acknowledge Medicine Reminder', async () => {
    const medListRes = await fetch(`${BASE_URL}/medications`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const medListData = await medListRes.json();
    assert.ok(medListData.reminders.length > 0);
    const firstMed = medListData.reminders[0];

    const ackRes = await fetch(`${BASE_URL}/medications/${firstMed.id}/acknowledge`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert.equal(ackRes.status, 200);
    const ackData = await ackRes.json();
    assert.equal(ackData.success, true);
    assert.equal(ackData.reminder.acknowledgedToday, true);
  });

  await t.test('7. AI Companion: Context-Aware Chat Response', async () => {
    const res = await fetch(`${BASE_URL}/ai/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({ message: 'How is my hydration and progress today?' })
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.aiMessage.messageContent);
  });

  await t.test('8. AI Companion Guardrail: Emergency Warning Red Flag', async () => {
    const res = await fetch(`${BASE_URL}/ai/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({ message: 'I feel sudden chest pain and shortness of breath' })
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.isEmergencyWarning, true);
    assert.ok(data.aiMessage.messageContent.includes('IMPORTANT HEALTH WARNING'));
  });

  await t.test('9. Subscriptions & Payments: Create Order & Verify Subscription', async () => {
    // Fetch plans
    const plansRes = await fetch(`${BASE_URL}/subscriptions/plans`);
    const plansData = await plansRes.json();
    assert.ok(plansData.plans.length > 0);
    const targetPlan = plansData.plans.find((p) => p.tier === 'PREMIUM');

    // Create Order
    const orderRes = await fetch(`${BASE_URL}/payments/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({ planId: targetPlan.id })
    });
    assert.equal(orderRes.status, 200);
    const orderData = await orderRes.json();
    assert.ok(orderData.order.orderId);

    // Verify Payment
    const verifyRes = await fetch(`${BASE_URL}/payments/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        orderId: orderData.order.orderId,
        planId: targetPlan.id,
        paymentMethod: 'UPI'
      })
    });
    assert.equal(verifyRes.status, 200);
    const verifyData = await verifyRes.json();
    assert.equal(verifyData.success, true);
    assert.equal(verifyData.subscription.status, 'ACTIVE');
  });

  await t.test('10. Admin: Access Statistics as Admin User', async () => {
    // Login as Admin
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@fitora.com', password: 'admin123' })
    });
    const adminLoginData = await adminLoginRes.json();
    const adminToken = adminLoginData.token;

    const statsRes = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.equal(statsRes.status, 200);
    const statsData = await statsRes.json();
    assert.equal(statsData.success, true);
    assert.ok(statsData.stats.totalUsers > 0);
    assert.ok(statsData.stats.totalRevenueInr >= 0);
  });
});
