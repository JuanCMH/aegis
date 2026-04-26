# QA · Policies

> Plan de pruebas manuales y guiadas por IA para el módulo **Pólizas**
> (instancias de seguros), su plantilla dinámica por compañía, las
> acciones cancel/renew y las acciones asistidas por IA.

## 1. Contexto

Como en clientes, Aegis no impone un esquema fijo de póliza: cada
compañía define su propia **plantilla** (`policyTemplates`) con
**secciones** y **campos**. Las pólizas (`policies`) guardan un
`data: any` validado en runtime contra la plantilla activa. Sin embargo,
pólizas tiene un contrato más estricto que clientes:

- **Cuatro campos fijos** se promueven a columnas indexadas de
  primer nivel (necesarias para listas, filtros, dashboard de
  vencimientos y búsqueda):
  - `field_policyNumber` (text) → `policies.policyNumber` +
    `search_policyNumber`.
  - `field_status` (select) → `policies.status`
    (`"active" | "expired" | "canceled" | "pending"`) +
    `companyId_status`.
  - `field_startDate` (date) → `policies.startDate` (ms epoch).
  - `field_endDate` (date) → `policies.endDate` (ms epoch) +
    `companyId_endDate`.
- **Relación con cliente**: `policies.clientId` (opcional) es columna
  indexada (`clientId`), NO un `TemplateField`. Se selecciona desde el
  header del form vía `ClientPicker`.
- **Renovaciones**: `policies.parentPolicyId` enlaza una póliza
  renovada con la anterior; el padre se marca con `isParentPolicy: true`.
- **Tipos de campo soportados** (12, idénticos a clients): `text`,
  `textarea`, `number`, `currency`, `date`, `select`, `phone`, `email`,
  `file`, `image`, `switch`, `url`.
- **Acciones IA** (`convex/policyActions.ts`, runtime `"use node"`):
  - `extractFromDoc` — lee un PDF y rellena campos de la plantilla.
  - `generateFromDoc` — genera plantilla desde un documento (e.g.
    carátula de póliza). Refuerza los 4 fijos en la primera sección.
  - `reviewTemplate` — propone `add` / `modify` / `remove` por campo.
- **Storage Convex** para `file` / `image`: igual que clients;
  `policies.getById` resuelve a URLs firmadas. `policies.remove`
  limpia los archivos de storage antes de borrar.

## 2. Precondiciones

Ver `docs/qa/_shared.md`.

Específicas (a bootstrapear durante la corrida si no existen aún —
**registrar IDs reales** en este documento al ejecutarlas):

- Cuenta sugerida: `qa-policies@aegis.test` / `Test1234!`.
- Agencia sugerida: `Agencia QA Policies`.
- URL base: `http://localhost:7077/companies/<companyId>`.
- Plantilla bootstrap esperada en la agencia (creada vía
  `/settings/policy-template` con default builtin):
  - 5 secciones: `Información general`, `Vigencia y montos`, `Roles`,
    `Comisiones`, `Observaciones`.
  - Campos fijos en `Información general`: `field_policyNumber`,
    `field_status`. Campos fijos en `Vigencia y montos`:
    `field_startDate`, `field_endDate`.
- Al menos **un cliente seed** en la agencia (compartido con
  `qa-clients` o nuevo) para asociar pólizas.
- Pólizas seed sugeridas (3, con distintos estados):
  - `POL-2026-001` activa, vence en > 30 días.
  - `POL-2026-002` próxima a vencer (≤ 30 días).
  - `POL-2026-003` cancelada (estado `canceled`).
- PDF de prueba para extracción IA:
  - `public/qa/sample-policy.pdf` (carátula de póliza con número,
    fechas, prima, asegurado, beneficiario).

## 3. Mapa de rutas y componentes

| Ruta                                                          | Archivo                                                                |
|---------------------------------------------------------------|------------------------------------------------------------------------|
| `/companies/[id]/policies`                                    | `app/(app)/companies/[companyId]/policies/page.tsx`                    |
| `/companies/[id]/policies/new`                                | `app/(app)/companies/[companyId]/policies/new/page.tsx`                |
| `/companies/[id]/policies/[policyId]`                         | `app/(app)/companies/[companyId]/policies/[policyId]/page.tsx`         |
| `/companies/[id]/settings/policy-template`                    | `app/(app)/companies/[companyId]/settings/policy-template/page.tsx`    |

