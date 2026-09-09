import Reveal from '@/components/ui/Reveal';
import SectionHeader from '@/components/ui/SectionHeader';
import { PROCESS_STEPS } from '@/data/process';
import styles from './ProcessTimeline.module.css';

/**
 * « Comment ça marche ? » — les cinq temps de l'accompagnement.
 *
 * Les étapes sont des blocs frères directs de `.list` (et non une liste `<ol>`)
 * afin de conserver le filet de séparation `:last-child` de la maquette ; leur
 * ordre est déjà porté visuellement et textuellement par les numéros 01 → 05.
 */
export default function ProcessTimeline() {
  return (
    <section className={styles.timeline} id="methode">
      <div className="container">
        <SectionHeader
          eyebrow="Notre process"
          title="Comment ça marche ?"
          description="Un accompagnement structuré, de la première rencontre à la réalisation de votre événement."
        />

        <div className={styles.list}>
          {PROCESS_STEPS.map((step, index) => (
            <Reveal key={step.title} className={styles.item}>
              <div className={styles.num}>{String(index + 1).padStart(2, '0')}</div>
              <div className={styles.body}>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
              <div className={styles.bar} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
