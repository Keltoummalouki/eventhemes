export type Testimonial = {
  name: string;
  eventType: string;
  quote: string;
};

export const TESTIMONIALS: readonly Testimonial[] = [
  {
    name: 'Sofia & Yassine',
    eventType: 'Mariage',
    quote:
      "L'équipe AURÉLYS a transformé notre vision en une soirée que nos invités racontent encore. Chaque détail portait leur signature.",
  },
  {
    name: 'Groupe Meridian',
    eventType: "Événement d'entreprise",
    quote:
      "Une organisation d'une précision remarquable. Notre soirée de gala a eu l'écho que nous espérions auprès de nos partenaires.",
  },
  {
    name: 'Leïla B.',
    eventType: 'Anniversaire',
    quote:
      "Du premier échange à la dernière bougie soufflée, tout était pensé avec goût. Une équipe à l'écoute et d'un professionnalisme rare.",
  },
  {
    name: 'Atlas Corp',
    eventType: 'Lancement produit',
    quote: 'Un rendu scénique impressionnant et une coordination technique sans faille le jour J.',
  },
];

/** Durée d'affichage d'un témoignage, en millisecondes. */
export const TESTIMONIAL_INTERVAL_MS = 5500;
