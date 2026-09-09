'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import SectionHeader from '@/components/ui/SectionHeader';
import { EQUIPMENT } from '@/data/equipment';
import { cx } from '@/lib/cx';
import { DESKTOP, FULL_MOTION, gsap, motionSafe, useGSAP } from '@/lib/motion';
import EquipmentCard from './EquipmentCard';
import styles from './Equipment.module.css';

/** Part de la jauge déjà remplie au repos (identique à la maquette). */
const FILL_MIN = 0.16;

/** Amplitude du glissement interne des visuels, en pourcentage de leur largeur. */
const DRIFT = 5;

/**
 * Parc technique — rail horizontal.
 *
 * Deux modes, choisis selon les capacités et les préférences du visiteur :
 *
 * • Grand écran, mouvement accepté → la section est épinglée et le rail avance
 *   horizontalement au rythme du défilement vertical. C'est le geste le plus
 *   marquant de la page : le visiteur traverse le parc technique comme on
 *   longerait un plateau.
 *
 * • Mobile, ou mouvement réduit → défilement horizontal natif (doigt, pavé
 *   tactile, glisser à la souris). Détourner le défilement sur mobile se
 *   retourne contre l'utilisateur : le geste y est déjà horizontal.
 */
export default function Equipment() {
  const sectionRef = useRef<HTMLElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  /** Vrai lorsque GSAP a pris la main sur le défilement du rail. */
  const [pinned, setPinned] = useState(false);
  const [dragging, setDragging] = useState(false);
  /** Miroir synchrone de `dragging` : les événements pointeur précèdent le rendu. */
  const isDragging = useRef(false);
  const dragOrigin = useRef({ x: 0, scroll: 0 });

  /** Jauge de progression, commune aux deux modes. */
  const setFill = useCallback((progress: number) => {
    if (!fillRef.current) return;
    gsap.set(fillRef.current, { scaleX: FILL_MIN + (1 - FILL_MIN) * progress });
  }, []);

  /* ------------------------------------------------------------------ *
   * Mode épinglé — le défilement vertical fait avancer le rail.
   * ------------------------------------------------------------------ */
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

          /* Distance restant à parcourir. Recalculée à chaque rafraîchissement
             (`invalidateOnRefresh`) : la largeur du rail dépend des visuels,
             qui arrivent après le premier calcul. */
          const distance = () => Math.max(0, track.scrollWidth - wrap.clientWidth);

          const rail = gsap.to(track, {
            x: () => -distance(),
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              // Course verticale égale à la course horizontale : un pixel de
              // molette avance le rail d'un pixel, le geste reste lisible.
              end: () => `+=${distance()}`,
              pin: true,
              // Une seconde de rattrapage : le rail glisse au lieu de coller
              // à la barre de défilement.
              scrub: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => setFill(self.progress),
            },
          });

          // Chaque visuel dérive légèrement dans son cadre pendant la traversée :
          // c'est ce décalage qui donne de la profondeur au rail.
          for (const pan of gsap.utils.toArray<HTMLElement>(`.${styles.pan}`, track)) {
            gsap.fromTo(
              pan,
              { xPercent: -DRIFT },
              {
                xPercent: DRIFT,
                ease: 'none',
                scrollTrigger: {
                  trigger: pan,
                  // Indispensable : sans cela, le déclencheur mesurerait la
                  // position verticale d'un élément qui ne bouge qu'en x.
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

  /* ------------------------------------------------------------------ *
   * Mode natif — défilement horizontal classique.
   * ------------------------------------------------------------------ */
  const onScroll = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap || pinned) return;
    const max = wrap.scrollWidth - wrap.clientWidth;
    setFill(max > 0 ? wrap.scrollLeft / max : 0);
  }, [pinned, setFill]);

  /**
   * Défilement par glisser-déposer à la souris. Le pavé tactile et l'écran
   * tactile sont déjà couverts par le défilement natif ; la souris ne l'est
   * pas, puisque la barre de défilement est masquée par la charte.
   *
   * `preventDefault` est indispensable : sans lui, appuyer sur une vignette
   * déclenche le glisser-déposer natif de l'image, qui annule le pointeur.
   */
  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pinned || event.pointerType !== 'mouse' || event.button !== 0) return;
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
    <section className={styles.equip} id="equipements" ref={sectionRef}>
      <div className={styles.stage}>
        <div className="container">
          <SectionHeader
            eyebrow="Notre parc technique"
            title="Nos équipements"
            description="Un matériel professionnel de dernière génération, entretenu et opéré par notre équipe technique."
          />
        </div>

        <div
          ref={wrapRef}
          className={cx(styles.trackWrap, pinned && styles.locked, dragging && styles.dragging)}
          onScroll={onScroll}
          onPointerDown={onPointerDown}
          // En mode épinglé le rail n'a plus de défilement propre : il ne doit
          // donc plus se présenter au clavier comme une zone défilable.
          {...(pinned
            ? {}
            : {
                role: 'group',
                'aria-label': 'Nos équipements — faire défiler horizontalement',
                tabIndex: 0,
              })}
        >
          <div className={styles.track} ref={trackRef}>
            {EQUIPMENT.map((equipment, index) => (
              <EquipmentCard key={`${equipment.name}-${index}`} equipment={equipment} />
            ))}
          </div>
        </div>

        <div className={styles.scrollbar}>
          <div className={styles.fill} ref={fillRef} />
        </div>
      </div>
    </section>
  );
}
