import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_URL = 'http://localhost:5000/api';

test('FITORA Navigation, Authentication, Profile & Single SOS Button Verification', async (t) => {
  let userToken = '';
  let testUserEmail = `user_${Date.now()}@test.com`;

  // 1. Sign Up verification
  await t.test('1. Sign Up: Register new user with hashed password and initial profile', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUserEmail,
        password: 'securePassword123',
        fullName: 'Test Health Seeker',
        category: 'ATHLETE'
      })
    });
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.token);
    assert.equal(data.user.email, testUserEmail);
    assert.equal(data.user.subscriptionTier, 'BASIC');
  });

  // 2. Sign In verification
  await t.test('2. Sign In: Authenticate with valid credentials and return JWT & profile', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUserEmail,
        password: 'securePassword123'
      })
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.token);
    assert.equal(data.user.profile.fullName, 'Test Health Seeker');
    userToken = data.token;
  });

  // 3. Protected routes require authentication
  await t.test('3. Security: Private endpoints reject unauthenticated requests with 401', async () => {
    const unauthProfile = await fetch(`${BASE_URL}/profile`);
    assert.equal(unauthProfile.status, 401);

    const unauthDashboard = await fetch(`${BASE_URL}/dashboard`);
    assert.equal(unauthDashboard.status, 401);

    const unauthWorkouts = await fetch(`${BASE_URL}/workouts`);
    assert.equal(unauthWorkouts.status, 401);
  });

  // 4. Session Persistence verification
  await t.test('4. Session Persistence: Verify session validation via /auth/me', async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.user.email, testUserEmail);
    assert.equal(data.user.subscriptionTier, 'BASIC');
  });

  // 5. Profile Update with Category, Emergency Contact, and Notification Preferences
  await t.test('5. Profile & Settings: Save Category, Emergency Contact with Consent, and Notifications', async () => {
    const res = await fetch(`${BASE_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`
      },
      body: JSON.stringify({
        fullName: 'Test Health Seeker Updated',
        age: 32,
        heightCm: 178,
        weightKg: 74,
        selectedCategory: 'GYM_FREAK',
        emergencyName: 'Priya Sharma',
        emergencyPhone: '+91 98765 12345',
        emergencyRelation: 'Spouse',
        emergencyConsent: true,
        notifications: {
          browserEnabled: true,
          checkinTime: '08:30',
          medicineAlerts: true,
          workoutReminders: true,
          habitReminders: true
        }
      })
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.profile.selectedCategory, 'GYM_FREAK');
    assert.equal(data.profile.emergencyName, 'Priya Sharma');
    assert.equal(data.profile.emergencyConsent, true);
    assert.equal(data.notifications.checkinTime, '08:30');
  });

  // 6. Emergency Contacts API & Logging
  await t.test('6. Emergency Endpoint: Retrieve Emergency Responders and Log Shortcut Tap', async () => {
    const res = await fetch(`${BASE_URL}/emergency`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.emergencyServices.nationalEmergency, '112');
    assert.equal(data.emergencyServices.medicalAmbulance, '108');
    assert.equal(data.emergencyServices.seniorCitizenHelpline, '14567');
    assert.equal(data.primaryContact.name, 'Priya Sharma');

    // Test shortcut tap logging for audit
    const logRes = await fetch(`${BASE_URL}/emergency/log-shortcut-tap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`
      },
      body: JSON.stringify({
        contactType: 'NATIONAL_EMERGENCY',
        targetNumber: '112'
      })
    });
    assert.equal(logRes.status, 200);
    const logData = await logRes.json();
    assert.equal(logData.success, true);
  });

  // 7. Verify UI Code Integrity: Exactly ONE visible SOS button in the entire app
  await t.test('7. UI Architecture: Verify exactly ONE SOS button exists, on DashboardPage only', async () => {
    const clientSrc = path.join(__dirname, '..', '..', 'client', 'src');

    // Read files
    const mobileAppShellCode = fs.readFileSync(path.join(clientSrc, 'components', 'MobileAppShell.jsx'), 'utf-8');
    const navbarCode = fs.readFileSync(path.join(clientSrc, 'components', 'Navbar.jsx'), 'utf-8');
    const landingCode = fs.readFileSync(path.join(clientSrc, 'pages', 'LandingPage.jsx'), 'utf-8');
    const dashboardCode = fs.readFileSync(path.join(clientSrc, 'pages', 'DashboardPage.jsx'), 'utf-8');
    const subscriptionsCode = fs.readFileSync(path.join(clientSrc, 'pages', 'SubscriptionsPage.jsx'), 'utf-8');
    const profileCode = fs.readFileSync(path.join(clientSrc, 'pages', 'ProfilePage.jsx'), 'utf-8');

    // Verify MobileAppShell does NOT render SOS button
    assert.equal(mobileAppShellCode.includes('title="Emergency Help"'), false);
    assert.equal(mobileAppShellCode.includes('title="Emergency SOS"'), false);

    // Verify Navbar does NOT render SOS button
    assert.equal(navbarCode.includes('Emergency SOS Shortcut'), false);

    // Verify LandingPage does NOT render SOS button
    assert.equal(landingCode.includes('Emergency 112 / 108'), false);

    // Verify SubscriptionsPage does NOT render SOS button
    assert.equal(subscriptionsCode.includes('onOpenEmergency'), false);

    // Verify ProfilePage does NOT render SOS button
    assert.equal(profileCode.includes('onOpenEmergency'), false);

    // Verify DashboardPage DOES render the canonical single SOS button
    assert.ok(dashboardCode.includes('aria-label="Emergency SOS"'));
    assert.ok(dashboardCode.includes('title="Emergency SOS Quick Assistance'));
    assert.ok(dashboardCode.includes('fixed top-20'));
  });

  // 8. Verify Navigation: Bottom Navigation on Mobile & Top Navigation on Desktop contain the 5 required tabs
  await t.test('8. Navigation Architecture: Mobile bottom bar & Desktop top bar contain all 5 required tabs', async () => {
    const clientSrc = path.join(__dirname, '..', '..', 'client', 'src');
    const mobileAppShellCode = fs.readFileSync(path.join(clientSrc, 'components', 'MobileAppShell.jsx'), 'utf-8');

    // Must have the 5 canonical tabs
    assert.ok(mobileAppShellCode.includes("{ label: 'Home'"));
    assert.ok(mobileAppShellCode.includes("{ label: 'Workouts'"));
    assert.ok(mobileAppShellCode.includes("{ label: 'Nutrition'"));
    assert.ok(mobileAppShellCode.includes("{ label: 'Subscription'"));
    assert.ok(mobileAppShellCode.includes("{ label: 'Profile'"));

    // Subscription must be a separate bottom navigation item
    assert.ok(mobileAppShellCode.includes("to={tab.path}"));
    assert.ok(mobileAppShellCode.includes('aria-label="Mobile Navigation"'));
    assert.ok(mobileAppShellCode.includes('aria-label="Desktop Navigation"'));

    // Account menu with separate Sign Out
    assert.ok(mobileAppShellCode.includes("Sign Out"));
    assert.ok(mobileAppShellCode.includes("handleSignOut"));
  });
});
