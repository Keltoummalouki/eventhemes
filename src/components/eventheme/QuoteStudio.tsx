"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Butterflies from "@/components/ui/Butterflies";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import { Checkbox, Input, PhoneInput } from "@/components/ui/form";
import { cx } from "@/lib/cx";
import { findSocial, type QuoteContact, type QuotePhase } from "@/lib/eventheme/types";
import { gsap, MOTION, prefersReducedMotion, revealSafe, useGSAP } from "@/lib/motion";
import { isValidPhone } from "@/lib/phone";
import { useEventheme, useQuote } from "./Provider";
import QuoteConfigurator from "./QuoteConfigurator";
import QuoteDocument from "./QuoteDocument";
import s from "./QuoteStudio.module.css";
import { ArrowUpRightIcon } from "@/components/ui/icons";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTACT_METHODS = ["Téléphone", "WhatsApp", "E-mail"];
/** Les trois temps du parcours, tels que le visiteur les perçoit. */
const JOURNEY = ["Faisons connaissance", "Imaginez votre événement", "Recevez votre devis"];
const journeyIndex: Record<QuotePhase, number> = { lead: 0, invite: 1, waiting: 1, configure: 1, done: 2 };

/**
 * « Mon devis » : le parcours central du site.
 *
 * 1. Un formulaire court (nom, téléphone, e-mail facultatif, moyen de contact
 *    préféré, occasion) crée
 *    aussitôt une demande de rappel : l'équipe a le contact, même si le
 *    visiteur s'arrête là.
 * 2. On lui propose ensuite d'aller plus loin : composer son événement et voir
 *    son estimation évoluer en direct.
 * 3. Il reçoit enfin son devis estimatif : imprimable, envoyable par WhatsApp,
 *    et enregistré dans l'administration.
 *
 * Le parcours vit dans un contexte partagé : il survit à un détour par le
 * catalogue pour ajouter du matériel.
 */
