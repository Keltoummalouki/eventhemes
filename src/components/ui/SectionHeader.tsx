'use client';

import { useRef, type ReactNode } from 'react';
import { cx } from '@/lib/cx';
import { gsap, MOTION, revealSafe, useGSAP } from '@/lib/motion';
import Eyebrow from './Eyebrow';
import RevealText from './RevealText';
import styles from './SectionHeader.module.css';

type SectionHeaderProps = {
  eyebrow: string;
  /** Titre de section ; un `<em>` y prend l'italique doré de la charte. */
  title: ReactNode;
  description?: ReactNode;
  centered?: boolean;
  /** Identifiant du titre, pour les `aria-labelledby` des sections. */
  titleId?: string;
  /** Lien ou bouton aligné à droite du titre (« Voir tout »). */
  action?: ReactNode;
  /** Niveau du titre : `h1` lorsque la section ouvre une page. */
  as?: 'h1' | 'h2';
  className?: string;
};

/** Retard du titre : le filet doré part en premier, le titre lui répond. */
const TITLE_DELAY = 0.18;

/**
 * En-tête commun à toutes les sections.
 *
 * Les éléments entrent dans l'ordre où on les lit : le filet doré du sur-titre
 * se dessine, le titre monte ligne par ligne, le chapô et l'action suivent. Ce
 * même enchaînement se répète à chaque section : c'est lui qui donne à la page
 * son rythme, plutôt qu'une succession d'effets sans parenté.
 */
export default function SectionHeader({
  eyebrow,
  title,
  description,
  centered = false,
  titleId,
  action,
  as = 'h2',
  className,
}: SectionHeaderProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () =>
      revealSafe(ref, (full) => {
        const head = ref.current;
        if (!head) return;
        const find = gsap.utils.selector(head);
        const rule = find(`.${styles.eyebrow}`);
        const after = find(`.${styles.lede}, .${styles.action}`);

        if (!full) {
          gsap.set([...rule, ...after], { autoAlpha: 1, y: 0 });
          return;
        }

        // Toujours `fromTo` : l'état d'arrivée est déclaré, pas relevé dans le
        // DOM. Une seconde exécution de l'effet (mode strict, rechargement à
        // chaud) partirait sinon de l'état masqué laissé par la première.
        gsap
          .timeline({ scrollTrigger: { trigger: head, start: MOTION.start, once: true } })
          .fromTo(
            rule,
            { '--eyebrow-rule': 0, autoAlpha: 0 },
            { '--eyebrow-rule': 1, autoAlpha: 1, duration: 0.85, ease: MOTION.ease },
          )
          .fromTo(
            after,
            { autoAlpha: 0, y: 22 },
            { autoAlpha: 1, y: 0, duration: MOTION.duration, ease: MOTION.ease, stagger: 0.12 },
            TITLE_DELAY + 0.35,
          );
      }),
    { scope: ref },
  );

  return (
    <div
      ref={ref}
      className={cx(styles.head, centered && styles.centered, action ? styles.withAction : undefined, className)}
    >
      <div className={styles.text}>
        <Eyebrow centered={centered} className={styles.eyebrow}>
          {eyebrow}
        </Eyebrow>
        <RevealText as={as} id={titleId} delay={TITLE_DELAY} className={styles.title}>
          {title}
        </RevealText>
        {description ? <p className={styles.lede}>{description}</p> : null}
      </div>
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
