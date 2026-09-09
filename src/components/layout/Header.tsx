'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Button from '@/components/ui/Button';
import { NAV_LINKS } from '@/data/site';
import { useScrolled } from '@/hooks/useScrolled';
import { cx } from '@/lib/cx';
import { gsap, motionSafe, ScrollTrigger, useGSAP } from '@/lib/motion';
import MobileMenu from './MobileMenu';
import styles from './Header.module.css';

const MOBILE_MENU_ID = 'menu-mobile';
/** Point de rupture au-delà duquel la navigation complète est affichée. */
const DESKTOP_BREAKPOINT = 960;
/** Hauteur défilée avant que la barre ne puisse s'escamoter, en pixels. */
const HIDE_AFTER = 120;

export default function Header() {
  const scrolled = useScrolled(40);
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  /**
   * Miroir de `menuOpen` lisible depuis les rappels de défilement : le
   * `ScrollTrigger` est créé une seule fois et ne doit pas être reconstruit à
   * chaque ouverture du menu pour connaître son état.
   */
  const menuOpenRef = useRef(menuOpen);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  /**
   * La barre s'escamote quand on descend et revient dès qu'on remonte : elle
   * rend l'écran entier à la lecture — ce qui compte sur une page aussi
   * visuelle — tout en restant à un geste de portée.
   */
  useGSAP(
    () =>
      motionSafe(navRef, () => {
        const nav = navRef.current;
        if (!nav) return;

        const slide = gsap.quickTo(nav, 'yPercent', { duration: 0.45, ease: 'power2.out' });

        const hideOnScroll = ScrollTrigger.create({
          start: `top -${HIDE_AFTER}`,
          end: 'max',
          onUpdate: (self) => {
            // Menu mobile ouvert : la barre porte le bouton de fermeture, elle
            // ne doit sous aucun prétexte disparaître.
            if (menuOpenRef.current) return;
            slide(self.direction === -1 ? 0 : -100);
          },
          // Au retour tout en haut de page, la barre est toujours visible.
          onLeaveBack: () => slide(0),
        });

        const progress = gsap.to(`.${styles.progress}`, {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
        });

        return () => {
          hideOnScroll.kill();
          progress.scrollTrigger?.kill();
          progress.kill();
        };
      }),
    { scope: navRef },
  );

  // Le menu s'ouvre : la barre revient, même si elle venait de s'escamoter.
  useEffect(() => {
    menuOpenRef.current = menuOpen;
    if (menuOpen && navRef.current) gsap.to(navRef.current, { yPercent: 0, duration: 0.3 });
  }, [menuOpen]);

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
      <nav
        ref={navRef}
        className={cx(styles.nav, scrolled && styles.scrolled)}
        aria-label="Navigation principale"
      >
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
          className={cx(styles.burger, menuOpen && styles.burgerOpen)}
          aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={menuOpen}
          aria-controls={MOBILE_MENU_ID}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        {/* Avancement de la lecture — purement indicatif, donc hors de l'arbre
            d'accessibilité : la barre de défilement du navigateur dit déjà la
            même chose aux technologies d'assistance. */}
        <div className={styles.progress} aria-hidden="true" />
      </nav>

      <MobileMenu id={MOBILE_MENU_ID} open={menuOpen} links={NAV_LINKS} onNavigate={closeMenu} />
    </>
  );
}
