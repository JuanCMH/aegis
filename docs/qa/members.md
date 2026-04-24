# QA · Members + Invitations

## 1. Contexto

Gestión del equipo de una agencia: listar miembros, cambiar sus roles
(literal admin/member o rol custom), expulsarlos, salir voluntariamente,
y invitar gente nueva por email con un enlace firmado que expira en 7 días.

Se abre como **sheet lateral** desde el item "Miembros" en la sección
"Agencia" del sidebar (contexto: `/companies/[companyId]/...`), y
el flujo de invitación vive en `/auth?invitation=<token>`.

## 2. Precondiciones

Ver `docs/qa/_shared.md`.

Específicas de este módulo:

- Existe "Agencia Demo" con: owner, admin, member, asesor, lector.
- Existen los custom roles **Asesor** y **Lector** (ver `_shared.md`).
- Para probar el envío real de email: `AEGIS_SEND_INVITATIONS=true` y
  `AEGIS_SITE_URL=http://localhost:3000` en `.env.local`. Sin ese flag,
  el modal muestra el link copiable pero no se envía email — válido para QA
  del flow UI.

## 3. Mapa de rutas y componentes

| Ruta / Entrada                                    | Archivo                                                            |
|---------------------------------------------------|--------------------------------------------------------------------|
| Sidebar › Agencia › Miembros (abre sheet)          | `packages/members/components/members-sheet.tsx`                    |
| `/auth?invitation=<token>`                        | `app/auth/page.tsx` + `packages/auth/components/auth-screen.tsx`   |

| Componente                  | Archivo                                                      |
|-----------------------------|--------------------------------------------------------------|
| `MembersSheet`              | `packages/members/components/members-sheet.tsx`              |
| `useMembersSheet` (jotai)   | `packages/members/store/use-members-sheet.ts`                |
| `MembersTable`              | `packages/members/components/members-table.tsx`              |
| `MemberRow`                 | `packages/members/components/member-row.tsx`                 |
| `RoleBadge`                 | `packages/members/components/role-badge.tsx`                 |
| `PendingInvitationsList`    | `packages/members/components/pending-invitations-list.tsx`   |
| `InviteMemberModal`         | `packages/members/components/modals/invite-member-modal.tsx` |
| `InvitationAcceptCard`      | `packages/invitations/components/invitation-accept-card.tsx` |
| `SidebarUser` ("Salir…")    | `components/aegis/sidebar-user.tsx`                          |

Backend: `convex/members.ts`, `convex/invitations.ts`,
`convex/errors/members.ts`, `convex/errors/invitations.ts`.

## 4. Escenarios happy-path

### 4.1 Ver listado de miembros (admin)

**Cuenta**: `admin@aegis.test`
**Entrada**: Sidebar › Agencia › **Miembros** (abre sheet lateral)

| # | Acción                                        | Resultado esperado                                                        |
|---|-----------------------------------------------|---------------------------------------------------------------------------|
| 1 | Click en "Miembros" del sidebar               | Se abre sheet lateral derecho con overlay; el sidebar se colapsa          |
| 2 | Observar título                               | "Miembros de la agencia" + subtítulo "Gestiona quién tiene acceso…"       |
| 3 | Observar tabla                                | Orden: Owner primero, luego admins, luego miembros alfabético             |
| 4 | Chip del owner                                | Amber con icon `Crown` y label "Propietario"                              |
| 5 | Chip de admin                                 | Sapphire con icon `ShieldCheck` y label "Administrador"                   |
| 6 | Chip del asesor (custom role)                 | Cyan con icon `ShieldCheck` y nombre del rol "Asesor"                     |
| 7 | Fila propia                                   | Muestra "(tú)" gris al lado del nombre y no tiene menú `⋯`                |
| 8 | Fila del owner                                | No tiene menú `⋯`                                                         |

### 4.2 Invitar a un nuevo miembro con rol literal

**Cuenta**: `admin@aegis.test`

| # | Acción                                              | Resultado esperado                                                |
|---|-----------------------------------------------------|-------------------------------------------------------------------|
| 1 | Click "Invitar miembro"                             | Abre `AegisModal` con icon `UserPlus` sapphire                    |
| 2 | Email: `nuevo@aegis.test`, Rol: "Miembro"           | Campos editables; botón "Invitar y copiar enlace" habilitado      |
| 3 | Submit                                              | Toast `"Invitación creada — enlace copiado"` < 1 s                |
| 4 | Vista cambia a paso de éxito                        | Banner emerald "Invitación enviada a nuevo@aegis.test"            |
| 5 | Input readonly con URL                              | Formato: `http://localhost:3000/auth?invitation=<token>`          |
| 6 | Click icon `Copy`                                   | Toast "Enlace copiado"                                            |
| 7 | Click "Listo"                                       | Modal cierra                                                      |
| 8 | Panel "Invitaciones pendientes" aparece             | Borde amber; expandido por defecto; muestra `nuevo@aegis.test`    |
| 9 | Metadata                                            | "Invitado hace instantes · expira en 7 días" + chip "Miembro"     |

