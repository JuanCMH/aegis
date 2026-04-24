# Clients Module Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a dynamic, template-driven client management module with a drag & drop template builder, AI-assisted template generation, AI-powered data extraction from documents, paginated search, and full CRUD.

**Architecture:** The module has two main subsystems: (1) **Client Templates** — per-company form configuration stored in `clientTemplates` table, managed through a drag & drop builder at `/settings/client-template`, with AI assistance for generation and review. (2) **Clients** — CRUD with dynamic data stored as `{ name, identificationNumber, templateId, data: Record<string, any>, companyId }`, rendered by the active template, with AI extraction from uploaded file/image fields.

**Tech Stack:** Convex (backend, storage, search indexes), Next.js App Router, @dnd-kit (drag & drop), @convex-dev/agent + Gemini 2.5 Flash (AI), shadcn/ui, TanStack Table, Sonner, date-fns, Remixicon, unpdf.

**Design Document:** `docs/plans/2026-04-16-clients-module-design.md`

---

## Phase 1: Schema & Backend Foundation

Everything needed for the data layer — no UI yet. This phase makes both subsystems queryable and mutable from the backend.

---

### Task 1.1: Install @dnd-kit

**Files:**
- Modify: `package.json`

**Step 1: Install the dependency**

Run:
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**Step 2: Verify installation**

Run: `cat node_modules/@dnd-kit/core/package.json | head -5`
Expected: Shows @dnd-kit/core package info.

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "[CHORE] Install @dnd-kit for drag and drop"
```

---

### Task 1.2: Update Schema — Replace `clients` table + add `clientTemplates`

**Files:**
- Modify: `convex/schema.ts` (lines 64-88: current `clients` table definition)

**Step 1: Define the field config validator and template/client tables**

Replace the current `clients` table (lines 64-88) with:

```ts
// --- Client Template Field Types ---
const fieldType = v.union(
  v.literal("text"),
  v.literal("textarea"),
  v.literal("number"),
  v.literal("currency"),
  v.literal("date"),
  v.literal("select"),
  v.literal("phone"),
  v.literal("email"),
  v.literal("file"),
  v.literal("image"),
  v.literal("switch"),
  v.literal("url"),
);

const fieldSize = v.union(
  v.literal("small"),
  v.literal("medium"),
  v.literal("large"),
  v.literal("full"),
);

const templateField = v.object({
  id: v.string(),
  type: fieldType,
  label: v.string(),
  placeholder: v.optional(v.string()),
  required: v.boolean(),
  size: fieldSize,
  sizeOverride: v.optional(
    v.object({
      sm: v.optional(v.number()),
      md: v.optional(v.number()),
      lg: v.optional(v.number()),
    }),
  ),
  showInTable: v.boolean(),
  isFixed: v.boolean(),
  config: v.object({
    minLength: v.optional(v.number()),
    maxLength: v.optional(v.number()),
    minValue: v.optional(v.number()),
    maxValue: v.optional(v.number()),
    options: v.optional(
      v.array(v.object({ label: v.string(), value: v.string() })),
    ),
    acceptedFormats: v.optional(v.array(v.string())),
    maxFileSize: v.optional(v.number()),
  }),
});

const templateSection = v.object({
  id: v.string(),
  label: v.string(),
  order: v.number(),
  fields: v.array(templateField),
});
```

Then define the two tables:

```ts
clientTemplates: defineTable({
  companyId: v.id("companies"),
  sections: v.array(templateSection),
}).index("companyId", ["companyId"]),

clients: defineTable({
  name: v.string(),
  identificationNumber: v.string(),
  templateId: v.id("clientTemplates"),
  data: v.any(),
  companyId: v.id("companies"),
})
  .index("companyId", ["companyId"])
  .searchIndex("search_name", {
    searchField: "name",
    filterFields: ["companyId"],
  })
  .searchIndex("search_identificationNumber", {
    searchField: "identificationNumber",
    filterFields: ["companyId"],
  }),
