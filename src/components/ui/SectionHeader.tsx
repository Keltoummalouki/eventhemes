import { cx } from '@/lib/cx';
import Eyebrow from './Eyebrow';
import Reveal from './Reveal';
import styles from './SectionHeader.module.css';

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  /** Variante centrée (section « Ils nous ont fait confiance »). */
  centered?: boolean;
  /** Identifiant du titre, pour les `aria-labelledby` des sections. */
  titleId?: string;
};

/** En-tête commun à toutes les sections, révélé au défilement. */
export default function SectionHeader({
  eyebrow,
  title,
  description,
  centered = false,
  titleId,
}: SectionHeaderProps) {
  return (
    <Reveal className={cx(styles.head, centered && styles.centered)}>
      <Eyebrow centered={centered}>{eyebrow}</Eyebrow>
      <h2 id={titleId}>{title}</h2>
      {description ? <p>{description}</p> : null}
    </Reveal>
  );
}
