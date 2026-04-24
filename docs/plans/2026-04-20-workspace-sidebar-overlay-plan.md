# Company Sidebar Overlay Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert the company desktop sidebar into a fixed rail with a floating expanded panel that does not resize page content, while simplifying navigation into always-visible grouped links.

**Architecture:** Keep the existing shadcn sidebar primitive and company shell structure, but decouple reserved layout width from expanded desktop width. Rework the company navigation components so the expanded panel shows visible groups and links directly, and close the panel on outside click, `Esc`, and navigation.

**Tech Stack:** Next.js App Router, React, TypeScript, shadcn/ui sidebar primitive, Harmony design system.

---

### Task 1: Refactor desktop sidebar width behavior

**Files:**
- Modify: `components/ui/sidebar.tsx`
- Verify: `app/(app)/companies/[companyId]/layout.tsx`

**Step 1:** Identify the desktop gap logic that currently reserves expanded width.

**Step 2:** Change the desktop layout reservation so the company shell always reserves only collapsed rail width.

**Step 3:** Keep the visible desktop sidebar container fixed and allow its expanded width to float above content.

**Step 4:** Re-run static validation on `components/ui/sidebar.tsx`.

### Task 2: Add desktop close behaviors for the floating panel

**Files:**
- Modify: `components/ui/sidebar.tsx`

**Step 1:** Add desktop outside-click detection that only closes the sidebar when expanded.

**Step 2:** Preserve existing keyboard toggle behavior and make `Esc` close the expanded desktop sidebar.

**Step 3:** Ensure focus returns to a sensible trigger target after close.

### Task 3: Replace dropdown navigation with visible grouped links

**Files:**
- Modify: `packages/companies/components/company-menu.tsx`
- Modify: `packages/companies/components/company-sidebar.tsx`

**Step 1:** Replace section dropdown triggers with grouped visible navigation content for expanded mode.

**Step 2:** Keep collapsed mode icon-friendly and tooltip-friendly.

**Step 3:** Remove the empty `Principal` group unless a real destination is introduced.

**Step 4:** Add clear active route styling for current link and current group.

### Task 4: Improve sidebar shell hierarchy

**Files:**
- Modify: `packages/companies/components/company-switcher.tsx`
- Modify: `components/sidebar-mode-toggle.tsx`
- Verify: `components/sidebar-user.tsx`

**Step 1:** Align `CompanySwitcher` with Harmony tokens and improve hierarchy.

**Step 2:** Reduce utility noise in the theme control and remove ad hoc typography overrides.

**Step 3:** Confirm footer composition remains clear in both collapsed and expanded states.

### Task 5: Close sidebar on navigation

**Files:**
- Modify: `packages/companies/components/company-menu.tsx`

**Step 1:** Close the expanded desktop sidebar when the user selects a route.

**Step 2:** Avoid breaking normal navigation behavior on mobile.

### Task 6: Validate and review

**Files:**
- Verify: all touched files above

**Step 1:** Run project diagnostics on modified files using `bun`.

**Step 2:** Verify desktop behavior assumptions against the final code paths.

**Step 3:** Review the sidebar diff for visual consistency, navigation clarity, and layout stability.