```

> Note: `v.any()` is used for `data` since it's a dynamic Record<string, any>. Convex supports `v.any()` for flexible data.
> Note: Two separate `searchIndex` definitions enable full-text search on both `name` and `identificationNumber`, each scoped to a company. This avoids using `.filter()` in queries, which is forbidden per Convex best practices — always use indexes instead.

**Step 2: Verify schema compiles**

Run: `npx convex dev --once` or check for TypeScript errors.

**Step 3: Commit**

```bash
git add convex/schema.ts
git commit -m "[FEAT] Add clientTemplates and dynamic clients schema"
```

---

### Task 1.3: Create error messages

**Files:**
- Create: `convex/errors/clients.ts`

**Step 1: Write error constants**

```ts
export const clientErrors = {
  unauthorized: "No estás autorizado para realizar esta acción",
  notFound: "El cliente no existe",
  templateNotFound: "La plantilla de clientes no existe para este espacio de trabajo",
  companyNotFound: "El espacio de trabajo no existe o no eres miembro",
  permissionDenied: "No tienes permisos para gestionar clientes en este espacio",
  nameRequired: "El nombre del cliente es obligatorio",
  identificationRequired: "El número de identificación es obligatorio",
  templateAlreadyExists: "Ya existe una plantilla de clientes para este espacio de trabajo",
  invalidFieldData: "Los datos proporcionados no coinciden con la plantilla activa",
} as const;
```

**Step 2: Commit**

```bash
git add convex/errors/clients.ts
git commit -m "[FEAT] Add client error messages"
```

---

### Task 1.4: Create `convex/clientTemplates.ts` — CRUD for templates

**Files:**
- Create: `convex/clientTemplates.ts`

This file handles create, update, and get for the per-company template. Pattern follows `convex/quote.ts` for auth/member checks.

**Step 1: Write the backend**

```ts
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { populateMember } from "./roles";
import { clientErrors } from "./errors/clients";

// Reuse the validators from schema (or inline)
const fieldConfigValidator = v.object({
  minLength: v.optional(v.number()),
  maxLength: v.optional(v.number()),
  minValue: v.optional(v.number()),
  maxValue: v.optional(v.number()),
  options: v.optional(
    v.array(v.object({ label: v.string(), value: v.string() })),
  ),
  acceptedFormats: v.optional(v.array(v.string())),
  maxFileSize: v.optional(v.number()),
});

const fieldValidator = v.object({
  id: v.string(),
  type: v.union(
    v.literal("text"),
    v.literal("textarea"),
    v.literal("number"),
    v.literal("currency"),
    v.literal("date"),
    v.literal("select"),
    v.literal("phone"),
    v.literal("email"),
    v.literal("file"),
    v.literal("image"),
    v.literal("switch"),
    v.literal("url"),
  ),
  label: v.string(),
  placeholder: v.optional(v.string()),
  required: v.boolean(),
  size: v.union(
    v.literal("small"),
    v.literal("medium"),
    v.literal("large"),
    v.literal("full"),
  ),
  sizeOverride: v.optional(
    v.object({
      sm: v.optional(v.number()),
      md: v.optional(v.number()),
      lg: v.optional(v.number()),
    }),
  ),
  showInTable: v.boolean(),
  isFixed: v.boolean(),
  config: fieldConfigValidator,
});

const sectionValidator = v.object({
  id: v.string(),
  label: v.string(),
  order: v.number(),
  fields: v.array(fieldValidator),
});

export const getByCompany = query({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const member = await populateMember(ctx, userId, args.companyId);
    if (!member) return null;

    return await ctx.db
      .query("clientTemplates")
      .withIndex("companyId", (q) => q.eq("companyId", args.companyId))
      .unique();
  },
});

