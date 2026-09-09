'use client';

import type { ReactNode } from 'react';
import { useReveal } from '@/hooks/useReveal';
import { cx } from '@/lib/cx';

type RevealProps = {
  children: ReactNode;
  className?: string;
  id?: string;
};

/**
 * Conteneur qui se dévoile en entrant dans le viewport.
 *
 * L'attribut `data-in` est consommé par l'utilitaire global `.reveal`, mais
 * aussi par certains modules (frise, séparateur) qui animent leurs enfants.
 */
export default function Reveal({ children, className, id }: RevealProps) {
  const { ref, inView } = useReveal<HTMLDivElement>();

  return (
    <div ref={ref} id={id} className={cx('reveal', className)} data-in={inView ? '' : undefined}>
      {children}
    </div>
  );
}
