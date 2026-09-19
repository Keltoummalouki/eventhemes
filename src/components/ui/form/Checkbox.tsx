'use client';

import type { InputHTMLAttributes, ReactNode, Ref } from 'react';
import { cx } from '@/lib/cx';
import { useFieldIds } from './Field';
import s from './controls.module.css';

export type CheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'className' | 'checked' | 'onChange' | 'children'
> & {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Libellé cliquable ; peut contenir un lien (consentement). */
  children: ReactNode;
  /** Aide sous le libellé, reliée à la case (`aria-describedby`). */
  hint?: ReactNode;
  /** Message d'erreur : la case passe en état invalide. */
  error?: ReactNode;
  /** Classe du conteneur, pour placer la case dans une grille. */
  className?: string;
  ref?: Ref<HTMLInputElement>;
};

/**
 * Case à cocher aux couleurs de la marque : carré filet clair, coche noire
 * sur fond or. La case native reste en place (clavier, formulaires, lecteurs
 * d'écran) ; seul son dessin change.
 */
export default function Checkbox({
  checked,
  onChange,
  children,
  hint,
  error,
  required,
  disabled,
  className,
  id,
  ref,
  ...input
}: CheckboxProps) {
  const ids = useFieldIds(id, hint, error);

  return (
    <div className={cx(s.checkField, className)}>
      <label className={s.checkbox} data-disabled={disabled ? '' : undefined}>
        <input
          ref={ref}
          id={ids.control}
          type="checkbox"
          className={s.checkInput}
          checked={checked}
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={ids.describedBy}
          onChange={(event) => onChange(event.target.checked)}
          {...input}
        />
        <span className={s.checkLabel}>
          {children}
          {required && (
            <span className={s.required} aria-hidden="true">
              *
            </span>
          )}
        </span>
      </label>
      {hint && (
        <span id={ids.hint} className={cx(s.hint, s.checkNote)}>
          {hint}
        </span>
      )}
      {error && (
        <span id={ids.error} className={cx(s.error, s.checkNote)}>
          {error}
        </span>
      )}
    </div>
  );
}
