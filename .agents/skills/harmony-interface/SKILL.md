---
name: harmony-interface
description: "Prescriptive interface design system for the Harmony project. Use this skill whenever creating, editing, or reviewing any UI component, page layout, modal, sheet, sidebar, card, or interactive element in the Harmony codebase. Triggers on: component creation, UI modification, layout work, modal/sheet implementation, dashboard cards, sidebar configuration, icon containers, form layouts, empty states, and any visual consistency review."
---

# Harmony Interface Design System

## What is Harmony

Harmony is a comprehensive operational management SaaS platform for private security companies. It centralizes the entire operational cycle — from shift scheduling to month-end financial closing — replacing spreadsheets and manual processes with a structured, real-time system with full audit traceability.

**Domain model:** Organizations → Companies → Customers → Areas → Points (service locations), with Workers assigned to Points via Shifts that follow rotation Sequences.

**Key modules:**
- **Scheduling**: Shift assignment with rotation sequences, shift labels (time-range visual tags), operational concepts (overtime, night, holiday rules), and period locks for month-end closing.
- **Personnel**: Worker profiles, grouping, dynamic forms (13 field types), transfers between customers.
- **Clients**: Customer management with areas, service points, visual schema editor (ReactFlow), shareable public previews.
- **Incidents**: Categorized incident recording with traceability, color-coded severity, configurable shift impact.
- **Finance**: Income/expense records per customer with charts and org-level reports.
- **Analytics**: Dashboard with 12 exportable report types, activity charts, worker distribution, incident analysis.
- **Workflows**: ReactFlow-based activity visualization at org, company, and customer levels.
- **Audit**: Full CRUD logging across 22 entity types.
- **Access Control**: Custom roles with 53 granular permissions.
- **Communications**: Verified emails for report delivery (Resend), in-app chat.
- **Forms**: Dynamic form builder with 13 field types, responsive grid layouts, scoped to workers or customers.
- **PWA**: Installable app with deep linking and service worker support.

## How to Use This Skill

**Read this entire document before writing any UI code.** These specs are prescriptive — they are rules, not suggestions.

- **Never invent variants** not documented here. If a pattern isn't covered, ask the user before improvising.
- **Never use approximate values.** Every class, every spacing value, every color is specified exactly. Use the exact values.
- **When in doubt, match existing components.** The codebase is the secondary source of truth after this document.
- **Two components of the same type, built in different sessions, must be structurally identical.** That is the standard this skill enforces.

---

## 1. Design Tokens

### 1.1 Colors

#### Harmony Brand Colors

| Token | Hex | Tailwind Class | Usage |
|-------|-----|----------------|-------|
| Purple (primary) | `#6F00FF` | `h-purple` | Primary brand, key actions, primary indicators |
| Indigo (secondary) | `#818CF8` | `h-indigo` | Secondary emphasis, default icon containers in modals/sheets/cards, section highlights |
| Rose (alert) | `#FF3F7F` | `h-rose` | Alerts, critical emphasis, attention-required states |
| Yellow (informational) | `#F1FA8C` | `h-yellow` | Informational, pending states, attention-soft |

**Rule:** Brand colors are semantic. Never use `h-rose` or `h-yellow` as decoration. Every use must communicate a specific state or meaning.

#### Record Colors (Operational Semantics)

These colors represent record types in the scheduling domain. They use Tailwind's built-in color palette, not custom tokens:

| Color | Record Type (Spanish) | Icon Container BG/Border | Icon Text | Badge/Text |
|-------|----------------------|--------------------------|-----------|------------|
| `green` | Turnos (Shifts) | `bg-green-500/10 border-green-500/10` | `text-green-500` | `text-green-400` |
| `gray` | Descansos (Rest) | `bg-gray-400/10 border-gray-400/10` | `text-gray-400` | `text-gray-400` |
| `yellow` | Adicionales (Additional) | `bg-yellow-500/10 border-yellow-500/10` | `text-yellow-500` | `text-yellow-400` |
| `sky` | Seguimiento (Follow-up) | `bg-sky-500/10 border-sky-500/10` | `text-sky-500` | `text-sky-400` |
| `red` | Faltas (Absences) | `bg-red-500/10 border-red-500/10` | `text-red-500` | `text-red-400` |

#### Inactive Periods

- Light mode: `violet-600`
- Dark mode: `violet-400`

#### Opacity Conventions

| Opacity | Usage |
|---------|-------|
| `/10` | Icon container backgrounds, icon container borders, subtle tinted backgrounds |
| `/20` | Slightly stronger emphasis backgrounds (rare — only when `/10` is too subtle) |
| `/40` | Standard border opacity (`border-border/40`), separator opacity |
| `/50` | Hover states on interactive cards (`hover:bg-muted/50`) |
| `/70` | Secondary text (`text-muted-foreground/70`) |
| `/80` | Card descriptions (`text-muted-foreground/80`) |
| `/90` | Card glass background (`bg-card/90`) |

### 1.2 Typography

- **Poppins** — Global body/reading font. Set at the application level. **Never hardcode** the class `poppins` on individual elements.
- **Space Grotesk** — Titles and subtitles only. Use the `font-title` class. **Never hardcode** `space-grotesk` as a class.
- **Cormorant Garamond** *(italic)* — Exclusive use for impact phrases and brand statements (taglines, emotional closers, declarations). Use `font-[family-name:var(--font-cormorant)]` with `italic`. **Never use for body text, labels, or UI elements.**
- **Rule:** Do not add font-family classes to individual elements unless you are explicitly overriding the default for a specific reason. The global font handles everything.

### 1.3 Spacing

Base unit: `4px` (Tailwind default `1 = 0.25rem`).

| Context | Value | Class |
|---------|-------|-------|
| Card padding | 16px | `p-4` |
| Card padding (responsive small) | 12px–16px | `p-3 sm:p-4` |
| Modal/Sheet header padding | 16px | `p-4` |
| Modal/Sheet footer padding | 16px | `p-4` |
| HarmonySheetToolbar padding | 16px horizontal, 12px vertical | `px-4 py-3` |
| Gap between icon and text in headers | 12px | `gap-3` |
| Gap between list items | 8px | `gap-2` |
| Gap between form fields | 16px | `space-y-4` |
| Gap between action sections | 8px | `space-y-2` |
| List content lateral padding | 8px (sheets) or 16px (modals) | `px-2` / `px-4` |
| List content bottom padding | 16px | `pb-4` |

### 1.4 Depth

**Borders-only strategy. No dramatic shadows. Ever.**

| Element | Classes |
|---------|---------|
| Standard border | `border-border/40` |
| Card surface | `bg-card/90 backdrop-blur-sm` |
| Separator | `opacity-40` (on the `<Separator>` component) |
| Focus ring | Use default Shadcn focus ring behavior |
| Input focus | `focus-visible:border-h-indigo/30 transition-colors` (when custom focus is needed) |

**Forbidden:** `shadow-md`, `shadow-lg`, `shadow-xl`, or any prominent box-shadow. Harmony uses borders for all depth definition.

### 1.5 Border Radius

