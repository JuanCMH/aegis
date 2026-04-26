# Quotes Module Overhaul · Implementation Plan

> Companion to `docs/plans/2026-04-25-quotes-module-design.md`. Phases land as **atomic commits**; no phase merges until its `bun run typecheck` + `bun run lint` are clean.

**Reference patterns:** `docs/plans/2026-04-16-clients-module-plan.md`, `docs/plans/2026-04-25-policies-module-plan.md`.

---

## Phase 0 · Inventory ✅ (done)

Read schema, backend, package, pages, errors. Findings logged in design doc §1.

---

## Phase 1 · Schema + backend (zero UI changes)

> Goal: prepare DB and server APIs without breaking the live UI. Old endpoints keep working.

### Task 1.1 · Schema additions

**Files:** `convex/schema.ts`

- Add literal union `quoteStatus` (draft/sent/accepted/rejected/expired/converted).
- Add to `quotes` (all `v.optional`): `clientId`, `policyId`, `status`, `quoteNumber`, `notes`, `sentAt`, `acceptedAt`, `rejectedAt`, `convertedAt`.
- Indexes: `clientId`, `policyId`, `companyId_status`.
- Search indexes: `search_contractor` and `search_contractee` filterable by `companyId, status`.

**Verify:** `bunx convex dev` regenerates `_generated/api.d.ts` cleanly.

### Task 1.2 · Errors map

**Files:** `convex/errors/quotes.ts`

- Add: `invalidStatusTransition`, `bondsRequiredToSend`, `templateRequiredToConvert`, `policyTemplateMissing`, `clientNotFound`, `policyAlreadyExists`.

### Task 1.3 · Backend refactor — search/paginate + filtros avanzados

**Files:** `convex/quote.ts`

Nueva query `searchByCompany` (reemplaza `getByCompany`):
```ts
args: {
  companyId: v.id("companies"),
  paginationOpts: paginationOptsValidator,
  searchTerm: v.optional(v.string()),
  searchField: v.optional(v.union(v.literal("contractor"), v.literal("contractee"))),
  status: v.optional(quoteStatus),
  clientId: v.optional(v.id("clients")),
  quoteType: v.optional(v.union(v.literal("bidBond"), v.literal("performanceBonds"))),
  dateFrom: v.optional(v.number()),
  dateTo: v.optional(v.number()),
}
```

Lógica de selección:
- Si `searchTerm` y `searchField` → `withSearchIndex("search_<field>", q => q.search(field, term).eq("companyId", id).eq("status", status?))`.
- Elif `clientId` → `withIndex("clientId")`.
- Elif `status` → `withIndex("companyId_status")`.
- Else → `withIndex("companyId")`.
- Después aplicar `.filter()` por `quoteType`, `dateFrom`, `dateTo`.
- Siempre `.order("desc").paginate(paginationOpts)`. Adjuntar `documentUrl`.

Agregar `getByClient(clientId, paginationOpts)` para uso futuro.

### Task 1.4a · Backend stats del período

**Files:** `convex/quote.ts`

Nueva query `getCompanyStats({ companyId, dateFrom?, dateTo? })`:
- `withIndex("companyId")` + filtro por rango.
- Devuelve `{ total, totalContractValue, byStatus, convertedCount, conversionRate }`.
- No paginada.

### Task 1.4b · Status transitions

**Files:** `convex/quote.ts`

- `setStatus({ id, status })`:
  - Matriz: `draft↔sent`, `sent→accepted|rejected|expired`, `accepted→sent|converted` (converted solo via convertToPolicy), `rejected|expired→draft`, `converted` terminal.
  - `→ sent` requiere amparos válidos.
  - Setea `*At` correspondiente.
- `create`: acepta `status` (default `draft`), `clientId?`, `notes?`. Si `draft` permite `quoteBonds: []`. **Auto-genera `quoteNumber`** `COT-YYYY-NNNN` (counter por compañía+año).
- `update`: acepta `status`, `clientId?`, `notes?`, `quoteNumber?` (override). Revalida amparos al pasar a `sent`.

