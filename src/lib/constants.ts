export const PRODUCT_ROLES = [
  "admin",
  "admissions_manager",
  "marketing_manager",
  "partnership_manager",
  "sales_manager",
  "viewer",
  "affiliate",
] as const;

export type ProductRole = (typeof PRODUCT_ROLES)[number];

export const PRODUCT_ACCESS_ROLES = [
  "admissions_manager",
  "marketing_manager",
  "partnership_manager",
  "sales_manager",
  "viewer",
  "affiliate",
] as const;

export type ProductAccessRole = (typeof PRODUCT_ACCESS_ROLES)[number];

export const PRODUCT_VISIBILITY = ["internal", "team", "affiliate"] as const;
export type ProductVisibility = (typeof PRODUCT_VISIBILITY)[number];

export const PRODUCT_STATUS = ["draft", "active", "archived"] as const;
export type ProductStatus = (typeof PRODUCT_STATUS)[number];

export const PRODUCT_PRIORITY = ["low", "normal", "high", "urgent"] as const;
export type ProductPriority = (typeof PRODUCT_PRIORITY)[number];

export const ASSET_KIND = ["image", "video", "motion", "document", "deck"] as const;
export type AssetKind = (typeof ASSET_KIND)[number];

export const CURRENCY_OPTIONS = ["NGN", "USD"] as const;
export type ProductCurrency = (typeof CURRENCY_OPTIONS)[number];

export const PERMISSIONS = [
  "dashboard:view",
  "products:view",
  "products:edit",
  "products:price",
  "products:publish",
  "products:delete",
  "assets:view",
  "assets:manage",
  "people:view",
  "people:manage",
  "activity:view",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const ROUTE_OPTIONS = [
  "Study",
  "Work",
  "Visit",
  "Relocation",
  "Business",
  "Travel",
] as const;

export const CATEGORY_OPTIONS = [
  "Admissions",
  "Visa Advisory",
  "Relocation",
  "Partnership",
  "Travel",
  "Corporate",
] as const;

export const roleLabels: Record<ProductRole, string> = {
  admin: "Admin",
  admissions_manager: "Admissions Manager",
  marketing_manager: "Marketing Manager",
  partnership_manager: "Partnership Manager",
  sales_manager: "Sales Manager",
  viewer: "Viewer",
  affiliate: "Affiliate",
};

export const productAccessLabels: Record<ProductAccessRole, string> = {
  admissions_manager: "Admissions team",
  marketing_manager: "Marketing team",
  partnership_manager: "Partnership team",
  sales_manager: "Sales team",
  viewer: "View only",
  affiliate: "Affiliates",
};

export const currencyLabels: Record<ProductCurrency, string> = {
  NGN: "Naira",
  USD: "US Dollar",
};

export const statusLabels: Record<ProductStatus, string> = {
  draft: "Draft",
  active: "Live",
  archived: "Archived",
};

export const priorityLabels: Record<ProductPriority, string> = {
  low: "Low priority",
  normal: "Normal priority",
  high: "High priority",
  urgent: "Urgent",
};

export const assetVisibilityLabels: Record<ProductVisibility, string> = {
  internal: "Managers only",
  team: "Team access",
  affiliate: "Affiliate access",
};

export const permissionLabels: Record<Permission, string> = {
  "dashboard:view": "View dashboard",
  "products:view": "View products",
  "products:edit": "Edit product records",
  "products:price": "Edit product pricing",
  "products:publish": "Publish and archive products",
  "products:delete": "Delete products",
  "assets:view": "View product assets",
  "assets:manage": "Upload and manage assets",
  "people:view": "View users",
  "people:manage": "Create and manage users",
  "activity:view": "View audit activity",
};
