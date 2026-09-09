'use client';

import { useRef, type ReactNode } from 'react';
import { cx } from '@/lib/cx';
import { gsap, MOTION, revealSafe, useGSAP } from '@/lib/motion';

type RevealProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  /**
   * Décale l'apparition des enfants directs les uns après les autres, au lieu
   * de faire monter le bloc d'un seul tenant. À réserver aux séries courtes
   * (une grille de quatre chiffres, trois colonnes) : au-delà de huit éléments
   * les derniers paraissent en retard.
   */
  stagger?: boolean;
  /** Retard supplémentaire avant le départ, en secondes. */
  delay?: number;
};

/**
 * Conteneur qui se dévoile en entrant dans le champ.
 *
 * L'état de départ (invisible, décalé vers le bas) est posé en CSS par la
 * classe `.reveal` : le bloc ne peut donc pas apparaître une fraction de
 * seconde avant que GSAP ne prenne la main. L'attribut `data-in` reste posé à
 * l'entrée — plusieurs modules (frise, séparateur) s'en servent pour animer
 * leurs propres ornements en CSS.
 */
export default function Reveal({
  children,
  className,
  id,
  stagger = false,
  delay = 0,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () =>
      revealSafe(ref, (full) => {
        const block = ref.current;
        if (!block) return;
        const items = Array.from(block.children);

        // Mouvement réduit : on affiche, sans jouer quoi que ce soit.
        if (!full) {
          block.setAttribute('data-in', '');
          gsap.set([block, ...items], { opacity: 1, y: 0 });
          return;
        }

        if (stagger) {
          // Le bloc porteur ne bouge pas : ce sont ses enfants qui entrent.
          gsap.set(block, { opacity: 1, y: 0 });
          block.setAttribute('data-in', '');

          // `fromTo` et non `from` : l'état d'arrivée est déclaré, jamais
          // déduit du DOM. Une seconde exécution de l'effet — mode strict de
          // React, rechargement à chaud — relirait sinon l'opacité 0 posée par
          // la première et animerait de 0 vers 0.
          gsap.fromTo(
            items,
            { opacity: 0, y: MOTION.rise },
            {
              opacity: 1,
              y: 0,
              duration: MOTION.duration,
              delay,
              ease: MOTION.ease,
              stagger: MOTION.stagger,
              scrollTrigger: { trigger: block, start: MOTION.start, once: true },
            },
          );
          return;
        }

        gsap.to(block, {
          opacity: 1,
          y: 0,
          duration: MOTION.duration,
          delay,
          ease: MOTION.ease,
          scrollTrigger: {
            trigger: block,
            start: MOTION.start,
            once: true,
            onEnter: () => block.setAttribute('data-in', ''),
          },
        });
      }),
    { scope: ref, dependencies: [stagger, delay], revertOnUpdate: true },
  );

  return (
    <div ref={ref} id={id} className={cx('reveal', className)}>
      {children}
    </div>
  );
}
