import Link from "next/link";
import { ArrowRight, Boxes, Clock3, FolderKanban, Settings, Target } from "lucide-react";

import { chipClassName, priorityChipTone, statusChipTone } from "@/components/chip";
import { PreviewAccessSwitcher } from "@/components/preview-access-switcher";
import { requirePermission } from "@/lib/auth/server";
import { getRoleLabel } from "@/lib/config/industries";
import { priorityLabels, productAccessLabels, statusLabels } from "@/lib/constants";
import { getDashboardData, getPeopleData, getWorkspaceSettings } from "@/lib/data";
import { formatCurrencyFromCents, formatDateLabel, formatExpiryCountdown, getExpiryTone } from "@/lib/utils";

export default async function DashboardPage() {
  const viewer = await requirePermission("dashboard:view");
  const canPreviewUsers =
    viewer.actualPermissions.includes("people:view") || viewer.actualPermissions.includes("people:manage");
  const [data, people, workspaceSettings] = await Promise.all([
    getDashboardData(viewer),
    canPreviewUsers ? getPeopleData() : Promise.resolve([]),
    getWorkspaceSettings(),
  ]);
  const canOpenSettings = viewer.permissions.includes("people:view") || viewer.permissions.includes("activity:view");
  const canEditProducts = viewer.permissions.includes("products:edit");
  const previewCandidates = people
    .filter((person) => person.isActive && person.id !== viewer.actualUserId)
    .map((person) => ({
      id: person.id,
      name: person.name,
      role: person.role,
    }));
  const healthRows = [
    { label: "Live", value: data.stats.published, tone: "tone-success" },
    { label: "Draft", value: data.stats.draft, tone: "tone-calm" },
    { label: "Expiring", value: data.stats.expiringSoon, tone: "tone-warning" },
    { label: "Expired", value: data.stats.expired, tone: "tone-danger" },
  ];
  const quickActions = [
    { label: "Products", href: canEditProducts ? "/products#create-product" : "/products", icon: Boxes, show: viewer.permissions.includes("products:view") },
    { label: "Assets", href: "/library", icon: FolderKanban, show: viewer.permissions.includes("assets:view") },
    { label: "Settings", href: "/settings", icon: Settings, show: canOpenSettings || viewer.permissions.includes("dashboard:view") },
  ].filter((item) => item.show);

  return (
    <div className="ld-page">
      <section className="ld-glass-vibrant ld-hero">
        <div className="ld-page-header">
          <div>
            <div className="ld-page-meta">
              <span className={chipClassName("accent")}>
                <Target className="size-3.5" />
                Daily control
              </span>
              <span className={chipClassName("info")}>
                {viewer.isPreviewing
                  ? `Viewing ${getRoleLabel(viewer.role, workspaceSettings.industryTemplate)}`
                  : `Master ${getRoleLabel(viewer.actualRole, workspaceSettings.industryTemplate)} view`}
              </span>
            </div>
            <h2 className="ld-title mt-4">Product control.</h2>
            <p className="ld-subtitle mt-3">Track offers, assets, and expiry pressure.</p>
          </div>

          <div className="ld-stat-grid w-full xl:max-w-[620px]">
            {[
              { label: "Products", value: data.stats.products, tone: "tone-calm" },
              { label: "Live", value: data.stats.published, tone: "tone-success" },
              { label: "Expiring", value: data.stats.expiringSoon, tone: "tone-warning" },
              { label: "Assets", value: data.stats.assets, tone: "tone-calm" },
            ].map((stat) => (
              <div key={stat.label} className="ld-stat-card">
                <div className="ld-stat-label">{stat.label}</div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="ld-stat-value">{stat.value}</div>
                  <span className={`rounded-full px-3 py-1 text-sm font-semibold ${stat.tone}`}>
                    {stat.label === "Expiring" ? "Watch" : "Now"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {canPreviewUsers && previewCandidates.length ? (
        <section className="ld-glass-card ld-panel">
          <div className="ld-panel-header">
            <div>
              <div className="ld-kicker">Role preview</div>
              <h3 className="ld-panel-title mt-2">Switch the dashboard view</h3>
            </div>
          </div>

          <div className="mt-5">
            <PreviewAccessSwitcher
              actualUserId={viewer.actualUserId}
              actualUserName={viewer.actualName}
              actualUserRole={viewer.actualRole}
              effectiveUserId={viewer.userId}
              effectiveUserName={viewer.name}
              effectiveUserRole={viewer.role}
              isPreviewing={viewer.isPreviewing}
              candidates={previewCandidates}
              industryTemplate={workspaceSettings.industryTemplate}
            />
          </div>
        </section>
      ) : null}

      <section className="ld-dashboard-grid">
        <div className="ld-solid-panel ld-panel">
          <div className="ld-panel-header">
            <div>
              <div className="ld-kicker">Expiry watch</div>
              <h3 className="ld-panel-title mt-2">Products needing attention</h3>
            </div>
            <Clock3 className="size-5 text-[var(--ld-color-accent)]" />
          </div>

          <div className="ld-card-list mt-5">
            {data.expiringSoon.length ? (
              data.expiringSoon.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="ld-item-card flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-white">{product.name}</div>
                    <div className="mt-1 text-sm text-[var(--ld-color-muted)]">
                      {product.route} · {product.ownerTeam}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${
                      getExpiryTone(product.expiresAt) === "warning" ? "tone-warning" : "tone-danger"
                    }`}
                  >
                    {formatExpiryCountdown(product.expiresAt)}
                  </span>
                </Link>
              ))
            ) : (
              <div className="ld-empty-state">No product is inside the current expiry window.</div>
            )}
          </div>
        </div>

        <div className="ld-glass-card ld-panel">
          <div className="ld-panel-header">
            <div>
              <div className="ld-kicker">Catalogue health</div>
              <h3 className="ld-panel-title mt-2">Status mix</h3>
            </div>
            <span className={chipClassName("count")}>{data.stats.products} products</span>
          </div>

          <div className="ld-health-grid mt-5">
            {healthRows.map((item) => (
              <div key={item.label} className="ld-health-card">
                <div className="ld-stat-label">{item.label}</div>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <div className="text-2xl font-semibold text-white">{item.value}</div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.tone}`}>
                    {item.label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {quickActions.length ? (
            <div className="ld-quick-actions mt-5">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <Link key={action.href} href={action.href} className="ld-quick-action">
                    <span className="flex items-center gap-3">
                      <Icon className="size-4 text-[var(--ld-color-primary-strong)]" />
                      <span>{action.label}</span>
                    </span>
                    <ArrowRight className="size-4 text-[var(--ld-color-muted)]" />
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>
      </section>

      <section className="ld-glass-card ld-panel">
        <div className="ld-panel-header">
          <div>
            <div className="ld-kicker">Priority catalogue</div>
            <h3 className="ld-panel-title mt-2">Products your team should see first</h3>
          </div>
          <Link
            href={canEditProducts ? "/products#create-product" : "/products"}
            className="ld-secondary-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
          >
            Open all products
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {data.products.length ? (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {data.products.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`} className="ld-item-card">
              <div className="flex flex-wrap items-center gap-2">
                <span className={chipClassName("route")}>{product.route}</span>
                <span className={chipClassName(statusChipTone(product.status))}>{statusLabels[product.status]}</span>
                <span className={chipClassName(priorityChipTone(product.priority))}>{priorityLabels[product.priority]}</span>
                {product.feeItems.length ? <span className={chipClassName("count")}>{product.feeItems.length} fees</span> : null}
              </div>

              <h4 className="mt-4 text-lg font-semibold text-white">{product.name}</h4>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--ld-color-muted)]">
                {product.summary}
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[12px] bg-black/16 px-3 py-3">
                  <div className="ld-stat-label">Price</div>
                  <div className="mt-2 text-sm font-semibold text-white">
                    {formatCurrencyFromCents(product.priceInCents, product.currency)}
                  </div>
                </div>
                <div className="rounded-[12px] bg-black/16 px-3 py-3">
                  <div className="ld-stat-label">Team</div>
                  <div className="mt-2 text-sm font-semibold text-white">{product.ownerTeam}</div>
                </div>
                <div className="rounded-[12px] bg-black/16 px-3 py-3">
                  <div className="ld-stat-label">Expiry</div>
                  <div className="mt-2 text-sm font-semibold text-white">
                    {formatDateLabel(product.expiresAt)}
                  </div>
                  <div className="mt-1 text-xs text-[var(--ld-color-muted)]">
                    {formatExpiryCountdown(product.expiresAt)}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {product.accessRoles.map((role) => (
                  <span key={role} className={chipClassName("access", "text-xs normal-case")}>
                    {productAccessLabels[role as keyof typeof productAccessLabels]}
                  </span>
                ))}
              </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="ld-empty-state mt-5">
            Your catalogue is empty. {canEditProducts ? "Use Products to create the first real offer." : "A manager can add the first real offer."}
          </div>
        )}
      </section>
    </div>
  );
}
