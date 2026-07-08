ALTER TABLE "users" ADD COLUMN "mfa_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "mfa_secret_encrypted" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "mfa_recovery_codes_hash" text[] DEFAULT ARRAY[]::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "mfa_enabled_at" timestamp with time zone;