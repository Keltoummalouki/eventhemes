'use client';

import { useId, type ReactNode } from 'react';
import { cx } from '@/lib/cx';
import s from './controls.module.css';

/** Props communes à tous les champs : libellé, aide et message d'erreur. */
export type FieldProps = {
  label?: ReactNode;
  /** Masque le libellé à l'écran en le gardant pour les lecteurs d'écran. */
  hideLabel?: boolean;
  /** Aide affichée sous le contrôle et reliée à lui (`aria-describedby`). */
  hint?: ReactNode;
  /** Message d'erreur : le champ passe en état invalide. */
  error?: ReactNode;
  required?: boolean;
  /** Classe du conteneur, pour placer le champ dans une grille. */
  className?: string;
};

export type FieldIds = {
  control: string;
  label: string;
  hint?: string;
  error?: string;
  /** Valeur prête pour `aria-describedby`. */
  describedBy?: string;
};

/** Identifiants stables reliant le contrôle à son libellé, son aide et son erreur. */
export function useFieldIds(id: string | undefined, hint: ReactNode, error: ReactNode): FieldIds {
  const generated = useId();
  const control = id ?? generated;
  const hintId = hint ? `${control}-hint` : undefined;
  const errorId = error ? `${control}-error` : undefined;
  return {
    control,
    label: `${control}-label`,
    hint: hintId,
    error: errorId,
    describedBy: cx(hintId, errorId) || undefined,
  };
}

type FieldFrameProps = FieldProps & {
  ids: FieldIds;
  /** Élément natif associé au libellé (input, textarea, button). */
  htmlFor?: string;
  /** Contrôle personnalisé : un clic sur le libellé lui donne le focus. */
  onLabelClick?: () => void;
  children: ReactNode;
};

/** Cadre d'un champ : libellé, contrôle, aide puis erreur. */
export default function Field({
  label,
  hideLabel,
  hint,
  error,
  required,
  className,
  ids,
  htmlFor,
  onLabelClick,
  children,
}: FieldFrameProps) {
  return (
    <div className={cx(s.field, className)}>
      {label && (
        <label
          id={ids.label}
          htmlFor={htmlFor}
          className={cx(s.label, hideLabel && 'visually-hidden')}
          onClick={onLabelClick}
        >
          {label}
          {required && (
            <span className={s.required} aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      {children}
      {hint && (
        <span id={ids.hint} className={s.hint}>
          {hint}
        </span>
      )}
      {error && (
        <span id={ids.error} className={s.error}>
          {error}
        </span>
      )}
    </div>
  );
}

/**
 * Valeur d'un contrôle personnalisé (liste, date) dans le formulaire parent.
 *
 * Un champ caché porte `name` (pour FormData) et `required` (pour la
 * validation native à l'envoi). Son événement `invalid` est intercepté : le
 * contrôle affiche son propre message, la bulle du navigateur ne sachant pas
 * où se placer sur un élément masqué. L'envoi reste bloqué.
 */
export function FormValue({
  name,
  value,
  required,
  onInvalid,
  disabled,
}: {
  name?: string;
  value: string;
  required?: boolean;
  onInvalid: () => void;
  disabled?: boolean;
}) {
  if (!name && !required) return null;
  return (
    <input
      type="text"
      hidden
      tabIndex={-1}
      name={name}
      value={value}
      required={required}
      disabled={disabled}
      onChange={() => {}}
      onInvalid={(event) => {
        event.preventDefault();
        onInvalid();
      }}
    />
  );
}
