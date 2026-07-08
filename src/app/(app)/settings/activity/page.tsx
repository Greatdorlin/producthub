import { requirePermission } from "@/lib/auth/server";
import { getFieldLabel } from "@/lib/config/industries";
import { getActivityFeed } from "@/lib/data";
import { formatDateLabel } from "@/lib/utils";

const entityLabels: Record<string, string> = {
  product: "Product",
  product_asset: "Asset",
  session: "Session",
  user: "User",
  system: "System",
};

const detailLabels: Record<string, string> = {
  accessRoles: "Access",
  category: "Category",
  customGrants: "Extra permissions",
  email: "Email",
  feeItems: "Fee breakdown",
  isActive: "Status",
  kind: "Type",
  label: "Label",
  name: "Name",
  nextStatus: "New status",
  nextVisibility: "New asset access",
  previousStatus: "Previous status",
  priority: "Priority",
  previousVisibility: "Previous asset access",
  productId: "Product",
  route: "Route",
  status: "Status",
  storagePath: "Storage",
  visibility: "Asset access",
};

function formatAction(action: string) {
  return action
    .replaceAll(".", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDetailKey(key: string) {
  if (["route", "audience", "pitch", "slotsAvailable", "expectedSales"].includes(key)) {
    return getFieldLabel(key);
  }

  return detailLabels[key] ?? key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function renderDetailValue(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "None";
  }

  if (Array.isArray(value)) {
    if (!value.length) {
      return "None";
    }

    if (value.every((entry) => typeof entry === "string" || typeof entry === "number" || typeof entry === "boolean")) {
      return value.join(", ").replaceAll("_", " ");
    }

    return value.map((entry) => JSON.stringify(entry)).join(" | ");
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value).replaceAll("_", " ");
  }

  return JSON.stringify(value);
}

export default async function ActivitySettingsPage() {
  await requirePermission("activity:view");
  const entries = await getActivityFeed();

  return (
    <section className="ld-glass-card ld-panel">
      <div className="ld-panel-header">
        <div>
          <div className="ld-kicker">Audit log</div>
          <h3 className="ld-panel-title mt-2">Activity</h3>
        </div>
        <span className="ld-chip">{entries.length} records</span>
      </div>

      {entries.length ? (
        <div className="ld-activity-list mt-5">
          {entries.map((entry) => (
            <article key={entry.id} className="ld-activity-entry">
              <div className="ld-activity-entry-head">
                <div className="min-w-0">
                  <div className="text-lg font-semibold text-white">{formatAction(entry.action)}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[var(--ld-color-muted)]">
                    <span>{entry.actorName ?? "Unknown user"}</span>
                    <span className="hidden text-white/20 sm:inline">•</span>
                    <span className="truncate">{entry.actorEmail ?? "No email"}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="ld-chip">{entityLabels[entry.entityType] ?? entry.entityType}</span>
                  <span className="ld-activity-time">{formatDateLabel(entry.createdAt)}</span>
                </div>
              </div>

              {Object.keys(entry.details).length ? (
                <div className="ld-activity-detail-grid">
                  {Object.entries(entry.details).map(([key, value]) => (
                    <div key={key} className="ld-activity-detail-card">
                      <div className="ld-stat-label">{formatDetailKey(key)}</div>
                      <div className="mt-2 break-words text-sm text-[var(--ld-color-text)]">
                        {renderDetailValue(value)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <div className="ld-empty-state mt-5">No activity yet.</div>
      )}
    </section>
  );
}
