/* ==========================================================================
   Statistiques de l'administration — calcul pur

   Tout est déduit des demandes et des contenus déjà chargés par l'espace
   administrateur : aucune requête supplémentaire, aucune donnée inventée.
   Une valeur absente vaut `null` et s'affiche « — » plutôt que zéro, pour ne
   jamais présenter une moyenne calculée sur rien comme un fait.
   ========================================================================== */
import { parseIsoDate, today } from "@/lib/dates";
import { labels, money, statuses, type Entry, type Inquiry, type Kind } from "./types";

export type Status = Inquiry["status"];

/** Une valeur comparée à la période précédente. `delta` vide : rien à comparer. */
export type Trend = { value: number; previous: number; delta: number | null };

/** Une ligne de classement : libellé, valeur, part du total et précision facultative. */
export type Rank = {
  id: string;
  label: string;
  value: number;
  share: number;
  caption?: string;
};

/** Un mois d'une série : `value` = nombre de demandes, `amount` = montant estimé. */
export type MonthPoint = {
  key: string;
  /** « janv » — libellé court de l'axe. */
  label: string;
  /** « janvier 2026 » — libellé complet de l'infobulle et du résumé lu à voix haute. */
  title: string;
  value: number;
  amount: number;
};

export type Analytics = {
  volume: {
    total: number;
    quotes: number;
    messages: number;
    callbacks: number;
    month: Trend;
    week: Trend;
    today: number;
    withProducts: number;
    withProductsShare: number;
  };
  pipeline: { status: Status; count: number; share: number }[];
  handling: {
    pending: number;
    active: number;
    open: number;
    stale: Inquiry[];
    oldestPendingDays: number | null;
    averageOpenAgeDays: number | null;
  };
  conversion: {
    decided: number;
    won: number;
    lost: number;
    winRate: number | null;
    quoteSentRate: number | null;
    cancelRate: number | null;
    callbacksPending: number;
    callbacksCompleted: number;
    callbackRate: number | null;
  };
  value: {
    pipeline: number;
    won: number;
    total: number;
    average: number | null;
    unpriced: number;
    unpricedShare: number;
    largest: Inquiry | null;
  };
  events: {
    upcoming: Inquiry[];
    upcoming30: number;
    thisMonth: number;
    toClose: Inquiry[];
    totalGuests: number;
    averageGuests: number | null;
    averageDuration: number | null;
    averageRentalDays: number | null;
    leadTimeDays: number | null;
  };
  demand: {
    eventTypes: Rank[];
    services: Rank[];
    products: Rank[];
    cities: Rank[];
    contactMethods: Rank[];
  };
  months: MonthPoint[];
  season: MonthPoint[];
  catalogue: {
    counts: { kind: Kind; total: number; published: number }[];
    products: number;
    unavailable: number;
    onRequest: number;
    averagePrice: number | null;
    missingImage: number;
    dormant: Rank[];
  };
};

const DAY = 86_400_000;
/** Au-delà de ce délai, une « Nouvelle demande » est signalée comme prioritaire. */
export const STALE_DAYS = 3;
/** Horizon des « événements à venir » mis en avant. */
export const UPCOMING_DAYS = 30;
/** Demandes encore ouvertes : elles composent le portefeuille en cours. */
const openStatuses: Status[] = [
  "Nouvelle demande",
  "En cours de traitement",
  "Devis envoyé",
];
const wonStatuses: Status[] = ["Confirmé", "Terminé"];

/* L'axe porte le seul mois : douze libellés doivent tenir côte à côte sans se
   chevaucher. L'année est donnée par la lecture au-dessus du graphique. */
const shortMonth = new Intl.DateTimeFormat("fr-FR", { month: "short" });
const longMonth = new Intl.DateTimeFormat("fr-FR", {
  month: "long",
  year: "numeric",
});

const monthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

/** Horodatage d'une demande ; `null` si la date est illisible. */
function receivedAt(inquiry: Inquiry): Date | null {
  const date = new Date(inquiry.createdAt);
  return Number.isNaN(date.getTime()) ? null : date;
}

function average(values: number[]): number | null {
  return values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : null;
}

/** Variation d'une période à l'autre ; vide lorsque la précédente est nulle. */
export function trend(value: number, previous: number): Trend {
  return {
    value,
    previous,
    delta: previous ? (value - previous) / previous : null,
  };
}

