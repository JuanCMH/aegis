---
name: aegis-interface
description: "Prescriptive interface design system for the Aegis project. Use this skill whenever creating, editing, or reviewing any UI component, page layout, modal, sheet, sidebar, card, form, or interactive element in the Aegis codebase. Triggers on: component creation, UI modification, layout work, modal/sheet implementation, dashboard cards, sidebar configuration, icon containers, form layouts, empty states, visual consistency review, and any PR that touches the user interface."
---

# Aegis Interface Design System

## What is Aegis

Aegis is a comprehensive operational management SaaS platform for **insurance agencies, brokers and agents**. It centralizes the entire operational cycle — from client management and quote generation to policy issuance, renewals, commission calculation, and audit — replacing spreadsheets, emails and scattered PDFs with a single real-time system with full traceability.

**Domain model:** `Company` (multi-tenant root) → `Clients` (persons or businesses) → `Policies` (linked to `Insurers` + `Lines of Business`) · `Quotes` (currently performance bonds; extensible) · `Bonds` (catalog) · `Members` + `Roles` (with granular permissions) · `Logs` (audit).

**Key modules:**
- **Clients**: CRUD for persons and companies, with dynamic field templates (13 field types).
- **Policies**: full lifecycle (issue, active, renew, cancel, expire), with commissions, participation, taxes, issuance expenses, beneficiary chain.
- **Quotes**: bid bonds, performance bonds, AI extraction from PDF contracts, quote-to-policy conversion.
- **Bonds / Insurers / Lines of Business**: catalogs that power policies and quotes.
- **Members + Roles**: invite team, assign granular roles (see `docs/PERMISSIONS.md`).
- **Dashboard**: KPIs for policies, renewals, commissions, quotes.
- **Logs**: full CRUD audit trail.
- **AI contract extraction**: upload PDF → auto-fill quote fields.

## How to use this skill

**Read this entire document before writing any UI code in Aegis.** These specs are **prescriptive**: rules, not suggestions.

- **Never invent variants** not documented here. If a pattern isn't covered, look at an existing reference implementation. If still unclear, ask the user.
- **Never use approximate values.** Every class, every spacing value, every color is specified exactly.
- **When in doubt, match existing components.** The codebase is the secondary source of truth after this document.
- **Two components of the same kind, built in different sessions, must be structurally identical.** That is the standard this skill enforces.
- This skill must be **re-read every time an interface-adjacent task begins**. See `.agents/SKILLS-POLICY.md` for the skill-usage rules.

---

## 1. Design Tokens

### 1.1 Colors

#### Aegis brand colors

| Token | Hex | Tailwind Class | Usage |
|-------|-----|----------------|-------|
| Sapphire (primary accent) | `#1E5FD8` | `aegis-sapphire` | CTAs, primary icons, links, hover highlights — **the default accent** |
| Cyan Steel (data / telemetry) | `#0FB8C9` | `aegis-cyan` | Live data, metrics, monospace identifiers, "system is alive" indicators |
| Midnight (dark surfaces) | `#0D1F3C` | `aegis-midnight` | Landing navbar, dark hero overlays, dark-mode primary surface |
| Emerald (success / active) | `#10B981` | `aegis-emerald` | Active policies, created logs, confirmation states |
| Amber (warning) | `#F59E0B` | `aegis-amber` | Expiring renewals, pending states, soft alerts |
| Graphite (primary text) | `#111827` | `aegis-graphite` | Main body text (light mode) |
| Steel Gray (secondary text) | `#4B5563` | `aegis-steel` | Subtitles, labels, metadata |

**Use the shadcn theme variables** (`bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-destructive`) for all neutral surfaces. Reach for `aegis-*` tokens only for **semantic accents**.

**Rule:** Aegis brand colors are semantic. Never use `aegis-amber` as decoration. Every use must communicate a specific state or meaning.

#### Policy status colors (operational semantics)

| Color | Status | Icon Container | Icon Text | Badge |
|-------|--------|----------------|-----------|-------|
| `aegis-emerald` | Active | `bg-aegis-emerald/10 border-aegis-emerald/10` | `text-aegis-emerald` | `text-aegis-emerald` |
| `aegis-amber` | Expired | `bg-aegis-amber/10 border-aegis-amber/10` | `text-aegis-amber` | `text-aegis-amber` |
| `destructive` | Canceled | `bg-destructive/10 border-destructive/10` | `text-destructive` | `text-destructive` |
| `aegis-sapphire` | Pending | `bg-aegis-sapphire/10 border-aegis-sapphire/10` | `text-aegis-sapphire` | `text-aegis-sapphire` |

#### Opacity conventions

| Opacity | Usage |
|---------|-------|
| `/10` | Icon container backgrounds, icon container borders, subtle tinted backgrounds |
| `/20` | Slightly stronger emphasis (rare — only when `/10` is too subtle) |
| `/40` | Standard border opacity (`border-border/40`), separator opacity |
| `/50` | Hover states on interactive cards (`hover:bg-muted/50`) |
| `/70` | Secondary text (`text-muted-foreground/70`) |
| `/80` | Card descriptions (`text-muted-foreground/80`) |
| `/90` | Card glass background (`bg-card/90`) |

