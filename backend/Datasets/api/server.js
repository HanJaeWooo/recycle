import express from 'express';
import dotenv from 'dotenv';
import pkg from 'pg';
import { OAuth2Client } from 'google-auth-library';

dotenv.config();

const { Pool } = pkg;

const app = express();

// Simple CORS configuration - allow all origins  
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('[CORS] OPTIONS preflight for:', req.path);
    res.status(200).end();
    return;
  }
  
  next();
});
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database configuration with support for cloud providers
const getDatabaseConfig = () => {
  // Support for DATABASE_URL (common in cloud platforms like Railway, Render)
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };
  }
  
  // Fallback to individual environment variables
  return {
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT || 5432),
    database: process.env.PGDATABASE || 'recycle_app',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
};

const pool = new Pool(getDatabaseConfig());
// Google OAuth client (used to verify ID tokens from client)
const googleClientId = process.env.GOOGLE_CLIENT_ID || '';
const googleClient = new OAuth2Client(googleClientId);


// Enhanced database connection logging
pool.on('connect', () => {
  console.log('[pg] Database connected successfully');
});

pool.on('error', (err) => {
  console.error('[pg pool error]', err);
  
  // Log connection details for debugging (without sensitive info)
  if (process.env.NODE_ENV !== 'production') {
    console.error('[pg] Database config:', {
      host: process.env.PGHOST || 'localhost',
      port: process.env.PGPORT || 5432,
      database: process.env.PGDATABASE || 'recycle_app',
      ssl: process.env.NODE_ENV === 'production'
    });
  }
});

// Test database connection on startup
pool.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('[pg] Initial connection test failed:', err.message);
  } else {
    console.log('[pg] Database connection test successful at:', result.rows[0].now);
  }
});

app.get('/health', async (req, res) => {
  try {
    const dbResult = await pool.query('SELECT NOW() as timestamp, version() as version');
    res.json({ 
      ok: true, 
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        timestamp: dbResult.rows[0].timestamp
      },
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (err) {
    console.error('[health] error', err);
    const verbose = process.env.DEBUG === '1' || req.query.debug === '1' || req.query.verbose === '1';
    const body = { 
      ok: false, 
      error: 'db_unavailable',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    };
    if (verbose) {
      body.code = err.code;
      body.detail = String(err.message || err);
      body.config = {
        host: process.env.PGHOST,
        port: process.env.PGPORT,
        database: process.env.PGDATABASE,
        user: process.env.PGUSER,
        hasConnectionString: !!process.env.DATABASE_URL,
      };
    }
    res.status(500).json(body);
  }
});

// Environment info endpoint for debugging (development only)
app.get('/info', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' });
  }
  
  res.json({
    node_env: process.env.NODE_ENV,
    port: process.env.PORT || 4000,
    host: process.env.HOST || '0.0.0.0',
    database_url_provided: !!process.env.DATABASE_URL,
    google_client_id_provided: !!process.env.GOOGLE_CLIENT_ID,
    cors_origins: corsOptions.origin
  });
});

// Register user
app.post('/auth/register', async (req, res) => {
  const { email, username, fullName, password, acceptTerms, acceptPrivacy } = req.body || {};
  if (!email || !username || !password) {
    return res.status(400).json({ error: 'missing_fields' });
  }
  try {
    const { rows } = await pool.query(
      'SELECT auth.register_user($1::citext, $2::citext, $3::text, $4::text, $5::boolean, $6::boolean) AS user_id',
      [email, username, fullName || null, password, !!acceptTerms, !!acceptPrivacy]
    );
    return res.status(201).json({ userId: rows[0]?.user_id });
  } catch (err) {
    if (err?.code === '23505') {
      // unique_violation
      if (String(err?.detail || '').includes('email')) {
        return res.status(409).json({ error: 'email_taken' });
      }
      if (String(err?.detail || '').includes('username')) {
        return res.status(409).json({ error: 'username_taken' });
      }
      return res.status(409).json({ error: 'conflict' });
    }
    console.error('[register] error', err);
    return res.status(500).json({ error: 'server_error' });
  }
});

