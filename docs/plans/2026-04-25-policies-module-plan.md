# Policies Module Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Build a dynamic, template-driven policy management module that mirrors the clients module (drag & drop template builder, AI-assisted template generation, AI extraction from PDFs, paginated search, full CRUD). A policy MAY or MAY NOT be linked to a client.

**Architecture:** Two subsystems mirroring clients — (1) **Policy Templates** stored in `policyTemplates`, managed at `/settings/policy-template`, with AI assistance; (2) **Policies** with fixed top-level fields (`policyNumber`, `status`, `startDate`, `endDate`, optional `clientId`) plus dynamic `data`. Pre-requisite: extract clients template-builder primitives into a shared `packages/template-builder/` package consumed by both modules.

**Tech Stack:** Convex, Next.js App Router, @dnd-kit, @convex-dev/agent + Gemini 2.5 Flash, shadcn/ui, TanStack Table, Sonner, date-fns, lucide-react, unpdf.

**Design Document:** `docs/plans/2026-04-25-policies-module-design.md`
**Reference Plan:** `docs/plans/2026-04-16-clients-module-plan.md` (every "replicate clients Task X.Y" below means: read that task and apply the same structure to `policies` / `policyTemplates`)

---

## Phase 0 · Refactor: shared `packages/template-builder/`

> Pre-requisite. We do this before any policies code so we don't ship duplicated DnD/UI logic.

### Task 0.1 · Inventory shared vs entity-specific code

**Files (read-only):**

- `packages/clients/types.ts`
- `packages/clients/components/template-builder/*.tsx`
- `packages/clients/components/dynamic-field.tsx`
- `packages/clients/components/client-stepper.tsx`
- `packages/clients/components/table/*.tsx`

**Step 1:** Classify every file as **generic** (entity-agnostic) or **client-specific**.
**Step 2:** Document the cut line in a short note inside the moved files (one-line JSDoc explaining "lives here because shared by clients + policies").
**Step 3:** No commit — this is just a planning step.

### Task 0.2 · Move generic primitives

**Files:**

- Create: `packages/template-builder/types.ts` (move from `packages/clients/types.ts` everything except `ClientData`)
- Create: `packages/template-builder/components/field-palette.tsx`
- Create: `packages/template-builder/components/field-config-panel.tsx`
- Create: `packages/template-builder/components/template-canvas.tsx`
- Create: `packages/template-builder/components/section-tabs.tsx`
- Create: `packages/template-builder/components/dynamic-field.tsx`
- Create: `packages/template-builder/components/dynamic-stepper.tsx` (rename of `client-stepper.tsx`, drop "client" from name)
- Create: `packages/template-builder/lib/cell-renderers.tsx` (move generic cell renderers from `packages/clients/components/table/`)

**Step 1:** Copy each file to the new location. Strip out `useClientId`, `useGetClientTemplate`, etc. Components must take `sections`, `values`, callbacks as props — no Convex hooks inside.
**Step 2:** Add `packages/template-builder/components/template-builder-shell.tsx` — the generic header + DnD context + canvas + palette wrapper. Takes `{ sections, onChange, onSave, isSaving, isDirty, title, editPermission, aiPermission, onOpenAi }` as props.
**Step 3:** Verify with `bun run lint` and `bun run typecheck` (or `next build`).
**Step 4:** Commit:

```
[REFACTOR] Extract generic template-builder primitives to packages/template-builder
```

### Task 0.3 · Rewire clients to consume the shared package

**Files:**

- Modify: `packages/clients/types.ts` (re-export shared types + keep `ClientData`)
- Modify: `packages/clients/components/template-builder/template-builder.tsx` (becomes a thin wrapper that injects clients-specific hooks into `<TemplateBuilderShell />`)
- Modify: `packages/clients/components/dynamic-field.tsx` (re-export from shared)
- Modify: `packages/clients/components/client-stepper.tsx` (re-export the renamed `dynamic-stepper`)
- Modify: `packages/clients/components/table/*.tsx` (consume shared cell renderers)
- Modify: every importer found via grep (`@/packages/clients/types` → `@/packages/template-builder/types` where the type is not entity-specific)