| Context | Value | Class |
|---------|-------|-------|
| Cards, dashboard wrappers | 12px | `rounded-xl` |
| Icon containers (medium/large) | 12px | `rounded-xl` |
| Icon containers (small) | 2px | `rounded-sm` |
| Buttons | Default Shadcn radius | (inherits from `--radius`) |
| Inputs | Default Shadcn radius | (inherits from `--radius`) |
| Modals | Default Shadcn radius | (inherits from Dialog) |
| Inner sections/action cards | 8px | `rounded-lg` |

The base `--radius` is `0.625rem` (10px). Variants are computed from it:
- `--radius-sm`: 6px
- `--radius-md`: 8px
- `--radius-lg`: 10px
- `--radius-xl`: 14px

---

## 2. Component Specs

### 2.1 StatCard / Dashboard Card

**When to use:** Any card displaying a metric, chart, data table, or report summary on a dashboard.

**Structure (exact):**

```tsx
<div className="relative col-span-{n} rounded-xl">
  <GlowingEffect
    spread={20}
    glow
    disabled={false}
    proximity={64}
    inactiveZone={0.01}
    borderWidth={1}
  />
  <Card className="h-full flex flex-col gap-0 py-0 p-0 overflow-hidden border-border/40 bg-card/90 backdrop-blur-sm">
    <CardHeader className="p-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-9 rounded-xl bg-{color}/10 border border-{color}/10">
          <Icon className="size-4 text-{color}" />
        </div>
        <div>
          <CardTitle className="text-sm tracking-tight">
            {title}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground/80">
            {description}
          </CardDescription>
        </div>
      </div>
    </CardHeader>
    <Separator className="opacity-40" />
    <CardContent className="p-4">
      {/* content */}
    </CardContent>
  </Card>
</div>
```

**Key rules:**

- `Card` always has `gap-0 py-0 p-0 overflow-hidden` — the padding is on `CardHeader` and `CardContent`, not the Card itself.
- Icon container in card headers is always `size-9 rounded-xl`.
- The default accent color is `h-indigo`. Replace `{color}` with the appropriate semantic color when needed.
- `Separator` between header and content always has `className="opacity-40"`.
- When the card header needs a right-side action button, wrap the header content in `flex justify-between items-center`.

**GlowingEffect:**

- Always include `GlowingEffect` on dashboard cards.
- Always use these exact props: `spread={20} glow disabled={false} proximity={64} inactiveZone={0.01} borderWidth={1}`.
- Import from `@/components/glowing-effect`.
- The wrapper `div` must have `relative` for the glow to position correctly.

**Interactive cards (clickable stat cards):**

```tsx
<div
  className={cn(
    "relative col-span-full sm:col-span-2 lg:col-span-1 rounded-xl",
    hasData && "cursor-pointer",
  )}
  onClick={handleClick}
>
  {/* GlowingEffect + Card as above */}
  <Card className={cn(
    "h-full flex flex-col gap-0 py-0 p-0 overflow-hidden border-border/40 bg-card/90 backdrop-blur-sm",
    hasData && "hover:bg-muted/50 transition-colors",
  )}>
    {/* ... */}
  </Card>
</div>
```

**Variants:**

- **Stat card with number:** `CardContent` shows the metric value with `text-lg sm:text-xl font-semibold leading-none` and a percentage badge.
- **Chart card:** `CardContent` wraps a `ChartContainer` with the chart. Use `p-3 sm:p-4` on `CardContent` for chart cards.
- **Table card:** `CardContent` wraps a `ScrollArea` containing a `Table`. Include filter input above the table with `pb-3` spacing.
- **Reports card:** `CardContent` wraps a `ScrollArea` with button list items.

### 2.2 HarmonyModal

**When to use:** Fixed-content dialogs only — forms, tabs, settings, confirmations. **Never use for variable-length lists or browseable collections** (use `HarmonySheet` for those). **Never use raw `Dialog` with manual headers.**

**Import:** `@/components/harmony/harmony-modal`

**Structure (exact):**

```tsx
import {
  HarmonyModal,
  HarmonyModalHeader,
  HarmonyModalContent,
  HarmonyModalFooter,
  DialogClose,
} from "@/components/harmony/harmony-modal";

<HarmonyModal open={open} onOpenChange={setOpen}>
  <HarmonyModalHeader
    icon={IconComponent}
    title="Title"
    description="Optional description"
  />
  <HarmonyModalContent>
    {/* Fixed-height content: forms, tabs, settings */}
  </HarmonyModalContent>
  <HarmonyModalFooter>
    <DialogClose asChild>
      <Button variant="outline">Cancel</Button>
    </DialogClose>
    <Button>Action</Button>
  </HarmonyModalFooter>
</HarmonyModal>
```

**Overflow behavior:** `HarmonyModal` constrains itself to `max-h-[90vh]` with `flex flex-col overflow-hidden`. `HarmonyModalContent` uses `overflow-y-auto` as a safety net for forms that may be tall, but modal content should generally not require scrolling. **If your content is variable-length or a list, use `HarmonySheet` instead.**

**Form wrapping:** When a `<form>` element wraps both `HarmonyModalContent` and `HarmonyModalFooter`, the root automatically applies `min-h-0 flex flex-col overflow-hidden` to direct `<form>` children via CSS selector. No special classes needed on the form.

**Header icon container:**

- Default: `bg-h-indigo/10 border-h-indigo/10 text-h-indigo`
- Override with `iconClassName` prop: `<HarmonyModalHeader iconClassName="bg-destructive/10 border-destructive/10 text-destructive" />`
- Icon container size: `size-10 rounded-xl` (large, in modal/sheet headers)
- Icon inside: `size-5`

**HarmonyModalContent:**

- Always renders with `p-4 min-h-0 overflow-y-auto`.
- No `scroll` prop — `HarmonyModal` does not handle list/collection content. Use `HarmonySheet` for that.

**HarmonyModalFooter:**

- Always preceded by a `Separator` (built into the component).
- Contains action buttons: cancel on left (via `DialogClose`), primary action on right.
- Classes: `flex items-center justify-end gap-2 p-4`.
- For destructive actions on the left: use `className="mr-auto"` on the destructive button.

**CRITICAL — Composition with Tabs:**

When a `HarmonyModal` contains `Tabs`, the `Tabs` component goes **inside** `HarmonyModalContent`:

```tsx
<HarmonyModal open={open} onOpenChange={setOpen}>
  <HarmonyModalHeader icon={Icon} title="Title" />
  <HarmonyModalContent>
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="mb-4 w-full grid grid-cols-{n}">
        <TabsTrigger value="tab1" className="text-sm flex-1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2" className="text-sm flex-1">Tab 2</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1" className="mt-0 space-y-4">
        {/* Tab 1 content with its own spacing */}
      </TabsContent>
      <TabsContent value="tab2" className="mt-0 space-y-2">
        {/* Tab 2 content with its own spacing */}
      </TabsContent>
    </Tabs>
  </HarmonyModalContent>
  {/* Conditional footer */}
</HarmonyModal>
```

