import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import pkg from 'pg';
import { OAuth2Client } from 'google-auth-library';

// Determine the correct .env file based on environment
const envFile = process.env.NODE_ENV === 'production' 
  ? path.resolve(process.cwd(), '.env.production')
  : path.resolve(process.cwd(), '.env');

dotenv.config({ path: envFile });

console.log('[ENV] Loading configuration from:', envFile);
console.log('[ENV] Current environment:', process.env.NODE_ENV || 'development');

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
  // Prioritize DATABASE_URL (common in cloud platforms like Railway, Render)
  if (process.env.DATABASE_URL) {
    console.log('[DB] Using DATABASE_URL from environment');
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { 
        rejectUnauthorized: false,
        // Add more SSL options if needed
        ca: process.env.DATABASE_SSL_CERT // Optional: if you have a custom SSL cert
      } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };
  }
  
  // Fallback to individual environment variables
  console.log('[DB] Using individual PostgreSQL environment variables');
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
    // Authenticate user and get user ID
    const authRes = await pool.query('SELECT auth.authenticate_user($1::text, $2::text) AS user_id', [identifier, password]);
    const userId = authRes.rows?.[0]?.user_id;
    
    console.log('[login] Authentication result:', { userId: !!userId });
    
    if (!userId) {
      return res.status(401).json({ error: 'invalid_credentials' });
    }

    // Create session
    const sessionRes = await pool.query(
      'SELECT auth.create_session($1::uuid, $2::integer, $3::inet, $4::text) AS session_token',
      [userId, 7 * 24 * 60, null, 'RecycleRN/1.0']
    );
    
    const sessionToken = sessionRes.rows?.[0]?.session_token;
    
    console.log('[login] Session creation result:', { hasSessionToken: !!sessionToken });
    
    if (!sessionToken) {
      return res.status(500).json({ error: 'session_creation_failed' });
    }

    return res.json({ 
      userId: userId.toString(), 
      sessionToken 
    });
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

// Middleware to validate session token
const validateSession = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    console.warn('[auth] No authorization header');
    return res.status(401).json({ error: 'missing_authorization' });
  }

  const token = authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    console.warn('[auth] Invalid authorization header format');
    return res.status(401).json({ error: 'invalid_authorization_format' });
  }

  try {
    // Verify the session token
    const { rows } = await pool.query(
      `SELECT user_id, expires_at 
       FROM auth.sessions 
       WHERE session_token = $1 
         AND revoked_at IS NULL 
         AND expires_at > NOW()`,
      [token]
    );

    if (rows.length === 0) {
      console.warn(`[auth] Invalid or expired session token: ${token}`);
      return res.status(401).json({ error: 'invalid_or_expired_token' });
    }

    // Attach user ID to the request for subsequent middleware/routes
    req.userId = rows[0].user_id;
    next();
  } catch (err) {
    console.error('[auth] Session validation error:', err);
    res.status(500).json({ error: 'server_error' });
  }
};

// Fetch user profile
app.get('/auth/profile', validateSession, async (req, res) => {
  // Use the validated user ID from the middleware
  const userId = req.query.userId || req.userId;
  
  console.log('[profile] Received request for userId:', userId);
  console.log('[profile] Authenticated user ID:', req.userId);

  if (!userId) {
    console.warn('[profile] Missing userId');
    return res.status(400).json({ error: 'missing_user_id' });
  }

  // Additional check to prevent accessing another user's profile
  if (userId !== req.userId.toString()) {
    console.warn(`[profile] User ID mismatch: requested ${userId}, authenticated ${req.userId}`);
    return res.status(403).json({ error: 'access_denied' });
  }

  try {
    const { rows } = await pool.query(
      `SELECT 
        id::text, 
        email, 
        username, 
        COALESCE(
          NULLIF(TRIM(full_name), ''),
          INITCAP(REGEXP_REPLACE(username, '\\d+', ' $0', 'g'))
        ) AS full_name, 
        last_login_at, 
        created_at 
      FROM auth.users 
      WHERE id = $1::uuid`, 
      [userId]
    );

    if (rows.length === 0) {
      console.warn(`[profile] No user found with ID: ${userId}`);
      return res.status(404).json({ error: 'user_not_found' });
    }

    const userProfile = rows[0];
    
    console.log(`[profile] Profile retrieved for user: ${userProfile.username}, Full Name: ${userProfile.full_name}`);
    res.json(userProfile);
  } catch (err) {
    console.error('[profile] Error retrieving profile:', err);
    res.status(500).json({ 
      error: 'server_error',
      details: process.env.NODE_ENV !== 'production' ? err.message : undefined 
    });
  }
});