### 1.2 Typography

- **Outfit** — Global body and title font. Set at the application level. **Never hardcode** `font-outfit` or similar on individual elements.
- **Cormorant Garamond** *(italic)* — Exclusive use for impact phrases and brand statements (taglines, emotional closers, landing declarations). Use `font-[family-name:var(--font-cormorant)]` with `italic`. **Never use for body text, labels, or UI elements.**
- **JetBrains Mono** — Data, metrics, identifiers, policy numbers, amounts, live values. Use `font-mono` class.
- **Rule:** Do not add font-family classes to individual elements unless explicitly overriding. The global font handles everything.

### 1.3 Spacing

Base unit: `4px` (Tailwind `1 = 0.25rem`).

| Context | Value | Class |
|---------|-------|-------|
| Card padding | 16px | `p-4` |
| Card padding (responsive small) | 12px–16px | `p-3 sm:p-4` |
| Modal/Sheet header padding | 16px | `p-4` |
| Modal/Sheet footer padding | 16px | `p-4` |
| AegisSheetToolbar padding | 16px horizontal, 12px vertical | `px-4 py-3` |
| Gap between icon and text in headers | 12px | `gap-3` |
| Gap between list items | 8px | `gap-2` |
| Gap between form fields (rows) | 16px | `space-y-4` |
| Gap inside a form-field group | 6px | `space-y-1.5` |
| Gap between action sections | 8px | `space-y-2` |
| List content lateral padding | 8px (sheets) or 16px (modals) | `px-2` / `px-4` |
| List content bottom padding | 16px | `pb-4` |

### 1.4 Depth

**Borders-only strategy. No dramatic shadows. Ever.**

| Element | Classes |
|---------|---------|
| Standard border | `border-border/40` |
| Card surface | `bg-card/90 backdrop-blur-sm` |
| Separator | `opacity-40` (on `<Separator>`) |
| Focus ring | Default shadcn behavior |
| Input focus (custom) | `focus-visible:border-aegis-sapphire/30 transition-colors` |

**Forbidden:** `shadow-md`, `shadow-lg`, `shadow-xl`, or any prominent box-shadow. Aegis uses borders for all depth definition.

### 1.5 Border radius

| Context | Value | Class |
|---------|-------|-------|
| Cards, dashboard wrappers | 12px | `rounded-xl` |
| Icon containers (medium/large) | 12px | `rounded-xl` |
| Icon containers (small) | 2px | `rounded-sm` |
| Inner sections / action cards | 8px | `rounded-lg` |
| Buttons / Inputs / Modals | default `--radius` | inherits |

Base `--radius` is `0.625rem` (10px).

---

## 2. Component Specs

### 2.1 StatCard / Dashboard Card

**When to use:** Any card displaying a KPI, chart, summary, or report on a dashboard.

**Structure (exact):**

```tsx
<div className="relative col-span-{n} rounded-xl">
  <Card className="h-full flex flex-col gap-0 py-0 p-0 overflow-hidden border-border/40 bg-card/90 backdrop-blur-sm">
    <CardHeader className="p-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-9 rounded-xl bg-aegis-sapphire/10 border border-aegis-sapphire/10 text-aegis-sapphire">
          <Icon className="size-4" />
        </div>
        <div>
          <CardTitle className="text-sm tracking-tight">{title}</CardTitle>
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

- `Card` always has `gap-0 py-0 p-0 overflow-hidden` — padding is on `CardHeader` / `CardContent`, never on the Card itself.
- Icon container in card headers is always `size-9 rounded-xl`.
- Default accent is `aegis-sapphire`. Replace with semantic color when needed (`aegis-emerald` for active metrics, `aegis-amber` for expiring, etc.).
- Separator between header and content always has `className="opacity-40"`.
- When the header needs a right-side action button, wrap content in `flex justify-between items-center`.

**Interactive cards (clickable):**

```tsx
<div className={cn("relative col-span-full sm:col-span-2 lg:col-span-1 rounded-xl", hasData && "cursor-pointer")} onClick={handleClick}>
  <Card className={cn(
    "h-full flex flex-col gap-0 py-0 p-0 overflow-hidden border-border/40 bg-card/90 backdrop-blur-sm",
    hasData && "hover:bg-muted/50 transition-colors",
  )}>
    {/* ... */}
  </Card>
</div>
```

**Variants:**
- **KPI card**: `CardContent` shows the value with `text-lg sm:text-xl font-semibold leading-none` and a percentage badge.
- **Chart card**: wraps a `ChartContainer`. Use `p-3 sm:p-4` on `CardContent`.
- **Table card**: wraps a `ScrollArea` with a `Table`. Filter input above with `pb-3` spacing.

### 2.2 AegisModal

**When to use:** Fixed-content dialogs only — forms, tabs, settings, confirmations. **Never use for variable-length lists or browseable collections** (use `AegisSheet` for those). **Never use raw `Dialog` with manual headers.**

**Import:** `@/components/aegis/aegis-modal`

**Structure (exact):**

```tsx
import {
  AegisModal,
  AegisModalHeader,
  AegisModalContent,
  AegisModalFooter,
  DialogClose,
} from "@/components/aegis/aegis-modal";