**Key tab rules:**
- `TabsList` uses `mb-4 w-full grid grid-cols-{n}` where `{n}` is the number of tabs.
- `TabsTrigger` uses `text-sm flex-1`.
- `TabsContent` always has `mt-0` — spacing is handled by the content inside each panel.
- **No manual `ScrollArea` wrapper needed** — `HarmonyModal` constrains to `90vh` and `HarmonyModalContent` scrolls automatically when content overflows.
- The padding comes from `HarmonyModalContent` (`p-4`). Do not add additional padding around the Tabs.

### 2.3 HarmonySheet

**When to use:** Any UI that displays variable-length content — browsable lists, collections, search results, or any content that can grow dynamically. Use `HarmonySheet` instead of `HarmonyModal` whenever the content length depends on data. Also use for side panels managing collections (sequences, positions, categories, reports). **Never use raw `Sheet` with manual headers.**

**Import:** `@/components/harmony/harmony-sheet`

**Structure (exact):**

```tsx
import {
  HarmonySheet,
  HarmonySheetHeader,
  HarmonySheetToolbar,
  HarmonySheetContent,
  HarmonySheetFooter,
} from "@/components/harmony/harmony-sheet";

<HarmonySheet open={open} onOpenChange={setOpen}>
  <HarmonySheetHeader
    icon={IconComponent}
    title="Title"
    description="Description"
  />
  <HarmonySheetToolbar>
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="text-xs border-border/40 text-muted-foreground">
        {count} items
      </Badge>
    </div>
    <Button size="sm" variant="outline" className="gap-1.5 border-border/40 hover:border-h-indigo/30 hover:bg-h-indigo/5 transition-colors">
      <RiAddLine className="size-3.5" />
      <span className="text-xs">Create</span>
    </Button>
  </HarmonySheetToolbar>
  <HarmonySheetContent>
    {items.map(item => (
      <Card key={item.id} className="p-0 gap-0 cursor-pointer border-border/40 hover:border-border/60 hover:bg-accent/30 transition-all group">
        {/* Item content */}
      </Card>
    ))}
  </HarmonySheetContent>
  <HarmonySheetFooter>
    <SheetClose asChild>
      <Button variant="outline" size="sm" className="border-border/40">Close</Button>
    </SheetClose>
    <Button size="sm">Action</Button>
  </HarmonySheetFooter>
</HarmonySheet>
```

**Header icon container:** Same as HarmonyModal — `size-10 rounded-xl`, default `bg-h-indigo/10 border-h-indigo/10 text-h-indigo`. Override with `iconClassName`.

**HarmonySheetToolbar:**
- Layout: `flex items-center justify-between gap-2 px-4 py-3`.
- Left side: Badge counts, filter indicators.
- Right side: Action buttons (create, filter toggle).
- Toolbar action buttons: `size="sm" variant="outline"` with `border-border/40 hover:border-h-indigo/30 hover:bg-h-indigo/5 transition-colors`.

**HarmonySheetContent:**
- Automatically scrollable via `ScrollArea`.
- Items laid out with `flex flex-col gap-2 px-2 pb-4`.
- Each item is typically a `Card` with `p-0 gap-0`.

**maxWidth prop:**
- Default: `sm:max-w-lg`.
- Use wider values (`sm:max-w-2xl`) for content-heavy sheets like record detail views.

**HarmonySheet vs HarmonyModal — when to use which:**

The core rule: **HarmonyModal = fixed content, HarmonySheet = variable content.**

| Scenario | Use | Why |
|----------|-----|-----|
| Edit form (single entity) | `HarmonyModal` | Fixed fields |
| Create form | `HarmonyModal` | Fixed fields |
| Confirmation dialogs | `HarmonyModal` (via `useConfirm` hook) | Fixed content |
| Settings with multiple sections | `HarmonyModal` with tabs | Fixed content |
| Browse/manage a collection | `HarmonySheet` | Variable list |
| List of workers/entities | `HarmonySheet` | Variable list |
| Search results | `HarmonySheet` | Variable list |
| Detail view with scrollable records | `HarmonySheet` (wider) | Variable content |
| Report configuration | `HarmonySheet` | Variable list |
| Any content whose length depends on data | `HarmonySheet` | Variable content |

**Why this split exists:** `HarmonyModal` (Dialog) does not reliably handle scroll for variable-length content. `HarmonySheet` uses `ScrollArea` internally via `HarmonySheetContent`, which handles dynamic content correctly. Never put lists or collections inside a `HarmonyModal`.

**HarmonySheetFooter:**
- Preceded by a `Separator` (built in).
- Layout: `flex items-center gap-2 p-4`.
- For split layout (cancel left, action right): use `className="justify-between"` on `HarmonySheetFooter`.

### 2.4 CommandDialog

**When to use:** Search/selection dialogs for finding workers, customers, or other entities.

**Rules:**

- `CommandGroup` must **always** be inside `CommandList`. This is mandatory for cmdk filtering to work.
- `CommandList` must have `max-h-[60vh]`.
- `CommandEmpty` must use `py-8 text-center text-sm text-muted-foreground`.
- Secondary info (identifiers, codes) shown as `text-xs text-muted-foreground/70`.

```tsx
<CommandDialog open={open} onOpenChange={setOpen}>
  <CommandInput placeholder="Search..." />
  <CommandList className="max-h-[60vh]">
    <CommandEmpty className="py-8 text-center text-sm text-muted-foreground">
      No results found.
    </CommandEmpty>
    <CommandGroup heading="Items">
      {items.map(item => (
        <CommandItem key={item.id} onSelect={() => handleSelect(item)}>
          <span>{item.name}</span>
          <span className="text-xs text-muted-foreground/70 ml-auto">
            {item.identifier}
          </span>
        </CommandItem>
      ))}
    </CommandGroup>
  </CommandList>
</CommandDialog>
```

### 2.5 MultiSelect

**When to use:** Filtering or selecting multiple items from a list (e.g., filter by customer, select companies). Use instead of a `Select` when users need to pick more than one option.

**Import:** `@/components/ui/select` (named export `MultiSelect`)

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `{ value: string; label: string }[]` | required | Available options |
| `value` | `string[]` | required | Currently selected values |
| `onValueChange` | `(value: string[]) => void` | required | Callback when selection changes |
| `placeholder` | `string` | `"Seleccionar..."` | Placeholder text |
| `className` | `string` | — | Additional classes |
| `size` | `"sm" \| "default"` | `"default"` | Trigger height (`h-8` or `h-9`) |
| `disabled` | `boolean` | `false` | Disable interaction |
| `enableSelectAll` | `boolean` | `true` | Show select/clear all button |

**Usage in toolbars and filters:**

```tsx
<MultiSelect
  options={customerOptions}
  value={selectedCustomers}
  onValueChange={setSelectedCustomers}
  placeholder="Filtrar por cliente"
  size="sm"
  enableSelectAll={false}
  className="w-44 text-xs"
/>
```

