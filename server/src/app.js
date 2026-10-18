import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { connectDb } from './db.js';
import { ensureSeedData } from './bootstrap.js';
import { findUserById, findUserByEmail } from './repositories/users.js';
import eventsRouter from './routes/events.js';
import jobsRouter from './routes/jobs.js';
import communitiesRouter from './routes/communities.js';
import usersRouter from './routes/users.js';
import organizerRouter from './routes/organizer.js';
import notificationsRouter from './routes/notifications.js';
import teamsRouter from './routes/teams.js';
import questsRouter from './routes/quests.js';
import registrationsRouter from './routes/registrations.js';
import certificatesRouter from './routes/certificates.js';
import communicationsRouter from './routes/communications.js';
import checkinRouter from './routes/checkin.js';
import mailerhubRouter from './routes/mailerhub.js';
import uploadRouter from './routes/upload.js';
import paymentRouter from './routes/payment.js';
import { ensureDefaultTemplates } from './repositories/mailerhub.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function isDemoEmail(email) {
  const lower = email.toLowerCase();
  return lower.endsWith('@techastra.local') || lower.endsWith('@devnovate.local');
}

function accessCodeOk(req) {
  if (!config.demoAccessCode) return true;
  if (isDemoEmail(req.query.email || '')) return true;
  return req.query.code === config.demoAccessCode;
}

export function createApp() {
  const app = express();
  app.set('trust proxy', 1);

  app.use(
    cors({
      origin: config.clientUrl,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(cookieParser());

  const sessionOptions = {
    name: 'techastra.sid',
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: config.isProduction,
    },
  };

  if (config.databaseUrl) {
    const PgSession = connectPgSimple(session);
    sessionOptions.store = new PgSession({
      conObject: {
        connectionString: config.databaseUrl,
        ssl: { rejectUnauthorized: false },
      },
      tableName: 'techastra_session',
      createTableIfMissing: true,
    });
  }

  app.use(session(sessionOptions));

  app.use('/uploads', express.static(config.uploadDir));

  app.get('/auth/status', async (req, res) => {
    if (!req.session?.userId) {
      return res.json({ authenticated: false, user: null });
    }
    const user = await findUserById(req.session.userId);
    if (!user) {
      req.session.destroy();
      return res.json({ authenticated: false, user: null });
    }
    res.json({ authenticated: true, user });
  });

  app.get('/auth/google', async (req, res) => {
    const email = (req.query.email || 'student@techastra.local').toString();
    if (!accessCodeOk(req)) {
      return res.redirect(`${config.clientUrl}/?login=code`);
    }
    const user = await findUserByEmail(email);
    if (!user) {
      return res.redirect(`${config.clientUrl}/?login=failed`);
    }
    req.session.userId = user._id;
    req.session.role = user.role;
    const redirect = req.query.redirect || config.clientUrl;
    res.redirect(redirect);
  });

  app.get('/auth/logout', (req, res) => {
    req.session.destroy(() => {
      res.redirect(config.clientUrl);
    });
  });

  app.use('/api/v1/events', eventsRouter);
  app.use('/api/v1/jobs', jobsRouter);
  app.use('/api/v1/communities', communitiesRouter);
  app.use('/api/v1/users', usersRouter);
  app.use('/api/v1/organizer', organizerRouter);
  app.use('/api/v1/notifications', notificationsRouter);
  app.use('/api/v1/teams', teamsRouter);
  app.use('/api/v1/quests', questsRouter);
  app.use('/api/v1/registrations', registrationsRouter);
  app.use('/api/v1/certificates', certificatesRouter);
  app.use('/api/v1/communications', communicationsRouter);
  app.use('/api/v1/checkin', checkinRouter);
  app.use('/api/v1/mailerhub', mailerhubRouter);
  app.use('/api/v1/upload', uploadRouter);
  app.use('/api/v1/payment', paymentRouter);

  app.get('/health', (_req, res) => res.json({ ok: true, database: 'supabase' }));

  return app;
}

let initPromise;

export async function initApp() {
  if (!initPromise) {
    initPromise = (async () => {
      await connectDb();
      await ensureDefaultTemplates();
      if (!process.env.VERCEL) {
        await ensureSeedData();
      } else {
        await ensureSeedData().catch(() => {});
      }
      return createApp();
    })();
  }
  return initPromise;
}