### Task 1.5 · `convertToPolicy` (estricto)

**Files:** `convex/quote.ts`, `convex/lib/quote-to-policy.ts`

- Mutation `convertToPolicy({ quoteId, policyNumber, templateId? })`:
  - Permisos: `quotes_edit` AND `policies_create`.
  - **Reject si `status !== "accepted"`** → `invalidStatusTransition`.
  - Carga template (provided o default). Si no existe → `policyTemplateMissing`.
  - Build póliza: top-level (`policyNumber`, `status="active"`, fechas, `clientId`) + `data` con prefill por matching de nombre (mapa en helper).
  - Insert policy → patch quote (`policyId`, `status="converted"`, `convertedAt`).
  - Return `{ policyId }`.

### Task 1.6 · Hooks (api.ts)

**Files:** `packages/quotes/api.ts`

- Add: `useSearchQuotes` (`usePaginatedQuery`), `useGetQuotesByClient`, `useGetQuoteCompanyStats`, `useSetQuoteStatus`, `useConvertQuoteToPolicy`.
- Keep: `useGetQuoteById`, `useCreateQuote`, `useUpdateQuote`, `useRemoveQuote`, `useGetQuoteFromDoc`.
- Remove: `useGetQuotesByCompany`.

**Commit:**
```
[FEAT] Quotes: schema + backend overhaul (status, links, search, pagination, convert-to-policy)
```

---

## Phase 2 · Shared UI primitives

### Task 2.1 · Status meta + badge
**Files:** `packages/quotes/lib/quote-status-meta.ts`, `packages/quotes/components/quote-status-badge.tsx`.

### Task 2.2 · Status segmented filter
**Files:** `packages/quotes/components/quote-status-filter.tsx`. Mirror `policy-status-filter`.

### Task 2.3 · Search input dual
**Files:** `packages/quotes/components/quote-search-input.tsx`.
- Input + dropdown lateral (`Contratista | Contratante`, default contratista).
- Debounced 300ms. Atajo `/`.
- Emite `{ term, field }`.

### Task 2.4 · Advanced filters popover
**Files:** `packages/quotes/components/quote-advanced-filters.tsx`.
- Trigger: botón `[Filtros ▾]` con badge counting.
- Popover: tabs Período (Mes / Rango / Sin filtro) + ClientPicker + radio Tipo.
- `Aplicar` / `Limpiar`. Estado interno hasta `Aplicar`.

### Task 2.5 · Period summary card
**Files:** `packages/quotes/components/quote-period-summary.tsx`.
- Consume `useGetQuoteCompanyStats`.
- Layout: count + total contractValue + converted count + barra de tasa de conversión.

### Task 2.6 · Client link picker
**Files:** `packages/quotes/components/client-link-picker.tsx`. Wrapper de `ClientPicker`.

### Task 2.7 · Quote type toggle XL
**Files:** `packages/quotes/components/quote-type-toggle.tsx`.
- Dos cards seleccionables (Seriedad / Cumplimiento) con icono + descripción.
- Confirm con `useConfirm` cuando se cambia con datos.

### Task 2.8 · Progress stepper
**Files:** `packages/quotes/components/quote-progress-stepper.tsx`, `packages/quotes/lib/quote-completion.ts`.
- `computeCompletionSteps(values)` → `{ tipo, partes, contrato, amparos }`.
- Stepper con chips horizontales + scroll-to-section.

### Task 2.9 · Bond defaults
**Files:** `packages/quotes/lib/bond-period-defaults.ts`, `packages/quotes/lib/bond-rate-defaults.ts`.
- Period: nombre canónico → meses extra.
- Rate: nombre canónico → tasa default.
- `matchBondName(name)` normaliza.

### Task 2.10 · Types
**Files:** `packages/quotes/types.ts`. Export `QuoteStatus`, `QuoteSummary`, `QuoteFormValues`, `QuoteCompletionStep`, `QuoteAdvancedFilterState`.

**Commit:**
```
[FEAT] Quotes: shared UI primitives (status, dual search, advanced filters, period summary, type toggle, stepper, bond defaults)
```

