# AGENTS.md — Instrucciones para agentes e IAs

Este archivo lo leen automáticamente los agentes de código que trabajan en
este repositorio (Claude Code, Codex, Cursor, Copilot, etc.). `CLAUDE.md`
solo lo importa. Las reglas de aquí son **obligatorias**, no sugerencias.

## Proyecto

Portafolio personal de Erick González (`muke78/Portafolio`).

- Astro 7 en modo SSR (`output: "server"`) con islas de React 18,
  desplegado en Cloudflare Pages (ver Infraestructura).
- Tailwind CSS v4 (CSS-first) + shadcn/ui sobre Base UI.
- Contenido servido por un backend propio (`Backend_Portafolio`: Worker de
  Hono + Cloudflare D1 + R2), consumido a través del proxy `/api/*` de este
  repo.
- Idiomas: `es` (por defecto), `en`, `fr` — `src/i18n/locales/*.json`.

## Infraestructura

Todo el stack vive en **Cloudflare** (V8 isolates, sin contenedores):

| Pieza | Servicio |
|---|---|
| Frontend (este repo, Astro SSR) | **Cloudflare Pages** |
| API de contenido (`Backend_Portafolio`) | **Worker de Hono** |
| Base de datos | **Cloudflare D1** |
| Imágenes y archivos | **Cloudflare R2** |

- El **panel de administración (CMS) ya no vive en este repo**: es un
  sistema *headless* independiente que escribe en la misma API. Aquí no
  hay rutas `/admin/*`, ni sesión de admin, ni layouts de admin; no los
  recrees.
- Este sitio solo lee y escribe contenido público a través del proxy
  `/api/*` (que agrega el token server-side).
- El adaptador de Astro para Cloudflare se configura en su propia rama.
- **CI/CD en GitHub Actions** (`.github/workflows/`): `ci-dev.yml` valida
  los PRs a `dev` (Biome, `astro check`, Vitest, build) y `ci-main.yml`
  los PRs a `main` (lo mismo + Playwright). El deploy a Pages
  (`wrangler pages deploy`) está preparado y comentado en `ci-main.yml`
  hasta cargar los tokens de Cloudflare en GitHub.

## Comandos

```bash
pnpm dev               # servidor de desarrollo en http://localhost:4321
pnpm check             # astro check (tipos); debe quedar en 0 errores
pnpm check:biome       # Biome: formato + lint (con --write)
pnpm build             # build de producción
pnpm test:unit         # Vitest
pnpm test:e2e          # Playwright (necesita el servidor corriendo)
```

Gestor de paquetes: **pnpm**. No uses npm ni yarn.

## Flujo de trabajo (obligatorio)

- **Ramas.** Una rama por cambio, chica e independiente, creada desde
  `dev` (`feat/…`, `fix/…`, `chore/…`, `docs/…`). Nunca se trabaja
  directo en `dev` ni en `main`.
- **Todo llega a `dev` por un Pull Request real de GitHub**
  (`gh pr create --base dev`). Prohibido `git merge` local + `git push`
  a `dev`. El agente **abre** el PR; **no lo mergea** salvo orden
  explícita del usuario.
- **`main` no se toca** salvo petición explícita del usuario.
- **Tamaño de commit.** Commits grandes y temáticos, no atómicos: cada
  commit agrupa **25–35 archivos** modificados. Si el cambio completo toca
  menos de 25, va en **un solo commit**; nunca se rellena con archivos
  ajenos para llegar al mínimo.
- **Commits** en formato Conventional Commits (`feat:`, `fix:`, `docs:`,
  `chore:`, `refactor:`, `perf:`, `test:`, `style:`, `ci:`, `build:`,
  `revert:`). El hook `commit-msg` lo valida. Ver `docs/DocsCommiter.md`.