**Key rules:**
- Use `size="sm"` when inside toolbars or compact filter areas.
- Set `enableSelectAll={false}` for small option lists (e.g., customers in a specific view). Keep it `true` for large lists (e.g., companies).
- An empty `value` array (`[]`) means "all" / no filter applied. Never use a sentinel value like `"all"` — an empty array is the unfiltered state.
- Options should have the shape `{ value: string; label: string }`. Build them from data with `useMemo`.
- Reset the selection (set to `[]`) when switching context (e.g., changing tabs).

### 2.6 Sidebar

**Always use:** `variant="inset" collapsible="icon"` — no exceptions.

**Structure (exact):**

```tsx
// Layout file
<SidebarProvider>
  <MySidebar />
  <SidebarInset>{children}</SidebarInset>
</SidebarProvider>

// Sidebar component
<Sidebar variant="inset" collapsible="icon" {...props}>
  <SidebarHeader>
    <CompanySwitcher /> {/* or OrganizationSwitcher */}
  </SidebarHeader>
  <SidebarContent>
    <SidebarGroup>
      <SidebarGroupLabel>
        <span>Section Name</span>
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map(item => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              tooltip={item.title}
              className="cursor-pointer"
              onClick={item.onClick}
            >
              <item.icon className="size-4 text-muted-foreground" />
              <span>{item.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  </SidebarContent>
  <SidebarFooter>
    <SidebarModeToggle />
    <SidebarUser />
  </SidebarFooter>
</Sidebar>
```

**Rules:**
- Group labels: No custom class needed — inherits from Shadcn. When customizing: `text-xs font-medium uppercase tracking-wider text-muted-foreground/70`.
- Menu items always include `tooltip` prop and `cursor-pointer` class on `SidebarMenuButton`.
- Icons: `size-4 text-muted-foreground` for standard menu items, `size-5` for collapsible trigger items.
- Footer is mandatory: must include `SidebarModeToggle` and `SidebarUser` components.
- `SidebarInset` implicitly handles `overflow-clip` for rounded corners with inset variant.
- Sidebar menu items that open modals/sheets use `onClick`. Items that navigate use `onClick` with `router.push()`.
- Group items by function using separate `SidebarGroup` blocks with descriptive labels.

### 2.7 Icon Containers

Three sizes. No variation. Always use the correct size for context.

| Size | Context | Container Classes | Icon Classes |
|------|---------|-------------------|--------------|
| Small | Sidebar items, inline indicators | `size-4 rounded-sm bg-{color}/10` | `size-3` (inherits color) |
| Medium | Card headers, inline section headers | `size-9 rounded-xl bg-{color}/10 border border-{color}/10` | `size-4 text-{color}` |
| Large | Modal headers, sheet headers | `size-10 rounded-xl bg-{color}/10 border border-{color}/10` | `size-5` (inherits color) |
| Action card | Section headers inside modals | `size-7 rounded-lg bg-{color}/10 border border-{color}/10` | `size-3.5 text-{color}` |

**CRITICAL:** Icons inherit color from their parent container. The `HarmonyModalHeader` and `HarmonySheetHeader` components set `text-{color}` on the container div, and the icon inherits it. When building custom icon containers, set the text color on the container `div`, not directly on the icon element. Exception: in card headers where explicit icon text classes are used for record-color mapping.

**Default accent color:** `h-indigo` for all generic/non-semantic icon containers.

### 2.8 Icon Registry

**Library:** `lucide-react` — the only icon library in Harmony. Never use Remix Icons, Heroicons, or any other icon package.

**Fundamental rule:** Each domain entity has a **unique** icon. Never share icons between different entities. Action icons (Plus, Trash2, etc.) are generic and reused freely.

#### Entity Icons

| Entity | Icon | Import |
|---|---|---|
| Cliente (Customer) | Building2 | `Building2` |
| Organización | Landmark | `Landmark` |
| Persona (Worker) | User | `User` |
| Grupo de personas | Users | `Users` |
| Agregar persona | UserPlus | `UserPlus` |
| Transferir persona | UserCheck | `UserCheck` |
| Área | FolderOpen | `FolderOpen` |
| Puesto (Point) | MapPin | `MapPin` |
| Asignación (Assignment) | ClipboardCheck | `ClipboardCheck` |
| Turno (Shift) | Clock | `Clock` |
| Descanso | CirclePause | `CirclePause` |
| Programación (Schedule) | CalendarDays | `CalendarDays` |
| Crear turnos | CalendarClock | `CalendarClock` |
| Novedad (Incident) | TriangleAlert | `TriangleAlert` |
| Categoría | Bookmark | `Bookmark` |
| Secuencia | ArrowLeftRight | `ArrowLeftRight` |
| Concepto | Tag | `Tag` |
| Etiqueta de turno | Tags | `Tags` |
| Cargo (Position) | IdCard | `IdCard` |
| Bloqueo (Lock) | Lock | `Lock` |
| Bloqueo (item) | FolderLock | `FolderLock` |
| Correo | Mail | `Mail` |
| Rol | ShieldCheck | `ShieldCheck` |
| Registro financiero | CircleDollarSign | `CircleDollarSign` |
| Espacio de trabajo | LayoutGrid | `LayoutGrid` |
| Esquema del cliente | Network | `Network` |
| Puestos inactivos | MapPinOff | `MapPinOff` |
| Períodos inactivos | CalendarOff | `CalendarOff` |
| Registros/Logs | History | `History` |
| Documentación | BookOpen | `BookOpen` |
| Formulario de clientes | ClipboardList | `ClipboardList` |
| Formulario de personal | FileText | `FileText` |
| Ingreso financiero | ArrowUpRight | `ArrowUpRight` |
| Gasto financiero | ArrowDownRight | `ArrowDownRight` |
| Reportes (cálculo) | Calculator | `Calculator` |
| Libro/Exportación unificada | Book | `Book` |

#### Incident Type Icons

| Tipo | Icono | Color |
|---|---|---|
| Novedad general | TriangleAlert | amber |
| Adicional | CirclePlus | green |
| Seguimiento | Eye | sky |
| Falta/Ausencia | CircleAlert | red |

#### Log Type Icons

| Acción | Icono | Color |
|---|---|---|
| Crear | FilePlus | green-500 |
| Editar | PencilLine | yellow-500 |
| Eliminar | Trash2 | red-500 |
| Info | Info | gray-500 |

#### Action Icons

| Acción | Icono |
|---|---|
| Crear/Agregar | `Plus` |
| Eliminar | `Trash2` |
| Editar | `Pencil` |
| Copiar | `Copy` |
| Descargar | `Download` |
| Buscar | `Search` |
| Refrescar | `RefreshCw` |
| Cerrar | `X` |
| Compartir | `Share2` |
| Activar | `ToggleRight` |
| Desactivar | `ToggleLeft` |
| Fijar | `Pin` |
| Desfijar | `PinOff` |
| Arrastrar | `GripVertical` |
| Más acciones | `MoreHorizontal` |
| Enlace | `Link` |
| Verificado | `BadgeCheck` |
| Configuración | `Settings` |
| Filtro | `SlidersHorizontal` |
| Ver/Preview | `ScanEye` |
| Ocultar | `EyeOff` |
| Selección múltiple | `FunctionSquare` |
| Proyectar/Predecir | `Wand2` |
| Subir archivo | `Upload` |

