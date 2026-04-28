# QA · Companies (Ajustes de la agencia)

> Plan de pruebas manuales y guiadas por IA para el módulo
> **Companies / Ajustes de la agencia**.

## 1. Contexto

Configuración integral de la agencia: identidad de marca (logo, nombres,
documento, colores), contacto, ubicación y zona avanzada (código de
invitación, activación, eliminación). Se accede como **Sheet** desde
Sidebar › Configuración › "Ajustes de la agencia" o desde la paleta de
comandos (⌘K → "Ajustes"). Cada sección guarda independientemente vía
`companies.update` y el logo vía `companies.setLogo`. El placeholder de
logo (gradient + inicial) se mantiene cuando no hay imagen.

Excluye intencionalmente: régimen tributario, moneda por defecto y
zona horaria (decisión de producto). El alta de la agencia sigue siendo
mínima (solo nombre) y vive en `CreateCompanyModal`.

Fuera de alcance:

- `CreateCompanyModal` (cubierto en `members.md` / onboarding).
- Plantillas de cliente y póliza (rutas hijas en `/settings/*-template`,
  cubiertas en sus QA respectivos).
- Switch/listado de agencias (`CompanySwitcher`) — cubierto en `members.md`.

## 2. Precondiciones

Ver `docs/qa/_shared.md`.

Específicas:

- `Agencia Demo` con su `companyId` accesible y al menos un owner
  (`owner@aegis.test`) y un admin (`admin@aegis.test`).
- Una imagen local de prueba: PNG ≤ 2 MB en `public/qa/sample-logo.png`
  y un PNG > 2 MB para el camino de error (`public/qa/oversized-logo.png`).
- Permiso `company_edit` activo para el rol bajo prueba.

## 3. Mapa de rutas y componentes

| Ruta / entrada                                  | Archivo                                                                                  |
|-------------------------------------------------|------------------------------------------------------------------------------------------|
| Sidebar › Configuración › Ajustes (callback)    | `packages/companies/components/company-navigation.ts`                                    |
| ⌘K › "Ajustes de la agencia"                    | `packages/companies/components/company-command-palette.tsx`                              |
| Sheet montado en layout                         | `app/(app)/companies/[companyId]/layout.tsx`                                             |

| Componente clave                  | Archivo                                                                              |
|-----------------------------------|--------------------------------------------------------------------------------------|
| `CompanySettingsSheet`            | `packages/companies/components/settings/company-settings-sheet.tsx`                  |
| `BrandIdentitySection`            | `packages/companies/components/settings/brand-identity-section.tsx`                  |
| `ContactSection`                  | `packages/companies/components/settings/contact-section.tsx`                         |
| `LocationSection`                 | `packages/companies/components/settings/location-section.tsx`                        |
| `AdvancedSection`                 | `packages/companies/components/settings/advanced-section.tsx`                        |
| `LogoUploader`                    | `packages/companies/components/settings/logo-uploader.tsx`                           |
| `SettingsSection` (shell)         | `packages/companies/components/settings/settings-section.tsx`                        |
| `useDirtyRecord` (form helper)    | `packages/companies/components/settings/use-dirty-field.ts`                          |
| `useCompanySettingsSheet` (atom)  | `packages/companies/store/use-company-settings-sheet.ts`                             |
| `gradientForName` / `initialOf`   | `packages/companies/lib/company-visuals.ts`                                          |
| `companies.update`                | `convex/companies.ts`                                                                |
| `companies.setLogo`               | `convex/companies.ts`                                                                |
| `companies.getById`               | `convex/companies.ts` (devuelve `logoUrl`)                                           |
| `companies.newJoinCode`           | `convex/companies.ts`                                                                |
| `companies.remove`                | `convex/companies.ts`                                                                |

## 4. Escenarios happy-path

### 4.1 Abrir el sheet desde sidebar

**Cuenta**: `owner@aegis.test`
**Ruta inicial**: `/companies/[id]`

