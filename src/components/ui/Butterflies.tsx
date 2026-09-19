'use client';

import { useId, useRef } from 'react';
import { cx } from '@/lib/cx';
import { gsap, motionSafe, useGSAP } from '@/lib/motion';
import styles from './Butterflies.module.css';

/**
 * Point de départ (en % du cadre), taille et rythme de battement de chaque
 * papillon. Valeurs fixes : le rendu serveur et le rendu client sont identiques.
 */
const FLOCK = [
  { x: 12, y: 30, size: 26, beat: 1.1 },
  { x: 82, y: 20, size: 18, beat: 0.9 },
  { x: 68, y: 72, size: 22, beat: 1.25 },
  { x: 28, y: 76, size: 15, beat: 0.95 },
  { x: 92, y: 55, size: 16, beat: 1.05 },
];

/** Aile droite, dessinée d’après le cœur-papillon du logo ; l’aile gauche en est le miroir. */
function Wing() {
  return (
    <>
      <path d="M2 -2 C 8 -28, 30 -44, 42 -34 C 52 -25, 38 -6, 4 0 Z" />
      <path d="M3 3 C 22 2, 34 16, 26 28 C 18 38, 6 22, 2 7 Z" />
    </>
  );
}

type ButterfliesProps = {
  /** Nombre de papillons (au plus cinq : l’effet doit rester discret). */
  count?: number;
  className?: string;
};

/**
 * Papillons dorés de la charte — un ornement discret.
 *
 * « Une propriété, un propriétaire » : les ailes battent en CSS, GSAP déplace
 * le calque qui les porte. En mouvement réduit, ils n’apparaissent pas du tout :
 * ce décor n’apporte aucun contenu.
 */
export default function Butterflies({ count = 3, className }: ButterfliesProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Identifiant utilisable dans `url(#…)`, quel que soit le format de useId.
  const gradient = `papillon-${useId().replace(/[^\w-]/g, '')}`;

  useGSAP(
    () =>
      motionSafe(ref, () => {
        const frame = ref.current;
        if (!frame) return;
        const flyers = gsap.utils.toArray<HTMLElement>(`.${styles.flyer}`, frame);
        let alive = true;

        // Chaque papillon erre autour de son point de départ, sans jamais
        // s’en éloigner assez pour traverser le texte qu’il accompagne.
        const wander = (flyer: HTMLElement) => {
          if (!alive) return;
          const x = gsap.utils.random(-0.16, 0.16) * frame.clientWidth;
          const y = gsap.utils.random(-0.14, 0.14) * frame.clientHeight;
          const from = Number(gsap.getProperty(flyer, 'x'));
          gsap.to(flyer, {
            x,
            y,
            rotation: gsap.utils.clamp(-28, 28, (x - from) / 7),
            duration: gsap.utils.random(5, 9),
            ease: 'sine.inOut',
            onComplete: () => wander(flyer),
          });
        };

        flyers.forEach((flyer, index) => {
          gsap.fromTo(
            flyer,
            { autoAlpha: 0, scale: 0.6 },
            { autoAlpha: 1, scale: 1, duration: 1.6, delay: 0.6 + index * 0.4, ease: 'power2.out' },
          );
          wander(flyer);
        });

        return () => {
          alive = false;
          gsap.killTweensOf(flyers);
        };
      }),
    { scope: ref },
  );

  return (
    <div ref={ref} className={cx(styles.frame, className)} aria-hidden="true">
      <svg className={styles.defs} focusable="false">
        <defs>
          <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--or-clair)" />
            <stop offset="1" stopColor="var(--or-profond)" />
          </linearGradient>
        </defs>
      </svg>
      {FLOCK.slice(0, Math.min(count, FLOCK.length)).map((bird, index) => (
        <span
          key={index}
          className={styles.flyer}
          style={{
            left: `${bird.x}%`,
            top: `${bird.y}%`,
            width: bird.size,
            ['--beat' as string]: `${bird.beat}s`,
          }}
        >
          <svg viewBox="-50 -44 100 88" focusable="false" fill={`url(#${gradient})`}>
            <g className={styles.wing}>
              <Wing />
            </g>
            <g className={styles.wing}>
              <g transform="scale(-1 1)">
                <Wing />
              </g>
            </g>
            <path className={styles.body} d="M0 -12 C 2 -6, 2 14, 0 22 C -2 14, -2 -6, 0 -12 Z" />
            <path className={styles.antenna} d="M0 -12 C -2 -22, -8 -28, -12 -31 M0 -12 C 2 -22, 8 -28, 12 -31" />
          </svg>
        </span>
      ))}
    </div>
  );
}
