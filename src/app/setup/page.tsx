import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import { siteConfig } from "@/lib/config/site";
import { getDb } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { createId } from "@/lib/utils";

type SetupPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export const dynamic = "force-dynamic";

function isStrongPassword(password: string) {
  return password.length >= 12 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password);
}

async function createFirstAdminAction(formData: FormData) {
  "use server";

  const db = getDb();
  const existingUsers = await db.select({ id: users.id }).from(users).limit(1);

  if (existingUsers.length > 0) {
    redirect("/login");
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!name || !email.includes("@") || password !== confirmPassword || !isStrongPassword(password)) {
    redirect("/setup?error=invalid");
  }

  await db.insert(users).values({
    id: createId("user"),
    name,
    email,
    passwordHash: await bcrypt.hash(password, 12),
    role: "admin",
    isActive: true,
  });

  redirect("/login?setup=created");
}

export default async function SetupPage({ searchParams }: SetupPageProps) {
  const db = getDb();
  const [existingUsers, params] = await Promise.all([
    db.select({ id: users.id }).from(users).limit(1),
    searchParams,
  ]);

  if (existingUsers.length > 0) {
    redirect("/login");
  }

  const errorMessage = params.error
    ? "Use a valid name and email, then enter matching passwords with at least 12 characters, uppercase, lowercase, and a number."
    : null;

  return (
    <main className="ld-app-background flex min-h-screen items-center justify-center px-4 py-6 sm:px-6">
      <section className="ld-login-stage relative z-10 flex w-full max-w-[460px] items-center justify-center">
        <div className="ld-login-panel ld-glass-login-panel w-full rounded-[24px] p-6 sm:p-8">
          <div className="text-center">
            <p className="ld-kicker">First run</p>
            <h1 className="mt-3 text-[2.75rem] font-semibold leading-[0.94] text-white sm:text-[3.1rem]">
              {siteConfig.brandName}
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-sm text-[var(--ld-color-muted)] sm:text-[0.95rem]">
              Create the first administrator account.
            </p>
          </div>

          <form action={createFirstAdminAction} className="mt-8 space-y-4">
            <label className="block space-y-2">
              <span className="ld-label">Name</span>
              <input required name="name" autoComplete="name" className="ld-input" autoFocus />
            </label>

            <label className="block space-y-2">
              <span className="ld-label">Email</span>
              <input required type="email" name="email" autoComplete="username" className="ld-input" />
            </label>

            <label className="block space-y-2">
              <span className="ld-label">Password</span>
              <input required type="password" name="password" autoComplete="new-password" className="ld-input" />
            </label>

            <label className="block space-y-2">
              <span className="ld-label">Confirm password</span>
              <input required type="password" name="confirmPassword" autoComplete="new-password" className="ld-input" />
            </label>

            {errorMessage ? (
              <div className="rounded-[14px] border border-[rgba(255,122,114,0.22)] bg-[rgba(255,122,114,0.1)] px-4 py-3 text-sm text-[var(--ld-color-danger)]">
                {errorMessage}
              </div>
            ) : null}

            <button
              type="submit"
              className="ld-glass-button mt-2 inline-flex min-h-[52px] w-full items-center justify-center rounded-full px-5 text-sm font-semibold transition hover:brightness-110"
            >
              Create admin
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