function bump(counts: Map<string, number>, key: string, amount = 1) {
  if (!key) return;
  counts.set(key, (counts.get(key) ?? 0) + amount);
}

/** Classement décroissant, chaque ligne rapportée au total du classement. */
function ranked(
  counts: Map<string, number>,
  label: (id: string) => string,
  caption?: (id: string) => string | undefined,
): Rank[] {
  const total = [...counts.values()].reduce((sum, value) => sum + value, 0);
  return [...counts]
    .map(([id, value]) => ({
      id,
      label: label(id),
      value,
      share: total ? value / total : 0,
      caption: caption?.(id),
    }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, "fr"));
}

/** Les `count` mois consécutifs à partir de `first`, alimentés par `totals`. */
function monthSeries(
  first: Date,
  count: number,
  totals: Map<string, { value: number; amount: number }>,
): MonthPoint[] {
  return Array.from({ length: count }, (_, index) => {
    const month = new Date(first.getFullYear(), first.getMonth() + index, 1);
    const key = monthKey(month);
    const entry = totals.get(key);
    return {
      key,
      label: shortMonth.format(month).replace(".", ""),
      title: longMonth.format(month),
      value: entry?.value ?? 0,
      amount: entry?.amount ?? 0,
    };
  });
}

/**
 * Toutes les statistiques de l'espace administrateur, calculées en une passe
 * sur les demandes reçues et les contenus du site.
 */
