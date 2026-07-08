import type { Permission, ProductRole } from "@/lib/constants";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  role: ProductRole;
  permissions: Permission[];
}

export interface AuthAdapter {
  getSession(): Promise<AuthUser | null>;
  requirePermission(permission: Permission): Promise<AuthUser>;
  requireSession(): Promise<AuthUser>;
}
