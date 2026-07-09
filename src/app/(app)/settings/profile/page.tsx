import { Camera, KeyRound, RotateCcw, ShieldCheck, ShieldOff, Smartphone, UserRound } from "lucide-react";
import { cookies } from "next/headers";
import QRCode from "qrcode";

import { changePasswordAction, disableMfaAction, enableMfaAction, regenerateRecoveryCodesAction, updateProfileIdentityAction } from "@/app/actions";
import { AsyncRedirectForm } from "@/components/async-redirect-form";
import { chipClassName } from "@/components/chip";
import { FieldLabel } from "@/components/field-label";
import { buildTotpOtpAuthUrl, encryptMfaSecret, generateTotpSecret, MFA_RECOVERY_CODES_COOKIE, requireActualSession } from "@/lib/auth/server";
import { getRoleLabel } from "@/lib/config/industries";
import { getWorkspaceSettings } from "@/lib/data";
import { getDb } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const errorCopy: Record<string, string> = {
  "missing-photo": "Choose a profile picture first.",
  "invalid-photo": "Use a PNG, JPG, or WebP image under 2 MB.",
  "blob-token": "Profile photo storage is not configured.",
};

const nameErrorCopy: Record<string, string> = {
  invalid: "Enter the name you want shown across the dashboard.",
};

const passwordErrorCopy: Record<string, string> = {
  invalid: "Use your current password, then enter the same new password twice. New passwords must be at least 12 characters and include uppercase, lowercase, and a number.",
  current: "Your current password did not match.",
  reuse: "Choose a new password that is different from your current password.",
};

const mfaErrorCopy: Record<string, string> = {
  setup: "Start setup again, then enter the code from your authenticator app.",
  password: "Your current password did not match.",
  token: "That security code was not accepted.",
  disable: "Enter your current password and a fresh authenticator code to turn MFA off.",
  recovery: "Enter your current password to generate fresh recovery codes.",
};

