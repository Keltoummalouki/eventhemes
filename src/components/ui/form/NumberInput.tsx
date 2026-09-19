'use client';

import { useState, type KeyboardEvent, type ReactNode, type Ref } from 'react';
import { formText } from '@/data/ui';
import { cx } from '@/lib/cx';
import {
  clampNumber,
  decimalsOf,
  formatNumber,
  parseNumber,
  roundTo,
  sanitizeNumber,
  stepNumber,
} from '@/lib/numbers';
import Field, { FormValue, useFieldIds, type FieldProps } from './Field';
import s from './controls.module.css';

export type NumberInputProps = FieldProps & {
  /** Valeur numérique, ou `null` pour un champ vide. */
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  /** Pas des boutons − / + et des flèches du clavier (Page↑ / Page↓ : × 10). */
  step?: number;
  /** Décimales acceptées. Par défaut, celles du pas (0.01 → 2). */
  decimals?: number;
  /** Unité placée après la saisie : « MAD », « invités »… */
  suffix?: ReactNode;
  /** Élément placé avant la saisie : icône… */
  prefix?: ReactNode;
  /** Affiche les boutons − / + (par défaut). */
  controls?: boolean;
  placeholder?: string;
  /** Nom du champ lors d'un envoi par FormData (valeur au format « 1250.5 »). */
  name?: string;
  id?: string;
  disabled?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  /** Nom accessible lorsqu'aucun libellé n'est affiché. */
  'aria-label'?: string;
  onBlur?: () => void;
  ref?: Ref<HTMLInputElement>;
};

/**
 * Champ numérique aux couleurs de la marque : prix, quantités, invités, budget.
 *
 * Remplace <input type="number"> et ses flèches natives : saisie à la
 * française (« 1 250,50 », virgule ou point), boutons − / + dorés, bornes
 * appliquées en quittant le champ. La molette ne modifie jamais la valeur.
 *
 * Clavier (motif « spinbutton » du WAI-ARIA APG) : ↑ ↓ (un pas),
 * Page↑ / Page↓ (dix pas), Début / Fin (minimum / maximum).
 */
export default function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  decimals = decimalsOf(step),
  suffix,
  prefix,
  controls = true,
  placeholder,
  name,
  id,
  disabled,
  readOnly,
  autoFocus,
  label,
  hideLabel,
  hint,
  error,
  required,
  className,
  'aria-label': ariaLabel,
  onBlur,
  ref,
}: NumberInputProps) {
  const ids = useFieldIds(id, hint, error);
  const bounds = { min, max };
  const locked = disabled || readOnly;

  // Le texte saisi reste tel quel pendant la frappe (« 12, » est une étape
  // valide) ; il n'est reformaté que si la valeur change de l'extérieur.
  const [draft, setDraft] = useState(() => formatNumber(value, decimals));
  const [shown, setShown] = useState(value);
  if (value !== shown) {
    setShown(value);
    if (parseNumber(draft) !== value) setDraft(formatNumber(value, decimals));
  }

  function commit(next: number | null) {
    setDraft(formatNumber(next, decimals));
    if (next !== value) onChange(next);
  }

  function nudge(delta: number) {
    if (locked) return;
    commit(stepNumber(value, delta, step, bounds, decimals));
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const moves: Record<string, number> = { ArrowUp: 1, ArrowDown: -1, PageUp: 10, PageDown: -10 };
    if (event.key in moves) {
      event.preventDefault();
      nudge(moves[event.key]);
    } else if (event.key === 'Home' && min !== undefined) {
      event.preventDefault();
      commit(min);
    } else if (event.key === 'End' && max !== undefined) {
      event.preventDefault();
      commit(max);
    }
  }

  const atMin = value !== null && min !== undefined && value <= min;
  const atMax = value !== null && max !== undefined && value >= max;
  const unit = typeof suffix === 'string' ? ` ${suffix}` : '';

  return (
    <Field
      label={label}
      hideLabel={hideLabel}
      hint={hint}
      error={error}
      required={required}
      className={className}
      ids={ids}
      htmlFor={ids.control}
    >
      <div
        className={cx(s.control, controls && s.withStepper)}
        data-invalid={error ? '' : undefined}
        data-disabled={disabled ? '' : undefined}
      >
        {prefix && <span className={s.affix}>{prefix}</span>}
        <input
          ref={ref}
          id={ids.control}
          className={cx(s.input, s.numeric)}
          type="text"
          role="spinbutton"
          inputMode={decimals ? 'decimal' : 'numeric'}
          autoComplete="off"
          spellCheck={false}
          autoFocus={autoFocus}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          value={draft}
          aria-label={label ? undefined : ariaLabel}
          aria-valuenow={value ?? undefined}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuetext={draft ? `${draft}${unit}` : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={ids.describedBy}
          onKeyDown={onKeyDown}
          onChange={(event) => {
            const text = sanitizeNumber(event.target.value, {
              decimals,
              negative: min === undefined || min < 0,
            });
            setDraft(text);
            const next = parseNumber(text);
            if (next !== value) onChange(next);
          }}
          onBlur={() => {
            const parsed = parseNumber(draft);
            commit(parsed === null ? null : clampNumber(roundTo(parsed, decimals), bounds));
            onBlur?.();
          }}
        />
        {suffix && <span className={s.affix}>{suffix}</span>}
        {controls && (
          // Hors de l'ordre de tabulation : les flèches du clavier font le même
          // travail. Un clic ne retire pas le focus de la saisie.
          <span className={s.stepper} onMouseDown={(event) => event.preventDefault()}>
            <button
              type="button"
              tabIndex={-1}
              className={s.stepButton}
              aria-label={formText.decrease}
              aria-controls={ids.control}
              disabled={locked || atMin}
              onClick={() => nudge(-1)}
            >
              <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                <path d="M3.5 8h9" />
              </svg>
            </button>
            <button
              type="button"
              tabIndex={-1}
              className={s.stepButton}
              aria-label={formText.increase}
              aria-controls={ids.control}
              disabled={locked || atMax}
              onClick={() => nudge(1)}
            >
              <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                <path d="M3.5 8h9M8 3.5v9" />
              </svg>
            </button>
          </span>
        )}
        <FormValue
          name={name}
          value={value === null ? '' : String(value)}
          disabled={disabled}
          onInvalid={() => {}}
        />
      </div>
    </Field>
  );
}