<AegisModal open={open} onOpenChange={setOpen}>
  <AegisModalHeader
    icon={IconComponent}
    title="Title"
    description="Optional description"
  />
  <AegisModalContent>
    {/* Fixed-height content: forms, tabs, settings */}
  </AegisModalContent>
  <AegisModalFooter>
    <DialogClose asChild>
      <Button variant="outline">Cancelar</Button>
    </DialogClose>
    <Button>Guardar</Button>
  </AegisModalFooter>
</AegisModal>
```

**Overflow behavior:** `AegisModal` constrains itself to `max-h-[90vh]` with `flex flex-col overflow-hidden`. `AegisModalContent` uses `overflow-y-auto` as a safety net. **If your content is variable-length or a list, use `AegisSheet` instead.**

**Header icon container:**
- Default: `bg-aegis-sapphire/10 border-aegis-sapphire/10 text-aegis-sapphire`
- Override with `iconClassName` prop for destructive: `iconClassName="bg-destructive/10 border-destructive/10 text-destructive"`
- Size: `size-10 rounded-xl` (large)
- Icon inside: `size-5`

**AegisModalContent:**
- Always renders with `p-4 min-h-0 overflow-y-auto`.

**AegisModalFooter:**
- Preceded by a `Separator` (built into the component).
- Cancel on left via `DialogClose`, primary action on right.
- Destructive actions on the **left** use `className="mr-auto"` on the destructive button.

**Modal + Tabs:** Tabs go **inside** `AegisModalContent`:

```tsx
<AegisModalContent>
  <Tabs value={tab} onValueChange={setTab} className="w-full">
    <TabsList className="mb-4 w-full grid grid-cols-{n}">
      <TabsTrigger value="a" className="text-sm flex-1">A</TabsTrigger>
      <TabsTrigger value="b" className="text-sm flex-1">B</TabsTrigger>
    </TabsList>
    <TabsContent value="a" className="mt-0 space-y-4">...</TabsContent>
    <TabsContent value="b" className="mt-0 space-y-2">...</TabsContent>
  </Tabs>
</AegisModalContent>
```

- `TabsList`: `mb-4 w-full grid grid-cols-{n}`.
- `TabsTrigger`: `text-sm flex-1`.
- `TabsContent`: `mt-0`, internal spacing via `space-y-*` on the panel.
- **No manual `ScrollArea` wrapper** — the modal scrolls automatically when content overflows `90vh`.

### 2.3 AegisSheet

**When to use:** Any UI that displays **variable-length content** — browsable lists, collections, search results, detail views with nested records, or any content whose length depends on data. **Never use raw `Sheet` with manual headers.**

**Import:** `@/components/aegis/aegis-sheet`

**Structure (exact):**

```tsx
import {
  AegisSheet,
  AegisSheetHeader,
  AegisSheetToolbar,
  AegisSheetContent,
  AegisSheetFooter,
  SheetClose,
} from "@/components/aegis/aegis-sheet";

<AegisSheet open={open} onOpenChange={setOpen}>
  <AegisSheetHeader icon={IconComponent} title="Title" description="Description" />
  <AegisSheetToolbar>
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="text-xs border-border/40 text-muted-foreground">
        {count} items
      </Badge>
    </div>
    <Button size="sm" variant="outline" className="gap-1.5 border-border/40 hover:border-aegis-sapphire/30 hover:bg-aegis-sapphire/5 transition-colors">
      <Plus className="size-3.5" />
      <span className="text-xs">Crear</span>
    </Button>
  </AegisSheetToolbar>
  <AegisSheetContent>
    {items.map(item => (
      <Card key={item._id} className="p-0 gap-0 cursor-pointer border-border/40 hover:border-border/60 hover:bg-accent/30 transition-all group">
        {/* Item content */}
      </Card>
    ))}
  </AegisSheetContent>
  <AegisSheetFooter>
    <SheetClose asChild>
      <Button variant="outline" size="sm" className="border-border/40">Cerrar</Button>
    </SheetClose>
    <Button size="sm">Acción</Button>
  </AegisSheetFooter>
