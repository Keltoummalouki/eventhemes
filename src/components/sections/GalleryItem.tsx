import SmartImage from '@/components/ui/SmartImage';
import type { GalleryItem as GalleryItemData } from '@/data/gallery';
import { cx } from '@/lib/cx';
import styles from './Gallery.module.css';

type GalleryItemProps = {
  item: GalleryItemData;
  hidden: boolean;
};

/** Vignette de réalisation : visuel, catégorie et titre révélés au survol. */
export default function GalleryItem({ item, hidden }: GalleryItemProps) {
  return (
    <figure
      className={cx(styles.item, hidden && styles.hidden)}
      style={{ height: `${item.height}px` }}
      // Retiré de l'ordre de lecture lorsque le filtre l'exclut.
      aria-hidden={hidden || undefined}
    >
      <SmartImage src={item.image} alt={item.title} fallbackSeed={item.fallbackSeed} />
      <figcaption className={styles.overlay}>
        <span className={styles.cat}>{item.category}</span>
        <h4>{item.title}</h4>
      </figcaption>
    </figure>
  );
}
