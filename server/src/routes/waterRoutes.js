import express from 'express';
import prisma from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get today's water intake
router.get('/today', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const todayStr = new Date().toISOString().split('T')[0];

    let log = await prisma.waterIntakeLog.findUnique({
      where: { userId_date: { userId, date: todayStr } }
    });

    if (!log) {
      log = await prisma.waterIntakeLog.create({
        data: { userId, date: todayStr, amountMl: 0, targetMl: 2500 }
      });
    }

    res.json({ success: true, water: log });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch water intake.', error: err.message });
  }
});

// Add water intake (e.g. +250ml glass, +500ml bottle)
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { amountMl = 250 } = req.body;
    const userId = req.user.id;
    const todayStr = new Date().toISOString().split('T')[0];

    let log = await prisma.waterIntakeLog.findUnique({
      where: { userId_date: { userId, date: todayStr } }
    });

    if (!log) {
      log = await prisma.waterIntakeLog.create({
        data: { userId, date: todayStr, amountMl: parseInt(amountMl), targetMl: 2500 }
      });
    } else {
      log = await prisma.waterIntakeLog.update({
        where: { id: log.id },
        data: { amountMl: log.amountMl + parseInt(amountMl) }
      });
    }

    // Auto-complete water habit if goal met
    if (log.amountMl >= log.targetMl) {
      const habitLog = await prisma.habitLog.findUnique({
        where: { userId_date: { userId, date: todayStr } }
      });
      if (habitLog && Array.isArray(habitLog.habitsJson)) {
        const updatedHabits = habitLog.habitsJson.map(h => h.id === 'water' ? { ...h, completed: true } : h);
        const comp = Math.round((updatedHabits.filter(h => h.completed).length / updatedHabits.length) * 100);
        await prisma.habitLog.update({
          where: { id: habitLog.id },
          data: { habitsJson: updatedHabits, completionPercentage: comp }
        });
      }
    }

    res.json({ success: true, water: log, message: `Added ${amountMl}ml of water.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update water intake.', error: err.message });
  }
});

export default router;