</AegisSheet>
```

**Header icon container:** Same as AegisModal — `size-10 rounded-xl`, default `bg-aegis-sapphire/10 border-aegis-sapphire/10 text-aegis-sapphire`. Override with `iconClassName`.

**AegisSheetToolbar:**
- Layout: `flex items-center justify-between gap-2 px-4 py-3`.
- Left: badge counts, filter indicators.
- Right: action buttons (create, filter toggle).
- Action buttons: `size="sm" variant="outline"` with `border-border/40 hover:border-aegis-sapphire/30 hover:bg-aegis-sapphire/5 transition-colors`.

**AegisSheetContent:**
- Scrollable via internal `ScrollArea`.
- Items laid out with `flex flex-col gap-2 px-2 pb-4`.
- Each item typically a `Card` with `p-0 gap-0`.

**maxWidth prop:**
- Default: `sm:max-w-lg`.
- Wider (`sm:max-w-2xl`) for heavy detail views (e.g., policy with nested records).

**AegisSheet vs AegisModal — when to use which:**

Core rule: **AegisModal = fixed content, AegisSheet = variable content.**

| Scenario | Use | Why |
|----------|-----|-----|
| Create form (single entity) | `AegisModal` | Fixed fields |
| Edit form (single entity) | `AegisModal` | Fixed fields |
| Confirmation dialog | `AegisModal` (via `useConfirm`) | Fixed content |
| Settings with tabs | `AegisModal` + tabs | Fixed content |
| Browse a collection (clients, policies, bonds) | `AegisSheet` | Variable list |
| Search results | `AegisSheet` | Variable list |
| Detail view with scrollable records | `AegisSheet` (wider) | Variable content |
| Audit log viewer | `AegisSheet` | Variable list |

**Why this split exists:** `AegisModal` (Dialog) does not reliably handle scroll for variable-length content. `AegisSheet` uses `ScrollArea` internally and handles dynamic content correctly.

**AegisSheetFooter:**
- Preceded by `Separator` (built in).
- Layout: `flex items-center gap-2 p-4`.
- For split layout (close left, action right): `className="justify-between"` on `AegisSheetFooter`.

### 2.4 CommandDialog

**When to use:** Search/selection dialogs for finding clients, policies, insurers, or any entity.

**Rules:**
- `CommandGroup` **must always** be inside `CommandList`. Mandatory for cmdk filtering.
- `CommandList` must have `max-h-[60vh]`.
- `CommandEmpty` uses `py-8 text-center text-sm text-muted-foreground`.
- Secondary info (identifiers, policy numbers): `text-xs text-muted-foreground/70`.

```tsx
<CommandDialog open={open} onOpenChange={setOpen}>
  <CommandInput placeholder="Buscar cliente..." />
  <CommandList className="max-h-[60vh]">
    <CommandEmpty className="py-8 text-center text-sm text-muted-foreground">
      Sin resultados.
    </CommandEmpty>
    <CommandGroup heading="Clientes">
      {clients.map(c => (
        <CommandItem key={c._id} onSelect={() => onSelect(c)}>
          <span>{c.name}</span>
          <span className="text-xs text-muted-foreground/70 ml-auto">
            {c.identificationNumber}
          </span>
        </CommandItem>
      ))}
    </CommandGroup>
  </CommandList>
</CommandDialog>
```

### 2.5 MultiSelect

**When to use:** Filtering or selecting multiple items (e.g., filter policies by insurer, select lines of business).

**Import:** `@/components/ui/select` (named export `MultiSelect`)

**Key rules:**
- Use `size="sm"` inside toolbars or compact filter areas.
- Set `enableSelectAll={false}` for small option lists. Keep `true` for large lists.
- **Empty `value` array (`[]`) means "all" / no filter**. Never use a sentinel like `"all"` — empty array is the unfiltered state.
- Build options with `useMemo`.
- Reset to `[]` when switching context (e.g., changing tabs).

### 2.6 Sidebar

**Always use:** `variant="inset" collapsible="icon"` — no exceptions.

**Structure (exact):**

```tsx
// Layout
<SidebarProvider>
  <CompanySidebar />
  <SidebarInset>{children}</SidebarInset>
</SidebarProvider>

// Sidebar component
<Sidebar variant="inset" collapsible="icon" {...props}>
  <SidebarHeader>
    <CompanySwitcher />
  </SidebarHeader>
  <SidebarContent>
    <SidebarGroup>
      <SidebarGroupLabel>
        <span>Operación</span>
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
- Group labels inherit from shadcn. If customizing: `text-xs font-medium uppercase tracking-wider text-muted-foreground/70`.
- Menu items always include `tooltip` prop and `cursor-pointer` on `SidebarMenuButton`.
- Icons: `size-4 text-muted-foreground` for standard items.
- Footer **mandatory**: `SidebarModeToggle` + `SidebarUser`.
- Menu items that open modals/sheets use `onClick`. Items that navigate use `onClick` with `router.push()`.
- Group by function using separate `SidebarGroup` blocks with descriptive labels.

**Canonical Aegis sidebar groups:**

| Group label | Items |
|---|---|
| Operación | Dashboard, Clientes, Pólizas, Cotizaciones |
| Catálogos | Garantías, Aseguradoras, Ramos |
| Administración | Miembros, Roles, Plantillas, Logs |
| Configuración | Ajustes de la company, Branding |

### 2.7 Icon Containers

Four sizes. No variation. Always use the correct size for context.

| Size | Context | Container Classes | Icon Classes |
|------|---------|-------------------|--------------|
| Small | Sidebar items, inline indicators | `size-4 rounded-sm bg-{color}/10` | `size-3` (inherits color) |
| Medium | Card headers, inline section headers | `size-9 rounded-xl bg-{color}/10 border border-{color}/10 text-{color}` | `size-4` |
| Large | Modal headers, sheet headers | `size-10 rounded-xl bg-{color}/10 border border-{color}/10 text-{color}` | `size-5` |
| Action | Section headers inside modals | `size-7 rounded-lg bg-{color}/10 border border-{color}/10 text-{color}` | `size-3.5` |

