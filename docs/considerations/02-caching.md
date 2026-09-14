# Route caching

Guía oficial: https://docs.astro.build/en/guides/caching/

## Qué es

API de caché a nivel de framework, agnóstica de plataforma: se marcan
directivas de caché (`maxAge`, `swr`, `tags`, `etag`, `lastModified`) en una
ruta o endpoint, y un **cache provider** las traduce a los headers/mecanismo
real del hosting (Vercel, Cloudflare, Netlify, cada uno con su propia forma
de cachear en el edge). Dos formas de usarla:

- **`routeRules` en `astro.config.mjs`**: mapea patrones de ruta (mismo
  formato `[param]`/`[...rest]` que el file-based routing) a `{ maxAge, swr,
  tags }`, sin tocar código de la página.
- **`Astro.cache` / `context.cache`** dentro de una página o endpoint:
  `cache.set({ maxAge, swr, tags })` para casos que necesitan lógica (p. ej.
  "esta respuesta es cacheable solo si no hay usuario logueado").
- **Invalidación**: `cache.invalidate({ tags: [...] })` o `{ path: "..." }`
  — purga por tag o por ruta, no solo por TTL.

## Estado actual en el proyecto

Verificado en `node_modules/astro/dist/core/cache/` (config, types,
runtime) y `node_modules/@astrojs/vercel/dist/cache/`:

- El proyecto usa Astro **7.3.1**, que ya trae esta API estable — no es
  experimental, no hay que activar ningún flag.
- `@astrojs/vercel@11.0.10` (el adapter que ya está instalado y en uso)
  **incluye un cache provider para Vercel** (`cacheVercel()`, exportado
  desde `@astrojs/vercel/cache`). Usa los headers propios de Vercel
  (`Vercel-CDN-Cache-Control`, `Vercel-Cache-Tag`) y `invalidateByTag()` de
  `@vercel/functions` para invalidación por tag.
- **Pero no está encendido.** El adapter no lo activa solo — a diferencia
  de Sessions (doc 03), donde ni siquiera hay provider disponible, aquí el
  provider ya está en el paquete instalado y con cero configuración extra
  en `astro.config.mjs` (`cache: {...}` no existe hoy).
- `@vercel/functions` ya está presente en `node_modules` (dependencia
  transitiva vía el adapter), pero no aparece en `package.json` como
  dependencia directa — hay que agregarla explícita si se usa
  `invalidate()`, para no depender de que siga siendo transitiva en una
  actualización futura.
- Grep de `Cache-Control` en todo `src/`: **cero resultados**. Ningún
  endpoint (`src/pages/api/*.ts`) ni página pone headers de caché hoy —
  cada request a `/api/[resource].ts`, `/api/admin/*`, etc. es
  no-cacheado por default.

## Veredicto

**Adoptar ahora, con alcance acotado.** No todo el sitio puede cachearse —
`/[lang]/home` sigue 100% dinámica hasta que Server Islands (doc 01) separe
sus secciones — pero hay rutas que hoy no tienen ninguna política y sí
deberían:

### Candidatas concretas, auditadas una por una

| Ruta | Hoy | Propuesta |
|---|---|---|
| `/[lang]/home` | Sin caché (dinámica a propósito) | Dejar sin caché **hasta** que doc 01 separe Proyectos/Opiniones/Experiencia en server islands; entonces cachear el resto del documento agresivo y cada island por separado |
| `/api/[resource].ts` (GET público, `projects`/`experiences`/`comments`) | Sin caché | `swr` corto (p. ej. 60s con `swr: 300`) + `tags: [resource]`, invalidado por el propio admin al hacer POST/PUT/DELETE — así el panel admin queda "en vivo" sin depender de que la página nunca cachee nada |
| `/api/admin/*` | Sin caché | Mantener sin caché explícitamente (`maxAge: 0`) — son mutaciones o datos de un solo admin, cachear aquí sería un bug de seguridad, no una optimización |
| `/admin/login` | Sin caché | Cacheable en `maxAge` corto — es HTML estático (el form), no depende de sesión |
| `/404` | Sin caché | Cacheable largo, es contenido 100% estático |
| Sitemap / robots.txt | Generado por integración / estático en `public/` | Ya se sirven eficientemente vía Vercel's static asset caching, no necesitan la API de Astro |

### Configuración concreta

```js
// astro.config.mjs
import vercel, { cacheVercel } from "@astrojs/vercel";

export default defineConfig({
  // ...
  adapter: vercel(),
  cache: {
    provider: cacheVercel(),
  },
  routeRules: {
    "/api/[resource]": { swr: 300, tags: ["public-resource"] },
    "/api/admin/[...path]": { maxAge: 0 },
    "/admin/login": { maxAge: 60 },
    "/404": { maxAge: 3600 },
  },
});
```

Y en `src/pages/api/admin/resource.ts`, al completar un POST/PUT/DELETE
exitoso, invalidar el tag correspondiente:

```ts
await context.cache.invalidate({ tags: ["public-resource"] });
```

Esto es exactamente la pieza que hoy falta para que "el panel admin
alimenta el portafolio sin redeploys" (requisito explícito en
`docs/02-panel-admin-requisitos.md`) no dependa de tener toda la página sin
caché para siempre — se puede cachear agresivo y purgar solo lo que cambió.

### Riesgo a vigilar

`invalidateByTag()` de `@vercel/functions` solo invalida el edge cache de
Vercel — no existe todavía sin una cuenta de Vercel real desplegada (no se
puede probar en este sandbox ni en `pnpm dev` local). La verificación real
de esta pieza tiene que pasar en preview/producción de Vercel, no en local.

## Referencias cruzadas

- [01-server-islands.md](01-server-islands.md) — por qué la home completa no se cachea todavía.
- `docs/03-diseno-api.md` — los endpoints admin que deben quedar explícitamente fuera de caché.