---

## Phase 3 · List page overhaul

### Task 3.1 · Mobile card

**Files:** `packages/quotes/components/cards/quote-card.tsx`

- Mirror `client-card.tsx`. Header: contractor + status badge. Body: contractValue, dates, contract type. Footer: actions menu.

### Task 3.2 · Data table refactor

**Files:**
- `packages/quotes/components/table/quote-data-table.tsx` (rewrite)
- `packages/quotes/components/table/quote-column.tsx` (add status + cliente columns; remove `info` popover column — moved to expandable row or kept as last action)
- `packages/quotes/components/table/quote-actions.tsx` (add Cambiar estado submenu + Convertir a póliza)

- Cursor pagination via `usePaginatedQuery`.
- Column visibility persisted at `aegis:quotes:columns:<companyId>`.
- IntersectionObserver auto-load.
- Empty state polished.

### Task 3.3 · Page rewrite

**Files:** `app/(app)/companies/[companyId]/quotes/page.tsx`

- Header `h-12` + `SidebarTrigger`.
- Top row: `<QuoteSearchInput />` (dual) + `<QuoteStatusFilter />` + `<QuoteAdvancedFilters />` + `Nueva cotización`.
- Debajo: chips de filtros activos con ✕ por chip + `Limpiar todo`.
- Si hay período activo → `<QuotePeriodSummary />` encima de la tabla.
- Responsive split: cards mobile, table `md+`.
- Reemplaza `useGetQuotesByCompany` por `useSearchQuotes`.
- Estado de filtros memoizado en `useQuoteFilters`.

**Commit:**
```
[FEAT] Quotes: paginated list with dual search, advanced filters, period summary, mobile cards
```

---

## Phase 4 · Form overhaul (create + edit) — "top mundial"

> Ver design doc §3.9 para layout completo. Reemplaza `ContractInfo + QuoteInfo (tabs)` por form único con secciones, sticky results y stepper.

### Task 4.1 · `BondAmountControls` (% ↔ valor)
**Files:** `packages/quotes/components/form-sections/bond-amount-controls.tsx`.
- Inputs duales `%` ↔ `$` sincronizados vía `contractValue`.
- Hint si `contractValue === 0`.

### Task 4.2 · `PartiesSection`
**Files:** `packages/quotes/components/form-sections/parties-section.tsx`.
- Sub-cards lado a lado con iconos `User` / `Building2`.
- Badge `Desde cliente` si `clientLinked`.

### Task 4.3 · `ContractSection`
**Files:** `packages/quotes/components/form-sections/contract-section.tsx`.
- Grid 4-col (tipo con datalist, valor, inicio, fin) + textarea objeto full-width.
- Validación reactiva de fechas.

### Task 4.4 · `BidBondCard`
**Files:** `packages/quotes/components/form-sections/bid-bond-card.tsx`.
- Período + chip `[Mismas fechas que el contrato]`.
- `<BondAmountControls/>`, tasa con sugerencia clickeable.
- Prima inline.

### Task 4.5 · `PerformanceBondPicker` + `PerformanceBondCard`
**Files:**
- `packages/quotes/components/form-sections/performance-bond-picker.tsx`
- `packages/quotes/components/form-sections/performance-bond-card.tsx`

- Picker: chips por categoría click-to-add con scroll/focus.
- Card: estructura de bid + chips `+12m | +36m | +60m` + botón eliminar (X).
- Toast `Deshacer` 5s al eliminar.

### Task 4.6 · `BondsSection` (dispatcher)
**Files:** `packages/quotes/components/form-sections/bonds-section.tsx`.
- Despacha según `quoteType`. Empty state.

### Task 4.7 · `ResultsCard` refactor (sticky + breakdown)
**Files:** `packages/quotes/components/results-card.tsx`.
- Sticky `top-16` desktop, sheet con handle en mobile.
- Breakdown por amparo con prima individual.
- Animación fade-highlight al actualizar.

### Task 4.8 · `QuoteForm` shell
**Files:** `packages/quotes/components/quote-form.tsx`.

