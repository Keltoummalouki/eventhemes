import type { SocialKey } from '@/data/site';

/** Flèche « Découvrir » des cartes de service. */
export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

const SOCIAL_PATHS: Record<SocialKey, React.ReactNode> = {
  whatsapp: (
    <>
      <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2z" />
      <path
        d="M8.5 8.7c.2-.5.4-.5.6-.5h.5c.2 0 .4 0 .5.4.2.5.6 1.5.6 1.6.1.1.1.3 0 .4-.1.2-.1.3-.3.4-.1.2-.3.3-.4.5-.1.1-.3.3-.1.5.2.4.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.2.1.4.1.5-.1.2-.2.6-.7.8-.9.2-.2.4-.2.6-.1l1.5.7c.2.1.4.2.4.3.1.2.1.9-.2 1.4-.3.6-1.4 1.1-2 1.1-.5.1-1.1.1-3.5-1-2.9-1.1-4.7-4-4.9-4.2-.1-.2-1.1-1.5-1.1-2.9 0-1.4.7-2 1-2.3z"
        fill="var(--noir)"
      />
    </>
  ),
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.4" cy="6.6" r="1" />
    </>
  ),
  facebook: (
    <path d="M13 22v-8h2.7l.4-3.3H13V8.5c0-1 .3-1.6 1.7-1.6H16V4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.4H7.5V13H9.8v9z" />
  ),
};

/** Icône de réseau social du pied de page. */
export function SocialIcon({ name }: { name: SocialKey }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--or)" strokeWidth="1.4" aria-hidden="true" focusable="false">
      {SOCIAL_PATHS[name]}
    </svg>
  );
}
