# Plan: pasar a `khelde.dev`

Qué hay que cambiar, y **dónde**, el día que se compre el dominio. Hoy todo vive en
`workers.dev` y `r2.dev`; ninguna pieza depende del dominio nuevo, así que la compra es
opcional y el cambio es solo de configuración. Este documento es la evidencia para no
olvidar ningún lugar.

> Se escribió **antes** de comprar el dominio. Los nombres de los hostnames nuevos son los
> propuestos; si se elige otro, se ajusta la columna "Después".
>
> **Avance:** ✅ dominio `khelde.dev` comprado · ✅ registrado en Google Search Console ·
> ✅ registrado en Bing Webmaster Tools. Lo tachado (~~así~~) ya está hecho. Falta todo lo
> de Cloudflare (zona activa, Custom Domains, variables) y los enlaces externos.

## Dominios actuales

| Pieza         | Worker / servicio              | URL de hoy                                                          |
| ------------- | ------------------------------ | ------------------------------------------------------------------- |
| Sitio público | Worker `portafolio`            | `https://portafolio.erickm-gonzalez-rivera.workers.dev`             |
| Backend (API) | Worker `backend-portafolio`    | `https://backend-portafolio.erickm-gonzalez-rivera.workers.dev/api` |
| Admin (CMS)   | Worker `portafolio-admin`      | `https://portafolio-admin.erickm-gonzalez-rivera.workers.dev`       |
| Imágenes y CV | Bucket R2 `portfolio`          | `https://pub-a3fda08feb4f417fa5634c34e7959461.r2.dev`               |
| Zero Trust    | Aplicación de Access del admin | equipo `throbbing-lake-8623.cloudflareaccess.com`                   |
| Turnstile     | Widget `portafolio`            | hostname `portafolio.erickm-gonzalez-rivera.workers.dev`            |

## Hostnames propuestos

| Pieza         | Después                                                   |
| ------------- | --------------------------------------------------------- |
| Sitio         | `khelde.dev` (y `www.khelde.dev` redirigido al principal) |
| Backend       | `api.khelde.dev`                                          |
| Admin         | `admin.khelde.dev`                                        |
| Imágenes y CV | `media.khelde.dev`                                        |

## Qué cambia, pieza por pieza

### 1. Cloudflare (panel)

| Dónde                                                            | Qué hacer                                                                                                                       |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Agregar el sitio (zona)                                          | Dominio en la cuenta, nameservers apuntando a Cloudflare, zona **activa**                                                       |
| Workers → `portafolio` → Settings → Domains & Routes             | Agregar **Custom domain** `khelde.dev` (+ `www`)                                                                                |
| Workers → `backend-portafolio` → Domains & Routes                | Agregar **Custom domain** `api.khelde.dev`                                                                                      |
| Workers → `portafolio-admin` → Domains & Routes                  | Agregar **Custom domain** `admin.khelde.dev`                                                                                    |
| R2 → bucket `portfolio` → Settings → **Dominios personalizados** | Agregar `media.khelde.dev`                                                                                                      |
| Turnstile → widget `portafolio`                                  | Agregar el hostname `khelde.dev` (conservar el de `workers.dev` hasta el final)                                                 |
| Zero Trust → Access → aplicación del admin                       | Agregar `admin.khelde.dev` como **destino adicional de la misma aplicación**                                                    |
| Reglas del dominio                                               | Redirección `www` → apex; regla de caché larga para `media.khelde.dev` (las claves nunca cambian); protección contra hotlinking |

Los Custom Domains de Workers crean el DNS y el certificado solos.

### 2. Sitio (`Portafolio`)

| Variable                    | Tipo    | Antes                                                    | Después                      | Dónde se cambia                                   |
| --------------------------- | ------- | -------------------------------------------------------- | ---------------------------- | ------------------------------------------------- |
| `SITE_URL`                  | build   | `…portafolio…workers.dev` (valor por defecto del código) | `https://khelde.dev`         | panel → portafolio → Settings → Build → Variables |
| `PUBLIC_MEDIA_URL`          | build   | `…r2.dev`                                                | `https://media.khelde.dev`   | igual                                             |
| `VITE_API_URL`              | build   | `…backend-portafolio…workers.dev/api`                    | `https://api.khelde.dev/api` | igual                                             |
| `PUBLIC_TURNSTILE_SITE_KEY` | build   | clave actual                                             | **no cambia**                | —                                                 |
| `TURNSTILE_SECRET_KEY`      | secreto | clave actual                                             | **no cambia**                | —                                                 |

