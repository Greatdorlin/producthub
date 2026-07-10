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
          <h2 className="ld-title">Workspace</h2>
          <p className="ld-subtitle mt-2">Profile, brand, access, and data.</p>
        </div>
      </section>

      <SettingsTabs permissions={user.permissions} />

      {children}
    </div>
  );
}
