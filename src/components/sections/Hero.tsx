'use client';

import { useRef } from 'react';
import { useEventheme } from '@/components/eventheme/Provider';
import Butterflies from '@/components/ui/Butterflies';
import Button from '@/components/ui/Button';
import { ArrowUpRightIcon, SocialIcon } from '@/components/ui/icons';
import { heroSlides } from '@/data/eventheme';
import { useCarousel } from '@/hooks/useCarousel';
import { cx } from '@/lib/cx';
import { onCurtainOpen } from '@/lib/intro';
import { gsap, motionSafe, revealSafe, SplitText, useGSAP } from '@/lib/motion';
import { findSocial } from '@/lib/eventheme/types';
import styles from './Hero.module.css';

/** Durée d'affichage d'une vue, en millisecondes. */
const INTERVAL_MS = 6500;
/** Zoom lent sur la vue affichée : échelle de départ et durée. */
const KENBURNS_FROM = 1.1;
const KENBURNS_SECONDS = 9;
/** Longueur du tracé du papillon, pour le dessin progressif. */
const MARK_LENGTH = 420;

const pad = (value: number) => String(value).padStart(2, '0');
/** Deux URL Unsplash ne diffèrent parfois que par leurs paramètres de recadrage. */
const photoKey = (url: string) => url.split('?')[0];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { entries } = useEventheme();
  const home = entries.find((e) => e.id === 'home');
  const whatsapp = findSocial(entries, 'whatsapp');

  // La galerie de la page « home » (admin) prime ; à défaut, les visuels d'illustration.
  const candidates = [home?.image, ...(home?.gallery?.length ? home.gallery : heroSlides)];
  const slides = candidates.filter(
    (url, index): url is string =>
      Boolean(url) && candidates.findIndex((other) => other && photoKey(other) === photoKey(url!)) === index,
  );
  const { index, goTo } = useCarousel(slides.length, INTERVAL_MS);
  const lines = (home?.title || 'Votre événement.\nVotre vision.\nNotre savoir-faire.').split('\n');

  /* Entrée en scène — jouée une seule fois, à l'ouverture du rideau. */
  useGSAP(
    () =>
      revealSafe(ref, (full) => {
        const hero = ref.current;
        if (!hero || !full) return;
        const find = gsap.utils.selector(hero);
        let opened = false;
        let intro: gsap.core.Timeline | undefined;

        const split = SplitText.create(find(`.${styles.line}`), {
          type: 'lines',
          mask: 'lines',
          linesClass: 'reveal-line',
          autoSplit: true,
          onSplit: (self) => {
            intro = gsap
              .timeline({ paused: true })
              .fromTo(
                find(`.${styles.mark} path`),
                { strokeDashoffset: MARK_LENGTH },
                { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut', stagger: 0.12 },
              )
              .fromTo(find(`.${styles.eyebrow}`), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 0.35)
              .fromTo(
                self.lines,
                { yPercent: 125 },
                { yPercent: 0, duration: 1.2, ease: 'power4.out', stagger: 0.12 },
                0.45,
              )
              .fromTo(
                find(`.${styles.lede}, .${styles.actions}`),
                { autoAlpha: 0, y: 24 },
                { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.14 },
                '-=0.75',
              )
              .fromTo(find(`.${styles.bottom}`), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, '-=0.4');
            // Re-découpe après l'ouverture (police, largeur) : on restaure la fin.
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

  /* Profondeur : le décor part moins vite que le texte, et suit le curseur. */
  useGSAP(
    () =>
      motionSafe(ref, () => {
        const hero = ref.current;
        if (!hero) return;
        const find = gsap.utils.selector(hero);

        gsap.to(find(`.${styles.slides}`), {
          yPercent: 16,
          ease: 'none',
          scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
        });
        gsap.to(find(`.${styles.content}`), {
          autoAlpha: 0,
          y: -80,
          ease: 'none',
          scrollTrigger: { trigger: hero, start: 'top top', end: '60% top', scrub: true },
        });

        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
        const drift = find(`.${styles.drift}`);
        const moveX = gsap.quickTo(drift, 'x', { duration: 1.6, ease: 'power3.out' });
        const moveY = gsap.quickTo(drift, 'y', { duration: 1.6, ease: 'power3.out' });
        const follow = (event: PointerEvent) => {
          moveX((event.clientX / window.innerWidth - 0.5) * -26);
          moveY((event.clientY / window.innerHeight - 0.5) * -18);
        };
        hero.addEventListener('pointermove', follow);
        return () => hero.removeEventListener('pointermove', follow);
      }),
    { scope: ref },
  );

  /* Zoom lent relancé à chaque changement de vue. */
  useGSAP(
    () =>
      motionSafe(ref, () => {
        const image = ref.current?.querySelectorAll(`.${styles.slide} img`)[index];
        if (image)
          gsap.fromTo(image, { scale: KENBURNS_FROM }, { scale: 1, duration: KENBURNS_SECONDS, ease: 'none' });
      }),
    // `revertOnUpdate` : sans lui, une instance de matchMedia s'accumulerait à
    // chaque changement de vue.
    { scope: ref, dependencies: [index], revertOnUpdate: true },
  );

  return (
    <section className={styles.hero} id="accueil" ref={ref} aria-labelledby="accueil-titre">
      <div className={styles.slides} aria-hidden="true">
        <div className={styles.drift}>
          {slides.map((src, slideIndex) => (
            <div key={src} className={cx(styles.slide, slideIndex === index && styles.active)}>
              <img
                src={src}
                alt=""
                loading={slideIndex === 0 ? 'eager' : 'lazy'}
                fetchPriority={slideIndex === 0 ? 'high' : undefined}
                decoding="async"
              />
            </div>
          ))}
        </div>
      </div>
      <div className={styles.shade} />
      <Butterflies count={4} />

      <div className={styles.content}>
        <svg className={styles.mark} viewBox="-50 -44 100 88" aria-hidden="true" focusable="false">
          <path d="M2 -2 C 8 -28, 30 -44, 42 -34 C 52 -25, 38 -6, 4 0 C 22 2, 34 16, 26 28 C 18 38, 6 22, 2 7" />
          <path d="M-2 -2 C -8 -28, -30 -44, -42 -34 C -52 -25, -38 -6, -4 0 C -22 2, -34 16, -26 28 C -18 38, -6 22, -2 7" />
          <path d="M0 -12 C 2 -6, 2 14, 0 22 M0 -12 C -2 -22, -8 -28, -12 -31 M0 -12 C 2 -22, 8 -28, 12 -31" />
        </svg>
        <span className={styles.eyebrow}>{home?.subtitle || 'Créateur d’émotions · Maroc'}</span>
        <h1 id="accueil-titre" className={styles.title}>
          {lines.map((line, lineIndex) =>
            lineIndex === lines.length - 1 && lines.length > 1 ? (
              <em key={lineIndex} className={styles.line}>
                {line}
              </em>
            ) : (
              <span key={lineIndex} className={styles.line}>
                {line}
              </span>
            ),
          )}
        </h1>
        {home?.description && <p className={styles.lede}>{home.description}</p>}
        <div className={styles.actions}>
          <Button href="#devis" icon={<ArrowUpRightIcon />} magnetic>
            Configurer mon événement
          </Button>
          <Button href="#services" variant="ghost" className={styles.secondary}>
            Découvrir nos services
          </Button>
        </div>
      </div>

      <div className={styles.bottom}>
        <a href="#a-propos" className={styles.scroll}>
          <span>Défiler</span>
          <i className={styles.scrollLine} aria-hidden="true" />
        </a>
        {slides.length > 1 && (
          <div className={styles.counter} role="group" aria-label="Choisir une vue du diaporama">
            <span aria-hidden="true">{pad(index + 1)}</span>
            {slides.map((src, slideIndex) => (
              <button
                key={src}
                type="button"
                className={styles.bar}
                aria-label={`Vue ${slideIndex + 1} sur ${slides.length}`}
                aria-current={slideIndex === index}
                onClick={() => goTo(slideIndex)}
              >
                <i
                  // Nouvelle clé à chaque vue : la jauge repart de zéro.
                  key={slideIndex === index ? `run-${index}` : 'idle'}
                  className={cx(slideIndex === index && styles.running, slideIndex < index && styles.done)}
                  style={{ animationDuration: `${INTERVAL_MS}ms` }}
                />
              </button>
            ))}
            <span aria-hidden="true">{pad(slides.length)}</span>
          </div>
        )}
        {whatsapp?.url && (
          <a
            className={styles.whatsapp}
            href={whatsapp.url}
            target="_blank"
            rel="noreferrer"
            aria-label="Nous contacter sur WhatsApp (nouvel onglet)"
            title="WhatsApp"
          >
            <SocialIcon name="whatsapp" className={styles.whatsappIcon} />
          </a>
        )}
      </div>
      <span className={styles.credit}>Photographies d’illustration</span>
    </section>
  );
}
