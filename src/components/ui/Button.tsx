'use client';

import { useRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cx } from '@/lib/cx';
import { gsap, motionSafe, useGSAP } from '@/lib/motion';
import styles from './Button.module.css';

export type ButtonVariant = 'outline' | 'ghost' | 'fill';

type CommonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
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

/** Fraction du décalage curseur/centre réellement appliquée au bouton. */
const PULL = 0.32;
/** Le bouton ne doit jamais quitter sa zone de clic : bornage en pixels. */
const MAX_PULL = 14;

/**
 * Bouton de la charte AURÉLYS.
 *
 * Rend un lien lorsqu'un `href` est fourni, un vrai `<button>` sinon.
 * Le libellé est encapsulé dans un `<span>` : c'est lui qui reste au-dessus du
 * remplissage animé au survol.
 */
export default function Button({
  children,
  variant = 'outline',
  className,
  magnetic = false,
  ...rest
}: ButtonProps) {
  const ref = useRef<HTMLAnchorElement & HTMLButtonElement>(null);
  const classes = cx(styles.btn, VARIANTS[variant], className);

  useGSAP(
    () =>
      motionSafe(ref, () => {
        const el = ref.current;
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
    { scope: ref, dependencies: [magnetic], revertOnUpdate: true },
  );

  if (rest.href !== undefined) {
    const { href, ...anchorProps } = rest as AnchorProps;
    return (
      <a ref={ref} href={href} className={classes} {...anchorProps}>
        <span>{children}</span>
      </a>
    );
  }

  const { type = 'button', ...buttonProps } = rest as NativeButtonProps;
  return (
    <button ref={ref} type={type} className={classes} {...buttonProps}>
      <span>{children}</span>
    </button>
  );
}
