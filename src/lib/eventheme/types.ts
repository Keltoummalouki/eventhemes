import { isSocialNetwork, type SocialNetwork } from "@/data/socials";
export const kinds = [
  "services",
  "products",
  "events",
  "projects",
  "pages",
  "socials",
] as const;
export type Kind = (typeof kinds)[number];
export type Variant = {
  name: string;
  price: number | null;
  /** En centimètres ; vides, la variante reprend les dimensions du produit. */
  length?: number;
  width?: number;
};
export type Entry = {
  id: string;
  kind: Kind;
  title: string;
  description: string;
  published: boolean;
  image?: string;
  category?: string;
  price?: number | null;
  pricing?: "fixed" | "from" | "request" | "daily";
  variants?: Variant[];
  color?: string;
  /** Teinte « #rrggbb » de la couleur, affichée en pastille, facultative. */
  swatch?: string;
  /** Longueur d'un produit, en centimètres, facultative. */
  length?: number;
  /** Largeur d'un produit, en centimètres, facultative. */
  width?: number;
  specifications?: string;
  available?: boolean;
  location?: string;
  date?: string;
  url?: string;
  subtitle?: string;
  gallery?: string[];
  video?: string;
  demo?: boolean;
  /** Réseau ou canal d'un lien « Contact & réseaux ». */
  network?: SocialNetwork;
  /** Nombre d'abonnés d'un réseau, facultatif. */
  followers?: number;
};
export type BasketItem = { id: string; quantity: number; variant: string };
export type Basket = { services: string[]; products: BasketItem[] };
export type InquiryInput = {
  kind: "quote" | "contact" | "callback";
  name: string;
  email: string;
  phone: string;
  company: string;
  city: string;
  /** Adresse ou nom du lieu, facultative : précise la ville. */
  address: string;
  message: string;
  subject: string;
  event: string;
  date: string;
  /** Durée de l'événement en heures, facultative : 0 = non précisée. */
  duration: number;
  /** Jours de location du matériel, tarifé à la journée : 1 au minimum. */
  rentalDays: number;
  guests: number;
  contactMethod: string;
  consent: boolean;
  website: string;
  startedAt: number;
  basket: Basket;
};
export const statuses = [
  "Nouvelle demande",
  "En cours de traitement",
  "Devis envoyé",
  "Confirmé",
  "Terminé",
  "Annulé",
] as const;
export type Inquiry = InquiryInput & {
  id: string;
  createdAt: string;
  status: (typeof statuses)[number];
  notes: string;
  estimate: number;
  hasUnpriced: boolean;
  summary: string[];
  continuationHash?: string;
  completedAt?: string;
};
export type CallbackReceipt = {
  id: string;
  token: string;
  name: string;
  phone: string;
  email: string;
  event: string;
};
/** Une ligne de l’estimation : `amount` vide = poste à chiffrer par l’équipe. */
export type EstimateLine = {
  kind: Kind;
  label: string;
  quantity: number;
  amount: number | null;
  from: boolean;
};
/** Coordonnées du premier formulaire « Mon devis ». */
export type QuoteContact = Pick<InquiryInput, "name" | "phone" | "email" | "contactMethod" | "consent">;
/** Précisions ajoutées, si le client le souhaite, après sa demande de rappel. */
export type QuoteDetails = Pick<
  InquiryInput,
  "event" | "date" | "duration" | "rentalDays" | "city" | "address" | "guests" | "message"
>;
/** Instantané remis au client à la fin du parcours : son devis estimatif. */
export type QuoteResult = {
  id: string;
  sentAt: string;
  estimate: number;
  hasUnpriced: boolean;
  lines: EstimateLine[];
  contact: QuoteContact;
  details: QuoteDetails;
  basket: Basket;
};
/**
 * lead : coordonnées · invite : proposition d’aller plus loin · waiting : simple
 * rappel · configure : personnalisation · done : devis estimatif.
 */
export type QuotePhase = "lead" | "invite" | "waiting" | "configure" | "done";
export type QuoteState = {
  phase: QuotePhase;
  step: number;
  contact: QuoteContact;
  details: QuoteDetails;
  lead: CallbackReceipt | null;
  result: QuoteResult | null;
};
export const labels: Record<Kind, string> = {
  services: "Services",
  products: "Matériel & variantes",
  events: "Types d’événement",
  projects: "Réalisations",
  pages: "Contenu des pages",
  socials: "Contact & réseaux",
};
export const money = (value: number) =>
  new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 0,
  }).format(value);
export const centimetres = (value: number) =>
  `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(value)} cm`;
/** Bornes partagées par le configurateur et la validation serveur. */
export const MAX_DURATION_HOURS = 72;
export const MAX_RENTAL_DAYS = 60;
export const hoursLabel = (value: number) =>
  `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(value)} h`;
export const daysLabel = (value: number) => `${value} jour${value > 1 ? "s" : ""}`;
/** Réseau d'un lien de contact ; les fiches antérieures au champ `network` le portent dans leur identifiant. */
export const socialNetworkOf = (entry: Entry): SocialNetwork | undefined =>
  entry.network ?? (isSocialNetwork(entry.id) ? entry.id : undefined);
export const findSocial = (entries: Entry[], network: SocialNetwork) =>
  entries.find((e) => e.kind === "socials" && socialNetworkOf(e) === network);
export const followersLabel = (followers: number) =>
  `${new Intl.NumberFormat("fr-FR", { notation: "compact" }).format(followers)} abonnés`;
export function priceLabel(entry: Entry) {
  if (entry.price == null || entry.pricing === "request") return "Sur devis";
  return `${entry.pricing === "from" ? "À partir de " : ""}${money(entry.price)}${entry.pricing === "daily" ? " / jour" : ""}`;
}
const linePrefix: Partial<Record<Kind, string>> = {
  events: "Type d’événement",
};
/** Intitulé lisible d’une ligne de l’estimation, selon sa nature. */
export function lineLabel(line: EstimateLine) {
  const prefix = linePrefix[line.kind];
  return prefix ? `${prefix} — ${line.label}` : line.label;
}
export function lineAmount(line: EstimateLine) {
  return line.amount == null ? "Sur devis" : `${line.from ? "Dès " : ""}${money(line.amount)}`;
}
