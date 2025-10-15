-- Create property_definitions table
-- Up
CREATE TABLE IF NOT EXISTS property_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  key TEXT NOT NULL,
  data_type TEXT NOT NULL CHECK (data_type IN ('text', 'number', 'boolean', 'datetime')),
  description TEXT,
  property_type TEXT NOT NULL CHECK (property_type IN ('default', 'custom')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT property_definitions_workspace_key_unique UNIQUE (workspace_id, key)
);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER set_property_definitions_updated_at
  BEFORE UPDATE ON property_definitions
  FOR EACH ROW
  EXECUTE PROCEDURE set_timestamp();
EXCEPTION WHEN duplicate_object THEN
  -- trigger already exists
  NULL;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_property_definitions_workspace_id ON property_definitions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_property_definitions_key ON property_definitions(key);

-- Down
-- DROP TABLE IF EXISTS property_definitions;