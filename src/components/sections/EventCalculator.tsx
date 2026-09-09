'use client';

import { useMemo, useState } from 'react';
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
import { estimateBudget, formatMAD } from '@/lib/pricing';
import styles from './EventCalculator.module.css';

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
            {/* La zone vivante est portée par le conteneur stable : le montant,
                lui, est remonté à chaque changement (`key`) pour relancer son
                animation de rafraîchissement. */}
            <div className={styles.price} aria-live="polite" aria-atomic="true">
              <small>Budget estimatif</small>
              <span key={price} className={styles.priceValue}>
                À partir de {formatMAD(price)}
              </span>
            </div>
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
