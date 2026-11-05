# Arquitectura

Todo el sistema vive en **Cloudflare**. Son tres repositorios que se hablan por
HTTP; ninguno comparte código con otro.

| Repositorio | Qué es | Dónde corre |
|---|---|---|
| `Portafolio` (este) | Sitio público: Astro SSR + islas de React | Cloudflare Workers (`portafolio`) |
| `Backend_Portafolio` | API de contenido: Hono + Drizzle | Cloudflare Workers (`backend-portafolio`) |
| `Portafolio_admin` | CMS privado de un solo usuario | Cloudflare Workers (`portafolio-admin`), tras Cloudflare Access |

Los datos viven en **Cloudflare D1** (SQLite) y las imágenes en **Cloudflare R2**,
ambos accesibles solo desde el backend.

## Flujo de una petición

```
 Visitante                                   Editor (Erick)
     │                                             │
     ▼                                             ▼
┌──────────────┐                          ┌──────────────────┐
│  Portafolio  │                          │ Portafolio_admin │  ← Cloudflare Access
│  Astro SSR   │                          │   Astro + React  │
└──────┬───────┘                          └────────┬─────────┘
       │ /api/*  (proxy en el servidor,            │ Service Binding BACKEND
       │  agrega el bearer token)                  │ (o URL pública en local)
       ▼                                           ▼
            ┌────────────────────────────────────────┐
            │   Backend_Portafolio  (Hono, Workers)  │
            └──────┬───────────────────────┬─────────┘
                   ▼                       ▼
            ┌─────────────┐        ┌───────────────┐
            │ Cloudflare  │        │  Cloudflare   │
            │     D1      │        │      R2       │
            └─────────────┘        └───────────────┘
```

- El navegador **nunca** habla con el backend. Todo pasa por las rutas `/api/*`
  de Astro, que corren en el servidor y agregan `Authorization: Bearer
  <API_SECRET_TOKEN>` antes de reenviar. El único archivo que importa ese token
  es `src/lib/api.ts`.
- Las imágenes se piden directo al bucket de R2 (`PUBLIC_MEDIA_URL`), a través de
  `src/lib/media.ts`. El sitio no pasa por el backend para leerlas.
- El sitio lee contenido; el único contenido que escribe un visitante son los
  **comentarios** y los **mensajes de contacto**. Todo lo demás se edita desde
  el CMS.

## Este repositorio

### Rutas

| Ruta | Qué hace |
|---|---|
| `/[lang]/home` | Página única: hero, manifiesto, experiencia, proyectos, comentarios y contacto |
| `/[lang]/project/[id]` | Detalle de un proyecto |
| `/api/[resource]` | Proxy: `GET` de `projects`, `experiences`, `comments`, `about`, `education`, `skills`; `POST` solo de `comments` |
| `/api/contact-messages` | `POST` del formulario de contacto |
| `/robots.txt`, `/llms.txt` | Generados por código (`src/pages/*.ts`) |

Idiomas: `es` (por defecto), `en` y `fr`, en `src/i18n/locales/*.json`. El
middleware valida el idioma de la URL.

### Contenido que viene del CMS

Dos bloques se editan desde el admin y el sitio los trae del backend al
renderizar:

- **Textos del sitio** (`src/lib/siteCopy.ts`): foto y presentación del hero,
  frase del manifiesto, descripción para buscadores y el **PDF del currículum**
  (clave `cv_pdf`; el botón «Ver CV» de `Header.astro` lo abre desde R2 y se oculta si no
  hay PDF). Se guardan 60 s en memoria y la petición espera como máximo 2 s.
- **Datos de contacto** (`src/lib/siteContact.ts`): GitHub, LinkedIn, teléfono y
  correo.

Los dos tienen **respaldo**: si el backend no responde o devuelve algo que no
pasa el esquema, se usa el último valor bueno y, si no hay, los archivos de idioma
y la foto estática del repo. El sitio no se cae por una falla del backend.

### Seguridad

- **Rutas públicas con guardias** (`src/lib/requestGuards.ts`): mismo origen,
  `application/json` y tope de tamaño. Validación con Zod en cliente y servidor
  (`src/schemas/`).
- **Límite de peticiones** en memoria (`src/lib/rateLimit.ts`): 5 escrituras por
  minuto en `comments`. El backend tiene el suyo.
- **Errores genéricos:** nunca se devuelve ni se registra el error crudo del
  backend; un `ApiError` lleva solo el estado HTTP.
- **Cabeceras y CSP:** salen de `src/lib/securityHeaders.ts` y deben coincidir
  con `public/_headers`. La CSP usa hashes (`security.csp` de Astro). Detalle y
  pruebas en [`SECURITY.md`](./SECURITY.md).
- **Secretos fuera del bundle:** `scripts/check-bundle-secrets.mjs` falla el CI si
  el JavaScript del cliente contiene algo que parezca un secreto.

### Animación

Un motor de scroll con GSAP y ScrollTrigger en `src/lib/motion/`. El HTML solo
lleva atributos `data-*`; no se usa `gsap.*` suelto en componentes. Reglas en
[`UI_STANDARDS.md`](./UI_STANDARDS.md) y referencia en [`GSAP.md`](./GSAP.md).

## Variables de configuración

| Variable | Tipo | Para qué |
|---|---|---|
| `VITE_API_URL` | Pública, de **build** | URL base del backend |
| `SITE_URL` | De build | Canónicos, sitemap y `robots.txt` |
| `PUBLIC_MEDIA_URL` | Pública | Origen del bucket de R2 |
| `API_SECRET_TOKEN` | **Secreto** de runtime | Bearer del backend (`wrangler secret put` o el panel) |

Las URLs viven en **una sola variable cada una**; al comprar un dominio solo
cambian estas.

## Calidad y entrega

- **Pruebas:** Vitest (unitarias y de seguridad en `tests/unit/`) y Playwright
  (`tests/e2e/`). Estrategia en [`05-estrategia-testing.md`](./05-estrategia-testing.md).
- **Estilo:** Biome (formato y lint). **Tipos:** `astro check` en 0 errores.
- **CI (GitHub Actions):** `ci-dev.yml` valida los PR a `dev` (Biome, tipos,
  Vitest, build); `ci-main.yml` valida los PR a `main` (lo mismo + Playwright);
  `security.yml` corre CodeQL, gitleaks, la revisión de dependencias nuevas y una auditoría semanal.
- **Despliegue:** la integración Git de Cloudflare publica al hacer push a
  `main`. Los **secretos** de runtime no se despliegan: se cargan aparte.
- **Ramas y versiones:** una rama por cambio, creada desde `dev`, que llega por
  Pull Request. `main` solo recibe `dev` mediante un PR de release. Cada ronda
  termina con un tag `vX.Y.Z` y un GitHub Release, y un bump de `package.json`
  en `chore/release-vX.Y.Z`. Reglas completas en [`../AGENTS.md`](../AGENTS.md).

## Documentos de esta carpeta

- [`UI_STANDARDS.md`](./UI_STANDARDS.md): sistema de diseño (fuente de verdad de UI).
- [`GSAP.md`](./GSAP.md): referencia del motor de animación.
- [`SECURITY.md`](./SECURITY.md): cabeceras, CSP, pruebas y pendientes de seguridad.
- [`05-estrategia-testing.md`](./05-estrategia-testing.md): estrategia de pruebas.
- [`DocsCommiter.md`](./DocsCommiter.md): formato de commits.
- [`legacy-v2/`](./legacy-v2/README.md): documentación del stack anterior
  (Vercel + Turso), conservada como historial.