**CRITICAL:** Icons **inherit color** from their parent container via `text-{color}`. Never set `text-{color}` on the icon element directly. Exception: dashboard record cards where policy-status colors are mapped dynamically.

**Default accent color:** `aegis-sapphire` for all generic / non-semantic icon containers.

### 2.8 Icon Registry (Aegis domain)

**Library:** `lucide-react` — the only icon library. **No Remix Icons, Heroicons, or any other icon package.**

**Fundamental rule:** Each domain entity has a **unique** icon. Never share icons between different entities. Action icons are generic and reused freely.

#### Entity icons

| Entity | Icon |
|---|---|
| Company (agency) | `Building2` |
| Member | `User` |
| Members (group) | `Users` |
| Invite member | `UserPlus` |
| Role | `ShieldCheck` |
| Permission | `KeyRound` |
| Client — person | `UserCircle` |
| Client — business | `Building` |
| Clients (collection) | `Users` |
| Client template | `ClipboardList` |
| Policy | `FileShield` |
| Policies (collection) | `Files` |
| Renewal | `RefreshCw` |
| Canceled policy | `FileX2` |
| Quote | `FileText` |
| Quotes (collection) | `FileStack` |
| Convert quote → policy | `ArrowRightLeft` |
| Bond (garantía) | `Shield` |
| Bonds catalog | `ShieldHalf` |
| Insurer (aseguradora) | `Landmark` |
| Line of Business (ramo) | `FolderOpen` |
| Commission | `Percent` |
| Participation | `PieChart` |
| Premium (prima) | `CircleDollarSign` |
| Taxes | `Receipt` |
| Issuance expenses | `FileSpreadsheet` |
| AI extraction | `Sparkles` |
| PDF document | `FileText` |
| Dashboard | `LayoutDashboard` |
| Reports | `BarChart3` |
| Log / Audit | `History` |
| Company settings | `Settings2` |

#### Policy status icons

| Status | Icon | Color |
|---|---|---|
| Active | `ShieldCheck` | `aegis-emerald` |
| Expired | `ShieldAlert` | `aegis-amber` |
| Canceled | `ShieldOff` | `destructive` |
| Pending | `Clock` | `aegis-sapphire` |

#### Log type icons

| Action | Icon | Color |
|---|---|---|
| Create | `FilePlus` | `aegis-emerald` |
| Update | `PencilLine` | `aegis-amber` |
| Delete | `Trash2` | `destructive` |
| Info | `Info` | muted |

#### Action icons

| Action | Icon |
|---|---|
| Create / Add | `Plus` |
| Delete | `Trash2` |
| Edit | `Pencil` |
| Copy | `Copy` |
| Download | `Download` |
| Upload | `Upload` |
| Search | `Search` |
| Refresh | `RefreshCw` |
| Close | `X` |
| Share | `Share2` |
| Enable | `ToggleRight` |
| Disable | `ToggleLeft` |
| Pin | `Pin` |
| Drag | `GripVertical` |
| More | `MoreHorizontal` |
| Link | `Link` |
| Verified | `BadgeCheck` |
| Settings | `Settings` |
| Filter | `SlidersHorizontal` |
| Preview | `ScanEye` |
| Hide | `EyeOff` |
| Export Excel | `FileSpreadsheet` |
| Export PDF | `FileDown` |

#### Navigation / feedback / chrome

See `docs/BRAND.md` sections 7.x for the full list.

**TypeScript type:** Use `LucideIcon` from `lucide-react` for any prop that receives an icon component.

---

## 3. Composition Rules

### 3.1 Modal + Tabs

The tabs go **inside** `AegisModalContent`, never outside. Padding hierarchy:

```
AegisModalHeader (shrink-0)
  DialogHeader (p-4)
  Separator (opacity-40)
AegisModalContent (p-4, min-h-0, overflow-y-auto)
  Tabs (w-full)
    TabsList (mb-4, grid)
    TabsContent (mt-0) ← internal spacing via space-y-*
AegisModalFooter (shrink-0)
  Separator (opacity-40)
  Buttons (p-4)
```

- `TabsContent` always `mt-0` to prevent double spacing.
- Each tab panel handles internal spacing: `space-y-4` for forms, `space-y-2` for action lists.
- **No manual `ScrollArea`** — content scrolls automatically.
- Footer is optionally conditional based on active tab.

### 3.2 Sheet + List of Items

**All list/collection content uses `AegisSheet`, never `AegisModal`.**

```
AegisSheetHeader
  Separator
AegisSheetToolbar (optional — counts, filters, actions)
AegisSheetContent ← ScrollArea, gap-2 px-2 pb-4
  Item cards
AegisSheetFooter (optional — sticky totals, close)
```

**Standard card item structure (exact):**

Every item inside `AegisSheetContent` follows this pattern:

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
        <h3 className="text-sm font-medium leading-tight truncate">{item.title}</h3>
        <p className="text-xs text-muted-foreground/70 leading-tight mt-0.5">{item.subtitle}</p>
      </div>
    </div>
    <Badge variant="secondary" className="text-xs shrink-0 tabular-nums font-mono bg-muted/50 border-0">
      {item.value}
    </Badge>
  </div>
