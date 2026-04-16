## 🎨 SISTEMA DE MARCA AEGIS (definido en este prompt)

> El nombre **Aegis** proviene de la mitología griega: el escudo de Zeus, símbolo de protección absoluta.  
> La marca vive en la intersección de **seguridad institucional** y **tecnología de precisión**.  
> Ni banco anticuado, ni startup de juguete — *instrumento de trabajo serio para profesionales del riesgo*.

### Paleta de colores

| Rol | Nombre | HEX | Uso |
|-----|--------|-----|-----|
| Primario | **Azul Medianoche** | `#0D1F3C` | Fondos oscuros, navbar, secciones de contraste |
| Acento principal | **Zafiro Eléctrico** | `#1E5FD8` | CTAs, links, highlights interactivos |
| Acento secundario | **Cian Acero** | `#0FB8C9` | Detalles de datos, métricas, estados "activo" |
| Fondo claro | **Blanco Hielo** | `#F4F6FB` | Fondo general en light mode |
| Fondo tarjetas | **Pizarra Suave** | `#EEF1F8` | Cards, inputs, superficies elevadas |
| Texto primario | **Grafito Profundo** | `#111827` | Cuerpo de texto principal |
| Texto secundario | **Gris Acero** | `#4B5563` | Subtítulos, labels, metadata |
| Éxito / Activo | **Verde Esmeralda** | `#10B981` | Badges "activo", estados de éxito |
| Advertencia | **Ámbar Cálido** | `#F59E0B` | Alertas suaves, notificaciones |

### Tipografías

- **Títulos / Headlines:** `Outfit` (700–800) — moderno, geométrico, sin frivolidad
- **Drama / Énfasis emocional:** `Cormorant Garamond` itálica — para conceptos como *protección*, *confianza*, *garantía*
- **Datos / Métricas / Código:** `JetBrains Mono` o `IBM Plex Mono` — sensación de sistema real, telemetría
- **Cuerpo de texto:** `Outfit` (400–500) — cohesión con los títulos

### Textura visual

- Overlay de ruido global en CSS (`SVG turbulence`, opacidad `0.04`) — evita que todo se vea plano
- Los fondos oscuros llevan un sutil gradiente radial en zafiro muy opaco (tipo "glow de monitor")
- Bordes con `border-radius` entre `1.5rem` y `2.5rem` en contenedores principales

---

## ROL Y OBJETIVO

Actúa como un **Senior Creative Technologist** y **Lead Frontend Engineer** de primer nivel especializado en productos SaaS B2B de alta fidelidad.

**Objetivo:** Diseñar y construir una landing page de alta fidelidad, "pixel perfect", con estética de software premium para:

- **Marca / Proyecto:** Aegis
- **Qué es:** Plataforma SaaS para gestión integral de seguros y garantías — pólizas, clientes, cotizaciones con IA, equipos y auditoría, todo en un solo workspace
- **Público:** Agentes de seguros, corredores y agencias en Colombia y Latinoamérica que necesitan centralizar su operación
- **CTA principal:** "Solicitar acceso anticipado"
- **Identidad estética:** "Infraestructura de misión crítica" + "Software de precisión para profesionales del riesgo"

> La web debe sentirse como el dashboard de control de un sistema de seguridad de alto nivel —  
> no una landing genérica de startup. Cada scroll debe ser intencional. Cada animación, técnica y elegante.  
> **Nada de patrones típicos de IA. Nada de gradientes morados. Nada de ilustraciones de cartoon.**

---

## 1. SISTEMA DE DISEÑO (ESTRICTO)

### Paleta (usa estos valores exactos)

```css
--color-midnight:    #0D1F3C;  /* Primario — fondos oscuros */
--color-sapphire:    #1E5FD8;  /* Acento principal — CTAs */
--color-cyan-steel:  #0FB8C9;  /* Acento secundario — datos en vivo */
--color-ice:         #F4F6FB;  /* Fondo claro */
--color-slate-soft:  #EEF1F8;  /* Tarjetas / superficies */
--color-graphite:    #111827;  /* Texto principal */
--color-steel-gray:  #4B5563;  /* Texto secundario */
--color-emerald:     #10B981;  /* Activo / éxito */
--color-amber:       #F59E0B;  /* Alerta / advertencia */
```

### Tipografías (importar desde Google Fonts)

```
Outfit: 400, 500, 600, 700, 800
Cormorant Garamond: 400 italic, 600 italic
JetBrains Mono: 400, 500
```

### Textura visual

Aplica un overlay de "ruido" global en CSS para que ninguna superficie se vea plana:
```css
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,..."); /* SVG turbulence */
  opacity: 0.04;
  pointer-events: none;
  z-index: 9999;
}
```

### Sistema de bordes

`border-radius` consistente en todos los contenedores: entre `1.5rem` y `2.5rem`.

---

## 2. COMPONENTES Y COMPORTAMIENTO

### A) NAVBAR — La "isla flotante"

