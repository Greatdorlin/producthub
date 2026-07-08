ALTER TABLE "workspace_settings" ADD COLUMN IF NOT EXISTS "industry_template" text DEFAULT 'generic' NOT NULL;
ALTER TABLE "workspace_settings" ADD COLUMN IF NOT EXISTS "primary_color" text DEFAULT '#4f46e5' NOT NULL;
ALTER TABLE "workspace_settings" ADD COLUMN IF NOT EXISTS "accent_color" text DEFAULT '#14b8a6' NOT NULL;
ALTER TABLE "workspace_settings" ADD COLUMN IF NOT EXISTS "page_background" text DEFAULT '#151515' NOT NULL;
ALTER TABLE "workspace_settings" ADD COLUMN IF NOT EXISTS "surface_color" text DEFAULT '#1f1f23' NOT NULL;
ALTER TABLE "workspace_settings" ADD COLUMN IF NOT EXISTS "text_color" text DEFAULT '#f8fafc' NOT NULL;
ALTER TABLE "workspace_settings" ADD COLUMN IF NOT EXISTS "muted_text_color" text DEFAULT '#a1a1aa' NOT NULL;
