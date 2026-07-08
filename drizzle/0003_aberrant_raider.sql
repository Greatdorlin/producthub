CREATE TABLE "workspace_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"brand_name" text DEFAULT 'FlyConnect' NOT NULL,
	"logo_url" text,
	"logo_storage_path" text,
	"updated_by" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workspace_settings" ADD CONSTRAINT "workspace_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;