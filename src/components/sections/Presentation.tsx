'use client';

import { useRef } from 'react';
import Reveal from '@/components/ui/Reveal';
import { manifesto, pillars } from '@/data/eventheme';
import { gsap, motionSafe, SplitText, useGSAP } from '@/lib/motion';
import styles from './Presentation.module.css';

/**
 * « Qui est EVENTHEME ? » — présentation rapide de l'accueil.
 *
 * Le manifeste s'allume mot à mot au rythme du défilement, puis les
 * engagements de la marque montent l'un après l'autre.
 */
export default function Presentation() {
  const ref = useRef<HTMLElement>(null);

  /* Manifeste : chaque mot s'allume quand la lecture l'atteint. */
  useGSAP(
    () =>
      motionSafe(ref, () => {
        const text = ref.current?.querySelector(`.${styles.manifesto}`);
        if (!text) return;
        const split = SplitText.create(text, { type: 'words', wordsClass: styles.word });
        gsap.fromTo(
          split.words,
          { opacity: 0.16 },
          {
            opacity: 1,
            ease: 'none',
            stagger: 0.1,
            scrollTrigger: { trigger: text, start: 'top 78%', end: 'bottom 45%', scrub: 0.6 },
          },
        );
        return () => split.revert();
      }),
    { scope: ref },
  );

  return (
    <section className={styles.root} id="a-propos" ref={ref} aria-label="L’esprit EVENTHEME">
      <p className={styles.manifesto}>{manifesto}</p>

      <Reveal className={styles.pillars} stagger>
        {pillars.map(([title, description], index) => (
          <div key={title} className={styles.pillar}>
            <span className={styles.num}>{String(index + 1).padStart(2, '0')}</span>
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
