"use client";

import { useState } from "react";
import { cx } from "@/lib/cx";
import s from "./Chart.module.css";

/**
 * Une marque de graphique : un libellé, une valeur et, si elle a un sens, la
 * part qu'elle représente. `muted` réserve la teinte dorée aux lignes qui
 * portent l'information et met la ligne de contexte en retrait.
 */
export type ChartDatum = {
  id: string;
  label: string;
  value: number;
  share?: number;
  caption?: string;
  muted?: boolean;
};

const integer = (value: number) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(value);
const share = (value: number) =>
  new Intl.NumberFormat("fr-FR", { style: "percent", maximumFractionDigits: 0 }).format(value);

/**
 * Classement horizontal : la longueur compare, le texte nomme. Les barres
 * partagent une seule teinte — leur ordre est déjà donné par la liste.
 */
export function BarList({
  items,
  format = integer,
  showShare = false,
  empty = "Aucune donnée pour le moment.",
  className,
}: {
  items: ChartDatum[];
  format?: (value: number) => string;
  /** Ajoute la part du total à côté de la valeur (répartitions). */
  showShare?: boolean;
  empty?: string;
  className?: string;
}) {
  if (!items.length) return <p className={cx(s.chart, s.chartEmpty, className)}>{empty}</p>;
  const max = Math.max(...items.map((item) => item.value), 1);
  return (
    <ul className={cx(s.chart, s.barList, className)}>
      {items.map((item) => (
        <li key={item.id} className={s.barRow}>
          <span className={s.barHead}>
            <span className={s.barLabel}>
              {item.label}
              {item.caption && <small className={s.barCaption}>{item.caption}</small>}
            </span>
            <span className={s.barValue}>
              {format(item.value)}
              {showShare && item.share != null && (
                <span className={s.barShare}>{share(item.share)}</span>
              )}
            </span>
          </span>
          <span className={s.barTrack} aria-hidden="true">
            <span
              className={s.barFill}
              data-muted={item.muted ? "" : undefined}
              style={{ width: `${Math.max(item.value > 0 ? 1.5 : 0, (item.value / max) * 100)}%` }}
            />
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Série mensuelle en colonnes. Le survol, le focus clavier et le toucher
 * alimentent la même lecture au-dessus du graphique : aucune infobulle
 * flottante à viser, et chaque colonne annonce sa valeur aux lecteurs d'écran.
 */
export function Columns<
  T extends { key: string; label: string; title: string; value: number },
>({
  points,
  label,
  format = integer,
  detail,
  empty = "Aucune donnée pour le moment.",
  className,
}: {
  points: T[];
  /** Ce que compte la série : « demandes », « événements »… */
  label: string;
  format?: (value: number) => string;
  /** Complément de la lecture, par exemple le montant estimé du mois. */
  detail?: (point: T) => string | undefined;
  empty?: string;
  className?: string;
}) {
  const [active, setActive] = useState<string | null>(null);
  if (!points.length) return <p className={cx(s.chart, s.chartEmpty, className)}>{empty}</p>;
  const max = Math.max(...points.map((point) => point.value), 1);
  const shown = points.find((point) => point.key === active) ?? null;
  const total = points.reduce((sum, point) => sum + point.value, 0);
  return (
    <div className={cx(s.chart, s.columns, className)}>
      <p className={s.columnsHead}>
        <span className={s.readout}>
          {shown ? (
            <>
              <b>
                {format(shown.value)} {label}
              </b>{" "}
              · {shown.title}
              {detail?.(shown) ? ` · ${detail(shown)}` : ""}
            </>
          ) : (
            <>
              <b>
                {format(total)} {label}
              </b>{" "}
              sur douze mois
            </>
          )}
        </span>
        <span className={s.scale}>Maximum {format(max)}</span>
      </p>
      <div className={s.plot}>
        {points.map((point) => (
          <button
            key={point.key}
            type="button"
            className={s.column}
            data-active={active === point.key ? "" : undefined}
            aria-label={`${point.title} : ${format(point.value)} ${label}`}
            onMouseEnter={() => setActive(point.key)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(point.key)}
            onBlur={() => setActive(null)}
          >
            <span
              className={s.columnFill}
              data-empty={point.value ? undefined : ""}
              style={{ height: point.value ? `${Math.max(2, (point.value / max) * 100)}%` : "1px" }}
            />
          </button>
        ))}
      </div>
      <p className={s.axis} aria-hidden="true">
        {points.map((point) => (
          <span key={point.key}>{point.label}</span>
        ))}
      </p>
    </div>
  );
}

/** Jauge : une valeur rapportée à sa limite, avec la phrase qui l'explique. */
export function Meter({
  label,
  value,
  display,
  caption,
  className,
}: {
  label: string;
  /** Part remplie, de 0 à 1. `null` : la mesure n'a pas encore de sens. */
  value: number | null;
  /** Texte affiché à la place du pourcentage (« 12 / 30 », « 4,5 jours »). */
  display?: string;
  caption?: string;
  className?: string;
}) {
  const filled = value == null ? 0 : Math.min(1, Math.max(0, value));
  return (
    <div className={cx(s.chart, s.meter, className)}>
      <p className={s.meterHead}>
        <span className={s.meterLabel}>{label}</span>
        <strong className={s.meterValue}>{display ?? (value == null ? "—" : share(value))}</strong>
      </p>
      <span className={s.meterTrack} aria-hidden="true">
        <span className={s.meterFill} style={{ width: `${filled * 100}%` }} />
      </span>
      {caption && <span className={s.meterCaption}>{caption}</span>}
    </div>
  );
}
