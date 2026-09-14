# `astro/zod`

Referencia oficial: https://docs.astro.build/en/reference/modules/astro-zod/

## Qué es

`astro/zod` es un re-export de Zod v4 que Astro trae incluido — mismo `z`
que usan internamente Content Collections y Actions. Usarlo evita instalar
Zod por separado y garantiza que el schema-builder que usa la app sea
siempre exactamente el mismo que usa Astro por dentro.

## Estado actual en el proyecto

Verificado contra el código instalado, no asumido:

- `node_modules/astro/dist/zod.js` re-exporta literalmente `zod/v4`:
  ```js
  import * as mod from "zod/v4";
  export * from "zod/v4";
  export { mod as z };
  ```
- El proyecto **ya está en Zod v4** (migrado en el bloque de fixes
  anterior: `package.json` tiene `"zod": "^4.6.5"`), usado en 3 archivos:
  `src/schemas/contactSchema.ts`, `src/schemas/opinionsSchema.ts`,
  `src/types/currentLang.interface.ts` (este último solo `import type`).
- Astro mismo depende de `zod: ^4.5.4` (su propio `package.json`). El rango
  del proyecto (`^4.6.5`) cae dentro de lo que Astro acepta — hoy, con un
  gestor de paquetes que dedupe correctamente, es casi seguro que ya
  comparten una sola copia física de Zod en `node_modules`. `astro/zod` no
  cambia el comportamiento en runtime hoy; lo que hace es **eliminar la
  posibilidad** de que eso deje de ser cierto en una actualización futura
  donde los rangos ya no se solapen.

## Veredicto

**Adoptar ahora — cambio de bajo riesgo, una dependencia menos.**

```diff
- import { z } from "zod";
+ import { z } from "astro/zod";
```

En los 3 archivos listados arriba. Después, quitar `"zod": "^4.6.5"` de
`package.json` — sigue disponible transitivamente vía `astro`, que ya es
dependencia directa del proyecto.

### Por qué es seguro

- `zodResolver` de `@hookform/resolvers` (usado en `Form.tsx` y
  `sendOpinions.tsx`) recibe el schema, no importa el paquete — como
  `astro/zod` re-exporta el mismo `zod/v4` físico, el schema resultante es
  indistinguible del que se construye hoy con `import { z } from "zod"`.
- No hay cambio de API: es el mismo Zod v4 clásico que ya se usa (`.min()`,
  `.max()`, `z.email()`, todo igual).

### Verificación antes de mergear

`pnpm exec astro check` (0 errores esperados, mismo criterio usado en los
fixes anteriores) + confirmar que `Form.tsx` y `sendOpinions.tsx` siguen
validando igual (cubierto por `tests/e2e/comment-widget.spec.ts` para el
flujo de opiniones; el form de contacto no tiene test e2e propio todavía —
ver [08-testing-strategy.md](08-testing-strategy.md)).

## Referencias cruzadas

- [08-testing-strategy.md](08-testing-strategy.md) — el unit test de `contactSchema`/`opinionsSchema` planeado ahí es el lugar natural para confirmar este cambio no rompe validación.
