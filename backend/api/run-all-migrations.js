import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

// Load environment configuration
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const { Pool } = pkg;

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || undefined,
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE || 'railway',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runAllMigrations() {
  try {
    console.log('[Migration] Starting database migrations...');
    console.log('[Migration] Database:', process.env.PGDATABASE || 'railway');
    console.log('[Migration] Host:', process.env.PGHOST || 'localhost');

    // Migration files in order
    const migrations = [
      '../sql/001_auth_schema.sql',
      '../sql/002_scan_history_schema.sql',
      '../sql/003_inventory_schema.sql'
    ];

    for (const migrationFile of migrations) {
      try {
        const migrationPath = path.resolve(__dirname, migrationFile);
        console.log(`[Migration] Reading: ${migrationFile}`);
        
        const migrationSQL = await fs.readFile(migrationPath, 'utf8');
        
        console.log(`[Migration] Applying: ${migrationFile}`);
        await pool.query(migrationSQL);
        
        console.log(`[Migration] ✓ Successfully applied: ${migrationFile}`);
      } catch (error) {
        console.error(`[Migration] ✗ Error applying ${migrationFile}:`, {
          message: error.message,
          code: error.code,
          detail: error.detail
        });
        // Continue with next migration
      }
    }

    console.log('[Migration] All migrations completed');
  } catch (error) {
    console.error('[Migration] Fatal error:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
  } finally {
    await pool.end();
  }
}

runAllMigrations();
