import { createUserAction, toggleUserStatusAction, updateUserAccessAction } from "@/app/actions";
import { requirePermission } from "@/lib/auth/server";
import { getRoleLabel } from "@/lib/config/industries";
import { PERMISSIONS, PRODUCT_ROLES, permissionLabels } from "@/lib/constants";
import { getPeopleData, getWorkspaceSettings } from "@/lib/data";
import { formatDateLabel } from "@/lib/utils";

type AccessSettingsPageProps = {
  searchParams: Promise<{ error?: string; created?: string; saved?: string }>;
};

export default async function AccessSettingsPage({ searchParams }: AccessSettingsPageProps) {
  const viewer = await requirePermission("people:view");
  const [people, workspaceSettings] = await Promise.all([
    getPeopleData(),
    getWorkspaceSettings(),
  ]);
  const params = await searchParams;
  const canManage = viewer.permissions.includes("people:manage");
  const activePeople = people.filter((person) => person.isActive).length;
  const createUserError =
    params.error === "invalid-user"
      ? "Use a valid email and a strong password with at least 12 characters, uppercase, lowercase, and a number."
      : params.error === "duplicate-user"
        ? "That email address already has access."
        : null;
  const message =
    params.error === "self-disable"
      ? "You cannot turn your own account off from this screen."
      : params.error === "self-manage"
        ? "Edit your own name in Profile settings. Role and permission changes for your own account are blocked here."
        : params.error === "duplicate-user"
          ? "That email address already has access."
          : params.error === "invalid-user"
            ? "Check the user details and try again."
            : null;

  return (
    <section className="grid gap-5 xl:grid-cols-[1fr_0.95fr]">
      <div className="ld-glass-card ld-panel">
        <div className="ld-panel-header">
          <div>
            <div className="ld-kicker">Access</div>
            <h3 className="ld-panel-title mt-2">Product Hub seats</h3>
          </div>
          <div className="ld-page-meta">
            <span className="ld-chip">{activePeople} active</span>
            <span className="ld-chip">{people.length} total</span>
            {params.saved ? <span className="ld-chip text-[var(--ld-color-success)]">Updated</span> : null}
          </div>
        </div>

        {message ? (
          <div className="mt-5 rounded-[12px] border border-[rgba(255,122,114,0.28)] bg-[rgba(255,122,114,0.12)] px-4 py-3 text-sm text-[#fff0ed]">
            {message}
          </div>
        ) : null}

        <div className="ld-card-list mt-5">
          {people.map((person) => (
            <div key={person.id} className="ld-item-card">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="ld-avatar size-11 text-sm">
                    {person.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={person.avatarUrl} alt={`${person.name} profile picture`} className="h-full w-full object-cover" />
                    ) : (
                      person.name.slice(0, 1).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-white">{person.name}</h3>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${person.isActive ? "tone-success" : "tone-danger"}`}>
                        {person.isActive ? "Active" : "Disabled"}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-[var(--ld-color-muted)]">
                      {person.email} · {getRoleLabel(person.role, workspaceSettings.industryTemplate)}
                    </div>
                    <div className="mt-1 text-sm text-[var(--ld-color-muted)]">
                      Last login {person.lastLoginAt ? formatDateLabel(person.lastLoginAt) : "Not yet"}
                    </div>
                    <div className="mt-3 space-y-3">
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--ld-color-muted)]">
                          Active permissions
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {person.effectivePermissions.map((permission) => (
                            <span key={permission} className="rounded-full bg-[rgba(37,99,235,0.18)] px-3 py-1 text-xs text-white">
                              {permissionLabels[permission]}
                            </span>
                          ))}
                        </div>
                      </div>

                      {person.deniedPermissions.length ? (
                        <div>
                          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--ld-color-muted)]">
                            Turned off
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {person.deniedPermissions.map((permission) => (
                              <span key={permission} className="rounded-full bg-[rgba(255,122,114,0.12)] px-3 py-1 text-xs text-[var(--ld-color-danger)]">
                                {permissionLabels[permission as keyof typeof permissionLabels] ?? permission}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                <form action={toggleUserStatusAction}>
                  <input type="hidden" name="userId" value={person.id} />
                  <input type="hidden" name="nextValue" value={String(!person.isActive)} />
                  <button
                    type="submit"
                    className="ld-secondary-button inline-flex rounded-full px-4 py-2 text-sm font-medium"
                  >
                    {person.isActive ? "Disable access" : "Restore access"}
                  </button>
                </form>
              </div>

              {canManage && person.id !== viewer.actualUserId ? (
                <details className="ld-inline-editor mt-4">
                  <summary className="ld-secondary-button inline-flex min-h-11 items-center justify-center rounded-full px-4 text-sm font-semibold">
                    Manage access
                  </summary>

                  <form action={updateUserAccessAction} className="ld-form-grid mt-4">
                    <input type="hidden" name="userId" value={person.id} />

                    <div className="ld-form-section">
                      <div className="ld-field-group">
                        <label className="block space-y-2">
                          <span className="ld-label">Full name</span>
                          <input required name="name" defaultValue={person.name} className="ld-input" />
                        </label>

                        <label className="block space-y-2">
                          <span className="ld-label">Base role</span>
                          <select name="role" defaultValue={person.role} className="ld-input ld-select">
                            {PRODUCT_ROLES.map((role) => (
                              <option key={role} value={role}>
                                {getRoleLabel(role, workspaceSettings.industryTemplate)}
                              </option>
                            ))}
                          </select>
                        </label>

                        <p className="ld-note">Use the switches below to decide exactly what this person can do.</p>
                      </div>
                    </div>

                    <div className="ld-form-section">
                      <div className="ld-kicker">Permission access</div>
                      <div className="mt-4 grid gap-3">
                        {PERMISSIONS.map((permission) => (
                          <label key={`${person.id}-${permission}`} className="flex items-start gap-3 rounded-[12px] border border-white/8 bg-black/12 px-3 py-3 text-sm text-[var(--ld-color-text)]">
                            <input
                              type="checkbox"
                              name="permissions"
                              value={permission}
                              defaultChecked={person.effectivePermissions.includes(permission)}
                              className="mt-0.5 size-4 rounded border-white/20 bg-transparent"
                            />
                            <span className="space-y-1">
                              <span className="block font-medium text-white">{permissionLabels[permission]}</span>
                              <span className="block text-xs text-[var(--ld-color-muted)]">
                                {person.deniedPermissions.includes(permission)
                                  ? "Currently turned off for this user."
                                  : "Currently available to this user."}
                              </span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="ld-glass-button inline-flex w-full items-center justify-center rounded-[16px] px-4 py-3 text-sm font-semibold transition hover:brightness-110"
                    >
                      Save access changes
                    </button>
                  </form>
                </details>
              ) : canManage ? (
                <div className="mt-4 text-sm text-[var(--ld-color-muted)]">
                  Edit your own name in Profile settings.
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {canManage ? (
        <aside className="ld-solid-panel ld-panel self-start xl:sticky xl:top-6">
          <div className="ld-kicker">New seat</div>
          <h3 className="ld-panel-title mt-2">Grant access</h3>
          <p className="ld-panel-copy mt-2">
            Create a login, choose the base role, then add only the extra permissions needed.
          </p>

          {createUserError ? (
            <div className="mt-4 rounded-[14px] border border-[rgba(255,122,114,0.22)] bg-[rgba(255,122,114,0.1)] px-4 py-3 text-sm text-[var(--ld-color-danger)]">
              {createUserError}
            </div>
          ) : null}

          <form action={createUserAction} className="ld-form-grid mt-5">
            <div className="ld-form-section">
              <div className="ld-field-group">
                <label className="block space-y-2">
                  <span className="ld-label">Full name</span>
                  <input required name="name" className="ld-input" />
                </label>
                <label className="block space-y-2">
                  <span className="ld-label">Email</span>
                  <input required type="email" name="email" className="ld-input" />
                </label>
                <label className="block space-y-2">
                  <span className="ld-label">Temporary password</span>
                  <input required type="password" name="password" className="ld-input" />
                </label>
                <label className="block space-y-2">
                  <span className="ld-label">Role</span>
                  <select name="role" className="ld-input ld-select">
                    {PRODUCT_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {getRoleLabel(role, workspaceSettings.industryTemplate)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="ld-form-section">
              <div className="ld-kicker">Extra permissions</div>
              <div className="mt-4 grid gap-3">
                {PERMISSIONS.map((permission) => (
                  <label key={permission} className="flex items-start gap-3 rounded-[12px] border border-white/8 bg-black/12 px-3 py-3 text-sm text-[var(--ld-color-text)]">
                    <input type="checkbox" name="grants" value={permission} className="mt-0.5 size-4 rounded border-white/20 bg-transparent" />
                    <span>{permissionLabels[permission]}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="ld-glass-button inline-flex w-full items-center justify-center rounded-[16px] px-4 py-3 text-sm font-semibold transition hover:brightness-110"
            >
              Create user
            </button>
          </form>
        </aside>
      ) : null}
    </section>
  );
}
