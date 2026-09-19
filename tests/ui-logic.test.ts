import assert from "node:assert/strict";
import { test } from "node:test";
import {
  addMonths,
  clampDate,
  endOfWeek,
  formatLongDate,
  formatTime,
  isOutOfRange,
  minuteSteps,
  monthGrid,
  parseIsoDate,
  parseIsoTime,
  startOfWeek,
  toIsoDate,
  toIsoTime,
  today,
  weekdayNames,
} from "../src/lib/dates";
import { isMoroccanCity, moroccanCities } from "../src/data/moroccanCities";
import {
  matchTypeahead,
  moveIndex,
  normalizeText,
  filterOptions,
} from "../src/lib/listNavigation";

const d = (iso: string) => parseIsoDate(iso)!;

test("ISO dates round-trip and impossible dates are rejected", () => {
  assert.equal(toIsoDate(d("2027-06-12")), "2027-06-12");
  assert.equal(parseIsoDate("2027-02-31"), null);
  assert.equal(parseIsoDate("12/06/2027"), null);
  assert.equal(parseIsoDate(""), null);
  // Minuit local, pas UTC : le jour ne glisse pas selon le fuseau.
  assert.equal(toIsoDate(today(new Date(2027, 0, 1, 0, 30))), "2027-01-01");
});

test("month arithmetic keeps the day inside the target month", () => {
  assert.equal(toIsoDate(addMonths(d("2027-01-31"), 1)), "2027-02-28");
  assert.equal(toIsoDate(addMonths(d("2028-01-31"), 1)), "2028-02-29");
  assert.equal(toIsoDate(addMonths(d("2027-03-15"), -12)), "2026-03-15");
});

test("weeks start on Monday and the grid always shows six weeks", () => {
  // 12 juin 2027 est un samedi.
  assert.equal(toIsoDate(startOfWeek(d("2027-06-12"))), "2027-06-07");
  assert.equal(toIsoDate(endOfWeek(d("2027-06-12"))), "2027-06-13");
  assert.equal(toIsoDate(startOfWeek(d("2027-06-07"))), "2027-06-07");
  const grid = monthGrid(d("2027-06-12"));
  assert.equal(grid.length, 6);
  assert.ok(grid.every((week) => week.length === 7));
  assert.equal(toIsoDate(grid[0][0]), "2027-05-31");
  assert.deepEqual(
    weekdayNames().map((day) => day.long),
    ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"],
  );
});

test("min and max bound the selectable range", () => {
  const min = d("2027-06-10");
  const max = d("2027-06-20");
  assert.ok(isOutOfRange(d("2027-06-09"), min, max));
  assert.ok(!isOutOfRange(d("2027-06-10"), min, max));
  assert.equal(toIsoDate(clampDate(d("2027-07-01"), min, max)), "2027-06-20");
  assert.equal(toIsoDate(clampDate(d("2027-06-15"), null, null)), "2027-06-15");
  assert.equal(formatLongDate(d("2027-06-12")), "samedi 12 juin 2027");
});

test("times read and write as HH:MM and display the French way", () => {
  assert.deepEqual(parseIsoTime("09:05"), { hours: 9, minutes: 5 });
  assert.equal(parseIsoTime("24:00"), null);
  assert.equal(parseIsoTime("18:60"), null);
  assert.equal(parseIsoTime("9:05"), null);
  assert.equal(parseIsoTime(""), null);
  assert.equal(toIsoTime(9, 5), "09:05");
  assert.equal(formatTime("18:30"), "18 h 30");
  assert.equal(formatTime("09:00"), "9 h");
  assert.equal(formatTime("00:05"), "0 h 05");
  assert.deepEqual(minuteSteps(15), [0, 15, 30, 45]);
  assert.equal(minuteSteps(5).length, 12);
  assert.deepEqual(minuteSteps(60), [0]);
  assert.deepEqual(minuteSteps(0), minuteSteps(1));
});

test("the city list is unique, sorted the French way and checked exactly", () => {
  assert.equal(new Set(moroccanCities).size, moroccanCities.length);
  assert.deepEqual([...moroccanCities].sort((a, b) => a.localeCompare(b, "fr")), moroccanCities);
  assert.ok(moroccanCities.includes("Casablanca"));
  assert.ok(isMoroccanCity("Fès"));
  assert.ok(!isMoroccanCity("fes"));
  assert.ok(!isMoroccanCity(""));
});

const items = [
  { label: "Chaise de réception" },
  { label: "Arche décorative", disabled: true },
  { label: "Table de réception" },
  { label: "Éclairage d’ambiance" },
  { label: "Écran & affichage" },
];

test("keyboard movement skips disabled items and stops or wraps at the edges", () => {
  assert.equal(moveIndex(items, -1, 1), 0);
  assert.equal(moveIndex(items, -1, -1), 4);
  assert.equal(moveIndex(items, 0, 1), 2);
  assert.equal(moveIndex(items, 2, -1), 0);
  assert.equal(moveIndex(items, 4, 1), 4);
  assert.equal(moveIndex(items, 4, 1, true), 0);
  assert.equal(moveIndex(items, 0, -1, true), 4);
  assert.equal(moveIndex(items, 0, 10), 4);
  assert.equal(moveIndex([{ disabled: true }], -1, 1), -1);
});

test("type-ahead ignores accents and cycles on a repeated letter", () => {
  assert.equal(normalizeText("Éclairage"), "eclairage");
  assert.equal(matchTypeahead(items, "e", -1), 3);
  assert.equal(matchTypeahead(items, "e", 3), 4);
  assert.equal(matchTypeahead(items, "ee", 4), 3);
  assert.equal(matchTypeahead(items, "ecr", 3), 4);
  assert.equal(matchTypeahead(items, "t", 0), 2);
  assert.equal(matchTypeahead(items, "a", 0), -1);
});

test('dropdown search matches labels and descriptions without accents or case', () => {
  const options = [
    { value: 'light', label: 'Éclairage', description: 'Lumière chaude' },
    { value: 'chair', label: 'Chaise', description: 'Finition dorée' },
    { value: 'disabled', label: 'Écran', disabled: true },
  ];
  assert.equal(filterOptions(options, '   '), options);
  assert.deepEqual(filterOptions(options, 'ECLAIRAGE chaude'), [options[0]]);
  assert.deepEqual(filterOptions(options, 'doree'), [options[1]]);
  assert.deepEqual(filterOptions(options, 'introuvable'), []);
  assert.deepEqual(filterOptions(options, 'ecran'), [options[2]]);
  assert.equal(moveIndex([], 4, 1), -1);
  assert.equal(moveIndex(filterOptions(options, 'ecran'), -1, 1), -1);
});
