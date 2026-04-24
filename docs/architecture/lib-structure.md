# Lib Directory Structure

> App-wide utilities. Pure functions. No React, no domain logic.

## Scope

The root `lib/` directory contains **pure utilities** that are:

- **Horizontal** — used by multiple packages or the app shell.
- **Pure** — no side effects, no React, no Convex calls.
- **Domain-agnostic** where possible. Aegis-specific utilities (currency formatting COP, Colombian ID types) live here too, but they are pure helpers, not business logic.

Domain logic (calculating commissions, computing policy totals, transforming a client payload) lives in **`packages/<feature>/lib/`**, never here.

## Target contents

```
lib/
├── utils.ts                # cn() and generic helpers
├── custom-colors.ts        # Custom color palette used in pickers
├── date-formats.ts         # Shared date format strings for date-fns
├── format-cop.ts           # Format numbers as Colombian Pesos
├── formatTwoDecimals.ts    # Two-decimal rounding
├── get-error-message.ts    # Safe error message extraction
├── sanitize.ts             # String/HTML sanitization helpers
├── string-to-object.ts     # Parse "a.b.c" paths into nested objects
├── token-counter.ts        # Token counting for AI prompts
├── useDates.ts             # Shared date-related hook (memoized today, formatters)
│
├── extract-pdf.ts          # PDF text extraction (used by AI flows)
├── normalize-pdf-text.ts   # Post-process extracted PDF text
│
├── get-bond-totals.ts      # ⚠ Candidate to move to packages/quotes/lib/
└── get-quote-totals.ts     # ⚠ Candidate to move to packages/quotes/lib/
```

## Categorization

### Framework utilities
- `utils.ts` — `cn()` from shadcn + any generic React-adjacent helpers.

### Formatting
- `format-cop.ts` — `formatCop(value: number)` → `"$ 1.234.567 COP"`.
- `formatTwoDecimals.ts` — consistent 2-decimal rounding.
- `date-formats.ts` — `DATE_DISPLAY`, `DATE_INPUT`, `DATETIME_LOG`, etc.

### Parsing / sanitization
- `sanitize.ts`, `string-to-object.ts`.

### AI / document pipeline
- `extract-pdf.ts`, `normalize-pdf-text.ts`, `token-counter.ts`.

### Error handling
- `get-error-message.ts` — used by `use-mutate`/`use-execute` under the hood.

## Rules

1. **No React hooks** in `lib/` root, except in `useDates.ts` which is a framework-agnostic hook used by multiple packages. New hooks default to `components/hooks/`.
2. **No Convex imports** in `lib/`. Pure utilities only.
3. **No domain logic**. If a utility only makes sense for one feature (e.g., "calculate quote totals"), it belongs in `packages/<feature>/lib/`.
4. **No barrel exports** (`index.ts`). Import each file directly: `import { formatCop } from "@/lib/format-cop";`.
5. **kebab-case file names**. Exception: `useDates.ts` (legacy camelCase because it exports a hook). New files follow kebab-case strictly.

## Migration notes

The files flagged with ⚠ in the tree (`get-bond-totals.ts`, `get-quote-totals.ts`) are currently in `lib/` but are domain-specific. They should move to `packages/quotes/lib/` in a future refactor pass.
