# QA · Bonds (Amparos)

> Plan de pruebas manuales y guiadas por IA para el catálogo de **amparos**
> (fianzas).

## 1. Contexto

Catálogo de amparos / fianzas que la agencia cotiza y emite (Seriedad de
oferta, Cumplimiento, Manejo, Anticipo, Salarios y prestaciones, etc.).
Cada amparo puede tener una **abreviatura** corta (auto-uppercase, máx.
20 caracteres), una **tasa por defecto** seleccionada desde un picker de
tasas válidas (0.05% – 0.40% en pasos de 0.01%) que se precarga en
nuevas cotizaciones, una **descripción** y estado **archivado** para
ocultar sin eliminar.

Los documentos existentes del flujo de cotización (`quoteBonds`) guardan
el `bondId` opcional + snapshot de `name` / `rate`, por lo que el catálogo
sólo afecta nuevas emisiones; las históricas mantienen los valores
registrados en su momento.

## 2. Precondiciones

Ver `docs/qa/_shared.md`.

Específicas:

- `Agencia Demo` con amparos seed:
  - "Seriedad de oferta" (abreviatura SERIEDAD, tasa 0.10%)
  - "Cumplimiento" (abreviatura CUMPL, tasa 0.25%)
  - "Manejo" (abreviatura MANEJO, tasa 0.15%)

## 3. Mapa de rutas y componentes

| Ruta                                          | Archivo                                                         |
|-----------------------------------------------|-----------------------------------------------------------------|
| Sidebar › Agencia › Amparos (sheet)           | `packages/bonds/components/bonds-sheet.tsx`                     |

| Componente clave            | Archivo                                                              |
|-----------------------------|----------------------------------------------------------------------|
| `BondsCatalogTable`         | `packages/bonds/components/bonds-catalog-table.tsx`                  |
| `BondCatalogFormModal`      | `packages/bonds/components/modals/bond-catalog-form-modal.tsx`       |
| `bonds.getByCompany`        | `convex/bonds.ts`                                                    |

## 4. Escenarios happy-path

### 4.1 Ver listado activo

**Cuenta**: `owner@aegis.test`
**Entrada**: Sidebar › Agencia › **Amparos** (sheet lateral)

| # | Acción                            | Resultado esperado                                           |
|---|-----------------------------------|--------------------------------------------------------------|
| 1 | Navegar                           | Header con icon `ShieldCheck` amber; 3 filas en la tabla     |
| 2 | Observar columnas                 | Amparo (icon+nombre+desc), Abreviatura (mono), Tasa (mono %), Estado (badge Activo emerald), menú (⋯) |
| 3 | Orden                             | Alfabético case-insensitive por `name` (Cumplimiento, Manejo, Seriedad) |

### 4.2 Crear amparo nuevo

| # | Acción                                                      | Resultado esperado                                        |
|---|-------------------------------------------------------------|-----------------------------------------------------------|
| 1 | Click "Nuevo amparo"                                        | Modal con header amber abre, autofocus en Nombre          |
| 2 | Escribir "Anticipo"                                         | Field acepta                                              |
| 3 | Escribir "ant" en Abreviatura                               | Input convierte a "ANT" en tiempo real (uppercase)        |
| 4 | Abrir el select "Tasa por defecto" y elegir 0.20%            | Selector muestra 36 opciones (0.05% – 0.40%); valor seleccionado |
| 5 | Click "Crear amparo"                                        | Toast "Amparo creado", modal cierra, fila aparece ordenada|

### 4.3 Editar amparo

