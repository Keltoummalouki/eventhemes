'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { CalendarIcon, ChevronIcon } from '@/components/ui/icons';
import { formText } from '@/data/ui';
import { useDismiss, useFlip } from '@/hooks/usePopover';
import { cx } from '@/lib/cx';
import Field, { FormValue, useFieldIds, type FieldProps } from './Field';
import s from './controls.module.css';
import c from './DatePicker.module.css';

export type YearPickerProps = FieldProps & {
  /**
   * Année « AAAA », ou chaîne vide. Un ancien texte libre (« Juin 2026 ») reste
   * affiché tel quel tant qu'aucune année n'est choisie.
   */
  value: string;
  onChange: (value: string) => void;
  /** Première année possible. */
  min?: number;
  /** Dernière année possible. */
  max?: number;
  placeholder?: string;
  /** Nom du champ lors d'un envoi par FormData. */
  name?: string;
  id?: string;
  disabled?: boolean;
  /** Nom accessible lorsqu'aucun libellé n'est affiché. */
  'aria-label'?: string;
};

const COLUMNS = 3;

const decadeOf = (year: number) => Math.floor(year / 10) * 10;

/** Douze cases : la décennie, encadrée par la dernière année de la précédente et la première de la suivante. */
function decadeGrid(year: number): number[][] {
  const first = decadeOf(year) - 1;
  return Array.from({ length: 4 }, (_, row) =>
    Array.from({ length: COLUMNS }, (_, col) => first + row * COLUMNS + col),
  );
}

/** Déplacements clavier dans la grille (même logique que le calendrier du DatePicker). */
const KEY_MOVES: Record<string, (year: number) => number> = {
  ArrowLeft: (year) => year - 1,
  ArrowRight: (year) => year + 1,
  ArrowUp: (year) => year - COLUMNS,
  ArrowDown: (year) => year + COLUMNS,
  Home: decadeOf,
  End: (year) => decadeOf(year) + 9,
  PageUp: (year) => year - 10,
  PageDown: (year) => year + 10,
};

/**
 * Sélecteur d'année aux couleurs de la marque : une décennie par page,
 * bornes `min` / `max`, identique sur tous les navigateurs.
 *
 * Clavier : flèches (année, ligne), Début / Fin (décennie), Page↑ / Page↓
 * (décennie voisine), Entrée / Espace pour choisir, Échap pour fermer.
 */
