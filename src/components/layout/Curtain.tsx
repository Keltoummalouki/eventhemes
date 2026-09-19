'use client';

import { useRef, useState } from 'react';
import { curtainOpened, openCurtain } from '@/lib/intro';
import { gsap, revealSafe, useGSAP } from '@/lib/motion';
import styles from './Curtain.module.css';

/** Filet de sécurité : le rideau ne reste jamais fermé plus longtemps. */
const MAX_WAIT_MS = 1400;

/**
 * Rideau d'ouverture, joué une fois par chargement de page.
 *
 * Le logo s'éclaire puis s'efface, les deux panneaux s'écartent sur un filet
 * doré, et le rideau prévient <Hero> qu'il peut entrer en scène. Au retour sur
 * l'accueil par la navigation interne, il ne rejoue pas. Une fois la séquence
 * terminée, l'élément est retiré du DOM.
 */
export default function Curtain() {
  const ref = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useGSAP(
    () =>
      revealSafe(ref, (full) => {
        const curtain = ref.current;
        if (!curtain) return;

        // Mouvement réduit, ou rideau déjà joué : on entre directement.
        if (!full || curtainOpened()) {
          openCurtain();
          setDone(true);
          return;
        }

        const find = gsap.utils.selector(curtain);
        const timeline = gsap
          .timeline({ paused: true, onComplete: () => setDone(true) })
          .fromTo(find(`.${styles.shine}`), { xPercent: -120 }, { xPercent: 120, duration: 1, ease: 'power2.inOut' })
          .to(find(`.${styles.mark}`), { autoAlpha: 0, scale: 1.06, duration: 0.45, ease: 'power2.in' }, '-=0.15')
          // 101 % : le filet doré central sort du cadre avec les panneaux.
          .to(find(`.${styles.left}`), { xPercent: -101, duration: 1.3, ease: 'expo.inOut' }, '-=0.1')
          .to(find(`.${styles.right}`), { xPercent: 101, duration: 1.3, ease: 'expo.inOut' }, '<')
          // Signal au sommet du geste : l'accueil monte pendant l'ouverture.
          .call(openCurtain, undefined, '-=0.85');

        // Les polices chargées, le logo et le titre sont prêts à être vus.
        let started = false;
        const start = () => {
          if (started) return;
          started = true;
          timeline.play();
        };
        document.fonts?.ready.then(() => window.setTimeout(start, 350)).catch(start);
        const safety = window.setTimeout(start, MAX_WAIT_MS);

        return () => window.clearTimeout(safety);
      }),
    { scope: ref },
  );

  if (done) return null;

  return (
    <div ref={ref} className={styles.curtain} aria-hidden="true">
      <div className={`${styles.panel} ${styles.left}`} />
      <div className={styles.mark}>
        <img src="/eventheme_logo_png.webp" alt="" width={260} height={260} />
        <span className={styles.shine} />
      </div>
      <div className={`${styles.panel} ${styles.right}`} />
    </div>
  );
}
