-- Seed default property definitions derived from existing profiles columns
-- Assumptions:
-- - There is a profiles table with a workspace_id column
-- - There is a workspaces table referenced by property_definitions.workspace_id
-- - Default property keys and types are as follows
--     email (text), phoneNumber (text), birthdate (datetime), name (text),
--     country (text), city (text), street (text), stateProvince (text), postalCode (text),
--     createdAt (datetime)

WITH distinct_workspaces AS (
  SELECT DISTINCT workspace_id FROM profiles
)
INSERT INTO property_definitions (
  workspace_id, key, data_type, description, property_type
)
-- email
SELECT workspace_id, 'email', 'text', 'Email address', 'default' FROM distinct_workspaces
ON CONFLICT (workspace_id, key) WHERE property_definitions.deleted_at IS NULL DO NOTHING;

WITH distinct_workspaces AS (
  SELECT DISTINCT workspace_id FROM profiles
)
INSERT INTO property_definitions (workspace_id, key, data_type, description, property_type)
SELECT workspace_id, 'phoneNumber', 'text', 'Phone number', 'default' FROM distinct_workspaces
ON CONFLICT (workspace_id, key) WHERE property_definitions.deleted_at IS NULL DO NOTHING;

WITH distinct_workspaces AS (
  SELECT DISTINCT workspace_id FROM profiles
)
INSERT INTO property_definitions (workspace_id, key, data_type, description, property_type)
SELECT workspace_id, 'birthdate', 'datetime', 'Birthdate', 'default' FROM distinct_workspaces
ON CONFLICT (workspace_id, key) WHERE property_definitions.deleted_at IS NULL DO NOTHING;

WITH distinct_workspaces AS (
  SELECT DISTINCT workspace_id FROM profiles
)
INSERT INTO property_definitions (workspace_id, key, data_type, description, property_type)
SELECT workspace_id, 'name', 'text', 'Full name', 'default' FROM distinct_workspaces
ON CONFLICT (workspace_id, key) WHERE property_definitions.deleted_at IS NULL DO NOTHING;

-- Address fields
WITH distinct_workspaces AS (
  SELECT DISTINCT workspace_id FROM profiles
)
INSERT INTO property_definitions (workspace_id, key, data_type, description, property_type)
SELECT workspace_id, 'country', 'text', 'Country', 'default' FROM distinct_workspaces
ON CONFLICT (workspace_id, key) WHERE property_definitions.deleted_at IS NULL DO NOTHING;

WITH distinct_workspaces AS (
  SELECT DISTINCT workspace_id FROM profiles
)
INSERT INTO property_definitions (workspace_id, key, data_type, description, property_type)
SELECT workspace_id, 'city', 'text', 'City', 'default' FROM distinct_workspaces
ON CONFLICT (workspace_id, key) WHERE property_definitions.deleted_at IS NULL DO NOTHING;

WITH distinct_workspaces AS (
  SELECT DISTINCT workspace_id FROM profiles
)
INSERT INTO property_definitions (workspace_id, key, data_type, description, property_type)
SELECT workspace_id, 'street', 'text', 'Street address', 'default' FROM distinct_workspaces
ON CONFLICT (workspace_id, key) WHERE property_definitions.deleted_at IS NULL DO NOTHING;

WITH distinct_workspaces AS (
  SELECT DISTINCT workspace_id FROM profiles
)
INSERT INTO property_definitions (workspace_id, key, data_type, description, property_type)
SELECT workspace_id, 'stateProvince', 'text', 'State or province', 'default' FROM distinct_workspaces
ON CONFLICT (workspace_id, key) WHERE property_definitions.deleted_at IS NULL DO NOTHING;

WITH distinct_workspaces AS (
  SELECT DISTINCT workspace_id FROM profiles
)
INSERT INTO property_definitions (workspace_id, key, data_type, description, property_type)
SELECT workspace_id, 'postalCode', 'text', 'Postal code', 'default' FROM distinct_workspaces
ON CONFLICT (workspace_id, key) WHERE property_definitions.deleted_at IS NULL DO NOTHING;

-- createdAt timestamp
WITH distinct_workspaces AS (
  SELECT DISTINCT workspace_id FROM profiles
)
INSERT INTO property_definitions (workspace_id, key, data_type, description, property_type)
SELECT workspace_id, 'createdAt', 'datetime', 'Profile creation timestamp', 'default' FROM distinct_workspaces
ON CONFLICT (workspace_id, key) WHERE property_definitions.deleted_at IS NULL DO NOTHING;
