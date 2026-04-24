# Aegis Landing Page — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a high-fidelity landing page for Aegis at the `/` route with the brand system defined in `PROMPT_AEGIS_LANDING.md`.

**Architecture:** The landing is a standalone `(home)` route group under `app/` with its own layout (no Convex providers, no auth). All landing components live in `packages/landing/components/`. CSS variables for the landing palette are added to `app/globals.css`. GSAP handles scroll animations, and all fonts (Outfit, Cormorant Garamond, JetBrains Mono) are loaded via `next/font/google` in the landing layout.

**Tech Stack:** Next.js 16 (App Router, RSC), React 19, Tailwind CSS 4, GSAP 3 (ScrollTrigger), Lucide React, `next/font/google`

---

## Pre-requisites

### Existing in project
- GSAP 3 (`gsap: ^3.13.0`) — already installed
- Lucide React (`lucide-react: ^0.555.0`) — already installed
- Outfit font — already configured in root layout
- Tailwind CSS 4 + PostCSS — already configured
- `components/logo.tsx` — `AegisLogo` SVG component exists

### To install
- **Framer Motion** — prompt requires it for micro-interactions on components

### Key constraints
- The root `app/layout.tsx` wraps everything with Convex/Auth providers. The landing does NOT need auth, so `(home)/layout.tsx` should be minimal — it only adds the extra fonts and the noise overlay. The root layout already provides Outfit + `<html>` + `<body>`.
- The middleware in `proxy.ts` treats `/` as a public page (`isPublicPage`), so no auth redirect.
- The landing is **server-rendered** by default. Only interactive sections (navbar scroll, animations, typing effects) are client components.

---

## Task 1: Install Framer Motion

**Files:**
- Modify: `package.json`

**Step 1: Install dependency**

Run: `bun add framer-motion`

**Step 2: Verify installation**

Run: `bun pm ls | grep framer`
Expected: `framer-motion` appears in the output

**Step 3: Commit**

```bash
git add package.json bun.lock
git commit -m "[CHORE] Add framer-motion dependency for landing page"
```

---

## Task 2: Add Landing CSS Variables & Noise Overlay

**Files:**
- Modify: `app/globals.css` (add landing palette variables + noise overlay)

**Step 1: Add landing palette CSS variables**

After the existing `@theme inline { ... }` block's custom color variables (after `--color-slate-600`), add the Aegis landing palette:

```css
/* Aegis Landing Palette */
--color-midnight: #0D1F3C;
--color-sapphire: #1E5FD8;
--color-cyan-steel: #0FB8C9;
--color-ice: #F4F6FB;
--color-slate-soft: #EEF1F8;
--color-graphite: #111827;
--color-steel-gray: #4B5563;
--color-emerald: #10B981;
--color-amber: #F59E0B;
```

**Step 2: Add noise overlay**

After the existing `@layer base { ... }` block, add:

```css
/* Landing noise overlay — only on landing pages */
.landing-noise::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  opacity: 0.04;
  pointer-events: none;
  z-index: 50;
}
```

**Step 3: Commit**

```bash
git add app/globals.css
git commit -m "[STYLE] Add landing page CSS variables and noise overlay"
```

---

## Task 3: Create Landing Layout + Route Group

**Files:**
- Create: `app/(home)/layout.tsx`
- Create: `app/(home)/page.tsx` (placeholder)

**Step 1: Create the landing layout**

`app/(home)/layout.tsx` — This layout only adds the extra Google Fonts (Cormorant Garamond, JetBrains Mono). The root layout already provides `<html>`, `<body>`, and Outfit.

```tsx
import type { Metadata } from "next";
import { Cormorant_Garamond, JetBrains_Mono } from "next/font/google";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["italic"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aegis — La plataforma que los seguros siempre merecieron",
  description:
    "Aegis centraliza pólizas, clientes y garantías en un solo sistema — con IA que lee tus contratos y extrae los datos por ti. Diseñado para agencias en Colombia.",
  keywords: [
    "seguros",
    "pólizas",
    "garantías",
    "cotizaciones",
    "agencias de seguros",
    "Colombia",
    "gestión de seguros",
    "IA",
  ],
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${cormorant.variable} ${jetbrainsMono.variable} landing-noise`}
    >
      {children}
    </div>
  );
}
```

**Step 2: Create placeholder page**

`app/(home)/page.tsx`:

```tsx
export default function LandingPage() {
  return (
    <main>
      <h1>Aegis Landing — En construcción</h1>
    </main>
  );
}
```

**Step 3: Verify it renders**

Run: `bun dev` and visit `http://localhost:7077/`
Expected: The placeholder text appears without auth redirect.

