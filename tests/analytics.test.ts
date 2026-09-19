import assert from "node:assert/strict";
import { test } from "node:test";
import { analytics, statisticsRows, trend } from "../src/lib/eventheme/analytics";
import { toIsoDate } from "../src/lib/dates";
import type { Entry, Inquiry } from "../src/lib/eventheme/types";

/* Un instant fixe, en heure locale : les fenêtres glissantes et les mois
   restent les mêmes d'une machine à l'autre. */
const now = new Date(2026, 8, 19, 12, 0, 0);
const DAY = 86_400_000;
/** Horodatage d'une demande reçue il y a `days` jours. */
const received = (days: number) => new Date(now.getTime() - days * DAY).toISOString();
/** Date calendaire située dans `days` jours (négatif : dans le passé). */
const on = (days: number) =>
  toIsoDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + days));

const e = (id: string, kind: Entry["kind"], rest: Partial<Entry> = {}): Entry => ({
  id,
  kind,
  title: id,
  description: "",
  published: true,
  image: "/photo.jpg",
  ...rest,
});

const entries: Entry[] = [
  e("event-mariage", "events", { title: "Mariage", price: 1000 }),
  e("event-anniv", "events", { title: "Anniversaire", price: 500 }),
  e("organisation", "services", { title: "Organisation", price: 4000 }),
  e("animation", "services", { title: "Animation", price: null, pricing: "request" }),
  e("chair", "products", {
    title: "Chaise dorée",
    category: "Mobilier",
    price: 50,
    pricing: "daily",
  }),
  e("led", "products", { title: "Écran LED", category: "Écrans", price: null, pricing: "request" }),
  e("table", "products", { title: "Table ronde", category: "Mobilier", price: 200 }),
  e("bar", "products", { title: "Bar lumineux", price: 900, published: false }),
  e("projet", "projects", { title: "Mariage à Marrakech", image: undefined }),
];

let sequence = 0;
const inquiry = (over: Partial<Inquiry> = {}): Inquiry => ({
  kind: "quote",
  name: "Client",
  email: "client@example.com",
  phone: "+212600000000",
  company: "",
  city: "Casablanca",
  address: "",
  message: "",
  subject: "",
  event: "event-mariage",
  date: "",
  duration: 0,
  rentalDays: 1,
  guests: 0,
  contactMethod: "WhatsApp",
  consent: true,
  website: "",
  startedAt: 0,
  basket: { services: [], products: [] },
  id: `demande-${++sequence}`,
  createdAt: received(1),
  status: "Nouvelle demande",
  notes: "",
  estimate: 0,
  hasUnpriced: false,
  summary: [],
  ...over,
});

const inquiries: Inquiry[] = [
  inquiry({
    createdAt: received(1),
    estimate: 1000,
    guests: 100,
    duration: 6,
    rentalDays: 2,
    date: on(10),
    basket: { services: ["organisation"], products: [{ id: "chair", quantity: 10, variant: "" }] },
  }),
  inquiry({
    createdAt: received(5),
    estimate: 500,
    guests: 50,
    city: "Rabat",
    date: on(40),
    basket: { services: [], products: [{ id: "chair", quantity: 5, variant: "" }] },
  }),
  inquiry({
    createdAt: received(10),
    status: "Devis envoyé",
    estimate: 2000,
    hasUnpriced: true,
    event: "event-anniv",
    contactMethod: "E-mail",
    date: on(-5),
    basket: { services: ["animation"], products: [{ id: "led", quantity: 2, variant: "" }] },
  }),
  inquiry({ createdAt: received(20), status: "Confirmé", estimate: 3000, guests: 200, date: on(60) }),
  inquiry({ createdAt: received(40), status: "Terminé", estimate: 1500, event: "event-anniv", date: on(-100) }),
  inquiry({ createdAt: received(50), status: "Annulé", estimate: 800, event: "event-anniv", date: on(5) }),
  inquiry({
    createdAt: received(6),
    status: "En cours de traitement",
    estimate: 700,
    date: on(20),
    completedAt: received(5),
  }),
  inquiry({ kind: "contact", createdAt: received(2), city: "", event: "", subject: "Question" }),
  inquiry({ kind: "callback", createdAt: received(3), city: "", event: "event-anniv" }),
  inquiry({ kind: "contact", createdAt: received(0.08), city: "", event: "" }),
];

const stats = analytics(entries, inquiries, now);

test("volumes split by form and by sliding window", () => {
  assert.equal(stats.volume.total, 10);
  assert.equal(stats.volume.quotes, 7);
  assert.equal(stats.volume.messages, 2);
  assert.equal(stats.volume.callbacks, 1);
  assert.equal(stats.volume.today, 1);
  assert.deepEqual(stats.volume.week, { value: 6, previous: 1, delta: 5 });
  assert.deepEqual(stats.volume.month, { value: 8, previous: 2, delta: 3 });
  assert.equal(stats.volume.withProducts, 3);
});

test("a period without a comparison point has no variation rather than a wrong one", () => {
  assert.equal(trend(4, 0).delta, null);
  assert.equal(trend(0, 4).delta, -1);
});

test("the pipeline keeps the order of the statuses and totals every request", () => {
  assert.deepEqual(
    stats.pipeline.map((line) => [line.status, line.count]),
    [
      ["Nouvelle demande", 5],
      ["En cours de traitement", 1],
      ["Devis envoyé", 1],
      ["Confirmé", 1],
      ["Terminé", 1],
      ["Annulé", 1],
    ],
  );
  assert.ok(
    Math.abs(stats.pipeline.reduce((total, line) => total + line.share, 0) - 1) < 1e-9,
  );
});