### 4.3 Invitar con rol custom

| # | Acción                                   | Resultado esperado                                  |
|---|------------------------------------------|-----------------------------------------------------|
| 1 | Abrir modal, Rol: grupo "Asesor"         | Select muestra secciones "Roles del sistema" y "Roles personalizados" |
| 2 | Submit                                   | Invitación creada con `roleType: "custom"`          |
| 3 | En panel pendiente                       | Chip cyan con nombre "Asesor"                       |

### 4.4 Aceptar invitación (usuario nuevo)

**Cuenta**: `outsider@aegis.test` (no autenticado)

| # | Acción                                                   | Resultado esperado                                              |
|---|----------------------------------------------------------|-----------------------------------------------------------------|
| 1 | Pegar el link `…/auth?invitation=<token>` en navegador   | Página de auth con `InvitationAcceptCard` arriba de los tabs    |
| 2 | Card muestra                                             | Nombre de la agencia, rol propuesto, email destino, icon `MailOpen` |
| 3 | Iniciar sesión con el email exacto de la invitación      | Auto-accept dispara; toast `"Te uniste a <Agencia>"`            |
| 4 | Redirect                                                 | Navega a `/companies/<id>`                                      |
| 5 | En BD                                                    | `invitations.status = "accepted"`, `acceptedAt` presente         |

### 4.5 Aceptar invitación (usuario ya autenticado)

**Cuenta**: `member@aegis.test` ya autenticado, pero ese no es el email invitado → ver §5.4.

**Cuenta**: usuario autenticado con el email correcto, no miembro aún:

| # | Acción                                   | Resultado esperado                          |
|---|------------------------------------------|---------------------------------------------|
| 1 | Abrir link de invitación estando logueado | Auto-accept inmediato, toast + redirect     |

### 4.6 Cambiar rol de un miembro

**Cuenta**: `admin@aegis.test`

| # | Acción                                        | Resultado esperado                           |
|---|-----------------------------------------------|----------------------------------------------|
| 1 | Click `⋯` en fila de `member@`                | Dropdown con "Cambiar rol" + ítems           |
| 2 | Click "Administrador"                         | Toast "Rol actualizado"; chip cambia a sapphire |
| 3 | Reabrir menú, "Administrador" está deshabilitado | ✅                                         |
| 4 | Click en rol custom "Lector"                  | Chip cambia a cyan "Lector"                  |

### 4.7 Expulsar miembro

| # | Acción                                    | Resultado esperado                                          |
|---|-------------------------------------------|-------------------------------------------------------------|
| 1 | `⋯` → "Eliminar miembro"                  | Abre confirmación crítica con nombre del miembro            |
| 2 | Cancelar                                  | No pasa nada                                                |
| 3 | Repetir y Confirmar                       | Toast "Miembro eliminado"; fila desaparece                  |
| 4 | Sesión del expulsado (en otra ventana)    | Pierde acceso inmediato a recursos de la agencia            |

### 4.8 Revocar invitación pendiente

| # | Acción                                    | Resultado esperado                          |
|---|-------------------------------------------|---------------------------------------------|
| 1 | En panel, click icon `X` destructivo      | Confirmación `type="warning"`               |
| 2 | Confirmar                                 | Toast "Invitación revocada"; fila se retira |
| 3 | Acceder al link revocado                  | Card muestra "Invitación revocada"          |

### 4.9 Reenviar invitación (regenera token)

| # | Acción                                    | Resultado esperado                                          |
|---|-------------------------------------------|-------------------------------------------------------------|
| 1 | Click icon `RefreshCw` en fila pendiente  | Toast "Invitación renovada — enlace copiado"; clipboard actualizado |
| 2 | Timestamp "Invitado …" se actualiza       | Sigue siendo el tiempo original; `expiresAt` se reinicia    |
| 3 | Link antiguo                              | Deja de funcionar (token cambió)                            |

### 4.10 Copiar link manualmente

| # | Acción                                | Resultado esperado        |
|---|---------------------------------------|---------------------------|
| 1 | Click icon `Link` en fila pendiente   | Toast "Enlace copiado"    |

### 4.11 Salir de la agencia (self-leave)

**Cuenta**: `member@aegis.test`, dentro de `/companies/[demo]/…`

