import { LockKeyhole } from "lucide-react";
import { redirect } from "next/navigation";

import { loginAction } from "@/app/actions";
import { getSessionUser } from "@/lib/auth/server";
import { siteConfig } from "@/lib/config/site";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

const errorCopy: Record<string, string> = {
  invalid: "That email or password did not match an active account.",
  "rate-limit": "Too many sign-in attempts. Wait 15 minutes and try again.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getSessionUser();

  if (user) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const errorMessage = params.error ? errorCopy[params.error] : null;
  const brandInitials = siteConfig.brandName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

  return (
    <main className="ld-app-background ld-login-canvas flex min-h-screen items-center justify-center px-4 py-6 sm:px-6">
      <section className="ld-login-stage relative z-10 w-full max-w-[440px]">
        <div className="ld-login-panel ld-glass-login-panel w-full rounded-[20px] p-6 sm:p-8">
          <div>
            <div className="ld-login-brand-row">
              <span className="ld-login-mark">{brandInitials || "P"}</span>
              <span className="truncate text-sm font-semibold text-[var(--ld-color-text)]">{siteConfig.brandName}</span>
            </div>
            <h1 className="mt-8 text-[2rem] font-semibold leading-tight text-[var(--ld-color-text)] sm:text-[2.2rem]">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-[var(--ld-color-muted)]">{siteConfig.brandTagline}</p>
          </div>

          <form action={loginAction} className="mt-8 space-y-4">
            <input type="hidden" name="next" value={params.next ?? "/dashboard"} />

            <label className="block space-y-2">
              <span className="ld-label">Email</span>
              <input
                required
                type="email"
                name="email"
                autoComplete="username"
                className="ld-input"
                placeholder="admin@example.com"
                autoFocus
              />
            </label>

            <label className="block space-y-2">
              <span className="ld-label">Password</span>
              <input
                required
                type="password"
                name="password"
                autoComplete="current-password"
                className="ld-input"
                placeholder="Enter your password"
              />
            </label>

            {errorMessage ? (
              <div className="rounded-[14px] border border-[rgba(255,122,114,0.22)] bg-[rgba(255,122,114,0.1)] px-4 py-3 text-sm text-[var(--ld-color-danger)]">
                {errorMessage}
              </div>
            ) : null}

            <button
              type="submit"
              className="ld-glass-button inline-flex min-h-12 w-full items-center justify-center rounded-full px-4 text-sm font-semibold transition hover:brightness-110"
            >
              Sign in
            </button>
          </form>

          <div className="ld-login-trust-row">
            <LockKeyhole className="size-3.5" />
            <span>Secure workspace access</span>
          </div>
        </div>
      </section>
    </main>
  );
}
