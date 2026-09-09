/**
 * Logique métier du simulateur de budget.
 *
 * Séparée de l'interface pour rester testable et facile à faire évoluer
 * (grille tarifaire réelle, coefficients par type de lieu, etc.).
 *
 *   base  = 8000 + invités × 95 + nbServices × 3200
 *   total = base × coefficient du niveau de prestation
 *
 * Le résultat est arrondi au multiple de 500 MAD le plus proche.
 * Il s'agit d'une estimation indicative, jamais d'un devis contractuel.
 */

export const PRICING = {
  /** Forfait de départ, en MAD. */
  base: 8000,
  /** Coût indicatif par invité, en MAD. */
  perGuest: 95,
  /** Coût indicatif par prestation sélectionnée, en MAD. */
  perService: 3200,
  /** Pas d'arrondi de l'estimation affichée, en MAD. */
  rounding: 500,
} as const;

export type BudgetInput = {
  guests: number;
  servicesCount: number;
  levelMultiplier: number;
};

/** Estimation de budget arrondie au multiple de 500 MAD le plus proche. */
export function estimateBudget({ guests, servicesCount, levelMultiplier }: BudgetInput): number {
  const base = PRICING.base + guests * PRICING.perGuest + servicesCount * PRICING.perService;
  return Math.round((base * levelMultiplier) / PRICING.rounding) * PRICING.rounding;
}

/**
 * Espace fine insécable : c'est le séparateur de milliers que renvoie
 * `Number.toLocaleString('fr-FR')`. On l'écrit explicitement pour garantir un
 * rendu strictement identique côté serveur et côté client (pas de dépendance à
 * l'ICU de l'environnement, donc pas d'erreur d'hydratation).
 */
const NARROW_NO_BREAK_SPACE = ' ';

/** Met en forme un montant à la française (« 32 000 MAD »). */
export function formatMAD(amount: number): string {
  const grouped = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, NARROW_NO_BREAK_SPACE);
  return `${grouped} MAD`;
}
