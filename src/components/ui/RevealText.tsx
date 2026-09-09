'use client';

import { useRef, type ReactNode, type RefObject } from 'react';
import { gsap, MOTION, revealSafe, SplitText, useGSAP } from '@/lib/motion';

type RevealTextProps = {
  children: ReactNode;
  /** Balise rendue — le composant n'impose aucun niveau de titre. */
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'div';
  className?: string;
  id?: string;
  /** Retard avant le départ, en secondes. */
  delay?: number;
  /** Déclenche à l'entrée dans le champ (défaut) ou dès le montage. */
  trigger?: 'scroll' | 'mount';
};

/**
 * Titre dévoilé ligne par ligne, chaque ligne remontant derrière son propre
 * masque. C'est le geste éditorial signature d'AURÉLYS : on l'utilise sur les
 * titres de section et la promesse d'accueil, jamais sur un paragraphe long
 * (au-delà de quelques lignes, la lecture devient laborieuse).
 *
 * Le texte reste un nœud de texte normal dans le HTML servi : le découpage
 * n'existe qu'après hydratation, et il est défait au démontage. Les lecteurs
 * d'écran et les moteurs d'indexation voient donc la phrase entière.
 */
export default function RevealText({
  children,
  as = 'div',
  className,
  id,
  delay = 0,
  trigger = 'scroll',
}: RevealTextProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () =>
      revealSafe(ref, (full) => {
        const el = ref.current;
        // Mouvement réduit : le texte reste tel quel, aucun découpage.
        if (!el || !full) return;

        const split = SplitText.create(el, {
          type: 'lines',
          // Chaque ligne reçoit un conteneur à débordement masqué : elle peut
          // donc surgir « de sous le filet » plutôt que de glisser à découvert.
          mask: 'lines',
          linesClass: 'reveal-line',
          // Re-découpe après le chargement des polices et à chaque changement
          // de largeur : sans cela, les retours à la ligne seraient figés sur
          // la police de substitution ou sur la largeur initiale.
          autoSplit: true,
          onSplit: (self) =>
            gsap.fromTo(
              self.lines,
              {
                // 125 % plutôt que 100 : le masque est un peu plus haut que la
                // ligne (marge réservée aux jambages), il faut donc dépasser sa
                // hauteur pour que la ligne en sorte complètement.
                yPercent: 125,
              },
              {
                yPercent: 0,
                duration: 1.1,
                delay,
                ease: 'power4.out',
                stagger: 0.09,
                scrollTrigger:
                  trigger === 'scroll'
                    ? { trigger: el, start: MOTION.start, once: true }
                    : undefined,
              },
            ),
        });

        return () => split.revert();
      }),
    { scope: ref, dependencies: [delay, trigger], revertOnUpdate: true },
  );

  // Toutes les balises admises acceptent les mêmes attributs : un seul alias
  // suffit à réconcilier l'union avec la signature JSX.
  const Tag = as as 'div';

  return (
    <Tag ref={ref as RefObject<HTMLDivElement | null>} id={id} className={className}>
      {children}
    </Tag>
  );
}
