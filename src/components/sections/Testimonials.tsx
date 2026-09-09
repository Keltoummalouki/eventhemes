'use client';

import SectionHeader from '@/components/ui/SectionHeader';
import { TESTIMONIALS, TESTIMONIAL_INTERVAL_MS } from '@/data/testimonials';
import { useCarousel } from '@/hooks/useCarousel';
import { cx } from '@/lib/cx';
import styles from './Testimonials.module.css';

const STARS = '★★★★★';

export default function Testimonials() {
  const { index, goTo } = useCarousel(TESTIMONIALS.length, TESTIMONIAL_INTERVAL_MS);

  return (
    <section className={cx('section-pad', styles.testi)} id="apropos">
      <div className="container">
        <SectionHeader eyebrow="Confiance" title="Ils nous ont fait confiance" centered />
      </div>

      <div className={styles.track} style={{ transform: `translateX(-${index * 100}%)` }}>
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
