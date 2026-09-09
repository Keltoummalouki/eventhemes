'use client';

import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onStoreChange: () => void): () => void {
  const mediaQuery = window.matchMedia(QUERY);
  mediaQuery.addEventListener('change', onStoreChange);
  return () => mediaQuery.removeEventListener('change', onStoreChange);
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches;
}

/** Côté serveur, on part du principe que le mouvement est autorisé. */
function getServerSnapshot(): boolean {
  return false;
}

/**
 * Préférence système « mouvement réduit ».
 *
 * Le CSS neutralise déjà transitions et animations ; ce hook sert aux
 * animations pilotées en JavaScript (compteurs de statistiques), que le CSS ne
 * peut pas désactiver.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