**Step 4: Commit**

```bash
git add app/\(home\)/layout.tsx app/\(home\)/page.tsx
git commit -m "[FEAT] Create landing route group with fonts and layout"
```

---

## Task 4: Build the Navbar Component

**Files:**
- Create: `packages/landing/components/navbar.tsx`

**Behavior:**
- Client component (needs scroll listener + state)
- Fixed, centered, pill shape
- Transparent at top (hero) → glassmorphism on scroll
- Links: "Producto", "Funcionalidades", "Precios", "Para agencias"
- CTA button: "Solicitar acceso" with sapphire BG and slide-in hover
- Uses `AegisLogo` from `@/components/logo`
- Smooth scroll to section anchors
- Transition: `0.4s ease`

**Key implementation details:**
- `useState` for `scrolled` boolean (toggle at `scrollY > 50`)
- `useEffect` with scroll listener + cleanup
- All links are `<a href="#section-id">` for smooth scroll
- Button hover effect: `overflow-hidden` + `::before` pseudo-element sliding from left
- Logo: `AegisLogo` component, white always (navbar is over dark or has dark bg)

**Step 1: Create the component**

Full implementation of `packages/landing/components/navbar.tsx` with scroll detection, glassmorphism transition, and magnetic button hover.

**Step 2: Import in page and test**

Update `app/(home)/page.tsx` to import `<Navbar />` and verify scroll behavior.

**Step 3: Commit**

```bash
git add packages/landing/components/navbar.tsx app/\(home\)/page.tsx
git commit -m "[FEAT] Add landing navbar with glassmorphism scroll effect"
```

---

## Task 5: Build the Hero Section

**Files:**
- Create: `packages/landing/components/hero.tsx`

**Behavior:**
- Full viewport height (`100dvh`)
- Background: dark gradient from midnight + radial sapphire glow
- Split typography: "El sistema que protege" (Outfit 700) + "tu operación" (Cormorant italic, large)
- Subtitle in steel gray
- Live indicator: `[● SISTEMA ACTIVO] / [12 agencias en beta] / [Colombia · LATAM]` in JetBrains Mono, cyan-steel, pulsing dot
- Two CTA buttons: primary (sapphire, "Solicitar acceso anticipado") + secondary (outline white, "Ver demo en vivo")
- GSAP fade-up staggered entrance (title → subtitle → indicators → CTAs)
- Client component (GSAP animations)

**Key implementation details:**
- Background uses CSS gradient + radial gradient (no external image to keep it fast initially; image can be added later via `next/image`)
- GSAP: `gsap.context()` inside `useLayoutEffect`, cleanup on unmount
- Font classes: `font-[family-name:var(--font-outfit)]`, `font-[family-name:var(--font-cormorant)]`, `font-[family-name:var(--font-jetbrains)]`
- Pulsing dot: CSS animation `animate-pulse` on a small `<span>` with emerald bg

**Step 1: Create hero component**

**Step 2: Add to landing page and test**

**Step 3: Commit**

```bash
git add packages/landing/components/hero.tsx app/\(home\)/page.tsx
git commit -m "[FEAT] Add landing hero section with GSAP animations"
```

---

## Task 6: Build Feature Section — AI Extraction Panel

**Files:**
- Create: `packages/landing/components/features/ai-extraction.tsx`

**Behavior:**
- Dark panel (midnight bg)
- Simulated PDF loading bar (animated in sapphire)
- Fields auto-type one by one: Contratante, Valor, Fecha, Tipo de garantía
- Final badge: `[✓ Extracción completada — 2.3s]` in emerald
- JetBrains Mono font
- GSAP ScrollTrigger to start animation on viewport entry
- Client component

**Step 1: Create component**

**Step 2: Commit**

