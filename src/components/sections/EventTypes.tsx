'use client';

import { useRef, useState } from 'react';
import { useEventheme, useQuote } from '@/components/eventheme/Provider';
import Button from '@/components/ui/Button';
import SectionHeader from '@/components/ui/SectionHeader';
import { cx } from '@/lib/cx';
import { gsap, MOTION, motionSafe, prefersReducedMotion, revealSafe, useGSAP } from '@/lib/motion';
import styles from './EventTypes.module.css';
import { ArrowUpRightIcon } from '@/components/ui/icons';

/**
 * Types d'événements — une liste typographique.
 *
 * Au survol, une photographie suit le curseur et change avec l'occasion
 * pointée. Choisir une occasion la présélectionne dans « Mon devis » et y
 * conduit : la liste est un raccourci vers la demande, pas un simple décor.
 */
export default function EventTypes() {
  const ref = useRef<HTMLElement>(null);
  const { entries } = useEventheme();
  const { quote, pickEvent } = useQuote();
  const events = entries.filter((e) => e.kind === 'events');
  const [current, setCurrent] = useState(0);

  /* Les rangées montent par vagues, au fil du défilement. */
  useGSAP(
    () =>
      revealSafe(ref, (full) => {
        const rows = gsap.utils.toArray<HTMLElement>(`.${styles.item}`, ref.current);
        if (!full) {
          gsap.set(rows, { autoAlpha: 1, y: 0 });
          return;
        }
        gsap.fromTo(
          rows,
          { autoAlpha: 0, y: 36 },
          {
            autoAlpha: 1,
            y: 0,
            duration: MOTION.duration,
            ease: MOTION.ease,
            stagger: 0.05,
            scrollTrigger: { trigger: rows[0]?.parentElement, start: 'top 84%', once: true },
          },
        );
      }),
    { scope: ref },
  );

  /* Aperçu qui suit le curseur (pointeur fin uniquement). */
  useGSAP(
    () =>
      motionSafe(ref, () => {
        const section = ref.current;
        const list = section?.querySelector(`.${styles.list}`);
        const preview = section?.querySelector<HTMLElement>(`.${styles.preview}`);
        if (!section || !list || !preview) return;
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

        const moveX = gsap.quickTo(preview, 'x', { duration: 0.7, ease: 'power3.out' });
        const moveY = gsap.quickTo(preview, 'y', { duration: 0.7, ease: 'power3.out' });
        let lastX = 0;
        const follow = (event: PointerEvent) => {
          const box = section.getBoundingClientRect();
          moveX(event.clientX - box.left);
          moveY(event.clientY - box.top);
          // L'image penche légèrement dans le sens du geste.
          gsap.to(preview, { rotation: gsap.utils.clamp(-8, 8, (event.clientX - lastX) * 0.4), duration: 0.6 });
          lastX = event.clientX;
        };
        const show = () => gsap.to(preview, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'power3.out' });
        const hide = () => gsap.to(preview, { autoAlpha: 0, scale: 0.7, rotation: 0, duration: 0.4 });

        list.addEventListener('pointermove', follow as EventListener);
        list.addEventListener('pointerenter', show);
        list.addEventListener('pointerleave', hide);
        return () => {
          list.removeEventListener('pointermove', follow as EventListener);
          list.removeEventListener('pointerenter', show);
          list.removeEventListener('pointerleave', hide);
        };
      }),
    { scope: ref },
  );

  const choose = (id: string) => {
    pickEvent(id);
    document
      .getElementById('devis')
      ?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <section className={styles.root} id="evenements" ref={ref}>
      <SectionHeader
        eyebrow="Vos plus belles occasions"
        title={
          <>
            Il y a toujours une raison
            <br />
            <em>de créer l’exception.</em>
          </>
        }
        description="Privés, professionnels, institutionnels ou pour les enfants : choisissez votre occasion, nous imaginons le reste."
        action={
          <Button href="/evenements" variant="link" icon={<ArrowUpRightIcon />}>
            Toutes les occasions
          </Button>
        }
      />

      <ul className={styles.list}>
        {events.map((event, index) => (
          <li key={event.id} className={styles.item}>
            <button
              type="button"
              className={cx(styles.row, quote.details.event === event.id && styles.picked)}
              onPointerEnter={() => setCurrent(index)}
              onFocus={() => setCurrent(index)}
              onClick={() => choose(event.id)}
            >
              <span className={styles.index}>{String(index + 1).padStart(2, '0')}</span>
              <span className={styles.name}>{event.title}</span>
              <span className={styles.category}>{event.category}</span>
              <span className={styles.arrow} aria-hidden="true">
                <ArrowUpRightIcon />
              </span>
              <span className="visually-hidden"> — choisir pour mon devis</span>
            </button>
          </li>
        ))}
      </ul>

      <div className={styles.preview} aria-hidden="true">
        {events.map((event, index) => (
          <img
            key={event.id}
            src={event.image || '/eventheme.jpg'}
            alt=""
            loading="lazy"
            decoding="async"
            className={cx(index === current && styles.shown)}
          />
        ))}
      </div>
    </section>
  );
}
