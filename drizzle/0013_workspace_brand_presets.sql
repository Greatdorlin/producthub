ALTER TABLE "workspace_settings" ADD COLUMN IF NOT EXISTS "theme_preset" text DEFAULT 'command-graphite' NOT NULL;
ALTER TABLE "workspace_settings" ADD COLUMN IF NOT EXISTS "font_preset" text DEFAULT 'system' NOT NULL;

UPDATE "workspace_settings"
SET
  "theme_preset" = 'command-graphite',
  "font_preset" = COALESCE("font_preset", 'system'),
  "primary_color" = '#5b7cfa',
  "accent_color" = '#22c55e',
  "page_background" = '#111113',
  "surface_color" = '#1b1c20',
  "text_color" = '#f8fafc',
  "muted_text_color" = '#a3a8b3';
