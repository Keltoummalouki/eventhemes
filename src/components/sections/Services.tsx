'use client';

import { useRef } from 'react';
import SectionHeader from '@/components/ui/SectionHeader';
import { SERVICES } from '@/data/services';
import { gsap, MOTION, revealSafe, ScrollTrigger, useGSAP } from '@/lib/motion';
import ServiceCard from './ServiceCard';
import styles from './Services.module.css';

export default function Services() {
  const ref = useRef<HTMLElement>(null);

  /**
   * Le catalogue compte seize cartes : les décaler une à une donnerait à la
   * dernière plusieurs secondes de retard. `ScrollTrigger.batch` regroupe donc
   * celles qui entrent ensemble et n'échelonne qu'à l'intérieur d'une rangée.
   *
   * On anime le contenu des cartes, jamais leur boîte : le fond noir de chaque
   * carte masque les filets dorés de la grille, et le faire disparaître ferait
   * apparaître un aplat doré à sa place.
   */
  useGSAP(
    () =>
      revealSafe(ref, (full) => {
        const section = ref.current;
        if (!section) return;

        const frames = gsap.utils.toArray<HTMLElement>(`.${styles.frame}`, section);
        const bodies = gsap.utils.toArray<HTMLElement>(`.${styles.body}`, section);

        if (!full) {
          gsap.set(frames, { autoAlpha: 1, scale: 1 });
          gsap.set(bodies, { autoAlpha: 1 });
          return;
        }

        gsap.set(frames, { autoAlpha: 0, scale: 1.12 });
        // Le cartouche n'est animé qu'en opacité : sa translation verticale est
        // déjà réservée au survol (`.body` remonte pour dégager la description).
        gsap.set(bodies, { autoAlpha: 0 });

        const batches = [
          ScrollTrigger.batch(frames, {
            start: 'top 94%',
            onEnter: (batch) =>
              gsap.to(batch, {
                autoAlpha: 1,
                scale: 1,
                duration: 1.2,
                ease: MOTION.ease,
                stagger: MOTION.stagger,
                overwrite: true,
              }),
          }),
          ScrollTrigger.batch(bodies, {
            start: 'top 94%',
            onEnter: (batch) =>
              gsap.to(batch, {
                autoAlpha: 1,
                duration: MOTION.duration,
                delay: 0.15,
                ease: MOTION.ease,
                stagger: MOTION.stagger,
                overwrite: 'auto',
              }),
          }),
        ];

        return () => {
          for (const batch of batches) for (const trigger of batch) trigger.kill();
        };
      }),
    { scope: ref },
  );

  return (
    <section className="section-pad" id="services" ref={ref}>
      <div className="container">
        <SectionHeader
          eyebrow="Nos savoir-faire"
          title="Nos services"
          description="Tout ce dont vous avez besoin pour créer un événement exceptionnel."
        />
      </div>

      <div className={styles.grid}>
        {SERVICES.map((service, index) => (
          <ServiceCard key={service.title} service={service} position={index + 1} />
        ))}
      </div>
    </section>
  );
}
