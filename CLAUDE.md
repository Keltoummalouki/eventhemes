# CLAUDE.md — EVENTHEME

## Project Context

EVENTHEME is a Moroccan event company: event organisation, entertainment (_animation_), decoration and staging (_mise en scène_), and event-equipment rental.

This repository is its official website. The site does three jobs at once:

- a **digital showcase** for a premium, creative, reliable brand,
- a **commercial catalogue** of services and rental equipment,
- a **lead-generation tool**: visitors select their needs and send a personalised quote request.

Brand signature (use verbatim):

> Votre événement. Votre vision. Notre savoir-faire.

Target visitor journey:

```text
Découvrir EVENTHEME → Choisir un service → Sélectionner ses besoins → Demander un devis → Contacter l'équipe
```

Client priorities, in order: visual elegance, image quality, clarity of services, ease of requesting a quote, conversion, performance, security, scalability.

---

## Sources of Truth

1. **The EVENTHEME cahier des charges** (client specification, summarised in this file) is authoritative for brand, content, pages, features and requirements. It wins every conflict.
2. **`aurelys-maquette .html`** (note the space in the filename) is the approved mockup from the project's earlier AURÉLYS phase. It remains the reference for layout quality, spacing, motion, interaction patterns and responsive behaviour. It is **no longer** a reference for the brand name, colours, fonts or copy.
3. **Stack decision (user, 2026-09-18):** Next.js front-end with a Supabase backend. This replaces the WordPress / Elementor / WPCode stack named in §4 of the cahier des charges. Every other requirement of the spec still applies, including a back office usable by staff with no technical knowledge.

---

## Current State of the Repository

The code is a single-page Next.js front-end that reproduces the AURÉLYS mockup. It is the starting point for EVENTHEME, not the finished product.

**Still AURÉLYS and due for the rebrand:**

- name, metadata and copy (`src/data/site.ts` and the other `src/data/*` modules),
- colour tokens (`src/styles/tokens.css`),
- the Jost body font (`src/app/layout.tsx`), which is not one of the spec's typefaces,
- placeholder phone, e-mail and WhatsApp number, and Unsplash/Picsum photography (`src/lib/images.ts`),
- the `package.json` name and the git remote (`AURELYS`).

**Inherited sections the EVENTHEME home page spec does not ask for:** Stats (unconfirmed figures such as « 500+ événements »), Testimonials (a future evolution in the spec), the Equipment rail, the 5-step Process timeline, and the budget simulator with its Essentiel / Signature / Prestige multipliers (`src/lib/pricing.ts`, `src/data/calculator.ts`). Don't extend them, don't present their figures as EVENTHEME facts, and ask before removing or repurposing them.

**Not built yet:** multi-page routing, Coming Soon page, rental catalogue, quote configurator and « Mon devis » basket, contact form, Supabase integration, admin area, e-mails, legal pages, sitemap, structured data.

Rebrand what a task touches, but don't fold a codebase-wide rebrand into an unrelated change unless asked.

---

## Brand

### Positioning

Communicate élégance, créativité, professionnalisme, fiabilité, qualité, innovation and sens du détail. EVENTHEME must read as a professional, creative event brand in Morocco.

Style: luxueux, moderne, minimaliste, cinématographique, élégant, professionnel. **Never overloaded.** The site stays mostly black, white and photographic.

### Colour Palette

| Spec name | Hex | Suggested token |
| --- | --- | --- |
| Noir profond | `#050505` | `--noir` |
| Noir secondaire | `#111111` | `--noir-2` |
| Blanc cassé | `#F5F1E8` | `--blanc` |
| Or principal | `#C9A34E` | `--or` |
| Or clair | `#E4C779` | `--or-clair` |
| Bronze foncé | `#8B6914` | `--or-profond` |
| Gris secondaire | `#A5A5A5` | `--gris` |

- Gold is an accent only: logo, important headings, buttons, decorative lines, prices, hover effects.
- Transparent variants of palette colours (hairlines, overlays) are fine. New hues are not.
- Current tokens with no spec equivalent (`--anthracite`, `--anthracite-2`, `--or-vif`, `--blanc-doux`) must be remapped or retired during the rebrand.

### Typography

- **Headings:** Bodoni Moda, Cormorant Garamond or Playfair Display. Cormorant Garamond is already loaded.
- **Premium accents:** Cinzel (for example eyebrows, labels, small caps details).
- **Body and UI:** Montserrat or Manrope, replacing Jost.

The final choice between the allowed typefaces hasn't been made. Ask before switching fonts.

### Tone

Polished French: concise, premium, reassuring, client-focused.

