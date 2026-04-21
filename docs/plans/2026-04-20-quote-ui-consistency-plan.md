# Quote UI Consistency Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Align quote creation cards, related modals, the performance bonds sheet, and shared confirmation/workspace dialogs under one consistent visual system.

**Architecture:** Keep the refactor local to the affected feature components instead of changing global `Dialog` and `Sheet` primitives. Reuse the same shell, header rhythm, separator usage, and icon capsule treatment across cards, modals, and sheets so the UI converges without widening scope.

**Tech Stack:** Next.js App Router, React, TypeScript, shadcn/ui primitives, Tailwind CSS, Remix Icons, Bun, Biome

---

### Task 1: Normalize quote section cards

**Files:**
- Modify: `packages/quotes/components/contract-info.tsx`
- Modify: `packages/quotes/components/quote-info.tsx`
- Modify: `packages/quotes/components/results-card.tsx`

**Step 1: Update the contract info shell**
- Replace the legacy `rounded-md shadow-sm bg-card` wrapper with the same surface recipe used by the quote card.
- Rebuild the header using the same spacing and icon capsule language as the quote section.

**Step 2: Integrate the financial summary as a subsection**
- Remove the nested-card feel from `results-card`.
- Use a lighter subsection layout with separator-based separation from bond inputs.

**Step 3: Adjust icon capsule roundness**
- Change quote card icon containers from `rounded-xl` to `rounded-lg` where this consistency pass applies.

**Step 4: Validate visually in code**
- Check that `contract-info`, `quote-info`, and `results-card` use the same border, padding, and separator rhythm.

### Task 2: Unify modal headers and footers

**Files:**
- Modify: `packages/quotes/components/modals/quote-agent-modal.tsx`
- Modify: `packages/bonds/components/modal/create-bond-modal.tsx`
- Modify: `packages/bonds/components/modal/bonds-modal.tsx`
- Modify: `packages/bonds/components/modal/selected-bond-modal.tsx`
- Modify: `components/hooks/use-confirm.tsx`
- Modify: `packages/workspaces/components/modals/create-workspace-modal.tsx`

**Step 1: Standardize content shells**
- Ensure each dialog uses `p-0 gap-0 overflow-hidden` and separator-led structure.

**Step 2: Standardize header composition**
- Introduce icon capsule + title/description structure in each modal.
- Keep icon color semantic only where needed.

**Step 3: Standardize action areas**
- Ensure footers and action rows use consistent padding and top borders when appropriate.

**Step 4: Preserve each dialog's behavior**
- Do not change form logic, confirmation logic, or mutation wiring.

### Task 3: Unify the bonds sheet with the same system

**Files:**
- Modify: `packages/bonds/components/performance-bonds-list.tsx`
- Modify: `packages/quotes/components/results-card.tsx`

**Step 1: Rebuild the sheet header**
- Match the modal header style with icon capsule, spacing, and supporting description.

**Step 2: Separate body and footer clearly**
- Keep the list scrollable.
- Make the totals area feel like a footer subsection, not a separate card piled into the sheet.

**Step 3: Reuse the updated summary block**
- Confirm the updated `results-card` still reads well when embedded in the sheet footer.

### Task 4: Validate and review

**Files:**
- Modify: `docs/plans/2026-04-20-quote-ui-consistency-design.md`
- Modify: `docs/plans/2026-04-20-quote-ui-consistency-plan.md`

**Step 1: Run static validation**
- Run: `cd /home/juanc/work/aegis && bunx biome check packages/quotes/components/contract-info.tsx packages/quotes/components/quote-info.tsx packages/quotes/components/results-card.tsx packages/quotes/components/modals/quote-agent-modal.tsx packages/bonds/components/modal/create-bond-modal.tsx packages/bonds/components/modal/bonds-modal.tsx packages/bonds/components/modal/selected-bond-modal.tsx packages/bonds/components/performance-bonds-list.tsx components/hooks/use-confirm.tsx packages/workspaces/components/modals/create-workspace-modal.tsx`
- Expected: no Biome errors.

**Step 2: Run browser verification**
- Review quote creation in light and dark mode.
- Open the quote assistant modal and inspect hierarchy.
- Open the performance bonds sheet and confirm header/body/footer rhythm.

**Step 3: Review for regressions**
- Confirm no submit/confirm/create actions lost affordance or spacing.

**Step 4: Commit**
- Stage only the affected files.
- Commit with an English message following repo conventions.
