import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <form action="/api/auth/logout" method="post" className="ld-logout-form">
      <button
        type="submit"
        className="ld-secondary-button inline-flex min-h-10 items-center justify-center gap-2 rounded-[10px] px-3 text-sm font-medium"
        aria-label="Sign out"
      >
        <LogOut className="size-4" />
        <span className="ld-logout-label">Sign out</span>
      </button>
    </form>
  );
}