| # | Acción                                              | Resultado esperado                                                                |
|---|-----------------------------------------------------|-----------------------------------------------------------------------------------|
| 1 | Sidebar › Configuración › "Ajustes de la agencia"   | Sheet abre desde la derecha, max-w 2xl                                            |
| 2 | Observar header                                     | Icon `Settings2` sapphire, título "Ajustes de la agencia"                         |
| 3 | Observar secciones                                  | 4 cards: Identidad de marca, Contacto, Ubicación, Avanzado                        |
| 4 | Sin cambios, ningún botón "Guardar" visible         | Footer per-section solo aparece cuando hay cambios                                |

### 4.2 Abrir el sheet desde paleta de comandos

| # | Acción                                              | Resultado esperado                                                                |
|---|-----------------------------------------------------|-----------------------------------------------------------------------------------|
| 1 | Pulsar `⌘K` (Mac) o `Ctrl+K` (Linux/Win)            | Paleta abre                                                                       |
| 2 | Escribir "ajustes"                                  | Match "Ajustes de la agencia" bajo grupo Configuración                            |
| 3 | Enter                                               | Paleta cierra y sheet abre (mismo destino que 4.1)                                |

### 4.3 Subir un logo nuevo (drag & drop)

| # | Acción                                              | Resultado esperado                                                                |
|---|-----------------------------------------------------|-----------------------------------------------------------------------------------|
| 1 | Arrastrar `sample-logo.png` sobre el preview 80×80  | Borde sapphire + ring durante el drag                                             |
| 2 | Soltar                                              | Loader overlay → toast "Logo actualizado" → preview muestra la imagen             |
| 3 | Recargar la página, reabrir el sheet                | El logo persiste (storage + `logoUrl` en `getById`)                               |
| 4 | Observar `CompanySwitcher`                          | (Si ya integra `logoUrl`) muestra logo en el chip; si no, sigue mostrando inicial |

### 4.4 Cambiar logo via botón "Cambiar"

| # | Acción                                              | Resultado esperado                                                                |
|---|-----------------------------------------------------|-----------------------------------------------------------------------------------|
| 1 | Botón "Cambiar" → seleccionar otra imagen válida    | Toast "Logo actualizado" y preview reemplazado                                    |
| 2 | El blob anterior se borra del storage               | (Verificar en Convex Dashboard) solo queda 1 archivo asociado                     |

### 4.5 Quitar el logo

| # | Acción                                              | Resultado esperado                                                                |
|---|-----------------------------------------------------|-----------------------------------------------------------------------------------|
| 1 | Botón "Quitar" (variant ghost destructive)          | Toast "Logo eliminado"                                                            |
| 2 | Preview cambia a placeholder                        | Gradient + inicial del nombre comercial visibles                                  |
| 3 | Botón ahora muestra "Subir logo"                    | El de "Quitar" desaparece                                                         |

### 4.6 Editar identidad de marca (consolidada)

| # | Acción                                                                       | Resultado esperado                                                              |
|---|------------------------------------------------------------------------------|---------------------------------------------------------------------------------|
| 1 | Cambiar **Nombre comercial**                                                 | Aparece footer "Descartar / Guardar" en la card                                 |
| 2 | Editar Razón social                                                          | Footer permanece, contador de cambios reactivo                                  |
| 3 | Cambiar Tipo de documento a "NIT" y poner número `900.123.456-7`             | Campos aceptan input                                                            |
| 4 | Seleccionar color primario "aegis-sapphire" y secundario "emerald"           | Swatch se actualiza junto al picker                                             |
| 5 | Click "Guardar"                                                              | Botón muestra spinner + "Guardando" → toast "Identidad actualizada"             |
| 6 | Tras guardar                                                                 | El footer desaparece (dirty=false), valores persisten al reabrir el sheet      |

### 4.7 Editar contacto

| # | Acción                                                                | Resultado esperado                                                              |
|---|-----------------------------------------------------------------------|---------------------------------------------------------------------------------|
| 1 | Llenar email, teléfono, WhatsApp, sitio web (sin protocolo)           | Campos aceptan input                                                            |
| 2 | Click "Guardar"                                                       | Toast "Contacto actualizado"                                                    |
| 3 | URL `miagencia.com` se acepta sin esquema                             | Validación interna prefija `https://` mentalmente, pero lo guarda tal cual      |