export const save = mutation({
  args: {
    companyId: v.id("companies"),
    sections: v.array(sectionValidator),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(clientErrors.unauthorized);

    const member = await populateMember(ctx, userId, args.companyId);
    if (!member) throw new ConvexError(clientErrors.permissionDenied);

    // Validate that fixed fields (name, identificationNumber) exist
    const allFields = args.sections.flatMap((s) => s.fields);
    const hasName = allFields.some(
      (f) => f.isFixed && f.id === "name",
    );
    const hasIdentification = allFields.some(
      (f) => f.isFixed && f.id === "identificationNumber",
    );
    if (!hasName || !hasIdentification) {
      throw new ConvexError("Los campos fijos (Nombre y Número de Identificación) son obligatorios");
    }

    const existing = await ctx.db
      .query("clientTemplates")
      .withIndex("companyId", (q) => q.eq("companyId", args.companyId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { sections: args.sections });
      return existing._id;
    }

    return await ctx.db.insert("clientTemplates", {
      companyId: args.companyId,
      sections: args.sections,
    });
  },
});
```

**Step 2: Verify compilation**

Run: `npx convex dev --once`

**Step 3: Commit**

```bash
git add convex/clientTemplates.ts
git commit -m "[FEAT] Add clientTemplates backend (save, getByCompany)"
```

---

### Task 1.5: Create `convex/clients.ts` — CRUD for clients

**Files:**
- Create: `convex/clients.ts`

**Step 1: Write the backend**

```ts
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { populateMember } from "./roles";
import { clientErrors } from "./errors/clients";

