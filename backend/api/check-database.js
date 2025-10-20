import dotenv from 'dotenv';
import path from 'path';
import pkg from 'pg';

const envFile = process.env.NODE_ENV === 'production' 
  ? path.resolve(process.cwd(), '.env.production')
  : path.resolve(process.cwd(), '.env');

dotenv.config({ path: envFile });

const { Pool } = pkg;

const getDatabaseConfig = () => {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    };
  }
  
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

async function checkDatabase() {
  console.log('🔍 Checking Database Status...\n');
  
  try {
    // Test connection
    console.log('1️⃣ Testing database connection...');
    const timeResult = await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully at:', timeResult.rows[0].now);
    console.log('');
    
    // Check schemas
    console.log('2️⃣ Checking schemas...');
    const schemas = await pool.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name IN ('auth', 'recycling')
    `);
    console.log('Found schemas:', schemas.rows.map(r => r.schema_name).join(', '));
    console.log('');
    
    // Check tables
    console.log('3️⃣ Checking tables...');
    const tables = await pool.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema IN ('auth', 'recycling')
      ORDER BY table_schema, table_name
    `);
    console.log('Found tables:');
    tables.rows.forEach(row => {
      console.log(`  - ${row.table_schema}.${row.table_name}`);
    });
    console.log('');
    
    // Check users
    console.log('4️⃣ Checking users...');
    const users = await pool.query('SELECT COUNT(*) as count FROM auth.users');
    console.log(`Total users: ${users.rows[0].count}`);
    console.log('');
    
    // Check scan history
    console.log('5️⃣ Checking scan history...');
    const scanHistory = await pool.query(`
      SELECT 
        user_id,
        COUNT(*) as scan_count,
        MAX(created_at) as last_scan
      FROM recycling.scan_history
      GROUP BY user_id
    `);
    
    if (scanHistory.rows.length === 0) {
      console.log('⚠️  No scan history found in database');
    } else {
      console.log('Scan history by user:');
      scanHistory.rows.forEach(row => {
        console.log(`  - User ${row.user_id}: ${row.scan_count} scans, last: ${row.last_scan}`);
      });
    }
    console.log('');
    
    // Check inventory
    console.log('6️⃣ Checking inventory...');
    try {
      const inventory = await pool.query(`
        SELECT 
          user_id,
          COUNT(*) as item_count,
          SUM(quantity) as total_quantity
        FROM recycling.inventory
        GROUP BY user_id
      `);
      
      if (inventory.rows.length === 0) {
        console.log('⚠️  No inventory found in database');
      } else {
        console.log('Inventory by user:');
        inventory.rows.forEach(row => {
          console.log(`  - User ${row.user_id}: ${row.item_count} items, total quantity: ${row.total_quantity}`);
        });
      }
    } catch (err) {
      if (err.code === '42P01') {
        console.log('❌ Inventory table does not exist!');
        console.log('   Run: node run-inventory-migration.js');
      } else {
        throw err;
      }
    }
    console.log('');
    
    // Recent scans
    console.log('7️⃣ Recent scans (last 5):');
    const recentScans = await pool.query(`
      SELECT 
        id,
        material_label,
        confidence,
        created_at
      FROM recycling.scan_history
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    if (recentScans.rows.length === 0) {
      console.log('⚠️  No scans found');
    } else {
      recentScans.rows.forEach(row => {
        console.log(`  - ${row.material_label} (${(row.confidence * 100).toFixed(1)}%) at ${row.created_at}`);
      });
    }
    console.log('');
    
    console.log('✅ Database check complete!');
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    console.error('');
    console.error('Database config:', {
      host: process.env.PGHOST || 'localhost',
      port: process.env.PGPORT || 5432,
      database: process.env.PGDATABASE || 'recycle_app',
      user: process.env.PGUSER || 'postgres',
      hasDatabaseUrl: !!process.env.DATABASE_URL
    });
  } finally {
    await pool.end();
  }
}

checkDatabase();
