/* ==========================================================================
   Couleurs — logique pure de <ColorInput> : validation d'une teinte
   « #rrggbb » et nom de la teinte connue la plus proche.
   ========================================================================== */

import { colorNames } from '@/data/colors';

/** Teinte au format « #rrggbb » (celui de <input type="color">). */
export function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);
}

function channels(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * Distance « redmean » : une approximation de l'écart perçu, bien meilleure
 * qu'une distance RVB brute et sans conversion vers un espace Lab.
 */
function distance(a: string, b: string): number {
  const [r1, g1, b1] = channels(a);
  const [r2, g2, b2] = channels(b);
  const mean = (r1 + r2) / 2;
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return (2 + mean / 256) * dr * dr + 4 * dg * dg + (2 + (255 - mean) / 256) * db * db;
}

/** Nom de la teinte connue la plus proche : « #d4af37 » → « Doré ». */
export function nearestColorName(hex: string): string {
  let best = colorNames[0];
  for (const color of colorNames)
    if (distance(hex, color.hex) < distance(hex, best.hex)) best = color;
  return best.name;
}
