# EVENTHEME

## Working preview and production setup

The Eventheme client website and admin are now available at `/` and `/admin`. Run `npm run dev -- --hostname 127.0.0.1` for the local preview. Content changes and test enquiries persist in `.eventheme/data.json`; uploaded photos are stored in `public/uploads/`.

See [the setup and admin guide](docs/SETUP.md) for the Supabase migration, content export, administrator setup, and launch requirements. Supabase is used only when `EVENTHEME_DATA_MODE=supabase` is explicitly configured. Automated e-mails are not connected yet; demonstration photography, catalogue entries, contact information and legal copy must be finalized before launch.

The original brief and roadmap below are retained as project context; their earlier “Current Status” section describes the starting prototype.

**EVENTHEME** is a Moroccan event company specialised in event organisation, entertainment (_animation_), decoration and staging (_mise en scène_), and event-equipment rental.

This repository contains its official website: a digital showcase, a commercial catalogue, and a lead-generation tool that lets visitors configure their event and request a personalised quote.

> **Votre événement. Votre vision. Notre savoir-faire.**

---

## About EVENTHEME

EVENTHEME can handle a whole event or any part of it:

- **Organisation** — complete or partial organisation, from the concept to event-day coordination.
- **Animation** — entertainment for children, adults, companies and institutions.
- **Décoration & mise en scène** — themed decoration, scenography, floral design, lighting design.
- **Location** — furniture, lighting, sound, LED screens, structures, decoration and special-effects equipment.

Event types covered: anniversaires, réceptions, cérémonies, événements professionnels, team building, conférences, événements institutionnels, événements pour enfants, soirées privées, lancements de produits.

---

## Website Goals

- Present EVENTHEME's premium identity and positioning.
- Explain the services clearly.
- Showcase past events.
- Present the equipment available for rental.
- Let visitors select their needs and send a personalised quote request.
- Make contact easy through WhatsApp, phone and e-mail.
- Improve the brand's visibility on Google.
- Work on desktop, tablet and phone.
- Stay manageable by staff without technical knowledge.

Target visitor journey:

```text
Découvrir EVENTHEME → Choisir un service → Sélectionner ses besoins → Demander un devis → Contacter l'équipe
```

---

## Brand Identity

**Style:** luxurious, modern, minimalist, cinematic, elegant and professional. Never overloaded.

The site stays mostly black, white and photographic. Gold is an accent only: logo, key headings, buttons, decorative lines, prices and hover effects.

| Colour | Hex |
| --- | --- |
| Noir profond | `#050505` |
| Noir secondaire | `#111111` |
| Blanc cassé | `#F5F1E8` |
| Or principal | `#C9A34E` |
| Or clair | `#E4C779` |
| Bronze foncé | `#8B6914` |
| Gris secondaire | `#A5A5A5` |

| Use | Typeface |
| --- | --- |
| Headings | Bodoni Moda, Cormorant Garamond or Playfair Display |
| Premium accents | Cinzel |
| Body text | Montserrat or Manrope |

---

## Site Map

Main menu: **Accueil · Événements · Services · Location · Réalisations · À propos · Contact · Mon devis**

The « Mon devis » button is always visible, on mobile too.

| Page | Content |
| --- | --- |
| Accueil | Hero, quick introduction, the three main services, event types, featured projects, final CTA « Parlons de votre prochain événement. » |
| Événements | Private, professional, institutional, children's, cultural and promotional events, each with its services, examples and a quote button |
| Services | Organisation, Animation, Décoration & mise en scène, Location de matériel. Every service has an « Ajouter à mon devis » button |
| Location | Filterable rental catalogue with detailed product sheets |
| Réalisations | Past projects: photo and video galleries, filters by event type, detail pages, lightbox |
| À propos | Story, vision, mission, values, team, quality commitments, working method |
| Contact | Contact form, phone, e-mail, WhatsApp, Instagram, city, opening hours, optional map |
| Mon devis | The quote configurator |
| Legal | Mentions légales, politique de confidentialité, cookies, conditions générales de location et de prestation, politique d'annulation |

---

## Key Features

### Quote Configurator (« Mon devis »)

The central feature of the site. Visitors prepare a detailed request with no online payment.

| Step | Content |
| --- | --- |
| 1. Type d'événement | Anniversaire, Réception, Événement professionnel, Conférence, Team building, Événement pour enfants, Autre |
| 2. Services | Organisation, Animation, Décoration, Location de matériel, Sonorisation, Éclairage, Écran LED, Photographie, Vidéo, Autre prestation |
| 3. Événement | Date, start and end time, city, venue, guest count, estimated budget, theme, additional information |
| 4. Matériel | Add, adjust or remove products; review the selection; add a remark |
| 5. Client | Name, company, phone, e-mail, city, preferred contact method, privacy consent |
| 6. Résumé | Full recap before sending |
| 7. Envoi | Saved for the admin dashboard, sent by e-mail, and sendable through WhatsApp |

Items added with « Ajouter à mon devis » on the Services and Location pages pre-fill the configurator.

### Rental Catalogue

- **Product sheet:** photos, category, description, technical specifications, dimensions, colour or finish, indicative price, availability, « Ajouter à mon devis ».
- **Categories:** Mobilier, Tables et chaises, Décoration, Éclairage, Sonorisation, Écrans et affichage, Structures, Scénographie, Accessoires, Matériel audiovisuel, Animation, Machines et effets spéciaux.
- **Filters:** category, equipment type, colour, dimension, price range, availability.
- **Rental details:** quantity, rental date, return date, event location.
- **Pricing modes:** fixed, « à partir de », on request, or calculated from quantity and duration.

### Contact & Social

