'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Apparition au défilement.
 *
 * Reprend le comportement de la maquette : un IntersectionObserver de seuil
 * 0.18 qui marque l'élément une seule fois, puis cesse de l'observer.
 */
export function useReveal<T extends HTMLElement>(threshold = 0.18) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}