export default function QuoteStudio({
  as: Heading = "h2",
  eventId = "",
}: {
  as?: "h1" | "h2";
  eventId?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const { entries, local } = useEventheme();
  const { quote, setQuote, pickEvent } = useQuote();
  const events = entries.filter((e) => e.kind === "events");
  const whatsapp = findSocial(entries, "whatsapp");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof QuoteContact | "event", string>>>({});
  const [website, setWebsite] = useState("");
  const [startedAt] = useState(() => Date.now());
  const { contact, details, lead } = quote;
  // Sans demande de rappel enregistrée, on revient toujours au premier formulaire.
  const phase: QuotePhase =
    quote.phase === "done" ? (quote.result ? "done" : "lead") : quote.phase !== "lead" && !lead ? "lead" : quote.phase;
  const firstName = contact.name.trim().split(/\s+/)[0] || "";

  // Occasion transmise par l'adresse (/devis?event=…) : appliquée une seule fois.
  const applied = useRef("");
  useEffect(() => {
    if (!eventId || applied.current === eventId) return;
    applied.current = eventId;
    if (events.some((e) => e.id === eventId)) pickEvent(eventId);
  }, [eventId, events, pickEvent]);

  // À chaque changement d'étape du parcours, le titre reprend le focus et la
  // section revient à l'écran si elle en était sortie.
  const shown = useRef(phase);
  useEffect(() => {
    if (shown.current === phase) return;
    shown.current = phase;
    const top = ref.current?.getBoundingClientRect().top ?? 0;
    if (top < -40 || top > window.innerHeight * 0.4)
      ref.current?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
    heading.current?.focus({ preventScroll: true });
    if (!prefersReducedMotion() && ref.current)
      gsap.fromTo(
        ref.current.querySelectorAll(`.${s.stage} > *`),
        { autoAlpha: 0, y: 30 },
        { autoAlpha: 1, y: 0, duration: 0.8, ease: MOTION.ease, stagger: 0.08 },
      );
  }, [phase]);

  /* Première apparition, au défilement. */
  useGSAP(
    () =>
      revealSafe(ref, (full) => {
        const blocks = gsap.utils.toArray<HTMLElement>(`.${s.head} > *, .${s.stage} > *`, ref.current);
        if (!full) {
          gsap.set(blocks, { autoAlpha: 1, y: 0 });
          return;
        }
        gsap.fromTo(
          blocks,
          { autoAlpha: 0, y: 34 },
          {
            autoAlpha: 1,
            y: 0,
            duration: MOTION.duration,
            ease: MOTION.ease,
            stagger: 0.1,
            scrollTrigger: { trigger: ref.current, start: "top 72%", once: true },
          },
        );
      }),
    { scope: ref },
  );

  const setContact = (patch: Partial<QuoteContact>) =>
    setQuote((q) => ({ ...q, contact: { ...q.contact, ...patch } }));
  const go = (next: QuotePhase) => setQuote((q) => ({ ...q, phase: next, step: 0 }));

  async function sendLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const found: typeof errors = {};
    if (!contact.name.trim()) found.name = "Indiquez votre nom.";
    if (!isValidPhone(contact.phone)) found.phone = "Indiquez un numéro de téléphone valide.";
    if (contact.email.trim() && !EMAIL.test(contact.email.trim())) found.email = "Cette adresse e-mail semble incomplète.";
    else if (contact.contactMethod === "E-mail" && !contact.email.trim())
      found.email = "Ajoutez votre e-mail, ou choisissez un autre moyen de contact.";
    if (!details.event) found.event = "Choisissez votre événement.";
    if (!contact.consent) found.consent = "Votre accord est nécessaire pour être recontacté.";
    setErrors(found);
    if (Object.keys(found).length) {
      setError("Quelques informations manquent encore.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "callback",
          name: contact.name,
          phone: contact.phone,
          email: contact.email,
          event: details.event,
          consent: true,
          website,
          startedAt,
          contactMethod: contact.contactMethod,
          basket: { services: [], products: [] },
          guests: 0,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setQuote((q) => ({
        ...q,
        phase: "invite",
        lead: { id: result.id, token: result.token, name: q.contact.name, phone: q.contact.phone, email: q.contact.email, event: q.details.event },
      }));
    } catch (cause) {
      setError(cause instanceof Error && cause.message ? cause.message : "L’envoi a échoué. Réessayez.");
    } finally {
      setBusy(false);
    }
  }

  const title =
    phase === "lead" ? (
      <>
        Votre événement
        <br />
        <em>commence ici.</em>
      </>
    ) : phase === "invite" ? (
      <>
        C’est noté{firstName && `, ${firstName}`}.
        <br />
        <em>Et si l’on imaginait la suite ?</em>
      </>
    ) : phase === "waiting" ? (
      <>
        À très bientôt{firstName && `, ${firstName}`}.
        <br />
        <em>Nous vous rappelons.</em>
      </>
    ) : phase === "configure" ? (
      <>
        Composez votre
        <br />
        <em>événement.</em>
      </>
    ) : (
      <>
        Votre devis
        <br />
        <em>est prêt.</em>
      </>
    );
  const intro = {
    lead: "Laissez-nous vos coordonnées : notre équipe vous rappelle. Ensuite, si vous le souhaitez, composez votre événement et découvrez son estimation.",
    invite: "Votre demande de rappel est enregistrée. Vous pouvez vous arrêter ici, ou nous en dire plus et voir, poste par poste, ce que représente votre événement.",
    waiting: `Notre équipe vous contactera au ${lead?.phone || contact.phone} dans les meilleurs délais. Vous pouvez toujours composer votre événement en attendant.`,
    configure: "Choisissez vos prestations et votre matériel : l’estimation évolue en direct avec vos choix. Rien n’est engagé avant notre échange.",
    done: "Merci pour votre demande. Notre équipe vous contactera dans les meilleurs délais afin de préparer une proposition adaptée à votre événement.",
  }[phase];
  const wide = phase === "configure" || phase === "done";

  return (
    <section className={cx(s.studio, wide && s.wide)} id="devis" ref={ref} aria-labelledby="devis-titre">
      <Butterflies count={2} />
      <div className={s.inner}>
        <div className={s.head}>
          <Eyebrow>Mon devis</Eyebrow>
          <Heading id="devis-titre" ref={heading} tabIndex={-1} className={s.title}>
            {title}
          </Heading>
          <p className={s.intro}>{intro}</p>
          {/* Pendant la personnalisation, les étapes du configurateur suffisent. */}
          {phase !== "configure" && (
            <ol className={s.journey} style={{ ["--progress" as string]: journeyIndex[phase] / 2 }}>
              {JOURNEY.map((label, index) => (
                <li
                  key={label}
                  className={cx(index < journeyIndex[phase] && s.passed, index === journeyIndex[phase] && s.here)}
                  aria-current={index === journeyIndex[phase] ? "step" : undefined}
                >
                  <span>{index < journeyIndex[phase] ? "✓" : String(index + 1).padStart(2, "0")}</span>
                  {label}
                </li>
              ))}
            </ol>
          )}
          {!wide && (
            <p className={s.reassurance}>
              Sans engagement · Sans paiement en ligne · À votre rythme
              {whatsapp?.url && (
                <>
                  <br />
                  Vous préférez écrire ?{" "}
                  <a href={whatsapp.url} target="_blank" rel="noreferrer">
                    Échangeons sur WhatsApp <ArrowUpRightIcon className="inline-icon" />
                  </a>
                </>
              )}
            </p>
          )}
        </div>

        <div className={s.stage}>
          {phase === "lead" && (
            <form className={s.card} onSubmit={sendLead} noValidate>
              <span className={s.cardKicker}>01 — Faisons connaissance</span>
              <div className={s.fields}>
                <Input
                  label="Nom complet"
                  name="name"
                  required
                  autoComplete="name"
                  maxLength={250}
                  value={contact.name}
                  error={errors.name}
                  onChange={(e) => setContact({ name: e.target.value })}
                />
                <PhoneInput
                  label="Téléphone"
                  name="phone"
                  required
                  value={contact.phone}
                  error={errors.phone}
                  onChange={(phone) => setContact({ phone })}
                />
                <Input
                  label="E-mail (facultatif)"
                  name="email"
                  type="email"
                  autoComplete="email"
                  maxLength={250}
                  value={contact.email}
                  error={errors.email}
                  onChange={(e) => setContact({ email: e.target.value })}
                />
              </div>
              <fieldset className={s.group}>
                <legend>Comment préférez-vous être contacté ?</legend>
                <div className={s.chips}>
                  {CONTACT_METHODS.map((method) => (
                    <label key={method} className={cx(s.chip, contact.contactMethod === method && s.chipOn)}>
                      <input
                        type="radio"
                        name="contactMethod"
                        value={method}
                        checked={contact.contactMethod === method}
                        onChange={() => setContact({ contactMethod: method })}
                      />
                      {method}
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset className={s.occasions} aria-describedby={errors.event ? "occasion-erreur" : undefined}>
                <legend>
                  Votre événement <span aria-hidden="true">*</span>
                </legend>
                <div className={s.chips}>
                  {events.map((e) => (
                    <label key={e.id} className={cx(s.chip, details.event === e.id && s.chipOn)}>
                      <input
                        type="radio"
                        name="event"
                        value={e.id}
                        checked={details.event === e.id}
                        onChange={() => pickEvent(e.id)}
                      />
                      {e.title}
                    </label>
                  ))}
                </div>
                {errors.event && (
                  <p id="occasion-erreur" className={s.fieldError}>
                    {errors.event}
                  </p>
                )}
              </fieldset>
              <div className={s.honeypot} aria-hidden="true">
                <label>
                  Site web
                  <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
                </label>
              </div>
              <Checkbox
                className={s.consent}
                required
                checked={contact.consent}
                error={errors.consent}
                onChange={(consent) => setContact({ consent })}
              >
                J’accepte d’être contacté au sujet de mon événement et la{" "}
                <Link href="/politique-de-confidentialite" target="_blank">
                  politique de confidentialité
                </Link>
                .
              </Checkbox>
              {error && (
                <p className={s.error} role="alert">
                  {error}
                </p>
              )}
              <Button type="submit" loading={busy} icon={<ArrowUpRightIcon />} block magnetic>
                {busy ? "Envoi…" : "Être recontacté"}
              </Button>
              <p className={s.caption}>
                Ensuite, si vous le souhaitez : personnalisation de votre événement et estimation détaillée.
              </p>
              {local && <p className={s.demo}>Aperçu local · utilisez des coordonnées fictives.</p>}
            </form>
          )}

          {(phase === "invite" || phase === "waiting") && lead && (
            <div className={cx(s.card, s.invite)}>
              <svg className={s.check} viewBox="0 0 60 60" aria-hidden="true" focusable="false">
                <circle cx="30" cy="30" r="28" />
                <path d="M19 31 l7 7 l15 -16" />
              </svg>
              <span className={s.cardKicker}>Demande reçue · Réf. {lead.id.slice(0, 8).toUpperCase()}</span>
              <h3>{phase === "invite" ? "Envie d’aller un peu plus loin ?" : "Votre demande est entre de bonnes mains."}</h3>
              <p>
                {phase === "invite"
                  ? "En quelques étapes, choisissez vos prestations et votre matériel, découvrez l’estimation de votre événement et recevez votre devis détaillé."
                  : "Si l’envie vous prend, composez votre événement : votre devis estimatif sera prêt en quelques minutes."}
              </p>
              <ul className={s.perks}>
                <li>Estimation en direct, poste par poste</li>
                <li>Devis imprimable et envoyable sur WhatsApp</li>
                <li>Votre demande reste enregistrée, quoi que vous choisissiez</li>
              </ul>
              <div className={s.inviteActions}>
                <Button icon={<ArrowUpRightIcon />} magnetic onClick={() => go("configure")}>
                  Personnaliser mon événement
                </Button>
                {phase === "invite" && (
                  <Button variant="link" onClick={() => go("waiting")}>
                    Je préfère être rappelé
                  </Button>
                )}
              </div>
              {local && <p className={s.demo}>Aperçu local : demande enregistrée sur cet ordinateur, sans e-mail.</p>}
            </div>
          )}

          {phase === "configure" && lead && <QuoteConfigurator />}
          {phase === "done" && quote.result && <QuoteDocument result={quote.result} />}
        </div>
      </div>
    </section>
  );
}
