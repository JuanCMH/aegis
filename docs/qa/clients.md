# QA · Clients

> Plan de pruebas manuales y guiadas por IA para el módulo **Clientes**
> (contratantes / tomadores), su plantilla dinámica por compañía y las
> acciones asistidas por IA.

## 1. Contexto

Aegis no impone un esquema fijo de cliente: cada compañía define su
propia **plantilla** (`clientTemplates`) con **secciones** y **campos**.
Los clientes (`clients`) guardan un `data: any` validado en runtime
contra la plantilla activa.

Elementos clave:

- **Campos fijos obligatorios** (enforcement server-side en
  `validateTemplateData`):
  - `field_name` (text) — nombre / razón social.
  - `field_identificationNumber` (text o number) — NIT / CC / cédula.
- **Tipos de campo soportados** (12): `text`, `textarea`, `number`,
  `currency`, `date`, `select`, `phone`, `email`, `file`, `image`,
  `switch`, `url`.
- **Indexes de búsqueda**: `search_name` y `search_identificationNumber`
  (se alimentan a partir de los dos fijos).
- **Acciones IA** (`convex/clientActions.ts`, runtime `"use node"`):
  - `extractFromDoc` — lee un PDF y rellena campos que ya existen en
    la plantilla.
  - `generateFromDoc` — genera plantilla completa a partir de un
    documento (p. ej. contrato o formulario de alta).
  - `reviewTemplate` — revisa la plantilla actual y propone
    `add` / `modify` / `remove` por campo.
- **Storage Convex** para `file` / `image`: los valores guardados son
  `storageId`; `clients.getById` resuelve a URL firmada antes de
  devolver al cliente.

## 2. Precondiciones

Ver `docs/qa/_shared.md`.

Específicas:

- Bootstrap real disponible en local:
  - Cuenta: `qa-clients@aegis.test` / `Test1234!`.
  - Agencia: `Agencia QA Clients`.
  - URL base: `http://localhost:7077/companies/m974x1bva3mcnk0wprrh44w1yh85gm9k`.
- Plantilla bootstrap ya guardada en la agencia:
  - Sección única `Información Básica`.
  - Campos fijos: `field_name` (text), `field_identificationNumber` (text).
  - Campos adicionales reales: `Correo` (email), `Teléfono` (phone).
  - Nota: los campos extra fueron creados desde el builder y no usan keys
    canónicas estables; en el plan se referencian por su label visible.
- Cliente seed ya creado:
  - `ACME S.A.S.`, NIT `900123456`, email `contacto@acme.test`,
    teléfono `+57 300 123 4567`.
  - URL detalle:
    `http://localhost:7077/companies/m974x1bva3mcnk0wprrh44w1yh85gm9k/clients/kx774286ntkxy277egnnfkanpn85g1j8`.
- PDF de prueba disponible:
  - `public/qa/sample-contract.pdf`.
  - Contiene nombre, NIT, email, teléfono, dirección y representante
    legal para las pruebas de extracción IA.

## 3. Mapa de rutas y componentes

| Ruta                                                          | Archivo                                                               |
|---------------------------------------------------------------|-----------------------------------------------------------------------|
| `/companies/[id]/clients`                                     | `app/(app)/companies/[companyId]/clients/page.tsx`                    |
| `/companies/[id]/clients/new`                                 | `app/(app)/companies/[companyId]/clients/new/page.tsx`                |
| `/companies/[id]/clients/[clientId]`                          | `app/(app)/companies/[companyId]/clients/[clientId]/page.tsx`         |
| `/companies/[id]/settings/client-template`                    | `app/(app)/companies/[companyId]/settings/client-template/page.tsx`   |

| Componente clave             | Archivo                                                                           |
|------------------------------|-----------------------------------------------------------------------------------|
| `ClientDataTable`            | `packages/clients/components/table/client-data-table.tsx`                         |
| `ClientActions`              | `packages/clients/components/table/client-actions.tsx`                            |
| `ClientStepper`              | `packages/clients/components/client-stepper.tsx`                                  |
| `DynamicField`               | `packages/clients/components/dynamic-field.tsx`                                   |
| `TemplateBuilder`            | `packages/clients/components/template-builder/template-builder.tsx`               |
| `TemplateCanvas`             | `packages/clients/components/template-builder/template-canvas.tsx`                |
| `FieldConfigPanel`           | `packages/clients/components/template-builder/field-config-panel.tsx`             |
| `FieldPalette`               | `packages/clients/components/template-builder/field-palette.tsx`                  |
| `SectionTabs`                | `packages/clients/components/template-builder/section-tabs.tsx`                   |
| `TemplateAiModal`            | `packages/clients/components/template-builder/template-ai-modal.tsx`              |
| `FIELD_GRID_CLASSES` (12-col)| `packages/clients/lib/grid.ts`                                                    |
| Validación cliente           | `packages/clients/lib/validate-client-data.ts`                                    |
| Handlers + validación server | `convex/clients.ts`, `convex/clientTemplates.ts`                                  |
| Acciones IA                  | `convex/clientActions.ts`                                                         |
| Drag & drop builder          | `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities`                      |

