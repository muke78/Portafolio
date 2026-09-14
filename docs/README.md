# Documentación — Expansión del panel admin

Esta carpeta documenta la próxima expansión grande del portafolio: un panel
de administración completo que permite editar **todo** el contenido del
sitio (Acerca de mí, Educación, Experiencia, Habilidades, Proyectos,
Comentarios, Contacto) sin tocar código ni hacer un redeploy.

Es documentación de planeación — **nada de esto está construido todavía**.
Se escribió a partir de los requisitos que diste el 2026-09-13, para tenerlos
por escrito antes de empezar a construir.

## Índice

1. [`01-arquitectura.md`](./01-arquitectura.md) — cómo encajan Astro, Hono,
   Turso y Cloudflare R2 hoy, y qué cambia.
2. [`02-panel-admin-requisitos.md`](./02-panel-admin-requisitos.md) — qué
   tiene que poder hacer el panel, sección por sección.
3. [`03-diseno-api.md`](./03-diseno-api.md) — contrato de endpoints de Hono
   y el checklist de seguridad.
4. [`04-migracion-datos.md`](./04-migracion-datos.md) — plan para vaciar y
   reconstruir las tablas de Turso desde cero.
5. [`05-estrategia-testing.md`](./05-estrategia-testing.md) — Playwright +
   Vitest para probar que todo esto funciona antes y después de construirlo.

## Punto de partida confirmado (no es propuesta, ya existe)

- **Backend**: [Hono](https://hono.dev/), ya en producción.
- **Base de datos**: [Turso](https://turso.tech/) (libSQL), conectada con
  Vercel.
- **Imágenes de proyectos**: en un bucket de **Cloudflare R2**
  (`pub-a3fda08feb4f417fa5634c34e7959461.r2.dev`), todas en `.webp`.
- **Frontend**: Astro 7 (SSR, `output: "server"`), este repo. Ya consume el
  backend de Hono vía un proxy interno en `/api/*` que agrega el bearer
  token server-side (`src/lib/api.ts`, `API_SECRET_TOKEN`) — el navegador
  nunca ve el token.
- **Contacto**: el formulario de `/es/home#contact` ya pasa por Hono
  (`POST /tlgrm` en el backend), que a su vez habla con la API de Telegram
  (BotFather). Astro nunca toca las credenciales de Telegram directamente.

Lo que falta es: endurecer y reestructurar los endpoints de Hono, construir
el panel admin (auth + UI + rutas CRUD), y migrar/limpiar los datos en Turso
para el nuevo modelo. Ese es el contenido de esta carpeta.
