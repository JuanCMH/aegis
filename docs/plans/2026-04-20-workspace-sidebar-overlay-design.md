# Company Sidebar Overlay Design

**Date:** 2026-04-20

**Context**

The current company shell uses `SidebarProvider`, `CompanySidebar`, and `SidebarInset` in `app/(app)/companies/[companyId]/layout.tsx`. On desktop, the sidebar panel is already rendered as a fixed element, but the layout still reserves width through the desktop gap element in `components/ui/sidebar.tsx`. Because of that, expanding the company sidebar reduces the available width for every page and makes the content feel smaller or compressed.

The goal is to preserve a fixed collapsed rail while allowing the expanded desktop sidebar to float above the content instead of participating in layout width calculations.

---

## Goals

- Keep the desktop company sidebar visible as a collapsed icon rail.
- Make the expanded desktop sidebar render above page content without changing content width.
- Keep mobile behavior based on `Sheet` unchanged.
- Close the expanded desktop sidebar on click outside, `Esc`, and route navigation.
- Replace dropdown-based company navigation with directly visible navigation groups.
- Keep all navigation groups always visible when expanded.

## Non-Goals

- Rebuild the entire sidebar system from scratch.
- Change the mobile sidebar interaction model.
- Add backdrop dimming behind the expanded sidebar.
- Introduce accordion groups for the current navigation tree.

---

## Current Problems

### 1. Layout Reflow On Desktop

The desktop sidebar uses a dedicated gap element in `components/ui/sidebar.tsx` that changes width depending on the expanded or collapsed state. Even though the visible sidebar panel is `fixed`, the reserved gap changes content width and causes every screen to resize when the sidebar expands.

### 2. Company Navigation Behaves Like A Launcher

`packages/companies/components/company-menu.tsx` currently renders each top-level section as a `DropdownMenu`. That makes the sidebar act more like a trigger for extra overlays than a persistent navigation surface. It increases clicks and weakens route orientation.

### 3. Weak Visual Hierarchy In The Sidebar Shell

The company switcher, theme toggle, and profile controls work functionally, but they do not yet feel like a cohesive shell. In particular:

- `CompanySwitcher` uses a hardcoded blue icon block instead of Harmony tokens.
- The current footer competes for attention between theme and profile.
- The empty `Principal` section adds noise without clear navigational value.

---

## Recommended Approach

### Summary

Keep the existing shadcn sidebar primitive and adapt it for a desktop `rail + floating panel` model.

This is the lowest-risk option because the preset already provides:

- a fixed desktop sidebar container
- a collapsed icon mode
- mobile `Sheet` behavior
- a provider-based state model

The only major behavioral mismatch is the width reservation strategy used by the desktop layout gap.

### Why This Approach

Compared with building a separate company-only sidebar, adapting the primitive keeps behavior centralized and avoids maintaining two sidebar systems.

Compared with treating desktop exactly like mobile `Sheet`, this preserves the constant rail presence, which improves orientation and fits the desired hybrid behavior better.

---

## Target Interaction Model

### Desktop Collapsed State

- The sidebar remains visible as a narrow icon rail.
- The content area always lays out against this collapsed width.
- Tooltips remain available for first-level items.

### Desktop Expanded State

- The sidebar expands from the rail into a larger floating panel.
- The panel overlays the content area instead of resizing it.
- No backdrop is rendered.
- Click outside closes the panel.
- Pressing `Esc` closes the panel.
- Clicking a navigation link closes the panel.
- Clicking the trigger again closes the panel.

### Mobile State

- Keep the current `Sheet` behavior unchanged.

---

## Information Architecture

### Header

The header should contain the `CompanySwitcher` as the main context control.

Desired improvements:

- Use Harmony-aligned colors and surfaces.
- Make the active company more legible.
- Keep the switcher compact in collapsed state and more descriptive in expanded state.

### Content

The expanded panel should show visible navigation groups instead of dropdown triggers.

Proposed groups:

- `Clientes`
  - `Lista de Clientes`
  - `Nuevo Cliente`
