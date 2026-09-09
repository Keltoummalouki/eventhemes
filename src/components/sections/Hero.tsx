'use client';

import { useEffect, useRef } from 'react';
import Button from '@/components/ui/Button';
import SmartImage from '@/components/ui/SmartImage';
import { HERO_CONTENT, HERO_INTERVAL_MS, HERO_SLIDES } from '@/data/hero';
import { useCarousel } from '@/hooks/useCarousel';
import { cx } from '@/lib/cx';
import styles from './Hero.module.css';

/** Durée du Ken Burns rejoué lors d'un changement de vue (14 s au premier rendu). */
const KENBURNS_REPLAY = 'kenburns 8s ease forwards';

export default function Hero() {
  const { index, goTo } = useCarousel(HERO_SLIDES.length, HERO_INTERVAL_MS);
  const slideImages = useRef<(HTMLImageElement | null)[]>([]);
  const previousIndex = useRef(index);

  // Relance le zoom lent sur la vue qui vient d'apparaître.
  useEffect(() => {
    if (previousIndex.current === index) return;
    previousIndex.current = index;

    const image = slideImages.current[index];
    if (!image) return;

    image.style.animation = 'none';
    void image.offsetWidth; // force le navigateur à repartir de zéro
    image.style.animation = KENBURNS_REPLAY;
  }, [index]);

  return (
    <section className={styles.hero} id="accueil">
      <div aria-hidden="true">
        {HERO_SLIDES.map((slide, slideIndex) => (
          <div
            key={slide.src}
            className={cx(styles.slide, slideIndex === index && styles.active)}
            ref={(node) => {
              slideImages.current[slideIndex] = node?.querySelector('img') ?? null;
            }}
          >
            <SmartImage
              src={slide.src}
              alt=""
              fallbackSeed={slide.fallbackSeed}
              fallbackWidth={1800}
              fallbackHeight={1000}
              className="kenburns"
              loading="eager"
              fetchPriority={slideIndex === 0 ? 'high' : undefined}
            />
          </div>
        ))}
      </div>

      <div className={styles.content}>
        <svg className={styles.mark} viewBox="0 0 100 100" fill="none" aria-hidden="true" focusable="false">
          <circle cx="50" cy="50" r="46" stroke="var(--or)" strokeWidth="1" />
          <text
            x="50"
            y="60"
            style={{ fontFamily: 'var(--ff-display)' }}
            fontStyle="italic"
            fontSize="34"
            fill="var(--or-clair)"
            textAnchor="middle"
          >
            A
          </text>
        </svg>

        <h1>{HERO_CONTENT.heading}</h1>
        <p>{HERO_CONTENT.description}</p>

        <div className={styles.actions}>
          <Button href={HERO_CONTENT.primaryCta.href} variant="fill">
            {HERO_CONTENT.primaryCta.label}
          </Button>
          <Button href={HERO_CONTENT.secondaryCta.href} variant="ghost">
            {HERO_CONTENT.secondaryCta.label}
          </Button>
        </div>
      </div>

      <div className={styles.scroll} aria-hidden="true">
        <span>{HERO_CONTENT.scrollLabel}</span>
        <div className={styles.line} />
      </div>

      <div className={styles.dots} role="group" aria-label="Choisir une vue du diaporama">
        {HERO_SLIDES.map((slide, slideIndex) => (
          <button
            key={slide.src}
            type="button"
            className={cx(slideIndex === index && styles.dotActive)}
            aria-label={`Vue ${slideIndex + 1} sur ${HERO_SLIDES.length}`}
            aria-current={slideIndex === index}
            onClick={() => goTo(slideIndex)}
          />
        ))}
      </div>
    </section>
  );
}
