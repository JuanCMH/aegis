# QA Report · Clients · 2026-04-25

> Primera corrida de QA manual asistida por navegador para el modulo de clientes.
> Incluye bootstrap real del entorno local, ejecucion de UI end-to-end y trazabilidad de hallazgos.

## 1. Metadata

- Modulo: `clients`
- Fecha: `2026-04-25`
- Entorno: `local`
- Cuenta usada: `qa-clients@aegis.test`
- Company: `Agencia QA Clients / m974x1bva3mcnk0wprrh44w1yh85gm9k`
- Documento base: `docs/qa/clients.md`
- Estado final: `PASS CON HALLAZGOS` (F-001 y F-002 corregidos en seguimiento)

## 2. Alcance ejecutado

- Superficies revisadas: `template builder`, `clients list`, `new client`, `client detail`.
- Bootstrap realizado porque la documentacion inicial tenia placeholders y no habia seeds reales reutilizables.
- Se verifico propagacion real de cambios de plantilla hacia listado, creacion y detalle.
- No se ejecuto en esta corrida: permisos multirol, exportacion, IA `extract/generate/review`, archivos e imagenes, eliminacion de cliente.

## 3. Resumen ejecutivo

- El flujo principal del modulo funciona end-to-end.
- La plantilla dinamica se puede editar y sus cambios impactan correctamente listado, creacion y detalle.
- La validacion de formularios responde bien con errores inline, badge por seccion y toast.
- El detalle soporta `Editar`, `Cancelar` con rollback y `Guardar` con persistencia real.
- Quedaron dos hallazgos no bloqueantes: un warning de accesibilidad en el panel de configuracion y una senal inconsistente de dirty-state al salir del builder justo despues de guardar.

## 4. Hallazgos

| ID | Severidad | Estado | Superficie | Resumen |
|----|-----------|--------|------------|---------|
| F-001 | baja | fixed | template builder | El panel `Configurar campo` emite warnings de accesibilidad por `DialogContent` sin descripcion asociada. |
| F-002 | baja | fixed | template builder | Tras guardar la plantilla, hubo una ventana corta donde el builder todavia se comporto como si tuviera cambios pendientes y disparo un `beforeunload`. |

### F-001

- Ruta: `/companies/m974x1bva3mcnk0wprrh44w1yh85gm9k/settings/client-template`
- Pasos de reproduccion:
  1. Abrir el builder de plantilla.
  2. Agregar o seleccionar un campo.
  3. Abrir `Configurar campo`.
- Resultado esperado: panel sin warnings ARIA en consola.
- Resultado actual: aparecen warnings del tipo `Missing Description or aria-describedby={undefined} for {DialogContent}`.
- Evidencia: warning visible en consola del navegador durante la sesion.
- Correccion aplicada: `si`. Se reemplazo el `<p>` descriptivo por `SheetDescription` para que `DialogContent` quede asociado a una descripcion accesible.
- Archivo: `packages/clients/components/template-builder/field-config-panel.tsx`.

### F-002

- Ruta: `/companies/m974x1bva3mcnk0wprrh44w1yh85gm9k/settings/client-template`
- Pasos de reproduccion:
  1. Editar plantilla.
  2. Pulsar `Guardar`.
  3. Intentar navegar fuera inmediatamente despues.
- Resultado esperado: el estado de cambios pendientes se limpia apenas la persistencia termina y no aparece confirmacion extra.
- Resultado actual: aparecio un `beforeunload` en una ventana corta despues de guardar.
- Evidencia: dialogo interceptado durante la prueba manual.
- Correccion aplicada: `si`. Se introdujo `isDirty` derivado de un snapshot serializado del ultimo estado persistido + bandera sincrona `justSavedRef` que neutraliza `beforeunload` en el mismo tick que el backend confirma. El boton `Guardar` ahora se deshabilita cuando no hay cambios y el header muestra `cambios sin guardar`.
- Archivo: `packages/clients/components/template-builder/template-builder.tsx`.

## 5. Correcciones realizadas

| Tipo | Descripcion | Archivos |
|------|-------------|----------|
| data | Se creo cuenta reusable local para QA. | `Convex/Auth via UI` |
| data | Se creo la company `Agencia QA Clients`. | `Convex/Companies via UI` |
| data | Se guardo plantilla bootstrap con 4 campos base: nombre, identificacion, correo y telefono. | `Convex/clientTemplates via UI` |
| data | Se agrego una segunda seccion y campo currency `Patrimonio` visible en tabla para probar propagacion. | `Convex/clientTemplates via UI` |
| data | Se creo el cliente seed `ACME S.A.S.`. | `Convex/clients via UI` |
| data | Se creo el cliente `Globex Corp` para validar alta con plantilla expandida. | `Convex/clients via UI` |
| fixture | Se genero el fixture `public/qa/sample-contract.pdf` con texto extraible por `unpdf`. | `public/qa/sample-contract.pdf` |
| docs | Se reemplazaron placeholders por bootstrap real en la guia de clientes. | `docs/qa/clients.md` |
| docs | Se actualizo setup compartido con cuenta, company, URL local correcta y nota sobre seed roto. | `docs/qa/_shared.md` |

## 6. Estado de datos tras la corrida

- Cuenta reusable: `qa-clients@aegis.test` / `Test1234!`
- Company reusable: `Agencia QA Clients`
- Company URL: `http://localhost:7077/companies/m974x1bva3mcnk0wprrh44w1yh85gm9k`
- Cliente seed 1: `ACME S.A.S.` / `900123456`
- Cliente seed 2: `Globex Corp` / `901987654`
- Detalle `Globex Corp`: `http://localhost:7077/companies/m974x1bva3mcnk0wprrh44w1yh85gm9k/clients/kx70fxexwewzjfekbfsqybadmh85hzk0`
- Fixture verificado: `public/qa/sample-contract.pdf`
- Columnas activas en lista al cierre: `Nombre`, `Identificacion`, `Patrimonio`, `Creado`

## 7. Validaciones exitosas destacadas

- Builder:
  - agregar seccion
  - drag and drop de campo
  - renombrar campo
  - activar `En tabla`
  - guardar plantilla
- Listado:
  - shortcut `/` enfoca la busqueda
  - busqueda por texto funciona
  - tabla refleja columna dinamica `Patrimonio`
  - contador de clientes correcto
- Creacion:
  - stepper con secciones reales
  - error inline en email invalido
  - badge de error por seccion
  - toast de error
  - formateo currency en vivo
  - redireccion al detalle al guardar
- Detalle:
  - navegacion entre secciones
  - modo `Editar`
  - `Cancelar` revierte a estado servidor
  - `Guardar` persiste cambios

## 8. Siguiente accion recomendada

- Corregir `F-001` y `F-002`.
- Ejecutar segunda corrida del modulo cubriendo eliminacion, IA, archivos e imagenes.
- Sembrar cuentas multirol reales para validar `docs/qa/clients.md` §6 Matriz de permisos.
