import dotenv from 'dotenv';
import express from 'express';
import pkg from 'pg';

// Load environment variables
dotenv.config();

console.log('[STARTUP] Starting server...');
console.log('[ENV] NODE_ENV:', process.env.NODE_ENV);
console.log('[ENV] DATABASE_URL set:', !!process.env.DATABASE_URL);

const { Pool } = pkg;
const app = express();

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Database configuration
let pool;
try {
  console.log('[DB] Creating connection pool...');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
  console.log('[DB] ✓ Pool created successfully');
} catch (err) {
  console.error('[DB] Failed to create pool:', err);
  process.exit(1);
}

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Recycle API is running'
  });
});

app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as timestamp');
    res.json({
      status: 'healthy',
      database: 'connected',
      server_time: result.rows[0].timestamp,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Simple test endpoints
app.post('/test-post', (req, res) => {
  console.log('[test-post] POST request received');
  res.json({ 
    success: true, 
    body: req.body, 
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Auth routes
app.post('/auth/register', async (req, res) => {
  console.log('[register] Registration attempt');
  const { email, username, password } = req.body;
  
  if (!email || !username || !password) {
    return res.status(400).json({ 
      error: 'missing_fields',
      required: ['email', 'username', 'password']
    });
  }
  
  try {
    const { rows } = await pool.query(
      'SELECT auth.register_user($1::citext, $2::citext, $3::text, $4::text, $5::boolean, $6::boolean) AS user_id',
      [email, username, null, password, true, true]
    );
    
    res.status(201).json({ 
      success: true,
      userId: rows[0]?.user_id 
    });
  } catch (err) {
    console.error('[register] Error:', err);
    
    if (err.code === '23505') {
      return res.status(409).json({ error: 'user_exists' });
    }
    
    res.status(500).json({ 
      error: 'server_error',
      message: err.message 
    });
  }
});

app.post('/auth/login', async (req, res) => {
  console.log('[login] Login attempt');
  const { identifier, password } = req.body;
  
  if (!identifier || !password) {
    return res.status(400).json({ 
      error: 'missing_fields',
      required: ['identifier', 'password']
    });
  }
  
  try {
    const authRes = await pool.query(
      'SELECT auth.authenticate_user($1::text, $2::text) AS user_id',
      [identifier, password]
    );
    
    const userId = authRes.rows?.[0]?.user_id;
    if (!userId) {
      return res.status(401).json({ error: 'invalid_credentials' });
    }
    
    const sessionRes = await pool.query(
      'SELECT auth.create_session($1::uuid, $2::integer, $3::inet, $4::text) AS session_token',
      [userId, 7 * 24 * 60, null, 'RecycleRN/1.0']
    );
    
    const sessionToken = sessionRes.rows?.[0]?.session_token;
    if (!sessionToken) {
      return res.status(500).json({ error: 'session_creation_failed' });
    }
    
    res.json({ 
      success: true,
      userId: userId.toString(), 
      sessionToken 
    });
  } catch (err) {
    console.error('[login] Error:', err);
    res.status(500).json({ 
      error: 'server_error',
      message: err.message 
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'not_found', 
    path: req.originalUrl,
    method: req.method
  });
});

// Start server
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[SERVER] ✅ Server running on http://0.0.0.0:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[SERVER] SIGTERM received, shutting down gracefully');
  server.close(() => {
    pool.end(() => {
      process.exit(0);
    });
  });
});

export default app;
