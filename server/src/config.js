import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');

dotenv.config({ path: path.join(rootDir, '.env') });
dotenv.config({ path: path.join(rootDir, 'server', '.env'), override: true });

function resolvePublicUrl() {
  if (process.env.API_PUBLIC_URL) return process.env.API_PUBLIC_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.VITE_API_URL) return process.env.VITE_API_URL;
  return 'http://localhost:3001';
}

function resolveClientUrl() {
  if (process.env.CLIENT_URL) return process.env.CLIENT_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:5173';
}

const isProduction = Boolean(process.env.VERCEL) || process.env.NODE_ENV === 'production';

export const config = {
  port: Number(process.env.PORT) || 3001,
  databaseUrl: process.env.DATABASE_URL,
  sessionSecret: process.env.SESSION_SECRET || 'techastra-local-secret',
  clientUrl: resolveClientUrl(),
  apiPublicUrl: resolvePublicUrl(),
  demoAccessCode: process.env.DEMO_ACCESS_CODE || '',
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',
  isProduction,
  uploadDir:
    process.env.UPLOAD_DIR ||
    (process.env.VERCEL ? '/tmp/techastra-uploads' : path.join(rootDir, 'server', 'uploads')),
};

if (!config.databaseUrl) {
  throw new Error('DATABASE_URL is required. Set it in the project root .env');
}
