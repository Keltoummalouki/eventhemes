import Reveal from '@/components/ui/Reveal';
import { STATS } from '@/data/stats';
import StatCounter from './StatCounter';
import styles from './Stats.module.css';

/** Preuve d'expérience : chiffres clés animés à l'entrée dans le viewport. */
export default function Stats() {
  return (
    <section className={styles.stats} aria-label="AURÉLYS en chiffres">
      <div className={styles.grid}>
        {STATS.map((stat) => (
          <Reveal key={stat.label} className={styles.stat}>
            <StatCounter value={stat.value} suffix={stat.suffix} className={styles.num} />
            <div className={styles.label}>{stat.label}</div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
