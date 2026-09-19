// Grant or revoke back-office access for an existing Supabase Auth account.
// Usage: npm run admin:role -- grant|revoke email@example.com
import { loadEnvFile } from "node:process";
import { createClient, type User } from "@supabase/supabase-js";
for (const file of [".env.local", ".env"])
  try {
    loadEnvFile(file);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
async function main() {
  const [action, email] = process.argv.slice(2);
  if ((action !== "grant" && action !== "revoke") || !email)
    throw new Error("Usage : npm run admin:role -- grant|revoke e-mail");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key)
    throw new Error(
      "Définissez NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SECRET_KEY dans .env.local.",
    );
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  let user: User | undefined;
  for (let page = 1; !user; page++) {
    const { data, error } = await client.auth.admin.listUsers({
      page,
      perPage: 1000,
    });
    if (error) throw error;
    user = data.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase(),
    );
    if (data.users.length < 1000) break;
  }
  if (!user)
    throw new Error(
      `Aucun compte ${email}. Créez-le d’abord dans Supabase : Authentication → Users → Add user → Create new user, avec « Auto Confirm User ».`,
    );
  // Supabase merges app_metadata keys; null deletes the role and keeps the provider fields.
  const { error } = await client.auth.admin.updateUserById(user.id, {
    app_metadata: { role: action === "grant" ? "admin" : null },
  });
  if (error) throw error;
  console.log(
    action === "grant"
      ? `${email} est administrateur. Se reconnecter pour appliquer le rôle.`
      : `${email} n’a plus accès à l’administration.`,
  );
}
main().catch((error: Error) => {
  console.error(error.message);
  process.exitCode = 1;
});
