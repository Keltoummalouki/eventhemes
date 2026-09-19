import assert from "node:assert/strict";
import { test } from "node:test";
import { acceptsFile } from "../src/lib/files";
import {
  clampNumber,
  decimalsOf,
  formatNumber,
  parseNumber,
  sanitizeNumber,
  stepNumber,
} from "../src/lib/numbers";
import { phoneCountries } from "../src/data/phoneCountries";
import { filterOptions } from "../src/lib/listNavigation";
import {
  countryByDial,
  countryOptions,
  findCountry,
  flagEmoji,
  formatPhone,
  isValidPhone,
  parsePhone,
  phoneExample,
  sanitizePhone,
} from "../src/lib/phone";

test("numbers typed the French way are read back", () => {
  assert.equal(parseNumber("0,06"), 0.06);
  assert.equal(parseNumber("1 250,50"), 1250.5);
  assert.equal(parseNumber("10 000"), 10000);
  assert.equal(parseNumber("12.5"), 12.5);
  assert.equal(parseNumber("12,"), 12);
  assert.equal(parseNumber("-3"), -3);
  for (const partial of ["", " ", "-", ",", "1,2,3", "abc"]) assert.equal(parseNumber(partial), null);
});

test("numbers are shown in French and round-trip through the parser", () => {
  assert.equal(formatNumber(0.06, 2), "0,06");
  assert.equal(parseNumber(formatNumber(10000, 0)), 10000);
  assert.equal(parseNumber(formatNumber(1250.5, 2)), 1250.5);
  assert.equal(formatNumber(null, 2), "");
});

test("typing keeps only what a number can contain", () => {
  assert.equal(sanitizeNumber("12a,5€", { decimals: 2, negative: false }), "12,5");
  assert.equal(sanitizeNumber("-4,5", { decimals: 0, negative: false }), "45");
  assert.equal(sanitizeNumber("-4", { decimals: 0, negative: true }), "-4");
});

test("decimals follow the step unless given", () => {
  assert.equal(decimalsOf(1), 0);
  assert.equal(decimalsOf(0.01), 2);
  assert.equal(decimalsOf(0.5), 1);
  assert.equal(decimalsOf(1e-7), 7);
});

test("steps stay inside the bounds and avoid binary drift", () => {
  const bounds = { min: 0, max: 100 };
  assert.equal(stepNumber(0.1, 1, 0.2, bounds, 1), 0.3);
  assert.equal(stepNumber(95, 1, 10, bounds, 0), 100);
  assert.equal(stepNumber(5, -1, 10, bounds, 0), 0);
  assert.equal(stepNumber(50, 10, 1, bounds, 0), 60);
  // An empty field starts from the minimum, or one step above zero.
  assert.equal(stepNumber(null, 1, 10, bounds, 0), 10);
  assert.equal(stepNumber(null, -1, 10, bounds, 0), 0);
  assert.equal(stepNumber(null, 1, 1, { min: 1 }, 0), 1);
  assert.equal(clampNumber(20000, { max: 10000 }), 10000);
});

test("Moroccan numbers get the +212 prefix, with or without the leading 0", () => {
  for (const typed of ["06 12 34 56 78", "612345678", "+212 6 12 34 56 78", "00212612345678", "+212612345678"]) {
    const phone = parsePhone(typed);
    assert.equal(phone.country.iso, "MA", typed);
    assert.equal(phone.value, "+212 6 12 34 56 78", typed);
    assert.equal(phone.complete, true, typed);
  }
  assert.deepEqual(formatPhone("+212 6 12 34 56 78"), { country: findCountry("MA"), text: "6 12 34 56 78" });
  assert.equal(parsePhone("").value, "");
  assert.equal(parsePhone("0").value, "");
});

test("incomplete or implausible Moroccan numbers are rejected", () => {
  assert.equal(isValidPhone("06 12"), false);
  assert.equal(isValidPhone("06 12 34 56 78 9"), false);
  assert.equal(isValidPhone("01 12 34 56 78"), false);
  assert.equal(isValidPhone(""), false);
  // The prefix alone must not pass the server's length check by accident.
  assert.equal(parsePhone("612").value, "+212 6 12");
  assert.equal(isValidPhone("612"), false);
});

