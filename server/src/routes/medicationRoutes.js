import express from 'express';
import prisma from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all medicine reminders for current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const reminders = await prisma.medicineReminder.findMany({
      where: { userId: req.user.id },
      orderBy: { scheduleTime: 'asc' }
    });

    res.json({
      success: true,
      reminders,
      notice: 'Reminders reflect information entered solely by you. Never alter your doctor’s prescribed dosage without clinical consultation.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve medicine reminders.', error: err.message });
  }
});

// Create new medicine reminder
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { medicineName, dosage, scheduleTime, daysOfWeek = 'Everyday', instructions } = req.body;

    if (!medicineName || !dosage || !scheduleTime) {
      return res.status(400).json({
        success: false,
        message: 'Medicine name, prescribed dosage, and reminder time are required.'
      });
    }

    const reminder = await prisma.medicineReminder.create({
      data: {
        userId: req.user.id,
        medicineName,
        dosage,
        scheduleTime,
        daysOfWeek,
        instructions: instructions || null,
        isEnabled: true,
        acknowledgedToday: false
      }
    });

    res.status(201).json({
      success: true,
      reminder,
      message: 'Medicine reminder scheduled successfully.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create medicine reminder.', error: err.message });
  }
});

// Toggle enabled status
router.patch('/:id/toggle', authenticateToken, async (req, res) => {
  try {
    const reminder = await prisma.medicineReminder.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Medicine reminder not found.' });
    }

    const updated = await prisma.medicineReminder.update({
      where: { id: reminder.id },
      data: { isEnabled: !reminder.isEnabled }
    });

    res.json({ success: true, reminder: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update reminder status.', error: err.message });
  }
});

// Mark as acknowledged / taken today
router.patch('/:id/acknowledge', authenticateToken, async (req, res) => {
  try {
    const reminder = await prisma.medicineReminder.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Medicine reminder not found.' });
    }

    const updated = await prisma.medicineReminder.update({
      where: { id: reminder.id },
      data: {
        acknowledgedToday: true,
        lastTakenAt: new Date()
      }
    });

    res.json({
      success: true,
      reminder: updated,
      message: `Marked ${reminder.medicineName} as taken.`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to acknowledge medicine reminder.', error: err.message });
  }
});

// Delete reminder
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.medicineReminder.deleteMany({
      where: { id: req.params.id, userId: req.user.id }
    });

    res.json({ success: true, message: 'Medicine reminder removed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete reminder.', error: err.message });
  }
});

export default router;