### 4.8 Editar ubicación

| # | Acción                                                                | Resultado esperado                                                              |
|---|-----------------------------------------------------------------------|---------------------------------------------------------------------------------|
| 1 | País por defecto = "Colombia"                                         | Visible al primer render                                                        |
| 2 | Llenar Departamento "Cundinamarca", Ciudad "Bogotá", Dirección        | Campos free-text aceptan tildes y caracteres especiales                         |
| 3 | Click "Guardar"                                                       | Toast "Ubicación actualizada"                                                   |

### 4.9 Descartar cambios sin guardar

| # | Acción                                              | Resultado esperado                                                                |
|---|-----------------------------------------------------|-----------------------------------------------------------------------------------|
| 1 | Editar un campo cualquiera                          | Footer aparece                                                                    |
| 2 | Click "Descartar"                                   | Valores vuelven al snapshot del server, footer desaparece                         |
| 3 | Cerrar el sheet sin guardar                         | Al reabrir, nada cambió                                                           |

### 4.10 Sección Avanzado · Código de invitación

| # | Acción                                              | Resultado esperado                                                                |
|---|-----------------------------------------------------|-----------------------------------------------------------------------------------|
| 1 | Ver el código actual                                | 6 chars en mono, dentro de `code` con tracking-wider                              |
| 2 | Click "Copiar"                                      | Toast "Código copiado"; pegar en otro lado coincide                               |
| 3 | Click "Regenerar" → confirmar                       | Spinner en el icono → toast "Código regenerado" → código nuevo distinto al previo |
| 4 | (Opcional) Intentar unir con el código viejo        | Falla con `joinCodeInvalid` (cubierto en `members.md`)                            |

### 4.11 Sección Avanzado · Activar/Desactivar

| # | Acción                                              | Resultado esperado                                                                |
|---|-----------------------------------------------------|-----------------------------------------------------------------------------------|
| 1 | Toggle "Agencia activa" → off                       | Optimistic update; toast "Agencia desactivada"                                    |
| 2 | Recargar, reabrir el sheet                          | Toggle persiste en off                                                            |
| 3 | Reactivar                                           | Toast "Agencia activada"                                                          |

### 4.12 Sección Avanzado · Eliminar agencia (owner)

| # | Acción                                              | Resultado esperado                                                                |
|---|-----------------------------------------------------|-----------------------------------------------------------------------------------|
| 1 | Ver el bloque danger-zone con borde destructive     | Solo visible para owner                                                           |
| 2 | Click "Eliminar"                                    | Modal `useConfirm` con título y mensaje destructivo                               |
| 3 | Confirmar                                           | Toast "Agencia eliminada", sheet cierra, redirige a `/companies`                  |
| 4 | Verificar BD                                        | Doc de `companies` y `members` ligados eliminados                                 |

### 4.13 Modo solo lectura (sin `company_edit`)

**Cuenta**: `lector@aegis.test` (custom role sin `company_edit`).

| # | Acción                                              | Resultado esperado                                                                |
|---|-----------------------------------------------------|-----------------------------------------------------------------------------------|
| 1 | Abrir el sheet                                      | Banner ámbar "Estás viendo los ajustes en modo solo lectura"                      |
| 2 | Inputs                                              | Renderizan `readOnly` o `disabled`; el cursor no cambia a edit                    |
| 3 | Footer "Guardar"                                    | No aparece en ninguna sección                                                     |
| 4 | LogoUploader                                        | Botones "Cambiar/Quitar" ocultos, drag-drop ignora drops                          |
| 5 | Avanzado                                            | "Eliminar" oculto (no es owner), regen oculto, toggle activo oculto               |
| 6 | Código de invitación                                | Visible en lectura con botón "Copiar"                                             |

## 5. Escenarios de error / edge cases

