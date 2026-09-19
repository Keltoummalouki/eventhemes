"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import { ArrowUpRightIcon, CloseIcon } from "@/components/ui/icons";
import { DatePicker, Input, NumberInput, Select, Textarea } from "@/components/ui/form";
import { serviceItems } from "@/data/eventheme";
import { isMoroccanCity, moroccanCities } from "@/data/moroccanCities";
import { cx } from "@/lib/cx";
import { formatLongDate, parseIsoDate, toIsoDate, today } from "@/lib/dates";
import { estimate } from "@/lib/eventheme/pricing";
import {
  daysLabel,
  hoursLabel,
  lineAmount,
  lineLabel,
  MAX_DURATION_HOURS,
  MAX_RENTAL_DAYS,
  money,
  priceLabel,
  type Basket,
  type QuoteDetails,
} from "@/lib/eventheme/types";
import { gsap, MOTION, prefersReducedMotion } from "@/lib/motion";
import { useEventheme, useQuote } from "./Provider";
import s from "./QuoteStudio.module.css";

const STEPS = ["L’événement", "Les prestations", "Le matériel", "Récapitulatif"];
const GUESTS = { min: 10, max: 1000, step: 10 };
const CITY_OPTIONS = moroccanCities.map((city) => ({ value: city, label: city }));

type Errors = Partial<Record<keyof QuoteDetails, string>>;

/**
 * Personnalisation de l'événement, en quatre étapes, avec estimation en direct.
 * Les services et le matériel alimentent le même panier que les boutons
 * « Ajouter à mon devis » du site : rien n'est saisi deux fois.
 */
