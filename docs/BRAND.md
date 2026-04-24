# Aegis — Identidad de Marca

## 1) Introducción y concepto

**Aegis no es un software de seguros.**

Es el **instrumento de trabajo** de los profesionales del riesgo.

El nombre **Aegis** proviene de la mitología griega: el escudo de Zeus, símbolo de protección absoluta. La marca vive en la intersección entre **seguridad institucional** y **tecnología de precisión**. Ni banco anticuado, ni startup de juguete — una plataforma para gente que toma decisiones serias sobre patrimonios, contratos y garantías.

Aegis nace de observar un patrón operativo recurrente: las agencias de seguros operan con una mezcla frágil de Excel, correos, WhatsApp, PDFs dispersos y memoria humana. Cada cotización, cada póliza, cada renovación, cada comisión depende de que alguien recuerde. Aegis reemplaza esa fragilidad por **un sistema centralizado, trazable y predecible**.

La promesa central no es "verse moderna", sino **devolver control, claridad y calma** a agencias, corredores y agentes en contextos de alta complejidad.

### Atributos de la entidad Aegis

- **Escudo**: protege la operación de la agencia y, por extensión, la del cliente final.
- **Preciso**: los números cuadran, las fechas no se pierden, las renovaciones no se olvidan.
- **Serio**: tono institucional. No hay emojis decorativos, no hay gradientes morados, no hay ilustraciones cartoon.
- **Sereno bajo presión**: el cierre de mes, la renovación masiva o la licitación urgente se sienten como un proceso, no como una crisis.
- **Inteligente**: la IA extrae datos de contratos, sugiere coberturas, calcula primas — el agente dirige, Aegis ejecuta el trabajo pesado.

---

## 2) El problema y la solución

### El desafío

Gestionar una agencia de seguros implica coordinar múltiples frentes simultáneamente: clientes (personas naturales y empresas) con datos que cambian, pólizas con múltiples aseguradoras y ramos, cotizaciones que se reinventan cada semana, garantías de cumplimiento con anexos legales, comisiones calculadas por porcentaje y participación, renovaciones que no pueden fallar, y reportes exigidos por la aseguradora, por el cliente y por el regulador.

Todo esto suele hacerse con Excel, correos y PDFs sueltos. El resultado: datos duplicados, errores en primas, renovaciones olvidadas, comisiones mal calculadas, reportes reconstruidos a mano y un cierre de mes caótico.

### La solución (Aegis)

Aegis centraliza la operación completa de una agencia de seguros en una plataforma multi-tenant:

```
Company (agencia)
 ├── Members + Roles (equipo con permisos granulares)
 ├── Clients (persona natural o empresa)
 ├── Policies (vinculadas a Client, Insurer, Line of Business)
 ├── Quotes (cotizaciones — garantías, ramos tradicionales, con IA)
 ├── Bonds (catálogo de garantías)
 ├── Insurers (catálogo de aseguradoras)
 ├── Lines of Business (catálogo de ramos)
 └── Logs (auditoría total)
```

Cubre el ciclo completo:

- **Gestión de clientes**: plantillas dinámicas por tipo de cliente, campos configurables, búsqueda por nombre e identificación.
- **Pólizas**: datos del tomador, asegurado, beneficiario; primas, gastos de expedición, impuestos, comisiones y participación; estados (activa, vencida, cancelada, pendiente); renovaciones encadenadas.
- **Cotizaciones**: actualmente garantías (bid bonds, performance bonds); arquitectura abierta a ramos tradicionales.
- **Extracción con IA**: subir un PDF de contrato y que Aegis complete automáticamente contratante, contratee, valor, fechas, tipo de garantía.
- **Comisiones**: porcentaje del agente + porcentaje de participación de la agencia → comisión total por póliza.
- **Renovaciones**: pólizas vinculadas por `parentPolicyId`, alertas de vencimiento, renovación como acto contable explícito.
- **Auditoría**: log de cada CRUD, con usuario, tipo de entidad afectada y timestamp.
- **Roles y permisos**: sistema granular por dominio (company, clients, policies, quotes, bonds, members, roles, dashboard, logs).