| #    | Acción                                                        | Resultado esperado                                                          |
|------|---------------------------------------------------------------|------------------------------------------------------------------------------|
| 5.1  | Subir logo > 2 MB                                             | Toast "La imagen supera 2 MB", no se invoca `setLogo`                       |
| 5.2  | Subir archivo no soportado (SVG, GIF, PDF)                    | Toast "Formato no soportado. Usa PNG, JPG o WebP"                           |
| 5.3  | `generateUploadUrl` falla (red caída)                         | Toast "No se pudo iniciar la subida"                                        |
| 5.4  | `fetch` POST de la imagen retorna no-OK                       | Toast "Falló la subida del logo"                                            |
| 5.5  | `setLogo` falla (permiso revocado mid-flight)                 | Toast "No se pudo guardar el logo"                                          |
| 5.6  | Guardar Identidad con nombre vacío / solo espacios            | Toast "El nombre comercial es obligatorio", no se llama `update`            |
| 5.7  | Guardar Contacto con URL inválida (`http://`, `htp://x`)      | Toast "La URL del sitio web no es válida"                                    |
| 5.8  | Doble click rápido en "Guardar"                                | Botón disabled durante `isPending`, 1 sola mutación                          |
| 5.9  | Editar mientras otro miembro guarda → re-sync                 | Mi draft NO se pisa mientras lo edito (regla de `useDirtyRecord`)            |
| 5.10 | Editar, esperar a que el server emita un cambio externo       | Tras hacer "Descartar", el draft adopta los nuevos valores del server        |
| 5.11 | Regenerar código de invitación sin permiso `members_invite`   | Botón visible solo para `company_edit`; mutation rechaza con `permissionDenied` |
| 5.12 | Eliminar agencia siendo admin (no owner)                      | Bloque danger-zone oculto; mutation API rechaza                              |
| 5.13 | Eliminar y aceptar el confirm sin haberlo querido             | El confirm pide acción explícita; `Cancelar` aborta sin tocar BD             |
| 5.14 | Toggle activo con red caída                                   | Optimistic se revierte; toast "No se pudo cambiar el estado"                 |
| 5.15 | Sheet cerrado mientras una mutación está pendiente            | La mutación termina en background; al reabrir, el server muestra el estado  |
| 5.16 | Cambiar agencia (`CompanySwitcher`) con sheet abierto         | Sheet permanece abierto pero ahora muestra la nueva company (resync por `companyId`) |
| 5.17 | Nombre > 80 chars                                             | `maxLength=80`                                                               |
| 5.18 | Email malformado (sin @)                                      | HTML5 valida antes del submit                                                |
| 5.19 | Cambiar color primario y secundario al mismo valor            | Permitido (no hay regla que lo impida)                                       |

## 6. Matriz de permisos

| Acción / UI                                  | Owner | Admin | Member | Asesor (*) | Lector (*) | Outsider |
|----------------------------------------------|-------|-------|--------|------------|------------|----------|
| Abrir sheet "Ajustes de la agencia"          | ✅    | ✅    | ✅     | ✅         | ✅         | ❌       |
| Banner "solo lectura" visible                | ❌    | ❌    | ✅     | ✅         | ✅         | ❌       |
| LogoUploader (botones edit)                  | ✅    | ✅    | ❌     | ❌         | ❌         | ❌       |
| Editar Identidad de marca                    | ✅    | ✅    | ❌     | ❌         | ❌         | ❌       |
| Editar Contacto                              | ✅    | ✅    | ❌     | ❌         | ❌         | ❌       |
| Editar Ubicación                             | ✅    | ✅    | ❌     | ❌         | ❌         | ❌       |
| Copiar código de invitación                  | ✅    | ✅    | ✅     | ✅         | ✅         | ❌       |
| Regenerar código de invitación               | ✅    | ✅    | ❌     | ❌         | ❌         | ❌       |
| Toggle "Agencia activa"                      | ✅    | ✅    | ❌     | ❌         | ❌         | ❌       |
| Bloque "Eliminar agencia" visible            | ✅    | ❌    | ❌     | ❌         | ❌         | ❌       |
| Llamar `companies.update` (API)              | ✅    | ✅    | ❌     | ❌         | ❌         | ❌       |
| Llamar `companies.setLogo` (API)             | ✅    | ✅    | ❌     | ❌         | ❌         | ❌       |
| Llamar `companies.newJoinCode` (API)         | ✅    | ✅    | ❌     | ❌         | ❌         | ❌       |
| Llamar `companies.remove` (API)              | ✅    | ❌    | ❌     | ❌         | ❌         | ❌       |

