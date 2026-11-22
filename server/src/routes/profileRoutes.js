import express from 'express';
import prisma from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get full profile including health conditions, allergies, medications, goals, and notification preferences
router.get('/', authenticateToken, async (req, res) => {
  try {
    const profile = await prisma.userProfile.findUnique({
      where: { userId: req.user.id }
    });

    const healthConditions = await prisma.userHealthCondition.findMany({
      where: { userId: req.user.id }
    });

    const allergies = await prisma.userAllergy.findMany({
      where: { userId: req.user.id }
    });

    const medications = await prisma.userMedication.findMany({
      where: { userId: req.user.id }
    });

    const fitnessGoals = await prisma.fitnessGoal.findMany({
      where: { userId: req.user.id }
    });

    const emergencyContacts = await prisma.emergencyContact.findMany({
      where: { userId: req.user.id }
    });

    let notificationPreferences = await prisma.notificationPreference.findUnique({
      where: { userId: req.user.id }
    });

    if (!notificationPreferences) {
      notificationPreferences = await prisma.notificationPreference.create({
        data: {
          userId: req.user.id,
          browserEnabled: true,
          checkinTime: '09:00',
          medicineAlerts: true,
          workoutReminders: true,
          habitReminders: true
        }
      });
    }

    res.json({
      success: true,
      profile,
      healthConditions,
      allergies,
      medications,
      fitnessGoals,
      emergencyContacts,
      notificationPreferences
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch user profile.', error: err.message });
  }
});

// Update profile details
router.put('/', authenticateToken, async (req, res) => {
  try {
    const {
      fullName,
      age,
      gender,
      heightCm,
      weightKg,
      country,
      location,
      activityLevel,
      selectedCategory,
      somatotype,
      emergencyPhone,
      emergencyName,
      emergencyRelation,
      emergencyConsent,
      seniorModeEnabled,
      notifications
    } = req.body;

    const updated = await prisma.userProfile.upsert({
      where: { userId: req.user.id },
      update: {
        fullName: fullName || undefined,
        age: age ? parseInt(age) : undefined,
        gender: gender || undefined,
        heightCm: heightCm ? parseFloat(heightCm) : undefined,
        weightKg: weightKg ? parseFloat(weightKg) : undefined,
        country: country || undefined,
        location: location || undefined,
        activityLevel: activityLevel || undefined,
        selectedCategory: selectedCategory || undefined,
        somatotype: somatotype || undefined,
        emergencyPhone: emergencyPhone !== undefined ? emergencyPhone : undefined,
        emergencyName: emergencyName !== undefined ? emergencyName : undefined,
        emergencyRelation: emergencyRelation !== undefined ? emergencyRelation : undefined,
        emergencyConsent: emergencyConsent !== undefined ? Boolean(emergencyConsent) : undefined,
        seniorModeEnabled: seniorModeEnabled !== undefined ? Boolean(seniorModeEnabled) : undefined
      },
      create: {
        userId: req.user.id,
        fullName: fullName || 'User',
        age: age ? parseInt(age) : null,
        gender,
        heightCm: heightCm ? parseFloat(heightCm) : null,
        weightKg: weightKg ? parseFloat(weightKg) : null,
        country: country || 'India',
        location,
        activityLevel,
        selectedCategory: selectedCategory || 'NORMAL',
        somatotype,
        emergencyPhone,
        emergencyName,
        emergencyRelation,
        emergencyConsent: Boolean(emergencyConsent),
        seniorModeEnabled: Boolean(seniorModeEnabled)
      }
    });

    // Sync notification preferences if provided
    let updatedNotifications = null;
    if (notifications) {
      updatedNotifications = await prisma.notificationPreference.upsert({
        where: { userId: req.user.id },
        update: {
          browserEnabled: notifications.browserEnabled !== undefined ? Boolean(notifications.browserEnabled) : undefined,
          checkinTime: notifications.checkinTime || undefined,
          medicineAlerts: notifications.medicineAlerts !== undefined ? Boolean(notifications.medicineAlerts) : undefined,
          workoutReminders: notifications.workoutReminders !== undefined ? Boolean(notifications.workoutReminders) : undefined,
          habitReminders: notifications.habitReminders !== undefined ? Boolean(notifications.habitReminders) : undefined
        },
        create: {
          userId: req.user.id,
          browserEnabled: notifications.browserEnabled ?? true,
          checkinTime: notifications.checkinTime || '09:00',
          medicineAlerts: notifications.medicineAlerts ?? true,
          workoutReminders: notifications.workoutReminders ?? true,
          habitReminders: notifications.habitReminders ?? true
        }
      });
    }

    // Sync primary emergency contact to avoid duplicates
    if (emergencyName && emergencyPhone && emergencyConsent) {
      const existingPrimary = await prisma.emergencyContact.findFirst({
        where: { userId: req.user.id, isPrimary: true }
      });

      if (existingPrimary) {
        await prisma.emergencyContact.update({
          where: { id: existingPrimary.id },
          data: {
            contactName: emergencyName,
            phoneNumber: emergencyPhone,
            relationship: emergencyRelation || 'Family',
            consentGiven: true
          }
        });
      } else {
        await prisma.emergencyContact.create({
          data: {
            userId: req.user.id,
            contactName: emergencyName,
            phoneNumber: emergencyPhone,
            relationship: emergencyRelation || 'Family',
            isPrimary: true,
            consentGiven: true
          }
        });
      }
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'UPDATE_PROFILE',
        resource: 'user_profiles',
        detailsJson: { fieldsUpdated: Object.keys(req.body) }
      }
    });

    res.json({
      success: true,
      profile: updated,
      notifications: updatedNotifications,
      message: 'Profile updated successfully.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update profile.', error: err.message });
  }
});

