# App Directory Structure

> Next.js App Router architecture for Aegis.

## Overview

The `app/` directory uses **route groups** to segment the application into three zones with different layouts and authentication requirements.

| Route Group | URL Pattern | Purpose | Auth Required | Layout |
|---|---|---|---|---|
| `(home)/` | `/` | Public landing page | No | Landing navbar + footer |
| `auth/` | `/auth` | Login / registration | No | Root only |
| `(app)/` | `/companies/*` | Authenticated application | Yes | `AegisLayoutClient` (sidebar) |

## Target file tree

```
app/
├── layout.tsx              # Root layout: providers, fonts, metadata, theme
├── loading.tsx             # Root loading fallback
├── error.tsx               # Root error boundary
├── not-found.tsx           # Root 404 page
├── globals.css             # Tailwind + CSS custom properties (Aegis tokens)
├── sitemap.ts              # Dynamic sitemap
├── favicon.ico
│
├── auth/
│   └── page.tsx            # Auth screen (login/register)
│
├── (home)/                 # Landing — public marketing site
│   ├── layout.tsx          # Landing navbar + footer
│   ├── page.tsx            # Hero, Features, Manifesto, CTA
│   └── opengraph-image.tsx # Dynamic OG image
│
└── (app)/                  # Authenticated app
    ├── layout.tsx          # AegisLayoutClient wrapper
    ├── loading.tsx
    └── companies/
        ├── page.tsx                           # Company list → auto-redirect to first
        └── [companyId]/
            ├── layout.tsx                     # Company layout (sidebar, member check)
            ├── page.tsx                       # Company dashboard
            ├── clients/
            │   ├── page.tsx                   # Clients list
            │   └── [clientId]/page.tsx        # Client detail
            ├── policies/
            │   ├── page.tsx
            │   └── [policyId]/page.tsx
            ├── quotes/
            │   ├── page.tsx
            │   └── [quoteId]/page.tsx
            ├── bonds/page.tsx                 # Bonds catalog
            ├── insurers/page.tsx              # Insurers catalog
            ├── lines-of-business/page.tsx     # Lines of business catalog
            ├── logs/page.tsx                  # Audit log
            └── settings/                      # Company settings
                ├── page.tsx                   # General
                ├── members/page.tsx
                ├── roles/page.tsx
                ├── templates/page.tsx         # Client templates
                └── branding/page.tsx          # Logo + colors
```

## Route groups explained

### `(home)` — Landing page
- Server-rendered landing with dynamic imports for below-the-fold sections.
- Dark theme forced. Uses brand palette defined in `BRAND.md`.

### `auth` — Authentication
- Single page wrapping the auth screen.
- Middleware redirects: authenticated users → `/companies`, unauthenticated users → `/auth`.

### `(app)` — Core application
- Protected by middleware (Convex Auth).
- Single hierarchy level: **Company** (multi-tenant root).
- Every authenticated route lives under `/companies/[companyId]/`.

## Authentication flow

Defined in `proxy.ts` / `middleware.ts`:
1. Public routes: `/`, `/auth/*`, `/api/*` — no auth check.
2. `/auth` + authenticated → redirect to `/companies`.
3. Any other route + unauthenticated → redirect to `/auth`.

## Root layout provider stack

```
ConvexAuthNextjsServerProvider
  └── html
      └── body
          └── NuqsAdapter (URL state)
              └── ThemeProvider (dark/light/system)
                  └── ConvexClientProvider
                      └── JotaiProvider
                          ├── Toaster (sonner)
                          ├── ModalProvider
                          └── {children}
```

## Conventions

- **All pages under `(app)/` are client components** (`"use client"`). Loading is handled inline via `isLoading` checks from the corresponding `api.ts`.
- **Layouts are minimal** — they wrap children with shared chrome (sidebar, header). No data fetching in layouts beyond auth/member checks.
- **Route segments in English** using kebab-case (`lines-of-business`, `client-templates`). User-facing labels are in Spanish.
- **The company is always in the URL**. Hooks like `useCompanyId()` (in `@/packages/companies/store/use-company-id.ts`) read `params.companyId`. Never pass `companyId` down through props when it's available from the URL.
- **No server components that call Convex**. All Convex access is client-side via `api.ts` in each package.
