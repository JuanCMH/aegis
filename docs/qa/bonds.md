# QA · Bonds (Amparos)

> Plan de pruebas manuales y guiadas por IA para el catálogo de **amparos**
> (fianzas).

## 1. Contexto

Catálogo de amparos / fianzas que la agencia cotiza y emite (Seriedad de
oferta, Cumplimiento, Manejo, Anticipo, Salarios y prestaciones, etc.).
Cada amparo puede tener **código corto** (auto-uppercase), **tasa por
defecto** (%) que se precarga en nuevas cotizaciones, **descripción** y
estado **archivado** para ocultar sin eliminar.

Los documentos existentes del flujo de cotización (`quoteBonds`) guardan
el `bondId` opcional + snapshot de `name` / `rate`, por lo que el catálogo
sólo afecta nuevas emisiones; las históricas mantienen los valores
registrados en su momento.

## 2. Precondiciones

Ver `docs/qa/_shared.md`.

Específicas:

- `Agencia Demo` con amparos seed:
  - "Seriedad de oferta" (código SERIEDAD, tasa 1%)
  - "Cumplimiento" (código CUMPL, tasa 2.5%)
  - "Manejo" (código MANEJO, tasa 1.5%)

## 3. Mapa de rutas y componentes

| Ruta                                          | Archivo                                                         |
|-----------------------------------------------|-----------------------------------------------------------------|
| `/companies/[id]/settings/bonds`              | `app/(app)/companies/[companyId]/settings/bonds/page.tsx`       |

| Componente clave            | Archivo                                                              |
|-----------------------------|----------------------------------------------------------------------|
| `BondsCatalogTable`         | `packages/bonds/components/bonds-catalog-table.tsx`                  |
| `BondCatalogFormModal`      | `packages/bonds/components/modals/bond-catalog-form-modal.tsx`       |
| `bonds.getByCompany`        | `convex/bonds.ts`                                                    |

## 4. Escenarios happy-path

### 4.1 Ver listado activo

**Cuenta**: `owner@aegis.test`
**Ruta**: `/companies/[demo]/settings/bonds`

| # | Acción                            | Resultado esperado                                           |
|---|-----------------------------------|--------------------------------------------------------------|
| 1 | Navegar                           | Header con icon `ShieldCheck` amber; 3 filas en la tabla     |
| 2 | Observar columnas                 | Amparo (icon+nombre+desc), Código (mono), Tasa (mono %), Estado (badge Activo emerald), menú (⋯) |
| 3 | Orden                             | Alfabético case-insensitive por `name` (Cumplimiento, Manejo, Seriedad) |

### 4.2 Crear amparo nuevo

| # | Acción                                                      | Resultado esperado                                        |
|---|-------------------------------------------------------------|-----------------------------------------------------------|
| 1 | Click "Nuevo amparo"                                        | Modal con header amber abre, autofocus en Nombre          |
| 2 | Escribir "Anticipo"                                         | Field acepta                                              |
| 3 | Escribir "ant" en Código                                    | Input convierte a "ANT" en tiempo real (uppercase)        |
| 4 | Escribir "2.5" en Tasa                                      | Número válido, sin error                                  |
| 5 | Click "Crear amparo"                                        | Toast "Amparo creado", modal cierra, fila aparece ordenada|

### 4.3 Editar amparo

| # | Acción                                                      | Resultado esperado                                        |
|---|-------------------------------------------------------------|-----------------------------------------------------------|
| 1 | Fila "Manejo" → menú → "Editar"                             | Modal abre con valores prellenados                         |
| 2 | Cambiar tasa de 1.5 a 1.75                                  | Campo acepta                                               |
| 3 | Click "Guardar cambios"                                     | Toast "Amparo actualizado", tabla refleja "1.75%"         |

### 4.4 Archivar y restaurar

| # | Acción                                                      | Resultado esperado                                        |
|---|-------------------------------------------------------------|-----------------------------------------------------------|
| 1 | Fila "Manejo" → menú → "Archivar"                           | Toast, fila desaparece en scope "Activos"                 |
| 2 | Cambiar selector a "Todos"                                  | Fila reaparece con opacity 70% y badge "Archivado" slate  |
| 3 | Menú → "Activar"                                            | Toast "Amparo activado", badge cambia a emerald           |

### 4.5 Búsqueda

| # | Acción                                                      | Resultado esperado                                        |
|---|-------------------------------------------------------------|-----------------------------------------------------------|
| 1 | Escribir "cum"                                              | Sólo "Cumplimiento" visible                                |
| 2 | Escribir "SERIEDAD"                                         | Match por código                                           |
| 3 | Escribir "xyz"                                              | Empty state con CTA si tiene `bonds_manage`               |

### 4.6 Eliminar amparo

