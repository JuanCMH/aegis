# Components Directory Structure

> Shared UI components organized by origin and purpose.

## Overview

The `components/` directory **contains only subdirectories** — no loose files at the root. Every component belongs to a subdirectory that describes its origin and scope.

| Directory | Purpose | Install via CLI? |
|---|---|---|
| `ui/` | External primitives (shadcn/ui) | Yes (`npx shadcn@latest add <component>`) |
| `aegis/` | Components built exclusively for Aegis | No — hand-written |
| `home/` | Landing-page-only components | No |
| `icons/` | Custom SVG brand icons not available in Lucide | No |
| `providers/` | React context providers (mounted in root layout) | No |
| `hooks/` | App-wide hooks (use-fetch, use-mutate, use-execute, etc.) | No |

## Target file tree

```
components/
├── ui/                        # shadcn primitives — updatable via CLI
│   ├── avatar.tsx
│   ├── badge.tsx
│   ├── button.tsx
│   ├── button-group.tsx
│   ├── calendar.tsx
│   ├── card.tsx
│   ├── checkbox.tsx
│   ├── collapsible.tsx
│   ├── command.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── hover-card.tsx
│   ├── input.tsx
│   ├── input-otp.tsx
│   ├── label.tsx
│   ├── popover.tsx
│   ├── scroll-area.tsx
│   ├── select.tsx            # includes MultiSelect
│   ├── separator.tsx
│   ├── sheet.tsx
│   ├── sidebar.tsx
│   ├── skeleton.tsx
│   ├── switch.tsx
│   ├── table.tsx
│   ├── tabs.tsx
│   ├── textarea.tsx
│   ├── toggle.tsx
│   └── tooltip.tsx
│
├── aegis/                     # Aegis-exclusive design system components
│   ├── aegis-modal.tsx        # Compound Dialog wrapper (icon + header + content + footer)
│   ├── aegis-sheet.tsx        # Compound Sheet wrapper (mirrors AegisModal API)
│   ├── aegis-layout-client.tsx# App shell with splash on initial load
│   ├── aegis-logo.tsx         # Full logo
│   ├── isotype.tsx            # Isotype only (pure SVG)
│   ├── splash-screen.tsx      # Initial load splash
│   ├── page-loading.tsx       # Icon + text loading state for pages
│   ├── hint.tsx               # Tooltip wrapper
│   │
│   ├── date-picker.tsx        # Spanish-locale date picker
│   ├── month-picker.tsx
│   ├── currency-input.tsx     # COP-formatted input
│   ├── color-picker.tsx
│   ├── gender-picker.tsx
│   ├── marital-status-picker.tsx
│   ├── id-type-picker.tsx     # Tipo de identificación (CC, CE, NIT, etc.)
│   ├── tax-picker.tsx
│   ├── bond-picker.tsx
│   ├── policy-status-picker.tsx
│   │
│   ├── sidebar-user.tsx
│   └── sidebar-mode-toggle.tsx
│
├── home/                      # Landing components
│   ├── navbar.tsx
│   ├── footer.tsx
│   └── landing/
│       ├── hero.tsx
│       ├── features.tsx
│       ├── manifesto.tsx
│       ├── cta.tsx
│       └── send-demo-request.ts
│
├── icons/                     # Brand SVGs (google, whatsapp, etc.)
│   ├── google.tsx
│   └── whatsapp.tsx
│
├── providers/
│   ├── convex-client-provider.tsx
│   ├── jotai-provider.tsx
│   ├── modal-provider.tsx
│   └── theme-provider.tsx
│
└── hooks/
    ├── use-confirm.tsx
    ├── use-execute.ts
    ├── use-fetch.ts
    ├── use-mutate.ts
    ├── use-generate-upload-url.ts
    └── use-mobile.ts
```

## Directory details

### `ui/` — External primitives

shadcn/ui components. These can be updated via `npx shadcn@latest add <component>`. **Do not edit these files except to wire them into Aegis tokens** (e.g., the default color variables). If a component needs Aegis-specific behavior, wrap it in `aegis/`, don't fork it.

**Config:** `components.json` at project root must have `aliases.ui: "@/components/ui"`. Don't change this path.

### `aegis/` — Aegis-exclusive components

The **design system layer**. Every component here follows the rules of `.agents/skills/aegis-interface/SKILL.md`. Two components of the same kind, built in different sessions, **must be structurally identical**.

Three functional groups:

1. **Design system primitives**: `AegisModal`, `AegisSheet`, layout shell, logo, isotype, splash, page loading, hint.
2. **Form inputs**: the pickers. All the `*-picker.tsx` and `currency-input.tsx` live here because they're shared across packages.
3. **App chrome**: `sidebar-user.tsx`, `sidebar-mode-toggle.tsx`.

### `home/` — Landing

Everything specific to the public landing page. Never imported from inside `(app)/`.

### `icons/` — Brand icons

Only SVGs for brands not available in Lucide. For any domain entity icon, use Lucide. See `BRAND.md` section 7.

### `providers/` — Context providers

Mounted in `app/layout.tsx`. One file per concern.

### `hooks/` — App-wide hooks

Cross-cutting hooks used by packages. Three fundamental ones:

- `use-fetch.ts` — wraps `useQuery` with loading/error state.
- `use-mutate.ts` — wraps `useMutation` with toast and pending state.
- `use-execute.ts` — wraps `useAction` (for long-running actions / AI).

**Packages never import `useQuery` / `useMutation` / `useAction` directly from Convex.** They import the wrappers from `@/components/hooks/`.

## Relationship: `components/` vs `packages/`

| Concern | `components/` | `packages/` |
|---|---|---|
| Purpose | Shared horizontal UI + app-wide hooks | Domain-specific vertical slices |
| Scope | Used across multiple features | Scoped to one feature domain |
| Examples | `AegisModal`, `DatePicker`, `useFetch` | `CreateClientModal`, `useCompanyId` |
| Depends on | shadcn, Radix, Lucide | `components/` + `convex/` |

## Conventions

- **No loose files at the root** of `components/`. Everything in a subdirectory.
- **`ui/`** is reserved for shadcn CLI-installable components.
- **`aegis/`** for everything built for Aegis that is not domain-specific.
- **Import paths** always use `@/components/...`. Never relative paths.
- **kebab-case** for all file names.
- **One component per file** unless tightly coupled (e.g., compound components like `AegisModal`, `AegisModalHeader`, etc., live in the same file).
