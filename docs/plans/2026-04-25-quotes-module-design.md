# Quotes Module Overhaul · Design

> **Status:** Draft (pending sign-off)
> **Author:** Aegis core
> **Companion plan:** `docs/plans/2026-04-25-quotes-module-plan.md`

## 1 · Problem

El módulo de cotizaciones fue el primero en construirse y arrastra deuda técnica frente a los módulos posteriores (clientes, pólizas):

| Área | Estado actual | Brecha |
| --- | --- | --- |
| **Vínculo con clientes** | No existe. Se escribe `contractor`/`contractee` a mano. | Una cotización debería poder enlazarse a un cliente existente; o quedar "standalone" (lo que ya funciona hoy). |
| **Vínculo con pólizas** | No existe. Tras cotizar no hay forma de "convertir" la cotización en una póliza. | Necesitamos un *workflow* "Cotización → Póliza" que prefilee la nueva póliza con los datos cotizados. |
| **Schema** | `quotes` solo tiene índice por `companyId`. Sin `search_*`, sin `clientId`, sin `policyId`, sin `status`. | Sin índices de búsqueda no hay paginación + búsqueda al estilo clients/policies. |
| **Backend** | `getByCompany` filtra por mes (`yyyy-MM`) y devuelve **todo el mes en memoria**. Sin paginación. | Conforme la base crezca degrada. Falta `searchByCompany` y `getByClient`. |
| **Estado de la cotización** | No existe. La cotización es estática: se guarda y vive ahí. | Necesitamos `draft | sent | accepted | rejected | converted | expired` para reflejar el flujo real del corredor. |
| **UI lista** | Tabla TanStack con filtro de mes + filtro client-side por contratista. Sin paginación virtual, sin segmented filter, sin tarjetas mobile, sin columnas configurables, sin auto-load. | No respeta los patrones de clients/policies. |
| **UI create/edit** | `ContractInfo` + `QuoteInfo` con dos tabs (Seriedad / Cumplimiento) y `Toggle` editar inline en detalle. AI modal en cabecera. | Funciona, pero se siente "viejo" comparado con clients/policies (un solo formulario, sin segmentación clara, sin client picker, sin atajos). |
| **Validaciones** | Pide `quoteBonds.length > 0` y dates válidas siempre. | El requerimiento explícito del usuario es: *"si quiero crear una cotización sin conectarlo a nada y guardarla, también se debería permitir"*. Hoy ya se puede guardar sin cliente/póliza, pero **no sin amparos**. Mantendremos amparos requeridos a nivel de "emisión", pero permitiremos guardar como `draft` sin amparos completos (ver §3.2). |
| **AI** | `getQuoteFromDoc` extrae contrato + amparos desde PDF. Funciona. | Se mantiene; se reutiliza dentro del nuevo formulario y, además, se podrá extraer **a partir de un cliente ya enlazado** (prefill desde cliente). |

**Objetivo declarado del usuario** (cita literal):
> *"este módulo debe sentirse como un cotizador top mundial."*

## 2 · Principios de diseño

1. **Vínculos opcionales, nunca obligatorios.** `clientId` y `policyId` son `v.optional(v.id(...))`. Standalone sigue funcionando.
2. **Reutilizar todo lo que ya construimos.** `ClientPicker` (de policies), `useFetch`/`useMutate`/`useExecute`, `useConfirm`, segmented filters, mobile cards, columnas localStorage, auto-load IntersectionObserver, `/` shortcut, brand tokens (`aegis-emerald | aegis-sapphire | aegis-amber | aegis-gold | destructive`).
3. **Estados explícitos.** El ciclo de vida de una cotización debe ser observable: `draft → sent → (accepted | rejected | expired) → converted`.
4. **"Top world quoter" feel.** Cálculo en vivo, atajos, autosave de borradores, prefill inteligente desde cliente, "Convertir a póliza" en un click.
5. **Refactor mínimo invasivo.** No tocamos `packages/bonds` (lo usaremos tal cual). Sí refactorizamos `packages/quotes` end-to-end.
6. **Sin migraciones destructivas.** Toda columna nueva entra como `v.optional(...)`. Cotizaciones existentes siguen vivas y se "completan" con defaults al leerlas (`status ?? "draft"`).