## 4. Escenarios happy-path

### 4.1 Listado, toolbar y paginación

**Cuenta**: `qa-clients@aegis.test`
**Ruta**: `/companies/m974x1bva3mcnk0wprrh44w1yh85gm9k/clients`

| #  | Acción                                                   | Resultado esperado                                                                              |
|----|----------------------------------------------------------|-------------------------------------------------------------------------------------------------|
| 1  | Navegar                                                  | Header `h-12` con `SidebarTrigger`, breadcrumb / título; tabla con columnas = campos `showInTable` de la plantilla |
| 2  | Observar fila "ACME S.A.S."                              | Fila seed visible con nombre + identificación; `Correo` y `Teléfono` existen en el detalle y pueden activarse en tabla en una pasada posterior |
| 3  | Pulsar `/` en cualquier parte de la página               | Foco salta al input de búsqueda (kbd `/` visible cuando el campo está vacío)                    |
| 4  | Escribir "acm"                                           | Debounce 300ms → resultados filtrados por `search_name` / `search_identificationNumber`         |
| 5  | Click en `X` dentro del input                            | Limpia búsqueda, vuelve al listado completo                                                     |
| 6  | Segmented control "Todos / Completos / Incompletos"      | Filtra client-side por validez de campos requeridos contra la plantilla activa                  |
| 7  | Dropdown "Columnas" (≥md)                                | Permite alternar visibilidad de columnas dinámicas; se persiste por compañía (localStorage)      |
| 8  | Scroll al fondo                                          | **Auto-load** dispara `loadMore` (page size 25); sin botón "Cargar más"                          |
| 9  | Click en fila                                            | Navega a `/clients/[id]`                                                                        |
| 10 | Sin resultados con filtros activos                       | Empty state con CTA "Limpiar filtros" que resetea búsqueda + completeness                       |
| 11 | Compañía sin plantilla configurada                       | Empty state con CTA "Configurar plantilla" → `/settings/client-template`                         |

### 4.2 Crear cliente manual

| # | Acción                                                      | Resultado esperado                                                                 |
|---|-------------------------------------------------------------|------------------------------------------------------------------------------------|
| 1 | Click "Nuevo Cliente"                                       | Navega a `/clients/new`; header `h-12` + `SidebarTrigger`; contenedor `max-w-6xl`  |
| 2 | Empresa **con** plantilla → ver stepper                     | Tabs sticky con `backdrop-blur` y edge fades; tab activo se centra automáticamente |
| 3 | Empresa **sin** plantilla                                   | Banner muted "…solo se guardarán campos básicos…"; solo Nombre + Identificación    |
| 4 | Rellenar nombre "Globex Corp" + NIT "901987654"             | Inputs en grid 12-col (`FIELD_GRID_CLASSES`)                                       |
| 5 | Avanzar secciones → rellenar email "hi@globex.test"         | Field email válido                                                                 |
| 6 | Click "Guardar" con un email mal formado                    | Salto automático a la primera sección con errores; badge rojo con conteo en su tab |
| 7 | Corregir + click "Guardar"                                  | Toast "Cliente creado", redirige a `/clients/[id]`                                 |
| 8 | Volver al listado                                           | Nueva fila presente                                                                |

### 4.3 Crear cliente con IA (extract)

