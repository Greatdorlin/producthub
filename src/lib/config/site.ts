export const siteConfig = {
  brandName: process.env.BRAND_NAME || "ProductHub",
  brandTagline: process.env.BRAND_TAGLINE || "Product Documentation Workspace",
  defaultCurrency: process.env.DEFAULT_CURRENCY || "USD",
  industryTemplate: process.env.INDUSTRY_TEMPLATE || "generic",

  features: {
    mfa: process.env.ENABLE_MFA !== "false",
    affiliateRole: process.env.ENABLE_AFFILIATE_ROLE === "true",
    assetUploads: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    productExpiry: process.env.ENABLE_EXPIRY !== "false",
    salesTracking: process.env.ENABLE_SALES_TRACKING !== "false",
  },
};
