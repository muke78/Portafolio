/** Nombre valido de un icono: minusculas, digitos y . + _ - (sin comas ni rutas). */
export const ICON_NAME = /^[a-z0-9][a-z0-9.+_-]{0,39}$/;

/**
 * URL del icono de una tecnologia. Sale del propio sitio (`/api/icons/<nombre>`): el
 * navegador nunca le habla al servicio de iconos, que solo ve al Worker.
 */
export const techIconUrl = (name: string): string =>
	`/api/icons/${encodeURIComponent(name.trim().toLowerCase())}`;
