# QA · Lines of Business (Ramos)

> Plan de pruebas manuales y guiadas por IA para el catálogo de **ramos**
> (líneas de negocio).

## 1. Contexto

Catálogo de ramos de seguros que maneja la agencia (Autos, Vida, Hogar,
Salud, etc.). Cada ramo puede tener una **abreviatura** corta
(auto-uppercase, máx. 20 caracteres), una **comisión por defecto** (%)
que se precargará al crear pólizas del ramo, y una **descripción**
opcional. Admite archivar para ocultar sin eliminar.

El campo `policies.lineOfBusiness` guarda un **string**, por lo que el
catálogo sólo afecta nuevos registros; los históricos mantienen el
nombre registrado en su momento.

## 2. Precondiciones

Ver `docs/qa/_shared.md`.

Específicas:

- `Agencia Demo` con ramos seed:
  - "Autos" (abreviatura AUTO, comisión 15%)
  - "Vida" (abreviatura VIDA, comisión 20%)
  - "Hogar" (abreviatura HOGAR, comisión 12%)

## 3. Mapa de rutas y componentes

| Ruta                                                | Archivo                                                               |
|-----------------------------------------------------|-----------------------------------------------------------------------|
| Sidebar › Agencia › Ramos (sheet)                    | `packages/linesOfBusiness/components/lines-of-business-sheet.tsx`     |

| Componente clave                  | Archivo                                                                       |
|-----------------------------------|-------------------------------------------------------------------------------|
| `LinesOfBusinessTable`            | `packages/linesOfBusiness/components/lines-of-business-table.tsx`             |
| `LineOfBusinessFormModal`         | `packages/linesOfBusiness/components/modals/line-of-business-form-modal.tsx`  |
| `linesOfBusiness.getByCompany`    | `convex/linesOfBusiness.ts`                                                   |

## 4. Escenarios happy-path

### 4.1 Ver listado activo

**Cuenta**: `owner@aegis.test`
**Entrada**: Sidebar › Agencia › **Ramos** (sheet lateral)

| # | Acción                            | Resultado esperado                                           |
|---|-----------------------------------|--------------------------------------------------------------|
| 1 | Navegar                           | Header con icon `Tag` cyan; 3 filas en la tabla              |
| 2 | Observar columnas                 | Ramo (icon+nombre+desc), Abreviatura (mono), Comisión (mono %), Estado (badge Activo emerald), menú (⋯) |
| 3 | Orden                             | Alfabético case-insensitive por `name` (Autos, Hogar, Vida)  |

### 4.2 Crear ramo nuevo

| # | Acción                                                      | Resultado esperado                                        |
|---|-------------------------------------------------------------|-----------------------------------------------------------|
| 1 | Click "Nuevo ramo"                                          | Modal con header cyan abre, autofocus en Nombre           |
| 2 | Escribir "Salud"                                            | Field acepta                                              |
| 3 | Escribir "sal" en Abreviatura                               | Input convierte a "SAL" en tiempo real (uppercase)        |
| 4 | Escribir "8.5" en Comisión                                  | Número válido, sin error                                  |
| 5 | Click "Crear ramo"                                          | Toast "Ramo creado", modal cierra, fila aparece ordenada  |

### 4.3 Editar ramo

| # | Acción                                                      | Resultado esperado                                        |
|---|-------------------------------------------------------------|-----------------------------------------------------------|
| 1 | Fila "Vida" → menú → "Editar"                               | Modal abre con valores prellenados                         |
| 2 | Cambiar comisión de 20 a 22                                 | Campo acepta                                               |
| 3 | Click "Guardar cambios"                                     | Toast "Ramo actualizado", tabla refleja "22%"             |

### 4.4 Archivar y restaurar

| # | Acción                                                      | Resultado esperado                                        |
|---|-------------------------------------------------------------|-----------------------------------------------------------|
| 1 | Fila "Hogar" → menú → "Archivar"                            | Toast, fila desaparece en scope "Activos"                 |
| 2 | Cambiar selector a "Todos"                                  | Fila reaparece con opacity 70% y badge "Archivado" slate  |
| 3 | Menú → "Activar"                                            | Toast "Ramo activado", badge cambia a emerald             |

### 4.5 Búsqueda

| # | Acción                                                      | Resultado esperado                                        |
|---|-------------------------------------------------------------|-----------------------------------------------------------|
| 1 | Escribir "aut"                                              | Sólo "Autos" visible                                       |
| 2 | Escribir "VIDA"                                             | Match por abreviatura                                      |
| 3 | Escribir "xyz"                                              | Empty state con CTA si tiene `linesOfBusiness_manage`     |

### 4.6 Eliminar ramo

| # | Acción                                                      | Resultado esperado                                        |
|---|-------------------------------------------------------------|-----------------------------------------------------------|
| 1 | Fila → menú → "Eliminar"                                    | Confirm critical                                          |
| 2 | Confirmar                                                   | Toast "Ramo eliminado", fila desaparece                   |
| 3 | Pólizas históricas con `lineOfBusiness="Hogar"`             | Mantienen el string (integridad preservada)               |

