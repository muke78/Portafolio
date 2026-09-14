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

## Dónde vivirían los tests

```
tests/
  e2e/
    anchor-scroll.spec.ts
    language-switch.spec.ts
    admin-login.spec.ts
    comment-widget.spec.ts
    i18n-routing.spec.ts
  unit/
    contactSchema.test.ts
    opinionsSchema.test.ts
```

## Siguiente paso

Esto es planeación — si quieres que lo instale y deje los primeros 5 tests
de la lista de arriba funcionando ahora mismo (corriendo contra lo que ya
está en `dev`), lo hago en su propia rama, aparte de todo lo de Hono/Turso
que sí está pendiente de que construyamos el backend nuevo primero.
