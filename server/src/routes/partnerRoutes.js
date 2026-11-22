import express from 'express';
import prisma from '../config/db.js';
import { authenticateToken, requirePlan } from '../middleware/auth.js';

const router = express.Router();

// List partners by type or all verified partners
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;

    const where = { isVerified: true };
    if (type) where.partnerType = type;

    const partners = await prisma.partner.findMany({
      where,
      include: {
        services: true
      },
      orderBy: { rating: 'desc' }
    });

    res.json({
      success: true,
      count: partners.length,
      partners,
      demonstrationNotice: 'Partners displayed are authorized network listings and partner demonstration records.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch partner directory.', error: err.message });
  }
});

// Partner details
router.get('/:id', async (req, res) => {
  try {
    const partner = await prisma.partner.findUnique({
      where: { id: req.params.id },
      include: { services: true }
    });

    if (!partner) {
      return res.status(404).json({ success: false, message: 'Partner not found.' });
    }

    res.json({ success: true, partner });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch partner details.', error: err.message });
  }
});

// Submit partner booking or appointment enquiry (Exclusive to Premium members)
router.post('/book', authenticateToken, requirePlan('PREMIUM'), async (req, res) => {
  try {
    const { partnerId, serviceId, bookingDate, notes } = req.body;

    if (!partnerId || !bookingDate) {
      return res.status(400).json({ success: false, message: 'Partner and preferred booking date are required.' });
    }

    const partner = await prisma.partner.findUnique({ where: { id: partnerId } });
    if (!partner) {
      return res.status(404).json({ success: false, message: 'Partner not found.' });
    }

    const booking = await prisma.partnerBooking.create({
      data: {
        userId: req.user.id,
        partnerId,
        serviceId: serviceId || null,
        bookingDate: new Date(bookingDate),
        status: 'CONFIRMED',
        notes: notes || null
      },
      include: {
        partner: true,
        service: true
      }
    });

    res.status(201).json({
      success: true,
      message: `Your appointment request with ${partner.name} has been confirmed. Confirmation details sent to your registered email.`,
      booking
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to submit booking.', error: err.message });
  }
});

// Get user's active partner bookings
router.get('/user/bookings', authenticateToken, async (req, res) => {
  try {
    const bookings = await prisma.partnerBooking.findMany({
      where: { userId: req.user.id },
      include: {
        partner: true,
        service: true
      },
      orderBy: { bookingDate: 'desc' }
    });

    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch user bookings.', error: err.message });
  }
});

export default router;
