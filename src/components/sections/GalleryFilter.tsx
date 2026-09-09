'use client';

import { GALLERY_CATEGORIES, type GalleryCategory } from '@/data/gallery';
import { cx } from '@/lib/cx';
import styles from './Gallery.module.css';

type GalleryFilterProps = {
  active: GalleryCategory;
  onChange: (category: GalleryCategory) => void;
};

/** Barre de filtres du portfolio. */
export default function GalleryFilter({ active, onChange }: GalleryFilterProps) {
  return (
    <div className={styles.filters} role="group" aria-label="Filtrer les réalisations par catégorie">
      {GALLERY_CATEGORIES.map((category) => (
        <button
          key={category}
          type="button"
          className={cx(styles.filter, category === active && styles.active)}
          aria-pressed={category === active}
          onClick={() => onChange(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
