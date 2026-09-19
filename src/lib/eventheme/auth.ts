// Shared by the proxy, the admin pages and the tests: keep it free of server-only imports.
export const adminHome = "/admin";
export const adminLogin = "/admin/connexion";

export const authConfigured = () =>
  Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );

// Only the service role can write app_metadata; user_metadata is editable by the user and never trusted.
export const hasAdminRole = (
  subject: { app_metadata?: { [key: string]: unknown } } | null | undefined,
) => subject?.app_metadata?.role === "admin";

// Post-login destination: an admin page on this origin, never the login page or another site.
export function adminRedirectPath(next: unknown) {
  if (typeof next !== "string" || !next.startsWith("/")) return adminHome;
  const base = "http://eventheme.invalid";
  const url = new URL(next, base);
  const inside =
    url.origin === base &&
    (url.pathname === adminHome || url.pathname.startsWith(`${adminHome}/`));
  return inside && url.pathname !== adminLogin ? url.pathname : adminHome;
}
