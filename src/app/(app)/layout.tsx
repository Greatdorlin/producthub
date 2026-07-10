import Link from "next/link";
import { Plus } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { LogoutButton } from "@/components/logout-button";
import { PreviewAccessSwitcher } from "@/components/preview-access-switcher";
import { WorkspaceSearch } from "@/components/workspace-search";
import { requireActualSession, requireSession } from "@/lib/auth/server";
import { getRoleLabel } from "@/lib/config/industries";
import { getPeopleData, getWorkspaceSettings } from "@/lib/data";

export default async function ProductAppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireSession();
  const actualUser = await requireActualSession();
  const [workspaceSettings, people] = await Promise.all([
    getWorkspaceSettings(),
    actualUser.permissions.includes("people:view") || actualUser.permissions.includes("people:manage")
      ? getPeopleData()
      : Promise.resolve([]),
  ]);
  const canEditProducts = user.permissions.includes("products:edit");
  const canPreviewUsers =
    actualUser.permissions.includes("people:view") || actualUser.permissions.includes("people:manage");
  const previewCandidates = people
    .filter((person) => person.isActive && person.id !== actualUser.userId)
    .map((person) => ({
      id: person.id,
      name: person.name,
      role: person.role,
    }));

  return (
    <AppShell
      user={{
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: user.role,
        permissions: user.permissions,
      }}
      branding={{
        brandName: workspaceSettings.brandName,
        logoUrl: workspaceSettings.logoUrl,
        industryTemplate: workspaceSettings.industryTemplate,
        primaryColor: workspaceSettings.primaryColor,
        accentColor: workspaceSettings.accentColor,
        pageBackground: workspaceSettings.pageBackground,
        surfaceColor: workspaceSettings.surfaceColor,
        textColor: workspaceSettings.textColor,
        mutedTextColor: workspaceSettings.mutedTextColor,
        fontFamily: workspaceSettings.fontFamily,
      }}
      topSlot={
        <header className="ld-topbar">
          <div className="ld-topbar-inner">
            <div className="ld-topbar-actions">
              <WorkspaceSearch />

              {canPreviewUsers ? (
                <PreviewAccessSwitcher
                  actualUserId={actualUser.userId}
                  actualUserName={actualUser.name}
                  actualUserRole={actualUser.role}
                  effectiveUserId={user.userId}
                  effectiveUserName={user.name}
                  effectiveUserRole={user.role}
                  isPreviewing={user.isPreviewing}
                  candidates={previewCandidates}
                  industryTemplate={workspaceSettings.industryTemplate}
                  compact
                />
              ) : null}

              <div className="ld-topbar-controls">
                <div className="ld-topbar-role hidden md:inline-flex">
                  {getRoleLabel(user.role, workspaceSettings.industryTemplate)}
                </div>

                {canEditProducts ? (
                  <Link
                    href="/products#create-product"
                    className="ld-glass-button inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition hover:brightness-110"
                  >
                    <Plus className="size-4" />
                    New product
                  </Link>
                ) : null}

                <LogoutButton />
              </div>
            </div>
          </div>
        </header>
      }
    >
      {children}
    </AppShell>
  );
}
