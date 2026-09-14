# Requisitos del panel admin

Objetivo general: que puedas alimentar **todo** el portafolio como
contenido — crear, editar, borrar — sin tocar código ni hacer un commit,
todo vía el panel admin hablando con Hono, guardando en Turso.

## Acceso — "discreto"

Pediste explícitamente que el acceso sea discreto y que no cualquiera deba
poder llegar a él ni saber que existe. Esto son dos problemas distintos y
hay que resolver los dos:

1. **Quién puede entrar** (autenticación real) — ya existe una base
   razonable: contraseña + cookie de sesión firmada HMAC, comparación en
   tiempo constante, TTL corto, rate limiting en login. Para la versión
   nueva, evaluar sumar:
   - **2FA** (TOTP, tipo Google Authenticator) — hay librerías ligeras para
     esto (`otpauth`, `@simplewebauthn/*` si se quiere ir a passkeys).
   - Si Hono va a validar su propia sesión (en vez de confiar solo en el
     bearer token fijo, ver [`03-diseno-api.md`](./03-diseno-api.md)), un
     JWT de corta duración firmado con una clave que solo Astro y Hono
     conocen.
2. **Qué tan fácil es encontrarlo** (discreción/obscuridad) — esto
   **nunca reemplaza** el punto 1, pero suma una capa razonable para un
   panel de un solo administrador:
   - Quitar el link "ACCESO ADMIN" del footer público (hoy visible, lo
     viste en el screenshot) — que no haya ningún link visitable desde la
     navegación normal del sitio.
   - Ruta no obvia: no `/admin`, algo no adivinable (ej.
     `/panel-<hash aleatorio>` o vía variable de entorno para poder
     rotarla sin tocar código).
   - Opcional: la ruta responde 404 genérico (igual que cualquier URL
     inventada) en vez de mostrar una pantalla de login reconocible, hasta
     que se cumpla alguna condición adicional (un header, un cookie
     previo, etc.) — esto es más trabajo, decidir si vale la pena para un
     panel de un solo usuario.

**Pendiente de decidir contigo** antes de construir: ¿2FA sí o no para la
v1? ¿vale la pena el 404-genérico o es suficiente con quitar el link +
ruta no obvia + todo lo del punto 1?

## Qué debe poder administrar, sección por sección

### Acerca de mí (`SobreMi.tsx`)

- Editar el texto/descripción y la imagen de portada
  (hoy `/Aboutme.webp`, estático).
- Hoy es contenido fijo en el JSON de i18n (`ABOUTME.ABOUT_ABOUT_DESCRIPTION`
  etc.) — para que el admin lo edite de verdad, este texto tiene que salir
  del JSON de traducciones y pasar a ser un recurso de Turso, con una copia
  por idioma (es/en/fr) igual que ya se hace con `projects`.

### Educación (`Educacion.tsx`)

- Hoy es **un solo bloque fijo** (una universidad, un periodo) en el JSON
  de i18n — no es una lista, no viene de la base de datos.
- Pediste poder **agregar más entradas** (varias instituciones/cursos) —
  esto implica que Educación se vuelva un recurso real en Turso (tabla
  `education`, con su tabla de traducciones `education_translations` igual
  que `projects`/`projects_translations`), no un bloque fijo.
- Campos por entrada: institución, subtítulo/carrera, descripción, periodo
  (texto libre tipo "2019 - 2022" o fechas estructuradas — decidir),
  imagen del logo.

### Experiencia (`Experiencia.tsx` / `ItemDataExperiencia.tsx`)

- **Ya viene de la base de datos** (`/api/experiences`) — el panel admin ya
  tiene el CRUD tipado para esto desde esta sesión
  (`src/features/admin/resourceFields.ts`, recurso `experiences`).
  Falta nada más conectarlo al Hono endurecido cuando exista.

### Habilidades (`Habilidades.tsx` / `ItemDataHabilidades.tsx`)

- Mencionaste unos íconos de apps "que están muy padres" que encontraste —
  hoy los íconos de skills se piden a un servicio externo
  (`go-skill-icons.vercel.app`) por nombre de tecnología, no hay tabla
  propia en Turso.
