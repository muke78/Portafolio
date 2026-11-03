# Seguridad del portafolio

El repositorio y el sitio son **públicos**, y el sitio es la única puerta que ve
Internet: guarda el token del backend y reenvía los dos formularios (comentarios
y contacto). Este documento resume cómo se protege y cómo se prueba.

## Modelo de amenazas

| Activo | Riesgo | Control |
|---|---|---|
| Token del backend (`API_SECRET_TOKEN`) | Filtración al navegador, al repo o a los logs | Secreto de servidor (`astro:env`), prueba de que solo vive en rutas de servidor, escáner del bundle del cliente, cliente único con `fetch` (`src/lib/api.ts`) cuyo error lleva solo el estado HTTP, y logs que imprimen solo el mensaje |
| Backend (D1) | Que alguien lo escriba saltándose el sitio | El token solo lo conoce el Worker del sitio; el backend valida y limita por su cuenta |
| Formularios públicos | Spam, CSRF, cuerpos enormes o malformados | Origen, `Content-Type: application/json`, tope de 10 KB, validación Zod, límite de 5 peticiones por minuto |
| Visitantes | XSS, clickjacking, sniffing | Cabeceras de seguridad, sin `innerHTML`, `rel="noopener"` |
| Cadena de suministro | Dependencias vulnerables, secretos en commits | `pnpm audit` en el CI, Dependabot, dependency review, gitleaks, CodeQL |

## Proxy `/api/*` (`src/pages/api/`)

Orden de las comprobaciones en los POST, de la más barata a la más cara:

1. **Recurso permitido**: lista cerrada (`READABLE` / `WRITABLE_PUBLIC`).
2. **Mismo origen** (`src/lib/requestGuards.ts`): `Origin` distinto del sitio o
   `Sec-Fetch-Site: cross-site` → 403.
3. **Límite de peticiones** por IP.
4. **`Content-Type: application/json`** (415) y **tope de 10 KB** (413), medido
   sobre el texto real y no sobre `Content-Length`.
5. **Validación con el mismo esquema Zod del formulario** (400). Solo los campos
   conocidos se reenvían al backend.
6. Llamada al backend con el token. Si falla, la respuesta es genérica (503):
   nunca se devuelve el error del backend.

En los GET, `currentLocale` se codifica antes de pasarlo al backend.

## Cabeceras (`src/lib/securityHeaders.ts`, `public/_headers`)

Las respuestas dinámicas las completa `src/middleware.ts`; los archivos
estáticos, `public/_headers`. Una prueba compara ambas listas.

`Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options: DENY`,
`Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy` y un CSP
**parcial** (`frame-ancestors`, `base-uri`, `object-src`, `form-action`).

### CSP con hashes (`security.csp` de Astro)

Las páginas SSR llevan un `Content-Security-Policy` completo, generado por Astro en
cada build:

- `script-src` y `style-src` con el **hash** de cada `<script>` y `<style>` que
  genera Astro, más los de los dos `<script is:inline>` del Layout (el motion gate y
  el tema, de `src/lib/inlineScripts.ts`, cuyo hash calcula `astro.config.mjs` del
  mismo texto). No hay `unsafe-inline` en scripts ni en etiquetas `<style>`.
- Los atributos `style=""` (Astro, React y GSAP los ponen) no se pueden hashear:
  solo ellos llevan `style-src-attr 'unsafe-inline'`. No ejecutan código.
- `img-src` permite el bucket de R2 (`PUBLIC_MEDIA_URL`), `go-skill-icons.vercel.app`
  (tecnologías) y `cdn.jsdelivr.net` (banderas); `connect-src 'self'`,
  `frame-src 'none'`, `base-uri`, `object-src`, `frame-ancestors` y `form-action`.
- **Avisos:** `react-hot-toast` inyectaba su CSS en una etiqueta `<style>` en tiempo
  de ejecución, algo que un CSP con hashes no admite; se reemplazó por
  `src/components/Toaster.tsx`, que solo usa clases de Tailwind.

Verificación (en un navegador, contra `build` + `preview`, porque Astro no aplica el
CSP en `dev`): 13 islas hidratadas, fondo 3D, movimiento y tema funcionando, sin
violaciones en la consola; una imagen de otro origen, un `<script>` inyectado y un
`<style>` inyectado se bloquean. **Si agregas un origen nuevo** (otra CDN, un
analítico), va en `security.csp.directives` de `astro.config.mjs`; si no, el
navegador lo bloquea. Un build local con `NODE_ENV=development` en el `.env` compila
React en modo desarrollo y no sirve para esta prueba: quítalo del `.env`.

## Pruebas (`tests/unit/security/`)

- `proxy.test.ts`: CSRF, tipo y tamaño del cuerpo, validación, campos
  reenviados, que el token nunca salga en una respuesta (ni con el backend
  caído), consulta codificada y límite de peticiones.
- `headers.test.ts`: cabeceras en toda respuesta (incluida la 404), valores
  mínimos y paridad con `public/_headers`.
- `hygiene.test.ts`: sin secretos en el código, token solo en servidor,
  sin sumideros de XSS, enlaces con `noopener`, workflows con permisos mínimos
  y sin `pull_request_target`.
- `bundleSecrets.test.ts`: el escáner de `scripts/check-bundle-secrets.mjs`.

## CI (`.github/workflows/`)

- `checks.yml` (reutilizable): Biome, tipos, Vitest con cobertura, build,
  **escaneo de secretos en `dist/client`** y `pnpm audit --prod`
  (informativo en `dev`, obligatorio en `main`).
- `security.yml`: CodeQL, gitleaks, dependency review y auditoría semanal.
- `dependabot.yml`: PRs semanales agrupados hacia `dev`.

## Configuración que vive en GitHub y Cloudflare (no en el repo)

- Rulesets de `main` y `dev` con los checks obligatorios.
- Dependency graph y Dependabot alerts activados; secret scanning con push
  protection.
- Worker `portafolio`: rama de producción `main`, builds de otras ramas
  apagados; `VITE_API_URL` como variable de build (opcional: `astro.config.mjs`
  trae un valor por defecto, porque es una URL pública) y `API_SECRET_TOKEN` como
  secreto.

## Qué no cubre

- `style-src-attr 'unsafe-inline'` (ver arriba): un atributo `style=""` inyectado no se bloquea.
- Limitación distribuida: el límite del proxy es en memoria (un contador por
  instancia del Worker); la limitación real y compartida la hace el backend.
- Pruebas de carga o denegación de servicio.
