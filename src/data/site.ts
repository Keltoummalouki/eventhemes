/** Identité, navigation et coordonnées de l'agence. */

export const SITE = {
  name: 'AURÉLYS',
  title: "AURÉLYS — Événements & Cérémonies d'exception",
  promise: 'Nous créons des moments inoubliables.',
  description:
    "Agence événementielle spécialisée dans l'organisation de mariages, cérémonies et événements d'exception.",
} as const;

export type NavLink = {
  label: string;
  href: string;
};

export const NAV_LINKS: readonly NavLink[] = [
  { label: 'Accueil', href: '#accueil' },
  { label: 'Services', href: '#services' },
  { label: 'Réalisations', href: '#realisations' },
  { label: 'Équipements', href: '#equipements' },
  { label: 'Notre méthode', href: '#methode' },
  { label: 'À propos', href: '#apropos' },
  { label: 'Contact', href: '#contact' },
];

export const CONTACT = {
  phone: { label: '+212 5 00 00 00 00', href: 'tel:+212500000000' },
  whatsapp: { label: 'WhatsApp', href: 'https://wa.me/212600000000' },
  email: { label: 'contact@aurelys-events.ma', href: 'mailto:contact@aurelys-events.ma' },
} as const;

export type SocialKey = 'whatsapp' | 'instagram' | 'facebook';

export type SocialLink = {
  key: SocialKey;
  label: string;
  href: string;
};

/** Icônes affichées sous le logo du pied de page. */
export const SOCIAL_ICONS: readonly SocialLink[] = [
  { key: 'whatsapp', label: 'WhatsApp', href: 'https://wa.me/212600000000' },
  { key: 'instagram', label: 'Instagram', href: '#' },
  { key: 'facebook', label: 'Facebook', href: '#' },
];

/** Colonnes de liens du pied de page. */
export const FOOTER_COLUMNS: readonly { title: string; links: readonly NavLink[] }[] = [
  {
    title: 'Agence',
    links: [
      { label: 'À propos', href: '#apropos' },
      { label: 'Services', href: '#services' },
      { label: 'Réalisations', href: '#realisations' },
    ],
  },
  {
    title: 'Contact',
    links: [
      { label: CONTACT.phone.label, href: CONTACT.phone.href },
      { label: CONTACT.whatsapp.label, href: CONTACT.whatsapp.href },
      { label: CONTACT.email.label, href: CONTACT.email.href },
    ],
  },
  {
    title: 'Suivez-nous',
    links: [
      { label: 'Instagram', href: '#' },
      { label: 'Facebook', href: '#' },
    ],
  },
];

export const FOOTER_TAGLINE = 'Créons ensemble des moments inoubliables.';
export const FOOTER_COPY = '© 2026 AURÉLYS — Maquette visuelle, tous droits réservés.';