- Los tres valores por defecto de `astro.config.mjs` (`SITE_URL`, `PUBLIC_MEDIA_URL`,
  `VITE_API_URL`) también conviene actualizarlos en una rama aparte, para que un build sin
  variables no apunte al dominio viejo.
- Lo que depende de `SITE_URL` y se actualiza solo en el siguiente build: canónicos,
  sitemap, `robots.txt`, `llms.txt`, JSON-LD y etiquetas sociales.
- El CSP toma el origen de las imágenes de `PUBLIC_MEDIA_URL`: no hay que tocarlo.

### 3. Backend (`Backend_Portafolio`)

| Variable             | Antes                                              | Después                                                | Dónde                     |
| -------------------- | -------------------------------------------------- | ------------------------------------------------------ | ------------------------- |
| `PUBLIC_MEDIA_URL`   | `…r2.dev`                                          | `https://media.khelde.dev`                             | `wrangler.jsonc` → `vars` |
| `ALLOWED_ORIGINS`    | `http://localhost:4321,http://localhost:4322`      | **no cambia**                                          | —                         |
| `ACCESS_TEAM_DOMAIN` | `https://throbbing-lake-8623.cloudflareaccess.com` | **no cambia**                                          | —                         |
| `ACCESS_AUD`         | el de la aplicación de Access                      | **no cambia** si el admin sigue en la misma aplicación | —                         |

- `ALLOWED_ORIGINS` solo importa si un **navegador** llama directo al backend. Hoy no pasa:
  el sitio y el admin lo llaman desde el servidor. Se amplía únicamente si eso cambia.
- Además, `workers_dev: false` al final (ver "Orden").

### 4. Admin (`Portafolio_admin`)

| Variable               | Antes                                              | Después                                 | Dónde                                                                                      |
| ---------------------- | -------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------ |
| `PUBLIC_MEDIA_URL`     | `…r2.dev`                                          | `https://media.khelde.dev`              | panel → portafolio-admin → Build → Variables                                               |
| `PUBLIC_PORTFOLIO_URL` | `…portafolio…workers.dev`                          | `https://khelde.dev`                    | igual                                                                                      |
| `BACKEND_URL`          | `…backend-portafolio…workers.dev/api`              | `https://api.khelde.dev/api`            | `wrangler.jsonc` → `vars` (solo respaldo y local; en producción habla por Service Binding) |
| `ACCESS_TEAM_DOMAIN`   | `https://throbbing-lake-8623.cloudflareaccess.com` | **no cambia**                           | —                                                                                          |
| `ACCESS_AUD`           | el actual                                          | **no cambia** si es la misma aplicación | —                                                                                          |
| `ADMIN_EMAILS`         | secreto                                            | **no cambia**                           | —                                                                                          |

- El **Service Binding** `BACKEND` no depende de ningún dominio: sigue igual.
- Si se crea una aplicación **nueva** en Access en lugar de agregar un hostname a la
  existente, el `ACCESS_AUD` cambia y hay que actualizarlo en el admin **y** en el backend
  (con el mismo valor en los dos).

### 5. Lo que NO cambia

- `ACCESS_TEAM_DOMAIN` (`…cloudflareaccess.com`): es del equipo de la cuenta, no del dominio.
- `API_TOKEN`, `API_TOKEN_ADMIN`, `API_SECRET_TOKEN`, `TURNSTILE_SECRET_KEY` y las claves
  del widget.
- Los datos: D1 y R2 guardan **claves** (`projects/abc.webp`), no URLs completas; ninguna
  fila cambia al mover el dominio de medios.
- El Service Binding del admin y del sitio hacia el backend.

### 6. Fuera de Cloudflare (acordarse)

Son enlaces que **nadie actualiza solo**: si se olvidan, siguen mandando a `workers.dev`.

