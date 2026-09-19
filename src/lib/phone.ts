/* ==========================================================================
   Téléphone — logique pure de <PhoneInput>.

   Le visiteur choisit un pays (le Maroc par défaut) puis saisit son numéro,
   avec ou sans le préfixe national : « 06 12 34 56 78 » ou « 6 12 34 56 78 ».
   Une saisie commençant par « + » ou « 00 » désigne elle-même son pays :
   « +33 6 12 34 56 78 » passe en France.

   La valeur transmise au formulaire est toujours internationale et lisible :
   « +212 6 12 34 56 78 », compatible avec la validation serveur.
   ========================================================================== */

import { defaultPhoneCountry, phoneCountries, type PhoneCountry } from '@/data/phoneCountries';
import type { NavigableItem } from '@/lib/listNavigation';

export type { PhoneCountry };

/** Langue des noms de pays ; l'anglais sert en plus à la recherche. */
export const PHONE_LOCALE = 'fr-FR';

const byIso = new Map(phoneCountries.map((country) => [country.iso, country]));

/** Pays principal de chaque indicatif : le premier listé (US pour +1). */
const byDial = new Map<string, PhoneCountry>();
for (const country of phoneCountries) {
  if (!byDial.has(country.dial)) byDial.set(country.dial, country);
}

export function findCountry(iso: string): PhoneCountry | undefined {
  return byIso.get(iso.toUpperCase());
}

export const DEFAULT_COUNTRY: PhoneCountry = findCountry(defaultPhoneCountry) ?? phoneCountries[0];

/**
 * Pays d'un numéro écrit avec son indicatif (« 33612… » → France). Les
 * indicatifs ne sont jamais préfixes l'un de l'autre : le premier trouvé est
 * le bon. À indicatif partagé, `preferred` (le pays déjà choisi) l'emporte.
 */
export function countryByDial(digits: string, preferred?: PhoneCountry): PhoneCountry | undefined {
  for (let size = 1; size <= Math.min(3, digits.length); size++) {
    const dial = digits.slice(0, size);
    if (preferred?.dial === dial) return preferred;
    const country = byDial.get(dial);
    if (country) return country;
  }
  return undefined;
}

/** Longueur et premier chiffre plausibles pour ce pays. */
function isPossible(country: PhoneCountry, national: string): boolean {
  return (
    country.lengths.includes(national.length) &&
    (!country.lead || country.lead.includes(national[0]))
  );
}

/** Retire le préfixe national (« 06… » → « 6… »), sauf s'il fait partie du numéro. */
function stripTrunk(country: PhoneCountry, digits: string): string {
  const { trunk } = country;
  if (!trunk || !digits.startsWith(trunk)) return digits;
  const stripped = digits.slice(trunk.length);
  return isPossible(country, digits) && !isPossible(country, stripped) ? digits : stripped;
}

/** Texte qui suit les `count` premiers chiffres (« +33 6 12 », 2 → « 6 12 »). */
function afterDigits(text: string, count: number): string {
  let index = 0;
  for (let seen = 0; index < text.length && seen < count; index++) {
    if (/\d/.test(text[index])) seen++;
  }
  return text.slice(index).replace(/^[\s)-]+/, '');
}

/**
 * Découpe un numéro national comme dans son pays (« 6 12 34 56 78 »). Un
 * numéro en cours de saisie est découpé au fil des chiffres ; au-delà du
 * modèle, les chiffres restent groupés.
 */
export function formatNational(country: PhoneCountry, digits: string): string {
  const { groups } = country;
  if (!groups || digits.length > groups.reduce((sum, size) => sum + size, 0)) return digits;
  const parts: string[] = [];
  for (let at = 0, group = 0; at < digits.length; at += groups[group++]) {
    parts.push(digits.slice(at, at + groups[group]));
  }
  return parts.join(' ');
}