## 3 · Cambios propuestos

### 3.1 · Schema (`convex/schema.ts`)

```ts
const quoteStatus = v.union(
  v.literal("draft"),
  v.literal("sent"),
  v.literal("accepted"),
  v.literal("rejected"),
  v.literal("expired"),
  v.literal("converted"),
);

quotes: defineTable({
  // existentes
  contractor: v.string(),
  contractorId: v.string(),
  contractee: v.string(),
  contracteeId: v.string(),
  contractType: v.string(),
  contractValue: v.number(),
  contractStart: v.number(),
  contractEnd: v.number(),
  expenses: v.number(),
  agreement: v.string(),
  calculateExpensesTaxes: v.boolean(),
  quoteType: v.union(v.literal("bidBond"), v.literal("performanceBonds")),
  documentId: v.optional(v.id("_storage")),
  companyId: v.id("companies"),

  // nuevos (todos opcionales para no romper rows existentes)
  clientId: v.optional(v.id("clients")),
  policyId: v.optional(v.id("policies")),       // se llena al "convertir"
  status: v.optional(quoteStatus),              // default "draft" en lectura
  quoteNumber: v.optional(v.string()),          // numeración interna opcional
  notes: v.optional(v.string()),
  sentAt: v.optional(v.number()),
  acceptedAt: v.optional(v.number()),
  rejectedAt: v.optional(v.number()),
  convertedAt: v.optional(v.number()),
})
  .index("companyId", ["companyId"])
  .index("clientId", ["clientId"])
  .index("policyId", ["policyId"])
  .index("companyId_status", ["companyId", "status"])
  .searchIndex("search_contractor", {
    searchField: "contractor",
    filterFields: ["companyId", "status"],
  })
  .searchIndex("search_contractee", {
    searchField: "contractee",
    filterFields: ["companyId", "status"],
  });
```

`quoteBonds` se queda intacto.

### 3.2 · Validación: borradores sin amparos

- En `create` y `update`: si `status === "draft"`, **no** validamos `quoteBonds.length > 0`. Solo validamos al pasar a `sent` o cuando se intenta `convert` a póliza.
- `contractValue > 0` y `contractStart < contractEnd` siguen siendo obligatorios siempre (sin esos datos no hay cotización utilizable).
- Nuevo helper `assertReadyToSend(quote)` que valida amparos completos antes de cambiar a `sent`.

### 3.3 · Backend (`convex/quote.ts`)

**Queries nuevas / refactor:**

| Query/Mutation | Antes | Después |
| --- | --- | --- |
| `getByCompany` | `month: yyyy-MM` filtrado en memoria. | `searchByCompany` paginada (`PaginationOptions`) con `searchTerm`, `searchField: "contractor"|"contractee"`, `status`, `clientId`, `quoteType`, `dateFrom`, `dateTo`. Si nadie filtra cae en index `companyId` con `.paginate()`. Devuelve `{ page, isDone, continueCursor }`. |
| `getById` | igual | igual + adjunta `client?` (lookup por `clientId`) y `policy?` (lookup por `policyId`). |
| `getByClient` | — | nuevo. Devuelve cotizaciones de un cliente (para tab "Cotizaciones" en detalle del cliente — futuro, no bloqueante). |
| `getCompanyStats` | — | nuevo. Acepta `dateFrom?, dateTo?`. Devuelve `{ count, totalContractValue, byStatus, convertedCount }` para el mini-resumen del período. |
| `create` | requiere `quoteBonds`. | acepta `status`, `clientId?`, `notes?`. Si `status === "draft"` permite `quoteBonds: []`. **Genera `quoteNumber` automáticamente** server-side (formato `COT-YYYY-NNNN`, counter por compañía+año, **editable** vía `update`). |
| `update` | reemplaza bonds por delete+insert. | igual + acepta `status`, `clientId?`, `notes?`, `quoteNumber?` (override manual). Si transiciona a `sent` valida amparos. Setea `sentAt`. |
| `setStatus` | — | nueva. Transiciones controladas (`draft↔sent`, `sent→accepted|rejected|expired`, `accepted→converted`, `rejected|expired→draft` para reabrir). |
| `convertToPolicy` | — | nueva. **Mutation**. Solo permitida cuando `quote.status === "accepted"` (estricto). Crea póliza con prefill, enlaza `policyId`, marca `status="converted"`, `convertedAt`. Permisos: `quotes_edit` + `policies_create`. |
| `remove` | igual | igual. |

