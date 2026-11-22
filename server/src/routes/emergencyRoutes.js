import express from 'express';
import prisma from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get emergency numbers & saved emergency contacts
router.get('/', authenticateToken, async (req, res) => {
  try {
    const contacts = await prisma.emergencyContact.findMany({
      where: { userId: req.user.id }
    });

    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: req.user.id }
    });

    res.json({
      success: true,
      emergencyServices: {
        nationalEmergency: '112',
        medicalAmbulance: '108',
        seniorCitizenHelpline: '14567',
        disclaimer: 'Tapping an emergency button launches your device’s native calling screen. Fitora does not autonomously route audio to emergency services.'
      },
      savedContacts: contacts,
      primaryContact: userProfile?.emergencyConsent ? {
        name: userProfile.emergencyName,
        phone: userProfile.emergencyPhone,
        relation: userProfile.emergencyRelation,
        consentGiven: true
      } : null
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve emergency data.', error: err.message });
  }
});

// Add an emergency contact with user consent
router.post('/contacts', authenticateToken, async (req, res) => {
  try {
    const { contactName, relationship, phoneNumber, isPrimary = false, consentGiven = true } = req.body;

    if (!contactName || !phoneNumber) {
      return res.status(400).json({ success: false, message: 'Contact name and phone number are required.' });
    }

    if (!consentGiven) {
      return res.status(400).json({ success: false, message: 'Explicit consent is required to store emergency contact details.' });
    }

    // Save consent
    await prisma.consentRecord.create({
      data: {
        userId: req.user.id,
        consentType: 'EMERGENCY_CONTACT_STORAGE',
        granted: true,
        ipAddress: req.ip
      }
    });

    const contact = await prisma.emergencyContact.create({
      data: {
        userId: req.user.id,
        contactName,
        relationship: relationship || 'Family',
        phoneNumber,
        isPrimary: Boolean(isPrimary),
        consentGiven: true
      }
    });

    // Update profile emergency contact if primary
    if (isPrimary) {
      await prisma.userProfile.update({
        where: { userId: req.user.id },
        data: {
          emergencyName: contactName,
          emergencyPhone: phoneNumber,
          emergencyRelation: relationship || 'Family',
          emergencyConsent: true
        }
      });
    }

    res.status(201).json({ success: true, contact, message: 'Emergency contact added.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to add emergency contact.', error: err.message });
  }
});

// Delete emergency contact
router.delete('/contacts/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.emergencyContact.deleteMany({
      where: { id: req.params.id, userId: req.user.id }
    });

    res.json({ success: true, message: 'Emergency contact removed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete contact.', error: err.message });
  }
});

// Log emergency shortcut tap for safety audit trail
router.post('/log-shortcut-tap', authenticateToken, async (req, res) => {
  try {
    const { contactType, targetNumber } = req.body;

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'EMERGENCY_BUTTON_TAPPED',
        resource: 'emergency_assistance',
        detailsJson: { contactType, targetNumber, timestamp: new Date() }
      }
    });

    res.json({
      success: true,
      message: 'Emergency button interaction logged for security. Native dialer opened.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Audit logging failed.', error: err.message });
  }
});

export default router;
