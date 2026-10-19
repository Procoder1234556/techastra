CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS techastra_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'student',
  college TEXT,
  skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  xp INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS techastra_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hackathon TEXT NOT NULL UNIQUE,
  event_name TEXT NOT NULL,
  approval_status TEXT NOT NULL DEFAULT 'approved',
  live BOOLEAN NOT NULL DEFAULT true,
  number_of_registrations INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES techastra_users(id) ON DELETE SET NULL,
  organizers UUID[] NOT NULL DEFAULT '{}',
  doc JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS techastra_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  work_mode TEXT DEFAULT 'remote',
  type TEXT DEFAULT 'full-time',
  description TEXT,
  skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  apply_url TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS techastra_communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'general',
  member_count INTEGER NOT NULL DEFAULT 0,
  cover_image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS techastra_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES techastra_users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES techastra_events(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'approved',
  answers JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, event_id)
);

CREATE INDEX IF NOT EXISTS idx_techastra_events_approval ON techastra_events(approval_status);
CREATE INDEX IF NOT EXISTS idx_techastra_events_live ON techastra_events(live);
CREATE INDEX IF NOT EXISTS idx_techastra_registrations_user ON techastra_registrations(user_id);

CREATE TABLE IF NOT EXISTS techastra_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES techastra_events(id) ON DELETE CASCADE,
  team_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  leader_id UUID NOT NULL REFERENCES techastra_users(id) ON DELETE CASCADE,
  member_ids UUID[] NOT NULL DEFAULT '{}',
  submission_url TEXT,
  project_score INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS techastra_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  reward_xp INTEGER NOT NULL DEFAULT 50,
  status TEXT NOT NULL DEFAULT 'active',
  featured BOOLEAN NOT NULL DEFAULT false,
  doc JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS techastra_quest_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID NOT NULL REFERENCES techastra_quests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES techastra_users(id) ON DELETE CASCADE,
  submission_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  upvotes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (quest_id, user_id)
);

CREATE TABLE IF NOT EXISTS techastra_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES techastra_users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS techastra_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES techastra_users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES techastra_events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, event_id)
);

CREATE TABLE IF NOT EXISTS techastra_job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES techastra_jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES techastra_users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'submitted',
  resume_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (job_id, user_id)
);

CREATE TABLE IF NOT EXISTS techastra_mailer_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  created_by UUID REFERENCES techastra_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS techastra_mailer_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES techastra_events(id) ON DELETE SET NULL,
  template_slug TEXT,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  filter_status TEXT NOT NULL DEFAULT 'all',
  status TEXT NOT NULL DEFAULT 'draft',
  created_by UUID REFERENCES techastra_users(id) ON DELETE SET NULL,
  sent_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS techastra_mailer_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES techastra_mailer_campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES techastra_users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS techastra_mailer_gmail_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  app_password TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'notifications',
  daily_limit INTEGER NOT NULL DEFAULT 430,
  warmup_enabled BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sent_today INTEGER NOT NULL DEFAULT 0,
  sent_today_reset DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES techastra_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS techastra_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES techastra_users(id) ON DELETE SET NULL,
  kind TEXT NOT NULL DEFAULT 'file',
  original_name TEXT NOT NULL,
  mime_type TEXT,
  size_bytes INTEGER NOT NULL DEFAULT 0,
  public_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS techastra_session (
  sid varchar NOT NULL COLLATE "default",
  sess json NOT NULL,
  expire timestamp(6) NOT NULL,
  PRIMARY KEY (sid)
);

CREATE INDEX IF NOT EXISTS idx_techastra_session_expire ON techastra_session(expire);

CREATE TABLE IF NOT EXISTS techastra_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES techastra_users(id) ON DELETE SET NULL,
  event_id UUID REFERENCES techastra_events(id) ON DELETE SET NULL,
  order_id TEXT NOT NULL UNIQUE,
  amount_paise INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'created',
  razorpay_payment_id TEXT,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
