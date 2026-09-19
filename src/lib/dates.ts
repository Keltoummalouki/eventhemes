/* ==========================================================================
   Dates calendaires — logique pure du sélecteur de date

   Toutes les valeurs échangées avec les formulaires sont des chaînes
   « AAAA-MM-JJ » : le format de <input type="date">, lisible par le serveur
   et insensible aux fuseaux horaires. Les objets Date ne servent qu'au calcul
   et sont toujours construits à minuit, heure locale.
   ========================================================================== */

/** Date calendaire au format « AAAA-MM-JJ ». Chaîne vide : aucune date. */
export type IsoDate = string;

export const DATE_LOCALE = 'fr-FR';

const ISO_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Lit une date « AAAA-MM-JJ ». Renvoie `null` si elle est absente ou impossible (31 février…). */
export function parseIsoDate(value: string | null | undefined): Date | null {
  const match = value ? ISO_PATTERN.exec(value) : null;
  if (!match) return null;
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(year, month - 1, day);
  // Date corrige silencieusement les débordements : on refuse plutôt que de deviner.
  return date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}

export function toIsoDate(date: Date): IsoDate {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Aujourd'hui, selon l'horloge locale du visiteur (et non en UTC). */
export function today(now = new Date()): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function addDays(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

/** Ajoute des mois en restant dans le mois visé : 31 janvier + 1 mois → fin février. */
export function addMonths(date: Date, amount: number): Date {
  const target = new Date(date.getFullYear(), date.getMonth() + amount, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(date.getDate(), lastDay));
  return target;
}

export function isSameDay(a: Date | null, b: Date | null): boolean {
  return !!a && !!b && a.getTime() === b.getTime();
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/** Lundi de la semaine : le calendrier français commence le lundi. */
export function startOfWeek(date: Date): Date {
  return addDays(date, -((date.getDay() + 6) % 7));
}

export function endOfWeek(date: Date): Date {
  return addDays(startOfWeek(date), 6);
}

export function isOutOfRange(date: Date, min: Date | null, max: Date | null): boolean {
  return (!!min && date < min) || (!!max && date > max);
}

export function clampDate(date: Date, min: Date | null, max: Date | null): Date {
  if (min && date < min) return min;
  if (max && date > max) return max;
  return date;
}

/**
 * Les 42 jours affichés pour un mois : six semaines complètes, du lundi
 * précédant le 1er. Une hauteur fixe évite que le calendrier ne saute d'un
 * mois à l'autre.
 */
export function monthGrid(month: Date): Date[][] {
  const first = startOfWeek(new Date(month.getFullYear(), month.getMonth(), 1));
  return Array.from({ length: 6 }, (_, week) =>
    Array.from({ length: 7 }, (_, day) => addDays(first, week * 7 + day)),
  );
}

/** Noms des jours, du lundi au dimanche : abrégé pour l'en-tête, complet pour les lecteurs d'écran. */
export function weekdayNames(locale = DATE_LOCALE) {
  const short = new Intl.DateTimeFormat(locale, { weekday: 'short' });
  const long = new Intl.DateTimeFormat(locale, { weekday: 'long' });
  // 5 janvier 2026 est un lundi.
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(2026, 0, 5 + i);
    return { short: short.format(day).replace('.', ''), long: long.format(day) };
  });
}

/** « samedi 12 juin 2027 » */
export function formatLongDate(date: Date, locale = DATE_LOCALE): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/** « juin 2027 » */
export function formatMonth(date: Date, locale = DATE_LOCALE): string {
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(date);
}

/* --- Heures ---------------------------------------------------------------- */

/** Heure au format « HH:MM » sur 24 h, celui d'<input type="time">. Chaîne vide : aucune heure. */
export type IsoTime = string;

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Lit une heure « HH:MM ». Renvoie `null` si elle est absente ou impossible (24:00, 18:60…). */
export function parseIsoTime(value: string | null | undefined): { hours: number; minutes: number } | null {
  const match = value ? TIME_PATTERN.exec(value) : null;
  return match ? { hours: Number(match[1]), minutes: Number(match[2]) } : null;
}

export function toIsoTime(hours: number, minutes: number): IsoTime {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/** Minutes proposées toutes les `step` minutes : 15 → 0, 15, 30, 45. */
export function minuteSteps(step: number): number[] {
  const size = Math.min(60, Math.max(1, Math.round(step) || 1));
  return Array.from({ length: Math.ceil(60 / size) }, (_, i) => i * size);
}

/** « 18 h 30 », « 9 h » : l'usage typographique français, espaces insécables. */
export function formatTime(value: IsoTime): string {
  const time = parseIsoTime(value);
  if (!time) return value;
  const minutes = time.minutes ? ` ${String(time.minutes).padStart(2, '0')}` : '';
  return `${time.hours} h${minutes}`;
}
