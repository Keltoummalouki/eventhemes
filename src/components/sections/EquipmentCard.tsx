import SmartImage from '@/components/ui/SmartImage';
import type { Equipment } from '@/data/equipment';
import styles from './Equipment.module.css';

/** Vignette verticale du carrousel d'équipements. */
export default function EquipmentCard({ equipment }: { equipment: Equipment }) {
  return (
    <article className={styles.card}>
      <div className={styles.thumb}>
        <SmartImage src={equipment.image} alt={equipment.name} fallbackSeed={equipment.fallbackSeed} />
      </div>
      <div className={styles.name}>{equipment.name}</div>
    </article>
  );
}
