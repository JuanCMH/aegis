# QA · Quotes (Cotizaciones)

> Plan de pruebas manuales y guiadas por IA para el módulo de
> **cotizaciones** de pólizas de seriedad y cumplimiento.

## 1. Contexto

Una **cotización** (`quotes`) encapsula los datos del contrato
(contratante / tomador, valor, fechas, tipo, anticipo, etc.) y un
conjunto de **amparos cotizados** (`quoteBonds`) con tasa y valor
asegurado. Cada cotización pertenece a una compañía y puede incluir
un **documento de referencia** (PDF, Word, imagen).

Elementos clave:

- **Dos tipos de cotización** (`quoteType`):
  - `bidBond` — Seriedad de la oferta (un único amparo).
  - `performanceBonds` — Cumplimiento y anexos (varios amparos).
- **Catálogo consumido**: los amparos se seleccionan desde el
  catálogo de la compañía vía `AmparosPickerModal` (ver bonds.md §8).
  Cada `quoteBond` guarda `bondId` opcional + snapshot de `name` y
  `rate` para que los históricos sobrevivan a cambios del catálogo.
- **Acción IA**: `quote.getQuoteFromDoc` extrae contratante,
  tomador, valor y fechas de un PDF vía `quoteAgent`. Requiere
  `quotes_useAI` y explícito `companyId`.
- **Export**: desde el detalle se genera Excel y PDF propietarios
  con branding de la compañía (`generateQuoteExcel`,
  `generateQuotePDF`).
- **Conversión a póliza**: permiso `quotes_convertToPolicy`
  declarado, UI pendiente (se cableará con el módulo `policies`).
- **Compartir**: permiso `quotes_share` declarado, UI pendiente.

## 2. Precondiciones

Ver `docs/qa/_shared.md`.

Específicas:

- `Agencia Demo` con amparos seed (ver bonds.md §2).
- Al menos 2 cotizaciones seed distribuidas en el mes actual:
  - Bid-bond a "ACME S.A.S." con un amparo de Seriedad 1%.
  - Performance-bonds con 3 amparos (Cumplimiento, Manejo,
    Salarios) a "Globex Corp".
- PDF de prueba `/public/qa/sample-contract.pdf`.

## 3. Mapa de rutas y componentes

| Ruta                                               | Archivo                                                             |
|----------------------------------------------------|---------------------------------------------------------------------|
| `/companies/[id]/quotes`                           | `app/(app)/companies/[companyId]/quotes/page.tsx`                   |
| `/companies/[id]/quotes/new`                       | `app/(app)/companies/[companyId]/quotes/new/page.tsx`               |
| `/companies/[id]/quotes/[quoteId]`                 | `app/(app)/companies/[companyId]/quotes/[quoteId]/page.tsx`         |

| Componente clave       | Archivo                                                            |
|------------------------|--------------------------------------------------------------------|
| `QuoteDataTable`       | `packages/quotes/components/table/quote-data-table.tsx`            |
| `QuoteActions`         | `packages/quotes/components/table/quote-actions.tsx`               |
| `QuotePopover`         | `packages/quotes/components/table/quote-popover.tsx`               |
| `ContractInfo`         | `packages/quotes/components/contract-info.tsx`                     |
| `QuoteInfo`            | `packages/quotes/components/quote-info.tsx`                        |
| `ResultsCard`          | `packages/quotes/components/results-card.tsx`                      |
| `QuoteAgentModal`      | `packages/quotes/components/modals/quote-agent-modal.tsx`          |
| `AmparosPickerModal`   | `packages/bonds/components/modals/amparos-picker-modal.tsx`        |
| Handlers               | `convex/quote.ts`                                                  |
| PDF/Excel export       | `packages/quotes/lib/export-quote-pdf.ts`, `export-quote-excel.ts` |

## 4. Escenarios happy-path

### 4.1 Listar cotizaciones por mes

**Cuenta**: `owner@aegis.test`
**Ruta**: `/companies/[demo]/quotes`

| # | Acción                             | Resultado esperado                                         |
|---|------------------------------------|------------------------------------------------------------|
| 1 | Navegar                            | Header "Lista de Cotizaciones", tabla con mes actual       |
| 2 | Cambiar selector de mes            | `useDates` persiste, tabla refresca con query por mes      |
| 3 | Mes vacío                          | Empty state                                                |

### 4.2 Crear cotización bidBond manual

