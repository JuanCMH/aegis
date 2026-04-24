# QA · Setup compartido

Seed data, cuentas, URLs y convenciones aplicables a todos los módulos.
Cada archivo `<module>.md` lo referencia desde §2 Precondiciones.

## Cuentas seed

Todas con contraseña `Test1234!` salvo indicación contraria.

| Email                | Rol en "Agencia Demo"        | Propósito de prueba                         |
|----------------------|------------------------------|---------------------------------------------|
| owner@aegis.test     | Owner (creador)              | Permisos implícitos totales, no puede salir |
| admin@aegis.test     | Admin literal                | Matriz permisos = todas                     |
| member@aegis.test    | Member literal (sin custom)  | `memberPermissionDefaults`                  |
| asesor@aegis.test    | Member con custom role       | Role "Asesor" → clients/quotes              |
| lector@aegis.test    | Member con custom role       | Role "Lector" → solo `*_view`               |
| outsider@aegis.test  | Sin membresía                | Probar acceso denegado, aceptar invitación  |

## Companies seed

| Nombre           | Owner            | Miembros adicionales                     | Color primario     |
|------------------|------------------|------------------------------------------|--------------------|
| Agencia Demo     | owner@aegis.test | admin, member, asesor, lector            | `aegis-sapphire`   |
| Agencia Vacía    | owner@aegis.test | (sólo owner)                             | `aegis-cyan`       |

## Roles custom seed (en Agencia Demo)

- **Asesor**: `clients_view`, `clients_create`, `clients_edit`, `clients_export`,
  `clients_useAI`, `quotes_*`, `policies_view`, `policies_create`, `policies_edit`.
- **Lector**: sólo permisos terminados en `_view` + `dashboard_viewOperational`.

## URLs base

| Entorno  | URL                                  |
|----------|--------------------------------------|
| Local    | `http://localhost:3000`              |
| Staging  | `https://aegis-staging.n3xus.cloud`  |
| Prod     | TBD                                  |

## Variables de entorno relevantes para QA

| Variable                    | Valor local típico               | Efecto                                |
|-----------------------------|----------------------------------|---------------------------------------|
| `AEGIS_SEND_INVITATIONS`    | `false` (default) · `true` real  | Activa envío real de emails Resend    |
| `AEGIS_SITE_URL`            | `http://localhost:3000`          | Base del link en emails               |
| `AUTH_RESEND_KEY`           | `re_...`                         | API key de Resend                     |

> En local con `AEGIS_SEND_INVITATIONS=false`: no se envía email, pero el
> modal sigue mostrando el link copiable — basta con eso para QA del flow.

## Convenciones UX que todo módulo cumple

- Todo toast aparece en **menos de 1 s** tras la acción.
- Toasts destructivos/de error en tono `destructive`; éxito en emerald.
- Confirmaciones de acciones destructivas vía `useConfirm` con `type="critical"`.
- Modales (`AegisModal`) cierran con **ESC**, click fuera, o botón X.
- Tablas muestran **skeleton** durante loading, **empty state** ilustrado
  cuando no hay datos, y **"sin resultados"** cuando el filtro no matchea.
- Iconos vienen exclusivamente de `lucide-react` (ver `docs/BRAND.md §7`).
- Tokens de color: sólo `aegis-*` + los semánticos de shadcn. **Nunca**
  `h-indigo`, `bg-rose-500`, `text-rose-500`.

## Checklist global de regresión visual (aplicable a cualquier pantalla)

- [ ] Sidebar: colapsa con el trigger y persiste en mobile.
- [ ] Breadcrumb: enlaces en `text-aegis-steel`, página actual en graphite.
- [ ] Header de modal: icon en círculo `bg-aegis-sapphire/10`.
- [ ] Botones primarios: fondo `aegis-sapphire`, hover coherente.
- [ ] Focus visible con anillo `ring-aegis-sapphire/40`.
- [ ] Sin errores en la consola del navegador tras navegación normal.
