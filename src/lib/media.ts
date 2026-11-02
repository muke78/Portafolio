import { PUBLIC_MEDIA_URL } from "astro:env/client";

/**
 * URL publica de un archivo del bucket R2. Es la UNICA parte del sitio que
 * conoce el origen de los medios (variable `PUBLIC_MEDIA_URL`): al pasar de
 * `r2.dev` a un dominio propio solo cambia esa variable. La base guarda claves
 * (`Backend_Task.webp` o `/UPVM.webp`), nunca URLs, asi que no hay datos que migrar.
 */
export const mediaUrl = (key: string): string =>
	`${PUBLIC_MEDIA_URL.replace(/\/+$/, "")}/${key.replace(/^\/+/, "")}`;
