# Data Fetching

Guía oficial: https://docs.astro.build/en/guides/data-fetching/

## Qué es

Todo componente `.astro` tiene `fetch()` global disponible en su script de
componente. En modo `output: "server"` (el modo de este proyecto), ese
fetch se ejecuta **en cada request**, en el servidor — no en build time.
Puede apuntar a una URL externa completa, o construirse contra las propias
rutas/endpoints de la app con `new URL("/api/algo", Astro.url)`. El dato
resultante se pasa como prop a componentes de framework (React, en este
caso) para hidratar con datos ya resueltos, en vez de que el componente
cliente tenga que pedirlos él mismo después de montar.

## Estado actual en el proyecto — auditoría completa

Grep de toda llamada a red (`fetch(`, `axios`, `api.`) en **todo** `src/`,
clasificada por dónde se ejecuta:

### Server-side, dentro de script de `.astro` (el patrón recomendado)

| Archivo | Qué pide | Cómo |
|---|---|---|
| `Proyectos.astro` | `GET /projects?currentLocale=...` a Hono | `api.get(...)` (axios), con `Authorization: Bearer API_SECRET_TOKEN` inyectado server-side — el secreto nunca llega al navegador |
| `Opiniones.astro` | comentarios/opiniones a Hono | Mismo patrón |

Ambos ya hacen exactamente lo que la guía recomienda: `await` de nivel
superior en el script del componente, resultado pasado como prop
(`initialData`) a la isla de React (`client:visible`). Esto ya estaba bien
antes de esta revisión.

### Client-side, dentro de un componente React

| Archivo | Qué pide | Cómo |
|---|---|---|
| `ItemDataExperiencia.tsx` | `GET /api/experiences?currentLocale=...` (proxy propio de Astro) | `fetch()` nativo dentro de `useEffect`, sin datos iniciales — spinner en cada mount |
| `admin/login.astro` (script inline) | `POST /api/admin/login` | `fetch()` nativo, client-side (correcto acá: es un submit de formulario) |
| `AdminDashboard.tsx` | CRUD completo (`GET`/`POST`/`PUT`/`DELETE` a `/api/admin/resource`) + `POST /api/admin/logout` | `fetch()` nativo, client-side (correcto: son mutaciones disparadas por acciones del admin, no datos iniciales de página) |

Login y el CRUD del admin están bien como están — son acciones de usuario,
no carga inicial de página, no hay nada que "pre-fetchear" ahí.
`ItemDataExperiencia.tsx` es el único caso real de mal uso del patrón: es
carga inicial de datos que debería resolverse en el servidor igual que
Proyectos y Opiniones, y hoy se resuelve en el cliente sin necesidad.

## Veredicto

**El patrón recomendado por la guía ya está en uso en 2 de 3 casos que lo
necesitan.** Esto no es una feature nueva que adoptar — es corregir la
única inconsistencia real, que además es el mismo hallazgo que
[01-server-islands.md](01-server-islands.md) señala desde otro ángulo.

### Plan concreto

Mover `Experiencia` (hoy `Experiencia.tsx` renderizando
`ItemDataExperiencia.tsx` con fetch en cliente) al mismo patrón que
`Proyectos.astro`/`Opiniones.astro`: convertir el wrapper a `.astro`, hacer
el fetch ahí con `api.get(...)` (o `fetch()` nativo, ver nota abajo), pasar
`initialData` como prop, y dejar que `ItemDataExperiencia.tsx` reciba los
datos en vez de pedirlos. Si además se adopta Server Islands (doc 01), este
fetch nace directo como `server:defer` en vez de bloquear el render de la
sección.

### Nota menor: axios vs `fetch()` nativo

`Proyectos.astro` y `Opiniones.astro` usan `axios` (vía `src/lib/api.ts`)
para hablar con Hono directo. La guía de Astro recomienda el `fetch()`
global nativo — no es que axios esté mal (el interceptor de headers/baseURL
es cómodo), pero es una dependencia extra para algo que `fetch()` +
`new URL()` resuelve sin librería. No es urgente cambiarlo: es una
simplificación opcional, no un bug. Si en algún momento se toca
`src/lib/api.ts` por otra razón, vale la pena evaluarlo ahí mismo.

## Referencias cruzadas

- [01-server-islands.md](01-server-islands.md) — mismo hallazgo de Experiencia, ángulo de dónde se ejecuta el render.
- `docs/01-arquitectura.md` — el patrón de proxy completo (`src/lib/api.ts` → `/api/[resource].ts` → Hono).
