# Quote Contract Date Validation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Prevent quote creation and update flows from accepting contract start and end dates that are equal or inverted.

**Architecture:** Align the frontend with the backend rule in three layers: stop invalid date selections in the contract form, disable quote submission when contract dates are invalid, and guard submit handlers so invalid state cannot reach the mutation path.

**Tech Stack:** Next.js App Router, React, TypeScript, date-fns, Sonner.

---

### Task 1: Block invalid date picks in the contract form

**Files:**
- Modify: `packages/quotes/components/contract-info.tsx`

**Step 1:** Reject start dates that are equal to or later than the selected contract end date.

**Step 2:** Reject end dates that are equal to or earlier than the selected contract start date.

### Task 2: Disable create/update actions for invalid contract dates

**Files:**
- Modify: `packages/bonds/components/bid-bond-info.tsx`
- Modify: `packages/bonds/components/performance-bonds-info.tsx`

**Step 1:** Include contract date validity in each `isValidQuote` calculation.

**Step 2:** Keep existing bond validations unchanged.

### Task 3: Guard submit handlers

**Files:**
- Modify: `packages/quotes/components/quote-info.tsx`

**Step 1:** Add a shared contract-date validation check before calling the quote mutation.

**Step 2:** Show a clear toast error when the contract dates are invalid.

### Task 4: Validate

**Files:**
- Verify: all touched files above

**Step 1:** Run `bunx biome check` on modified files.

**Step 2:** Re-test the invalid same-day contract scenario in the browser.
