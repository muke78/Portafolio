# Sessions

Guía oficial: https://docs.astro.build/en/guides/sessions/

## Qué es

Almacenamiento de datos del lado del servidor, ligado a una cookie de
sesión (solo un ID viaja al cliente, los datos reales quedan en el
servidor). A diferencia de una cookie normal: sin límite de tamaño
práctico, no expone el contenido al cliente, y el storage real es
"pluggable" vía `session.driver` en `astro.config.mjs` — cualquier driver
de [unstorage](https://unstorage.unjs.io/drivers) sirve (Redis, KV,
filesystem, una base de datos SQL/libSQL, etc.).

Piezas confirmadas contra el código instalado
(`node_modules/astro/dist/core/session/`):

- `session.driver`, `session.cookie` (nombre/opciones de la cookie),
  `session.ttl` (expiración por default) — todo configurable en
  `astro.config.mjs`, vía `sessionDrivers` exportado desde `astro/config`.
- **Node, Cloudflare y Netlify traen un driver por default cuando usas su
  adapter.** Verificado en el mismo archivo de tipos
  (`config.d.ts`): la lista de adapters con auto-configuración **no
  incluye Vercel**.
- Confirmado además revisando `node_modules/@astrojs/vercel/dist/` completo:
  cero referencias a `session` en ningún `.d.ts` del adapter. El adapter de
  Vercel, que es el que este proyecto usa, **no configura ningún driver por
  sí solo** — hay que elegir uno a mano.
- Entre los drivers disponibles vía `sessionDrivers` está **`db0`**
  (backend genérico de unstorage sobre bases SQL, con soporte para libSQL —
  es decir, Turso) y `vercelBlob`/`vercelKV`/`vercelRuntimeCache`
  (específicos de productos de Vercel).

## Estado actual en el proyecto

El proyecto **ya tiene una sesión hecha a mano**, no usa nada de Astro
todavía: `src/lib/adminSession.ts`.

```ts
// src/lib/adminSession.ts — resumen de lo que hay hoy
const sign = (payload, secret) => createHmac("sha256", secret)...
export const buildSessionToken = (secret) => { /* payload = expiry, firma HMAC */ }
const revokedTokens = new Map<string, number>(); // en memoria
export const revokeSessionToken = (token) => { revokedTokens.set(...) }
export const verifySessionToken = (token, secret) => { /* valida firma + expiry + no revocado */ }
```

Y el propio archivo lo documenta explícito en un comentario: el `Map` de
tokens revocados **no sobrevive un cold start en Vercel** — un logout solo
invalida el token en la instancia que atendió ese logout, no en todas. Es
una limitación aceptada para un panel de un solo admin, pero es exactamente
el tipo de problema que un driver de sesión real resuelve de raíz.

`middleware.ts` (`adminGuard`) ya consume esto — lee la cookie
`khelde_admin`, llama `verifySessionToken`, y si falla, 401 en rutas
`/api/admin/*` o redirect a `/admin/login` en rutas `/admin/*`.

## Veredicto

**Adoptar, pero en Fase 6** (endurecimiento del panel admin,
`docs/02-panel-admin-requisitos.md` / `docs/03-diseno-api.md`), no antes —
hoy no hay nada más que guardar en sesión aparte del propio estado de
login, así que migrar ahora sería trabajo sin beneficio inmediato. El
momento correcto es cuando se conecte el JWT propuesto en
`docs/03-diseno-api.md`: ahí sí hace falta un lugar server-side real para
guardarlo (no solo la cookie firmada actual), y Sessions es justo eso.

### Plan concreto

1. Elegir el driver **`db0`** apuntando a la misma base Turso que ya se va
   a usar para todo lo demás (`docs/04-migracion-datos.md`) — no agregar
   Redis/KV nuevo solo para esto, ya hay infraestructura de sobra.
2. Guardar en sesión: el JWT firmado por Hono (el que propone
   `docs/03-diseno-api.md` para distinguir sesión de admin del token
   compartido `API_SECRET_TOKEN`), y cualquier metadata de auditoría
   (IP/user-agent en login, si se decide loggear).
3. `adminGuard` en `middleware.ts` pasa de `verifySessionToken(token,
   secret)` (HMAC manual) a `Astro.session.get("admin")` — la revocación en
   logout se vuelve `Astro.session.destroy()`, real y persistente, no un
   `Map` en memoria por instancia.
4. **No borrar `adminSession.ts` todavía** cuando se empiece esto — dejarlo
   convivir y migrar `middleware.ts` primero, confirmar en producción, y
   solo entonces borrar el archivo viejo. Mismo criterio que se usó para
   Fase 2 (migración progresiva, no big-bang).

### Riesgo a vigilar / pregunta abierta

`session.driver` se configura **a build time** — variables de entorno
usadas ahí se inlinean en el build, no se leen en runtime (dicho
explícito en el propio `.d.ts` instalado). Si las credenciales de Turso
rotan, hace falta redeploy, no solo cambiar la env var en Vercel — a menos
que se use la opción de "override en runtime" que la guía menciona
(`session.driver` con entrypoint propio). Falta decidir si eso importa para
este proyecto (un solo admin, rotación de credenciales poco frecuente) o si
vale la pena el entrypoint custom desde el día uno.

## Referencias cruzadas

- `docs/03-diseno-api.md` — el JWT que va a vivir en esta sesión.
- `docs/04-migracion-datos.md` — la base Turso que el driver `db0` va a usar.
