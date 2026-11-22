import express from 'express';
import prisma from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const todayStr = new Date().toISOString().split('T')[0];

    // User profile with category
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        subscriptions: {
          where: { status: 'ACTIVE' },
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        habitStreak: true,
        wearableConnections: { take: 1, orderBy: { createdAt: 'desc' } }
      }
    });

    const category = user?.profile?.selectedCategory || 'NORMAL';
    const isSenior = category === 'SENIOR' || user?.profile?.seniorModeEnabled;

    // 1. Water Intake for today
    let waterLog = await prisma.waterIntakeLog.findUnique({
      where: { userId_date: { userId, date: todayStr } }
    });
    if (!waterLog) {
      const defaultTarget = isSenior ? 2000 : (category === 'ATHLETE' || category === 'GYM_FREAK' ? 3500 : 2500);
      waterLog = await prisma.waterIntakeLog.create({
        data: {
          userId,
          date: todayStr,
          amountMl: 0,
          targetMl: defaultTarget
        }
      });
    }

    // 2. Habits for today
    let habitLog = await prisma.habitLog.findUnique({
      where: { userId_date: { userId, date: todayStr } }
    });

    if (!habitLog) {
      // Default checklist per category
      const defaultHabits = [
        { id: 'water', label: 'Drink target water intake', completed: false },
        { id: 'workout', label: isSenior ? '15 min gentle walk or stretching' : 'Complete today’s workout session', completed: false },
        { id: 'meals', label: 'Eat nutritious, wholesome meals', completed: false },
        { id: 'sleep', label: 'Target 7-8 hours restful sleep', completed: false }
      ];

      if (isSenior) {
        defaultHabits.push({ id: 'meds', label: 'Take morning & evening prescribed medicines', completed: false });
      }

      habitLog = await prisma.habitLog.create({
        data: {
          userId,
          date: todayStr,
          habitsJson: defaultHabits,
          completionPercentage: 0
        }
      });
    }

    // 3. Medicine Reminders (prominent for seniors, available to all)
    const medicineReminders = await prisma.medicineReminder.findMany({
      where: { userId, isEnabled: true },
      orderBy: { scheduleTime: 'asc' }
    });

    // 4. Recommended Workouts for user's category
    const recommendedWorkouts = await prisma.exerciseLibrary.findMany({
      where: {
        OR: [
          { category: category },
          { category: null },
          isSenior ? { isSeniorFriendly: true } : {}
        ]
      },
      take: 4
    });

    // 5. Recommended Meals for user's category
    const recommendedRecipes = await prisma.recipe.findMany({
      where: {
        OR: [
          { category: category },
          { category: null }
        ]
      },
      take: 3
    });

    // 6. Recent Sleep Log
    const latestSleep = await prisma.sleepLog.findFirst({
      where: { userId },
      orderBy: { date: 'desc' }
    });

    // 7. Recent Completed Workouts count
    const completedWorkoutsCount = await prisma.workoutLog.count({
      where: { userId }
    });

    res.json({
      success: true,
      data: {
        profile: user.profile,
        category,
        isSenior,
        subscriptionTier: user.subscriptions[0]?.planTier || 'BASIC',
        activeSubscription: user.subscriptions[0] || null,
        streak: user.habitStreak || { currentStreak: 0, longestStreak: 0 },
        water: {
          amountMl: waterLog.amountMl,
          targetMl: waterLog.targetMl,
          percentage: Math.min(100, Math.round((waterLog.amountMl / (waterLog.targetMl || 2500)) * 100))
        },
        habits: habitLog,
        medicineReminders,
        recommendedWorkouts,
        recommendedRecipes,
        latestSleep: latestSleep || { durationHours: 7.5, qualityRating: 8 },
        completedWorkoutsCount,
        wearable: user.wearableConnections[0] || null,
        emergencyNumber: '112',
        savedEmergencyContact: user.profile?.emergencyConsent ? {
          name: user.profile?.emergencyName,
          phone: user.profile?.emergencyPhone,
          relation: user.profile?.emergencyRelation
        } : null
      }
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ success: false, message: 'Failed to assemble dashboard data.', error: err.message });
  }
});

export default router;
