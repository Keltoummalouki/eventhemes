import assert from "node:assert/strict";
import { test } from "node:test";
import { adminRedirectPath, hasAdminRole } from "../src/lib/eventheme/auth";

test("only app_metadata.role = admin grants access", () => {
  assert.equal(hasAdminRole({ app_metadata: { role: "admin" } }), true);
  assert.equal(hasAdminRole({ app_metadata: { role: "editor" } }), false);
  assert.equal(hasAdminRole({ app_metadata: {} }), false);
  assert.equal(hasAdminRole(null), false);
  assert.equal(hasAdminRole(undefined), false);
  // user_metadata is writable by the user and must never grant access.
  const forged = { app_metadata: {}, user_metadata: { role: "admin" } };
  assert.equal(hasAdminRole(forged), false);
});

test("post-login redirect stays on admin pages of this site", () => {
  assert.equal(adminRedirectPath("/admin"), "/admin");
  assert.equal(adminRedirectPath("/admin/demandes"), "/admin/demandes");
  for (const unsafe of [
    undefined,
    ["/admin/demandes"],
    "",
    "admin",
    "/",
    "/administration",
    "/admin/connexion",
    "//evil.example/admin",
    "/\\evil.example/admin",
    "https://evil.example/admin",
    "/admin/../devis",
  ])
    assert.equal(adminRedirectPath(unsafe), "/admin", String(unsafe));
});
