# QA · Quotes (Cotizaciones)

> Plan de pruebas manuales del módulo `quotes` tras el overhaul
> 2026-04. Cubre permisos, listado, creación con autosave, edición,
> transiciones de estado, conversión a póliza, eliminación y
> regresión de cotizaciones legacy.
>
> Referencia: `docs/plans/2026-04-25-quotes-module-plan.md`.

## 0 · Setup

Ver `docs/qa/_shared.md` para el seed estándar.

Específicas:

- Compañía `Agencia Demo` con:
  - 2 miembros activos.
  - 1 cliente (`Cliente Demo`).
  - ≥ 2 amparos en catálogo (`Cumplimiento`, `Manejo`).
- PDF de prueba `/public/qa/sample-contract.pdf`.
- Cotizaciones seed (mezcla de estados):
  - `COT-2026-0001` bidBond `draft`.
  - `COT-2026-0002` performanceBonds `sent`.
  - `COT-2026-0003` performanceBonds `accepted` sin `policyId`.
  - `COT-2026-0004` legacy (sin `status` / `quoteNumber` /
    `clientId`) — para regresión.

Roles a probar:

- **Owner** (todos los permisos).
- **Admin** (todos).
- **Member** (`quotes_view`, `_create`, `_edit`, `_delete`,
  `_convertToPolicy`, `_useAI`, `policies_create`).
- **Asesor** (todo menos `quotes_delete`).
- **Lector** (`quotes_view` solamente).
- **Outsider** (sin acceso a la compañía).

---

## 1 · Permisos (matriz)

| Acción                                       | Required key(s)                            | Owner | Admin | Member | Asesor | Lector | Outsider |
| -------------------------------------------- | ------------------------------------------ | ----- | ----- | ------ | ------ | ------ | -------- |
| Abrir `/quotes` (lista + detalle)            | `quotes_view`                              | ✅    | ✅    | ✅     | ✅     | ✅     | ❌       |
| Botón "Nueva cotización"                     | `quotes_create`                            | ✅    | ✅    | ✅     | ✅     | ❌     | ❌       |
| Edición + autosave + cambiar status          | `quotes_edit`                              | ✅    | ✅    | ✅     | ✅     | ❌     | ❌       |
| Eliminar                                     | `quotes_delete`                            | ✅    | ✅    | ✅     | ❌     | ❌     | ❌       |
| Convertir a póliza                           | `quotes_convertToPolicy` + `policies_create` | ✅  | ✅    | ✅     | ✅     | ❌     | ❌       |
| AI extraction (Sparkles)                     | `quotes_useAI`                             | ✅    | ✅    | ✅     | ✅     | ❌     | ❌       |
| Exportar PDF / Excel                         | `quotes_view`                              | ✅    | ✅    | ✅     | ✅     | ✅     | ❌       |

Casos puntuales:

- [ ] Lector ve lista y detalle pero **no** ve botones Crear / Editar
      / Eliminar / Convertir / AI.
- [ ] Asesor ve todo excepto Eliminar.
- [ ] Member con `quotes_convertToPolicy` pero **sin**
      `policies_create` → botón Convertir oculto.
- [ ] Outsider sin `quotes_view` → 403 / fallback.
- [ ] Mutaciones rechazadas en backend cuando el role no tiene la
      permission (probar via devtools llamando la action directo).

---

## 2 · Lista `/companies/[id]/quotes`

### 2.1 Búsqueda dual

- [ ] Toggle `Contratista | Contratante` cambia el campo buscado.
- [ ] Búsqueda parcial case-insensitive (≥ 2 chars).
- [ ] Limpiar input restablece el listado.
- [ ] Búsqueda combinada con filtros de período/status/tipo respeta
      todos.

### 2.2 Tabs de status

- [ ] Tabs: Todos / Borrador / Enviada / Aceptada / Rechazada /
      Expirada / Convertida.
- [ ] Conteos por tab coinciden con datos reales.
- [ ] Tab activo se conserva al recargar (URL state o local).

### 2.3 Filtros avanzados (popover)

- [ ] **MonthPicker**: cambiar mes filtra por `_creationTime`.
- [ ] **Cliente**: combobox filtra por `clientId`.
- [ ] **Tipo**: bidBond / performanceBonds.
- [ ] "Limpiar filtros" resetea todos los avanzados.
- [ ] Badge en el botón Filtros muestra el número de filtros activos.

### 2.4 Period summary card

- [ ] Aparece sólo cuando hay período activo.
- [ ] Muestra: count, total `contractValue`, conversiones del
      período.
- [ ] Skeleton al cambiar período.

### 2.5 Paginación cursor

- [ ] "Cargar más" agrega 25 filas y mantiene scroll.
- [ ] Final del listado oculta el botón.
- [ ] No hay duplicados al cambiar filtros mid-pagination.

### 2.6 Mobile cards

- [ ] En `<lg`, render como cards con número, status, contratista,
      valor.
