# Server Islands

Guía oficial: https://docs.astro.build/en/guides/server-islands/

## Qué son

Un componente marcado `server:defer` se renderiza en el servidor pero
**después** de que el resto de la página ya se envió: Astro manda un
placeholder + un script pequeño que pide ese fragmento en una request aparte
y lo inyecta cuando llega. Cada server island:

- Tiene su propia respuesta HTTP, con sus propios headers de caché
  (encaja directo con [02-caching.md](02-caching.md)).
- Puede acceder a cookies/headers de la request original (`Astro.cookies`,
  cabeceras) para personalizar sin tumbar el caché del resto de la página.
- Funciona sin importar el `output` global (`static`, `server` o `hybrid`) —
  no es exclusivo de sitios prerenderizados, aunque ahí es donde más se habla
  de ellos. Verificado contra el runtime instalado
  (`node_modules/astro/dist/runtime/server/render/server-islands.js`): el
  mecanismo (`ServerIslandComponent`, placeholder + fetch de host) no
  condiciona nada al modo de output.

## Estado actual en el proyecto

Búsqueda en **todo** `src/`: cero usos de `server:defer` (`grep -r
"server:defer" src` → sin resultados). El proyecto no usa esta feature.

`astro.config.mjs` tiene `output: "server"` global, y `/[lang]/home` está
deliberadamente **sin prerender**, con este comentario propio en el config:

> "The `[lang]/home` route is fully dynamic SSR (no `getStaticPaths`, no
> prerender) - deliberately kept that way so admin-panel edits show up live
> without a redeploy."

Ese es el problema real que Server Islands ataca. Hoy, para que una sola
sección (Proyectos, por ejemplo) refleje una edición del admin sin
redeploy, **toda la página** paga el costo de ser 100% dinámica en cada
request — hero, footer, wordmark, todo — aunque el 90% del contenido no
cambia entre un request y el siguiente.

### Inventario completo de secciones con datos (auditado archivo por archivo)

| Sección | Componente | Origen de datos | Patrón actual |
|---|---|---|---|
| Proyectos | `Proyectos.astro` → `TabsProyectos` | Hono/Turso (`projects`) | SSR fetch en `.astro`, props a la isla (`client:visible`) |
| Opiniones | `Opiniones.astro` → `Opinions` | Hono/Turso (`comments`) | SSR fetch en `.astro`, props a la isla (`client:visible`) |
| Experiencia | `Experiencia.tsx` → `ItemDataExperiencia.tsx` | Hono/Turso (`experiences`), vía `/api/experiences` | **Fetch en cliente** (`useEffect` + `fetch`), sin props iniciales, spinner en cada carga |
| Educación | `Educacion.tsx` | i18n JSON estático (`UNIVERSITY.*`) | No hay datos que diferir, es contenido fijo |
| Acerca de mí | `SobreMi.tsx` | i18n JSON estático (`ABOUTME.*`) | Igual, contenido fijo |
| Habilidades | `ItemDataHabilidades.tsx` | Archivos estáticos por locale (`dataTabsAcercaDe*.ts`) | Igual, contenido fijo |

Los tres primeros son datos "vivos" (van a venir del panel admin);
los tres últimos hoy son estáticos, pero según `docs/02-panel-admin-requisitos.md`
Educación y Acerca de mí van a volverse dinámicos también.

**Hallazgo real, no cosmético**: `Experiencia` es la única sección con datos
vivos que NO sigue el patrón SSR-fetch-a-props que sí usan Proyectos y
Opiniones (ver [05-data-fetching.md](05-data-fetching.md)). Resultado: en
cada carga de la página, aunque el resto ya vino renderizado desde el
servidor, Experiencia muestra un spinner y dispara un round-trip extra desde
el navegador — el único de las tres secciones que hace esto.

## Veredicto

**Adoptar, pero no ahora mismo.** Server Islands da más valor combinado con
caching (doc 02): la razón de ser de un island es que su fragmento tenga una
política de caché/invalidación distinta a la del resto de la página. Sin esa
pieza, migrar algo a `server:defer` solo cambia *cuándo* se ejecuta el
fetch, no si se repite en cada request — sigue siendo trabajo, no ahorra
nada todavía.

### Plan concreto (cuando se retome)

1. **Primer candidato: Experiencia.** Convertirla a `server:defer` en vez de
   fetch-en-cliente resuelve dos cosas a la vez: quita el spinner/waterfall
   del cliente, y la deja lista para tener su propio `Astro.cache.set(...)`
   independiente del resto de home.astro.
2. **Segundo candidato: Proyectos y Opiniones.** Ya siguen el patrón
   fetch-en-servidor correcto; el cambio sería moverlas de "SSR bloqueante
   de la respuesta principal" a "server island con su propio `swr` /
   `tags`", para poder invalidar solo `projects` o solo `comments` cuando el
   admin edite uno, sin tocar el resto de la página.
3. **Cuando Educación/Acerca de mí/Habilidades se vuelvan dinámicas**
   (`docs/02-panel-admin-requisitos.md`), nacen ya como server island desde
   el día uno — no hay que migrarlas después.
4. El wordmark, el hero, el nav y el footer se quedan fuera de todo esto:
   son estáticos de verdad, no necesitan ni SSR dinámico ni server island.

### Riesgo a vigilar

Cada server island es una request HTTP adicional desde el navegador — en
una conexión lenta, una sección que hoy llega en el HTML inicial podría
"parpadear" (placeholder → contenido) si no se le pone un skeleton
consistente con el que ya existe (`SkeletonProjectsCard.tsx`). No es
motivo para no hacerlo, pero el skeleton tiene que estar en cada island
antes de mergear, no después.

## Referencias cruzadas

- [02-caching.md](02-caching.md) — la pieza que le da sentido a diferir estas secciones.
- [05-data-fetching.md](05-data-fetching.md) — mismo hallazgo de Experiencia, desde el ángulo de fetch.
- `docs/02-panel-admin-requisitos.md` — de aquí sale qué secciones se vuelven dinámicas.
