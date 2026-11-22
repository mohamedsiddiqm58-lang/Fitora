import express from 'express';
import prisma from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// List exercises with category, difficulty, or senior-friendly filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { category, difficulty, seniorFriendly } = req.query;

    const where = {};
    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;
    if (seniorFriendly === 'true') where.isSeniorFriendly = true;

    const exercises = await prisma.exerciseLibrary.findMany({
      where,
      orderBy: { createdAt: 'asc' }
    });

    res.json({ success: true, count: exercises.length, exercises });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch exercise library.', error: err.message });
  }
});

// Get single exercise details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const exercise = await prisma.exerciseLibrary.findUnique({
      where: { id: req.params.id }
    });

    if (!exercise) {
      return res.status(404).json({ success: false, message: 'Exercise not found.' });
    }

    res.json({ success: true, exercise });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch exercise.', error: err.message });
  }
});

// Log completed workout session
router.post('/log', authenticateToken, async (req, res) => {
  try {
    const { exerciseId, workoutTitle, durationMinutes, caloriesBurned, feedback } = req.body;

    if (!workoutTitle || !durationMinutes) {
      return res.status(400).json({ success: false, message: 'Workout title and duration are required.' });
    }

    const log = await prisma.workoutLog.create({
      data: {
        userId: req.user.id,
        exerciseId: exerciseId || null,
        workoutTitle,
        durationMinutes: parseInt(durationMinutes),
        caloriesBurned: parseFloat(caloriesBurned) || 0,
        feedback: feedback || null
      }
    });

    // Automatically check off the 'workout' habit for today if present
    const todayStr = new Date().toISOString().split('T')[0];
    const habitLog = await prisma.habitLog.findUnique({
      where: { userId_date: { userId: req.user.id, date: todayStr } }
    });

    if (habitLog && Array.isArray(habitLog.habitsJson)) {
      const updatedHabits = habitLog.habitsJson.map(h => {
        if (h.id === 'workout') return { ...h, completed: true };
        return h;
      });
      const completedCount = updatedHabits.filter(h => h.completed).length;
      const pct = Math.round((completedCount / updatedHabits.length) * 100);

      await prisma.habitLog.update({
        where: { id: habitLog.id },
        data: { habitsJson: updatedHabits, completionPercentage: pct }
      });
    }

    res.status(201).json({ success: true, message: 'Workout session logged successfully!', log });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to log workout session.', error: err.message });
  }
});

// Get user workout history
router.get('/history/all', authenticateToken, async (req, res) => {
  try {
    const history = await prisma.workoutLog.findMany({
      where: { userId: req.user.id },
      orderBy: { completedAt: 'desc' },
      take: 20,
      include: { exercise: true }
    });

    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve workout history.', error: err.message });
  }
});

export default router;
