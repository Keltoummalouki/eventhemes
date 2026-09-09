'use client';

import { useEffect, useState } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useReveal } from '@/hooks/useReveal';

type StatCounterProps = {
  value: number;
  suffix: string;
  className?: string;
};

/** Nombre de paliers visés pour atteindre la valeur finale. */
const STEPS = 60;
/** Intervalle entre deux paliers, en millisecondes. */
const TICK_MS = 24;

/**
 * Compteur qui s'incrémente lorsque la cellule est à moitié visible.
 * Le suffixe (« + ») est ajouté en CSS via `content: attr(data-suffix)`.
 */
export default function StatCounter({ value, suffix, className }: StatCounterProps) {
  const { ref, inView } = useReveal<HTMLDivElement>(0.5);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [counted, setCounted] = useState(0);

  // Mouvement réduit : la valeur finale est affichée d'emblée, sans décompte.
  const displayed = prefersReducedMotion ? (inView ? value : 0) : counted;

  useEffect(() => {
    if (!inView || prefersReducedMotion) return;

    const step = Math.max(1, Math.round(value / STEPS));
    let current = 0;

    const timer = window.setInterval(() => {
      current += step;
      if (current >= value) {
        current = value;
        window.clearInterval(timer);
      }
      setCounted(current);
    }, TICK_MS);

    return () => window.clearInterval(timer);
  }, [inView, prefersReducedMotion, value]);

  return (
    <div ref={ref} className={className} data-suffix={suffix}>
      {displayed}
    </div>
  );
}
