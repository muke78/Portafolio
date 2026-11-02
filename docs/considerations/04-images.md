# Images (`astro:assets`)

Guía oficial: https://docs.astro.build/en/guides/images/

## Qué es

`<Image />`/`<Picture />` de `astro:assets` procesan y optimizan imágenes
**en build time**: conversión de formato (webp/avif), resize, `srcset`
responsivo, y — clave para CLS — `width`/`height` inferidos automáticamente
del archivo fuente. Solo funciona así para imágenes **importadas como
módulo ESM** desde `src/` (procesadas por Vite). Un `src` en string
(apuntando a `/public/algo.webp` o a una URL remota) se trata como imagen
remota: sigue dando `srcset` si se configuran `widths`, pero **no hay
optimización de archivo real** — Astro no puede tocar un archivo que no
pasa por su pipeline de build.

## Auditoría completa de imágenes del proyecto

Grep de `<img`, `<Image`, `<Picture` en **todo** `src/` (`.astro` y `.tsx`,
sin excepciones):

| Archivo | Elemento | Fuente | Local/remota | ¿Optimizada hoy? |
|---|---|---|---|---|
| `Header.astro:118` | `<Image>` (astro:assets) | `/e9721e9d-....webp` (string, apunta a `public/`) | Local | **No** — ver hallazgo abajo |
| `404.astro:15` | `<img>` crudo | `/404.svg` (`public/`) | Local, SVG | No, pero es decorativo y vectorial |
| `Educacion.tsx:12` | `<img>` crudo | `/UPVM.webp` (`public/`) | Local | No |
| `SobreMi.tsx:14` | `<img>` crudo | `/Aboutme.webp` (`public/`) | Local | No |
| `ItemDataProjects.tsx:37` | `<img>` crudo | `https://pub-...r2.dev/${card_image}` | Remota (Cloudflare R2) | No, y no debería serlo vía Astro (ver más abajo) |
| `ItemDataExperiencia.tsx:56` | `<img>` crudo | `https://pub-...r2.dev/${img}` | Remota (Cloudflare R2) | No, mismo caso |

También existen `src/assets/img/favicon.svg` y `KheldeNew.svg` (sí están en
`src/assets/`, la carpeta correcta para que Vite los procese), pero no se
usan vía `<Image>` — son referenciados directo como favicon/logo SVG
inline, donde el procesamiento de `astro:assets` no aporta nada extra.

## Hallazgo real: el único `<Image>` del proyecto no está optimizado

`Header.astro` es el único lugar que ya usa el componente recomendado:

```astro
<Image
  src="/e9721e9d-cfa4-47ce-9f2c-40ec23335d62.webp"
  width={640}
  height={800}
  alt="muke78"
  ...
/>
```

Pero el archivo vive en `public/`, no en `src/assets/`. Con un `src` string
así, Astro **no puede procesar el archivo** — lo sirve tal cual, sin
generar variantes de tamaño ni convertir formato. El componente sigue
dando el beneficio de `width`/`height` explícitos (CLS cero por eso), pero
cero optimización real de peso/formato, que es la razón principal de usar
`<Image>` en primer lugar. Es la foto del hero — la imagen más grande y más
"LCP-crítica" de toda la página, y es la que menos aprovecha la feature que
ya está importada para procesarla.

**Fix concreto:**

```astro
---
import heroPhoto from "@/assets/img/e9721e9d-cfa4-47ce-9f2c-40ec23335d62.webp";
---
<Image src={heroPhoto} alt="muke78" ... />
```

Mover el archivo de `public/` a `src/assets/img/` e importarlo como módulo.
Con eso, `width`/`height` se infieren solos (ya no hace falta ponerlos a
mano) y el build genera automáticamente la versión optimizada.

## Los 4 `<img>` crudos: dos se arreglan, dos se quedan así a propósito

**Educacion.tsx y SobreMi.tsx** (`/UPVM.webp`, `/Aboutme.webp`): son
imágenes locales, estáticas, una sola instancia cada una — candidatas
directas al mismo fix que el hero. La única fricción: `astro:assets` solo
funciona en archivos `.astro`, no dentro de un componente React (`.tsx`).
Estos dos componentes son 100% presentacionales (nada de estado, nada de
interactividad, no deberían necesitar hidratarse aparte). La solución
correcta no es "forzar `<Image>` dentro de React", es **subir el
`<Image>` un nivel**: renderizar la imagen en el `.astro` padre
(`Acerca.astro`/donde se compongan) y pasar el bloque de imagen ya resuelto,
o directamente convertir `Educacion.tsx`/`SobreMi.tsx` a `.astro` ya que no
tienen ninguna razón real para ser componentes de React — son parte de un
tab que hidrata como grupo (`TabsAcerca client:visible`), no cada uno por
separado.