Never invent facts. Statistics, client names, testimonials, awards, prices and contact details appear only when EVENTHEME supplies them. Placeholder content must be obviously placeholder.

The site is French (`lang="fr"`). French/Arabic/English is a future evolution, so keep copy in the data layer rather than hard-coded in JSX.

---

## Site Structure

Main menu: **Accueil · Événements · Services · Location · Réalisations · À propos · Contact · Mon devis**. « Mon devis » is a highlighted button that stays reachable on mobile.

Proposed routes (clean French URLs, not created yet):

| Route | Page |
| --- | --- |
| `/` | Accueil |
| `/evenements` | Événements |
| `/services` | Services |
| `/location`, `/location/[slug]` | Catalogue, fiche produit |
| `/realisations`, `/realisations/[slug]` | Réalisations, fiche projet |
| `/a-propos` | À propos |
| `/contact` | Contact |
| `/devis` | Mon devis (configurateur) |
| `/mentions-legales`, `/politique-de-confidentialite`, … | Legal pages |
| `/admin` | Back office (authenticated) |

Before launch, the Coming Soon page replaces the public site.

---

## Page Requirements

### Coming Soon

- Centred EVENTHEME logo, the signature, « Quelque chose d’extraordinaire arrive. » and « L’expérience EVENTHEME arrive bientôt. »
- Instagram and WhatsApp links.
- Dark, luxurious design on a photographic or light video background, with discreet golden butterflies.
- Content perfectly centred on the vertical axis at every viewport.
- **No countdown.**

### Header

Logo, main menu, « Mon devis » button, WhatsApp link (in the header or mobile menu), hamburger menu on mobile, transparent or dark background, sticky with an elegant transition on scroll.

### Accueil

1. **Hero:** high-quality event image or video, dark overlay, signature, short introduction, buttons « CONFIGURER MON ÉVÉNEMENT » and « DÉCOUVRIR NOS SERVICES », WhatsApp link.
2. **Présentation rapide:** who EVENTHEME is, what it does, why choose it. Button to À propos.
3. **Services principaux:** Organisation (complete or partial), Animation (children, adults, companies, institutions), Location (equipment, furniture, lighting, accessories).
4. **Types d'événements:** Anniversaires, Mariages, Fiançailles, Réceptions, Cérémonies, Événements professionnels, Team building, Conférences, Événements institutionnels, Événements pour enfants, Soirées privées, Lancements de produits.
5. **Réalisations mises en avant:** photos and videos, each with event name, type, date or year, place and description.
6. **CTA final:** « Parlons de votre prochain événement. » with « Demander un devis » and « Nous contacter sur WhatsApp ».

### Événements

Categories: privés, professionnels, institutionnels, pour enfants, culturels, promotionnels. Each has an image, a presentation, the available services, example projects and a quote button.

### Services

Every service item has an « Ajouter à mon devis » button.

- **Organisation événementielle:** conception du concept, planification, gestion logistique, coordination des prestataires, gestion du planning, installation et démontage, décoration, gestion technique, coordination le jour de l'événement, accompagnement personnalisé.
- **Animation événementielle:** animation pour enfants, jeux et activités, mascottes, animateurs, présentation et prise de parole, animation micro, animation musicale, jeux interactifs, ateliers créatifs, animation pour entreprises, animation de cérémonies.
- **Décoration et mise en scène:** décoration thématique, scénographie, arche et backdrop, décoration florale, mobilier décoratif, mise en lumière, décoration de tables, structures et éléments visuels, personnalisation selon le thème.
- **Location de matériel:** mobilier, tables et chaises, structures, éclairage, sonorisation, écrans LED, éléments de décoration, accessoires événementiels, machines à fumée, jeux de lumière, matériel audiovisuel.

### Location (Rental Catalogue)

- **Product sheet:** main photo, gallery, name, category, description, technical specifications, dimensions, colour or finish, indicative price (if applicable), availability (if enabled), « Ajouter à mon devis », WhatsApp link.
- **Categories:** Mobilier, Tables et chaises, Décoration, Éclairage, Sonorisation, Écrans et affichage, Structures, Scénographie, Accessoires, Matériel audiovisuel, Animation, Machines et effets spéciaux.
- **Filters:** category, equipment type, colour, dimension, price range, availability (if possible).
- **Rental details from the client:** quantity, rental date, return date, event location.
- **Price modes:** fixed, « à partir de », sur demande, or calculated from quantity and duration. The data model must support all four.

Staff must be able to add products without touching code, so products live in Supabase, not in `src/data`.

### Mon devis (Quote Configurator)

