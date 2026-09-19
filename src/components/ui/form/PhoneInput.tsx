'use client';

import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react';
import { CheckIcon, ChevronIcon, SearchIcon } from '@/components/ui/icons';
import { preferredPhoneCountries } from '@/data/phoneCountries';
import { formText } from '@/data/ui';
import { useFlagFont } from '@/hooks/useFlagFont';
import { useDismiss, useFlip } from '@/hooks/usePopover';
import { cx } from '@/lib/cx';
import { filterOptions, moveIndex } from '@/lib/listNavigation';
import {
  countryName,
  countryOptions,
  DEFAULT_COUNTRY,
  findCountry,
  flagEmoji,
  formatNational,
  formatPhone,
  parsePhone,
  phoneExample,
  sanitizePhone,
  type CountryOption,
} from '@/lib/phone';
import Field, { FormValue, useFieldIds, type FieldProps } from './Field';
import s from './controls.module.css';

export type PhoneInputProps = FieldProps & {
  /** Numéro normalisé (« +212 6 12 34 56 78 »), ou chaîne vide. */
  value: string;
  onChange: (value: string) => void;
  /** Pays proposé tant que le champ est vide (code ISO, « MA » par défaut). */
  defaultCountry?: string;
  /** Par défaut, un numéro d'exemple du pays choisi. */
  placeholder?: string;
  /** Nom du champ lors d'un envoi par FormData (valeur normalisée). */
  name?: string;
  id?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  /** Nom accessible lorsqu'aucun libellé n'est affiché. */
  'aria-label'?: string;
  onBlur?: () => void;
};

/**
 * Champ de téléphone international : liste des pays avec drapeau et
 * indicatif (Maroc par défaut), puis numéro national, découpé à la manière
 * du pays en quittant le champ. Une saisie commençant par « + » ou « 00 »
 * choisit elle-même le pays : « +33 6 12… » passe en France.
 *
 * `onChange` reçoit toujours la valeur normalisée, prête à l'envoi. Un numéro
 * incomplet est signalé en quittant le champ et bloque l'envoi natif du
 * formulaire ; `isValidPhone()` (lib/phone) fait la même vérification côté
 * code, pour les formulaires en `noValidate`.
 */
