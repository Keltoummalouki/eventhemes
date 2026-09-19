'use client';

import { useEffect, useRef, useState } from 'react';
import { useEventheme } from '@/components/eventheme/Provider';
import Button from '@/components/ui/Button';
import SectionHeader from '@/components/ui/SectionHeader';
import { cx } from '@/lib/cx';
import type { Entry } from '@/lib/eventheme/types';
import { Flip, gsap, MOTION, prefersReducedMotion, revealSafe, useGSAP } from '@/lib/motion';
import styles from './Gallery.module.css';
import { ArrowUpRightIcon } from '@/components/ui/icons';

const ALL = 'Tous';

/**
 * Réalisations — mosaïque filtrable et visionneuse.
 *
 * Le changement de filtre est joué avec Flip : les vignettes qui restent
 * glissent vers leur nouvelle place au lieu que la grille se reconstruise d'un
 * coup. Chaque vignette ouvre une visionneuse (nom, type, lieu, date,
 * description) que l'on parcourt au clavier.
 */
export default function Gallery() {
  const { entries } = useEventheme();
  const projects = entries.filter((e) => e.kind === 'projects');
  const categories = [ALL, ...new Set(projects.map((p) => p.category).filter((c): c is string => Boolean(c)))];
  const [category, setCategory] = useState(ALL);
  const [open, setOpen] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const previous = useRef<Flip.FlipState | null>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const visible = projects.filter((p) => category === ALL || p.category === category);

  const changeCategory = (next: string) => {
    if (next === category) return;
    // Le relevé précède le rendu : ensuite, les anciennes positions n'existent plus.
    if (gridRef.current) previous.current = Flip.getState(Array.from(gridRef.current.children));
    setCategory(next);
  };

  useGSAP(
    () => {
      const state = previous.current;
      previous.current = null;
      if (!state || prefersReducedMotion()) return;
      Flip.from(state, {
        duration: 0.75,
        ease: 'power2.inOut',
        absoluteOnLeave: true,
        onEnter: (entering) =>
          gsap.fromTo(entering, { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 0.5, stagger: 0.04 }),
        onLeave: (leaving) => gsap.to(leaving, { autoAlpha: 0, scale: 0.94, duration: 0.35 }),
      });
    },
    { scope: gridRef, dependencies: [category] },
  );

  useGSAP(
    () =>
      revealSafe(gridRef, (full) => {
        const tiles = gsap.utils.toArray<HTMLElement>(`.${styles.inner}`, gridRef.current);
        if (!full) {
          gsap.set(tiles, { clipPath: 'inset(0% 0% 0% 0%)' });
          return;
        }
        gsap.fromTo(
          tiles,
          { clipPath: 'inset(0% 0% 100% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.2,
            ease: 'expo.inOut',
            stagger: 0.12,
            scrollTrigger: { trigger: gridRef.current, start: MOTION.start, once: true },
          },
        );
      }),
    { scope: gridRef },
  );

  /** Ferme la visionneuse ; le focus revient à la vignette, sauf si l'on part ailleurs. */
  const close = (restoreFocus = true) => {
    setOpen(null);
    if (restoreFocus) trigger.current?.focus();
  };

  return (
    <section className={styles.root} id="realisations">
      <SectionHeader
        eyebrow="Réalisations"
        title={
          <>
            Des instants.
            <br />
            <em>Des émotions.</em>
          </>
        }
        description="Découvrez nos univers et imaginez l’ambiance de votre prochain événement."
        action={
          <Button href="/realisations" variant="link" icon={<ArrowUpRightIcon />}>
            Toute la galerie
          </Button>
        }
      />

      {categories.length > 2 && (
        <div className={styles.filters} role="group" aria-label="Filtrer les réalisations par type d’événement">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              className={cx(styles.filter, c === category && styles.current)}
              aria-pressed={c === category}
              onClick={() => changeCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <div className={styles.grid} ref={gridRef}>
        {projects.map((project) => {
          const shown = visible.indexOf(project);
          return (
            <div
              key={project.id}
              className={cx(styles.tile, shown < 0 && styles.hidden)}
              aria-hidden={shown < 0 || undefined}
            >
              <button
                type="button"
                className={styles.inner}
                onClick={(event) => {
                  trigger.current = event.currentTarget;
                  setOpen(shown);
                }}
                tabIndex={shown < 0 ? -1 : undefined}
              >
                <img src={project.image || '/eventheme.jpg'} alt={project.title} loading="lazy" decoding="async" />
                {project.demo && <span className={styles.tag}>Inspiration</span>}
                <span className={styles.caption}>
                  <span className={styles.cat}>{project.category}</span>
                  <span className={styles.title}>{project.title}</span>
                  {(project.location || project.date) && (
                    <span className={styles.where}>{[project.location, project.date].filter(Boolean).join(' · ')}</span>
                  )}
                </span>
                <span className={styles.zoom} aria-hidden="true">
                  +
                </span>
              </button>
            </div>
          );
        })}
      </div>
      {projects.some((p) => p.demo) && (
        <p className={styles.note}>
          Planches d’inspiration : ces visuels illustrent des ambiances et seront remplacés par les réalisations
          EVENTHEME.
        </p>
      )}

      {open !== null && visible[open] && (
        <Lightbox
          projects={visible}
          index={open}
          onIndex={setOpen}
          onClose={close}
        />
      )}
    </section>
  );
}

function Lightbox({
  projects,
  index,
  onIndex,
  onClose,
}: {
  projects: Entry[];
  index: number;
  onIndex: (index: number) => void;
  onClose: (restoreFocus?: boolean) => void;
}) {
  const project = projects[index];
  const images = [project.image, ...(project.gallery || [])].filter((url): url is string => Boolean(url));
  const [image, setImage] = useState(0);
  const step = (delta: number) => {
    setImage(0);
    onIndex((index + delta + projects.length) % projects.length);
  };

  // Défilement de la page suspendu tant que la visionneuse est ouverte.
  useEffect(() => {
    const root = document.documentElement;
    const before = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = before;
    };
  }, []);

  return (
    <div
      className={styles.lightbox}
      role="dialog"
      aria-modal="true"
      aria-labelledby="visionneuse-titre"
      onKeyDown={(event) => {
        if (event.key === 'Escape') onClose();
        if (event.key === 'ArrowRight' && projects.length > 1) step(1);
        if (event.key === 'ArrowLeft' && projects.length > 1) step(-1);
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={styles.sheet} key={project.id}>
        <div className={styles.viewer}>
          <img src={images[image] || '/eventheme.jpg'} alt={project.title} />
          {images.length > 1 && (
            <div className={styles.thumbs}>
              {images.map((url, i) => (
                <button
                  key={url}
                  type="button"
                  aria-label={`Photographie ${i + 1} sur ${images.length}`}
                  aria-current={i === image}
                  onClick={() => setImage(i)}
                >
                  <img src={url} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className={styles.details}>
          <span className={styles.cat}>
            {project.category}
            {project.demo && ' · Inspiration'}
          </span>
          <h3 id="visionneuse-titre">{project.title}</h3>
          {(project.location || project.date) && (
            <p className={styles.where}>{[project.location, project.date].filter(Boolean).join(' · ')}</p>
          )}
          <p>{project.description}</p>
          <div className={styles.detailActions}>
            <Button href={`/realisations/${project.id}`} variant="outline" size="sm" icon={<ArrowUpRightIcon />}>
              Voir le projet
            </Button>
            <Button href="#devis" variant="link" size="sm" icon={<ArrowUpRightIcon />} onClick={() => onClose(false)}>
              Imaginer un événement similaire
            </Button>
          </div>
          {projects.length > 1 && (
            <div className={styles.pager}>
              <button type="button" onClick={() => step(-1)} aria-label="Projet précédent">
                ←
              </button>
              <span>
                {String(index + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
              </span>
              <button type="button" onClick={() => step(1)} aria-label="Projet suivant">
                →
              </button>
            </div>
          )}
        </div>
        {/* Le focus entre dans la visionneuse dès son ouverture. */}
        <button type="button" className={styles.close} onClick={() => onClose()} aria-label="Fermer la visionneuse" autoFocus>
          ×
        </button>
      </div>
    </div>
  );
}