The central feature of the site. It prepares a request; there is **no online payment**.

1. **Type d'événement:** Anniversaire, Mariage, Fiançailles, Réception, Événement professionnel, Conférence, Team building, Événement pour enfants, Autre.
2. **Services souhaités:** Organisation, Animation, Décoration, Location de matériel, Sonorisation, Éclairage, Écran LED, Photographie, Vidéo, Autre prestation.
3. **Informations de l'événement:** date, start and end time, ville, lieu, nombre d'invités, budget estimatif, thème ou ambiance, informations complémentaires.
4. **Sélection du matériel:** add a product, change its quantity, remove it, view the selection, add a remark.
5. **Informations du client:** nom et prénom, nom de l'entreprise, téléphone, e-mail, ville, moyen de contact préféré, consentement à la politique de confidentialité.
6. **Résumé:** event type, date, place, services, equipment and quantities, indicative budget, client details.
7. **Envoi:** saved in Supabase (visible in the admin), e-mailed, and sendable through WhatsApp.

Items added with « Ajouter à mon devis » on Services and Location feed steps 2 and 4. That basket must persist while the visitor browses between pages.

WhatsApp message (fill the brackets):

> Bonjour EVENTHEME, je souhaite demander un devis pour un événement de type [type], prévu le [date], à [ville]. Les services souhaités sont : [services]. Voici mes informations : [coordonnées].

Confirmation message:

> Merci pour votre demande. Notre équipe vous contactera dans les meilleurs délais afin de préparer une proposition adaptée à votre événement.

Until Phase 2 adds automatic price calculation, the budget is the figure the client enters. Any amount shown is indicative, never a quotation.

### Réalisations

Photo gallery, videos, filters by event type, project detail pages, lightbox.

Categories: mariages, anniversaires, événements professionnels, événements institutionnels, animation enfants, décoration et scénographie. Each project has a name, type, date or year, place and description.

### À propos

Histoire, vision, mission, valeurs, équipe, expérience, engagements qualité, méthode de travail.

Collaboration steps, replacing the mockup's 5-step process:

1. Échange initial
2. Analyse du besoin
3. Proposition créative
4. Devis personnalisé
5. Préparation
6. Réalisation
7. Suivi

### Contact

Contact form plus phone, e-mail, WhatsApp, Instagram, city of operation, opening hours and an optional Google Maps embed.

Form fields: nom complet, e-mail, téléphone, objet, type d'événement, message, consentement à la politique de confidentialité. The form must be protected against spam, automated submissions, injection and repeated abuse.

### Footer

Logo, signature, short description, quick links, services, social networks, WhatsApp, contact information, mentions légales, politique de confidentialité, copyright.

Recommended line: « EVENTHEME — Organisation, animation et location événementielle. »

---

## Contact & Social Links

- Instagram: https://www.instagram.com/eventhemes/
- WhatsApp: https://wa.me/message/AREDMVCCJW5GM1

WhatsApp appears in the header or mobile menu, the hero, Contact, the configurator, product sheets and the footer. Instagram appears in the footer, on Contact, and optionally as a stable Instagram gallery.

The WhatsApp link above is a short link: its pre-filled message is fixed in the WhatsApp Business app. The configurator's per-request message needs a `https://wa.me/<number>?text=…` link, which requires the business number in international format.

Still to be supplied by EVENTHEME: phone number, e-mail address, city of operation, opening hours, logo files, real photos and videos, legal content. Don't invent them. Keep clearly marked placeholders until they arrive.

---

## Back Office & Data (Supabase)

Staff manage, without code: page texts, images, videos, services, categories, rental products, prices, quote requests, contact requests and social links.

**Quote requests.** The admin can list every request, see client details, selected products, requested services and event date, change the status, add internal notes, export requests (if possible), and receive an e-mail for each new request.

Statuses: `Nouvelle demande` · `En cours de traitement` · `Devis envoyé` · `Confirmé` · `Terminé` · `Annulé`.

**Automated e-mails.**

- To the admin: name, phone, e-mail, event type, date, place, services, selected equipment, message.
- To the client: « Nous avons bien reçu votre demande de devis. Notre équipe EVENTHEME reviendra vers vous prochainement. »

**Supabase rules.**

- Row Level Security on every table. Visitors can read published content and create requests; only authenticated admins read requests or edit content.
- Public submissions go through server code (Server Actions or Route Handlers) that validates input, applies anti-spam checks and triggers the e-mails.
- Secret and service-role keys stay server-side. Never put them in `NEXT_PUBLIC_*` variables or client components.
- Media (product photos, galleries, videos) lives in Supabase Storage and is served compressed.
- Admin accounts use Supabase Auth, with no public sign-up.
- Keep schema changes as versioned migrations in the repo.
- The e-mail provider isn't chosen yet. Ask before adding one.

