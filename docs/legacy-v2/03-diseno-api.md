# Diseño de API (Hono) y checklist de seguridad

Este documento vive en el repo del frontend, pero describe el contrato que
debe cumplir el backend de Hono (repo aparte) para que el panel admin
funcione bien y de forma segura. Pediste explícitamente mejorar la
seguridad y construir mejor los endpoints — esto es ese trabajo.

## Problema de seguridad actual (el más importante)

Hoy Hono confía únicamente en un `API_SECRET_TOKEN` fijo, compartido, que
vive en las variables de entorno de Vercel. Astro lo agrega a cada petición
server-side (`src/lib/api.ts`), pero **Hono no distingue** entre "esta
petición viene del panel admin autenticado" y "esta petición trae el token
correcto" — son la misma cosa desde el punto de vista de Hono.

Esto significa:

- Si el token se filtra (log, variable de entorno expuesta, etc.), quien lo
  tenga puede escribir lo que quiera en Turso, sin pasar por el login del
  admin en absoluto.
- No hay forma de revocar el acceso de "una sesión" — solo se puede rotar
  el token completo, lo que rompe todo hasta actualizar la variable de
  entorno en Vercel.
- La sesión de admin (cookie HMAC) hoy solo la valida Astro
  (`src/middleware.ts` + `src/lib/adminSession.ts`) — es una capa de
  autenticación que Hono ni siquiera sabe que existe.

**Recomendación**: que las rutas de escritura de Hono (`POST`/`PUT`/
`DELETE`) exijan un JWT de corta duración (firmado con una clave que solo
Astro y Hono conozcan, distinta del `API_SECRET_TOKEN`), emitido en el
login del admin y verificado por Hono en cada mutación — no solo por Astro.
El `API_SECRET_TOKEN` fijo queda solo para las lecturas públicas
(`GET /projects`, `GET /experiences`, etc.), que no necesitan identificar
a un usuario.

## Checklist de seguridad para Hono

- [ ] Validación de entrada con Zod (o similar) en **cada** endpoint de
      escritura — no confiar en que el frontend ya validó. Reusar las
      mismas reglas que ya existen en `src/schemas/*.ts` de este repo como
      referencia de qué validar (longitudes, formatos).
- [ ] JWT de sesión admin verificado por Hono en escrituras (ver arriba),
      no solo el bearer token fijo.
- [ ] Rate limiting en el backend también, no solo en Astro — hoy
      `src/lib/rateLimit.ts` protege `/api/admin/login` desde Astro, pero
      un atacante que le pegue directo a Hono (si la URL se filtra) se lo
      salta por completo.
- [ ] CORS explícito: solo el origen de producción de Vercel (y localhost
      en desarrollo), no `*`.
- [ ] Sanitizar/validar URLs de imágenes antes de guardarlas (que
      `card_image`/`img` no acepten cualquier string arbitrario si en el
      futuro se permite pegar URLs externas además de subir a R2).
- [ ] Logs de auditoría básicos en escrituras del admin (quién — aunque
      sea un solo usuario, sirve para depurar — qué recurso, cuándo).
- [ ] Confirmar el runtime de Hono (Node vs Cloudflare Workers vs otro) y
      que las dependencias usadas (JWT, hashing, etc.) sean compatibles —
      esto también decide la estrategia de conversión de imágenes
      (ver [`02-panel-admin-requisitos.md`](./02-panel-admin-requisitos.md)).

## Contrato de endpoints propuesto

Recursos ya existentes en Hono (confirmado por el proxy actual en
`src/pages/api/[resource].ts` y `src/pages/api/admin/resource.ts`):
`projects`, `experiences`, `comments`. Recursos nuevos a agregar para
cubrir todo lo que pediste:

| Recurso | GET (público) | GET (admin, todos+borradores) | POST | PUT | DELETE |
|---|---|---|---|---|---|
| `projects` | ✅ | ✅ | ✅ admin | ✅ admin | ✅ admin |
| `projects_translations` | (embebido en `projects`) | — | ✅ admin | ✅ admin | — |
| `experiences` | ✅ | ✅ | ✅ admin | ✅ admin | ✅ admin |
| `education` **(nuevo)** | ✅ | ✅ | ✅ admin | ✅ admin | ✅ admin |
| `education_translations` **(nuevo)** | (embebido) | — | ✅ admin | ✅ admin | — |
| `skills` **(nuevo)** | ✅ | ✅ | ✅ admin | ✅ admin | ✅ admin |
| `about_me` **(nuevo)** | ✅ | ✅ | — | ✅ admin | — |
| `comments` | ✅ (solo `published`) hecho | ⏳ admin (todos los estados) Fase 4 | ✅ público (crea `pending`) hecho | ⏳ admin (cambia `status`, edita) Fase 4 | ⏳ admin Fase 4 |
| `contact_messages` **(nuevo)** — hecho | — | ⏳ admin Fase 4 | ✅ público hecho | ⏳ admin (marca leído/respondido) Fase 4 | ⏳ admin Fase 4 |
| `uploads` **(nuevo)** | — | — | ✅ admin (sube a R2, devuelve URL webp) | — | ✅ admin (borra de R2) |

Todos los `GET` públicos llevan `?currentLocale=` igual que hoy
(`src/pages/api/[resource].ts` ya reenvía ese parámetro).

`contact_messages` **decisión ya tomada y ejecutada** (repo
Backend_Portafolio, tag 0.3.0 — ya no está condicional): centro de
mensajes en Turso, sin redirect a WhatsApp. El `POST` público ya no pasa
por `/tlgrm` (eliminado, junto con todo el módulo de Telegram — ni
siquiera quedó como notificación paralela) — escribe directo en
`contact_messages` vía `POST /api/contact-messages`. Detalle completo en
`docs/02-comentarios-y-contacto.md` de ese repo. Las columnas marcadas
"admin" (todos los estados, editar, borrar) siguen pendientes de ruta
real — necesitan el JWT de sesión admin de la Fase 4, no el bearer token
fijo actual.

Todos los endpoints marcados "admin" deben exigir el JWT de sesión
propuesto arriba, no solo el bearer token fijo.

## Qué no cambia en el frontend

El patrón de proxy de Astro (`src/pages/api/*.ts` reenviando a Hono con el
token/JWT agregado server-side) sigue siendo correcto y no hay que
tirarlo — es justo el que evita que el navegador vea cualquier secreto.
Lo que cambia es qué le mandan esas rutas a Hono (el JWT de sesión, no solo
el token fijo, en las escrituras admin) y que se sumen las rutas nuevas de
`src/pages/api/admin/resource.ts` (o dedicadas) para los recursos nuevos
de la tabla de arriba.
