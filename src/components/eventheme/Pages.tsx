"use client";
import Link from "next/link";
import { useState } from "react";
import { useEventheme } from "./Provider";
import { CTA } from "./Shell";
import Button from "@/components/ui/Button";
import {
  Checkbox,
  NumberInput,
  SearchInput,
  Select,
} from "@/components/ui/form";
import { CheckIcon } from "@/components/ui/icons";
import { methodSteps } from "@/data/eventheme";
import {
  centimetres,
  findSocial,
  priceLabel,
  type Entry,
} from "@/lib/eventheme/types";
import s from "./Eventheme.module.css";
export function PageIntro({ id, eyebrow }: { id: string; eyebrow: string }) {
  const { entries } = useEventheme();
  const entry = entries.find((e) => e.id === id);
  return (
    <section className={s.pageIntro}>
      <span className={s.eyebrow}>{eyebrow}</span>
      <h1>{entry?.title}</h1>
      <p>{entry?.description}</p>
    </section>
  );
}
export function Catalog({ projects = false }: { projects?: boolean }) {
  const { entries, add } = useEventheme();
  const [category, setCategory] = useState("Tous");
  const [search, setSearch] = useState("");
  const [color, setColor] = useState("Toutes");
  const [available, setAvailable] = useState(false);
  const [max, setMax] = useState<number | null>(null);
  const items = entries.filter(
    (e) => e.kind === (projects ? "projects" : "products"),
  );
  const filtered = items.filter(
    (e) =>
      (category === "Tous" || e.category === category) &&
      (!search ||
        `${e.title} ${e.description}`
          .toLowerCase()
          .includes(search.toLowerCase())) &&
      (color === "Toutes" || e.color === color) &&
      (!available || e.available === true) &&
      (max === null || (e.price != null && e.price <= max)),
  );
  return (
    <>
      <PageIntro
        id={projects ? "projects-page" : "location-page"}
        eyebrow={projects ? "LE REGARD EVENTHEME" : "LE CATALOGUE ÉVÉNEMENTIEL"}
      />
      <section className={s.section}>
        <div className={s.filters}>
          {[
            "Tous",
            ...new Set(items.map((e) => e.category).filter(Boolean)),
          ].map((c) => (
            <Button
              key={c}
              variant="ghost"
              size="sm"
              aria-pressed={category === c}
              onClick={() => setCategory(c!)}
            >
              {c}
            </Button>
          ))}
        </div>
        <div className={s.catalogTools}>
          <SearchInput
            label="Rechercher dans le catalogue"
            className={s.toolSearch}
            placeholder={
              projects
                ? "Rechercher un projet…"
                : "Rechercher un matériel…"
            }
            value={search}
            onChange={setSearch}
          />
          {!projects && (
            <>
              <Select
                label="Filtrer par couleur"
                hideLabel
                className={s.toolField}
                options={[
                  { value: "Toutes", label: "Toutes les couleurs" },
                  ...[
                    ...new Set(items.map((e) => e.color).filter(Boolean)),
                  ].map((c) => ({ value: c!, label: c! })),
                ]}
                value={color}
                onChange={setColor}
              />
              <NumberInput
                label="Prix maximum"
                hideLabel
                className={s.toolField}
                min={0}
                step={100}
                controls={false}
                placeholder="Prix max."
                suffix="MAD"
                value={max}
                onChange={setMax}
              />
              <Checkbox
                className={s.check}
                checked={available}
                onChange={setAvailable}
              >
                Disponible
              </Checkbox>
            </>
          )}
        </div>
        <p className={s.caption}>
          {filtered.length} {projects ? "projet(s)" : "article(s)"} · Les
          contenus marqués « exemple » ou « inspiration » sont à remplacer par
          le catalogue et les réalisations Eventheme.
        </p>
        <div className={s.catalogGrid}>
          {filtered.map((item) => (
            <article key={item.id} className={s.productCard}>
              <Link
                href={`/${projects ? "realisations" : "location"}/${item.id}`}
                className={s.productImage}
              >
                <img
                  src={item.image || "/eventheme.jpg"}
                  alt={item.title}
                  loading="lazy"
                />
                {item.demo && (
                  <span className={s.imageTag}>
                    {projects ? "INSPIRATION" : "EXEMPLE DE CATALOGUE"}
                  </span>
                )}
              </Link>
              <div className={s.productBody}>
                <span className={s.eyebrow}>{item.category}</span>
                <Link
                  href={`/${projects ? "realisations" : "location"}/${item.id}`}
                >
                  <h3>{item.title}</h3>
                </Link>
                <p>{item.description}</p>
                <div className={s.productActions}>
                  {!projects && (
                    <>
                      <span>{priceLabel(item)}</span>
                      <Button
                        variant="link"
                        size="sm"
                        icon="+"
                        disabled={item.available === false}
                        onClick={() => add(item)}
                      >
                        {item.available === false
                          ? "Indisponible"
                          : "Ajouter au devis"}
                      </Button>
                    </>
                  )}
                  {projects && (
                    <Button
                      href={`/realisations/${item.id}`}
                      variant="link"
                      size="sm"
                      icon="↗"
                    >
                      Découvrir
                    </Button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
        {!filtered.length && (
          <div className={s.empty}>
            Aucun résultat pour ces critères.
            <Button
              variant="link"
              icon="→"
              onClick={() => {
                setCategory("Tous");
                setColor("Toutes");
                setSearch("");
                setMax(null);
                setAvailable(false);
              }}
            >
              Réinitialiser les filtres
            </Button>
          </div>
        )}
      </section>
      <CTA />
    </>
  );
}
export function Services() {
  const { entries, add, basket, setBasket } = useEventheme();
  return (
    <>
      <PageIntro id="services-page" eyebrow="NOS EXPERTISES" />
      <section className={s.section}>
        {entries
          .filter((e) => e.kind === "services")
          .map((e, i) => {
            const chosen = basket.services.includes(e.id);
            return (
              <article className={s.serviceRow} key={e.id}>
                <img
                  src={e.image || "/eventheme.jpg"}
                  alt={e.title}
                  loading="lazy"
                />
                <div>
                  <span className={s.eyebrow}>
                    0{i + 1} — {e.category}
                  </span>
                  <h2>{e.title}</h2>
                  <p>{e.description}</p>
                  <span className={s.price}>{priceLabel(e)}</span>
                  <Button
                    variant={chosen ? "outline" : "fill"}
                    icon={chosen ? <CheckIcon /> : "+"}
                    aria-pressed={chosen}
                    className={s.addButton}
                    onClick={() =>
                      chosen
                        ? setBasket({
                            ...basket,
                            services: basket.services.filter(
                              (id) => id !== e.id,
                            ),
                          })
                        : add(e)
                    }
                  >
                    {chosen ? "Dans mon devis" : "Ajouter à mon devis"}
                  </Button>
                </div>
              </article>
            );
          })}
      </section>
      <CTA />
    </>
  );
}
export function Events() {
  const { entries } = useEventheme();
  return (
    <>
      <PageIntro id="events-page" eyebrow="VOS ÉVÉNEMENTS" />
      <section className={`${s.section} ${s.catalogGrid}`}>
        {entries
          .filter((e) => e.kind === "events")
          .map((e) => (
            <article className={s.productCard} key={e.id}>
              <div className={s.productImage}>
                <img
                  src={e.image || "/eventheme.jpg"}
                  alt={`Ambiance ${e.title} — illustration`}
                  loading="lazy"
                />
              </div>
              <div className={s.productBody}>
                <h3>{e.title}</h3>
                <p>{e.description}</p>
                <p className={s.caption}>
                  Organisation · Animation · Décoration · Location
                </p>
                <Button
                  href={`/devis?event=${e.id}`}
                  variant="link"
                  icon="↗"
                >
                  Imaginer cet événement
                </Button>
              </div>
            </article>
          ))}
      </section>
      <CTA />
    </>
  );
}
export function About() {
  const { entries } = useEventheme();
  const about = entries.find((e) => e.id === "about");
  const values = entries.find((e) => e.id === "values");
  return (
    <>
      <PageIntro id="about" eyebrow="L’ESPRIT EVENTHEME" />
      <section className={`${s.section} ${s.aboutSplit}`}>
        <img
          src={about?.image || "/eventheme.jpg"}
          alt="Univers floral — photographie d’illustration"
        />
        <div>
          <span className={s.eyebrow}>UNE ATTENTION À CHAQUE INSTANT</span>
          <h2>{values?.title}</h2>
          <p>{values?.description}</p>
        </div>
      </section>
      <section className={s.section}>
        <span className={s.eyebrow}>NOTRE MÉTHODE</span>
        <h2>Ensemble, à chaque étape.</h2>
        <div className={s.process}>
          {methodSteps.map(([title], i) => (
            <div key={title}>
              <span>0{i + 1}</span>
              <h3>{title}</h3>
            </div>
          ))}
        </div>
      </section>
      <CTA />
    </>
  );
}
export function Detail({ entry }: { entry: Entry }) {
  const { add, entries } = useEventheme();
  const [variant, setVariant] = useState(entry.variants?.[0]?.name || "");
  const [zoom, setZoom] = useState(false);
  const [image, setImage] = useState(entry.image);
  const product = entry.kind === "products";
  const selectedVariant = entry.variants?.find((v) => v.name === variant);
  const length = selectedVariant?.length ?? entry.length;
  const width = selectedVariant?.width ?? entry.width;
  const whatsapp = findSocial(entries, "whatsapp");
  return (
    <section className={s.section}>
      <Button variant="link" href={product ? "/location" : "/realisations"}>
        ← Retour {product ? "au catalogue" : "aux réalisations"}
      </Button>
      <div className={s.detail}>
        <div>
          <button
            className={s.detailImage}
            onClick={() => setZoom(true)}
            aria-label="Agrandir la photographie"
          >
            <img src={image || "/eventheme.jpg"} alt={entry.title} />
          </button>
          <div className={s.thumbnails}>
            {[entry.image, ...(entry.gallery || [])]
              .filter(Boolean)
              .map((url) => (
                <button
                  key={url}
                  onClick={() => setImage(url)}
                  aria-label="Afficher cette photographie"
                >
                  <img src={url} alt={entry.title} />
                </button>
              ))}
          </div>
        </div>
        <div>
          <span className={s.eyebrow}>
            {entry.category} {entry.demo && "· ILLUSTRATION"}
          </span>
          <h1>{entry.title}</h1>
          <p>{entry.description}</p>
          {entry.location && <p>Lieu : {entry.location}</p>}
          {entry.date && <p>Date : {entry.date}</p>}
          {entry.specifications && <p>{entry.specifications}</p>}
          {length != null && <p>Longueur : {centimetres(length)}</p>}
          {width != null && <p>Largeur : {centimetres(width)}</p>}
          {entry.color && (
            <p className={s.colorLine}>
              {entry.swatch && (
                <span
                  className={s.swatchDot}
                  style={{ backgroundColor: entry.swatch }}
                  aria-hidden="true"
                />
              )}
              Couleur : {entry.color}
            </p>
          )}
          {product && (
            <span className={s.price}>
              {priceLabel({
                ...entry,
                price: selectedVariant ? selectedVariant.price : entry.price,
              })}
            </span>
          )}
          <div className={s.detailActions}>
            {product && !!entry.variants?.length && (
              <Select
                label="Variante"
                className={s.variantField}
                options={entry.variants.map((v) => ({
                  value: v.name,
                  label: v.name,
                }))}
                value={variant}
                onChange={setVariant}
              />
            )}
            {product && (
              <Button
                icon="+"
                disabled={entry.available === false}
                onClick={() => add(entry, variant)}
              >
                {entry.available === false
                  ? "Indisponible"
                  : "Ajouter à mon devis"}
              </Button>
            )}
            {!product && (
              <Button href="/devis" icon="↗">
                Imaginer mon événement
              </Button>
            )}
            {whatsapp?.url && (
              <Button
                variant="link"
                href={whatsapp.url}
                target="_blank"
                rel="noreferrer"
                icon="↗"
              >
                En parler sur WhatsApp
              </Button>
            )}
            {entry.video && (
              <Button
                variant="link"
                href={entry.video}
                target="_blank"
                rel="noreferrer"
                icon="↗"
              >
                Voir la vidéo
              </Button>
            )}
          </div>
        </div>
      </div>
      {zoom && (
        <div
          className={s.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label={entry.title}
          onClick={() => setZoom(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setZoom(false);
          }}
        >
          <button
            autoFocus
            onClick={() => setZoom(false)}
            aria-label="Fermer la photographie"
          >
            ×
          </button>
          <img src={image || "/eventheme.jpg"} alt={entry.title} />
        </div>
      )}
    </section>
  );
}
export function Legal({ privacy = false }: { privacy?: boolean }) {
  const { entries } = useEventheme();
  const content = entries.find((e) => e.id === (privacy ? "privacy" : "legal"));
  return (
    <section className={`${s.section} ${s.legal}`}>
      <span className={s.eyebrow}>EVENTHEME</span>
      <h1>{privacy ? "Politique de confidentialité" : "Mentions légales"}</h1>
      {content ? (
        <p>{content.description}</p>
      ) : (
        <>
          <p>
            Page en préparation. Les informations légales et la politique de
            confidentialité doivent être complétées et validées par Eventheme
            avant la mise en ligne.
          </p>
          <p>
            La version locale sert uniquement à la démonstration. Utilisez des
            coordonnées fictives pour tester les formulaires.
          </p>
        </>
      )}
    </section>
  );
}
