"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";
import {
  Boxes,
  ChevronRight,
  FolderKanban,
  LayoutDashboard,
  Settings2,
  Settings,
  ShieldCheck,
} from "lucide-react";

import type { Permission } from "@/lib/constants";

const shellLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, permissions: ["dashboard:view"] },
  { href: "/products", label: "Products", icon: Boxes, permissions: ["products:view"] },
  { href: "/library", label: "Asset Library", icon: FolderKanban, permissions: ["assets:view"] },
  { href: "/settings", label: "Settings", icon: Settings, permissions: ["dashboard:view"] },
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
  };
  topSlot: React.ReactNode;
  children: React.ReactNode;
};

type WorkspaceThemeStyle = CSSProperties & Record<`--${string}`, string>;

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
    "--ld-background-image": branding.pageBackground,
    "--ld-gradient-hero": `linear-gradient(135deg, color-mix(in srgb, ${branding.primaryColor} 20%, ${branding.surfaceColor}), ${branding.surfaceColor})`,
    "--ld-gradient-panel": branding.surfaceColor,
  };
}

function BrandMark({ branding }: { branding: AppShellProps["branding"] }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-[11px] font-semibold text-[var(--ld-color-accent)]">
      <span className="flex size-4 shrink-0 items-center justify-center overflow-hidden rounded-full">
        {branding.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={branding.logoUrl}
            alt={`${branding.brandName} logo`}
            className="h-full w-full object-contain"
          />
        ) : (
          <ShieldCheck className="size-3.5" />
        )}
      </span>
      <span className="truncate uppercase">{branding.brandName}</span>
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
}: {
  user: AppShellProps["user"];
  compact?: boolean;
}) {
  return (
    <Link
      href="/settings/profile"
      className={`group ${compact ? "inline-flex" : "block"} rounded-[14px] transition hover:brightness-110`}
      aria-label="Open profile settings"
      title="Open profile settings"
    >
      <div
        className={`flex items-center gap-3 ${compact ? "rounded-full border border-white/12 bg-white/[0.06] px-2.5 py-2" : "rounded-[14px] border border-white/10 bg-white/[0.045] p-4 hover:border-white/16 hover:bg-white/[0.075]"}`}
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
  const themeStyle = buildThemeStyle(branding);

  return (
    <div className="ld-app-background" style={themeStyle}>
      <div className="ld-shell-grid relative z-10 mx-auto grid min-h-screen max-w-[var(--ld-page-max-width)] grid-cols-1 gap-3 px-3 py-3 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-4 lg:py-4">
        <aside className="ld-glass-sidebar ld-shell-sidebar relative overflow-hidden rounded-[14px] px-4 py-5 text-white">
          <div className="ld-shell-sidebar-inner relative flex h-full flex-col">
            <div className="ld-shell-brand space-y-5">
              <div className="flex items-center justify-between gap-3 lg:hidden">
                <div className="min-w-0">
                  <BrandMark branding={branding} />
                  <div className="mt-3">
                    <div className="text-xl font-semibold text-white">{branding.brandName}</div>
                    <div className="text-xs text-white/52">Self-hosted product workspace</div>
                  </div>
                </div>

                <ProfileEntry user={user} compact />
              </div>

              <div className="hidden lg:block">
                <BrandMark branding={branding} />

                <div className="mt-5">
                  <h1 className="text-[2rem] font-semibold text-white">
                    {branding.brandName}
                  </h1>
                  <p className="mt-1 text-sm text-white/58">
                    Self-hosted product workspace.
                  </p>
                </div>
              </div>
            </div>

            <nav className="ld-shell-nav mt-2 flex gap-2 overflow-x-auto pb-1 lg:mt-8 lg:block lg:overflow-visible lg:pb-0">
              {shellLinks
                .filter((link) => link.permissions.some((permission) => user.permissions.includes(permission)))
                .map((link) => {
                  const resolvedHref =
                    link.href === "/products" && user.permissions.includes("products:edit")
                      ? "/products#create-product"
                      : link.href;
                  const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
                  const Icon = link.icon;

                  return (
                    <Link
                      key={link.href}
                      href={resolvedHref}
                      className={`group flex min-w-[144px] items-center justify-between rounded-[12px] border px-3 py-3 transition lg:mb-2 lg:min-w-0 ${
                        active
                          ? "ld-glass-active"
                          : "border-transparent bg-white/[0.03] text-white/70 hover:border-white/12 hover:bg-white/[0.07] hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className={`rounded-[10px] border p-2 ${active ? "border-white/18 bg-white/12" : "border-white/8 bg-black/10"}`}>
                          <Icon className="size-4" />
                        </span>
                        <span className="text-sm font-medium">{link.label}</span>
                      </span>
                      <ChevronRight className={`size-4 transition ${active ? "opacity-100" : "opacity-0 group-hover:opacity-60"}`} />
                    </Link>
                  );
                })}
            </nav>

            <div className="ld-shell-profile mt-auto">
              <ProfileEntry user={user} />
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen flex-col gap-4">
          {topSlot}
          <main className="ld-main-surface flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
