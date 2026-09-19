'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react';
import { useEventheme } from '@/components/eventheme/Provider';
import Button from '@/components/ui/Button';
import SectionHeader from '@/components/ui/SectionHeader';
import { cx } from '@/lib/cx';
import { priceLabel } from '@/lib/eventheme/types';
import { DESKTOP, FULL_MOTION, gsap, motionSafe, useGSAP } from '@/lib/motion';
import styles from './Rental.module.css';

/** Part de la jauge déjà remplie au repos. */
const FILL_MIN = 0.12;
/** Amplitude du glissement interne des visuels, en % de leur largeur. */
const DRIFT = 6;
/** Au-delà de ce déplacement, un appui devient un glisser : le clic est annulé. */
const DRAG_THRESHOLD = 6;

/**
 * Location de matériel — le rail du catalogue.
 *
 * • Grand écran, mouvement accepté : la section est épinglée et le rail avance
 *   horizontalement au rythme du défilement vertical, visuels en dérive.
 * • Mobile ou mouvement réduit : défilement horizontal natif (doigt, pavé
 *   tactile) et glisser à la souris.
 */
export default function Rental() {
  const sectionRef = useRef<HTMLElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const { entries, add } = useEventheme();
  const products = entries.filter((e) => e.kind === 'products');

  const [pinned, setPinned] = useState(false);
  const [dragging, setDragging] = useState(false);
  const drag = useRef({ active: false, x: 0, scroll: 0, moved: 0 });

  const setFill = useCallback((progress: number) => {
    if (fillRef.current) gsap.set(fillRef.current, { scaleX: FILL_MIN + (1 - FILL_MIN) * progress });
  }, []);

  /* Mode épinglé : le défilement vertical fait avancer le rail. */
  useGSAP(
    () =>
      motionSafe(
        sectionRef,
        () => {
          const section = sectionRef.current;
          const wrap = wrapRef.current;
          const track = trackRef.current;
          if (!section || !wrap || !track) return;
          setPinned(true);

          // Recalculée à chaque rafraîchissement : la largeur dépend des visuels.
          const distance = () => Math.max(0, track.scrollWidth - wrap.clientWidth);
          const rail = gsap.to(track, {
            x: () => -distance(),
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              end: () => `+=${distance()}`,
              pin: true,
              scrub: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => setFill(self.progress),
            },
          });

          for (const pan of gsap.utils.toArray<HTMLElement>(`.${styles.pan}`, track)) {
            gsap.fromTo(
              pan,
              { xPercent: -DRIFT },
              {
                xPercent: DRIFT,
                ease: 'none',
                scrollTrigger: {
                  trigger: pan,
                  containerAnimation: rail,
                  start: 'left right',
                  end: 'right left',
                  scrub: true,
                },
              },
            );
          }
          return () => setPinned(false);
        },
        `${DESKTOP} and ${FULL_MOTION}`,
      ),
    { scope: sectionRef },
  );

  const onScroll = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap || pinned) return;
    const max = wrap.scrollWidth - wrap.clientWidth;
    setFill(max > 0 ? wrap.scrollLeft / max : 0);
  }, [pinned, setFill]);

  /* Glisser à la souris : la barre de défilement est masquée par la charte. */
  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const wrap = wrapRef.current;
    if (pinned || !wrap || event.pointerType !== 'mouse' || event.button !== 0) return;
    drag.current = { active: true, x: event.clientX, scroll: wrap.scrollLeft, moved: 0 };
    setDragging(true);
  };

  useEffect(() => {
    const move = (event: PointerEvent) => {
      const wrap = wrapRef.current;
      if (!drag.current.active || !wrap) return;
      const delta = event.clientX - drag.current.x;
      drag.current.moved = Math.max(drag.current.moved, Math.abs(delta));
      wrap.scrollLeft = drag.current.scroll - delta;
    };
    const end = () => {
      if (!drag.current.active) return;
      drag.current.active = false;
      setDragging(false);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
    };
  }, []);

  /** Un glisser qui se termine sur une fiche ne doit pas l'ouvrir. */
  const onClickCapture = (event: ReactMouseEvent) => {
    if (drag.current.moved > DRAG_THRESHOLD) {
      event.preventDefault();
      event.stopPropagation();
      drag.current.moved = 0;
    }
  };

  return (
    <section className={styles.root} id="location" ref={sectionRef}>
      <div className={styles.stage}>
        <div className={styles.head}>
          <SectionHeader
            eyebrow="Location de matériel"
            title={
              <>
                Les détails font
                <br />
                <em>la différence.</em>
              </>
            }
            description="Mobilier, décoration, lumière, son et image : composez votre sélection et ajoutez-la directement à votre devis."
            action={
              <Button href="/location" variant="link" icon="↗">
                Tout le catalogue
              </Button>
            }
          />
        </div>

        <div
          ref={wrapRef}
          className={cx(styles.trackWrap, pinned && styles.locked, dragging && styles.dragging)}
          onScroll={onScroll}
          onPointerDown={onPointerDown}
          onClickCapture={onClickCapture}
          onDragStart={(event) => event.preventDefault()}
          {...(pinned
            ? {}
            : { role: 'group', 'aria-label': 'Catalogue de location — faire défiler horizontalement', tabIndex: 0 })}
        >
          <div className={styles.track} ref={trackRef}>
            {products.map((product, index) => (
              <article key={product.id} className={styles.card}>
                <Link href={`/location/${product.id}`} className={styles.thumb} tabIndex={-1} aria-hidden="true">
                  <div className={styles.pan}>
                    <img src={product.image || '/eventheme.jpg'} alt="" loading="lazy" decoding="async" />
                  </div>
                  <span className={styles.index}>{String(index + 1).padStart(2, '0')}</span>
                  {product.demo && <span className={styles.tag}>Exemple</span>}
                </Link>
                <div className={styles.meta}>
                  <span>{product.category}</span>
                  <span className={styles.price}>{priceLabel(product)}</span>
                </div>
                <h3 className={styles.name}>
                  <Link href={`/location/${product.id}`}>{product.title}</Link>
                </h3>
                <button
                  type="button"
                  className={styles.add}
                  disabled={product.available === false}
                  onClick={() => add(product)}
                >
                  <span aria-hidden="true">+</span>
                  {product.available === false ? 'Indisponible' : 'Ajouter au devis'}
                  <span className="visually-hidden"> : {product.title}</span>
                </button>
              </article>
            ))}
            <Link href="/location" className={styles.more}>
              <span className={styles.moreLabel}>Découvrir</span>
              <span className={styles.moreTitle}>
                Tout le
                <br />
                <em>catalogue</em>
              </span>
              <span className={styles.moreArrow} aria-hidden="true">
                ↗
              </span>
            </Link>
          </div>
        </div>

        <div className={styles.scrollbar} aria-hidden="true">
          <div className={styles.fill} ref={fillRef} />
        </div>
      </div>
    </section>
  );
}
