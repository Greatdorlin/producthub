ALTER TYPE "public"."product_status" ADD VALUE IF NOT EXISTS 'sold_out' AFTER 'active';

ALTER TABLE "workspace_settings"
  ADD COLUMN IF NOT EXISTS "product_categories" jsonb DEFAULT '[]'::jsonb NOT NULL,
  ADD COLUMN IF NOT EXISTS "product_routes" jsonb DEFAULT '[]'::jsonb NOT NULL,
  ADD COLUMN IF NOT EXISTS "field_label_overrides" jsonb DEFAULT '{}'::jsonb NOT NULL;