---

## 3. Composition Rules

### 3.1 Modal + Tabs

The tabs go **inside** `HarmonyModalContent`, never outside. The padding hierarchy is:

```
HarmonyModalHeader (shrink-0)
  DialogHeader (p-4)
  Separator (opacity-40)
HarmonyModalContent (p-4, min-h-0, overflow-y-auto) ← scrolls when content exceeds viewport
  Tabs (w-full)
    TabsList (mb-4, grid) ← flush under the separator, with p-4 from parent
    TabsContent (mt-0) ← each panel handles its own internal spacing
HarmonyModalFooter (shrink-0)
  Separator (opacity-40)
  Buttons (p-4)
```

- `TabsContent` always has `mt-0` to prevent double spacing.
- Each tab panel handles its own content spacing: `space-y-4` for forms, `space-y-2` for action lists.
- **No manual `ScrollArea` wrapper needed** — `HarmonyModal` constrains to `90vh`, content scrolls automatically.
- The footer is conditionally rendered based on the active tab if needed.

### 3.2 Sheet + List of Items

**All list/collection content must use `HarmonySheet`, never `HarmonyModal`.**

```
HarmonySheetHeader
  Separator
HarmonySheetToolbar (optional — counts, filters, action buttons)
HarmonySheetContent ← ScrollArea with gap-2 px-2 pb-4
  Item cards / list items
HarmonySheetFooter (optional — sticky totals, close buttons)
```

- `HarmonySheetContent` wraps items in a `ScrollArea` with `flex flex-col gap-2 px-2 pb-4`.
- Use `HarmonySheetToolbar` for tabs, filters, search inputs, counts, and action buttons above the list.
- Empty states inside `HarmonySheetContent` use the dashed border pattern (see section 4.3).
- `HarmonyModal` is exclusively for fixed content (forms, tabs, settings, confirmations).

**Standard card item structure (exact):**

Every item inside `HarmonySheetContent` follows this card pattern:

```tsx
<Card
  key={item._id}
  className="p-0 gap-0 cursor-pointer border-border/40 hover:border-border/60 hover:bg-accent/30 transition-all group"
  onClick={() => handleSelectItem(item)}
>
  <div className="flex items-center justify-between gap-3 p-3">
    <div className="flex items-center gap-2.5 min-w-0">
      <div className="flex items-center justify-center size-8 rounded-lg bg-{color}/10 shrink-0 group-hover:bg-{color}/15 transition-colors text-{color}">
        <Icon className="size-3.5" />
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-medium leading-tight truncate">
          {item.title}
        </h3>
        <p className="text-xs text-muted-foreground/70 leading-tight mt-0.5">
          {item.subtitle}
        </p>
      </div>
    </div>
    <Badge
      variant="secondary"
      className="text-xs shrink-0 tabular-nums font-mono bg-muted/50 border-0"
    >
      {item.value}
    </Badge>
  </div>
</Card>
```

**Key rules for list item cards:**
- Card always has `p-0 gap-0 cursor-pointer border-border/40 hover:border-border/60 hover:bg-accent/30 transition-all group`.
- Icon container: `size-8 rounded-lg` with a semantic color. Uses `group-hover:bg-{color}/15` for hover transition.
- Icon color is set on the container via `text-{color}`, icon inherits it.
- Title: `text-sm font-medium leading-tight truncate`.
- Subtitle: `text-xs text-muted-foreground/70 leading-tight mt-0.5`.
- Value badge on the right: `variant="secondary"` with `tabular-nums font-mono bg-muted/50 border-0`.
- **Clicking the card opens a detail/edit modal.** Never put inline edit/delete buttons directly on list cards — the click-to-edit pattern is the standard.

**Click-to-edit/delete pattern:**

When a user clicks a list item card, it opens a `HarmonyModal` for editing. The modal footer includes a delete button on the left:

```tsx
<HarmonyModalFooter>
  <Button
    type="button"
    variant="ghost"
    size="sm"
    className="mr-auto text-destructive hover:text-destructive hover:bg-destructive/10"
    disabled={isRemoving}
    onClick={handleRemove}
  >
    <RiDeleteBinLine className="size-4" />
    Eliminar
  </Button>
  <DialogClose asChild>
    <Button variant="outline" className="border-border/40">
      Cancelar
    </Button>
  </DialogClose>
  <Button disabled={isPending || !hasChanges} type="submit">
    Guardar
  </Button>
</HarmonyModalFooter>
```

- Delete button: `mr-auto` pushes it to the left. `variant="ghost"` with destructive text color.
- The delete action must use `useConfirm` hook for confirmation before proceeding.
- Cancel via `DialogClose`, save on the right.

**Reference implementations:** `positions-sheet.tsx` → `selected-position-modal.tsx`, `inactive-period-types-sheet.tsx`.

**Sticky footer totals:**

When a sheet displays a list with an aggregated value (e.g., financial totals), use `HarmonySheetFooter` for the total. This keeps it fixed at the bottom, always visible regardless of scroll position:

```tsx
{items.length > 0 && (
  <HarmonySheetFooter className="justify-between">
    <span className="text-sm font-medium">Total</span>
    <Badge
      variant="secondary"
      className="text-xs tabular-nums font-mono bg-muted/50 border-0"
    >
      {formattedTotal}
    </Badge>
  </HarmonySheetFooter>
)}
```

**Never put totals inside `HarmonySheetContent`** — they get lost when scrolling through long lists. Totals belong in the footer.

**Filtering and sorting:**

When a sheet has items that can be filtered by a category (e.g., by customer, by type):

- Place the filter `Select` below the toolbar/tabs, inside a `px-4 pb-2` wrapper.
- Only show the filter when there's more than one unique category.
- Reset the filter when switching tabs.
- Always sort items alphabetically by their primary grouping key (e.g., customer name).

### 3.3 Modal + Form

```
HarmonyModalHeader
  Separator
HarmonyModalContent (p-4)
  <form> with space-y-4
    Field groups: Label + Input in div with space-y-2
HarmonyModalFooter
  DialogClose (cancel) + Button (submit)
```

- The `<form>` element wraps the content area if the submit button is in the footer. Use `id` on the form and `form={id}` on the submit button.
- Labels: `text-xs font-medium text-muted-foreground uppercase tracking-wider` for filter/section labels, or `text-sm font-medium` for form field labels.
- Footer cancel button: `<DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>`.
- Footer submit button: standard `<Button>` with `type="submit"` and `form={formId}`.

### 3.4 Form Field Composition (Grid Layout)

**CRITICAL — Never stack all form fields vertically in a single column.** Group related fields into horizontal rows using CSS Grid. This creates a more compact, scannable form that feels polished instead of a long vertical list.

**Principles:**