| # | Acción                                                      | Resultado esperado                                                              |
|---|-------------------------------------------------------------|---------------------------------------------------------------------------------|
| 1 | `/clients/new` → clip 📎 "Adjuntar documento"               | File picker acepta PDF                                                          |
| 2 | Subir `sample-contract.pdf`                                 | **Overlay de extracción IA** sobre el form (spinner + texto "Procesando…")      |
| 3 | Respuesta IA                                                | Campos coincidentes se rellenan; toast "N campos extraídos"; overlay desaparece |
| 4 | Campos rellenados por IA                                    | Marcados con badge ✨ `Sparkles` aegis-gold                                      |
| 5 | Ajustar manualmente + Guardar                               | Cliente persistido                                                              |
| 6 | Compañía sin plantilla → CTA en overlay                     | Botón "Configurar plantilla" → `/settings/client-template`                       |

### 4.4 Editar cliente

| # | Acción                                                      | Resultado esperado                                                                                   |
|---|-------------------------------------------------------------|------------------------------------------------------------------------------------------------------|
| 1 | `/clients/[id]`                                             | Header `h-12` + `SidebarTrigger` + back arrow; contenedor `max-w-6xl`; stepper en read-only          |
| 2 | Observar metadata                                           | Iconos `IdCard` (NIT) y `Calendar` (creado / actualizado, `shortDate` + tooltip `fullDateTime`)      |
| 3 | Click "Editar"                                              | Inputs habilitados; stepper conserva tabs sticky                                                     |
| 4 | Cambiar email                                               | Acepta                                                                                               |
| 5 | Click "Guardar"                                             | Toast "Cliente actualizado", vuelve a read-only                                                      |
| 6 | Click "Cancelar" tras otro cambio                           | Revierte a valores del servidor (re-sincroniza desde `client.data`)                                  |
| 7 | Compañía sin plantilla → editar                             | Solo Nombre + Identificación editables (mismo `FIELD_GRID_CLASSES` que `/clients/new`)               |

### 4.5 Eliminar cliente

| # | Acción                                                      | Resultado esperado                                        |
|---|-------------------------------------------------------------|-----------------------------------------------------------|
| 1 | Fila → menú (⋯) → "Eliminar"                                | `useConfirm` critical                                     |
| 2 | Confirmar                                                   | Toast "Cliente eliminado", fila desaparece                |

### 4.6 Template Builder · agregar sección y campos

**Ruta**: `/companies/m974x1bva3mcnk0wprrh44w1yh85gm9k/settings/client-template`

| #  | Acción                                                      | Resultado esperado                                                                                                  |
|----|-------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------|
| 1  | Navegar                                                     | Header `h-12` + `SidebarTrigger` (unificado con el resto de la app); `TemplateBuilder` carga la plantilla actual    |
| 2  | Layout                                                      | Canvas WYSIWYG ocupa el ancho completo; paleta a la derecha; ambos con scroll aislado                              |
| 3  | Tabs de secciones                                           | Strip horizontal con scroll; tab activo se centra; durante drag, los bordes auto-scroll                            |
| 4  | Click "+ Sección" → "Financiero"                            | Tab nueva, canvas vacío con empty state refinado                                                                    |
| 5  | Paleta categorizada                                         | Campos agrupados por categoría (Texto, Numérico, Fecha, Selección, Archivos, etc.) con icon Lucide + label          |
| 6  | Arrastrar `Currency` desde paleta al canvas                 | (vía `@dnd-kit`) Nuevo campo en grid 12-col; panel lateral abre con configuración                                   |
| 7  | Resize del campo en canvas                                  | Drag de bordes con snap al grid de 12 columnas; preview inmersivo durante el resize                                 |
| 8  | Label "Patrimonio", key auto-derivada `field_patrimonio`    | Key consistente; bloqueada si toca un fijo                                                                          |
| 9  | Click "Guardar"                                             | Toast "Plantilla guardada", `useGetClientTemplate` invalida caché                                                   |
| 10 | Volver a `/clients` y refrescar                             | Nueva columna "Patrimonio" (currency formateado COP) — visible si `showInTable=true`                                |

### 4.7 Template Builder · IA generate

| # | Acción                                                      | Resultado esperado                                        |
|---|-------------------------------------------------------------|-----------------------------------------------------------|
| 1 | Click "Asistente IA" → tab "Generar"                        | Modal abre                                                |
| 2 | Adjuntar `sample-contract.pdf`                              | Carga + procesa                                           |
| 3 | Click "Generar"                                             | Toast "Plantilla generada con N secciones"                |
| 4 | Revisar canvas                                              | Secciones aplicadas, campos fijos conservados             |
| 5 | Guardar                                                     | Persiste                                                  |

### 4.8 Template Builder · IA review