**Permisos:** los existentes (`quotes_view/create/edit/delete/useAI`) bastan. La conversión a póliza requiere **además** `policies_create`. El gate se verifica server-side y client-side (RoleGate múltiple).

### 3.4 · Frontend — paquete `packages/quotes`

```
packages/quotes/
├── api.ts                                  # +useSearchQuotes, +useGetQuoteCompanyStats, +useSetQuoteStatus, +useConvertQuoteToPolicy
├── types.ts                                # +QuoteStatus, +QuoteSummary, +QuoteFormValues, +QuoteCompletionStep
├── store/
│   └── use-quote-id.ts
├── lib/
│   ├── export-quote-pdf.ts                 # sin cambios de comportamiento
│   ├── export-quote-excel.ts               # idem
│   ├── quote-status-meta.ts                # NUEVO. status → {label, color, icon}
│   ├── quote-completion.ts                 # NUEVO. Calcula pasos completados (Tipo, Partes, Contrato, Amparos)
│   ├── bond-period-defaults.ts             # NUEVO. Vigencias sugeridas por tipo de amparo (anticipo→0, calidad→+12m, salarios→+36m, etc.)
│   └── bond-rate-defaults.ts               # NUEVO. Tasas sugeridas por tipo de amparo
├── components/
│   ├── quote-status-badge.tsx              # NUEVO
│   ├── quote-status-filter.tsx             # NUEVO. Segmented filter
│   ├── quote-search-input.tsx              # NUEVO. Debounced + dual field toggle (contratista/contratante)
│   ├── quote-advanced-filters.tsx          # NUEVO. Popover con MonthPicker/rango, ClientPicker, quoteType
│   ├── quote-period-summary.tsx            # NUEVO. Mini-resumen "Mes X · N cotizaciones · $Y · Z convertidas"
│   ├── client-link-picker.tsx              # NUEVO. Wrapper sobre ClientPicker (vincular / cambiar / quitar)
│   ├── quote-progress-stepper.tsx          # NUEVO. Indicador de pasos completados (header form)
│   ├── quote-type-toggle.tsx               # NUEVO. Toggle visual XL bidBond/performanceBonds (reemplaza tabs)
│   ├── quote-form.tsx                      # NUEVO. Form unificado (ver §3.9)
│   ├── quote-actions-bar.tsx               # NUEVO. Acciones de estado en detalle
│   ├── form-sections/                      # NUEVO subdir — secciones del form
│   │   ├── parties-section.tsx             # Contratista + Contratante (sub-cards con identificación)
│   │   ├── contract-section.tsx            # Tipo, valor, fechas, objeto
│   │   ├── bonds-section.tsx               # Wrapper que despacha a bid o performance
│   │   ├── bid-bond-card.tsx               # Tarjeta del único amparo de seriedad
│   │   ├── performance-bond-picker.tsx     # Chips por categoría click-to-add
│   │   ├── performance-bond-card.tsx       # Tarjeta editable por amparo (con botón "mismas fechas")
│   │   └── bond-amount-controls.tsx        # Input dual % ↔ valor con sincronización bidireccional
│   ├── results-card.tsx                    # REFACTOR. Sticky desktop, breakdown por amparo
│   ├── modals/
│   │   ├── quote-agent-modal.tsx           # sin cambios
│   │   └── quote-convert-modal.tsx         # NUEVO
│   ├── cards/
│   │   └── quote-card.tsx                  # NUEVO. Mobile card lista
│   └── table/
│       ├── quote-data-table.tsx            # REFACTOR. Paginación + auto-load + columnas localStorage
│       ├── quote-column.tsx                # REFACTOR. +Estado, +Cliente, +Número
│       ├── quote-actions.tsx               # REFACTOR. +Cambiar estado, +Convertir
│       └── quote-popover.tsx               # sin cambios
```

