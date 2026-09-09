import Reveal from '@/components/ui/Reveal';
import { STATS } from '@/data/stats';
import StatCounter from './StatCounter';
import styles from './Stats.module.css';

/**
 * Preuve d'expérience : les quatre chiffres clés.
 *
 * Les cellules entrent l'une après l'autre, de gauche à droite, puis chaque
 * chiffre se compte — le bandeau se lit comme une phrase, pas comme un bloc.
 */
export default function Stats() {
  return (
    <section className={styles.stats} aria-label="AURÉLYS en chiffres">
      <Reveal className={styles.grid} stagger>
        {STATS.map((stat) => (
          <div key={stat.label} className={styles.stat}>
            <StatCounter value={stat.value} suffix={stat.suffix} className={styles.num} />
            <div className={styles.label}>{stat.label}</div>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
