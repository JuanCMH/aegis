# Quote Creation Visual Audit Design

**Date:** 2026-04-20

## Context

The quote creation flow has multiple visual consistency issues across light and dark mode. The most severe problem is the financial summary block (`GASTOS / IVA / PRIMA / TOTAL`), where a fixed saturated blue background clashes with the rest of the page and causes poor placeholder contrast in light mode. Secondary issues include overly washed disabled inputs, weak hierarchy in the quote assistant modal, and low-affordance icon-only header actions.

## Goals

- Improve contrast and readability in both light and dark mode.
- Keep the existing quote flow structure and behavior intact.
- Align the page with the project's neutral card-based visual system.
- Make empty states feel quieter and calculated states feel clearer.
- Improve modal hierarchy and action affordance without a full redesign.

## Approaches Considered

### 1. Minimal patching

Only tweak placeholder colors and disabled opacity.

Pros:
- Lowest risk.
- Smallest diff.

Cons:
- Leaves the blue financial block visually inconsistent.
- Does not address hierarchy or modal quality.

### 2. Scoped visual refactor of quote flow

Restyle the financial summary, header action buttons, tabs, disabled states, and assistant modal while keeping the same components and data flow.

Pros:
- Fixes the highest-value issues end-to-end.
- Keeps risk localized to quote creation.
- Aligns better with Harmony without requiring a design-system rewrite.

Cons:
- Touches several components.

### 3. Global form token overhaul

Introduce new input/select variants and update shared primitives project-wide.

Pros:
- Most systemic.

Cons:
- Too broad for the current task.
- Higher regression risk outside quotes.

## Recommended Approach

Use the scoped visual refactor.

This keeps the work targeted to the quote flow while still fixing the key visual issues holistically. Shared primitives should only be adjusted when the fix is safe and improves quote creation without risking unrelated screens.

## Implementation Design

### Financial Summary

- Replace the fixed `bg-sky-700` card with a token-based surface that works in both themes.
- Introduce a quieter empty state and clearer calculated state using border-led depth, not saturated fill.
- Override input styling inside this block so text and placeholders remain readable in both themes.

### Quote Form Legibility

- Improve visibility of disabled fields in the quote flow.
- Avoid relying on `opacity-50` alone for disabled controls when that makes placeholders unreadable.
- Keep shared primitive changes narrowly useful and compatible with other screens.

### Tabs and Header Actions

- Strengthen active tab emphasis with cleaner contrast and spacing.
- Give icon-only buttons a more obvious surface and hover/focus affordance.

### Assistant Modal

- Improve the visual hierarchy of the modal header.
- Make the explanatory text easier to scan.
- Improve the attachment action so it reads as the primary task of the modal.

## Validation

- Re-run `bunx biome check` on all touched files.
- Re-check the quote creation screen in light and dark mode.
- Confirm placeholders, disabled controls, and modal hierarchy are visibly improved.
