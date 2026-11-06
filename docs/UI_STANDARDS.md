# Estándares de UI y Sistema de Diseño

Documento maestro de diseño del portafolio. Fija la paleta, la tipografía,
el espaciado, los componentes base, la iconografía y las reglas de
animación **antes** de tocar el código de las páginas.

Aplica a `/[lang]/home` (`es`, `en`, `fr`) y a todo lo que se construya
encima: secciones públicas, formularios y panel admin.

> **Este documento describe el sistema que ya existe en el código**
> (`src/styles/app.css`, `src/components/ui/*`) y fija las reglas para lo
> que viene. Cada valor de color, fuente y tamaño de aquí se leyó del
> código, no se inventó. Lo que **todavía no está implementado** se marca
> explícitamente como _Pendiente_ (sección 10), para que nadie lo dé por
> hecho.

Normativa base: [WCAG 2.1](https://www.w3.org/TR/WCAG21/) nivel AA como
mínimo obligatorio (AAA donde no cueste identidad), más las guías de
[web.dev](https://web.dev/learn/accessibility) y
[`prefers-reduced-motion`](https://web.dev/articles/prefers-reduced-motion).

## Índice

1. [Principios](#1-principios)
2. [Color y temas](#2-color-y-temas)
3. [Tipografía](#3-tipografía)
4. [Espaciado y layout](#4-espaciado-y-layout)
5. [Componentes base (shadcn estandarizado)](#5-componentes-base-shadcn-estandarizado)
6. [Iconografía](#6-iconografía)
7. [Animación, escenas de scroll y microinteracciones (GSAP)](#7-animación-y-microinteracciones-gsap)
8. [Accesibilidad: checklist transversal](#8-accesibilidad-checklist-transversal)
9. [Checklist de PR de UI](#9-checklist-de-pr-de-ui)
10. [Deuda conocida y decisiones pendientes](#10-deuda-conocida-y-decisiones-pendientes)
11. [Vista de detalle de proyecto](#11-vista-de-detalle-de-proyecto)
12. [Layout del Home](#12-layout-del-home)

---

## 1. Principios

1. **Accesibilidad primero.** Si una decisión estética rompe WCAG AA, gana
   WCAG. No hay excepciones por "se ve mejor".
2. **Solo tokens.** Todo color, radio y fuente sale de las variables CSS de
   `app.css`. Nada de hex, `rgb()` ni `oklch()` sueltos en componentes
   (excepciones puntuales: sección 10).
3. **Un solo punto de énfasis por vista.** La identidad es editorial: serif
   grande, mucho aire, un único acento violeta. Si todo destaca, nada
   destaca. En el home, ese punto es el nombre en el hero.
4. **Ley de Hick.** El tiempo de decisión crece con el número de opciones.
   Máximo **un** CTA primario por bloque, a lo sumo dos secundarios; menús
   de 5–7 ítems; los detalles secundarios se revelan bajo demanda
   (`Tabs`, `Sheet`, "ver más"), no se muestran todos a la vez.
5. **Movimiento con propósito.** La animación guía la atención o confirma
   una acción. No decora. Siempre respeta `prefers-reduced-motion`.
6. **Cero componentes nuevos si ya existe uno.** Antes de escribir un
   `<button>`/`<input>`/card a mano, usa el de `src/components/ui/`.

---

## 2. Color y temas

### 2.1 Dirección visual: "Onyx & Violet"

Objetivo: una interfaz **simple pero sofisticada, premium y memorable**, al
nivel de los sitios destacados en Awwwards / CSS Design Awards / FWA, sin
caer en el minimalismo seco ni en el "diseño generado por IA".

- **Base neutra, acento único.** Todo el sistema es neutro (negro/gris
  azulado en oscuro, blanco roto en claro) y el **violeta vive solo en
  `--primary`** (y sus alias `--ring`, `--chart-1`, `--sidebar-primary`, más
  los tokens `--galaxy-*`). Así el acento realmente resalta. **Prohibido
  teñir fondos o textos de morado/berenjena.**
- **Tema oscuro:** onyx / charcoal azulado casi negro (matiz 270, croma
  ~0.012). Nunca `#000`. Las superficies suben en escalones (fondo → card →
  muted) para que ninguna se lea como un "negro pesado".
- **Tema claro:** blanco roto tipo *silk / alabaster* (matiz 95, croma
  0.005). El texto es **carbón** (`oklch(24% 0.008 270)`), no negro puro ni
  berenjena. Nunca `#fff`.
- **El aire es un elemento de diseño.** Un solo punto focal por sección,
  mucho espacio negativo, tipografía grande (sección 3).
- **La galaxia 3D es parte de la paleta**: lee sus colores de `--galaxy-*`
  y se recolorea al cambiar de tema.
- **Movimiento y hovers sobrios** (secciones 5.5 y 7): guían el ojo, nada
  rebota.
- Leyes de UX: **Hick** (pocas opciones, un CTA primario por bloque),
  **proximidad** (el espacio dentro de un grupo es la mitad o menos del
  espacio entre grupos) y **foco único**.

### 2.2 Mecánica

- Formato: **OKLCH**. Todos los valores opacos están **dentro del gamut
  sRGB**; lo comprueba el test.
- Tokens en `:root` (claro) y `.dark` (oscuro) de `src/styles/app.css`,
  expuestos a Tailwind v4 con `@theme inline` (`bg-background`,
  `text-muted-foreground`, `border-border`, `bg-night`…).
- Tema: clase `.dark` en `<html>`; persistido en `localStorage`, con
  `prefers-color-scheme` como valor inicial.
- `--accent` es un neutro suave (hover genérico de shadcn): el violeta se
  aplica de forma deliberada (enlaces, estado activo, CTA).

### 2.3 Paleta principal

| Token | Rol | Claro (silk) | Oscuro (onyx) |
|---|---|---|---|
| `--background` | Fondo de página | `oklch(97.6% 0.005 95)` ≈ `#f8f7f3` | `oklch(16% 0.012 270)` ≈ `#0b0d13` |
| `--foreground` | Texto principal (carbón) | `oklch(24% 0.008 270)` ≈ `#1e1f23` | `oklch(94% 0.004 270)` ≈ `#eaebee` |
| `--card` | Superficie elevada | `oklch(99% 0.005 95)` ≈ `#fdfcf8` | `oklch(20.5% 0.012 270)` ≈ `#15171d` |
| `--muted` | Relleno atenuado (skeletons, chips, hover) | `oklch(94.5% 0.005 95)` | `oklch(23.5% 0.012 270)` |
| `--muted-foreground` | Texto secundario | `oklch(46% 0.012 270)` | `oklch(70% 0.012 270)` |
| `--accent` | Hover neutro | `oklch(94.5% 0.005 95)` | `oklch(25% 0.012 270)` |
| `--primary` | **Violeta de marca (único acento)** | `oklch(50% 0.21 292)` ≈ `#6c3ccd` | `oklch(67% 0.185 292)` ≈ `#9a7afb` |
| `--primary-foreground` | Texto sobre `--primary` | `oklch(97% 0.015 295)` | `oklch(15% 0.05 290)` |
| `--secondary` | Botón sólido neutro | = `--foreground` | = `--foreground` |
| `--border` | Divisores decorativos | `oklch(24% 0.008 270 / 10%)` | `oklch(92% 0.01 270 / 11%)` |
| `--input` | Borde de campos | `oklch(24% 0.008 270 / 50%)` | `oklch(92% 0.01 270 / 40%)` |
| `--ring` | Anillo de foco | = `--primary` | = `--primary` |
| `--night` / `--night-foreground` | Superficie siempre oscura (wordmark del footer) | `oklch(14.5% 0.012 270)` / `oklch(94% 0.004 270)` | igual |
| `--glow` | Sombra de hover de **botones y chips** (halo violeta + sombra neutra, ver 5.5) | compuesta | compuesta |
| `--glow-soft` | Sombra de hover de **cards**: solo una sombra neutra suave, sin halo violeta (ver 5.5) | compuesta | compuesta |

Regla de superficies en oscuro: **fondo 16 % < card 20.5 % < muted 23.5 %**.
Nunca una superficie más oscura que el fondo (se lee como un hueco negro):
los bloques grandes (p. ej. el formulario de contacto) usan `bg-card`, no
`bg-muted`.

Los tokens del 3D (`--galaxy-core`, `--galaxy-arm`, `--galaxy-hot`,
`--galaxy-star`) cambian por tema porque el render difiere: en oscuro la
galaxia se mezcla de forma aditiva (colores luminosos); en claro, con
`multiply` sobre el blanco roto (colores más profundos y saturados, o
desaparecerían).

Radio base `--radius: 0.375rem`; escala en 4.3.

### 2.4 Estados semánticos

| Token | Uso | Claro | Oscuro |
|---|---|---|---|
| `--success` / `-foreground` | Confirmación, "publicado" | `oklch(50% 0.12 155)` | `oklch(72% 0.15 160)` |
| `--destructive` | Error, borrar, validación fallida | `oklch(54% 0.2 25)` | `oklch(70% 0.19 22)` |
| `--warning` / `-foreground` | Advertencia, acción con riesgo | `oklch(52% 0.11 70)` | `oklch(80% 0.15 80)` |
| `--info` / `-foreground` | Aviso neutro, ayuda | `oklch(50% 0.125 245)` | `oklch(72% 0.13 245)` |

El color **nunca** es el único portador del significado (WCAG 1.4.1): todo
estado lleva icono Lucide y/o texto. Errores de formulario:
`text-destructive` + icono + texto descriptivo (5.2). `--warning` aún no
tiene usos.

### 2.5 Contrastes medidos

Calculados con la luminancia relativa de WCAG 2.1 a partir de los tokens
(alfa mezclado en sRGB codificado) y protegidos por
`tests/unit/designTokens.test.ts`. Umbrales: texto ≥ 4.5:1 (AA) / 7:1
(AAA); componentes de UI y foco ≥ 3:1 (1.4.11).

| Par | Claro | Oscuro | Veredicto |
|---|---|---|---|
| `foreground` / `background` | 15.4 | 16.3 | AAA |
| `foreground` / `card` | 16.0 | 15.0 | AAA |
| `muted-foreground` / `background` | 6.7 | 7.3 | AA claro · AAA oscuro |
| `muted-foreground` / `card` | 6.9 | 6.7 | AA |
| `muted-foreground` / `muted` | 6.1 | 6.2 | AA |
| `primary` / `background` (texto/enlace) | 6.2 | 6.1 | AA |
| `primary-foreground` / `primary` (botón) | 6.1 | 6.2 | AA |
| `destructive` / `background` | 5.2 | 6.7 | AA |
| `success` / `background` | 5.3 | 8.4 | AA / AAA |
| `info` / `background` | 5.6 | 7.9 | AA / AAA |
| `warning` / `background` | 5.3 | 10.2 | AA / AAA |
| `night-foreground` / `night` | 16.6 | 16.6 | AAA |
| `input` (borde de campo) / `background` | 3.2 | 3.2 | Cumple 1.4.11 |
| `ring` / `background` | 6.2 | 6.1 | Cumple 1.4.11 |
| `border` / `background` | 1.2 | 1.3 | Solo decorativo |

El foco combina borde `--ring` lleno y halo `ring-3 ring-ring/50`: el halo
solo (≈ 2:1) no basta; no quitar ninguno de los dos.

### 2.6 Reglas de uso

- **No salir de la paleta.** Un color nuevo = un token nuevo (claro y
  oscuro), dentro del gamut sRGB y con su contraste medido aquí.
- Prohibido `#000`/`#fff`, `text-white`, `bg-black` y similares (usa
  `text-primary-foreground`, `bg-night/40`…). El test lo hace cumplir, y
  también que fondos y textos se mantengan neutros (croma ≤ 0.02).
- `text-primary` solo para enlaces, estado activo y énfasis puntual.
- Texto secundario = `text-muted-foreground`; no bajar la opacidad del
  texto para "atenuar".
- Superficies: `background` → `card` (elevada) → `muted` (relleno); máximo
  dos niveles visibles a la vez.
- Los dos temas se diseñan y se prueban siempre.

---

## 3. Tipografía

### 3.1 Familias

Autoalojadas con `@fontsource` (sin CDN externo).

| Rol | Familia | Variable / clase | Uso |
|---|---|---|---|
| Display | **Instrument Serif** (400, con itálica) | `--font-serif` · `.font-serif-display` | Titulares, nombre, cifras destacadas |
| Texto | **Geist Variable** | `--font-sans` | Párrafos, UI, botones, formularios |
| Etiquetas | **Geist Mono Variable** | `--font-mono` · `.eyebrow` | Metadatos, fechas, etiquetas, código |

Instrument Serif es condensada y de alto contraste: es la voz de marca. Va
**siempre grande** (nunca por debajo de ~22 px) y solo en peso 400 (no tiene
negrita real: jerarquía por tamaño y espacio, jamás `font-bold`, que
generaría negrita sintética). El itálico se reserva para un énfasis puntual.

### 3.2 Escala y jerarquía

Los tamaños son **tokens de Tailwind** (`@theme` en `app.css`): cada uno
fija tamaño fluido (rem + vw, escala con el zoom del navegador),
interlineado y tracking. No se usan `text-[clamp(...)]` ni `text-[Npx]`.

| Nivel | Clase | Tamaño | Interlineado | Tracking | Familia |
|---|---|---|---|---|---|
| **Hero (nombre)** | `text-hero` | `clamp(4.25rem, 13.5vw, 12.5rem)` (68–200 px) | 0.86 | −0.04em | Serif |
| Display (títulos de detalle) | `text-display` | `clamp(3.5rem, 9vw, 8rem)` (56–128 px) | 0.95 | −0.03em | Serif |
| H2 sección | `text-title` | `clamp(2.25rem, 5vw, 4rem)` (36–64 px) | 1.02 | −0.025em | Serif |
| H3 subsección | `text-subtitle` | `clamp(1.875rem, 3.6vw, 2.75rem)` (30–44 px) | 1.08 | −0.02em | Serif |
| H4 destacado | `text-heading` | `clamp(1.375rem, 2.4vw, 1.875rem)` (22–30 px) | 1.15 | −0.01em | Serif |
| H5 / H6 | `text-lg` / `text-base` + `font-semibold` | 18 / 16 px | 1.4 | 0 | Sans |
| Lead | `.khelde-lead` | `clamp(1.125rem, 1.7vw, 1.375rem)` (18–22 px) | 1.6 | 0 | Sans |
| **Cuerpo** | (por defecto en `body`) | **17 px** (1.0625rem) | **1.65** | 0 | Sans |
| Cuerpo pequeño | `text-sm` | 14 px | 1.5 | 0 | Sans |
| Etiqueta | `.eyebrow` | 13 px (0.8125rem), peso 500 | 1.5 | +0.06em | Mono |
| Caption | `text-xs` | 12 px | 1.4 | 0 | Sans |

Reglas:

- **Un solo `<h1>`**; los niveles no se saltan. El nivel visual se elige
  con la clase; el semántico con la etiqueta.
- **Tamaño mínimo funcional: 12 px.** La etiqueta (`.eyebrow`) es de 13 px y
  **en minúsculas/frase normal**: no se usan etiquetas diminutas en
  MAYÚSCULAS (es una de las marcas típicas de interfaz generada por IA).
- Largo de línea ≤ 65–75 caracteres (`max-width: 58ch` en el lead,
  `max-w-prose` en párrafos largos).
- Interlineado del cuerpo ≥ 1.5 (WCAG 1.4.12).
- Los titulares grandes deben llevar `text-wrap: balance` (_Pendiente_: aún
  ningún titular lo usa).
- Kerning/tracking: el serif de display se aprieta cuanto más grande es
  (−0.01em a −0.03em); las etiquetas llevan tracking positivo leve; el
  cuerpo no se toca.
- Ampliable al 200 % sin pérdida (1.4.4): tamaños en `rem`/`clamp`.
- Si falta un nivel, se agrega **aquí y en `app.css`**, no inline.

---

## 4. Espaciado y layout

### 4.1 Escala

Base de Tailwind v4: `--spacing: 0.25rem` (4 px). Se usan **solo** pasos
de la escala de Tailwind (`p-1` = 4 px … `p-16` = 64 px); nada de píxeles
sueltos (`mt-[13px]`).

| Paso | rem | px | Uso típico |
|---|---|---|---|
| 1 | 0.25 | 4 | Separación icono-texto mínima |
| 2 | 0.5 | 8 | Entre elementos de un grupo (chip, badge) |
| 3 | 0.75 | 12 | Padding interno de controles |
| 4 | 1 | 16 | Padding de card, gap de formulario |
| 6 | 1.5 | 24 | **Gutter horizontal de página** (`px-6`) |
| 8 | 2 | 32 | Separación entre bloques de una sección |
| 12 | 3 | 48 | Separación entre grupos grandes |
| 16 | 4 | 64 | Separación entre secciones |

Regla de proximidad (Gestalt): el espacio **dentro** de un grupo siempre
es menor que el espacio **entre** grupos (al menos 2×).

### 4.2 Layout

- Contenedor: `mx-auto max-w-[1240px] px-6`. Es el único ancho máximo del
  sitio.
- Hero: grid `lg:grid-cols-[minmax(0,1fr)_320px]`, `gap-10 lg:gap-12`.
- Header fijo de 72 px → el contenido empieza en `pt-[72px]` y cada
  sección ancla lleva `scroll-mt-[88px]` (72 + 16 de aire).
- **Mobile-first.** Se diseña a 375 px y se amplía. Breakpoints de
  Tailwind: `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280.
- **Grid** para layouts de dos dimensiones (secciones, galerías de cards);
  **Flexbox** para una dimensión (filas de botones, header, chips con
  `flex-wrap`).
- Sin scroll horizontal en ningún ancho ≥ 320 px (WCAG 1.4.10 Reflow).
- Áreas táctiles: ver 5.1 (tamaños mínimos).

### 4.3 Radios y elevación

- Radios (derivados de `--radius: 0.375rem`): `sm` 0.225 · `md` 0.3 ·
  `lg` 0.375 · `xl` 0.525 · `2xl` 0.675 rem. Se usan los de la escala
  (`rounded-lg`, `rounded-xl`), no valores arbitrarios.
- Elevación: el sistema es **plano** — se separa con superficie
  (`card` sobre `background`) y anillo fino (`ring-1 ring-foreground/10`),
  no con sombras pesadas. Si se necesita sombra, una sola, suave y
  reutilizable; nunca `rgba(0,0,0,.x)` sueltas.

---

## 5. Componentes base (shadcn estandarizado)

Stack: **shadcn/ui** (estilo `base-nova`, `components.json`) sobre
**Base UI** (`@base-ui/react`), con **Tailwind CSS v4** y
`class-variance-authority`. Los primitivos viven en
`src/components/ui/` (`button`, `input`, `textarea`, `label`, `select`,
`card`, `badge`, `tabs`, `sheet`, `dropdown-menu`, `skeleton`).

Reglas generales:

- Se agregan componentes con la CLI (`pnpm dlx shadcn@latest add <name>`),
  no copiando de memoria. Los archivos generados se tocan lo mínimo.
- Estilos de un caso especial → prop `className` en el sitio de uso, no
  editar el primitivo. Si el mismo override aparece 3 veces, se convierte
  en una `variant` nueva del primitivo.
- Los controles interactivos son **siempre** el primitivo (no `<a>`
  estilizado como botón ni `<div onClick>`). Un enlace que parece botón se
  hace con `<Button render={<a href=… />}>` (Base UI), manteniendo semántica
  de enlace.

### 5.1 Botones (`button.tsx`)

**Variantes** (prop `variant`):

| Variante | Cuándo | Aspecto |
|---|---|---|
| `default` (Primary) | La acción principal del bloque. **Una por bloque** | Relleno `--primary` |
| `secondary` | Acción alternativa de peso | Relleno `--secondary` (alto contraste) |
| `outline` | Acción secundaria junto a un primary | Borde + fondo de página |
| `ghost` | Acciones terciarias, barras de herramientas | Sin borde ni relleno hasta el hover |
| `destructive` | Borrar, descartar, acciones irreversibles | Tinte `--destructive` suave |
| `link` | Navegación inline dentro de texto | Texto `--primary` subrayado en hover |

**Estados** (ya resueltos por el primitivo — no reimplementar):

| Estado | Comportamiento |
|---|---|
| Hover | Variante más tenue/sólida según tipo (`hover:bg-primary/80`, etc.) |
| Focus visible | Borde `--ring` + anillo `ring-3 ring-ring/50` (solo teclado) |
| Active | Se hunde 1 px (`active:translate-y-px`) |
| Disabled | `opacity-50`, `pointer-events-none`; además `disabled` real |
| Invalid | Borde + anillo `--destructive` vía `aria-invalid` |

**Tamaños** (prop `size`):

| Tamaño | Alto | Texto | Nota |
|---|---|---|---|
| `xs` | 24 px | 12 px | Solo en UI densa (admin). Mínimo AA 2.5.8 (24 px) |
| `sm` | 28 px | 12.8 px | Admin / acciones secundarias |
| `default` | 32 px | 14 px | Controles de UI general |
| `lg` | 36 px | 14 px | **Mínimo para CTAs del sitio público** |
| `icon` / `icon-sm` / `icon-lg` | 32 / 28 / 36 px | — | Botón solo icono (requiere `aria-label`) |

Reglas de tamaño táctil: el objetivo mínimo es **24 × 24 CSS px**
(WCAG 2.2 AA 2.5.8); en el sitio público, cualquier control que se use con
el dedo apunta a **44 × 44 px** (AAA 2.5.5). Si el control es más chico
(por ejemplo `lg` = 36 px), se compensa con `padding`/`min-h-11` en el
sitio de uso o espacio vacío alrededor ≥ 8 px entre objetivos.

- Texto del botón: **verbo + objeto**, en frase ("Ver proyectos",
  "Enviar mensaje"), no "Aceptar"/"Submit". Mismo verbo en todo el flujo.
- Botón solo icono → `aria-label` obligatorio. Icono + texto → el icono
  lleva `aria-hidden="true"`.
- Estado de carga: `disabled` + icono `LoaderCircle` girando (con
  `motion-safe:animate-spin`) y el texto cambia ("Enviando…").

### 5.2 Inputs y formularios (`input.tsx`, `textarea.tsx`, `select.tsx`, `label.tsx`)

| Aspecto | Estándar |
|---|---|
| Alto | `Input`/`Select` 32 px (`h-8`) en admin; **44 px** (`h-11`, `text-base`) en formularios públicos |
| Texto | 16 px en móvil (`text-base`, evita el zoom automático de iOS), 14 px desde `md` |
| Borde | `border-input`, radio `rounded-lg`, fondo transparente (`dark:bg-input/30`) — contraste del borde en 2.5 |
| Foco | `focus-visible:border-ring` + `ring-3 ring-ring/50`. **No quitar `outline`/ring sin sustituto** (WCAG 2.4.7). Mantener el `border-ring` junto al halo: el halo solo mide 2.2–2.7:1, el borde lleno 5.8–7.5:1 |
| Disabled | `opacity-50` + `cursor-not-allowed` |
| Error | `aria-invalid="true"` (pinta borde y anillo `--destructive`) |

Formularios:

- **Cada campo lleva `<Label>` visible** asociado (`htmlFor`/`id`). El
  placeholder no sustituye a la etiqueta (WCAG 3.3.2).
- Un campo por fila en móvil. Agrupar con `<fieldset>`/`<legend>` cuando
  hay opciones relacionadas.
- `type`, `inputmode` y `autocomplete` correctos (`type="email"`,
  `autocomplete="email"`, `name`…) — WCAG 1.3.5.
- **Mensaje de error:** debajo del campo, `text-sm text-destructive`,
  con icono (`CircleAlert`), vinculado con `aria-describedby`, y dice qué
  pasó **y cómo arreglarlo** ("Correo inválido. Revisa que tenga @ y un
  dominio."). Sin "Error" a secas, sin disculpas.
- Validación: Zod en cliente **y** servidor, mismo esquema compartido
  (`src/schemas/`). La validación del cliente es ayuda, no seguridad.
- Al enviar con errores, el foco va al primer campo inválido y se anuncia
  el resumen con `role="alert"` o `aria-live="assertive"`.
- Éxito: confirmación visible + `aria-live="polite"`, con el mismo verbo
  del botón ("Enviar mensaje" → "Mensaje enviado").

### 5.3 Cards (`card.tsx`)

- Forma: `rounded-xl`, fondo `--card`, anillo fino `ring-1
  ring-foreground/10`, **sin sombra pesada**. Padding interno por
  `--card-spacing` (16 px; 12 px en `size="sm"`).
- Estructura fija: `CardHeader` (`CardTitle` + `CardDescription`) →
  `CardContent` → `CardFooter` opcional. El título usa la familia de
  display (`font-heading`).
- **Ley de Hick aplicada a cards:**
  - Un solo mensaje por card: título + una línea de descripción. El detalle
    va detrás de un clic.
  - **Una acción primaria por card** (como mucho una secundaria). Toda la
    card clicable → el enlace va en el título y se extiende con
    `after:absolute after:inset-0`, no se anidan varios enlaces.
  - Una grilla muestra **3–6 cards visibles**; más que eso se pagina, se
    filtra o se muestra "Ver todos".
  - Se destaca lo clave con jerarquía (tamaño del título, un `Badge`,
    el acento `--primary` en un solo elemento), no con más color.
- Hover: `hover-lift` en la card entera (ver 5.5), siempre discreto (2 px y
  sombra neutra). Las partes internas (imagen, iconos) no reaccionan por
  separado. Nada de escalados, rebotes ni halos de color en cards.
- Imágenes: `width`/`height` explícitos (evita CLS), `loading="lazy"`
  salvo la de LCP, `alt` descriptivo (o `alt=""` si es decorativa).

### 5.4 Otros primitivos

- `Badge`: estado o categoría corta (1–2 palabras). No botones disfrazados.
- `Tabs`: separar contenido paralelo del mismo nivel (p. ej. idiomas en el
  admin). Navegable con flechas (lo da Base UI).
- `Sheet` / `DropdownMenu`: paneles y menús; el foco queda atrapado y
  vuelve al disparador al cerrar (lo da Base UI — no reimplementar).
- `Skeleton`: estado de carga con la forma final del contenido (evita CLS).


### 5.5 Hovers y microinteracciones (estándar)

Un hover no es un cambio de color: es una respuesta táctil. Tres piezas,
siempre las mismas, definidas como utilidades en `app.css`:

| Utilidad | Para | Qué hace |
|---|---|---|
| `hover-lift` | Cards y superficies clicables | **Discreto**: sube 2 px (`translateY(-0.125rem)`), sombra neutra suave `--glow-soft` (sin halo violeta) y un tinte leve del borde (28 %). 260 ms, `cubic-bezier(0.22, 1, 0.36, 1)`. Una grilla de cards no debe "brillar" ni saltar: el hover confirma, no decora |
| `hover-press` | Botones, chips, iconos sociales | Sube 2 px y añade `--glow`. 260 ms. Se aplica a las variantes `default`, `secondary` y `outline` de `Button` |
| `hover-nudge` | Iconos de dirección (flechas) | Desplaza el icono 4 px en el sentido de la acción cuando su padre (enlace/botón) recibe hover o foco |

Reglas:

- **Solo en dispositivos con hover** (`@media (hover: hover)`) y el
  **desplazamiento solo si no hay `prefers-reduced-motion`**. Con reduced
  motion queda el cambio de sombra y borde, sin movimiento.
- El **foco con teclado** recibe el mismo glow (`:focus-visible`) además de
  su anillo; nada se revela solo con el ratón.
- **Un hover por elemento.** La card entera reacciona; **no se animan sus
  partes internas** (nada de zoom de imagen, iconos que aparecen o se
  elevan dentro de la card). Lo accionable dentro de una card es visible
  siempre, no aparece al pasar el cursor.
- Solo `transform`, `opacity`, `box-shadow` y `border-color`; nada de
  animar tamaño ni márgenes. Sin escalados > 1.03, sin rebotes.
- **Menos es más con las cards.** En grillas y carriles (proyectos,
  experiencia, opiniones) el hover es el mínimo que se percibe: 2 px,
  sombra neutra, borde apenas tintado. El glow violeta queda para botones y
  chips (`hover-press`), que son los que piden la acción.
- Elementos que no son clicables no tienen hover.
- Textos y enlaces simples: cambio de color a `--primary` es suficiente.
- Una card clicable usa **un solo enlace** que se extiende sobre toda la
  card (`after:absolute after:inset-0`), no varios enlaces anidados.

### 5.6 Estados de carga: skeletons, nunca spinners

Los spinners rompen la inmersión y mueven el layout. Todo estado de carga
usa **`<Skeleton />`** (shadcn) con la **forma del contenido final**:
mismo borde, radio, padding y alto de imagen, para que nada salte cuando
llegan los datos.

- Listas y carriles: skeletons de las cards reales (`SkeletonProjectsCard`,
  `SkeletonTestimonialCard`, `SkeletonEducation`, `SkeletonExperience`,
  `SkeletonAboutMe`).
- Imágenes: `Skeleton` absoluto detrás de la imagen, que entra con
  `opacity` al cargar; el contenedor tiene alto fijo.
- Botón enviando: la etiqueta se sustituye por un `Skeleton` (barra) y el
  texto real queda en un `<output class="sr-only">`.
- Accesibilidad: el contenedor es un `<output aria-busy="true">` con el
  texto de carga en `sr-only` (`COMMON.LOADING`), así se anuncia sin ruido
  visual.
- Prohibido `animate-spin`, `Loader2`/`LoaderCircle` y spinners CSS.

---

## 6. Iconografía

- **Librería única: [Lucide](https://lucide.dev/)** vía `lucide-react`
  (v1.x). Está prohibido añadir otra librería de iconos
  (`react-icons`, `@icons-pack/*`, Font Awesome, etc.).
- **Única excepción:** logos de marca (GitHub, LinkedIn). Lucide 1.0
  eliminó los iconos de marca, así que viven vendorizados en
  `src/components/icons/BrandIcons.tsx`. Cualquier otro logo de marca
  nuevo se añade ahí, nunca desde otra dependencia.
- En archivos `.astro`, se usa el icono con `client:*` solo si hace falta
  interactividad; los iconos estáticos se renderizan en servidor.
- **Tamaños estándar:**

| Contexto | Tamaño | Clase |
|---|---|---|
| Inline con texto pequeño / en `Button` `xs`–`sm` | 14–16 px | `size-3.5` / `size-4` |
| Botón estándar, listas, navegación | 16–20 px | `size-4` / `size-5` |
| Cabeceras de card, estados vacíos | 24 px | `size-6` |
| Ilustración / hero de estado | 32–48 px | `size-8` / `size-12` |

- **Grosor de trazo:** `strokeWidth` por defecto (2) hasta 24 px; para
  ≥ 32 px bajar a **1.5** para no verse pesado. No mezclar grosores en el
  mismo grupo de iconos.
- Color: `currentColor` (heredan del texto). Nada de `fill`/`stroke` con
  hex.
- Accesibilidad: decorativo → `aria-hidden="true"` (lo hace lucide por
  defecto). Icono que comunica algo y no tiene texto → `aria-label` en el
  control contenedor (o `<title>`), nunca solo en el SVG.
- El estado nunca depende solo del color o del icono (sección 2.3).

---

## 7. Animación y microinteracciones (GSAP)

> **Estado:** el motor de movimiento está **activo**. GSAP 3.15
> (ScrollTrigger + SplitText) vive en `src/lib/motion/` (`core`, `hero`,
> `reveals`, `scenes`, `split`, `media`, `index`; `src/lib/motion.ts` es el
> barril) y se arranca una vez desde `Layout.astro`. Las clases CSS
> heredadas `anim-fade-in` / `anim-zoom-in` se eliminaron. Las escenas
> concretas están en 7.7 y el contrato de atributos en 12.4.

### 7.1 Reparto de responsabilidades

| Necesidad | Herramienta |
|---|---|
| Hover, foco, `active`, transiciones de color/borde/opacidad | **CSS** (`transition`) — más barato, sin JS |
| Entradas al hacer scroll, stagger, parallax, timelines, pin | **GSAP + ScrollTrigger** |
| Fondo 3D / cosmos existentes | Se mantienen (Three.js / SVG); no se reescriben en GSAP |
| Animación de aparición que no depende del scroll (p. ej. spinner) | CSS (`@keyframes` + `motion-safe:`) |

Un solo sistema de scroll: no se mezclan `IntersectionObserver` caseros,
listeners de `scroll` y ScrollTrigger para el mismo efecto.

### 7.2 Presupuesto de movimiento (qué sí animar)

Para evitar la estética de "todo se mueve":

1. **Una secuencia de entrada orquestada** en el hero (carga de página).
2. **Revelado de bloques de contenido** al entrar al viewport (títulos de
   sección, grillas de cards con *stagger*) — una vez, no cada vez que
   se re-entra.
3. **Parallax sutil** solo en 1–2 elementos decorativos por vista.
4. Microinteracciones de respuesta a una acción (abrir, expandir,
   confirmar). Esas siempre son bienvenidas.

No se anima: texto de lectura larga, cada card individualmente con rebote,
elementos que ya están en el primer viewport tras la carga (salvo el hero),
ni nada que distraiga de un formulario.

### 7.3 Parámetros estándar

| Efecto | Propiedades | Duración | Easing | Notas |
|---|---|---|---|---|
| Fade-up (bloque) | `opacity 0→1`, `y: 24→0` | 0.6–0.8 s | `power3.out` | Distancia máxima 24–32 px |
| Stagger (grilla de cards) | igual que fade-up | 0.6 s | `power3.out` | `stagger: 0.08–0.12`, tope ~8 elementos animados por vez |
| Parallax | `y` entre `-8%` y `8%` | ligado al scroll (`scrub: true`) | `none` | Solo decorativo; amplitud pequeña |
| Hero (entrada) | timeline de 3–4 pasos | total ≤ 1.2 s | `power3.out` | El LCP **no** debe esperar a la animación |
| Hover / micro (CSS) | color, borde, opacidad, `translateY(-2px)` | 150–250 ms | `ease-out` | Sin escalados > 1.03 |
| Panel / sheet | `translateX`/`opacity` | 200–300 ms | `ease-out` | Responde a una acción |

Las animaciones se limitan a **`transform` y `opacity`** (compositor, 60 fps
sin *layout* ni *paint*). **Prohibido** animar `width`, `height`, `top`,
`left`, `margin`, `box-shadow` pesado o `filter: blur` en scroll.

### 7.4 `prefers-reduced-motion` (obligatorio)

Todo código GSAP se registra dentro de `gsap.matchMedia()`:

```ts
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const mm = gsap.matchMedia();

mm.add("(prefers-reduced-motion: no-preference)", () => {
  gsap.from("[data-reveal]", {
    opacity: 0,
    y: 24,
    duration: 0.7,
    ease: "power3.out",
    stagger: 0.1,
    scrollTrigger: { trigger: "[data-reveal]", start: "top 85%", once: true },
  });
  // matchMedia revierte las animaciones y triggers solo al cambiar la preferencia
});
// Con reduced-motion: no se registra nada → el contenido queda visible, sin movimiento.
```

Reglas:

- **El estado inicial oculto solo existe mientras haya JS y se permita el
  movimiento.** El CSS puede ocultar (`opacity: 0`) los elementos
  `[data-reveal]`, `[data-split]` y las piezas del hero **únicamente bajo
  `html.motion-ok`**: esa clase la pone un script inline en `<head>` solo
  si `prefers-reduced-motion` no es `reduce`, y un temporizador de 4 s la
  quita si el motor no llegó a arrancar (`window.__motionReady`). Sin JS o
  con `reduce` la clase no existe y todo se ve. Prohibido `opacity-0`
  estático en el HTML.
- Con `reduce`: sin parallax, sin *stagger*, sin desplazamientos; como
  mucho un fade corto (≤ 150 ms) o nada.
- Nada parpadea más de 3 veces por segundo (WCAG 2.3.1).
- Animaciones que duran > 5 s y no son esenciales deben poder pausarse
  (WCAG 2.2.2): aplica al fondo 3D y al cosmos.
- Los efectos **no** pueden ser la única vía a la información (todo
  contenido es legible sin JS).

### 7.5 Integración con Astro

- GSAP vive en islas/scripts de cliente, **nunca** en código de servidor.
  Import dinámico o `<script>` de Astro; no se carga en páginas que no lo
  usan (el admin no lo necesita).
- Marcar los elementos con atributos de datos (`data-reveal`,
  `data-reveal-group`, `data-parallax`) y centralizar la lógica en un único
  módulo (`src/js/` o `src/lib/motion.ts`), no repartir `gsap.*` por cada
  componente.
- **Layout shift tardío:** las islas `client:visible`, las imágenes lazy y
  el canvas 3D cambian la altura de la página después de cargar (es el
  mismo problema que resuelve `src/js/scrollFix.js`). Tras cada cambio
  relevante, llamar `ScrollTrigger.refresh()`; los `start`/`end` se
  calculan con la página ya estable.
- Limpieza: al desmontar una isla React, `ctx.revert()`
  (`gsap.context()` dentro de `useEffect`) para no filtrar triggers. Si
  algún día se activa `<ClientRouter />` (hoy no se usa), matar los
  triggers en `astro:before-swap` y recrearlos en `astro:page-load`.
- Fuentes: esperar `document.fonts.ready` antes de medir (el serif grande
  cambia la altura al cargar).

### 7.6 Rendimiento

- Objetivo: 60 fps. Medir con el panel *Performance* de DevTools; cero
  *long tasks* provocadas por animación.
- `will-change: transform` solo en el elemento que se está animando, y se
  quita al terminar (no dejarlo permanente en decenas de nodos).
- Con GSAP, usar `gsap.set`/`autoAlpha` en vez de leer `offset*` en bucle
  (evita *layout thrashing*).
- Cargar el plugin solo si se usa (`ScrollTrigger` ~ 12 KB gzip); GSAP
  core ~ 25 KB gzip. Presupuesto: no empeorar el Lighthouse actual.
- Licencia: GSAP y sus plugins estándar pasaron a ser gratuitos para uso
  comercial en 2025; verificar los términos vigentes en
  [gsap.com/standard-license](https://gsap.com/standard-license/) antes de
  instalarlo.


### 7.7 Escenas de scroll (inspiradas en gsap.com)

Referencia: el patrón de gsap.com es **una escena larga fijada
(`pin`) y escrubada (`scrub`)** en la que el lector controla el ritmo, más
revelados con máscara y movimiento ligado a la velocidad del scroll. El
sitio usa las mismas piezas, cada una en su módulo:

| Escena | Módulo | Qué hace | Se activa con |
|---|---|---|---|
| Entrada del hero | `hero.ts` | Etiqueta → nombre línea a línea saliendo de una máscara → lead → botones → el arco se abre de abajo arriba → el anillo se dibuja (`stroke-dashoffset`) | `[data-hero]` + `data-hero-*` |
| Salida del hero | `hero.ts` | Mientras el primer pantallazo sube (`scrub`): las dos líneas del nombre se separan, el lead y los botones suben y se atenúan, el retrato retrocede y la órbita gira | automática tras la entrada |
| **Manifiesto fijado** | `scenes.ts` | La sección se **fija 2 pantallas** (1.4 en móvil): las palabras de la frase se encienden una a una (`SplitText`, escrubado), dos pistas gigantes de tecnologías se deslizan en sentidos opuestos, una línea de progreso se llena y unas etiquetas aparecen con rebote | `[data-manifesto]` |
| Títulos | `split.ts` | Cada título se parte en líneas con máscara y sube al entrar (una vez) | `[data-split]` |
| Revelados | `reveals.ts` | Fade-up con *stagger* por lotes (las cards que entran juntas se encadenan en orden de lectura) | `[data-reveal]` |
| Imagen de card | `media.ts` | La foto, más alta que su marco, se desplaza ±6 % al cruzar la pantalla | `[data-parallax-img]` |
| Marquee de opiniones | `media.ts` | Un solo tween `xPercent` en bucle; **su velocidad y dirección siguen la del scroll** (un único callback del ticker suaviza `timeScale`) y vuelve a la calma; se detiene fuera de pantalla y con hover o foco; la pista es su propia capa (`will-change`) y el desvanecido de bordes son overlays estáticos, no una máscara | `[data-marquee]` + `[data-marquee-track]` |
| Parallax decorativo | `media.ts` | Anillos de órbita, ±6 % | `[data-parallax="N"]` |
| **Pila de cards** | `layers.ts` | Las cards de experiencia son `sticky` y se apilan (cada una un poco más abajo); la que queda debajo retrocede (`scale`) al llegar la siguiente | `[data-stack]` + `[data-stack-card]` |
| **Habilidades en vuelo** | `skills.ts` | Cada chip entra desde fuera de pantalla siguiendo una curva en S (`MotionPathPlugin`, `type: "thru"`), girando, y se aplasta un poco al aterrizar; todo escrubado con el scroll. Detrás, una línea "serpiente" se dibuja y un punto la recorre (`align`). En móvil: fade-up escalonado | `[data-fly-group]` + `[data-fly-chip]`, `[data-snake]` + `-trace` / `-dot` |
| **Galaxia de partículas** | `galaxy.ts` + `ParticleGalaxy.tsx` | Polvo estelar a la deriva al entrar; con el scroll se arremolina hacia el centro, colapsa y **estalla** en una galaxia espiral de 3 brazos (destello en el instante de la explosión); el epicentro está en el **espacio libre a la derecha** del texto "Qué hago" (más pequeña, para que los brazos no lleguen a las palabras) y el texto lleva detrás un velo suave del color de fondo; luego se desplaza a la esquina, más pequeña. Original: una sola llamada de dibujo, shaders propios, colores de los tokens `--galaxy-*`. Con `prefers-reduced-motion` se dibuja la galaxia final quieta | scroll (sin atributo) |
| Anclas con pins | `anchors.ts` | Los enlaces `#…` se resuelven con GSAP tras recalcular los pins y se corrigen mientras la página crece | `a[href*="#"]` |
| Diálogo de comentarios | `dialogs.ts` | Panel compacto que crece desde el lanzador (escala desde su esquina inferior derecha), campos en stagger; **no cubre ni oscurece la página**; el lanzador entra con un pop | `[data-dialog]`, `-item`, `[data-fab]` |
| Marcos con máscara | `masks.ts` | Un marco se abre como cortina (`clip-path`) mientras la foto asienta desde un zoom; también hacia el lado (`data-mask="left"`) | `[data-mask]` |
| Grupos con stagger | `masks.ts` | Los hijos entran uno a uno al aparecer el contenedor (iconos de stack, campos del formulario, enlaces); `data-stagger="pop"` además crece | `[data-stagger]` + `[data-stagger-item]` |
| Texto con scrub | `text.ts` | Las palabras de un párrafo se encienden mientras cruza la pantalla | `[data-scrub-text]` |
| Detalle de proyecto | `detail.ts` | Botón de retorno, etiqueta y título (letra a letra con máscara), foto que se abre desde abajo; al bajar, la foto retrocede y deriva dentro de su marco | `[data-detail]` + `data-detail-*` |
| Progreso de lectura | `page.ts` | Línea fina arriba que se llena con el scroll | `[data-scroll-progress]` |

Reglas de las escenas:

- **El Home no esconde contenido detrás de clics.** Nada de pestañas,
  acordeones ni paneles ocultos para las secciones narrativas: Acerca de mí,
  Educación, Experiencia y Habilidades son secciones/escenas que se recorren
  con el scroll (`StoryBlock`). **Única excepción: el resto del catálogo de
  proyectos.** Cada categoría (`ProjectCategory`, dentro de `ProjectsCatalog`)
  muestra sus primeras 6 tarjetas (los destacados primero) y, solo si hay más,
  un botón «Ver N más de …» abre **todas** las demás de una vez, sin páginas
  ni tope. Es un `<button>` con `aria-expanded`/`aria-controls`; al abrir, el
  foco pasa a la primera tarjeta nueva y al cerrar vuelve al botón, y una
  región `status` anuncia cuántas se ven. El catálogo vive en el flujo normal
  de la página: nada fijado, trasladado ni con parallax por tarjeta (decenas de
  triggers hacían lenta la sección en el móvil). Un índice de categorías con su
  conteo (`nav`, anclas `#proyectos-<categoría>`) permite saltar a cada una.
- **El lector nunca queda atrapado**: una escena fijada dura como máximo
  **2.5 pantallas** (lo verifica un test) y siempre tiene contenido que
  cambia mientras dura (si no cambia nada, no se fija).
- Todo el contenido de una escena existe como **texto real en el HTML**
  (la frase del manifiesto es un `<p>`; `SplitText` conserva el
  `aria-label`); las pistas decorativas son `aria-hidden`.
- Con `prefers-reduced-motion: reduce` **ninguna escena se ejecuta**: no hay
  pin, ni scrub, ni parallax; la frase se lee entera y las pistas quedan
  estáticas.
- Los elementos dentro de una isla de Astro **no se tocan hasta que la
  isla se hidrata** (`watch()` en `core.ts`), para no provocar errores de
  hidratación en React.
- No se usa `ScrollSmoother` (scroll suavizado): reescribiría el
  contenedor de scroll, rompería el `position: fixed` del fondo 3D y el
  ajuste de anclas (`scrollFix.js`) sin aportar nada a la lectura.
- Un efecto nuevo = un atributo de datos nuevo + su escena en `src/lib/motion/`
  + su fila en esta tabla. Nada de `gsap.*` suelto en componentes.

---

## 8. Accesibilidad: checklist transversal

Aplica a todo cambio de UI (WCAG 2.1 AA, con referencias 2.2 donde se
indica).

- **Texto que se enciende con el scroll** (`data-scrub-text`, manifiesto): el
  estado "aún sin leer" nunca baja del suelo de legibilidad `MOTION.dim`
  (≥ 3:1 en texto grande, ≥ 4.5:1 en cuerpo, por tema; lo mide
  `tests/unit/dimmedText.test.ts`). Una opacidad fija no sirve: en claro
  necesita un suelo mucho más alto que en oscuro.
- **Estructura:** un `<h1>`, niveles sin saltos, *landmarks* (`<header>`,
  `<nav>`, `<main>`, `<footer>`); enlace "saltar al contenido" (`#main-content`
  ya existe como destino).
- **Teclado:** todo se opera con teclado, orden de foco = orden visual,
  foco siempre visible (2.4.7), sin trampas de foco fuera de modales.
- **Contraste:** texto ≥ 4.5:1, texto grande y componentes ≥ 3:1 en
  **ambos temas** (tabla 2.4).
- **Texto alternativo:** imágenes informativas con `alt` útil; decorativas
  `alt=""`.
- **Idioma:** `<html lang>` correcto por locale (es/en/fr); fragmentos en
  otro idioma con `lang`.
- **Zoom y reflow:** 200 % de zoom y 320 px de ancho sin pérdida ni scroll
  horizontal (1.4.4, 1.4.10).
- **Movimiento:** `prefers-reduced-motion` respetado (sección 7.4).
- **Formularios:** etiquetas, errores asociados, `autocomplete` (sección 5.2).
- **Objetivos táctiles:** ≥ 24 px (AA 2.2), 44 px como meta (sección 5.1).
- **Sin dependencia sensorial:** nada se indica solo por color, forma o
  sonido.

Verificación automática: `tests/e2e/a11y.spec.ts` corre axe-core (WCAG 2.1
A/AA) sobre el Home en ambos temas y en 375 px / escritorio, el detalle de
proyecto y el diálogo, y comprueba un solo `<h1>`, niveles sin saltos, el
enlace "saltar al contenido", foco visible y reflow a 640 px. `reduced-motion.spec.ts`
comprueba que sin movimiento todo el contenido queda visible. Axe cubre
una parte de WCAG: el resto (orden de lectura, textos de lector de pantalla,
zoom real) se revisa a mano.

Herramientas de verificación: el reporte *Accessibility* de Lighthouse,
la extensión axe DevTools, navegación solo con teclado (`Tab`/`Shift+Tab`),
emulación de `prefers-reduced-motion` y de `prefers-color-scheme` en
DevTools, y zoom al 200 %.

---

## 9. Checklist de PR de UI

Antes de abrir un PR que toque UI:

- [ ] ¿Todos los colores salen de tokens de `app.css`? (cero hex/rgb/oklch
      sueltos nuevos)
- [ ] ¿Se usó el primitivo de `src/components/ui/` en vez de HTML
      estilizado a mano?
- [ ] ¿Solo iconos de `lucide-react` (o `BrandIcons.tsx` para logos)?
- [ ] ¿Un solo CTA primario por bloque? ¿Se limitó el número de opciones
      (Ley de Hick)?
- [ ] ¿Probado en claro **y** oscuro, a 375 px y a ≥ 1280 px?
- [ ] ¿Foco visible y navegable con teclado?
- [ ] ¿Contrastes dentro de la tabla 2.4 (o medido el par nuevo)?
- [ ] ¿Animaciones solo con `transform`/`opacity`, dentro de
      `gsap.matchMedia()` y con el contenido visible sin JS?
- [ ] ¿Copy en español e idioma-equivalentes en `src/i18n/locales/*.json`
      (es, en, fr)? Cero texto fijo en componentes.
- [ ] `pnpm run check` y tests en verde.

---

## 10. Deuda conocida y decisiones pendientes

| # | Hallazgo | Dónde | Estado |
|---|---|---|---|
| 1 | Borde de campos `--input` bajo 3:1 (WCAG 1.4.11) | `app.css` | ✅ Resuelto (2.5) |
| 2 | No existía token `--warning` | `app.css` | ✅ Resuelto (2.4) |
| 3 | GSAP/ScrollTrigger sin instalar | `package.json`, `src/lib/motion.ts` | ✅ Instalado y arquitectura lista (7); falta migrar/crear animaciones |
| 4 | Colores fuera de tokens (galaxia 3D, wordmark, `theme-color`, `text-white`/`bg-black`) | varios | ✅ Resuelto: tokens `--galaxy-*`, `--night`, metas por esquema de color; test que lo hace cumplir |
| 5 | Etiquetas a 11 px y en mayúsculas | `app.css`, footer, formulario | ✅ Resuelto: `.eyebrow` 13 px en frase normal |
| 6 | CTAs del hero hechos a mano | `Header.astro` | ✅ Resuelto: `buttonVariants` sobre `<a>` |
| 7 | Tamaños arbitrarios `text-[Npx]` / `text-[clamp(...)]` | secciones del home | ✅ Resuelto: tokens `text-display/title/subtitle/heading` |
| 8 | Objetivos táctiles < 44 px | sitio público | ✅ Resuelto (nav, tabs, tema, idioma, formulario, hero, iconos sociales) |
| 9 | Animaciones mezcladas: CSS heredado, JS manual y 3D | varios | ✅ Resuelto en lo esencial: motor GSAP único (7.7) y clases `anim-*` eliminadas. Quedan como están el fondo 3D, el cosmos y el reveal del wordmark del footer (JS propio) |
| 10 | Cobertura de `prefers-reduced-motion` desigual | varios | ⏳ Parcial: el motor lo respeta (7.4) y el CSS hereda la guarda; falta un e2e con `reducedMotion: 'reduce'` (se deja para el final) |
| 11 | Títulos de `aboutMe` eran `<span>` | `src/features/aboutMe/` | ✅ Resuelto (`<h2>`) |
| 12 | Jerarquía de encabezados plana | `ItemDataExperiencia.tsx`, `ItemDataProjects.tsx` | ✅ Resuelto (`<h3>`) |
| 13 | Composición de la galaxia 3D y solapamiento con el texto del hero | `ParticleGalaxy.tsx`, `app.css` | ✅ Resuelto: capa de fondo (`z-index: -1`); la galaxia se forma con el scroll y reposa en la esquina (12.2) |
| 14 | `text-wrap: balance` sin aplicar en titulares del Home | secciones | ✅ Resuelto en hero y Opiniones; el resto usa `text-title` sin balance a propósito (títulos cortos) |
| 15 | Base teñida de berenjena y superficie `muted` casi negra | `app.css`, `Form.tsx` | ✅ Resuelto: base neutra onyx/silk, violeta solo en `--primary`; superficies escalonadas (2.3) |
| 16 | Hovers básicos y hovers internos en cards | cards, botones, iconos | ✅ Resuelto: `hover-lift` / `hover-press` / `hover-nudge` (5.5) |
| 17 | Spinners `Loader2` / `animate-spin` | tabs, items de Acerca, formulario de opiniones | ✅ Resuelto: skeletons con la forma final (5.6) |
| 18 | Proyectos sin vista de detalle ni URL propia | `pages/[lang]/project/[id].astro` | ✅ Resuelto (11). Falta video/galería: el backend no los expone |
| 19 | e2e de Playwright no se pueden ejecutar sin navegador instalado | entorno local | ⏳ Pendiente: `pnpm exec playwright install` |

## 11. Vista de detalle de proyecto

Ruta: **`/[lang]/project/[id]`** (`src/pages/[lang]/project/[id].astro`),
renderizada en el servidor.

- `id` es el **slug** del proyecto (canónico y compartible, p. ej.
  `/es/project/backend-hono`) o su `project_id` numérico. Los datos salen
  de `GET /projects?currentLocale=…` (el mismo origen que el Home).
- Cada card del Home enlaza a su detalle (enlace extendido sobre la card,
  ver 5.5); la URL cambia y se puede compartir.
- **SEO**: cada proyecto tiene su propio `<title>` (`Proyecto — Erick
  González`), `description` y `og:image` (la imagen del proyecto);
  `Layout.astro` acepta las props `title`, `description` e `image`.
- **Estados**: proyecto inexistente o idioma inválido → **404 real**;
  fallo del backend → **503** con mensaje y botón de volver.

Composición (un solo punto focal: la imagen):

1. Barra superior fija con **"Volver al inicio"** a la izquierda (vuelve a
   `/[lang]/home#projects`; la flecha se desplaza hacia atrás en hover) y,
   a la derecha, selector de idioma y tema.
2. Categoría (+ insignia de colaboración) y **título en serif grande**
   (`text-display`, o `text-title` si el nombre pasa de 18 caracteres).
3. **Imagen del proyecto** a todo el ancho (2:1), con glow violeta suave.
4. Dos columnas en escritorio, una en móvil: descripción (lead) y, en una
   card lateral fija, **stack tecnológico** (iconos con nombre) y
   **enlaces** (ver proyecto en vivo, ver código). Un enlace ausente se
   muestra como "No disponible" (`aria-disabled`), nunca desaparece.
5. **Siguiente proyecto** de la misma categoría: una sola acción de
   salida (Ley de Hick).

Limitaciones actuales: el modelo de datos de Hono solo trae una imagen por
proyecto (`card_image`); no hay video, galería ni descripción larga. El
bloque de media está listo para admitirlos cuando el backend los exponga.

## 12. Layout del Home

### 12.1 Ritmo y rejilla

- **Espaciado vertical entre secciones: `py-24 md:py-32`** (96 / 128 px).
  El hero ocupa **un viewport completo** (`min-h-[calc(100svh-72px)]`). El
  aire entre secciones es deliberado: no se compensa con relleno.
- Contenedor único `mx-auto max-w-[1240px] px-6`. Rejilla de **12
  columnas** con `gap-16` en escritorio (`lg:`) y una columna en móvil.
- **Asimétrica 4 / 8** en cada escena de Acerca (`StoryBlock`): a la
  izquierda (4 col) el título, `sticky` (`lg:top-28`); a la derecha (8 col)
  el contenido, que es el punto focal. Habilidades usa el bloque apilado
  (título arriba, contenido a todo el ancho) porque necesita escenario. Los
  proyectos son un catálogo a todo el ancho: una sección por categoría con
  una cuadrícula de 1, 2 o 3 columnas.
- **5 / 7** en Contacto (texto y enlaces / formulario) y **8 / 4** en el
  encabezado de Opiniones (título / llamada a la acción). Nada centrado
  "por defecto".
- Las cards de proyecto viven en una cuadrícula de 1, 2 o 3 columnas; las
  de experiencia se apilan (`sticky`) en una sola columna.

### 12.2 Hero y galaxia

**Concepto: un póster tipográfico.** El nombre es el único punto focal de la
página y se compone a escala de cartel; todo lo demás es silencio.

- **Nombre** (`text-hero`, hasta 200 px, interlineado 0.86): "Erick" en
  serif romana y "González" en cursiva violeta, **desplazado a la derecha**
  (`lg:pl-[0.4em]`) para que las dos líneas formen un bloque escalonado, no
  una pila centrada. Debajo, un lead de ≤ 46 caracteres por línea y **tres
  acciones con jerarquía clara** (Hick): primaria (`default`), secundaria
  (`outline`) y terciaria (`ghost`, "Ver CV").
- **Retrato en arco** (`rounded-t-[999px]`, 3:4) con glow `--glow`,
  dentro de **dos anillos de órbita** (SVG, trazo `--primary` al 40 %, uno
  punteado y un punto-planeta) que lo conectan con la galaxia. Es la única
  decoración y es silenciosa.
- **Barra inferior**: redes a la izquierda (44 px) y una señal de
  desplazamiento a la derecha (una línea con un segmento violeta que
  baja; solo se anima sin `prefers-reduced-motion`).
- **La galaxia es profundidad, no competencia.** Su canvas (`#galaxy-3d`)
  es una **capa de fondo (`z-index: -1`)**, por debajo del contenido y del
  cosmos. Emerge de la **esquina inferior derecha, detrás del retrato**
  (reposo: desplazada `41vw / 20vh`, escala 1.25): se ve el núcleo y los
  brazos asomando por el borde del arco, nunca bajo el texto.
- **Fusión orgánica**: `mask-image` radial (opaco al centro, transparente
  hacia el borde) disuelve el canvas en el color base; nunca se ve un
  rectángulo. Bajo el texto **no** hay scrim ni recuadro de fondo: las
  partículas se ven por detrás del nombre, y el contraste lo da el propio
  color del texto (tokens `foreground` y `muted-foreground`).
- En móvil la galaxia es más pequeña (0.72), más abajo y atenuada al 55 %;
  el retrato queda debajo del texto. Al hacer scroll la galaxia viaja a la
  esquina, y al llegar al wordmark del footer sube como un atardecer.
- Colores de la galaxia: tokens `--galaxy-*` (2.3); se recolorea al cambiar
  de tema.

### 12.3 Habilidades: todo a la vista, sin clics

Las habilidades ya no se esconden tras un "Ver todas" (el Home no oculta
contenido detrás de clics, ver 7.7). La Ley de Hick se respeta agrupando por
categoría (título + cantidad) y dejando que el scroll las revele: los chips
derivan hacia su lugar y luego flotan (`skills.ts`).

### 12.4 Contrato de movimiento (activo)

El HTML se comunica con el motor **solo con atributos de datos**; la lógica
vive en `src/lib/motion/` (7.7).

| Atributo | Dónde | Significado |
|---|---|---|
| `data-hero` + `data-hero-label` / `-line` / `-lead` / `-cta` / `-portrait` / `-rings` / `-ring-solid` / `-ring-accent` / `-bar` | Hero | Secuencia de entrada y salida escrubada |
| `data-manifesto` + `-text` / `-track` / `-chip` / `-progress` | `Manifiesto.astro` | Escena fijada y escrubada |
| `data-split` | Títulos de sección (en islas) | Líneas con máscara que suben |
| `data-reveal` | Cada bloque o card que debe entrar | Fade-up con stagger por lotes |
| `data-parallax="N"` | Elemento decorativo (anillos) | Parallax de ±N % |
| `data-parallax-img` | Imagen de una card (marco `overflow-hidden`) | Deriva ±6 % |
| `data-marquee` / `data-marquee-track` | Cinta de opiniones | Velocidad ligada al scroll y leve inclinación |
| `data-mask` (`="left"`, `data-mask-delay`) | Marco de foto, formulario, cinta | Se abre como cortina al entrar |
| `data-stagger` (`="pop"`, `data-stagger-delay`) + `data-stagger-item` | Contenedor y sus hijos | Entrada uno a uno |
| `data-scrub-text` | Párrafo de lectura | Palabras que se encienden con el scroll |
| `data-stack` + `data-stack-card` | Lista de experiencia | Pila sticky con profundidad |
| `data-fly-group` + `data-fly-chip`, `data-snake` + `-trace` / `-dot` | Habilidades | Vuelo por curvas + serpiente |
| `data-detail` + `-back` / `-meta` / `-title` / `-figure` / `-img` | Ruta de detalle | Entrada y profundidad |
| `data-scroll-progress` | `Layout.astro` | Barra de progreso |
| `data-galaxy` | `ParticleGalaxy.tsx` | Contenedor del canvas de la galaxia |
| `data-dialog` + `-item`, `data-fab` | `CommentWidget`, `sendOpinions` | Diálogo de comentarios y su lanzador |
| `data-revealed` | Lo pone el motor | "Ya terminó": el CSS deja de ocultarlo |

El estado inicial oculto del CSS solo existe bajo `html.motion-ok` (7.4).
