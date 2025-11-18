-- Recycle Project — Authentication Schema (PostgreSQL)
-- Contains: users, sessions, password reset tokens, helper functions
-- Safe to run multiple times (IF NOT EXISTS/CREATE OR REPLACE used where possible)

-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto; -- gen_random_uuid(), gen_random_bytes(), crypt()
CREATE EXTENSION IF NOT EXISTS citext;   -- case-insensitive text (useful for emails)

-- Dedicated schema for auth concerns
CREATE SCHEMA IF NOT EXISTS auth;

-- Users table
CREATE TABLE IF NOT EXISTS auth.users (
	id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	email              CITEXT NOT NULL UNIQUE,
	username           CITEXT NOT NULL UNIQUE,
	full_name          TEXT,
	password_hash      TEXT NOT NULL,
	password_algo      TEXT NOT NULL DEFAULT 'bcrypt', -- recommended to hash in app with Argon2; bcrypt via pgcrypto is available
	email_verified_at  TIMESTAMPTZ,
	last_login_at      TIMESTAMPTZ,
	disabled_at        TIMESTAMPTZ,
	accepted_terms     BOOLEAN NOT NULL DEFAULT FALSE,
	accepted_privacy   BOOLEAN NOT NULL DEFAULT FALSE,
	accepted_terms_at  TIMESTAMPTZ,
	accepted_privacy_at TIMESTAMPTZ,
	created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	CONSTRAINT users_email_format CHECK (POSITION('@' IN email) > 1),
	CONSTRAINT users_username_min_len CHECK (char_length(username) >= 3)
);

