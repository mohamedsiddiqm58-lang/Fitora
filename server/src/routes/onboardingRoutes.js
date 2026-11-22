import express from 'express';
import prisma from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get existing onboarding responses
router.get('/', authenticateToken, async (req, res) => {
  try {
    const response = await prisma.onboardingResponse.findFirst({
      where: { userId: req.user.id },
      orderBy: { completedAt: 'desc' }
    });

    res.json({ success: true, onboarding: response });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve onboarding data.', error: err.message });
  }
});

// Submit onboarding responses for selected category
router.post('/submit', authenticateToken, async (req, res) => {
  try {
    const { category, answers } = req.body;

    if (!category || !answers) {
      return res.status(400).json({ success: false, message: 'Category and answers are required.' });
    }

    // Save onboarding response record
    const onboarding = await prisma.onboardingResponse.create({
      data: {
        userId: req.user.id,
        category,
        responsesJson: answers
      }
    });

    // Update User Profile with category and relevant fields
    const profileData = {
      selectedCategory: category,
      seniorModeEnabled: category === 'SENIOR'
    };

    if (answers.activityLevel) profileData.activityLevel = answers.activityLevel;
    if (answers.somatotype) profileData.somatotype = answers.somatotype;
    if (answers.heightCm) profileData.heightCm = parseFloat(answers.heightCm);
    if (answers.weightKg) profileData.weightKg = parseFloat(answers.weightKg);
    if (answers.emergencyPhone) profileData.emergencyPhone = answers.emergencyPhone;
    if (answers.emergencyName) profileData.emergencyName = answers.emergencyName;
    if (answers.emergencyConsent !== undefined) profileData.emergencyConsent = Boolean(answers.emergencyConsent);

    await prisma.userProfile.update({
      where: { userId: req.user.id },
      data: profileData
    });

    // If health conditions or allergies were reported, add them
    if (answers.healthConditions && Array.isArray(answers.healthConditions)) {
      for (const cond of answers.healthConditions) {
        if (cond && typeof cond === 'string') {
          await prisma.userHealthCondition.create({
            data: {
              userId: req.user.id,
              conditionName: cond,
              notes: 'Reported during onboarding questionnaire'
            }
          });
        }
      }
    }

    // Save consent record
    await prisma.consentRecord.create({
      data: {
        userId: req.user.id,
        consentType: 'ONBOARDING_HEALTH_DATA_PROCESSING',
        granted: true,
        ipAddress: req.ip
      }
    });

    res.status(201).json({
      success: true,
      message: 'Onboarding completed successfully!',
      onboarding,
      category
    });
  } catch (err) {
    console.error('Onboarding submission error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit onboarding answers.', error: err.message });
  }
});

export default router;
