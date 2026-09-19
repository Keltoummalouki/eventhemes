/* ==========================================================================
   Saisie numérique — logique pure de <NumberInput> : lecture d'une saisie
   française (« 1 250,50 »), affichage, bornes et pas.
   ========================================================================== */

export type NumberBounds = { min?: number; max?: number };

/** Nombre de décimales d'un pas : 0.01 → 2, 1 → 0, 1e-3 → 3. */
export function decimalsOf(step: number): number {
  if (!Number.isFinite(step) || Number.isInteger(step)) return 0;
  const [mantissa, exponent] = step.toString().split('e-');
  const fraction = mantissa.split('.')[1]?.length ?? 0;
  return fraction + (exponent ? Number(exponent) : 0);
}

/** Arrondit à `decimals` chiffres sans les erreurs binaires (0.1 + 0.2). */
export function roundTo(value: number, decimals: number): number {
  return Number(value.toFixed(decimals));
}

export function clampNumber(value: number, { min, max }: NumberBounds): number {
  if (min !== undefined && value < min) return min;
  if (max !== undefined && value > max) return max;
  return value;
}

/**
 * Lit une saisie libre : virgule ou point décimal, espaces de groupement
 * (y compris insécables). Renvoie `null` pour une saisie vide ou incomplète
 * (« - », « , »).
 */
export function parseNumber(text: string): number | null {
  const normalized = text.replace(/[\s  ]/g, '').replace(',', '.');
  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(normalized)) return null;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

/** Retire les caractères qu'aucun nombre ne contient, à la frappe. */
export function sanitizeNumber(text: string, { decimals, negative }: { decimals: number; negative: boolean }) {
  let allowed = text.replace(negative ? /[^\d\s  ,.-]/g : /[^\d\s  ,.]/g, '');
  if (!decimals) allowed = allowed.replace(/[,.]/g, '');
  return allowed;
}

/** Affichage français : « 1 250,5 ». Les décimales inutiles sont omises. */
export function formatNumber(value: number | null, decimals: number): string {
  if (value === null || !Number.isFinite(value)) return '';
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: decimals }).format(value);
}

/**
 * Valeur après un pas de `delta` (±1 pour les boutons et les flèches, ±10
 * pour Page↑ / Page↓). Un champ vide part du minimum, ou de zéro.
 */
export function stepNumber(
  value: number | null,
  delta: number,
  step: number,
  bounds: NumberBounds,
  decimals: number,
): number {
  const next =
    value === null
      ? Math.max(bounds.min ?? -Infinity, delta > 0 ? step : 0)
      : value + delta * step;
  return clampNumber(roundTo(next, decimals), bounds);
}
