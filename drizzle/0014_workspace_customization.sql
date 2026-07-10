ALTER TABLE "workspace_settings"
ADD COLUMN IF NOT EXISTS "default_currency" text DEFAULT 'USD' NOT NULL;

ALTER TABLE "workspace_settings"
ADD COLUMN IF NOT EXISTS "product_field_definitions" jsonb DEFAULT '[]'::jsonb NOT NULL;
