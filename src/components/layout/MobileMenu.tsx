'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './MobileMenu.module.css';

type MobileMenuProps = {
  id: string;
  open: boolean;
  /** Paires [libellé, adresse] de la navigation principale. */
  links: readonly (readonly [string, string])[];
  current: string;
  /** Action principale, « Mon devis », gardée à portée de pouce. */
  action: ReactNode;
  socials: { id: string; title: string; url?: string }[];
  onNavigate: () => void;
};

/**
 * Navigation plein écran des petits écrans.
 *
 * Un cercle s'ouvre depuis le bouton du menu, puis les liens montent l'un après
 * l'autre. Fermé, le menu devient `inert` : ses liens sortent de l'ordre de
 * tabulation et des lecteurs d'écran, le `clip-path` ne les masquant que
 * visuellement.
 */
export default function MobileMenu({ id, open, links, current, action, socials, onNavigate }: MobileMenuProps) {
  return (
    <div id={id} className={cx(styles.menu, open && styles.open)} inert={!open}>
      <nav aria-label="Navigation mobile">
        <ol className={styles.links}>
          {links.map(([label, href], index) => (
            <li key={href} style={{ ['--i' as string]: index }}>
              <Link href={href} onClick={onNavigate} aria-current={current === href ? 'page' : undefined}>
                <span className={styles.index}>{String(index + 1).padStart(2, '0')}</span>
                {label}
              </Link>
            </li>
          ))}
        </ol>
      </nav>
      <div className={styles.foot} style={{ ['--i' as string]: links.length }}>
        {action}
        <div className={styles.socials}>
          {socials.map((social) => (
            <a key={social.id} href={social.url} target="_blank" rel="noreferrer" onClick={onNavigate}>
              {social.title} ↗
            </a>
          ))}
        </div>
        <p className={styles.signature}>Votre événement. Votre vision. Notre savoir-faire.</p>
      </div>
    </div>
  );
}
