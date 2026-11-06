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

/**
 * La puerta de la introduccion (el punto cero) solo puede existir mientras esta clase este en <html>:
 * JS activo, movimiento permitido, sin ancla en la URL (un enlace a #projects entra directo) y sin la
 * preferencia "skip" (src/lib/introPrefs.ts). `intro-once` pide verla una vez desde el pie. `intro-seen`
 * (sesion) evita repetirla al volver de un proyecto o cambiar de idioma; una recarga si la repite. Sin JS, con
 * movimiento reducido o para un rastreador la clase nunca existe y el sitio se ve completo. Si el motor
 * no arranca en 5 s la clase se quita sola: nadie se queda atrapado.
 */
export const INTRO_GATE_SCRIPT = `(function(){var d=document.documentElement,p=null,o=null,s=null;try{p=localStorage.getItem("intro");o=sessionStorage.getItem("intro-once");s=sessionStorage.getItem("intro-seen");sessionStorage.removeItem("intro-once")}catch(e){}var n=performance.getEntriesByType&&performance.getEntriesByType("navigation")[0],r=!!n&&n.type==="reload";if((o||(p!=="skip"&&(!s||r)))&&!location.hash&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches){d.classList.add("intro-on");setTimeout(function(){if(!window.__motionReady)d.classList.remove("intro-on")},5000)}})();`;

/** Tema guardado o el del sistema, antes de pintar. */
export const THEME_SCRIPT = `(function(){var stored=localStorage.getItem("theme");var dark=stored?stored==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",dark)})();`;
