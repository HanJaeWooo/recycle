import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment configuration
const envFile = process.env.NODE_ENV === 'production' 
  ? path.resolve(process.cwd(), '.env.production')
  : path.resolve(process.cwd(), '.env');

dotenv.config({ path: envFile });

console.log('[Migration] Loading configuration from:', envFile);
console.log('[Migration] Environment:', process.env.NODE_ENV || 'development');

const { Pool } = pkg;

// Database configuration
const getDatabaseConfig = () => {
  // Always use individual parameters for better compatibility
  console.log('[Migration] Using individual PostgreSQL environment variables');
  return {
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT || 5432),
    database: process.env.PGDATABASE || 'recycle_app',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '',
    ssl: { 
      rejectUnauthorized: false 
    },
    connectionTimeoutMillis: 10000,
  };
};

const pool = new Pool(getDatabaseConfig());

async function runMigration() {
  try {
    // Test connection first
    console.log('\n[Migration] Testing database connection...');
    console.log('[Migration] Connection config:', {
      host: process.env.PGHOST,
      port: process.env.PGPORT,
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      ssl: 'enabled (rejectUnauthorized: false)'
    });
    
    const testResult = await pool.query('SELECT NOW() as timestamp, version() as version');
    console.log('[Migration] ✓ Database connection successful');
    console.log('[Migration] Timestamp:', testResult.rows[0].timestamp);
    console.log('[Migration] PostgreSQL version:', testResult.rows[0].version.split('\n')[0]);

    // Migration files to run in order
    const migrations = [
      {
        name: 'Auth Schema',
        file: '../sql/001_auth_schema.sql'
      },
      {
        name: 'Scan History Schema',
        file: '../sql/002_scan_history_schema.sql'
      }
    ];

    console.log('\n[Migration] Running migrations...\n');

    for (const migration of migrations) {
      try {
        const migrationPath = path.resolve(__dirname, migration.file);
        console.log(`[Migration] Reading: ${migration.name}`);
        console.log(`[Migration] File path: ${migrationPath}`);
        
        const migrationSQL = await fs.readFile(migrationPath, 'utf8');
        
        console.log(`[Migration] Applying: ${migration.name}...`);
        await pool.query(migrationSQL);
        
        console.log(`[Migration] ✓ ${migration.name} applied successfully\n`);
      } catch (error) {
        console.error(`[Migration] ✗ Error applying ${migration.name}:`, {
          message: error.message,
          code: error.code,
          detail: error.detail
        });
        throw error;
      }
    }

    // Verify schemas were created
    console.log('[Migration] Verifying schemas...');
    const schemaResult = await pool.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name IN ('auth', 'recycling')
      ORDER BY schema_name
    `);
    
    console.log('[Migration] Schemas found:', schemaResult.rows.map(r => r.schema_name).join(', '));

    // Verify tables were created
    const tablesResult = await pool.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema IN ('auth', 'recycling')
      ORDER BY table_schema, table_name
    `);
    
    console.log('[Migration] Tables created:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_schema}.${row.table_name}`);
    });

    console.log('\n[Migration] ✓ All migrations completed successfully!');
    console.log('[Migration] Your database is ready to use.\n');

  } catch (error) {
    console.error('\n[Migration] ✗ Migration failed:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint
    });
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
