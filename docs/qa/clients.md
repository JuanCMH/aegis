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

- `Agencia Demo` con plantilla seed que contenga al menos:
  - Sección "Identificación" con campos `field_name` (text),
    `field_identificationNumber` (text).
  - Sección "Contacto" con `field_email` (email), `field_phone` (phone).
- Al menos 1 cliente seed:
  - "ACME S.A.S.", NIT `900123456`, email `contacto@acme.test`.
- Un PDF de prueba: `/public/qa/sample-contract.pdf` (contrato genérico
  con nombre, NIT, email, dirección) — usado por las pruebas de IA.

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
| Handlers + validación        | `convex/clients.ts`, `convex/clientTemplates.ts`                                  |
| Acciones IA                  | `convex/clientActions.ts`                                                         |

## 4. Escenarios happy-path

### 4.1 Listado y paginación

**Cuenta**: `owner@aegis.test`
**Ruta**: `/companies/[demo]/clients`

| # | Acción                                        | Resultado esperado                                                       |
|---|-----------------------------------------------|--------------------------------------------------------------------------|
| 1 | Navegar                                       | Header "Lista de Clientes", columnas = campos de la plantilla            |
| 2 | Observar fila "ACME S.A.S."                   | Nombre + NIT + columnas dinámicas                                        |
| 3 | Scroll al fondo                               | "Cargar más" dispara paginación (page size 25)                           |
| 4 | Click en fila                                 | Navega a `/clients/[id]`                                                 |

### 4.2 Crear cliente manual

| # | Acción                                                      | Resultado esperado                                        |
|---|-------------------------------------------------------------|-----------------------------------------------------------|
| 1 | Click "Nuevo Cliente"                                       | Navega a `/clients/new`, stepper visible                  |
| 2 | Rellenar nombre "Globex Corp"                               | Input acepta                                              |
| 3 | Rellenar NIT "901987654"                                    | Input acepta                                              |
| 4 | Avanzar secciones → rellenar email "hi@globex.test"         | Field email válido                                        |
| 5 | Click "Guardar"                                             | Toast "Cliente creado", redirige a `/clients/[id]`        |
| 6 | Volver al listado                                           | Nueva fila presente                                       |

### 4.3 Crear cliente con IA (extract)

| # | Acción                                                      | Resultado esperado                                        |
|---|-------------------------------------------------------------|-----------------------------------------------------------|
| 1 | `/clients/new` → clip 📎 "Adjuntar documento"               | File picker acepta PDF                                    |
| 2 | Subir `sample-contract.pdf`                                 | Loader, toast "Procesando…"                               |
| 3 | Respuesta IA                                                | Campos coincidentes se rellenan; toast "N campos extraídos"|
| 4 | Campos rellenados por IA                                    | Marcados con badge ✨ `Sparkles` aegis-gold                |
| 5 | Ajustar manualmente + Guardar                               | Cliente persistido                                        |

### 4.4 Editar cliente

| # | Acción                                                      | Resultado esperado                                        |
|---|-------------------------------------------------------------|-----------------------------------------------------------|
| 1 | `/clients/[id]`                                             | Stepper en modo read-only                                 |
| 2 | Click "Editar"                                              | Inputs habilitados                                        |
| 3 | Cambiar email                                               | Acepta                                                    |
| 4 | Click "Guardar"                                             | Toast "Cliente actualizado", vuelve a read-only           |
| 5 | Click "Cancelar" tras otro cambio                           | Revierte a valores del servidor                           |

### 4.5 Eliminar cliente

| # | Acción                                                      | Resultado esperado                                        |
|---|-------------------------------------------------------------|-----------------------------------------------------------|
| 1 | Fila → menú (⋯) → "Eliminar"                                | `useConfirm` critical                                     |
| 2 | Confirmar                                                   | Toast "Cliente eliminado", fila desaparece                |

### 4.6 Template Builder · agregar sección y campos

**Ruta**: `/companies/[demo]/settings/client-template`

| # | Acción                                                      | Resultado esperado                                                |
|---|-------------------------------------------------------------|-------------------------------------------------------------------|
| 1 | Navegar                                                     | `TemplateBuilder` carga la plantilla actual                        |
| 2 | Click "+ Sección" → "Financiero"                            | Tab nueva, canvas vacío                                           |
| 3 | Arrastrar `Currency` desde paleta                           | Nuevo campo en canvas, panel lateral abre                         |
| 4 | Label "Patrimonio", key auto-derivada `field_patrimonio`    | Key kebab/camel consistente; bloqueada si toca un fijo            |
| 5 | Click "Guardar"                                             | Toast "Plantilla guardada", `useGetClientTemplate` invalida caché |
| 6 | Volver a `/clients` y refrescar                             | Nueva columna "Patrimonio" (currency formateado COP)              |

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
| 5.8  | File > 10MB                                                 | Toast "Archivo demasiado grande"                          |
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

## 7. Verificaciones visuales (Aegis brand)

- [ ] Columnas dinámicas formatean por tipo: currency en COP (`$
      1.000.000`), date en `dd MMM yyyy`, switch como badge on/off.
- [ ] Fila en hover con `bg-muted/40`.
- [ ] Badge ✨ en campos rellenados por IA (`Sparkles` + `text-aegis-gold`).
- [ ] Stepper con secciones como tabs (horizontal scroll en mobile).
- [ ] Builder canvas con drop-zones `border-dashed border-aegis-slate/30`.
- [ ] Paleta con tokens por tipo de campo (icon Lucide + label).
- [ ] Modal IA con header aegis-gold (`Sparkles`).
- [ ] Loader durante extract/generate con spinner + texto "Procesando
      documento…".
- [ ] Confirm eliminación tipo `critical` (destructive).
- [ ] Empty state lista con icon `Users` en circle `bg-aegis-sapphire/10`.
- [ ] Sin tokens legacy (`h-indigo`, `bg-rose-500`, `text-rose-500`).

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