</Card>
```

**Rules for list item cards:**
- `p-0 gap-0 cursor-pointer border-border/40 hover:border-border/60 hover:bg-accent/30 transition-all group`.
- Icon: `size-8 rounded-lg` with semantic color. Hover via `group-hover:bg-{color}/15`.
- Icon color on container (`text-{color}`), icon inherits.
- Title: `text-sm font-medium leading-tight truncate`.
- Subtitle: `text-xs text-muted-foreground/70 leading-tight mt-0.5`.
- Value badge: `variant="secondary" tabular-nums font-mono bg-muted/50 border-0`.
- **Clicking the card opens an `AegisModal` for editing.** Never put inline edit/delete buttons directly on list cards — the click-to-edit pattern is the standard.

**Click-to-edit/delete pattern:**

```tsx
<AegisModalFooter>
  <Button
    type="button"
    variant="ghost"
    size="sm"
    className="mr-auto text-destructive hover:text-destructive hover:bg-destructive/10"
    disabled={isRemoving}
    onClick={handleRemove}
  >
    <Trash2 className="size-4" />
    Eliminar
  </Button>
  <DialogClose asChild>
    <Button variant="outline" className="border-border/40">Cancelar</Button>
  </DialogClose>
  <Button disabled={isPending || !hasChanges} type="submit">Guardar</Button>
</AegisModalFooter>
```

- Delete: `mr-auto` + `variant="ghost"` + destructive text color.
- Delete action **must** use `useConfirm`.
- Cancel via `DialogClose`, save on right.

**Sticky footer totals:**

```tsx
{items.length > 0 && (
  <AegisSheetFooter className="justify-between">
    <span className="text-sm font-medium">Total</span>
    <Badge variant="secondary" className="text-xs tabular-nums font-mono bg-muted/50 border-0">
      {formattedTotal}
    </Badge>
  </AegisSheetFooter>
)}
```

**Never put totals inside `AegisSheetContent`** — they scroll away.

### 3.3 Modal + Form

```
AegisModalHeader
  Separator
AegisModalContent (p-4)
  <form id={formId}> with space-y-4
    Field rows using grids (see 3.4)
AegisModalFooter
  Cancel (DialogClose) + Submit (type="submit" form={formId})
```

- Use `id` on the form and `form={id}` on the submit button.
- Labels for filter/section headers: `text-xs font-medium text-muted-foreground uppercase tracking-wider`.
- Labels for form fields: `text-sm font-medium` or (inside grids) `text-xs text-muted-foreground/70 font-medium`.

### 3.4 Form field composition (grid layout)

**CRITICAL — Never stack all form fields vertically in a single column.** Group related fields into horizontal rows using CSS Grid.

**Principles:**
1. Group semantically related fields on the same row (type + entity, name + ID, concept + amount).
2. Use `grid grid-cols-{n} gap-3`. Common grids: `grid-cols-2`, `grid-cols-3`, `grid-cols-5`.
3. Wider fields get more columns: text inputs `col-span-3`, numeric/select `col-span-2`.
4. Full-width fields are acceptable only when the field is alone in its semantic group.
5. Labels inside grids use `space-y-1.5` with `text-xs text-muted-foreground/70 font-medium`.
6. Row spacing remains `space-y-4` on the form container.

**Patterns:**

```tsx
// Two equal fields
<div className="grid grid-cols-2 gap-3">
  <div className="space-y-1.5">
    <Label className="text-xs text-muted-foreground/70 font-medium">Tipo ID</Label>
    <IdTypePicker />
  </div>
  <div className="space-y-1.5">
    <Label className="text-xs text-muted-foreground/70 font-medium">Número</Label>
    <Input />
  </div>
</div>

// Weighted (text + number)
<div className="grid grid-cols-5 gap-3">
  <div className="col-span-3 space-y-1.5">
    <Label className="text-xs text-muted-foreground/70 font-medium">Concepto</Label>
    <Input />
  </div>
  <div className="col-span-2 space-y-1.5">
    <Label className="text-xs text-muted-foreground/70 font-medium">Valor</Label>
    <CurrencyInput />
  </div>
</div>

// Three equal (e.g., dates)
<div className="grid grid-cols-3 gap-2">
  <DatePicker label="Emisión" />
  <DatePicker label="Inicio" />
  <DatePicker label="Vencimiento" />
</div>
```

### 3.5 Card + internal separator

```tsx
<CardHeader className="p-4">{/* header */}</CardHeader>
<Separator className="opacity-40" />
<CardContent className="p-4">{/* body */}</CardContent>
```

- Separator always `opacity-40`.
- `Card` itself has `p-0 py-0 gap-0`; padding on children.

### 3.6 Sheet/Modal + filters section

When adding filters inside a sheet (not using `AegisSheetToolbar`):

```tsx
<div className="px-4 py-3">
  <div className="grid gap-3 grid-cols-{n}">
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Aseguradora
      </label>
      <MultiSelect size="sm" options={...} value={...} onValueChange={...} />
    </div>
  </div>
