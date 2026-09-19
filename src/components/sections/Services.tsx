'use client';

import { useRef, useState } from 'react';
import { useEventheme } from '@/components/eventheme/Provider';
import Button from '@/components/ui/Button';
import SectionHeader from '@/components/ui/SectionHeader';
import { CheckIcon } from '@/components/ui/icons';
import { serviceItems } from '@/data/eventheme';
import { cx } from '@/lib/cx';
import { gsap, MOTION, revealSafe, useGSAP } from '@/lib/motion';
import styles from './Services.module.css';

/**
 * Services principaux — panneaux qui s'ouvrent.
 *
 * Sur grand écran, le panneau survolé (ou atteint au clavier) s'élargit et
 * découvre sa description, ses prestations et l'ajout au devis ; les autres
 * se replient sur leur titre vertical. Sur mobile, les panneaux s'empilent,
 * tous ouverts. Tout le contenu reste dans le DOM : rien n'est caché aux
 * lecteurs d'écran, seul l'affichage change.
 */
export default function Services() {
  const ref = useRef<HTMLElement>(null);
  const { entries, basket, setBasket, add } = useEventheme();
  const services = entries.filter((e) => e.kind === 'services');
  const [active, setActive] = useState(0);

  useGSAP(
    () =>
      revealSafe(ref, (full) => {
        const panels = gsap.utils.toArray<HTMLElement>(`.${styles.panel}`, ref.current);
        if (!full) {
          gsap.set(panels, { clipPath: 'inset(0% 0% 0% 0%)' });
          return;
        }
        gsap.fromTo(
          panels,
          { clipPath: 'inset(100% 0% 0% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.3,
            ease: 'expo.inOut',
            stagger: MOTION.stagger * 1.6,
            scrollTrigger: { trigger: panels[0]?.parentElement, start: 'top 82%', once: true },
          },
        );
      }),
    { scope: ref },
  );

  const toggle = (id: string) => {
    const entry = services.find((service) => service.id === id);
    if (!entry) return;
    if (basket.services.includes(id))
      setBasket({ ...basket, services: basket.services.filter((item) => item !== id) });
    else add(entry);
  };

  return (
    <section className={styles.root} id="services" ref={ref}>
      <SectionHeader
        eyebrow="Nos expertises"
        title={
          <>
            Tout un savoir-faire.
            <br />
            <em>Une seule signature.</em>
          </>
        }
        description="Un accompagnement complet ou une expertise à la carte : composez les prestations qui donneront vie à votre événement."
        action={
          <Button href="/services" variant="link" icon="↗">
            Tous nos services
          </Button>
        }
      />

      <div className={styles.panels}>
        {services.map((service, index) => {
          const chosen = basket.services.includes(service.id);
          const items = serviceItems(service);
          return (
            <article
              key={service.id}
              className={cx(styles.panel, index === active && styles.active)}
              onPointerEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              onClick={() => setActive(index)}
              aria-labelledby={`service-${service.id}`}
            >
              <div className={styles.media}>
                <img src={service.image || '/eventheme.jpg'} alt="" loading="lazy" decoding="async" />
              </div>
              <span className={styles.num}>{String(index + 1).padStart(2, '0')}</span>
              <span className={styles.spine} aria-hidden="true">
                {service.title}
              </span>
              <div className={styles.body}>
                <span className={styles.category}>{service.category}</span>
                <h3 id={`service-${service.id}`}>{service.title}</h3>
                <p>{service.description}</p>
                {items.length > 0 && (
                  <ul className={styles.items}>
                    {items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
                <div className={styles.actions}>
                  <Button
                    size="sm"
                    variant={chosen ? 'outline' : 'fill'}
                    icon={chosen ? <CheckIcon /> : '+'}
                    className={styles.add}
                    aria-pressed={chosen}
                    onClick={() => toggle(service.id)}
                  >
                    {chosen ? 'Dans mon devis' : 'Ajouter à mon devis'}
                  </Button>
                  <Button href="/services" variant="link" size="sm" icon="↗">
                    En savoir plus
                  </Button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <p className={styles.caption}>Photographies d’ambiance et d’illustration.</p>
    </section>
  );
}