1. **Group semantically related fields on the same row.** Fields that belong together conceptually (e.g., type + entity, name + identifier, concept + amount) should share a row.
2. **Use `grid grid-cols-{n} gap-3`** for row composition. Common grids: `grid-cols-2` (equal halves), `grid-cols-3` (thirds), `grid-cols-5` (flexible proportions with `col-span-{n}`).
3. **Give wider fields more columns.** Text inputs (names, descriptions) get `col-span-3`; numeric/select inputs get `col-span-2`. Proportional allocation, not equal splitting.
4. **Full-width fields are still acceptable** when a field is the only one in its semantic group (e.g., a customer selector with long names, a textarea, a file upload area).
5. **Labels inside grids use `space-y-1.5`** per field group, with `text-xs text-muted-foreground/70 font-medium` for the label.
6. **Row spacing remains `space-y-4`** on the form container — this creates vertical gaps between rows.

**Pattern — Two equal fields:**

```tsx
<div className="grid grid-cols-2 gap-3">
  <div className="space-y-1.5">
    <Label className="text-xs text-muted-foreground/70 font-medium">Tipo</Label>
    <Select>...</Select>
  </div>
  <div className="space-y-1.5">
    <Label className="text-xs text-muted-foreground/70 font-medium">Cliente</Label>
    <Select>...</Select>
  </div>
</div>
```

**Pattern — Weighted fields (e.g., text + number):**

```tsx
<div className="grid grid-cols-5 gap-3">
  <div className="col-span-3 space-y-1.5">
    <Label className="text-xs text-muted-foreground/70 font-medium">Concepto</Label>
    <Input placeholder="Ej: Sueldo..." />
  </div>
  <div className="col-span-2 space-y-1.5">
    <Label className="text-xs text-muted-foreground/70 font-medium">Valor</Label>
    <CurrencyInput />
  </div>
</div>
```

**Pattern — Three equal fields (e.g., date + time start + time end):**

```tsx
<div className="grid grid-cols-3 gap-2">
  <DatePicker />
  <TimePicker label="H/inicio" />
  <TimePicker label="H/fin" />
</div>
```

**Reference implementation:** See `create-shifts-form.tsx` for a complete example using `grid-cols-2`, `grid-cols-3`, and `grid-cols-5` rows in the same form.

**Anti-pattern:**

```tsx
{/* WRONG — monotonous vertical stack */}
<form className="space-y-4">
  <div className="space-y-2"><Label>Tipo</Label><Select>...</Select></div>
  <div className="space-y-2"><Label>Cliente</Label><Select>...</Select></div>
  <div className="space-y-2"><Label>Concepto</Label><Input /></div>
  <div className="space-y-2"><Label>Valor</Label><Input type="number" /></div>
</form>
```

### 3.5 Card + Internal Separator

Every card with a header section uses a `Separator` between header and content:

```tsx
<CardHeader className="p-4">
  {/* header content */}
</CardHeader>
<Separator className="opacity-40" />
<CardContent className="p-4">
  {/* body content */}
</CardContent>
```

- The separator always has `className="opacity-40"`.
- Don't add extra padding/margin around the separator — `CardHeader` and `CardContent` handle their own padding.
- The `Card` itself has `p-0 py-0 gap-0` — all padding is on the child sections.

### 3.6 Sheet/Modal + Filters Section

When adding filter controls inside a sheet (not using `HarmonySheetToolbar`):

```tsx
<div className="px-4 py-3">
  <div className="grid gap-3 grid-cols-{n}">
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Label
      </label>
      <Select>...</Select>
    </div>
  </div>
</div>
```

- Filter sections outside toolbar use `px-4 py-3`.
- Labels: `text-xs font-medium text-muted-foreground uppercase tracking-wider`.
- Grid layout: `grid gap-3 grid-cols-{n}` based on number of filters.

### 3.7 Sidebar + Page Context

- `SidebarInset` always wraps the page content.
- The page header goes inside `SidebarInset`, never outside.
- If the page has breadcrumbs, they go in the page header area within `SidebarInset`.

### 3.8 Action Sections Inside Modals

For grouped actions (toggle active, delete) inside a modal tab:

```tsx
<div className="rounded-lg border border-border/40 p-3 space-y-2">
  <div className="flex items-center gap-2">
    <div className="flex shrink-0 items-center justify-center size-7 rounded-lg bg-{color}/10 border border-{color}/10">
      <Icon className="size-3.5 text-{color}" />
    </div>
    <h4 className="text-sm font-medium tracking-tight">Action Title</h4>
  </div>
  <p className="text-sm text-muted-foreground">Description text.</p>
  <div className="flex justify-end">
    <Button size="sm" variant="outline">Action</Button>
  </div>
</div>
```

- Use `h-indigo` for non-destructive actions, `destructive` for delete actions.
- Each action section is a bordered card: `rounded-lg border border-border/40 p-3 space-y-2`.

---

## 4. Page Layout Patterns

### 4.1 Dashboard Page

```tsx
<div className="p-4 space-y-4">
  {/* Page header */}
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-lg font-semibold tracking-tight font-title">Page Title</h1>
      <p className="text-sm text-muted-foreground">Description</p>
    </div>
    <div className="flex items-center gap-2">
      {/* Action buttons, date selectors */}
    </div>
  </div>

  {/* Stats row */}
  <div className="grid grid-cols-5 gap-4">
    <DashboardRecordCard /> {/* col-span-full sm:col-span-2 lg:col-span-1 */}
    {/* Repeat for each stat card */}
  </div>

  {/* Charts / Tables row */}
  <div className="grid grid-cols-5 gap-4">
    <ChartCard /> {/* col-span-5 xl:col-span-3 */}
    <SideCard /> {/* col-span-5 xl:col-span-2 */}
  </div>
</div>
```

- Dashboard uses a 5-column grid as base: `grid grid-cols-5 gap-4`.
- Stat cards span: `col-span-full sm:col-span-2 lg:col-span-1` for 5 equal cards on large screens.
- Chart cards span: `col-span-5 xl:col-span-3` for wider, `col-span-5 xl:col-span-2` for narrower.
- Full-width cards: `col-span-5`.

### 4.2 Collection Management (Sheet-based)

Pattern for managing organizations settings (positions, sequences, categories):

```
Button click → HarmonySheet opens
  HarmonySheetHeader
  HarmonySheetToolbar (counts + create button)
  HarmonySheetContent (list of items as Cards)

  Item click → HarmonyModal opens on top
    HarmonyModalHeader
    HarmonyModalContent (edit form)
    HarmonyModalFooter (delete + cancel + save)
```

- The sheet stays open while the modal opens on top (z-index layering handled by Radix).
- The sheet shows the collection; the modal shows the detail/edit view.

### 4.3 Empty States

**Inside a HarmonySheetContent or HarmonyModalContent scroll:**

```tsx
<div className="flex flex-col items-center justify-center border border-dashed border-border/40 rounded-lg p-8 text-center">
  <div className="flex items-center justify-center size-10 rounded-xl bg-muted/50 mb-3">
    <Icon className="size-5 text-muted-foreground/50" />
  </div>
  <p className="text-sm text-muted-foreground">
    Primary empty message
  </p>
  <p className="text-xs text-muted-foreground/60 mt-1">
    Secondary helper text
  </p>
</div>
```