| Componente clave             | Archivo                                                                              |
|------------------------------|--------------------------------------------------------------------------------------|
| `PolicyDataTable`            | `packages/policies/components/table/policy-data-table.tsx`                           |
| `PolicyActions`              | `packages/policies/components/table/policy-actions.tsx`                              |
| `PolicyStatusBadge`          | `packages/policies/components/table/policy-columns.tsx`                              |
| `PolicyStepper`              | `packages/policies/components/policy-stepper.tsx`                                    |
| `ClientPicker`               | `packages/policies/components/client-picker.tsx`                                     |
| `TemplateBuilder` (policies) | `packages/policies/components/template-builder/template-builder.tsx`                 |
| `TemplateBuilderShell`       | `packages/template-builder/components/template-builder-shell.tsx` (compartido)       |
| `DynamicStepper`             | `packages/template-builder/components/dynamic-stepper.tsx` (compartido)              |
| `DynamicField`               | `packages/template-builder/components/dynamic-field.tsx` (compartido)                |
| `FIELD_GRID_CLASSES` (12-col)| `packages/policies/lib/grid.ts` (re-export del shared)                                |
| Validación cliente           | `packages/policies/lib/validate-policy-data.ts`                                      |
| Handlers + validación server | `convex/policies.ts`, `convex/policyTemplates.ts`                                    |
| Acciones IA                  | `convex/policyActions.ts`                                                            |
| Drag & drop builder          | `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities`                         |

## 4. Escenarios happy-path

### 4.1 Listado, toolbar y paginación

**Cuenta**: `qa-policies@aegis.test`
**Ruta**: `/companies/<companyId>/policies`

| #  | Acción                                                   | Resultado esperado                                                                              |
|----|----------------------------------------------------------|-------------------------------------------------------------------------------------------------|
| 1  | Navegar                                                  | Header `h-12` con `SidebarTrigger` + título "Lista de Pólizas"; tabla con columnas fijas (Número, Estado, Inicio, Fin) + dinámicas `showInTable` |
| 2  | Observar fila `POL-2026-001`                             | Status badge color emerald (Activa); fechas formateadas `shortDate`                              |
| 3  | Pulsar `/`                                               | Foco salta al input de búsqueda; kbd `/` visible cuando el campo está vacío                     |
| 4  | Escribir "POL-2026"                                      | Debounce 300ms → resultados filtrados por `search_policyNumber`                                  |
| 5  | Click en `X` del input                                   | Limpia búsqueda                                                                                 |
| 6  | Segmented "Todas / Activas / Pendientes / Vencidas / Canceladas" | Filtra server-side por `status` (re-query de `getByCompany`)                            |
| 7  | Dropdown "Columnas" (≥md)                                | Permite alternar visibilidad de columnas dinámicas; persiste por compañía (`aegis:policies:columns:<companyId>`) |
| 8  | Scroll al fondo                                          | Auto-load dispara `loadMore(25)`                                                                |
| 9  | Click en fila                                            | Navega a `/policies/[id]`                                                                       |
| 10 | Sin resultados con filtros activos                       | Empty state con CTA "Limpiar filtros"                                                           |
| 11 | Compañía sin plantilla configurada                       | Empty state con CTA "Configurar plantilla" → `/settings/policy-template`                        |
| 12 | Mobile (`<md`)                                           | Cards con badge de estado, fechas inicio/fin y 2 campos sample del template                      |

### 4.2 Crear póliza manual

| # | Acción                                                      | Resultado esperado                                                                          |
|---|-------------------------------------------------------------|---------------------------------------------------------------------------------------------|
| 1 | Click "Nueva Póliza"                                        | Navega a `/policies/new`; header `h-12` + `SidebarTrigger`; contenedor `max-w-6xl`          |
| 2 | Empresa **con** plantilla → ver stepper                     | 5 tabs sticky con `backdrop-blur`; tab activo se centra automáticamente                     |
| 3 | `ClientPicker` en header                                    | Abre popover, busca con debounce, muestra avatar+nombre+identificación; click selecciona    |
| 4 | Empresa **sin** plantilla                                   | Banner muted; solo Número, Estado, Fecha inicio, Fecha fin                                  |
| 5 | Rellenar `field_policyNumber=POL-2026-100`                  | Inputs en grid 12-col                                                                       |
| 6 | Avanzar a "Vigencia y montos" → fechas en el pasado         | DatePicker permite cualquier fecha; validación de rango en submit                            |
| 7 | Click "Guardar" con `endDate` < `startDate`                 | Toast error "La fecha de fin debe ser posterior a la fecha de inicio"                       |
| 8 | Corregir y Guardar                                          | Toast "Póliza creada", redirige a `/policies/[id]`                                          |
| 9 | Volver al listado                                           | Nueva fila visible con badge correcto                                                       |