test("a number typed with its dial code picks its country", () => {
  const french = parsePhone("+33 6 12 34 56 78");
  assert.equal(french.country.iso, "FR");
  assert.equal(french.dialed, true);
  assert.equal(french.rest, "6 12 34 56 78");
  assert.equal(french.value, "+33 6 12 34 56 78");
  assert.equal(french.complete, true);
  assert.equal(parsePhone("0033612345678").value, "+33 6 12 34 56 78");
  assert.equal(parsePhone("+33 (0)6 12 34 56 78").value, "+33 6 12 34 56 78");
  assert.deepEqual(formatPhone("+33 6 12 34 56 78"), { country: findCountry("FR"), text: "6 12 34 56 78" });
  assert.equal(isValidPhone("+33 6"), false);
  assert.equal(isValidPhone("+1234567890123456"), false);
  // An unfinished dial code waits for more digits.
  assert.equal(parsePhone("+3").pending, true);
  assert.equal(parsePhone("+3").value, "");
});

test("the chosen country applies to national numbers", () => {
  const france = findCountry("FR");
  assert.equal(parsePhone("06 12 34 56 78", france).value, "+33 6 12 34 56 78");
  assert.equal(isValidPhone("06 12 34 56 78", france), true);
  const uk = findCountry("GB");
  assert.equal(parsePhone("07400 123456", uk).value, "+44 7400 123456");
  // Italy has no national prefix: the leading 0 belongs to the number.
  assert.equal(parsePhone("06 1234 5678", findCountry("IT")).national, "0612345678");
  // A prefix that is also a valid first digit is only dropped when that makes sense.
  assert.equal(parsePhone("8 912 345 67 89", findCountry("RU")).value, "+7 912 345 67 89");
});

test("shared dial codes keep the chosen country", () => {
  assert.equal(parsePhone("+1 514 555 0123").country.iso, "US");
  assert.equal(parsePhone("+1 514 555 0123", findCountry("CA")).country.iso, "CA");
  assert.equal(countryByDial("447400123456")?.iso, "GB");
  assert.equal(countryByDial("999"), undefined);
});

test("country list is complete, named in French and searchable", () => {
  const options = countryOptions();
  const morocco = options.find((option) => option.country.iso === "MA");
  assert.equal(morocco?.label, "Maroc");
  assert.equal(options.some((option) => option.country.iso === "EH"), false);
  assert.deepEqual(new Set(phoneCountries.map((country) => country.iso)).size, phoneCountries.length);
  assert.equal(filterOptions(options, "royaume uni")[0]?.country.iso, "GB");
  assert.equal(filterOptions(options, "+212")[0]?.country.iso, "MA");
  assert.equal(filterOptions(options, "spain")[0]?.country.iso, "ES");
  assert.equal(flagEmoji("ma"), "🇲🇦");
  assert.equal(phoneExample(findCountry("MA")!), "6 50 12 34 56");
});

test("normalised phone values satisfy the server check", () => {
  const server = /^[+\d ()-]{7,30}$/;
  for (const typed of ["06.12.34.56.78", "+33 (0)6 12-34-56-78", "0612345678", "+683 7290"]) {
    assert.match(parsePhone(sanitizePhone(typed)).value, server, typed);
  }
  assert.equal(sanitizePhone("06a12+34"), "061234");
  assert.equal(sanitizePhone("+33 6"), "+33 6");
});

test("dropped files are checked against accept like the native picker", () => {
  const photo = { name: "Salle.JPG", type: "image/jpeg" };
  const pdf = { name: "devis.pdf", type: "application/pdf" };
  assert.equal(acceptsFile(photo, "image/jpeg,image/png,image/webp"), true);
  assert.equal(acceptsFile(pdf, "image/jpeg,image/png,image/webp"), false);
  assert.equal(acceptsFile(photo, "image/*"), true);
  assert.equal(acceptsFile(pdf, ".pdf"), true);
  assert.equal(acceptsFile(photo, ".jpg"), true);
  assert.equal(acceptsFile(pdf, undefined), true);
  assert.equal(acceptsFile(pdf, ""), true);
});
