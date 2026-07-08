CREATE TABLE "auth_rate_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"blocked_until" timestamp with time zone,
	"last_attempt_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