```bash
git add packages/landing/components/features/ai-extraction.tsx
git commit -m "[FEAT] Add AI extraction feature panel with typing animation"
```

---

## Task 7: Build Feature Section — Live Telemetry Terminal

**Files:**
- Create: `packages/landing/components/features/telemetry.tsx`

**Behavior:**
- Terminal-style dark panel with rotating messages (3s interval)
- Messages typed char-by-char with blinking cursor in cyan-steel
- "EN VIVO" indicator with pulsing emerald dot
- JetBrains Mono font throughout
- `useEffect` with `setInterval` for message rotation
- Client component

**Step 1: Create component**

**Step 2: Commit**

```bash
git add packages/landing/components/features/telemetry.tsx
git commit -m "[FEAT] Add telemetry terminal feature animation"
```

---

## Task 8: Build Feature Section — Roles & Permissions Panel

**Files:**
- Create: `packages/landing/components/features/roles-panel.tsx`

**Behavior:**
- Interactive permission grid with animated SVG cursor
- Cursor auto-hovers toggles: "Editar pólizas" → activate, "Ver reportes" → activate
- Moves to "Guardar rol" button → click (scale down) → `[✓ Guardado]` badge
- GSAP timeline for the cursor path animation
- Client component

**Step 1: Create component**

**Step 2: Commit**

```bash
git add packages/landing/components/features/roles-panel.tsx
git commit -m "[FEAT] Add roles & permissions feature panel"
```

---

## Task 9: Build Features Container Section

**Files:**
- Create: `packages/landing/components/features-section.tsx`

**Behavior:**
- Section with ice background (`#F4F6FB`)
- Section title: "Una plataforma. Toda tu operación."
- Renders the 3 feature panels (AI extraction, telemetry, roles)
- Scroll-triggered fade entrance for the section title

**Step 1: Create component, compose the 3 feature sub-components**

**Step 2: Add to page**

**Step 3: Commit**

```bash
git add packages/landing/components/features-section.tsx app/\(home\)/page.tsx
git commit -m "[FEAT] Add features section composing all 3 feature panels"
```

---

## Task 10: Build Manifesto Section

**Files:**
- Create: `packages/landing/components/manifesto.tsx`

**Behavior:**
- Dark bg (midnight) with subtle overlay
- Split text reveal on scroll: first paragraph (steel gray, medium) → second paragraph (white, bold, large)
- Word-by-word appearance as element enters viewport
- GSAP ScrollTrigger with SplitText-like approach (split words into spans, animate each)
- Client component

**Step 1: Create component**

**Step 2: Add to page**

**Step 3: Commit**

```bash
git add packages/landing/components/manifesto.tsx app/\(home\)/page.tsx
git commit -m "[FEAT] Add manifesto section with word-reveal animation"
```

---

## Task 11: Build Stacked Cards Section

**Files:**
- Create: `packages/landing/components/stacked-cards/policies-card.tsx`
- Create: `packages/landing/components/stacked-cards/quotes-card.tsx`
- Create: `packages/landing/components/stacked-cards/companies-card.tsx`
- Create: `packages/landing/components/stacked-cards/stacked-section.tsx`

**Behavior:**
- 3 full-height cards stacked. On scroll, new card pushes previous to `scale(0.92)` + `blur(16px)` + `opacity(0.4)`
- Card 1 — Policies table with rows entering one by one (SURA, Bolívar, Allianz, etc.)
- Card 2 — Quotes waveform animation with price reveal
- Card 3 — Multi-company islands with animated user dot moving between them via SVG path
- GSAP ScrollTrigger with `pin: true` for sticky stacking effect
- Each card is a client component; the container orchestrates GSAP pinning

**Step 1: Create each card component**

**Step 2: Create container with GSAP ScrollTrigger pinning**

**Step 3: Add to page**

**Step 4: Commit**

```bash
git add packages/landing/components/stacked-cards/ app/\(home\)/page.tsx
git commit -m "[FEAT] Add stacked cards section (policies, quotes, companies)"
```

---

## Task 12: Build Pricing Section

**Files:**
- Create: `packages/landing/components/pricing.tsx`