| # | Acción                                              | Resultado esperado                                |
|---|-----------------------------------------------------|---------------------------------------------------|
| 1 | Click avatar sidebar                                | Dropdown abre                                     |
| 2 | Ver ítem "Salir de la agencia"                      | Visible, destructivo (rojo), icon `LogOut`        |
| 3 | Click                                               | Confirmación crítica                              |
| 4 | Confirmar                                           | Toast "Has salido de la agencia" + redirect `/companies` |
| 5 | Intentar volver a la URL anterior                   | Denegado (query devuelve null o redirect)         |

### 4.12 Buscar miembros

| # | Acción                                    | Resultado esperado                               |
|---|-------------------------------------------|--------------------------------------------------|
| 1 | Escribir parte de un nombre en el input   | Tabla se filtra en vivo (case-insensitive)       |
| 2 | Escribir parte de un email                | También matchea                                  |
| 3 | Borrar input                              | Muestra todos otra vez                           |
| 4 | Query sin resultados                      | Empty state "Sin resultados"                     |

## 5. Escenarios de error / edge cases

| #   | Acción                                                                        | Resultado esperado                                                   |
|-----|-------------------------------------------------------------------------------|----------------------------------------------------------------------|
| 5.1 | Invitar con email inválido                                                    | `<input type="email">` bloquea submit nativamente                    |
| 5.2 | Invitar un email que ya es miembro                                            | Toast "Este usuario ya es miembro de la agencia"                     |
| 5.3 | Invitar un email que ya tiene invitación pendiente no expirada                | Toast "Ya existe una invitación pendiente para este correo…"        |
| 5.4 | Aceptar invitación con sesión de otro email                                   | Card muestra warning "Estás autenticado como X. Cierra sesión…"      |
| 5.5 | Acceder a link con token inválido                                             | Card "Enlace inválido"                                               |
| 5.6 | Acceder a link ya aceptado                                                    | Card "Invitación ya aceptada" (tono success)                         |
| 5.7 | Acceder a link revocado                                                       | Card "Invitación revocada" (destructive)                             |
| 5.8 | Invitación expirada (forzar `expiresAt` pasado en Convex dashboard)           | Card "Invitación expirada" + `status` se marca `expired` en accept   |
| 5.9 | Admin intenta cambiar rol del owner                                           | El menú no aparece (owner no tiene `⋯`). Backend: error server-side. |
| 5.10| Admin intenta cambiar su propio rol                                           | Fila propia sin menú. Backend: `cannotChangeOwnRole`                 |
| 5.11| Admin intenta eliminarse a sí mismo                                           | Fila propia sin menú. Backend: `cannotRemoveSelf`                    |
| 5.12| Eliminar al último admin de la agencia                                        | Toast "No puedes eliminar al último administrador de la agencia"     |
| 5.13| Owner intenta "Salir de la agencia"                                           | Ítem oculto (canLeave=false)                                         |
| 5.14| Único admin no-owner intenta salir                                            | Toast "Eres el único administrador. Asigna otro admin antes de salir" |
| 5.15| Invitar con email = email propio                                              | Toast "No puedes invitarte a ti mismo"                               |
| 5.16| Invitación con `customRoleId` de otra agencia (manipulado por devtools)       | Toast "El rol personalizado no pertenece a esta agencia"             |

## 6. Matriz de permisos

Acceso y acciones visibles/ejecutables por rol. Leyenda: ✅ visible+funcional ·
⚠️ visible pero bloqueado (tooltip/disable) · ❌ oculto · 🚫 bloqueado server-side.

| Acción / UI                              | Owner | Admin | Member default | Asesor (custom) | Lector (custom) | Outsider |
|------------------------------------------|-------|-------|----------------|-----------------|-----------------|----------|
| Abrir sheet "Miembros" (sidebar)         | ✅    | ✅    | ❌ (vacío)     | ❌              | ❌              | ❌ (sin sidebar) |
| Ver tabla de miembros                    | ✅    | ✅    | ❌             | ❌              | ❌              | ❌       |
| Ver panel "Invitaciones pendientes"      | ✅    | ✅    | ❌             | ❌              | ❌              | ❌       |
| Botón "Invitar miembro"                  | ✅    | ✅    | ❌             | ❌              | ❌              | ❌       |
| Crear invitación (backend)               | ✅    | ✅    | 🚫             | 🚫              | 🚫              | 🚫       |
| Menú `⋯` en fila                         | ✅    | ✅    | ❌             | ❌              | ❌              | ❌       |
| Cambiar rol                              | ✅    | ✅    | 🚫             | 🚫              | 🚫              | 🚫       |
| Expulsar miembro                         | ✅    | ✅    | 🚫             | 🚫              | 🚫              | 🚫       |
| Revocar invitación pendiente             | ✅    | ✅    | 🚫             | 🚫              | 🚫              | 🚫       |
| Reenviar invitación                      | ✅    | ✅    | 🚫             | 🚫              | 🚫              | 🚫       |
| Copiar link de invitación                | ✅    | ✅    | ❌             | ❌              | ❌              | ❌       |
| "Salir de la agencia" en sidebar         | ❌    | ✅ (si hay otro admin) | ✅ | ✅              | ✅              | N/A      |
| Aceptar invitación con email match       | N/A   | N/A   | N/A            | N/A             | N/A             | ✅       |