Supabase is not installed yet. When it is, list the required environment variables in a committed `.env.example`.

---

## Cross-cutting Requirements

### Responsive

Desktop, tablet, Android phones and iPhone. Check alignment, text readability, button sizes, mobile menu, forms, galleries, configurator, animations and images. No horizontal scrolling. Central elements, especially on the Coming Soon page and heroes, stay precisely aligned on the vertical axis.

### Animation

Elegant, light and non-intrusive: progressive reveals, image transitions, moderate parallax, hover effects, golden lines, golden butterflies, sticky header. Animations must not slow the site and must respect `prefers-reduced-motion`.

### Accessibility

Semantic HTML, keyboard navigation, visible focus states, accessible mobile menu, labelled inputs, meaningful alt text, readable contrast (including gold on black), reduced motion.

### SEO

A title and meta description per page, one H1 per page with a clean H2/H3 hierarchy, clean URLs, XML sitemap, alt text, relevant structured data, optimised images, internal linking, Google Search Console, Google Analytics or an equivalent.

Keywords: organisation événementielle au Maroc, organisation événements Casablanca, animation événementielle Maroc, location matériel événementiel Casablanca, décoration événementielle, organisation anniversaire, animation enfants, location mobilier événementiel, événement professionnel Maroc, scénographie événementielle.

### Performance

WebP images, lazy loading, minified and deferred scripts, caching, light videos, mobile optimisation, few dependencies, good Core Web Vitals.

### Security

SSL, protected and spam-resistant forms, protection against injection, personal-data protection, secure admin accounts, limited login attempts, regular backups, dependencies kept up to date, no unused packages.

### Legal

Mentions légales, politique de confidentialité, politique cookies (if needed), conditions générales de location, conditions générales de prestation, politique d'annulation (if applicable).

Build the pages, but the final legal text must be validated by the owner or a qualified professional. Never present drafted legal text as final.

---

## Technical Principles

**Stack:** Next.js (App Router), React 19, TypeScript, CSS Modules with design tokens, GSAP (`gsap`, `@gsap/react`), `next/font`, and Supabase for data, auth and storage. No UI framework and no utility-class library. Avoid unnecessary dependencies.

**Code organisation (keep it):**

- `src/data/`: static content and options (navigation, service lists, configurator options). Anything staff must edit moves to Supabase.
- `src/lib/`: business logic, kept pure and testable (pricing, formatting, image URLs, motion core).
- `src/hooks/`: behaviour.
- `src/components/`: presentation, split into `layout/`, `sections/` and `ui/`.
- `src/styles/`: tokens, base styles, utilities.

Repeated content (services, products, event types, projects, navigation, configurator options) is data-driven, never hard-coded in JSX.

**Motion rules** (see `src/lib/motion.ts`):

- Ornamental effects go through `motionSafe`. Content revealed on scroll goes through `revealSafe`.
- Always `fromTo`, never `from`.
- One property, one owner: if CSS animates a transform, GSAP animates a wrapper layer.
- Animate `transform` and `opacity`.

**Checks:** run `npm run lint` and `npm run typecheck` before calling work done. Use `npm run build` for anything touching routing, metadata or server code.

---

## Scope & Phases

- **Phase 1:** design, main pages, services, rental catalogue, contact, WhatsApp integration.
- **Phase 2:** advanced quote configurator, automatic price calculation, stock management, reservations.

The spec calls the configurator the central feature, so a basic version is expected before Phase 2 makes it advanced.

**Future evolutions (don't implement unless asked):** online payment, equipment booking, automatic availability checks, client area, invoicing, PDF quote generation, contracts, booking calendar, advanced stock management, French/Arabic/English, blog, client testimonials, appointment booking, partner or supplier area.

---

## Definition of Done

Before delivery, test all links and buttons, desktop and mobile menus, forms and e-mail sending, the configurator, adding and removing products, WhatsApp and Instagram links, galleries, animations, responsive display, speed and basic security, in Chrome, Firefox, Safari and Edge.

Launch also covers the domain, hosting, SSL, the production Supabase project, admin accounts, e-mail configuration, Search Console, analytics, the sitemap, a final check and a full backup. Deliverables include a short admin training session and maintenance documentation.

---

## Golden Rule

Before building anything, ask:

> Does this present EVENTHEME as a premium, creative and reliable event partner, and does it make it easier for a visitor to request a quote?

Then build it within the brand system above.
