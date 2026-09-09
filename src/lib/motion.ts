'use client';

/* ==========================================================================
   AURÉLYS — Socle d'animation (GSAP)

   Point d'entrée unique : les plugins sont enregistrés une seule fois ici,
   et toutes les sections importent `gsap` depuis ce module plutôt que depuis
   le paquet, afin qu'aucune ne puisse s'exécuter avant l'enregistrement.

   Le vocabulaire de mouvement (durées, courbes, amplitudes) est centralisé
   dans `MOTION` : c'est lui qui donne à l'ensemble du site un rythme unique,
   posé et haut de gamme, plutôt qu'une collection d'effets sans parenté.
   ========================================================================== */

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(useGSAP, ScrollTrigger, Flip, SplitText);

export { Flip, gsap, ScrollTrigger, SplitText, useGSAP };

/** Grammaire de mouvement commune à toutes les sections. */
export const MOTION = {
  /** Courbe d'entrée : rapide au départ, longue à se poser. */
  ease: 'power3.out',
  /** Apparitions de contenu — volontairement lentes, dans l'esprit de la charte. */
  duration: 0.9,
  /** Décalage entre deux éléments d'une même série. */
  stagger: 0.07,
  /** Amplitude verticale d'une apparition, en pixels. */
  rise: 34,
  /** Position de déclenchement par défaut d'un `ScrollTrigger`. */
  start: 'top 82%',
} as const;

/** Media query : l'utilisateur n'a pas demandé de réduire les animations. */
export const FULL_MOTION = '(prefers-reduced-motion: no-preference)';
/** Media query : l'utilisateur demande explicitement moins de mouvement. */
export const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
/** Le défilement détourné (épinglage, parallaxe) est réservé au grand écran. */
export const DESKTOP = '(min-width: 960px)';

type Scope = React.RefObject<HTMLElement | null>;
/** Une routine d'animation peut renvoyer son propre nettoyage (écouteurs, découpages…). */
type Teardown = void | (() => void);

/**
 * Ornement : n'existe que si le système accepte le mouvement.
 *
 * À réserver aux effets purement décoratifs (parallaxe, défilement continu,
 * aimantation) : leur absence ne doit rien retirer au contenu.
 *
 * Renvoie la fonction de nettoyage attendue par `useGSAP` — si l'utilisateur
 * active « réduire les animations » en cours de route, `gsap.matchMedia` défait
 * l'effet et remet le DOM dans son état d'origine.
 */
export function motionSafe(scope: Scope, build: () => Teardown, query = FULL_MOTION) {
  const mm = gsap.matchMedia(scope);
  mm.add(query, build);
  return () => mm.revert();
}

/**
 * Apparition de contenu : toujours jouée, animée ou non.
 *
 * `build` reçoit `full = false` lorsque le mouvement est réduit ; il lui
 * revient alors d'afficher le contenu instantanément. Un bloc dévoilé au
 * défilement ne peut jamais rester invisible : c'est du contenu, pas un décor.
 */
export function revealSafe(scope: Scope, build: (full: boolean) => Teardown) {
  const mm = gsap.matchMedia(scope);
  mm.add({ full: FULL_MOTION, reduced: REDUCED_MOTION }, (context) =>
    build(Boolean(context.conditions?.full)),
  );
  return () => mm.revert();
}

/**
 * Lecture ponctuelle de la préférence de mouvement.
 *
 * À utiliser pour une animation déclenchée par une action (changement de filtre,
 * de vue), là où `motionSafe` / `revealSafe` ne conviennent pas : leur
 * `matchMedia` s'accumulerait à chaque déclenchement, `useGSAP` ne nettoyant pas
 * entre deux exécutions lorsqu'il a des dépendances.
 */
export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia(REDUCED_MOTION).matches;
}

/**
 * Recalcule les positions de déclenchement quand la page se stabilise.
 *
 * Les visuels proviennent de CDN externes et sont chargés en différé : sans ce
 * rafraîchissement, un `ScrollTrigger` calculé avant l'arrivée des images se
 * déclencherait à la mauvaise hauteur. Appelé une fois depuis <MotionRoot>.
 */
export function refreshOnAssetsReady() {
  const refresh = () => ScrollTrigger.refresh();

  // Polices : leur substitution modifie la hauteur des titres.
  document.fonts?.ready.then(refresh).catch(() => {});

  // Images : `load` en phase de capture couvre aussi celles chargées en différé.
  window.addEventListener('load', refresh);
  document.addEventListener('load', refresh, true);

  return () => {
    window.removeEventListener('load', refresh);
    document.removeEventListener('load', refresh, true);
  };
}
