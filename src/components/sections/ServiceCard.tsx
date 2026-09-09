import SmartImage from '@/components/ui/SmartImage';
import { ArrowIcon } from '@/components/ui/icons';
import type { Service } from '@/data/services';
import styles from './Services.module.css';

type ServiceCardProps = {
  service: Service;
  /** Rang affiché sur la carte (01, 02, …). */
  position: number;
};

/**
 * Carte de service : visuel plein cadre, titre, description révélée au survol.
 *
 * Le calque `.frame` sert de prise à l'apparition au défilement (voir
 * Services.tsx) et laisse à l'image sa propre transformation de survol.
 */
export default function ServiceCard({ service, position }: ServiceCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.frame}>
        <SmartImage src={service.image} alt={service.title} fallbackSeed={service.fallbackSeed} />
      </div>
      <div className={styles.body}>
        <div className={styles.num}>{String(position).padStart(2, '0')}</div>
        <h3>{service.title}</h3>
        <div className={styles.desc}>
          <p>{service.description}</p>
          <span className={styles.link}>
            Découvrir <ArrowIcon />
          </span>
        </div>
      </div>
    </article>
  );
}
