import assert from "node:assert/strict";
import { loadEnvFile } from "node:process";
for (const file of [".env.local", ".env"])
  try {
    loadEnvFile(file);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
// The removed local bypass: it must never open the back office again.
export const legacyPreviewCookie = "eventheme-preview=local";
// Signs in with a real Supabase admin account and returns its session cookies.
export async function adminCookie(base) {
  const email = process.env.EVENTHEME_ADMIN_EMAIL;
  const password = process.env.EVENTHEME_ADMIN_PASSWORD;
  assert.ok(
    email && password,
    "Set EVENTHEME_ADMIN_EMAIL and EVENTHEME_ADMIN_PASSWORD to a Supabase admin account (see docs/SETUP.md).",
  );
  const response = await fetch(base + "/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: base },
    body: JSON.stringify({ email, password }),
  });
  assert.equal(response.status, 200, await response.text());
  const cookies = response.headers
    .getSetCookie()
    .filter((cookie) => !/max-age=0/i.test(cookie))
    .map((cookie) => cookie.split(";")[0])
    .filter((pair) => !pair.endsWith("="));
  assert.ok(cookies.length, "Login must set a Supabase session cookie");
  return cookies.join("; ");
}
