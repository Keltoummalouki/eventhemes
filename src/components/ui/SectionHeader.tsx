'use client';

import { useRef } from 'react';
import { cx } from '@/lib/cx';
import { gsap, MOTION, revealSafe, useGSAP } from '@/lib/motion';
import Eyebrow from './Eyebrow';
import RevealText from './RevealText';
import styles from './SectionHeader.module.css';

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  /** Variante centrée (section « Ils nous ont fait confiance »). */
  centered?: boolean;
  /** Identifiant du titre, pour les `aria-labelledby` des sections. */
  titleId?: string;
};

/** Retard du titre : le filet doré part en premier, le titre lui répond. */
const TITLE_DELAY = 0.18;

/**
 * En-tête commun à toutes les sections.
 *
 * Les trois éléments entrent dans l'ordre où on les lit : le filet doré du
 * sur-titre se dessine, le titre monte ligne par ligne, le chapô suit. Ce même
 * enchaînement se répète à chaque section — c'est lui qui donne à la page son
 * rythme, plutôt qu'une succession d'effets sans parenté.
 */
export default function SectionHeader({
  eyebrow,
  title,
  description,
  centered = false,
  titleId,
}: SectionHeaderProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () =>
      revealSafe(ref, (full) => {
        const head = ref.current;
        if (!head) return;
        const find = gsap.utils.selector(head);
        const rule = find(`.${styles.eyebrow}`);
        const lede = find(`.${styles.lede}`);

        if (!full) {
          gsap.set([...rule, ...lede], { autoAlpha: 1, y: 0 });
          return;
        }

        // Toujours `fromTo` : l'état d'arrivée est déclaré, pas relevé dans le
        // DOM. Une seconde exécution de l'effet (mode strict, rechargement à
        // chaud) partirait sinon de l'état masqué laissé par la première.
        gsap
          .timeline({ scrollTrigger: { trigger: head, start: MOTION.start, once: true } })
          .fromTo(
            rule,
            // Le filet se déploie depuis la gauche pendant que les capitales
            // apparaissent : un seul geste, pas deux.
            { '--aurelys-rule': 0, autoAlpha: 0 },
            { '--aurelys-rule': 1, autoAlpha: 1, duration: 0.85, ease: MOTION.ease },
          )
          .fromTo(
            lede,
            { autoAlpha: 0, y: 22 },
            { autoAlpha: 1, y: 0, duration: MOTION.duration, ease: MOTION.ease },
            TITLE_DELAY + 0.35,
          );
      }),
    { scope: ref },
  );

  return (
    <div ref={ref} className={cx(styles.head, centered && styles.centered)}>
      <Eyebrow centered={centered} className={styles.eyebrow}>
        {eyebrow}
      </Eyebrow>
      <RevealText as="h2" id={titleId} delay={TITLE_DELAY}>
        {title}
      </RevealText>
      {description ? <p className={styles.lede}>{description}</p> : null}
    </div>
  );
}