| # | Acción                                                      | Resultado esperado                                        |
|---|-------------------------------------------------------------|-----------------------------------------------------------|
| 1 | Click "Asistente IA" → tab "Revisar"                        | Lista de sugerencias (add / modify / remove)              |
| 2 | Instrucción "Priorizar compliance"                          | Acepta                                                    |
| 3 | Click "Revisar"                                             | Toast "N sugerencias", lista con badges de tipo           |
| 4 | Seleccionar subset + "Aplicar"                              | Se mezclan en canvas, user debe guardar                   |

### 4.9 Archivos / Imágenes

| # | Acción                                                      | Resultado esperado                                        |
|---|-------------------------------------------------------------|-----------------------------------------------------------|
| 1 | Campo `file`: subir PDF                                     | `generateUploadUrl` → POST → `storageId` guardado         |
| 2 | Campo `image`: subir JPG                                    | Preview thumbnail inline                                  |
| 3 | Abrir cliente                                               | URL firmada visible, link clickable                       |

## 5. Escenarios de error / edge cases

| #    | Acción                                                      | Resultado esperado                                        |
|------|-------------------------------------------------------------|-----------------------------------------------------------|
| 5.1  | Crear sin nombre                                            | Inline error "Requerido", botón disabled                  |
| 5.2  | Crear sin NIT                                               | Inline error                                              |
| 5.3  | Email mal formado                                           | Validación regex, error inline                            |
| 5.4  | Phone con caracteres inválidos                              | Error inline                                              |
| 5.5  | URL sin protocolo                                           | Error inline (debe empezar con http/https)                |
| 5.6  | Number fuera de `min` / `max`                               | Error inline                                              |
| 5.7  | Select con valor fuera de options                           | Error "Valor inválido"                                    |
| 5.8  | File > 10MB (default si no hay `maxFileSize`)               | Toast "Archivo demasiado grande"; archivo no se sube      |
| 5.9  | PDF sin texto extraíble (imagen escaneada)                  | Toast "No se pudo extraer texto del documento"            |
| 5.10 | Plantilla sin `field_name`                                  | `clientTemplates.save` rechaza con `permissionDenied`/validación |
| 5.11 | Plantilla con keys duplicadas                               | Validación: "Campo duplicado"                             |
| 5.12 | Eliminar `field_name` en builder                            | UI bloquea (campo fijo no removible)                      |
| 5.13 | IA devuelve JSON inválido                                   | Toast "Error al procesar respuesta de IA"                 |
| 5.14 | IA sin `clients_useAI`                                      | `PermissionDeniedError` desde backend                     |
| 5.15 | Doble click "Guardar"                                       | Botón disabled durante `isPending`                        |
| 5.16 | Cambiar tipo de campo con datos existentes                  | Warning: "Los datos existentes pueden invalidarse"        |

## 6. Matriz de permisos

| Acción / UI                                  | Owner | Admin | Member | Asesor | Lector | Outsider |
|----------------------------------------------|-------|-------|--------|--------|--------|----------|
| Ver `/clients` (lista + detalle)             | ✅    | ✅    | ✅     | ✅     | ✅     | ❌       |
| Botón "Nuevo Cliente"                        | ✅    | ✅    | ✅     | ✅     | ❌     | ❌       |
| `clients.create` (API)                       | ✅    | ✅    | ✅     | ✅     | ❌     | ❌       |
| Menú fila → "Editar" + `clients.update`      | ✅    | ✅    | ✅     | ✅     | ❌     | ❌       |
| Menú fila → "Eliminar" + `clients.remove`    | ✅    | ✅    | ✅     | ❌     | ❌     | ❌       |
| Asistente IA (extract / generate / review)   | ✅    | ✅    | ✅     | ✅     | ❌     | ❌       |
| Exportar clientes (`clients_export`)         | ✅    | ✅    | ✅     | ✅     | ❌     | ❌       |
| Ver `/settings/client-template`              | ✅    | ✅    | ❌ *   | ❌ *   | ❌ *   | ❌       |
| Botón "Guardar" plantilla                    | ✅    | ✅    | ❌     | ❌     | ❌     | ❌       |
| `clientTemplates.save` (API)                 | ✅    | ✅    | ❌     | ❌     | ❌     | ❌       |

(*) `clientTemplates_view` está en roles Owner / Admin por defecto. Si
un rol custom lo habilita, la página carga en read-only y el botón
"Guardar" se oculta a menos que también tenga `clientTemplates_edit`.

