# AURÉLYS

**AURÉLYS** is a premium event planning and event production brand dedicated to creating memorable private and professional events.

The platform represents the agency online and acts as its main digital showcase, portfolio, service catalogue, trust-building experience, and lead-generation channel.

> **Nous créons des moments inoubliables.**

---

## About AURÉLYS

AURÉLYS accompanies clients from the initial event idea through planning, creative direction, technical setup, and final execution.

The company is positioned as a **complete event partner**, combining:

- event organization,
- creative production,
- technical production,
- equipment,
- decoration,
- entertainment,
- photography/video,
- catering,
- event-day coordination.

The objective is to give clients one trusted partner capable of managing the entire event experience.

---

## Who AURÉLYS Serves

### Private Clients

AURÉLYS creates experiences for:

- weddings,
- engagements,
- birthdays,
- family ceremonies,
- private celebrations,
- premium personal events.

### Companies & Organizations

AURÉLYS also supports:

- corporate events,
- conferences,
- product launches,
- gala evenings,
- inaugurations,
- professional ceremonies.

---

## Services

The AURÉLYS service offering includes:

### Event Organization

- Organisation de mariages
- Fiançailles
- Anniversaires
- Événements d'entreprise
- Conférences
- Inaugurations

### Creative Production

- Décoration
- Scénographie
- Photographie
- Production vidéo
- DJ et animation
- Traiteur
- Effets spéciaux

### Technical Production

- Sonorisation
- Éclairage
- Écrans LED
- Scènes et structures
- Moving Heads
- Lasers
- Vidéoprojecteurs
- Structures Truss
- Cabine DJ
- Machines à fumée
- Générateurs de Haze

---

## Project Purpose

The AURÉLYS website has five main goals.

### Build the Brand

Create a strong premium identity around elegance, quality, emotion, and professionalism.

### Present the Services

Help visitors understand that AURÉLYS can manage both the creative and technical parts of an event.

### Build Trust

Use experience, previous projects, testimonials, process, and professional presentation to reassure potential clients.

### Inspire Visitors

Showcase event photography and previous work so visitors can imagine what AURÉLYS could create for them.

### Generate Leads

Guide visitors toward:

- requesting a quote,
- contacting the agency,
- starting an event configuration,
- discussing a project with the team.

---

## User Journey

The website is designed around the following journey:

```text
Discover AURÉLYS
        ↓
Understand the services
        ↓
See experience and expertise
        ↓
Discover technical capabilities
        ↓
Understand the process
        ↓
Explore previous events
        ↓
Read client testimonials
        ↓
Configure an event
        ↓
Request a personalized quote
```

---

## Main Website Experience

### Hero

The opening experience introduces the AURÉLYS universe through premium event photography, elegant typography, and the main brand promise.

### Experience & Statistics

The website communicates experience through figures such as:

- 500+ événements réalisés
- 300+ clients satisfaits
- 10+ années d'expérience
- 50+ solutions événementielles

### Services

Visitors can discover the complete AURÉLYS offering, from event planning to technical production.

### Equipment

The equipment section highlights the agency's production capabilities and helps establish credibility for large and technically demanding events.

### Process

AURÉLYS follows a structured five-step process:

1. Échange
2. Conception
3. Planification
4. Installation
5. Réalisation

### Portfolio

The portfolio allows visitors to explore work across categories including:

- Mariages
- Entreprises
- Conférences
- Anniversaires
- Événements privés

### Testimonials

Client testimonials reinforce trust and demonstrate experience across private and professional events.

### Event Budget Simulator

Visitors can begin defining their event by selecting:

- event type,
- guest count,
- venue,
- required services,
- level of service.

The simulator returns an indicative starting budget and encourages the visitor to continue toward a personalized quote.

### Contact & Quote

The main business conversion is:

> **Demander un devis**

---

## Brand Identity

AURÉLYS should feel:

- premium,
- elegant,
- emotional,
- sophisticated,
- trustworthy,
- creative,
- professional,
- detail-oriented.

The brand should avoid looking like a generic corporate or SaaS website.

---

## Visual Direction

The approved visual identity uses:

- deep black,
- anthracite,
- warm gold,
- off-white,
- large event photography,
- editorial typography,
- subtle borders,
- restrained motion,
- generous spacing.

### Typography

- **Cormorant Garamond** — headings and display text
- **Jost** — body and UI text

### Main Colors

```css
--noir: #0a0908;
--noir-2: #0f0e0b;
--anthracite: #1c1b17;
--anthracite-2: #26241e;
--or: #c9a668;
--or-clair: #e8d5a3;
--or-vif: #d9b978;
--or-profond: #8a6a2a;
--blanc: #f4efe3;
--blanc-doux: #cfc7b4;
--ligne: rgba(201, 166, 104, 0.22);
```

---

## Design Reference

The repository includes:

```text
aurelys-maquette.html
```

This file represents the approved visual experience for the website.

It defines the current:

- layout,
- content,
- typography,
- color system,
- interactions,
- animations,
- responsive behavior,
- visual hierarchy.

The implementation should remain visually faithful to this reference.

---

## Event Budget Logic

The current simulator uses an indicative pricing model.

```text
base = 8000 + guests * 95 + selectedServices * 3200
estimatedPrice = base * levelMultiplier
```

Service levels:

| Level | Multiplier |
| --- | ---: |
| Essentiel | 1 |
| Signature | 1.6 |
| Prestige | 2.4 |

The final displayed amount is rounded to the nearest **500 MAD**.

This value is only an estimate and does not replace a personalized quotation.

---

## Functional Scope

The initial public website includes:

- responsive navigation,
- mobile navigation,
- hero slideshow,
- animated statistics,
- service presentation,
- equipment showcase,
- event process,
- filterable portfolio,
- testimonial slider,
- event budget simulator,
- quote CTAs,
- contact details,
- social links.

---

## Development Principles

The application should be:

- responsive,
- performant,
- accessible,
- maintainable,
- component-based,
- easy to extend.

Repeated content should be data-driven where possible.

The project should preserve the premium visual identity while maintaining clean code and good UX.

---

## Future Possibilities

The project may later include:

- real quote forms,
- WhatsApp integration,
- project detail pages,
- CMS content management,
- multilingual content,
- CRM integration,
- dynamic pricing,
- customer lead management,
- SEO enhancements,
- analytics.

These are future possibilities and are not automatically part of the initial implementation.

---

## Project Files

```text
AURELYS/
├── CLAUDE.md
├── README.md
├── aurelys-maquette.html
└── ...
```

`CLAUDE.md` contains project context and implementation guidance for Claude.

`aurelys-maquette.html` is the approved visual reference.

---

## Core Vision

AURÉLYS is not simply an event-company landing page.

It is a digital brand experience designed to communicate that AURÉLYS can:

> **imagine, organize, produce, and execute an exceptional event from beginning to end.**