### Palabras clave del proyecto

Gestión integral · Cotizaciones · Pólizas · Garantías · Cumplimiento · Aseguradoras · Ramos · Comisiones · Renovaciones · Trazabilidad · Auditoría · Multi-tenant · IA aplicada a contratos · LATAM · Precisión.

---

## 3) Esencia de marca

### Propósito

Centralizar y profesionalizar la operación de agencias de seguros — clientes, pólizas, cotizaciones, garantías, comisiones y renovaciones — en una plataforma en tiempo real que reemplaza Excel, correos y memoria por flujos estructurados, trazables y predecibles.

### Personalidad

- Serena bajo presión
- Precisa sin rigidez
- Institucional, pero cercana
- Sobria, no fría
- Técnica, pero legible

### Propuesta de valor

Aegis reemplaza la fragmentación operativa (Excel + WhatsApp + correos + PDFs) con una plataforma integral que coordina clientes, pólizas, cotizaciones, garantías, comisiones y renovaciones — permitiendo que cada cierre de mes sea **una verificación de datos, no una reconstrucción caótica**.

---

## 4) Referencias visuales y conceptuales

- **Linear**: claridad estructural y foco en ejecución.
- **Vercel dashboard**: densidad informativa sin ruido.
- **Bloomberg Terminal (espíritu)**: datos primero, decoración después.
- **iOS 26 (Liquid Glass)**: capas fluidas y profundidad óptica controlada.
- **Iron Man UI/HUD**: visualización táctica de información crítica en tiempo real.

Estas referencias orientan la precisión y expresividad, pero Aegis mantiene un lenguaje propio centrado en la operación real del corredor y la agencia.

---

## 5) Sistema de diseño y tipografía

### Base de componentes

- **Shadcn UI** + **Radix UI** como base del sistema.
- Capa **`aegis/`** (en `components/aegis/`) con los componentes específicos de Aegis (`AegisModal`, `AegisSheet`, pickers, layout shells). Ver `.agents/skills/aegis-interface/SKILL.md` para la ley exacta.

### Tipografía

- **Outfit** (400, 500, 600, 700, 800) — fuente principal para lectura, títulos y cuerpo. Geométrica, moderna, sin frivolidad.
- **Cormorant Garamond** *(italic, 400 / 600)* — uso **exclusivo** en frases de impacto o declaraciones de marca (taglines, cierres, statements). Aporta elegancia editorial y contraste con las fuentes técnicas.
- **JetBrains Mono** (400, 500) — datos, métricas, identificadores, telemetría, código. Transmite "sistema real".

Regla: la información operativa va legible primero, carácter de marca después.

**No usar hardcoded** las clases de fuente en elementos individuales. El layout global aplica Outfit; usar `font-title` cuando se requiera destacar un título, `font-mono` para métricas/datos y `font-[family-name:var(--font-cormorant)] italic` solo para impacto.

---

## 6) Paleta de color

### Colores base Aegis

| Rol | Nombre | Hex | Token CSS | Clase Tailwind |
|-----|--------|-----|-----------|----------------|
| Primario (fondos oscuros / navbar) | Midnight | `#0D1F3C` | `--color-aegis-midnight` | `bg-aegis-midnight` |
| Acento principal (CTAs, links) | Sapphire | `#1E5FD8` | `--color-aegis-sapphire` | `bg-aegis-sapphire` |
| Acento secundario (datos, métricas en vivo) | Cyan Steel | `#0FB8C9` | `--color-aegis-cyan` | `bg-aegis-cyan` |
| Fondo claro base | Ice | `#F4F6FB` | `--color-aegis-ice` | `bg-aegis-ice` |
| Superficies elevadas (cards, inputs) | Slate Soft | `#EEF1F8` | `--color-aegis-slate` | `bg-aegis-slate` |
| Texto principal | Graphite | `#111827` | `--color-aegis-graphite` | `text-aegis-graphite` |
| Texto secundario | Steel Gray | `#4B5563` | `--color-aegis-steel` | `text-aegis-steel` |
| Éxito / activo | Emerald | `#10B981` | `--color-aegis-emerald` | `bg-aegis-emerald` |
| Advertencia | Amber | `#F59E0B` | `--color-aegis-amber` | `bg-aegis-amber` |

