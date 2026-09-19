import { createHash, timingSafeEqual } from "node:crypto";
import type { Inquiry } from "./types";

export const continuationHash = (token: string) => createHash("sha256").update(token).digest("hex");

/** A receipt authorizes completing only its own request for 24 hours. */
export function verifyContinuation(inquiry: Inquiry | undefined, token: unknown) {
  if (!inquiry?.continuationHash || typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token) ||
    Date.now() - Date.parse(inquiry.createdAt) > 86400000 ||
    !timingSafeEqual(Buffer.from(inquiry.continuationHash, "hex"), Buffer.from(continuationHash(token), "hex"))) {
    throw new Error("Cette session de personnalisation a expiré. Votre demande de rappel reste enregistrée.");
  }
}
