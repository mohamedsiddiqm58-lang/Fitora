import express from 'express';
import prisma from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get today's habit checklist, streak, and weekly history
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const todayStr = new Date().toISOString().split('T')[0];

    let habitLog = await prisma.habitLog.findUnique({
      where: { userId_date: { userId, date: todayStr } }
    });

    if (!habitLog) {
      const isSenior = req.user.category === 'SENIOR' || req.user.seniorMode;
      const initialHabits = [
        { id: 'water', label: 'Hit daily water hydration target', completed: false },
        { id: 'workout', label: isSenior ? '15 min gentle walk or stretching' : 'Complete today’s workout session', completed: false },
        { id: 'healthy_meals', label: 'Eat balanced, whole food meals', completed: false },
        { id: 'no_junk', label: 'Avoided ultra-processed snacks & sugary sodas', completed: false },
        { id: 'sleep', label: 'Target 7-8 hours restful sleep', completed: false }
      ];

      if (isSenior) {
        initialHabits.push({ id: 'meds', label: 'Took all scheduled medicines on time', completed: false });
      }

      habitLog = await prisma.habitLog.create({
        data: {
          userId,
          date: todayStr,
          habitsJson: initialHabits,
          completionPercentage: 0
        }
      });
    }

    let streak = await prisma.habitStreak.findUnique({
      where: { userId }
    });

    if (!streak) {
      streak = await prisma.habitStreak.create({
        data: {
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastCompletedDate: todayStr
        }
      });
    }

    // Weekly history (last 7 days)
    const recentLogs = await prisma.habitLog.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 7
    });

    res.json({
      success: true,
      today: habitLog,
      streak,
      weeklyHistory: recentLogs.reverse()
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch habits.', error: err.message });
  }
});

// Toggle habit item completion
router.post('/toggle', authenticateToken, async (req, res) => {
  try {
    const { habitId } = req.body;
    const userId = req.user.id;
    const todayStr = new Date().toISOString().split('T')[0];

    const habitLog = await prisma.habitLog.findUnique({
      where: { userId_date: { userId, date: todayStr } }
    });

    if (!habitLog) {
      return res.status(404).json({ success: false, message: 'Habit record for today not found.' });
    }

    const currentHabits = Array.isArray(habitLog.habitsJson) ? habitLog.habitsJson : [];
    const updatedHabits = currentHabits.map((item) => {
      if (item.id === habitId) {
        return { ...item, completed: !item.completed };
      }
      return item;
    });

    const completedCount = updatedHabits.filter((h) => h.completed).length;
    const completionPercentage = updatedHabits.length > 0 ? Math.round((completedCount / updatedHabits.length) * 100) : 0;

    const updated = await prisma.habitLog.update({
      where: { id: habitLog.id },
      data: {
        habitsJson: updatedHabits,
        completionPercentage
      }
    });

    // Update streak if user achieved >= 60% completion today and hasn't counted today yet
    let streak = await prisma.habitStreak.findUnique({ where: { userId } });
    if (completionPercentage >= 60 && streak) {
      if (streak.lastCompletedDate !== todayStr) {
        const newCurrent = streak.currentStreak + 1;
        const newLongest = Math.max(newCurrent, streak.longestStreak);
        streak = await prisma.habitStreak.update({
          where: { userId },
          data: {
            currentStreak: newCurrent,
            longestStreak: newLongest,
            lastCompletedDate: todayStr
          }
        });
      }
    }

    res.json({
      success: true,
      today: updated,
      streak,
      message: 'Habit updated.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update habit.', error: err.message });
  }
});

export default router;
