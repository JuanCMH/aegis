# Clients Module — Design Document

**Date:** 2026-04-16

**Goal:** Build a dynamic, template-driven client management module where each workspace configures its own form structure with drag & drop, AI-assisted template generation, and AI-powered data extraction from uploaded documents.

---

## Decisions Summary

| Decision | Choice |
|----------|--------|
| Fixed vs dynamic fields | Hybrid — `name` + `identificationNumber` fixed & indexed, rest dynamic from template |
| Sizing system | Presets (small/medium/large/full → 3/6/9/12 cols) with per-breakpoint override |
| Field types (12) | text, textarea, number, currency, date, select, phone, email, file, image, switch, url |
| Section navigation | Stepper with direct navigation (clickable section titles) for both create and view/edit |
| Template builder | Side panel (field palette) + canvas with drag & drop |
| AI in template builder | Generate from document + review/optimize via conversational chat |
| Data storage | Fixed fields at top level (indexed) + `data: Record<string, any>` for dynamic values |
| AI in client creation | Unified — uploading a file to a file/image field triggers AI extraction offer |
| Search | Backend search index (Convex) + pagination |
| Table columns | Admin configures `showInTable` per field in template + name/ID always visible |

---

## 1. Data Model

### Table: `clientTemplates`

One active template per workspace. Defines the form structure.

```
clientTemplates {
  workspaceId: Id<"workspaces">
  sections: [{
    id: string                    // UUID
    label: string                 // "Información Básica", "Documentos", etc.
    order: number
    fields: [{
      id: string                  // UUID
      type: "text"|"textarea"|"number"|"currency"|"date"|"select"|"phone"|"email"|"file"|"image"|"switch"|"url"
      label: string               // "Correo electrónico"
      placeholder?: string
      required: boolean
      size: "small"|"medium"|"large"|"full"   // Maps to 3/6/9/12 columns
      sizeOverride?: { sm?: number, md?: number, lg?: number }
      showInTable: boolean
      isFixed: boolean            // true for name & identificationNumber (not deletable)
      config: {
        minLength?: number        // text, textarea
        maxLength?: number        // text, textarea
        minValue?: number         // number, currency
        maxValue?: number         // number, currency
        options?: [{ label: string, value: string }]  // select
        acceptedFormats?: string[] // file, image
        maxFileSize?: number      // file, image (bytes)
      }
    }]
  }]
}
// Index: workspaceId
```

### Table: `clients`

Replaces the current fixed-schema table.

```
clients {
  name: string                          // Fixed, always present, indexed
  identificationNumber: string          // Fixed, always present, indexed
  templateId: Id<"clientTemplates">     // Reference to template used at creation
  data: Record<string, any>             // Dynamic values: { "field_uuid": value }
  workspaceId: Id<"workspaces">
}
// Indexes: workspaceId
// Search index: name, identificationNumber
```

---

## 2. Template Builder

### Location
`/workspaces/[workspaceId]/settings/client-template`

### Layout
- **Left panel:** Field palette — draggable field types (text, textarea, number, currency, date, select, phone, email, file, image, switch, url)
- **Right canvas:** Active section with fields in 4-column grid
- **Above canvas:** Tabs for sections + "Add section" button
- **Below canvas:** "Save template" button

### Interactions
1. Drag & drop from panel to canvas to add fields
2. Click a field → opens configuration panel (label, placeholder, required, size preset, validations, showInTable)
3. Drag & drop within canvas to reorder fields
4. Drag & drop to another section tab to move fields between sections
5. Fixed fields (Name, Identification Number) show a lock icon — movable/resizable but not deletable
6. Real-time preview — canvas reflects actual grid with size presets

### AI: Generate Template from Document
1. "Generate with AI" button → modal to upload reference document
2. AI extracts fields, infers types, groups into sections, assigns sizes
3. Preview shown in builder
4. User accepts → loaded into builder for final adjustments

### AI: Review/Optimize Existing Template
1. "Review with AI" button (available when fields already exist)
2. Opens chat where AI analyzes current template and proposes changes:
   - Create missing fields
   - Group fields into new sections
   - Move fields between sections
   - Adjust sizes for better layout
3. AI presents changes as a list of actions
4. User can accept/reject each change individually or request adjustments conversationally
5. On confirm, changes apply to the builder

---

## 3. Create / Edit / View Client

### Create Client (`/workspaces/[workspaceId]/clients/new`)

**Layout:**
- Header: "Nuevo Cliente" + "Guardar" button
- Stepper with direct navigation — section titles are clickable to jump between them
- Each step renders section fields according to template grid

**Standard flow:**
1. Load active workspace template
2. User navigates sections filling fields
3. Required fields validated on save (not on section change — navigation stays unblocked)
4. Save: full validation → `create` mutation → redirect to client detail

**AI flow (file/image upload):**
1. User uploads file to a `file` or `image` field
2. Toast/banner: "¿Deseas que la IA extraiga datos de este documento?"
3. If accepted: AI receives extracted text + template definition → returns mapped values
4. Fields auto-fill with suggested values (visually highlighted)
5. User reviews and adjusts

### View/Edit Client (`/workspaces/[workspaceId]/clients/[clientId]`)

**Layout:**
- Header: client name + "Editar"/"Guardar" toggle button
- Same stepper with direct navigation
- View mode: fields disabled, read-only
- Edit mode: fields enabled, same UX as creation
- AI extraction also works when uploading/replacing files in edit mode

### Validation
- Frontend: required, minLength/maxLength, minValue/maxValue, email/phone/url format
- Backend: same validation + verify field IDs match the active template

---

## 4. Client List & Table

### Location
`/workspaces/[workspaceId]/clients`

**Layout:**
- Header: "Clientes" + "Nuevo Cliente" button
- Prominent search bar — searches by name and identification number (backend)
- Paginated table (25 per page)

**Table columns:**
- **Name** (fixed, always visible)
- **Identification Number** (fixed, always visible)
- **Dynamic columns** — fields marked `showInTable: true` in template (max 4 additional)
- **Created at** (fixed, always visible)
- **Actions** — menu: View, Edit, Delete

**Search:**
- Backend query using Convex search index on `name` and `identificationNumber`
- Debounced (300ms)
- Results replace paginated table when search term is active

**Row click:**
- Navigates to `/workspaces/[workspaceId]/clients/[clientId]` in view mode
