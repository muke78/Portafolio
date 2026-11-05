# Plan: currículum nuevo y CV dinámico

Dos objetivos que van en orden: **primero** rehacer el CV (contenido y formato), **después**
servirlo desde el admin en lugar de una URL fija en `Header.astro`.

> **Este repositorio es público.** Nada confidencial de ninguna empresa entra aquí: ni
> nombres de clientes, ni arquitectura interna, ni capturas, ni código. Los borradores del
> CV viven **fuera del repo** hasta que la persona dueña los revise.

## Estado actual

- El botón "Ver CV" de `src/components/sections/Header.astro` apunta a una URL fija de
  Vercel Blob. Cambiar el CV obliga a editar código y redesplegar.
- El CV se mantiene en Canva y se exporta a PDF.
- Solo hay CV en español. Por ahora **no habrá versión por idioma**.
- Se pasa de Canva a Google Docs o Word (ver Paso 1).

## Paso 1: rehacer el CV

**Entrada:** el CV actual y la carpeta de documentación del trabajo en Zascita y Opscom
(`Downloads\_Documentacion`, 16 documentos). Es la misma fuente que alimentará las fichas
de proyectos que faltan en el portafolio: una lectura sirve para las dos tareas.

### Qué debe cumplir

1. **Contiene todo lo que el CV actual tiene.** Nada se pierde; se reordena y se corrige.
2. **Pasa filtros ATS:**
   - una sola columna, sin tablas, sin iconos, sin imágenes ni texto dentro de gráficos;
   - encabezados estándar: *Resumen*, *Experiencia profesional*, *Educación*, *Habilidades*;
   - texto real seleccionable (no rasterizado) y fuentes comunes;
   - fechas en un formato único (`Mes AAAA – Mes AAAA`), orden cronológico inverso;
   - palabras clave del stack tal como las escriben las ofertas (React, TypeScript,
     Node.js, PostgreSQL, AWS, Cloudflare Workers…).
3. **Formato estilo Harvard:** sobrio, una página y media a dos como máximo, nombre y
   contacto arriba, cada puesto con empresa, rol, fechas y viñetas que empiezan con un
   verbo de acción y terminan en un resultado.
4. **Ordena las entradas freelance.** Khelde, JoniTech y Sleeplesscofi se traslapan con el
   trabajo actual. Se agrupan bajo un solo bloque *Freelance — Khelde México* con los
   proyectos como viñetas.
5. **Corrige erratas:** *Desarollador*, *Implemetación*, *metiante*, *Colabore*,
   *Participe*, *Gestion* y las que aparezcan al revisar.
6. **Agrega las habilidades que faltan:** Cloudflare Workers, D1, R2, Hono, Drizzle,
   Astro SSR y lo que salga de la documentación de Zascita.
7. **Incluye el puesto actual (Zascita)** con rol, fechas, stack y logros, **sin nombres de
   clientes ni detalles internos**. Antes de publicarlo se revisa el contrato por si tiene
   cláusula de confidencialidad sobre nombrar a la empresa.
8. **Años de experiencia correctos:** "más de 4 años" (desde Ene 2023 en trabajo formal;
   5 si se cuenta el puesto trainee desde Oct 2021).
9. **Cifras defendibles.** Cada porcentaje debe poder explicarse en una entrevista; los
   que no, se sustituyen por hechos concretos (tamaño, usuarios, tiempos).

### Entregables

- Texto del CV en Markdown, para revisar contenido antes de maquetar.
- PDF final.
- Lista de verificación ATS completada (abajo).

### Decisión tomada: dónde maquetarlo

Se **abandona Canva**. El CV se maqueta en **Google Docs o Word** con una sola columna. Se
entrega primero en **Word** para revisarlo; cuando se aprueba, se imprime a **PDF**. En la
plataforma solo se sube el **PDF**; el DOCX no se guarda en el admin.

### Lista de verificación ATS