</div>
```

### 3.7 Sidebar + page context

- `SidebarInset` always wraps the page content.
- Page header goes inside `SidebarInset`, never outside.
- Breadcrumbs go in the page header area within `SidebarInset`.

### 3.8 Action sections inside modals

For grouped actions (toggle active, delete) inside a modal tab:

```tsx
<div className="rounded-lg border border-border/40 p-3 space-y-2">
  <div className="flex items-center gap-2">
    <div className="flex shrink-0 items-center justify-center size-7 rounded-lg bg-aegis-sapphire/10 border border-aegis-sapphire/10 text-aegis-sapphire">
      <Icon className="size-3.5" />
    </div>
    <h4 className="text-sm font-medium tracking-tight">Renovar póliza</h4>
  </div>
  <p className="text-sm text-muted-foreground">Crea una póliza nueva vinculada a esta como renovación.</p>
  <div className="flex justify-end">
    <Button size="sm" variant="outline">Renovar</Button>
  </div>
</div>
```

- `aegis-sapphire` for non-destructive, `destructive` for delete.

---

## 4. Page Layout Patterns

### 4.1 Dashboard page

```tsx
<div className="p-4 space-y-4">
  {/* Header */}
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-lg font-semibold tracking-tight font-title">Dashboard</h1>
      <p className="text-sm text-muted-foreground">Resumen de la operación</p>
    </div>
    <div className="flex items-center gap-2">
      {/* Date selector, action buttons */}
    </div>
  </div>

  {/* Stats row */}
  <div className="grid grid-cols-5 gap-4">
    <KpiCard /> {/* col-span-full sm:col-span-2 lg:col-span-1 */}
    {/* x5 */}
  </div>

  {/* Charts / tables */}
  <div className="grid grid-cols-5 gap-4">
    <ChartCard /> {/* col-span-5 xl:col-span-3 */}
    <SideCard />  {/* col-span-5 xl:col-span-2 */}
  </div>
</div>
```

### 4.2 Collection management (Sheet-based)

```
Button click → AegisSheet opens
  AegisSheetHeader
  AegisSheetToolbar (counts + create button)
  AegisSheetContent (list of item cards)

  Item click → AegisModal opens on top
    AegisModalHeader
    AegisModalContent (edit form)
    AegisModalFooter (delete + cancel + save)
```

- Sheet stays open while modal opens on top (Radix z-index handled).
- Sheet shows the collection; modal shows detail/edit.

### 4.3 Empty states

```tsx
<div className="flex flex-col items-center justify-center border border-dashed border-border/40 rounded-lg p-8 text-center">
  <div className="flex items-center justify-center size-10 rounded-xl bg-muted/50 mb-3">
    <Icon className="size-5 text-muted-foreground/50" />
  </div>
  <p className="text-sm text-muted-foreground">Sin pólizas registradas</p>
  <p className="text-xs text-muted-foreground/60 mt-1">Crea la primera póliza para este cliente.</p>
</div>
```

- Dashed border: `border border-dashed border-border/40`.
- Icon container: `size-10 rounded-xl bg-muted/50` (no colored background for empty states).

---

## 5. Operational States

### 5.1 Policy status application

```tsx
// Badge
<Badge variant="outline" className={cn("text-xs", statusTextMapping[status])}>
  {statusLabelMapping[status]}
</Badge>

// Indicator dot
<div className={cn("size-2 rounded-full", statusDotMapping[status])} />
```

Use the mapping objects defined in `packages/policies/lib/status-mapping.ts`.

### 5.2 Loading states

Skeleton pattern:

```tsx
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
- Match the dimensions of the content being replaced.

### 5.3 Error states in forms

- `toast.success()` for success (Sonner).
- `handleConvexError(error)` for Convex mutation errors — shows toast.
- Inline validation: HTML5 (`required`, `minLength`, `maxLength`).
- Destructive actions: **always** use `useConfirm`.

```tsx
const [ConfirmDialog, confirm] = useConfirm({
  title: "Eliminar póliza",
  message: "Esta acción no se puede deshacer.",
  type: "critical",
});

const ok = await confirm();
if (!ok) return;

<ConfirmDialog />
```

---

## 6. Anti-patterns — what Aegis **never** does

### 6.1 Raw Dialog with manual headers

**Wrong:** manually building `<Dialog> <DialogHeader> <div>icon</div> <DialogTitle>` every time.

**Correct:** `<AegisModal><AegisModalHeader icon={Icon} title="..." /></AegisModal>`.

**Why:** Manual headers drift. The compound component guarantees identical structure.

### 6.2 Raw Sheet with manual headers

**Wrong:** using `Sheet` + `SheetContent` + `SheetHeader` manually.

**Correct:** `AegisSheet` + `AegisSheetHeader`.

### 6.3 CommandGroup outside CommandList

**Wrong:** `<CommandDialog><CommandInput /><CommandGroup>` (no list).

**Correct:** `<CommandDialog><CommandInput /><CommandList><CommandEmpty /><CommandGroup /></CommandList>`.

### 6.4 Decorative gradients

**Wrong:** `bg-gradient-to-r from-aegis-sapphire/10 to-aegis-cyan/10` as background.

**Why:** Low-opacity gradients resolve to flat colors and add noise. Use solid colors with opacity.