El **acento por defecto** en contenedores de iconos, hovers neutros y énfasis genérico es **Sapphire** (`aegis-sapphire`). Cyan Steel se reserva para **datos en vivo / métricas / identificadores técnicos**.

### Intención cromática

- **Sapphire** = acción, dirección, click esperado.
- **Cyan Steel** = dato vivo, sistema, telemetría.
- **Emerald** = estado "activo", éxito, confirmación.
- **Amber** = atención requerida, pendiente, advertencia suave.
- **Destructive** (rojo del tema base shadcn) = acción irreversible, cancelación, eliminación.

**Regla de oro**: los colores semánticos no decoran. Si un color se usa, comunica estado. Nunca `amber` como acento bonito; nunca `emerald` como borde de card neutra.

---

## 7) Sistema de iconos

### Librería

**Lucide** (`lucide-react`) — estilo stroke minimalista y consistente. **Única librería de iconos del proyecto.** No se permiten Remix Icons, Heroicons, React Icons ni ningún otro.

### Regla fundamental

Cada **entidad del dominio** tiene un icono **único**. No se comparten iconos entre entidades distintas. Los iconos de **acciones genéricas** (Plus, Trash2, Pencil, etc.) se reutilizan libremente.

### Entidades del dominio Aegis

| Entidad | Icono | Import |
|---|---|---|
| Company (agencia) | `Building2` | `Building2` |
| Member (miembro del equipo) | `User` | `User` |
| Grupo de miembros | `Users` | `Users` |
| Invitar miembro | `UserPlus` | `UserPlus` |
| Rol | `ShieldCheck` | `ShieldCheck` |
| Permiso | `KeyRound` | `KeyRound` |
| Cliente persona | `UserCircle` | `UserCircle` |
| Cliente empresa | `Building` | `Building` |
| Clientes (colección) | `Users` | `Users` |
| Plantilla de cliente | `ClipboardList` | `ClipboardList` |
| Póliza | `FileShield` | `FileShield` |
| Pólizas (colección) | `Files` | `Files` |
| Renovación | `RefreshCw` | `RefreshCw` |
| Póliza cancelada | `FileX2` | `FileX2` |
| Cotización | `FileText` | `FileText` |
| Cotizaciones (colección) | `FileStack` | `FileStack` |
| Convertir cotización → póliza | `ArrowRightLeft` | `ArrowRightLeft` |
| Garantía (Bond) | `Shield` | `Shield` |
| Catálogo de garantías | `ShieldHalf` | `ShieldHalf` |
| Aseguradora (Insurer) | `Landmark` | `Landmark` |
| Ramo (Line of Business) | `FolderOpen` | `FolderOpen` |
| Comisión | `Percent` | `Percent` |
| Participación | `PieChart` | `PieChart` |
| Prima | `CircleDollarSign` | `CircleDollarSign` |
| Impuestos | `Receipt` | `Receipt` |
| Gastos de expedición | `FileSpreadsheet` | `FileSpreadsheet` |
| Extracción IA | `Sparkles` | `Sparkles` |
| Documento PDF | `FileText` | `FileText` |
| Dashboard | `LayoutDashboard` | `LayoutDashboard` |
| Reportes | `BarChart3` | `BarChart3` |
| Log / Auditoría | `History` | `History` |
| Configuración de Company | `Settings2` | `Settings2` |

### Estados de pólizas (icono + color)

