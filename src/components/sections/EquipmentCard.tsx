import SmartImage from '@/components/ui/SmartImage';
import type { Equipment } from '@/data/equipment';
import styles from './Equipment.module.css';

/**
 * Vignette verticale du rail d'équipements.
 *
 * Le calque `.pan` sert de prise à la dérive horizontale pilotée par GSAP
 * pendant la traversée ; l'image conserve ainsi sa propre transformation de
 * survol, sans que les deux effets ne se disputent la même propriété.
 */
export default function EquipmentCard({ equipment }: { equipment: Equipment }) {
  return (
    <article className={styles.card}>
      <div className={styles.thumb}>
        <div className={styles.pan}>
          <SmartImage src={equipment.image} alt={equipment.name} fallbackSeed={equipment.fallbackSeed} />
        </div>
      </div>
      <div className={styles.name}>{equipment.name}</div>
    </article>
  );
}
