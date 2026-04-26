# QA · Guía de pruebas manuales y AI-driven

Este directorio contiene un **plan de pruebas vivo** para cada módulo de Aegis.
No son tests automatizados (eso vendrá con Playwright en el futuro): son
checklists navegables por un humano o por un agente de IA con acceso a
navegador (Playwright MCP, browser-use, etc.).

La práctica queda separada en dos capas:

- **Plan base del módulo**: define qué se debe probar.
- **Reporte de ejecución**: documenta qué se probó realmente, qué falló,
   qué se corrigió y qué quedó pendiente.

## Regla cero · QA no corrige código

Una sesión de QA tiene **una sola responsabilidad**: ejecutar el plan,
observar el comportamiento real y documentar hallazgos. **No** se permite
modificar código de la app, schema de Convex, componentes, hooks, lógica
de negocio ni nada que viva fuera de `docs/qa/`, `public/qa/` o datos
sembrados desde la propia UI.

- ✅ Permitido durante QA:
  - Crear/editar cuentas, companies, plantillas, clientes, etc. **vía UI**
    como bootstrap reproducible.
  - Subir o generar fixtures dentro de `public/qa/`.
  - Editar `docs/qa/_shared.md` y `docs/qa/<module>.md` para reflejar el
    estado real del entorno (placeholders → datos reales).
  - Crear el reporte de la corrida en `docs/qa/reports/`.
- ❌ Prohibido durante QA:
  - Editar archivos en `app/`, `components/`, `convex/`, `packages/`,
    `lib/`, `hooks/`, `proxy.ts`, configs, etc.
  - Aplicar "fixes rápidos" aunque el bug parezca trivial.
  - Refactorizar nada, ni siquiera comentarios o tipos.

Toda corrección de código se delega a una **sesión separada de desarrollo**
que toma el reporte como input. El campo `Corrección aplicada` del reporte
debe quedar siempre en `no` durante la corrida de QA, y los hallazgos en
`open`. El estado `fixed` lo asigna después la sesión de desarrollo que
cierra el hallazgo, no el QA.

## Estructura

```
docs/qa/
  README.md          ← este archivo
  _template.md       ← plantilla canónica: copia y rellena por módulo
   _report-template.md← plantilla canónica para reportes de corrida
  _shared.md         ← seed data, cuentas, URLs, convenciones globales
  <module>.md        ← un archivo por módulo (members, roles, clients, …)
   reports/           ← un reporte por corrida de QA
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
6. **Todo lo que no esté OK se registra como hallazgo** en un reporte de
   corrida bajo `docs/qa/reports/`.
7. **Ningún cambio de código** se hace durante la corrida de QA. Solo se
   permiten cambios en datos sembrados vía UI, fixtures bajo `public/qa/`
   y documentación bajo `docs/qa/`. Toda corrección de código va a una
   sesión separada de desarrollo (ver "Regla cero").

## Estandar de ejecución

Para cada corrida de QA:

1. Usa `docs/qa/<module>.md` como contrato de prueba.
2. Crea un reporte nuevo desde `docs/qa/_report-template.md` en
   `docs/qa/reports/YYYY-MM-DD-<module>-<scope>.md`.
3. Verifica o bootstrapea precondiciones reales.
   Si el documento tiene placeholders o seeds no verificables, sustitúyelos
   por bootstrap real y actualiza `docs/qa/_shared.md` o `docs/qa/<module>.md`.
4. Ejecuta la UI completa del flujo acordado.
5. Clasifica el resultado:
   - `PASS`: todo lo ejecutado quedó correcto.
   - `PASS CON HALLAZGOS`: el flujo funciona, pero quedaron issues abiertos.
   - `FAIL`: hubo bloqueo funcional o inconsistencia seria.
6. Registra hallazgos con severidad y estado (siempre `open` durante QA).
7. Registra cambios de **datos, fixtures o documentación** hechos en la
   sesión. Recuerda: nunca cambios de código (ver "Regla cero").
8. Deja trazabilidad del estado final de datos reutilizables.

## Regla de hallazgos

**Hallazgo = cualquier comportamiento que no cumpla lo esperado**, aunque el
flujo principal siga funcionando.

Casos típicos que sí deben documentarse:

- errores funcionales
- warnings de consola relevantes
- problemas de accesibilidad
- estados visuales incorrectos
- validaciones inconsistentes
- dirty-state incorrecto
- textos engañosos o toasts erróneos
- discrepancias entre documentación y estado real del entorno

Casos típicos que no cuentan como hallazgo del módulo:

- warnings esperables del entorno dev sin impacto del módulo
- errores provocados por referencias obsoletas de la herramienta de automatización
- acciones inválidas del tester que no representan uso real

## Convención de severidad

- `alta`: rompe el flujo principal o deja datos incorrectos.
- `media`: el flujo funciona, pero con error visible o riesgo operativo.
- `baja`: no bloquea; suele ser accesibilidad, UX, copy o pulido.

## Convención de estado

- `open`: pendiente por corregir. **Estado por defecto al cerrar la corrida de QA.**
- `fixed`: corregido en una sesión posterior de desarrollo. **Nunca lo asigna QA.**
- `accepted`: conocido y documentado, pero se decide no corregir.

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
9. Crea un reporte de corrida en `docs/qa/reports/` con:
   - estado final `PASS`, `PASS CON HALLAZGOS` o `FAIL`
   - hallazgos abiertos (todos en `open`)
   - cambios de datos / fixtures / documentación de la sesión
   - estado final de datos y fixtures
10. Reporta: total `PASS` / `FAIL` / `SKIPPED`, screenshots, console errors.

**No modifiques código de la app bajo ninguna circunstancia.** Si detectas
un bug "obvio", no lo arregles: documéntalo en el reporte y déjalo en
`open`. Tu único output de cambios permitido es: bootstrap de datos vía
UI, fixtures en `public/qa/` y documentación en `docs/qa/`. Cualquier
edición fuera de esos paths es una violación de la Regla cero.

## Índice de módulos

| Módulo                 | Archivo                   | Estado           |
|------------------------|---------------------------|------------------|
| Members + Invitations  | `members.md`              | ✅ documentado   |
| Roles                  | `roles.md`                | ✅ documentado   |
| Insurers               | `insurers.md`             | ✅ documentado   |
| Lines of Business      | `lines-of-business.md`    | ✅ documentado   |
| Bonds (Amparos)        | `bonds.md`                | ✅ documentado   |
| Clients                | `clients.md`              | ✅ documentado   |
| Quotes                 | `quotes.md`               | ⏳ pendiente     |
| Policies               | `policies.md`             | ✅ documentado   |
| Dashboard              | `dashboard.md`            | ⏳ pendiente     |
| Logs (Audit)           | `logs.md`                 | ⏳ pendiente     |