## 5. Escenarios de error / edge cases

| #    | Acción                                                      | Resultado esperado                                        |
|------|-------------------------------------------------------------|-----------------------------------------------------------|
| 5.1  | Crear con nombre vacío                                      | Botón disabled (trim)                                     |
| 5.2  | Crear con nombre duplicado (case-insensitive)               | Toast "Ya existe un ramo con ese nombre"                  |
| 5.3  | Crear con abreviatura duplicada                             | Toast "Ya existe un ramo con esa abreviatura"             |
| 5.4  | Comisión = -5                                               | Inline error "Entre 0 y 100", botón disabled              |
| 5.5  | Comisión = 150                                              | Mismo error inline                                        |
| 5.6  | Comisión = "abc"                                            | Inline error "Debe ser un número"                         |
| 5.7  | Comisión vacía                                              | Acepta (se guarda undefined)                              |
| 5.8  | Nombre > 80 chars                                           | Input limita a 80                                         |
| 5.9  | Abreviatura > 20 chars                                      | Input limita a 20                                         |
| 5.10 | Descripción > 500 chars                                     | Textarea limita a 500; altura fija (`h-24 resize-none`), sin handle de resize |
| 5.11 | Editar sin cambios                                          | Mutation idempotente; toast "Ramo actualizado"            |
| 5.12 | Doble click "Crear"                                         | Botón disabled mientras `isPending`                       |
| 5.13 | Usuario sin `linesOfBusiness_manage`                        | "Nuevo ramo" oculto; menú (⋯) oculto en filas             |
| 5.14 | Usuario sin `linesOfBusiness_view`                          | Query devuelve `[]`, empty state                          |
| 5.15 | Eliminar último ramo                                        | Empty state con CTA (si `_manage`)                        |

## 6. Matriz de permisos

| Acción / UI                              | Owner | Admin | Member | Asesor (*) | Lector (*) | Outsider |
|------------------------------------------|-------|-------|--------|------------|------------|----------|
| Abrir sheet "Ramos"                      | ✅    | ✅    | ✅     | ✅         | ✅         | ❌ (sin sidebar) |
| Ver filas en tabla                       | ✅    | ✅    | ✅     | ✅         | ✅         | ❌       |
| Botón "Nuevo ramo"                       | ✅    | ✅    | ❌     | ❌         | ❌         | ❌       |
| Menú (⋯) en fila                         | ✅    | ✅    | ❌     | ❌         | ❌         | ❌       |
| `linesOfBusiness.create` (API)           | ✅    | ✅    | ❌     | ❌         | ❌         | ❌       |
| `linesOfBusiness.update` (API)           | ✅    | ✅    | ❌     | ❌         | ❌         | ❌       |
| `linesOfBusiness.setActive` (API)        | ✅    | ✅    | ❌     | ❌         | ❌         | ❌       |
| `linesOfBusiness.remove` (API)           | ✅    | ✅    | ❌     | ❌         | ❌         | ❌       |

(*) Asesor y Lector: `linesOfBusiness_view: true`, `_manage: false`.

## 7. Verificaciones visuales (Aegis brand)

- [ ] Header con icon `Tag` cyan (`bg-aegis-cyan/10 text-aegis-cyan`).
- [ ] Icon chip por fila usa el mismo token cyan.
- [ ] Badge "Activo" usa `border-aegis-emerald/30 bg-aegis-emerald/10 text-aegis-emerald`.
- [ ] Badge "Archivado" usa `bg-aegis-slate/10 text-aegis-steel`.
- [ ] Fila archivada con `opacity-70`.
- [ ] Abreviatura en `font-mono`.
- [ ] Comisión en `font-mono` con sufijo %.
- [ ] Modal header con icon `Tag` sobre fondo cyan (override de defaults sapphire).
- [ ] Textarea de descripción con `h-24 resize-none` (sin handle de resize, sin atributo `rows`).
- [ ] Confirm eliminación tipo `critical` (destructive).
- [ ] Empty state con icon en circle `bg-aegis-cyan/10`.
- [ ] Sin tokens legacy en DOM (`h-indigo`, `bg-rose-500`, `text-rose-500`).

## 8. Interacciones cross-módulo

- **Policies**: `policies.lineOfBusiness` es string — el picker debe
  ofrecer sólo ramos activos (`getByCompany({ includeInactive: false })`).
- **Policies nuevas**: `defaultCommission` del ramo debería precargarse
  en `policies.commissionPercentage` (pendiente wiring en el form).
- **Quotes**: similar al flujo de pólizas.
- **Insurers**: catálogo independiente, no hay FK entre ellos.
- **Roles**: permisos `linesOfBusiness_view` / `linesOfBusiness_manage`.
- **Logs** (futuro): `lineOfBusiness_created`, `_updated`, `_archived`,
  `_deleted`.
