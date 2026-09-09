'use client';

import { useEffect } from 'react';
import { refreshOnAssetsReady } from '@/lib/motion';

/**
 * Point d'entrée du moteur d'animation, monté une seule fois par page.
 *
 * Il ne rend rien : son rôle est de recalculer les positions de déclenchement
 * quand la page se stabilise. Les visuels viennent de CDN externes et les
 * polices sont substituées en cours de chargement — sans ce rafraîchissement,
 * une section épinglée calculée trop tôt se déclencherait à côté.
 */
export default function MotionRoot() {
  useEffect(refreshOnAssetsReady, []);
  return null;
}
