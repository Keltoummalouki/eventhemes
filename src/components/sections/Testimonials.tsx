'use client';

import { useRef } from 'react';
import SectionHeader from '@/components/ui/SectionHeader';
import { TESTIMONIALS, TESTIMONIAL_INTERVAL_MS } from '@/data/testimonials';
import { useCarousel } from '@/hooks/useCarousel';
import { cx } from '@/lib/cx';
import { gsap, MOTION, prefersReducedMotion, useGSAP } from '@/lib/motion';
import styles from './Testimonials.module.css';

const STARS = '★★★★★';

export default function Testimonials() {
  const ref = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { index, goTo } = useCarousel(TESTIMONIALS.length, TESTIMONIAL_INTERVAL_MS);

  /**
   * À chaque témoignage : le rail glisse, puis les trois éléments de la carte
   * — note, citation, signature — entrent dans l'ordre où on les lit. La
   * cascade démarre pendant la fin du glissement, sans temps mort.
   */
  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track) return;

      const reduced = prefersReducedMotion();
      const slide = track.children[index];

      gsap.to(track, {
        xPercent: -index * 100,
        duration: reduced ? 0 : 0.85,
        ease: 'power3.inOut',
      });

      if (reduced || !slide) return;

      const card = slide.firstElementChild;
      if (!card) return;

      gsap.fromTo(
        Array.from(card.children),
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: MOTION.duration,
          delay: 0.3,
          ease: MOTION.ease,
          stagger: 0.1,
          overwrite: 'auto',
        },
      );
    },
    { scope: ref, dependencies: [index] },
  );

  return (
    <section className={cx('section-pad', styles.testi)} id="apropos" ref={ref}>
      <div className="container">
        <SectionHeader eyebrow="Confiance" title="Ils nous ont fait confiance" centered />
      </div>

      <div className={styles.track} ref={trackRef}>
        {TESTIMONIALS.map((testimonial) => (
          <div className={styles.slide} key={testimonial.name}>
            <figure className={styles.card}>
              <div className={styles.stars} role="img" aria-label="Note : 5 étoiles sur 5">
                {STARS}
              </div>
              <blockquote>{`« ${testimonial.quote} »`}</blockquote>
              <figcaption className={styles.meta}>
                <strong>{testimonial.name}</strong>
                <span>{testimonial.eventType}</span>
              </figcaption>
            </figure>
          </div>
        ))}
      </div>

      <div className={styles.nav} role="group" aria-label="Choisir un témoignage">
        {TESTIMONIALS.map((testimonial, slideIndex) => (
          <button
            key={testimonial.name}
            type="button"
            className={cx(slideIndex === index && styles.active)}
            aria-label={`Témoignage ${slideIndex + 1} sur ${TESTIMONIALS.length}`}
            aria-current={slideIndex === index}
            onClick={() => goTo(slideIndex)}
          />
        ))}
      </div>
    </section>
  );
}
