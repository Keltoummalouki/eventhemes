'use client';

import { useRef } from 'react';
import { gsap, revealSafe, useGSAP } from '@/lib/motion';

type StatCounterProps = {
  value: number;
  suffix: string;
  className?: string;
};

/** Durée du décompte, en secondes. */
const COUNT_SECONDS = 2.2;

/**
 * Chiffre clé qui se compte à l'entrée dans le champ.
 *
 * Le décompte est écrit directement dans le nœud de texte plutôt que via un
 * état React : à soixante images par seconde et quatre compteurs simultanés,
 * un rendu par image coûterait bien plus cher que le résultat ne le vaut. Le
 * composant ne se réaffiche jamais après son montage, React ne réconcilie donc
 * jamais ce nœud. Le HTML servi porte d'emblée la valeur finale : sans
 * JavaScript, le chiffre juste est là.
 *
 * Le suffixe (« + ») est ajouté en CSS via `content: attr(data-suffix)`.
 */
export default function StatCounter({ value, suffix, className }: StatCounterProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () =>
      revealSafe(ref, (full) => {
        const cell = ref.current;
        // Mouvement réduit : la valeur finale est déjà affichée, rien à faire.
        if (!cell || !full) return;

        const counter = { current: 0 };
        cell.textContent = '0';

        gsap.to(counter, {
          current: value,
          duration: COUNT_SECONDS,
          ease: 'power2.out',
          // Paliers entiers : aucune décimale ne doit apparaître en chemin.
          snap: { current: 1 },
          onUpdate: () => {
            cell.textContent = String(Math.round(counter.current));
          },
          scrollTrigger: { trigger: cell, start: 'top 88%', once: true },
        });

        // Démontage, ou passage en mouvement réduit pendant le décompte : le
        // chiffre ne doit jamais rester figé sur une valeur intermédiaire.
        return () => {
          cell.textContent = String(value);
        };
      }),
    { scope: ref, dependencies: [value], revertOnUpdate: true },
  );

  return (
    <div ref={ref} className={className} data-suffix={suffix}>
      {value}
    </div>
  );
}