**Step 1:** Edit imports across the repo. Run `grep -rn "from \"@/packages/clients/types\"" .` and update.
**Step 2:** Re-run the clients QA happy path manually (template builder loads, save persists, new client creation works, list renders dynamic columns).
**Step 3:** Commit:

```
[REFACTOR] Wire clients module to packages/template-builder
```

### Task 0.4 · Verify nothing regressed

**Step 1:** `bun run typecheck`
**Step 2:** `bun run lint`
**Step 3:** Run `bun dev` + Convex; smoke test clients module (template builder, new client, list, detail).
**Step 4:** No commit unless fixes are needed.

---

## Phase 1 · Schema, permissions, backend

### Task 1.1 · Add new permissions

**Files:**

- Modify: `convex/lib/permissions.ts`
- Modify: `docs/PERMISSIONS.md` (§3 schema and §4.2 Member defaults)

**Step 1:** Add `policyTemplates_view: v.boolean()` and `policyTemplates_edit: v.boolean()` to `permissionsSchema`. Add the same keys to `memberPermissionDefaults` with `view: true, edit: false`.
**Step 2:** Update `docs/PERMISSIONS.md` to list the two new keys (insert under "Client templates" block in §3 and §4.2).
**Step 3:** Commit:

```
[FEAT] Add policyTemplates permissions
```

### Task 1.2 · Schema changes for `policies` + new `policyTemplates`

**Files:**

- Modify: `convex/schema.ts`

**Step 1:** Add a `policyTemplates` table with the same `templateSection`/`templateField` validators already declared at the top of the file:

```ts
policyTemplates: defineTable({
  companyId: v.id("companies"),
  sections: v.array(templateSection),
}).index("companyId", ["companyId"]),
```

**Step 2:** Replace the current `policies` definition with the dynamic shape (see design §2.2). Keep every legacy column **optional** so existing rows don't break:

```ts
policies: defineTable({
  policyNumber: v.string(),
  companyId: v.id("companies"),
  clientId: v.optional(v.id("clients")),
  status: v.union(
    v.literal("active"),
    v.literal("expired"),
    v.literal("canceled"),
    v.literal("pending"),
  ),
  startDate: v.number(),
  endDate: v.number(),
  templateId: v.optional(v.id("policyTemplates")),
  data: v.optional(v.any()),
  parentPolicyId: v.optional(v.id("policies")),
  isParentPolicy: v.optional(v.boolean()),

  // Legacy rigid columns kept optional for backwards compat (read-only).
  insuredName: v.optional(v.string()),
  insuredIdNumber: v.optional(v.string()),
  beneficiaryName: v.optional(v.string()),
  beneficiaryIdNumber: v.optional(v.string()),
  policyHolderName: v.optional(v.string()),
  policyHolderIdNumber: v.optional(v.string()),
  policyType: v.optional(v.string()),
  riskDescription: v.optional(v.string()),
  issueDate: v.optional(v.number()),
  premiumAmount: v.optional(v.number()),
  issuanceExpenses: v.optional(v.number()),
  taxes: v.optional(v.number()),
  totalAmount: v.optional(v.number()),
  observations: v.optional(v.string()),
  agentName: v.optional(v.string()),
  insurer: v.optional(v.string()),
  lineOfBusiness: v.optional(v.string()),
  isRenewal: v.optional(v.boolean()),
  isRenewable: v.optional(v.boolean()),
  commissionPercentage: v.optional(v.number()),
  participation: v.optional(v.number()),
  totalCommission: v.optional(v.number()),
})
  .index("companyId", ["companyId"])
  .index("companyId_status", ["companyId", "status"])
  .index("companyId_endDate", ["companyId", "endDate"])
  .index("clientId", ["clientId"])
  .index("parentPolicyId", ["parentPolicyId"])
  .searchIndex("search_policyNumber", {
    searchField: "policyNumber",
    filterFields: ["companyId"],
  }),
```