-- Sessions table (auth tokens for logged-in users)
CREATE TABLE IF NOT EXISTS auth.sessions (
	id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
	session_token TEXT NOT NULL UNIQUE, -- store a random, high-entropy token (e.g., 64+ hex chars)
	created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	expires_at    TIMESTAMPTZ NOT NULL,
	last_seen_at  TIMESTAMPTZ,
	ip_address    INET,
	user_agent    TEXT,
	revoked_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON auth.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON auth.sessions(expires_at);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS auth.password_reset_tokens (
	id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
	token           TEXT NOT NULL UNIQUE, -- 64+ hex chars recommended
	created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	expires_at      TIMESTAMPTZ NOT NULL,
	consumed_at     TIMESTAMPTZ,
	consumed_by_ip  INET,
	CONSTRAINT prt_token_min_len CHECK (char_length(token) >= 40)
);

CREATE INDEX IF NOT EXISTS idx_prt_user_id ON auth.password_reset_tokens(user_id);
-- NOTE: Predicates in partial indexes must be IMMUTABLE. NOW() is STABLE, so we split into
-- a partial index on unconsumed tokens and a separate index on expires_at for time filtering.
CREATE INDEX IF NOT EXISTS idx_prt_unconsumed ON auth.password_reset_tokens(user_id)
	WHERE consumed_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_prt_expires_at ON auth.password_reset_tokens(expires_at);

-- updated_at trigger helper
CREATE OR REPLACE FUNCTION auth.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at := NOW();
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON auth.users;
CREATE TRIGGER trg_users_updated_at
	BEFORE UPDATE ON auth.users
	FOR EACH ROW
	EXECUTE FUNCTION auth.set_updated_at();

-- Security/utility helpers

-- Generate a secure random token as hex (default 32 bytes => 64 hex chars)
CREATE OR REPLACE FUNCTION auth.generate_secure_token(p_num_bytes INTEGER DEFAULT 32)
RETURNS TEXT
LANGUAGE sql
STRICT
AS $$
SELECT encode(gen_random_bytes(p_num_bytes), 'hex');
$$;

-- Hash a password using bcrypt (pgcrypto). Prefer application-level Argon2 if available.
CREATE OR REPLACE FUNCTION auth.hash_password_bcrypt(p_password TEXT, p_rounds INTEGER DEFAULT 12)
RETURNS TEXT
LANGUAGE sql
STRICT
AS $$
SELECT crypt(p_password, gen_salt('bf', p_rounds));
$$;

-- Verify password against bcrypt hash
CREATE OR REPLACE FUNCTION auth.verify_password_bcrypt(p_password TEXT, p_hash TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STRICT
AS $$
SELECT crypt(p_password, p_hash) = p_hash;
$$;

-- Create a session (returns session token). Default expiry: 7 days.
CREATE OR REPLACE FUNCTION auth.create_session(
	p_user_id UUID,
	p_duration_minutes INTEGER DEFAULT 7 * 24 * 60,
	p_ip INET DEFAULT NULL,
	p_user_agent TEXT DEFAULT NULL
) RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
	v_token   TEXT;
	v_expires TIMESTAMPTZ;
BEGIN
	v_token := auth.generate_secure_token(32);
	v_expires := NOW() + make_interval(mins => p_duration_minutes);

	INSERT INTO auth.sessions (user_id, session_token, expires_at, ip_address, user_agent)
	VALUES (p_user_id, v_token, v_expires, p_ip, p_user_agent);

	RETURN v_token;
END;
$$;

-- Change password given current password; returns TRUE if changed
CREATE OR REPLACE FUNCTION auth.change_password(
	p_user_id UUID,
	p_current_password TEXT,
	p_new_password TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
	v_hash TEXT;
	v_ok BOOLEAN;
BEGIN
	SELECT password_hash INTO v_hash FROM auth.users WHERE id = p_user_id FOR UPDATE;
	IF v_hash IS NULL THEN
		RETURN FALSE;
	END IF;

	v_ok := auth.verify_password_bcrypt(p_current_password, v_hash);
	IF NOT v_ok THEN
		RETURN FALSE;
	END IF;

	UPDATE auth.users
	SET password_hash = auth.hash_password_bcrypt(p_new_password)
	WHERE id = p_user_id;

	RETURN TRUE;
END;
$$;

-- Update profile fields (email, username, full_name). Pass NULL to skip a field
CREATE OR REPLACE FUNCTION auth.update_profile(
	p_user_id UUID,
	p_full_name TEXT,
	p_username CITEXT,
	p_email CITEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
	UPDATE auth.users
	SET 
		full_name = COALESCE(p_full_name, full_name),
		username  = COALESCE(p_username, username),
		email     = COALESCE(p_email, email)
	WHERE id = p_user_id;

	IF NOT FOUND THEN
		RETURN FALSE;
	END IF;

	RETURN TRUE;
EXCEPTION WHEN unique_violation THEN
	RAISE; -- propagate uniqueness errors to caller
END;
$$;

-- Revoke a session by token
CREATE OR REPLACE FUNCTION auth.revoke_session(p_session_token TEXT)
RETURNS VOID
LANGUAGE sql
AS $$
UPDATE auth.sessions SET revoked_at = NOW() WHERE session_token = p_session_token AND revoked_at IS NULL;
$$;

-- Mark session as seen (touch last_seen_at)
CREATE OR REPLACE FUNCTION auth.touch_session(p_session_token TEXT)
RETURNS VOID
LANGUAGE sql
AS $$
UPDATE auth.sessions SET last_seen_at = NOW() WHERE session_token = p_session_token;
$$;

-- Register a new user (returns user id)
CREATE OR REPLACE FUNCTION auth.register_user(
	p_email CITEXT,
	p_username CITEXT,
	p_full_name TEXT,
	p_password TEXT,
	p_accept_terms BOOLEAN DEFAULT FALSE,
	p_accept_privacy BOOLEAN DEFAULT FALSE
) RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
	v_user_id UUID;
	v_hash TEXT;
BEGIN
	v_hash := auth.hash_password_bcrypt(p_password);

	INSERT INTO auth.users (
		email, username, full_name, password_hash,
		accepted_terms, accepted_privacy,
		accepted_terms_at, accepted_privacy_at
	) VALUES (
		p_email, p_username, p_full_name, v_hash,
		COALESCE(p_accept_terms, FALSE), COALESCE(p_accept_privacy, FALSE),
		CASE WHEN p_accept_terms THEN NOW() END,
		CASE WHEN p_accept_privacy THEN NOW() END
	) RETURNING id INTO v_user_id;

	RETURN v_user_id;
EXCEPTION WHEN unique_violation THEN
	-- Re-raise for caller to handle; preserves constraint error detail
	RAISE;
END;
$$;

-- Authenticate by username or email; returns user id if password valid, else NULL
CREATE OR REPLACE FUNCTION auth.authenticate_user(
	p_identifier TEXT,
	p_password TEXT
) RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
	v_user_id UUID;
	v_hash TEXT;
	v_is_email BOOLEAN;
	v_ok BOOLEAN;
BEGIN
	v_is_email := POSITION('@' IN LOWER(p_identifier)) > 0;

	IF v_is_email THEN
		SELECT id, password_hash INTO v_user_id, v_hash
		FROM auth.users
		WHERE email = p_identifier::CITEXT
		LIMIT 1;
	ELSE
		SELECT id, password_hash INTO v_user_id, v_hash
		FROM auth.users
		WHERE username = p_identifier::CITEXT
		LIMIT 1;
	END IF;

	IF v_user_id IS NULL THEN
		RETURN NULL;
	END IF;

	v_ok := auth.verify_password_bcrypt(p_password, v_hash);
	IF NOT v_ok THEN
		RETURN NULL;
	END IF;

	UPDATE auth.users SET last_login_at = NOW() WHERE id = v_user_id;
	RETURN v_user_id;
END;
$$;

-- Create password reset token for a user by email. Returns (user_id, token, expires_at)
CREATE OR REPLACE FUNCTION auth.create_password_reset(
	p_email CITEXT,
	p_ttl_minutes INTEGER DEFAULT 30,
	p_request_ip INET DEFAULT NULL
) RETURNS TABLE (user_id UUID, token TEXT, expires_at TIMESTAMPTZ)
LANGUAGE plpgsql
AS $$
DECLARE
	v_user_id  UUID;
	v_token    TEXT;
	v_expires  TIMESTAMPTZ;
BEGIN
	SELECT u.id INTO v_user_id
	FROM auth.users u
	WHERE u.email = p_email
	LIMIT 1;

	IF v_user_id IS NULL THEN
		RETURN; -- no rows (email not found); deliberate to avoid leaking which emails exist
	END IF;

	v_token := auth.generate_secure_token(32);
	v_expires := NOW() + make_interval(mins => p_ttl_minutes);

	INSERT INTO auth.password_reset_tokens (user_id, token, expires_at)
	VALUES (v_user_id, v_token, v_expires);

	RETURN QUERY SELECT v_user_id, v_token, v_expires;
END;
$$;

-- Consume a password reset token and set a new password (bcrypt). Returns TRUE if successful.
CREATE OR REPLACE FUNCTION auth.consume_password_reset(
	p_token TEXT,
	p_new_password TEXT,
	p_consumer_ip INET DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
	v_user_id UUID;
	v_hash    TEXT;
BEGIN
	SELECT prt.user_id
	INTO v_user_id
	FROM auth.password_reset_tokens prt
	WHERE prt.token = p_token
		AND prt.consumed_at IS NULL
		AND prt.expires_at > NOW()
	ORDER BY prt.created_at DESC
	LIMIT 1
	FOR UPDATE;

	IF v_user_id IS NULL THEN
		RETURN FALSE;
	END IF;

	v_hash := auth.hash_password_bcrypt(p_new_password);
	UPDATE auth.users SET password_hash = v_hash WHERE id = v_user_id;

	UPDATE auth.password_reset_tokens
	SET consumed_at = NOW(), consumed_by_ip = p_consumer_ip
	WHERE token = p_token;

	RETURN TRUE;
END;
$$;
