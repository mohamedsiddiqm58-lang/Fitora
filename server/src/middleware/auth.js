import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import { getActiveUserSubscription } from '../services/subscriptionService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fitora_jwt_secret_dev_key';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        profile: true
      }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists or session expired.' });
    }

    // Retrieve active subscription and resolve expiration
    const { subscription, currentTier } = await getActiveUserSubscription(user.id);

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      category: user.profile?.selectedCategory || null,
      seniorMode: user.profile?.seniorModeEnabled || false,
      activeSubscription: subscription,
      subscriptionTier: currentTier
    };

    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token.', error: err.message });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Administrative privilege required.' });
  }
};

export const requirePlan = (requiredTier) => {
  const tierWeights = {
    BASIC: 1,
    FREEMIUM: 2,
    PREMIUM: 3
  };

  return (req, res, next) => {
    const userTier = req.user?.subscriptionTier || 'BASIC';
    if ((tierWeights[userTier] || 1) >= (tierWeights[requiredTier] || 1)) {
      next();
    } else {
      res.status(403).json({
        success: false,
        requiresUpgrade: true,
        requiredTier,
        currentTier: userTier,
        message: `This feature requires a ${requiredTier} subscription plan. Please upgrade to unlock.`
      });
    }
  };
};
