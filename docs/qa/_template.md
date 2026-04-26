# QA · <Módulo>

> Plantilla canónica. Copia a `docs/qa/<module>.md` y rellena cada sección.
> No elimines secciones: marca como "N/A" si no aplica.
> Cada ejecución real de esta guía debe generar además un reporte en
> `docs/qa/reports/` usando `docs/qa/_report-template.md`.

## 1. Contexto

Qué hace el módulo, a qué usuario sirve, límites de alcance.
Mantener en 3–6 líneas.

## 2. Precondiciones

Ver `docs/qa/_shared.md` para cuentas/companies/URLs comunes.

Precondiciones específicas del módulo:

- Estado de BD requerido (ej: "al menos 1 company con 2 admins")
- Datos seed adicionales
- Feature flags necesarios

## 3. Mapa de rutas y componentes

| Ruta                     | Archivo                                  | Propósito |
|--------------------------|------------------------------------------|-----------|
| `/ruta/ejemplo`          | `app/…/page.tsx`                         | …         |

| Componente clave         | Archivo                                  | Rol       |
|--------------------------|------------------------------------------|-----------|
| `ComponentName`          | `packages/<module>/components/…tsx`      | …         |

## 4. Escenarios happy-path

### 4.1 Nombre del escenario

**Cuenta**: `admin@aegis.test`
**Ruta inicial**: `/companies/[id]/…`

| # | Acción                          | Resultado esperado                 |
|---|---------------------------------|------------------------------------|
| 1 | …                               | …                                  |

### 4.2 Siguiente escenario

…

## 5. Escenarios de error / edge cases

| # | Acción                          | Resultado esperado                 |
|---|---------------------------------|------------------------------------|
| 1 | …                               | Toast "…"                          |

## 6. Matriz de permisos

| Acción / UI                 | Owner | Admin | Member | Asesor | Lector | Outsider |
|-----------------------------|-------|-------|--------|--------|--------|----------|
| Ver página                  | ✅    | ✅    | …      | …      | …      | ❌       |
| Botón "…"                   | …     | …     | …      | …      | …      | …        |

Leyenda: ✅ visible+funcional · ⚠️ visible pero bloqueado · ❌ oculto/404.

## 7. Verificaciones visuales (Aegis brand)

- [ ] Header con icon `<Lucide>` y fondo `bg-aegis-sapphire/10`.
- [ ] …
- [ ] Sin `h-indigo`, `bg-rose-500`, `text-rose-500` en DOM.
- [ ] Dark mode coherente si el módulo se renderiza en dark.

## 8. Interacciones cross-módulo

- **<Otro módulo>**: …
- **Auth**: …
- **Logs**: …
