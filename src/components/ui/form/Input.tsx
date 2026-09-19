'use client';

import type { InputHTMLAttributes, ReactNode, Ref } from 'react';
import Field, { useFieldIds, type FieldProps } from './Field';
import s from './controls.module.css';

export type InputProps = FieldProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'prefix'> & {
    /** Élément placé avant la saisie : icône, indicatif… */
    prefix?: ReactNode;
    /** Élément placé après la saisie : unité (« MAD »), action… */
    suffix?: ReactNode;
    ref?: Ref<HTMLInputElement>;
  };

/**
 * Champ de saisie : texte, e-mail, mot de passe, URL…
 * Toutes les props natives d'<input> sont transmises au champ.
 *
 * Nombres, heures, téléphones et fichiers ont leur propre composant :
 * NumberInput, TimePicker, PhoneInput et FileInput.
 */
export default function Input({
  label,
  hideLabel,
  hint,
  error,
  required,
  className,
  prefix,
  suffix,
  id,
  disabled,
  ref,
  ...input
}: InputProps) {
  const ids = useFieldIds(id, hint, error);

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
        className={s.control}
        data-invalid={error ? '' : undefined}
        data-disabled={disabled ? '' : undefined}
      >
        {prefix && <span className={s.affix}>{prefix}</span>}
        <input
          ref={ref}
          id={ids.control}
          className={s.input}
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={ids.describedBy}
          {...input}
        />
        {suffix && <span className={s.affix}>{suffix}</span>}
      </div>
    </Field>
  );
}
