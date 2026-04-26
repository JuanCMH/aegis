# QA Report · <Modulo> · YYYY-MM-DD

> Reporte de ejecucion de una corrida de QA manual o asistida por IA.
> Crear uno nuevo por sesion en `docs/qa/reports/`.

## 1. Metadata

- Modulo: `<module>`
- Fecha: `YYYY-MM-DD`
- Entorno: `local | staging | prod`
- Cuenta usada: `email@aegis.test`
- Company: `Nombre / companyId`
- Documento base: `docs/qa/<module>.md`
- Estado final: `PASS | PASS CON HALLAZGOS | FAIL`

## 2. Alcance ejecutado

- Superficies revisadas: `listado`, `creacion`, `detalle`, `builder`, etc.
- Precondiciones verificadas o bootstrap realizado.
- Escenarios ejecutados del documento base.
- Escenarios no ejecutados y por que.

## 3. Resumen ejecutivo

- Que funciono correctamente.
- Que quedo parcial.
- Que bloqueo o genero riesgo.

## 4. Hallazgos

Registrar solo lo que NO esta ok.

| ID | Severidad | Estado | Superficie | Resumen |
|----|-----------|--------|------------|---------|
| F-001 | alta | open | listado | ... |

Criterios:

- `alta`: rompe un flujo principal o deja datos incorrectos.
- `media`: el flujo funciona, pero con error visible, warning serio o UX inconsistente.
- `baja`: detalle menor, accesibilidad, copy, pulido visual o timing no bloqueante.
- `open`: sigue pendiente. **Estado por defecto al cerrar la corrida de QA.**
- `fixed`: se corrigio en una sesion posterior de desarrollo. **Nunca lo asigna QA.**
- `accepted`: se documenta pero no se corrige por decision explicita.

> Recordatorio (Regla cero, ver `docs/qa/README.md`): durante la corrida de QA
> NO se modifica codigo de la app. Todo hallazgo se cierra en `open` y la
> correccion se delega a una sesion separada de desarrollo.

Por cada hallazgo agrega detalle debajo de la tabla:

### F-001

- Ruta: `/companies/[id]/...`
- Pasos de reproduccion:
  1. ...
  2. ...
- Resultado esperado: ...
- Resultado actual: ...
- Evidencia: screenshot, consola, toast, comportamiento observado.
- Correccion aplicada: `no` (siempre durante QA; ver Regla cero).
- Referencia probable: `archivo.ext` para guiar a la sesion de desarrollo.

## 5. Cambios de datos, fixtures y documentacion

Durante la corrida de QA solo se permiten cambios en estos tres ambitos
(ver Regla cero en `docs/qa/README.md`). Si necesitaste tocar codigo de la
app para avanzar, **detente y registra el bloqueo como hallazgo `alta`** en
lugar de aplicar el cambio.

| Tipo | Descripcion | Archivos / origen |
|------|-------------|-------------------|
| data | bootstrap creado vía UI | `Convex / UI` |
| fixture | archivo agregado para QA | `public/qa/...` |
| docs | actualizacion del plan o setup compartido | `docs/qa/...` |

> No registrar aqui cambios de codigo. Si los hubo, son una violacion de
> Regla cero y deben revertirse antes de cerrar el reporte.

## 6. Estado de datos tras la corrida

- Cuentas creadas o usadas.
- Companys creadas o modificadas.
- Seeds nuevos.
- Fixtures creados.
- Datos que conviene reutilizar en futuras corridas.

## 7. Siguiente accion recomendada

- Corregir hallazgos abiertos.
- Repetir regresion puntual.
- Expandir cobertura de permisos, visual o cross-modulo.
