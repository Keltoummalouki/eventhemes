import { unsplashPhoto } from '@/lib/images';

export type Equipment = {
  name: string;
  image: string;
  fallbackSeed: string;
};

/** Parc technique présenté dans le carrousel horizontal. */
const EQUIPMENT_SOURCE: readonly [name: string, photoId: string][] = [
  ['Sonorisation professionnelle', '1520523839897-bd0b52f945a0'],
  ['Éclairage scénique', '1519389950473-47ba0277781c'],
  ['Moving Heads', '1470225620780-dba8ba36b745'],
  ['Écrans LED géants', '1478146059778-26028b07395a'],
  ['Vidéoprojecteurs', '1478720568477-152d9b164e26'],
  ['Lasers', '1470225620780-dba8ba36b745'],
  ['Scènes modulaires', '1587271339061-4d5f6be0e1d7'],
  ['Structures Truss', '1470225620780-dba8ba36b745'],
  ['Cabine DJ', '1571266028243-d220c9be3e00'],
  ['Machines à fumée', '1492684223066-81342ee5ff30'],
  ['Générateurs de Haze', '1478146059778-26028b07395a'],
  ['Effets spéciaux', '1519671482749-fd09be7ccebf'],
];

export const EQUIPMENT: readonly Equipment[] = EQUIPMENT_SOURCE.map(([name, photoId], index) => ({
  name,
  image: unsplashPhoto(photoId, 600),
  fallbackSeed: `aurelys-equip-${index}`,
}));