- [ ] Tap navega al detalle.

### 2.7 Columnas persistidas

- [ ] Toggle de columnas persiste por compañía.
- [ ] Reordenar / ocultar columnas sobrevive al refresh.

---

## 3 · Crear `/quotes/new`

### 3.1 Standalone (sin cliente)

- [ ] Llenar partes + contrato + amparo bidBond → "Cotizar" crea con
      `status: "sent"`.
- [ ] `quoteNumber` se genera server-side (`COT-YYYY-NNNN`).
- [ ] Redirect a detalle.

### 3.2 Con cliente vinculado

- [ ] Seleccionar cliente prellena `contractor` + ID y muestra badge
      "Desde cliente".
- [ ] Cambiar cliente con datos editados pide confirmación.
- [ ] Quitar vínculo deja datos como override manual.

### 3.3 Draft sin amparos

- [ ] Llenar partes + contrato → "Guardar borrador" crea con
      `status: "draft"`.

### 3.4 Draft con amparos parciales

- [ ] Borrador con un performanceBond sin tasa → guarda OK.
- [ ] Intentar `Marcar enviada` desde detalle → bloquea con error.

### 3.5 AI extraction

- [ ] Subir PDF (`sample-contract.pdf`) con `quotes_useAI` →
      llena partes + contrato.
- [ ] Sin `quotes_useAI` → botón AI oculto.
- [ ] PDF > 10MB → toast "El archivo no puede superar los 10MB".
- [ ] PDF sin texto extraíble → toast "No se pudo extraer
      información útil del documento".

### 3.6 Autosave + redirect inmediato (★)

- [ ] Tipear contratista en `/quotes/new` → tras ~1.5s la URL cambia
      silenciosamente a `/quotes/<id>` (sin pantalla intermedia,
      sin toast).
- [ ] Indicador `● Guardado hace Xs` aparece tras primer save y se
      actualiza cada 30 s.
- [ ] Cambios subsiguientes actualizan el draft sin toast.
- [ ] Hover sobre el indicador muestra timestamp completo.
- [ ] Refresh conserva el draft.
- [ ] Validación inválida durante autosave → no rompe (silent
      retry en próximo cambio).

---

## 4 · Form comfort

- [ ] **Stepper** sticky con 5 pasos (Tipo, Cliente, Partes,
      Contrato, Amparos). Click navega/scroll-to-section. Marca
      completado en verde.
- [ ] **Atajos**: `Cmd/Ctrl+S` guarda; `Cmd/Ctrl+Enter` cotiza si el
      stepper está completo.
- [ ] **Cambio de tipo de cotización** con datos sin guardar pide
      `useConfirm`.
- [ ] **Control % ↔ valor**: editar % recalcula `insuredValue` y
      viceversa.
- [ ] **Chip "Mismas fechas que el contrato"** sincroniza fechas del
      bidBond con el contrato.
- [ ] **Chips +12m / +36m / +60m** en performance bonds usan
      defaults de `bond-period-defaults`.
- [ ] **Sugerencia de tasa**: chip ⚡ con tasa default por bond.
- [ ] **Prima inline** por amparo se actualiza al cambiar inputs.
- [ ] **Sticky results** (lg+): se mantiene en viewport al
      scrollear el form. Fade-highlight al cambiar el total.
- [ ] **Animación**: nuevos performance bonds entran con
      fade/slide-in.

---

## 5 · Editar `/quotes/[id]`

- [ ] Cambiar contratista persiste vía autosave (status=`draft`) o
      "Guardar cambios" (status≠`draft`).
- [ ] Agregar performance bond → animación slide-in.
- [ ] Eliminar performance bond pasa por `useConfirm`.
- [ ] Cambiar cliente vinculado actualiza partes (con confirm si
      hubo ediciones).
- [ ] Quitar vínculo cliente → `clientId = undefined`.
- [ ] Editar `quoteNumber` (override manual) persiste.
- [ ] `status === "converted"` deja todo readonly y oculta footer
      + delete + AI.

---

## 6 · Estados (transiciones)

Matriz oficial (`quote-actions-bar.tsx · STATUS_ACTIONS`):

| From      | Acciones disponibles                                |
| --------- | --------------------------------------------------- |
| draft     | Marcar enviada                                      |
| sent      | Marcar aceptada · Marcar rechazada · Expirar        |
| accepted  | Convertir a póliza · Volver a enviada               |
| rejected  | Volver a enviada                                    |
| expired   | Volver a enviada                                    |
| converted | (ninguna — readonly + delete oculto)                |

Casos:

- [ ] Cada acción permitida actualiza el badge y los timestamps
      (`sentAt`, `acceptedAt`, `rejectedAt`, `convertedAt`).
- [ ] `useConfirm` aparece en transiciones críticas (rechazar,
      expirar, volver a enviada).
- [ ] Validación `isQuoteReadyToSend` al pasar `draft → sent`:
      bloquea si faltan partes, contrato o amparos.