(**) `clientTemplates.getByCompany` permite leer la plantilla cuando el
usuario tiene `clientTemplates_view` **o** `clients_view`. Esto es lo
que habilita que Asesor / Lector puedan renderizar el form dinámico de
`/clients/new` y `/clients/[id]` aun sin acceso al builder.

## 7. Verificaciones visuales (Aegis brand)

### Header & layout (consistencia cross-página)
- [ ] Header en lista, `/new`, detalle y builder = `h-12` con `SidebarTrigger` + `Separator` vertical.
- [ ] Contenedor de contenido en `/new` y detalle = `mx-auto max-w-6xl px-8 py-6`.
- [ ] Botones primarios usan `cursor-pointer`, sin tamaños hardcoded en iconos Lucide.

### Lista
- [ ] Toolbar responsive (search arriba, controles a la derecha en `lg`).
- [ ] Atajo `/` enfoca búsqueda; kbd visible cuando el input está vacío.
- [ ] Segmented control "Todos / Completos / Incompletos" con estado activo `bg-muted`.
- [ ] Dropdown "Columnas" oculto en mobile; persiste por compañía.
- [ ] Auto-load al hacer scroll (sin botón explícito de paginación).
- [ ] Renderers tipados por columna: currency COP (`$ 1.000.000`), date `dd MMM yyyy`, switch como badge, file/image clickable.
- [ ] Fila en hover con `bg-muted/40`.
- [ ] Empty states diferenciados: sin clientes, sin plantilla, sin resultados con filtros activos.

### Stepper (`/new` y detalle)
- [ ] Tabs en strip sticky `top-0` con `backdrop-blur` y edge fades laterales (linear gradient `from-background`).
- [ ] Tab activo se centra automáticamente al cambiar de paso.
- [ ] Badge de error rojo (`bg-destructive/15 text-destructive`) con conteo por sección al validar.
- [ ] Al guardar con errores, salta a la primera sección que tiene errores.

### Builder
- [ ] Canvas WYSIWYG full-width; paleta a la derecha; scroll aislado.
- [ ] Grid de 12 columnas visible; resize con snap; preview inmersivo durante drag.
- [ ] Tabs de secciones con scroll horizontal, auto-scroll del activo y edge auto-scroll mientras se arrastra.
- [ ] Paleta categorizada (Texto / Numérico / Fecha / Selección / Archivos / etc.) con icon Lucide.
- [ ] Empty state del canvas refinado.

### IA
- [ ] Overlay de extracción cubre el form en `/clients/new` con spinner + "Procesando documento…".
- [ ] Modal IA con header aegis-gold (`Sparkles`).
- [ ] Badge ✨ en campos rellenados por IA (`Sparkles` + `text-aegis-gold`).

### General
- [ ] Confirm eliminación tipo `critical` (destructive).
- [ ] Empty state lista con icon `Users` en circle `bg-aegis-sapphire/10`.
- [ ] Sin tokens legacy (`h-indigo`, `bg-rose-500`, `text-rose-500`).
- [ ] Sin imports de `@remixicon/react` (eliminado del proyecto).

## 8. Interacciones cross-módulo

- **Quotes** / **Policies** (consumidores futuros): seleccionarán
  clientes como **contratante** y **tomador** (picker por
  `search_name` / `search_identificationNumber`). Snapshot del nombre
  + NIT se guardará en `quotes` / `policies` para preservar históricos
  si el cliente es editado o eliminado.
- **Upload** (`convex/upload.ts`): el flujo `generateUploadUrl` es
  compartido con logos y templates; los `file` / `image` del cliente
  usan la misma ACL por compañía.
- **Roles / Members**: los permisos `clients_*` (6) y
  `clientTemplates_*` (2) están declarados en
  `convex/lib/permissions.ts` y distribuidos en los 5 role templates
  (`packages/roles/lib/role-templates.ts`). Asesor NO tiene
  `clients_delete`. Lector es read-only total.
- **Insurers / Lines of Business / Bonds**: catálogos independientes
  sin FK hacia clients.
- **Agents** (`convex/agents.ts`): `clientAgent` ejecuta las 3
  acciones IA; el `companyId` se pasa explícitamente para aislar
  threads + enforcement de permisos.
- **Logs** (futuro): `client_created`, `_updated`, `_deleted`,
  `clientTemplate_saved`, `client_ai_extract`, `client_ai_generate`,
  `client_ai_review`.
