# QA · Roles

> Plan de pruebas manuales y guiadas por IA para el módulo **Roles
> personalizados**. Cada sección es auto-contenida; un agente QA puede
> ejecutarlas en orden usando Playwright/Chromium.

## 1. Contexto

El módulo de roles permite a los administradores de una agencia crear,
editar y eliminar roles personalizados con un set granular de 46 permisos
agrupados en 13 dominios. Los roles personalizados se pueden asignar a
miembros desde la tabla de miembros o al invitar. La literal "admin"
siempre tiene todos los permisos; la literal "member" sin `customRoleId`
usa `memberPermissionDefaults`.

Fuera de alcance en este plan:

- Permisos literales (owner/admin/member) — cubierto en `members.md`.
- Flujo de invitación con rol personalizado — cubierto en `members.md §4`.

## 2. Precondiciones

Ver `docs/qa/_shared.md` para cuentas/companies/URLs comunes.

Precondiciones específicas:

- `Agencia Demo` (`owner@aegis.test`) ya existe y tiene al menos:
  - 1 rol personalizado "Asesor" (creado vía `seed.ts`)
  - 1 rol personalizado "Lector" (creado vía `seed.ts`)
- `asesor@aegis.test` asignado al rol "Asesor".
- `lector@aegis.test` asignado al rol "Lector".
- `member@aegis.test` usa literal `member` sin `customRoleId`.

## 3. Mapa de rutas y componentes

| Ruta                                       | Archivo                                                         |
|--------------------------------------------|-----------------------------------------------------------------|
| Sidebar › Agencia › Roles (sheet)         | `packages/roles/components/roles-sheet.tsx`                     |

| Componente clave           | Archivo                                                              | Rol                                       |
|----------------------------|----------------------------------------------------------------------|-------------------------------------------|
| `RoleList`                 | `packages/roles/components/role-list.tsx`                            | Grid de cards + empty/loading states      |
| `RoleCard`                 | `packages/roles/components/role-card.tsx`                            | Card con member count y menu editar/borrar|
| `PermissionMatrix`         | `packages/roles/components/permission-matrix.tsx`                    | Grupos colapsables con toggles            |
| `RoleFormModal`            | `packages/roles/components/modals/role-form-modal.tsx`               | Modal unificado crear/editar              |
| `permission-groups.ts`     | `packages/roles/lib/permission-groups.ts`                            | Agrupación de 46 permisos                 |
| `role-templates.ts`        | `packages/roles/lib/role-templates.ts`                               | Plantillas (Advisor/Reader/Empty/Member)  |
| `roles.getWithCounts`      | `convex/roles.ts`                                                    | Query con `memberCount` por rol           |

## 4. Escenarios happy-path

### 4.1 Ver listado de roles con contador de miembros

**Cuenta**: `owner@aegis.test`
**Ruta inicial**: `/companies/[demo]/settings/roles`

| # | Acción                                                | Resultado esperado                                                                 |
|---|-------------------------------------------------------|------------------------------------------------------------------------------------|
| 1 | Navegar a la ruta                                     | Header "Roles personalizados" con icon `ShieldCheck` cyan                           |
| 2 | Observar grid                                         | 2 cards: "Asesor" (1 miembro) y "Lector" (1 miembro)                                |
| 3 | Hover sobre card                                      | Borde cambia a `aegis-sapphire/30` con sombra sutil                                 |
| 4 | Observar contador de permisos en cada card            | Muestra "X de 46 permisos" consistente con la plantilla seed                        |

### 4.2 Crear rol desde plantilla "Sólo lectura"

**Cuenta**: `owner@aegis.test`
**Entrada**: Sidebar › Agencia › **Roles** (sheet lateral)

| # | Acción                                                              | Resultado esperado                                                    |
|---|---------------------------------------------------------------------|-----------------------------------------------------------------------|
| 1 | Click "Nuevo rol"                                                   | Abre `RoleFormModal` en modo creación, autofocus en campo nombre      |
| 2 | Escribir "Analista"                                                 | Campo acepta hasta 60 chars                                           |
| 3 | Click dropdown "Plantillas" → "Sólo lectura"                        | Matrix se rellena con 12 permisos *_view activos, resto en `false`    |
| 4 | Observar badge grupo "Agencia"                                      | Muestra "1/4" con color `aegis-sapphire`                              |
| 5 | Expandir grupo "Pólizas"                                            | Ver check en `policies_view` y `policies_viewCommissions` únicamente  |
| 6 | Click "Crear rol"                                                   | Modal cierra, toast "Rol creado", card "Analista" aparece en grid     |
| 7 | Verificar contador                                                  | "12 de 46 permisos" y "0 miembros asignados"                          |

### 4.3 Editar rol existente

**Cuenta**: `owner@aegis.test`