| # | Acción                                                      | Resultado esperado                                        |
|---|-------------------------------------------------------------|-----------------------------------------------------------|
| 1 | Fila "Manejo" → menú → "Editar"                             | Modal abre con valores prellenados (select muestra 0.15%) |
| 2 | Cambiar tasa de 0.15% a 0.18%                               | Select acepta y muestra el nuevo valor                    |
| 3 | Click "Guardar cambios"                                     | Toast "Amparo actualizado", tabla refleja "0.18%"         |

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
| 2 | Escribir "SERIEDAD"                                         | Match por abreviatura                                      |
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
| 5.3  | Crear con abreviatura duplicada                             | Toast "Ya existe un amparo con esa abreviatura"           |
| 5.4  | Tasa por defecto sin seleccionar                            | Acepta (se guarda undefined; el usuario la fija al cotizar) |
| 5.5  | Reabrir un amparo con `defaultRate` legacy fuera del rango  | Picker muestra el valor recibido sin error; el usuario puede ajustar a una tasa válida |
| 5.6  | Nombre > 80 chars                                           | Input limita a 80                                         |
| 5.7  | Abreviatura > 20 chars                                      | Input limita a 20                                         |
| 5.8  | Descripción > 500 chars                                     | Textarea limita a 500; altura fija (`h-24 resize-none`), sin handle de resize |
| 5.9  | Editar sin cambios                                          | Mutation idempotente; toast "Amparo actualizado"          |
| 5.10 | Doble click "Crear"                                         | Botón disabled mientras `isPending`                       |
| 5.11 | Usuario sin `bonds_manage`                                  | "Nuevo amparo" oculto; menú (⋯) oculto en filas           |
| 5.12 | Usuario sin `bonds_view`                                    | Query devuelve `[]`, empty state                          |
| 5.13 | Eliminar último amparo                                      | Empty state con CTA (si `_manage`)                        |

## 6. Matriz de permisos

| Acción / UI                              | Owner | Admin | Member | Asesor (*) | Lector (*) | Outsider |
|------------------------------------------|-------|-------|--------|------------|------------|----------|
| Abrir sheet "Amparos"                    | ✅    | ✅    | ✅     | ✅         | ✅         | ❌ (sin sidebar) |
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
- [ ] Abreviatura en `font-mono`.
- [ ] Tasa en `font-mono` con sufijo %.
- [ ] Modal header con icon `ShieldCheck` sobre fondo amber (override del default sapphire).
- [ ] Campo "Tasa por defecto" usa `TaxPicker` (`@/components/aegis/tax-picker`), no input numérico libre.
- [ ] Textarea de descripción con `h-24 resize-none` (sin handle de resize, sin atributo `rows`).
- [ ] Confirm eliminación tipo `critical` (destructive).
- [ ] Empty state con icon en circle `bg-aegis-amber/10`.
- [ ] Sin tokens legacy en DOM (`h-indigo`, `bg-rose-500`, `text-rose-500`).

## 8. Interacciones cross-módulo

- **Quotes** (consumidor, no gestor): dentro del flujo de cotización el
  catálogo se consume a través de `AmparosPickerModal`
  (`packages/bonds/components/modals/amparos-picker-modal.tsx`). Este
  modal **solo lee** `getByCompany({ includeInactive: false })` y permite
  marcar amparos con checkbox para añadirlos a `performanceBondsData`.
  **No expone CRUD**: para crear / editar / archivar amparos hay un botón
  "Gestionar catálogo →" que cierra el picker y abre el `BondsSheet`
  (solo visible con `bonds_manage`).
- **Precarga de tasa**: al marcar un amparo en el picker, su
  `defaultRate` se copia como `rate` inicial en la instancia
  `quoteBond`; el usuario puede ajustarla por cotización.
- **QuoteBonds** (tabla): guarda `bondId` opcional + snapshot de `name`
  y `rate`. Eliminar un amparo del catálogo **no** rompe históricos.
- **Policies**: si en el futuro se relacionan pólizas con amparos,
  aplicar el mismo patrón de snapshot.
- **Insurers / Lines of Business**: catálogos independientes, sin FK
  cruzadas.
- **Roles**: permisos `bonds_view` / `bonds_manage`. Un usuario con
  `bonds_view` puede seleccionar amparos en cotizaciones pero no ve
  el link "Gestionar catálogo".
- **Logs** (futuro): `bond_created`, `_updated`, `_archived`, `_deleted`.
