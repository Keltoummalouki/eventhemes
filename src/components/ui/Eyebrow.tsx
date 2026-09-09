import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './Eyebrow.module.css';

type EyebrowProps = {
  children: ReactNode;
  centered?: boolean;
  className?: string;
};

/** Sur-titre doré utilisé en tête de chaque section. */
export default function Eyebrow({ children, centered = false, className }: EyebrowProps) {
  return <span className={cx(styles.eyebrow, centered && styles.centered, className)}>{children}</span>;
}
