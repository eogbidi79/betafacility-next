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

A real backend is wired up (Prisma + **PostgreSQL**; use a free [Neon](https://neon.tech) database).

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
cp .env.example .env      # add your Neon DATABASE_URL + DIRECT_URL and other keys
npm install
npm run db:migrate        # apply migrations to the database
npm run db:seed           # seed rentals + admin user
npm run dev
```

Fill these in `.env` to go from dev-simulation to live:
`AUTH_SECRET`, `PAYSTACK_SECRET_KEY`, `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`, `RESEND_API_KEY`.
Set the Paystack **webhook** to `https://<your-domain>/api/paystack/webhook`.

## Deploy (Render + Neon — free)

The app is a standard Node/Next server, so it also runs on any Node host (Railway,
a Hostinger VPS, etc.) with the same commands. Steps for **Render's free tier**:

1. **Database** — create a project at [neon.tech](https://neon.tech); copy the **pooled**
   connection string (`DATABASE_URL`) and the **direct** one (`DIRECT_URL`).
2. **Service** — at [render.com](https://render.com) → **New → Blueprint** and point it at this
   repo (it reads [`render.yaml`](./render.yaml)), or **New → Web Service** with:
   - Build: `npm install && npm run build`
   - Start: `npm run start:migrate`  *(runs `prisma migrate deploy` then `next start`)*
3. **Env vars** — set them in Render (see `.env.example`): `DATABASE_URL`, `DIRECT_URL`,
   `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL=https://www.betafacility.com`, the Paystack/Resend keys,
   the `NOTIFY_*` mailboxes, and `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`.
4. **First deploy** applies the migrations automatically. Then seed once from the Render
   **Shell**: `npm run db:seed`.
5. **Domain** — Render → Settings → Custom Domains → add `www.betafacility.com`; add the shown
   A/CNAME records in Hostinger's DNS zone (leave MX/email records untouched).
6. **Paystack webhook** → `https://www.betafacility.com/api/paystack/webhook`.

> Free Render services sleep after ~15 min idle (first request wakes them in ~30–50s).
> Upgrade the instance to stay always-on when you're ready.

## Data

Marketing listings live in `src/data/rentals.ts` / `src/data/properties.ts`; site-wide details
(contact, nav, hours) in `src/data/site.ts`. Bookable rental availability is seeded into the
database from `prisma/seed.mjs`.
