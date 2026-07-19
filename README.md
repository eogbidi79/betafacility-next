# BetaFacility Managers — Next.js

A modern rebuild of the **BetaFacility Managers Limited** website (property management &
rentals in Ogombo, Ajah, Lagos), converted from a Hostinger Horizons single-page app into a
production-ready **Next.js** project.

Original site: https://www.betafacility.com

## Stack

- **Next.js 15** (App Router, React 19, TypeScript)
- **Tailwind CSS 3** with a custom brand theme
- **next/font** (Outfit) and **next/image** for performance
- File-based **SEO**: per-page metadata, Open Graph, JSON-LD, `sitemap.xml`, `robots.txt`

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build    # production build
npm run start    # serve the production build
```

## Project structure

```
src/
├── app/                       # Routes (App Router)
│   ├── layout.tsx             # Root layout: fonts, metadata, JSON-LD, header/footer
│   ├── page.tsx               # Home
│   ├── rentals/               # Shortlet & long-term listings + filters
│   ├── properties/            # Managed portfolio + [slug] detail pages
│   ├── facility-management/   # Report issue / book maintenance
│   ├── advertise/ contact/ login/ about/ privacy/ terms/
│   ├── sitemap.ts  robots.ts  not-found.tsx
│   └── globals.css
├── components/
│   ├── layout/                # Header, Footer, Logo
│   ├── ui/                    # Button, Container, Section, Field, Badge, PageHeader…
│   ├── home/                  # Hero, RentCalculator, WhyChooseUs, CTABand
│   ├── property/              # RentalCard, PropertyCard, explorers (filters)
│   └── forms/                 # Contact, Maintenance, Advertise, Login (+ stub submit)
├── data/                      # site config, rentals, managed properties
└── lib/                       # utils, SEO helpers
```

## Backend

A real backend is wired up (Prisma + SQLite in dev; swap `DATABASE_URL` for Postgres in prod).

- **Database & ORM** — Prisma models: `User`, `Rental`, `Booking`, `MaintenanceRequest`,
  `AdvertiseSubmission`, `ContactMessage`.
- **API routes** (`src/app/api/*`, Zod-validated): `contact`, `maintenance`, `advertise`,
  `bookings`, `payments/init`, `payments/verify`, `paystack/webhook`, `bookings/[ref]/sign`.
- **Booking flow** — date-picker dialog → create booking → Paystack payment → e-signature
  (`/bookings/[ref]/sign`) → printable receipt (`/bookings/[ref]/receipt`).
- **Payments (Paystack)** — add `PAYSTACK_SECRET_KEY` + `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
  (test keys work). With no key set, a **dev simulation** completes the flow locally.
- **Auth (Auth.js v5)** — credentials login at `/login`, protected admin dashboard at `/portal`
  (middleware-guarded). Passwords hashed with bcrypt; seed an admin via `SEED_ADMIN_*`.
- **Email** — routed to your active mailboxes; sends via Resend when `RESEND_API_KEY` is set,
  otherwise logs to the server console in dev.

### First-time setup

```bash
cp .env.example .env      # then fill in secrets (see below)
npm install
npm run db:migrate        # create the SQLite schema
npm run db:seed           # seed rentals + admin user
npm run dev
```

Fill these in `.env` to go from dev-simulation to live:
`AUTH_SECRET`, `PAYSTACK_SECRET_KEY`, `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`, `RESEND_API_KEY`.
Set the Paystack **webhook** to `https://<your-domain>/api/paystack/webhook`.

## Data

Marketing listings live in `src/data/rentals.ts` / `src/data/properties.ts`; site-wide details
(contact, nav, hours) in `src/data/site.ts`. Bookable rental availability is seeded into the
database from `prisma/seed.mjs`.