- Instagram: [instagram.com/eventhemes](https://www.instagram.com/eventhemes/)
- WhatsApp: [wa.me/message/AREDMVCCJW5GM1](https://wa.me/message/AREDMVCCJW5GM1)

The WhatsApp link appears in the header or mobile menu, hero, Contact page, configurator, product sheets and footer.

---

## Back Office

Staff manage the site without touching code: page content, images, videos, services, categories, rental products, prices, quote requests, contact requests and social links.

**Quote requests** can be listed, reviewed (client details, services, equipment, event date), annotated with internal notes, exported, and moved through these statuses:

`Nouvelle demande` → `En cours de traitement` → `Devis envoyé` → `Confirmé` → `Terminé` (or `Annulé`)

**Automated e-mails:** the admin is notified of every new request, and the client receives an acknowledgement.

---

## Quality Requirements

- **Responsive:** desktop, tablet, Android and iPhone, with no horizontal scrolling.
- **Motion:** elegant and light (progressive reveals, image transitions, moderate parallax, golden lines and butterflies, sticky header), always respecting `prefers-reduced-motion`.
- **SEO:** per-page titles and meta descriptions, clean URLs, XML sitemap, structured data, alt text, internal linking, Search Console and analytics. Target keywords include _organisation événementielle au Maroc_, _organisation événements Casablanca_ and _location matériel événementiel Casablanca_.
- **Performance:** WebP images, lazy loading, deferred scripts, caching, light videos, good Core Web Vitals.
- **Security:** SSL, spam-protected and injection-safe forms, secure admin accounts, login rate limiting, personal-data protection, regular backups.

---

## Roadmap

| Phase | Scope |
| --- | --- |
| **Phase 1** | Design, main pages, services, rental catalogue, contact, WhatsApp integration |
| **Phase 2** | Advanced quote configurator, automatic price calculation, stock management, reservations |
| **Later** | Online payment, availability checks, client area, invoicing, PDF quotes, contracts, booking calendar, FR/AR/EN, blog, testimonials, appointment booking, partner area |

---

## Tech Stack

- **Next.js (App Router)** with React 19 and TypeScript.
- **Supabase** as the backend: Postgres database, authentication for the admin area, and storage for media. _Planned, not yet integrated._
- **CSS Modules** with the brand palette exposed as design tokens. No UI framework and no utility-class library.
- **GSAP** (`gsap`, `@gsap/react`) for motion, behind a shared motion layer that honours reduced motion.
- **`next/font`** self-hosts the typefaces, with no render-blocking request to a third-party CDN.

---

## Current Status

The repository currently holds a single-page front-end prototype built from an earlier approved mockup for a brand called AURÉLYS (`aurelys-maquette .html`). It is the visual and technical starting point for EVENTHEME.

**Already built:** intro curtain, sticky header with accessible mobile menu, hero slideshow, animated statistics, services, equipment rail, process timeline, filterable gallery, testimonial slider, budget simulator, CTA and footer, all data-driven and motion-safe.

**Still to do:**

- Rebrand to EVENTHEME: name, copy, colour tokens, typefaces, contact details, real photography.
- Split the single page into the routes of the site map.
- Coming Soon page, rental catalogue, quote configurator and « Mon devis » basket, contact form.
- Supabase integration, admin area, request management and automated e-mails.
- Legal pages, sitemap and structured data.

---

## Getting Started

```bash
npm install
npm run dev        # http://localhost:3000
```

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |

---

## Project Files

```text
eventhemes/
├── CLAUDE.md                  Project context and implementation guidance
├── README.md
├── aurelys-maquette .html     Approved mockup (layout and motion reference)
└── src/
    ├── app/                   Layout, page composition, fonts, metadata, favicon
    ├── components/
    │   ├── layout/            Curtain, Header, MobileMenu, Footer, MotionRoot
    │   ├── sections/          Hero, Stats, Services, Equipment, ProcessTimeline,
    │   │                      Gallery, Testimonials, EventCalculator, CTA
    │   └── ui/                Button, Eyebrow, SectionHeader, Divider, Reveal,
    │                          RevealText, SmartImage, icons
    ├── data/                  Repeated content (services, equipment, gallery,
    │                          testimonials, navigation, calculator options)
    ├── hooks/                 useCarousel, useScrolled
    ├── lib/                   Motion core (GSAP), pricing logic, image URL
    │                          builders, intro relay, class helper
    └── styles/                Design tokens, global base, shared utilities
```

The separation is deliberate: **content** lives in `data/`, **business logic** in `lib/`, **behaviour** in `hooks/`, **presentation** in `components/` and `styles/`. Content that staff must edit (products, projects, prices, social links) will move from `data/` to Supabase.

### Motion

All animation goes through `src/lib/motion.ts`. It registers the GSAP plugins once, exposes the shared motion vocabulary (`MOTION`: durations, easings, amplitudes) that gives every section the same rhythm, and provides the two guards every animation is written against:

| Helper | Use for | Behaviour when motion is reduced |
| --- | --- | --- |
| `motionSafe` | Ornament (parallax, magnetic buttons, pinning) | The effect is never created |
| `revealSafe` | Content that appears on scroll | Content is shown immediately, unanimated |

Two rules keep this maintainable:

1. **Always `fromTo`, never `from`.** `from` infers its end state from the DOM, so a second run of the effect (React Strict Mode, hot reload, a SplitText re-split) reads the hidden state left by the first and animates from nothing to nothing.
2. **One property, one owner.** Where CSS already animates a transform on hover, GSAP animates a wrapper layer instead (`.frame`, `.pan`, `.backdrop`) rather than fighting over the same inline style.

`prefers-reduced-motion` is honoured throughout, and the pinned horizontal equipment rail falls back to native horizontal scrolling below 960px.
