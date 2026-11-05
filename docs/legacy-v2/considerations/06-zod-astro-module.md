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
- El proyecto usa Zod v4 (`package.json`: `"zod": "^4.6.5"`), en 3
  archivos: `src/schemas/contactSchema.ts`, `src/schemas/opinionsSchema.ts`,
  `src/types/currentLang.interface.ts` (este último solo `import type`).
- Solo hay **una** copia física de `zod` en `node_modules` (confirmado con
  `find node_modules -maxdepth 2 -iname zod` — un único directorio, hoisted,
  4.6.5). No hay dos instalaciones compitiendo.

## Veredicto: **NO adoptar — bloqueador real, encontrado al probarlo, no supuesto**

El intento real de migrar (los 3 imports a `import { z } from "astro/zod"`,
`pnpm exec astro check`) rompió el type-check con un error genuino en los
dos formularios que usan `zodResolver`:

```
src/features/contact/Form.tsx:31:25 - error ts(2769): No overload matches this call.
  ...
  The types of '_zod.version.minor' are incompatible between these types.
    Type '6' is not assignable to type '0'.
```

Mismo error en `sendOpinions.tsx:49:25`. La causa: aunque en runtime sigue
siendo la misma librería Zod v4 (una sola copia física en disco, confirmado
arriba), `astro/zod` reexporta el **subpath explícito** `zod/v4`, mientras
`import { z } from "zod"` usa la **entrada clásica por default** del
paquete — Zod publica declaraciones de tipos (`.d.ts`) distintas para cada
una, con un marcador interno de versión (`_zod.version.minor`) que no
coincide entre las dos. `@hookform/resolvers`'s `zodResolver()` hace
overload resolution contra ese marcador — con el subpath `zod/v4` deja de
encontrar un overload válido. Esto es un detalle de tipos de Zod/
`@hookform/resolvers`, no de Astro; documentado aquí porque es exactamente
donde se manifiesta en este proyecto.

**La sección "Por qué es seguro" de la versión anterior de este doc
estaba mal** — asumía que "misma librería en runtime" implicaba "mismos
tipos", y no lo comprobó contra `@hookform/resolvers` antes de dar el
veredicto. Quedó corregido apenas se probó de verdad.

### Cuándo reconsiderar

- Si `@hookform/resolvers` en una versión futura deja de depender de ese
  marcador interno de versión (o lo soporta para ambos subpaths).
- Si en algún momento se deja de usar `zodResolver`/`react-hook-form` para
  estos dos forms.
- Si Zod publica unifica las declaraciones de tipos entre su entrada
  clásica y `zod/v4` explícito.

Ninguna de las tres es el caso hoy. `zod` se queda como dependencia directa
del proyecto (`^4.6.5`), sin cambios.

### Verificación

`pnpm exec astro check` — con `astro/zod` da 2 errores reales (arriba);
revertido a `import { z } from "zod"` en los 3 archivos, vuelve a 0 errores.
`pnpm test:unit` (34/34) confirma que los schemas en sí siguen validando
igual con el import original.

## Referencias cruzadas

- [08-testing-strategy.md](08-testing-strategy.md) — los unit tests de `contactSchema`/`opinionsSchema` (`tests/unit/`) son los que corrieron para confirmar que revertir no cambió el comportamiento de validación.