| # | Acción                                                              | Resultado esperado                                                    |
|---|---------------------------------------------------------------------|-----------------------------------------------------------------------|
| 1 | Card "Asesor" → menú (⋯) → "Editar"                                 | Modal abre en modo edición con nombre "Asesor" prellenado             |
| 2 | Matrix muestra estado actual                                        | Permisos activos ya marcados; grupos con selección parcial expanded   |
| 3 | Desactivar `quotes_useAI`                                           | Badge grupo "Cotizaciones" baja 1 unidad                              |
| 4 | Renombrar a "Asesor Senior"                                         | Input acepta cambio                                                   |
| 5 | Click "Guardar cambios"                                             | Toast "Rol actualizado", card muestra nuevo nombre y contador correcto|
| 6 | Miembros asignados al rol                                           | `asesor@aegis.test` sigue asignado (no pierde permisos)               |

### 4.4 Toggle grupo completo (master checkbox)

**Cuenta**: `owner@aegis.test`

| # | Acción                                                              | Resultado esperado                                                    |
|---|---------------------------------------------------------------------|-----------------------------------------------------------------------|
| 1 | Abrir modal "Nuevo rol" con plantilla "En blanco"                   | Todos los permisos en 0                                               |
| 2 | Click en checkbox master del grupo "Clientes"                       | Los 6 permisos del grupo se marcan, badge "6/6" verde                 |
| 3 | Desmarcar `clients_delete` manualmente                              | Checkbox master pasa a estado `indeterminate` (ícono `MinusIcon`)     |
| 4 | Click master de nuevo                                               | Se desmarcan todos los del grupo, badge vuelve a "0/6"                |

### 4.5 Plantilla "Asesor" auto-rellena permisos operativos

**Cuenta**: `owner@aegis.test`

| # | Acción                                                              | Resultado esperado                                                    |
|---|---------------------------------------------------------------------|-----------------------------------------------------------------------|
| 1 | Dropdown "Plantillas" → "Asesor"                                    | Se activan 22 permisos aprox.                                         |
| 2 | Grupos "Pólizas", "Cotizaciones", "Clientes"                        | Todos con lectura + creación/edición activas                          |
| 3 | Grupos "Roles", "Miembros", "Registros"                             | Todos en 0                                                            |
| 4 | Cerrar sin guardar                                                  | Estado no persiste (al reabrir modal, vuelve a plantilla Member)      |

### 4.6 Eliminar rol sin miembros asignados

**Cuenta**: `owner@aegis.test`
**Precondición**: crear rol "Temporal" con 0 miembros.

| # | Acción                                                              | Resultado esperado                                                    |
|---|---------------------------------------------------------------------|-----------------------------------------------------------------------|
| 1 | Card "Temporal" → menú → "Eliminar"                                 | `useConfirm` de tipo `critical` muestra mensaje "Esta acción no..."   |
| 2 | Confirmar                                                           | Toast "Rol eliminado", card desaparece del grid                       |

### 4.7 Eliminar rol con miembros asignados

**Cuenta**: `owner@aegis.test`
**Precondición**: rol "Asesor" con `asesor@aegis.test` asignado.

| # | Acción                                                              | Resultado esperado                                                    |
|---|---------------------------------------------------------------------|-----------------------------------------------------------------------|
| 1 | Card "Asesor" → menú → "Eliminar"                                   | Dialogo avisa: "Este rol está asignado a 1 miembro. Volverá a..."     |
| 2 | Confirmar                                                           | Rol eliminado + `asesor@aegis.test` queda con `customRoleId: null`    |
| 3 | Abrir sidebar › Agencia › **Miembros** (sheet lateral)              | Fila `asesor@aegis.test` muestra badge "Miembro" (literal default)    |
| 4 | Sesión en `asesor@aegis.test`                                       | No puede crear cotizaciones (pierde `quotes_create`)                  |

## 5. Escenarios de error / edge cases

| #   | Acción                                                              | Resultado esperado                                                    |
|-----|---------------------------------------------------------------------|-----------------------------------------------------------------------|
| 5.1 | Crear rol con nombre vacío                                          | Botón "Crear rol" disabled mientras `name.trim() === ""`              |
| 5.2 | Crear rol con 0 permisos marcados                                   | Se permite (puede ser rol "placeholder"); sólo nombre es requerido    |
| 5.3 | Crear rol con nombre > 60 chars                                     | Input limita a 60 (atributo `maxLength`)                              |
| 5.4 | Doble click rápido en "Crear rol"                                   | Botón pasa a disabled durante `isPending`; 1 sola mutación            |
| 5.5 | Admin sin `roles_create` intenta click "Nuevo rol"                  | Botón oculto (RoleGate). Llamada directa a mutation → ConvexError     |
| 5.6 | Editar rol y guardar sin cambios                                    | Mutation se ejecuta igual; toast "Rol actualizado" (idempotente)      |
| 5.7 | Eliminar rol mientras está abierto el modal de edición en otra tab  | Al refetch, rol desaparece; modal muestra error al guardar            |
| 5.8 | Cambiar `customRoleId` de un miembro mientras su rol se edita       | Convex live-query refresca `memberCount` automáticamente              |
| 5.9 | Abrir modal en edit con rol y cerrar sin guardar → abrir "Nuevo"    | `useEffect` reinicia estado a plantilla Member (no arrastra estado)   |
| 5.10| Checkbox master en indeterminate → click                            | Marca todos (no desmarca)                                             |
| 5.11| Aplicar plantilla con permisos desmarcados manualmente              | Se sobrescribe estado completo; usuario puede deshacer con otra plantilla |
| 5.12| Sesión expira durante edición                                      | Mutation falla con `unauthorized`; toast mostrado vía `getErrorMessage`|
| 5.13| Crear rol con nombre duplicado                                      | **Permitido** (no hay uniqueness) — los nombres pueden repetirse      |
| 5.14| Eliminar último rol personalizado                                   | Grid vuelve a estado empty con icon `ShieldCheck` + CTA               |
| 5.15| Abrir sheet sin companyId válido                                   | `useCompanyId` redirige o devuelve "skip" (no crashea)                |
| 5.16| Abrir modal, aplicar plantilla, cerrar, reabrir                     | Estado plantilla no persiste; vuelve a defaults                       |

