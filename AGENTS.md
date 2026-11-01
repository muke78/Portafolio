# AGENTS.md — Instrucciones para agentes e IAs

Este archivo lo leen automáticamente los agentes de código que trabajan en
este repositorio (Claude Code, Codex, Cursor, Copilot, etc.). `CLAUDE.md`
solo lo importa. Las reglas de aquí son **obligatorias**, no sugerencias.

## Proyecto

Portafolio personal de Erick González (`muke78/Portafolio`).

- Astro 7 en modo SSR (`output: "server"`, adaptador de Vercel) con islas
  de React 18.
- Tailwind CSS v4 (CSS-first) + shadcn/ui sobre Base UI.
- Contenido servido por un backend propio (`Backend_Portafolio`: Hono +
  Drizzle + Turso), consumido a través del proxy `/api/*` de este repo.
- Idiomas: `es` (por defecto), `en`, `fr` — `src/i18n/locales/*.json`.
- Panel admin en `/admin/*` (sesión firmada + JWT de Hono).

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
- **Hooks de Husky.** `pre-commit` formatea con Biome; `pre-push` corre
  Biome, `astro check`, build, Vitest y Playwright. No uses `--no-verify`.
  Si Playwright no puede correr en tu entorno, el hook admite
  `SKIP_E2E=1 git push` — y hay que decirlo en el PR.
- **Versiones.** Cada ronda mergeada se cierra con tag `vX.Y.Z`, GitHub
  Release y bump de `package.json`, en un PR aparte (`chore/release-vX.Y.Z`).
- **Verificación.** Un cambio de UI no está terminado hasta verlo
  funcionando (navegador, claro y oscuro, móvil y escritorio). Si algo no
  se pudo verificar, se dice en el PR; no se da por bueno.

## Seguridad

- **Nunca** pidas, escribas, leas ni imprimas la contraseña real del
  admin ni valores de `.env`. El único script que toca la contraseña es
  `seed:admin` de `Backend_Portafolio`, y lo ejecuta el usuario en su
  terminal.
- No inventes sesiones, cookies ni tokens para "probar" páginas admin.
  Para verificar sin credenciales reales, usa HTML estático o pruebas a
  nivel de código y deja dicho que no se verificó autenticado.
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
   `bg-night/40`, etc. El oscuro es berenjena, el claro es perla; el test
   `tests/unit/designTokens.test.ts` lo hace cumplir. ¿Hace falta un color nuevo? Se agrega como
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
   tamaños salen de los tokens `text-display`, `text-title`, `text-subtitle`
   y `text-heading`; no uses `text-[clamp(...)]` ni `text-[Npx]`. Cuerpo
   de 17 px, aire generoso, un solo punto focal por sección. No
   introduzcas otras fuentes ni `font-bold` en el serif.
6. **Animación de scroll con GSAP + ScrollTrigger.** Fade-up, stagger y
   parallax sutil, solo con `transform` y `opacity`, dentro de
   `gsap.matchMedia()` y respetando `prefers-reduced-motion`. Toda la
   lógica pasa por `src/lib/motion.ts` (no uses `gsap.*` suelto en
   componentes). El contenido debe quedar visible sin JS (GSAP pone el
   estado inicial, no el CSS).
   Hover y foco se resuelven con CSS. Detalle y parámetros en la sección 7
   de `docs/UI_STANDARDS.md`.
7. **Ley de Hick.** Un CTA primario por bloque; pocas opciones visibles;
   el detalle bajo demanda.
8. **Textos por i18n.** Todo texto visible sale de `src/i18n/locales/`
   (es, en, fr). Cero cadenas fijas en componentes.

> **Estado actual (importante):** GSAP está instalado y centralizado en
> `src/lib/motion.ts`, pero **ninguna animación existente se ha migrado**
> todavía. Queda deuda de diseño conocida (composición de la galaxia 3D,
> `text-wrap: balance`, cobertura de reduced-motion, etc.),
> listada en la sección 10 de `docs/UI_STANDARDS.md`. No la "arregles de
> paso" dentro de un cambio ajeno: va en su propia rama.

## Estructura

```
src/
├── components/    # compartidos; ui/ = primitivos shadcn, icons/, three/, cosmos/
├── features/      # por dominio (aboutMe, projects, opinions, contact, navbar, admin)
├── i18n/          # traducciones + locales.ts (única fuente de idiomas)
├── layouts/       # Layout, AdminLayout, AdminLoginLayout
├── lib/           # sesión admin, rate limit, cliente API (servidor); motion.ts (GSAP, solo cliente)
├── middleware.ts  # validación de locale + guard del admin
├── pages/         # /[lang]/home, /admin/*, /api/*
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
