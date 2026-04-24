# Aegis

Plataforma de gestión de seguros: pólizas, cotizaciones de garantías, clientes y más.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, Tailwind CSS 4, shadcn/ui
- **Backend:** Convex (base de datos, auth, funciones serverless)
- **Auth:** Convex Auth (Email/Password, Google, Resend OTP)
- **AI:** Gemini 2.5 Flash vía `@convex-dev/agent` (extracción de datos de PDFs)
- **Estado:** Jotai + nuqs (URL state)
- **Linting:** Biome
- **Package Manager:** Bun

## Módulos

| Módulo | Descripción |
|--------|-------------|
| **Auth** | Login con email/password, Google y OTP |
| **Companies** | Multi-tenant con códigos de invitación, logos y colores |
| **Roles** | Sistema de permisos granulares por company |
| **Clients** | Gestión de clientes (datos personales, identificación) |
| **Policies** | Pólizas de seguros (asegurado, beneficiario, estados, comisiones) |
| **Quotes** | Cotizaciones de garantías (bid bonds y performance bonds) con extracción AI |
| **Bonds** | Catálogo de tipos de garantía |
| **Logs** | Auditoría de acciones por company |

## Estructura del Proyecto

```
app/              → Rutas de Next.js (App Router)
  (app)/          → Rutas protegidas (companies, clientes, pólizas, cotizaciones)
  auth/           → Pantalla de autenticación
components/       → Componentes compartidos, UI (shadcn), hooks, providers
convex/           → Backend: schema, funciones, auth, agentes AI
lib/              → Utilidades (formatos, sanitización, cálculos)
packages/         → Feature modules (auth, bonds, clients, policies, quotes, users, companies)
public/           → Assets estáticos
```

## Getting Started

```bash
# Instalar dependencias
bun install

# Iniciar servidor de desarrollo
bun dev

# Iniciar Convex (en otra terminal)
npx convex dev
```

La app corre en [http://localhost:7077](http://localhost:7077).

## Variables de Entorno

Crear un archivo `.env.local` con las variables necesarias para Convex, Google Auth, Resend y Gemini AI.