| Dónde                                                                                      | Qué cambiar                                                                                                                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **CV** (PDF)                                                                               | El enlace al portafolio. Hay que volver a exportar y **subir el PDF nuevo** desde el admin (ver `cv_pdf`).                                                                                                                                                                           |
| **LinkedIn**                                                                               | El sitio web del perfil y cualquier sección "Destacados" o experiencia que cite el portafolio.                                                                                                                                                                                       |
| **Instagram**                                                                              | El enlace de la biografía.                                                                                                                                                                                                                                                           |
| **GitHub, los tres repositorios** (`Portafolio`, `Backend_Portafolio`, `Portafolio_admin`) | Campo **Website** y descripción del **About** de cada repositorio.                                                                                                                                                                                                                   |
| **GitHub, perfil de `muke78`**                                                             | El campo **Website** del perfil y los enlaces sociales de la cuenta.                                                                                                                                                                                                                 |
| **README del perfil** (`muke78/muke78`, el `.md` que se ve en el perfil)                   | Todos los enlaces al portafolio.                                                                                                                                                                                                                                                     |
| **El propio portafolio**                                                                   | Enlaces al sitio dentro de su contenido: `README.md` de este repositorio y cualquier texto del admin (Sobre mí, descripciones, "Textos") que cite la URL vieja. Lo que sale de `SITE_URL` (canónicos, sitemap, `robots.txt`, `llms.txt`, JSON-LD) cambia solo en el siguiente build. |
| README y documentación                                                                     | Los tres repositorios: buscar la URL vieja (`git grep workers.dev`) y reemplazarla.                                                                                                                                                                                                  |
| ~~Google Search Console~~ ✅                                                               | ~~Registrar `khelde.dev`~~ (hecho). Pendiente solo: enviar el sitemap cuando el sitio responda en el dominio nuevo.                                                                                                                                                                  |
| ~~Bing Webmaster Tools~~ ✅                                                                | ~~Registrar `khelde.dev`~~ (hecho). Pendiente solo: enviar el sitemap cuando el sitio responda en el dominio nuevo.                                                                                                                                                                  |

## Orden recomendado (para no dejar nada caído)

1. ~~Comprar el dominio~~ ✅ (comprado) y esperar a que la zona esté **activa**.
2. Agregar los Custom Domains (sitio, backend, admin) y el de R2. **No** tocar variables todavía.
3. Turnstile: agregar `khelde.dev`. Access: agregar `admin.khelde.dev` a la misma aplicación.
4. Probar cada hostname nuevo: `https://api.khelde.dev/api` (salud), una imagen en
   `https://media.khelde.dev/<clave>` y el login del admin en `https://admin.khelde.dev`.
5. Cambiar variables y redesplegar en este orden: **backend → sitio → admin**.
6. Verificar: el sitio carga imágenes y proyectos, los formularios (comentario y contacto)
   guardan, el admin entra con Access y sube una imagen.
7. Solo entonces cerrar lo viejo:
   - R2: desactivar la **URL pública de desarrollo** (`r2.dev`).
   - Cada Worker: `"workers_dev": false` y `"preview_urls": false` en su `wrangler.jsonc`.
   - Turnstile: quitar el hostname de `workers.dev`.
   - Access: quitar el destino de `workers.dev` del admin.
8. Actualizar los valores por defecto de `astro.config.mjs` y la documentación (rama aparte).
9. Cambiar los enlaces de la sección 6: CV, LinkedIn, Instagram, GitHub (repositorios, perfil y README del perfil) y los del propio portafolio.

**Cuidado con el paso 7:** apagar `workers_dev` del backend **antes** de que el sitio use
`https://api.khelde.dev/api` dejaría al sitio sin API. El sitio llama al backend por URL
pública (`VITE_API_URL`); solo el admin usa Service Binding.

## Lista de verificación

- [ ] Zona activa y certificados emitidos para los cuatro hostnames.
- [ ] `https://khelde.dev/es/home` carga con fotos, proyectos e iconos.
- [ ] `https://khelde.dev/robots.txt` y el sitemap listan `khelde.dev`.
- [ ] Un comentario y un mensaje de contacto se guardan (Turnstile con el hostname nuevo).
- [ ] `https://admin.khelde.dev` pide el login de Access y deja entrar solo al correo permitido.
- [ ] Subir y borrar una imagen desde el admin funciona y se ve en `media.khelde.dev`.
- [ ] `/estado` del admin: todo en "Correcto", conexión por Service Binding.
- [ ] `r2.dev` y `workers.dev` ya no responden.
- [ ] CV (PDF nuevo subido desde el admin), LinkedIn e Instagram apuntan al dominio nuevo.
- [ ] GitHub: Website y About de los tres repositorios, Website del perfil de `muke78` y README del perfil (`muke78/muke78`) apuntan al dominio nuevo.
- [ ] Dentro del portafolio: `README.md` y los textos del admin ya no citan `workers.dev`.