test("requests left untouched for three days are the ones to chase, oldest first", () => {
  assert.equal(stats.handling.open, 7);
  assert.equal(stats.handling.pending, 5);
  assert.equal(stats.handling.active, 2);
  assert.deepEqual(
    stats.handling.stale.map((i) => i.id),
    ["demande-2", "demande-9"],
  );
  assert.equal(stats.handling.oldestPendingDays, 5);
});

test("conversion rates count only the requests already decided", () => {
  assert.equal(stats.conversion.won, 2);
  assert.equal(stats.conversion.lost, 1);
  assert.equal(stats.conversion.winRate, 2 / 3);
  assert.equal(stats.conversion.quoteSentRate, 3 / 7);
  assert.equal(stats.conversion.cancelRate, 1 / 10);
  assert.equal(stats.conversion.callbacksCompleted, 1);
  assert.equal(stats.conversion.callbackRate, 1 / 2);
});

test("estimated value separates the open portfolio from what is already won", () => {
  assert.equal(stats.value.pipeline, 4200);
  assert.equal(stats.value.won, 4500);
  assert.equal(stats.value.total, 9500);
  assert.equal(stats.value.average, 9500 / 7);
  assert.equal(stats.value.unpriced, 1);
  assert.equal(stats.value.largest?.estimate, 3000);
});

test("the schedule lists future events and flags those still open after their date", () => {
  assert.deepEqual(
    stats.events.upcoming.map((i) => i.id),
    ["demande-1", "demande-7", "demande-2", "demande-4"],
  );
  assert.equal(stats.events.upcoming30, 2);
  assert.equal(stats.events.thisMonth, 1);
  assert.deepEqual(
    stats.events.toClose.map((i) => i.id),
    ["demande-3"],
  );
  assert.equal(stats.events.totalGuests, 350);
  assert.equal(stats.events.averageGuests, 350 / 3);
  assert.equal(stats.events.averageDuration, 6);
  assert.equal(stats.events.averageRentalDays, 4 / 3);
  assert.ok((stats.events.leadTimeDays ?? 0) > 0);
});

test("rankings name the content and count the quantities actually requested", () => {
  assert.deepEqual(
    stats.demand.eventTypes.map((rank) => [rank.label, rank.value]),
    [
      ["Anniversaire", 4],
      ["Mariage", 4],
    ],
  );
  assert.deepEqual(
    stats.demand.services.map((rank) => rank.label),
    ["Animation", "Organisation"],
  );
  assert.deepEqual(stats.demand.products[0], {
    id: "chair",
    label: "Chaise dorée",
    value: 15,
    share: 15 / 17,
    caption: "Mobilier",
  });
  assert.deepEqual(
    stats.demand.cities.map((rank) => [rank.label, rank.value]),
    [
      ["Casablanca", 6],
      ["Rabat", 1],
    ],
  );
  assert.deepEqual(
    stats.demand.contactMethods.map((rank) => [rank.label, rank.value]),
    [
      ["WhatsApp", 9],
      ["E-mail", 1],
    ],
  );
});

test("the monthly series covers twelve months and carries its estimated amounts", () => {
  assert.equal(stats.months.length, 12);
  assert.equal(stats.months.at(-1)?.value, 7);
  assert.equal(stats.months.at(-1)?.amount, 4200);
  assert.equal(stats.season.length, 12);
  // Le mois en cours compte tous ses événements, y compris ceux des jours passés.
  assert.equal(stats.season[0].value, 2);
});

test("the catalogue reports what is missing and what nobody ever asks for", () => {
  assert.equal(stats.catalogue.products, 4);
  assert.equal(stats.catalogue.unavailable, 0);
  assert.equal(stats.catalogue.onRequest, 1);
  assert.equal(stats.catalogue.averagePrice, (50 + 200 + 900) / 3);
  assert.equal(stats.catalogue.missingImage, 1);
  assert.deepEqual(
    stats.catalogue.dormant.map((product) => product.label),
    ["Table ronde"],
  );
  assert.deepEqual(
    stats.catalogue.counts.find((line) => line.kind === "products"),
    { kind: "products", total: 4, published: 3 },
  );
});

test("an empty administration shows no figure rather than a misleading zero", () => {
  const empty = analytics([], [], now);
  assert.equal(empty.conversion.winRate, null);
  assert.equal(empty.value.average, null);
  assert.equal(empty.events.averageGuests, null);
  assert.equal(empty.handling.oldestPendingDays, null);
  assert.equal(empty.volume.month.delta, null);
  assert.deepEqual(empty.demand.products, []);
});

test("the CSV export repeats the figures shown on screen", () => {
  const rows = statisticsRows(stats);
  assert.deepEqual(rows[0], ["Indicateur", "Valeur"]);
  assert.ok(rows.every((row) => row.length <= 2));
  const line = (label: string) => rows.find((row) => row[0] === label)?.[1];
  assert.equal(line("Total des demandes"), "10");
  // Intl sépare le nombre du signe par une espace insécable étroite.
  assert.match(line("Taux de concrétisation") ?? "", /^67\s%$/u);
  assert.equal(line("Demandes de rappel en attente"), "1");
  assert.ok(rows.some((row) => row[0] === "Matériel — Chaise dorée"));
});
