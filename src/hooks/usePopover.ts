'use client';

import { useEffect, useEffectEvent, useLayoutEffect, type RefObject } from 'react';

/** Espace minimal gardé entre un panneau flottant et le bord de la fenêtre. */
const EDGE = 12;

/**
 * Ferme un panneau flottant (liste, menu, calendrier) lorsqu'on touche ou
 * clique en dehors de `root`. Le toucher est indispensable sur iOS, où un
 * appui sur une zone inerte ne retire pas le focus.
 */
export function useDismiss(
  root: RefObject<HTMLElement | null>,
  open: boolean,
  onDismiss: () => void,
) {
  const dismiss = useEffectEvent(onDismiss);

  useEffect(() => {
    if (!open) return;
    const handle = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) dismiss();
    };
    document.addEventListener('pointerdown', handle);
    return () => document.removeEventListener('pointerdown', handle);
  }, [open, root]);
}

/**
 * Place le panneau là où il tient : au-dessus du déclencheur quand la place
 * manque en dessous, aligné à droite quand il déborderait de l'écran.
 *
 * Le résultat est posé en `data-side` / `data-align` sur le panneau, avant
 * l'affichage : c'est la feuille de style qui le positionne, sans rendu
 * supplémentaire.
 */
export function useFlip(
  anchor: RefObject<HTMLElement | null>,
  panel: RefObject<HTMLElement | null>,
  open: boolean,
) {
  useLayoutEffect(() => {
    const trigger = anchor.current;
    const floating = panel.current;
    if (!open || !trigger || !floating) return;

    const place = () => {
      const box = trigger.getBoundingClientRect();
      const below = window.innerHeight - box.bottom;
      const tooLow = below < floating.offsetHeight + EDGE && box.top > below;
      const tooWide = box.left + floating.offsetWidth > window.innerWidth - EDGE;
      floating.setAttribute('data-side', tooLow ? 'top' : 'bottom');
      floating.setAttribute('data-align', tooWide ? 'end' : 'start');
    };

    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, anchor, panel]);
}
