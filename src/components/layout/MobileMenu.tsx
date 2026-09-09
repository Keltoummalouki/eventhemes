'use client';

import type { NavLink } from '@/data/site';
import { cx } from '@/lib/cx';
import styles from './MobileMenu.module.css';

type MobileMenuProps = {
  id: string;
  open: boolean;
  links: readonly NavLink[];
  onNavigate: () => void;
};

/**
 * Navigation plein écran des petits écrans.
 *
 * Fermé, le menu reste dans le flux mais devient `inert` : ses liens sortent de
 * l'ordre de tabulation et du lecteur d'écran, alors que le découpage `clip-path`
 * les masque seulement visuellement.
 */
export default function MobileMenu({ id, open, links, onNavigate }: MobileMenuProps) {
  return (
    <nav
      id={id}
      className={cx(styles.menu, open && styles.open)}
      aria-label="Navigation mobile"
      inert={!open}
    >
      {links.map((link) => (
        <a key={link.href} href={link.href} onClick={onNavigate}>
          {link.label}
        </a>
      ))}
    </nav>
  );
}
