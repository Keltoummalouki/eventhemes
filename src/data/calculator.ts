/** Options du simulateur de budget événementiel. */

export const EVENT_TYPES = ['Mariage', 'Fiançailles', 'Anniversaire', 'Entreprise', 'Conférence'] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const VENUES = [
  'Domaine privé',
  'Hôtel & palace',
  'Salle de réception',
  'Extérieur / jardin',
  'Lieu personnel du client',
] as const;
export type Venue = (typeof VENUES)[number];

export const CALCULATOR_SERVICES = [
  'Décoration',
  'Sonorisation',
  'Éclairage',
  'Écrans LED',
  'Traiteur',
  'DJ',
  'Photo/Vidéo',
] as const;
export type CalculatorService = (typeof CALCULATOR_SERVICES)[number];

export type ServiceLevel = {
  label: string;
  multiplier: number;
};

export const SERVICE_LEVELS: readonly ServiceLevel[] = [
  { label: 'Essentiel', multiplier: 1 },
  { label: 'Signature', multiplier: 1.6 },
  { label: 'Prestige', multiplier: 2.4 },
];

export const GUESTS_RANGE = { min: 20, max: 800, step: 10, initial: 150 } as const;

/** Sélection initiale du simulateur, telle que présentée dans la maquette. */
export const CALCULATOR_DEFAULTS = {
  eventType: EVENT_TYPES[0],
  venue: VENUES[0],
  guests: GUESTS_RANGE.initial,
  /** Les trois premières prestations sont pré-cochées. */
  services: CALCULATOR_SERVICES.slice(0, 3) as readonly CalculatorService[],
  level: SERVICE_LEVELS[0].label,
} as const;
