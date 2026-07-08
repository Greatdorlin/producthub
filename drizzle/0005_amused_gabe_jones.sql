ALTER TABLE "products" ADD COLUMN "asset_access_roles" text[] DEFAULT ARRAY[]::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "sales_starts_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "sales_ends_at" timestamp with time zone;--> statement-breakpoint
UPDATE "products" SET "asset_access_roles" = "access_roles" WHERE array_length("access_roles", 1) IS NOT NULL;