export default function YearPicker({
  value,
  onChange,
  min,
  max,
  placeholder = formText.yearPlaceholder,
  name,
  id,
  disabled,
  label,
  hideLabel,
  hint,
  error,
  required,
  className,
  'aria-label': ariaLabel,
}: YearPickerProps) {
  const now = new Date().getFullYear();
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(now);
  const [missing, setMissing] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLTableElement>(null);
  /** L'année ciblée doit recevoir le focus (clavier, ouverture) — pas après un clic sur « décennie suivante ». */
  const focusYear = useRef(false);

  const shownError = error || (missing && !value ? formText.yearRequired : undefined);
  const ids = useFieldIds(id, hint, shownError);
  const dialogId = `${ids.control}-years`;
  const captionId = `${ids.control}-caption`;

  const match = value.match(/\b\d{4}\b/);
  const selected = match ? Number(match[0]) : null;
  const decade = decadeOf(focused);
  const outOfRange = (year: number) =>
    (min != null && year < min) || (max != null && year > max);
  const clamp = (year: number) =>
    Math.min(Math.max(year, min ?? year), max ?? year);
  // Décennies voisines accessibles seulement si elles contiennent une année permise.
  const canGoBack = min == null || decade - 1 >= min;
  const canGoForward = max == null || decade + 10 <= max;

  useDismiss(rootRef, open, () => setOpen(false));
  useFlip(triggerRef, panelRef, open);

  useEffect(() => {
    if (open && focusYear.current) {
      gridRef.current?.querySelector<HTMLElement>('button[tabindex="0"]')?.focus();
    }
  }, [open, focused]);

  function show() {
    focusYear.current = true;
    setFocused(clamp(selected ?? now));
    setOpen(true);
  }

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function pick(year: number) {
    if (outOfRange(year)) return;
    onChange(String(year));
    setMissing(false);
    close();
  }

  function showDecade(delta: number) {
    if (delta < 0 ? !canGoBack : !canGoForward) return;
    focusYear.current = false;
    setFocused(clamp(focused + delta * 10));
  }

  function onGridKeyDown(event: KeyboardEvent<HTMLTableElement>) {
    const move = KEY_MOVES[event.key];
    if (!move) return;
    event.preventDefault();
    focusYear.current = true;
    setFocused(clamp(move(focused)));
  }

  return (
    <Field
      label={label}
      hideLabel={hideLabel}
      hint={hint}
      error={shownError}
      required={required}
      className={className}
      ids={ids}
      htmlFor={ids.control}
    >
      <div
        ref={rootRef}
        className={s.anchor}
        onBlur={(event) => {
          if (open && !rootRef.current?.contains(event.relatedTarget as Node)) setOpen(false);
        }}
      >
        <button
          ref={triggerRef}
          id={ids.control}
          type="button"
          className={cx(s.control, s.trigger)}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? dialogId : undefined}
          aria-labelledby={label ? `${ids.label} ${ids.control}` : undefined}
          aria-label={label ? undefined : ariaLabel}
          aria-describedby={ids.describedBy}
          data-invalid={shownError ? '' : undefined}
          disabled={disabled}
          onClick={() => (open ? setOpen(false) : show())}
        >
          <CalendarIcon className={s.icon} />
          <span className={cx(s.value, !value && s.placeholder)}>{value || placeholder}</span>
          <ChevronIcon className={s.chevron} />
        </button>

        {open && (
          <div
            ref={panelRef}
            id={dialogId}
            role="dialog"
            aria-label={formText.yearDialog}
            className={cx(s.panel, c.calendar)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                close();
              }
            }}
          >
            <div className={c.header}>
              <button
                type="button"
                className={c.nav}
                aria-label={formText.previousDecade}
                // `aria-disabled` plutôt que `disabled` : un bouton désactivé
                // sous le focus le perdrait, et le panneau se refermerait.
                aria-disabled={!canGoBack || undefined}
                onClick={() => showDecade(-1)}
              >
                <ChevronIcon className={c.previous} />
              </button>
              <span id={captionId} className={c.caption} aria-live="polite">
                {decade} – {decade + 9}
              </span>
              <button
                type="button"
                className={c.nav}
                aria-label={formText.nextDecade}
                aria-disabled={!canGoForward || undefined}
                onClick={() => showDecade(1)}
              >
                <ChevronIcon className={c.next} />
              </button>
            </div>

            <table
              ref={gridRef}
              role="grid"
              aria-labelledby={captionId}
              className={cx(c.grid, c.years)}
              onKeyDown={onGridKeyDown}
            >
              <tbody>
                {decadeGrid(focused).map((row) => (
                  <tr key={row[0]}>
                    {row.map((year) => (
                      <td key={year} aria-selected={year === selected || undefined}>
                        <button
                          type="button"
                          className={c.day}
                          tabIndex={year === focused ? 0 : -1}
                          aria-current={year === now ? 'date' : undefined}
                          aria-disabled={outOfRange(year) || undefined}
                          data-outside={decadeOf(year) === decade ? undefined : ''}
                          data-today={year === now ? '' : undefined}
                          onClick={() => pick(year)}
                        >
                          {year}
                        </button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={c.footer}>
              <button
                type="button"
                className={c.action}
                disabled={outOfRange(now)}
                onClick={() => pick(now)}
              >
                {formText.thisYear}
              </button>
              {!required && value && (
                <button
                  type="button"
                  className={c.action}
                  onClick={() => {
                    onChange('');
                    close();
                  }}
                >
                  {formText.clearYear}
                </button>
              )}
            </div>
          </div>
        )}

        <FormValue
          name={name}
          value={value}
          required={required}
          onInvalid={() => setMissing(true)}
        />
      </div>
    </Field>
  );
}
