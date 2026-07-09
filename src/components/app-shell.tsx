"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";
import { useSyncExternalStore } from "react";
import {
  Boxes,
  ChevronRight,
  FolderKanban,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Settings2,
  Settings,
  ShieldCheck,
} from "lucide-react";

import type { Permission } from "@/lib/constants";

const shellLinks = [
  { href: "/dashboard#content-start", label: "Overview", icon: LayoutDashboard, permissions: ["dashboard:view"] },
  { href: "/products#content-start", label: "Products", icon: Boxes, permissions: ["products:view"] },
  { href: "/library#assets", label: "Asset Library", icon: FolderKanban, permissions: ["assets:view"] },
  { href: "/settings#content-start", label: "Settings", icon: Settings, permissions: ["dashboard:view"] },
] satisfies Array<{
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  permissions: Permission[];
}>;

type AppShellProps = {
  user: {
    name: string;
    avatarUrl?: string | null;
    role: string;
    permissions: Permission[];
  };
  branding: {
    brandName: string;
    logoUrl: string | null;
    industryTemplate: string;
    primaryColor: string;
    accentColor: string;
    pageBackground: string;
    surfaceColor: string;
    textColor: string;
    mutedTextColor: string;
    fontFamily: string;
  };
  topSlot: React.ReactNode;
  children: React.ReactNode;
};

type WorkspaceThemeStyle = CSSProperties & Record<`--${string}`, string>;
const SIDEBAR_STORAGE_KEY = "producthub.sidebar.collapsed";

function subscribeSidebarCollapsed(onStoreChange: () => void) {
  const handleChange = () => {
    onStoreChange();
  };

  window.addEventListener("storage", handleChange);
  window.addEventListener("producthub-sidebar-collapsed-change", handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener("producthub-sidebar-collapsed-change", handleChange);
  };
}

function getSidebarCollapsedSnapshot() {
  try {
    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function buildThemeStyle(branding: AppShellProps["branding"]): WorkspaceThemeStyle {
  return {
    "--background": branding.pageBackground,
    "--foreground": branding.textColor,
    "--ld-color-primary": branding.primaryColor,
    "--ld-color-primary-strong": `color-mix(in srgb, ${branding.primaryColor} 68%, white)`,
    "--ld-color-accent": branding.accentColor,
    "--ld-color-accent-soft": `color-mix(in srgb, ${branding.accentColor} 28%, white)`,
    "--ld-color-background": branding.pageBackground,
    "--ld-color-background-soft": `color-mix(in srgb, ${branding.pageBackground} 76%, white)`,
    "--ld-color-background-deep": `color-mix(in srgb, ${branding.pageBackground} 82%, black)`,
    "--ld-color-surface": branding.surfaceColor,
    "--ld-color-surface-strong": `color-mix(in srgb, ${branding.surfaceColor} 88%, black)`,
    "--ld-color-card": `color-mix(in srgb, ${branding.surfaceColor} 82%, white)`,
    "--ld-color-card-strong": `color-mix(in srgb, ${branding.surfaceColor} 72%, white)`,
    "--ld-color-card-border": `color-mix(in srgb, ${branding.textColor} 16%, transparent)`,
    "--ld-color-sidebar": `color-mix(in srgb, ${branding.surfaceColor} 84%, black)`,
    "--ld-color-sidebar-active": `color-mix(in srgb, ${branding.primaryColor} 26%, ${branding.surfaceColor})`,
    "--ld-color-text": branding.textColor,
    "--ld-color-muted": branding.mutedTextColor,
    "--ld-font-family": branding.fontFamily,
    "--ld-background-image": branding.pageBackground,
    "--ld-gradient-hero": `linear-gradient(135deg, color-mix(in srgb, ${branding.primaryColor} 20%, ${branding.surfaceColor}), ${branding.surfaceColor})`,
    "--ld-gradient-panel": branding.surfaceColor,
  };
}

function BrandMark({ branding }: { branding: AppShellProps["branding"] }) {
  return (
    <span
      className="inline-flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.06] text-white"
      title={branding.brandName}
      aria-label={branding.brandName}
    >
      {branding.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={branding.logoUrl}
          alt={`${branding.brandName} logo`}
          className="h-full w-full object-contain"
        />
      ) : (
        <ShieldCheck className="size-5" />
      )}
    </span>
  );
}

function UserAvatar({
  name,
  avatarUrl,
  className = "size-10",
}: {
  name: string;
  avatarUrl?: string | null;
  className?: string;
}) {
  return (
    <div className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--ld-color-accent-soft)] text-sm font-bold text-[#08172b] ${className}`}>
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt={`${name} profile picture`} className="h-full w-full object-cover" />
      ) : (
        name.slice(0, 1).toUpperCase()
      )}
    </div>
  );
}

function ProfileEntry({
  user,
  compact = false,
  collapsed = false,
}: {
  user: AppShellProps["user"];
  compact?: boolean;
  collapsed?: boolean;
}) {
  return (
    <Link
      href="/settings/profile"
      className={`group ${compact ? "inline-flex" : "block"} rounded-[14px] transition hover:brightness-110`}
      aria-label="Open profile settings"
      title="Open profile settings"
    >
      <div
        className={`flex items-center gap-3 ${compact ? (collapsed ? "size-11 justify-center rounded-full border border-white/12 bg-white/[0.06] p-0" : "rounded-full border border-white/12 bg-white/[0.06] px-2.5 py-2") : "rounded-[14px] border border-white/10 bg-white/[0.045] p-4 hover:border-white/16 hover:bg-white/[0.075]"}`}
      >
        <UserAvatar name={user.name} avatarUrl={user.avatarUrl} className={compact ? "size-10" : "size-11"} />
        {!compact ? (
          <>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-white">{user.name}</div>
              <div className="truncate text-xs text-white/48">Profile and security</div>
            </div>
            <Settings2 className="size-4 text-white/42 transition group-hover:text-white/72" />
          </>
        ) : null}
      </div>
    </Link>
  );
}

