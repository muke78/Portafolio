# View Transitions (`<ClientRouter />`)

Referencia oficial: https://docs.astro.build/en/reference/modules/astro-transitions/
Guía completa: https://docs.astro.build/en/guides/view-transitions/

## Qué es

`<ClientRouter />` (importado de `astro:transitions`) convierte la
navegación normal del navegador (full page load) en navegación
client-side-router: intercepta clicks en links internos, pide el HTML
nuevo por fetch, y hace un morph del DOM viejo al nuevo usando la View
Transitions API nativa del navegador — con eso vienen animaciones de
transición configurables (`fade`, `slide`, o custom) y persistencia de
estado entre navegaciones vía `transition:persist`. Es opt-in por página
(se agrega el componente en el `<head>` de cada página donde se quiera).

## Estado actual en el proyecto

Grep de `ClientRouter`, `astro:transitions`, `view-transition` en todo
`src/`: **cero resultados**. No se usa en ningún lado.

El sitio tiene muy pocas navegaciones "de verdad" (documento nuevo, no
ancla): la app es casi toda una sola ruta (`/[lang]/home`) con secciones
por ancla (`#contact`, `#opinions`, etc.), más `/admin/login` → `/admin`.
Los dos casos reales donde `<ClientRouter />` cambiaría algo perceptible:

1. **Cambio de idioma** (`LangDrop.tsx`): hoy es un
   `window.location.href = "/${lang}/${restOfPath}${search}${hash}"` —
   full page reload literal, confirmado leyendo el archivo. Es exactamente
   el flujo donde el bug de anclas reportado por el usuario vivía (recorrer
   `#contact` en un idioma, cambiar de idioma, aterrizar en la sección
   equivocada) — ya arreglado por `src/js/scrollFix.js`, pero el fix está
   pensado para full page load, no para una navegación morfeada por
   `<ClientRouter />`.
2. **Login → dashboard admin**: `/admin/login` redirige a `/admin` tras un
   login exitoso — hoy también full reload.

## Veredicto

**Solo evaluar, no adoptar todavía.** Hay valor real (transición más suave
en el cambio de idioma, sensación más "app" en vez de "sitio con
reloads"), pero el riesgo concreto es específico y ya identificado: el fix
de anclas que se acaba de hacer y verificar en vivo depende de cómo se
comporta el navegador en una carga de documento completa
(`ResizeObserver` reaccionando mientras el layout se estabiliza). Meter un
router client-side encima cambia el ciclo de vida de esa navegación —
scroll, timing de hidratación de islas, cuándo corre el script de
`scrollFix.js` — y no hay garantía de que siga funcionando igual sin
volver a probarlo a fondo.

### Por qué esperar

- La cobertura de regresión para exactamente este flujo
  (`tests/e2e/language-switch.spec.ts`, `tests/e2e/anchor-scroll.spec.ts`)
  está **escrita pero nunca ejecutada de verdad** — bloqueada en este
  sandbox por no poder descargar el binario de Chromium
  (`docs/05-estrategia-testing.md`). Tocar `<ClientRouter />` sin haber
  corrido esa suite ni una sola vez, ni antes ni después del cambio, es
  descartar la única red de seguridad que existe justo para este bug.
- No hay todavía navegación real entre "páginas" con contenido distinto que
  se beneficie de una transición vistosa — el login admin es el único caso
  limpio hoy.

### Plan concreto (cuando se retome)

1. Primero, correr la suite de Playwright real (`pnpm exec playwright
   install chromium && pnpm test:e2e`) en una máquina con red, y confirmar
   que los 5 specs actuales pasan en verde como baseline.
2. Pilotar `<ClientRouter />` **solo** en `/admin/login` → `/admin` — cero
   interacción con anclas, cero interacción con el cambio de idioma, y es
   la navegación real más simple del sitio. Volver a correr la suite.
3. Si eso se sostiene, evaluar `LangDrop.tsx` — ahí sí, correr
   específicamente `language-switch.spec.ts` y `anchor-scroll.spec.ts`
   repetidas veces (no solo una pasada) antes de dar por bueno el cambio,
   por ser justo el escenario donde ya hubo un bug real reportado por el
   usuario.
4. Si `<ClientRouter />` se adopta en el flujo de idioma, revisar si
   `transition:persist` puede simplificar algo de `scrollFix.js` (por
   ejemplo, persistir el scroll o el estado del tema entre navegaciones) —
   evaluarlo ahí, no antes, cuando ya se sepa cómo se comporta en este
   proyecto específico.

## Referencias cruzadas

- [08-testing-strategy.md](08-testing-strategy.md) — la suite que tiene que estar corriendo en verde antes de tocar esto.
- `docs/05-estrategia-testing.md` — estado del bloqueo de Playwright en sandbox.
