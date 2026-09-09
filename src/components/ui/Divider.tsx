import Reveal from './Reveal';
import styles from './Divider.module.css';

/** Ornement de transition entre deux sections. */
export default function Divider() {
  return (
    <Reveal className={styles.divider}>
      <svg viewBox="0 0 220 26" aria-hidden="true" focusable="false">
        <path d="M0 13 Q55 -6 110 13 T220 13" />
      </svg>
    </Reveal>
  );
}
