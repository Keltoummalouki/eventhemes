'use client';

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { CheckIcon, ChevronIcon } from '@/components/ui/icons';
import { formText } from '@/data/ui';
import { useDismiss, useFlip } from '@/hooks/usePopover';
import { useTypeahead } from '@/hooks/useTypeahead';
import { cx } from '@/lib/cx';
import { filterOptions, matchTypeahead, moveIndex } from '@/lib/listNavigation';
import Field, { FormValue, useFieldIds, type FieldProps } from './Field';
import s from './controls.module.css';

export type SelectOption<V extends string = string> = {
  value: V;
  label: string;
  description?: string;
  disabled?: boolean;
  /** Pictogramme décoratif, repris dans le champ une fois l'option choisie. */
  icon?: ReactNode;
};

export type SelectProps<V extends string = string> = FieldProps & {
  options: readonly SelectOption<V>[];
  value: V | '';
  onChange: (value: V) => void;
  placeholder?: string;
  name?: string;
  id?: string;
  disabled?: boolean;
  'aria-label'?: string;
  /** Filters labels and descriptions without changing the selected value. */
  searchable?: boolean;
  loading?: boolean;
  loadingText?: string;
  emptyText?: string;
};

/** Controlled, single-value dropdown. Search is optional; only explicit choices are saved. */
export default function Select<V extends string = string>({
  options, value, onChange, placeholder = formText.selectPlaceholder,
  name, id, disabled, label, hideLabel, hint, error, required, className,
  'aria-label': ariaLabel, searchable = false, loading = false,
  loadingText = formText.loading, emptyText = formText.noOptions,
}: SelectProps<V>) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [query, setQuery] = useState('');
  const [missing, setMissing] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typeahead = useTypeahead();
  const expanded = open && !disabled;
  const selected = options.find(option => option.value === value);
  const shownError = error || (missing && !selected?.value ? formText.selectRequired : undefined);
  const ids = useFieldIds(id, hint, shownError);
  const listId = `${ids.control}-list`;
  const optionId = (index: number) => `${ids.control}-option-${index}`;
  const visible = loading ? [] : searchable && expanded ? filterOptions(options, query) : options;
  const activeIndex = visible[active] && !visible[active].disabled ? active : -1;

  useDismiss(rootRef, expanded, () => setOpen(false));
  useFlip(rootRef, listRef, expanded);

  useEffect(() => {
    const list = listRef.current;
    const option = list?.children[activeIndex] as HTMLElement | undefined;
    if (!expanded || !list || !option) return;
    if (option.offsetTop < list.scrollTop) list.scrollTop = option.offsetTop;
    else if (option.offsetTop + option.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = option.offsetTop + option.offsetHeight - list.clientHeight;
    }
  }, [expanded, activeIndex]);

  function openAt(index: number) {
    typeahead.reset();
    setQuery('');
    setActive(index);
    setOpen(true);
  }

  function choose(index: number) {
    const option = visible[index];
    if (!option || option.disabled || loading || disabled) return;
    if (option.value !== value) onChange(option.value);
    setMissing(false);
    setOpen(false);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (disabled || event.nativeEvent.isComposing) return;
    const { key, altKey, ctrlKey, metaKey } = event;
    // Keep native cursor movement, selection and clipboard shortcuts in searchable inputs.
    if (searchable && (key === 'Home' || key === 'End' || ctrlKey || metaKey)) return;
    const first = moveIndex(visible, -1, 1);
    const last = moveIndex(visible, -1, -1);
    if (!expanded) {
      if (['ArrowDown', 'ArrowUp', 'Enter'].includes(key) || (!searchable && key === ' ')) {
        event.preventDefault();
        const current = options.findIndex(option => option.value === value && !option.disabled);
        openAt(current >= 0 ? current : moveIndex(options, -1, key === 'ArrowUp' ? -1 : 1));
        return;
      }
      if (!searchable && (key === 'Home' || key === 'End')) {
        event.preventDefault(); openAt(key === 'Home' ? first : last); return;
      }
    } else {
      if (key === 'Escape') {
        event.preventDefault(); event.stopPropagation(); setOpen(false); return;
      }
      if (key === 'Tab') {
        if (!searchable) choose(activeIndex);
        setOpen(false); return;
      }
      if (key === 'ArrowUp' && altKey) {
        event.preventDefault(); setOpen(false); return;
      }
      const moves: Record<string, number> = {
        ArrowDown: moveIndex(visible, activeIndex, 1), ArrowUp: moveIndex(visible, activeIndex, -1),
        PageDown: moveIndex(visible, activeIndex, 10), PageUp: moveIndex(visible, activeIndex, -10),
        Home: first, End: last,
      };
      if (key in moves) { event.preventDefault(); setActive(moves[key]); return; }
      if (key === 'Enter' || (!searchable && key === ' ' && !typeahead.typing())) {
        event.preventDefault(); choose(activeIndex); return;
      }
    }
    if (!searchable && key.length === 1 && !ctrlKey && !metaKey && !altKey) {
      event.preventDefault();
      const current = options.findIndex(option => option.value === value);
      const match = matchTypeahead(visible, typeahead.type(key), expanded ? activeIndex : current);
      if (match >= 0) { setActive(match); setOpen(true); }
    }
  }

  return (
    <Field label={label} hideLabel={hideLabel} hint={hint} error={shownError} required={required}
      className={className} ids={ids} onLabelClick={() => triggerRef.current?.focus()}>
      <div ref={rootRef} className={s.anchor}>
        <div className={cx(s.control, s.trigger)} data-invalid={shownError ? '' : undefined}
          data-disabled={disabled ? '' : undefined} data-expanded={expanded ? '' : undefined}
          onClick={() => {
            if (disabled) return;
            triggerRef.current?.focus();
            if (expanded) { if (!searchable) setOpen(false); }
            else {
              const index = options.findIndex(option => option.value === value && !option.disabled);
              openAt(index >= 0 ? index : moveIndex(options, -1, 1));
            }
          }}>
          {selected?.icon && !(searchable && expanded) && (
            <span className={s.optionIcon} aria-hidden="true">{selected.icon}</span>
          )}
          <input ref={triggerRef} id={ids.control} className={cx(s.input, s.selectInput)}
            type="text" role="combobox" readOnly={!searchable} disabled={disabled}
            autoComplete="off" spellCheck={false}
            value={searchable && expanded ? query : selected?.label ?? ''}
            placeholder={searchable && expanded ? formText.searchOptions : placeholder}
            aria-labelledby={label ? ids.label : undefined} aria-label={label ? undefined : ariaLabel}
            aria-haspopup="listbox" aria-expanded={expanded} aria-controls={expanded ? listId : undefined}
            aria-activedescendant={expanded && activeIndex >= 0 ? optionId(activeIndex) : undefined}
            aria-autocomplete={searchable ? 'list' : undefined} aria-required={required || undefined}
            aria-invalid={shownError ? true : undefined} aria-describedby={ids.describedBy}
            aria-busy={loading || undefined}
            onKeyDown={onKeyDown} onBlur={() => setOpen(false)}
            onChange={event => {
              if (!searchable) return;
              const search = event.target.value;
              setQuery(search); setOpen(true);
              setActive(moveIndex(filterOptions(options, search), -1, 1));
            }} />
          <ChevronIcon className={s.chevron} />
        </div>
        {expanded && (
          <ul ref={listRef} id={listId} role="listbox" aria-busy={loading || undefined}
            aria-labelledby={label ? ids.label : undefined} aria-label={label ? undefined : ariaLabel}
            className={cx(s.panel, s.list)} onMouseDown={event => event.preventDefault()}>
            {visible.map((option, index) => (
              <li key={option.value} id={optionId(index)} role="option"
                aria-selected={option.value === value} aria-disabled={option.disabled || undefined}
                data-active={index === activeIndex ? '' : undefined} className={s.option}
                onPointerMove={() => { if (index !== activeIndex && !option.disabled) setActive(index); }}
                onClick={() => choose(index)}>
                {option.icon && <span className={s.optionIcon} aria-hidden="true">{option.icon}</span>}
                <span className={s.optionBody}><span>{option.label}</span>
                  {option.description && <span className={s.optionDescription}>{option.description}</span>}
                </span>
                {option.value === value && <CheckIcon className={s.check} />}
              </li>
            ))}
            {!visible.length && <li role="presentation" className={s.empty}>{loading ? loadingText : emptyText}</li>}
          </ul>
        )}
        <span className="visually-hidden" role="status" aria-atomic="true">
          {expanded ? loading ? loadingText : !visible.length ? emptyText : searchable ? `${visible.length} ${formText.results}` : '' : ''}
        </span>
        <FormValue name={name} value={loading ? value : selected?.value ?? ''} required={required}
          disabled={disabled} onInvalid={() => { setMissing(true); triggerRef.current?.focus(); }} />
      </div>
    </Field>
  );
}
