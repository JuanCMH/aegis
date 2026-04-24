# Client Template Hardening Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Stabilize client template logic across builder, client CRUD, detail rendering, and client listing so templates are saved consistently and validated safely.

**Architecture:** Keep `field_name` and `field_identificationNumber` as the canonical fixed-field IDs across AI, builder, frontend, and backend. Move template-aware validation into Convex so server mutations reject inconsistent client payloads, and return historical template sections from `clients.getById` while the list page derives dynamic columns from the active company template.

**Tech Stack:** Next.js App Router, React, TypeScript, Convex, TanStack Table, Sonner.

---

### Task 1: Unify fixed field IDs in template persistence

**Files:**
- Modify: `convex/clientTemplates.ts`
- Verify: `convex/clientActions.ts`
- Verify: `packages/clients/components/template-builder/template-builder.tsx`

**Step 1:** Change template save validation to require `field_name` and `field_identificationNumber`.

**Step 2:** Confirm AI generation and default builder template already emit those IDs.

**Step 3:** Run error checking on `convex/clientTemplates.ts`.

### Task 2: Add server-side client validation

**Files:**
- Modify: `convex/clients.ts`
- Verify: `convex/errors/clients.ts`

**Step 1:** Add helpers to validate template ownership, dynamic field payloads, and fixed fields.

**Step 2:** Enforce validation in `create` and `update` mutations.

**Step 3:** Make `getById` and file cleanup safe when a client has no template.

**Step 4:** Return historical template sections with the client payload.

### Task 3: Fix new/detail client pages to use consistent template sources

**Files:**
- Modify: `app/(app)/companies/[companyId]/clients/new/page.tsx`
- Modify: `app/(app)/companies/[companyId]/clients/[clientId]/page.tsx`

**Step 1:** Fix the detail page initialization order bug.

**Step 2:** Use section presence, not raw template existence, to decide between dynamic and fallback forms.

**Step 3:** Use historical sections from `clients.getById` on detail pages.

**Step 4:** Keep fallback basic fields working for clients without template.

### Task 4: Make `showInTable` drive listing columns

**Files:**
- Modify: `packages/clients/components/table/client-columns.tsx`
- Modify: `app/(app)/companies/[companyId]/clients/page.tsx`
- Verify: `packages/clients/components/table/client-data-table.tsx`

**Step 1:** Extract reusable base columns and add a helper to generate dynamic columns from template fields.

**Step 2:** Fetch the active client template on the list page and compose columns from base plus `showInTable` fields.

**Step 3:** Preserve sorting, truncation, and action column behavior.

### Task 5: Verify and review

**Files:**
- Verify: touched files above

**Step 1:** Run editor error checks on all modified files.

**Step 2:** Review diffs for accidental regressions against the user’s in-progress changes.

**Step 3:** Summarize results and any remaining risks.