Layout:
- Header: título + `<QuoteProgressStepper/>` + AI/PDF buttons + indicador autosave.
- Grid `lg:grid-cols-3`:
  - Col 1-2: ① `<QuoteTypeToggle/>` → ② `<ClientLinkPicker/>` → ③ `<PartiesSection/>` → ④ `<ContractSection/>` → ⑤ `<BondsSection/>`.
  - Col 3: `<ResultsCard/>` sticky.
- Footer sticky: `[Guardar borrador]` + `[Cotizar]` (create) o `[Guardar cambios]` (edit).

Estado:
- Form state en `useReducer` o `useState({...QuoteFormValues})`.
- Computa `completion` con `quote-completion.ts`.
- Atajos `Cmd+S` y `Cmd+Enter`.
- Confirm al cambiar `quoteType` con datos.

### Task 4.9 · `QuoteActionsBar` (detalle)
**Files:** `packages/quotes/components/quote-actions-bar.tsx`.
- Botones según status (matriz en design §3.6 y plan Task 1.4b).
- Confirmaciones via `useConfirm` (info/warning/critical apropiado).

### Task 4.10 · New page rewrite
**Files:** `app/(app)/companies/[companyId]/quotes/new/page.tsx`.
- Header h-12 + título + AI/PDF.
- Body: `<QuoteForm mode="create" />`.
- `onQuote` → create con `status="sent"` → redirect a `/<id>`.

### Task 4.11 · Detail page rewrite
**Files:** `app/(app)/companies/[companyId]/quotes/[quoteId]/page.tsx`.
- Eliminar `Toggle` editar inline. Edición permanente si `quotes_edit`.
- `<QuoteForm mode="edit" initial={...} />` + `<QuoteActionsBar />`.
- Tabs: `Documento` (si hay), `Cliente` (si hay), `Póliza` (si hay).
- Read-only si `status="converted"`.

**Commit:**
```
[FEAT] Quotes: unified comfortable form (sectioned layout, sticky results, stepper, % ↔ value, period chips, draft mode)
```

---

## Phase 5 · Convert-to-policy modal

### Task 5.1 · Modal

**Files:** `packages/quotes/components/modals/quote-convert-modal.tsx`

- Form: `policyNumber` (required), `templateId` (selector con `useGetPolicyTemplate`).
- Si no hay template → mostrar CTA `Configurar plantilla` linkeando a `/settings/policy-template`.
- Submit → `useConvertQuoteToPolicy` → toast + redirect.

### Task 5.2 · Wire from QuoteActionsBar

**Files:** `packages/quotes/components/quote-actions-bar.tsx`

- "Convertir a póliza" abre el modal.

**Commit:**
```
[FEAT] Quotes: convert-to-policy workflow
```

---

## Phase 6 · Polish & top-tier feel

### Task 6.1 · Skeletons + empty states

- Replace `Spinner` blocks con `<Skeleton />` rows en table, cards, form load.
- Empty state con ilustración + CTA.

### Task 6.2 · Autosave + redirect silencioso

**Files:** `packages/quotes/lib/use-quote-autosave.ts`, `app/(app)/companies/[companyId]/quotes/new/page.tsx`.

- Hook `useQuoteAutosave({ enabled, values, mode, onCreated, onSaved, delay: 2000 })`:
  - `mode="create"` + primer cambio significativo (algún campo de Partes o Contrato no vacío) → `useCreateQuote({ status: "draft" })` una vez. `onCreated(id)` → page hace `router.replace('/quotes/<id>')`.
  - Con `quoteId` y `status="draft"` → debounce 2s + `useUpdateQuote`. `onSaved(timestamp)` actualiza indicador.
  - Cancela autosave si `status` cambia o desmonta. Skip si `isPending`.
- Indicador `● Guardado hace Xs` discreto en header del form. Click → tooltip con timestamp completo. Sin toasts.

### Task 6.3 · Atajos consolidados

- `/` → focus search en lista.
- `Cmd/Ctrl+S` → `onSaveDraft` en form.
- `Cmd/Ctrl+Enter` → `onQuote` en form (si completion completa) y submit en `<QuoteAgentModal/>`.
- `Esc` → colapsa sección activa en mobile.

