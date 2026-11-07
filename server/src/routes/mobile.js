import { Router } from 'express';
import crypto from 'crypto';
import { query } from '../db.js';
import { findUserById } from '../repositories/users.js';

const router = Router();
// ponytail: in-memory checkin cache for ultra-fast venue scans; upgrades to Redis BullMQ
const mobileCheckins = new Map();

// Built-in fallback events when remote PostgreSQL is unreachable/offline
const FALLBACK_EVENTS = [
  {
    id: 'e9821a7b-3214-4a21-99cd-bcde12340001',
    slug: 'techastra-national-hack-2026',
    name: 'Techastra National Hackathon 2026',
    coverUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80',
    category: 'hackathon',
    mode: 'hybrid',
    venue: 'Bangalore Tech Center & Hybrid',
    startDate: '2026-11-20T09:00:00Z',
    endDate: '2026-11-22T18:00:00Z',
    registrationsCount: 480,
    prizePool: '₹2,50,000',
    isRegistered: false,
    description: 'National developer challenge across AI, Web3, and Fullstack systems.',
  },
  {
    id: 'e9821a7b-3214-4a21-99cd-bcde12340002',
    slug: 'agentic-ai-builder-summit',
    name: 'Agentic AI & ADK Builder Summit',
    coverUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop&q=80',
    category: 'workshop',
    mode: 'virtual',
    venue: 'Virtual / Techastra Live',
    startDate: '2026-11-28T14:00:00Z',
    endDate: '2026-11-28T18:00:00Z',
    registrationsCount: 310,
    prizePool: 'Swag & Micro-Grants',
    isRegistered: false,
    description: 'Hands-on workshop on Agent Development Kit (ADK) and Model Context Protocol.',
  }
];

const FALLBACK_QUESTS = [
  {
    id: 'q-1',
    title: 'Build an MCP Server for Techastra',
    description: 'Connect Techastra hackathon registrations with LLM tools via FastMCP.',
    rewardXp: 100,
    featured: true,
    doc: { difficulty: 'intermediate' }
  },
  {
    id: 'q-2',
    title: 'Solve Accessibility & Dark Mode Contrast',
    description: 'Audit WCAG 2.1 AA compliance across mobile pass and event cards.',
    rewardXp: 50,
    featured: false,
    doc: { difficulty: 'beginner' }
  }
];

/**
 * 1. POST /api/v1/mobile/bootstrap
 */
router.post('/bootstrap', async (req, res) => {
  const { platform = 'android', appVersion = '1.0.0' } = req.body || {};
  let user = null;
  let unreadNotifications = 0;
  let upcomingRegistrationsCount = 0;

  try {
    if (req.session?.userId) {
      user = await findUserById(req.session.userId);
      if (user) {
        const notifRes = await query(
          'SELECT COUNT(*) FROM techastra_notifications WHERE user_id = $1 AND read = false',
          [user._id || user.id],
        );
        unreadNotifications = parseInt(notifRes.rows[0]?.count || '0', 10);

        const regRes = await query(
          'SELECT COUNT(*) FROM techastra_registrations WHERE user_id = $1',
          [user._id || user.id],
        );
        upcomingRegistrationsCount = parseInt(regRes.rows[0]?.count || '0', 10);
      }
    }
  } catch (_dbErr) {
    // Graceful offline fallback
  }

  res.json({
    success: true,
    minSupportedVersion: '1.0.0',
    currentVersion: appVersion,
    maintenanceMode: false,
    platform,
    user: user
      ? {
          id: user._id || user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          college: user.college,
          xp: user.xp || 0,
          unreadNotifications,
        }
      : null,
    upcomingRegistrationsCount,
  });
});

/**
 * 2. GET /api/v1/mobile/feed
 */
