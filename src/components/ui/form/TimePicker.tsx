'use client';

import { useEffect, useRef, useState, type KeyboardEvent, type RefObject } from 'react';
import { ChevronIcon, ClockIcon } from '@/components/ui/icons';
import { formText } from '@/data/ui';
import { useDismiss, useFlip } from '@/hooks/usePopover';
import { useTypeahead } from '@/hooks/useTypeahead';
import { cx } from '@/lib/cx';
import { formatTime, minuteSteps, parseIsoTime, toIsoTime, type IsoTime } from '@/lib/dates';
import { moveIndex } from '@/lib/listNavigation';
import Field, { FormValue, useFieldIds, type FieldProps } from './Field';
import s from './controls.module.css';
import c from './DatePicker.module.css';
import t from './TimePicker.module.css';

export type TimePickerProps = FieldProps & {
  /** Heure « HH:MM » sur 24 h, ou chaîne vide. */
  value: IsoTime;
  onChange: (value: IsoTime) => void;
  /** Écart entre deux minutes proposées : 15 → 00, 15, 30, 45. */
  step?: number;
  /** Première heure possible, « HH:MM ». */
  min?: IsoTime;
  /** Dernière heure possible, « HH:MM ». */
  max?: IsoTime;
  placeholder?: string;
  /** Nom du champ lors d'un envoi par FormData. */
  name?: string;
  id?: string;
  disabled?: boolean;
  /** Nom accessible lorsqu'aucun libellé n'est affiché. */
  'aria-label'?: string;
};

type Column = 'hours' | 'minutes';
type TimeOption = { value: number; label: string; disabled: boolean };

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
/** Heure mise en avant à l'ouverture tant qu'aucune n'est choisie. */
const DEFAULT_HOUR = 12;
/** Page↑ / Page↓ : environ une colonne visible. */
const PAGE = 5;

const pad = (value: number) => String(value).padStart(2, '0');

/**
 * Option atteinte par la frappe : la valeur exacte (« 9 » → 09, « 18 » → 18),
 * sinon le premier libellé qui commence par la saisie (« 3 » → 30 minutes).
 */
function typedIndex(options: readonly TimeOption[], typed: string): number {
  const exact = options.findIndex((option) => !option.disabled && option.value === Number(typed));
  return exact >= 0 ? exact : options.findIndex((option) => !option.disabled && option.label.startsWith(typed));
}

/** Garde l'option `index` visible dans sa colonne ; `center` la place au milieu. */
function reveal(list: HTMLElement | null, index: number, center: boolean) {
  const option = list?.children[index] as HTMLElement | undefined;
  if (!list || !option) return;
  if (center) list.scrollTop = option.offsetTop - (list.clientHeight - option.offsetHeight) / 2;
  else if (option.offsetTop < list.scrollTop) list.scrollTop = option.offsetTop;
  else if (option.offsetTop + option.offsetHeight > list.scrollTop + list.clientHeight) {
    list.scrollTop = option.offsetTop + option.offsetHeight - list.clientHeight;
  }
}

/**
 * Sélecteur d'heure aux couleurs de la marque : une colonne d'heures, une
 * colonne de minutes (pas `step`), bornes `min` / `max`, identique sur tous
 * les navigateurs.
 *
 * Choisir l'heure enregistre aussitôt la valeur et passe aux minutes ;
 * choisir les minutes referme le panneau.
 *
 * Clavier : ↑ / ↓ dans une colonne, ← / → d'une colonne à l'autre, Début / Fin,
 * Page↑ / Page↓, chiffres pour aller à une valeur, Entrée / Espace pour
 * choisir, Échap pour fermer.
 */