### Task 6.4 · DnD reorder amparos (opcional)

Si entra fácil con `@dnd-kit`: drag handle en `<PerformanceBondCard/>`. No bloqueante.

### Task 6.5 · Animaciones sutiles

- Fade-highlight en `<ResultsCard/>` al cambiar valores.
- Slide-in al agregar `<PerformanceBondCard/>`, fade-out al eliminar.

### Task 6.6 · Brand alignment pass

Verificar tokens (`aegis-emerald | aegis-sapphire | aegis-amber | aegis-gold | destructive`).

**Commit:**
```
[FEAT] Quotes: autosave-with-redirect, skeletons, animations, shortcuts, brand polish
```

---

## Phase 7 · QA + docs

### Task 7.1 · QA doc

**Files:** `docs/qa/quotes.md`

Secciones:
1. **Permisos** (5 keys × matriz de escenarios).
2. **Lista**: búsqueda dual (contratista/contratante), status filter, filtros avanzados (período/cliente/tipo), period summary card, paginación cursor, mobile cards, columnas persistidas.
3. **Crear**: standalone, con cliente vinculado, draft sin amparos, draft con amparos parciales, AI extraction, autosave + redirect inmediato.
4. **Form comfort**: stepper de progreso, atajos teclado, control % ↔ valor, chip "mismas fechas", chips +12m/+36m/+60m, sugerencia de tasa, prima inline por amparo, sticky results.
5. **Editar**: cambiar contratante, agregar/eliminar amparos (undo), cambiar cliente vinculado, quitar vínculo, override `quoteNumber`.
6. **Estados**: cada transición permitida + cada intento inválido. Validación amparos al pasar a `sent`.
7. **Convertir a póliza**: solo desde `accepted` (intentar desde otros → bloqueado), con template default, con template explícito, sin template (CTA configurar), sin permiso `policies_create`.
8. **Eliminar**: con documento, sin documento, en estado `converted`.
9. **Regresión**: cotizaciones legacy (sin status/clientId/quoteNumber) se leen como `draft`.

### Task 7.2 · README index

**Files:** `docs/qa/README.md` (si existe) o `docs/README.md`

- Linkear `quotes.md` en el índice.

**Commit:**
```
[DOCS] Quotes: QA plan
```

---

## Phase 8 · Stabilize

- `bun run typecheck` ✓
- `bun run lint` ✓ (biome)
- Smoke manual de los flujos clave.
- Revisar logs de Convex por errores.

No commit a menos que haya fixes.

---

## Commit map (atomic)

1. `[FEAT] Quotes: schema + backend overhaul ...`
2. `[FEAT] Quotes: shared UI primitives ...`
3. `[FEAT] Quotes: paginated list with search ...`
4. `[FEAT] Quotes: unified form with draft mode ...`
5. `[FEAT] Quotes: convert-to-policy workflow`
6. `[FEAT] Quotes: skeletons, autosave drafts, ...`
7. `[DOCS] Quotes: QA plan`

---

## Decisiones (firmadas)

1. **Auto-numeración** `quoteNumber` → **automática server-side** (`COT-YYYY-NNNN`, counter por compañía+año), **editable** vía `update`.
2. **Search** → **dual** sobre `contractor` y `contractee`. UX: input único + toggle (`Contratista | Contratante`) al lado.
3. **Conversión a póliza** → **estricta**: solo cuando `status === "accepted"`. Si está en `draft`/`sent`, el botón muestra hint "Marca como aceptada antes de convertir".
4. **Autosave de borradores** → **sí, en Phase 6** con redirect silencioso desde `/new` a `/<id>` al primer cambio significativo. Indicador `● Guardado hace Xs` (sin toasts).
5. **MonthPicker** → **NO se elimina**. Se mueve a un Popover `Filtros avanzados` (período/cliente/tipo). Encima de la tabla, mini-resumen `<QuotePeriodSummary/>` con count + total contractValue + conversiones cuando hay período activo.