- [ ] Abrir el PDF, seleccionar todo, copiar y pegar en un editor de texto: el orden de
      lectura es el correcto y no hay caracteres rotos.
- [ ] Ninguna información importante vive solo en un icono o una imagen.
- [ ] Un solo formato de fechas.
- [ ] Nombre del archivo claro: `CV-Erick-Gonzalez.pdf`.
- [ ] Peso menor a 2 MB.
- [ ] Revisión de ortografía.
- [ ] Revisión de confidencialidad (Zascita y Opscom).

### Pista paralela: proyectos privados del portafolio

La misma documentación sirve para las fichas que faltan en el portafolio (varias de
Opscom y de Zascita). Reglas: sin nombres de empresas ni clientes, sin código ni capturas
ni arquitectura interna, y con los enlaces del CMS en blanco. Va en su propia rama; no se
mezcla con el CV.

## Paso 2: subir el CV desde el admin

Solo se empieza cuando el CV nuevo esté revisado y aprobado. Se sube **un solo archivo, el
PDF**, en español.

### Cómo se sirve

Desde R2 (`PUBLIC_MEDIA_URL`) con `Content-Disposition: inline; filename="CV-Erick-Gonzalez.pdf"`:
al hacer clic, el navegador **abre y muestra** el PDF en una pestaña nueva y, si el visitante
lo guarda, conserva un nombre legible.

### Backend (`Backend_Portafolio`)

- Endpoint `POST /api/cv` (bearer + Cloudflare Access), **aparte** de `/api/media`, que solo
  acepta WebP. Mezclarlos haría que la pantalla Medios mostrara el PDF como una imagen
  huérfana y se pudiera borrar sin querer.
- Validación: `Content-Type: application/pdf`, el archivo empieza con `%PDF-` y pesa como
  máximo 5 MB. La clave la genera el servidor.
- Se guarda en R2 con el prefijo `cv/` (por ejemplo `cv/CV-Erick-Gonzalez-2026-11.pdf`).
- La clave se guarda en la fila de `site_copy` (columna nueva `cv_pdf_key`; **migración de
  D1**, que se aplica en remoto antes de mergear a `main`).
- `GET /api/site-copy` devuelve la URL pública del PDF; `DELETE /api/cv` lo quita.
- Se declara en `tests/security/routeInventory.test.ts`.

### Admin (`Portafolio_admin`)

- Sección **Currículum** en el módulo Textos: ver el archivo actual, subir uno nuevo,
  reemplazar y quitar. Validación de tipo y tamaño en el cliente y en el proxy.

### Sitio (`Portafolio`)

- `Header.astro` lee la URL del PDF desde `getSiteCopy` (con respaldo y caché como el resto
  de los textos). Si no hay PDF cargado, el botón no se muestra.
- Se quita la URL fija de Vercel Blob.

### Migración

No hace falta descargar nada de Vercel: se imprime el PDF nuevo y se sube desde el admin.
Después se borra a mano el archivo viejo del Blob.

## Sobre R2 y las carpetas

R2 no tiene carpetas reales. Una "carpeta" es solo el prefijo de la clave del objeto: al
subir `cv/CV-Erick-Gonzalez.pdf`, el panel de Cloudflare muestra `cv/` como carpeta
automáticamente. **No hay nada que configurar**; se crea sola con el primer archivo, igual
que hoy pasa con `projects/…` o `about/…` en las imágenes. El PDF se sirve desde el mismo
bucket (`PUBLIC_MEDIA_URL`), igual que las imágenes. Cuando se compre el dominio saldrá de
`media.khelde.dev` (ver [`PLAN-DOMINIO.md`](./PLAN-DOMINIO.md)).

## Orden de trabajo

1. Rehacer el CV (este plan, Paso 1) y revisarlo.
2. Aprobación del CV nuevo.
3. Backend → Admin → Sitio, una rama por repo, PR a `dev`.
4. Subir el PDF desde el admin y retirar el Blob de Vercel.
5. Release a `main` solo con orden explícita.
