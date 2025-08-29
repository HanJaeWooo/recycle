Recycle Project — Backend Auth Database (PostgreSQL)

This folder provides a PostgreSQL schema for authentication: sign up (users with name, username, email), sign in (sessions), and password reset. It includes helper SQL functions to register and authenticate using username or email. No Docker is required.

Requirements
- PostgreSQL 13+ and psql client

Setup
1) Create the database (adjust as needed):

   ```bash
   psql -U postgres -c "CREATE DATABASE \"recycle_app\";"
   ```

2) Apply the schema:

   ```bash
   psql -U postgres -d recycle_app -f ./sql/001_auth_schema.sql
   ```

Key tables
- `auth.users`: `email` (unique), `username` (unique), `full_name`, `password_hash`, terms/privacy acceptance flags and timestamps, timestamps
- `auth.sessions`: login sessions with `session_token`, `expires_at`, `last_seen_at`
- `auth.password_reset_tokens`: one-time tokens used to reset passwords

Helper functions
- `auth.hash_password_bcrypt(password, rounds=12) -> text`: bcrypt-hash a password (pgcrypto)
- `auth.verify_password_bcrypt(password, hash) -> boolean`: verify password
- `auth.generate_secure_token(num_bytes=32) -> text`: cryptographic token as hex
- `auth.register_user(email, username, full_name, password, accept_terms=false, accept_privacy=false) -> uuid`
- `auth.authenticate_user(identifier, password) -> uuid | null` (identifier is username or email)
- `auth.create_session(user_id, minutes=10080, ip, user_agent) -> text`: issue session token
- `auth.revoke_session(session_token)`: revoke session
- `auth.touch_session(session_token)`: update `last_seen_at`
- `auth.create_password_reset(email, ttl_minutes=30, request_ip) -> (user_id, token, expires_at)`
- `auth.consume_password_reset(token, new_password, consumer_ip) -> boolean`

Typical flows (SQL examples)

Sign up (create user)
```sql
SELECT auth.register_user(
  'user@example.com',
  'jrome123',
  'Jerome Rigor',
  'Password123!',
  TRUE,  -- accept terms
  TRUE   -- accept privacy
);
```

Sign in (username or email) and create a session
```sql
-- Returns user_id if valid, else NULL
SELECT auth.authenticate_user('jrome123', 'Password123!') AS user_id;

-- Issue a session token for that user_id
SELECT auth.create_session('<user_id>', 7*24*60, '127.0.0.1', 'RN-App/1.0');
```

Password reset
```sql
-- 1) Request a reset (returns a token you would email/SMS to the user)
SELECT * FROM auth.create_password_reset('user@example.com', 30, '127.0.0.1');

-- 2) Consume the token to set a new password
SELECT auth.consume_password_reset('<paste_token_here>', 'NewPassword123!', '127.0.0.1');
```

Notes
- Emails and usernames are `CITEXT`, so uniqueness is case-insensitive.
- Tokens are high-entropy (64 hex chars by default). Never use predictable tokens.
- Prefer Argon2id hashing in the application; this schema includes bcrypt helpers for convenience.
- The schema is idempotent: safe to re-run.

API server (optional, no Docker)
- A minimal API is provided in `backend/api/` using Node + Express.
- Configure env vars (copy `.env.example` to `.env`) and run:

```bash
cd backend/api
npm install
npm run dev
```

Endpoints
- POST `/auth/register` { email, username, fullName, password, acceptTerms, acceptPrivacy }
- POST `/auth/login` { identifier, password }
- POST `/auth/password-reset/request` { email }
- POST `/auth/password-reset/consume` { token, newPassword }