- Para que el admin pueda gestionar esto de verdad hace falta una tabla
  `skills` (categoría, nombre de la tecnología, y — si quieres usar un
  set de íconos distinto al que se pide hoy — la URL/slug del ícono nuevo)
  en vez de la lista fija que hay ahora en el código
  (`ItemDataHabilidades.tsx`).
- **Pendiente de decidir contigo**: ¿cuál es el nuevo set de íconos que
  encontraste? Si tiene su propia API/CDN pública (como el actual), el
  cambio es solo de dónde se arma la URL del ícono; si es un paquete de
  archivos, hay que subirlos a R2 igual que las imágenes de proyectos.

### Proyectos (`ItemDataProjects.tsx`)

- Ya es 100% dinámico desde Turso — el panel admin de esta sesión ya tiene
  el CRUD tipado (`resourceFields.ts`, recurso `projects`): slug,
  categoría, título, descripción, repo/demo, `images_topics` (las
  tecnologías usadas), `fork`.
- Lo que pediste explícitamente: poder **crear proyectos nuevos** y
  **cambiar las tecnologías usadas a voluntad, sin tocar código** — esto ya
  es así hoy en el formulario del admin (`images_topics` es un campo de
  texto separado por comas, no está hardcodeado). Con Hono endurecido y
  las imágenes subiéndose desde el propio panel (ver abajo), queda
  completo.

### Imágenes de proyectos (Cloudflare R2)

- Hoy: subes tú manualmente a R2, ya convertidas a webp, y pegas la URL en
  el campo `card_image`.
- Pediste que la carga se pueda hacer **desde Hono**, con conversión
  automática de formato a webp (para no tener que convertir tú a mano cada
  vez). Opciones reales para esto:
  - **Cloudflare Images** (servicio aparte de R2, con transformación de
    formato integrada) — la opción con menos código propio que mantener.
  - Conversión manual en Hono con una librería como `sharp` (Node) o
    `@cf-wasm/photon`/`wasm-vips` si Hono corre en el Workers runtime de
    Cloudflare (sin Node nativo disponible ahí — hay que confirmar en qué
    runtime corre Hono hoy para saber qué opciones aplican).
  - **Pendiente de decidir contigo**: ¿en qué runtime corre Hono
    actualmente (Node, Cloudflare Workers, Vercel Edge, otro)? Esto decide
    qué librería de conversión de imagen es viable.

### Comentarios (testimonios)

- Pediste explícitamente: **administrar, no solo borrar** — hoy el CRUD
  genérico del admin permite editar y borrar, pero no hay ningún estado de
  moderación (aprobado/oculto/pendiente).
- Propuesta: sumar un campo `status` (`pending` | `published` | `hidden`)
  a la tabla de comentarios. Los que llegan del formulario público entran
  como `pending` (o `published` directo, a decidir), el admin puede
  cambiar el estado sin necesidad de borrar el registro — así se puede
  ocultar un comentario problemático sin perder el historial.

### Contacto

- Hoy: el formulario público solo dispara un mensaje de Telegram vía Hono
  (`POST /tlgrm`) — no queda ningún registro consultable, no hay forma de
  ver en el panel "quién me ha escrito".
- Pediste un refactor: que los mensajes de contacto se **persistan** en
  Turso (tabla `contact_messages`: nombre, email, teléfono, mensaje, fecha,
  y un estado tipo `unread`/`read`/`replied`) y el panel admin los liste.
  Telegram puede seguir funcionando **en paralelo** como notificación en
  tiempo real (te avisa al instante) sin que sea la única fuente de
  verdad — no hace falta elegir entre uno u otro.

## Modelo de operación

Tal como lo describiste: el admin alimenta el portafolio "como un usuario
normal" — el panel termina siendo un cliente más de la misma API de Hono,
haciendo `POST` (crear), `GET` (listar/leer), `PUT` (editar), `DELETE`
(borrar/o cambiar estado) contra cada recurso, todo persistido en Turso.
Esto ya es exactamente el patrón que sigue el panel admin actual
(`src/features/admin/AdminDashboard.tsx` + `resourceFields.ts`) — la
expansión es sumar los recursos que faltan (`education`, `skills`,
`contact_messages`, `about_me`) y endurecer lo que ya habla con Hono.
