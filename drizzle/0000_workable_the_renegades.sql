CREATE TYPE "public"."asset_kind" AS ENUM('image', 'video', 'document', 'deck');--> statement-breakpoint
CREATE TYPE "public"."product_role" AS ENUM('admin', 'admissions_manager', 'partnership_manager', 'sales_manager', 'viewer', 'affiliate');--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('draft', 'active', 'archived');--> statement-breakpoint
CREATE TYPE "public"."visibility" AS ENUM('internal', 'team', 'affiliate');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"actor_user_id" text NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"details" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_assets" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"kind" "asset_kind" DEFAULT 'image' NOT NULL,
	"label" text NOT NULL,
	"url" text NOT NULL,
	"storage_path" text,
	"visibility" "visibility" DEFAULT 'team' NOT NULL,
	"alt_text" text DEFAULT '' NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"route" text NOT NULL,
	"summary" text NOT NULL,
	"pitch" text NOT NULL,
	"audience" text NOT NULL,
	"owner_team" text NOT NULL,
	"status" "product_status" DEFAULT 'draft' NOT NULL,
	"visibility" "visibility" DEFAULT 'team' NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"price_in_cents" integer,
	"expires_at" timestamp with time zone,
	"notes" text DEFAULT '' NOT NULL,
	"created_by" text NOT NULL,
	"updated_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "product_role" DEFAULT 'viewer' NOT NULL,
	"custom_grants" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_assets" ADD CONSTRAINT "product_assets_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_assets" ADD CONSTRAINT "product_assets_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;