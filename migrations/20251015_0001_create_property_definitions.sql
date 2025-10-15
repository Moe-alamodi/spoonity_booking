-- Create property_definitions table and related objects
-- Safe to run once in a fresh migration chain

-- Ensure required extensions exist
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create table
CREATE TABLE IF NOT EXISTS property_definitions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  key           TEXT NOT NULL,
  data_type     TEXT NOT NULL CHECK (data_type IN ('text','number','boolean','datetime')),
  description   TEXT,
  property_type TEXT NOT NULL CHECK (property_type IN ('default','custom')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);

-- Enforce uniqueness of active (non-deleted) keys per workspace via partial unique index
CREATE UNIQUE INDEX IF NOT EXISTS property_definitions_workspace_key_unique
  ON property_definitions(workspace_id, key)
  WHERE deleted_at IS NULL;

-- Helpful supporting indexes
CREATE INDEX IF NOT EXISTS property_definitions_workspace_idx
  ON property_definitions(workspace_id);

-- Generic trigger function to auto-update updated_at on row updates
CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger idempotently
DROP TRIGGER IF EXISTS trg_property_definitions_set_updated_at ON property_definitions;
CREATE TRIGGER trg_property_definitions_set_updated_at
BEFORE UPDATE ON property_definitions
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();
