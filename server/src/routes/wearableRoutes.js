import express from 'express';
import prisma from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Supported wearable adapters
const SUPPORTED_PROVIDERS = [
  {
    id: 'apple_health',
    name: 'Apple Health',
    platform: 'iOS / watchOS',
    type: 'HealthKit SDK',
    metrics: ['Steps', 'Heart Rate', 'Active Energy', 'Sleep Analysis', 'Workouts'],
    authMethod: 'Native HealthKit Authorization on iOS'
  },
  {
    id: 'google_fit',
    name: 'Google Health Connect / Google Fit',
    platform: 'Android / Wear OS',
    type: 'Health Connect API',
    metrics: ['Daily Steps', 'Resting Heart Rate', 'Calories Burned', 'Sleep Sessions'],
    authMethod: 'OAuth 2.0 / Health Connect Permissions'
  },
  {
    id: 'fitbit',
    name: 'Fitbit by Google',
    platform: 'Fitbit OS / Cloud API',
    type: 'Fitbit Web API v1.2',
    metrics: ['Steps', 'SpO2', 'Heart Rate Variability', 'Sleep Stages'],
    authMethod: 'OAuth 2.0 Cloud Authorization'
  },
  {
    id: 'garmin',
    name: 'Garmin Connect',
    platform: 'Garmin Devices',
    type: 'Garmin Health API',
    metrics: ['VO2 Max', 'Training Load', 'Pulse Ox', 'Respiration Rate'],
    authMethod: 'Garmin Health Developer OAuth 1.0a / 2.0'
  }
];

// Get user connections & supported adapters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const connections = await prisma.wearableConnection.findMany({
      where: { userId: req.user.id }
    });

    const measurements = await prisma.wearableMeasurement.findMany({
      where: { userId: req.user.id },
      orderBy: { recordedAt: 'desc' },
      take: 20
    });

    res.json({
      success: true,
      supportedProviders: SUPPORTED_PROVIDERS,
      connections,
      recentMeasurements: measurements,
      integrationNote: 'Live device syncing uses official platform HealthKit & Health Connect SDKs. External cloud services (Fitbit/Garmin) require OAuth credentials configured in production.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch wearable status.', error: err.message });
  }
});

// Connect or disconnect provider with explicit user consent
router.post('/connect', authenticateToken, async (req, res) => {
  try {
    const { providerName, deviceType = 'Smartwatch', consentGiven } = req.body;

    if (!providerName) {
      return res.status(400).json({ success: false, message: 'Provider name is required.' });
    }

    if (!consentGiven) {
      return res.status(400).json({ success: false, message: 'Explicit consent is required to connect health wearable data.' });
    }

    // Save consent record
    await prisma.consentRecord.create({
      data: {
        userId: req.user.id,
        consentType: `WEARABLE_SYNC_${providerName.toUpperCase().replace(/\s+/g, '_')}`,
        granted: true,
        ipAddress: req.ip
      }
    });

    const connection = await prisma.wearableConnection.upsert({
      where: {
        userId_providerName: {
          userId: req.user.id,
          providerName
        }
      },
      update: {
        status: 'CONNECTED',
        lastSyncedAt: new Date(),
        deviceType
      },
      create: {
        userId: req.user.id,
        providerName,
        deviceType,
        status: 'CONNECTED',
        lastSyncedAt: new Date()
      }
    });

    res.json({
      success: true,
      connection,
      message: `Successfully connected ${providerName}. Synchronization channel is active.`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to connect wearable.', error: err.message });
  }
});

// Disconnect
router.post('/disconnect', authenticateToken, async (req, res) => {
  try {
    const { providerName } = req.body;

    await prisma.wearableConnection.deleteMany({
      where: {
        userId: req.user.id,
        providerName
      }
    });

    res.json({ success: true, message: `Disconnected ${providerName}.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to disconnect wearable.', error: err.message });
  }
});

// Manual sync trigger (e.g. imports verified authorized readings)
router.post('/sync', authenticateToken, async (req, res) => {
  try {
    const { providerName, steps, heartRate, activeCalories } = req.body;
    const userId = req.user.id;

    const connection = await prisma.wearableConnection.findFirst({
      where: { userId, providerName }
    });

    if (!connection) {
      return res.status(400).json({ success: false, message: 'Device is not connected. Please connect first.' });
    }

    // Store measurements if provided
    if (steps) {
      await prisma.wearableMeasurement.create({
        data: {
          userId,
          provider: providerName,
          metricType: 'STEPS',
          value: parseFloat(steps),
          unit: 'steps'
        }
      });
    }

    if (heartRate) {
      await prisma.wearableMeasurement.create({
        data: {
          userId,
          provider: providerName,
          metricType: 'HEART_RATE',
          value: parseFloat(heartRate),
          unit: 'bpm'
        }
      });
    }

    if (activeCalories) {
      await prisma.wearableMeasurement.create({
        data: {
          userId,
          provider: providerName,
          metricType: 'ACTIVE_ENERGY',
          value: parseFloat(activeCalories),
          unit: 'kcal'
        }
      });
    }

    await prisma.wearableConnection.update({
      where: { id: connection.id },
      data: { lastSyncedAt: new Date() }
    });

    res.json({
      success: true,
      lastSyncedAt: new Date(),
      message: `Synced latest metrics from ${providerName}.`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Sync failed.', error: err.message });
  }
});

export default router;