| # | Acción                                                      | Resultado esperado                                        |
|---|-------------------------------------------------------------|-----------------------------------------------------------|
| 1 | Click "Nueva Cotización"                                    | Navega a `/quotes/new`                                    |
| 2 | Rellenar `ContractInfo`                                     | Fechas, valor, contratante / tomador                      |
| 3 | QuoteType = "Seriedad de la Oferta"                         | `QuoteInfo` muestra único bond                            |
| 4 | Tasa 1%, porcentaje 10% del valor del contrato              | `ResultsCard` calcula prima + IVA                         |
| 5 | Click "Guardar"                                             | Toast "Cotización creada", redirige a detalle             |

### 4.3 Crear cotización performanceBonds desde IA

| # | Acción                                                      | Resultado esperado                                        |
|---|-------------------------------------------------------------|-----------------------------------------------------------|
| 1 | `/quotes/new` → click ✨ (Sparkles)                          | `QuoteAgentModal` abre                                    |
| 2 | Adjuntar `sample-contract.pdf`                              | File picker acepta, preview del nombre                    |
| 3 | Seleccionar "Cumplimiento"                                  | radio activo                                              |
| 4 | Marcar amparos deseados (Cumplimiento, Manejo)              | Checkboxes en el picker                                   |
| 5 | Click "Extraer datos"                                       | Loader, toast "Procesando…", llamada a `getQuoteFromDoc`  |
| 6 | Respuesta IA                                                | `contractData` + amparos populados; modal cierra          |
| 7 | Ajustar y guardar                                           | Cotización creada con `documentId` adjunto                |

### 4.4 Editar cotización

| # | Acción                                                      | Resultado esperado                                        |
|---|-------------------------------------------------------------|-----------------------------------------------------------|
| 1 | Fila → click → detalle                                      | Modo read-only                                            |
| 2 | Click toggle ✏ (Pencil)                                     | Inputs editables, toggle activo sky                       |
| 3 | Modificar valor de contrato                                 | Recalcula totales en vivo                                 |
| 4 | Aplicar cambios                                             | Mutation `update`; toast "Cotización actualizada"         |
| 5 | Salir y volver                                              | Persistencia verificada                                   |

### 4.5 Exportar

| # | Acción                                                      | Resultado esperado                                        |
|---|-------------------------------------------------------------|-----------------------------------------------------------|
| 1 | Detalle → "Exportar" → "Excel"                              | Descarga `.xlsx` con logo de la compañía                  |
| 2 | Detalle → "Exportar" → "PDF"                                | Descarga `.pdf` con branding                              |
| 3 | "Ver Documento" (si hay `documentUrl`)                      | Abre PDF original en nueva pestaña                        |

### 4.6 Eliminar cotización

| # | Acción                                                      | Resultado esperado                                        |
|---|-------------------------------------------------------------|-----------------------------------------------------------|
| 1 | Fila → menú (⋯) → "Eliminar Cotización"                     | `useConfirm` modal                                        |
| 2 | Confirmar                                                   | Toast "Cotización eliminada", `quoteBonds` + `documentId` removidos |

## 5. Escenarios de error / edge cases

| #    | Acción                                                      | Resultado esperado                                        |
|------|-------------------------------------------------------------|-----------------------------------------------------------|
| 5.1  | Crear con `contractValue = 0`                               | Backend `quoteErrors.invalidContractValue`                |
| 5.2  | `contractStart >= contractEnd`                              | Backend `invalidContractDates`                            |
| 5.3  | `quoteBonds` vacío                                          | Backend `invalidBonds`                                    |
| 5.4  | Adjuntar PDF > 10MB en IA modal                             | Toast "El archivo no puede superar los 10MB"              |
| 5.5  | PDF sin texto extraíble                                     | Toast "No se pudo extraer información útil del documento" |
| 5.6  | IA response con contractor/ee vacíos y contractValue 0      | Mensaje de error + modal permanece abierto                |
| 5.7  | Usar AI sin `quotes_useAI`                                  | Backend `permissionDenied`; UI oculta botón ✨             |
| 5.8  | Editar sin `quotes_edit`                                    | Toggle oculto; mutation rechazada                         |
| 5.9  | Eliminar sin `quotes_delete`                                | Menú oculto; mutation rechazada                           |
| 5.10 | Tasa de amparo = 0                                          | Prima = 0; sistema acepta (caso valid de cortesía)        |
| 5.11 | Porcentaje > 100                                            | Validado en `BidBondInfo` / `PerformanceBondsInfo`        |
| 5.12 | Reemplazar documentId                                       | Storage anterior eliminado server-side                    |
| 5.13 | Doble click "Guardar"                                       | Botón disabled mientras `isPending`                       |
| 5.14 | Amparo del catálogo eliminado tras cotizar                  | Cotización conserva snapshot `name` + `rate`              |

