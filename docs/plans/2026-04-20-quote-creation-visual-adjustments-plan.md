# Quote Creation Visual Adjustments Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Improve visual readability and consistency of the quote creation flow in light and dark mode.

**Architecture:** Keep the current quote creation structure and data flow, but refactor the most problematic visual surfaces: the financial summary card, disabled field appearance, quote tabs/header actions, and the quote assistant modal. Changes stay scoped to the quote creation experience and only touch shared primitives when the fix is safe and directly improves the flow.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, shadcn/ui.

---

### Task 1: Restyle the financial summary card

**Files:**
- Modify: `packages/quotes/components/results-card.tsx`
- Verify: `components/currency-input.tsx`

**Step 1:** Replace the fixed blue background with a token-based surface.

**Step 2:** Differentiate quiet empty state from populated state without overpowering the page.

**Step 3:** Improve readability of labels, placeholders, and values inside the card.

### Task 2: Improve quote-form control readability

**Files:**
- Modify: `components/currency-input.tsx`
- Modify: `components/ui/input.tsx`
- Modify: `components/ui/select.tsx`
- Verify: `packages/bonds/components/bond.tsx`

**Step 1:** Add safe class hooks for stronger placeholder and disabled readability.

**Step 2:** Apply them where quote creation needs better contrast.

### Task 3: Improve header actions and tabs

**Files:**
- Modify: `packages/quotes/components/quote-info.tsx`
- Verify: `components/ui/tabs.tsx`
- Verify: `components/ui/button.tsx`

**Step 1:** Strengthen the icon-only action affordance.

**Step 2:** Improve active-tab emphasis and spacing.

### Task 4: Improve quote assistant modal hierarchy

**Files:**
- Modify: `packages/quotes/components/modals/quote-agent-modal.tsx`

**Step 1:** Improve title/description hierarchy.

**Step 2:** Make the upload action clearer and more scannable.

**Step 3:** Improve attached-file presentation and loading state clarity.

### Task 5: Validate

**Files:**
- Verify: all touched files above

**Step 1:** Run `bunx biome check` on modified files.

**Step 2:** Re-check the quote creation screen in light and dark mode.
