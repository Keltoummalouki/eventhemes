'use client';

import Link from 'next/link';
import {
  useImperativeHandle,
  useRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';
import { cx } from '@/lib/cx';
import { gsap, motionSafe, useGSAP } from '@/lib/motion';
import styles from './Button.module.css';

/**
 * - `fill` : action principale, or plein (« Demander un devis »).
 * - `outline` : action secondaire, filet doré (« Mon devis », exports).
 * - `ghost` : action discrète ou filtre, filet clair ; `aria-pressed` le remplit d'or.
 * - `link` : lien souligné d'un filet doré (« Découvrir nos services »).
 */
export type ButtonVariant = 'fill' | 'outline' | 'ghost' | 'link';
/** `icon` : bouton carré pour un pictogramme seul (×) — `aria-label` obligatoire. */
export type ButtonSize = 'sm' | 'md' | 'icon';

type CommonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Pictogramme décoratif placé après le libellé : ↗, +, →… */
  icon?: ReactNode;
  /** Action en cours : le bouton est désactivé et signale son attente. */
  loading?: boolean;
  /** Occupe toute la largeur disponible. */
  block?: boolean;
  /** Action destructrice (« Supprimer ») : texte et filet rouges, quelle que soit la variante. */
  danger?: boolean;
  className?: string;
  /**
   * Aimante le bouton au curseur à son approche.
   *
   * À réserver à l'action principale d'une section : au-delà d'un ou deux
   * points d'attraction par écran, l'effet devient bruyant et la page perd
   * le calme attendu d'une marque haut de gamme.
   */
  magnetic?: boolean;
};

type AnchorProps = CommonProps & {
  href: string;
  ref?: Ref<HTMLAnchorElement>;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children' | 'href'>;

type NativeButtonProps = CommonProps & {
  href?: undefined;
  ref?: Ref<HTMLButtonElement>;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>;

export type ButtonProps = AnchorProps | NativeButtonProps;

const VARIANTS: Record<ButtonVariant, string> = {
  fill: styles.fill,
  outline: styles.outline,
  ghost: styles.ghost,
  link: styles.link,
};

const SIZES: Record<ButtonSize, string | undefined> = {
  sm: styles.sm,
  md: undefined,
  icon: styles.square,
};

/** Fraction du décalage curseur/centre réellement appliquée au bouton. */
const PULL = 0.32;
/** Le bouton ne doit jamais quitter sa zone de clic : bornage en pixels. */
const MAX_PULL = 14;

/**
 * Bouton de la charte EVENTHEME.
 *
 * Rend un lien (`next/link`) lorsqu'un `href` est fourni, un vrai `<button>`
 * sinon. Libellé et pictogramme restent au-dessus du remplissage animé.
 */
export default function Button({
  children,
  variant = 'fill',
  size = 'md',
  icon,
  loading = false,
  block = false,
  danger = false,
  className,
  magnetic = false,
  ref,
  ...rest
}: ButtonProps) {
  const inner = useRef<HTMLAnchorElement & HTMLButtonElement>(null);
  // Le parent (ex. <Dropdown>) reçoit l'élément rendu, lien ou bouton.
  useImperativeHandle(ref as Ref<HTMLElement>, () => inner.current as HTMLElement);

  const classes = cx(
    styles.btn,
    VARIANTS[variant],
    SIZES[size],
    block && styles.block,
    danger && styles.danger,
    className,
  );

  useGSAP(
    () =>
      motionSafe(inner, () => {
        const el = inner.current;
        if (!magnetic || !el) return;

        // quickTo réutilise un même tween : aucun objet recréé à chaque
        // mouvement de souris, donc pas de pression sur le ramasse-miettes.
        const options = { duration: 0.5, ease: 'elastic.out(1, 0.5)' };
        const moveX = gsap.quickTo(el, 'x', options);
        const moveY = gsap.quickTo(el, 'y', options);

        const follow = (event: PointerEvent) => {
          const box = el.getBoundingClientRect();
          const clamp = gsap.utils.clamp(-MAX_PULL, MAX_PULL);
          moveX(clamp((event.clientX - box.left - box.width / 2) * PULL));
          moveY(clamp((event.clientY - box.top - box.height / 2) * PULL));
        };

        const release = () => {
          moveX(0);
          moveY(0);
        };

        // Pointeur fin uniquement : au doigt, l'aimantation n'a pas de sens et
        // déplacerait la cible sous le contact.
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

        el.addEventListener('pointermove', follow);
        el.addEventListener('pointerleave', release);
        return () => {
          el.removeEventListener('pointermove', follow);
          el.removeEventListener('pointerleave', release);
        };
      }),
    { scope: inner, dependencies: [magnetic], revertOnUpdate: true },
  );

  const content = (
    <>
      <span className={styles.label}>{children}</span>
      {(icon || loading) && (
        <span className={styles.icon} aria-hidden="true">
          {loading ? <span className={styles.spinner} /> : icon}
        </span>
      )}
    </>
  );

  if (rest.href !== undefined) {
    const { href, ...anchorProps } = rest as AnchorProps;
    return (
      <Link ref={inner} href={href} className={classes} {...anchorProps}>
        {content}
      </Link>
    );
  }

  const { type = 'button', disabled, ...buttonProps } = rest as NativeButtonProps;
  return (
    <button
      ref={inner}
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...buttonProps}
    >
      {content}
    </button>
  );
}
