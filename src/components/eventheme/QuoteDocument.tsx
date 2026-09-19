"use client";
import { useRef, useState } from "react";
import Button from "@/components/ui/Button";
import { formatLongDate, parseIsoDate } from "@/lib/dates";
import { daysLabel, findSocial, hoursLabel, lineAmount, lineLabel, money, type QuoteResult } from "@/lib/eventheme/types";
import { quoteMessage, whatsappLink } from "@/lib/eventheme/whatsapp";
import { gsap, revealSafe, useGSAP } from "@/lib/motion";
import { initialQuote, useEventheme, useQuote } from "./Provider";
import s from "./QuoteStudio.module.css";
import { ArrowUpRightIcon } from "@/components/ui/icons";

/**
 * Le devis estimatif remis au client en fin de parcours.
 *
 * Une feuille claire, comme un document que l'on garde : références,
 * coordonnées, détail poste par poste, mentions. Elle s'imprime seule
 * (`data-print-root`, voir base.css) et s'envoie sur WhatsApp. Les montants
 * restent indicatifs : le devis définitif vient de l'équipe.
 */
export default function QuoteDocument({ result }: { result: QuoteResult }) {
  const ref = useRef<HTMLDivElement>(null);
  const { entries } = useEventheme();
  const { setQuote } = useQuote();
  const [notice, setNotice] = useState("");
  const { contact, details, basket } = result;
  const label = (id: string) => entries.find((e) => e.id === id)?.title || "À définir";
  const reference = `EVT-${result.id.slice(0, 8).toUpperCase()}`;
  const eventDate = parseIsoDate(details.date);
  const issued = formatLongDate(new Date(result.sentAt));

  useGSAP(
    () =>
      revealSafe(ref, (full) => {
        const find = gsap.utils.selector(ref);
        const paper = find(`.${s.paper}`);
        const rows = find(`.${s.paper} tbody tr, .${s.paperTotal}`);
        if (!full) {
          gsap.set(paper, { clipPath: "inset(0% 0% 0% 0%)" });
          return;
        }
        gsap
          .timeline({ delay: 0.3 })
          .fromTo(
            paper,
            { clipPath: "inset(0% 0% 100% 0%)", y: 40 },
            { clipPath: "inset(0% 0% 0% 0%)", y: 0, duration: 1.4, ease: "expo.inOut" },
          )
          .fromTo(rows, { autoAlpha: 0, x: -16 }, { autoAlpha: 1, x: 0, duration: 0.5, stagger: 0.06 }, "-=0.5");
      }),
    { scope: ref },
  );

  async function sendOnWhatsApp() {
    const whatsapp = findSocial(entries, "whatsapp");
    if (!whatsapp?.url) return;
    const products = basket.products.map((p) => `${label(p.id)}${p.variant ? ` ${p.variant}` : ""} × ${p.quantity}`);
    const message = quoteMessage({
      event: label(details.event),
      date: details.date,
      city: details.city,
      services: [...basket.services.map(label), ...(products.length ? [`matériel : ${products.join(", ")}`] : [])],
      name: contact.name,
      phone: contact.phone,
      email: contact.email,
      reference,
    });
    const link = whatsappLink(whatsapp.url, message);
    if (link) {
      window.open(link, "_blank", "noopener");
      return;
    }
    // Lien court WhatsApp Business : le texte ne peut pas être transmis, on le copie.
    try {
      await navigator.clipboard.writeText(message);
      setNotice("Votre message est copié : collez-le dans la conversation WhatsApp qui s’ouvre.");
    } catch {
      setNotice("Mentionnez la référence " + reference + " dans la conversation WhatsApp qui s’ouvre.");
    }
    window.open(whatsapp.url, "_blank", "noopener");
  }

  return (
    <div className={s.done} ref={ref}>
      <article className={s.paper} data-print-root aria-label={`Devis estimatif ${reference}`}>
        <header className={s.paperHead}>
          <img src="/eventheme_logo_png.webp" alt="EVENTHEME" className={s.paperLogo} width={180} height={82} />
          <div className={s.paperRef}>
            <span>Devis estimatif</span>
            <strong>{reference}</strong>
            <small>Émis le {issued}</small>
          </div>
        </header>

        <div className={s.paperParties}>
          <section>
            <h4>Client</h4>
            <p>
              <b>{contact.name}</b>
              <br />
              {contact.phone}
              {contact.email && (
                <>
                  <br />
                  {contact.email}
                </>
              )}
              <br />
              Contact préféré : {contact.contactMethod}
            </p>
          </section>
          <section>
            <h4>Événement</h4>
            <p>
              <b>{label(details.event)}</b>
              <br />
              {eventDate ? formatLongDate(eventDate) : "Date à définir"}
              {details.duration > 0 && ` · ${hoursLabel(details.duration)}`}
              <br />
              {[details.city, details.address].filter(Boolean).join(", ")}
              <br />
              {details.guests} invités
              {basket.products.length > 0 && (
                <>
                  <br />
                  Location du matériel : {daysLabel(details.rentalDays)}
                </>
              )}
            </p>
          </section>
        </div>

        <table className={s.paperTable}>
          <thead>
            <tr>
              <th scope="col">Désignation</th>
              <th scope="col">Qté</th>
              <th scope="col">Montant</th>
            </tr>
          </thead>
          <tbody>
            {result.lines.map((line, index) => (
              <tr key={`${line.label}-${index}`}>
                <td>{lineLabel(line)}</td>
                <td>{line.quantity}</td>
                <td>{lineAmount(line)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={s.paperTotal}>
          <span>{result.hasUnpriced && result.estimate > 0 ? "Total estimatif des postes chiffrés" : "Total estimatif"}</span>
          <strong>{result.estimate > 0 ? money(result.estimate) : "Sur devis"}</strong>
        </div>

        {details.message && (
          <div className={s.paperNote}>
            <h4>Vos précisions</h4>
            <p>{details.message}</p>
          </div>
        )}

        <footer className={s.paperFoot}>
          <p>
            Estimation indicative et non contractuelle, établie à partir des tarifs publiés sur le site.
            {result.hasUnpriced && " Les postes « sur devis » seront chiffrés par notre équipe."} Disponibilités,
            quantités et montants définitifs vous seront confirmés dans votre devis personnalisé. Aucun paiement en
            ligne.
          </p>
          <p className={s.paperSignature}>Votre événement. Votre vision. Notre savoir-faire.</p>
        </footer>
      </article>

      <div className={s.docActions}>
        <Button icon="↓" onClick={() => window.print()}>
          Imprimer ou enregistrer en PDF
        </Button>
        <Button variant="outline" icon={<ArrowUpRightIcon />} onClick={sendOnWhatsApp}>
          Envoyer sur WhatsApp
        </Button>
        <Button variant="link" onClick={() => setQuote(initialQuote())}>
          Nouvelle demande
        </Button>
      </div>
      <p className={s.notice} role="status">
        {notice}
      </p>
    </div>
  );
}
