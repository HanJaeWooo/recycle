import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import pkg from 'pg';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Determine the correct .env file based on environment
const envFile = process.env.NODE_ENV === 'production' 
  ? path.resolve(process.cwd(), '.env.production')
  : path.resolve(process.cwd(), '.env');

dotenv.config({ path: envFile });

console.log('[MIGRATION] Loading configuration from:', envFile);
console.log('[MIGRATION] Current environment:', process.env.NODE_ENV || 'development');

const { Pool } = pkg;

// Database configuration
const getDatabaseConfig = () => {
  if (process.env.DATABASE_URL) {
    console.log('[MIGRATION] Using DATABASE_URL from environment');
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { 
        rejectUnauthorized: false 
      } : false,
    };
  }
  
  console.log('[MIGRATION] Using individual PostgreSQL environment variables');
  return {
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT || 5432),
    database: process.env.PGDATABASE || 'recycle_app',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  };
};

const pool = new Pool(getDatabaseConfig());

async function runMigration() {
  try {
    console.log('[MIGRATION] Starting inventory schema migration...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'sql', '003_inventory_schema.sql');
    console.log('[MIGRATION] Reading SQL file from:', sqlPath);
    
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the migration
    console.log('[MIGRATION] Executing SQL...');
    await pool.query(sql);
    
    console.log('[MIGRATION] ✅ Inventory schema migration completed successfully!');
    
    // Test the migration
    const testResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'recycling' 
      AND table_name = 'inventory'
    `);
    
    if (testResult.rows.length > 0) {
      console.log('[MIGRATION] ✅ Inventory table created successfully');
    } else {
      console.error('[MIGRATION] ❌ Inventory table was not created');
    }
    
  } catch (error) {
    console.error('[MIGRATION] ❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

runMigration()
  .then(() => {
    console.log('[MIGRATION] Migration process completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('[MIGRATION] Migration process failed:', error);
    process.exit(1);
  });
