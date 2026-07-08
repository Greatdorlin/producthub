export function LogoutButton() {
  return (
    <form action="/api/auth/logout" method="post" className="ld-logout-form">
      <button
        type="submit"
        className="ld-secondary-button inline-flex items-center rounded-full px-4 py-2 text-sm font-medium"
      >
        Sign out
      </button>
    </form>
  );
}