### 4.3 Crear póliza con IA (extract)

| # | Acción                                                      | Resultado esperado                                                                  |
|---|-------------------------------------------------------------|-------------------------------------------------------------------------------------|
| 1 | `/policies/new` → en algún campo `file`/`image`             | Botón con icon `FileText`/`Image` + texto "Subir archivo"                            |
| 2 | Subir `sample-policy.pdf`                                   | Toast con acción "Extraer" durante 8s                                                |
| 3 | Click "Extraer"                                             | Spinner; backend llama `policyActions.extractFromDoc`                                |
| 4 | Respuesta IA                                                | Campos coincidentes se rellenan; toast "N campos extraídos con IA"                   |
| 5 | Campos rellenados                                           | Marcados con badge ✨ `Sparkles` aegis-gold (vía `aiFields`)                          |
| 6 | Editar un campo IA                                          | Badge desaparece (clear de `aiFields`)                                               |
| 7 | Guardar                                                     | Toast "Póliza creada"                                                                |
| 8 | PDF sin texto extraíble                                     | Toast error "No se pudo extraer texto del documento"                                 |
| 9 | Sin permiso `policies_useAI`                                | `PermissionDeniedError` desde backend                                                |

### 4.4 Editar póliza

| # | Acción                                                      | Resultado esperado                                                                                   |
|---|-------------------------------------------------------------|------------------------------------------------------------------------------------------------------|
| 1 | `/policies/[id]`                                            | Header `h-12` + back arrow; contenedor `max-w-6xl`; stepper en read-only                             |
| 2 | Metadata strip                                              | `PolicyStatusBadge`, `FileText` (número), `Calendar` ×2 (inicio/fin con tooltip `fullDateTime`), creación, badge "Renovación" si aplica |
| 3 | Click "Editar"                                              | Inputs habilitados; `ClientPicker` deja de ser readOnly                                              |
| 4 | Cambiar `field_status` a "expired"                          | Acepta                                                                                               |
| 5 | Click "Guardar" (o ⌘+S)                                     | Toast "Póliza actualizada"; metadata strip refleja nuevo badge color                                 |
| 6 | Click "Cancelar" (o Esc)                                    | Revierte cambios desde `policy.data`                                                                 |
| 7 | Compañía sin plantilla                                      | Solo Número, Estado, Fechas editables                                                                |

### 4.5 Cancelar póliza

| # | Acción                                                      | Resultado esperado                                                                  |
|---|-------------------------------------------------------------|-------------------------------------------------------------------------------------|
| 1 | Detalle de póliza activa → click `Ban`                      | `useConfirm` warning "La póliza quedará marcada como cancelada"                     |
| 2 | Confirmar                                                   | Toast "Póliza cancelada"; badge actualiza a rojo "Cancelada"; botón Cancel oculto   |
| 3 | Botón Renovar oculto en póliza cancelada                    | OK                                                                                  |
| 4 | Cancelar póliza ya `expired`                                | Botón Cancel oculto (canCancel=false)                                               |

### 4.6 Renovar póliza

| # | Acción                                                      | Resultado esperado                                                                                   |
|---|-------------------------------------------------------------|------------------------------------------------------------------------------------------------------|
| 1 | Detalle de póliza activa → click `RefreshCw` "Renovar"      | Dialog "Renovar póliza" con `startDate` = endDate previo; `endDate` = endDate previo + duración     |
| 2 | Modificar fechas si se desea                                | DatePicker funcional                                                                                 |
| 3 | Click "Renovar"                                             | Toast "Póliza renovada"; redirige a la nueva póliza                                                  |
| 4 | Nueva póliza                                                | Badge "Renovación" en metadata strip; `parentPolicyId` apunta a la original; status `active`         |
| 5 | Volver a la original                                        | `isParentPolicy=true` en backend (no necesariamente visible en UI hoy)                               |
| 6 | Renovar póliza cancelada                                    | Botón oculto (canRenew=false); si llega al backend, `cannotRenewCanceled` error                      |

