-- Inventory Schema
-- This table stores user's material inventory with quantities

CREATE TABLE IF NOT EXISTS recycling.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    material_label TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    max_quantity INTEGER NOT NULL DEFAULT 1,
    image_url TEXT,
    confidence NUMERIC(5,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure unique material per user
    CONSTRAINT unique_user_material UNIQUE (user_id, material_label)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON recycling.inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_created_at ON recycling.inventory(created_at DESC);

-- Trigger to update updated_at timestamp
DROP TRIGGER IF EXISTS trg_inventory_updated_at ON recycling.inventory;
CREATE TRIGGER trg_inventory_updated_at
    BEFORE UPDATE ON recycling.inventory
    FOR EACH ROW
    EXECUTE FUNCTION recycling.set_updated_at();

-- Function to sync inventory from scan history
-- This aggregates scan history into inventory items
CREATE OR REPLACE FUNCTION recycling.sync_inventory_from_scans(p_user_id UUID)
RETURNS void AS $$
BEGIN
    -- Insert or update inventory based on scan history
    INSERT INTO recycling.inventory (user_id, material_label, quantity, max_quantity, image_url, confidence)
    SELECT 
        user_id,
        material_label,
        COUNT(*) as quantity,
        COUNT(*) as max_quantity,
        (ARRAY_AGG(image_url ORDER BY created_at DESC))[1] as image_url,
        (ARRAY_AGG(confidence ORDER BY created_at DESC))[1] as confidence
    FROM recycling.scan_history
    WHERE user_id = p_user_id
    GROUP BY user_id, material_label
    ON CONFLICT (user_id, material_label) 
    DO UPDATE SET
        max_quantity = EXCLUDED.max_quantity,
        quantity = LEAST(recycling.inventory.quantity, EXCLUDED.max_quantity),
        image_url = COALESCE(EXCLUDED.image_url, recycling.inventory.image_url),
        confidence = COALESCE(EXCLUDED.confidence, recycling.inventory.confidence),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