Para probar "Member con permiso granular": crear rol custom con sólo
`members_view` y verificar que la tabla carga pero los botones no aparecen.

## 7. Verificaciones visuales (Aegis brand)

- [ ] Header del icon en `InviteMemberModal`: fondo `bg-aegis-sapphire/10`, border `border-aegis-sapphire/10`, text `text-aegis-sapphire`.
- [ ] Chip owner: `bg-aegis-amber/10 text-aegis-amber border-aegis-amber/20` + icon `Crown`.
- [ ] Chip admin: `bg-aegis-sapphire/10 text-aegis-sapphire border-aegis-sapphire/20` + icon `ShieldCheck`.
- [ ] Chip custom: `bg-aegis-cyan/10 text-aegis-cyan border-aegis-cyan/20` + icon `ShieldCheck`.
- [ ] Chip member: `bg-aegis-slate/10 text-aegis-steel border-aegis-slate/30` + icon `User`.
- [ ] Panel "Invitaciones pendientes": `border-aegis-amber/30 bg-aegis-amber/5`, header icon `MailOpen` en `bg-aegis-amber/15`.
- [ ] Empty state: círculo `size-12 rounded-full bg-aegis-sapphire/10 text-aegis-sapphire`, título graphite, subtítulo steel.
- [ ] Skeletons visibles durante loading inicial.
- [ ] Botón "Eliminar miembro" en dropdown: clase `text-destructive`.
- [ ] `InvitationAcceptCard` default: `border-aegis-sapphire/20 bg-aegis-sapphire/5`.
- [ ] `InvitationAcceptCard` destructiva: `border-destructive/30 bg-destructive/5`.
- [ ] `InvitationAcceptCard` success: `border-aegis-emerald/30 bg-aegis-emerald/5`.
- [ ] Sin `h-indigo`, `bg-rose-500`, `text-rose-500` en DOM (inspect + grep en DevTools).
- [ ] Focus visible en todos los botones/inputs (anillo sapphire).
- [ ] Dark mode: colores siguen legibles, chips mantienen contraste AA.

## 8. Interacciones cross-módulo

- **Roles (custom)**:
  - Crear un custom role nuevo → debe aparecer en el `Select` de
    `InviteMemberModal` (sección "Roles personalizados") y en el dropdown
    "Cambiar rol" de `MemberRow`.
  - Eliminar un custom role asignado a miembros → esos miembros vuelven a
    rol literal "member" (comportamiento actual de `convex/roles.remove`).
- **Auth**:
  - Flujo completo `?invitation=<token>` → sign-up con email correcto →
    auto-accept → redirect `/companies/<id>`.
  - Sign-out y reingreso no debe disparar accept dos veces (idempotencia
    por `acceptedRef` + `status === accepted`).
- **Companies**:
  - Al eliminar una company (owner), todas sus invitaciones pendientes
    deberían quedar huérfanas → **QA sugerido**: verificar que el link a
    token de una company eliminada muestra "Enlace inválido" (company no
    existe). _Nota: si se considera crítico, agregar cleanup en
    `companies.remove` como mejora futura._
- **Logs (cuando se implemente)**:
  - Invitar, aceptar, revocar, expulsar, salir y cambiar rol deben
    registrar una entrada en `logs` con el tipo adecuado
    (`create`/`update`/`delete`/`info`) y `affectedEntityType = "member"`.
- **Sidebar**:
  - Link "Miembros" en `CompanySidebar` debe marcar activo en la ruta.

## 9. Notas conocidas / deuda

- El email envía desde `Aegis <aegis@n3xus.cloud>` — ajustar a dominio
  productivo cuando esté listo.
- No hay UI aún para transferir propiedad de la agencia; owner sólo puede
  salir eliminando la company (fuera de alcance de este módulo).
- El `AEGIS_SITE_URL` debe quedar consistente entre preview y prod para
  que los links de invitación funcionen.
