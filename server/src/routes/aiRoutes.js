import express from 'express';
import prisma from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { AICompanionService } from '../services/aiCompanionService.js';

const router = express.Router();

// Get recent conversation history
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    let conversation = await prisma.aIConversation.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
          take: 50
        }
      }
    });

    if (!conversation) {
      conversation = await prisma.aIConversation.create({
        data: {
          userId,
          category: req.user.category || 'NORMAL',
          title: 'Daily Health Chat',
          messages: {
            create: {
              senderRole: 'assistant',
              messageContent: `Hello! I'm your Fitora AI Companion. I'm here to support your fitness, hydration, and daily wellness habits. How are you feeling today?`
            }
          }
        },
        include: { messages: true }
      });
    }

    res.json({ success: true, conversation });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve AI conversations.', error: err.message });
  }
});

// Send message to AI companion
router.post('/message', authenticateToken, async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    const userId = req.user.id;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message cannot be empty.' });
    }

    // Check plan tier: Basic tier gets 3 questions, Freemium & Premium get unlimited
    const tier = req.user.subscriptionTier || 'BASIC';
    if (tier === 'BASIC') {
      const messageCount = await prisma.aIMessage.count({
        where: {
          conversation: { userId },
          senderRole: 'user'
        }
      });

      if (messageCount >= 5) {
        return res.status(403).json({
          success: false,
          requiresUpgrade: true,
          message: 'You have used your 5 free trial AI companion questions. Please upgrade to Freemium (starting at ₹99/mo) for unlimited 24/7 AI coaching and personalized daily check-ins!'
        });
      }
    }

    // Find or create conversation
    let conversation;
    if (conversationId) {
      conversation = await prisma.aIConversation.findFirst({
        where: { id: conversationId, userId }
      });
    }

    if (!conversation) {
      conversation = await prisma.aIConversation.create({
        data: {
          userId,
          category: req.user.category || 'NORMAL',
          title: 'Fitora Health Chat'
        }
      });
    }

    // Save user message
    await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        senderRole: 'user',
        messageContent: message.trim()
      }
    });

    // Fetch user context for coaching
    const userProfile = await prisma.userProfile.findUnique({ where: { userId } });
    const todayStr = new Date().toISOString().split('T')[0];
    const waterLog = await prisma.waterIntakeLog.findUnique({ where: { userId_date: { userId, date: todayStr } } });
    const streak = await prisma.habitStreak.findUnique({ where: { userId } });
    const workoutCount = await prisma.workoutLog.count({ where: { userId } });

    // Generate response
    const replyResult = await AICompanionService.generateReply({
      userPrompt: message,
      userProfile,
      recentLogs: {
        waterToday: waterLog?.amountMl || 0,
        streak: streak?.currentStreak || 0,
        completedWorkoutsCount: workoutCount
      }
    });

    // Save AI response
    const aiMessage = await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        senderRole: 'assistant',
        messageContent: replyResult.reply
      }
    });

    // Touch conversation updated at
    await prisma.aIConversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() }
    });

    res.json({
      success: true,
      userMessage: message,
      aiMessage,
      isEmergencyWarning: replyResult.isEmergencyWarning || false
    });
  } catch (err) {
    console.error('AI chat error:', err);
    res.status(500).json({ success: false, message: 'Failed to process AI companion message.', error: err.message });
  }
});

// Trigger scheduled check-in message
router.get('/check-in', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await prisma.userProfile.findUnique({ where: { userId } });
    const category = profile?.selectedCategory || 'NORMAL';
    const name = profile?.fullName?.split(' ')[0] || 'Friend';

    let prompt = '';
    if (category === 'ATHLETE') {
      prompt = `⚡ Scheduled Check-In: Hey ${name}, have you finished your planned training block today? Make sure to rehydrate with electrolytes and log your recovery!`;
    } else if (category === 'SENIOR') {
      prompt = `🌸 Gentle Check-In: Namaste ${name} ji! Have you had your afternoon glass of water and taken your scheduled medicines today?`;
    } else if (category === 'GYM_FREAK') {
      prompt = `💪 Gym Check-In: ${name}, did you hit your protein goals and workout volume today? Remember: muscles grow during deep sleep!`;
    } else {
      prompt = `🌿 Daily Habit Check-In: Hi ${name}! Did you manage to take a short brisk walk and drink sufficient water today?`;
    }

    res.json({ success: true, checkInMessage: prompt });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to generate check-in.', error: err.message });
  }
});

export default router;