### 4.7 Eliminar póliza

| # | Acción                                                      | Resultado esperado                                                          |
|---|-------------------------------------------------------------|-----------------------------------------------------------------------------|
| 1 | Fila en lista → menú (⋯) → "Eliminar" / detalle → `Trash2`  | `useConfirm` critical                                                        |
| 2 | Confirmar                                                   | Toast "Póliza eliminada"; archivos en storage limpiados                     |
| 3 | Backend: ¿sigue vivo `parentPolicyId`?                      | El padre permanece; renovación huérfana solo si la padre se elimina          |

### 4.8 Template Builder · agregar sección y campos

**Ruta**: `/companies/<companyId>/settings/policy-template`

| #  | Acción                                                      | Resultado esperado                                                                                                  |
|----|-------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------|
| 1  | Navegar                                                     | Header `h-12` + `SidebarTrigger`; `TemplateBuilder` carga la plantilla actual; default builtin (5 secciones) si vacía |
| 2  | Layout                                                      | Canvas WYSIWYG full-width; paleta a la derecha; scroll aislado                                                      |
| 3  | Tabs de secciones                                           | Strip horizontal con scroll; tab activo se centra; auto-scroll en drag                                              |
| 4  | Click "+ Sección" → "Endosos"                               | Tab nueva, canvas vacío con empty state                                                                              |
| 5  | Paleta categorizada                                         | Mismas categorías que clients                                                                                       |
| 6  | Arrastrar `Date` desde paleta al canvas                     | Nuevo campo en grid 12-col; panel lateral de configuración                                                          |
| 7  | Resize del campo en canvas                                  | Snap al grid de 12 columnas                                                                                         |
| 8  | Intentar mover/eliminar un campo `isFixed=true`             | UI bloquea (los 4 fijos no son removibles)                                                                          |
| 9  | Click "Guardar"                                             | Toast "Plantilla guardada"; `useGetPolicyTemplate` invalida caché                                                   |
| 10 | Volver a `/policies` y refrescar                            | Nueva columna visible si `showInTable=true`                                                                          |

### 4.9 Template Builder · IA generate

| # | Acción                                                      | Resultado esperado                                                              |
|---|-------------------------------------------------------------|---------------------------------------------------------------------------------|
| 1 | Click "Asistente IA" → tab "Generar"                        | Modal abre                                                                      |
| 2 | Adjuntar `sample-policy.pdf`                                | Carga + procesa                                                                 |
| 3 | Click "Generar"                                             | Toast "Plantilla generada con N secciones"                                       |
| 4 | Revisar canvas                                              | Secciones aplicadas; los 4 fijos siempre presentes en la primera sección        |
| 5 | Guardar                                                     | Persiste                                                                        |

### 4.10 Template Builder · IA review

| # | Acción                                                      | Resultado esperado                                              |
|---|-------------------------------------------------------------|-----------------------------------------------------------------|
| 1 | Click "Asistente IA" → tab "Revisar"                        | Lista de sugerencias                                            |
| 2 | Instrucción "Agregar campos para autos"                     | Acepta                                                          |
| 3 | Click "Revisar"                                             | Toast "N sugerencias", lista con badges add/modify/remove       |
| 4 | Seleccionar subset + "Aplicar"                              | Campos fijos NO modificados; resto se mezcla en canvas           |

### 4.11 Archivos / Imágenes

| # | Acción                                                      | Resultado esperado                                        |
|---|-------------------------------------------------------------|-----------------------------------------------------------|
| 1 | Campo `file`: subir PDF                                     | `generateUploadUrl` → POST → `storageId` guardado         |
| 2 | Campo `image`: subir JPG                                    | Preview thumbnail inline                                  |
| 3 | Eliminar póliza con archivos                                | Storage limpiado en `policies.remove`                     |

## 5. Escenarios de error / edge cases

