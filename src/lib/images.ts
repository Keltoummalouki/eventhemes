/**
 * Fabriques d'URL d'images.
 *
 * Les visuels actuels proviennent de la maquette approuvée (Unsplash) et sont
 * volontairement isolés ici : pour basculer sur les photos réelles d'AURÉLYS,
 * il suffira de remplacer les identifiants dans `src/data/*` ou de réécrire
 * `unsplashPhoto` pour pointer vers `/public`.
 */

/** Visuel Unsplash à partir de son identifiant de photo. */
export function unsplashPhoto(photoId: string, width: number): string {
  return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=${width}&q=80`;
}

/** Visuel de repli déterministe si la source principale échoue. */
export function fallbackPhoto(seed: string, width: number, height: number): string {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}
