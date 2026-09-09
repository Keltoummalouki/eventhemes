import { unsplashPhoto } from '@/lib/images';

export type Equipment = {
  name: string;
  image: string;
  fallbackSeed: string;
};

/**
 * Parc technique présenté dans le rail horizontal.
 *
 * Un visuel distinct par poste : le rail défile lentement sous les yeux du
 * visiteur, une même photo répétée à trois vignettes d'intervalle s'y remarque
 * immédiatement et affaiblit la démonstration de capacité.
 */
const EQUIPMENT_SOURCE: readonly [name: string, photoId: string][] = [
  ['Sonorisation professionnelle', '1520523839897-bd0b52f945a0'],
  ['Éclairage scénique', '1519389950473-47ba0277781c'],
  ['Moving Heads', '1470225620780-dba8ba36b745'],
  ['Écrans LED géants', '1478146059778-26028b07395a'],
  ['Vidéoprojecteurs', '1478720568477-152d9b164e26'],
  ['Lasers', '1519671482749-fd09be7ccebf'],
  ['Scènes modulaires', '1475721027785-f74eccf877e2'],
  ['Structures Truss', '1587271339061-4d5f6be0e1d7'],
  ['Cabine DJ', '1571266028243-d220c9be3e00'],
  ['Machines à fumée', '1492684223066-81342ee5ff30'],
  ['Générateurs de Haze', '1522673607200-164d1b6ce486'],
  ['Effets spéciaux', '1533158307587-828f0a76ef46'],
];

export const EQUIPMENT: readonly Equipment[] = EQUIPMENT_SOURCE.map(([name, photoId], index) => ({
  name,
  // 700 px : les vignettes sont agrandies puis dérivées dans leur cadre, une
  // source trop juste se verrait sur les écrans à forte densité.
  image: unsplashPhoto(photoId, 700),
  fallbackSeed: `aurelys-equip-${index}`,
}));
