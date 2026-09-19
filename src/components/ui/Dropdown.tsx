'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ChevronIcon } from '@/components/ui/icons';
import { formText } from '@/data/ui';
import { useDismiss, useFlip } from '@/hooks/usePopover';
import { useTypeahead } from '@/hooks/useTypeahead';
import { cx } from '@/lib/cx';
import { matchTypeahead, moveIndex } from '@/lib/listNavigation';
import Button, { type ButtonSize, type ButtonVariant } from './Button';
import Field, { useFieldIds, type FieldProps } from './form/Field';
import s from './form/controls.module.css';

export type DropdownItem = {
  id: string;
  /** Texte de l'action ; sert aussi à la recherche à la frappe. */
  label: string;
  description?: ReactNode;
  /** Information alignée à droite : prix, quantité… */
  meta?: ReactNode;
  /** Élément de navigation plutôt qu'action. */
  href?: string;
  onSelect?: () => void;
  disabled?: boolean;
};

export type DropdownProps = Omit<FieldProps, 'required'> & {
  /** Contenu du bouton déclencheur. */
  trigger: ReactNode;
  items: readonly DropdownItem[];
  /** `field` prend l'apparence d'un champ ; les autres reprennent <Button>. */
  variant?: 'field' | ButtonVariant;
  size?: ButtonSize;
  id?: string;
  disabled?: boolean;
  /** Nom accessible lorsqu'aucun libellé n'est affiché. */
  'aria-label'?: string;
  /** Texte affiché quand il n'y a aucune action. */
  emptyText?: string;
};

/**
 * Menu déroulant d'actions (« Ajouter du matériel », actions d'une ligne…).
 *
 * Contrairement à <Select>, il ne porte pas de valeur : choisir un élément
 * déclenche son action puis referme le menu. Motif « menu button » du
 * WAI-ARIA APG : le focus entre dans le menu, ↑ ↓ bouclent, Échap rend le
 * focus au déclencheur, une lettre atteint l'élément correspondant.
 */
export default function Dropdown({
  trigger,
  items,
  variant = 'field',
  size,
  id,
  disabled,
  label,
  hideLabel,
  hint,
  error,
  className,
  'aria-label': ariaLabel,
  emptyText = formText.noOptions,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [initial, setInitial] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLElement | null>>([]);
  const typeahead = useTypeahead();

  const ids = useFieldIds(id, hint, error);
  const menuId = `${ids.control}-menu`;

  useDismiss(rootRef, open, () => setOpen(false));
  useFlip(triggerRef, menuRef, open);

  // À l'ouverture, le focus entre dans le menu.
  useEffect(() => {
    if (open) (itemRefs.current[initial] ?? menuRef.current)?.focus();
  }, [open, initial]);

  function openAt(index: number) {
    typeahead.reset();
    setInitial(index);
    setOpen(true);
  }

  function close(returnFocus: boolean) {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }

  function select(item: DropdownItem) {
    if (item.disabled) return;
    // Un lien quitte la page : inutile de ramener le focus au déclencheur.
    close(!item.href);
    item.onSelect?.();
  }

  function focusItem(index: number) {
    if (index >= 0) itemRefs.current[index]?.focus();
  }

  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      openAt(moveIndex(items, -1, event.key === 'ArrowDown' ? 1 : -1));
    }
  }

  function onMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const current = itemRefs.current.indexOf(document.activeElement as HTMLElement);
    const { key } = event;
    const moves: Record<string, number> = {
      ArrowDown: moveIndex(items, current, 1, true),
      ArrowUp: moveIndex(items, current, -1, true),
      Home: moveIndex(items, -1, 1),
      End: moveIndex(items, -1, -1),
    };

    if (key in moves) {
      event.preventDefault();
      focusItem(moves[key]);
    } else if (key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      close(true);
    } else if (key === 'Tab') {
      triggerRef.current?.focus();
      setOpen(false);
    } else if (key === ' ' && !typeahead.typing()) {
      // L'espace n'active pas un lien nativement.
      event.preventDefault();
      if (current >= 0 && !items[current].disabled) itemRefs.current[current]?.click();
    } else if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      focusItem(matchTypeahead(items, typeahead.type(key), current));
    }
  }

  const triggerProps = {
    id: ids.control,
    'aria-haspopup': 'menu' as const,
    'aria-expanded': open,
    'aria-controls': open ? menuId : undefined,
    'aria-labelledby': label ? `${ids.label} ${ids.control}` : undefined,
    'aria-label': label ? undefined : ariaLabel,
    'aria-describedby': ids.describedBy,
    disabled,
    onClick: () => (open ? close(false) : openAt(moveIndex(items, -1, 1))),
    onKeyDown: onTriggerKeyDown,
  };

  return (
    <Field
      label={label}
      hideLabel={hideLabel}
      hint={hint}
      error={error}
      className={className}
      ids={ids}
      onLabelClick={() => triggerRef.current?.focus()}
    >
      <div
        ref={rootRef}
        className={cx(s.anchor, variant !== 'field' && s.inline)}
        onBlur={(event) => {
          if (open && !rootRef.current?.contains(event.relatedTarget as Node)) setOpen(false);
        }}
      >
        {variant === 'field' ? (
          <button
            ref={triggerRef}
            type="button"
            className={cx(s.control, s.trigger)}
            data-invalid={error ? '' : undefined}
            {...triggerProps}
          >
            <span className={cx(s.value, s.placeholder)}>{trigger}</span>
            <ChevronIcon className={s.chevron} />
          </button>
        ) : (
          <Button
            ref={triggerRef}
            variant={variant}
            size={size}
            icon={<ChevronIcon />}
            {...triggerProps}
          >
            {trigger}
          </Button>
        )}

        {open && (
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            tabIndex={-1}
            aria-labelledby={ids.control}
            className={cx(s.panel, s.list, s.menu)}
            onKeyDown={onMenuKeyDown}
          >
            {items.map((item, index) => {
              const content = (
                <>
                  <span className={s.optionBody}>
                    <span>{item.label}</span>
                    {item.description && (
                      <span className={s.optionDescription}>{item.description}</span>
                    )}
                  </span>
                  {item.meta && <span className={s.optionMeta}>{item.meta}</span>}
                </>
              );
              const common = {
                ref: (node: HTMLElement | null) => {
                  itemRefs.current[index] = node;
                },
                role: 'menuitem',
                tabIndex: -1,
                className: s.option,
                'aria-disabled': item.disabled || undefined,
                // Le survol déplace le focus : clavier et souris restent d'accord.
                onPointerMove: (event: { currentTarget: HTMLElement }) => {
                  if (!item.disabled && document.activeElement !== event.currentTarget) {
                    event.currentTarget.focus();
                  }
                },
                onClick: () => select(item),
              };
              return item.href && !item.disabled ? (
                <Link key={item.id} href={item.href} {...common}>
                  {content}
                </Link>
              ) : (
                <button key={item.id} type="button" {...common}>
                  {content}
                </button>
              );
            })}
            {!items.length && emptyText && <span className={s.empty}>{emptyText}</span>}
          </div>
        )}
      </div>
    </Field>
  );
}
