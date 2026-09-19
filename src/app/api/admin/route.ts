import {
  requireAdmin,
  getEntries,
  getInquiries,
  saveEntry,
  deleteEntry,
  saveInquiry,
  deleteInquiry,
} from "@/lib/eventheme/server";
import { validateEntry } from "@/lib/eventheme/validation";
import { checkOrigin, readBody } from "@/lib/eventheme/http";
import { statuses } from "@/lib/eventheme/types";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    await requireAdmin();
    return Response.json(
      { entries: await getEntries(true), inquiries: await getInquiries() },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { error: "Connexion administrateur requise." },
      { status: 401 },
    );
  }
}
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    await requireAdmin();
    const body = (await readBody(request)) as {
      action: string;
      value: unknown;
      id: string;
      status: (typeof statuses)[number];
      notes: string;
    };
    if (body.action === "save") await saveEntry(validateEntry(body.value));
    else if (body.action === "delete") await deleteEntry(String(body.id));
    else if (body.action === "deleteInquiry")
      await deleteInquiry(String(body.id));
    else if (body.action === "inquiry") {
      const inquiry = (await getInquiries()).find((i) => i.id === body.id);
      if (
        !inquiry ||
        !statuses.includes(body.status) ||
        typeof body.notes !== "string" ||
        body.notes.length > 10000
      )
        throw new Error("Demande invalide.");
      await saveInquiry({ ...inquiry, status: body.status, notes: body.notes });
    } else throw new Error("Action inconnue.");
    return Response.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Enregistrement impossible.";
    return Response.json(
      { error: message },
      { status: message === "UNAUTHORIZED" ? 401 : 400 },
    );
  }
}
