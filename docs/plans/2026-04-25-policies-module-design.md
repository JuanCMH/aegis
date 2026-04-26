# Policies Module — Design Document

**Date:** 2026-04-25
**Reference:** `docs/plans/2026-04-16-clients-module-design.md` (the policies module replicates this architecture; this doc only describes deltas).

**Goal:** Build a dynamic, template-driven policy management module mirroring the clients module: drag & drop template builder, AI-assisted template generation, AI extraction from PDFs, paginated search, full CRUD. **Critical difference:** a policy may or may not be linked to a client.

---

## Decisions Summary

| Decision | Choice |
|----------|--------|
| Architecture parity with clients | 1:1 — `policyTemplates` table + dynamic `data` on `policies` |
| Shared primitives | Extract `template-builder/` primitives (palette, canvas, config panel, section-tabs, dynamic-field, stepper) to `packages/template-builder/` and have **both** clients and policies consume them |
| New field types | **None** — the 12 existing types cover every column needed (validated against agency export sample) |
| Client linkage | `policies.clientId` becomes **optional**; a `ClientPicker` lives in the form header outside the template |
| Fixed top-level fields on `policies` | `policyNumber`, `status`, `startDate`, `endDate` — for indexing, search, and dashboard queries |
| Renewal chain | `parentPolicyId` stays as today; renewals create a new policy linked to its parent |
| Migration | `templateId` + `data` are **optional**; legacy rigid policies render via a fallback form (same pattern clients used) |
| Permissions | Add `policyTemplates_view` + `policyTemplates_edit`; existing `policies_*` set already satisfies the rest |
| Default sections | "Información general", "Roles" (tomador/asegurado/beneficiario), "Vigencia y montos", "Comisiones", "Observaciones" |
| AI | Same two capabilities as clients: generate template from a sample contract, extract policy data from uploaded PDF |
| Sidebar | Add "Plantilla de Pólizas" under settings, behind `policyTemplates_view` |

---

## 1. Why a shared `packages/template-builder/`?

The clients module ships a builder and a dynamic form that are entirely generic over the entity. Reimplementing them inside `packages/policies/` would duplicate ~1.5k LOC of identical drag & drop, palette, config panel, dynamic-field rendering, stepper, AI-suggestion plumbing, etc.

We extract once, before policies starts. The split:

- **Generic (`packages/template-builder/`)**: types, palette, config panel, canvas, section-tabs, dynamic-field, stepper, AI suggestion shapes (`ReviewSuggestion`), all DnD wiring. Stateless props in, callbacks out. Knows nothing about Convex tables or entity names.
- **Per-entity wrapper**: `packages/clients/components/template-builder/template-builder.tsx` and `packages/policies/components/template-builder/template-builder.tsx` glue Convex hooks (`useGetXTemplate`, `useSaveXTemplate`), the entity-specific default template, the entity-specific permission keys (`clientTemplates_edit` vs `policyTemplates_edit`), and the entity-specific AI agent.

This keeps each module's specialness in one thin file and frees us from maintaining two copies of complex DnD logic.

---

## 2. Data Model

### 2.1 New table: `policyTemplates`

Same shape as `clientTemplates`. One active template per company.

```
policyTemplates {
  companyId: Id<"companies">
  sections: TemplateSection[]   // identical validator to clientTemplates
}
// Index: companyId
```

### 2.2 Reshape `policies`

The current `policies` table (rigid columns: `insuredName`, `beneficiaryName`, etc.) becomes a hybrid:

```
policies {
  // Fixed, always present, indexed:
  policyNumber: string                  // unique per company, full-text searchable
  companyId: Id<"companies">
  clientId?: Id<"clients">              // OPTIONAL — policy may not be tied to a client
  status: "active" | "expired" | "canceled" | "pending"
  startDate: number                      // unix ms — for renewal alerts & dashboard
  endDate: number                        // unix ms — for renewal alerts & dashboard
  parentPolicyId?: Id<"policies">       // renewal chain
  isParentPolicy?: boolean

  // Template-driven:
  templateId?: Id<"policyTemplates">    // optional → legacy policies have none
  data?: Record<string, any>            // dynamic field values keyed by field.id
}
// Indexes:
//   companyId
//   companyId_status                    (filter dashboard by status)
//   companyId_endDate                   (renewal alerts)
//   clientId                            (a client's policies)
//   parentPolicyId                      (renewal chain)
// Search index:
//   search_policyNumber                 filterFields: ["companyId"]
```

**Why these are top-level and not in `data`:**

- `policyNumber` — primary functional key, search target, must be indexed.
- `status` — drives dashboard, filters, list badges. Can't live in dynamic data if we want `companyId_status` to be cheap.
- `startDate` / `endDate` — renewal alerts and dashboard widgets must query date ranges; these are universal across every agency on Earth.
- `clientId` — links to another entity; can't be a dynamic record value if we want indexed lookups of "all policies for client X".

Everything else an agency cares about (premium, taxes, insurer, line of business, holder/insured/beneficiary tuples, agent, observations, commissions) is **dynamic** and lives in `data` keyed by template field IDs.

### 2.3 Fixed template field IDs (analogous to clients)

The default template ships with four fixed (`isFixed: true`) fields whose IDs are hard-coded:

| Field ID | Type | Maps to top-level | Always required |
|----------|------|-------------------|-----------------|
| `field_policyNumber` | text | `policies.policyNumber` | yes |
| `field_status` | select | `policies.status` (4 options) | yes |
| `field_startDate` | date | `policies.startDate` | yes |
| `field_endDate` | date | `policies.endDate` | yes |

