import { Clock3, Database, Download, ShieldCheck } from "lucide-react";

import { createWorkspaceBackupAction } from "@/app/actions";
import { requirePermission } from "@/lib/auth/server";
import { getWorkspaceBackupSnapshots } from "@/lib/data";
import { formatDateLabel } from "@/lib/utils";

const errorCopy: Record<string, string> = {
  "blob-token": "Backup storage is not configured yet.",
};

function formatFileSize(bytes: number | null) {
  if (!bytes) {
    return "Unknown size";
  }

  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function BackupsSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  await requirePermission("people:manage");

  const [{ error, saved }, snapshotData] = await Promise.all([
    searchParams,
    getWorkspaceBackupSnapshots(),
  ]);
  const message = error ? errorCopy[error] ?? "Backup action failed." : null;
  const latestBackup = snapshotData.backups[0] ?? null;

  return (
    <section className="ld-panel ld-glass-panel">
      <div className="ld-panel-header">
        <div>
          <p className="ld-kicker">Backups</p>
          <h3 className="ld-panel-title mt-2">Workspace snapshots</h3>
          <p className="ld-panel-copy mt-2">
            Create restore-ready backups of products, assets, workspace settings, and user access metadata.
          </p>
        </div>
        {saved ? <span className="ld-chip text-[var(--ld-color-success)]">Backup saved</span> : null}
      </div>

      {message ? (
        <div className="mt-5 rounded-[12px] border border-[rgba(255,122,114,0.28)] bg-[rgba(255,122,114,0.12)] px-4 py-3 text-sm text-[#fff0ed]">
          {message}
        </div>
      ) : null}

      <div className="ld-backup-hero mt-6">
        <div className="ld-backup-overview">
          <div className="ld-page-meta">
            <span className="ld-chip">
              <ShieldCheck className="size-3.5" />
              {snapshotData.configured ? "Storage ready" : "Storage needs setup"}
            </span>
            <span className="ld-chip">
              <Clock3 className="size-3.5" />
              {latestBackup?.uploadedAt ? `Latest ${formatDateLabel(latestBackup.uploadedAt)}` : "No snapshot yet"}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            <h4 className="text-[1.15rem] font-semibold text-white">Keep the full product hub recoverable.</h4>
            <p className="text-sm leading-7 text-[var(--ld-color-muted)]">
              Snapshots cover products, attached assets, branding, and user access so you can recover the workspace state with less risk.
            </p>
          </div>

          <form action={createWorkspaceBackupAction} className="mt-5">
            <button
              type="submit"
              className="ld-glass-button inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition hover:brightness-110"
            >
              <Database className="size-4" />
              Create fresh backup
            </button>
          </form>

          <div className="ld-backup-coverage-grid mt-6">
            <div className="ld-backup-coverage-card">
              <div className="ld-meta-title">Products</div>
              <div className="ld-meta-value">Names, pricing, expiry, slots, fees, and access groups</div>
            </div>
            <div className="ld-backup-coverage-card">
              <div className="ld-meta-title">Assets</div>
              <div className="ld-meta-value">Uploaded files, links, visibility, and product attachment data</div>
            </div>
            <div className="ld-backup-coverage-card">
              <div className="ld-meta-title">Workspace</div>
              <div className="ld-meta-value">Logo, access settings, active users, and permission metadata</div>
            </div>
          </div>
        </div>

        <div className="ld-backup-summary-grid">
          <div className="ld-backup-summary-card">
            <div className="ld-stat-label">Snapshot storage</div>
            <div className="mt-3 text-lg font-semibold text-white">
              {snapshotData.configured ? "Connected" : "Not connected"}
            </div>
            <div className="mt-2 text-sm text-[var(--ld-color-muted)]">
              {snapshotData.configured
                ? "Backups can be created and downloaded from this screen."
                : "Connect backup storage to save downloadable snapshots."}
            </div>
          </div>

          <div className="ld-backup-summary-card">
            <div className="ld-stat-label">Saved snapshots</div>
            <div className="mt-3 text-lg font-semibold text-white">{snapshotData.backups.length}</div>
            <div className="mt-2 text-sm text-[var(--ld-color-muted)]">
              {snapshotData.backups.length ? "Recent recovery points are ready." : "Create the first snapshot now."}
            </div>
          </div>

          <div className="ld-backup-summary-card">
            <div className="ld-stat-label">Latest file</div>
            <div className="mt-3 text-base font-semibold text-white">
              {latestBackup?.uploadedAt ? formatDateLabel(latestBackup.uploadedAt) : "Not available"}
            </div>
            <div className="mt-2 text-sm text-[var(--ld-color-muted)]">
              {latestBackup ? formatFileSize(latestBackup.size) : "No file has been stored yet."}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="ld-form-section ld-settings-list-panel">
          <div className="ld-panel-header">
            <div>
              <div className="ld-kicker">Available backups</div>
              <h4 className="ld-panel-title mt-2">Recent snapshots</h4>
            </div>
            <div className="ld-chip">{snapshotData.backups.length} files</div>
          </div>

          {!snapshotData.configured ? (
            <div className="ld-empty-state mt-5">
              Backup storage is not configured yet.
            </div>
          ) : snapshotData.backups.length ? (
            <div className="ld-backup-history-list mt-5">
              {snapshotData.backups.slice(0, 12).map((backup) => (
                <div key={backup.pathname} className="ld-backup-history-item">
                  <div className="ld-backup-history-head">
                    <div className="ld-backup-history-body">
                      <div className="ld-backup-history-name">{backup.pathname.split("/").pop()}</div>
                      <div className="mt-1 text-sm text-[var(--ld-color-muted)]">
                        {backup.uploadedAt ? formatDateLabel(backup.uploadedAt) : "Unknown date"} · {formatFileSize(backup.size)}
                      </div>
                    </div>

                    <a
                      href={backup.url}
                      target="_blank"
                      rel="noreferrer"
                      className="ld-secondary-button inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium"
                    >
                      <Download className="size-4" />
                      Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="ld-empty-state mt-5">
              No backups yet. Create the first snapshot now.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
