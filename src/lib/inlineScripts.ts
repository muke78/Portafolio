/**
 * Scripts EN LINEA del <head>. Corren antes del primer pintado (por eso no pueden ser
 * modulos: un modulo se aplaza y el tema parpadearia). Astro no calcula el hash de los
 * `is:inline`, asi que el texto vive aqui y lo usan los dos lados:
 *  - `Layout.astro` lo escribe tal cual (`set:html`);
 *  - `astro.config.mjs` calcula su sha256 y lo agrega al `script-src` del CSP.
 * Si cambias una sola letra, el hash cambia solo en el siguiente build.
 */

/** CSS solo puede ocultar [data-reveal] mientras exista esta clase (JS activo Y movimiento permitido). */
export const MOTION_GATE_SCRIPT = `(function(){var d=document.documentElement;if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches){d.classList.add("motion-ok");setTimeout(function(){if(!window.__motionReady)d.classList.remove("motion-ok")},4000)}})();`;

/** Tema guardado o el del sistema, antes de pintar. */
export const THEME_SCRIPT = `(function(){var stored=localStorage.getItem("theme");var dark=stored?stored==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",dark)})();`;
