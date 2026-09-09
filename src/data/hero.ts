import { unsplashPhoto } from '@/lib/images';
import { SITE } from './site';

export type HeroSlide = {
  src: string;
  fallbackSeed: string;
};

/** Diaporama d'accueil — visuels de la maquette approuvée. */
export const HERO_SLIDES: readonly HeroSlide[] = [
  '1519741497674-611481863552',
  '1465495976277-4387d4b0b4c6',
  '1478146059778-26028b07395a',
  '1522673607200-164d1b6ce486',
  '1519225421980-715cb0215aed',
].map((photoId, index) => ({
  src: unsplashPhoto(photoId, 1800),
  fallbackSeed: `aurelys-hero${index}`,
}));

/** Durée d'affichage d'une vue, en millisecondes. */
export const HERO_INTERVAL_MS = 6000;

export const HERO_CONTENT = {
  /** Le titre d'accueil porte la promesse de marque. */
  heading: SITE.promise,
  description:
    'Nous imaginons et réalisons des événements uniques, conçus autour de vos envies et de vos émotions.',
  primaryCta: { label: 'Découvrir nos services', href: '#services' },
  secondaryCta: { label: 'Personnaliser mon événement', href: '#calculateur' },
  scrollLabel: 'Défiler',
} as const;
