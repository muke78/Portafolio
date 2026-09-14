# Testing: Vitest + Playwright + Nightwatch

Guía oficial: https://docs.astro.build/en/guides/testing/

## Qué dice la guía, exacto

La guía de Astro separa testing en dos capas y dice explícito cuál
herramienta recomienda para cada una:

- **Unit / integration tests → Vitest.** Framework nativo de Vite, con un
  helper propio de Astro (`getViteConfig()`, exportado desde
  `astro/config`) para que `vitest.config.ts` use la misma config de Vite
  que el proyecto (alias, plugins, todo) sin duplicarla.
- **End-to-end tests → Playwright** es la opción que la guía recomienda
  primero; **Nightwatch.js** aparece listado como alternativa, con su
  propio CLI de instalación (`pnpm create nightwatch`). No hay un producto
  separado llamado "Astro test" — `astro check` es solo chequeo de tipos,
  no un test runner.

Verificado contra lo instalado: `node_modules/astro/dist/config/index.d.ts`
exporta `getViteConfig(userViteConfig, inlineAstroConfig?)` — existe tal
cual la guía lo describe, en la versión de Astro que usa este proyecto
(7.3.1).

## Estado actual en el proyecto

- **Playwright: instalado y con specs escritos**, pero nunca ejecutado de
  verdad. `package.json` tiene `@playwright/test: ^1.63.0`,
  `playwright.config.ts` existe, y 5 specs en `tests/e2e/` (anchor-scroll,
  language-switch, admin-login, comment-widget, i18n-routing) — todos
  verificados por `tsc --noEmit`, ninguno corrido contra un browser real.
  Bloqueado en este sandbox: `pnpm exec playwright install chromium`
  falla por no tener ruta de red a `cdn.playwright.dev` (confirmado con
  reintento y timeout explícito, no es un problema de configuración).
- **Vitest: no instalado.** `grep "vitest" package.json` → sin resultados.
  Cero tests unitarios en todo el proyecto.
- **Nightwatch: no instalado**, y no se había evaluado hasta este doc.

## Veredicto

**Adoptar Vitest ahora. Mantener Playwright como está. Descartar
Nightwatch explícitamente.**

### Por qué no Nightwatch

La guía no presenta a Nightwatch como un complemento de Playwright — lo
presenta como una alternativa, en la misma sección, con el mismo propósito
("test automation framework... across the web, built-in support for all
major browsers"). Ambos son frameworks de e2e que manejan un browser real.
Correr los dos significa:

- Mismos 5 escenarios (o similares) escritos dos veces, en dos DSLs
  distintas, para verificar exactamente lo mismo.
- Dos instalaciones de binarios de browser, dos configuraciones de
  `webServer`/CI, doble tiempo de pipeline.
- Cero cobertura nueva — un bug que Playwright no detecta porque el
  escenario no está escrito, tampoco lo va a detectar Nightwatch a menos
  que se escriba el mismo escenario ahí también, y en ese punto ya no es
  "tener dos frameworks", es "tener un escenario sin cubrir", que se
  arregla agregando el test en el framework que ya existe.

No hay ningún caso de uso de este proyecto (sitio de portafolio +
panel admin de un solo usuario) que necesite algo que Nightwatch tenga y
Playwright no. Se descarta.

### Por qué Vitest sí, y ahora

Es la única capa de testing que falta por completo, y cubre justo lo que
Playwright no puede cubrir bien: lógica pura, aislada, sin necesidad de un
browser — rápida de correr, rápida de iterar mientras se escribe código.
Auditoría de candidatos reales en el proyecto (no genérico, archivos
concretos que ya existen):

| Archivo | Por qué es buen candidato a unit test |
|---|---|
| `src/schemas/contactSchema.ts`, `src/schemas/opinionsSchema.ts` | Validación pura de Zod — ya mencionados como pendiente en `docs/05-estrategia-testing.md`, y el lugar exacto para confirmar que la migración a `astro/zod` (doc 06) no cambia el comportamiento |
| `src/lib/adminSession.ts` | `buildSessionToken`/`verifySessionToken`/`revokeSessionToken` — lógica de seguridad (HMAC, expiración, revocación), 100% pura, cero red, y es justo el tipo de código donde un bug es grave y silencioso |
| `src/lib/rateLimit.ts` | Lógica de límite por IP que ya protege el login admin (cubierta indirectamente por `admin-login.spec.ts` en Playwright, pero ahí depende de estado compartido entre corridas — un unit test aislado prueba la lógica del contador sin ese ruido) |
| `src/i18n/index.ts` (`getI18N`) | Resolución de locale + fallback — usado en cada página y componente, un bug ahí rompe todo el sitio en silencio si no hay test |

### Configuración concreta

```ts
// vitest.config.ts
import { getViteConfig } from "astro/config";

export default getViteConfig({
  test: {
    include: ["tests/unit/**/*.test.ts"],
  },
});
```

```json
// package.json
"scripts": {
  "test:unit": "vitest run",
  "test:unit:watch": "vitest"
}
```

`tests/unit/` como carpeta hermana de `tests/e2e/` (ya existente) — misma
convención, mismo `tsconfig.json` ya incluye `tests/**/*.ts` así que no
hace falta tocarlo.

### Los tres, juntos: qué corre cuándo

- **Vitest**: en cada guardado durante desarrollo (`test:unit:watch`) y en
  CI en cada push — rápido, no necesita browser.
- **Playwright**: en CI antes de mergear a `dev`, y localmente antes de un
  cambio que toque navegación/UI (justo el caso de doc 07,
  View Transitions) — necesita el browser real instalado, que en este
  sandbox sigue bloqueado; hay que correrlo en una máquina o CI con red.
- **Nightwatch**: no se instala.

## Referencias cruzadas

- `docs/05-estrategia-testing.md` — estado real de Playwright, bloqueo de sandbox documentado ahí primero.
- [06-zod-astro-module.md](06-zod-astro-module.md) — el cambio que el unit test de los schemas debe confirmar.
- [07-view-transitions.md](07-view-transitions.md) — por qué esta suite tiene que estar corriendo en verde antes de ese cambio.
