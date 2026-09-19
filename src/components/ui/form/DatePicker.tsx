'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { CalendarIcon, ChevronIcon } from '@/components/ui/icons';
import { formText } from '@/data/ui';
import { useDismiss, useFlip } from '@/hooks/usePopover';
import { cx } from '@/lib/cx';
import {
  addDays,
  addMonths,
  clampDate,
  endOfWeek,
  formatLongDate,
  formatMonth,
  isOutOfRange,
  isSameDay,
  isSameMonth,
  monthGrid,
  parseIsoDate,
  startOfWeek,
  toIsoDate,
  today,
  weekdayNames,
  type IsoDate,
} from '@/lib/dates';
import Field, { FormValue, useFieldIds, type FieldProps } from './Field';
import s from './controls.module.css';
import c from './DatePicker.module.css';

export type DatePickerProps = FieldProps & {
  /** Date au format « AAAA-MM-JJ », ou chaîne vide. */
  value: IsoDate;
  onChange: (value: IsoDate) => void;
  /** Première date possible, « AAAA-MM-JJ ». */
  min?: IsoDate;
  /** Dernière date possible, « AAAA-MM-JJ ». */
  max?: IsoDate;
  placeholder?: string;
  /** Nom du champ lors d'un envoi par FormData. */
  name?: string;
  id?: string;
  disabled?: boolean;
  /** Nom accessible lorsqu'aucun libellé n'est affiché. */
  'aria-label'?: string;
};

const WEEKDAYS = weekdayNames();

/** Déplacements clavier dans la grille (motif « date picker dialog » du WAI-ARIA APG). */
const KEY_MOVES: Record<string, (date: Date, shift: boolean) => Date> = {
  ArrowLeft: (date) => addDays(date, -1),
  ArrowRight: (date) => addDays(date, 1),
  ArrowUp: (date) => addDays(date, -7),
  ArrowDown: (date) => addDays(date, 7),
  Home: startOfWeek,
  End: endOfWeek,
  PageUp: (date, shift) => addMonths(date, shift ? -12 : -1),
  PageDown: (date, shift) => addMonths(date, shift ? 12 : 1),
};

/**
 * Sélecteur de date aux couleurs de la marque : calendrier français
 * (semaine du lundi), bornes `min` / `max`, identique sur tous les navigateurs.
 *
 * Clavier : flèches (jour, semaine), Début / Fin (semaine), Page↑ / Page↓
 * (mois, + Maj : année), Entrée / Espace pour choisir, Échap pour fermer.
 */
export default function DatePicker({
  value,
  onChange,
  min,
  max,
  placeholder = formText.datePlaceholder,
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
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(() => today());
  const [missing, setMissing] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLTableElement>(null);
  /** Le jour ciblé doit recevoir le focus (clavier, ouverture) — pas après un clic sur « mois suivant ». */
  const focusDay = useRef(false);

  const shownError = error || (missing && !value ? formText.dateRequired : undefined);
  const ids = useFieldIds(id, hint, shownError);
  const dialogId = `${ids.control}-calendar`;
  const captionId = `${ids.control}-caption`;

  const selected = parseIsoDate(value);
  const minDate = parseIsoDate(min);
  const maxDate = parseIsoDate(max);
  const now = today();
  // Mois voisins accessibles seulement s'ils contiennent au moins un jour permis.
  const canGoBack =
    !minDate || new Date(focused.getFullYear(), focused.getMonth(), 0) >= minDate;
  const canGoForward =
    !maxDate || new Date(focused.getFullYear(), focused.getMonth() + 1, 1) <= maxDate;

  useDismiss(rootRef, open, () => setOpen(false));
  useFlip(triggerRef, panelRef, open);

  useEffect(() => {
    if (open && focusDay.current) {
      gridRef.current?.querySelector<HTMLElement>('button[tabindex="0"]')?.focus();
    }
  }, [open, focused]);

  function show() {
    focusDay.current = true;
    setFocused(clampDate(selected ?? today(), minDate, maxDate));
    setOpen(true);
  }

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function pick(day: Date) {
    if (isOutOfRange(day, minDate, maxDate)) return;
    onChange(toIsoDate(day));
    setMissing(false);
    close();
  }

  function showMonth(delta: number) {
    if (delta < 0 ? !canGoBack : !canGoForward) return;
    focusDay.current = false;
    setFocused(clampDate(addMonths(focused, delta), minDate, maxDate));
  }

  function onGridKeyDown(event: KeyboardEvent<HTMLTableElement>) {
    const move = KEY_MOVES[event.key];
    if (!move) return;
    event.preventDefault();
    focusDay.current = true;
    setFocused(clampDate(move(focused, event.shiftKey), minDate, maxDate));
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
          <span className={cx(s.value, !selected && s.placeholder)}>
            {selected ? formatLongDate(selected) : placeholder}
          </span>
          <ChevronIcon className={s.chevron} />
        </button>

        {open && (
          <div
            ref={panelRef}
            id={dialogId}
            role="dialog"
            aria-label={formText.dateDialog}
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
                aria-label={formText.previousMonth}
                // `aria-disabled` plutôt que `disabled` : un bouton désactivé
                // sous le focus le perdrait, et le calendrier se refermerait.
                aria-disabled={!canGoBack || undefined}
                onClick={() => showMonth(-1)}
              >
                <ChevronIcon className={c.previous} />
              </button>
              <span id={captionId} className={c.caption} aria-live="polite">
                {formatMonth(focused)}
              </span>
              <button
                type="button"
                className={c.nav}
                aria-label={formText.nextMonth}
                aria-disabled={!canGoForward || undefined}
                onClick={() => showMonth(1)}
              >
                <ChevronIcon className={c.next} />
              </button>
            </div>

            <table
              ref={gridRef}
              role="grid"
              aria-labelledby={captionId}
              className={c.grid}
              onKeyDown={onGridKeyDown}
            >
              <thead>
                <tr>
                  {WEEKDAYS.map((day) => (
                    <th key={day.long} scope="col" abbr={day.long}>
                      {day.short}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monthGrid(focused).map((week) => (
                  <tr key={toIsoDate(week[0])}>
                    {week.map((day) => {
                      const unavailable = isOutOfRange(day, minDate, maxDate);
                      const isToday = isSameDay(day, now);
                      return (
                        <td key={toIsoDate(day)} aria-selected={isSameDay(day, selected) || undefined}>
                          <button
                            type="button"
                            className={c.day}
                            tabIndex={isSameDay(day, focused) ? 0 : -1}
                            aria-label={formatLongDate(day)}
                            aria-current={isToday ? 'date' : undefined}
                            aria-disabled={unavailable || undefined}
                            data-outside={isSameMonth(day, focused) ? undefined : ''}
                            data-today={isToday ? '' : undefined}
                            onClick={() => pick(day)}
                          >
                            {day.getDate()}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={c.footer}>
              <button
                type="button"
                className={c.action}
                disabled={isOutOfRange(now, minDate, maxDate)}
                onClick={() => pick(now)}
              >
                {formText.today}
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
                  {formText.clearDate}
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