export type ParsedPhone = {
  /** Pays retenu : celui de l'indicatif saisi, sinon celui choisi. */
  country: PhoneCountry;
  /** Numéro national, chiffres seuls, sans préfixe national. */
  national: string;
  /** Saisie écrite avec son indicatif, après « + » ou « 00 ». */
  dialed: boolean;
  /** Saisie située après l'indicatif (« +33 6 12 » → « 6 12 »). */
  rest: string;
  /** « + » ou « 00 » suivi d'un indicatif encore incomplet (« +3 »). */
  pending: boolean;
  /** Valeur normalisée transmise au formulaire (« » si vide). */
  value: string;
  /** Numéro de longueur plausible, prêt à l'envoi. */
  complete: boolean;
};

export function parsePhone(text: string, country: PhoneCountry = DEFAULT_COUNTRY): ParsedPhone {
  const trimmed = text.trim();
  const digits = trimmed.replace(/\D/g, '');
  let national = digits;
  let rest = trimmed;
  const dialed = trimmed.startsWith('+') || digits.startsWith('00');

  if (dialed) {
    const withCode = trimmed.startsWith('+') ? digits : digits.slice(2);
    const found = countryByDial(withCode, country);
    if (!found) {
      return { country, national: '', dialed, rest: '', pending: true, value: '', complete: false };
    }
    country = found;
    national = withCode.slice(found.dial.length);
    rest = afterDigits(trimmed, digits.length - national.length);
  }

  national = stripTrunk(country, national);
  return {
    country,
    national,
    dialed,
    rest,
    pending: false,
    value: national ? `+${country.dial} ${formatNational(country, national)}` : '',
    complete: isPossible(country, national),
  };
}

/** Pays et texte affiché dans le champ pour une valeur reçue du formulaire. */
export function formatPhone(
  value: string,
  country?: PhoneCountry,
): { country: PhoneCountry; text: string } {
  const phone = parsePhone(value, country);
  return { country: phone.country, text: formatNational(phone.country, phone.national) };
}

/** Numéro de téléphone plausible, écrit avec son indicatif ou pour `country`. */
export function isValidPhone(value: string, country?: PhoneCountry): boolean {
  return parsePhone(value, country).complete;
}

/** Caractères acceptés à la frappe ; les points deviennent des espaces. */
export function sanitizePhone(text: string): string {
  return text.replace(/\./g, ' ').replace(/[^\d\s+()-]/g, '').replace(/(?!^)\+/g, '');
}

/** Numéro d'exemple du pays, découpé comme une saisie (placeholder). */
export function phoneExample(country: PhoneCountry): string {
  return country.example ? formatNational(country, country.example) : '';
}

/** Drapeau émoji d'un code ISO (« MA » → 🇲🇦). */
export function flagEmoji(iso: string): string {
  return String.fromCodePoint(...[...iso.toUpperCase()].map((char) => 0x1f1a5 + char.charCodeAt(0)));
}

export type CountryOption = NavigableItem & {
  country: PhoneCountry;
  /** Nom du pays dans la langue du site. */
  label: string;
  /** Termes de recherche : indicatif, code ISO et nom anglais. */
  description: string;
};

const optionCache = new Map<string, readonly CountryOption[]>();

/** Pays triés par nom, pour la liste de <PhoneInput>. */
export function countryOptions(locale = PHONE_LOCALE): readonly CountryOption[] {
  const cached = optionCache.get(locale);
  if (cached) return cached;
  const names = new Intl.DisplayNames([locale], { type: 'region', fallback: 'code' });
  const english = new Intl.DisplayNames(['en'], { type: 'region', fallback: 'code' });
  const options = phoneCountries
    .map((country) => ({
      country,
      label: names.of(country.iso) ?? country.iso,
      description: `+${country.dial} ${country.iso} ${english.of(country.iso) ?? ''}`,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, locale));
  optionCache.set(locale, options);
  return options;
}

/** Nom d'un pays dans la langue du site. */
export function countryName(country: PhoneCountry, locale = PHONE_LOCALE): string {
  return countryOptions(locale).find((option) => option.country === country)?.label ?? country.iso;
}
