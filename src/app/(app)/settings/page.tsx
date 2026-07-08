import { redirect } from "next/navigation";

import { requireSession } from "@/lib/auth/server";

export default async function SettingsPage() {
  await requireSession();
  redirect("/settings/profile");
}
