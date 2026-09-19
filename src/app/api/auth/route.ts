import {
  authClient,
  authConfigured,
  rateLimit,
} from "@/lib/eventheme/server";
import { hasAdminRole } from "@/lib/eventheme/auth";
import { checkOrigin, readBody } from "@/lib/eventheme/http";
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const body = (await readBody(request)) as {
      email: string;
      password: string;
      action: string;
    };
    if (body.action === "logout") {
      if (authConfigured()) await (await authClient()).auth.signOut();
      return Response.json({ ok: true });
    }
    if (!authConfigured())
      throw new Error("La connexion administrateur n’est pas configurée.");
    if (typeof body.email !== "string" || typeof body.password !== "string")
      throw new Error("Identifiants requis.");
    await rateLimit(`login:${body.email.toLowerCase().slice(0, 250)}`, 5);
    const client = await authClient();
    const { data, error } = await client.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    });
    // A valid account without the admin role is signed out and gets the same answer.
    if (error || !hasAdminRole(data.user)) {
      await client.auth.signOut();
      throw new Error("Identifiants incorrects ou accès non autorisé.");
    }
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Connexion impossible.",
      },
      { status: 401 },
    );
  }
}
