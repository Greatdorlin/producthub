import { SettingsTabs } from "@/components/settings-tabs";
import { requireSession } from "@/lib/auth/server";

export default async function SettingsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireSession();

  return (
    <div className="ld-page">
      <section className="ld-page-header">
        <div>
          <div className="ld-page-meta">
            <span className="ld-chip">Settings</span>
          </div>
          <h2 className="ld-title mt-4">Workspace settings</h2>
          <p className="ld-subtitle mt-3">
            Manage profile, branding, access, backups, and activity.
          </p>
        </div>
      </section>

      <SettingsTabs permissions={user.permissions} />

      {children}
    </div>
  );
}