| #    | Acción                                                      | Resultado esperado                                                  |
|------|-------------------------------------------------------------|---------------------------------------------------------------------|
| 5.1  | Crear sin `field_policyNumber`                              | Toast "El número de póliza es obligatorio"                          |
| 5.2  | `field_status` con valor fuera de literal                    | Backend `statusRequired`                                            |
| 5.3  | Crear sin fechas                                            | Toast respectivo                                                     |
| 5.4  | `endDate` ≤ `startDate`                                     | Toast cliente; backend `invalidDateRange`                            |
| 5.5  | `clientId` de otra compañía                                 | Backend `clientNotFound`                                             |
| 5.6  | Renovar póliza `canceled`                                   | Backend `cannotRenewCanceled`                                        |
| 5.7  | Eliminar plantilla con pólizas existentes                   | (validar comportamiento esperado: ¿permitido? ¿bloqueado?)           |
| 5.8  | Plantilla sin alguno de los 4 fijos                         | `policyTemplates.save` rechaza con validación                        |
| 5.9  | Plantilla con keys duplicadas                               | Validación: "Campo duplicado"                                        |
| 5.10 | Eliminar campo `isFixed=true` en builder                    | UI bloquea                                                          |
| 5.11 | Email/phone/url con formato inválido                        | Error inline                                                        |
| 5.12 | Number fuera de `min`/`max`                                 | Error inline                                                        |
| 5.13 | File > 10MB                                                 | Toast "Archivo demasiado grande"                                    |
| 5.14 | PDF sin texto extraíble                                     | Toast "No se pudo extraer texto del documento"                      |
| 5.15 | IA devuelve JSON inválido                                   | Toast "Error al extraer datos del documento"                        |
| 5.16 | IA sin `policies_useAI`                                     | `PermissionDeniedError`                                             |
| 5.17 | Doble click "Guardar"                                       | Botón disabled durante `isPending`                                  |
| 5.18 | ⌘+S en read-only                                            | No-op (handler solo se registra en edit)                            |
| 5.19 | Concurrencia: editar y otro elimina la misma póliza         | Toast error desde mutation                                           |

## 6. Matriz de permisos

| Acción / UI                                  | Owner | Admin | Member | Asesor | Lector | Outsider |
|----------------------------------------------|-------|-------|--------|--------|--------|----------|
| Ver `/policies` (lista + detalle)            | ✅    | ✅    | ✅     | ✅     | ✅     | ❌       |
| Botón "Nueva Póliza"                         | ✅    | ✅    | ✅     | ✅     | ❌     | ❌       |
| `policies.create` (API)                      | ✅    | ✅    | ✅     | ✅     | ❌     | ❌       |
| Botón "Editar" + `policies.update`           | ✅    | ✅    | ✅     | ✅     | ❌     | ❌       |
| Botón `Ban` Cancelar + `policies.cancel`     | ✅    | ✅    | ✅     | ✅     | ❌     | ❌       |
| Botón `RefreshCw` Renovar + `policies.renew` | ✅    | ✅    | ✅     | ✅     | ❌     | ❌       |
| Botón `Trash2` Eliminar + `policies.remove`  | ✅    | ✅    | ✅     | ❌     | ❌     | ❌       |
| Asistente IA (extract / generate / review)   | ✅    | ✅    | ✅     | ✅     | ❌     | ❌       |
| Ver `/settings/policy-template`              | ✅    | ✅    | ❌ *   | ❌ *   | ❌ *   | ❌       |
| Botón "Guardar" plantilla                    | ✅    | ✅    | ❌     | ❌     | ❌     | ❌       |
| `policyTemplates.save` (API)                 | ✅    | ✅    | ❌     | ❌     | ❌     | ❌       |

(*) `policyTemplates_view` está en roles Owner / Admin por defecto.
Si un rol custom lo habilita, la página carga en read-only y "Guardar"
se oculta a menos que también tenga `policyTemplates_edit`.

(**) `policyTemplates.getByCompany` permite leer cuando el usuario
tiene `policyTemplates_view` **o** `policies_view`. Esto habilita que
Asesor / Lector rendericen el form dinámico de `/policies/new` y
`/policies/[id]` aun sin acceso al builder.

## 7. Verificaciones visuales (Aegis brand)

