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
7. [Animación y microinteracciones (GSAP)](#7-animación-y-microinteracciones-gsap)
8. [Accesibilidad: checklist transversal](#8-accesibilidad-checklist-transversal)
9. [Checklist de PR de UI](#9-checklist-de-pr-de-ui)
10. [Deuda conocida y decisiones pendientes](#10-deuda-conocida-y-decisiones-pendientes)

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

### 2.1 Dirección visual: "Violet Nocturne"

Objetivo: una interfaz **simple pero sofisticada, premium y memorable**, al
nivel de los sitios destacados en Awwwards / CSS Design Awards / FWA, sin
caer en el minimalismo seco ni en el "diseño generado por IA".

- **Un violeta vibrante** como único color de marca. Nada de multicolor.
- **Prohibido el blanco y el negro puros** (`#000`, `#fff`, `text-white`,
  `bg-black`). Tema oscuro: un morado berenjena casi negro, rico y con
  matiz. Tema claro: perla/alabastro cálido, con tinta berenjena en lugar
  de negro. Lo verifica `tests/unit/designTokens.test.ts`.
- **El aire es un elemento de diseño.** Un solo punto focal por sección,
  mucho espacio negativo, tipografía grande (sección 3). Si una pantalla se
  ve "llena de datos", se quita contenido, no se baja el tamaño.
- **La galaxia 3D es parte de la paleta**, no un fondo pegado: lee sus
  colores de los tokens `--galaxy-*` y se recolorea al cambiar de tema.
- **Movimiento sobrio** que guía el ojo (sección 7); nada rebota.
- Leyes de UX aplicadas: **Hick** (pocas opciones, un CTA primario por
  bloque), **proximidad** (el espacio dentro de un grupo es la mitad o menos
  del espacio entre grupos) y **foco único** (cada sección dirige la mirada
  a un solo elemento).

### 2.2 Mecánica

- Formato: **OKLCH** (perceptualmente uniforme; los pares claro/oscuro se
  ajustan por luminosidad `L` sin tocar tono ni croma). Todos los valores
  opacos están **dentro del gamut sRGB** (así se ven igual en cualquier
  pantalla); lo comprueba el test.
- Tokens en `:root` (claro) y `.dark` (oscuro) de `src/styles/app.css`,
  expuestos a Tailwind v4 con `@theme inline` (`bg-background`,
  `text-muted-foreground`, `border-border`, `bg-night`…).
- Tema: clase `.dark` en `<html>`; persistido en `localStorage`, con
  `prefers-color-scheme` como valor inicial.
- `--accent` es un neutro suave a propósito (hover genérico de shadcn): el
  violeta se aplica de forma deliberada (enlaces, estado activo, CTA).

### 2.3 Paleta principal

| Token | Rol | Claro (perla) | Oscuro (berenjena) |
|---|---|---|---|
| `--background` | Fondo de página | `oklch(96.8% 0.01 90)` ≈ `#f7f4ed` | `oklch(16.5% 0.03 292)` ≈ `#0f0c1a` |
| `--foreground` | Texto principal (tinta, no negro) | `oklch(21% 0.045 292)` ≈ `#19142b` | `oklch(94.5% 0.014 300)` ≈ `#eeebf5` |
| `--card` | Superficie elevada | `oklch(98.6% 0.007 90)` ≈ `#fcfaf5` | `oklch(21% 0.036 291)` ≈ `#181528` |
| `--primary` | **Violeta de marca** | `oklch(50% 0.21 292)` ≈ `#6c3ccd` | `oklch(67% 0.185 292)` ≈ `#9a7afb` |
| `--primary-foreground` | Texto sobre `--primary` | `oklch(97% 0.015 295)` | `oklch(15% 0.05 290)` |
| `--secondary` | Botón sólido neutro | `oklch(21% 0.045 292)` | `oklch(94.5% 0.014 300)` |
| `--muted` | Fondo hundido | `oklch(93.4% 0.013 90)` | `oklch(14.5% 0.03 292)` |
| `--muted-foreground` | Texto secundario | `oklch(43% 0.03 292)` | `oklch(72% 0.03 293)` |
| `--accent` | Hover neutro | `oklch(93.4% 0.013 90)` | `oklch(25% 0.04 291)` |
| `--border` | Divisores decorativos | `oklch(21% 0.045 292 / 9%)` | `oklch(85% 0.04 295 / 12%)` |
| `--input` | Borde de campos | `oklch(21% 0.045 292 / 50%)` | `oklch(85% 0.04 295 / 46%)` |
| `--ring` | Anillo de foco | = `--primary` | = `--primary` |
| `--night` / `--night-foreground` | Superficie siempre oscura (wordmark del footer) | `oklch(14.5% 0.03 292)` / `oklch(94.5% 0.014 300)` | igual |

Los tokens del 3D (`--galaxy-core`, `--galaxy-arm`, `--galaxy-hot`,
`--galaxy-star`) son distintos por tema porque el render difiere: en oscuro
la galaxia se mezcla de forma aditiva (colores luminosos); en claro se
mezcla con `multiply` sobre la perla (colores más profundos y saturados, o
desaparecerían).

Radio base `--radius: 0.375rem`; escala en 4.3.

### 2.4 Estados semánticos

| Token | Uso | Claro | Oscuro |
|---|---|---|---|
| `--success` / `-foreground` | Confirmación, "publicado" | `oklch(50% 0.12 155)` | `oklch(72% 0.15 160)` |
| `--destructive` | Error, borrar, validación fallida | `oklch(54% 0.2 25)` | `oklch(70% 0.19 22)` |
| `--warning` / `-foreground` | Advertencia, acción con riesgo | `oklch(52% 0.11 70)` | `oklch(80% 0.15 80)` |
| `--info` / `-foreground` | Aviso neutro, ayuda | `oklch(50% 0.125 245)` | `oklch(72% 0.13 245)` |

Reglas: el color **nunca** es el único portador del significado (WCAG
1.4.1): todo estado lleva icono Lucide y/o texto. Errores de formulario:
`text-destructive` + icono + texto descriptivo (5.2). `--warning` todavía
no tiene usos.

### 2.5 Contrastes medidos

Calculados con la luminancia relativa de WCAG 2.1 a partir de los tokens
(alfa mezclado en sRGB codificado, como hace el navegador) y protegidos por
`tests/unit/designTokens.test.ts`. Umbrales: texto ≥ 4.5:1 (AA) / 7:1 (AAA);
componentes de UI y foco ≥ 3:1 (1.4.11).

| Par | Claro | Oscuro | Veredicto |
|---|---|---|---|
| `foreground` / `background` | 16.3 | 16.4 | AAA |
| `foreground` / `card` | 17.2 | 15.1 | AAA |
| `muted-foreground` / `background` | 7.5 | 7.7 | AAA |
| `muted-foreground` / `card` | 7.9 | 7.1 | AAA |
| `muted-foreground` / `muted` | 6.7 | 7.9 | AA (claro) · AAA (oscuro) |
| `primary` / `background` (texto/enlace) | 6.1 | 6.1 | AA |
| `primary-foreground` / `primary` (botón) | 6.1 | 6.2 | AA |
| `destructive` / `background` | 5.1 | 6.6 | AA |
| `success` / `background` | 5.2 | 8.3 | AA / AAA |
| `info` / `background` | 5.4 | 7.9 | AA / AAA |
| `warning` / `background` | 5.2 | 10.2 | AA / AAA |
| `warning-foreground` / `warning` | 5.2 | 10.4 | AA / AAA |
| `night-foreground` / `night` | 16.9 | 16.9 | AAA |
| `input` (borde de campo) / `background` | 3.3 | 3.3 | Cumple 1.4.11 |
| `ring` / `background` | 6.1 | 6.1 | Cumple 1.4.11 |
| `border` / `background` | 1.2 | 1.3 | Solo decorativo (no define el límite de un control) |

El foco combina borde `--ring` lleno y halo `ring-3 ring-ring/50`: el halo
solo (≈ 2:1) no basta, el borde lleno sí; no quitar ninguno de los dos.

### 2.6 Reglas de uso

- **No salir de la paleta.** Un color nuevo = un token nuevo (claro y
  oscuro), dentro del gamut sRGB y con su contraste medido aquí.
- Prohibido `#000`/`#fff`, `text-white`, `bg-black` y similares (usa
  `text-primary-foreground`, `bg-night/40`, etc.). El test lo hace cumplir.
- `text-primary` solo para enlaces, estado activo y énfasis puntual.
- Texto secundario = `text-muted-foreground`; no bajar la opacidad del
  texto para "atenuar".
- Superficies: `background` → `card` (elevada) → `muted` (hundida); máximo
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
| Display (hero) | `text-display` | `clamp(3.5rem, 9vw, 8rem)` (56–128 px) | 0.95 | −0.03em | Serif |
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
- Hover: elevación mínima (`.lift-card`, `translateY(-2px)`) y/o borde
  `--primary` al 50 %. Nada de escalados ni rebotes.
- Imágenes: `width`/`height` explícitos (evita CLS), `loading="lazy"`
  salvo la de LCP, `alt` descriptivo (o `alt=""` si es decorativa).

### 5.4 Otros primitivos

- `Badge`: estado o categoría corta (1–2 palabras). No botones disfrazados.
- `Tabs`: separar contenido paralelo del mismo nivel (p. ej. idiomas en el
  admin). Navegable con flechas (lo da Base UI).
- `Sheet` / `DropdownMenu`: paneles y menús; el foco queda atrapado y
  vuelve al disparador al cerrar (lo da Base UI — no reimplementar).
- `Skeleton`: estado de carga con la forma final del contenido (evita CLS).

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

> **Estado:** GSAP 3.15 está instalado y toda la lógica de scroll se
> centraliza en `src/lib/motion.ts` (`withMotion`, `revealOnScroll`,
> `parallaxOnScroll`, `refreshScrollTriggers`). **Ninguna animación
> existente se ha migrado todavía**: hoy siguen siendo CSS
> (`.anim-fade-in`, `.lift-card`, `.skill-pill`, keyframes del cosmos) y
> JS puntual (`Cosmos.tsx`, `GalaxyBackground.tsx`, el reveal del Footer).
> Estas reglas rigen para lo que se construya a partir de ahora; la
> migración de lo existente y las animaciones nuevas van en la fase
> siguiente.

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
    scrollTrigger: { trigger: "[data-reveal-group]", start: "top 85%", once: true },
  });
  // matchMedia revierte las animaciones y triggers solo al cambiar la preferencia
});
// Con reduced-motion: no se registra nada → el contenido queda visible, sin movimiento.
```

Reglas:

- **El estado inicial oculto (`opacity: 0`) lo pone GSAP, nunca el CSS.**
  Si el JS falla o `reduce` está activo, el contenido debe quedar visible.
  Prohibido `opacity-0` estático en el HTML para "preparar" la animación.
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

---

## 8. Accesibilidad: checklist transversal

Aplica a todo cambio de UI (WCAG 2.1 AA, con referencias 2.2 donde se
indica).

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
| 4 | Colores fuera de tokens: galaxia 3D, wordmark del footer, `theme-color`, `text-white`/`bg-black` | `GalaxyBackground.tsx`, `app.css`, `Layout.astro`, `sendOpinions.tsx`, `sheet.tsx` | ✅ Resuelto: tokens `--galaxy-*`, `--night`, metas por esquema de color y utilidades de token; test que lo hace cumplir |
| 5 | Etiquetas a 11 px y en mayúsculas | `app.css`, footer, formulario, Panel admin | ✅ Resuelto: `.eyebrow` 13 px en frase normal (el Panel admin conserva `text-xs uppercase`) |
| 6 | CTAs del hero eran `<a>` hechos a mano | `Header.astro` | ✅ Resuelto: `buttonVariants` sobre `<a>`, pill + `min-h-11` |
| 7 | Tamaños arbitrarios `text-[Npx]` / `text-[clamp(...)]` | secciones del home | ✅ Resuelto: tokens `text-display/title/subtitle/heading` (3.2). Quedan `text-[22px]` (logo del Nav) y `text-[0.8rem]` (shadcn `button` sm) |
| 8 | Objetivos táctiles < 44 px | sitio público | ✅ Resuelto en nav, tabs, tema, idioma, formulario y hero. Admin conserva 32 px a propósito |
| 9 | Animaciones existentes mezcladas: CSS, JS manual (`Cosmos.tsx`, Footer) y 3D | varios | ⏳ Pendiente: migrar entradas/parallax a GSAP (7.1) en `feat/home-motion` |
| 10 | Cobertura de `prefers-reduced-motion` desigual | varios | ⏳ Pendiente: test e2e emulando `reducedMotion: reduce` |
| 11 | Títulos de `aboutMe` eran `<span>` | `src/features/aboutMe/` | ✅ Resuelto (`<h2>`) |
| 12 | Jerarquía de encabezados plana (puestos y cards de proyectos como `<h2>`) | `ItemDataExperiencia.tsx`, `ItemDataProjects.tsx` | ✅ Resuelto (`<h3>`) |
| 13 | Composición de la galaxia 3D (posición, escala, brazos) y solapamiento con el texto del hero | `GalaxyBackground.tsx` | ⏳ Pendiente: `feat/home-layout`. Ya recolorea por tema desde tokens |
| 14 | `text-wrap: balance` sin aplicar en titulares | secciones | ⏳ Pendiente (`feat/home-layout`) |