- Dashed border: `border border-dashed border-border/40`.
- Icon container: `size-10 rounded-xl bg-muted/50` (no colored background for empty states).
- Primary text: `text-sm text-muted-foreground`.
- Secondary text: `text-xs text-muted-foreground/60 mt-1`.

---

## 5. Operational States

### 5.1 Record Color Application

When displaying records in pills, badges, or timeline indicators:

```tsx
// Badge/pill for record type
<Badge variant="outline" className={cn("text-xs", textMapping[color])}>
  {recordMapping[color]}
</Badge>

// Timeline/indicator dot
<div className={cn("size-2 rounded-full", `bg-${color}-500`)} />
```

Use the mapping objects defined in the codebase:
- `recordMapping`: color → Spanish label (Turnos, Descansos, etc.)
- `iconContainerMapping`: color → container classes
- `iconTextMapping`: color → text color class
- `iconComponentMapping`: color → Remix Icon component

### 5.2 Inactive Periods

- Color: `violet-600` (light) / `violet-400` (dark)
- Container: `bg-violet-600/10 border-violet-600/10` (light), `bg-violet-400/10 border-violet-400/10` (dark)
- Text: `text-violet-600` (light) / `text-violet-400` (dark)
- Label: "Inactivos" or "Inactivos con registros"

### 5.3 Loading States

```tsx
// Skeleton pattern for cards
<Card className="h-full flex flex-col gap-0 py-0 p-0 overflow-hidden border-border/40 bg-card/90 backdrop-blur-sm">
  <CardHeader className="p-4">
    <div className="flex items-center gap-3">
      <div className="size-9 rounded-xl bg-muted animate-pulse" />
      <div className="space-y-2">
        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
        <div className="h-3 w-32 bg-muted animate-pulse rounded" />
      </div>
    </div>
  </CardHeader>
  <Separator className="opacity-40" />
  <CardContent className="p-4">
    <div className="h-8 w-16 bg-muted animate-pulse rounded" />
  </CardContent>
</Card>
```

- Use `bg-muted animate-pulse rounded` for skeleton rectangles.
- Match the exact dimensions of the content being replaced.

### 5.4 Error States in Forms

- Use `toast.success()` for success messages (via Sonner).
- Use `handleConvexErrorCallback(error)` for Convex mutation errors — this handles toast display internally.
- For inline validation: rely on HTML5 form validation (`required`, `minLength`, `maxLength`).
- Critical destructive actions: use `useConfirm` hook to show a confirmation dialog before proceeding.

```tsx
const [ConfirmDialog, confirm] = useConfirm({
  title: "Delete Item",
  message: "Are you sure? This action cannot be undone.",
  type: "critical",
});

// In handler:
const ok = await confirm();
if (!ok) return;

// In JSX (must render):
<ConfirmDialog />
```

---

## 6. Anti-Patterns — What Harmony Never Does

### 6.1 Raw Dialog with Manual Headers

**Wrong:**
```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="p-0 gap-0">
    <DialogHeader className="p-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-xl bg-h-indigo/10 border border-h-indigo/10">
          <Icon className="size-5 text-h-indigo" />
        </div>
        <div>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
        </div>
      </div>
    </DialogHeader>
    <Separator className="opacity-40" />
    {/* content */}
  </DialogContent>
</Dialog>
```

**Correct:**
```tsx
<HarmonyModal open={open} onOpenChange={setOpen}>
  <HarmonyModalHeader icon={Icon} title="Title" description="Description" />
  <HarmonyModalContent>{/* content */}</HarmonyModalContent>
</HarmonyModal>
```

**Why:** Manual headers drift between implementations. `HarmonyModalHeader` guarantees identical structure every time.

### 6.2 Raw Sheet with Manual Headers

**Wrong:** Using `Sheet` + `SheetContent` + `SheetHeader` manually.

**Correct:** Use `HarmonySheet` + `HarmonySheetHeader`.

**Why:** Same reason as above — consistency enforcement.

### 6.3 CommandGroup Outside CommandList

**Wrong:**
```tsx
<CommandDialog>
  <CommandInput />
  <CommandGroup>...</CommandGroup>
</CommandDialog>
```

**Correct:**
```tsx
<CommandDialog>
  <CommandInput />
  <CommandList>
    <CommandEmpty>...</CommandEmpty>
    <CommandGroup>...</CommandGroup>
  </CommandList>
</CommandDialog>
```

**Why:** cmdk filtering breaks without `CommandList` wrapping `CommandGroup`.

### 6.4 Decorative Gradients

**Wrong:** `bg-gradient-to-r from-h-indigo/10 to-h-purple/10`

**Why:** Low-opacity gradients resolve to nearly flat color and add visual noise without benefit. Harmony uses solid colors with opacity.

### 6.5 Prominent Shadows

**Wrong:** `shadow-md`, `shadow-lg`, `shadow-xl`, `drop-shadow-lg`

**Correct:** `border-border/40` for depth definition.

**Why:** Harmony uses a borders-only depth strategy. Shadows conflict with the glass/blur aesthetic.

### 6.6 Hardcoded Font Classes

**Wrong:** Adding `className="font-poppins"` or `className="font-[Space_Grotesk]"` to elements.

**Correct:** No font class for body text (inherits global Poppins). Use `font-title` for titles that need Space Grotesk.

### 6.7 Forced Icon Colors

**Wrong:**
```tsx
<div className="flex items-center justify-center size-10 rounded-xl bg-h-indigo/10 border border-h-indigo/10">
  <Icon className="size-5 text-h-indigo" /> {/* forced color on icon */}
</div>
```

**Correct:**
```tsx
<div className="flex items-center justify-center size-10 rounded-xl bg-h-indigo/10 border border-h-indigo/10 text-h-indigo">
  <Icon className="size-5" /> {/* inherits color from container */}
</div>
```

**Why:** Icons should inherit color from their container. This ensures color changes only need to happen in one place. **Note:** The `HarmonyModalHeader` and `HarmonySheetHeader` components already implement this correctly — the `iconClassName` prop sets the color on the container div.

**Exception:** In dashboard record cards where record colors are mapped dynamically via `iconTextMapping`, the icon gets an explicit text color class. This is the only acceptable exception.

### 6.8 Sidebar Variant Mismatch

**Wrong:** `<Sidebar variant="sidebar">`, `<Sidebar variant="floating">`, or omitting `variant`.

**Correct:** Always `<Sidebar variant="inset" collapsible="icon">`.

### 6.9 Inconsistent Tab Padding in Modals

**Wrong:** Adding padding between the `Separator` and `TabsList`, or adding padding around the `Tabs` container that creates double spacing.

**Correct:** `HarmonyModalContent` provides `p-4`. The `Tabs` component sits inside it. `TabsList` uses `mb-4`. `TabsContent` uses `mt-0`.

### 6.10 Semantic Colors as Decoration

**Wrong:** Using `h-rose` for a button border just because it looks nice, or `h-yellow` as a card background tint.

**Correct:** `h-rose` only for alerts/critical states. `h-yellow` only for informational/pending states. Default accent is `h-indigo`.

