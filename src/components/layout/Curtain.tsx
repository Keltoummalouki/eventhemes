'use client';

import { useEffect, useState } from 'react';
import { SITE } from '@/data/site';
import { cx } from '@/lib/cx';
import styles from './Curtain.module.css';

/** Délai après chargement complet avant l'ouverture, comme dans la maquette. */
const OPEN_DELAY_MS = 250;
/** Filet de sécurité : le rideau ne doit jamais rester fermé. */
const MAX_WAIT_MS = 3000;

/** Rideau d'introduction joué une seule fois, au premier rendu de la page. */
export default function Curtain() {
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    let delayTimer = 0;
    const open = () => {
      delayTimer = window.setTimeout(() => setOpened(true), OPEN_DELAY_MS);
    };

    if (document.readyState === 'complete') {
      open();
    } else {
      window.addEventListener('load', open, { once: true });
    }

    const safetyTimer = window.setTimeout(() => setOpened(true), MAX_WAIT_MS);

    return () => {
      window.clearTimeout(delayTimer);
      window.clearTimeout(safetyTimer);
      window.removeEventListener('load', open);
    };
  }, []);

  return (
    <div className={cx(styles.curtain, opened && styles.opened)} aria-hidden="true">
      <div className={cx(styles.panel, styles.left)} />
      <div className={styles.mark}>{SITE.name}</div>
      <div className={cx(styles.panel, styles.right)} />
    </div>
  );
}
