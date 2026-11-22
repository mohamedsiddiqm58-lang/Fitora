import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { getActiveUserSubscription } from '../services/subscriptionService.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fitora_jwt_secret_dev_key';

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, category = 'NORMAL', seniorMode = false } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ success: false, message: 'Email, password, and full name are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        role: 'USER',
        profile: {
          create: {
            fullName,
            selectedCategory: category,
            seniorModeEnabled: category === 'SENIOR' || seniorMode
          }
        },
        notificationPreferences: {
          create: {
            browserEnabled: true,
            medicineAlerts: true,
            workoutReminders: true,
            habitReminders: true
          }
        },
        habitStreak: {
          create: {
            currentStreak: 1,
            longestStreak: 1,
            lastCompletedDate: new Date().toISOString().split('T')[0]
          }
        }
      },
      include: {
        profile: true
      }
    });

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        subscriptionTier: 'BASIC'
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Registration failed.', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        profile: true,
        subscriptions: {
          where: { status: 'ACTIVE' },
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const { subscription, currentTier } = await getActiveUserSubscription(user.id);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        subscriptionTier: currentTier,
        activeSubscription: subscription
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Login failed.', error: err.message });
  }
});

// Get Current User Profile & Entitlements
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        profile: true,
        emergencyContacts: true,
        notificationPreferences: true
      }
    });

    const { subscription, currentTier } = await getActiveUserSubscription(user.id);

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        subscriptionTier: currentTier,
        activeSubscription: subscription,
        emergencyContacts: user.emergencyContacts,
        notificationPreferences: user.notificationPreferences
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve user profile.', error: err.message });
  }
});

export default router;
