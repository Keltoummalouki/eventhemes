import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  adminHome,
  adminLogin,
  authConfigured,
  hasAdminRole,
} from "@/lib/eventheme/auth";
// First gate for the back office. Pages and API routes re-check with getUser(), so a
// revoked admin is refused even while their access token is still valid.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({ request });
  let admin = false;
  if (authConfigured()) {
    const client = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookies) => {
            cookies.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            response = NextResponse.next({ request });
            cookies.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );
    // Verifies the JWT signature and refreshes an expired session.
    const { data } = await client.auth.getClaims();
    admin = hasAdminRole(data?.claims);
  }
  // Carry refreshed session cookies over to whatever response we return.
  const finish = (next: NextResponse) => {
    if (next !== response)
      response.cookies.getAll().forEach((cookie) => next.cookies.set(cookie));
    next.headers.set("Cache-Control", "private, no-store");
    return next;
  };
  const within = (prefix: string) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`);
  if (within("/api/admin") && !admin)
    return finish(
      NextResponse.json(
        { error: "Connexion administrateur requise." },
        { status: 401 },
      ),
    );
  if (pathname === adminLogin) {
    if (admin)
      return finish(NextResponse.redirect(new URL(adminHome, request.url)));
  } else if (within(adminHome) && !admin) {
    const login = new URL(adminLogin, request.url);
    if (pathname !== adminHome) login.searchParams.set("next", pathname);
    return finish(NextResponse.redirect(login));
  }
  return finish(response);
}
export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/api/auth/:path*"],
};
