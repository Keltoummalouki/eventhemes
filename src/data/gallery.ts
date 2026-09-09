import { unsplashPhoto } from '@/lib/images';

export const GALLERY_CATEGORIES = [
  'Tous',
  'Mariages',
  'Entreprises',
  'Conférences',
  'Anniversaires',
  'Événements privés',
] as const;

export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

/** Catégorie « fourre-tout » : n'applique aucun filtre. */
export const ALL_CATEGORIES: GalleryCategory = 'Tous';

export type GalleryItem = {
  title: string;
  category: GalleryCategory;
  image: string;
  fallbackSeed: string;
  /** Hauteur de la vignette en pixels — crée le rythme vertical de la mosaïque. */
  height: number;
};

/** Hauteur de référence d'une vignette, multipliée par le ratio de chaque projet. */
const BASE_HEIGHT = 340;

const GALLERY_SOURCE: readonly [
  title: string,
  category: GalleryCategory,
  photoId: string,
  ratio: number,
][] = [
  ['Mariage au Domaine Roseraie', 'Mariages', '1519741497674-611481863552', 1.3],
  ['Soirée de Gala — Groupe Meridian', 'Entreprises', '1527529482837-4698179dc6ce', 1.0],
  ['Sommet Horizon 2025', 'Conférences', '1475721027785-f74eccf877e2', 1.2],
  ['Fiançailles au coucher du soleil', 'Événements privés', '1465495976277-4387d4b0b4c6', 1.0],
  ['50 ans — Fête privée', 'Anniversaires', '1533158307587-828f0a76ef46', 1.25],
  ['Mariage — Riad El Bahia', 'Mariages', '1519167758481-83f550bb49b3', 1.0],
  ['Lancement produit — Atlas Corp', 'Entreprises', '1517457373958-b7bdd4587205', 1.15],
  ["Cérémonie intime, jardins d'Anfa", 'Mariages', '1470229722913-7c0e2dbbafd3', 1.0],
  ['Conférence Lumière & Design', 'Conférences', '1522673607200-164d1b6ce486', 1.3],
  ['Anniversaire de fiançailles', 'Événements privés', '1550005809-91ad75fb315f', 1.0],
  ['Réception dorée', 'Mariages', '1519225421980-715cb0215aed', 1.2],
  ['Gala annuel de charité', 'Entreprises', '1587271339061-4d5f6be0e1d7', 1.0],
];

export const GALLERY_ITEMS: readonly GalleryItem[] = GALLERY_SOURCE.map(
  ([title, category, photoId, ratio], index) => ({
    title,
    category,
    image: unsplashPhoto(photoId, 700),
    fallbackSeed: `aurelys-g-${index}`,
    height: Math.round(BASE_HEIGHT * ratio),
  }),
);