### 3.5 · Páginas (`app/(app)/companies/[companyId]/quotes/`)

```
quotes/
├── page.tsx           # REFACTOR completo. Header h-12 + status filter + search + Nueva cotización + tabla/cards.
├── new/
│   └── page.tsx       # REFACTOR. Usa <QuoteForm/>. Botón "Vincular cliente" (opcional). Botón "Guardar borrador" + "Cotizar".
└── [quoteId]/
    └── page.tsx       # REFACTOR. <QuoteForm/> en modo edición + <QuoteActionsBar/> + tabs Resumen/Bono(s)/Documento/Cliente/Póliza.
```

### 3.6 · Flujo "Convertir a póliza" (estricto)

**Pre-condición:** la cotización debe estar en `status === "accepted"`. Si está en `draft`/`sent`, el botón muestra hint "Marca la cotización como aceptada antes de convertir". Esto preserva el ciclo de vida real (cotizo → envío → aceptan → emito).

1. Usuario en detalle, `status="accepted"` → click `Convertir a póliza`.
2. Abre `<QuoteConvertModal/>` con:
   - Resumen del prefill (contractor → tomador, contractee → asegurado, contractValue, fechas, clientId si existe).
   - Selector de plantilla de póliza (`useGetPolicyTemplate({ companyId })`).
   - Campo `policyNumber` (libre, requerido).
   - Si la company no tiene template → CTA "Configurar plantilla" linkeando a `/settings/policy-template`.
3. Submit → `quotes.convertToPolicy({ quoteId, policyNumber, templateId })`:
   - Verifica `status === "accepted"` server-side.
   - Crea póliza (`status="active"`, prefill por nombres de campo).
   - Patch cotización: `policyId`, `status="converted"`, `convertedAt`.
4. Toast + redirect a `/companies/.../policies/<newPolicyId>`.
5. La cotización convertida queda inmutable (solo lectura) con badge `Convertida` y link directo a la póliza.

### 3.7 · Flujo "Vincular cliente" (en create/edit)

1. En el header de `<QuoteForm/>`, badge: "Sin cliente" o "Cliente: <nombre>".
2. Click → abre `<ClientPicker/>` (ya existe).
3. Al elegir cliente: prefill `contractor`, `contractorId`, `contracteeId` (si aplica) **solo si los campos están vacíos**. Nunca pisa lo escrito por el usuario.
4. Hay botón "Quitar cliente" para volver a standalone.

### 3.8 · Estado y "feel top mundial"

- **Cálculos en vivo** (ya en bonds-package, se conservan; agregamos breakdown por amparo).
- **Atajos**: `/` enfoca búsqueda en lista; `Cmd/Ctrl+S` guarda borrador en form; `Cmd/Ctrl+Enter` cotiza (si todo válido); `Cmd/Ctrl+Enter` en modal AI extrae; `Esc` colapsa sección activa en mobile.
- **Auto-save con redirect inmediato**: en `/quotes/new`, al primer cambio significativo (cualquier campo de Partes o Contrato no vacío) crea `draft` server-side y hace `router.replace('/quotes/<id>')` silencioso. A partir de ahí, autosave debounced 2s mientras `status === "draft"`. Indicador discreto junto al título: `● Guardado hace 2s` (gris pequeño). Sin toasts agresivos.
- **Empty states** con ilustración mínima + CTA `Nueva cotización`.
- **Skeleton loaders** consistentes con clients/policies.
- **Status badges** con tokens:
  - `draft` → `bg-muted text-foreground` + icon `FileText`
  - `sent` → `bg-aegis-sapphire/10 text-aegis-sapphire` + icon `Send`
  - `accepted` → `bg-aegis-emerald/10 text-aegis-emerald` + icon `CheckCircle2`
  - `rejected` → `bg-destructive/10 text-destructive` + icon `XCircle`
  - `expired` → `bg-aegis-amber/10 text-aegis-amber` + icon `Clock`
  - `converted` → `bg-aegis-gold/10 text-aegis-gold` + icon `ShieldCheck`

