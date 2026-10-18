import pg from 'pg';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

let pool;

export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: config.databaseUrl,
      ssl: { rejectUnauthorized: false },
      max: 10,
    });
  }
  return pool;
}

export async function query(text, params) {
  return getPool().query(text, params);
}

async function runMigrations() {
  const sql = readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await query(sql);
}

export async function connectDb() {
  await query('SELECT 1');
  await runMigrations();
  await query(
    'ALTER TABLE techastra_teams ADD COLUMN IF NOT EXISTS project_score INTEGER',
  );
  console.log('Supabase PostgreSQL connected.');
}

export async function disconnectDb() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
