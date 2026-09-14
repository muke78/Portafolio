# Por realizar y cambios

Roadmap ordenado: qué se hace, en qué orden, y por qué ese orden. No es una
lista de deseos suelta — cada tarea de aquí depende de la anterior de forma
real (código, no solo prioridad), y las dependencias están explicadas, no
solo declaradas. Las tareas que vienen de `docs/considerations/` no se
repiten aquí completas — este archivo dice el **orden de ejecución**; el
detalle técnico de cada una vive en su doc correspondiente.

## Cómo se libera esto (política de versiones)

Nada de esto se sube a `main` directo. Todo pasa por `dev`, y `main` solo
avanza vía **tag de versión** — igual que ya se viene haciendo
(`khelde@v.3.1.4` es el último release real, PR
[#63](https://github.com/muke78/Portafolio/pull/63)). Esto no cambia; lo
que se documenta aquí es cómo se van a encadenar las versiones **desde
ahora hasta la v4**.

### Estado real de la versión, verificado

- Último tag en GitHub: `v.3.1.4`.
- `package.json` dice `"version": "3.0.2"` — **desincronizado**, se quedó
  atrás dos releases. Antes de seguir tageando, hay que alinear
  `package.json` a `3.1.4` (o a lo que sea el tag real en el momento en que
  se retome esto) — si no, cada bump nuevo parte de un número que ya no
  corresponde a nada publicado.
- Formato de tag **inconsistente** en el historial completo (`git tag`):
  conviven `v.1.0.2`...`v.3.1.4` (con punto después de la "v") y
  `v1.0.0`/`v1.0.1`/`v1.0.2` (sin punto, aparentemente tags sueltos de una
  prueba vieja, mismo número que ya existía con el otro formato). **Desde
  el próximo tag en adelante: formato `vX.Y.Z`, sin el punto extra** — es
  el que reconocen GitHub Releases y cualquier herramienta de semver sin
  parseo especial. No hay que reescribir el historial viejo, solo no seguir
  arrastrando la inconsistencia.

### Regla de bump

- **`patch` (3.1.x)**: un fix o doc que no agrega capacidad nueva
  observable (ej. arreglar el link del footer, un doc nuevo en
  `considerations/`).
- **`minor` (3.x.0)**: una tarea completa de esta lista que agrega algo
  real y no rompe nada existente (Vitest funcionando, el pipeline de Husky,
  cada `considerations/0N` adoptado, cada pieza de la expansión de Hono).
- **`major` (4.0.0)**: cuando **todas** las tareas de este documento estén
  hechas y verificadas — panel admin real, en vivo, con Hono endurecido. Es
  el release que por fin sincroniza `dev` → `main` (el punto que se dejó
  pendiente explícitamente hace tiempo: "el número 1 lo dejamos para
  después" — este es ese después).

No hace falta decidir el número exacto de cada minor ahora — el orden de
abajo es el compromiso, el número se asigna al momento de taggear cada uno.

---

## 1. Testing real de todo el portafolio (Vitest + Playwright) — primero

Esto va antes que cualquier otra cosa porque es lo que hace confiable todo
lo que viene después: si se toca Hono/caching/sessions sin una red de
pruebas real corriendo, cualquier regresión se detecta en producción, no
antes.

Cubre `docs/considerations/08-testing-strategy.md` completo — ese doc
queda archivado junto con el resto de `considerations/` (es el 08 de esa
carpeta), pero como **tarea** es la primera de todas, no la última. No se
duplica contenido aquí, solo el orden.

- [x] Instalar y configurar Vitest (`vitest.config.ts` vía
      `getViteConfig()`, scripts `test:unit`/`test:unit:watch`).
- [x] Unit tests reales para los 5 candidatos ya identificados:
      `contactSchema.ts`, `opinionsSchema.ts`, `adminSession.ts`,
      `rateLimit.ts`, `i18n/index.ts` (`getI18N`) — 33 tests, 5 archivos,
      corriendo en verde (`pnpm test:unit`).
- [x] Ampliar Playwright más allá de los 5 specs originales — 5 specs
      nuevos: `contact-form.spec.ts` (éxito/fallo, con
      `page.route()` mockeando `/api/tlgrm` para no disparar Telegram
      real en cada corrida), `theme-switch.spec.ts`, `tabs-navigation.spec.ts`
      (Acerca de mí + Proyectos), `opinions-submit.spec.ts` (éxito/fallo,
      mock de `/api/comments`), `responsive.spec.ts` (375px/768px, sin
      overflow horizontal, sheet móvil). 10 specs en total.
- [x] Bug real encontrado escribiendo `contact-form.spec.ts` y arreglado
      en el mismo cambio: `Form.tsx` nunca revisaba `res.ok` antes de
      mostrar el toast de éxito — mismo bug que ya se había arreglado en
      `sendOpinions.tsx`, quedó sin tocar en el formulario de contacto.
- [ ] **Sigue bloqueado**: correr los 10 specs contra un browser real.
      `pnpm exec playwright install chromium` se reintentó en esta sesión
      — el host ya es alcanzable (antes ni eso), pero la descarga del
      binario (~150MB) sigue cortándose a los 30s. Confirmado que es la
      sandbox, no el setup. Los 10 specs están verificados solo por
      `tsc --noEmit` + `astro check` (0 errores). Correr de verdad en una
      máquina/CI con red real antes de dar la tarea por completamente
      cerrada.
- [x] Nightwatch: no se instala — decisión ya tomada y justificada en
      `docs/considerations/08-testing-strategy.md`.
- [ ] Coverage de los unit tests (`@vitest/coverage-v8`) — ver sección 1.5,
      para saber qué tanto del código real cubren estos tests o si son
      solo unos fragmentos.

**Version objetivo**: `minor` — ej. `v3.3.0` (`v3.2.0` ya se usó para el
snapshot de Fase 0-6 al cerrar la sesión anterior) — recién cuando los 10
specs de Playwright corran en verde de verdad, no solo compilen.

---

## 1.5 Higiene del proyecto: coverage, dependencias, auditoría de seguridad

Tres tareas chicas, independientes entre sí y de todo lo demás — cada una
en su propia rama/PR. Se agrupan aquí porque las tres son "limpieza antes
de seguir construyendo", mismo espíritu que la sección 1.

- [x] **Coverage de tests**: `@vitest/coverage-v8` instalado, `test.coverage`
      en `vitest.config.ts` acotado a `src/lib/**`, `src/schemas/**`,
      `src/i18n/index.ts` (a propósito — componentes React y páginas
      `.astro` los cubre Playwright, no Vitest; incluirlos aquí solo
      mostraría un muro de 0% de código que esta capa nunca debió cubrir).
      Script `pnpm test:unit:coverage`. Números reales (verificados contra
      el JSON crudo, no solo la tabla de terminal — ver nota abajo):
      **94.1% statements, 100% functions, 87.9% branches** sobre los 7
      archivos que sí toca (incluye `src/lib/utils.ts`, importado
      transitivamente).
      **Quirk documentado**: el reporter `text` de esta versión de Vitest
      (5.0.0) no imprime en la tabla de terminal las filas de
      `schemas/` ni `i18n/index.ts` aunque su cobertura SÍ está completa y
      correcta — confirmado leyendo `coverage/coverage-final.json` crudo y
      el reporte `coverage/index.html` (ambos completos, los 7 archivos
      presentes). El resumen agregado ("All files") sí es correcto, es
      puramente la tabla por-archivo la que no renderiza esas filas. No es
      un problema de esta configuración — es un bug/limitación de esa
      versión del reporter en Windows; para ver el desglose real usar
      `coverage/index.html`, no la tabla de terminal.
      De paso, arreglado: `tsconfig.json` tenía `baseUrl: "."` que
      TypeScript marca deprecado (se quita en TS 7.0) — quitado, el alias
      `@/*` sigue resolviendo igual (`paths` no necesita `baseUrl` desde
      TS 4.1), verificado con `tsc --noEmit` + `astro check` (0 errores).
- [x] **Limpieza de dependencias no usadas** en `package.json`. `depcheck`
      reportó 10 candidatas; verificadas una por una contra imports reales
      (no solo `.ts`/`.tsx`, también `@import` en CSS) antes de tocar nada:
      - **Falsos positivos, se quedan**: `@astrojs/check` (necesario para
        el script `check`, depcheck no ve dependencias solo-CLI),
        `@astrojs/ts-plugin` y `tailwindcss` (uso vía `tsconfig.json`/
        pipeline de build, no import de código), `@fontsource-variable/geist`,
        `@fontsource-variable/geist-mono`, `@fontsource/instrument-serif`,
        `tw-animate-css` (los 4 vía `@import` en `app.css`, que `depcheck`
        no rastrea).
      - **`shadcn` — casi se borra por error**: no hay ningún `import` de
        JS/TS, parecía candidata real (es normalmente un CLI que se
        invoca con `dlx`). Se quitó, `pnpm run build` **falló** —
        `app.css` hace `@import "shadcn/tailwind.css"`, el paquete
        físico sí hace falta en disco aunque nada lo importe en código.
        Reinstalada, movida a `devDependencies` (uso solo en build, no en
        runtime — más correcto que donde vivía antes).
      - **`swiper` — mismo patrón, encontrado por el build, no por grep**:
        `Layout.astro` tenía `import "swiper/swiper-bundle.css"` suelto,
        sin ningún componente `Swiper`/`SwiperSlide` en toda la app (el
        carrusel de testimonios se reemplazó por el marquee hace tiempo).
        Ese import y ~40 líneas de CSS `.swiper-*` muerto en
        `styles.css` eran belleza sin dueño — se borraron los dos, y con
        eso `swiper` sí quedó real y verificablemente sin uso. Borrado.
      - **`dotenv` — borrado limpio**: sin ninguna referencia en todo el
        repo; Astro ya carga `.env` nativo (`astro:env`), nunca hizo falta.
      - Verificado después de cada cambio con `pnpm run build` (no solo
        `astro check` — el build es el que de verdad detecta un import de
        CSS roto, `astro check` no lo cachó) + `pnpm test:unit`.
- [ ] **`pnpm audit`**: correrlo, documentar cada CVE real que aparezca
      (paquete, severidad, si hay fix disponible vía `pnpm update` o si
      hace falta esperar/cambiar de librería). Si algo aparece de
      severidad alta/crítica con fix disponible, se resuelve en la misma
      rama; si el fix implica un bump mayor con riesgo de romper algo, se
      documenta como su propia tarea en vez de forzarlo aquí.

**Version objetivo**: `patch` cada una (`v3.3.1`, `v3.3.2`, `v3.3.3` o
similar) — son mantenimiento, no capacidad nueva.

---

## 2. Rutas admin: quedan apagadas mientras se endurece Hono

Explícito, para no perderlo de vista: **`/admin` no debe funcionar como
algo confiable todavía**. El link público ya se quitó del footer
(`fix/hide-admin-access`, ya en `dev`); la ruta sigue existiendo en código
pero no se promueve ni se termina de asegurar hasta que Hono esté
endurecido — ver sección 5. No tiene sentido pulir la UI del panel antes de
que el backend al que le habla sea confiable; sería trabajo que hay que
repetir.

Lo único que sí puede avanzar ahora, sin exponer nada: seguir el checklist
de seguridad de `docs/03-diseno-api.md` del lado de Hono (JWT de sesión,
Zod en el backend, rate limiting propio, CORS explícito) — trabajo en el
repo de Hono, no visible desde el portafolio, "para que se empiece a
regular junto con el portafolio y quede lista para su expansión" antes de
construir nada nuevo encima.

---

## 3. Orden de ejecución de `docs/considerations/`

Del `01-arquitectura.md` hasta `considerations/07-view-transitions.md`,
esto es cuál va después de cuál — no son 7 tareas sueltas, tienen
dependencias reales entre sí (ya está el grafo en
`docs/considerations/README.md`; aquí se convierte en secuencia de
ejecución):

```
Paso 1 (independientes, cualquier momento, bajo riesgo):
  → considerations/06-zod-astro-module.md   (cambio trivial, 1 dependencia menos)
  → considerations/04-images.md             (bug real: <Image> del hero sin optimizar)

Paso 2 (preparan terreno):
  → considerations/02-caching.md   — SOLO el alcance acotado que ya marca el doc
    (routeRules en rutas estáticas: /admin/login, /404, etc.) — la parte de
    invalidación por tag sobre datos reales de Hono se mueve a la sección 5,
    no se puede hacer antes de que existan escrituras reales que invalidar.
  → considerations/05-data-fetching.md — mover Experiencia al patrón
    SSR-fetch-a-props (mismo hallazgo que server-islands, arreglarlo aquí).

Paso 3 (depende de paso 2):
  → considerations/01-server-islands.md — recién aquí tiene sentido: server
    islands sin caching propio no ahorra nada (ya explicado en el doc).
    Primer candidato: Experiencia, ya migrada en el paso 2.

Paso 4 (opcional, al final, con cautela):
  → considerations/07-view-transitions.md — solo evaluar, y solo después de
    que la sección 1 (testing) esté corriendo en verde de verdad. No se
    adopta si no hay forma de confirmar que no rompe el fix de anclas.
```

`considerations/03-sessions.md` **no** entra en esta secuencia — se mueve
completo a la sección 5, porque depende de que exista la tabla de
usuarios/sesión real en Turso, que todavía no existe.

**Version objetivo**: cada paso de este bloque es su propio `minor` (ej.
`v3.3.0` para paso 1, `v3.4.0` para paso 2, `v3.5.0` para paso 3, `v3.6.0`
si se retoma paso 4) — no hace falta que salgan juntos.

---

## 4. Pipeline local en Husky (gate antes de subir)

Hoy `.husky/` solo tiene `pre-commit` (formatea con Biome y re-agrega) y
`commit-msg` (valida convención del mensaje). No hay nada que corra build
ni tests antes de un `push` — se puede subir código roto a `dev` sin que
nada lo detecte localmente.

Depende de la sección 1: no tiene sentido gatear pushes con `vitest`/
`playwright` si esos comandos no existen o no pasan todavía.

- [ ] Nuevo hook `.husky/pre-push`, que corra en orden y corte en el primer
      fallo:
      1. `pnpm exec biome check --write ./src` (formatea + lint, no solo
         formato como hace hoy `pre-commit`)
      2. `pnpm exec astro check` (type-check completo)
      3. `pnpm run build` (confirma que el build de producción no se rompe)
      4. `pnpm test:unit` (Vitest, rápido, sin browser)
      5. `pnpm test:e2e` (Playwright) — **con salida clara si el binario de
         browser no está instalado**, en vez de fallar oscuro; considerar
         una variable de entorno (`SKIP_E2E=1 git push`) para permitir
         saltarlo puntualmente en una máquina sin browser instalado, sin
         quitar el paso por default.
- [ ] Documentar en el propio hook (comentario) que esto es el "CI local"
      — mismos pasos que debería correr cualquier pipeline de CI real si se
      agrega uno después (GitHub Actions), para que no diverjan.

**Version objetivo**: `minor`, ej. `v3.3.0` (puede salir junto con el paso
1 de la sección 3, ambos son infraestructura, no features visibles).

---

## 5. Expansión de Hono + Turso (apartado especial)

Esto extiende `docs/03-diseno-api.md` — el contrato de endpoints ya está
definido ahí. Lo que se agrega aquí es **cómo se llega** a ese contrato
desde el estado actual de la base real, más una pieza que `03-diseno-api.md`
no cubría explícito: la tabla de usuarios.

Se coloca aquí, después de testing/husky/considerations-paso-1-y-2, porque
es la pieza más grande y de más riesgo (toca datos reales en producción) —
necesita la red de pruebas de la sección 1 y el checklist de seguridad de
la sección 2 ya encaminados antes de tocar Turso de verdad.

### 5.1 Backup y limpieza de datos (extiende `docs/04-migracion-datos.md`)

- [ ] Bajar/exportar **toda** la información actual de Turso, tabla por
      tabla, antes de tocar nada — backup real, no solo "debería estar
      bien".
- [ ] Revisar cada tabla existente (`projects`, `projects_translations`,
      `experiences`, `comments`) contra el esquema propuesto en
      `docs/04-migracion-datos.md` — confirmar cuáles se pueden mejorar en
      su lugar y cuáles hay que reconstruir desde cero limpias (dato de
      prueba vs dato real, ya marcado como pendiente de revisión en ese
      doc).
- [ ] Confirmar si `experiences` ya tiene tabla de traducciones separada o
      no — no se puede saber desde el frontend, hay que verlo directo en
      el esquema real de Turso.

### 5.2 Tablas nuevas

Del contrato de `docs/03-diseno-api.md`: `education` +
`education_translations`, `skills`, `about_me` (+ traducciones),
`contact_messages` (condicional — ver 5.4, depende de WhatsApp vs. centro
de mensajes), `uploads`.

Y una que no estaba explícita ahí y hace falta ahora que hay más superficie
de API: **tabla de usuarios/login** (`users` o `admin_users`). Hoy el login
admin es un solo `ADMIN_PASSWORD` en variable de entorno, comparado directo
— no hay usuario real en base de datos. Con JWT de sesión (propuesto en
`docs/03-diseno-api.md`) y con la pregunta de 2FA todavía abierta
(`docs/02-panel-admin-requisitos.md`), tiene más sentido un registro real
en Turso: contraseña hasheada (no en texto plano en env var), campo para
2FA cuando se decida, y es el ancla natural para logs de auditoría de quién
hizo qué (también pendiente en el checklist de seguridad).

- [ ] Diseñar tabla `users`/`admin_users` (id, email o username, hash de
      password, campo 2FA opcional, timestamps).
- [ ] Migrar el login de "comparar contra `ADMIN_PASSWORD`" a "verificar
      contra el registro en Turso".

### 5.3 De aquí salen Sessions y Caching (para real, no solo documentado)

Con la tabla de usuarios y las tablas nuevas ya escribiendo datos reales:

- [ ] `considerations/03-sessions.md`: driver `db0` de Astro Sessions sobre
      esta misma Turso, reemplazando el `Map` en memoria de
      `adminSession.ts` — recién aquí tiene sentido, porque recién aquí hay
      un backend de sesión real al que apuntar.
- [ ] `considerations/02-caching.md`, la parte que quedó pendiente del
      paso 2 de la sección 3: invalidación por tag (`cache.invalidate`) en
      cada escritura admin exitosa sobre las tablas nuevas — esto es lo que
      permite que el panel "alimente el portafolio sin redeploy" sin tener
      que dejar toda la página sin caché para siempre.

### 5.4 Solo cuando 5.1–5.3 estén verificados: panel admin en vivo

- [ ] Formularios tipados por recurso para `education`/`about_me`/`skills`
      (ya arrancado parcialmente en `src/features/admin/`).
- [ ] Upload de imágenes a R2 + conversión automática a webp desde Hono.
- [ ] Refactor de Contacto: **decisión pendiente, no asumida** — Telegram/
      BotFather deja de ser el canal tal cual está hoy. Dos rutas reales
      (ver `docs/02-panel-admin-requisitos.md`, sección Contacto):
      redirigir directo a WhatsApp (sin backend nuevo, sin tabla), o un
      centro de mensajes en el panel admin persistido en
      `contact_messages` (con Telegram opcional en paralelo como
      notificación). Se puede combinar ambas. Confirmar cuál antes de
      crear la tabla en 5.2 — si es WhatsApp puro, `contact_messages` se
      cae del plan entero.
- [ ] Recién aquí: volver a poner el acceso al panel (footer o donde se
      decida, ver `docs/02-panel-admin-requisitos.md` sobre acceso
      discreto) — no antes.

**Version objetivo**: esta sección es grande, sale en varios `minor`
seguidos (`v3.7.0` backup+tablas, `v3.8.0` users+login real, `v3.9.0`
sessions+caching reales, `v3.10.0` panel admin en vivo) — no en un solo
tag.

---

## 6. Camino a v4.0.0

Cuando las secciones 1–5 estén completas y verificadas (no solo escritas —
corriendo, en verde, en producción de Vercel real): tag `v4.0.0`. Ese es el
release que:

- Marca el panel admin como confiable y en vivo.
- Es el primer sync real de `dev` → `main` desde que se pausó explícito
  ("lo dejamos para después, hay más cosas que hacer").
- Abre el canal estable — de ahí en adelante, cambios chicos vuelven a ser
  `patch`/`minor` normales sobre una v4 ya asentada, no parte de este
  roadmap de expansión.

No se toca `main` antes de eso salvo que el usuario lo pida explícito, como
ya se venía acordando.

---

## Cambios que se pueden ir haciendo para después

Bajo prioridad, no bloquean nada de lo de arriba, se acomodan donde haya
hueco:

- Mejorando el responsive de la aplicación.
