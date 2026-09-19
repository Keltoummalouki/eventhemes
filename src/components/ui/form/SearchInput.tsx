'use client';

import { useRef, type ReactNode } from 'react';
import { CloseIcon, SearchIcon } from '@/components/ui/icons';
import { formText } from '@/data/ui';
import Input, { type InputProps } from './Input';
import s from './controls.module.css';

export type SearchInputProps = Omit<
  InputProps,
  'type' | 'value' | 'onChange' | 'prefix' | 'suffix' | 'ref'
> & {
  /** Un champ de recherche doit être nommé, même si son libellé reste masqué. */
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
};

/**
 * Champ de recherche : loupe, bouton d'effacement et touche Échap pour vider.
 * Le libellé est masqué par défaut (`hideLabel`) : le placeholder guide l'œil,
 * le libellé guide les lecteurs d'écran.
 */
export default function SearchInput({
  value,
  onChange,
  hideLabel = true,
  onKeyDown,
  ...props
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Input
      {...props}
      ref={inputRef}
      type="search"
      hideLabel={hideLabel}
      enterKeyHint="search"
      autoComplete="off"
      spellCheck={false}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && value) {
          event.preventDefault();
          onChange('');
        }
        onKeyDown?.(event);
      }}
      prefix={<SearchIcon />}
      suffix={
        value ? (
          <button
            type="button"
            className={s.clear}
            aria-label={formText.clearSearch}
            onClick={() => {
              onChange('');
              inputRef.current?.focus();
            }}
          >
            <CloseIcon />
          </button>
        ) : null
      }
    />
  );
}
