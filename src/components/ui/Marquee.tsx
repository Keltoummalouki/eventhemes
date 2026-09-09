'use client';

import { useRef } from 'react';
import { MARQUEE_TERMS } from '@/data/marquee';
import { gsap, motionSafe, ScrollTrigger, useGSAP } from '@/lib/motion';
import styles from './Marquee.module.css';

/** Durée d'un tour complet du bandeau, en secondes. */
const LOOP_SECONDS = 34;

/**
 * Bandeau défilant du savoir-faire technique.
 *
 * La série est écrite deux fois : le ruban parcourt exactement la moitié de sa
 * largeur puis reprend à zéro, sans raccord visible. Il change de sens avec le
 * défilement de la page — remonter inverse la marche —, ce qui relie le geste
 * du visiteur à ce qu'il voit au lieu d'entretenir un mouvement autonome.
 *
 * Le second exemplaire est masqué aux lecteurs d'écran : la liste est annoncée
 * une seule fois.
 */
export default function Marquee() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () =>
      motionSafe(ref, () => {
        const band = ref.current;
        if (!band) return;
        const ribbon = band.firstElementChild;
        if (!ribbon) return;

        const loop = gsap.to(ribbon, {
          xPercent: -50,
          duration: LOOP_SECONDS,
          ease: 'none',
          repeat: -1,
        });

        let heading = 1;
        const follow = ScrollTrigger.create({
          onUpdate: (self) => {
            // On ne réagit qu'aux changements de sens : inutile de créer une
            // interpolation à chaque image de défilement.
            if (self.direction === heading) return;
            heading = self.direction;
            gsap.to(loop, { timeScale: heading, duration: 0.5, overwrite: true });
          },
        });

        return () => {
          follow.kill();
          loop.kill();
        };
      }),
    { scope: ref },
  );

  return (
    <div className={styles.band} ref={ref}>
      <div className={styles.ribbon}>
        <ul className={styles.run}>
          {MARQUEE_TERMS.map((term) => (
            <li key={term}>{term}</li>
          ))}
        </ul>
        <ul className={styles.run} aria-hidden="true">
          {MARQUEE_TERMS.map((term) => (
            <li key={term}>{term}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
