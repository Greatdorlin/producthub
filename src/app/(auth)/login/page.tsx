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

  return (
    <main className="ld-app-background flex min-h-screen items-center justify-center px-4 py-6 sm:px-6">
      <section className="ld-login-stage relative z-10 flex w-full max-w-[460px] items-center justify-center">
        <div className="ld-login-panel ld-glass-login-panel w-full rounded-[24px] p-6 sm:p-8">
          <div className="text-center">
            <p className="ld-kicker">Secure sign in</p>
            <h1 className="mt-3 text-[2.9rem] font-semibold leading-[0.94] text-white sm:text-[3.25rem]">
              {siteConfig.brandName}
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-sm text-[var(--ld-color-muted)] sm:text-[0.95rem]">
              {siteConfig.brandTagline}
            </p>
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
              className="ld-glass-button inline-flex w-full items-center justify-center rounded-[16px] px-4 py-3 text-sm font-semibold transition hover:brightness-110"
            >
              Open product hub
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