export function analytics(
  entries: Entry[],
  inquiries: Inquiry[],
  now = new Date(),
): Analytics {
  const midnight = today(now);
  const titleOf = (id: string, kind: Kind) =>
    entries.find((entry) => entry.id === id && entry.kind === kind)?.title ?? id;

  /* --- Volume ------------------------------------------------------------ */
  const quotes = inquiries.filter((i) => i.kind === "quote");
  const messages = inquiries.filter((i) => i.kind === "contact");
  const callbacks = inquiries.filter((i) => i.kind === "callback");
  const since = (from: number, to: number) =>
    inquiries.filter((inquiry) => {
      const date = receivedAt(inquiry)?.getTime();
      return date != null && date >= now.getTime() - from * DAY && date < now.getTime() - to * DAY;
    }).length;
  const withProducts = quotes.filter((i) => i.basket.products.length > 0).length;

  /* --- Pipeline et traitement -------------------------------------------- */
  const byStatus = new Map<Status, number>();
  inquiries.forEach((inquiry) => byStatus.set(inquiry.status, (byStatus.get(inquiry.status) ?? 0) + 1));
  const pipeline = statuses.map((status) => ({
    status,
    count: byStatus.get(status) ?? 0,
    share: inquiries.length ? (byStatus.get(status) ?? 0) / inquiries.length : 0,
  }));
  const pendingList = inquiries.filter((i) => i.status === "Nouvelle demande");
  const openList = inquiries.filter((i) => openStatuses.includes(i.status));
  const ageInDays = (inquiry: Inquiry) => {
    const date = receivedAt(inquiry);
    return date ? Math.floor((now.getTime() - date.getTime()) / DAY) : null;
  };
  const pendingAges = pendingList.map(ageInDays).filter((age): age is number => age != null);

  /* --- Conversion -------------------------------------------------------- */
  const won = inquiries.filter((i) => wonStatuses.includes(i.status)).length;
  const lost = byStatus.get("Annulé") ?? 0;
  const decided = won + lost;
  const quotedOrBeyond = quotes.filter((i) =>
    ["Devis envoyé", "Confirmé", "Terminé"].includes(i.status),
  ).length;
  const callbacksCompleted = inquiries.filter((i) => Boolean(i.completedAt)).length;

  /* --- Valeur ------------------------------------------------------------ */
  const priced = quotes.filter((i) => i.estimate > 0);
  const largest = priced.reduce<Inquiry | null>(
    (best, inquiry) => (!best || inquiry.estimate > best.estimate ? inquiry : best),
    null,
  );
  const sum = (list: Inquiry[]) => list.reduce((total, i) => total + (i.estimate || 0), 0);
  const unpriced = quotes.filter((i) => i.hasUnpriced).length;

  /* --- Événements -------------------------------------------------------- */
  const dated = inquiries
    .map((inquiry) => ({ inquiry, date: parseIsoDate(inquiry.date) }))
    .filter((item): item is { inquiry: Inquiry; date: Date } => item.date != null);
  const upcoming = dated
    .filter(({ inquiry, date }) => date >= midnight && inquiry.status !== "Annulé")
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  const horizon = new Date(midnight.getTime() + UPCOMING_DAYS * DAY);
  const toClose = dated
    .filter(({ inquiry, date }) => date < midnight && openStatuses.includes(inquiry.status))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map(({ inquiry }) => inquiry);
  const guests = quotes.map((i) => i.guests).filter((value) => value > 0);
  const durations = quotes.map((i) => i.duration).filter((value) => value > 0);
  const rentalDays = quotes.filter((i) => i.basket.products.length > 0).map((i) => i.rentalDays || 1);
  const leadTimes = dated
    .map(({ inquiry, date }) => {
      const created = receivedAt(inquiry);
      return created ? Math.round((date.getTime() - created.getTime()) / DAY) : null;
    })
    .filter((value): value is number => value != null && value >= 0);

  /* --- Ce que les clients demandent -------------------------------------- */
  const eventCounts = new Map<string, number>();
  const serviceCounts = new Map<string, number>();
  const productCounts = new Map<string, number>();
  const cityCounts = new Map<string, number>();
  const methodCounts = new Map<string, number>();
  for (const inquiry of inquiries) {
    bump(eventCounts, inquiry.event);
    bump(cityCounts, inquiry.city);
    bump(methodCounts, inquiry.contactMethod);
    inquiry.basket.services.forEach((id) => bump(serviceCounts, id));
    inquiry.basket.products.forEach((item) => bump(productCounts, item.id, item.quantity));
  }

  /* --- Séries mensuelles -------------------------------------------------- */
  const receivedTotals = new Map<string, { value: number; amount: number }>();
  for (const inquiry of inquiries) {
    const date = receivedAt(inquiry);
    if (!date) continue;
    const key = monthKey(date);
    const entry = receivedTotals.get(key) ?? { value: 0, amount: 0 };
    receivedTotals.set(key, {
      value: entry.value + 1,
      amount: entry.amount + (inquiry.estimate || 0),
    });
  }
  const seasonTotals = new Map<string, { value: number; amount: number }>();
  for (const { inquiry, date } of dated) {
    if (inquiry.status === "Annulé") continue;
    const key = monthKey(date);
    const entry = seasonTotals.get(key) ?? { value: 0, amount: 0 };
    seasonTotals.set(key, {
      value: entry.value + 1,
      amount: entry.amount + (inquiry.estimate || 0),
    });
  }

  /* --- Catalogue ---------------------------------------------------------- */
  const products = entries.filter((e) => e.kind === "products");
  const productPrices = products
    .map((product) => product.price)
    .filter((price): price is number => price != null && price > 0);
  const dormant = products
    .filter((product) => product.published && !productCounts.has(product.id))
    .map((product) => ({
      id: product.id,
      label: product.title,
      value: 0,
      share: 0,
      caption: product.category,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "fr"));

  return {
    volume: {
      total: inquiries.length,
      quotes: quotes.length,
      messages: messages.length,
      callbacks: callbacks.length,
      month: trend(since(30, 0), since(60, 30)),
      week: trend(since(7, 0), since(14, 7)),
      today: inquiries.filter((inquiry) => {
        const date = receivedAt(inquiry);
        return date != null && date >= midnight;
      }).length,
      withProducts,
      withProductsShare: quotes.length ? withProducts / quotes.length : 0,
    },
    pipeline,
    handling: {
      pending: pendingList.length,
      active: openList.length - pendingList.length,
      open: openList.length,
      stale: pendingList
        .filter((inquiry) => (ageInDays(inquiry) ?? 0) >= STALE_DAYS)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
      oldestPendingDays: pendingAges.length ? Math.max(...pendingAges) : null,
      averageOpenAgeDays: average(
        openList.map(ageInDays).filter((age): age is number => age != null),
      ),
    },
    conversion: {
      decided,
      won,
      lost,
      winRate: decided ? won / decided : null,
      quoteSentRate: quotes.length ? quotedOrBeyond / quotes.length : null,
      cancelRate: inquiries.length ? lost / inquiries.length : null,
      callbacksPending: callbacks.length,
      callbacksCompleted,
      callbackRate:
        callbacks.length + callbacksCompleted
          ? callbacksCompleted / (callbacks.length + callbacksCompleted)
          : null,
    },
    value: {
      pipeline: sum(openList),
      won: sum(inquiries.filter((i) => wonStatuses.includes(i.status))),
      total: sum(quotes),
      average: average(priced.map((i) => i.estimate)),
      unpriced,
      unpricedShare: quotes.length ? unpriced / quotes.length : 0,
      largest,
    },
    events: {
      upcoming: upcoming.map(({ inquiry }) => inquiry),
      upcoming30: upcoming.filter(({ date }) => date <= horizon).length,
      thisMonth: upcoming.filter(
        ({ date }) =>
          date.getFullYear() === midnight.getFullYear() &&
          date.getMonth() === midnight.getMonth(),
      ).length,
      toClose,
      totalGuests: guests.reduce((total, value) => total + value, 0),
      averageGuests: average(guests),
      averageDuration: average(durations),
      averageRentalDays: average(rentalDays),
      leadTimeDays: average(leadTimes),
    },
    demand: {
      eventTypes: ranked(eventCounts, (id) => titleOf(id, "events")),
      services: ranked(serviceCounts, (id) => titleOf(id, "services")),
      products: ranked(
        productCounts,
        (id) => titleOf(id, "products"),
        (id) => entries.find((e) => e.id === id && e.kind === "products")?.category,
      ),
      cities: ranked(cityCounts, (city) => city),
      contactMethods: ranked(methodCounts, (method) => method),
    },
    months: monthSeries(
      new Date(now.getFullYear(), now.getMonth() - 11, 1),
      12,
      receivedTotals,
    ),
    season: monthSeries(new Date(now.getFullYear(), now.getMonth(), 1), 12, seasonTotals),
    catalogue: {
      counts: (["services", "products", "events", "projects", "pages", "socials"] as Kind[]).map(
        (kind) => {
          const list = entries.filter((entry) => entry.kind === kind);
          return {
            kind,
            total: list.length,
            published: list.filter((entry) => entry.published).length,
          };
        },
      ),
      products: products.length,
      unavailable: products.filter((product) => product.available === false).length,
      onRequest: products.filter(
        (product) => product.price == null || product.pricing === "request",
      ).length,
      averagePrice: average(productPrices),
      missingImage: entries.filter(
        (entry) =>
          ["products", "services", "projects", "events"].includes(entry.kind) && !entry.image,
      ).length,
      dormant,
    },
  };
}

/** Pourcentage français : « 42 % », « — » lorsque la part n'a pas de sens. */
export const percent = (value: number | null, decimals = 0) =>
  value == null
    ? "—"
    : new Intl.NumberFormat("fr-FR", {
        style: "percent",
        maximumFractionDigits: decimals,
      }).format(value);

/** Variation signée : « +18 % », « −5 % », « — » sans période de référence. */
export const delta = (value: number | null) =>
  value == null
    ? "—"
    : `${value > 0 ? "+" : ""}${new Intl.NumberFormat("fr-FR", {
        style: "percent",
        maximumFractionDigits: 0,
      }).format(value)}`;

/**
 * Phrase de comparaison d'une vignette. Sans période de référence, elle le dit
 * plutôt que d'afficher deux tirets à la suite.
 */
export const trendNote = (item: Trend, period: string) =>
  item.delta == null
    ? `Aucune demande ${period} : pas de comparaison possible.`
    : `${delta(item.delta)} — ${count(item.previous)} ${period}.`;

/** « 6 (+50 %) », ou le seul nombre lorsque la comparaison n'a pas de sens. */
export const withDelta = (item: Trend) =>
  item.delta == null ? count(item.value) : `${count(item.value)} (${delta(item.delta)})`;

/** Nombre entier ou décimal court : « 1 240 », « 4,5 ». */
export const count = (value: number | null, decimals = 0) =>
  value == null
    ? "—"
    : new Intl.NumberFormat("fr-FR", { maximumFractionDigits: decimals }).format(value);

/** « 3 jours », « 1 jour », « — ». */
export const daysCount = (value: number | null) =>
  value == null ? "—" : `${count(value, 1)} jour${Math.round(value) > 1 ? "s" : ""}`;

/** Montant abrégé pour les vignettes : « 1,2 M MAD ». */
export const compactMoney = (value: number) =>
  new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

/**
 * Les statistiques mises à plat pour l'export CSV : une ligne par indicateur,
 * précédée du titre de sa rubrique. Les intitulés reprennent ceux affichés à
 * l'écran, pour qu'un tableur et la page racontent la même chose.
 */
export function statisticsRows(stats: Analytics): string[][] {
  const { volume, pipeline, handling, conversion, value, events, demand, catalogue } = stats;
  const section = (title: string): string[][] => [[], [title, ""]];
  const ranks = (title: string, list: Rank[], unit = "") =>
    list
      .slice(0, 10)
      .map((item) => [`${title} — ${item.label}`, `${count(item.value)}${unit}`]);
  return [
    ["Indicateur", "Valeur"],
    ...section("Activité"),
    ["Demandes reçues (30 derniers jours)", count(volume.month.value)],
    ["Variation sur 30 jours", delta(volume.month.delta)],
    ["Demandes reçues (7 derniers jours)", count(volume.week.value)],
    ["Demandes reçues aujourd’hui", count(volume.today)],
    ["Total des demandes", count(volume.total)],
    ["Demandes de devis", count(volume.quotes)],
    ["Messages de contact", count(volume.messages)],
    ["Demandes de rappel en attente", count(volume.callbacks)],
    ["Devis comportant du matériel", percent(volume.withProductsShare)],
    ...section("Suivi des demandes"),
    ...pipeline.map((line) => [line.status, `${count(line.count)} (${percent(line.share)})`]),
    ["Demandes ouvertes", count(handling.open)],
    ["Demandes à relancer", count(handling.stale.length)],
    ["Ancienneté moyenne des demandes ouvertes", daysCount(handling.averageOpenAgeDays)],
    ["Plus ancienne demande non traitée", daysCount(handling.oldestPendingDays)],
    ...section("Conversion"),
    ["Taux de concrétisation", percent(conversion.winRate)],
    ["Devis envoyés", percent(conversion.quoteSentRate)],
    ["Taux d’annulation", percent(conversion.cancelRate)],
    ["Rappels transformés en devis", percent(conversion.callbackRate)],
    ...section("Valeur estimée"),
    ["Portefeuille ouvert", money(value.pipeline)],
    ["Confirmé et terminé", money(value.won)],
    ["Total demandé", money(value.total)],
    ["Panier moyen", value.average == null ? "—" : money(value.average)],
    ["Demandes comportant des postes à chiffrer", percent(value.unpricedShare)],
    ...section("Événements"),
    [`Événements dans ${UPCOMING_DAYS} jours`, count(events.upcoming30)],
    ["Événements ce mois-ci", count(events.thisMonth)],
    ["Événements à venir", count(events.upcoming.length)],
    ["Événements à clôturer", count(events.toClose.length)],
    ["Invités en moyenne", count(events.averageGuests)],
    ["Durée moyenne (heures)", count(events.averageDuration, 1)],
    ["Jours de location en moyenne", count(events.averageRentalDays, 1)],
    ["Délai moyen entre la demande et l’événement", daysCount(events.leadTimeDays)],
    ...section("Demandes reçues par mois"),
    ...stats.months.map((point) => [point.title, `${count(point.value)} — ${money(point.amount)}`]),
    ...section("Événements demandés par mois"),
    ...stats.season.map((point) => [point.title, count(point.value)]),
    ...section("Ce que les clients demandent"),
    ...ranks("Type d’événement", demand.eventTypes),
    ...ranks("Service", demand.services),
    ...ranks("Matériel", demand.products, " unité(s)"),
    ...ranks("Ville", demand.cities),
    ...ranks("Contact préféré", demand.contactMethods),
    ...section("Catalogue"),
    ...catalogue.counts.map((line) => [
      labels[line.kind],
      `${count(line.total)} dont ${count(line.published)} publié(s)`,
    ]),
    ["Articles indisponibles", count(catalogue.unavailable)],
    ["Articles sur devis", count(catalogue.onRequest)],
    ["Prix moyen du matériel", catalogue.averagePrice == null ? "—" : money(catalogue.averagePrice)],
    ["Contenus sans photo", count(catalogue.missingImage)],
    ["Matériel jamais demandé", count(catalogue.dormant.length)],
  ];
}
