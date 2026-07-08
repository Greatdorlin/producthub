ALTER TABLE "products" ALTER COLUMN "currency" SET DEFAULT 'NGN';--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "access_roles" text[] DEFAULT ARRAY[]::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "slots_available" integer;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "expected_sales" integer;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "expected_sales_period" text DEFAULT '' NOT NULL;--> statement-breakpoint
UPDATE "products"
SET "access_roles" = CASE
  WHEN "visibility" = 'internal' THEN ARRAY['admissions_manager', 'partnership_manager', 'sales_manager']::text[]
  WHEN "visibility" = 'team' THEN ARRAY['admissions_manager', 'partnership_manager', 'sales_manager', 'viewer']::text[]
  ELSE ARRAY['admissions_manager', 'partnership_manager', 'sales_manager', 'viewer', 'affiliate']::text[]
END;
