import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve current directory in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Manually read .env file
const envPath = path.resolve(__dirname, '.env');
let envContents = '';
try {
  envContents = fs.readFileSync(envPath, 'utf8');
  console.log('Raw .env contents:', envContents);
} catch (err) {
  console.error('Error reading .env file:', err);
}

// Parse .env contents manually
const parseEnv = (contents) => {
  const env = {};
  contents.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      env[key.trim()] = value.trim().replace(/^"|"$/g, '');
    }
  });
  return env;
};

const parsedEnv = parseEnv(envContents);

console.log('Parsed Environment Variables:');
console.log('PGHOST:', parsedEnv.PGHOST);
console.log('PGPORT:', parsedEnv.PGPORT);
console.log('PGDATABASE:', parsedEnv.PGDATABASE);
console.log('PGUSER:', parsedEnv.PGUSER);
console.log('PGPASSWORD:', parsedEnv.PGPASSWORD ? '[REDACTED]' : 'UNDEFINED');
console.log('DATABASE_URL:', parsedEnv.DATABASE_URL ? '[REDACTED]' : 'UNDEFINED');

const { Pool } = pg;

const pool = new Pool({
  host: parsedEnv.PGHOST,
  port: Number(parsedEnv.PGPORT),
  database: parsedEnv.PGDATABASE,
  user: parsedEnv.PGUSER,
  password: parsedEnv.PGPASSWORD,
  ssl: { 
    rejectUnauthorized: false, // Important for Railway's SSL
    // Add more SSL options if needed
  }
});

async function testConnection() {
  try {
    console.log('Attempting to connect to Railway database...');
    console.log('Connection Details:');
    console.log(`Host: ${parsedEnv.PGHOST}`);
    console.log(`Port: ${parsedEnv.PGPORT}`);
    console.log(`Database: ${parsedEnv.PGDATABASE}`);
    console.log(`User: ${parsedEnv.PGUSER}`);

    const client = await pool.connect();
    console.log('Connected successfully!');

    // List schemas to verify connection
    const schemasResult = await client.query('SELECT schema_name FROM information_schema.schemata');
    console.log('Available Schemas:');
    schemasResult.rows.forEach(row => console.log(row.schema_name));

    // Get current database time and version
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('Current Database Time:', result.rows[0].current_time);
    console.log('PostgreSQL Version:', result.rows[0].pg_version);

    client.release();
  } catch (err) {
    console.error('Connection Error:', err);
    console.error('Error Details:', {
      message: err.message,
      code: err.code,
      syscall: err.syscall,
      hostname: err.hostname
    });
  } finally {
    await pool.end();
  }
}

testConnection();