// Update notification preferences directly
router.put('/notifications', authenticateToken, async (req, res) => {
  try {
    const { browserEnabled, checkinTime, medicineAlerts, workoutReminders, habitReminders } = req.body;

    const updated = await prisma.notificationPreference.upsert({
      where: { userId: req.user.id },
      update: {
        browserEnabled: browserEnabled !== undefined ? Boolean(browserEnabled) : undefined,
        checkinTime: checkinTime || undefined,
        medicineAlerts: medicineAlerts !== undefined ? Boolean(medicineAlerts) : undefined,
        workoutReminders: workoutReminders !== undefined ? Boolean(workoutReminders) : undefined,
        habitReminders: habitReminders !== undefined ? Boolean(habitReminders) : undefined
      },
      create: {
        userId: req.user.id,
        browserEnabled: browserEnabled ?? true,
        checkinTime: checkinTime || '09:00',
        medicineAlerts: medicineAlerts ?? true,
        workoutReminders: workoutReminders ?? true,
        habitReminders: habitReminders ?? true
      }
    });

    res.json({ success: true, notifications: updated, message: 'Notification preferences updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update notification settings.', error: err.message });
  }
});

// Add Health Condition
router.post('/health-conditions', authenticateToken, async (req, res) => {
  try {
    const { conditionName, severity, notes } = req.body;
    if (!conditionName) {
      return res.status(400).json({ success: false, message: 'Condition name is required.' });
    }

    const condition = await prisma.userHealthCondition.create({
      data: {
        userId: req.user.id,
        conditionName,
        severity,
        notes
      }
    });

    res.status(201).json({ success: true, condition });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to add condition.', error: err.message });
  }
});

// Delete Health Condition
router.delete('/health-conditions/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.userHealthCondition.deleteMany({
      where: { id: req.params.id, userId: req.user.id }
    });
    res.json({ success: true, message: 'Condition removed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to remove condition.', error: err.message });
  }
});

// Add Food Allergy
router.post('/allergies', authenticateToken, async (req, res) => {
  try {
    const { allergen, allergyType, reaction } = req.body;
    if (!allergen) {
      return res.status(400).json({ success: false, message: 'Allergen name is required.' });
    }

    const allergy = await prisma.userAllergy.create({
      data: {
        userId: req.user.id,
        allergen,
        allergyType,
        reaction
      }
    });

    res.status(201).json({ success: true, allergy });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to add allergy.', error: err.message });
  }
});

// Delete Food Allergy
router.delete('/allergies/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.userAllergy.deleteMany({
      where: { id: req.params.id, userId: req.user.id }
    });
    res.json({ success: true, message: 'Allergy removed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to remove allergy.', error: err.message });
  }
});

export default router;
