"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Database, Image, UserRound, Users } from "lucide-react";

import type { Permission } from "@/lib/constants";

const tabs = [
  { href: "/settings/profile", label: "Profile", icon: UserRound, permission: "dashboard:view" },
  { href: "/settings/branding", label: "Branding", icon: Image, permission: "people:manage" },
  { href: "/settings/access", label: "Access", icon: Users, permission: "people:view" },
  { href: "/settings/backups", label: "Backups", icon: Database, permission: "people:manage" },
  { href: "/settings/activity", label: "Activity", icon: Activity, permission: "activity:view" },
] satisfies Array<{
  href: string;
  label: string;
  icon: typeof Users;
  permission: Permission;
}>;

export function SettingsTabs({ permissions }: { permissions: Permission[] }) {
  const pathname = usePathname();
  const visibleTabs = tabs.filter((tab) => permissions.includes(tab.permission));

  if (visibleTabs.length <= 1) {
    return null;
  }

  return (
    <nav className="ld-settings-tabs" aria-label="Settings sections">
      {visibleTabs.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`ld-settings-tab ${active ? "is-active" : ""}`}
          >
            <Icon className="size-4" />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