**ItemDataProjects.tsx e ItemDataExperiencia.tsx** (imágenes en R2): estas
**no deben** enrutarse por el pipeline de build de Astro, y es una decisión
consciente, no un pendiente:

- El set de imágenes es dinámico e ilimitado — nuevas imágenes las sube el
  admin vía el panel (`docs/02-panel-admin-requisitos.md`), no existen en
  build time. Astro no puede optimizar en build algo que no existe todavía
  cuando se compila el sitio.
- El propio plan ya resuelve esto por otro lado: Hono va a manejar la
  conversión automática a webp en el momento del upload
  (`docs/02-panel-admin-requisitos.md`, sección de imágenes), y Cloudflare
  R2/Images puede hacer transform-on-the-fly por URL si hace falta
  redimensionar después. Ese es el lugar correcto para esta optimización,
  no `astro:assets`.
- Lo único que falta ahí, y sí es gratis hacerlo ya: `ItemDataProjects.tsx`
  no tiene `width`/`height` como atributos HTML (solo `style.height:
  "200px"`, que sí previene CLS pero no es lo mismo que los atributos
  nativos). `ItemDataExperiencia.tsx` tampoco los tiene. Agregarlos no
  requiere esperar a nada del backend.

**404.svg**: decorativo, SVG vectorial (no pesa nada, no tiene variantes de
resolución que generar). Dejarlo como está — no es prioridad.

## Veredicto — hecho, con un ajuste de alcance

1. [x] **Foto del hero movida y optimizada** — `public/e9721e9d-....webp` →
   `src/assets/img/hero-portrait.webp`, importada como módulo en
   `Header.astro`, `width`/`height` ya no hacen falta a mano (inferidos).
   Confirmado en el build: `dist/client/_astro/hero-portrait.BpJnFKXH.webp`
   — nombre con hash de contenido, prueba de que el pipeline real la está
   procesando (antes era una copia estática sin tocar).
   - **Bug real encontrado al probarlo en vivo, no en el papel**: la
     imagen daba 404 después del cambio. Causa: el endpoint interno de
     Astro para servir imágenes optimizadas (`/_image?href=...`) nunca
     estaba exento en `middleware.ts` — el `localeGuard` lo trataba como
     un segmento de locale desconocido y lo mandaba a la página 404. Nadie
     lo había notado porque este era el primer `<Image>` del proyecto que
     apuntaba a un archivo real dentro de `src/assets/`. Arreglado
     agregando `"_image"` a `NON_LOCALE_ROOTS` en `middleware.ts`.
2. [x] `width`/`height` agregados a los dos `<img>` de R2
   (`ItemDataProjects.tsx`, `ItemDataExperiencia.tsx`) — sin depender de
   nada del backend, como ya se anticipaba.
3. [ ] **`/UPVM.webp` y `/Aboutme.webp` (Educacion.tsx/SobreMi.tsx):
   deferido, no descartado.** La opción "subir el `<Image>` al `.astro`
   padre" resultó más invasiva de lo que parecía en el papel:
   `TabsAcerca.tsx` hidrata como grupo (`client:visible`) y decide qué tab
   mostrar con estado de React — separar la imagen de cabecera de
   `Educacion.tsx`/`SobreMi.tsx` hacia el `.astro` padre implica pasar esa
   imagen ya renderizada como children/slot a través de la frontera de
   hidratación, o convertir esos dos componentes enteros a `.astro` y
   reestructurar cómo `TabsAcerca` decide qué renderizar — un cambio de
   arquitectura real, no un ajuste de imagen. Se deja pendiente, de menor
   prioridad que el resto de la sección 3 del `docs/TODO.md` — ambas
   imágenes ya tienen `width`/`height` explícitos hoy (sin CLS), solo les
   falta la optimización de formato/peso.
4. **No** se metieron las imágenes de R2 al pipeline de `astro:assets` —
   confirmado, el plan correcto para esas sigue en `docs/02`.

Verificado: `astro check` (0 errores), `pnpm run build`, `pnpm test:unit`
(34/34), y pasada en vivo en el browser (home, proyectos, experiencia) sin
errores de consola — incluyendo confirmar que el 404 del `/_image` quedó
resuelto después del fix de middleware.

## Referencias cruzadas

- `docs/02-panel-admin-requisitos.md` — conversión a webp en Hono, upload a R2.
- [01-server-islands.md](01-server-islands.md) — Educación/Acerca de mí como candidatas a `.astro` server-rendered.
