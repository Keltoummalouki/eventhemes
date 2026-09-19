/**
 * Réseaux et canaux proposés dans l'onglet « Contact & réseaux ». L'équipe
 * n'ajoute au site que ceux qu'elle utilise.
 *
 * `audience` : le réseau a des abonnés, dont le nombre peut être affiché.
 */
export const socialNetworks = [
  { key: 'instagram', label: 'Instagram', placeholder: 'https://www.instagram.com/…', audience: true },
  { key: 'facebook', label: 'Facebook', placeholder: 'https://www.facebook.com/…', audience: true },
  { key: 'tiktok', label: 'TikTok', placeholder: 'https://www.tiktok.com/@…', audience: true },
  { key: 'whatsapp', label: 'WhatsApp', placeholder: 'https://wa.me/212…', audience: false },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://www.youtube.com/@…', audience: true },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://www.linkedin.com/company/…', audience: true },
  { key: 'pinterest', label: 'Pinterest', placeholder: 'https://www.pinterest.com/…', audience: true },
  { key: 'snapchat', label: 'Snapchat', placeholder: 'https://www.snapchat.com/add/…', audience: true },
  { key: 'x', label: 'X (Twitter)', placeholder: 'https://x.com/…', audience: true },
  { key: 'telegram', label: 'Telegram', placeholder: 'https://t.me/…', audience: true },
  { key: 'email', label: 'E-mail', placeholder: 'mailto:contact@…', audience: false },
  { key: 'phone', label: 'Téléphone', placeholder: 'tel:+212…', audience: false },
] as const;

export type SocialNetwork = (typeof socialNetworks)[number]['key'];

export const isSocialNetwork = (value: unknown): value is SocialNetwork =>
  socialNetworks.some((network) => network.key === value);