- Barra fija, forma **píldora** centrada.
- Al inicio (hero): transparente, texto blanco, logo en blanco.
- Al hacer scroll: píldora con fondo `rgba(13,31,60,0.85)` + `backdrop-blur(20px)` + borde sutil `rgba(30,95,216,0.3)`.
- Links: "Producto", "Funcionalidades", "Precios", "Para agencias"
- Botón CTA inline: "Solicitar acceso" — fondo zafiro, hover con capa deslizante
- Transición: `0.4s ease` sin saltos. Se siente como vidrio inteligente.

### B) HERO — "La sala de control"

**Altura:** `100dvh`  
**Fondo:** Imagen de ciudad nocturna o arquitectura moderna con niebla azulada.  
Imagen sugerida:  
```
https://images.unsplash.com/photo-1477959858617-67f85cf4f1df
```
Aplica degradado de `#0D1F3C` hacia `transparent` desde el fondo.  
Añade un sutil "glow" radial en zafiro (`rgba(30,95,216,0.15)`) en el centro-izquierda.

**Composición:** Contenido centrado verticalmente, ligeramente a la izquierda.

**Titular:**
```
"El sistema que protege     ← Outfit 700, blanco
tu operación"               ← Cormorant Garamond, italic, enorme
```

**Subtítulo:**
```
Aegis centraliza pólizas, clientes y garantías en una sola plataforma.
Con inteligencia artificial que extrae datos de contratos en segundos.
```

**Indicador "en vivo" bajo el subtítulo:**
```
[● SISTEMA ACTIVO]  /  [12 agencias en beta]  /  [Colombia · LATAM]
```
Texto en `JetBrains Mono`, tamaño pequeño, color cian acero. El punto pulsa.

**CTA:**
- Botón primario: "Solicitar acceso anticipado" — fondo zafiro, hover con overlay deslizante
- Botón secundario: "Ver demo en vivo" — outline blanco translúcido

**Animación:** Fade-up escalonado (título → subtítulo → indicadores → CTAs). Sutil, profesional. Sin bounces infantiles.

### C) FEATURES — "Paneles de sistema operativo"

Sección con fondo `#F4F6FB`. Título de sección:
```
"Una plataforma.
Toda tu operación."
```

No uses tarjetas genéricas. Cada feature es un **artefacto funcional de software**.

---

**Feature 1 — "Extracción IA de contratos"**

Panel oscuro (`#0D1F3C`) con:
- Simulación de un PDF cargándose (barra de progreso animada en zafiro)
- Campos que se "autocompletan" uno a uno con efecto de typing:
  - `Contratante: CONSORCIO VIAL DEL NORTE S.A.S`
  - `Valor del contrato: $4.250.000.000`
  - `Fecha de inicio: 15/03/2025`
  - `Tipo de garantía: Cumplimiento`
- Badge final: `[✓ Extracción completada — 2.3s]` en verde esmeralda
- Texto en `JetBrains Mono`

---

**Feature 2 — "Telemetría del workspace en vivo"**

Texto que se escribe solo (tipo terminal) en fondo oscuro, cambiando mensajes cada 3s:
```
> Procesando póliza #POL-2025-0847...
> Cliente verificado: CC 1.234.567.890
> Prima calculada: $2.340.000 COP
> Asignando al equipo de Bogotá...
> Renovación programada: 45 días restantes
```
Cursor intermitente en cian acero (`#0FB8C9`). Punto pulsante "EN VIVO" en verde esmeralda.

---

**Feature 3 — "Panel de roles y permisos"**

Rejilla interactiva de permisos. Un cursor SVG entra automáticamente y:
1. Hover sobre "Editar pólizas" → toggle se activa (animación suave)
2. Hover sobre "Ver reportes" → toggle se activa
3. Se mueve a botón "Guardar rol" → hace click (scale down sutil) → badge `[✓ Guardado]`
4. Desaparece

Sensación: *sistema real de administración, no una plantilla*.

---

### D) SECCIÓN MANIFIESTO — "Por qué Aegis"

Fondo oscuro (`#0D1F3C`) con textura orgánica de datos / circuito muy sutil en parallax.  
Imagen de fondo:
```
https://images.unsplash.com/photo-1551288049-bebda4e38f71
```
Opacidad del overlay: `0.85`.

**Texto de contraste (split text al scroll):**
```
"Las agencias de seguros en Colombia
administran millones en pólizas
en hojas de cálculo."

"Aegis es el sistema que
ese dinero merece."
```

Primera parte: `Outfit 400`, gris acero, tamaño medio.  
Segunda parte: `Outfit 800`, blanco, tamaño grande — impacto visual al aparecer.

Animación: aparición por palabras al entrar en viewport. Elegante y sobrio.

---

### E) SECCIÓN "ARCHIVO DE FUNCIONALIDADES" — Tarjetas apiladas en scroll

