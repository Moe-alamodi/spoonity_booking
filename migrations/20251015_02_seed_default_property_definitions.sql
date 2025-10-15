-- Seed default property definitions for existing workspaces
-- Assumptions:
-- - There is a workspaces table with id
-- - Default properties come from profiles columns: name, email, address fields, created_at

WITH defaults AS (
  SELECT * FROM (
    VALUES
      ('email',        'text',     'Primary email address',               'default'),
      ('name',         'text',     'Full name',                           'default'),
      ('phoneNumber',  'text',     'Phone number',                        'default'),
      ('birthdate',    'datetime', 'Birthdate',                           'default'),
      ('country',      'text',     'Country',                             'default'),
      ('city',         'text',     'City',                                'default'),
      ('street',       'text',     'Street address',                      'default'),
      ('stateProvince','text',     'State or province',                   'default'),
      ('postalCode',   'text',     'Postal or ZIP code',                  'default'),
      ('createdAt',    'datetime', 'Profile created timestamp',           'default')
  ) AS t(key, data_type, description, property_type)
)
INSERT INTO property_definitions (workspace_id, key, data_type, description, property_type)
SELECT w.id, d.key, d.data_type, d.description, d.property_type
FROM workspaces w
CROSS JOIN defaults d
ON CONFLICT (workspace_id, key) DO NOTHING;
