import express from 'express';
import prisma from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const logs = await prisma.sleepLog.findMany({
      where: { userId: req.user.id },
      orderBy: { date: 'desc' },
      take: 7
    });

    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch sleep logs.', error: err.message });
  }
});

router.post('/log', authenticateToken, async (req, res) => {
  try {
    const { date, durationHours, qualityRating = 8, notes } = req.body;
    const userId = req.user.id;
    const sleepDate = date || new Date().toISOString().split('T')[0];

    const log = await prisma.sleepLog.upsert({
      where: { userId_date: { userId, date: sleepDate } },
      update: {
        durationHours: parseFloat(durationHours),
        qualityRating: parseInt(qualityRating),
        notes
      },
      create: {
        userId,
        date: sleepDate,
        durationHours: parseFloat(durationHours),
        qualityRating: parseInt(qualityRating),
        notes
      }
    });

    res.status(201).json({ success: true, log, message: 'Sleep record logged.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to log sleep.', error: err.message });
  }
});

export default router;
