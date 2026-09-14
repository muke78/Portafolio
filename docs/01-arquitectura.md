# Arquitectura

## Estado actual

```
┌─────────────┐        ┌──────────────────┐        ┌──────────┐
│  Navegador  │───────▶│  Astro (Vercel)   │───────▶│   Hono   │
│             │◀───────│  output: "server" │◀───────│ (backend)│
└─────────────┘        └──────────────────┘        └────┬─────┘
                        /api/[resource]  GET/POST         │
                        /api/admin/*     (login/CRUD)      │
                        /api/tlgrm       POST               │
                                                            ▼
                                                     ┌──────────────┐
                                                     │ Turso (libSQL)│
                                                     └──────────────┘
                                                            │
                                                            ▼
                                              Telegram Bot API (vía Hono)

Imágenes de proyectos: Cloudflare R2 (URLs públicas, servidas directo al
navegador — el frontend no pasa por Hono para leerlas, solo para el futuro
flujo de subida).
```

- El navegador **nunca** habla directo con Hono ni con Turso. Todo pasa por
  las rutas `/api/*` de Astro, que corren server-side en la función de
  Vercel y agregan el `API_SECRET_TOKEN` (bearer) antes de reenviar la
  petición a Hono (`src/lib/api.ts`).
- El panel admin actual (`/admin`, `AdminDashboard.tsx`) ya sigue este mismo
  patrón — es un CRUD genérico contra `/api/admin/resource`, que a su vez
  reenvía a Hono con el token. La sesión admin es una cookie HMAC firmada
  localmente en Astro (`src/lib/adminSession.ts`), **Hono no sabe nada de
  esa sesión** — solo confía en el bearer token fijo.
- Eso es exactamente el primer problema de seguridad a resolver: hoy
  cualquiera que tenga el `API_SECRET_TOKEN` tiene acceso total de
  escritura a Hono, sin importar si pasó por el login de Astro o no. Ver
  [`03-diseno-api.md`](./03-diseno-api.md).

## Qué cambia con la expansión

No cambia el diagrama general — sigue siendo Astro como capa intermedia
entre el navegador y Hono. Lo que cambia:

1. **Hono se endurece**: valida el JWT/sesión del admin en vez de confiar
   solo en un token fijo compartido; valida entrada (Zod del lado del
   backend, no solo en el formulario); rate limiting; CORS explícito
   restringido al dominio de Vercel.
2. **Hono gana endpoints nuevos**: subida de imágenes a R2 (con conversión
   a webp), CRUD completo para `education` (hoy no existe como recurso
   propio — ver [`04-migracion-datos.md`](./04-migracion-datos.md)),
   gestión de mensajes de contacto persistidos (no solo Telegram).
3. **Turso se limpia y reestructura**: las tablas actuales se vacían y se
   vuelven a poblar con un esquema pensado para el panel admin, no
   arrastrando datos de prueba o inconsistentes.
4. **Astro gana el panel admin real**: reemplaza el editor de JSON crudo
   actual por formularios tipados por recurso (ya hecho parcialmente esta
   sesión — ver `src/features/admin/`), con soporte completo para
   education/skills/contact que hoy no tienen.

## Sobre "el módulo de HTTP de Astro" que mencionaste

Lo que probablemente recuerdas a medias es una de estas dos cosas — las dos
son reales y aplican aquí, no son excluyentes:

- **Rutas API de Astro** (`src/pages/api/**/*.ts`): esto es lo que **ya**
  usa este proyecto (`/api/[resource].ts`, `/api/admin/*`, `/api/tlgrm.ts`).
  Un archivo `.ts` en `src/pages/api/` exportando `GET`/`POST`/`PUT`/
  `DELETE` se convierte en un endpoint HTTP real. No hace falta nada nuevo
  para seguir este patrón con los recursos nuevos (education, contact
  messages, upload de imágenes).
- **Astro Actions** (`astro:actions`, estable desde Astro 5): una forma más
  nueva y tipada de definir funciones server-side invocables desde el
  cliente sin escribir `fetch()` + parseo de JSON a mano — Astro genera el
  cliente tipado automáticamente. Encaja muy bien para las mutaciones del
  panel admin (crear/editar/borrar) porque da validación con Zod integrada
  y errores tipados en el formulario sin código extra. **Recomendación**:
  usarlo para las acciones nuevas del panel admin (crear proyecto, editar
  educación, etc.), dejando las rutas API de siempre para lo que ya
  funciona (lectura pública, proxy a Hono) — no hace falta migrar lo
  existente para adoptar esto en lo nuevo.

## Componentes involucrados en el repo actual (referencia)

| Pieza | Archivo |
|---|---|
| Cliente HTTP hacia Hono | `src/lib/api.ts` |
| Proxy público de lectura/escritura | `src/pages/api/[resource].ts` |
| Proxy admin (CRUD genérico) | `src/pages/api/admin/resource.ts` |
| Sesión admin (cookie HMAC) | `src/lib/adminSession.ts` |
| Login/logout admin | `src/pages/api/admin/{login,logout}.ts` |
| Rate limit de login | `src/lib/rateLimit.ts` |
| Formulario de contacto → Hono → Telegram | `src/pages/api/tlgrm.ts` |
| UI del panel admin | `src/features/admin/` |
| Config de recursos del panel (campos por tipo) | `src/features/admin/resourceFields.ts` |
