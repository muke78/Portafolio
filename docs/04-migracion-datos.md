# Migración de datos (Turso)

Dijiste explícitamente: vas a bajar toda la info y tablas actuales y
subirlas de nuevo desde cero, limpias, para el nuevo admin. Este documento
es el plan para hacer eso sin perder nada importante en el camino.

## Antes de vaciar nada — respaldo

1. Export completo de cada tabla actual a JSON/CSV antes de tocar nada
   (`turso db shell <db> ".dump"` o exportando cada tabla por separado).
   Guardar el respaldo fuera de Turso (repo privado, o simplemente un
   archivo local versionado aparte) — es la única copia si algo sale mal
   en la migración.
2. Con ese respaldo en mano, decidir **qué de lo actual vale la pena
   preservar** (probablemente sí: proyectos reales, experiencia real,
   comentarios reales ya recibidos) vs. **qué era de prueba** y no
   necesita pasar al esquema nuevo.

## Esquema propuesto

Extiende el patrón que ya existe (`projects` + `projects_translations`,
confirmado por `ProjectsTranslations` en
`src/types/currentLang.interface.ts`) a los recursos nuevos que pediste:

```sql
-- Ya existe hoy (mantener forma, revisar si faltan columnas)
projects (project_id, slug, category, card_image, images_topics, link_repo, link_web, fork)
projects_translations (translate_project_id, project_id, locale, title, description)

experiences (experience_id, work, img, alt, time, location)
experiences_translations (translate_experience_id, experience_id, locale, title, description)
-- (confirmar si experiences ya se traduce por tabla aparte o si title/description
--  hoy viven directo en `experiences` sin separar por locale — según
--  ItemDataExperiencia.tsx no queda claro desde el frontend, hay que
--  revisarlo directo en el esquema actual de Turso antes de migrar)

-- Nuevo
education (education_id, logo_img, start_date, end_date)
education_translations (translate_education_id, education_id, locale, institution, subtitle, description)

skills (skill_id, category, tech_name, icon_url, sort_order)

about_me (id, cover_img)
about_me_translations (locale, description, title_card, subtitle)

comments (comment_id, name, job, description, country, country_flag, status, direction, created_at)
-- status nuevo: 'pending' | 'published' | 'hidden'

contact_messages (message_id, name, email, phone, more_information, status, created_at)
-- status nuevo: 'unread' | 'read' | 'replied'
```

**Pendiente de confirmar contigo/revisando el esquema real de Turso**: cómo
está hoy exactamente `experiences` (¿ya tiene tabla de traducciones
separada como `projects`, o el texto vive directo en la tabla y por eso
`ItemDataExperiencia.tsx` no distingue locale en la respuesta más allá del
query param?). Esto hay que verlo directo en Turso, no se puede confirmar
solo desde el código del frontend.

## Orden de migración sugerido

1. Backup completo (arriba).
2. Crear las tablas nuevas (`education*`, `skills`, `about_me*`,
   `contact_messages`) sin tocar las que ya existen.
3. Agregar la columna `status` a `comments` con default `'published'`
   (así los comentarios actuales no cambian de comportamiento visible).
4. Poblar `education`/`about_me` a mano con el contenido real (hoy vive
   fijo en `src/i18n/locales/*.json`, namespaces `UNIVERSITY` y
   `ABOUTME`) — es la única migración que es "copiar lo que ya está bien"
   en vez de limpiar datos de prueba.
5. Revisar `projects`/`experiences`/`comments` fila por fila contra el
   backup: borrar lo que sea de prueba, dejar solo lo real.
6. Recién ahí conectar el backend/admin nuevo contra las tablas limpias.

## Después de migrar

- Los namespaces `UNIVERSITY` y `ABOUTME` en
  `src/i18n/locales/{es,en,fr}.json` quedan obsoletos una vez que
  `Educacion.tsx`/`SobreMi.tsx` lean de la API en vez del JSON de
  traducciones — hay que quitarlos del JSON y de esos dos componentes
  cuando se conecte (no antes, para no romper el sitio mientras tanto).
