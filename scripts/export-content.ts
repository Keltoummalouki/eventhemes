import { readFile, writeFile, mkdir } from "node:fs/promises";
import { seed } from "../src/data/eventheme";
import { validateEntry } from "../src/lib/eventheme/validation";
import type { Entry } from "../src/lib/eventheme/types";
async function main() {
  let entries: Entry[] = seed;
  try {
    entries = JSON.parse(
      await readFile(".eventheme/data.json", "utf8"),
    ).entries;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  const literal = (value: string) => `'${value.replaceAll("'", "''")}'`;
  const statements = entries
    .map(validateEntry)
    .map(
      (e) =>
        `insert into public.content (id, kind, published, data) values (${literal(e.id)}, ${literal(e.kind)}, ${e.published}, ${literal(JSON.stringify(e))}::jsonb) on conflict (id) do nothing;`,
    );
  await mkdir("supabase", { recursive: true });
  await writeFile(
    "supabase/seed.sql",
    "-- Public content only. No client requests or private contact records.\n" +
      statements.join("\n") +
      "\n",
  );
  console.log(
    `Exported ${entries.length} content entries to supabase/seed.sql. No remote database was modified.`,
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