export default function QuoteConfigurator() {
  const { entries, basket, setBasket, local } = useEventheme();
  const { quote, setQuote } = useQuote();
  const { details, contact, lead, step } = quote;
  const [errors, setErrors] = useState<Errors>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [variants, setVariants] = useState<Record<string, string>>({});
  const [startedAt] = useState(() => Date.now());
  const panel = useRef<HTMLDivElement>(null);
  const stepTitle = useRef<HTMLHeadingElement>(null);
  const total = useRef<HTMLSpanElement>(null);
  const shownTotal = useRef<number | null>(null);

  const options = (kind: string) => entries.filter((e) => e.kind === kind);
  const label = (id: string) => entries.find((e) => e.id === id)?.title || "À définir";
  const calculation = estimate(entries, details, basket);
  const articles = basket.products.reduce((n, p) => n + p.quantity, 0);
  const minDate = toIsoDate(today());

  const setDetails = (patch: Partial<QuoteDetails>) => setQuote((q) => ({ ...q, details: { ...q.details, ...patch } }));
  const goTo = (next: number) => {
    setErrors({});
    setError("");
    setQuote((q) => ({ ...q, step: next }));
  };

  /* Changement d'étape : le contenu entre de côté, le titre prend le focus.
     Les styles sont retirés à l'arrivée : une transformation laissée sur chaque
     bloc en ferait un contexte d'empilement, et la liste d'un champ passerait
     sous les blocs suivants. */
  const firstStep = useRef(true);
  useEffect(() => {
    if (firstStep.current) {
      firstStep.current = false;
      return;
    }
    stepTitle.current?.focus({ preventScroll: true });
    const top = panel.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) panel.current?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
    if (!prefersReducedMotion() && panel.current)
      gsap.fromTo(
        panel.current.querySelectorAll(`.${s.stepBody} > *`),
        { autoAlpha: 0, x: 28 },
        {
          autoAlpha: 1,
          x: 0,
          duration: 0.6,
          ease: MOTION.ease,
          stagger: 0.05,
          clearProps: "transform,opacity,visibility",
        },
      );
  }, [step]);

  /* Montant estimé : le chiffre défile de l'ancienne à la nouvelle valeur.
     Le nœud n'a pas d'enfant React : seul cet effet écrit dedans. */
  useEffect(() => {
    const node = total.current;
    if (!node) return;
    const next = calculation.total;
    const from = shownTotal.current;
    shownTotal.current = next;
    const write = (value: number) => {
      node.textContent = value > 0 ? money(Math.round(value)) : "Sur devis";
    };
    if (from == null || from === 0 || next === 0 || prefersReducedMotion()) {
      write(next);
      return;
    }
    const counter = { value: from };
    const tween = gsap.to(counter, { value: next, duration: 0.9, ease: "power3.out", onUpdate: () => write(counter.value) });
    return () => {
      tween.kill();
      write(next);
    };
  }, [calculation.total]);

  function validate(current: number): Errors {
    const found: Errors = {};
    if (current === 0) {
      if (!details.event) found.event = "Choisissez votre événement.";
      if (!parseIsoDate(details.date) || details.date < minDate) found.date = "Choisissez une date à venir.";
      if (!isMoroccanCity(details.city)) found.city = "Choisissez la ville de l’événement.";
      if (details.duration < 0 || details.duration > MAX_DURATION_HOURS)
        found.duration = `Indiquez une durée de ${MAX_DURATION_HOURS} heures au plus.`;
      if (!Number.isInteger(details.guests) || details.guests < 1 || details.guests > 10000)
        found.guests = "Indiquez un nombre d’invités entre 1 et 10 000.";
    }
    if (
      current === 2 &&
      (!Number.isInteger(details.rentalDays) || details.rentalDays < 1 || details.rentalDays > MAX_RENTAL_DAYS)
    )
      found.rentalDays = `Indiquez entre 1 et ${MAX_RENTAL_DAYS} jours de location.`;
    return found;
  }

  async function next(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate(step);
    setErrors(found);
    if (Object.keys(found).length) {
      setError("Quelques informations manquent encore.");
      return;
    }
    setError("");
    if (step < STEPS.length - 1) return goTo(step + 1);
    // Dernier contrôle de toutes les étapes, au cas où l'on y serait revenu.
    for (const index of [0, 2]) {
      const missing = validate(index);
      if (Object.keys(missing).length) {
        setQuote((q) => ({ ...q, step: index }));
        setErrors(missing);
        setError("Quelques informations manquent encore.");
        return;
      }
    }
    if (!lead) return;
    setBusy(true);
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "quote",
          ...details,
          name: contact.name,
          phone: contact.phone,
          email: contact.email,
          contactMethod: contact.contactMethod,
          consent: true,
          website: "",
          startedAt,
          subject: "",
          basket,
          callbackId: lead.id,
          token: lead.token,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      const sentBasket: Basket = basket;
      setQuote((q) => ({
        ...q,
        phase: "done",
        step: 0,
        result: {
          id: result.id,
          sentAt: new Date().toISOString(),
          estimate: result.estimate ?? calculation.total,
          hasUnpriced: result.hasUnpriced ?? calculation.hasUnpriced,
          lines: calculation.lines,
          contact: q.contact,
          details: q.details,
          basket: sentBasket,
        },
      }));
      setBasket({ services: [], products: [] });
    } catch (cause) {
      setError(cause instanceof Error && cause.message ? cause.message : "Impossible d’envoyer votre demande. Réessayez.");
    } finally {
      setBusy(false);
    }
  }

  /* --- Panier ----------------------------------------------------------- */
  const toggleService = (id: string) =>
    setBasket({
      ...basket,
      services: basket.services.includes(id) ? basket.services.filter((x) => x !== id) : [...basket.services, id],
    });
  const quantity = (id: string, variant: string) =>
    basket.products.find((p) => p.id === id && p.variant === variant)?.quantity ?? 0;
  const setQuantity = (id: string, variant: string, value: number) => {
    const amount = Math.max(0, Math.min(1000, Math.round(value) || 0));
    const exists = basket.products.some((p) => p.id === id && p.variant === variant);
    const products = exists
      ? basket.products
          .map((p) => (p.id === id && p.variant === variant ? { ...p, quantity: amount } : p))
          .filter((p) => p.quantity > 0)
      : amount > 0
        ? [...basket.products, { id, variant, quantity: amount }]
        : basket.products;
    setBasket({ ...basket, products });
  };

  const eventDate = parseIsoDate(details.date);
  // Coordonnées : saisies au premier formulaire, elles ne se modifient pas ici.
  const recap: [term: string, value: string, step: number | null][] = [
    ["Événement", label(details.event), 0],
    [
      "Date",
      `${eventDate ? formatLongDate(eventDate) : "À définir"}${details.duration ? ` · ${hoursLabel(details.duration)}` : ""}`,
      0,
    ],
    ["Lieu", [details.city || "À définir", details.address].filter(Boolean).join(", "), 0],
    ["Invités", `${details.guests}`, 0],
    ["Services", basket.services.map(label).join(", ") || "Aucun service sélectionné", 1],
    [
      "Matériel",
      basket.products.length
        ? `${basket.products.map((p) => `${label(p.id)}${p.variant ? ` ${p.variant}` : ""} × ${p.quantity}`).join(", ")} · ${daysLabel(details.rentalDays)}`
        : "Aucun matériel sélectionné",
      2,
    ],
    [
      "Vos coordonnées",
      [contact.name, contact.phone, contact.email, `Contact : ${contact.contactMethod}`].filter(Boolean).join(" · "),
      null,
    ],
  ];

  return (
    <div className={s.configurator} ref={panel}>
      <div className={s.main}>
        <ol className={s.steps} style={{ ["--progress" as string]: step / (STEPS.length - 1) }}>
          {STEPS.map((title, index) => (
            <li key={title} className={cx(index < step && s.passed, index === step && s.here)}>
              <button
                type="button"
                disabled={index > step}
                onClick={() => goTo(index)}
                aria-current={index === step ? "step" : undefined}
              >
                <span>{index < step ? "✓" : String(index + 1).padStart(2, "0")}</span>
                <b>{title}</b>
              </button>
            </li>
          ))}
        </ol>

        <form className={s.stepForm} onSubmit={next} noValidate>
          <h3 ref={stepTitle} tabIndex={-1} className={s.stepTitle}>
            <small>
              Étape {step + 1} / {STEPS.length}
            </small>
            {STEPS[step]}
          </h3>

          <div className={s.stepBody} key={step}>
            {step === 0 && (
              <>
                <Select
                  label="Votre événement"
                  required
                  searchable
                  options={options("events").map((e) => ({ value: e.id, label: e.title }))}
                  value={details.event}
                  error={errors.event}
                  onChange={(value) => setDetails({ event: value })}
                />
                <div className={s.grid2}>
                  <DatePicker
                    label="Date de l’événement"
                    name="date"
                    required
                    min={minDate}
                    value={details.date}
                    error={errors.date}
                    onChange={(value) => setDetails({ date: value })}
                  />
                  <NumberInput
                    label="Durée de l’événement (facultatif)"
                    name="duration"
                    min={1}
                    max={MAX_DURATION_HOURS}
                    decimals={1}
                    suffix="heures"
                    placeholder="Si vous la connaissez"
                    value={details.duration || null}
                    error={errors.duration}
                    onChange={(duration) => setDetails({ duration: duration ?? 0 })}
                  />
                </div>
                <div className={s.grid2}>
                  <Select
                    label="Ville"
                    name="city"
                    required
                    searchable
                    placeholder="Choisir une ville"
                    emptyText="Ville non listée : choisissez la plus proche, puis précisez l’adresse."
                    options={CITY_OPTIONS}
                    value={details.city}
                    error={errors.city}
                    onChange={(value) => setDetails({ city: value })}
                  />
                  <Input
                    label="Adresse du lieu (facultatif)"
                    maxLength={250}
                    autoComplete="street-address"
                    placeholder="Nom du lieu, quartier, rue…"
                    value={details.address}
                    onChange={(e) => setDetails({ address: e.target.value })}
                  />
                </div>
                <div className={s.guests}>
                  <div className={s.guestsHead}>
                    <span className={s.guestsLabel}>
                      Nombre d’invités <span aria-hidden="true">*</span>
                    </span>
                    <output htmlFor="devis-invites devis-invites-curseur">
                      {details.guests || 0} <small>invités</small>
                    </output>
                  </div>
                  <input
                    id="devis-invites-curseur"
                    className={s.range}
                    type="range"
                    aria-label="Nombre d’invités, réglage rapide"
                    min={GUESTS.min}
                    max={GUESTS.max}
                    step={GUESTS.step}
                    value={Math.min(GUESTS.max, Math.max(GUESTS.min, details.guests || GUESTS.min))}
                    style={{
                      ["--fill" as string]: `${((Math.min(GUESTS.max, Math.max(GUESTS.min, details.guests)) - GUESTS.min) / (GUESTS.max - GUESTS.min)) * 100}%`,
                    }}
                    onChange={(e) => setDetails({ guests: Number(e.target.value) })}
                  />
                  <NumberInput
                    id="devis-invites"
                    label="Nombre exact"
                    min={1}
                    max={10000}
                    value={details.guests || null}
                    error={errors.guests}
                    hint="Au-delà de 1 000 invités, saisissez le nombre exact."
                    onChange={(guests) => setDetails({ guests: guests ?? 0 })}
                  />
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <p className={s.stepLede}>
                  Sélectionnez les expertises qui vous intéressent. Vous pouvez aussi les ajouter depuis la section
                  Services du site.
                </p>
                <div className={s.services}>
                  {options("services").map((service) => {
                    const on = basket.services.includes(service.id);
                    return (
                      <label key={service.id} className={cx(s.service, on && s.serviceOn)}>
                        <input type="checkbox" checked={on} onChange={() => toggleService(service.id)} />
                        <span className={s.serviceImage}>
                          <img src={service.image || "/eventheme.jpg"} alt="" loading="lazy" />
                        </span>
                        <span className={s.serviceText}>
                          <strong>{service.title}</strong>
                          <small>{serviceItems(service).slice(0, 4).join(" · ")}</small>
                          <em>{priceLabel(service)}</em>
                        </span>
                        <span className={s.tick} aria-hidden="true">
                          {on ? "✓" : "+"}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <p className={s.stepLede}>
                  Composez votre sélection de matériel. Les quantités restent modifiables jusqu’à l’envoi.
                </p>
                <div className={s.products}>
                  {options("products")
                    .filter((p) => p.available !== false)
                    .map((product) => {
                      const variant = variants[product.id] ?? product.variants?.[0]?.name ?? "";
                      const count = quantity(product.id, variant);
                      return (
                        <article key={product.id} className={cx(s.product, count > 0 && s.productOn)}>
                          <div className={s.productImage}>
                            <img src={product.image || "/eventheme.jpg"} alt="" loading="lazy" />
                            {product.demo && <span>Exemple</span>}
                          </div>
                          <div className={s.productBody}>
                            <small>{product.category}</small>
                            <strong>{product.title}</strong>
                            <em>
                              {priceLabel({
                                ...product,
                                price: product.variants?.find((v) => v.name === variant)?.price ?? product.price,
                              })}
                            </em>
                            {!!product.variants?.length && (
                              <div className={s.variants} role="group" aria-label={`Finition — ${product.title}`}>
                                {product.variants.map((v) => (
                                  <button
                                    key={v.name}
                                    type="button"
                                    aria-pressed={variant === v.name}
                                    onClick={() => setVariants((all) => ({ ...all, [product.id]: v.name }))}
                                  >
                                    {v.name}
                                  </button>
                                ))}
                              </div>
                            )}
                            <Stepper
                              label={`${product.title}${variant ? ` ${variant}` : ""}`}
                              value={count}
                              onChange={(value) => setQuantity(product.id, variant, value)}
                            />
                          </div>
                        </article>
                      );
                    })}
                </div>
                {basket.products.length > 0 && (
                  <div className={s.selection}>
                    <h4>Votre sélection · {articles} article(s)</h4>
                    <ul>
                      {basket.products.map((item) => (
                        <li key={`${item.id}-${item.variant}`}>
                          <span>
                            {label(item.id)}
                            {item.variant && <small> · {item.variant}</small>}
                          </span>
                          <Stepper
                            label={`${label(item.id)} ${item.variant}`}
                            value={item.quantity}
                            onChange={(value) => setQuantity(item.id, item.variant, value)}
                          />
                          <button
                            type="button"
                            className={s.remove}
                            aria-label={`Retirer ${label(item.id)}`}
                            onClick={() => setQuantity(item.id, item.variant, 0)}
                          >
                            <CloseIcon />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {basket.products.length > 0 && (
                  <NumberInput
                    label="Nombre de jours de location"
                    name="rentalDays"
                    min={1}
                    max={MAX_RENTAL_DAYS}
                    decimals={0}
                    suffix="jour(s)"
                    value={details.rentalDays}
                    error={errors.rentalDays}
                    hint="Le matériel est tarifé à la journée. Indiquez plus d’un jour pour une location prolongée."
                    onChange={(rentalDays) => setDetails({ rentalDays: rentalDays ?? 1 })}
                  />
                )}
                <Button href="/location" variant="link" icon={<ArrowUpRightIcon />}>
                  Explorer le catalogue complet
                </Button>
              </>
            )}

            {step === 3 && (
              <>
                <dl className={s.recap}>
                  {recap.map(([term, value, target]) => (
                    <div key={term}>
                      <dt>{term}</dt>
                      <dd>{value}</dd>
                      {target != null && (
                        <button type="button" onClick={() => goTo(target)}>
                          Modifier<span className="visually-hidden"> : {term}</span>
                        </button>
                      )}
                    </div>
                  ))}
                </dl>
                <Textarea
                  label="Informations complémentaires (facultatif)"
                  rows={4}
                  maxLength={5000}
                  placeholder="Déroulé souhaité, contraintes du lieu, prestations particulières…"
                  value={details.message}
                  onChange={(e) => setDetails({ message: e.target.value })}
                />
              </>
            )}
          </div>

          {error && (
            <p className={s.error} role="alert">
              {error}
            </p>
          )}
          <div className={s.stepActions}>
            {step > 0 && (
              <Button variant="link" onClick={() => goTo(step - 1)}>
                ← Précédent
              </Button>
            )}
            <Button type="submit" icon={<ArrowUpRightIcon />} loading={busy} magnetic={step === STEPS.length - 1}>
              {busy ? "Envoi…" : step === STEPS.length - 1 ? "Recevoir mon devis" : "Continuer"}
            </Button>
          </div>
          {step === STEPS.length - 1 && (
            <p className={s.caption}>
              Sans engagement et sans paiement en ligne. Disponibilités et tarifs confirmés par notre équipe.
            </p>
          )}
          {local && <p className={s.demo}>Aperçu local : les demandes sont enregistrées sur cet ordinateur.</p>}
        </form>
      </div>

      <aside className={s.live} aria-label="Estimation en direct">
        <span className={s.liveKicker}>Estimation en direct</span>
        <h3>{details.event ? label(details.event) : "Votre événement"}</h3>
        <p className={s.liveMeta}>
          {[eventDate && formatLongDate(eventDate), details.city, details.guests && `${details.guests} invités`]
            .filter(Boolean)
            .join(" · ") || "Date, lieu et invités à préciser"}
        </p>
        <div className={s.total}>
          <small>{calculation.hasUnpriced && calculation.total > 0 ? "Postes déjà chiffrés" : "Montant indicatif"}</small>
          <span ref={total} className={s.totalValue} aria-hidden="true" />
          <span className="visually-hidden" aria-live="polite">
            {calculation.total > 0 ? money(calculation.total) : "Sur devis"}
          </span>
        </div>
        <ul className={s.lines}>
          {calculation.lines.map((line, index) => (
            <li key={`${line.kind}-${line.label}-${index}`}>
              <span>
                {lineLabel(line)}
                {line.quantity > 1 && <small> × {line.quantity}</small>}
              </span>
              <b>{lineAmount(line)}</b>
            </li>
          ))}
          {!calculation.lines.length && <li className={s.linesEmpty}>Vos choix apparaîtront ici.</li>}
        </ul>
        <p className={s.liveNote}>
          {calculation.hasUnpriced
            ? "Certaines prestations sont chiffrées sur devis : notre équipe vous communiquera le montant définitif."
            : "Estimation indicative, non contractuelle, à confirmer par notre équipe."}
        </p>
        <p className={s.liveCount}>
          {basket.services.length} service(s) · {articles} article(s)
        </p>
      </aside>

      <div className={s.mobileBar} aria-hidden="true">
        <span>
          Étape {step + 1}/{STEPS.length}
        </span>
        <b>{calculation.total > 0 ? money(calculation.total) : "Sur devis"}</b>
      </div>
    </div>
  );
}

/** Quantité réglable : −, valeur saisissable, +. */
function Stepper({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <div className={s.stepper} role="group" aria-label={`Quantité — ${label}`}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= 0} aria-label="Retirer un">
        −
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        max={1000}
        value={value}
        aria-label={`Quantité — ${label}`}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= 1000} aria-label="Ajouter un">
        +
      </button>
    </div>
  );
}
