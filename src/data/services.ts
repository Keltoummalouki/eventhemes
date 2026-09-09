import { unsplashPhoto } from '@/lib/images';

export type Service = {
  title: string;
  description: string;
  image: string;
  fallbackSeed: string;
};

/** Catalogue complet des savoir-faire AURÉLYS (organisation, création, technique). */
const SERVICE_SOURCE: readonly [title: string, description: string, photoId: string][] = [
  [
    'Organisation de mariages',
    'Une cérémonie pensée dans les moindres détails, du premier rendez-vous au dernier danse.',
    '1519741497674-611481863552',
  ],
  [
    'Fiançailles',
    'Des instants intimes mis en scène avec élégance et raffinement.',
    '1465495976277-4387d4b0b4c6',
  ],
  ['Anniversaires', "Des célébrations sur-mesure, à l'image de chaque histoire.", '1533158307587-828f0a76ef46'],
  [
    "Événements d'entreprise",
    'Séminaires, lancements et soirées corporate à forte image.',
    '1527529482837-4698179dc6ce',
  ],
  [
    'Conférences',
    'Une logistique irréprochable pour des prises de parole marquantes.',
    '1475721027785-f74eccf877e2',
  ],
  ['Inaugurations', 'Un premier regard mémorable sur votre lieu ou votre marque.', '1517457373958-b7bdd4587205'],
  ['Décoration', 'Scénographies florales et mobilier haut de gamme.', '1519167758481-83f550bb49b3'],
  ['Sonorisation', 'Un son cristallin, calibré pour chaque espace.', '1470229722913-7c0e2dbbafd3'],
  ['Éclairage', 'Des ambiances lumineuses qui subliment chaque instant.', '1522673607200-164d1b6ce486'],
  ['Écrans LED', 'Une image immersive au service de votre récit.', '1478146059778-26028b07395a'],
  ['Scène et structures', 'Des architectures éphémères sûres et spectaculaires.', '1587271339061-4d5f6be0e1d7'],
  ['Photographie', 'Un regard artistique sur vos plus beaux instants.', '1502635385003-ee1e6a1a742d'],
  ["Production vidéo", "Des films d'événement cinématographiques.", '1492684223066-81342ee5ff30'],
  ['DJ et animation', 'Une programmation musicale qui porte la soirée.', '1571266028243-d220c9be3e00'],
  ['Traiteur', 'Une expérience culinaire raffinée et sur-mesure.', '1550005809-91ad75fb315f'],
  ["Effets spéciaux", "Feux d'artifice, fontaines et moments spectaculaires.", '1519671482749-fd09be7ccebf'],
];

export const SERVICES: readonly Service[] = SERVICE_SOURCE.map(([title, description, photoId], index) => ({
  title,
  description,
  image: unsplashPhoto(photoId, 900),
  fallbackSeed: `aurelys-serv-${index}`,
}));