(*) Asesor y Lector custom roles no tienen `company_edit` por default.

Leyenda: ✅ visible+funcional · ⚠️ visible pero bloqueado · ❌ oculto/404.

## 7. Verificaciones visuales (Aegis brand)

- [ ] Header del sheet con icon `Settings2` sobre `bg-aegis-sapphire/10`.
- [ ] Cada `SettingsSection` tiene su icon en círculo `bg-aegis-sapphire/10 text-aegis-sapphire` (sapphire).
- [ ] La sección **Avanzado** usa header en ámbar (`bg-amber-500/10 text-amber-600 dark:text-amber-400`), no sapphire.
- [ ] Sub-grupos "Documento" y "Colores" usan separador `border-t border-border/50` con label `text-[11px] uppercase tracking-wider`.
- [ ] El select **Tipo de documento** ocupa todo el ancho de su columna (`w-full`), no se queda en `w-fit`.- [ ] Banner solo lectura usa `border-amber-500/30 bg-amber-500/5`.
- [ ] Bloque danger-zone usa `border-destructive/30 bg-destructive/5` con texto `text-destructive`.
- [ ] Footer per-section sólo aparece con `dirty=true` y muestra "Descartar" (ghost) + "Guardar" (default).
- [ ] Spinner de guardado usa `Loader2 animate-spin` y label "Guardando".
- [ ] LogoUploader: preview 80×80 (`size-20 rounded-2xl`); placeholder = gradient (`gradientForName`) + inicial.
- [ ] Drag-over en uploader: borde sapphire + `ring-2 ring-aegis-sapphire/30`.
- [ ] Botón "Quitar" en uploader: variant ghost con texto/hover destructive.
- [ ] ColorPicker swatch 36×36 (`size-9 rounded-lg`) a la izquierda del Select.
- [ ] Código de invitación en `font-mono tracking-wider` dentro de `bg-muted/40` con borde.
- [ ] Sin `h-indigo`, `bg-rose-500`, `text-rose-500`, `text-red-500` ni colores ad-hoc en el DOM.
- [ ] Dark mode: textos legibles, ámbar y destructive con contraste correcto.

## 8. Interacciones cross-módulo

- **CompanySwitcher**: el `logoUrl` debería renderizarse aquí cuando esté
  presente (refactor pendiente: hoy muestra solo gradient + inicial).
  El placeholder usa los mismos `gradientForName` / `initialOf` de
  `packages/companies/lib/company-visuals.ts`.
- **Members**: regenerar el `joinCode` invalida invitaciones pendientes
  basadas en el código previo; cubierto desde `members.md`.
- **Roles**: el permiso `company_edit` controla el acceso a las
  mutaciones (`update`, `setLogo`, `newJoinCode`). `remove` está reservado
  para el owner por la regla `userId === company.userId`.
- **Auth / Convex storage**: `setLogo` borra el blob anterior con
  `ctx.storage.delete()` para evitar acumulación. `getById` y
  `getByIdPublic` resuelven `logoUrl` con `ctx.storage.getUrl(logo)`.
- **Sidebar / Command palette**: la entrada "Ajustes de la agencia" se
  registra en `company-navigation.ts` como callback `companySettings`,
  consumida tanto por `CompanyMenu` como por `CompanyCommandPalette`.
- **Logs** (futuro): registrar `company_updated`, `company_logo_changed`,
  `company_joincode_regenerated`, `company_active_toggled`,
  `company_deleted`.
- **Reportes / branding** (futuro): los `primaryColor` / `secondaryColor`
  se usarán en exportes PDF para acentos visuales.