router.get('/feed', async (req, res) => {
  const { limit = 15 } = req.query;
  const currentUserId = req.session?.userId;

  try {
    const { rows } = await query(
      `SELECT id, hackathon, event_name, doc, number_of_registrations, created_at
       FROM techastra_events
       WHERE approval_status = 'approved' AND live = true
       ORDER BY created_at DESC
       LIMIT $1`,
      [Math.min(parseInt(limit, 10) || 15, 50)]
    );

    let userRegistrations = new Set();
    if (currentUserId) {
      const regRes = await query(
        'SELECT event_id FROM techastra_registrations WHERE user_id = $1',
        [currentUserId]
      );
      userRegistrations = new Set(regRes.rows.map((r) => r.event_id));
    }

    const items = rows.map((r) => {
      const doc = r.doc || {};
      return {
        id: r.id,
        slug: r.hackathon,
        name: r.event_name || doc.name || r.hackathon,
        coverUrl: doc.coverImage || doc.banner || FALLBACK_EVENTS[0].coverUrl,
        category: doc.category || 'hackathon',
        mode: doc.mode || 'hybrid',
        venue: doc.venue || doc.location || 'Bangalore / Virtual',
        startDate: doc.startDate || r.created_at,
        endDate: doc.endDate || null,
        registrationsCount: r.number_of_registrations || 0,
        prizePool: doc.prizePool || '₹1,00,000',
        isRegistered: userRegistrations.has(r.id),
        description: doc.description || doc.about || '',
      };
    });

    res.json({
      success: true,
      featured: items.slice(0, 3),
      items,
      total: items.length,
    });
  } catch (_dbErr) {
    // Fallback when remote DB is paused or unreachable
    res.json({
      success: true,
      featured: FALLBACK_EVENTS,
      items: FALLBACK_EVENTS,
      total: FALLBACK_EVENTS.length,
      offlineFallback: true
    });
  }
});

/**
 * 3. GET /api/v1/mobile/tickets/:registrationId
 */
router.get('/tickets/:registrationId', async (req, res) => {
  const { registrationId } = req.params;

  try {
    const { rows } = await query(
      `SELECT r.*, u.name as user_name, u.email as user_email, e.event_name, e.hackathon, e.doc
       FROM techastra_registrations r
       JOIN techastra_users u ON u.id = r.user_id
       JOIN techastra_events e ON e.id = r.event_id
       WHERE r.id = $1`,
      [registrationId]
    );

    if (!rows[0]) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const reg = rows[0];
    const timestamp = Math.floor(Date.now() / 1000);
    const secretKey = process.env.SESSION_SECRET || 'techastra_secure_mobile_secret';
    const rawPayload = `TA:${reg.id}:${reg.event_id}:${timestamp}`;
    const signature = crypto.createHmac('sha256', secretKey).update(rawPayload).digest('hex').slice(0, 16);
    const qrPayload = `${rawPayload}:${signature}`;
    const isCheckedIn = mobileCheckins.has(reg.id);

    res.json({
      success: true,
      ticket: {
        registrationId: reg.id,
        eventId: reg.event_id,
        eventSlug: reg.hackathon,
        eventName: reg.event_name || reg.doc?.name,
        venue: reg.doc?.venue || 'Bangalore Tech Center / Hybrid',
        attendeeName: reg.user_name,
        attendeeEmail: reg.user_email,
        status: reg.status,
        checkedIn: isCheckedIn,
        checkedInAt: mobileCheckins.get(reg.id) || null,
        qrPayload,
        signature,
        timestamp,
      },
    });
  } catch (_dbErr) {
    // If DB is offline, return 404 with structured JSON
    return res.status(404).json({ success: false, message: 'Ticket not found' });
  }
});

/**
 * 4. POST /api/v1/mobile/organizer/checkin
 */
router.post('/organizer/checkin', async (req, res) => {
  const { scans } = req.body || {};
  if (!Array.isArray(scans) || scans.length === 0) {
    return res.status(400).json({ success: false, message: 'scans array required' });
  }

  const results = [];
  const now = new Date().toISOString();

  for (const scan of scans) {
    const payload = scan.qrPayload || scan.ticketId;
    if (!payload) continue;

    const parts = payload.split(':');
    const regId = parts[1] || payload;

    if (mobileCheckins.has(regId)) {
      results.push({
        registrationId: regId,
        status: 'duplicate',
        message: 'Already checked in',
        firstCheckedInAt: mobileCheckins.get(regId),
      });
      continue;
    }

    mobileCheckins.set(regId, now);

    results.push({
      registrationId: regId,
      status: 'approved',
      checkedInAt: now,
      message: 'Check-in confirmed',
    });
  }

  res.json({
    success: true,
    processedCount: results.length,
    results,
  });
});

/**
 * 5. GET /api/v1/mobile/quests
 */
router.get('/quests', async (_req, res) => {
  try {
    const { rows } = await query(
      'SELECT * FROM techastra_quests WHERE status = $1 ORDER BY created_at DESC LIMIT 20',
      ['active']
    );

    res.json({
      success: true,
      quests: rows.map((q) => ({
        id: q.id,
        title: q.title,
        description: q.description,
        rewardXp: q.reward_xp,
        featured: q.featured,
        doc: q.doc || {},
      })),
    });
  } catch (_dbErr) {
    // Resilient fallback
    res.json({
      success: true,
      quests: FALLBACK_QUESTS,
      offlineFallback: true
    });
  }
});

export default router;