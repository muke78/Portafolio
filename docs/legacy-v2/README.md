# Documentación legacy (v2): Astro en Vercel + Hono + Turso

Esta carpeta conserva, **sin editar**, la documentación de cuando el portafolio
vivía en Vercel con una API en Hono sobre Turso (libSQL) y el panel de
administración dentro de este mismo repositorio. Se guarda como historial: no
describe el sistema actual.

> La documentación vigente está en [`../ARQUITECTURA.md`](../ARQUITECTURA.md)
> y en el índice [`../README.md`](../README.md).

## Qué stack describe

| Pieza | Antes (v2) | Ahora |
|---|---|---|
| Sitio | Astro SSR en **Vercel** | Astro SSR en **Cloudflare Workers** |
| API | Hono (fuera de Cloudflare) | Hono en **Cloudflare Workers** |
| Base de datos | **Turso** (libSQL) | **Cloudflare D1** |
| Imágenes | Cloudflare R2 | Cloudflare R2 (sin cambio) |
| Panel de administración | Dentro de este repo (`/admin`, cookie HMAC) | Repo aparte `Portafolio_admin`, tras **Cloudflare Access** |
| Aviso de contacto | Telegram, luego solo base de datos | Solo base de datos, y bandeja en el CMS |
| Despliegue | Vercel | Integración Git de Cloudflare al hacer push a `main` |

## Contenido

| Archivo | De qué trata |
|---|---|
| [`00-indice-original.md`](./00-indice-original.md) | Índice original de la carpeta `docs/` |
| [`01-arquitectura.md`](./01-arquitectura.md) | Cómo encajaban Astro, Hono, Turso y R2 |
| [`02-panel-admin-requisitos.md`](./02-panel-admin-requisitos.md) | Requisitos del panel de administración |
| [`03-diseno-api.md`](./03-diseno-api.md) | Contrato de endpoints y checklist de seguridad |
| [`04-migracion-datos.md`](./04-migracion-datos.md) | Plan para vaciar y reconstruir las tablas de Turso |
| [`TODO.md`](./TODO.md) | Hoja de ruta y política de versiones de esa etapa |
| [`considerations/`](./considerations/README.md) | Consideraciones técnicas de Astro (islas de servidor, caché, sesiones, imágenes, datos, Zod, transiciones y pruebas) |

## Cómo leerlo

- Los enlaces entre estos archivos siguen funcionando. Los que apuntan a
  `UI_STANDARDS.md`, `GSAP.md` o `SECURITY.md` ya no, porque esos documentos
  siguen vivos un nivel arriba (`../`).
- Las menciones a Vercel, Turso, Telegram, `axios` y el panel en `/admin`
  describen el estado de entonces. No las uses como instrucciones.
- Lo que se decidió allí y sigue vigente (el proxy `/api/*` que agrega el
  token en el servidor, las guardias de las rutas públicas, las imágenes en
  WebP) está recogido en [`../ARQUITECTURA.md`](../ARQUITECTURA.md).