// Update user profile
app.put('/auth/profile', validateSession, async (req, res) => {
  const { fullName, username } = req.body;
  const userId = req.userId;

  console.log('[profile/update] Received update request:', { 
    userId, 
    fullName: fullName || 'Not provided', 
    username: username || 'Not provided'
  });

  if (!userId) {
    console.warn('[profile/update] No user ID provided');
    return res.status(400).json({ error: 'missing_user_id' });
  }

  try {
    // Prepare update parameters
    const updateParams = [];
    const queryParams = [userId];
    let queryString = 'UPDATE auth.users SET ';

    let paramIndex = 2; // Start from 2 as userId is the first param
    
    // Validate and sanitize full name
    if (fullName !== undefined) {
      // Trim and capitalize words, remove extra spaces
      const sanitizedFullName = fullName.trim()
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

      // Only update if not empty after sanitization
      if (sanitizedFullName) {
        updateParams.push(sanitizedFullName);
        queryString += `full_name = $${paramIndex}, `;
        paramIndex++;
      }
    }

    if (username !== undefined) {
      // Validate username: lowercase, no spaces
      const sanitizedUsername = username.trim().toLowerCase().replace(/\s+/g, '');
      
      if (sanitizedUsername) {
        updateParams.push(sanitizedUsername);
        queryString += `username = $${paramIndex}, `;
        paramIndex++;
      }
    }

    // Remove trailing comma and space
    queryString = queryString.slice(0, -2);
    
    // Add WHERE clause
    queryString += ` WHERE id = $1 RETURNING 
      full_name, 
      username,
      COALESCE(
        NULLIF(TRIM(full_name), ''),
        INITCAP(REPLACE(username, SUBSTRING(username FROM '[0-9]+'), ' ' || SUBSTRING(username FROM '[0-9]+')))
      ) AS display_full_name`;

    // Combine userId with other update parameters
    const finalParams = [userId, ...updateParams];

    console.log('[profile/update] Executing query:', {
      query: queryString,
      params: finalParams
    });

    const { rows } = await pool.query(queryString, finalParams);

    if (rows.length === 0) {
      console.warn(`[profile/update] No user found with ID: ${userId}`);
      return res.status(404).json({ error: 'user_not_found' });
    }

    const updatedProfile = rows[0];
    
    console.log('[profile/update] Profile updated successfully:', updatedProfile);
    
    res.json({
      message: 'Profile updated successfully',
      profile: {
        full_name: updatedProfile.display_full_name,
        username: updatedProfile.username
      }
    });
  } catch (err) {
    console.error('[profile/update] Error updating profile:', err);
    
    // Handle unique constraint violations
    if (err.code === '23505') {
      if (String(err.detail || '').includes('username')) {
        return res.status(409).json({ error: 'username_taken' });
      }
    }
    
    res.status(500).json({ 
      error: 'server_error',
      details: process.env.NODE_ENV !== 'production' ? err.message : undefined 
    });
  }
});