export default function PhoneInput({
  value,
  onChange,
  defaultCountry,
  placeholder,
  name,
  id,
  disabled,
  autoFocus,
  label,
  hideLabel,
  hint,
  error,
  required,
  className,
  'aria-label': ariaLabel,
  onBlur,
}: PhoneInputProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const touchOpen = useRef(false);
  const fallback = (defaultCountry && findCountry(defaultCountry)) || DEFAULT_COUNTRY;
  const [country, setCountry] = useState(() => formatPhone(value, fallback).country);
  const [draft, setDraft] = useState(() => formatPhone(value, fallback).text);
  const [shown, setShown] = useState(value);
  const [touched, setTouched] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(-1);
  const flagFont = useFlagFont() ? '' : undefined;

  // Valeur changée par le parent (formulaire vidé, devis restauré…).
  if (value !== shown) {
    setShown(value);
    if (parsePhone(draft, country).value !== value) {
      const next = formatPhone(value, country);
      setCountry(next.country);
      setDraft(next.text);
    }
  }

  const phone = parsePhone(draft, country);
  const unfinished = phone.pending || (phone.national !== '' && !phone.complete);
  const shownError = error || (touched && unfinished ? formText.phoneInvalid : undefined);
  const ids = useFieldIds(id, hint, shownError);
  const listId = `${ids.control}-countries`;
  const optionId = (index: number) => `${listId}-${index}`;
  const expanded = open && !disabled;
  const invalidMessage = unfinished ? formText.phoneInvalid : '';
  const dialLabel = `${formText.phoneDialCode} +${country.dial}, ${countryName(country)}`;

  const { items: visible, pinned } = expanded ? countryList(query) : { items: [], pinned: 0 };
  const searching = query.trim() !== '';
  const activeIndex = visible[active] ? active : -1;

  useDismiss(rootRef, expanded, () => setOpen(false));
  useFlip(rootRef, panelRef, expanded);

  // Bloque l'envoi natif d'un numéro incomplet, avec un message français.
  useEffect(() => {
    inputRef.current?.setCustomValidity(invalidMessage);
  }, [invalidMessage]);

  // Au clavier ou à la souris, la recherche prend le focus ; au doigt, on
  // évite d'ouvrir le clavier virtuel par-dessus la liste.
  useEffect(() => {
    if (expanded && !touchOpen.current) searchRef.current?.focus();
  }, [expanded]);

  useEffect(() => {
    const list = listRef.current;
    const option = list?.querySelector<HTMLElement>('[data-active]');
    if (!expanded || !list || !option) return;
    if (option.offsetTop < list.scrollTop) list.scrollTop = option.offsetTop;
    else if (option.offsetTop + option.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = option.offsetTop + option.offsetHeight - list.clientHeight;
    }
  }, [expanded, activeIndex]);

  function emit(next: string) {
    if (next !== value) onChange(next);
  }

  function openList(touch: boolean) {
    touchOpen.current = touch;
    setQuery('');
    setActive(countryList('').items.findIndex((option) => option.country === country));
    setOpen(true);
  }

  function close(focusTrigger: boolean) {
    setOpen(false);
    if (focusTrigger) triggerRef.current?.focus();
  }

  function choose(option: CountryOption | undefined) {
    if (!option) return;
    setCountry(option.country);
    if (phone.pending) setDraft('');
    emit(phone.pending ? '' : parsePhone(draft, option.country).value);
    setOpen(false);
    inputRef.current?.focus();
  }

  function onListKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (disabled || event.nativeEvent.isComposing) return;
    const { key } = event;
    if (!expanded) {
      if (key === 'ArrowDown' || key === 'ArrowUp') {
        event.preventDefault();
        openList(false);
      }
      return;
    }
    if (key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      close(true);
      return;
    }
    if (key === 'Tab') {
      setOpen(false);
      return;
    }
    const moves: Record<string, number> = {
      ArrowDown: moveIndex(visible, activeIndex, 1),
      ArrowUp: moveIndex(visible, activeIndex, -1),
      PageDown: moveIndex(visible, activeIndex, 10),
      PageUp: moveIndex(visible, activeIndex, -10),
    };
    // Dans la recherche, Début et Fin déplacent le curseur du texte.
    if (event.currentTarget === triggerRef.current) {
      moves.Home = moveIndex(visible, -1, 1);
      moves.End = moveIndex(visible, -1, -1);
    }
    if (key in moves) {
      event.preventDefault();
      setActive(moves[key]);
    } else if (key === 'Enter') {
      event.preventDefault();
      choose(visible[activeIndex]);
    }
  }

  // Le focus quitte la liste (vers le numéro ou un autre champ) : on la ferme.
  function onListBlur(event: FocusEvent<HTMLElement>) {
    const next = event.relatedTarget;
    if (next && next !== triggerRef.current && !panelRef.current?.contains(next)) setOpen(false);
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
      <div ref={rootRef} className={s.anchor}>
        <div
          className={cx(s.control, s.withCountry)}
          data-invalid={shownError ? '' : undefined}
          data-disabled={disabled ? '' : undefined}
        >
          <button
            ref={triggerRef}
            type="button"
            className={s.country}
            disabled={disabled}
            aria-label={`${formText.phoneCountry} : ${countryName(country)} (+${country.dial})`}
            aria-haspopup="listbox"
            aria-expanded={expanded}
            aria-controls={expanded ? listId : undefined}
            onPointerDown={(event) => {
              touchOpen.current = event.pointerType === 'touch';
            }}
            onClick={(event) => {
              if (expanded) setOpen(false);
              else openList(event.detail > 0 && touchOpen.current);
            }}
            onKeyDown={onListKeyDown}
            onBlur={onListBlur}
          >
            <span className={s.flag} data-font={flagFont} aria-hidden="true">
              {flagEmoji(country.iso)}
            </span>
            <span aria-hidden="true">+{country.dial}</span>
            <ChevronIcon className={s.chevron} />
          </button>
          <input
            ref={inputRef}
            id={ids.control}
            className={s.input}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={30}
            autoFocus={autoFocus}
            placeholder={placeholder ?? phoneExample(country)}
            required={required}
            disabled={disabled}
            value={draft}
            aria-label={label ? undefined : ariaLabel}
            aria-invalid={shownError ? true : undefined}
            aria-describedby={cx(`${ids.control}-code`, ids.describedBy)}
            onFocus={() => setOpen(false)}
            onChange={(event) => {
              const text = sanitizePhone(event.target.value);
              const next = parsePhone(text, country);
              // Indicatif saisi en tête : il passe dans la liste des pays.
              if (next.dialed && !next.pending) {
                setCountry(next.country);
                setDraft(next.rest);
              } else {
                setDraft(text);
              }
              emit(next.value);
            }}
            onInvalid={() => setTouched(true)}
            onBlur={() => {
              setTouched(true);
              if (draft.trim() && !phone.pending) setDraft(formatNational(country, phone.national));
              onBlur?.();
            }}
          />
          <span id={`${ids.control}-code`} className="visually-hidden">
            {dialLabel}
          </span>
          <FormValue name={name} value={phone.value} disabled={disabled} onInvalid={() => {}} />
        </div>

        {expanded && (
          <div ref={panelRef} className={cx(s.panel, s.countryPanel)}>
            <div className={s.countrySearch}>
              <SearchIcon />
              <input
                ref={searchRef}
                className={s.input}
                type="text"
                role="combobox"
                autoComplete="off"
                spellCheck={false}
                enterKeyHint="search"
                placeholder={formText.searchCountry}
                value={query}
                aria-label={formText.searchCountry}
                aria-autocomplete="list"
                aria-expanded="true"
                aria-controls={listId}
                aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActive(0);
                }}
                onKeyDown={onListKeyDown}
                onBlur={onListBlur}
              />
            </div>
            <ul
              ref={listRef}
              id={listId}
              role="listbox"
              aria-label={formText.phoneCountry}
              className={s.list}
              onMouseDown={(event) => event.preventDefault()}
            >
              {visible.map((option, index) => (
                <li
                  key={`${index < pinned ? 'pinned-' : ''}${option.country.iso}`}
                  id={optionId(index)}
                  role="option"
                  aria-selected={option.country === country}
                  data-active={index === activeIndex ? '' : undefined}
                  data-divider={index === pinned - 1 ? '' : undefined}
                  className={s.option}
                  onPointerMove={() => {
                    if (index !== activeIndex) setActive(index);
                  }}
                  onClick={() => choose(option)}
                >
                  <span className={s.flag} data-font={flagFont} aria-hidden="true">
                    {flagEmoji(option.country.iso)}
                  </span>
                  <span className={s.optionBody}>{option.label}</span>
                  <span className={s.optionMeta}>+{option.country.dial}</span>
                  {option.country === country && <CheckIcon className={s.check} />}
                </li>
              ))}
              {!visible.length && (
                <li role="presentation" className={s.empty}>
                  {formText.noCountry}
                </li>
              )}
            </ul>
            <span className="visually-hidden" role="status" aria-atomic="true">
              {searching ? `${visible.length} ${formText.results}` : ''}
            </span>
          </div>
        )}
      </div>
    </Field>
  );
}

/** Pays fréquents en tête puis tous les pays, ou les résultats d'une recherche. */
function countryList(query: string): { items: readonly CountryOption[]; pinned: number } {
  const options = countryOptions();
  if (query.trim()) return { items: filterOptions(options, query), pinned: 0 };
  const preferred = preferredPhoneCountries.flatMap((iso) =>
    options.filter((option) => option.country.iso === iso),
  );
  return { items: [...preferred, ...options], pinned: preferred.length };
}
