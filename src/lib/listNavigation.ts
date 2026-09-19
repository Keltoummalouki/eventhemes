/* ==========================================================================
   Navigation clavier dans une liste — logique pure partagée par <Select>
   (liste d'options) et <Dropdown> (menu d'actions).
   ========================================================================== */

export type NavigableItem = { label: string; disabled?: boolean };

/**
 * Index atteint en se déplaçant de `delta` depuis `from`, en sautant les
 * éléments désactivés. `from = -1` signifie « aucun élément actif » : un pas
 * vers le bas mène au premier élément, un pas vers le haut au dernier.
 *
 * Sans `wrap`, le déplacement s'arrête au bord de la liste. Renvoie -1 si
 * aucun élément n'est sélectionnable.
 */
export function moveIndex(
  items: readonly { disabled?: boolean }[],
  from: number,
  delta: number,
  wrap = false,
): number {
  const count = items.length;
  if (!count) return -1;
  if (!delta) return from;
  const step = delta > 0 ? 1 : -1;
  const target = from < 0 ? (step > 0 ? delta - 1 : count + delta) : from + delta;
  const start = wrap
    ? ((target % count) + count) % count
    : Math.min(count - 1, Math.max(0, target));

  for (let i = 0; i < count; i++) {
    const index = wrap ? (((start + i * step) % count) + count) % count : start + i * step;
    if (index < 0 || index >= count) break;
    if (!items[index].disabled) return index;
  }
  // Bord de liste atteint sur des éléments désactivés : on garde le plus proche.
  for (let index = start - step; index >= 0 && index < count; index -= step) {
    if (!items[index].disabled) return index;
  }
  return -1;
}

/** Texte comparable : sans accents ni casse (« Éclairage » ≡ « eclairage »). */
export function normalizeText(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** Accent-insensitive search over labels and descriptions; preserve order and item identity. */
export function filterOptions<T extends { label: string; description?: string }>(
  options: readonly T[], query: string,
): readonly T[] {
  const words = normalizeText(query).trim().split(/\s+/).filter(Boolean);
  if (!words.length) return options;
  return options.filter(option => {
    const text = normalizeText(`${option.label} ${option.description ?? ''}`);
    return words.every(word => text.includes(word));
  });
}

/**
 * Recherche à la frappe : premier élément dont le libellé commence par la
 * saisie. Comme dans une liste native, une même lettre répétée fait défiler
 * les éléments qui commencent par elle.
 */
export function matchTypeahead(
  items: readonly NavigableItem[],
  query: string,
  from: number,
): number {
  const search = normalizeText(query);
  if (!search || !items.length) return -1;
  const repeated = [...search].every((char) => char === search[0]);
  const prefix = repeated ? search[0] : search;
  // Une saisie qui s'allonge peut rester sur l'élément actif ; une lettre seule passe au suivant.
  const start = from < 0 ? 0 : from + (repeated ? 1 : 0);

  for (let i = 0; i < items.length; i++) {
    const index = (start + i) % items.length;
    const item = items[index];
    if (!item.disabled && normalizeText(item.label).startsWith(prefix)) return index;
  }
  return -1;
}