| # | Acción                                                      | Resultado esperado                                        |
|---|-------------------------------------------------------------|-----------------------------------------------------------|
| 1 | Fila → menú → "Eliminar"                                    | Confirm critical                                          |
| 2 | Confirmar                                                   | Toast "Amparo eliminado", fila desaparece                 |
| 3 | `quoteBonds` históricos                                     | Conservan `name` y `rate` snapshot (integridad preservada)|

## 5. Escenarios de error / edge cases

| #    | Acción                                                      | Resultado esperado                                        |
|------|-------------------------------------------------------------|-----------------------------------------------------------|
| 5.1  | Crear con nombre vacío                                      | Botón disabled (trim)                                     |
| 5.2  | Crear con nombre duplicado (case-insensitive)               | Toast "Ya existe un amparo con ese nombre"                |
| 5.3  | Crear con código duplicado                                  | Toast "Ya existe un amparo con ese código"                |
| 5.4  | Tasa = -5                                                   | Inline error "Entre 0 y 100", botón disabled              |
| 5.5  | Tasa = 150                                                  | Mismo error inline                                        |
| 5.6  | Tasa = "abc"                                                | Inline error "Debe ser un número"                         |
| 5.7  | Tasa vacía                                                  | Acepta (se guarda undefined)                              |
| 5.8  | Nombre > 80 chars                                           | Input limita a 80                                         |
| 5.9  | Código > 20 chars                                           | Input limita a 20                                         |
| 5.10 | Editar sin cambios                                          | Mutation idempotente; toast "Amparo actualizado"          |
| 5.11 | Doble click "Crear"                                         | Botón disabled mientras `isPending`                       |
| 5.12 | Usuario sin `bonds_manage`                                  | "Nuevo amparo" oculto; menú (⋯) oculto en filas           |
| 5.13 | Usuario sin `bonds_view`                                    | Query devuelve `[]`, empty state                          |
| 5.14 | Eliminar último amparo                                      | Empty state con CTA (si `_manage`)                        |

## 6. Matriz de permisos

| Acción / UI                              | Owner | Admin | Member | Asesor (*) | Lector (*) | Outsider |
|------------------------------------------|-------|-------|--------|------------|------------|----------|
| Ver página `/settings/bonds`             | ✅    | ✅    | ✅     | ✅         | ✅         | ❌ (404) |
| Ver filas en tabla                       | ✅    | ✅    | ✅     | ✅         | ✅         | ❌       |
| Botón "Nuevo amparo"                     | ✅    | ✅    | ❌     | ❌         | ❌         | ❌       |
| Menú (⋯) en fila                         | ✅    | ✅    | ❌     | ❌         | ❌         | ❌       |
| `bonds.create` (API)                     | ✅    | ✅    | ❌     | ❌         | ❌         | ❌       |
| `bonds.update` (API)                     | ✅    | ✅    | ❌     | ❌         | ❌         | ❌       |
| `bonds.setActive` (API)                  | ✅    | ✅    | ❌     | ❌         | ❌         | ❌       |
| `bonds.remove` (API)                     | ✅    | ✅    | ❌     | ❌         | ❌         | ❌       |

(*) Asesor y Lector: `bonds_view: true`, `_manage: false`.

## 7. Verificaciones visuales (Aegis brand)

- [ ] Header con icon `ShieldCheck` amber (`bg-aegis-amber/10 text-aegis-amber`).
- [ ] Icon chip por fila usa el mismo token amber.
- [ ] Badge "Activo" usa `border-aegis-emerald/30 bg-aegis-emerald/10 text-aegis-emerald`.
- [ ] Badge "Archivado" usa `bg-aegis-slate/10 text-aegis-steel`.
- [ ] Fila archivada con `opacity-70`.
- [ ] Código en `font-mono`.
- [ ] Tasa en `font-mono` con sufijo %.
- [ ] Modal header con icon `ShieldCheck` sobre fondo amber (override del default sapphire).
- [ ] Confirm eliminación tipo `critical` (destructive).
- [ ] Empty state con icon en circle `bg-aegis-amber/10`.
- [ ] Sin tokens legacy en DOM (`h-indigo`, `bg-rose-500`, `text-rose-500`).

## 8. Interacciones cross-módulo

- **Quotes**: el picker `BondPicker` (`components/aegis/bond-picker.tsx`)
  alimenta el flujo de cotización. Debe ofrecer sólo amparos activos
  (`getByCompany({ includeInactive: false })`).
- **Quotes nuevas**: `defaultRate` del amparo debería precargarse en
  `quoteBonds[n].rate` al seleccionarlo (pendiente wiring completo).
- **QuoteBonds** (tabla): guarda `bondId` opcional — eliminar un amparo
  **no** rompe la historia (es FK opcional y se guarda `name` inline).
- **Policies**: si en el futuro se relacionan pólizas con amparos,
  aplicar el mismo patrón de snapshot.
- **Insurers / Lines of Business**: catálogos independientes, sin FK
  cruzadas.
- **Roles**: permisos `bonds_view` / `bonds_manage`.
- **Logs** (futuro): `bond_created`, `_updated`, `_archived`, `_deleted`.
