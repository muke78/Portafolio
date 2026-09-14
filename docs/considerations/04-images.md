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

## Veredicto

**Adoptar ahora**, alcance acotado a lo que realmente se puede optimizar en
build time:

1. Mover la foto del hero a `src/assets/` + importarla — arregla el bug
   real en la imagen más importante de LCP de todo el sitio.
2. Mismo tratamiento para `/UPVM.webp` y `/Aboutme.webp`, subiendo el
   `<Image>` a los `.astro` padres.
3. Agregar `width`/`height` explícitos a los dos `<img>` de R2 — cero
   dependencia de nada más.
4. **No** intentar meter las imágenes de R2 al pipeline de `astro:assets` —
   confirmado que el plan correcto para esas ya está en `docs/02`.

## Referencias cruzadas

- `docs/02-panel-admin-requisitos.md` — conversión a webp en Hono, upload a R2.
- [01-server-islands.md](01-server-islands.md) — Educación/Acerca de mí como candidatas a `.astro` server-rendered.
