import { relations, sql } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { ASSET_KIND, PRODUCT_PRIORITY, PRODUCT_ROLES, PRODUCT_STATUS, PRODUCT_VISIBILITY } from "@/lib/constants";

export const productRoleEnum = pgEnum("product_role", PRODUCT_ROLES);
export const productStatusEnum = pgEnum("product_status", PRODUCT_STATUS);
export const productPriorityEnum = pgEnum("product_priority", PRODUCT_PRIORITY);
export const visibilityEnum = pgEnum("visibility", PRODUCT_VISIBILITY);
export const assetKindEnum = pgEnum("asset_kind", ASSET_KIND);

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  mfaEnabled: boolean("mfa_enabled").notNull().default(false),
  mfaSecretEncrypted: text("mfa_secret_encrypted"),
  mfaRecoveryCodesHash: text("mfa_recovery_codes_hash")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  mfaEnabledAt: timestamp("mfa_enabled_at", { withTimezone: true }),
  avatarUrl: text("avatar_url"),
  avatarStoragePath: text("avatar_storage_path"),
  role: productRoleEnum("role").notNull().default("viewer"),
  customGrants: text("custom_grants")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  deniedPermissions: text("denied_permissions")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const authRateLimits = pgTable("auth_rate_limits", {
  key: text("key").primaryKey(),
  attemptCount: integer("attempt_count").notNull().default(0),
  blockedUntil: timestamp("blocked_until", { withTimezone: true }),
  lastAttemptAt: timestamp("last_attempt_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  route: text("route").notNull(),
  summary: text("summary").notNull(),
  pitch: text("pitch").notNull(),
  audience: text("audience").notNull(),
  ownerTeam: text("owner_team").notNull(),
  status: productStatusEnum("status").notNull().default("draft"),
  priority: productPriorityEnum("priority").notNull().default("normal"),
  visibility: visibilityEnum("visibility").notNull().default("team"),
  accessRoles: text("access_roles")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  assetAccessRoles: text("asset_access_roles")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  currency: text("currency").notNull().default("NGN"),
  priceInCents: integer("price_in_cents"),
  feeItems: jsonb("fee_items")
    .$type<Array<{ label: string; amountInCents: number }>>()
    .notNull()
    .default(sql`'[]'::jsonb`),
  slotsAvailable: integer("slots_available"),
  expectedSales: integer("expected_sales"),
  expectedSalesPeriod: text("expected_sales_period").notNull().default(""),
  customFields: jsonb("custom_fields")
    .$type<Record<string, string | number | boolean>>()
    .notNull()
    .default(sql`'{}'::jsonb`),
  salesStartsAt: timestamp("sales_starts_at", { withTimezone: true }),
  salesEndsAt: timestamp("sales_ends_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  notes: text("notes").notNull().default(""),
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id),
  updatedBy: text("updated_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const productAssets = pgTable("product_assets", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  kind: assetKindEnum("kind").notNull().default("image"),
  label: text("label").notNull(),
  url: text("url").notNull(),
  storagePath: text("storage_path"),
  visibility: visibilityEnum("visibility").notNull().default("team"),
  altText: text("alt_text").notNull().default(""),
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const workspaceSettings = pgTable("workspace_settings", {
  id: text("id").primaryKey(),
  brandName: text("brand_name").notNull().default("ProductHub"),
  logoUrl: text("logo_url"),
  logoStoragePath: text("logo_storage_path"),
  industryTemplate: text("industry_template").notNull().default("generic"),
  themePreset: text("theme_preset").notNull().default("command-graphite"),
  fontPreset: text("font_preset").notNull().default("system"),
  primaryColor: text("primary_color").notNull().default("#4f46e5"),
  accentColor: text("accent_color").notNull().default("#14b8a6"),
  pageBackground: text("page_background").notNull().default("#151515"),
  surfaceColor: text("surface_color").notNull().default("#1f1f23"),
  textColor: text("text_color").notNull().default("#f8fafc"),
  mutedTextColor: text("muted_text_color").notNull().default("#a1a1aa"),
  updatedBy: text("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: text("id").primaryKey(),
  actorUserId: text("actor_user_id")
    .notNull()
    .references(() => users.id),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  details: jsonb("details")
    .$type<Record<string, unknown>>()
    .notNull()
    .default(sql`'{}'::jsonb`),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const productsRelations = relations(products, ({ many, one }) => ({
  assets: many(productAssets),
  creator: one(users, {
    fields: [products.createdBy],
    references: [users.id],
  }),
  updater: one(users, {
    fields: [products.updatedBy],
    references: [users.id],
  }),
}));

export const productAssetsRelations = relations(productAssets, ({ one }) => ({
  product: one(products, {
    fields: [productAssets.productId],
    references: [products.id],
  }),
}));
