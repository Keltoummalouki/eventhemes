'use client';

import { useRef } from 'react';
import Button from '@/components/ui/Button';
import SmartImage from '@/components/ui/SmartImage';
import { HERO_CONTENT, HERO_INTERVAL_MS, HERO_SLIDES } from '@/data/hero';
import { useCarousel } from '@/hooks/useCarousel';
import { cx } from '@/lib/cx';
import { onCurtainOpen } from '@/lib/intro';
import { gsap, motionSafe, revealSafe, SplitText, useGSAP } from '@/lib/motion';
import styles from './Hero.module.css';

/** Circonférence du cercle du monogramme (r = 46), pour le tracé progressif. */
const MARK_CIRCUMFERENCE = 2 * Math.PI * 46;
/** Durée du zoom lent sur la vue affichée, en secondes. */
const KENBURNS_SECONDS = 9;
/** Échelle de départ du zoom lent (identique à la maquette). */
const KENBURNS_FROM = 1.09;

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { index, goTo } = useCarousel(HERO_SLIDES.length, HERO_INTERVAL_MS);

  /* ------------------------------------------------------------------ *
   * Entrée en scène — jouée une seule fois, à l'ouverture du rideau.
   * ------------------------------------------------------------------ */
  useGSAP(
    () =>
      revealSafe(ref, (full) => {
        const hero = ref.current;
        // Mouvement réduit : la promesse est déjà lisible, on n'y touche pas.
        if (!hero || !full) return;

        const find = gsap.utils.selector(hero);
        const [heading] = find('h1');
        let opened = false;
        let intro: gsap.core.Timeline | undefined;

        const split = SplitText.create(heading, {
          type: 'lines',
          // Chaque ligne surgit de derrière son propre masque.
          mask: 'lines',
          linesClass: 'reveal-line',
          // Re-découpe quand la police définitive arrive ou que la largeur
          // change : les retours à la ligne suivent, la mise en scène aussi.
          autoSplit: true,
          onSplit: (self) => {
            // Partout `fromTo` plutôt que `from` : les états d'arrivée sont
            // déclarés et non relevés dans le DOM. Sans cela, une seconde
            // exécution de l'effet — mode strict de React, rechargement à
            // chaud, re-découpage des lignes — repartirait de l'état masqué
            // laissé par la première et n'afficherait plus rien.
            intro = gsap
              .timeline({ paused: true })
              .fromTo(
                find(`.${styles.mark} circle`),
                { strokeDashoffset: MARK_CIRCUMFERENCE },
                { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut' },
              )
              .fromTo(
                find(`.${styles.mark} text`),
                { autoAlpha: 0 },
                { autoAlpha: 1, duration: 0.7 },
                '-=0.8',
              )
              .fromTo(
                self.lines,
                { yPercent: 125 },
                { yPercent: 0, duration: 1.15, ease: 'power4.out', stagger: 0.09 },
                '-=0.55',
              )
              .fromTo(
                find(`.${styles.tagline}`),
                { autoAlpha: 0, y: 24 },
                { autoAlpha: 1, y: 0, duration: 0.9 },
                '-=0.8',
              )
              .fromTo(
                find(`.${styles.actions}`),
                { autoAlpha: 0, y: 24 },
                { autoAlpha: 1, y: 0, duration: 0.9 },
                '-=0.7',
              )
              .fromTo(
                find(`.${styles.scroll}, .${styles.dots}`),
                { autoAlpha: 0 },
                { autoAlpha: 1, duration: 0.8 },
                '-=0.5',
              );

            // Re-découpe postérieure à l'ouverture : la scène a déjà été jouée,
            // on en restaure la fin au lieu de la rejouer sous les yeux du visiteur.
            if (opened) intro.progress(1);
            return intro;
          },
        });

        const unsubscribe = onCurtainOpen(() => {
          opened = true;
          intro?.play();
        });

        return () => {
          unsubscribe();
          split.revert();
        };
      }),
    { scope: ref },
  );

  /* ------------------------------------------------------------------ *
   * Profondeur au défilement — le décor part moins vite que le texte.
   * ------------------------------------------------------------------ */
  useGSAP(
    () =>
      motionSafe(ref, () => {
        const hero = ref.current;
        if (!hero) return;
        const find = gsap.utils.selector(hero);

        gsap.to(find(`.${styles.slides}`), {
          yPercent: 14,
          ease: 'none',
          scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
        });

        // Le bloc de texte s'efface avant d'atteindre le bord : on ne le laisse
        // jamais glisser sous la barre de navigation en restant lisible.
        gsap.to(find(`.${styles.content}`), {
          autoAlpha: 0,
          y: -70,
          ease: 'none',
          scrollTrigger: { trigger: hero, start: 'top top', end: '65% top', scrub: true },
        });
      }),
    { scope: ref },
  );

  /* ------------------------------------------------------------------ *
   * Zoom lent relancé à chaque changement de vue.
   * ------------------------------------------------------------------ */
  useGSAP(
    () =>
      motionSafe(ref, () => {
        const hero = ref.current;
        if (!hero) return;
        const image = hero.querySelectorAll(`.${styles.slide} img`)[index];
        if (!image) return;

        gsap.fromTo(
          image,
          { scale: KENBURNS_FROM },
          { scale: 1, duration: KENBURNS_SECONDS, ease: 'none' },
        );
      }),
    // `revertOnUpdate` est indispensable ici : sans lui, `useGSAP` ne nettoie
    // qu'au démontage, et une instance de `matchMedia` s'accumulerait à chaque
    // changement de vue — soit toutes les six secondes.
    { scope: ref, dependencies: [index], revertOnUpdate: true },
  );

  return (
    <section className={styles.hero} id="accueil" ref={ref}>
      <div className={styles.slides} aria-hidden="true">
        {HERO_SLIDES.map((slide, slideIndex) => (
          <div
            key={slide.src}
            className={cx(styles.slide, slideIndex === index && styles.active)}
          >
            <SmartImage
              src={slide.src}
              alt=""
              fallbackSeed={slide.fallbackSeed}
              fallbackWidth={1800}
              fallbackHeight={1000}
              loading="eager"
              fetchPriority={slideIndex === 0 ? 'high' : undefined}
            />
          </div>
        ))}
      </div>

      <div className={styles.content}>
        <svg className={styles.mark} viewBox="0 0 100 100" fill="none" aria-hidden="true" focusable="false">
          <circle
            cx="50"
            cy="50"
            r="46"
            stroke="var(--or)"
            strokeWidth="1"
            // Le tracé progressif du cercle est animé par GSAP via l'offset.
            style={{ strokeDasharray: MARK_CIRCUMFERENCE }}
          />
          <text
            x="50"
            y="60"
            style={{ fontFamily: 'var(--ff-display)' }}
            fontStyle="italic"
            fontSize="34"
            fill="var(--or-clair)"
            textAnchor="middle"
          >
            A
          </text>
        </svg>

        <h1>{HERO_CONTENT.heading}</h1>
        <p className={styles.tagline}>{HERO_CONTENT.description}</p>

        <div className={styles.actions}>
          <Button href={HERO_CONTENT.primaryCta.href} variant="fill" magnetic>
            {HERO_CONTENT.primaryCta.label}
          </Button>
          <Button href={HERO_CONTENT.secondaryCta.href} variant="ghost">
            {HERO_CONTENT.secondaryCta.label}
          </Button>
        </div>
      </div>

      <div className={styles.scroll} aria-hidden="true">
        <span>{HERO_CONTENT.scrollLabel}</span>
        <div className={styles.line} />
      </div>

      <div className={styles.dots} role="group" aria-label="Choisir une vue du diaporama">
        {HERO_SLIDES.map((slide, slideIndex) => (
          <button
            key={slide.src}
            type="button"
            className={cx(slideIndex === index && styles.dotActive)}
            aria-label={`Vue ${slideIndex + 1} sur ${HERO_SLIDES.length}`}
            aria-current={slideIndex === index}
            onClick={() => goTo(slideIndex)}
          />
        ))}
      </div>
    </section>
  );
}