### 6.11 Lists or Collections Inside HarmonyModal

**Wrong:**
```tsx
<HarmonyModal open={open} onOpenChange={setOpen}>
  <HarmonyModalHeader icon={Icon} title="Items" />
  <HarmonyModalContent>
    {items.map(item => <ItemCard key={item.id} />)}
  </HarmonyModalContent>
</HarmonyModal>
```

**Correct:**
```tsx
<HarmonySheet open={open} onOpenChange={setOpen}>
  <HarmonySheetHeader icon={Icon} title="Items" />
  <HarmonySheetContent>
    {items.map(item => <ItemCard key={item.id} />)}
  </HarmonySheetContent>
</HarmonySheet>
```

**Why:** `HarmonyModal` does not reliably scroll variable-length content. `HarmonySheet` uses `ScrollArea` internally and handles dynamic lists correctly. Any content whose length depends on data must use `HarmonySheet`.

### 6.12 Single-Column Form Stacking

**Wrong:**
```tsx
<form className="space-y-4">
  <div className="space-y-2"><Label>Field A</Label><Select>...</Select></div>
  <div className="space-y-2"><Label>Field B</Label><Select>...</Select></div>
  <div className="space-y-2"><Label>Field C</Label><Input /></div>
  <div className="space-y-2"><Label>Field D</Label><Input /></div>
</form>
```

**Correct:**
```tsx
<form className="space-y-4">
  <div className="grid grid-cols-2 gap-3">
    <div className="space-y-1.5"><Label>Field A</Label><Select>...</Select></div>
    <div className="space-y-1.5"><Label>Field B</Label><Select>...</Select></div>
  </div>
  <div className="grid grid-cols-5 gap-3">
    <div className="col-span-3 space-y-1.5"><Label>Field C</Label><Input /></div>
    <div className="col-span-2 space-y-1.5"><Label>Field D</Label><Input /></div>
  </div>
</form>
```

**Why:** Stacking every field vertically wastes space, makes forms feel monotonous, and forces unnecessary scrolling. Grouping related fields in grid rows creates a compact, scannable layout. See section 3.4 for full guidelines.

### 6.13 Inline Edit/Delete Buttons on List Cards

**Wrong:**
```tsx
<Card className="p-0 gap-0 border-border/40">
  <div className="flex items-center justify-between gap-3 p-3">
    <div className="min-w-0 flex-1">
      <h3 className="text-sm font-medium">{item.name}</h3>
    </div>
    <div className="flex items-center gap-1.5">
      <Button size="icon" variant="ghost" onClick={() => setEditItem(item)}>
        <RiEdit2Line className="size-3.5" />
      </Button>
      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(item._id)}>
        <RiDeleteBin6Line className="size-3.5" />
      </Button>
    </div>
  </div>
</Card>
```

**Correct:**
```tsx
<Card
  className="p-0 gap-0 cursor-pointer border-border/40 hover:border-border/60 hover:bg-accent/30 transition-all group"
  onClick={() => setSelectedItem(item)}
>
  {/* Icon container + text + value badge — no action buttons */}
</Card>

{/* Clicking opens a HarmonyModal with edit form and delete in footer */}
```

**Why:** Inline edit/delete buttons clutter the card, create small touch targets, and break the consistency of the click-to-edit pattern used throughout Harmony. The standard flow is: click card → modal opens with form + delete button in footer. See section 3.2 for the full pattern.

### 6.14 Wrong Icon Library or Shared Entity Icons

**Wrong:**
```tsx
import { RiUserLine } from "react-icons/ri";
import { HiOutlineUser } from "react-icons/hi";
```

**Correct:**
```tsx
import { User } from "lucide-react";
```

**Wrong — using the same icon for two different entities:**
```tsx
// Puesto and Asignación both using MapPin
<MapPin /> {/* for Point */}
<MapPin /> {/* for Assignment — WRONG */}
```

**Correct:**
```tsx
<MapPin />          {/* Point */}
<ClipboardCheck />  {/* Assignment */}
```

**Why:** Lucide is the only icon library. Each entity has a unique icon defined in the Icon Registry (section 2.8). Sharing icons between entities breaks visual identification. Action icons (Plus, Trash2, etc.) are the only icons that can be reused freely.

### 6.15 Totals Inside Scrollable Content

**Wrong:**
```tsx
<HarmonySheetContent>
  {items.map(item => <ItemCard />)}
  <Card className="bg-muted/30">Total: {total}</Card>
</HarmonySheetContent>
```

**Correct:**
```tsx
<HarmonySheetContent>
  {items.map(item => <ItemCard />)}
</HarmonySheetContent>
<HarmonySheetFooter className="justify-between">
  <span className="text-sm font-medium">Total</span>
  <Badge>{formattedTotal}</Badge>
</HarmonySheetFooter>
```

**Why:** Totals placed inside `HarmonySheetContent` scroll away with the list. Users need to see the total at all times. `HarmonySheetFooter` is always visible at the bottom of the sheet, regardless of scroll position.

---

## 7. Pre-Delivery Checklist

Before presenting any UI component, verify every item:

```
□ Uses HarmonyModal/HarmonySheet instead of raw Dialog/Sheet?
□ Variable-length content (lists, collections) uses HarmonySheet, not HarmonyModal?
□ HarmonyModal only contains fixed content (forms, tabs, settings, confirmations)?
□ If tabs in a modal — are they inside HarmonyModalContent with mt-0?
□ Icon containers — correct size for context (small/medium/large/action)?
□ Icon color — inherited from container, not forced on the icon?
□ Semantic colors used correctly (h-purple, h-indigo, h-rose, h-yellow)?
□ No hardcoded font classes (no font-poppins, no font-[Space_Grotesk])?
□ Borders use correct opacity (border-border/40)?
□ Separators between header and content have opacity-40?
□ Card structure: p-0 py-0 gap-0 on Card, padding on children?
□ Cards have bg-card/90 backdrop-blur-sm border-border/40?
□ Sidebar has variant="inset" collapsible="icon"?
□ Depth is borders-only — no shadow-md/lg/xl?
□ GlowingEffect on dashboard cards with exact props?
□ CommandGroup is inside CommandList?
□ Empty states use dashed border pattern?
□ Forms use toast.success + handleConvexErrorCallback for feedback?
□ Destructive actions use useConfirm hook?
□ Footer buttons: cancel via DialogClose, action on the right?
□ Form fields use grid composition — no single-column stacking of all fields?
□ Related form fields grouped on same row (grid-cols-2/3/5 with gap-3)?
□ List item cards use standard structure (icon container + text + badge, cursor-pointer)?
□ List item edit/delete uses click-to-edit pattern (no inline buttons)?
□ Aggregated totals in HarmonySheetFooter, never inside HarmonySheetContent?
□ Lists sorted alphabetically by primary grouping key?
□ Icons imported from lucide-react only — no other icon library?
□ Entity icons match the Icon Registry (section 2.8) — no shared icons between entities?
□ Action icons use the standard mapping (Plus, Trash2, Pencil, etc.)?
```
