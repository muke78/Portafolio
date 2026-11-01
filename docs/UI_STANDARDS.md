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

### 2.1 Mecánica

- Formato: **OKLCH** (perceptualmente uniforme; los pares claro/oscuro se
  ajustan por luminosidad `L` sin tocar tono ni croma).
- Tokens definidos en `:root` (claro) y `.dark` (oscuro) de
  `src/styles/app.css`, expuestos a Tailwind v4 con `@theme inline`
  (`bg-background`, `text-muted-foreground`, `border-border`, etc.).
- Tema: clase `.dark` en `<html>`; se persiste en `localStorage` y el valor
  inicial sigue `prefers-color-scheme`.
- Concepto: **"Editorial Minimal"** — crema cálido / casi negro violáceo,
  con **un solo acento violeta** (`--primary`). `--accent` es un gris
  neutro a propósito (hover genérico de shadcn) para que el violeta no
  parpadee en cualquier hover; el violeta se aplica de forma deliberada
  (enlaces, estado activo, CTA).

### 2.2 Paleta principal

| Token | Rol | Claro | Oscuro |
|---|---|---|---|
| `--background` | Fondo de página | `oklch(96.9% 0.007 85)` | `oklch(15.9% 0.011 292)` |
| `--foreground` | Texto principal | `oklch(15.9% 0.011 292)` | `oklch(95.9% 0.006 85)` |
| `--card` | Superficie elevada | `oklch(98.3% 0.004 85)` | `oklch(19.4% 0.013 292)` |
| `--primary` | **Acento de marca (violeta)** | `oklch(50% 0.15 290)` | `oklch(72% 0.14 290)` |
| `--primary-foreground` | Texto sobre `--primary` | `oklch(95% 0.02 290)` | `oklch(15% 0.04 290)` |
| `--secondary` | Superficie de contraste (botón sólido neutro) | `oklch(15.9% 0.011 292)` | `oklch(95.9% 0.006 85)` |
| `--muted` | Fondo atenuado | `oklch(92.4% 0.009 80)` | `oklch(11.8% 0.01 292)` |
| `--muted-foreground` | Texto secundario | `oklch(40% 0.016 290)` | `oklch(70% 0.014 290)` |
| `--accent` | Hover neutro | `oklch(92.4% 0.009 80)` | `oklch(23% 0.014 292)` |
| `--border` | Divisores decorativos | `oklch(15.9% 0.011 292 / 7%)` | `oklch(100% 0 0 / 10%)` |
| `--input` | Borde de campos | `oklch(15.9% 0.011 292 / 14%)` | `oklch(100% 0 0 / 15%)` |
| `--ring` | Anillo de foco | `oklch(50% 0.15 290)` | `oklch(72% 0.14 290)` |

Radio base `--radius: 0.375rem`; la escala (`sm`…`4xl`) se deriva de él
(ver 5.4).

### 2.3 Estados semánticos

| Token | Uso | Claro | Oscuro |
|---|---|---|---|
| `--success` / `--success-foreground` | Confirmación, "publicado" | `oklch(52% 0.13 155)` | `oklch(70% 0.14 155)` |
| `--destructive` | Error, borrar, validación fallida | `oklch(55% 0.19 25)` | `oklch(70% 0.18 25)` |
| `--info` / `--info-foreground` | Aviso neutro, ayuda | `oklch(52% 0.14 240)` | `oklch(70% 0.13 240)` |
| `--warning` / `--warning-foreground` | Advertencia, acción reversible con riesgo | `oklch(52% 0.12 70)` / `oklch(97% 0.02 80)` | `oklch(78% 0.14 75)` / `oklch(15% 0.03 75)` |

Reglas:

- El color **nunca** es el único portador del significado (WCAG 1.4.1):
  todo estado lleva además icono Lucide y/o texto ("Error: …").
- Mensajes de error de formulario: `text-destructive` + icono + texto
  descriptivo (ver 5.2).

### 2.4 Contrastes medidos

Calculados con la fórmula de luminancia relativa de WCAG 2.1 a partir de
los tokens de arriba (mezcla alfa en sRGB codificado, como hace el
navegador). Umbrales: texto normal ≥ 4.5:1 (AA), ≥ 7:1 (AAA); texto grande
(≥ 24 px, o ≥ 18.66 px en negrita) ≥ 3:1; componentes de UI y
anillos de foco ≥ 3:1 (WCAG 1.4.11).

| Par | Claro | Oscuro | Veredicto |
|---|---|---|---|
| `foreground` / `background` | 17.8 | 17.3 | AAA |
| `foreground` / `card` | 18.5 | 16.3 | AAA |
| `muted-foreground` / `background` | 8.5 | 7.3 | AAA |
| `muted-foreground` / `card` | 8.8 | 6.9 | AAA claro · AA oscuro |
| `muted-foreground` / `muted` | 7.4 | 7.6 | AAA |
| `primary` / `background` (texto/enlace) | 5.8 | 7.5 | AA claro · AAA oscuro |
| `primary-foreground` / `primary` (botón) | 5.5 | 7.7 | AA claro · AAA oscuro |
| `secondary-foreground` / `secondary` | 17.8 | 17.3 | AAA |
| `destructive` / `background` | 4.9 | 6.7 | AA |
| `success` / `background` | 4.7 | 7.7 | AA |
| `info` / `background` | 4.9 | 7.4 | AA |
| `ring` (borde de foco) / `background` | 5.8 | 7.5 | Cumple 1.4.11 |
| `input` (borde de campo) / `background` | 3.06 | 3.17 | Cumple 1.4.11 (corregido, ver 2.7) |