- **Hooks de Husky (solo lo rápido).** `commit-msg` valida el formato y
  `pre-commit` pasa Biome sobre los archivos en staging. No uses
  `--no-verify`. Lint, tipos, tests y build los corre GitHub Actions en
  cada PR (`ci-dev.yml` hacia `dev`, `ci-main.yml` hacia `main`); un push
  ya no los ejecuta localmente: corre `pnpm check`, `pnpm test:unit` y
  `pnpm build` antes de abrir el PR.
- **Versiones.** Cada ronda mergeada se cierra con tag `vX.Y.Z`, GitHub
  Release y bump de `package.json`, en un PR aparte (`chore/release-vX.Y.Z`).
- **Verificación.** Un cambio de UI no está terminado hasta verlo
  funcionando (navegador, claro y oscuro, móvil y escritorio). Si algo no
  se pudo verificar, se dice en el PR; no se da por bueno.

## Seguridad

- **Nunca** pidas, escribas, leas ni imprimas contraseñas, tokens ni
  valores de `.env` (incluidos los secretos de Cloudflare y de GitHub
  Actions).
- No inventes sesiones, cookies ni tokens para "probar" nada. Para
  verificar sin credenciales reales, usa HTML estático o pruebas a nivel
  de código y deja dicho qué no se verificó.
- Toda entrada del usuario se valida con Zod en cliente **y** servidor
  (esquemas compartidos en `src/schemas/`).

## Sistema de diseño (obligatorio para cualquier cambio de UI)

La fuente de verdad es **[`docs/UI_STANDARDS.md`](./docs/UI_STANDARDS.md)**.
Léelo antes de tocar estilos, componentes o animaciones. Resumen de las
reglas que no se negocian:

1. **Solo la paleta del proyecto.** Los colores salen de los tokens de
   `src/styles/app.css` (`bg-background`, `text-foreground`,
   `text-primary`, `border-border`, …). Prohibido hex, `rgb()` u `oklch()`
   sueltos en componentes, y **prohibido el blanco y el negro puros**
   (`#fff`, `#000`, `text-white`, `bg-black`): usa `text-primary-foreground`,
   `bg-night/40`, etc. La base es **neutra** (oscuro onyx/charcoal, claro
   silk/blanco roto con texto carbón) y el **violeta vive solo en
   `--primary`**: nunca teñir fondos ni textos de morado/berenjena. En
   oscuro las superficies suben fondo < card < muted (nunca un bloque más
   oscuro que el fondo). El test `tests/unit/designTokens.test.ts` lo hace
   cumplir. ¿Hace falta un color nuevo? Se agrega como
   token (claro y oscuro) con su contraste medido, no inline.
2. **Accesibilidad (WCAG 2.1 AA) por encima de la estética.** Contraste
   de texto ≥ 4.5:1 y de componentes/foco ≥ 3:1 en **ambos temas**; foco
   visible; todo operable con teclado; un solo `<h1>` y encabezados sin
   saltos; etiquetas visibles en formularios; errores asociados con
   `aria-describedby`; nada que dependa solo del color.
3. **shadcn estandarizado.** Usa los primitivos de `src/components/ui/`
   (`Button`, `Input`, `Card`, …) y las variantes existentes. No escribas
   botones, inputs ni cards a mano. Añade componentes con la CLI de
   shadcn, no copiándolos de memoria.
4. **Solo iconos de Lucide** (`lucide-react`). Única excepción: logos de
   marca, que viven en `src/components/icons/BrandIcons.tsx`. No agregues
   otra librería de iconos.
5. **Tipografía del sistema.** Instrument Serif para titulares
   (`font-serif-display`), Geist para texto, Geist Mono para etiquetas
   (`eyebrow`, 13 px en frase normal, sin mayúsculas diminutas). Los
   tamaños salen de los tokens `text-hero` (solo el nombre del hero),
   `text-display`, `text-title`, `text-subtitle` y `text-heading`; no uses `text-[clamp(...)]` ni `text-[Npx]`. Cuerpo
   de 17 px, aire generoso, un solo punto focal por sección. No
   introduzcas otras fuentes ni `font-bold` en el serif.
