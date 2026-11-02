# Estrategia de testing

Preguntaste si existe Playwright para Astro y si hay algo llamado
"Astro test". Respuesta corta: Playwright sí, funciona muy bien con Astro
y es lo que recomienda la documentación oficial para end-to-end. No existe
un producto separado llamado "Astro test" — lo que sí existe es
`astro check` (que ya usa este proyecto), pero eso es **chequeo de tipos**,
no un test runner: no ejecuta el sitio ni verifica comportamiento, solo que
el código compile sin errores de tipos. Para comportamiento real hacen
falta pruebas de verdad, con dos capas:

- **Vitest** — unit/integration tests: funciones sueltas (schemas de Zod,
  utilidades), y componentes React en aislado.
- **Playwright** — end-to-end: el sitio completo corriendo, en un navegador
  real, verificando lo que ve un visitante.

Dado todos los bugs que se arreglaron en esta sesión (scroll de anclas,
cambio de idioma, sesión de admin, widget de comentarios), Playwright es la
prioridad — son justo el tipo de bug que un test de tipos nunca agarra
porque son de comportamiento en el navegador, no de tipos de TypeScript.

## Qué cubrir primero (regresión de lo ya arreglado esta sesión)

1. **Ancla + cambio de idioma**: navegar a `/es/home#contact`, esperar a
   que cargue, verificar que `#contact` quede pegado arriba (offset del
   `scroll-mt`) — cubre el bug de `src/js/scrollFix.js`.
2. **Cambio de idioma preserva la sección**: en `/es/home#opinions`,
   cambiar a inglés desde el selector, verificar que la URL destino sea
   `/en/home#opinions` y que la página aterrice en esa sección.
3. **Login admin**: contraseña incorrecta → 401 + mensaje de error;
   intentos repetidos → 429 (rate limit); `/admin` sin sesión → redirect a
   `/admin/login`.
4. **Widget de comentarios**: abrir con el botón flotante, click afuera lo
   cierra, click adentro no lo cierra, el botón lo abre/cierra.
5. **i18n básico**: `/es/home`, `/en/home`, `/fr/home` cada uno con su
   `<title>` correcto; `/xx/home` (locale inválido) da 404 real.

## Cómo instalarlo

```bash
pnpm create playwright
```

Astro no necesita configuración especial — Playwright apunta al servidor
de dev (`pnpm dev`, puerto 4321) o a un build (`pnpm build && pnpm preview`)
como cualquier sitio. La guía oficial de Astro
(https://docs.astro.build/en/guides/testing/) tiene el setup exacto,
incluyendo el `webServer` de Playwright para que levante `pnpm dev`
automático antes de correr los tests.

Para Vitest (unit tests de los schemas de Zod, por ejemplo):

```bash
pnpm add -D vitest
```

## Estado actual — ya instalado, tests ya escritos

`@playwright/test` ya está en `devDependencies`, con `playwright.config.ts`
en la raíz y los 5 archivos de la lista de arriba en `tests/e2e/`, cubriendo
exactamente los 5 puntos de arriba. Verificados con `tsc --noEmit`
(compilan sin errores) y ya dentro del `include` de `tsconfig.json`.

**Lo único que falta es correrlos**: este entorno donde se escribió el
código no tiene salida de red hacia `cdn.playwright.dev`, así que
`pnpm exec playwright install chromium` falla por timeout aquí — no es un
error del setup, es una restricción de red del sandbox. En tu máquina o en
CI (donde ese host sí es alcanzable) corre:

```bash
pnpm exec playwright install chromium
pnpm test:e2e        # headless
pnpm test:e2e:ui     # con el UI runner de Playwright, para depurar
```

Los tests asumen un `pnpm dev` corriendo en el puerto 4321 (o lo levantan
ellos mismos vía el `webServer` del config) y una sesión admin sin login
previo para el rate limit — si corres `test:e2e` varias veces seguidas
dentro de la misma ventana de 5 minutos, el test de rate limit puede ver el
límite ya activado desde una corrida anterior (está documentado en el
propio test, es el comportamiento correcto del limitador en memoria, no un
bug del test).

## Unit tests — pendiente

Los de `tests/unit/` (schemas de Zod) no se escribieron todavía — quedan
para cuando se sume Vitest, no bloquean nada de lo anterior.
