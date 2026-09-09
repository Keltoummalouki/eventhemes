'use client';

import { useCallback, useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import { NAV_LINKS } from '@/data/site';
import { useScrolled } from '@/hooks/useScrolled';
import { cx } from '@/lib/cx';
import MobileMenu from './MobileMenu';
import styles from './Header.module.css';

const MOBILE_MENU_ID = 'menu-mobile';
/** Point de rupture au-delà duquel la navigation complète est affichée. */
const DESKTOP_BREAKPOINT = 960;

export default function Header() {
  const scrolled = useScrolled(40);
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // Échap referme le menu.
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen, closeMenu]);

  // Le bouton d'ouverture disparaît en version bureau : on referme le menu au
  // passage du point de rupture pour ne pas rester bloqué dessus.
  useEffect(() => {
    if (!menuOpen) return;
    const mql = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`);
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) closeMenu();
    };
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [menuOpen, closeMenu]);

  return (
    <>
      <nav className={cx(styles.nav, scrolled && styles.scrolled)} aria-label="Navigation principale">
        <div className={styles.logo}>
          AUR<span>É</span>LYS
        </div>

        <ul className={styles.links}>
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>

        <Button href="#calculateur" variant="fill" className={styles.navCta}>
          Demander un devis
        </Button>

        <button
          type="button"
          className={styles.burger}
          aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={menuOpen}
          aria-controls={MOBILE_MENU_ID}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      <MobileMenu id={MOBILE_MENU_ID} open={menuOpen} links={NAV_LINKS} onNavigate={closeMenu} />
    </>
  );
}