export function AppShell({ user, branding, topSlot, children }: AppShellProps) {
  const pathname = usePathname();
  const sidebarCollapsed = useSyncExternalStore(
    subscribeSidebarCollapsed,
    getSidebarCollapsedSnapshot,
    () => false,
  );
  const themeStyle = buildThemeStyle(branding);
  const sidebarWidth = sidebarCollapsed ? "var(--ld-sidebar-collapsed-width)" : "var(--ld-sidebar-width)";

  function setSidebarCollapsed(nextValue: boolean) {
    try {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(nextValue));
    } catch {
      // Ignore storage errors; collapse state still updates for the current render.
    }

    window.dispatchEvent(new Event("producthub-sidebar-collapsed-change"));
  }

  return (
    <div className="ld-app-background" style={{ ...themeStyle, "--ld-sidebar-current-width": sidebarWidth } as WorkspaceThemeStyle}>
      <div className="ld-shell-grid relative z-10 mx-auto grid min-h-screen max-w-[var(--ld-page-max-width)] grid-cols-1 gap-4 px-3 py-3 lg:grid-cols-[var(--ld-sidebar-current-width)_minmax(0,1fr)] lg:px-5 lg:py-5">
        <aside
          className={`ld-glass-sidebar ld-shell-sidebar relative overflow-hidden rounded-[14px] px-4 py-5 text-white transition-[width] duration-200 ease-out lg:sticky lg:top-5 lg:self-start ${
            sidebarCollapsed ? "lg:px-3" : ""
          }`}
          data-collapsed={sidebarCollapsed ? "true" : "false"}
        >
          <div className="ld-shell-sidebar-inner relative flex h-full flex-col">
            <div className="ld-shell-brand space-y-5">
              <div className="ld-mobile-brand flex items-center justify-between gap-3 lg:hidden">
                <div className="flex items-center gap-3">
                  <BrandMark branding={branding} />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-white">{branding.brandName}</div>
                    <div className="truncate text-xs text-white/48">Workspace</div>
                  </div>
                </div>
                <ProfileEntry user={user} compact collapsed />
              </div>

              <div className="hidden lg:block">
                <div className="flex items-start justify-between gap-3">
                  <BrandMark branding={branding} />

                  <button
                    type="button"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/72 transition hover:border-white/18 hover:bg-white/[0.08] hover:text-white"
                    aria-label={sidebarCollapsed ? "Expand side menu" : "Collapse side menu"}
                    title={sidebarCollapsed ? "Expand side menu" : "Collapse side menu"}
                  >
                    {sidebarCollapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
                  </button>
                </div>

                {!sidebarCollapsed ? (
                  <div className="mt-5">
                    <p className="text-sm text-white/58">{branding.brandName}</p>
                    <p className="mt-1 text-xs text-white/40">Products, assets, access, and backups in one place.</p>
                  </div>
                ) : null}
              </div>
            </div>

            <nav className="ld-shell-nav mt-2 flex gap-2 overflow-x-auto pb-1 lg:mt-8 lg:block lg:overflow-visible lg:pb-0">
              {shellLinks
                .filter((link) => link.permissions.some((permission) => user.permissions.includes(permission)))
                .map((link) => {
                  const linkPath = link.href.split("#")[0];
                  const active = pathname === linkPath || pathname.startsWith(`${linkPath}/`);
                  const Icon = link.icon;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`group ld-shell-nav-link flex items-center justify-between rounded-[12px] border px-3 py-3 transition lg:mb-2 ${
                        active
                          ? "ld-glass-active"
                          : "border-transparent bg-white/[0.03] text-white/70 hover:border-white/12 hover:bg-white/[0.07] hover:text-white"
                      } ${sidebarCollapsed ? "min-w-0 lg:justify-center lg:px-2" : "min-w-[144px] lg:min-w-0"}`}
                      title={link.label}
                    >
                      <span className={`flex items-center gap-3 ${sidebarCollapsed ? "lg:justify-center" : ""}`}>
                        <span className={`rounded-[10px] border p-2 ${active ? "border-white/18 bg-white/12" : "border-white/8 bg-black/10"}`}>
                          <Icon className="size-4" />
                        </span>
                        <span className={`text-sm font-medium ${sidebarCollapsed ? "lg:hidden" : ""}`}>{link.label}</span>
                      </span>
                      <ChevronRight className={`size-4 transition ${sidebarCollapsed ? "lg:hidden" : active ? "opacity-100" : "opacity-0 group-hover:opacity-60"}`} />
                    </Link>
                  );
                })}
            </nav>

            <div className="ld-shell-profile mt-auto">
              <ProfileEntry user={user} compact={sidebarCollapsed} collapsed={sidebarCollapsed} />
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen flex-col gap-5">
          {topSlot}
          <main id="content-start" className="ld-main-surface flex-1 scroll-mt-4">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
