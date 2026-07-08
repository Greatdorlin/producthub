import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { verifyLoginMfaAction } from "@/app/actions";
import { getSessionUser, PENDING_MFA_COOKIE } from "@/lib/auth/server";

const errorCopy: Record<string, string> = {
  invalid: "The verification code was not accepted.",
  "rate-limit": "Too many verification attempts. Wait 15 minutes and try again.",
};

export default async function LoginMfaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [user, store, params] = await Promise.all([getSessionUser(), cookies(), searchParams]);

  if (user) {
    redirect("/dashboard");
  }

  if (!store.get(PENDING_MFA_COOKIE)?.value) {
    redirect("/login");
  }

  const errorMessage = params.error ? errorCopy[params.error] ?? "Verification failed." : null;

  return (
    <main className="ld-app-background flex min-h-screen items-center justify-center px-4 py-6 sm:px-6">
      <section className="ld-login-stage relative z-10 flex w-full max-w-[460px] items-center justify-center">
        <div className="ld-login-panel ld-glass-login-panel w-full rounded-[24px] p-6 sm:p-8">
          <div className="text-center">
            <p className="ld-kicker">Second step</p>
            <h1 className="mt-3 text-[2.5rem] font-semibold leading-[0.96] text-white sm:text-[3rem]">
              Verify sign in
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-sm text-[var(--ld-color-muted)] sm:text-[0.95rem]">
              Enter a code from your authenticator app or use a recovery code.
            </p>
          </div>

          <form action={verifyLoginMfaAction} className="mt-8 space-y-4">
            <label className="block space-y-2">
              <span className="ld-label">Authenticator code</span>
              <input
                type="text"
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                className="ld-input"
                placeholder="123456"
                autoFocus
              />
            </label>

            <div className="text-center text-xs text-[var(--ld-color-muted)]">or</div>

            <label className="block space-y-2">
              <span className="ld-label">Recovery code</span>
              <input
                type="text"
                name="recoveryCode"
                className="ld-input"
                placeholder="ABCD-EF12"
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
              Verify and continue
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
