# Considerations — llevar la planeación al nivel de Astro nativo

`docs/01-05` (arquitectura, requisitos del panel, diseño de API, migración de
datos, estrategia de testing) siguen siendo el plan vigente. Esta carpeta no
los reemplaza: los **eleva**, revisando ocho features nativas de Astro que la
versión instalada en este proyecto (Astro **7.3.1**, adapter
`@astrojs/vercel@11.0.10`) ya trae, y que el WIP actual no está usando — o
usa a medias.

## Metodología

Nada de lo que sigue es "según la documentación dice que...". Cada doc está
verificado contra:

1. El código real del proyecto (`grep`/lectura de cada archivo relevante:
   `.astro`, `.tsx`, `astro.config.mjs`, `middleware.ts`, `src/lib/`,
   `src/schemas/`) — auditoría de **toda la app**, no de una sección.
2. Los `.d.ts` instalados en `node_modules/astro` y
   `node_modules/@astrojs/vercel` — para confirmar que una API existe, su
   forma exacta y si el adapter de Vercel la soporta de fábrica, en vez de
   asumir por la guía.

Cuando algo no se pudo confirmar así (por ejemplo, cómo se comporta un
proveedor en producción real), queda marcado como pregunta abierta, igual que
en `docs/02` y `docs/03`.

## Índice y veredicto rápido

| # | Doc | Feature | Veredicto |
|---|-----|---------|-----------|
| 1 | [01-server-islands.md](01-server-islands.md) | Server Islands (`server:defer`) | **Adoptar después** — candidato claro: `Experiencia` (hoy hace fetch en cliente con spinner). Depende de 02 (caching) para dar todo su valor. |
| 2 | [02-caching.md](02-caching.md) | Route caching / cache provider | **Adoptar ahora, alcance acotado** — provider de Vercel ya existe en el paquete instalado, solo falta encenderlo. La ruta `/[lang]/home` se queda sin cachear hasta que 01 separe las secciones dinámicas. |
| 3 | [03-sessions.md](03-sessions.md) | Astro Sessions (`astro:session`) | **Adoptar en Fase 6** (endurecimiento admin) — reemplaza el `Map` en memoria de `adminSession.ts`, que no sobrevive cold start, por un driver real respaldado en Turso. |
| 4 | [04-images.md](04-images.md) | `<Image>`/`<Picture>` (`astro:assets`) | **Adoptar ahora** — hay un bug real: el `<Image>` de `Header.astro` no se está optimizando. 4 `<img>` crudos evitables, 2 que deben seguir crudos a propósito. |
| 5 | [05-data-fetching.md](05-data-fetching.md) | `fetch()` en `.astro` | **Ya se usa bien en 2 de 3 casos** — `Experiencia` es la excepción, mismo hallazgo que en 01. |
| 6 | [06-zod-astro-module.md](06-zod-astro-module.md) | `astro/zod` | **Adoptar ahora, cambio trivial** — mismo Zod v4 que ya usan, una dependencia menos. |
| 7 | [07-view-transitions.md](07-view-transitions.md) | `<ClientRouter />` | **Solo evaluar, no adoptar todavía** — riesgo real de interferir con el fix de anclas recién hecho. Esperar a tener cobertura de test sólida (doc 8). |
| 8 | [08-testing-strategy.md](08-testing-strategy.md) | Vitest + Playwright + Nightwatch | **Adoptar Vitest ahora, descartar Nightwatch** — Nightwatch es alternativa a Playwright, no complemento; correr los dos duplica mantenimiento sin ganar cobertura. |

## Orden de implementación sugerido

No son 8 tareas sueltas — hay dependencias reales entre ellas:

```
06 (zod)  ─── independiente, se puede hacer ya, cualquier momento
04 (images) ── independiente, se puede hacer ya
08 (testing) ── independiente, da la red de seguridad para todo lo demás

02 (caching) ──┐
               ├──> 01 (server islands) ──> 07 (view transitions, opcional)
05 (fetching) ─┘

03 (sessions) ── ligado a Fase 6 (panel admin real), no antes
```

`caching` y `data-fetching` alimentan directamente a `server-islands`: no
tiene sentido diferir una sección a un server island si esa sección no tiene
su propia política de caché — el island volvería a ejecutarse en cada
request igual que ahora. `view-transitions` se deja para el final porque
toca navegación real (cambio de idioma, login→dashboard) y ahí es donde el
bug de anclas ya causó un problema — no se toca sin cobertura de Playwright
corriendo de verdad (no solo escrita, **ejecutada** — ver `docs/05-estrategia-testing.md`, sigue bloqueado por la sandbox).
