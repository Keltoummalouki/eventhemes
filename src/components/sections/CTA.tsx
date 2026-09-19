'use client';

import { useRef } from 'react';
import { useEventheme } from '@/components/eventheme/Provider';
import Butterflies from '@/components/ui/Butterflies';
import Button from '@/components/ui/Button';
import Eyebrow from '@/components/ui/Eyebrow';
import Reveal from '@/components/ui/Reveal';
import RevealText from '@/components/ui/RevealText';
import { imagery } from '@/data/eventheme';
import { gsap, motionSafe, useGSAP } from '@/lib/motion';
import { findSocial } from '@/lib/eventheme/types';
import styles from './CTA.module.css';

/**
 * Dernière invitation : « Parlons de votre prochain événement. »
 *
 * Le décor descend lentement à contre-sens du défilement, en écho à la
 * profondeur de l'accueil : la page se referme comme elle s'est ouverte.
 */
export default function CTA() {
  const ref = useRef<HTMLElement>(null);
  const { entries } = useEventheme();
  const whatsapp = findSocial(entries, 'whatsapp');
  const instagram = findSocial(entries, 'instagram');

  useGSAP(
    () =>
      motionSafe(ref, () => {
        gsap.fromTo(
          gsap.utils.selector(ref)(`.${styles.backdrop}`),
          { yPercent: -9 },
          {
            yPercent: 9,
            ease: 'none',
            scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        );
      }),
    { scope: ref },
  );

  return (
    <section className={styles.cta} id="contact" ref={ref} aria-labelledby="contact-titre">
      <div className={styles.backdrop} aria-hidden="true">
        <img src={imagery.hero} alt="" loading="lazy" decoding="async" />
      </div>
      <Butterflies count={3} />

      <div className={styles.content}>
        <Reveal>
          <Eyebrow centered>Imaginons la suite, ensemble</Eyebrow>
        </Reveal>
        <RevealText as="h2" id="contact-titre" className={styles.title}>
          Parlons de votre
          <br />
          <em>prochain événement.</em>
        </RevealText>
        <Reveal delay={0.25}>
          <p className={styles.lede}>
            Une date, une idée, une envie ? Racontez-nous votre projet : nous construirons ensemble un événement à
            votre image.
          </p>
          <div className={styles.actions}>
            <Button href="#devis" icon="↗" magnetic>
              Demander un devis
            </Button>
            {whatsapp?.url && (
              <Button href={whatsapp.url} variant="ghost" target="_blank" rel="noreferrer" icon="↗">
                Nous contacter sur WhatsApp
              </Button>
            )}
          </div>
          {instagram?.url && (
            <a className={styles.social} href={instagram.url} target="_blank" rel="noreferrer">
              Suivez-nous sur Instagram · {instagram.description}
            </a>
          )}
        </Reveal>
      </div>
    </section>
  );
}
