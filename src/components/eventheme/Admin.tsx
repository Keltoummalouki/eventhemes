"use client";
import Link from "next/link";
import {
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";
import { useRouter } from "next/navigation";
import { cx } from "@/lib/cx";
import {
  kinds,
  labels,
  statuses,
  money,
  daysLabel,
  hoursLabel,
  priceLabel,
  followersLabel,
  socialNetworkOf,
  type Entry,
  type Inquiry,
  type Kind,
  type Variant,
} from "@/lib/eventheme/types";
import { adminLogin } from "@/lib/eventheme/auth";
import { Logo } from "./Shell";
import Button from "@/components/ui/Button";
import { confirmDialog } from "@/components/ui/dialog";
import { CloseIcon, SocialIcon } from "@/components/ui/icons";
import { socialNetworks, type SocialNetwork } from "@/data/socials";
import {
  Checkbox,
  ColorInput,
  FileInput,
  Input,
  NumberInput,
  SearchInput,
  Select,
  Textarea,
  YearPicker,
} from "@/components/ui/form";
import s from "./Eventheme.module.css";
const sitePages = [
  { id: "home", label: "Accueil" },
  { id: "about", label: "À propos" },
  { id: "values", label: "Nos valeurs" },
  { id: "contact", label: "Contact" },
  { id: "events-page", label: "Page Événements" },
  { id: "services-page", label: "Page Services" },
  { id: "location-page", label: "Page Location" },
  { id: "projects-page", label: "Page Réalisations" },
  { id: "legal", label: "Mentions légales" },
  { id: "privacy", label: "Politique de confidentialité" },
];
type FormField =
  | "title"
  | "eventType"
  | "subtitle"
  | "description"
  | "image"
  | "gallery"
  | "price"
  | "product"
  | "variants"
  | "project"
  | "demo";
/** Each form shows only the fields the public site actually reads for that kind. */
const formFields: Record<Kind, readonly FormField[]> = {
  services: ["title", "eventType", "description", "image", "price"],
  products: [
    "title",
    "eventType",
    "description",
    "image",
    "gallery",
    "price",
    "product",
    "variants",
    "demo",
  ],
  events: ["title", "description", "image", "price"],
  projects: [
    "title",
    "eventType",
    "description",
    "image",
    "gallery",
    "project",
    "demo",
  ],
  pages: ["title", "eventType", "subtitle", "description", "image", "gallery"],
  // Social links have their own form: network, link, account name, followers.
  socials: [],
};
async function api(body: object, path = "/api/admin") {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
}
async function uploadPhoto(file: File): Promise<string> {
  const data = new FormData();
  data.set("file", file);
  const response = await fetch("/api/admin/media", {
    method: "POST",
    body: data,
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error);
  return result.url;
}
const galleryLimit = 30;
export function AdminLogin({
  configured,
  next,
}: {
  configured: boolean;
  next: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(e.currentTarget);
    try {
      await api(
        { email: data.get("email"), password: data.get("password") },
        "/api/auth",
      );
      router.replace(next);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className={s.login}>
      <Link href="/">
        <Logo />
      </Link>
      <span className={s.eyebrow}>ESPACE ADMINISTRATEUR</span>
      <h1>Bienvenue chez vous.</h1>
      <p>
        {configured
          ? "Connectez-vous avec votre compte administrateur pour gérer votre site et vos demandes."
          : "La connexion administrateur n’est pas encore configurée."}
      </p>
      {configured && (
        <form onSubmit={login} className={s.loginForm}>
          <Input
            label="E-mail"
            name="email"
            type="email"
            autoComplete="username"
            required
          />
          <Input
            label="Mot de passe"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
          {error && (
            <p role="alert" className={s.error}>
              {error}
            </p>
          )}
          <Button type="submit" block loading={busy} icon="↗">
            {busy ? "Connexion…" : "Se connecter"}
          </Button>
        </form>
      )}
      <Button href="/" variant="link" className={s.loginBack}>
        ← Retour au site
      </Button>
    </div>
  );
}
export default function Admin({
  initialEntries,
  initialInquiries,
  local,
}: {
  initialEntries: Entry[];
  initialInquiries: Inquiry[];
  local: boolean;
}) {
  const router = useRouter();
  const [entries, setEntries] = useState(initialEntries);
  const [inquiries, setInquiries] = useState(initialInquiries);
  const [tab, setTab] = useState<
    Kind | "dashboard" | "quotes" | "messages" | "clients"
  >("dashboard");
  const [edit, setEdit] = useState<Entry | null>(null);
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  async function mutate(body: object, onSuccess?: () => void) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await api(body);
      const response = await fetch("/api/admin", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setEntries(data.entries);
      setInquiries(data.inquiries);
      setNotice("Modifications enregistrées.");
      onSuccess?.();
      router.refresh();
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const quotes = inquiries.filter((i) => i.kind === "quote");
  const messages = inquiries.filter((i) => i.kind === "contact");
  const title = kinds.includes(tab as Kind)
    ? labels[tab as Kind]
    : {
        dashboard: "Vue d’ensemble",
        quotes: "Demandes de devis",
        messages: "Messages de contact",
        clients: "Clients & contacts",
      }[tab as "dashboard"];
  function navigate(next: typeof tab) {
    setTab(next);
    setEdit(null);
    setInquiry(null);
    setSearch("");
    setError("");
    setNotice("");
  }
  function exportCsv() {
    const rows = [
      [
        "Référence",
        "Type",
        "Nom",
        "Entreprise",
        "E-mail",
        "Téléphone",
        "Ville",
        "Adresse",
        "Date événement",
        "Statut",
        "Message",
      ],
      ...inquiries.map((i) => [
        i.id,
        i.kind,
        i.name,
        i.company,
        i.email,
        i.phone,
        i.city,
        i.address ?? "",
        i.date,
        i.status,
        i.message,
      ]),
    ];
    const csv =
      "\uFEFF" +
      rows
        .map((row) =>
          row
            .map(
              (value) =>
                `"${(/^[=+@\-\t\r]/.test(value) ? "'" + value : value).replaceAll('"', '""')}"`,
            )
            .join(";"),
        )
        .join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "eventheme-demandes.csv";
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div className={s.admin}>
      <aside className={s.sidebar}>
        <Link href="/">
          <Logo />
        </Link>
        <span className={s.eyebrow}>ADMINISTRATION</span>
        <nav aria-label="Administration">
          <button
            className={tab === "dashboard" ? s.sideActive : ""}
            onClick={() => navigate("dashboard")}
          >
            ◈ Vue d’ensemble
          </button>
          <span>RELATION CLIENT</span>
          <button
            className={tab === "quotes" ? s.sideActive : ""}
            onClick={() => navigate("quotes")}
          >
            Demandes de devis <b>{quotes.length}</b>
          </button>
          <button
            className={tab === "messages" ? s.sideActive : ""}
            onClick={() => navigate("messages")}
          >
            Messages <b>{messages.length}</b>
          </button>
          <button
            className={tab === "clients" ? s.sideActive : ""}
            onClick={() => navigate("clients")}
          >
            Clients & contacts
          </button>
          <span>VOTRE SITE</span>
          {kinds.map((kind) => (
            <button
              key={kind}
              className={tab === kind ? s.sideActive : ""}
              onClick={() => navigate(kind)}
            >
              {labels[kind]}
            </button>
          ))}
        </nav>
        <Button
          href="/"
          target="_blank"
          variant="link"
          size="sm"
          icon="↗"
          className={s.sidebarLink}
        >
          Voir le site
        </Button>
        <Button
          variant="link"
          size="sm"
          className={s.sidebarLink}
          onClick={async () => {
            await api({ action: "logout" }, "/api/auth");
            router.replace(adminLogin);
          }}
        >
          Se déconnecter
        </Button>
      </aside>
      <main className={s.adminMain}>
        <header className={s.adminHeader}>
          <div>
            <span className={s.eyebrow}>EVENTHEME / {title}</span>
            <h1>{title}</h1>
          </div>
          <span className={s.modeBadge}>
            {local ? "● Aperçu local" : "● Administration"}
          </span>
        </header>
        {local && (
          <p className={s.adminBanner}>
            Les changements sont conservés sur cet ordinateur. Les formulaires
            alimentent cette boîte de réception. Aucun e-mail n’est envoyé en
            mode local.
          </p>
        )}
        {error && (
          <p className={s.error} role="alert">
            {error}
          </p>
        )}
        {notice && (
          <p className={s.saved} role="status">
            ✓ {notice}
          </p>
        )}
        {tab === "dashboard" && (
          <>
            <div className={s.metricGrid}>
              {[
                ["Demandes de devis", quotes.length],
                ["Messages reçus", messages.length],
                [
                  "À traiter",
                  inquiries.filter((i) => i.status === "Nouvelle demande")
                    .length,
                ],
                [
                  "Articles au catalogue",
                  entries.filter((e) => e.kind === "products").length,
                ],
              ].map(([label, number]) => (
                <div key={label}>
                  <span>{label}</span>
                  <strong>{number}</strong>
                </div>
              ))}
            </div>
            <div className={s.adminPanel}>
              <h2>Les dernières demandes</h2>
              <RequestTable
                inquiries={inquiries.slice(0, 5)}
                select={setInquiry}
              />
              <Button
                variant="link"
                icon="→"
                onClick={() => navigate("quotes")}
              >
                Toutes les demandes
              </Button>
            </div>
            <div className={s.adminPanel}>
              <h2>Votre site, à votre rythme.</h2>
              <p>
                Ajoutez vos réalisations, personnalisez les textes et renseignez
                vos tarifs. Un prix vide signifie « sur devis ». Les tarifs
                invités sont calculés par personne ; les lieux, types
                d’événement et niveaux de prestation sont des montants fixes
                additionnels.
              </p>
              <div className={s.actions}>
                <Button icon="↗" onClick={() => navigate("projects")}>
                  Gérer les réalisations
                </Button>
                <Button
                  variant="link"
                  icon="→"
                  onClick={() => navigate("pages")}
                >
                  Modifier les pages
                </Button>
              </div>
            </div>
          </>
        )}
        {["quotes", "messages", "clients"].includes(tab) && (
          <div className={s.adminPanel}>
            <div className={s.adminToolbar}>
              <SearchInput
                label="Rechercher les demandes"
                className={s.toolbarSearch}
                placeholder="Rechercher un nom, un e-mail, un statut…"
                value={search}
                onChange={setSearch}
              />
              <Button
                variant="outline"
                size="sm"
                icon="↓"
                className={s.toolbarAction}
                onClick={exportCsv}
              >
                Exporter les contacts CSV
              </Button>
            </div>
            <RequestTable
              inquiries={(tab === "quotes"
                ? quotes
                : tab === "messages"
                  ? messages
                  : inquiries
              ).filter((i) =>
                `${i.name} ${i.email} ${i.status}`
                  .toLowerCase()
                  .includes(search.toLowerCase()),
              )}
              select={setInquiry}
            />
          </div>
        )}
        {kinds.includes(tab as Kind) && !edit && (
          <div className={s.adminPanel}>
            <div className={s.adminToolbar}>
              <SearchInput
                label="Rechercher le contenu"
                className={s.toolbarSearch}
                placeholder="Rechercher…"
                value={search}
                onChange={setSearch}
              />
              <Button
                icon="+"
                className={s.toolbarAction}
                onClick={() =>
                  setEdit({
                    id: crypto.randomUUID(),
                    kind: tab as Kind,
                    title: "",
                    description: "",
                    published: true,
                    price: null,
                    pricing: "request",
                    variants: [],
                  })
                }
              >
                Ajouter
              </Button>
            </div>
            {tab === "pages" && (
              <p className={s.caption}>
                Chaque contenu correspond à une page, choisie dans la liste
                « Page ». Ajoutez « Mentions légales » ou « Politique de
                confidentialité » pour publier vos textes légaux validés.
              </p>
            )}
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th>Contenu</th>
                    <th>{tab === "socials" ? "Lien" : "Catégorie / tarif"}</th>
                    <th>Publication</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entries
                    .filter(
                      (e) =>
                        e.kind === tab &&
                        `${e.title} ${e.category}`
                          .toLowerCase()
                          .includes(search.toLowerCase()),
                    )
                    .map((entry) => (
                      <tr key={entry.id}>
                        <td>
                          <strong>{entry.title}</strong>
                          <small>{entry.id}</small>
                        </td>
                        {entry.kind === "socials" ? (
                          <td>
                            {entry.url || "—"}
                            {entry.followers != null && (
                              <small>{followersLabel(entry.followers)}</small>
                            )}
                          </td>
                        ) : (
                          <td>
                            {entry.category || "—"}
                            <small>{priceLabel(entry)}</small>
                          </td>
                        )}
                        <td>
                          <span className={s.status}>
                            {entry.published ? "Publié" : "Brouillon"}
                          </span>
                        </td>
                        <td className={s.tableActions}>
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => setEdit(structuredClone(entry))}
                          >
                            Modifier
                          </Button>
                          <Button
                            variant="link"
                            size="sm"
                            danger
                            disabled={busy}
                            onClick={async () => {
                              const confirmed = await confirmDialog({
                                title: `Supprimer « ${entry.title} » ?`,
                                text: "Cette action retire le contenu du site.",
                                confirmText: "Supprimer",
                                danger: true,
                              });
                              if (confirmed)
                                void mutate({ action: "delete", id: entry.id });
                            }}
                          >
                            Supprimer
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            {!entries.some((e) => e.kind === tab) && (
              <p className={s.empty}>
                Aucun contenu. Ajoutez votre premier élément.
              </p>
            )}
          </div>
        )}
        {edit && (
          <EntryEditor
            entry={edit}
            setEntry={setEdit}
            eventTypes={entries
              .filter((e) => e.kind === "events")
              .map((e) => e.title)}
            siblings={entries.filter(
              (e) => e.kind === edit.kind && e.id !== edit.id,
            )}
            isNew={!entries.some((e) => e.id === edit.id)}
            busy={busy}
            save={() =>
              mutate({ action: "save", value: edit }, () => setEdit(null))
            }
            close={() => setEdit(null)}
          />
        )}
        {inquiry && (
          <div className={s.adminPanel}>
            <div className={s.sectionHeading}>
              <div>
                <span className={s.eyebrow}>
                  DEMANDE {inquiry.id.slice(0, 8).toUpperCase()}
                </span>
                <h2>{inquiry.name}</h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                icon={<CloseIcon />}
                onClick={() => setInquiry(null)}
              >
                Fermer
              </Button>
            </div>
            <div className={s.formGrid}>
              <div>
                <h3>Coordonnées</h3>
                <p>
                  {inquiry.company && (
                    <>
                      {inquiry.company}
                      <br />
                    </>
                  )}
                  <a href={`mailto:${inquiry.email}`}>{inquiry.email}</a>
                  <br />
                  <a href={`tel:${inquiry.phone}`}>{inquiry.phone}</a>
                  <br />
                  {inquiry.city}
                  {inquiry.address && (
                    <>
                      <br />
                      {inquiry.address}
                    </>
                  )}
                  <br />
                  Contact préféré : {inquiry.contactMethod}
                </p>
                <p>
                  Reçue le {new Date(inquiry.createdAt).toLocaleString("fr-FR")}
                </p>
              </div>
              <div>
                <h3>Événement</h3>
                <p>
                  {inquiry.date}
                  {inquiry.duration > 0 && ` · ${hoursLabel(inquiry.duration)}`}
                  <br />
                  {inquiry.guests} invités
                  {inquiry.basket.products.length > 0 && (
                    <>
                      <br />
                      Location du matériel : {daysLabel(inquiry.rentalDays || 1)}
                    </>
                  )}
                </p>
              </div>
            </div>
            <h3>Prestations et matériel</h3>
            <ul className={s.requestSummary}>
              {inquiry.summary.map((line, index) => (
                <li key={index}>{line}</li>
              ))}
            </ul>
            <p>
              Montant indicatif : {money(inquiry.estimate)}{" "}
              {inquiry.hasUnpriced && "(des postes restent à chiffrer)"}
            </p>
            <h3>{inquiry.subject || "Message"}</h3>
            <p className={s.preserve}>
              {inquiry.message || "Aucun message complémentaire."}
            </p>
            <div className={s.formGrid}>
              <Select
                label="Statut"
                options={statuses.map((status) => ({
                  value: status,
                  label: status,
                }))}
                value={inquiry.status}
                onChange={(status) => setInquiry({ ...inquiry, status })}
              />
              <Textarea
                label="Notes internes"
                rows={4}
                value={inquiry.notes}
                onChange={(e) =>
                  setInquiry({ ...inquiry, notes: e.target.value })
                }
              />
            </div>
            <div className={s.actions}>
              <Button
                loading={busy}
                onClick={() =>
                  mutate({
                    action: "inquiry",
                    id: inquiry.id,
                    status: inquiry.status,
                    notes: inquiry.notes,
                  })
                }
              >
                Enregistrer le suivi
              </Button>
              <Button
                variant="link"
                danger
                disabled={busy}
                onClick={async () => {
                  const confirmed = await confirmDialog({
                    title: "Supprimer la demande ?",
                    text: `La demande de ${inquiry.name} et ses coordonnées seront supprimées définitivement.`,
                    confirmText: "Supprimer",
                    danger: true,
                  });
                  if (confirmed)
                    void mutate(
                      { action: "deleteInquiry", id: inquiry.id },
                      () => setInquiry(null),
                    );
                }}
              >
                Supprimer la demande
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
function RequestTable({
  inquiries,
  select,
}: {
  inquiries: Inquiry[];
  select: (value: Inquiry) => void;
}) {
  return inquiries.length ? (
    <div className={s.tableWrap}>
      <table className={s.table}>
        <thead>
          <tr>
            <th>Client</th>
            <th>Demande</th>
            <th>Statut</th>
            <th>Reçue le</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {inquiries.map((i) => (
            <tr key={i.id}>
              <td>
                <strong>{i.name}</strong>
                <small>{i.email}</small>
              </td>
              <td>
                {i.kind === "quote" ? "Devis" : "Contact"}
                <small>{i.city || i.subject}</small>
              </td>
              <td>
                <span className={s.status}>{i.status}</span>
              </td>
              <td>{new Date(i.createdAt).toLocaleDateString("fr-FR")}</td>
              <td>
                <Button
                  variant="link"
                  size="sm"
                  icon="↗"
                  onClick={() => select(structuredClone(i))}
                >
                  Ouvrir
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <div className={s.empty}>
      Aucune demande pour le moment.
      <p>Les messages envoyés depuis le site apparaîtront ici.</p>
    </div>
  );
}
function EntryEditor({
  entry,
  setEntry,
  eventTypes,
  siblings,
  isNew,
  busy,
  save,
  close,
}: {
  entry: Entry;
  setEntry: Dispatch<SetStateAction<Entry | null>>;
  eventTypes: string[];
  /** The other entries of the same kind: pages and networks already in use. */
  siblings: Entry[];
  isNew: boolean;
  busy: boolean;
  save: () => void;
  close: () => void;
}) {
  // Functional update: an upload resolving later must not erase edits made meanwhile.
  const set = <K extends keyof Entry>(key: K, value: Entry[K]) =>
    setEntry((current) => current && { ...current, [key]: value });
  const setVariant = (index: number, patch: Partial<Variant>) =>
    setEntry(
      (current) =>
        current && {
          ...current,
          variants: current.variants?.map((v, j) =>
            j === index ? { ...v, ...patch } : v,
          ),
        },
    );
  const [uploading, setUploading] = useState<"image" | "gallery" | null>(
    null,
  );
  const [uploadError, setUploadError] = useState<{
    field: "image" | "gallery";
    message: string;
  } | null>(null);
  async function upload(field: "image" | "gallery", files: File[]) {
    if (!files.length) return;
    setUploadError(null);
    if (
      field === "gallery" &&
      (entry.gallery?.length || 0) + files.length > galleryLimit
    ) {
      setUploadError({
        field,
        message: `La galerie accepte ${galleryLimit} photos maximum.`,
      });
      return;
    }
    setUploading(field);
    try {
      for (const file of files) {
        const url = await uploadPhoto(file);
        setEntry(
          (current) =>
            current &&
            (field === "image"
              ? { ...current, image: url }
              : { ...current, gallery: [...(current.gallery || []), url] }),
        );
      }
    } catch (error) {
      setUploadError({ field, message: (error as Error).message });
    } finally {
      setUploading(null);
    }
  }
  const fields = formFields[entry.kind];
  const has = (field: FormField) => fields.includes(field);
  // Only the home page reads a gallery: the hero slideshow.
  const gallery =
    has("gallery") && (entry.kind !== "pages" || entry.id === "home");
  const typeRequired = entry.kind === "projects";
  // Keep a category saved before the list existed selectable, so it is never dropped silently.
  const eventTypeOptions = [
    ...(typeRequired ? [] : [{ value: "", label: "Aucun" }]),
    ...(entry.category && !eventTypes.includes(entry.category)
      ? [
          {
            value: entry.category,
            label: entry.category,
            description: "Absent des types d’événement : à remplacer",
          },
        ]
      : []),
    ...[...new Set(eventTypes)].map((title) => ({
      value: title,
      label: title,
    })),
  ];
  const network = socialNetworkOf(entry);
  const networkInfo = socialNetworks.find((n) => n.key === network);
  const takenNetworks = siblings.map(socialNetworkOf);
  const takenPages = siblings.map((e) => e.id);
  return (
    <form
      className={s.adminPanel}
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <div className={s.sectionHeading}>
        <h2>{entry.title || "Nouveau contenu"}</h2>
        <Button
          variant="link"
          icon={<CloseIcon />}
          onClick={close}
        >
          Annuler
        </Button>
      </div>
      <div className={s.formGrid}>
        {entry.kind === "socials" && (
          <>
            <Select<SocialNetwork>
              label="Réseau"
              required
              options={socialNetworks.map((n) => ({
                value: n.key,
                label: n.label,
                icon: <SocialIcon name={n.key} />,
                disabled: takenNetworks.includes(n.key),
                description: takenNetworks.includes(n.key)
                  ? "Déjà ajouté"
                  : undefined,
              }))}
              value={network ?? ""}
              onChange={(key) =>
                setEntry(
                  (current) =>
                    current && {
                      ...current,
                      network: key,
                      title:
                        socialNetworks.find((n) => n.key === key)?.label ??
                        current.title,
                    },
                )
              }
            />
            <Input
              label="Lien"
              hint="Adresse en https://, mailto: ou tel:"
              required
              placeholder={networkInfo?.placeholder}
              value={entry.url || ""}
              onChange={(e) => set("url", e.target.value)}
            />
            <Input
              label="Nom du compte ou accroche"
              hint="Affiché sur la page Contact, par exemple @eventhemes."
              maxLength={250}
              value={entry.description}
              onChange={(e) => set("description", e.target.value)}
            />
            {networkInfo?.audience && (
              <NumberInput
                label="Nombre d’abonnés"
                hint="Facultatif. Affiché sur la page Contact."
                min={0}
                step={100}
                value={entry.followers ?? null}
                onChange={(followers) =>
                  set("followers", followers ?? undefined)
                }
              />
            )}
          </>
        )}
        {has("title") && (
          <Input
            label="Titre"
            required
            maxLength={250}
            value={entry.title}
            onChange={(e) => set("title", e.target.value)}
          />
        )}
        {entry.kind === "pages" && (
          <Select
            label="Page"
            required
            disabled={!isNew}
            hint={isNew ? undefined : "La page d’un contenu existant ne change pas."}
            options={[
              ...sitePages,
              // A page saved under an identifier missing from the list stays visible.
              ...(isNew || sitePages.some((p) => p.id === entry.id)
                ? []
                : [{ id: entry.id, label: entry.id }]),
            ].map((page) => ({
              value: page.id,
              label: page.label,
              disabled: isNew && takenPages.includes(page.id),
              description:
                isNew && takenPages.includes(page.id)
                  ? "Déjà créée : modifiez-la depuis la liste"
                  : undefined,
            }))}
            value={
              isNew && !sitePages.some((p) => p.id === entry.id) ? "" : entry.id
            }
            onChange={(id) => set("id", id)}
          />
        )}
        {has("eventType") && (
          <Select
            label="Type d’événement"
            required={typeRequired}
            hint="Liste gérée dans l’onglet « Types d’événement »."
            emptyText="Ajoutez d’abord un type d’événement."
            options={eventTypeOptions}
            value={entry.category || ""}
            onChange={(category) => set("category", category)}
          />
        )}
        {has("subtitle") && (
          <Input
            label="Sous-titre / surtitre"
            className={s.fullWidth}
            value={entry.subtitle || ""}
            onChange={(e) => set("subtitle", e.target.value)}
          />
        )}
        {has("description") && (
          <Textarea
            label="Description"
            className={s.fullWidth}
            rows={4}
            maxLength={10000}
            value={entry.description}
            onChange={(e) => set("description", e.target.value)}
          />
        )}
        {has("image") && (
          <div className={cx(s.fullWidth, s.photoField)}>
            {entry.image && (
              <div className={s.photoThumb}>
                <img src={entry.image} alt="Photo actuelle" />
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Retirer la photo"
                  disabled={uploading !== null}
                  onClick={() => set("image", undefined)}
                >
                  <CloseIcon />
                </Button>
              </div>
            )}
            <FileInput
              label={entry.image ? "Remplacer la photo" : "Importer une photo"}
              hint="JPEG, PNG ou WebP, 8 Mo maximum."
              error={
                uploadError?.field === "image" ? uploadError.message : undefined
              }
              accept="image/jpeg,image/png,image/webp"
              loading={uploading === "image"}
              disabled={uploading === "gallery"}
              onFiles={(files) => void upload("image", files)}
            />
          </div>
        )}
        {gallery && (
          <div className={cx(s.fullWidth, s.photoField)}>
            {!!entry.gallery?.length && (
              <ul className={s.photoGrid} aria-label="Photos de la galerie">
                {entry.gallery.map((url, i) => (
                  <li className={s.photoThumb} key={`${i}-${url}`}>
                    <img src={url} alt={`Galerie, photo ${i + 1}`} />
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Retirer la photo ${i + 1} de la galerie`}
                      disabled={uploading !== null}
                      onClick={() =>
                        set(
                          "gallery",
                          entry.gallery?.filter((_, j) => j !== i),
                        )
                      }
                    >
                      <CloseIcon />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <FileInput
              label={
                entry.kind === "pages"
                  ? "Ajouter des photos au diaporama d’accueil"
                  : "Ajouter des photos à la galerie"
              }
              hint={`Sélection multiple possible. JPEG, PNG ou WebP, 8 Mo par photo, ${galleryLimit} photos maximum.`}
              error={
                uploadError?.field === "gallery"
                  ? uploadError.message
                  : undefined
              }
              multiple
              accept="image/jpeg,image/png,image/webp"
              loading={uploading === "gallery"}
              disabled={
                uploading === "image" ||
                (entry.gallery?.length || 0) >= galleryLimit
              }
              onFiles={(files) => void upload("gallery", files)}
            />
          </div>
        )}
        {has("price") && (
          <>
            <NumberInput
              label="Prix indicatif"
              hint="Laisser vide pour un tarif sur devis."
              min={0}
              step={10}
              decimals={2}
              suffix="MAD"
              value={entry.price ?? null}
              onChange={(price) => set("price", price)}
            />
            <Select<NonNullable<Entry["pricing"]>>
              label="Mode de tarification"
              options={[
                { value: "request", label: "Sur demande" },
                { value: "fixed", label: "Prix fixe" },
                { value: "from", label: "À partir de" },
                ...(entry.kind === "products"
                  ? [
                      {
                        value: "daily" as const,
                        label: "Par quantité et par jour",
                      },
                    ]
                  : []),
              ]}
              value={entry.pricing || "fixed"}
              onChange={(pricing) => set("pricing", pricing)}
            />
          </>
        )}
        {has("product") && (
          <>
            <ColorInput
              label="Couleur / finition"
              hint="La pastille ouvre le nuancier ; le nom apparaît sur la fiche produit et dans le filtre du catalogue."
              placeholder="Doré, bois naturel, blanc mat…"
              value={{ name: entry.color || "", swatch: entry.swatch }}
              onChange={({ name, swatch }) => {
                set("color", name);
                set("swatch", swatch);
              }}
            />
            <div className={s.dimensions}>
              <NumberInput
                label="Longueur"
                min={0}
                decimals={1}
                controls={false}
                suffix="cm"
                value={entry.length ?? null}
                onChange={(length) => set("length", length ?? undefined)}
              />
              <NumberInput
                label="Largeur"
                min={0}
                decimals={1}
                controls={false}
                suffix="cm"
                value={entry.width ?? null}
                onChange={(width) => set("width", width ?? undefined)}
              />
            </div>
            <Textarea
              label="Caractéristiques techniques"
              className={s.fullWidth}
              value={entry.specifications || ""}
              onChange={(e) => set("specifications", e.target.value)}
            />
          </>
        )}
        {has("project") && (
          <>
            <Input
              label="Lieu"
              value={entry.location || ""}
              onChange={(e) => set("location", e.target.value)}
            />
            <YearPicker
              label="Année"
              max={new Date().getFullYear()}
              value={entry.date || ""}
              onChange={(year) => set("date", year)}
            />
            <Input
              label="Vidéo (URL https)"
              type="url"
              value={entry.video || ""}
              onChange={(e) => set("video", e.target.value)}
            />
          </>
        )}
        {/* The on/off settings sit together, after the fields. */}
        <div className={cx(s.fullWidth, s.checkRow)}>
          {has("product") && (
            <Checkbox
              checked={entry.available !== false}
              onChange={(available) => set("available", available)}
            >
              Disponible à la demande
            </Checkbox>
          )}
          <Checkbox
            checked={entry.published}
            onChange={(published) => set("published", published)}
          >
            Publié sur le site
          </Checkbox>
          {has("demo") && (
            <Checkbox
              checked={entry.demo || false}
              onChange={(demo) => set("demo", demo)}
            >
              Contenu de démonstration / inspiration
            </Checkbox>
          )}
        </div>
      </div>
      {has("variants") && (
        <fieldset className={s.variants}>
          <legend>Variantes, prix et dimensions de remplacement</legend>
          {entry.variants?.map((variant, i) => (
            <div className={s.variantRow} key={i}>
              <Input
                label="Nom de la variante"
                className={s.variantName}
                required
                value={variant.name}
                onChange={(e) => setVariant(i, { name: e.target.value })}
              />
              <NumberInput
                label="Prix"
                className={s.variantPrice}
                min={0}
                step={10}
                decimals={2}
                suffix="MAD"
                value={variant.price ?? null}
                onChange={(price) => setVariant(i, { price })}
              />
              <NumberInput
                label="Longueur"
                className={s.variantLength}
                min={0}
                decimals={1}
                controls={false}
                suffix="cm"
                value={variant.length ?? null}
                onChange={(length) =>
                  setVariant(i, { length: length ?? undefined })
                }
              />
              <NumberInput
                label="Largeur"
                className={s.variantWidth}
                min={0}
                decimals={1}
                controls={false}
                suffix="cm"
                value={variant.width ?? null}
                onChange={(width) =>
                  setVariant(i, { width: width ?? undefined })
                }
              />
              <Button
                variant="ghost"
                size="icon"
                danger
                className={s.variantRemove}
                aria-label={`Supprimer la variante ${variant.name}`}
                onClick={() =>
                  set(
                    "variants",
                    entry.variants?.filter((_, j) => j !== i),
                  )
                }
              >
                <CloseIcon />
              </Button>
            </div>
          ))}
          <Button
            variant="link"
            icon="+"
            onClick={() =>
              set("variants", [
                ...(entry.variants || []),
                { name: "", price: null },
              ])
            }
          >
            Ajouter une variante
          </Button>
          <p className={s.caption}>
            Le prix de la variante remplace le prix principal. Un prix vide
            reste sur devis. Le mode « sur demande » prévaut sur tous les prix.
            Une longueur ou une largeur vide reprend celle du produit.
          </p>
        </fieldset>
      )}
      <div className={s.formActions}>
        <Button type="submit" loading={busy} disabled={uploading !== null}>
          {busy ? "Enregistrement…" : "Enregistrer les modifications"}
        </Button>
      </div>
    </form>
  );
}
