import "server-only";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import path from "node:path";
import { seed } from "@/data/eventheme";
import type { Entry, Inquiry } from "./types";
import { verifyContinuation } from "./continuation";
import { adminLogin, authConfigured, hasAdminRole } from "./auth";
export { authConfigured } from "./auth";

export const configured = () =>
  Boolean(
    process.env.EVENTHEME_DATA_MODE === "supabase" &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
    process.env.SUPABASE_SECRET_KEY,
  );
export const localMode = () =>
  process.env.EVENTHEME_DATA_MODE !== "supabase" && process.env.NODE_ENV !== "production";
export async function authClient() {
  const jar = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => jar.getAll(),
        setAll: (values) => {
          try {
            values.forEach(({ name, value, options }) =>
              jar.set(name, value, options),
            );
          } catch {
            /* The proxy refreshes cookies before Server Component rendering. */
          }
        },
      },
    },
  );
}
function database() {
  if (!configured())
    throw new Error(
      "La base de données doit être configurée avant la mise en ligne.",
    );
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
// Every mode, including local data, requires a Supabase account with the admin role.
// getUser() asks the Auth server, so a deleted or demoted account loses access at once.
export async function isAdmin() {
  if (!authConfigured()) return false;
  const client = await authClient();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  return !error && hasAdminRole(user);
}
export async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("UNAUTHORIZED");
}
// For admin pages: send anyone without an admin session to the login page.
export async function verifyAdmin() {
  if (!(await isAdmin())) redirect(adminLogin);
}

type LocalStore = { entries: Entry[]; inquiries: Inquiry[] };
const directory = path.join(process.cwd(), ".eventheme");
const file = path.join(directory, "data.json");
async function localRead(): Promise<LocalStore> {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    return { entries: structuredClone(seed), inquiries: [] };
  }
}
// Share the write queue across route bundles and development hot reloads.
const localState = globalThis as typeof globalThis & { eventhemeWriteQueue?: Promise<void> };
async function localWrite(edit: (data: LocalStore) => void) {
  const next = (localState.eventhemeWriteQueue ?? Promise.resolve()).then(async () => {
    const data = await localRead();
    edit(data);
    await mkdir(directory, { recursive: true });
    const temporary = `${file}.tmp`;
    await writeFile(temporary, JSON.stringify(data, null, 2), "utf8");
    await rename(temporary, file);
  });
  localState.eventhemeWriteQueue = next.catch(() => {});
  await next;
}
export async function getEntries(includeDrafts = false): Promise<Entry[]> {
  let entries: Entry[];
  if (localMode()) entries = (await localRead()).entries;
  else if (!configured())
    entries = seed; // Static preview only; submissions/admin remain closed in production.
  else {
    const { data, error } = await database()
      .from("content")
      .select("data")
      .order("created_at");
    if (error) throw error;
    entries = data.map((row) => row.data as Entry);
  }
  return includeDrafts ? entries : entries.filter((entry) => entry.published);
}
export async function saveEntry(entry: Entry) {
  if (localMode())
    return localWrite((data) => {
      const index = data.entries.findIndex((e) => e.id === entry.id);
      if (index < 0) data.entries.push(entry);
      else data.entries[index] = entry;
    });
  const { error } = await database()
    .from("content")
    .upsert({
      id: entry.id,
      kind: entry.kind,
      published: entry.published,
      data: entry,
    });
  if (error) throw error;
}
export async function deleteEntry(id: string) {
  if (localMode())
    return localWrite((data) => {
      data.entries = data.entries.filter((e) => e.id !== id);
    });
  const { error } = await database().from("content").delete().eq("id", id);
  if (error) throw error;
}
export async function getInquiries(): Promise<Inquiry[]> {
  if (localMode())
    return (await localRead()).inquiries.sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  const { data, error } = await database()
    .from("inquiries")
    .select("data")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map((row) => row.data as Inquiry);
}
export async function saveInquiry(inquiry: Inquiry) {
  if (localMode())
    return localWrite((data) => {
      const index = data.inquiries.findIndex((e) => e.id === inquiry.id);
      if (index < 0) data.inquiries.push(inquiry);
      else data.inquiries[index] = inquiry;
    });
  const { error } = await database()
    .from("inquiries")
    .upsert({ id: inquiry.id, data: inquiry });
  if (error) throw error;
}
export async function deleteInquiry(id: string) {
  if (localMode())
    return localWrite((data) => {
      data.inquiries = data.inquiries.filter((e) => e.id !== id);
    });
  const { error } = await database().from("inquiries").delete().eq("id", id);
  if (error) throw error;
}
// Compare-and-swap preserves any admin status/notes changed during customization.
export async function completeCallback(id: string, token: unknown, quote: Inquiry): Promise<Inquiry> {
  const merge = (previous: Inquiry | undefined) => {
    verifyContinuation(previous, token);
    if (!previous) throw new Error("Demande introuvable.");
    if (previous.kind === "quote") return previous; // A retry returns the first accepted result.
    if (previous.kind !== "callback") throw new Error("Demande invalide.");
    return { ...quote, id, createdAt: previous.createdAt, status: previous.status,
      notes: previous.notes, continuationHash: previous.continuationHash, completedAt: new Date().toISOString() };
  };
  if (localMode()) {
    let saved: Inquiry | undefined;
    await localWrite(data => {
      const index = data.inquiries.findIndex(item => item.id === id);
      saved = merge(data.inquiries[index]);
      data.inquiries[index] = saved;
    });
    return saved!;
  }
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, error } = await database().from("inquiries").select("data").eq("id", id).maybeSingle();
    if (error) throw error;
    const previous = data?.data as Inquiry | undefined;
    const next = merge(previous);
    if (previous?.kind === "quote") return next;
    const update = await database().from("inquiries").update({ data: next })
      .eq("id", id).eq("data", JSON.stringify(previous)).select("id");
    if (update.error) throw update.error;
    if (update.data?.length) return next;
  }
  throw new Error("La demande vient d’être modifiée. Réessayez dans un instant.");
}
// Atomic DB rate limiting works across production instances. Local limits are development-only.
const attempts = new Map<string, { count: number; until: number }>();
export async function rateLimit(key: string, limit = 5) {
  if (configured()) {
    const { data, error } = await database().rpc("consume_rate_limit", {
      bucket_key: key,
      max_attempts: limit,
    });
    if (error) throw error;
    if (!data)
      throw new Error("Trop de tentatives. Réessayez dans quinze minutes.");
    return;
  }
  const now = Date.now();
  for (const [id, bucket] of attempts)
    if (bucket.until < now) attempts.delete(id);
  const bucket = attempts.get(key) ?? { count: 0, until: now + 15 * 60000 };
  if (++bucket.count > limit)
    throw new Error("Trop de tentatives. Réessayez dans quinze minutes.");
  attempts.set(key, bucket);
}