Mutations extract these four IDs from `data` and write them both to top-level and back into `data` (mirror), exactly as clients does with `field_name` / `field_identificationNumber`.

`clientId` is **not** a template field — it's selected via a `ClientPicker` in the form header, outside the dynamic stepper.

---

## 3. Template Builder

`/companies/[companyId]/settings/policy-template`

Same UI and UX as the clients template builder. Differences:

- Title: "Plantilla de Pólizas"
- Permission gate: `policyTemplates_edit` for the Save button
- Default sections preloaded when no template exists:
  1. **Información general** — `field_policyNumber` (text, fixed), `policyType` (text), `lineOfBusiness` (text), `insurer` (text), `agentName` (text), `field_status` (select, fixed)
  2. **Vigencia y montos** — `field_startDate` (date, fixed), `field_endDate` (date, fixed), `issueDate` (date), `premiumAmount` (currency), `issuanceExpenses` (currency), `taxes` (currency), `totalAmount` (currency)
  3. **Roles** — `policyHolderName` + `policyHolderIdNumber`, `insuredName` + `insuredIdNumber`, `beneficiaryName` + `beneficiaryIdNumber`
  4. **Comisiones** — `commissionPercentage` (number), `participation` (number), `totalCommission` (currency)
  5. **Observaciones** — `riskDescription` (textarea), `observations` (textarea)
- AI agent for generate / review reuses the existing `clientAgent` instructions but is parameterized as `policyAgent` (separate `convex/policyActions.ts`).

---

## 4. Create / Edit / View Policy

### 4.1 Create — `/companies/[id]/policies/new`

Layout:

- Header: "Nueva Póliza" + "Guardar".
- Below header, an outlined card with a **`ClientPicker`** (search clients in this company) + "Sin cliente asociado" toggle. Setting this writes `clientId` (or `null`).
- Stepper with the active template sections.
- Same AI extraction flow as clients: drop a PDF on a `file` field → toast "¿Extraer datos con IA?" → `policyActions.extractFromDoc`.

### 4.2 Detail / Edit — `/companies/[id]/policies/[policyId]`

Same as clients detail:

- View ↔ Edit toggle in header.
- ClientPicker is read-only in view mode and editable in edit mode.
- "Renovar" button (gated by `policies_renew`) → opens a flow that pre-fills a new policy with the same data and `parentPolicyId = currentId`.
- "Cancelar póliza" button (gated by `policies_cancel`) → confirms and sets `status = "canceled"`.

### 4.3 Validation

- Frontend & backend: same validators as clients.
- Extra: `endDate >= startDate`, `policyNumber` unique per company.

---

## 5. List & Table

`/companies/[id]/policies`

- Toolbar: search (debounced 300ms, hits `search_policyNumber`), filter chips for `status`, "Próximos a vencer" quick filter (`endDate < now + 60 days`).
- Fixed columns: `policyNumber`, `status` (badge), `clientId` (resolved name or "—"), `startDate`, `endDate`, "Días restantes" computed.
- Dynamic columns: every template field with `showInTable: true`.
- Row click → detail view.

The cell renderer registry from clients (`renderCell`) is generalized in the shared package and reused.

---

## 6. Permissions

Add to `convex/lib/permissions.ts`:

```ts
policyTemplates_view: v.boolean(),
policyTemplates_edit: v.boolean(),
```

Defaults for `Member` (per `docs/PERMISSIONS.md` style):

```ts
policyTemplates_view: true,
policyTemplates_edit: false,
```

Update `docs/PERMISSIONS.md` §3 and §4.2 to reflect the addition. Existing `policies_*` permissions stay as-is.

---

## 7. AI

Same two capabilities as clients, behind `policies_useAI` (already exists). New file: `convex/policyActions.ts` (Node action) with:

- `generateFromDoc` — receives PDF text → returns suggested `TemplateSection[]` for the policy form.
- `reviewTemplate` — receives current sections + optional instructions → returns `ReviewSuggestion[]`.
- `extractFromDoc` — receives PDF text + active template → returns `Record<fieldId, value>` for autofill.

The agent definition lives in `convex/agents.ts` next to `clientAgent`.

---

## 8. Migration

Existing `policies` rows have rigid columns and no `templateId`. Strategy mirrors clients:

1. Make `templateId` and `data` **optional** in the schema.
2. Frontend: when `templateId` is null on a detail page, render a **legacy fallback form** (the current `policy-form.tsx`) read-only, with a banner suggesting to "convertir a plantilla" (a one-click migration that loads the rigid columns into `data` keyed by the default template's field IDs).
3. List page: render rigid columns from top-level for legacy rows, dynamic columns from `data` for new rows. The cell registry handles both.

No destructive migration is run automatically. Conversion is opt-in and per-policy.

---

## 9. Routes summary

| Route | File |
|-------|------|
| Builder | `app/(app)/companies/[companyId]/settings/policy-template/page.tsx` |
| List | `app/(app)/companies/[companyId]/policies/page.tsx` (rewrite) |
| New | `app/(app)/companies/[companyId]/policies/new/page.tsx` (rewrite) |
| Detail | `app/(app)/companies/[companyId]/policies/[policyId]/page.tsx` (new) |

---

## 10. Out of scope (future work)

- Auto-renewal: cron-driven creation of renewal drafts before `endDate`. Listed only as a follow-up plan; not in MVP.
- Excel import: bulk policy creation from a spreadsheet. Future plan.
- Per-client access scoping: a role that can only see policies for certain clients. Future, when an agency asks.