// Login and create session
app.post('/auth/login', async (req, res) => {
  const { identifier, password } = req.body || {};
  if (!identifier || !password) {
    return res.status(400).json({ error: 'missing_fields' });
  }
  try {
    const authRes = await pool.query('SELECT auth.authenticate_user($1::text, $2::text) AS user_id', [identifier, password]);
    const userId = authRes.rows?.[0]?.user_id;
    if (!userId) {
      return res.status(401).json({ error: 'invalid_credentials' });
    }
    const sessionRes = await pool.query(
      'SELECT auth.create_session($1::uuid, $2::integer, $3::inet, $4::text) AS session_token',
      [userId, 7 * 24 * 60, null, 'RecycleRN/1.0']
    );
    return res.json({ userId, sessionToken: sessionRes.rows?.[0]?.session_token });
  } catch (err) {
    console.error('[login] error', err);
    return res.status(500).json({ error: 'server_error' });
  }
});

// Google Sign-In (client sends ID token obtained from Google)
app.post('/auth/login/google', async (req, res) => {
  const { idToken } = req.body || {};
  if (!idToken) return res.status(400).json({ error: 'missing_id_token' });
  try {
    const ticket = await googleClient.verifyIdToken({ idToken, audience: googleClientId });
    const payload = ticket.getPayload();
    if (!payload) return res.status(401).json({ error: 'invalid_token' });

    const email = payload.email;
    const name = payload.name || null;
    const sub = payload.sub; // Google user id
    if (!email || !sub) return res.status(401).json({ error: 'invalid_token' });

    // Use Google sub as a stable username suffix if needed
    // Try to find existing user by email; if not exists, create a user with random password
    let userId;
    const existing = await pool.query('SELECT id FROM auth.users WHERE email = $1::citext LIMIT 1', [email]);
    if (existing.rows.length) {
      userId = existing.rows[0].id;
    } else {
      const usernameBase = (email.split('@')[0] || 'user').replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20) || 'user';
      const username = `${usernameBase}_${sub.slice(-6)}`;
      // Create with a random password; Google users won’t use password login unless they set one later
      const randomPass = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
      const reg = await pool.query(
        'SELECT auth.register_user($1::citext,$2::citext,$3::text,$4::text,$5::boolean,$6::boolean) AS user_id',
        [email, username, name, randomPass, true, true]
      );
      userId = reg.rows[0].user_id;
    }

    // Issue a session
    const sessionRes = await pool.query(
      'SELECT auth.create_session($1::uuid, $2::integer, $3::inet, $4::text) AS session_token',
      [userId, 7 * 24 * 60, null, 'RecycleRN/1.0 GoogleOAuth']
    );
    return res.json({ userId, sessionToken: sessionRes.rows?.[0]?.session_token });
  } catch (err) {
    console.error('[login/google] error', err);
    return res.status(401).json({ error: 'invalid_token' });
  }
});

// Request password reset
app.post('/auth/password-reset/request', async (req, res) => {
  const { email } = req.body || {};
  if (!email) {
    return res.status(400).json({ error: 'missing_email' });
  }
  try {
    const { rows } = await pool.query(
      'SELECT * FROM auth.create_password_reset($1::citext, $2::integer, $3::inet)',
      [email, 30, null]
    );
    // For development convenience, return token if exists. In production, send via email.
    if (!rows || rows.length === 0) {
      // Deliberately respond success to avoid revealing existence
      return res.json({ ok: true });
    }
    const { user_id: userId, token, expires_at: expiresAt } = rows[0];
    return res.json({ ok: true, userId, token, expiresAt });
  } catch (err) {
    console.error('[password-reset/request] error', err);
    return res.status(500).json({ error: 'server_error' });
  }
});

// Consume password reset
app.post('/auth/password-reset/consume', async (req, res) => {
  const { token, newPassword } = req.body || {};
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'missing_fields' });
  }
  try {
    const { rows } = await pool.query(
      'SELECT auth.consume_password_reset($1::text, $2::text, $3::inet) AS ok',
      [token, newPassword, null]
    );
    return res.json({ ok: rows[0]?.ok === true });
  } catch (err) {
    console.error('[password-reset/consume] error', err);
    return res.status(500).json({ error: 'server_error' });
  }
});

const host = process.env.HOST || '0.0.0.0';
const port = Number(process.env.PORT || 4000);
app.listen(port, host, () => {
  console.log(`[api] listening on http://${host}:${port}`);
});


