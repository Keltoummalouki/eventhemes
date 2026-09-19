import type { Entry } from "@/lib/eventheme/types";
const photo = (id: string, width = 1400) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=85`;
export const imagery = {
  hero: photo("1519741497674-611481863552", 2000),
  tables: photo("1519225421980-715cb0215aed"),
  party: photo("1511795409834-ef04bbd61622"),
  conference: photo("1475721027785-f74eccf877e2"),
  flowers: photo("1465495976277-4387d4b0b4c6"),
};
/**
 * Diaporama d’accueil — photographies d’illustration, utilisées tant que la
 * page « home » n’a pas de galerie dans l’administration.
 */
export const heroSlides = [
  "1519741497674-611481863552",
  "1465495976277-4387d4b0b4c6",
  "1478146059778-26028b07395a",
  "1522673607200-164d1b6ce486",
  "1519225421980-715cb0215aed",
].map((id) => photo(id, 2000));
/**
 * Prestations de chaque service, reprises du cahier des charges. Remplacées par
 * le champ « caractéristiques » du service dès qu’il est rempli dans l’admin.
 */
export const serviceDetails: Record<string, string[]> = {
  organisation: [
    "Conception du concept",
    "Planification",
    "Gestion logistique",
    "Coordination des prestataires",
    "Gestion du planning",
    "Installation et démontage",
    "Décoration",
    "Gestion technique",
    "Coordination le jour J",
    "Accompagnement personnalisé",
  ],
  animation: [
    "Animation pour enfants",
    "Jeux et activités",
    "Mascottes",
    "Animateurs",
    "Présentation et prise de parole",
    "Animation micro",
    "Animation musicale",
    "Jeux interactifs",
    "Ateliers créatifs",
    "Animation pour entreprises",
    "Animation de cérémonies",
  ],
  decoration: [
    "Décoration thématique",
    "Scénographie",
    "Arche et backdrop",
    "Décoration florale",
    "Mobilier décoratif",
    "Mise en lumière",
    "Décoration de tables",
    "Structures et éléments visuels",
    "Personnalisation selon le thème",
  ],
  rental: [
    "Mobilier",
    "Tables et chaises",
    "Structures",
    "Éclairage",
    "Sonorisation",
    "Écrans LED",
    "Éléments de décoration",
    "Accessoires événementiels",
    "Machines à fumée",
    "Jeux de lumière",
    "Matériel audiovisuel",
  ],
};
export function serviceItems(service: Entry) {
  const own = service.specifications?.split("\n").map((line) => line.trim()).filter(Boolean);
  return own?.length ? own : serviceDetails[service.id] || [];
}
/** Phrase dévoilée mot à mot au défilement, sur l’accueil. */
export const manifesto =
  "Chaque événement raconte une histoire. Nous l’écrivons avec vous, du premier échange au dernier invité, avec élégance, créativité et le sens du détail.";
/** Les engagements de la marque (positionnement, sans chiffre ni promesse datée). */
export const pillars = [
  ["Élégance", "Des mises en scène raffinées, pensées pour sublimer chaque instant."],
  ["Créativité", "Des concepts sur mesure, imaginés à partir de votre vision."],
  ["Fiabilité", "Une organisation rigoureuse et une coordination maîtrisée jusqu’au jour J."],
  ["Sens du détail", "Lumière, décor, rythme, accueil : chaque élément compte."],
] as const;
/** Parcours de collaboration du cahier des charges (7 étapes). */
export const methodSteps = [
  ["Échange initial", "Nous écoutons votre projet : vos envies, votre date, vos contraintes."],
  ["Analyse du besoin", "Nous précisons le format, le lieu, le nombre d’invités et les prestations utiles."],
  ["Proposition créative", "Un concept, une ambiance et une mise en scène pensés pour votre événement."],
  ["Devis personnalisé", "Une proposition claire et détaillée, ajustée à vos choix et à votre budget."],
  ["Préparation", "Coordination des prestataires, du matériel, du planning et de la logistique."],
  ["Réalisation", "Installation, coordination le jour J et attention portée à chaque instant."],
  ["Suivi", "Démontage, bilan et échange après l’événement, pour prolonger la relation."],
] as const;
export const navigation = [
  ["Accueil", "/"],
  ["Événements", "/evenements"],
  ["Services", "/services"],
  ["Location", "/location"],
  ["Réalisations", "/realisations"],
  ["À propos", "/a-propos"],
  ["Contact", "/contact"],
] as const;
const entry = (
  id: string,
  kind: Entry["kind"],
  title: string,
  description: string,
  extra: Partial<Entry> = {},
): Entry => ({ id, kind, title, description, published: true, ...extra });
export const seed: Entry[] = [
  entry(
    "home",
    "pages",
    "Votre événement.\nVotre vision.\nNotre savoir-faire.",
    "Des premières idées aux derniers instants, nous imaginons des événements qui vous ressemblent.",
    { subtitle: "CRÉATEUR D’ÉMOTIONS · MAROC", image: imagery.hero },
  ),
  entry(
    "about",
    "pages",
    "L’art de donner vie\nà vos envies.",
    "Eventheme réunit organisation, animation, décoration et location de matériel pour créer des moments singuliers. Une célébration intime ou un rendez-vous professionnel : chaque projet commence par votre vision.",
    { subtitle: "L’ESPRIT EVENTHEME", image: imagery.flowers },
  ),
  entry(
    "values",
    "pages",
    "Le sens du détail.\nL’essentiel de l’émotion.",
    "Écouter avec attention. Imaginer avec audace. Préparer avec précision. Notre approche associe créativité et coordination pour vous accompagner à chaque étape.",
  ),
  entry(
    "contact",
    "pages",
    "Tout commence\npar une conversation.",
    "Une idée, une date, une envie ? Racontez-nous votre projet. Nous construirons ensemble un événement à votre image.",
  ),
  entry(
    "events-page",
    "pages",
    "À chaque occasion,\nune émotion.",
    "Des moments privés aux grands rendez-vous professionnels, imaginons une expérience qui vous ressemble.",
  ),
  entry(
    "services-page",
    "pages",
    "Votre vision,\nnotre savoir-faire.",
    "Un accompagnement complet ou une expertise à la carte. Choisissez ce qui donnera vie à votre événement.",
  ),
  entry(
    "location-page",
    "pages",
    "Les détails font\nla différence.",
    "Mobilier, décoration, lumière et son : composez votre sélection de matériel événementiel.",
  ),
  entry(
    "projects-page",
    "pages",
    "Des instants.\nDes émotions.",
    "Découvrez nos univers et imaginez l’ambiance de votre prochain événement.",
  ),
  entry(
    "organisation",
    "services",
    "Organisation",
    "De la première idée au jour J. Conception, planification et coordination, pour vivre pleinement votre événement.",
    {
      image: imagery.tables,
      category: "Organisation événementielle",
      pricing: "request",
      price: null,
    },
  ),
  entry(
    "animation",
    "services",
    "Animation",
    "Des expériences vivantes, des sourires partagés. Animations musicales, ateliers et moments interactifs pour tous les publics.",
    {
      image: imagery.party,
      category: "Animation événementielle",
      pricing: "request",
      price: null,
    },
  ),
  entry(
    "decoration",
    "services",
    "Décoration & mise en scène",
    "Un univers pensé dans les moindres détails. Scénographie, compositions florales et mise en lumière.",
    {
      image: imagery.flowers,
      category: "Décoration",
      pricing: "request",
      price: null,
    },
  ),
  entry(
    "rental",
    "services",
    "Location de matériel",
    "Les bonnes pièces pour une mise en scène harmonieuse. Mobilier, accessoires et équipements techniques.",
    {
      image: imagery.tables,
      category: "Location",
      pricing: "request",
      price: null,
    },
  ),
  ...[
    "Mariage",
    "Anniversaire",
    "Fiançailles",
    "Réception",
    "Événement professionnel",
    "Conférence",
    "Team building",
    "Événement pour enfants",
    "Événement institutionnel",
    "Soirée privée",
    "Lancement de produit",
    "Événement culturel",
  ].map((title, i) =>
    entry(
      `event-${i}`,
      "events",
      title,
      "Une expérience sur mesure, de la conception à la coordination du jour J.",
      {
        image: i < 4 ? imagery.flowers : imagery.conference,
        price: null,
      },
    ),
  ),
  entry(
    "chair",
    "products",
    "Chaise de réception",
    "Exemple de fiche mobilier. Modèles et disponibilité à confirmer avec notre équipe.",
    {
      category: "Tables et chaises",
      image: imagery.tables,
      price: null,
      pricing: "request",
      color: "Doré",
      swatch: "#c9a34e",
      variants: [
        { name: "Doré", price: null },
        { name: "Blanc", price: null },
      ],
      demo: true,
    },
  ),
  entry(
    "arch",
    "products",
    "Arche décorative",
    "Exemple de structure personnalisable pour une cérémonie ou un espace photo.",
    {
      category: "Décoration",
      image: imagery.flowers,
      price: null,
      pricing: "request",
      variants: [
        { name: "Florale", price: null },
        { name: "Épurée", price: null },
      ],
      demo: true,
    },
  ),
  entry(
    "table",
    "products",
    "Table de réception",
    "Exemple de fiche pour composer un espace de réception harmonieux.",
    {
      category: "Mobilier",
      image: imagery.tables,
      price: null,
      pricing: "request",
      variants: [
        { name: "Ronde", price: null },
        { name: "Rectangulaire", price: null },
      ],
      demo: true,
    },
  ),
  entry(
    "light",
    "products",
    "Éclairage d’ambiance",
    "Exemple de mise en lumière à adapter à votre lieu et à votre scénographie.",
    {
      category: "Éclairage",
      image: imagery.party,
      price: null,
      pricing: "request",
      demo: true,
    },
  ),
  entry(
    "sound",
    "products",
    "Sonorisation",
    "Exemple de solution audio. Configuration technique à préciser selon votre événement.",
    {
      category: "Sonorisation",
      image: imagery.conference,
      price: null,
      pricing: "request",
      demo: true,
    },
  ),
  entry(
    "led",
    "products",
    "Écran & affichage",
    "Exemple de dispositif audiovisuel pour vos présentations et événements.",
    {
      category: "Écrans et affichage",
      image: imagery.conference,
      price: null,
      pricing: "request",
      demo: true,
    },
  ),
  entry(
    "inspiration-1",
    "projects",
    "Une réception, mille détails",
    "Planche d’inspiration. Cette photographie illustre une ambiance et ne représente pas une réalisation Eventheme.",
    { category: "Mariage", image: imagery.tables, demo: true },
  ),
  entry(
    "inspiration-2",
    "projects",
    "L’élégance à ciel ouvert",
    "Planche d’inspiration. Un décor floral pour imaginer une célébration à votre image.",
    { category: "Réception", image: imagery.flowers, demo: true },
  ),
  entry(
    "inspiration-3",
    "projects",
    "Des idées qui rassemblent",
    "Planche d’inspiration. Une atmosphère pour vos rencontres et événements professionnels.",
    { category: "Événement professionnel", image: imagery.conference, demo: true },
  ),
  entry("instagram", "socials", "Instagram", "@eventhemes", {
    network: "instagram",
    url: "https://www.instagram.com/eventhemes/",
  }),
  entry("whatsapp", "socials", "WhatsApp", "Échangeons sur votre projet", {
    network: "whatsapp",
    url: "https://wa.me/message/AREDMVCCJW5GM1",
  }),
];
