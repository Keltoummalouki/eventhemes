'use client';

import type { Ref, TextareaHTMLAttributes } from 'react';
import { cx } from '@/lib/cx';
import Field, { useFieldIds, type FieldProps } from './Field';
import s from './controls.module.css';

export type TextareaProps = FieldProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> & {
    ref?: Ref<HTMLTextAreaElement>;
  };

/** Zone de texte sur plusieurs lignes, redimensionnable en hauteur. */
export default function Textarea({
  label,
  hideLabel,
  hint,
  error,
  required,
  className,
  id,
  disabled,
  ref,
  ...textarea
}: TextareaProps) {
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
        className={cx(s.control, s.multiline)}
        data-invalid={error ? '' : undefined}
        data-disabled={disabled ? '' : undefined}
      >
        <textarea
          ref={ref}
          id={ids.control}
          className={cx(s.input, s.textarea)}
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={ids.describedBy}
          {...textarea}
        />
      </div>
    </Field>
  );
}
