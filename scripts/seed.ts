import bcrypt from "bcryptjs";
import { config } from "dotenv";
import { eq } from "drizzle-orm";

import { recordAuditEvent } from "@/lib/audit";
import { getDb } from "@/lib/db/client";
import { products, users, workspaceSettings } from "@/lib/db/schema";
import { createId, slugify } from "@/lib/utils";

config({ path: ".env.local" });

async function main() {
  const [{ getDefaultCurrency, getIndustryPreset }, { siteConfig }] = await Promise.all([
    import("@/lib/config/industries"),
    import("@/lib/config/site"),
  ]);
  const db = getDb();
  const preset = getIndustryPreset();
  const categories = preset.productDefaults.categories;
  const routes = preset.productDefaults.routes;
  const defaultCurrency = getDefaultCurrency();

  const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL;
  const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  const adminName = process.env.ADMIN_BOOTSTRAP_NAME ?? `${siteConfig.brandName} Admin`;

  await db
    .insert(workspaceSettings)
    .values({
      id: "default",
      brandName: siteConfig.brandName,
      defaultCurrency,
      productCategories: categories,
      productRoutes: routes,
    })
    .onConflictDoUpdate({
      target: workspaceSettings.id,
      set: {
        brandName: siteConfig.brandName,
        defaultCurrency,
        updatedAt: new Date(),
      },
    });

  if (!adminEmail || !adminPassword) {
    console.log("Workspace settings seeded. Set ADMIN_BOOTSTRAP_EMAIL and ADMIN_BOOTSTRAP_PASSWORD to seed sample products, or visit /setup to create the first admin.");
    return;
  }

  const normalizedAdminEmail = adminEmail.toLowerCase();
  const [existingAdmin] = await db.select({ id: users.id }).from(users).where(eq(users.email, normalizedAdminEmail)).limit(1);
  const adminId = existingAdmin?.id ?? createId("usr");

  if (!existingAdmin) {
    await db.insert(users).values({
      id: adminId,
      name: adminName,
      email: normalizedAdminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      role: "admin",
    });
  }

  const seededProducts = [
    {
      name: `${categories[0] ?? "Service"} Launch Package`,
      category: categories[0] ?? "Service",
      route: routes[0] ?? "Online",
      summary:
        "A focused offer for buyers who need a clear packaged outcome, pricing, and delivery path.",
      pitch:
        "Use this when the buyer needs a fast path from interest to a documented product decision.",
      audience: "Qualified prospects",
      ownerTeam: "Operations",
      status: "active" as const,
      visibility: "team" as const,
      accessRoles: ["admissions_manager", "sales_manager", "viewer"],
      assetAccessRoles: ["marketing_manager", "sales_manager", "viewer"],
      currency: defaultCurrency,
      priceInCents: 45000000,
      slotsAvailable: 80,
      expectedSales: 52,
      expectedSalesPeriod: "Next 30 days",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 32),
      notes: "Keep pricing aligned with campus intake windows.",
    },
    {
      name: `${categories[1] ?? "Package"} Partner Offer`,
      category: categories[1] ?? categories[0] ?? "Package",
      route: routes[1] ?? routes[0] ?? "Hybrid",
      summary:
        "A partner-ready product with approved positioning, price guidance, and reusable sales material.",
      pitch:
        "Use this when partners or affiliates need a controlled version of the product story.",
      audience: "Partners and channel sellers",
      ownerTeam: "Partnerships",
      status: "active" as const,
      visibility: "affiliate" as const,
      accessRoles: ["partnership_manager", "sales_manager", "viewer", "affiliate"],
      assetAccessRoles: ["partnership_manager", "sales_manager", "affiliate"],
      currency: defaultCurrency,
      priceInCents: 250000,
      slotsAvailable: 18,
      expectedSales: 11,
      expectedSalesPeriod: "This quarter",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 18),
      notes: "Affiliate-safe. Keep promo deck approved before external sharing.",
    },
    {
      name: `${categories[2] ?? "Product"} Planning Intensive`,
      category: categories[2] ?? categories[0] ?? "Product",
      route: routes[2] ?? routes[0] ?? "Onsite",
      summary:
        "A draft product for teams validating demand, capacity, pricing, and launch readiness.",
      pitch:
        "Use this before launch when the buyer needs more clarity on delivery, timeline, or economics.",
      audience: "High-intent prospects",
      ownerTeam: "Product Team",
      status: "draft" as const,
      visibility: "internal" as const,
      accessRoles: ["admissions_manager", "partnership_manager", "sales_manager"],
      assetAccessRoles: ["admissions_manager", "partnership_manager", "sales_manager"],
      currency: defaultCurrency,
      priceInCents: 60000000,
      slotsAvailable: 24,
      expectedSales: 9,
      expectedSalesPeriod: "Next 60 days",
      expiresAt: null,
      notes: "Waiting for final positioning before launch.",
    },
  ];

  for (const seededProduct of seededProducts) {
    const productId = createId("prod");

    await db.insert(products).values({
      id: productId,
      slug: `${slugify(seededProduct.name)}-${productId.slice(-6)}`,
      createdBy: adminId,
      updatedBy: adminId,
      updatedAt: new Date(),
      ...seededProduct,
    });

  }

  await recordAuditEvent({
    actorUserId: adminId,
    action: "seed.completed",
    entityType: "system",
    entityId: adminId,
    details: { seededProducts: seededProducts.length, seededAssets: 0, industryTemplate: preset.id },
  });
}

main()
  .then(() => {
    console.log("Seed completed.");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
