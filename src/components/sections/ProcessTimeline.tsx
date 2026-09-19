'use client';

import { useRef } from 'react';
import Button from '@/components/ui/Button';
import Reveal from '@/components/ui/Reveal';
import SectionHeader from '@/components/ui/SectionHeader';
import { methodSteps } from '@/data/eventheme';
import { gsap, revealSafe, useGSAP } from '@/lib/motion';
import styles from './ProcessTimeline.module.css';
import { ArrowUpRightIcon } from '@/components/ui/icons';

/**
 * « Notre méthode » — les sept temps de la collaboration.
 *
 * Un filet doré se trace entre les numéros et les intitulés au fil du
 * défilement (`scrub`) : c'est le visiteur qui mène la lecture, pas une durée.
 * Sur grand écran, l'en-tête reste à l'écran pendant que les étapes défilent.
 */
export default function ProcessTimeline() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () =>
      revealSafe(ref, (full) => {
        const find = gsap.utils.selector(ref);
        const spine = find(`.${styles.spineFill}`);
        const list = find(`.${styles.list}`)[0];
        if (!list) return;
        if (!full) {
          gsap.set(spine, { scaleY: 1 });
          return;
        }
        gsap.fromTo(
          spine,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: { trigger: list, start: 'top 70%', end: 'bottom 70%', scrub: 0.6 },
          },
        );
      }),
    { scope: ref },
  );

  return (
    <section className={styles.timeline} id="methode" ref={ref}>
      <div className={styles.layout}>
        <div className={styles.aside}>
          <SectionHeader
            eyebrow="Notre méthode"
            title={
              <>
                Ensemble,
                <br />
                <em>à chaque étape.</em>
              </>
            }
            description="Un accompagnement structuré, du premier échange au suivi après l’événement."
          />
          <Button href="#devis" variant="outline" icon={<ArrowUpRightIcon />}>
            Commencer l’échange
          </Button>
        </div>

        <ol className={styles.list}>
          <li className={styles.spine} aria-hidden="true">
            <div className={styles.spineFill} />
          </li>
          {methodSteps.map(([title, description], index) => (
            <li key={title}>
              <Reveal className={styles.item}>
                <div className={styles.num} aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <div className={styles.body}>
                  <h3>
                    <span className="visually-hidden">Étape {index + 1} : </span>
                    {title}
                  </h3>
                  <p>{description}</p>
                </div>
                <div className={styles.bar} />
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
