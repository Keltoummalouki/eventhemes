import { formatLongDate, parseIsoDate } from "@/lib/dates";

export type QuoteMessageInput = {
  event: string;
  date: string;
  city: string;
  services: string[];
  name: string;
  phone: string;
  email: string;
  reference?: string;
};

/** Message de demande de devis prévu par le cahier des charges, crochets remplis. */
export function quoteMessage(input: QuoteMessageInput) {
  const date = parseIsoDate(input.date);
  const contact = [input.name, input.phone, input.email].filter(Boolean).join(", ");
  return (
    `Bonjour EVENTHEME, je souhaite demander un devis pour un événement de type ${input.event || "à définir"}, ` +
    `prévu le ${date ? formatLongDate(date) : "(date à définir)"}, à ${input.city || "(ville à définir)"}. ` +
    `Les services souhaités sont : ${input.services.join(", ") || "à définir ensemble"}. ` +
    `Voici mes informations : ${contact}.` +
    (input.reference ? ` Référence de ma demande : ${input.reference}.` : "")
  );
}

/**
 * Lien WhatsApp pré-rempli. Seul un lien `wa.me/<numéro>` accepte un texte :
 * un lien court (`wa.me/message/…`) garde le message fixé dans WhatsApp Business,
 * d’où `null` — l’interface copie alors le message avant d’ouvrir le lien.
 */
export function whatsappLink(url: string | undefined, message: string) {
  const number = url?.match(/^https:\/\/wa\.me\/(\d{8,15})\/?(?:\?|$)/)?.[1];
  return number ? `https://wa.me/${number}?text=${encodeURIComponent(message)}` : null;
}