3 tarjetas de pantalla completa, apiladas. Al entrar la nueva tarjeta:
- La de debajo: `scale(0.92)` + `blur(16px)` + `opacity 0.4`
- Transición: `0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)`

**Tarjeta 1 — "Gestión de Pólizas"**
- Animación: tabla de pólizas que se va llenando fila a fila con datos reales de seguros colombianos (SURA, Bolívar, Allianz, Liberty, AXA Colpatria)
- Columnas: Póliza / Asegurado / Prima / Estado / Vencimiento
- Efecto: las filas entran con fade-left, una por una, como si se estuvieran sincronizando en tiempo real

**Tarjeta 2 — "Cotizaciones de Garantías"**
- Animación: línea tipo electrocardiograma / waveform pulsando
- Al final de la línea: aparece valor cotizado (`$1.247.500 COP`) con fade
- Abajo: comparación de 3 aseguradoras con barra de precio animada

**Tarjeta 3 — "Multi-Workspace"**
- Animación: 3 workspaces que aparecen como "islas" con logos diferentes (Agencia Norte, Seguros del Valle, Broker Central)
- Un usuario-punto se mueve entre workspaces con trayectoria curva (SVG path)
- Cada workspace tiene un color primario distinto — demo del sistema de temas

---

### F) PRECIOS + FOOTER

**Sección de Precios**

Fondo `#F4F6FB`. Título:  
```
"Elige el plan de tu agencia"
```

3 columnas:

| | Básico | **Profesional** ★ | Empresa |
|--|--------|-------------------|---------|
| | Agentes independientes | **Agencias medianas** | Grandes corredores |
| | $0 / mes | **$149.000 COP / mes** | A convenir |
| | 1 workspace | **Workspaces ilimitados** | Onboarding dedicado |
| | | fondo `#0D1F3C`, botón zafiro | |

El plan del medio tiene:
- Fondo azul medianoche
- Badge flotante: `"MÁS POPULAR"`
- Botón CTA en zafiro eléctrico
- Escala ligeramente más grande que los otros dos

**Footer**

- Fondo `#0D1F3C`
- `border-radius` superior muy grande: `2.5rem 2.5rem 0 0`
- Columnas: Logo + tagline / Producto / Legal / Contacto
- Indicador de estado en la parte inferior:
  ```
  [● SISTEMA OPERATIVO — ACTIVO]   aegis.co  ·  Bogotá, Colombia
  ```
  Texto en `JetBrains Mono`, punto verde esmeralda pulsante

---

## 3. REQUISITOS TÉCNICOS

### Stack obligatorio

```
Next.js 15 (App Router)
React 19
Tailwind CSS 4
GSAP 3 (con ScrollTrigger)
Lucide React (iconos)
Framer Motion (micro-interacciones de componentes)
```

### Buenas prácticas

- Usa `gsap.context()` dentro de `useEffect` para montar y desmontar animaciones correctamente
- Botones con efecto **magnético** (`scale(1.03)` en hover, `scale(0.97)` en click)
- Animación de fondo en botones: `overflow-hidden` + capa deslizante (`:before` que entra desde la izquierda)
- **Cero texto placeholder** — todo el copy es real, en español (Colombia), coherente con el negocio de seguros
- Soporte completo dark/light mode con `prefers-color-scheme` y toggle manual
- Imágenes con `next/image` optimizadas
- Todas las URLs de imágenes deben ser reales (Unsplash u otras fuentes abiertas)
- El ruido de textura global no debe afectar el rendimiento (usar `will-change: auto`)

### Copy real para usar en el sitio

```
Tagline principal:   "La plataforma que los seguros siempre merecieron."
Tagline secundario:  "Centraliza. Automatiza. Protege."
Hero subtítulo:      "Aegis unifica pólizas, clientes y garantías en un solo
                      sistema — con IA que lee tus contratos y extrae los datos
                      por ti. Diseñado para agencias en Colombia."
Manifiesto:          "Las agencias de seguros mueven millones en primas.
                      No merecen administrarse en una hoja de cálculo.
                      Aegis es el instrumento que esa responsabilidad exige."
Footer tagline:      "Aegis — El escudo digital de tu agencia."
```

---

## DIRECTIVA FINAL (IMPORTANTE)

No construyas "una web de SaaS". Construye **el panel de control de una operación crítica**.

- Nada genérico.
- Nada de gradientes morados o ilustraciones de cartoon.
- Nada "estilo IA de 2023".
- No uses Inter ni Roboto ni Space Grotesk.

Todo debe sentirse como **infraestructura real** — el tipo de software que los mejores brokers de seguros de Bogotá mostrarían orgullosos a sus clientes.

Cada animación tiene una razón de ser. Cada dato en pantalla es real. Cada transición comunica **precisión y confianza**.

**Aegis no es una app de startups. Es un sistema de gestión de riesgo.**

---

*Prompt elaborado para Aegis Insurance Platform — v1.0*  
*Basado en la estructura PROMPT_MAESTRO (Plantilla Cinemática)*