export default function TimePicker({
  value,
  onChange,
  step = 5,
  min,
  max,
  placeholder = formText.timePlaceholder,
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
}: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const [activeHour, setActiveHour] = useState(DEFAULT_HOUR);
  const [activeMinute, setActiveMinute] = useState(0);
  const [missing, setMissing] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const hoursRef = useRef<HTMLUListElement>(null);
  const minutesRef = useRef<HTMLUListElement>(null);
  /** À l'ouverture : les colonnes se centrent sur la valeur et les heures prennent le focus. */
  const opening = useRef(false);
  const typeahead = useTypeahead();

  const shownError = error || (missing && !value ? formText.timeRequired : undefined);
  const ids = useFieldIds(id, hint, shownError);
  const dialogId = `${ids.control}-time`;
  const optionId = (column: Column, index: number) => `${dialogId}-${column}-${index}`;

  const selected = parseIsoTime(value);
  const minutes = minuteSteps(step);
  const allowed = (hour: number, minute: number) => {
    const time = toIsoTime(hour, minute);
    return (!min || time >= min) && (!max || time <= max);
  };
  const hourOptions: TimeOption[] = HOURS.map((hour) => ({
    value: hour,
    label: pad(hour),
    disabled: !minutes.some((minute) => allowed(hour, minute)),
  }));
  const minuteOptionsAt = (hour: number): TimeOption[] =>
    minutes.map((minute) => ({ value: minute, label: pad(minute), disabled: !allowed(hour, minute) }));
  // Les minutes se rapportent à l'heure retenue, ou, à défaut, à l'heure mise en avant.
  const hour = selected?.hours ?? activeHour;
  const minuteOptions = minuteOptionsAt(hour);

  useDismiss(rootRef, open, () => setOpen(false));
  useFlip(triggerRef, panelRef, open);

  useEffect(() => {
    if (!open) return;
    const center = opening.current;
    opening.current = false;
    if (center) hoursRef.current?.focus({ preventScroll: true });
    reveal(hoursRef.current, activeHour, center);
    reveal(minutesRef.current, activeMinute, center);
  }, [open, activeHour, activeMinute]);

  function show() {
    const start = selected && !hourOptions[selected.hours].disabled ? selected.hours : moveIndex(hourOptions, DEFAULT_HOUR - 1, 1);
    const shown = Math.max(0, start);
    const minute = selected ? minutes.indexOf(selected.minutes) : -1;
    opening.current = true;
    typeahead.reset();
    setActiveHour(shown);
    setActiveMinute(minute >= 0 ? minute : Math.max(0, moveIndex(minuteOptionsAt(shown), -1, 1)));
    setOpen(true);
  }

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function pickHour(index: number) {
    if (hourOptions[index]?.disabled !== false) return;
    // Les minutes déjà choisies sont gardées quand la nouvelle heure les permet.
    const kept = selected && allowed(index, selected.minutes) ? selected.minutes : null;
    const minute = kept ?? minutes[Math.max(0, moveIndex(minuteOptionsAt(index), -1, 1))];
    onChange(toIsoTime(index, minute));
    setMissing(false);
    setActiveHour(index);
    setActiveMinute(Math.max(0, minutes.indexOf(minute)));
    minutesRef.current?.focus({ preventScroll: true });
  }

  function pickMinute(index: number) {
    if (minuteOptions[index]?.disabled !== false || hourOptions[hour].disabled) return;
    onChange(toIsoTime(hour, minutes[index]));
    setMissing(false);
    close();
  }

  function onColumnKeyDown(column: Column, event: KeyboardEvent<HTMLUListElement>) {
    const { key } = event;
    const hours = column === 'hours';
    const options = hours ? hourOptions : minuteOptions;
    const active = hours ? activeHour : activeMinute;
    const setActive = hours ? setActiveHour : setActiveMinute;
    const moves: Record<string, number> = {
      ArrowDown: moveIndex(options, active, 1),
      ArrowUp: moveIndex(options, active, -1),
      PageDown: moveIndex(options, active, PAGE),
      PageUp: moveIndex(options, active, -PAGE),
      Home: moveIndex(options, -1, 1),
      End: moveIndex(options, -1, -1),
    };
    if (key in moves) {
      event.preventDefault();
      if (moves[key] >= 0) setActive(moves[key]);
    } else if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      if (hours) pickHour(active);
      else pickMinute(active);
    } else if (key === (hours ? 'ArrowRight' : 'ArrowLeft')) {
      event.preventDefault();
      (hours ? minutesRef : hoursRef).current?.focus({ preventScroll: true });
    } else if (/^\d$/.test(key)) {
      event.preventDefault();
      const match = typedIndex(options, typeahead.type(key));
      if (match >= 0) setActive(match);
    }
  }

  const renderColumn = (
    column: Column,
    title: string,
    options: readonly TimeOption[],
    active: number,
    chosen: number | undefined,
    ref: RefObject<HTMLUListElement | null>,
  ) => (
    <div className={t.column}>
      <span id={`${dialogId}-${column}`} className={t.heading}>
        {title}
      </span>
      <ul
        ref={ref}
        role="listbox"
        tabIndex={0}
        aria-labelledby={`${dialogId}-${column}`}
        aria-activedescendant={options[active] ? optionId(column, active) : undefined}
        className={t.list}
        onFocus={typeahead.reset}
        onKeyDown={(event) => onColumnKeyDown(column, event)}
      >
        {options.map((option, index) => (
          <li
            key={option.value}
            id={optionId(column, index)}
            role="option"
            aria-selected={option.value === chosen}
            aria-disabled={option.disabled || undefined}
            data-active={index === active ? '' : undefined}
            className={t.cell}
            onClick={() => (column === 'hours' ? pickHour(index) : pickMinute(index))}
          >
            {option.label}
          </li>
        ))}
      </ul>
    </div>
  );

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
          <ClockIcon className={s.icon} />
          <span className={cx(s.value, !selected && s.placeholder)}>
            {selected ? formatTime(value) : placeholder}
          </span>
          <ChevronIcon className={s.chevron} />
        </button>

        {open && (
          <div
            ref={panelRef}
            id={dialogId}
            role="dialog"
            aria-label={formText.timeDialog}
            // Focalisable : un clic sur un espace vide du panneau ne le referme pas.
            tabIndex={-1}
            className={cx(s.panel, t.panel)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                close();
              }
            }}
          >
            <span className={cx(c.caption, t.caption)} aria-hidden="true">
              {selected ? formatTime(value) : formText.timeDialog}
            </span>

            <div className={t.columns}>
              {renderColumn('hours', formText.hours, hourOptions, activeHour, selected?.hours, hoursRef)}
              {renderColumn('minutes', formText.minutes, minuteOptions, activeMinute, selected?.minutes, minutesRef)}
            </div>

            <div className={c.footer}>
              {!required && value && (
                <button
                  type="button"
                  className={c.action}
                  onClick={() => {
                    onChange('');
                    close();
                  }}
                >
                  {formText.clearTime}
                </button>
              )}
              <button type="button" className={cx(c.action, t.confirm)} onClick={close}>
                {formText.confirmTime}
              </button>
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
