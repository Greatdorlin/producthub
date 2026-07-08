import { PERMISSIONS, type Permission, type ProductRole } from "@/lib/constants";

export const rolePermissionMap: Record<ProductRole, Permission[]> = {
  admin: [...PERMISSIONS],
  admissions_manager: [
    "dashboard:view",
    "products:view",
    "products:edit",
    "products:price",
    "assets:view",
    "assets:manage",
    "activity:view",
  ],
  marketing_manager: [
    "dashboard:view",
    "products:view",
    "assets:view",
    "assets:manage",
  ],
  partnership_manager: [
    "dashboard:view",
    "products:view",
    "products:edit",
    "products:price",
    "assets:view",
    "assets:manage",
    "activity:view",
  ],
  sales_manager: [
    "dashboard:view",
    "products:view",
    "products:edit",
    "products:price",
    "assets:view",
    "assets:manage",
    "activity:view",
  ],
  viewer: ["dashboard:view", "products:view", "assets:view"],
  affiliate: ["dashboard:view", "products:view", "assets:view"],
};

function normalizePermissionList(values: string[] | null | undefined) {
  return Array.from(new Set(values ?? [])).filter((value): value is Permission =>
    PERMISSIONS.includes(value as Permission),
  );
}

export function getBasePermissions(role: ProductRole) {
  return [...rolePermissionMap[role]];
}

export function resolvePermissions(
  role: ProductRole,
  customGrants: string[] | null | undefined,
  deniedPermissions: string[] | null | undefined = [],
) {
  const denied = new Set(normalizePermissionList(deniedPermissions));

  return normalizePermissionList([...rolePermissionMap[role], ...(customGrants ?? [])]).filter(
    (value) => !denied.has(value),
  );
}

export function splitPermissionOverrides(
  role: ProductRole,
  requestedPermissions: string[] | null | undefined,
) {
  const basePermissions = getBasePermissions(role);
  const requested = new Set(normalizePermissionList(requestedPermissions));

  return {
    customGrants: Array.from(requested).filter((permission) => !basePermissions.includes(permission)),
    deniedPermissions: basePermissions.filter((permission) => !requested.has(permission)),
  };
}

export function hasPermission(
  permissions: Permission[],
  permission: Permission,
) {
  return permissions.includes(permission);
}
