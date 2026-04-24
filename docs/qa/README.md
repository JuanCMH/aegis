# QA · Guía de pruebas manuales y AI-driven

Este directorio contiene un **plan de pruebas vivo** para cada módulo de Aegis.
No son tests automatizados (eso vendrá con Playwright en el futuro): son
checklists navegables por un humano o por un agente de IA con acceso a
navegador (Playwright MCP, browser-use, etc.).

## Estructura

```
docs/qa/
  README.md          ← este archivo
  _template.md       ← plantilla canónica: copia y rellena por módulo
  _shared.md         ← seed data, cuentas, URLs, convenciones globales
  <module>.md        ← un archivo por módulo (members, roles, clients, …)
```

## Convenciones

1. **Un archivo por módulo**, nombre en kebab-case singular: `members.md`,
   `lines-of-business.md`.
2. **8 secciones fijas** (ver `_template.md`) en orden y con los mismos
   títulos: contexto, precondiciones, rutas, happy-path, errores, permisos,
   visual, cross-módulo. Esto permite que la IA navegue por `##` headings.
3. **Tablas Markdown** para pasos y matrices de permisos (fáciles de
   parsear y de leer).
4. **Referencias exactas**: URLs, labels de botones entre comillas, iconos
   Lucide por nombre, tokens de color con su variable `aegis-*`.
5. Cada escenario numerado `4.1`, `4.2`, … para referenciarlo en PRs
   ("corrige §4.3 de members.md").

## Flujo para agregar un módulo nuevo

1. `cp docs/qa/_template.md docs/qa/<module>.md`.
2. Rellena cada sección.
3. Añádelo al índice de abajo.
4. Commit junto al módulo (`feat(<module>): …` + `docs(qa): plan for <module>`).

## Instrucciones para un agente de IA de QA

Eres un agente de QA que opera un navegador. Para cada `<module>.md`:

1. Lee **§1 Contexto** para saber qué estás probando.
2. Lee **§2 Precondiciones** y verifica el estado inicial (cuentas, seed).
   Si falta algo, detente y reporta.
3. Lee **§3 Mapa de rutas** para ubicarte.
4. Ejecuta **§4 Happy-path** en orden. Marca `[PASS]` / `[FAIL]` por paso y
   captura screenshot en los fallos.
5. Ejecuta **§5 Edge cases**. Espera errores controlados (toasts, mensajes
   in-line), no crashes.
6. Ejecuta **§6 Matriz de permisos** cerrando sesión y entrando con cada
   cuenta seed del rol correspondiente.
7. Inspecciona el DOM contra **§7 Visual**: clases CSS computadas, ausencia
   de tokens legacy (`h-indigo`, `bg-rose-500`, `text-rose-500`).
8. Ejecuta **§8 Cross-módulo** cruzando con otros módulos listados.
9. Reporta: total `PASS` / `FAIL` / `SKIPPED`, screenshots, console errors.

No modifiques código de la app. Solo observa y reporta.

## Índice de módulos

| Módulo                 | Archivo                   | Estado           |
|------------------------|---------------------------|------------------|
| Members + Invitations  | `members.md`              | ✅ documentado   |
| Roles                  | `roles.md`                | ✅ documentado   |
| Insurers               | `insurers.md`             | ✅ documentado   |
| Lines of Business      | `lines-of-business.md`    | ⏳ pendiente     |
| Bonds (Amparos)        | `bonds.md`                | ⏳ pendiente     |
| Clients                | `clients.md`              | ⏳ pendiente     |
| Quotes                 | `quotes.md`               | ⏳ pendiente     |
| Policies               | `policies.md`             | ⏳ pendiente     |
| Dashboard              | `dashboard.md`            | ⏳ pendiente     |
| Logs (Audit)           | `logs.md`                 | ⏳ pendiente     |