**Step 3:** Run `npx convex dev --once`. Resolve any `id("policies")` callers that broke.
**Step 4:** Commit:

```
[FEAT] Reshape policies + add policyTemplates schema
```

### Task 1.3 · Errors, hooks, types, params

Replicate the following clients tasks for policies, file-by-file (same content, swap nouns):

- **clients Task 1.3 → policies:** create `convex/errors/policies.ts`.
- **clients Task 1.7 → policies:** create `packages/policies/types.ts` (re-export from `@/packages/template-builder/types`, add `PolicyData`).
- **clients Task 1.8 → policies:** create `packages/policies/hooks/use-policy-id.ts`.

**Commit after each:**

```
[FEAT] Add policy error messages
[FEAT] Add policies module types
[FEAT] Add usePolicyId param hook
```

### Task 1.4 · Backend — `convex/policyTemplates.ts`

**Files:**

- Create: `convex/policyTemplates.ts`

**Step 1:** Copy `convex/clientTemplates.ts` as the starting point. Replace every reference to `clientTemplates` table → `policyTemplates`, every `clientErrors` → `policyErrors`, every `clientTemplates_*` permission → `policyTemplates_*`. Keep the same auth + permission gates and the `clients_view || clientTemplates_view` pattern (now `policies_view || policyTemplates_view` for the read query).
**Step 2:** Validate the four fixed fields exist in `save`: `field_policyNumber`, `field_status`, `field_startDate`, `field_endDate` (analogous to clients' `field_name` / `field_identificationNumber`).
**Step 3:** `npx convex dev --once`.
**Step 4:** Commit:

```
[FEAT] Add policyTemplates backend (save, getByCompany)
```

### Task 1.5 · Backend — `convex/policies.ts`

**Files:**

- Modify: `convex/policies.ts` (currently does not exist, but the rigid `policies` table did — make sure we are not deleting another file by mistake)

**Step 1:** Mirror `convex/clients.ts` structure. Mutations: `create`, `update`, `remove`, `renew` (creates a new linked policy), `cancel` (sets `status = "canceled"`). Queries: `getByCompany` (paginated + search), `getById`, `getDueSoon` (vencimiento próximo, used by dashboard later).
**Step 2:** `create` and `update` extract `field_policyNumber`, `field_status`, `field_startDate`, `field_endDate` from `data` and write them both to the top-level columns AND keep them in `data`. Validate `endDate >= startDate`.
**Step 3:** Permission gates: `policies_create`, `policies_edit`, `policies_delete`, `policies_renew`, `policies_cancel`. Use `populateMember` + `checkPermission` exactly as clients does.
**Step 4:** File cleanup on `remove`: same logic as clients (read template, find file/image fields, delete storage IDs).
**Step 5:** `getById` returns historical template sections AND `resolvedFiles` (see clients pattern).
**Step 6:** `npx convex dev --once`.
**Step 7:** Commit:

```
[FEAT] Add policies CRUD backend
```

### Task 1.6 · Frontend API hooks

**Files:**

- Create or modify: `packages/policies/api.ts`

**Step 1:** Add hooks following the same pattern as `packages/clients/api.ts`:

```ts
useGetPolicyTemplate, useSavePolicyTemplate
useCreatePolicy, useUpdatePolicy, useRemovePolicy
useRenewPolicy, useCancelPolicy
useGetPoliciesByCompany, useGetPolicyById
```

**Step 2:** Commit:

```
[FEAT] Add policies and template API hooks
```

---

## Phase 2 · Template Builder UI for Policies

### Task 2.1 · Wrapper + page

**Files:**

- Create: `packages/policies/components/template-builder/template-builder.tsx`
- Create: `app/(app)/companies/[companyId]/settings/policy-template/page.tsx`

**Step 1:** The wrapper is a thin file that:
1. Loads the active template via `useGetPolicyTemplate`.
2. Provides `defaultSections` for policies (see design §3 for the five default sections and four fixed field IDs).
3. Renders `<TemplateBuilderShell title="Plantilla de Pólizas" editPermission="policyTemplates_edit" aiPermission="policies_useAI" ... />` from `packages/template-builder`.
**Step 2:** Page is a 4-line component rendering the wrapper.
**Step 3:** Commit:

```
[FEAT] Add policy template builder
```

### Task 2.2 · AI modal for policy template

**Files:**

- Create: `packages/policies/components/template-builder/template-ai-modal.tsx`

**Step 1:** Mirror clients' `template-ai-modal.tsx`. Wire to `policyActions.generateFromDoc` and `policyActions.reviewTemplate` (created in Phase 4).
**Step 2:** Until Phase 4 lands, leave the modal disabled with a "próximamente" state, OR skip this task and pick it up in Phase 4. Recommended: skip now, do in Phase 4.

---

## Phase 3 · Policy CRUD UI

### Task 3.1 · ClientPicker for the policy form

**Files:**

- Create: `packages/policies/components/client-picker.tsx`

**Step 1:** Combobox-style picker that searches `clients.getByCompany` (existing) and lets the user pick one OR toggle "Sin cliente asociado". Emits `clientId | null`.
**Step 2:** Read-only mode reads `clientId` and resolves the name via `useGetClientById`.
**Step 3:** Commit:

```
[FEAT] Add ClientPicker for policy form
```

### Task 3.2 · New policy page

**Files:**

- Modify: `app/(app)/companies/[companyId]/policies/new/page.tsx` (currently renders the static `PolicyForm`)

**Step 1:** Rewrite as the clients new page, swapping nouns:
1. Load active policy template.
2. If no template → show "Configura la plantilla de pólizas primero" with link to settings.
3. State: `values`, `clientId`.
4. Header card: `<ClientPicker />`.
5. Below: `<DynamicStepper sections={template.sections} values={values} onChange={onChange} />`.
6. AI extraction toast on file upload (Phase 4).
7. Save extracts the four fixed fields and calls `useCreatePolicy({ ...fixed, clientId, templateId, data: values })`. Redirect to detail.
**Step 2:** Permission gate: `policies_create`.
**Step 3:** Commit:

```
[FEAT] Dynamic new-policy page
```

### Task 3.3 · Detail / edit page

**Files:**

- Create: `app/(app)/companies/[companyId]/policies/[policyId]/page.tsx`

**Step 1:** Mirror clients detail page structure. Load via `useGetPolicyById`.
**Step 2:** Add a fallback render: if `policy.templateId` is null, render the legacy `PolicyForm` read-only with a banner: "Esta póliza fue creada antes del sistema de plantillas. Convertir a plantilla actual" (button calls a new `policies.convertToTemplate` mutation — out of scope for this phase, link to a follow-up).
**Step 3:** Header buttons:
- "Editar" / "Guardar" toggle (`policies_edit`)
- "Renovar" (`policies_renew`)
- "Cancelar" (`policies_cancel`, with confirm)
- "Eliminar" (`policies_delete`, with confirm)
**Step 4:** Commit:

```
[FEAT] Policy detail/edit page
```

### Task 3.4 · List page

**Files:**

- Modify: `app/(app)/companies/[companyId]/policies/page.tsx`
- Create: `packages/policies/components/table/policy-columns.tsx`
- Create: `packages/policies/components/table/policy-data-table.tsx`
- Create: `packages/policies/components/table/policy-actions.tsx`

**Step 1:** Replicate the clients list page architecture. Fixed columns: `policyNumber`, `status` (badge with the same color logic as `policy-status-picker.tsx`), client name (resolved via `clientId` or "—"), `startDate`, `endDate`, "Días restantes" computed.
**Step 2:** Dynamic columns from template `showInTable: true` fields.
**Step 3:** Toolbar filters: `status` chip, "Próximas a vencer (60 días)" toggle.
**Step 4:** Search input → `useGetPoliciesByCompany` with `search` arg (search index on `policyNumber`).
**Step 5:** Row click → detail.
**Step 6:** Commit:

```
[FEAT] Dynamic policy list with filters and search
```

### Task 3.5 · Sidebar nav

**Files:**

- Modify: `packages/companies/components/company-sidebar.tsx` (or wherever the policies link currently lives)

**Step 1:** Add a "Plantilla" sub-link under the "Pólizas" section, gated by `policyTemplates_view`. Icon: `Settings2` (matches the brand convention for company config).
**Step 2:** Commit:

```
[FEAT] Add policy template link to sidebar
```

---

## Phase 4 · AI

### Task 4.1 · Add `policyAgent`

**Files:**

- Modify: `convex/agents.ts`

**Step 1:** Add a `policyAgent` next to `clientAgent` with policy-flavored instructions. Same model (`gemini-2.5-flash`).
**Step 2:** Commit:

```
[FEAT] Add policy AI agent
```

### Task 4.2 · `convex/policyActions.ts`

**Files:**

- Create: `convex/policyActions.ts` with `"use node"` at the top.

**Step 1:** Mirror `convex/clientActions.ts`. Three actions: `generateFromDoc`, `reviewTemplate`, `extractFromDoc`. Permission gate: `policies_useAI`.
**Step 2:** Commit:

```
[FEAT] Add policy AI actions
```

### Task 4.3 · Wire AI in builder + form

**Files:**

- Modify: `packages/policies/components/template-builder/template-builder.tsx` (enable AI modal)
- Create: `packages/policies/components/template-builder/template-ai-modal.tsx` (if skipped in 2.2)
- Modify: `packages/template-builder/components/dynamic-field.tsx` — already supports the AI extraction toast pattern; just pass through the policies-specific extractor in the new policy page.
- Modify: `app/(app)/companies/[companyId]/policies/new/page.tsx`
- Modify: `app/(app)/companies/[companyId]/policies/[policyId]/page.tsx`
- Modify: `packages/policies/api.ts` — add `useExtractPolicyFromDoc`, `useGeneratePolicyTemplateFromDoc`, `useReviewPolicyTemplate`.

**Step 1:** End-to-end smoke: upload a sample contract PDF → verify autofill works.
**Step 2:** Commit (one or two commits depending on scope):

```
[FEAT] Wire AI extraction and template assistance for policies
```

---

## Phase 5 · Polish & QA

### Task 5.1 · QA plan for the policies module

**Files:**

- Create: `docs/qa/policies.md` from `docs/qa/_template.md`. Include scenarios mirroring `docs/qa/clients.md` plus:
  - Policy without `clientId` (path that proves the optional linkage)
  - Renewal flow (parent → child)
  - Cancel flow
  - Legacy policy detail (fallback form)
- Update `docs/qa/README.md` index entry from "⏳ pendiente" to "✅ documentado".

**Step 1:** Commit:

```
[DOCS] QA plan for policies module
```

### Task 5.2 · Final regression

**Step 1:** `bun run typecheck` + `bun run lint`.
**Step 2:** Manual smoke: clients template builder still works, policy template builder works, new policy w/o client works, new policy with client works, renewal, cancel, detail edit, list filters.
**Step 3:** Open a QA session per `docs/qa/README.md` Regla cero → file findings only, no in-session fixes.

---

## Phase Summary

| Phase | Delivers | Depends on |
|-------|----------|------------|
| **0** | Shared `packages/template-builder/` consumed by clients (no behavior change) | Nothing |
| **1** | Schema + permissions + backend for policies and policyTemplates | 0 |
| **2** | Template builder UI for policies | 0, 1 |
| **3** | New / detail / list / sidebar — full CRUD UI for policies | 0, 1, 2 |
| **4** | AI generation, review, extraction for policies | 0, 1, 2, 3 |
| **5** | QA plan + regression | All |

After Phase 0: clients keeps working; the codebase is now DRY for future template-driven entities.
After Phase 1: policy data layer is dynamic and indexed.
After Phase 2: an admin can author the policy form template.
After Phase 3: agencies can create, view, edit, list, renew, cancel policies — with or without an attached client.
After Phase 4: AI accelerates template authoring and data entry.
After Phase 5: regression done, QA plan written.
