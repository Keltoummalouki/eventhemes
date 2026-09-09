'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Index courant d'un carrousel à défilement automatique.
 *
 * Le minuteur est relancé à chaque changement d'index : une sélection manuelle
 * laisse donc un cycle complet avant l'enchaînement suivant.
 */
export function useCarousel(length: number, intervalMs: number) {
  const [index, setIndex] = useState(0);

  const goTo = useCallback(
    (next: number) => {
      if (length <= 0) return;
      setIndex(((next % length) + length) % length);
    },
    [length],
  );

  useEffect(() => {
    if (length <= 1 || intervalMs <= 0) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % length), intervalMs);
    return () => window.clearInterval(timer);
  }, [length, intervalMs, index]);

  return { index, goTo };
}
