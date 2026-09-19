import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { adminCookie, legacyPreviewCookie } from "./admin-session.mjs";
assert.notEqual(
  process.env.EVENTHEME_DATA_MODE,
  "supabase",
  "Smoke checks write test data: run them against local data only.",
);
const base = "http://localhost:3000";
const json = { "Content-Type": "application/json", Origin: base };
for (const cookie of ["", legacyPreviewCookie]) {
  const anonymous = await fetch(base + "/api/admin", {
    headers: { Cookie: cookie },
  });
  assert.equal(anonymous.status, 401);
  const page = await fetch(base + "/admin", {
    headers: { Cookie: cookie },
    redirect: "manual",
  });
  assert.equal(page.status, 307);
  assert.equal(
    new URL(page.headers.get("location"), base).pathname,
    "/admin/connexion",
  );
}
const refused = await fetch(base + "/api/auth", {
  method: "POST",
  headers: json,
  body: JSON.stringify({
    email: `nobody-${randomUUID()}@example.com`,
    password: randomUUID(),
  }),
});
assert.equal(refused.status, 401);
const headers = { ...json, Cookie: await adminCookie(base) };
const signedIn = await fetch(base + "/admin/connexion", {
  headers,
  redirect: "manual",
});
assert.equal(new URL(signedIn.headers.get("location"), base).pathname, "/admin");
const admin = async (body) => {
  const response = await fetch(base + "/api/admin", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  assert.equal(response.status, 200, await response.text());
};
const entries = await (await fetch(base + "/api/content")).json();
const id = `smoke-${randomUUID()}`;
const created = [];
const product = {
  id,
  kind: "products",
  title: "TEST AUTOMATISÉ — matériel",
  description: "Donnée temporaire supprimée après vérification.",
  published: true,
  price: 100,
  pricing: "daily",
  variants: [{ name: "Test", price: 250 }],
  available: true,
};
try {
  await admin({ action: "save", value: product });
  await admin({
    action: "save",
    value: { ...product, description: "Modification vérifiée." },
  });
  const current = await (await fetch(base + "/api/content")).json();
  assert.equal(
    current.find((e) => e.id === id).description,
    "Modification vérifiée.",
  );
  const input = {
    kind: "quote",
    name: "TEST AUTOMATISÉ",
    email: `test-${id}@example.com`,
    phone: "+212600000000",
    company: "Démonstration",
    city: "Casablanca",
    address: "Adresse fictive",
    message: "Test local uniquement.",
    subject: "",
    event: entries.find((e) => e.kind === "events").id,
    date: "2099-10-20",
    duration: 5,
    rentalDays: 2,
    guests: 30,
    contactMethod: "E-mail",
    consent: true,
    website: "",
    startedAt: Date.now() - 5000,
    basket: { services: [], products: [{ id, variant: "Test", quantity: 2 }] },
    estimate: -999,
  };
  for (const kind of ["quote", "contact"]) {
    const response = await fetch(base + "/api/inquiries", {
      method: "POST",
      headers: json,
      body: JSON.stringify({
        ...input,
        kind,
        basket:
          kind === "contact" ? { services: [], products: [] } : input.basket,
      }),
    });
    const result = await response.json();
    assert.equal(response.status, 201, JSON.stringify(result));
    created.push(result.id);
  }
  const data = await (await fetch(base + "/api/admin", { headers })).json();
  const inquiry = data.inquiries.find((i) => i.id === created[0]);
  assert.equal(
    inquiry.estimate,
    1000,
    "Price must be recomputed on the server",
  );
  assert.equal(inquiry.basket.products[0].quantity, 2);
  await admin({
    action: "inquiry",
    id: inquiry.id,
    status: "En cours de traitement",
    notes: "Vérification automatique",
  });
  const saved = await (await fetch(base + "/api/admin", { headers })).json();
  assert.equal(
    saved.inquiries.find((i) => i.id === inquiry.id).notes,
    "Vérification automatique",
  );
  const badOrigin = await fetch(base + "/api/admin", {
    method: "POST",
    headers: { ...headers, Origin: "https://untrusted.example" },
    body: JSON.stringify({ action: "delete", id }),
  });
  assert.equal(badOrigin.status, 400);
  const unauthorized = await fetch(base + "/api/admin", {
    method: "POST",
    headers: json,
    body: JSON.stringify({ action: "delete", id }),
  });
  assert.equal(unauthorized.status, 401);
  const invalid = await fetch(base + "/api/inquiries", {
    method: "POST",
    headers: json,
    body: JSON.stringify({ ...input, consent: false }),
  });
  assert.equal(invalid.status, 400);
  console.log(
    "PASS: /admin redirect and API refusal without a Supabase admin session, wrong-password refusal, content create/update, quote/contact submissions, server pricing, inbox/status/notes, CSRF rejection, validation, and cleanup.",
  );
} finally {
  for (const requestId of created)
    await admin({ action: "deleteInquiry", id: requestId });
  await admin({ action: "delete", id });
}