| Estado | Icono | Color |
|---|---|---|
| Activa | `ShieldCheck` | emerald |
| Vencida | `ShieldAlert` | amber |
| Cancelada | `ShieldOff` | destructive |
| Pendiente | `Clock` | sapphire |

### Tipos de log (icono + color)

| Acción | Icono | Color |
|---|---|---|
| Crear | `FilePlus` | emerald |
| Editar | `PencilLine` | amber |
| Eliminar | `Trash2` | destructive |
| Info | `Info` | muted |

### Acciones genéricas (reutilizables)

| Acción | Icono |
|---|---|
| Crear / Agregar | `Plus` |
| Eliminar | `Trash2` |
| Editar | `Pencil` |
| Copiar | `Copy` |
| Descargar | `Download` |
| Subir archivo | `Upload` |
| Buscar | `Search` |
| Refrescar | `RefreshCw` |
| Cerrar | `X` |
| Compartir | `Share2` |
| Activar | `ToggleRight` |
| Desactivar | `ToggleLeft` |
| Fijar | `Pin` |
| Arrastrar | `GripVertical` |
| Más acciones | `MoreHorizontal` |
| Enlace | `Link` |
| Verificado | `BadgeCheck` |
| Filtro | `SlidersHorizontal` |
| Ver / Preview | `ScanEye` |
| Ocultar | `EyeOff` |
| Exportar Excel | `FileSpreadsheet` |
| Exportar PDF | `FileDown` |

### Navegación

| Propósito | Icono |
|---|---|
| Chevron | `ChevronRight` / `ChevronLeft` / `ChevronDown` / `ChevronUp` |
| Flecha | `ArrowRight` / `ArrowLeft` / `ArrowUp` / `ArrowDown` |
| Expandir (up-down) | `ChevronsUpDown` |
| Menú | `Menu` |

### Estado / Feedback

| Estado | Icono |
|---|---|
| Loading | `Loader2` |
| Alerta / Error | `OctagonAlert` |
| Información | `Info` |
| Éxito | `Check` |
| Check circle | `CheckCircle2` |
| Error circle | `XCircle` |
| Alerta de seguridad | `ShieldAlert` |
| Candado (auth) | `KeyRound` |

### Tema / UI Chrome

| Propósito | Icono |
|---|---|
| Tema claro | `Sun` |
| Tema oscuro | `Moon` |
| Desktop | `Monitor` |
| Tablet | `Tablet` |
| Mobile | `Smartphone` |

### Tipo TypeScript

Usar `LucideIcon` (de `lucide-react`) como tipo para props que reciben iconos.

---

## 8) Principios de UX de la marca (cómo debe verse en producto)

1. **Calma funcional**: la interfaz reduce ansiedad operativa, nunca la amplifica.
2. **Jerarquía inmediata**: lo crítico se detecta en segundos (vencimientos, pendientes, montos).
3. **Densidad con orden**: mucha información, mínima fricción cognitiva.
4. **Consistencia temporal**: fechas y períodos respetan lógica de calendario/renovación.
5. **Precisión semántica**: el color comunica estado real, no decoración.
6. **Minimalismo útil**: menos ornamento, más decisión.
7. **Trazabilidad visible**: siempre se puede responder "¿quién, qué, cuándo?".
8. **Un camino, no ocho**: para cada tarea frecuente existe un flujo canónico. Los atajos son atajos, no alternativas que compiten.

---

## 9) Qué Aegis **nunca** es

- Nunca un generador genérico de PDFs con Excel al lado.
- Nunca un producto que gradientes morados, partículas cartoon o ilustraciones "techy" de stock.
- Nunca una herramienta donde "el usuario avanzado" necesita trucos que el usuario básico ignora. La UI se comporta igual para todos; lo que cambia son los permisos.
- Nunca un producto que "recuerda" por el usuario sin dejar rastro. Todo acto importante queda en el log.
- Nunca una app donde dos flujos idénticos se vean distintos porque los construyó otro desarrollador en otra semana. La skill `aegis-interface` existe precisamente para impedir eso.