### 3.9 · Formulario: estructura y UX detallada

Objetivo: que el corredor capture una cotización completa **sin pensar dónde está cada cosa** y con el menor número de tecleos posibles.

#### 3.9.1 · Layout

**Desktop (`lg+`):** grid de 3 columnas. Form ocupa 2/3, `<ResultsCard/>` sticky a la derecha 1/3.

```
┌──────────────────────────────────────┬──────────────┐
│  Header: título · stepper · acciones │  RESUMEN      │
├──────────────────────────────────────┤  FINANCIERO   │
│  ① Tipo de cotización (toggle XL)    │  (sticky)     │
│  ② Vínculo con cliente (opcional)    │               │
│  ③ Partes del contrato               │  IVA · Prima  │
│  ④ Datos del contrato                │  Total · Δ    │
│  ⑤ Amparos                           │  Por amparo   │
├──────────────────────────────────────┴──────────────┤
│  Footer sticky: [Guardar borrador] [Cotizar]         │
└─────────────────────────────────────────────────────┘
```

**Mobile (`<lg`):** secciones apiladas en orden idéntico. `<ResultsCard/>` colapsable como sheet inferior con handle. CTA `[Cotizar]` sticky bottom.

#### 3.9.2 · Header del form

- Título: `Nueva cotización` o `Cotización COT-2026-0042`.
- **Stepper de progreso** (`<QuoteProgressStepper/>`): chips horizontales con estado visual:
  - `①  Tipo ✓  ·  ②  Partes ✓  ·  ③  Contrato ·  ④  Amparos`
  - Click en un chip hace scroll-to-section.
  - Estados: pendiente (`text-muted`), en progreso (`text-aegis-sapphire`), completo (`text-aegis-emerald` + check), error (`text-destructive` + alert).
- A la derecha: botón `[✨ AI]` (RoleGate `quotes_useAI`), botón `[📎 PDF]` (adjuntar referencia), indicador `● Guardado hace 2s` cuando aplica.

#### 3.9.3 · Sección ① — Tipo de cotización

- Reemplaza los `<Tabs/>` actuales por **dos cards grandes seleccionables** (radio visual):
  - `Seriedad de la oferta` con icono `Target` — "Garantiza que vas a firmar el contrato si te lo adjudican."
  - `Cumplimiento` con icono `ShieldCheck` — "Garantiza la ejecución del contrato firmado (anticipo, calidad, salarios, etc.)."
- Cambiar tipo en modo edición: confirma con `useConfirm` warning porque resetea amparos.

#### 3.9.4 · Sección ② — Vínculo con cliente

- Estado vacío: card con icono `UserPlus` + texto `Vincula esta cotización a un cliente para acelerar el llenado` + botón `[+ Vincular cliente]` → abre `<ClientPicker/>`.
- Estado vinculado: badge `Cliente: ACME S.A.S.` + botones `Cambiar` / `Quitar vínculo`. Banner sutil: `Los datos del contratista se prefiilaron desde el cliente. Puedes editarlos.`
- Prefill **solo si los campos están vacíos** — nunca pisa data del usuario.
- Sección colapsable; si no hay cliente, queda compacta como un solo botón.

#### 3.9.5 · Sección ③ — Partes del contrato

Dos sub-cards lado a lado en desktop, apiladas en mobile:

```
┌─ AFIANZADO/CONTRATISTA ──┐  ┌─ ASEGURADO/CONTRATANTE ─┐
│ Nombre*                  │  │ Nombre*                  │
│ Identificación           │  │ Identificación           │
└──────────────────────────┘  └──────────────────────────┘
```

- Inputs con icono lateral (`User` / `Building2`) y label arriba.
- Tab natural: nombre contratista → id contratista → nombre contratante → id contratante.
- Si hay cliente vinculado, sub-card del contratista tiene badge `Desde cliente` (editable, no bloqueado).

#### 3.9.6 · Sección ④ — Datos del contrato

Grid de 4 columnas en desktop:

