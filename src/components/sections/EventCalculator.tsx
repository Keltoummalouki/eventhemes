'use client';

import { useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import Button from '@/components/ui/Button';
import Eyebrow from '@/components/ui/Eyebrow';
import Reveal from '@/components/ui/Reveal';
import SectionHeader from '@/components/ui/SectionHeader';
import {
  CALCULATOR_DEFAULTS,
  CALCULATOR_SERVICES,
  EVENT_TYPES,
  GUESTS_RANGE,
  SERVICE_LEVELS,
  VENUES,
  type CalculatorService,
  type EventType,
  type Venue,
} from '@/data/calculator';
import { cx } from '@/lib/cx';
import { gsap, prefersReducedMotion, useGSAP } from '@/lib/motion';
import { estimateBudget, formatMAD } from '@/lib/pricing';
import styles from './EventCalculator.module.css';

/** Durée du recomptage du montant, en secondes. */
const RECOUNT_SECONDS = 0.7;

type ChipProps = {
  children: ReactNode;
  selected: boolean;
  onClick: () => void;
};

function Chip({ children, selected, onClick }: ChipProps) {
  return (
    <button
      type="button"
      className={cx(styles.chip, selected && styles.active)}
      aria-pressed={selected}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default function EventCalculator() {
  const [eventType, setEventType] = useState<EventType>(CALCULATOR_DEFAULTS.eventType);
  const [guests, setGuests] = useState<number>(CALCULATOR_DEFAULTS.guests);
  const [venue, setVenue] = useState<Venue>(CALCULATOR_DEFAULTS.venue);
  const [services, setServices] = useState<readonly CalculatorService[]>(CALCULATOR_DEFAULTS.services);
  const [level, setLevel] = useState<string>(CALCULATOR_DEFAULTS.level);

  const price = useMemo(() => {
    const multiplier = SERVICE_LEVELS.find((item) => item.label === level)?.multiplier ?? 1;
    // Le type d'événement et le lieu sont mémorisés pour la demande de devis :
    // ils n'entrent pas encore dans le calcul indicatif.
    return estimateBudget({ guests, servicesCount: services.length, levelMultiplier: multiplier });
  }, [guests, services.length, level]);

  const toggleService = (service: CalculatorService) => {
    setServices((current) =>
      current.includes(service) ? current.filter((item) => item !== service) : [...current, service],
    );
  };

  /** Position du curseur d'invités, pour la portion dorée du rail. */
  const guestsRatio = (guests - GUESTS_RANGE.min) / (GUESTS_RANGE.max - GUESTS_RANGE.min);

  const amountRef = useRef<HTMLSpanElement>(null);
  /** Valeur réellement affichée : un nouveau réglage repart d'où le précédent s'est arrêté. */
  const shown = useRef({ amount: price });

  /**
   * Le montant se recompte au lieu de sauter d'un chiffre à l'autre.
   *
   * C'est ce qui rend le simulateur lisible : le visiteur voit dans quel sens
   * et de combien son choix déplace l'estimation, plutôt que de devoir comparer
   * deux nombres de mémoire.
   */
  useGSAP(
    () => {
      const amount = amountRef.current;
      if (!amount) return;

      if (prefersReducedMotion()) {
        shown.current.amount = price;
        amount.textContent = formatMAD(price);
        return;
      }

      gsap.to(shown.current, {
        amount: price,
        duration: RECOUNT_SECONDS,
        ease: 'power2.out',
        // Un réglage peut en chasser un autre (glissement du curseur d'invités) :
        // le décompte en cours cède la place plutôt que de s'additionner.
        overwrite: true,
        onUpdate: () => {
          amount.textContent = formatMAD(shown.current.amount);
        },
      });
    },
    { dependencies: [price] },
  );

  return (
    <section className={cx('section-pad', styles.calc)} id="calculateur">
      <div className="container">
        <SectionHeader
          eyebrow="Simulation"
          title="Imaginez votre événement"
          description="Composez librement les grandes lignes de votre projet et obtenez une première estimation."
        />

        <Reveal className={styles.panel}>
          <div>
            <div className={styles.group}>
              <span className={styles.groupLabel} id="label-type">
                Type d&apos;événement
              </span>
              <div className={styles.chipRow} role="group" aria-labelledby="label-type">
                {EVENT_TYPES.map((type) => (
                  <Chip key={type} selected={type === eventType} onClick={() => setEventType(type)}>
                    {type}
                  </Chip>
                ))}
              </div>
            </div>

            <div className={styles.group}>
              <label className={styles.groupLabel} htmlFor="calc-invites">
                Nombre d&apos;invités — <span>{guests}</span> personnes
              </label>
              <div className={styles.rangeWrap}>
                <input
                  id="calc-invites"
                  className={styles.range}
                  // La portion parcourue du rail se colore en or : le curseur
                  // n'est plus un point isolé sur un filet, il a une course.
                  style={{ '--range-fill': `${guestsRatio * 100}%` } as React.CSSProperties}
                  type="range"
                  min={GUESTS_RANGE.min}
                  max={GUESTS_RANGE.max}
                  step={GUESTS_RANGE.step}
                  value={guests}
                  aria-valuetext={`${guests} personnes`}
                  onChange={(event) => setGuests(Number(event.target.value))}
                />
              </div>
            </div>

            <div className={styles.group}>
              <label className={styles.groupLabel} htmlFor="calc-lieu">
                Lieu
              </label>
              <div className={styles.selectLine}>
                <select
                  id="calc-lieu"
                  className={styles.select}
                  value={venue}
                  onChange={(event) => setVenue(event.target.value as Venue)}
                >
                  {VENUES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.group}>
              <span className={styles.groupLabel} id="label-services">
                Services souhaités
              </span>
              <div className={styles.chipRow} role="group" aria-labelledby="label-services">
                {CALCULATOR_SERVICES.map((service) => (
                  <Chip
                    key={service}
                    selected={services.includes(service)}
                    onClick={() => toggleService(service)}
                  >
                    {service}
                  </Chip>
                ))}
              </div>
            </div>

            <div className={styles.group}>
              <span className={styles.groupLabel} id="label-niveau">
                Niveau de prestation
              </span>
              <div className={styles.chipRow} role="group" aria-labelledby="label-niveau">
                {SERVICE_LEVELS.map((serviceLevel) => (
                  <Chip
                    key={serviceLevel.label}
                    selected={serviceLevel.label === level}
                    onClick={() => setLevel(serviceLevel.label)}
                  >
                    {serviceLevel.label}
                  </Chip>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.result}>
            <Eyebrow className={styles.resultEyebrow}>Aperçu</Eyebrow>
            {/* Le montant visible est réécrit image par image par le décompte
                GSAP : le placer dans une zone vivante ferait énoncer chacune
                des valeurs intermédiaires. L'annonce est donc confiée au
                doublon ci-dessous, qui ne porte que le résultat. */}
            <div className={styles.price} aria-hidden="true">
              <small>Budget estimatif</small>
              <span className={styles.priceValue}>
                À partir de <span ref={amountRef}>{formatMAD(price)}</span>
              </span>
            </div>
            <p className="visually-hidden" aria-live="polite" aria-atomic="true">
              Budget estimatif : à partir de {formatMAD(price)}
            </p>
            <p className={styles.note}>
              Cette estimation évolue selon vos choix. Elle sera affinée avec vous lors d&apos;un échange
              personnalisé avec notre équipe.
            </p>
            <Button href="#contact" variant="fill" className={styles.resultBtn}>
              Personnaliser mon événement
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
