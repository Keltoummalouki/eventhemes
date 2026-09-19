import assert from "node:assert/strict";
import { test } from "node:test";
import { estimate } from "../src/lib/eventheme/pricing";
import { lineAmount, lineLabel, type Entry } from "../src/lib/eventheme/types";
import { quoteMessage, whatsappLink } from "../src/lib/eventheme/whatsapp";

test("the WhatsApp message fills every bracket of the specified template", () => {
  const message = quoteMessage({
    event: "Mariage",
    date: "2027-06-12",
    city: "Casablanca",
    services: ["Organisation", "Décoration"],
    name: "Test Eventheme",
    phone: "+212 600 000 000",
    email: "",
    reference: "EVT-ABCD1234",
  });
  assert.match(message, /^Bonjour EVENTHEME, je souhaite demander un devis pour un événement de type Mariage, /);
  assert.match(message, /prévu le samedi 12 juin 2027, à Casablanca\./);
  assert.match(message, /Les services souhaités sont : Organisation, Décoration\./);
  assert.match(message, /Voici mes informations : Test Eventheme, \+212 600 000 000\./);
  assert.match(message, /EVT-ABCD1234/);
  assert.doesNotMatch(message, /\[|\]/);
});

test("missing answers read as « à définir » rather than empty brackets", () => {
  const message = quoteMessage({ event: "", date: "", city: "", services: [], name: "A", phone: "1234567", email: "" });
  assert.match(message, /type à définir/);
  assert.match(message, /\(date à définir\)/);
  assert.match(message, /à définir ensemble/);
});

test("only a numbered wa.me link can carry a pre-filled text", () => {
  assert.equal(
    whatsappLink("https://wa.me/212600000000", "Bonjour & merci"),
    "https://wa.me/212600000000?text=Bonjour%20%26%20merci",
  );
  // Lien court WhatsApp Business : le message y est fixé, pas de texte possible.
  assert.equal(whatsappLink("https://wa.me/message/AREDMVCCJW5GM1", "Bonjour"), null);
  assert.equal(whatsappLink(undefined, "Bonjour"), null);
  assert.equal(whatsappLink("https://example.com/212600000000", "Bonjour"), null);
});

test("estimate lines carry their kind and read clearly on the quote", () => {
  const entry = (id: string, kind: Entry["kind"], price: number | null, rest: Partial<Entry> = {}): Entry => ({
    id,
    kind,
    title: id,
    description: "",
    published: true,
    price,
    ...rest,
  });
  const { lines } = estimate(
    [
      entry("Mariage", "events", null),
      entry("Arche", "products", 900, { pricing: "from" }),
    ],
    { event: "Mariage", rentalDays: 1 },
    { services: [], products: [{ id: "Arche", quantity: 1, variant: "" }] },
  );
  assert.deepEqual(
    lines.map((line) => [lineLabel(line), lineAmount(line).replace(/\s/g, " ")]),
    [
      ["Type d’événement — Mariage", "Sur devis"],
      ["Arche", `Dès ${lineAmount({ kind: "products", label: "", quantity: 1, amount: 900, from: false })}`.replace(/\s/g, " ")],
    ],
  );
});
