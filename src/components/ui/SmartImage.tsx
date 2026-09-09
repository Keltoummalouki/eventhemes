'use client';

import { useState } from 'react';
import { fallbackPhoto } from '@/lib/images';

type SmartImageProps = {
  src: string;
  alt: string;
  /** Graine du visuel de repli si la source distante échoue. */
  fallbackSeed: string;
  fallbackWidth?: number;
  fallbackHeight?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
};

/**
 * Balise <img> native avec repli gracieux, comme dans la maquette.
 *
 * On conserve volontairement <img> plutôt que next/image : les visuels sont
 * servis par des CDN externes, ils dépendent des filtres et transformations CSS
 * de la charte, et un repli `onError` est nécessaire tant que les photos
 * définitives d'AURÉLYS ne sont pas livrées.
 */
export default function SmartImage({
  src,
  alt,
  fallbackSeed,
  fallbackWidth = 900,
  fallbackHeight = 1100,
  className,
  loading = 'lazy',
  fetchPriority,
}: SmartImageProps) {
  const [failed, setFailed] = useState(false);

  return (
    <img
      src={failed ? fallbackPhoto(fallbackSeed, fallbackWidth, fallbackHeight) : src}
      alt={alt}
      className={className}
      loading={loading}
      fetchPriority={fetchPriority}
      decoding="async"
      // Un seul basculement possible : pas de boucle si le repli échoue aussi.
      onError={() => setFailed(true)}
    />
  );
}
