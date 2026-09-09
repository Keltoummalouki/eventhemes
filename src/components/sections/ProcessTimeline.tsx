'use client';

import { useRef } from 'react';
import Reveal from '@/components/ui/Reveal';
import SectionHeader from '@/components/ui/SectionHeader';
import { PROCESS_STEPS } from '@/data/process';
import { gsap, revealSafe, useGSAP } from '@/lib/motion';
import styles from './ProcessTimeline.module.css';

/**
 * « Comment ça marche ? » — les cinq temps de l'accompagnement.
 *
 * Un filet doré se trace verticalement au fil du défilement, entre les numéros
 * et les intitulés : le visiteur voit littéralement le parcours se dérouler.
 * La progression est liée à la position de la barre de défilement (`scrub`),
 * pas à une durée — c'est lui qui mène la lecture, pas l'animation.
 *
 * Les étapes sont des blocs frères directs de `.list` (et non une liste `<ol>`)
 * afin de conserver le filet de séparation `:last-child` de la maquette ; leur
 * ordre est déjà porté visuellement et textuellement par les numéros 01 → 05.
 */
export default function ProcessTimeline() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () =>
      revealSafe(ref, (full) => {
        const section = ref.current;
        if (!section) return;
        const find = gsap.utils.selector(section);
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
            scrollTrigger: {
              trigger: list,
              // Le tracé commence quand la première étape arrive à hauteur de
              // lecture et s'achève quand la dernière l'a dépassée.
              start: 'top 72%',
              end: 'bottom 78%',
              scrub: 0.6,
            },
          },
        );
      }),
    { scope: ref },
  );

  return (
    <section className={styles.timeline} id="methode" ref={ref}>
      <div className="container">
        <SectionHeader
          eyebrow="Notre process"
          title="Comment ça marche ?"
          description="Un accompagnement structuré, de la première rencontre à la réalisation de votre événement."
        />

        <div className={styles.list}>
          <div className={styles.spine} aria-hidden="true">
            <div className={styles.spineFill} />
          </div>

          {PROCESS_STEPS.map((step, index) => (
            <Reveal key={step.title} className={styles.item}>
              <div className={styles.num}>{String(index + 1).padStart(2, '0')}</div>
              <div className={styles.body}>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
              <div className={styles.bar} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
