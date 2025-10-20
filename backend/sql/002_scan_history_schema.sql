-- Scan History Schema
CREATE SCHEMA IF NOT EXISTS recycling;

-- Scan History Table
CREATE TABLE IF NOT EXISTS recycling.scan_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    material_label TEXT NOT NULL,
    confidence NUMERIC(5,2) NOT NULL,
    image_url TEXT,
    detection_details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_scan_history_user_id ON recycling.scan_history(user_id);
CREATE INDEX IF NOT EXISTS idx_scan_history_created_at ON recycling.scan_history(created_at DESC);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION recycling.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_scan_history_updated_at ON recycling.scan_history;
CREATE TRIGGER trg_scan_history_updated_at
    BEFORE UPDATE ON recycling.scan_history
    FOR EACH ROW
    EXECUTE FUNCTION recycling.set_updated_at();