Los pares de texto sobre `--success`, `--destructive` e `--info` como
**fondo** no están medidos: hoy esos tokens se usan como color de texto o
con opacidad baja (`bg-destructive/10`), no como relleno sólido. Si se
usan como relleno sólido, hay que medir el par antes de mergear.

### 2.5 Reglas de uso

- **No salir de la paleta.** Un color nuevo = un token nuevo en `app.css`
  (claro y oscuro), con su contraste medido en este documento.
- `text-primary` solo para enlaces, estado activo y énfasis puntual. No
  para párrafos.
- Texto secundario = `text-muted-foreground`. No bajar la opacidad del
  texto (`text-foreground/50`) para "atenuar": rompe el contraste medido.
- Superficies: `background` → `card` (elevada) → `muted` (hundida).
  Máximo dos niveles visibles a la vez.
- Los dos temas se diseñan y se prueban siempre; un PR de UI que solo se
  vio en uno no está terminado.

### 2.6 Token `--warning`

Implementado en `app.css` (`:root`, `.dark` y `@theme inline` →
`bg-warning`, `text-warning`, `text-warning-foreground`). Ámbar con el
contraste medido contra el fondo del tema:

| Token | Claro | Oscuro | Contraste vs `background` |
|---|---|---|---|
| `--warning` | `oklch(52% 0.12 70)` | `oklch(78% 0.14 75)` | 5.2 / 9.5 (AA / AAA) |
| `--warning-foreground` | `oklch(97% 0.02 80)` | `oklch(15% 0.03 75)` | sobre `--warning`: 5.2 / 9.7 |

Todavía sin usos: es el primer estado de advertencia que se construya el
que lo estrene.

### 2.7 Borde de campos (corregido)

`--input` (borde de `Input`, `Textarea`, `Select`) medía **1.35:1** en
claro y **1.50:1** en oscuro, bajo el 3:1 que exige WCAG 1.4.11. Ahora es
`oklch(15.9% 0.011 292 / 45%)` en claro (3.06:1) y `oklch(100% 0 0 / 35%)`
en oscuro (3.17:1).

Efecto a tener en cuenta: `Input`/`Textarea` usan `dark:bg-input/30` como
relleno, así que en oscuro el relleno también se aclara (de ~4.5 % a
~10.5 % de blanco). Revisado en el formulario de contacto en ambos temas.

---

## 3. Tipografía

### 3.1 Familias

Todas autoalojadas con `@fontsource` (sin petición a Google Fonts, sin
FOUT por CDN externo).

| Rol | Familia | Variable CSS / clase | Uso |
|---|---|---|---|
| Display | **Instrument Serif** (400, con itálica) | `--font-serif` · `.font-serif-display` | Titulares H1–H3, nombre, números destacados |
| Texto | **Geist Variable** | `--font-sans` (por defecto en `<html>`) | Párrafos, UI, botones, formularios |
| Etiquetas / datos | **Geist Mono Variable** | `--font-mono` · `.eyebrow` | Etiquetas pequeñas, metadatos, fechas, código |

Contraste tipográfico: serif de display fino y alto contraste frente a una
sans geométrica neutra. Son dos voces claramente distintas; no se agrega
una tercera.

### 3.2 Jerarquía

Instrument Serif solo existe en peso 400 (no hay negrita real): la
jerarquía de los titulares se construye con **tamaño y espacio**, nunca con
`font-bold` (generaría negrita sintética). El itálico sí existe y se usa
para énfasis ("*González*").

| Nivel | Familia · peso | Tamaño | Interlineado | Tracking | Estado |
|---|---|---|---|---|---|
| H1 (hero) | Serif · 400 | `clamp(56px, 8.4vw, 120px)` | 0.98 | −0.02em | En código |
| H2 (sección) | Serif · 400 | `clamp(32px, 4.5vw, 56px)` | 0.98 | −0.02em | En código |
| H3 (subsección) | Serif · 400 | `clamp(28px, 4vw, 48px)` | 0.98 | −0.02em | Tamaño en código (hoy los títulos de `aboutMe` usan este tamaño con `<h2>`, ver 10) |
| H4 | Serif · 400 | `clamp(20px, 2.2vw, 28px)` | 1.1 | −0.01em | Definido aquí (el tamaño existe en el eslogan del footer, que es un `<p>`) |
| H5 | Sans · 600 | 18 px (`text-lg`) | 1.4 | 0 | Definido aquí |
| H6 | Sans · 600 | 16 px (`text-base`) | 1.4 | 0 | Definido aquí |
| Lead | Sans · 400 | `clamp(18px, 1.6vw, 22px)` (`.khelde-lead`) | 1.5 | 0 | En código |
| Body | Sans · 400 | 16 px (`text-base`) | 1.6 | 0 | Definido aquí |
| Body pequeño | Sans · 400 | 14 px (`text-sm`) | 1.5 | 0 | En código |
| Caption | Sans · 400 | 12 px (`text-xs`) | 1.4 | 0 | Definido aquí |
| Eyebrow | Mono · 500, mayúsculas | 12 px / `0.75rem` (`.eyebrow`) | — | +0.16em | En código |