## 6. Matriz de permisos

| Acción / UI                      | Owner | Admin | Member | Asesor | Lector | Outsider |
|----------------------------------|-------|-------|--------|--------|--------|----------|
| Abrir sheet "Roles" (sidebar)    | ✅    | ✅    | ❌ (vacío)    | ❌ (*) | ❌ (*) | ❌ (sin sidebar) |
| Botón "Nuevo rol"                | ✅    | ✅    | ❌     | ❌     | ❌     | ❌       |
| Menú "Editar" en card            | ✅    | ✅    | ❌     | ❌     | ❌     | ❌       |
| Menú "Eliminar" en card          | ✅    | ✅    | ❌     | ❌     | ❌     | ❌       |
| Ver contadores de miembros       | ✅    | ✅    | ❌     | ❌     | ❌     | ❌       |
| Llamar `roles.create` (API)      | ✅    | ✅    | ❌     | ❌ (**)| ❌     | ❌       |
| Llamar `roles.update` (API)      | ✅    | ✅    | ❌     | ❌ (**)| ❌     | ❌       |
| Llamar `roles.remove` (API)      | ✅    | ✅    | ❌     | ❌ (**)| ❌     | ❌       |

(*) Asesor y Lector custom roles en seed **no** incluyen `roles_view`. Si un
rol custom sí lo incluye, el usuario ve la página en modo lectura: cards
visibles sin menú de acciones (dependen de `roles_edit`/`roles_delete`).

(**) Los roles custom seed "Asesor" y "Lector" no tienen permisos
`roles_*`. Si al crearlos se marcaran, podrían acceder a las mutations.

Leyenda: ✅ visible+funcional · ⚠️ visible pero bloqueado · ❌ oculto/404.

## 7. Verificaciones visuales (Aegis brand)

- [ ] Header con icon `ShieldCheck` sobre fondo `bg-aegis-cyan/10`.
- [ ] Cards con borde `border-border/60` y hover `border-aegis-sapphire/30`.
- [ ] Icon chip en card usa `bg-aegis-cyan/10 text-aegis-cyan`.
- [ ] Badge de contador grupo en matrix:
  - `0/N` → outline + `text-aegis-steel`
  - `0<X<N` → `border-aegis-sapphire/30 text-aegis-sapphire`
  - `N/N` → `bg-aegis-emerald/10 text-aegis-emerald`
- [ ] Icono indeterminate muestra `MinusIcon` (no `CheckIcon`).
- [ ] Badge "destructivo" aparece en keys destructivos (`*_delete`,
  `company_delete`, `members_expel`) con `text-destructive`.
- [ ] Empty state con ícono en circle `bg-aegis-cyan/10`.
- [ ] Modal header con icon `ShieldCheck` cyan (no sapphire).
- [ ] Confirm de eliminación usa variant `critical` (destructive).
- [ ] Sin clases `h-indigo`, `bg-rose-500`, `text-rose-500` en DOM.
- [ ] Dark mode coherente (cards, matrix, badges).

## 8. Interacciones cross-módulo

- **Members**: al eliminar un rol, todos los `members.customRoleId` que lo
  referencien pasan a `undefined`. La tabla de miembros debe reflejarlo
  (badge pasa de custom a "Miembro" literal).
- **Invitations**: al invitar con `roleType: "custom"` y `customRoleId`
  de un rol eliminado antes de aceptar, la aceptación debe degradar a
  `member` literal (o fallar con error explícito — revisar
  `convex/invitations.ts`).
- **Auth**: un cambio de permisos en el rol del usuario activo debe
  reflejarse reactivamente vía `useHasPermissions` sin refresh manual.
- **RoleGate**: todos los componentes que consumen permisos del rol
  (botones, menús, rutas) se esconden/muestran de inmediato.
- **Logs**: cuando el módulo de logs exista, deberá registrar
  `role_created`, `role_updated`, `role_deleted`, `member_role_changed`.