export const create = mutation({
  args: {
    name: v.string(),
    identificationNumber: v.string(),
    templateId: v.id("clientTemplates"),
    data: v.any(),
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(clientErrors.unauthorized);

    const member = await populateMember(ctx, userId, args.companyId);
    if (!member) throw new ConvexError(clientErrors.permissionDenied);

    if (!args.name.trim()) throw new ConvexError(clientErrors.nameRequired);
    if (!args.identificationNumber.trim())
      throw new ConvexError(clientErrors.identificationRequired);

    return await ctx.db.insert("clients", {
      name: args.name,
      identificationNumber: args.identificationNumber,
      templateId: args.templateId,
      data: args.data,
      companyId: args.companyId,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("clients"),
    name: v.string(),
    identificationNumber: v.string(),
    data: v.any(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(clientErrors.unauthorized);

    const client = await ctx.db.get(args.id);
    if (!client) throw new ConvexError(clientErrors.notFound);

    const member = await populateMember(ctx, userId, client.companyId);
    if (!member) throw new ConvexError(clientErrors.permissionDenied);

    if (!args.name.trim()) throw new ConvexError(clientErrors.nameRequired);
    if (!args.identificationNumber.trim())
      throw new ConvexError(clientErrors.identificationRequired);

    await ctx.db.patch(args.id, {
      name: args.name,
      identificationNumber: args.identificationNumber,
      data: args.data,
    });

    return args.id;
  },
});

export const remove = mutation({
  args: { id: v.id("clients") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(clientErrors.unauthorized);

    const client = await ctx.db.get(args.id);
    if (!client) throw new ConvexError(clientErrors.notFound);

    const member = await populateMember(ctx, userId, client.companyId);
    if (!member) throw new ConvexError(clientErrors.permissionDenied);

    // Clean up file/image fields stored in Convex storage
    // Use the template to identify which fields are file/image type,
    // then delete only those storage IDs — avoids the fragile heuristic
    // of guessing storage IDs by string prefix.
    const template = await ctx.db.get(client.templateId);
    if (template && client.data && typeof client.data === "object") {
      const fileFieldIds = template.sections
        .flatMap((s: any) => s.fields)
        .filter((f: any) => f.type === "file" || f.type === "image")
        .map((f: any) => f.id);
      for (const fieldId of fileFieldIds) {
        const storageId = client.data[fieldId];
        if (storageId) {
          try {
            await ctx.storage.delete(storageId);
          } catch {
            // File may not exist in storage — ignore
          }
        }
      }
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

export const getByCompany = query({
  args: {
    companyId: v.id("companies"),
    search: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return { page: [], isDone: true, continueCursor: "" };

    const member = await populateMember(ctx, userId, args.companyId);
    if (!member) return { page: [], isDone: true, continueCursor: "" };

    // If search term provided, use search indexes (no .filter() per Convex best practices)
    if (args.search && args.search.trim()) {
      const byName = await ctx.db
        .query("clients")
        .withSearchIndex("search_name", (q) =>
          q.search("name", args.search!).eq("companyId", args.companyId),
        )
        .take(25);

      const byIdNumber = await ctx.db
        .query("clients")
        .withSearchIndex("search_identificationNumber", (q) =>
          q.search("identificationNumber", args.search!).eq("companyId", args.companyId),
        )
        .take(25);

      // Merge and deduplicate
      const seen = new Set(byName.map((r) => r._id));
      const merged = [...byName];
      for (const client of byIdNumber) {
        if (!seen.has(client._id)) {
          merged.push(client);
          seen.add(client._id);
        }
      }

      return { page: merged.slice(0, 25), isDone: true, continueCursor: "" };
    }

    // No search: paginated list using official paginationOptsValidator
    return await ctx.db
      .query("clients")
      .withIndex("companyId", (q) => q.eq("companyId", args.companyId))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const getById = query({
  args: { id: v.id("clients") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const client = await ctx.db.get(args.id);
    if (!client) return null;

    const member = await populateMember(ctx, userId, client.companyId);
    if (!member) return null;

    // Resolve file/image URLs from storage
    const template = await ctx.db.get(client.templateId);
    if (!template) return { ...client, resolvedFiles: {} };

    const fileFields = template.sections
      .flatMap((s: any) => s.fields)
      .filter((f: any) => f.type === "file" || f.type === "image");

    const resolvedFiles: Record<string, string | null> = {};
    for (const field of fileFields) {
      const storageId = client.data?.[field.id];
      if (storageId) {
        resolvedFiles[field.id] = await ctx.storage.getUrl(storageId);
      }
    }

    return { ...client, resolvedFiles };
  },
});
```

**Step 2: Verify compilation**

Run: `npx convex dev --once`

**Step 3: Commit**

```bash
git add convex/clients.ts
git commit -m "[FEAT] Add clients CRUD backend with search and pagination"
```

---

### Task 1.6: Create `packages/clients/api.ts` — Frontend hooks

**Files:**
- Modify: `packages/clients/api.ts` (currently empty)

**Step 1: Write the hooks**

```ts
import { api } from "@/convex/_generated/api";
import { useFetch } from "@/components/hooks/use-fetch";
import { useMutate } from "@/components/hooks/use-mutate";

// Client Template hooks
const templateRoute = api.clientTemplates;

export const useGetClientTemplate = (
  data: typeof templateRoute.getByCompany._args,
) => useFetch(templateRoute.getByCompany, data);

export const useSaveClientTemplate = () => useMutate(templateRoute.save);

// Client hooks
const clientRoute = api.clients;

export const useCreateClient = () => useMutate(clientRoute.create);

export const useUpdateClient = () => useMutate(clientRoute.update);

export const useRemoveClient = () => useMutate(clientRoute.remove);

export const useGetClientsByCompany = (
  data: typeof clientRoute.getByCompany._args,
) => useFetch(clientRoute.getByCompany, data);

export const useGetClientById = (data: typeof clientRoute.getById._args) =>
  useFetch(clientRoute.getById, data);
```

**Step 2: Commit**

```bash
git add packages/clients/api.ts
git commit -m "[FEAT] Add client and template API hooks"
```

---

### Task 1.7: Create `packages/clients/types.ts`

**Files:**
- Create: `packages/clients/types.ts`

**Step 1: Write types**

```ts
export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "currency"
  | "date"
  | "select"
  | "phone"
  | "email"
  | "file"
  | "image"
  | "switch"
  | "url";

export type FieldSize = "small" | "medium" | "large" | "full";

export type FieldConfig = {
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  options?: { label: string; value: string }[];
  acceptedFormats?: string[];
  maxFileSize?: number;
};

export type TemplateField = {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  size: FieldSize;
  sizeOverride?: { sm?: number; md?: number; lg?: number };
  showInTable: boolean;
  isFixed: boolean;
  config: FieldConfig;
};

export type TemplateSection = {
  id: string;
  label: string;
  order: number;
  fields: TemplateField[];
};

export type ClientData = Record<string, any>;
```

**Step 2: Commit**

```bash
git add packages/clients/types.ts
git commit -m "[FEAT] Add client module TypeScript types"
```

---

### Task 1.8: Create `packages/clients/hooks/use-client-id.ts`

**Files:**
- Create: `packages/clients/hooks/use-client-id.ts`

**Step 1: Write hook (same pattern as `use-company-id.ts`)**

```ts
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";

export const useClientId = () => {
  const { clientId } = useParams<{ clientId: Id<"clients"> }>();
  return clientId;
};
```

**Step 2: Commit**

```bash
git add packages/clients/hooks/use-client-id.ts
git commit -m "[FEAT] Add useClientId param hook"
```

---

## Phase 2: Template Builder UI

The drag & drop form builder where company admins design their client form.

---

### Task 2.1: Create the field palette component

**Files:**
- Create: `packages/clients/components/template-builder/field-palette.tsx`

This is the left panel showing draggable field types. Each item has an icon, label, and is draggable via @dnd-kit.

Field types to show:
| Type | Label | Icon |
|------|-------|------|
| text | Texto | RiInputField |
| textarea | Descripción | RiFileTextFill |
| number | Numérico | RiHashtag |
| currency | Valor (COP) | RiMoneyDollarCircleFill |
| date | Fecha | RiCalendarFill |
| select | Selección | RiArrowDownSLine |
| phone | Teléfono | RiPhoneFill |
| email | Correo | RiMailFill |
| file | Archivo | RiAttachment2 |
| image | Imagen | RiImageFill |
| switch | Sí/No | RiToggleFill |
| url | Enlace | RiLinksFill |

Uses `useDraggable` from @dnd-kit/core. When dragged to canvas, creates a new field of that type with default config.

---

### Task 2.2: Create the field configuration panel

**Files:**
- Create: `packages/clients/components/template-builder/field-config-panel.tsx`

A slide-out panel (Sheet) that opens when clicking a field on the canvas. Shows:
- Label (text input)
- Placeholder (text input)
- Required (switch)
- Size (select: Pequeño/Medio/Grande/Completo)
- Size override per breakpoint (collapsible advanced section)
- Show in table (switch)
- Type-specific config:
  - text/textarea: minLength, maxLength
  - number/currency: minValue, maxValue
  - select: options list (add/remove/reorder)
  - file/image: acceptedFormats, maxFileSize
- Delete button (hidden for isFixed fields)

Uses shadcn Sheet, Field, Input, Select, Switch components already in the project.

---

### Task 2.3: Create the canvas component (drop zone + field grid)

**Files:**
- Create: `packages/clients/components/template-builder/template-canvas.tsx`

The main canvas area that:
- Is a `useDroppable` zone from @dnd-kit
- Renders fields in a CSS Grid (4 columns on desktop)
- Each field is wrapped in `useSortable` for reorder via drag
- Respects field `size` presets: small=1col, medium=2col, large=3col, full=4col
- Shows field label, type icon, and a subtle border
- Click opens field-config-panel
- Fixed fields show a lock icon overlay

---

### Task 2.4: Create the section tabs component

**Files:**
- Create: `packages/clients/components/template-builder/section-tabs.tsx`

Renders tabs above the canvas, one per section:
- Click tab → switches active section in canvas
- "+" button to add new section (inline rename)
- Right-click / menu on tab: Rename, Delete (only if no fields or confirm)
- Drag fields to a tab to move them to that section
- Sections are ordered by their `order` field

---

### Task 2.5: Create the main template builder page

**Files:**
- Create: `packages/clients/components/template-builder/template-builder.tsx`
- Create: `app/(app)/companies/[companyId]/settings/client-template/page.tsx`

**template-builder.tsx** — Main component that:
- Wraps everything in `DndContext` from @dnd-kit/core
- Layout: sidebar (field-palette) | main (section-tabs + canvas)
- State: `sections: TemplateSection[]` managed via useState
- Loads existing template via `useGetClientTemplate` on mount
- If no template exists, initializes with default section "Información Básica" containing the two fixed fields (name, identificationNumber)
- Save button calls `useSaveClientTemplate` mutation
- Handles DnD events: onDragEnd for reorder/move, onDragOver for cross-section

**page.tsx** — Simple page shell:
```tsx
"use client";
import { TemplateBuilder } from "@/packages/clients/components/template-builder/template-builder";

export default function ClientTemplatePage() {
  return <TemplateBuilder />;
}
```

**Step: Add sidebar navigation link for settings**

Modify `packages/companies/components/company-sidebar.tsx` — add a "Configuración" section or add "Plantilla Clientes" link under the "Clientes" group.

---

### Task 2.6: Wire DnD logic — add field, reorder, move between sections

**Files:**
- Modify: `packages/clients/components/template-builder/template-builder.tsx`

Implement the core DnD handlers:
- **Adding a field:** When a field-palette item is dropped on the canvas → create new `TemplateField` with UUID, default config, append to active section
- **Reordering:** When a canvas field is dropped on another canvas field → swap positions in the fields array
- **Moving between sections:** When a canvas field is dragged to a section tab → remove from current section, add to target section

---

### Task 2.7: Default template initialization

**Files:**
- Modify: `packages/clients/components/template-builder/template-builder.tsx`

When no template exists for the company, create a default starting state:

```ts
const defaultSections: TemplateSection[] = [
  {
    id: crypto.randomUUID(),
    label: "Información Básica",
    order: 0,
    fields: [
      {
        id: "name",
        type: "text",
        label: "Nombre / Razón Social",
        placeholder: "Ingrese el nombre",
        required: true,
        size: "large",
        showInTable: true,
        isFixed: true,
        config: { maxLength: 200 },
      },
      {
        id: "identificationNumber",
        type: "text",
        label: "Número de Identificación",
        placeholder: "Ingrese el número",
        required: true,
        size: "medium",
        showInTable: true,
        isFixed: true,
        config: { maxLength: 50 },
      },
    ],
  },
];
```

---

## Phase 3: Client CRUD UI

Create, view, edit, and list clients using the dynamic template.

---

### Task 3.1: Create the dynamic field renderer

**Files:**
- Create: `packages/clients/components/dynamic-field.tsx`

A component that receives a `TemplateField` definition + value + onChange and renders the correct input:

| Type | Component |
|------|-----------|
| text | `<Input />` |
| textarea | `<Textarea />` |
| number | `<Input type="number" />` |
| currency | `<CurrencyInput />` (existing component) |
| date | `<DatePicker />` (existing component) |
| select | `<Select />` with field.config.options |
| phone | `<Input type="tel" />` |
| email | `<Input type="email" />` |
| file | File upload button + filename display |
| image | Image upload button + preview |
| switch | `<Switch />` |
| url | `<Input type="url" />` |

Wraps each in `<Field label={field.label} required={field.required}>`.

Applies grid column span based on `size`: small → `col-span-1`, medium → `col-span-2`, large → `col-span-3`, full → `col-span-4`.

For `readOnly` mode: all inputs disabled, file/image show view-only links.

---

### Task 3.2: Create the stepper component

**Files:**
- Create: `packages/clients/components/client-stepper.tsx`

A reusable stepper with direct navigation:
- Shows all section labels as clickable steps (horizontal on desktop, vertical on mobile)
- Current step highlighted
- All steps are clickable at any time (no blocking between steps)
- Active step renders its fields using `dynamic-field.tsx` in a 4-column grid

Props:
```ts
{
  sections: TemplateSection[];
  values: Record<string, any>;
  onChange: (fieldId: string, value: any) => void;
  readOnly?: boolean;
  onFileUpload?: (fieldId: string, file: File) => void;
}
```

---

### Task 3.3: Create the new client page

**Files:**
- Modify: `app/(app)/companies/[companyId]/clients/new/page.tsx` (currently just a shell rendering static form)

Rewrite to:
1. Load the active template via `useGetClientTemplate`
2. If no template → show message "Configure la plantilla de clientes primero" with link to settings
3. Manage form state: `values: Record<string, any>` with useState
4. Render `ClientStepper` with template sections
5. Handle file uploads: use `useGenerateUploadUrl` → upload to storage → store storage ID in values
6. Save button: extract `name` and `identificationNumber` from values, call `useCreateClient`
7. On success → redirect to `/companies/[companyId]/clients/[newClientId]`

---

### Task 3.4: Create the client detail/edit page

**Files:**
- Create: `app/(app)/companies/[companyId]/clients/[clientId]/page.tsx`

Similar to quotes `[quoteId]/page.tsx`:
1. Load client via `useGetClientById`
2. Load template via `useGetClientTemplate`
3. Two modes: view (readOnly) and edit
4. Toggle button "Editar" / "Guardar"
5. In edit mode: same stepper, same handlers as create
6. Save calls `useUpdateClient`
7. File/image fields show current file (with URL from `resolvedFiles`) + option to replace

---

### Task 3.5: Create the client list page — table with search

**Files:**
- Modify: `app/(app)/companies/[companyId]/clients/page.tsx` (currently exists but is a basic shell)
- Create: `packages/clients/components/table/client-columns.tsx`
- Create: `packages/clients/components/table/client-data-table.tsx`
- Create: `packages/clients/components/table/client-actions.tsx`

**client-columns.tsx:**
- Fixed columns: Name, Identification Number, Created At
- Dynamic columns: read from template's `showInTable: true` fields
- Actions column with dropdown menu

**client-data-table.tsx:**
- Search input (debounced 300ms) that passes `search` to `useGetClientsByCompany`
- TanStack Table with the columns
- Pagination controls (Next/Previous using `continueCursor`)
- Row click → navigate to client detail

**client-actions.tsx:**
- Menu items: Ver, Editar, Eliminar (with confirm dialog)
- Uses `useRemoveClient` for delete

**page.tsx:**
- Header with title + "Nuevo Cliente" button
- Search bar
- ClientDataTable

---

### Task 3.6: Delete existing static form (cleanup)

**Files:**
- Remove: `packages/clients/components/client-form.tsx` (static form, no longer needed)

The dynamic form is now handled by `dynamic-field.tsx` + `client-stepper.tsx`.

---

## Phase 4: AI Integration

Two AI capabilities: (1) generate/review templates, (2) extract client data from documents.

---

### Task 4.1: Create the client AI agent

**Files:**
- Modify: `convex/agents.ts` — add a `clientAgent` alongside the existing `quoteAgent`

Add a second agent:

```ts
const clientAgent = new Agent(components.agent, {
  name: "Client Agent",
  languageModel: google("gemini-2.5-flash"),
  instructions: `
    GLOBAL OUTPUT FORMAT (MANDATORY)
    - Output MUST be ONLY a valid JSON object.
    - The response MUST start with "{" and end with "}".
    - Do NOT use Markdown, no labels, no explanations, no extra text.

    You will receive either:
    A) A document to extract client data from, along with a template definition
    B) A template to review and suggest improvements for

    Respond with the appropriate JSON format based on the task type provided in the prompt.
  `,
  maxSteps: 1,
});

export { clientAgent };
export default quoteAgent;
```

---

### Task 4.2: Create the client AI actions file

**Files:**
- Create: `convex/clientActions.ts` — a **separate file** for AI actions

> **Convex best practice:** Actions that use Node.js must NOT be in the same file as queries/mutations. Since `@convex-dev/agent` uses Node.js, all AI actions go in `convex/clientActions.ts` with `"use node";` at the top, keeping `convex/clients.ts` clean with only queries and mutations.

Add an `action` (not mutation) that:
1. Receives: document text + template sections definition
2. Builds a prompt telling the AI to map extracted data to template field IDs
3. Returns: `Record<string, any>` of field_id → extracted value

```ts
"use node";

import { ConvexError, v } from "convex/values";
import { action } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { clientAgent } from "./agents";
import { clientErrors } from "./errors/clients";

export const extractFromDoc = action({
  args: {
    prompt: v.string(),
    templateSections: v.any(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(clientErrors.unauthorized);

    const fieldsDescription = args.templateSections
      .flatMap((s: any) => s.fields)
      .map((f: any) => `- "${f.id}" (${f.type}): ${f.label}`)
      .join("\n");

    const fullPrompt = `
TASK: Extract client data from the following document text.

TEMPLATE FIELDS:
${fieldsDescription}

DOCUMENT TEXT:
${args.prompt}

OUTPUT: Return a JSON object where keys are field IDs and values are the extracted data.
Only include fields where you found relevant data. Use null for fields you're unsure about.
For date fields, use ISO 8601 format (YYYY-MM-DD).
For currency/number fields, use numbers only (no symbols).
For switch fields, use true/false.
    `;

    const { thread } = await clientAgent.createThread(ctx);
    const result = await thread.generateText({ prompt: fullPrompt });
    return result.text;
  },
});
```

---

### Task 4.3: Create the template generation action

**Files:**
- Modify: `convex/clientActions.ts` — add `generateFromDoc` and `reviewTemplate` actions

> **Note:** These actions go in `convex/clientActions.ts` (the actions file), NOT in `convex/clientTemplates.ts` (which only has queries/mutations). This follows the Convex rule: never mix `"use node"` actions with queries/mutations in the same file.

**generateFromDoc:** Receives document text → returns suggested `TemplateSection[]`

**reviewTemplate:** Receives current sections + optional user instruction → returns list of suggested changes as structured actions.

---

### Task 4.4: Wire AI extraction into the create/edit client flow

**Files:**
- Modify: `packages/clients/components/dynamic-field.tsx` — for file/image types, after upload show toast "¿Extraer datos con IA?"
- Modify: `app/(app)/companies/[companyId]/clients/new/page.tsx` — handle AI extraction callback
- Modify: `packages/clients/api.ts` — add `useExtractClientFromDoc` hook (useExecute, pointing to `api.clientActions.extractFromDoc`)

Flow:
1. File uploaded to storage → storageId saved in values
2. Toast appears: "Documento subido. ¿Deseas extraer datos con IA?"
3. If accepted → call `extractFromDoc` action with PDF text + template
4. Parse response → merge non-empty values into form state
5. Highlight AI-filled fields (apply a CSS class for visual distinction)

---

### Task 4.5: Wire AI into the template builder

**Files:**
- Create: `packages/clients/components/template-builder/template-ai-modal.tsx`

Two modes:

**Generate mode:**
- Modal with file upload area
- Extracts text from document (using `getPdfContent` from `lib/extract-pdf.ts`)
- Calls `generateFromDoc` action
- Shows preview of generated sections
- "Aplicar" button loads them into the builder

**Review mode:**
- Sheet/modal with a chat-like interface
- Shows current template summary
- User can type instructions or just click "Revisar"
- AI responds with structured list of changes (each with accept/reject toggle)
- "Aplicar cambios" button applies accepted changes to the builder state

---

## Phase 5: Polish & Wiring

---

### Task 5.1: Add sidebar navigation link for template settings

**Files:**
- Modify: `packages/companies/components/company-sidebar.tsx`

Add under the "Clientes" section a third link:
```ts
{
  title: "Plantilla",
  url: `/companies/${companyId}/settings/client-template`,
  icon: RiSettings3Fill,  // or RiLayout2Fill
},
```

---

### Task 5.2: Add settings layout (if needed)

**Files:**
- Create: `app/(app)/companies/[companyId]/settings/layout.tsx` (if no settings layout exists)

Simple layout wrapper consistent with the company layout pattern.

---

### Task 5.3: Validation helpers

**Files:**
- Create: `packages/clients/lib/validate-client-data.ts`

A shared function that validates client `data` against a template:
- Check required fields have values
- Check minLength/maxLength for text
- Check minValue/maxValue for number/currency
- Check email format
- Check phone format
- Returns: `{ valid: boolean, errors: Record<string, string> }`

Used both in the form submit handler (frontend) and can be ported to backend if needed.

---

### Task 5.4: Integration — link quotes to clients (optional, future)

**Files:**
- Modify: `convex/schema.ts` — add `clientId: v.optional(v.id("clients"))` to quotes table
- Modify: `convex/quote.ts` — accept optional clientId in create/update
- Modify quote form — add ClientPicker (search + select)

> This task is listed for future reference. It connects the quotes module to the clients module but is NOT part of the initial clients module build.

---

## Phase Summary

| Phase | What it delivers | Depends on |
|-------|-----------------|------------|
| **Phase 1** | Schema, backend CRUD, API hooks, types | Nothing |
| **Phase 2** | Template builder (drag & drop, config panel, sections) | Phase 1 |
| **Phase 3** | Create/Edit/View/List clients with dynamic forms | Phase 1 + 2 |
| **Phase 4** | AI template generation, AI template review, AI data extraction | Phase 1 + 2 + 3 |
| **Phase 5** | Navigation, settings, validation, polish | Phase 1-4 |

Each phase builds on the previous and results in a functional increment:
- After Phase 1: Data layer is ready, nothing visible
- After Phase 2: Admin can create and save a client form template
- After Phase 3: Users can create, view, edit, search, and delete clients
- After Phase 4: AI assists in template building and client data entry
- After Phase 5: Everything is wired, navigable, and validated