- Tipo de contrato (free text con datalist sugerencias: "Prestación de servicios", "Obra", "Suministro", "Concesión")
- Valor del contrato* (`<CurrencyInput/>`)
- Inicio* (`<DatePicker/>`)
- Finalización* (`<DatePicker/>`)

Debajo: `Objeto` (textarea), full width, max 200 chars con contador.

Validación en vivo: borde rojo si `start >= end`, mensaje al toque.

#### 3.9.7 · Sección ⑤ — Amparos

**Si tipo === `bidBond`:** un único `<BidBondCard/>` con campos:
- Nombre (default: "Seriedad de la oferta", editable)
- Período: dos DatePickers + chip `[Mismas fechas que el contrato]` (autocompleta).
- Vigencia hasta (opcional, expiryDate)
- **Control dual** `<BondAmountControls/>`: `% del contrato` ↔ `Valor asegurado`. Editar uno actualiza el otro.
- Tasa (%) con sugerencia inline: `Sugerida: 0.15%` (clickable para aplicar).
- **Prima inline:** debajo del card, `Prima estimada: $X.XXX.XXX` actualizada en vivo.

**Si tipo === `performanceBonds`:**
- `<PerformanceBondPicker/>`: chips por categoría arriba `[+ Anticipo] [+ Calidad] [+ Pago salarios] [+ Estabilidad] [+ Manejo correcto]` (lista viene de `useGetBondsByCompany`).
- Click en chip → agrega `<PerformanceBondCard/>` debajo, con scroll automático y focus en el primer campo.
- Cada card:
  - Nombre (heredado del catálogo, editable)
  - Botón `Mismas fechas que el contrato` + ajustes inteligentes (`+ 12 meses`, `+ 36 meses`, `+ 60 meses`) según `bond-period-defaults`.
  - DatePickers inicio/fin
  - `<BondAmountControls/>` dual % ↔ valor
  - Tasa (%) con sugerencia desde `bond-rate-defaults`
  - Botón eliminar (X) arriba a la derecha
  - **Prima inline** debajo
- DnD para reordenar amparos (drag handle, opcional Phase 6).
- Si no hay amparos: card vacía con `Selecciona los amparos a cotizar arriba` + ilustración mínima.

#### 3.9.8 · ResultsCard sticky

- Posición: `sticky top-16` en desktop, dentro de su columna.
- Estructura:
  - Header `Resumen financiero`
  - Lista de amparos con prima individual
  - Subtotal primas
  - Gastos (input editable + switch "Calcular IVA de gastos")
  - IVA 19%
  - **Total** (destacado, font-medium, brand color)
- Animación sutil al actualizar valores (fade highlight).
- En mobile: collapsed sheet con resumen mínimo (solo Total) + handle para expandir.

#### 3.9.9 · Footer de acciones

- Sticky bottom (desktop y mobile).
- Botones:
  - `[Guardar borrador]` (secondary) — siempre habilitado si hay al menos un campo lleno.
  - `[Cotizar]` (primary `aegis-sapphire`) — solo habilitado cuando todos los pasos del stepper están en verde.
  - En modo edición de cotización ya `sent`/`accepted`/etc.: `[Guardar cambios]` único.
- Atajos: `Cmd+S` → guardar borrador / cambios; `Cmd+Enter` → cotizar (si válido).

#### 3.9.10 · Comportamientos transversales

- **Validación reactiva**: borde de cada input refleja estado (`border-input` / `border-destructive` / `border-aegis-emerald`). Tooltips con razón al hover sobre borde rojo.
- **Tab order** estricto y predecible (top-to-bottom, left-to-right).
- **Auto-focus**: al cargar `/quotes/new`, focus en primer campo de Partes (contratista). Al elegir tipo, focus salta al siguiente paso pendiente.
- **Undo de eliminación de amparo**: toast con `[Deshacer]` 5s.
- **Reset confirmado**: cambiar `quoteType` con datos diligenciados muestra confirm antes de borrar amparos.

### 3.10 · Filtros avanzados de la lista

El `MonthPicker` no se elimina — se reubica como filtro avanzado para no saturar el header pero conservar la respuesta a "¿cuántas cotizaciones hicimos en marzo?".