Reglas:

- **Un solo `<h1>` por página.** Los niveles no se saltan (H2 → H4 no).
  El nivel visual se elige con clases; el nivel semántico con la etiqueta.
- Largo de línea: **≤ 65–75 caracteres** (`max-width: 60ch` en
  `.khelde-lead`; `max-w-prose` en párrafos largos). Las líneas de
  serif aguantan un poco más; las de sans, no.
- Interlineado del cuerpo ≥ **1.5** (WCAG 1.4.12 exige que el texto
  soporte 1.5 sin perder contenido).
- **Kerning/tracking:** el serif de display se aprieta (−0.02em) porque
  a tamaños grandes el espaciado por defecto se ve flojo; los titulares
  grandes deben llevar `text-wrap: balance` (_Pendiente_: hoy ningún
  titular lo usa). Las etiquetas en mayúsculas llevan
  tracking **positivo** (+0.16em) para legibilidad. El cuerpo no se toca.
- Tamaño mínimo de texto que comunica información: **12 px**. Ningún texto
  funcional por debajo (el eyebrow y las etiquetas del footer ya están
  en 12 px).
- El texto debe poder ampliarse al 200 % sin pérdida (WCAG 1.4.4): tamaños
  en `rem`/`clamp`, no `px` fijos en contenedores de altura fija.
- No usar `text-[Npx]` arbitrarios nuevos: si falta un nivel, se agrega a
  esta tabla y a `app.css`.

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
| Alto | `Input`/`Select` 32 px (`h-8`) en admin; **≥ 40 px** (`h-10`) en formularios públicos |
| Texto | 16 px en móvil (`text-base`, evita el zoom automático de iOS), 14 px desde `md` |
| Borde | `border-input`, radio `rounded-lg`, fondo transparente (`dark:bg-input/30`) — contraste del borde en 2.7 |
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
| 1 | Borde de campos `--input` bajo 3:1 (WCAG 1.4.11) | `app.css` | ✅ Resuelto (2.7) |
| 2 | No existía token `--warning` | `app.css` | ✅ Resuelto (2.6) |
| 3 | GSAP/ScrollTrigger sin instalar | `package.json`, `src/lib/motion.ts` | ✅ Instalado y arquitectura lista (7); falta migrar/crear animaciones |
| 4 | Colores hardcodeados fuera de tokens: galaxia 3D (`#FFC896`, `#8C5CFF`, `#FFFFFF`, `rgba(...)`), `wordmark-reveal` (`oklch(11.8% …)`, `rgba(245,242,236,.18)`), `<meta name="theme-color" content="#6f37cf">` | `GalaxyBackground.tsx`, `app.css`, `Layout.astro` | ⏳ Pendiente. Leer `--primary` desde CSS para el 3D; alinear `theme-color`. El 3D es una escena de color propio: decidir si se acepta como excepción |
| 5 | Etiquetas a 11 px | `app.css`, footer, formulario de contacto, Panel admin | ✅ Resuelto (12 px) |
| 6 | CTAs del hero eran `<a>` hechos a mano | `Header.astro` | ✅ Resuelto: `buttonVariants` sobre `<a>` (los `.astro` no pueden pasar `render={<a />}`), pill + `min-h-11` |
| 7 | Tamaños arbitrarios `text-[Npx]` / `text-[clamp(...)]` repetidos | secciones del home | ⏳ Pendiente: convertir en utilidades/tokens de tipografía (3.2) |
| 8 | `Button` `default`/`lg` miden 32/36 px (< 44 px táctil) | `button.tsx` | ⏳ Parcial: el hero ya usa `min-h-11`; falta el resto del sitio público (`min-h-11` o variante `touch`) |
| 9 | Animaciones existentes mezcladas: CSS, JS manual (`Cosmos.tsx`, Footer) y 3D | varios | ⏳ Pendiente: migrar entradas/parallax a GSAP (7.1); dejar Three/cosmos como están |
| 10 | Cobertura de `prefers-reduced-motion` desigual | varios | ⏳ Pendiente: test e2e emulando `reducedMotion: 'reduce'` |
| 11 | Títulos de Educación, Experiencia, Habilidades y Sobre mí eran `<span>` | `src/features/aboutMe/` | ✅ Resuelto (`<h2>`, mismas clases) |
| 12 | Jerarquía de encabezados plana: los puestos (`ItemDataExperiencia`) y las cards de proyectos son `<h2>` al mismo nivel que el título de su sección; deberían ser `<h3>` | `ItemDataExperiencia.tsx`, `Proyectos.astro` | ⏳ Pendiente (WCAG 1.3.1) |
