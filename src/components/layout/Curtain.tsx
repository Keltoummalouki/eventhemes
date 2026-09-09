'use client';

import { useRef, useState } from 'react';
import { SITE } from '@/data/site';
import { openCurtain } from '@/lib/intro';
import { gsap, revealSafe, useGSAP } from '@/lib/motion';
import styles from './Curtain.module.css';

/** Délai après chargement complet avant l'ouverture, comme dans la maquette. */
const OPEN_DELAY_MS = 250;
/** Filet de sécurité : le rideau ne doit jamais rester fermé. */
const MAX_WAIT_MS = 3000;

/**
 * Rideau d'ouverture joué une seule fois, au premier rendu.
 *
 * Le monogramme s'espace puis s'efface, les deux panneaux s'écartent, et le
 * rideau prévient <Hero> qu'il peut entrer en scène (`openCurtain`). Une fois
 * la séquence terminée, l'élément est retiré du DOM : rien ne reste au-dessus
 * de la page, même invisible.
 */
export default function Curtain() {
  const ref = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useGSAP(
    () =>
      revealSafe(ref, (full) => {
        const curtain = ref.current;
        if (!curtain) return;

        // Mouvement réduit : pas de mise en scène, on entre directement.
        if (!full) {
          openCurtain();
          setDone(true);
          return;
        }

        const timeline = gsap.timeline({
          paused: true,
          onComplete: () => setDone(true),
        });

        timeline
          .to(`.${styles.mark}`, {
            letterSpacing: '0.42em',
            duration: 1.1,
            ease: 'power2.inOut',
          })
          .to(`.${styles.mark}`, { autoAlpha: 0, duration: 0.5 }, '-=0.35')
          // Les panneaux glissent de 101 % : le filet doré central sort du cadre
          // avec eux, sans laisser d'arête visible sur les écrans fractionnaires.
          .to(`.${styles.left}`, { xPercent: -101, duration: 1.4, ease: 'expo.inOut' }, '-=0.2')
          .to(`.${styles.right}`, { xPercent: 101, duration: 1.4, ease: 'expo.inOut' }, '<')
          // Signal donné au sommet du geste : la promesse d'accueil monte
          // pendant que les panneaux finissent de s'écarter, sans temps mort.
          .call(openCurtain, undefined, '-=0.9');

        // On attend le chargement complet pour que le diaporama d'accueil soit
        // déjà peint derrière les panneaux au moment où ils s'écartent.
        let startTimer = 0;
        const start = () => {
          startTimer = window.setTimeout(() => timeline.play(), OPEN_DELAY_MS);
        };

        if (document.readyState === 'complete') {
          start();
        } else {
          window.addEventListener('load', start, { once: true });
        }

        // Un CDN lent ne doit jamais retenir le visiteur derrière le rideau.
        const safety = window.setTimeout(() => timeline.play(), MAX_WAIT_MS);

        return () => {
          window.clearTimeout(startTimer);
          window.clearTimeout(safety);
          window.removeEventListener('load', start);
        };
      }),
    { scope: ref },
  );

  if (done) return null;

  return (
    <div ref={ref} className={styles.curtain} aria-hidden="true">
      <div className={`${styles.panel} ${styles.left}`} />
      <div className={styles.mark}>{SITE.name}</div>
      <div className={`${styles.panel} ${styles.right}`} />
    </div>
  );
}
