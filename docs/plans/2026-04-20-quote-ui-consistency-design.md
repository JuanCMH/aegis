# Quote UI Consistency Design

**Date:** 2026-04-20

## Goal

Unify the visual language of quote creation cards, related modals, the performance bonds sheet, and shared confirmation/company dialogs so the experience feels like one product family.

## Scope

In scope:
- `packages/quotes/components/contract-info.tsx`
- `packages/quotes/components/quote-info.tsx`
- `packages/quotes/components/results-card.tsx`
- `packages/quotes/components/modals/quote-agent-modal.tsx`
- `packages/bonds/components/modal/create-bond-modal.tsx`
- `packages/bonds/components/modal/bonds-modal.tsx`
- `packages/bonds/components/modal/selected-bond-modal.tsx`
- `packages/bonds/components/performance-bonds-list.tsx`
- `components/hooks/use-confirm.tsx`
- `packages/companies/components/modals/create-company-modal.tsx`

Out of scope:
- Mobile-specific refinement
- Global primitive refactors for `Dialog` or `Sheet`
- Visual updates in unrelated modules

## Card Design

### Section cards

`contract-info` and `quote-info` must share the same shell:
- `rounded-xl border border-border/40 bg-card/90 backdrop-blur-sm`
- Header with `p-4`
- Header layout with `flex items-center gap-3`
- Icon container with subdued treatment and less rounded corners
- `Separator` with `opacity-40`
- Content area with `p-4`

This removes the current mismatch where the contract card still uses an older, denser style while the quote card already feels cleaner and more structured.

### Icon containers

Header icon capsules should be softened:
- Use `rounded-lg` instead of `rounded-xl`
- Keep subtle tinted background and border
- Default accent is `h-indigo`
- Use semantic color only for clearly semantic contexts like confirmations

### Financial summary

`results-card` should stop feeling like a card nested inside another card.
- It remains visually separated from bond inputs
- It becomes a subsection inside the quote panel, separated with `Separator`
- It should not compete with the parent container using its own heavy border/surface treatment
- The internal header and fields should remain readable in light and dark themes

## Modal and Sheet Design

### Shared dialog language

All dialogs in this scope should use the same core recipe:
- `DialogContent` with `p-0 gap-0 overflow-hidden`
- Header with `p-4`
- Header composition: icon + title/description block
- Separator between header and body
- Footer with `p-4` and top border when actions are present
- No heavy shadows or decorative chrome beyond border-led depth

### Confirmation dialog

`use-confirm` should use the same dialog language as feature modals.
- Semantic meaning is expressed by icon and capsule tint only
- The whole dialog should not become color-coded
- Layout should align with the rest of the system

### Sheet pattern

`performance-bonds-list` should feel like the lateral version of the same dialog family:
- Structured header with icon container and title/description
- Scrollable body section for the list
- Clearly separated footer area for the financial summary
- Avoid stacked card-within-card feeling in the footer

### Company modal

`create-company-modal` should stop feeling visually detached from the rest of the app.
- Same header recipe
- Same surface language
- Tabs remain, but integrated cleanly into the body rather than appearing like a different UI kit

## Success Criteria

- The first and second quote cards feel like siblings
- The financial summary reads as a subsection, not a nested card
- Icon capsules feel more restrained
- Dialogs, sheets, and confirmation prompts share the same header/body/footer rhythm
- Light and dark themes retain contrast and clarity
