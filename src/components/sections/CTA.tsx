'use client';

import { useRef } from 'react';
import Button from '@/components/ui/Button';
import Eyebrow from '@/components/ui/Eyebrow';
import Reveal from '@/components/ui/Reveal';
import RevealText from '@/components/ui/RevealText';
import SmartImage from '@/components/ui/SmartImage';
import { unsplashPhoto } from '@/lib/images';
import { gsap, motionSafe, useGSAP } from '@/lib/motion';
import styles from './CTA.module.css';

const CTA_IMAGE = unsplashPhoto('1519741497674-611481863552', 1800);

/**
 * Dernière invitation à passer à l'action : « Demander un devis ».
 *
 * Le décor descend lentement à contre-sens du défilement : c'est la même
 * profondeur qu'à l'accueil, en écho, pour refermer la page comme elle s'est
 * ouverte. Le bouton est le second — et dernier — point d'aimantation du site.
 */
export default function CTA() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () =>
      motionSafe(ref, () => {
        const section = ref.current;
        if (!section) return;

        gsap.fromTo(
          gsap.utils.selector(section)(`.${styles.backdrop}`),
          { yPercent: -8 },
          {
            yPercent: 8,
            ease: 'none',
            scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        );
      }),
    { scope: ref },
  );

  return (
    <section className={styles.cta} id="contact-cta" ref={ref}>
      <div className={styles.backdrop} aria-hidden="true">
        <SmartImage
          src={CTA_IMAGE}
          alt=""
          fallbackSeed="aurelys-cta"
          fallbackWidth={1800}
          fallbackHeight={1000}
        />
      </div>

      <div className={styles.content}>
        <Reveal>
          <Eyebrow centered>Prochaine étape</Eyebrow>
        </Reveal>
        <RevealText as="h2">Votre événement mérite l&apos;exceptionnel.</RevealText>
        <Reveal delay={0.25}>
          <p>Confiez-nous votre projet et transformons votre vision en une expérience inoubliable.</p>
          <Button href="#contact" variant="fill" className={styles.ctaBtn} magnetic>
            Demander un devis
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