#### 3.10.1 · Layout del header de lista

```
[🔍 Buscar contratista... ▾]   [Estado: Todas ▾]   [Filtros ▾]              [+ Nueva cotización]
```

Debajo, **chips de filtros activos**:
```
[Marzo 2026 ✕]  [Cliente: ACME ✕]  [Tipo: Cumplimiento ✕]   [Limpiar todo]
```

#### 3.10.2 · Popover "Filtros"

Al click `[Filtros ▾]` abre `<QuoteAdvancedFilters/>` con:
- **Período**: tabs `[Mes]` (MonthPicker existente) | `[Rango]` (date range) | `[Sin filtro]`.
- **Cliente**: ClientPicker con opción "Sin cliente".
- **Tipo de cotización**: radio Seriedad / Cumplimiento / Todas.

Botones: `Aplicar` / `Limpiar`. Cambios no se aplican hasta `Aplicar` (no churn de queries).

#### 3.10.3 · Mini-resumen del período

Cuando hay filtro de período activo (mes o rango), aparece encima de la tabla un card horizontal **`<QuotePeriodSummary/>`**:

```
┌─────────────────────────────────────────────────────────────┐
│  📊 Marzo 2026                                              │
│  47 cotizaciones · $2.340M en valor de contratos · 12 conv. │
│  ▓▓▓▓▓▓░░░░ 25.5% tasa de conversión                        │
└─────────────────────────────────────────────────────────────┘
```

- Usa `useGetQuoteCompanyStats({ dateFrom, dateTo })`.
- Refresca al cambiar período.
- Muestra: count, suma de `contractValue`, count de `converted`, tasa de conversión.
- En mobile: layout vertical compacto.

## 4 · Migración de datos

- Cotizaciones existentes no tienen `status`. En lectura: `status ?? "draft"` (front) y, opcionalmente, una migration ligera (`convex/migrations.ts`) que setea `status="sent"` a todas las cotizaciones existentes (asumiendo que ya fueron usadas) — **decisión**: dejar `draft` por defecto y que el usuario re-clasifique. Más seguro.
- `clientId` y `policyId` quedan vacíos para rows existentes. Sin impacto.

## 5 · Riesgos y mitigaciones

| Riesgo | Mitigación |
| --- | --- |
| Romper UI vieja en producción mientras refactor está a medias. | Hacemos el refactor del `quote-data-table` y de las páginas en una sola fase atómica (Phase 4). Antes solo agregamos backend nuevo (no rompe). |
| Permitir borradores sin amparos podría dejar entrar cotizaciones sin validar. | `setStatus("sent")` y `convertToPolicy` revalidan amparos server-side. |
| Conversión a póliza necesita `policyTemplate`. Si la company no tiene template aún, falla. | El modal pre-chequea con `useGetPolicyTemplate`; si no existe, ofrece link a `/settings/policy-template`. |
| Autosave puede generar trafico. | Solo cuando `status==="draft"` + debounce 2s + skip si `isPending`. Lo implementamos al final, opcional. |

## 6 · Out of scope (para esta iteración)

- Sub-tab "Cotizaciones" dentro de detalle de cliente (queda preparado por `getByClient`, pero no se cablea).
- Compartir cotización vía link público.
- Versionado de cotizaciones (V1, V2…).
- Drag & drop para reordenar amparos en `performanceBonds` (se evaluará en Phase 6 si entra fácil).
- Sugerencia de tasa basada en históricos reales de la compañía (Phase 1 trae defaults estáticos por tipo).

## 7 · Definition of Done

- Schema con índices nuevos + búsqueda + status.
- Backend: paginación + búsqueda + status transitions + convertToPolicy.
- UI: lista con segmented filter, search debounced, tarjetas mobile, columnas localStorage, auto-load.
- Create/Edit: form unificado, client picker opcional, guardar borrador funciona sin amparos.
- Detalle: actions bar con cambios de estado y "Convertir a póliza" funcional end-to-end.
- QA documento `docs/qa/quotes.md` actualizado.
- `bun run typecheck` + `bun run lint` limpios.
- 0 regresiones en cotizaciones ya existentes (smoke manual).
