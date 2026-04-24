# QA · Insurers (Aseguradoras)

> Plan de pruebas manuales y guiadas por IA para el módulo
> **Aseguradoras**.

## 1. Contexto

Catálogo de compañías aseguradoras con las que la agencia emite pólizas.
CRUD simple con metadatos de contacto (NIT/RUT, sitio web, email,
teléfono, notas). Soporta **archivar** (soft-disable) para ocultar
aseguradoras sin eliminar histórico. Las pólizas guardan el **nombre**
(string), por lo que eliminar una aseguradora no afecta las pólizas
existentes — solo impide seleccionarla en nuevas pólizas.

Fuera de alcance:

- Upload de logo (futuro enhancement).
- Vinculación con ramos / comisiones — se cubrirá en `policies.md` y
  `lines-of-business.md`.

## 2. Precondiciones

Ver `docs/qa/_shared.md` para cuentas/companies/URLs comunes.

Específicas:

- `Agencia Demo` con al menos 2 aseguradoras seed:
  - "Seguros Bolívar" (activa, NIT 860034589-6)
  - "Sura" (activa, NIT 890903407-9)
- `Agencia Vacía` sin aseguradoras.

## 3. Mapa de rutas y componentes

| Ruta                                          | Archivo                                                            |
|-----------------------------------------------|--------------------------------------------------------------------|
| `/companies/[id]/settings/insurers`           | `app/(app)/companies/[companyId]/settings/insurers/page.tsx`       |

| Componente clave        | Archivo                                                        |
|-------------------------|----------------------------------------------------------------|
| `InsurerList`           | `packages/insurers/components/insurer-list.tsx`                |
| `InsurerCard`           | `packages/insurers/components/insurer-card.tsx`                |
| `InsurerFormModal`      | `packages/insurers/components/modals/insurer-form-modal.tsx`   |
| `insurers.getByCompany` | `convex/insurers.ts`                                           |

## 4. Escenarios happy-path

### 4.1 Ver listado con scope "Activas"

**Cuenta**: `owner@aegis.test`
**Ruta**: `/companies/[demo]/settings/insurers`

| # | Acción                                    | Resultado esperado                                                    |
|---|-------------------------------------------|-----------------------------------------------------------------------|
| 1 | Navegar a la ruta                         | Header con icon `Building2` sapphire, subtítulo descriptivo           |
| 2 | Ver cards                                 | 2 cards ordenadas alfabéticamente (Seguros Bolívar, Sura)             |
| 3 | Observar avatar                           | Initials "SB" y "S" sobre `bg-aegis-sapphire/10`                      |
| 4 | Observar NIT                              | Se muestra en mono + prefijo "NIT ·"                                  |

### 4.2 Crear aseguradora nueva

**Cuenta**: `owner@aegis.test`

| # | Acción                                                    | Resultado esperado                                                    |
|---|-----------------------------------------------------------|-----------------------------------------------------------------------|
| 1 | Click "Nueva aseguradora"                                 | Modal abre con autofocus en Nombre                                    |
| 2 | Llenar: Nombre "Liberty Seguros", NIT "860039988-0"       | Campos aceptan input                                                  |
| 3 | Llenar web `liberty.co`, email `info@liberty.co`, tel     | Validación HTML nativa para type=url/email                            |
| 4 | Click "Crear aseguradora"                                 | Toast "Aseguradora creada", modal cierra, card aparece ordenada       |

### 4.3 Editar aseguradora existente

| # | Acción                                      | Resultado esperado                                                    |
|---|---------------------------------------------|-----------------------------------------------------------------------|
| 1 | Card → menú (⋯) → "Editar"                  | Modal abre en modo edición, valores prellenados                       |
| 2 | Cambiar email                               | Field actualiza                                                       |
| 3 | Click "Guardar cambios"                     | Toast "Aseguradora actualizada", card refleja nuevo email en línea 2  |

### 4.4 Archivar y restaurar

| # | Acción                                      | Resultado esperado                                                    |
|---|---------------------------------------------|-----------------------------------------------------------------------|
| 1 | Card "Sura" → menú → "Archivar"             | Toast "Aseguradora archivada", card desaparece del scope "Activas"    |
| 2 | Cambiar selector a "Todas"                  | Card "Sura" reaparece con opacity 70% y badge "Archivada" slate       |
| 3 | Menú → "Activar"                            | Toast "Aseguradora activada", opacidad vuelve a 100%, badge desaparece |
| 4 | Volver a selector "Activas"                 | Card permanece visible                                                |

### 4.5 Buscar por nombre y NIT

| # | Acción                                      | Resultado esperado                                                    |
|---|---------------------------------------------|-----------------------------------------------------------------------|
| 1 | Escribir "Sura" en búsqueda                 | Solo la card "Sura" se muestra                                        |
| 2 | Borrar y escribir "860034"                  | Match por NIT a "Seguros Bolívar"                                     |
| 3 | Escribir "xyz"                              | Empty state con "Sin resultados"                                      |

### 4.6 Links de contacto

| # | Acción                                      | Resultado esperado                                                    |
|---|---------------------------------------------|-----------------------------------------------------------------------|
| 1 | Hover email                                 | Color cambia a `aegis-sapphire`                                        |
| 2 | Click email                                 | Abre cliente `mailto:`                                                 |
| 3 | Click teléfono                              | Abre `tel:`                                                            |
| 4 | Click sitio web (sin http)                  | Abre URL completa con `https://` auto-prefix en nueva pestaña         |

