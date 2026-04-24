# Packages Directory Structure

> Domain-specific vertical slices — each package owns one feature's API, components, state, and logic.

## Overview

The `packages/` directory contains one folder per feature domain. Each package is a **self-contained feature module** with a strict internal structure:

```
packages/<feature>/
├── api.ts              # Convex hooks (useFetch/useMutate/useExecute wrappers) — SOLE entry point to Convex
├── types.ts            # Shared TypeScript types (optional)
├── components/
│   ├── *.tsx           # Feature components (tables, detail views, cards, etc.)
│   ├── modals/         # Dialog components (*-modal.tsx) — use AegisModal
│   └── sheets/         # Side panels (*-sheet.tsx) — use AegisSheet
├── store/              # Jotai atoms, ID hooks, managers (optional)
└── lib/                # Domain-specific helpers, constants, permission definitions (optional)
```

Not every package has all directories — only what the feature requires. But the **directory names are fixed**: no `dialogs/`, no `views/`, no `utils/`. Only the five above.

## Target package inventory

| Package | Description |
|---|---|
| `auth` | Authentication screens and password utilities |
| `companies` | Company CRUD, config, sidebar, switcher, join/invite |
| `members` | Company members, roles assignment, member profile |
| `roles` | Custom roles, permissions, role gates |
| `clients` | Client CRUD (person + company), search, template-driven fields |
| `clientTemplates` | Template builder for client fields |
| `policies` | Policies CRUD, renewals, commission calculations, status |
| `quotes` | Quote CRUD, AI extraction from contracts, quote-to-policy conversion |
| `bonds` | Bonds catalog |
| `insurers` | Insurers catalog |
| `linesOfBusiness` | Lines of business catalog |
| `dashboard` | Company dashboard cards, charts, KPIs |
| `logs` | Audit log display and filters |
| `users` | User profile modal |
| `landing` | Landing page sections (if not already in `components/home`) |

## Convention files

### `api.ts` — Convex data layer

**Present in every package.** Barrel file that wraps Convex endpoints using `useFetch`, `useMutate`, or `useExecute` from `@/components/hooks/`.

```ts
// packages/clients/api.ts
import { api } from "@/convex/_generated/api";
import { useFetch } from "@/components/hooks/use-fetch";
import { useMutate } from "@/components/hooks/use-mutate";

const route = api.clients;

export const useGetClientsByCompany = (args: typeof route.getByCompany._args) =>
  useFetch(route.getByCompany, args);

export const useGetClientById = (args: typeof route.getById._args) =>
  useFetch(route.getById, args);

export const useCreateClient = () => useMutate(route.create);
export const useUpdateClient = () => useMutate(route.update);
export const useRemoveClient = () => useMutate(route.remove);
```

**Hard rule:** Components **never** import from `@/convex/_generated/api` directly. They import hooks from `@/packages/<name>/api`. This is the single most important convention of the package system.

### `types.ts` — Shared types

Lives at the **package root**, never inside `lib/`. Contains TypeScript types and interfaces shared across the package's components.

### `store/` — State management

Contains:
- **Jotai atoms** for modal / sheet open-close state (e.g., `use-create-client-modal.ts`).
- **ID hooks** for reading route params (e.g., `use-company-id.ts`, `use-client-id.ts`).
- **Manager hooks** for complex local state logic (e.g., `use-policy-wizard.ts`).

**Pattern for modal atoms:**

```ts
// packages/clients/store/use-create-client-modal.ts
import { atom, useAtom } from "jotai";

const createClientModalAtom = atom(false);

export const useCreateClientModal = () => useAtom(createClientModalAtom);
```

### `lib/` — Domain logic

Domain-specific helpers and constants that don't belong in components or in the shared `lib/` at the repo root:

- Calculations (`calculate-commission.ts`, `calculate-policy-totals.ts`).
- Search mode configs.
- Data transformers.
- **Permission definitions** (`permissions.ts` — see `docs/PERMISSIONS.md`).
- Enum-like constants (statuses, options for pickers).

## Component subdirectories

### `components/modals/`

Files follow `*-modal.tsx` naming. They use `AegisModal` from `@/components/aegis/aegis-modal` and Jotai atoms from `store/` for open/close state.

**Canonical names:**

| Pattern | Purpose |
|---|---|
| `create-<entity>-modal.tsx` | Create form |
| `edit-<entity>-modal.tsx` | Edit form (if not merged with `selected-`) |
| `selected-<entity>-modal.tsx` | Detail + edit + delete for a selected item (click-to-edit pattern) |
| `<entity>-config-modal.tsx` | Settings for an entity |
| `share-<entity>-modal.tsx` | Share link / preview |

### `components/sheets/`

Files follow `*-sheet.tsx` naming. They use `AegisSheet` from `@/components/aegis/aegis-sheet`.

**Canonical names:**

| Pattern | Purpose |
|---|---|
| `<collection>-sheet.tsx` | Collection browser (e.g., `members-sheet.tsx`, `bonds-sheet.tsx`) |
| `<entity>-detail-sheet.tsx` | Wide detail view with nested records |
| `<entity>-filters-sheet.tsx` | Heavy filters UI |

## Cross-package dependencies

Packages import from each other via `@/packages/<name>/...`. The expected dependency graph:

### Hub packages (imported by many)

| Package | Imported by |
|---|---|
| `companies` | Almost all packages (provides company ID, company config) |
| `roles` | Most packages (for permission gates) |
| `clients` | `policies`, `quotes`, `dashboard` |
| `insurers` | `policies`, `quotes`, `dashboard` |
| `linesOfBusiness` | `policies`, `quotes` |

### Leaf packages (depend on nothing but `companies`)

`bonds`, `insurers`, `linesOfBusiness`, `logs`, `users`, `auth`, `landing`.

## Conventions

- **File naming**: kebab-case for all files and directories.
- **Import path**: `@/packages/<name>/<file>` — never relative paths between packages.
- **`api.ts` is the only entry point for Convex data**. Components import hooks from here.
- **`types.ts`** lives at the package root, never inside `lib/`.
- **`store/`** contains all state management (Jotai atoms, ID hooks, managers).
- **`lib/`** contains domain logic, helpers, constants.
- **`modals/`** files end with `-modal.tsx` and use `AegisModal`.
- **`sheets/`** files end with `-sheet.tsx` and use `AegisSheet`.
- **No barrel exports** (`index.ts`). Each file is imported directly by its path.
- **A package does not import from itself** via `@/packages/<own-name>/`. It uses relative imports internally.
- **No loose files at `packages/<feature>/` root** other than `api.ts`, `types.ts`. Everything else goes into `components/`, `store/`, or `lib/`.

## Relationship: `packages/` vs other directories

| Concern | `packages/` | `components/` | `components/hooks/` | `lib/` |
|---|---|---|---|---|
| Scope | One feature domain | Shared horizontal UI | App-wide hooks | App-wide utilities |
| Contains | API + components + state + logic | Reusable primitives | Data/UI hooks | Helpers, constants |
| Examples | `clients/`, `policies/` | `AegisModal`, `Hint` | `useFetch`, `useConfirm` | `cn()`, `formatCop` |
| Depends on | `components/`, `components/hooks/`, `lib/`, `convex/` | shadcn, Radix | React, Convex | date-fns, etc. |