### 6.5 Prominent shadows

**Wrong:** `shadow-md`, `shadow-lg`, `shadow-xl`, `drop-shadow-lg`.

**Correct:** `border-border/40` for depth.

### 6.6 Hardcoded font classes

**Wrong:** `className="font-outfit"` on elements.

**Correct:** global font handles it. Use `font-title`, `font-mono` only when overriding.

### 6.7 Forced icon colors

**Wrong:**
```tsx
<div className="size-10 rounded-xl bg-aegis-sapphire/10 border border-aegis-sapphire/10">
  <Icon className="size-5 text-aegis-sapphire" /> {/* forced on icon */}
</div>
```

**Correct:**
```tsx
<div className="size-10 rounded-xl bg-aegis-sapphire/10 border border-aegis-sapphire/10 text-aegis-sapphire">
  <Icon className="size-5" /> {/* inherits */}
</div>
```

Exception: dashboard cards where policy-status colors are mapped dynamically.

### 6.8 Sidebar variant mismatch

**Wrong:** `<Sidebar variant="sidebar">` or omitting variant.

**Correct:** always `<Sidebar variant="inset" collapsible="icon">`.

### 6.9 Inconsistent tab padding in modals

**Wrong:** adding padding between `Separator` and `TabsList`, or padding around `Tabs` causing double spacing.

**Correct:** `AegisModalContent` has `p-4`, `TabsList` has `mb-4`, `TabsContent` has `mt-0`.

### 6.10 Semantic colors as decoration

**Wrong:** `aegis-amber` as pretty accent on a neutral card.

**Correct:** `aegis-amber` only for warnings/pending. `aegis-emerald` only for success/active.

### 6.11 Lists inside AegisModal

**Wrong:**
```tsx
<AegisModal>
  <AegisModalContent>{items.map(...)}</AegisModalContent>
</AegisModal>
```

**Correct:**
```tsx
<AegisSheet>
  <AegisSheetContent>{items.map(...)}</AegisSheetContent>
</AegisSheet>
```

### 6.12 Single-column form stacking

**Wrong:** every field in its own full-width row.

**Correct:** group semantically related fields in grid rows (see 3.4).

### 6.13 Inline edit/delete buttons on list cards

**Wrong:** small trash icon + edit icon buttons on each card.

**Correct:** click-to-edit pattern — card click opens `AegisModal` with delete in footer.

### 6.14 Wrong icon library or shared entity icons

**Wrong:** `import { RiUserLine } from "react-icons/ri"`.

**Correct:** `import { User } from "lucide-react"`.

**Wrong:** using the same icon for two different entities.

**Correct:** follow the Icon Registry (section 2.8).

### 6.15 Totals inside scrollable content

**Wrong:** total card at the bottom of `AegisSheetContent`.

**Correct:** total in `AegisSheetFooter` so it's always visible.

### 6.16 Direct Convex imports in components

**Wrong:**
```tsx
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
const data = useQuery(api.clients.getById, { id });
```

**Correct:**
```tsx
import { useGetClientById } from "@/packages/clients/api";
const { data } = useGetClientById({ id });
```

**Why:** `api.ts` is the **sole entry point** to Convex for any package. See `docs/architecture/packages-structure.md`.

---

## 7. Pre-delivery checklist

Before presenting any UI component, verify every item:

```
□ Uses AegisModal/AegisSheet instead of raw Dialog/Sheet?
□ Variable-length content uses AegisSheet, not AegisModal?
□ AegisModal only contains fixed content (forms, tabs, settings, confirmations)?
□ If tabs in a modal — inside AegisModalContent with TabsContent mt-0?
□ Icon containers — correct size for context (small/medium/large/action)?
□ Icon color inherited from container, not forced on the icon?
□ Semantic colors used correctly (sapphire default, emerald/amber/destructive for states)?
□ No hardcoded font classes?
□ Borders use correct opacity (border-border/40)?
□ Separators between header and content have opacity-40?
□ Card: p-0 py-0 gap-0 on Card, padding on children, bg-card/90 backdrop-blur-sm border-border/40?
□ Sidebar has variant="inset" collapsible="icon"?
□ Depth is borders-only — no shadow-md/lg/xl?
□ CommandGroup is inside CommandList?
□ Empty states use dashed border pattern?
□ Forms use toast.success + handleConvexError for feedback?
□ Destructive actions use useConfirm hook?
□ Footer buttons: cancel via DialogClose, action on the right, destructive with mr-auto?
□ Form fields use grid composition — no single-column stacking of all fields?
□ Related form fields grouped on same row (grid-cols-2/3/5 with gap-3)?
□ List item cards use standard structure (icon + text + badge, cursor-pointer)?
□ Click-to-edit pattern — no inline edit/delete buttons?
□ Aggregated totals in AegisSheetFooter, never inside AegisSheetContent?
□ Lists sorted by a stable primary key (e.g., name alphabetical, date descending)?
□ Icons imported from lucide-react only?
□ Entity icons match the Icon Registry — no shared icons between entities?
□ Action icons use the standard mapping?
□ Data reads/writes go through @/packages/<name>/api — no direct @/convex imports in components?
```
