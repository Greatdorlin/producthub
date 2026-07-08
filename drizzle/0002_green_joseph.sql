ALTER TYPE "public"."asset_kind" ADD VALUE 'motion' BEFORE 'document';--> statement-breakpoint
ALTER TYPE "public"."product_role" ADD VALUE 'marketing_manager' BEFORE 'partnership_manager';--> statement-breakpoint
UPDATE "products"
SET "access_roles" = ARRAY(
  SELECT DISTINCT role_name
  FROM unnest(array_append("access_roles", 'marketing_manager')) AS role_name
);
