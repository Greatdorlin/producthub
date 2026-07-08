ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "custom_fields" jsonb DEFAULT '{}'::jsonb NOT NULL;
ALTER TABLE "workspace_settings" ALTER COLUMN "brand_name" SET DEFAULT 'ProductHub';