- [ ] Backend rechaza transiciones inválidas (intentar
      `draft → accepted` directo desde devtools).

---

## 7 · Convertir a póliza

- [ ] Botón visible **solo** desde `accepted` y sin `policyId`
      (con `quotes_convertToPolicy` + `policies_create`).
- [ ] Modal `QuoteConvertModal` pre-llena `policyNumber` reemplazando
      `COT` → `POL` en el número de cotización.
- [ ] Muestra el template de póliza resuelto para la compañía
      (`useGetPolicyTemplate`).
- [ ] **Sin template** configurado → CTA "Configurar template"
      lleva a `/settings/policy-template` y submit deshabilitado.
- [ ] Submit crea póliza, marca quote `converted` con `policyId`
      y redirige a `/companies/[id]/policies/[policyId]`.
- [ ] Tras conversión, volver a `/quotes/[id]` muestra todo
      readonly y badge `Convertida`.
- [ ] Sin permiso `policies_create` → botón oculto aunque tenga
      `quotes_convertToPolicy`.
- [ ] Intentar convertir desde `draft`/`sent`/`rejected`/`expired`
      → botón ausente.

---

## 8 · Eliminar

- [ ] Con documento (`documentId`) → confirm `critical` + storage
      delete + row delete.
- [ ] Sin documento → confirm + row delete.
- [ ] `status === "converted"` → acción oculta. Eliminar primero
      la póliza desde `/policies/[id]`.
- [ ] Tras eliminar, navega a la lista y la fila desaparece sin
      refresh manual.

---

## 9 · Regresión legacy

- [ ] `COT-2026-0004` (sin `status`) se renderiza como `Borrador`
      (badge gris).
- [ ] Sin `clientId` muestra "Sin cliente" en la lista.
- [ ] Sin `quoteNumber` muestra fallback (`Cotización` o id corto).
- [ ] Editar la legacy y guardar genera `quoteNumber` server-side y
      asigna `status: "draft"`.
- [ ] Cotizaciones legacy con amparos cuyo `bondId` ya no existe
      mantienen el snapshot `name + rate` en el detalle.

---

## 10 · Visual / brand checks

- [ ] Header detalle con icon `ShieldCheck` amber.
- [ ] Tokens: `aegis-sapphire`, `aegis-emerald`, `aegis-amber`,
      `aegis-gold`, `destructive`. **Sin** legacy
      `h-indigo`, `bg-rose-500`, `text-rose-500`.
- [ ] Stepper: pasos completados en `aegis-emerald`, activo en
      `aegis-sapphire`.
- [ ] Indicador autosave: dot `emerald-500`, texto
      `text-muted-foreground`.
- [ ] `ResultsCard` total positivo en `aegis-emerald` con
      fade-highlight.
- [ ] Skeletons al cargar el detalle (loop de 4 secciones + aside).
- [ ] Empty state lista con icon en circle
      `bg-aegis-sapphire/10`.
- [ ] Confirm eliminación tipo `critical` (destructive).
- [ ] Modal AI header con `Sparkles` gold.

---

## 11 · Smoke run end-to-end

1. **Owner** crea cotización con cliente → autosave (URL salta a
   `/quotes/<id>`) → completa amparos → `Cotizar` → `Marcar
   aceptada` → `Convertir a póliza` → ver póliza en `/policies`.
2. **Asesor**: confirmar que la acción Eliminar está oculta tanto
   en la lista como en el detalle.
3. **Lector**: lista y detalle visibles, sin botones de mutación.
4. **Member**: filtrar lista por mes + cliente + status →
   verificar period summary card y conteos.
5. **Member**: subir `sample-contract.pdf` con AI → form
   prellenado → guardar borrador.
6. **Owner**: borrar la cotización del paso 5 (sin documento) y
   verificar que desaparece sin refresh.

---

## 12 · Cross-módulo

- **Bonds** (catálogo): `PerformanceBondPicker` consume
  `useGetBondsByCompany`. Eliminar amparos del catálogo no afecta
  cotizaciones existentes (snapshot `name + rate`).
- **Clients**: `ClientLinkPicker` filtra por compañía y prellena
  contratante / id; quitar vínculo conserva los valores como
  override manual.
- **Companies**: `getQuotes` filtra por `companyId`; export usa
  `companies.logo` y `companies.name`.
- **Policies**: conversión usa `useConvertQuoteToPolicy` +
  template de póliza (`useGetPolicyTemplate`).
- **Storage**: `documentId` en `_storage`; reemplazo explícito
  borra el archivo viejo en `update`.
- **Roles**: 7 keys (`quotes_view`, `_create`, `_edit`, `_delete`,
  `_convertToPolicy`, `_share`, `_useAI`).
- **Agents** (`convex/agents.ts`): `quoteAgent.createThread`
  ejecuta el prompt; `companyId` se pasa a la action para enforce.
