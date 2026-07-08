import { type ProductAccessRole, PRODUCT_VISIBILITY, type ProductVisibility } from "@/lib/constants";

export function deriveAssetVisibilityFromRoles(accessRoles: readonly ProductAccessRole[]): ProductVisibility {
  if (accessRoles.includes("affiliate")) {
    return "affiliate";
  }

  if (accessRoles.includes("viewer")) {
    return "team";
  }

  return "internal";
}

export function getAllowedAssetVisibility(accessRoles: readonly ProductAccessRole[]) {
  const derivedVisibility = deriveAssetVisibilityFromRoles(accessRoles);
  const maxIndex = PRODUCT_VISIBILITY.indexOf(derivedVisibility);

  return PRODUCT_VISIBILITY.slice(0, maxIndex + 1);
}

export function canUserAccessProductAssets(
  accessRoles: readonly ProductAccessRole[],
  userRole: ProductAccessRole | "admin",
) {
  if (userRole === "admin") {
    return true;
  }

  return accessRoles.includes(userRole);
}
