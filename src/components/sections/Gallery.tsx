'use client';

import { useRef, useState } from 'react';
import SectionHeader from '@/components/ui/SectionHeader';
import { ALL_CATEGORIES, GALLERY_ITEMS, type GalleryCategory } from '@/data/gallery';
import { Flip, gsap, MOTION, prefersReducedMotion, revealSafe, useGSAP } from '@/lib/motion';
import GalleryFilter from './GalleryFilter';
import GalleryItem from './GalleryItem';
import styles from './Gallery.module.css';

/**
 * Portfolio filtrable.
 *
 * Les vignettes exclues sont masquées (`display:none`) plutôt que démontées :
 * la mosaïque en colonnes se recompose ainsi exactement comme dans la maquette.
 *
 * Le changement de filtre est joué avec Flip : on relève la position de chaque
 * vignette avant le rendu, et GSAP anime l'écart jusqu'à la nouvelle mise en
 * page. Le visiteur suit donc du regard les projets qui restent, au lieu de
 * voir la grille se reconstruire d'un coup — c'est ce qui rend le filtre
 * lisible plutôt que déroutant.
 */
export default function Gallery() {
  const [category, setCategory] = useState<GalleryCategory>(ALL_CATEGORIES);
  const gridRef = useRef<HTMLDivElement>(null);
  /** Positions relevées juste avant le changement de filtre. */
  const previous = useRef<Flip.FlipState | null>(null);

  const onFilterChange = (next: GalleryCategory) => {
    if (next === category) return;
    const grid = gridRef.current;
    // Le relevé doit précéder le rendu : une fois React passé, les anciennes
    // positions n'existent plus.
    if (grid) previous.current = Flip.getState(Array.from(grid.children));
    setCategory(next);
  };

  /* Recomposition de la mosaïque, après chaque changement de filtre. */
  useGSAP(
    () => {
      const state = previous.current;
      previous.current = null;
      // Mouvement réduit : la nouvelle grille est déjà en place, on s'arrête là.
      if (!state || prefersReducedMotion()) return;

      Flip.from(state, {
        duration: 0.7,
        ease: 'power2.inOut',
        // Les vignettes qui sortent passent en position absolue le temps de
        // s'effacer : elles ne retiennent plus la hauteur des colonnes, et
        // celles qui restent glissent tout de suite à leur nouvelle place.
        absoluteOnLeave: true,
        onEnter: (entering) =>
          gsap.fromTo(
            entering,
            { autoAlpha: 0, scale: 0.94 },
            { autoAlpha: 1, scale: 1, duration: 0.5, ease: MOTION.ease, stagger: 0.035 },
          ),
        onLeave: (leaving) =>
          gsap.to(leaving, { autoAlpha: 0, scale: 0.94, duration: 0.35, ease: 'power2.in' }),
      });
    },
    { scope: gridRef, dependencies: [category] },
  );

  /* Première apparition, au défilement. */
  useGSAP(
    () =>
      revealSafe(gridRef, (full) => {
        const grid = gridRef.current;
        if (!grid) return;
        const tiles = Array.from(grid.children);

        if (!full) {
          gsap.set(tiles, { autoAlpha: 1, y: 0 });
          return;
        }

        // État d'arrivée déclaré explicitement : avec `from`, une seconde
        // exécution de l'effet relirait l'opacité 0 laissée par la première et
        // les vignettes n'apparaîtraient jamais.
        gsap.fromTo(
          tiles,
          { autoAlpha: 0, y: 40 },
          {
            autoAlpha: 1,
            y: 0,
            duration: MOTION.duration,
            ease: MOTION.ease,
            stagger: 0.05,
            scrollTrigger: { trigger: grid, start: 'top 88%', once: true },
          },
        );
      }),
    { scope: gridRef },
  );

  return (
    <section className="section-pad" id="realisations">
      <div className="container">
        <SectionHeader
          eyebrow="Portfolio"
          title="Nos réalisations"
          description="Un aperçu des cérémonies et événements que nous avons eu l'honneur d'orchestrer."
        />

        <GalleryFilter active={category} onChange={onFilterChange} />

        <div className={styles.masonry} ref={gridRef}>
          {GALLERY_ITEMS.map((item, index) => (
            <GalleryItem
              key={`${item.title}-${index}`}
              item={item}
              hidden={category !== ALL_CATEGORIES && item.category !== category}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
