import assert from "node:assert/strict";
import { test } from "node:test";
import { estimate } from "../src/lib/eventheme/pricing";
import {
  validateEntry,
  validateInquiry,
} from "../src/lib/eventheme/validation";
import type { Entry, InquiryInput } from "../src/lib/eventheme/types";
const e = (
  id: string,
  kind: Entry["kind"],
  price: number | null,
  rest: Partial<Entry> = {},
): Entry => ({
  id,
  kind,
  price,
  title: id,
  description: "",
  published: true,
  ...rest,
});
const entries = [
  e("event", "events", 100),
  e("service", "services", 400),
  e("chair", "products", 50, {
    pricing: "daily",
    variants: [
      { name: "Gold", price: 75 },
      { name: "Custom", price: null },
    ],
  }),
];
const input: InquiryInput = {
  kind: "quote",
  name: "Test Eventheme",
  email: "test@example.com",
  phone: "+212600000000",
  company: "",
  city: "Casablanca",
  address: "",
  message: "",
  subject: "",
  event: "event",
  date: "2099-10-20",
  duration: 0,
  rentalDays: 2,
  guests: 30,
  contactMethod: "E-mail",
  consent: true,
  website: "",
  startedAt: Date.now() - 3000,
  basket: {
    services: ["service"],
    products: [{ id: "chair", variant: "Gold", quantity: 4 }],
  },
};
test("server estimate combines event, services and daily variants", () => {
  const result = estimate(entries, input, input.basket);
  assert.equal(result.total, 1100);
  assert.equal(result.hasUnpriced, false);
});
test("blank variant prices never silently become the base price", () => {
  const result = estimate(entries, input, {
    services: [],
    products: [{ id: "chair", variant: "Custom", quantity: 4 }],
  });
  assert.equal(result.total, 100);
  assert.equal(result.hasUnpriced, true);
});
test("daily items multiply by the rental days, one day at least", () => {
  assert.equal(estimate(entries, { ...input, rentalDays: 3 }, input.basket).total, 1400);
  const result = estimate(entries, { ...input, rentalDays: 0 }, input.basket);
  assert.equal(result.total, 800);
  assert.equal(result.hasUnpriced, false);
});
test("validated requests keep client fields and canonical selections", () => {
  const result = validateInquiry(input, entries);
  assert.equal(result.name, input.name);
  assert.equal(result.basket.products[0].quantity, 4);
});
test("rejects missing consent, spam, negative quantities, retired products and variants", () => {
  for (const change of [
    { consent: false },
    { website: "spam" },
    { guests: -2 },
    {
      basket: {
        services: [],
        products: [{ id: "chair", variant: "Gold", quantity: -1 }],
      },
    },
    {
      basket: {
        services: [],
        products: [{ id: "retired", variant: "", quantity: 1 }],
      },
    },
    {
      basket: {
        services: [],
        products: [{ id: "chair", variant: "Bad", quantity: 1 }],
      },
    },
    { rentalDays: 1.5 },
    { rentalDays: 61 },
    { duration: -1 },
    { duration: 73 },
  ])
    assert.throws(() => validateInquiry({ ...input, ...change }, entries));
});
test("CMS rejects executable links, negative prices and duplicate variants", () => {
  assert.throws(() =>
    validateEntry({ ...entries[0], url: "javascript:alert(1)" }),
  );
  assert.throws(() => validateEntry({ ...entries[0], price: -1 }));
  assert.throws(() =>
    validateEntry({
      ...entries[0],
      variants: [
        { name: "a", price: 1 },
        { name: "a", price: 2 },
      ],
    }),
  );
  assert.equal(validateEntry(entries[0]).title, "event");
});
test("rejects impossible calendar dates", () => {
  for (const change of [{ date: '2099-02-30' }, { date: '2099-13-02' }]) {
    assert.throws(() => validateInquiry({ ...input, ...change }, entries));
  }
});
test("a quote needs a listed Moroccan city; the address stays optional", () => {
  for (const city of ["", "Ville fictive", "casablanca"]) {
    assert.throws(() => validateInquiry({ ...input, city }, entries));
  }
  const saved = validateInquiry({ ...input, city: "Fès", address: "  Riad des Orangers, Médina  ", duration: 4.5 }, entries);
  assert.equal(saved.city, "Fès");
  assert.equal(saved.address, "Riad des Orangers, Médina");
  assert.equal(saved.duration, 4.5);
});