## 6. Matriz de permisos

| Acción / UI                                  | Owner | Admin | Member | Asesor | Lector | Outsider |
|----------------------------------------------|-------|-------|--------|--------|--------|----------|
| Ver `/quotes` (lista + detalle)              | ✅    | ✅    | ✅     | ✅     | ✅     | ❌       |
| Botón "Nueva Cotización"                     | ✅    | ✅    | ✅     | ✅     | ❌     | ❌       |
| `quote.create` (API)                         | ✅    | ✅    | ✅     | ✅     | ❌     | ❌       |
| Toggle ✏ editar en detalle                   | ✅    | ✅    | ✅     | ✅     | ❌     | ❌       |
| `quote.update` (API)                         | ✅    | ✅    | ✅     | ✅     | ❌     | ❌       |
| Menú fila → "Eliminar"                       | ✅    | ✅    | ✅     | ❌     | ❌     | ❌       |
| `quote.remove` (API)                         | ✅    | ✅    | ✅     | ❌     | ❌     | ❌       |
| Botón ✨ IA (`quote.getQuoteFromDoc`)         | ✅    | ✅    | ✅     | ✅     | ❌     | ❌       |
| Exportar PDF / Excel                         | ✅    | ✅    | ✅     | ✅     | ✅     | ❌       |
| Convertir a póliza (`quotes_convertToPolicy`)| ✅    | ✅    | ✅     | ✅     | ❌     | ❌       |
| Compartir (`quotes_share`)                   | ✅    | ✅    | ✅     | ✅     | ❌     | ❌       |

Las dos últimas filas enumeran permisos ya declarados en schema pero
cuya UI será cableada con los módulos `policies` y `share` (pendientes).

## 7. Verificaciones visuales (Aegis brand)

- [ ] Header detalle con icon `ShieldCheck` amber por amparo.
- [ ] Toggle editar: off = neutral, on = fill sky-500.
- [ ] `ResultsCard` con tokens aegis-emerald para totales positivos.
- [ ] Badge ✨ (Sparkles aegis-gold) en datos populados por IA.
- [ ] Modal IA header con `Sparkles` gold, loader claro
      durante `isGettingQuote`.
- [ ] Tabla de cotizaciones con columnas monetarias en `font-mono`
      formateadas COP.
- [ ] Selector de mes con icono `Calendar`, estados hover / active.
- [ ] Confirm eliminación tipo `critical` (destructive).
- [ ] Empty state lista con icon en circle `bg-aegis-sapphire/10`.
- [ ] Export dropdown con icon `Download`, opciones Excel / PDF.
- [ ] Sin tokens legacy (`h-indigo`, `bg-rose-500`, `text-rose-500`).

## 8. Interacciones cross-módulo

- **Bonds** (catálogo): `AmparosPickerModal` selecciona amparos y
  copia su `defaultRate` al `quoteBond`. Eliminar amparos del
  catálogo no afecta históricos por el snapshot `name + rate`.
- **Clients** (futuro): `contractor` + `contractorId` y
  `contractee` + `contracteeId` serán pickers de `clients` con
  snapshot. Hoy son campos libres.
- **Companies**: `getQuotesByCompany` filtra por `companyId`; el
  export usa `companies.logo` y `companies.name`.
- **Policies** (futuro): convertir una cotización a póliza usará
  `quotes_convertToPolicy`, copiando contract + amparos como base.
- **Storage**: `documentId` en `_storage`; reemplazo explícito
  borra el archivo viejo en `update`.
- **Roles**: 7 permisos declarados
  (`quotes_view`, `_create`, `_edit`, `_delete`,
  `_convertToPolicy`, `_share`, `_useAI`). Asesor no tiene
  `_delete`; Lector solo `_view`.
- **Agents** (`convex/agents.ts`): `quoteAgent.createThread` ejecuta
  el prompt; el `companyId` se pasa a la action para enforce
  aislamiento y permisos.
- **Logs** (futuro): `quote_created`, `_updated`, `_deleted`,
  `_ai_extract`, `_exported`, `_converted_to_policy`, `_shared`.
