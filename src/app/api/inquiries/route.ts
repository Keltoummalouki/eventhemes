import { createHash, randomBytes, randomUUID } from "node:crypto";
import { continuationHash } from "@/lib/eventheme/continuation";
import {
  getEntries,
  localMode,
  configured,
  rateLimit,
  saveInquiry,
  completeCallback,
} from "@/lib/eventheme/server";
import { validateInquiry } from "@/lib/eventheme/validation";
import { estimate } from "@/lib/eventheme/pricing";
import { checkOrigin, readBody } from "@/lib/eventheme/http";
import type { Inquiry } from "@/lib/eventheme/types";
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    if (!localMode() && !configured())
      return Response.json(
        {
          error:
            "Les demandes en ligne seront disponibles prochainement. Contactez-nous sur WhatsApp.",
        },
        { status: 503 },
      );
    const entries = await getEntries();
    const body = await readBody(request);
    const input = validateInquiry(body, entries);
    const key = createHash("sha256")
      .update(input.phone.replace(/\D/g, ""))
      .digest("hex");
    await rateLimit(`submit:${key}`);
    const calculation = input.kind === "quote" ? estimate(entries, input, input.basket) : { total: 0, hasUnpriced: false, summary: [] as string[] };
    const token = input.kind === "callback" ? randomBytes(32).toString("hex") : undefined;
    const inquiry = {
      ...input,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      status: "Nouvelle demande" as const,
      notes: "",
      estimate: calculation.total,
      hasUnpriced: calculation.hasUnpriced,
      summary: calculation.summary,
      ...(token ? { continuationHash: continuationHash(token) } : {}),
    };
    let saved: Inquiry = inquiry;
    const continuation = body as { callbackId?: unknown; token?: unknown };
    if (continuation.callbackId !== undefined) {
      if (input.kind !== "quote" || typeof continuation.callbackId !== "string" || !/^[a-f0-9-]{36}$/.test(continuation.callbackId))
        throw new Error("Référence de demande invalide.");
      saved = await completeCallback(continuation.callbackId, continuation.token, inquiry);
    } else await saveInquiry(inquiry);
    return Response.json(
      { id: saved.id, local: localMode(), ...(token ? { token } : {}),
        ...(input.kind === "quote" ? { estimate: saved.estimate, hasUnpriced: saved.hasUnpriced, summary: saved.summary } : {}) },
      { status: 201 },
    );
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Impossible d’enregistrer la demande.",
      },
      { status: 400 },
    );
  }
}
