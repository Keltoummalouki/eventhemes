'use client';

import { useRef } from 'react';
import { CloseIcon } from '@/components/ui/icons';
import { formText } from '@/data/ui';
import { isHexColor, nearestColorName } from '@/lib/colors';
import Input, { type InputProps } from './Input';
import s from './controls.module.css';

export type ColorValue = {
  /** Nom lu par les visiteurs et par le filtre du catalogue : « Doré brossé ». */
  name: string;
  /** Teinte « #rrggbb » affichée en pastille, facultative. */
  swatch?: string;
};

export type ColorInputProps = Omit<
  InputProps,
  'type' | 'value' | 'onChange' | 'prefix' | 'suffix' | 'ref'
> & {
  value: ColorValue;
  onChange: (value: ColorValue) => void;
};

/** Teinte proposée à l'ouverture du nuancier quand aucune n'est choisie. */
const initialSwatch = '#c9a34e';

/**
 * Couleur ou finition : un nom libre et une pastille qui ouvre le nuancier du
 * système.
 *
 * Choisir une teinte remplit le nom connu le plus proche (« Doré ») tant que
 * le nom est vide ou reste celui proposé pour la teinte précédente : un nom
 * saisi à la main (« Doré brossé ») n'est jamais écrasé.
 */
export default function ColorInput({ value, onChange, disabled, ...props }: ColorInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const swatch = isHexColor(value.swatch) ? value.swatch : undefined;
  const suggested = swatch ? nearestColorName(swatch) : '';

  return (
    <Input
      {...props}
      ref={inputRef}
      disabled={disabled}
      autoComplete="off"
      value={value.name}
      onChange={(event) => onChange({ ...value, name: event.target.value })}
      prefix={
        <span
          className={s.swatch}
          data-empty={swatch ? undefined : ''}
          style={swatch ? { backgroundColor: swatch } : undefined}
        >
          <input
            type="color"
            className={s.swatchInput}
            aria-label={formText.colorPick}
            disabled={disabled}
            value={swatch ?? initialSwatch}
            onChange={(event) => {
              const next = event.target.value;
              const named = value.name.trim() && value.name !== suggested;
              onChange({ name: named ? value.name : nearestColorName(next), swatch: next });
            }}
          />
        </span>
      }
      suffix={
        (value.name || swatch) && !disabled ? (
          <button
            type="button"
            className={s.clear}
            aria-label={formText.colorClear}
            onClick={() => {
              onChange({ name: '', swatch: undefined });
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