// Save scan history
app.post('/scan-history', validateSession, async (req, res) => {
  console.log('[DETAILED SCAN HISTORY] Full Request Body:', req.body);
  console.log('[DETAILED SCAN HISTORY] Request Headers:', req.headers);
  console.log('[DETAILED SCAN HISTORY] Authenticated User ID:', req.userId);

  const { materialLabel, confidence, imageUrl, detectionDetails, userId } = req.body;
  const authenticatedUserId = req.userId;

  try {
    // Comprehensive logging
    console.log('[scan-history] Received scan history request:', { 
      authenticatedUserId, 
      requestedUserId: userId,
      materialLabel, 
      confidence,
      imageUrl: !!imageUrl,
      detectionDetailsProvided: !!detectionDetails
    });

    // Validate user ID
    if (!authenticatedUserId) {
      console.warn('[scan-history] No authenticated user ID');
      return res.status(401).json({ 
        error: 'unauthorized',
        details: 'No authenticated user found' 
      });
    }

    // Ensure the requested user ID matches the authenticated user ID
    if (userId && userId !== authenticatedUserId.toString()) {
      console.warn(`[scan-history] User ID mismatch: requested ${userId}, authenticated ${authenticatedUserId}`);
      return res.status(403).json({ 
        error: 'access_denied',
        details: 'User ID mismatch' 
      });
    }

    // Use authenticated user ID if not provided in the request
    const finalUserId = userId || authenticatedUserId;

    // Validate required fields with detailed error messages
    if (!materialLabel) {
      console.warn('[scan-history] Missing material label');
      return res.status(400).json({ 
        error: 'missing_material_label',
        details: 'Material label is required' 
      });
    }

    if (confidence === undefined || confidence === null) {
      console.warn('[scan-history] Missing or invalid confidence');
      return res.status(400).json({ 
        error: 'invalid_confidence',
        details: 'Confidence score is required and must be a number' 
      });
    }

    // Prepare detection details, ensuring it's a valid JSON
    const safeDetectionDetails = detectionDetails ? 
      (typeof detectionDetails === 'string' ? detectionDetails : JSON.stringify(detectionDetails)) : 
      '{}';

    const { rows } = await pool.query(
      `INSERT INTO recycling.scan_history 
        (user_id, material_label, confidence, image_url, detection_details) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING id::text, material_label, confidence, image_url, created_at`,
      [finalUserId, materialLabel, confidence, imageUrl, safeDetectionDetails]
    );

    console.log('[scan-history] Scan saved successfully', {
      id: rows[0].id,
      materialLabel: rows[0].material_label,
      userId: finalUserId
    });

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('[scan-history] Comprehensive Error:', {
      message: err.message,
      code: err.code,
      detail: err.detail,
      stack: err.stack
    });

    res.status(500).json({ 
      error: 'server_error',
      details: process.env.NODE_ENV !== 'production' ? {
        message: err.message,
        code: err.code,
        detail: err.detail
      } : undefined 
    });
  }
});

// Retrieve scan history
app.get('/scan-history', validateSession, async (req, res) => {
  const userId = req.query.userId || req.userId;
  const limit = parseInt(req.query.limit || '50', 10);
  const offset = parseInt(req.query.offset || '0', 10);

  console.log('[scan-history] Retrieving scan history:', { 
    userId, 
    limit, 
    offset 
  });

  if (!userId) {
    console.warn('[scan-history] No user ID provided');
    return res.status(400).json({ error: 'missing_user_id' });
  }

  try {
    const { rows } = await pool.query(
      `SELECT 
        id::text, 
        material_label, 
        confidence, 
        image_url, 
        created_at 
      FROM recycling.scan_history 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const { rows: countRows } = await pool.query(
      `SELECT COUNT(*) as total 
      FROM recycling.scan_history 
      WHERE user_id = $1`,
      [userId]
    );

    console.log('[scan-history] Retrieved scan history successfully', {
      scansCount: rows.length,
      total: parseInt(countRows[0].total, 10)
    });

    res.json({
      scans: rows,
      total: parseInt(countRows[0].total, 10)
    });
  } catch (err) {
    console.error('[scan-history] Error retrieving scan history:', err);
    res.status(500).json({ 
      error: 'server_error',
      details: process.env.NODE_ENV !== 'production' ? err.message : undefined 
    });
  }
});

const host = process.env.HOST || '0.0.0.0';
const port = Number(process.env.PORT || 4000);
app.listen(port, host, () => {
  console.log(`[api] listening on http://${host}:${port}`);
});