export default async function ProfileSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    saved?: string;
    nameError?: string;
    nameSaved?: string;
    passwordError?: string;
    passwordSaved?: string;
    mfaError?: string;
    mfaSaved?: string;
    mfaDisabled?: string;
    mfaRecovery?: string;
  }>;
}) {
  const [user, params, store, workspaceSettings] = await Promise.all([
    requireActualSession(),
    searchParams,
    cookies(),
    getWorkspaceSettings(),
  ]);
  const db = getDb();
  const [securityUser] = await db
    .select({
      mfaEnabled: users.mfaEnabled,
      mfaEnabledAt: users.mfaEnabledAt,
      mfaRecoveryCodesHash: users.mfaRecoveryCodesHash,
    })
    .from(users)
    .where(eq(users.id, user.userId))
    .limit(1);
  const message = params.error ? errorCopy[params.error] ?? "Profile update failed." : null;
  const nameMessage = params.nameError ? nameErrorCopy[params.nameError] ?? "Profile name update failed." : null;
  const passwordMessage = params.passwordError
    ? passwordErrorCopy[params.passwordError] ?? "Password update failed."
    : null;
  const mfaMessage = params.mfaError ? mfaErrorCopy[params.mfaError] ?? "Security update failed." : null;
  const generatedSecret = generateTotpSecret();
  const secretPayload = encryptMfaSecret(generatedSecret);
  const otpAuthUrl = buildTotpOtpAuthUrl(generatedSecret, user.email);
  const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl, {
    margin: 1,
    width: 180,
    color: {
      dark: "#F7FBFF",
      light: "#0000",
    },
  });
  let recoveryCodes: string[] = [];

  try {
    recoveryCodes = JSON.parse(store.get(MFA_RECOVERY_CODES_COOKIE)?.value ?? "[]");
  } catch {
    recoveryCodes = [];
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
      <section className="ld-panel ld-glass-panel">
        <div className="ld-panel-header">
          <div>
            <p className="ld-kicker">Profile</p>
            <h3 className="ld-panel-title mt-2">Profile picture</h3>
            <p className="ld-panel-copy mt-2">
              This appears in your dashboard and workspace menu.
            </p>
          </div>
          {params.saved ? (
            <span className={chipClassName("success")}>Saved</span>
          ) : null}
        </div>

        {message ? (
          <div className="mt-5 rounded-[12px] border border-[rgba(255,122,114,0.28)] bg-[rgba(255,122,114,0.12)] px-4 py-3 text-sm text-[#fff0ed]">
            {message}
          </div>
        ) : null}

        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="ld-profile-identity">
            <div className="ld-profile-identity-main">
              <div className="ld-profile-photo-preview">
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt={`${user.name} profile picture`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound className="size-9 text-[var(--ld-color-accent)]" />
                )}
              </div>

              <div className="min-w-0">
                <div className="text-xl font-semibold text-white">{user.name}</div>
                <div className="mt-1 text-sm text-[var(--ld-color-muted)]">
                  {getRoleLabel(user.role, workspaceSettings.industryTemplate)}
                </div>
                <div className="mt-3 break-all text-sm text-[var(--ld-color-muted)]">{user.email}</div>
              </div>
            </div>

            <div className="ld-profile-identity-note">
              This photo appears in your workspace menu and top profile area.
            </div>

            <form action={updateProfileIdentityAction} className="grid gap-4">
              <div className="grid gap-2">
                <FieldLabel label="Display name" required info="This is the name people will see across the workspace." />
                <input name="name" defaultValue={user.name} required className="ld-input" />
              </div>

              {nameMessage ? (
                <div className="rounded-[12px] border border-[rgba(255,122,114,0.28)] bg-[rgba(255,122,114,0.12)] px-4 py-3 text-sm text-[#fff0ed]">
                  {nameMessage}
                </div>
              ) : null}

              <button
                type="submit"
                className="ld-secondary-button inline-flex min-h-12 items-center justify-center rounded-full px-5 text-sm font-semibold"
              >
                {params.nameSaved ? "Name saved" : "Save name"}
              </button>
            </form>
          </div>

          <AsyncRedirectForm
            action="/api/settings/profile"
            method="post"
            encType="multipart/form-data"
            className="ld-form-section ld-profile-upload-panel"
          >
            <div className="grid gap-4">
              <label className="grid gap-2">
                <FieldLabel label="Upload profile picture" info="Optional PNG, JPG, or WebP. Keep it under 2 MB." />
                <input
                  className="ld-input ld-file-input file:mr-3 file:rounded-full file:border-0 file:bg-[var(--ld-color-primary)] file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white"
                  type="file"
                  name="avatar"
                  accept="image/png,image/jpeg,image/webp"
                />
              </label>

              {user.avatarUrl ? (
                <label className="ld-check-tile">
                  <input type="checkbox" name="removeAvatar" />
                  <span className="ld-check-tile-card">
                    <span className="ld-check-tile-title flex items-center gap-2">
                      <RotateCcw className="size-4" />
                      Remove profile picture
                    </span>
                    <span className="ld-check-tile-copy">
                      Your initials will show until you upload a new image.
                    </span>
                  </span>
                </label>
              ) : null}

              <button
                type="submit"
                className="ld-glass-button inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition hover:brightness-110"
              >
                <Camera className="size-4" />
                Save profile picture
              </button>
            </div>
          </AsyncRedirectForm>
        </div>
      </section>

      <section className="ld-panel ld-solid-panel">
        <div className="ld-panel-header">
          <div>
            <p className="ld-kicker">Security</p>
            <h3 className="ld-panel-title mt-2">Password</h3>
            <p className="ld-panel-copy mt-2">
              Change your password without leaving the dashboard.
            </p>
          </div>
          {params.passwordSaved ? (
            <span className={chipClassName("success")}>Updated</span>
          ) : (
            <span className={chipClassName("info")}>
              <ShieldCheck className="size-3.5" />
              Protected
            </span>
          )}
        </div>

        {passwordMessage ? (
          <div className="mt-5 rounded-[12px] border border-[rgba(255,122,114,0.28)] bg-[rgba(255,122,114,0.12)] px-4 py-3 text-sm text-[#fff0ed]">
            {passwordMessage}
          </div>
        ) : null}

        <form action={changePasswordAction} method="post" className="ld-form-grid mt-6">
          <div className="ld-form-section">
            <div className="ld-field-group">
              <label className="block space-y-2">
                <FieldLabel label="Current password" required />
                <input name="currentPassword" type="password" className="ld-input" autoComplete="current-password" required />
              </label>

              <label className="block space-y-2">
                <FieldLabel label="New password" required info="Use at least 12 characters with uppercase, lowercase, and a number." />
                <input name="nextPassword" type="password" className="ld-input" autoComplete="new-password" required />
              </label>

              <label className="block space-y-2">
                <FieldLabel label="Confirm new password" required />
                <input name="confirmPassword" type="password" className="ld-input" autoComplete="new-password" required />
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="ld-glass-button inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition hover:brightness-110"
          >
            <KeyRound className="size-4" />
            Update password
          </button>
        </form>
      </section>

      <section className="ld-panel ld-glass-panel xl:col-span-2">
        <div className="ld-panel-header">
          <div>
            <p className="ld-kicker">Two-step verification</p>
            <h3 className="ld-panel-title mt-2">Authenticator app</h3>
            <p className="ld-panel-copy mt-2">
              Protect sign-in with a 6-digit code from Google Authenticator, 1Password, Microsoft Authenticator, or any TOTP app.
            </p>
          </div>
          {securityUser?.mfaEnabled ? (
            <span className={chipClassName("success")}>
              <ShieldCheck className="size-3.5" />
              Active
            </span>
          ) : (
            <span className={chipClassName("neutral")}>
              <ShieldOff className="size-3.5" />
              Not active
            </span>
          )}
        </div>

        {mfaMessage ? (
          <div className="mt-5 rounded-[12px] border border-[rgba(255,122,114,0.28)] bg-[rgba(255,122,114,0.12)] px-4 py-3 text-sm text-[#fff0ed]">
            {mfaMessage}
          </div>
        ) : null}

        {params.mfaSaved ? (
          <div className="mt-5 rounded-[12px] border border-[rgba(103,214,163,0.24)] bg-[rgba(103,214,163,0.1)] px-4 py-3 text-sm text-[var(--ld-color-success)]">
            Two-step verification is now active on your account.
          </div>
        ) : null}

        {params.mfaDisabled ? (
          <div className="mt-5 rounded-[12px] border border-[rgba(247,189,85,0.22)] bg-[rgba(247,189,85,0.1)] px-4 py-3 text-sm text-[var(--ld-color-warning)]">
            Two-step verification has been turned off.
          </div>
        ) : null}

        {params.mfaRecovery ? (
          <div className="mt-5 rounded-[12px] border border-[rgba(103,214,163,0.24)] bg-[rgba(103,214,163,0.1)] px-4 py-3 text-sm text-[var(--ld-color-success)]">
            Fresh recovery codes are ready below.
          </div>
        ) : null}

        <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="ld-brand-preview">
            <div className="ld-brand-preview-card px-5 py-5">
              {securityUser?.mfaEnabled ? (
                <div className="w-full space-y-4">
                  <div className={chipClassName("success", "text-xs normal-case")}>
                    <ShieldCheck className="size-3.5" />
                    Sign-in protected
                  </div>
                  <div className="space-y-2">
                    <div className="text-lg font-semibold text-white">Authenticator app is required.</div>
                    <p className="text-sm text-[var(--ld-color-muted)]">
                      Use a fresh code from your authenticator app each time you sign in after your password.
                    </p>
                    <p className="text-sm text-[var(--ld-color-muted)]">
                      Recovery codes left: {securityUser.mfaRecoveryCodesHash.length}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="w-full space-y-4">
                  <div className={chipClassName("info", "text-xs normal-case")}>
                    <Smartphone className="size-3.5" />
                    Scan to connect
                  </div>
                  <div className="flex justify-center rounded-[16px] border border-white/10 bg-black/16 p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrCodeDataUrl} alt="MFA setup QR code" className="h-[180px] w-[180px]" />
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-white">Can&apos;t scan it?</div>
                    <div className="ld-code-block text-xs">{generatedSecret}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-5">
            {!securityUser?.mfaEnabled ? (
              <form action={enableMfaAction} method="post" className="ld-form-section">
                <input type="hidden" name="secretPayload" value={secretPayload} />
                <div className="ld-field-group">
                  <label className="block space-y-2">
                    <FieldLabel label="Current password" required />
                    <input name="currentPassword" type="password" className="ld-input" autoComplete="current-password" required />
                  </label>

                  <label className="block space-y-2">
                    <FieldLabel label="Code from your authenticator app" required />
                    <input name="token" type="text" inputMode="numeric" className="ld-input" placeholder="123456" required />
                  </label>

                  <button
                    type="submit"
                    className="ld-glass-button inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition hover:brightness-110"
                  >
                    <ShieldCheck className="size-4" />
                    Turn on two-step verification
                  </button>
                </div>
              </form>
            ) : (
              <>
                <form action={regenerateRecoveryCodesAction} method="post" className="ld-form-section">
                  <div className="ld-field-group">
                    <div>
                      <FieldLabel label="Recovery codes" info="Each code works once if you lose access to your authenticator app." />
                      <p className="mt-2 text-sm text-[var(--ld-color-muted)]">
                        Keep these offline. Each code works once if you lose access to your authenticator app.
                      </p>
                    </div>

                    <label className="block space-y-2">
                      <FieldLabel label="Current password" required />
                      <input name="currentPassword" type="password" className="ld-input" autoComplete="current-password" required />
                    </label>

                    <button
                      type="submit"
                      className="ld-secondary-button inline-flex min-h-12 w-full items-center justify-center rounded-full px-5 text-sm font-semibold"
                    >
                      Generate new recovery codes
                    </button>
                  </div>
                </form>

                <form action={disableMfaAction} method="post" className="ld-form-section">
                  <div className="ld-field-group">
                    <div>
                      <FieldLabel label="Turn off two-step verification" info="Confirm with your password and a fresh authenticator code." />
                      <p className="mt-2 text-sm text-[var(--ld-color-muted)]">
                        Confirm with your password and a fresh authenticator code before removing this protection.
                      </p>
                    </div>

                    <label className="block space-y-2">
                      <FieldLabel label="Current password" required />
                      <input name="currentPassword" type="password" className="ld-input" autoComplete="current-password" required />
                    </label>

                    <label className="block space-y-2">
                      <FieldLabel label="Authenticator code" required />
                      <input name="token" type="text" inputMode="numeric" className="ld-input" placeholder="123456" required />
                    </label>

                    <button
                      type="submit"
                      className="ld-danger-button inline-flex min-h-12 w-full items-center justify-center rounded-full px-5 text-sm font-semibold"
                    >
                      Turn off protection
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>

        {recoveryCodes.length ? (
          <div className="ld-form-section mt-5">
            <div className="ld-panel-header">
              <div>
                <div className="ld-kicker">Recovery codes</div>
                <h4 className="ld-panel-title mt-2">Save these now</h4>
                <p className="ld-panel-copy mt-2">
                  These codes are shown temporarily after setup or regeneration. Store them somewhere safe.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {recoveryCodes.map((code) => (
                <div key={code} className="ld-code-block text-sm font-semibold">
                  {code}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
