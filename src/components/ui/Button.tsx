import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './Button.module.css';

export type ButtonVariant = 'outline' | 'ghost' | 'fill';

type CommonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
};

type AnchorProps = CommonProps & { href: string } & Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    'className' | 'children'
  >;

type NativeButtonProps = CommonProps & { href?: undefined } & Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'className' | 'children'
  >;

type ButtonProps = AnchorProps | NativeButtonProps;

const VARIANTS: Record<ButtonVariant, string | undefined> = {
  outline: undefined,
  ghost: styles.ghost,
  fill: styles.fill,
};

/**
 * Bouton de la charte AURÉLYS.
 *
 * Rend un lien lorsqu'un `href` est fourni, un vrai `<button>` sinon.
 * Le libellé est encapsulé dans un `<span>` : c'est lui qui reste au-dessus du
 * remplissage animé au survol.
 */
export default function Button({ children, variant = 'outline', className, ...rest }: ButtonProps) {
  const classes = cx(styles.btn, VARIANTS[variant], className);

  if (rest.href !== undefined) {
    const { href, ...anchorProps } = rest as AnchorProps;
    return (
      <a href={href} className={classes} {...anchorProps}>
        <span>{children}</span>
      </a>
    );
  }

  const { type = 'button', ...buttonProps } = rest as NativeButtonProps;
  return (
    <button type={type} className={classes} {...buttonProps}>
      <span>{children}</span>
    </button>
  );
}