### 4.7 Eliminar aseguradora

| # | Acción                                      | Resultado esperado                                                    |
|---|---------------------------------------------|-----------------------------------------------------------------------|
| 1 | Card → menú → "Eliminar"                    | Dialogo `critical` con mensaje explicando que pólizas mantienen el nombre |
| 2 | Confirmar                                   | Toast "Aseguradora eliminada", card desaparece                        |
| 3 | Verificar pólizas históricas                | El nombre sigue apareciendo correctamente (no se rompe integridad)    |

## 5. Escenarios de error / edge cases

| #   | Acción                                                          | Resultado esperado                                                    |
|-----|-----------------------------------------------------------------|-----------------------------------------------------------------------|
| 5.1 | Crear con nombre vacío / solo espacios                          | Botón disabled (trim).                                                |
| 5.2 | Crear con nombre duplicado (case-insensitive)                   | Toast error "Ya existe una aseguradora con ese nombre"                |
| 5.3 | Editar cambiando a nombre existente de otra aseguradora         | Toast error "Ya existe una aseguradora con ese nombre"                |
| 5.4 | Editar sin cambios                                              | Mutation OK, toast "Aseguradora actualizada" (idempotente)            |
| 5.5 | Crear con email inválido (sin @)                                | HTML5 valida antes del submit                                         |
| 5.6 | Nombre > 80 chars                                               | Input limita (`maxLength=80`)                                          |
| 5.7 | Doble click rápido "Crear"                                      | Botón disabled durante `isPending`, 1 sola mutación                   |
| 5.8 | Usuario sin `insurers_manage`                                   | Botón "Nueva aseguradora" oculto; menú (⋯) oculto en cards            |
| 5.9 | Usuario sin `insurers_view`                                     | Query devuelve `[]`; empty state se muestra                           |
| 5.10| Mutation con sesión expirada                                    | Toast con mensaje `unauthorized` del diccionario                      |
| 5.11| Archivar aseguradora inexistente (race)                         | Toast error "La aseguradora no existe"                                |
| 5.12| Eliminar la última aseguradora                                  | Empty state con CTA (si `insurers_manage`)                            |
| 5.13| Cambiar scope a "Todas" sin aseguradoras archivadas             | Mismo listado, no cambia                                              |
| 5.14| URL website sin protocolo `liberty.co`                          | Link anchor agrega `https://` al click                                |

## 6. Matriz de permisos

| Acción / UI                       | Owner | Admin | Member | Asesor (*) | Lector (*) | Outsider |
|-----------------------------------|-------|-------|--------|------------|------------|----------|
| Ver página `/settings/insurers`   | ✅    | ✅    | ✅     | ✅         | ✅         | ❌ (404) |
| Ver cards                         | ✅    | ✅    | ✅     | ✅         | ✅         | ❌       |
| Botón "Nueva aseguradora"         | ✅    | ✅    | ❌     | ❌         | ❌         | ❌       |
| Menú (⋯) en card                  | ✅    | ✅    | ❌     | ❌         | ❌         | ❌       |
| Llamar `insurers.create` (API)    | ✅    | ✅    | ❌     | ❌         | ❌         | ❌       |
| Llamar `insurers.update` (API)    | ✅    | ✅    | ❌     | ❌         | ❌         | ❌       |
| Llamar `insurers.setActive` (API) | ✅    | ✅    | ❌     | ❌         | ❌         | ❌       |
| Llamar `insurers.remove` (API)    | ✅    | ✅    | ❌     | ❌         | ❌         | ❌       |

(*) Asesor y Lector custom roles tienen `insurers_view: true` por
default en sus plantillas; `insurers_manage: false`.

Leyenda: ✅ visible+funcional · ⚠️ visible pero bloqueado · ❌ oculto/404.

## 7. Verificaciones visuales (Aegis brand)

- [ ] Header con icon `Building2` sobre fondo `bg-aegis-sapphire/10`.
- [ ] Avatar con initials usa `bg-aegis-sapphire/10 text-aegis-sapphire`.
- [ ] Card hover: borde `border-aegis-sapphire/30` con sombra sutil.
- [ ] Badge "Archivada" usa `bg-aegis-slate/10 text-aegis-steel`.
- [ ] Card archivada tiene `opacity-70`.
- [ ] Links de contacto hover → `text-aegis-sapphire`.
- [ ] NIT en mono font (`font-mono`).
- [ ] Confirm destructivo con variant `critical`.
- [ ] Empty state con icon en circle `bg-aegis-sapphire/10`.
- [ ] Sin `h-indigo`, `bg-rose-500`, `text-rose-500` en DOM.
- [ ] Dark mode coherente.

## 8. Interacciones cross-módulo

- **Policies**: el campo `insurer` en `policies` es un string libre (no
  FK). Eliminar una aseguradora no rompe pólizas pero el picker al crear
  nueva póliza debería ofrecer sólo las activas (`getByCompany({ includeInactive: false })`).
- **Quotes**: similar al flujo de pólizas, las cotizaciones no
  referencian por id — sólo por nombre si aplica.
- **Lines of Business**: coexiste como otro catálogo independiente.
- **Roles**: al crear un rol personalizado, los permisos
  `insurers_view` / `insurers_manage` controlan el acceso.
- **Logs** (futuro): registrar `insurer_created`, `insurer_updated`,
  `insurer_archived`, `insurer_deleted`.