### Header & layout (consistencia cross-página)
- [ ] Header en lista, `/new`, detalle y builder = `h-12` con `SidebarTrigger` + `Separator` vertical.
- [ ] Contenedor de contenido en `/new` y detalle = `mx-auto max-w-6xl px-8 py-6`.
- [ ] Botones primarios usan `cursor-pointer`.

### Lista
- [ ] Toolbar responsive (search arriba, controles a la derecha en `lg`).
- [ ] Atajo `/` enfoca búsqueda.
- [ ] Segmented "Todas / Activas / Pendientes / Vencidas / Canceladas" con estado activo `bg-muted`.
- [ ] `PolicyStatusBadge` con tokens `aegis-emerald` (active), `aegis-sapphire` (pending), `aegis-amber` (expired), `destructive` (canceled).
- [ ] Auto-load al hacer scroll.
- [ ] Mobile: cards con badge, fechas, 2 sample fields del template.
- [ ] Empty states diferenciados: sin pólizas, sin plantilla, sin resultados con filtros.

### Stepper (`/new` y detalle)
- [ ] Tabs en strip sticky con `backdrop-blur`.
- [ ] Tab activo se centra al cambiar de paso.
- [ ] Badge de error rojo con conteo por sección.
- [ ] Al guardar con errores, salta a la primera sección con errores.

### Detalle
- [ ] Metadata strip muestra `PolicyStatusBadge` + iconos `FileText`, `Calendar` ×2, fecha de creación, badge "Renovación" si `parentPolicyId`.
- [ ] `ClientPicker` en header con avatar circle + nombre + identificación; X para limpiar.
- [ ] Acciones en read-only: Renovar (si !canceled), Cancelar (si !canceled && !expired), Eliminar, Editar.
- [ ] Acciones en edit: Cancelar (Esc), Guardar (⌘+S).
- [ ] Dialog Renovar pre-llena con endDate previo.

### Builder
- [ ] Canvas WYSIWYG full-width; paleta a la derecha.
- [ ] Tabs de secciones con scroll horizontal y auto-scroll.
- [ ] Default builtin: 5 secciones, los 4 fijos visibles y bloqueados.

### IA
- [ ] Toast "Documento subido. ¿Deseas extraer datos con IA?" con acción "Extraer" (8s duration).
- [ ] Spinner durante extracción; botón "Guardar" disabled mientras `isExtracting`.
- [ ] Modal IA con header aegis-gold (`Sparkles`).
- [ ] Badge ✨ en campos rellenados por IA.

### General
- [ ] Confirm eliminación tipo `critical`; cancelación tipo `warning`.
- [ ] Empty state lista con icon `Files` o `FileCheck2` en circle `bg-aegis-sapphire/10`.
- [ ] Sin tokens legacy.
- [ ] Sin imports de `@remixicon/react`.

## 8. Interacciones cross-módulo

- **Clients** (productor): `policies.clientId` referencia un cliente
  vía índice. `ClientPicker` consume `usePaginatedClients`. La
  eliminación de un cliente NO cascadea a pólizas (revisar política
  futura — hoy `policies.clientId` queda como FK rota).
- **Quotes** (productor futuro): emisión de cotización puede crear
  póliza con `policyNumber` heredado.
- **Companies / Members / Roles**: enforcement de permisos
  `policies_*` (7) y `policyTemplates_*` (2) declarados en
  `convex/lib/permissions.ts` y distribuidos en
  `packages/roles/lib/role-templates.ts`.
- **Sidebar** (`packages/companies/components/company-sidebar.tsx`):
  grupo "Pólizas" con sub-links "Lista", "Nueva póliza", "Plantilla".
- **Upload** (`convex/upload.ts`): mismo flujo `generateUploadUrl`
  compartido con clientes/logos/templates.
- **Agents** (`convex/agents.ts`): `policyAgent` ejecuta las 3
  acciones IA; `companyId` aisla threads + permisos.
- **Dashboard** (futuro): `policies.getDueSoon` (windowDays=30)
  alimentará el widget de renovaciones próximas.
- **Logs** (futuro): `policy_created`, `_updated`, `_deleted`,
  `_canceled`, `_renewed`, `policyTemplate_saved`,
  `policy_ai_extract`, `policy_ai_generate`, `policy_ai_review`.
