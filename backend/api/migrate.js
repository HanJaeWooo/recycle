import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';

// Load environment configuration
const envFile = process.env.NODE_ENV === 'production' 
  ? path.resolve(process.cwd(), '.env.production')
  : path.resolve(process.cwd(), '.env');

dotenv.config({ path: envFile });

const { Pool } = pkg;

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || undefined,
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE || 'recycle_app',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigration() {
  try {
    // Read migration SQL file
    const migrationPath = path.resolve(process.cwd(), '../../../backend/sql/002_scan_history_schema.sql');
    const migrationSQL = await fs.readFile(migrationPath, 'utf8');

    console.log('[Migration] Applying scan history schema...');
    console.log('[Migration] File path:', migrationPath);

    // Execute migration
    await pool.query(migrationSQL);

    console.log('[Migration] Scan history schema applied successfully');
  } catch (error) {
    console.error('[Migration] Error applying scan history schema:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
  } finally {
    await pool.end();
  }
}

runMigration();
