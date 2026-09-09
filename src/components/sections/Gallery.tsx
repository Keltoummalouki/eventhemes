'use client';

import { useState } from 'react';
import SectionHeader from '@/components/ui/SectionHeader';
import { ALL_CATEGORIES, GALLERY_ITEMS, type GalleryCategory } from '@/data/gallery';
import GalleryFilter from './GalleryFilter';
import GalleryItem from './GalleryItem';
import styles from './Gallery.module.css';

/**
 * Portfolio filtrable.
 *
 * Les vignettes exclues sont masquées (`display:none`) plutôt que démontées :
 * la mosaïque en colonnes se recompose ainsi exactement comme dans la maquette.
 */
export default function Gallery() {
  const [category, setCategory] = useState<GalleryCategory>(ALL_CATEGORIES);

  return (
    <section className="section-pad" id="realisations">
      <div className="container">
        <SectionHeader
          eyebrow="Portfolio"
          title="Nos réalisations"
          description="Un aperçu des cérémonies et événements que nous avons eu l'honneur d'orchestrer."
        />

        <GalleryFilter active={category} onChange={setCategory} />

        <div className={styles.masonry}>
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
