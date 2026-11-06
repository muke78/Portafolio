# GSAP: referencia de trabajo

Guía interna de **qué ofrece GSAP, qué usamos y cómo se usa aquí**. La lista
de la API sale del índice oficial de [gsap.com/docs/v3](https://gsap.com/docs/v3);
el detalle de cada método está en su página de la documentación. Las reglas
del sitio (accesibilidad, atributos, escenas) viven en
[`UI_STANDARDS.md`](./UI_STANDARDS.md) (secciones 7.7 y 12.4); aquí está el
mapa para **elegir la herramienta correcta** antes de escribir una animación.

> Estado del proyecto: `gsap@3.15.0` (licencia "Standard no charge" de
> GSAP; verificar términos vigentes en
> [gsap.com/standard-license](https://gsap.com/standard-license/)). El
> paquete trae todos los plugins (`node_modules/gsap/*.js`), pero **solo se
> registran los que se usan** (hoy: `ScrollTrigger` y `SplitText`) para no
> pagar bytes de más.

## 1. Cómo se usa en este repo

Todo el movimiento pasa por **un único motor**: `src/lib/motion/`
(`@/lib/motion`). Los componentes **no** llaman a `gsap.*`; solo llevan
atributos de datos y el motor los anima.

| Módulo | Responsabilidad |
|---|---|
| `core.ts` | `withMotion()` (`gsap.matchMedia` + reduced motion), `watch()` (elementos que aparecen tarde, tras hidratar la isla), `settle()`, constantes `MOTION` |
| `hero.ts` | Entrada orquestada del hero + salida escrubada |
| `reveals.ts` | `[data-reveal]`: fade-up con stagger por lotes |
| `scenes.ts` | Escena fijada del manifiesto (`pin` + `scrub` + `SplitText`) |
| `split.ts` | `[data-split]`: títulos con máscara de líneas |
| `media.ts` | Parallax decorativo, deriva de imágenes, marquee ligado a la velocidad (con inclinación `skewX`) |
| `rails.ts` | `[data-hscroll]`: riel de proyectos fijado con las 6 mejores tarjetas de una categoría (un trigger por riel: deslizamiento e inclinación por velocidad) |
| `peek.ts` | `[data-peek]`: índice del resto de una categoría; la imagen grande de cada fila sigue al cursor (`quickTo`, cortina `clip-path`, inclinación por velocidad) |
| `intro.ts` | `[data-intro]`: la puerta del Home (el punto cero): una esfera de cristal con copos morados que respira casi inmóvil y se acelera con el cursor (energía: un `ticker` con `quickSetter`), una historia en frases con pausa y, al click la esfera gira varias veces en una órbita elíptica lenta, se encoge y vuelve al mismo punto, y ahí estalla (`bigbang.ts`: núcleo blanco, rayos de radiación, neblina roja, fragmentos con forma de estrella; `galaxyState.bang` lanza las estrellas). El portafolio aparece de golpe (sin girar) y `heatUp` lo tiñe de amarillo/rojo con un blend `color` durante 7 s hasta enfriarlo a violeta. Con el cursor encima la esfera pasa por estados: picos de caricatura → borde ferrofluido → escalofríos → burbuja de un lado → violeta a rojo. El botón «Saltar» (`corrupt.ts`) flota y usa `ScrambleTextPlugin` solo al cargar y al hover. Emite `intro:open` |
| `snowglobe.ts` | Los copos de la esfera: un canvas 2D con física propia (`stepFlakes`, pura y probada) movido por el `ticker` de GSAP |
| `masks.ts` | `[data-mask]` (marcos que se abren con `clip-path`) y `[data-stagger]` (hijos que entran uno a uno) |
| `text.ts` | `[data-scrub-text]`: palabras que se encienden con el scroll (sin fijar) |
| `layers.ts` | `[data-stack]`: pila de cards `sticky` con profundidad |
| `skills.ts` | Habilidades en vuelo (`MotionPathPlugin`): chips que entran por curvas en S, escrubadas, y una línea "serpiente" que se dibuja con un punto que la recorre |
| `galaxy.ts` | La galaxia de partículas cuenta su vida con el scroll de TODA la página: un solo `ScrollTrigger` sin pin escruba `galaxyState.story` (0 → 1; nubes → el gas cae → disco → primeras estrellas → brazos y agujero negro → fusiones → final) y `galaxyState.bang` (el Big Bang de la introducción); el canvas (`components/three/ParticleGalaxy.tsx`) solo lee ese estado. Los rangos de cada fase están en la cabecera de `ParticleGalaxy.tsx`. El epílogo (`[data-epilogue]`, 520–620vh) da su propia distancia a cada escena: la fusión termina en .30 y su frase entra después; el final de las estrellas ocupa .36–.64; y `galaxyState.hole` (0 → 1, .66–1) acerca el agujero negro: el disco se acuesta, se levanta hacia ti, y centenares de estrellas nuevas se curvan a su alrededor (lente gravitacional en el vertex shader) |
| `anchors.ts` | Enlaces `#sección` con pins: `ScrollTrigger.refresh()` antes de medir, `ScrollToPlugin`, hasta 10 correcciones mientras la página crece |
| `dialogs.ts` | Diálogo de comentarios (`[data-dialog]`, items en stagger; sin overlay a pantalla completa) y lanzador `[data-fab]` |
| `detail.ts` | Ruta `/[lang]/project/[id]`: timeline de entrada + profundidad al hacer scroll |
| `page.ts` | `[data-scroll-progress]`: barra de progreso de lectura |
| `index.ts` | `initMotion()`: arranca todo una vez desde `Layout.astro` |

Para añadir un efecto: **atributo de datos nuevo → escena en
`src/lib/motion/` → fila en `UI_STANDARDS.md` 7.7**.

## 2. ¿Qué herramienta uso?

| Quiero… | Usa |
|---|---|
| Animar una propiedad de A a B | `gsap.to()` / `from()` / `fromTo()` |
| Encadenar una coreografía | `gsap.timeline()` con posiciones (`"<"`, `"+=0.2"`, labels) |
| Ligar movimiento al scroll | `ScrollTrigger` (`scrub`, `pin`, `start`/`end`, `snap`) |
| Fijar una sección mientras ocurre algo | `ScrollTrigger` con `pin: true` + timeline escrubado |
| Revelar elementos al entrar en pantalla | `ScrollTrigger.batch()` o el motor (`[data-reveal]`) |
| Partir texto en líneas/palabras/letras | `SplitText` (`mask`, `autoSplit`, `aria`) |
| Dibujar un trazo SVG | `DrawSVGPlugin` (o `strokeDashoffset` con `pathLength=1`) |
| Mover algo por una ruta/curva | `MotionPathPlugin` |
| Transformar una forma en otra | `MorphSVGPlugin` |
| Animar un cambio de layout (cards que se reordenan, tabs) | `Flip` |
| Reaccionar a rueda/gesto/arrastre sin scroll nativo | `Observer` |
| Arrastrar / lanzar con inercia | `Draggable` + `InertiaPlugin` |
| Seguir el cursor sin saturar | `gsap.quickTo()` / `gsap.quickSetter()` |
| Animar un número o texto que cambia | `TextPlugin`, `ScrambleTextPlugin` |
| Scroll programático a un ancla | `ScrollToPlugin` |
| Scroll suavizado de toda la página | `ScrollSmoother` (**no usado a propósito**, ver 6) |
| Animar solo si el usuario lo permite | `gsap.matchMedia()` (`withMotion`) |
| Limpiar todo al desmontar | `gsap.context()` / `ctx.revert()` |
| Depurar una timeline | `GSDevTools` (solo en desarrollo) |

## 3. API del núcleo

### 3.1 Propiedades de `gsap`

| Propiedad | Para qué sirve |
|---|---|
| `gsap.effects` | Registro de efectos reutilizables creados con `registerEffect()` |
| `gsap.globalTimeline` | Timeline raíz que contiene todas las animaciones |
| `gsap.ticker` | El bucle (rAF) que mueve GSAP; `add()`/`remove()` callbacks, `lagSmoothing()` |
| `gsap.utils` | Utilidades: `toArray`, `clamp`, `mapRange`, `interpolate`, `snap`, `random`, `wrap`, `wrapYoyo`, `pipe`, `distribute`, `shuffle`, `normalize`, `unitize`, `selector`, `getUnit`, `splitColor`… |
| `gsap.version` | Versión instalada |

### 3.2 Métodos de `gsap`

| Método | Para qué sirve |
|---|---|
| `to()` / `from()` / `fromTo()` | Crear tweens (hacia, desde, de-a) |
| `set()` | Fijar valores al instante |
| `timeline()` | Crear una línea de tiempo |
| `delayedCall()` | Ejecutar una función tras un retraso |
| `context()` | Agrupar animaciones/triggers para revertirlos de golpe (clave en React) |
| `matchMedia()` | Registrar animaciones según media queries (incl. `prefers-reduced-motion`) y revertirlas al cambiar |
| `matchMediaRefresh()` | Forzar la reevaluación de las media queries |
| `defaults()` / `config()` | Valores por defecto (ease, duración) y configuración global (`nullTargetWarn`, `autoSleep`…) |
| `registerPlugin()` | Registrar plugins (obligatorio antes de usarlos) |
| `registerEase()` / `parseEase()` | Registrar o resolver un ease |
| `registerEffect()` | Definir un efecto reutilizable (`gsap.effects.nombre(...)`) |
| `quickSetter()` / `quickTo()` | Setters ultrarrápidos para valores que cambian a cada frame (cursor, mouse, scroll) |
| `getProperty()` | Leer un valor animable (con unidades) |
| `getById()` / `getTweensOf()` / `isTweening()` / `killTweensOf()` | Buscar, consultar y matar tweens |
| `exportRoot()` | Sacar las animaciones del raíz a una timeline (útil al pausar secciones enteras) |
| `updateRoot()` | Avanzar manualmente el raíz (integraciones externas) |

### 3.3 `Tween`

- **Propiedades:** `.data`, `.ratio`, `.scrollTrigger`, `.vars`.
- **Control:** `play()`, `pause()`, `paused()`, `resume()`, `restart()`,
  `reverse()`, `reversed()`, `seek()`, `kill()`, `revert()`, `invalidate()`.
- **Tiempo:** `time()`, `totalTime()`, `progress()`, `totalProgress()`,
  `duration()`, `totalDuration()`, `delay()`, `timeScale()`, `startTime()`,
  `endTime()`, `globalTime()`.
- **Repetición:** `repeat()`, `repeatDelay()`, `yoyo()`, `iteration()`.
- **Otros:** `targets()`, `isActive()`, `eventCallback()` (`onStart`,
  `onUpdate`, `onComplete`…), `then()` (devuelve una promesa).

### 3.4 `Timeline`

Todo lo de `Tween` más:

- **Propiedades:** `.autoRemoveChildren`, `.labels`, `.parent`,
  `.smoothChildTiming`, `.data`, `.vars`, `.scrollTrigger`.
- **Construir:** `add()`, `to()`, `from()`, `fromTo()`, `set()`, `call()`,
  `addLabel()`, `addPause()`, `remove()`, `removeLabel()`, `removePause()`,
  `clear()`, `shiftChildren()`.
- **Navegar:** `currentLabel()`, `nextLabel()`, `previousLabel()`,
  `tweenTo()`, `tweenFromTo()`, `recent()`.
- **Consultar:** `getChildren()`, `getTweensOf()`, `getById()`,
  `killTweensOf()`.

Posiciones útiles al añadir: `0.5` (absoluto), `"+=0.3"` (tras el final),
`"<"` (inicio del anterior), `">"` (fin del anterior), `"label+=0.2"`.

## 4. Eases

Integrados: `none`/`linear`, `power1`…`power4` (`.in`/`.out`/`.inOut`),
`back`, `elastic`, `bounce`, `circ`, `expo`, `sine`, `steps(n)`. Plugins de
ease: **CustomEase** (curva Bezier propia), **CustomBounce**,
**CustomWiggle**, **ExpoScaleEase**, **RoughEase**, **SlowMo**,
**SteppedEase**. Criterio del sitio: `power3.out` para entradas,
`power3.inOut` para aperturas, `none` para todo lo escrubado, y `back.out`
solo en elementos pequeños (etiquetas), nunca en bloques de texto.

## 5. Plugins

Estado en este proyecto: ✅ registrado y en uso · 🟦 disponible (en el paquete)
pero sin registrar · ⛔ descartado a propósito.

| Categoría | Plugin | Qué hace | Estado |
|---|---|---|---|
| Scroll | **ScrollTrigger** | Dispara/escruba animaciones con el scroll; `pin`, `snap`, `batch`, `containerAnimation` | ✅ |
| Scroll | **ScrollSmoother** | Scroll suavizado con *effects* (`data-speed`, `data-lag`) | ⛔ |
| Scroll | **ScrollToPlugin** | Animar el scroll a una posición/elemento | ✅ `anchors.ts` |
| SVG | **DrawSVG** | Dibuja/borra trazos (`drawSVG: "0% 100%"`) | 🟦 (el anillo del hero usa `strokeDashoffset` con `pathLength=1`) |
| SVG | **MorphSVG** | Morfea una forma SVG en otra | 🟦 |
| SVG | **MotionPath** / **MotionPathHelper** | Mueve elementos a lo largo de una ruta; el helper la edita visualmente | 🟦 |
| UI | **Flip** | Animar cambios de layout (estado → estado) | 🟦 |
| UI | **Draggable** + **Inertia** | Arrastrar, lanzar con inercia | 🟦 |
| UI | **Observer** | Normaliza rueda/toque/puntero en eventos de intención | 🟦 |
| Texto | **SplitText** | Parte texto en líneas/palabras/letras; `mask`, `autoSplit`, `aria`, `revert()` | ✅ |
| Texto | **ScrambleText** | Efecto de letras que se "descifran" | 🟦 |
| Texto | **TextPlugin** | Reemplaza el texto de un elemento animando | 🟦 |
| Otros | **Physics2D** / **PhysicsProps** | Física 2D (velocidad, ángulo, gravedad) | 🟦 |
| Otros | **GSDevTools** | Panel para depurar timelines | 🟦 (solo en dev) |
| Otros | **CSSRulePlugin**, **EaselPlugin**, **PixiPlugin** | Reglas CSS / Easel / Pixi | ⛔ no aplican |

Registrar un plugin nuevo: importarlo en `src/lib/motion/core.ts` y añadirlo a
`gsap.registerPlugin(...)`. Importar siempre desde `gsap/<Plugin>`.

## 6. Decisiones y trampas de este proyecto

- **`prefers-reduced-motion`**: todo va dentro de `withMotion()`
  (`gsap.matchMedia`). Con `reduce` no se ejecuta nada y el contenido se ve.
  El CSS solo oculta estados iniciales bajo `html.motion-ok` (con un
  temporizador de seguridad de 4 s).
- **SSR + islas de Astro**: nada de `window`/`document` al importar. No tocar
  nada dentro de una isla sin hidratar (`astro-island[ssr]`): React lo leería
  como un error de hidratación. `watch()` y `reveals.ts` ya lo respetan.
- **`clearProps: "all"` al terminar** una entrada: devuelve el control al CSS
  (los `hover-lift` usan `transform`). Por eso el motor marca `data-revealed`
  antes de limpiar (si no, el CSS volvería a ocultar el elemento).
- **Tailwind v4 usa la propiedad `translate`**, no `transform`: los
  `-translate-x-1/2` no chocan con `xPercent`/`yPercent`/`rotation` de GSAP.
- **Lo escrubado nunca atrapa al lector**: pin ≤ 2.5 pantallas (test
  unitario) y contenido cambiando mientras dura.
- **Solo `transform`, `opacity`, `clip-path`, `stroke-dashoffset`** en
  animaciones continuas. Nada de `width`/`height`/`top`/`margin`.
- **`ScrollSmoother` descartado**: reescribe el contenedor de scroll, rompe el
  fondo 3D (`position: fixed`) y el ajuste de anclas (`src/js/scrollFix.js`),
  y no aporta a la lectura.
- **`from()` y el CSS que oculta**: si el CSS deja un elemento en
  `opacity: 0`, `gsap.from(el, {autoAlpha: 0})` lee ese 0 como valor final y
  anima 0 → 0. Con estado inicial oculto por CSS usa siempre `fromTo()`.
- **`settle()` borra TODO el `style` inline** (incluidas variables CSS
  `--x`). No pongas valores de layout en `style={{...}}` de un elemento con
  `data-reveal`; usa clases estáticas.
- **No fijar nodos que React posee**: `pin` mete un `pin-spacer` alrededor y
  React fallaría al quitar/insertar ese nodo. Se fija siempre un contenedor
  que renderiza Astro (la escena del manifiesto, cada `[data-hscroll]` de
  Proyectos) y solo se anima su interior.
- **Una escena fijada no crece**: el riel muestra como máximo 6 tarjetas
  (`RAIL_LIMIT`) y mide su recorrido en el DOM con el tope de
  `MOTION.hscroll.maxScreens` (2.5 pantallas). Lo que crece con los datos (el
  índice de «Ver N más») va FUERA del contenedor fijado.
- **Un trigger por escena, no por card**: el riel mueve toda la tira desde UN
  `onUpdate` y lee la geometría de las cards al refrescar, no por frame.
  `[data-parallax-img]` (un `ScrollTrigger` por imagen) queda para pocas cards;
  la cortina `[data-mask]` es barata (un `IntersectionObserver`) y sí va en
  cada card. Las imágenes de una card entran enteras: sin `scale` ni deriva.
- **Seguir al cursor con `quickTo`**, nunca un `gsap.to` por `pointermove`:
  `peek.ts` crea tres `quickTo` por fila (x, y, rotación) y la caja de la fila se
  mide una vez al entrar. Solo con `(hover: hover) and (pointer: fine)`; en
  táctil la fila lleva miniatura.
- **La puerta de la introducción no puede esconder el sitio**: es una capa fija sobre el DOM completo (que queda debajo, con `inert`), la pone una clase de `<html>` (`intro-on`) que añade un script en línea ANTES del primer pintado (`INTRO_GATE_SCRIPT`, con hash en el CSP) y solo existe con JS, movimiento permitido, sin ancla en la URL y sin la preferencia «ir directo». Si el motor no arranca en 5 s la clase se quita sola. El hero espera al evento `intro:open` (`hero.ts`); tras el Big Bang aparece de golpe y tras «saltar» entra como siempre.
- **`quickSetter` en un solo callback del `ticker`, no tweens por evento**: el estado de ánimo de la partícula (`energy`) se suaviza en `intro.ts` y escribe escala, brillo y calor cada frame; el cursor solo cambia el objetivo.
- **Imágenes `lazy` dentro de una tira recortada y trasladada**: el navegador
  solo las pide cuando de verdad se ven y la card se abriría sobre un marco
  gris. El riel las pasa a `eager` cuando él mismo está cerca (no al cargar la
  página).
- **Bajo 768 px (o con menos de 700 px de alto) el riel no se fija**: es una
  fila nativa con `snap`. La media query vive en `rails.ts` (`RAIL_QUERY`) y en
  `app.css`: mantenerlas iguales.
- **Una isla `client:visible` nunca puede pintar `null` en el servidor**: Astro
  observa los *hijos* de la isla (es `display: contents`) y una isla sin hijos
  nunca se hidrata. Siempre se pinta algo (un esqueleto).
- **Cuidado con `clearProps` sobre transformaciones compartidas**: limpiar
  `scale` borra todo el `transform` (también el parallax `yPercent`). En
  marcos con máscara solo se limpia `clipPath`.
- **El hero y el CSS que oculta, otra vez**: no ocultes con `transform`
  desde CSS (GSAP lee ese `translateY(115%)` como `y` en px y la entrada se
  queda desplazada). Oculta con `opacity: 0` y deja que GSAP ponga el
  movimiento (`yPercent`).
- **Elementos montados por React después de hidratar** (diálogos, listas con
  datos) se animan al instante; solo lo que está en una isla recién viva
  espera `HYDRATION_SETTLE_MS` (`isHydrating()` en `core.ts`).
- **Nada de `fetch` en el primer render**: las secciones de abajo piden sus
  datos desde el navegador cuando su isla (`client:visible`, con
  `rootMargin`) está cerca (`lib/projectsStore.ts` comparte la petición).
- **Medidas del DOM, no constantes**: pila, vuelo de habilidades y
  anclas calculan distancias de los nodos reales (`scrollWidth`, rects); los
  topes (2.5 pantallas) son los únicos números fijos.
- **Después de cambiar la altura de la página** (islas, imágenes lazy,
  fuentes) el motor llama a `ScrollTrigger.refresh()`.
- **React**: si una isla necesita GSAP propio, crear `gsap.context()` en un
  `useEffect` y devolver `ctx.revert()`; pero antes pregúntate si basta con un
  atributo de datos y una escena del motor.

## 7. Recetas

```ts
// 1) Animar solo si el usuario lo permite
const stop = withMotion(({ gsap }) => {
  gsap.from(".card", { autoAlpha: 0, y: 24, stagger: 0.09 });
}); // stop() revierte todo

// 2) Escena fijada y escrubada
const tl = gsap.timeline({
  defaults: { ease: "none" },
  scrollTrigger: {
    trigger: section,
    start: "top top+=72",
    end: () => `+=${innerHeight * 2}`,
    pin: true,
    scrub: 1,
    anticipatePin: 1,
    invalidateOnRefresh: true,
  },
});
tl.fromTo(words, { opacity: 0.14 }, { opacity: 1, stagger: 0.18 });

// 3) Título con máscara de líneas
SplitText.create(title, {
  type: "lines",
  mask: "lines",
  autoSplit: true,
  onSplit: (self) =>
    gsap.from(self.lines, { yPercent: 110, stagger: 0.1, ease: "power4.out" }),
});

// 4) Lotes: las cards que entran juntas se encadenan
ScrollTrigger.batch(".card", {
  start: "top 90%",
  once: true,
  onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, stagger: 0.09 }),
});

// 5) Seguir el cursor sin saturar (un setter reutilizable)
const x = gsap.quickTo(cursor, "x", { duration: 0.4, ease: "power3" });
addEventListener("pointermove", (e) => x(e.clientX));

// 6) Velocidad del scroll -> velocidad de una cinta
ScrollTrigger.create({
  onUpdate: (self) =>
    gsap.to(tween, { timeScale: self.direction * (1 + Math.abs(self.getVelocity()) / 450) }),
});
```

## 8. Antes de animar algo nuevo

1. ¿Ya lo cubre una escena del motor? (sección 1 y `UI_STANDARDS.md` 7.7)
2. ¿Qué pasa con `prefers-reduced-motion: reduce`? (debe verse completo)
3. ¿Qué pasa sin JS? (debe verse completo)
4. ¿Solo anima propiedades baratas?
5. ¿Hay algo que cambie mientras dura una escena fijada?
6. ¿Funciona en móvil (menos distancia, menos pantallas)?
