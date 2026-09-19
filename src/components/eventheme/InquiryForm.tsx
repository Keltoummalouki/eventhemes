"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useEventheme } from "./Provider";
import { PageIntro } from "./Pages";
import { Arrow } from "./Shell";
import Button from "@/components/ui/Button";
import {
  Checkbox,
  Input,
  PhoneInput,
  Select,
  Textarea,
} from "@/components/ui/form";
import { followersLabel } from "@/lib/eventheme/types";
import s from "./Eventheme.module.css";
const contactMethods = ["WhatsApp", "Téléphone", "E-mail"].map((value) => ({
  value,
  label: value,
}));
/** Formulaire de la page Contact. Les demandes de devis passent par « Mon devis ». */
export default function InquiryForm() {
  const { entries, local } = useEventheme();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    subject: "",
    event: "",
    message: "",
    contactMethod: "WhatsApp",
    consent: false,
    website: "",
  });
  const [startedAt] = useState(() => Date.now());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState("");
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          kind: "contact",
          basket: { services: [], products: [] },
          startedAt,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setSent(result.id);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Impossible d’envoyer votre message. Réessayez.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (sent)
    return (
      <section className={s.success}>
        <span className={s.successIcon}>✓</span>
        <span className={s.eyebrow}>MESSAGE ENVOYÉ</span>
        <h1>
          Merci pour
          <br />
          <em>votre message.</em>
        </h1>
        <p>
          {local
            ? "Votre message de test a été enregistré dans l’administration locale. Aucun e-mail n’a été envoyé."
            : "Notre équipe vous répondra dans les meilleurs délais."}
        </p>
        <p className={s.caption}>Référence : {sent.slice(0, 8).toUpperCase()}</p>
        <Button href="/" icon="↗" className={s.successAction}>
          Retour à l’accueil
        </Button>
      </section>
    );
  return (
    <>
      <PageIntro id="contact" eyebrow="PARLONS DE VOTRE PROJET" />
      <section className={`${s.section} ${s.formLayout}`}>
        <form onSubmit={submit} className={s.form}>
          <h2 className={s.stepTitle}>Racontez-nous votre idée.</h2>
          <div className={s.honeypot} aria-hidden="true">
            <label>
              Site web
              <input
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={(e) => set("website", e.target.value)}
              />
            </label>
          </div>
          <div className={s.formGrid}>
            <Input
              label="Nom complet"
              name="name"
              autoComplete="name"
              required
              maxLength={250}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
            <Input
              label="Entreprise"
              autoComplete="organization"
              maxLength={250}
              value={form.company}
              onChange={(e) => set("company", e.target.value)}
            />
            <Input
              label="E-mail"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
            <PhoneInput
              label="Téléphone"
              name="phone"
              required
              value={form.phone}
              onChange={(phone) => set("phone", phone)}
            />
            <Select
              label="Contact préféré"
              options={contactMethods}
              value={form.contactMethod}
              onChange={(value) => set("contactMethod", value)}
            />
            <Select
              label="Type d’événement"
              searchable
              placeholder="À définir"
              options={[
                { value: "", label: "À définir" },
                ...entries
                  .filter((e) => e.kind === "events")
                  .map((e) => ({ value: e.id, label: e.title })),
              ]}
              value={form.event}
              onChange={(value) => set("event", value)}
            />
            <Input
              label="Objet"
              className={s.fullWidth}
              required
              maxLength={250}
              value={form.subject}
              onChange={(e) => set("subject", e.target.value)}
            />
            <Textarea
              label="Votre message"
              className={s.fullWidth}
              required
              rows={5}
              maxLength={5000}
              value={form.message}
              onChange={(e) => set("message", e.target.value)}
            />
          </div>
          <Checkbox
            className={s.consent}
            required
            checked={form.consent}
            onChange={(consent) => set("consent", consent)}
          >
            J’accepte que mes coordonnées soient utilisées pour répondre à ma
            demande et j’ai pris connaissance de la{" "}
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
          <div className={s.formActions}>
            <Button type="submit" loading={busy} icon="↗">
              {busy ? "Envoi…" : "Envoyer mon message"}
            </Button>
          </div>
        </form>
        <aside className={s.summary}>
          <span className={s.eyebrow}>RESTONS EN CONTACT</span>
          <h3>À votre écoute.</h3>
          <p>
            Un projet précis ? Composez votre événement et recevez votre devis
            estimatif.
          </p>
          <Button href="/devis" variant="link" icon="↗">
            Mon devis
          </Button>
          {entries
            .filter((e) => e.kind === "socials")
            .map((e) => (
              <a
                className={s.contactLink}
                key={e.id}
                href={e.url}
                target={e.url?.startsWith("https") ? "_blank" : undefined}
                rel="noreferrer"
              >
                <span>
                  {e.title}
                  <small>
                    {[e.description, e.followers && followersLabel(e.followers)]
                      .filter(Boolean)
                      .join(" · ")}
                  </small>
                </span>
                <Arrow />
              </a>
            ))}
          {local && (
            <p className={s.demoNote}>
              Aperçu local · Utilisez des coordonnées fictives. Les messages
              sont enregistrés sur cet ordinateur.
            </p>
          )}
        </aside>
      </section>
    </>
  );
}
