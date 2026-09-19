'use client';

import { useCallback, useEffect, useRef } from 'react';

/** Délai au-delà duquel une nouvelle frappe démarre une nouvelle recherche. */
const RESET_AFTER = 600;

/**
 * Mémorise les caractères tapés rapidement dans une liste, pour aller
 * directement à « Table de réception » en tapant « tab ».
 */
export function useTypeahead() {
  const buffer = useRef('');
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  /** Ajoute une frappe et renvoie la recherche en cours. */
  const type = useCallback((key: string) => {
    window.clearTimeout(timer.current);
    buffer.current += key;
    timer.current = window.setTimeout(() => {
      buffer.current = '';
    }, RESET_AFTER);
    return buffer.current;
  }, []);

  /** Une recherche est en cours : l'espace fait alors partie de la saisie. */
  const typing = useCallback(() => buffer.current !== '', []);
  const reset = useCallback(() => {
    window.clearTimeout(timer.current);
    buffer.current = '';
  }, []);

  return { type, typing, reset };
}