6. **Animación de scroll con GSAP + ScrollTrigger.** Fade-up, stagger y
   parallax sutil, solo con `transform` y `opacity`, dentro de
   `gsap.matchMedia()` y respetando `prefers-reduced-motion`. Toda la
   lógica pasa por el motor de `src/lib/motion/` (no uses `gsap.*` suelto
   en componentes): el HTML solo lleva atributos de datos (`data-reveal`,
   `data-split`, `data-manifesto`, `data-parallax-img`, `data-marquee`,
   `data-mask`, `data-stagger`, `data-scrub-text`, `data-hscroll`,
   `data-stack`, `data-fly-*`, `data-snake`, `data-dialog-*`, `data-fab`,
   `data-detail-*`,
   `data-hero-*`; ver 7.7 y 12.4 de `docs/UI_STANDARDS.md`). **Antes de
   animar algo nuevo lee `docs/GSAP.md`**: qué ofrece GSAP, qué plugins hay
   y cuál usar. El contenido debe quedar visible sin JS (GSAP pone el
   estado inicial, no el CSS).
   Hover y foco se resuelven con CSS. Detalle y parámetros en la sección 7
   de `docs/UI_STANDARDS.md`.
7. **Hovers táctiles, no cambios de color.** Cards: `hover-lift`;
   botones y chips: `hover-press`; flechas: `hover-nudge` (definidos en
   `app.css`, estándar en la sección 5.5). Un solo hover por elemento: la
   card reacciona entera, **sin animar sus partes internas** (nada de zoom
   de imagen ni iconos que aparecen al pasar el cursor).
8. **Skeletons, nunca spinners.** Todo estado de carga usa `<Skeleton />`
   con la forma del contenido final; prohibido `animate-spin`, `Loader2` y
   `LoaderCircle` (sección 5.6).
9. **Ley de Hick.** Un CTA primario por bloque; pocas opciones visibles;
   el detalle bajo demanda.
10. **Textos por i18n.** Todo texto visible sale de `src/i18n/locales/`
   (es, en, fr). Cero cadenas fijas en componentes.

> **Estado actual (importante):** el motor GSAP está **activo** (hero
> orquestado, escena fijada del manifiesto, títulos con máscara, revelados
> por lotes, parallax y marquee ligado al scroll). Una escena fijada dura como
> máximo 2.5 pantallas y nunca corre con `prefers-reduced-motion: reduce`.
> Queda deuda conocida (cobertura e2e de reduced-motion, etc.) en la sección
> 10 de `docs/UI_STANDARDS.md`. No la "arregles de paso" dentro de un cambio
> ajeno: va en su propia rama.

## Estructura

```
src/
├── components/    # compartidos; ui/ = primitivos shadcn, icons/, three/, cosmos/
├── features/      # por dominio (aboutMe, projects, opinions, contact, navbar)
├── i18n/          # traducciones + locales.ts (única fuente de idiomas)
├── layouts/       # Layout
├── lib/           # rate limit, cliente API (servidor); motion/ (motor GSAP, solo cliente)
├── middleware.ts  # validación de locale
├── pages/         # /[lang]/home, /[lang]/project/[id], /api/*
├── schemas/       # esquemas Zod
└── styles/        # app.css (tokens + Tailwind v4), styles.css
docs/              # arquitectura, plan (TODO.md), UI_STANDARDS.md
```

## Antes de entregar

- [ ] `pnpm check` en 0 errores y `pnpm check:biome` limpio.
- [ ] Tests nuevos o actualizados para lo que cambió; `pnpm test:unit` en verde.
- [ ] UI: probada en claro y oscuro, a 375 px y ≥ 1280 px, con teclado.
- [ ] PR hacia `dev`, con descripción de qué cambia y qué **no** se pudo
      verificar.