- `Cotizaciones`
  - `Lista de Cotizaciones`
  - `Crear Cotización`
- `Pólizas`
  - `Lista de Pólizas`
  - `Nueva Póliza`
- `Configuración`
  - `Plantilla Clientes`

`Principal` should be removed unless a real destination is added.

### Footer

The footer should keep:

- theme selector
- current user menu

But the visual hierarchy should make the user block the most stable anchor and the theme control a quieter utility action.

---

## Navigation Behavior

### Expanded Menu Structure

All groups are always visible in the expanded panel.

Each group should present:

- a label
- optional group icon if needed for scanning
- direct visible links

No nested dropdowns are needed for the current tree size.

### Active Route Feedback

The sidebar should clearly indicate:

- the active link
- the parent group containing the active link

This is important because removing dropdown menus means the sidebar itself becomes the primary navigation context.

### Collapsed Rail Behavior

In collapsed state, only the first-level group icons remain visible.

The collapsed rail should still support:

- tooltip on hover
- clear active indicator for the current group
- consistent trigger location for expansion

---

## Technical Design

### 1. Preserve The Existing Provider Model

Keep:

- `SidebarProvider`
- `Sidebar`
- `SidebarInset`
- `CompanySidebar`

This avoids invasive shell changes and keeps compatibility with the rest of the app.

### 2. Decouple Reserved Width From Expanded Width

The main desktop change should happen in `components/ui/sidebar.tsx`.

The desktop gap element should reserve only the collapsed rail width for the company sidebar flow, while the expanded panel width is handled purely by the fixed positioned sidebar container.

That creates the visual result of a floating expansion without forcing page content to shrink.

### 3. Add Desktop Outside-Click Closing

The provider or desktop sidebar container should support detecting clicks outside the expanded desktop panel so it can close automatically.

This behavior should be scoped to desktop expanded state only.

### 4. Close On Navigation

The company navigation component should close the expanded panel when a route is selected.

This is especially important because no backdrop will be shown.

### 5. Replace Dropdown-Based Menu Rendering

`packages/companies/components/company-menu.tsx` should render groups and links directly in expanded mode.

Collapsed mode can still render icon-only first-level entries, but expanded mode should use visible nested links.

---

## Visual Direction

The sidebar should feel like part of the Harmony shell rather than a default admin template.

### Recommended Visual Qualities

- quiet glass-like card surface using existing sidebar tokens
- border-led depth, not heavy shadows
- clear active item emphasis
- stronger alignment with Harmony icon container styles
- softer utility controls in footer

### Specific Improvements To Existing Components

#### CompanySwitcher

- Replace hardcoded `bg-blue-500` with Harmony-aligned styling.
- Improve distinction between company name and support label.
- Keep the switcher compact but prominent.

#### CompanyMenu

- Move from dropdown triggers to visible grouped navigation.
- Improve scanning with better group spacing and active states.
- Avoid empty or placeholder sections.

#### SidebarModeToggle

- Remove ad hoc typography override usage.
- Reduce visual competition with the user menu.

#### SidebarUser

- Keep as the persistent identity anchor in the footer.
- Preserve dropdown behavior, but align spacing and emphasis with the updated shell.

---

## Risks And Constraints

### Z-Index Coordination

A floating desktop sidebar must coexist with dialogs, dropdowns, and popovers. The sidebar panel should sit above page content but below higher-priority overlays.

### Focus Management

Because there is no backdrop, keyboard users still need predictable close behavior through `Esc` and stable focus return to the trigger.

### Tooltip And Hover Behavior

Collapsed rail tooltips should not conflict with the expanded panel state.

### Route-Driven Shell Consistency

Because the expanded sidebar closes on navigation, route changes must not leave stale open state behind.

---

## Recommendation

Proceed with a desktop `rail + floating expanded panel` implementation by adapting the existing shadcn sidebar primitive rather than replacing it.

At the same time, refactor the company navigation from dropdown-based sections to always-visible grouped links in expanded mode, remove the empty `Principal` group, and clean up the switcher/footer styling so the sidebar becomes a real company shell instead of a launcher.
