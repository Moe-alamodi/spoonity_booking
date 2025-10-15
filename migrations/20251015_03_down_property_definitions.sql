-- Rollback for property_definitions and seeded data
-- This will drop the table and associated trigger/function

DO $$ BEGIN
  DROP TRIGGER IF EXISTS set_property_definitions_updated_at ON property_definitions;
EXCEPTION WHEN undefined_table THEN
  NULL;
END $$;

DO $$ BEGIN
  DROP FUNCTION IF EXISTS set_timestamp();
EXCEPTION WHEN undefined_function THEN
  NULL;
END $$;

DROP TABLE IF EXISTS property_definitions;