**Behavior:**
- Ice background (`#F4F6FB`)
- Title: "Elige el plan de tu agencia"
- 3 columns: Básico ($0), Profesional ($149.000 COP, highlighted), Empresa (A convenir)
- Middle card: midnight bg, sapphire CTA, "MÁS POPULAR" badge, slightly larger scale
- Scroll-triggered fade-up entrance
- Client component (for animations)

**Step 1: Create component**

**Step 2: Add to page**

**Step 3: Commit**

```bash
git add packages/landing/components/pricing.tsx app/\(home\)/page.tsx
git commit -m "[FEAT] Add pricing section with 3-tier cards"
```

---

## Task 13: Build Footer

**Files:**
- Create: `packages/landing/components/footer.tsx`

**Behavior:**
- Midnight bg with large top border-radius (`2.5rem 2.5rem 0 0`)
- 4 columns: Logo + tagline / Producto / Legal / Contacto
- Bottom bar: `[● SISTEMA OPERATIVO — ACTIVO]  aegis.co · Bogotá, Colombia`
- JetBrains Mono for status indicator, pulsing emerald dot
- `AegisLogo` component for the logo
- Server component (no interactivity)

**Step 1: Create component**

**Step 2: Add to page**

**Step 3: Commit**

```bash
git add packages/landing/components/footer.tsx app/\(home\)/page.tsx
git commit -m "[FEAT] Add landing footer with system status indicator"
```

---

## Task 14: Assemble Final Landing Page

**Files:**
- Modify: `app/(home)/page.tsx` (final composition)

**Step 1: Compose all sections in order**

```tsx
import { Navbar } from "@/packages/landing/components/navbar";
import { Hero } from "@/packages/landing/components/hero";
import { FeaturesSection } from "@/packages/landing/components/features-section";
import { Manifesto } from "@/packages/landing/components/manifesto";
import { StackedSection } from "@/packages/landing/components/stacked-cards/stacked-section";
import { Pricing } from "@/packages/landing/components/pricing";
import { Footer } from "@/packages/landing/components/footer";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <FeaturesSection />
      <Manifesto />
      <StackedSection />
      <Pricing />
      <Footer />
    </>
  );
}
```

**Step 2: Full visual test**

Run: `bun dev` → navigate to `http://localhost:7077/`
Verify: All sections render, scroll animations fire, navbar transitions, no console errors.

**Step 3: Commit**

```bash
git add app/\(home\)/page.tsx
git commit -m "[FEAT] Assemble complete landing page with all sections"
```

---

## Task 15: Polish & Responsive Pass

**Files:**
- Modify: All landing components as needed

**Step 1: Mobile responsive adjustments**

- Navbar: hamburger menu on mobile
- Hero: stack vertically, adjust font sizes
- Features: single column on small screens
- Stacked cards: disable pinning on mobile, stack normally
- Pricing: single column, swipeable or stacked
- Footer: 2-column or single column grid

**Step 2: Performance check**

- Verify GSAP contexts clean up on unmount
- Verify `will-change: auto` on noise overlay
- Check no layout shift on images (if any added)

**Step 3: Final commit**

```bash
git add .
git commit -m "[STYLE] Responsive and polish pass for landing page"
```

---

## Summary

| Task | Description | Type |
|------|-------------|------|
| 1 | Install Framer Motion | CHORE |
| 2 | Landing CSS variables + noise overlay | STYLE |
| 3 | Landing layout + route group | FEAT |
| 4 | Navbar (glassmorphism, scroll, pill) | FEAT |
| 5 | Hero section (GSAP, split typography) | FEAT |
| 6 | Feature: AI extraction panel | FEAT |
| 7 | Feature: Live telemetry terminal | FEAT |
| 8 | Feature: Roles & permissions panel | FEAT |
| 9 | Features container section | FEAT |
| 10 | Manifesto section (word reveal) | FEAT |
| 11 | Stacked cards (policies, quotes, companies) | FEAT |
| 12 | Pricing section (3-tier) | FEAT |
| 13 | Footer | FEAT |
| 14 | Assemble final page | FEAT |
| 15 | Responsive + polish | STYLE |

---

*Plan for Aegis Landing Page — v1.0*
*Reference spec: `PROMPT_AEGIS_LANDING.md`*
