'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import SectionHeader from '@/components/ui/SectionHeader';
import { EQUIPMENT } from '@/data/equipment';
import { cx } from '@/lib/cx';
import EquipmentCard from './EquipmentCard';
import styles from './Equipment.module.css';

/** Largeur minimale de la jauge, en pourcentage (identique à la maquette). */
const FILL_MIN = 16;
const FILL_RANGE = 84;

export default function Equipment() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [fill, setFill] = useState(FILL_MIN);
  const [dragging, setDragging] = useState(false);
  /** Miroir synchrone de `dragging` : les événements pointeur arrivent avant le rendu. */
  const isDragging = useRef(false);
  const dragOrigin = useRef({ x: 0, scroll: 0 });

  const onScroll = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const max = wrap.scrollWidth - wrap.clientWidth;
    setFill(max > 0 ? (wrap.scrollLeft / max) * FILL_RANGE + FILL_MIN : FILL_MIN);
  }, []);

  /**
   * Défilement par glisser-déposer à la souris. Le pavé tactile et l'écran
   * tactile sont déjà couverts par le défilement natif ; la souris ne l'est pas,
   * puisque la barre de défilement est masquée par la charte.
   *
   * `preventDefault` est indispensable : sans lui, appuyer sur une vignette
   * déclenche le glisser-déposer natif de l'image, qui annule le pointeur.
   */
  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    const wrap = wrapRef.current;
    if (!wrap) return;
    dragOrigin.current = { x: event.clientX, scroll: wrap.scrollLeft };
    isDragging.current = true;
    setDragging(true);
    event.preventDefault();
  };

  // Suivi au niveau de la fenêtre : le geste continue même si le curseur sort
  // du rail, et rien ne peut nous voler le pointeur en cours de route.
  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      const wrap = wrapRef.current;
      if (!isDragging.current || !wrap) return;
      wrap.scrollLeft = dragOrigin.current.scroll - (event.clientX - dragOrigin.current.x);
    };

    const endDrag = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      setDragging(false);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', endDrag);
      window.removeEventListener('pointercancel', endDrag);
    };
  }, []);

  return (
    <section className={cx('section-pad', styles.equip)} id="equipements">
      <div className="container">
        <SectionHeader
          eyebrow="Notre parc technique"
          title="Nos équipements"
          description="Un matériel professionnel de dernière génération, entretenu et opéré par notre équipe technique."
        />
      </div>

      <div
        ref={wrapRef}
        className={cx(styles.trackWrap, dragging && styles.dragging)}
        onScroll={onScroll}
        onPointerDown={onPointerDown}
        // Rend le rail atteignable au clavier (flèches gauche/droite).
        role="group"
        aria-label="Nos équipements — faire défiler horizontalement"
        tabIndex={0}
      >
        <div className={styles.track}>
          {EQUIPMENT.map((equipment, index) => (
            <EquipmentCard key={`${equipment.name}-${index}`} equipment={equipment} />
          ))}
        </div>
      </div>

      <div className={styles.scrollbar}>
        <div className={styles.fill} style={{ width: `${fill}%` }} />
      </div>
    </section>
  );
}
