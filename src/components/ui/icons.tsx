import type { SocialNetwork } from '@/data/socials';

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

type IconProps = { className?: string };

/** Trait fin commun aux pictogrammes d'interface : décoratifs, jamais annoncés. */
function Glyph({ className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/** Chevron vers le bas : ouverture d'une liste. Pivoté par CSS pour les autres directions. */
export function ChevronIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="M6 9l6 6 6-6" />
    </Glyph>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </Glyph>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-4.2-4.2" />
    </Glyph>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Glyph>
  );
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <rect x="3.5" y="5" width="17" height="15.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </Glyph>
  );
}

export function ClockIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </Glyph>
  );
}

/** Pictogrammes des réseaux, au trait fin comme le reste de l'interface. */
const SOCIAL_PATHS: Record<SocialNetwork, React.ReactNode> = {
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r=".6" />
    </>
  ),
  facebook: (
    <path d="M13.5 20.5v-7h2.4l.4-3h-2.8V8.7c0-.9.3-1.5 1.5-1.5h1.4V4.6c-.3 0-1.1-.1-2.1-.1-2.1 0-3.5 1.3-3.5 3.6v2.4H8.4v3h2.4v7z" />
  ),
  tiktok: <path d="M13.5 3.5v11.2a3.2 3.2 0 1 1-3.2-3.2M13.5 3.5c.4 2.4 2.1 4.1 4.8 4.4" />,
  whatsapp: (
    <>
      <path d="M12 3.5a8.5 8.5 0 0 0-7.3 12.8l-1.2 4.2 4.3-1.1A8.5 8.5 0 1 0 12 3.5z" />
      <path d="M9.2 8.3c-.5 0-1 .6-1 1.4 0 2.5 3.6 6 6.1 6 .8 0 1.4-.5 1.4-1v-.8l-1.9-.8-.8.8c-1.1-.5-2.2-1.6-2.7-2.7l.8-.8-.8-1.9z" />
    </>
  ),
  youtube: (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="M10.2 9.3v5.4l4.6-2.7z" />
    </>
  ),
  linkedin: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
      <path d="M8 10.5V17M8 7.3v.2M11.5 17v-6.5M11.5 13.3c0-1.6 1-2.8 2.5-2.8s2.3 1 2.3 2.8V17" />
    </>
  ),
  pinterest: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M11.2 10.5 9.3 19M9.8 15.2c.5.6 1.3 1 2.3 1 2.3 0 3.9-2 3.9-4.5 0-2.3-1.8-4.2-4.3-4.2-2.7 0-4.3 1.9-4.3 4 0 .8.3 1.6.8 2" />
    </>
  ),
  snapchat: (
    <path d="M12 3.5c-2.8 0-4.6 2-4.6 4.6v2.3l-1.7.6c.4.8 1.1 1.1 1.7 1.3-.5 1.5-1.7 2.8-3.4 3.3.3.8 1.3 1 2.1 1.1l.4 1.2c.9-.2 1.9-.3 2.8.2.9.5 1.5 1.2 2.7 1.2s1.8-.7 2.7-1.2c.9-.5 1.9-.4 2.8-.2l.4-1.2c.8-.1 1.8-.3 2.1-1.1-1.7-.5-2.9-1.8-3.4-3.3.6-.2 1.3-.5 1.7-1.3l-1.7-.6V8.1c0-2.6-1.8-4.6-4.6-4.6z" />
  ),
  x: <path d="M4 4h4.5L20 20h-4.5zM19.5 4l-6 6.8M10.5 13.2 4.5 20" />,
  telegram: <path d="M20.5 4 3.5 10.8l5.6 1.9 1.9 6.3 3.1-4 4.9 3.6zM9.1 12.7 20.5 4" />,
  email: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </>
  ),
  phone: (
    <path d="M6 3.5h3l1.5 4.2-2 1.4a11 11 0 0 0 6.4 6.4l1.4-2 4.2 1.5v3a1.5 1.5 0 0 1-1.5 1.5A16.5 16.5 0 0 1 4.5 5 1.5 1.5 0 0 1 6 3.5z" />
  ),
};

/** Pictogramme d'un réseau social ou d'un canal de contact : décoratif, jamais annoncé. */
export function SocialIcon({ name, className }: IconProps & { name: SocialNetwork }) {
  return <Glyph className={className}>{SOCIAL_PATHS[name]}</Glyph>;
}
