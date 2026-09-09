'use client';

/**
 * Relais entre le rideau d'ouverture et le reste de la page.
 *
 * Le <Hero> ne doit pas jouer son animation d'entrée pendant que les panneaux
 * du rideau la masquent encore. Plutôt que de dupliquer une durée dans deux
 * composants — qui se désynchroniserait au premier réglage — le rideau signale
 * lui-même son ouverture, et les sections concernées s'y abonnent.
 */

let opened = false;
const waiting = new Set<() => void>();

/** Appelé par <Curtain> lorsque les panneaux ont fini de s'écarter. */
export function openCurtain() {
  if (opened) return;
  opened = true;
  for (const notify of waiting) notify();
  waiting.clear();
}

/**
 * S'abonne à l'ouverture du rideau.
 *
 * Si elle a déjà eu lieu — navigation arrière, remontage d'un composant —
 * le rappel est exécuté immédiatement : personne n'attend un signal passé.
 * Renvoie une fonction de désabonnement.
 */
export function onCurtainOpen(notify: () => void) {
  if (opened) {
    notify();
    return () => {};
  }
  waiting.add(notify);
  return () => {
    waiting.delete(notify);
  };
}
