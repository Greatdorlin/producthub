CREATE TYPE "public"."product_priority" AS ENUM('low', 'normal', 'high', 'urgent');--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "priority" "product_priority" DEFAULT 'normal' NOT NULL;