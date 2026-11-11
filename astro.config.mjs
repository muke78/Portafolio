import { createHash } from "node:crypto";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, envField } from "astro/config";
import compress from "astro-compress";
import { DEFAULT_LOCALE, LOCALE_META, LOCALES } from "./src/i18n/locales.ts";
import {
	INTRO_GATE_SCRIPT,
	MOTION_GATE_SCRIPT,
	THEME_SCRIPT,
} from "./src/lib/inlineScripts.ts";

// Unica fuente de la URL del sitio: canonicos, sitemap y robots.txt salen de
// aqui. El panel de Cloudflare puede sobrescribirla con SITE_URL (variable de build).
const SITE_URL = (process.env.SITE_URL ?? "https://khelde.dev").replace(
	/\/+$/,
	"",
);

// Origen del bucket R2 (imagenes): el CSP lo permite en `img-src`. Misma variable y
// mismo valor por defecto que `PUBLIC_MEDIA_URL` en el esquema de abajo.
const DEFAULT_MEDIA_URL = "https://media.khelde.dev";
const MEDIA_ORIGIN = new URL(process.env.PUBLIC_MEDIA_URL ?? DEFAULT_MEDIA_URL)
	.origin;

// Cloudflare Turnstile: el widget carga su script y su marco desde este origen.
const TURNSTILE_ORIGIN = "https://challenges.cloudflare.com";

// sha256 de los <script is:inline> del Layout (Astro no hashea los `is:inline`).
const hashOf = (source) =>
	`sha256-${createHash("sha256").update(source).digest("base64")}`;

const bcp47s = Object.fromEntries(
	LOCALES.map((locale) => [locale, LOCALE_META[locale].bcp47]),
);

export default defineConfig({
	site: SITE_URL,
	integrations: [
		react({
			include: ["**/react/*", "**/components/**/*"],
			experimentalReactChildren: false,
		}),
		sitemap({
			i18n: {
				defaultLocale: DEFAULT_LOCALE,
				locales: bcp47s,
			},
			// The [lang]/home route is fully dynamic SSR (no getStaticPaths,
			// no prerender) - deliberately kept that way so CMS edits show up
			// live without a redeploy. Astro's sitemap integration only
			// discovers static routes on its own, so without this the sitemap
			// would only ever list "/". The three
			// locale URLs are a small, fixed, known set - list them directly
			// instead of forcing prerendering just for sitemap discovery.
			customPages: LOCALES.map((locale) => `${SITE_URL}/${locale}/home`),
		}),
		compress({
			CSS: true,
			HTML: false,
			Image: true,
			SVG: true,
			Logger: true,
		}),
	],

	// CSP con hashes: Astro calcula el hash de cada <script> y <style> que genera y lo
	// pone en un <meta http-equiv="content-security-policy"> por pagina (script-src y
	// style-src). Solo funciona en `build` + `preview`, no en `dev`. Las directivas de
	// abajo cubren el resto de lo que carga el sitio; las que no pueden ir en un <meta>
	// (frame-ancestors...) siguen en src/lib/securityHeaders.ts y public/_headers.
	security: {
		csp: {
			directives: [
				"default-src 'self'",
				// R2 (fotos) y jsDelivr (banderas de react-country-flag). Los iconos de
				// tecnologias salen del propio sitio (/api/icons), no de un tercero.
				`img-src 'self' data: blob: ${MEDIA_ORIGIN} https://cdn.jsdelivr.net`,
				"font-src 'self' data:",
				// Turnstile (casilla anti-bots de los formularios): script, marco y conexion.
				`connect-src 'self' ${TURNSTILE_ORIGIN}`,
				"worker-src 'self' blob:",
				"media-src 'self'",
				"manifest-src 'self'",
				`frame-src ${TURNSTILE_ORIGIN}`,
				// Las que antes mandaba el middleware; con CSP de Astro la cabecera la
				// pone Astro y el middleware respeta la de la ruta, asi que van aqui.
				"base-uri 'self'",
				"object-src 'none'",
				"frame-ancestors 'none'",
				"form-action 'self'",
			],
			scriptDirective: {
				resources: ["'self'", TURNSTILE_ORIGIN],
				hashes: [
					hashOf(MOTION_GATE_SCRIPT),
					hashOf(THEME_SCRIPT),
					hashOf(INTRO_GATE_SCRIPT),
				],
			},
			// Los atributos style="" (Astro, React y GSAP los ponen) no se pueden
			// hashear; no ejecutan codigo, asi que solo ellos quedan en `unsafe-inline`.
			// Las etiquetas <style> y <script> siguen exigiendo hash.
			styleDirective: {
				resources: [
					"'self'",
					{ resource: "'unsafe-inline'", kind: "attribute" },
				],
			},
		},
	},

	compressHTML: true,
	prefetch: true,

	// Inline the (~18 kB) stylesheet: as a <link> it blocks the first render
	// and delays the LCP by a full round trip (Lighthouse "render blocking").
	build: { inlineStylesheets: "always" },

	devToolbar: {
		enabled: false,
	},

	i18n: {
		defaultLocale: DEFAULT_LOCALE,
		locales: [...LOCALES],
		// "manual": routes outside [lang]/* (like /api/*) used to get
		// swallowed by Astro's automatic locale-prefix routing and 404 even
		// though they're real pages. Manual mode disables that automatic
		// interception; locale validation for /[lang]/* now happens in our
		// own middleware.ts instead.
		routing: "manual",
	},

	vite: {
		define: {
			"process.env.NODE_ENV": JSON.stringify(
				process.env.NODE_ENV || "development",
			),
		},
		build: {
			minify: "esbuild",
			// The only chunk over 500 kB is Three.js (~520 kB) inside the
			// BackgroundEffects island, which loads on `client:idle` and never blocks
			// first paint. The limit sits just above it so a new heavy chunk still warns.
			chunkSizeWarningLimit: 600,
			sourcemap: process.env.NODE_ENV !== "production",
			rollupOptions: {
				output: {
					manualChunks(id) {
						if (id.includes("node_modules/react-dom")) return "react";
						if (id.includes("node_modules/react")) return "react";
					},
				},
			},
		},
		plugins: [tailwindcss()],

		server: {
			fs: {
				allow: [".."],
			},
		},
	},

	env: {
		schema: {
			// Es una URL publica (el navegador la ve), asi que puede tener un valor
			// por defecto: si el panel de Cloudflare no inyecta la variable de
			// build, el build no falla. Con la variable definida (o en `.env`) ese
			// valor manda.
			VITE_API_URL: envField.string({
				context: "client",
				access: "public",
				default: "https://api.khelde.dev/api",
			}),
			// Origen publico del bucket R2 (imagenes). Ver src/lib/media.ts.
			PUBLIC_MEDIA_URL: envField.string({
				context: "client",
				access: "public",
				default: DEFAULT_MEDIA_URL,
			}),
			API_SECRET_TOKEN: envField.string({
				context: "server",
				access: "secret",
			}),
			// Turnstile: clave publica del widget (build) y clave secreta de verificacion
			// (runtime). Sin la secreta, el servidor rechaza los POST publicos en produccion.
			PUBLIC_TURNSTILE_SITE_KEY: envField.string({
				context: "client",
				access: "public",
				optional: true,
			}),
			TURNSTILE_SECRET_KEY: envField.string({
				context: "server",
				access: "secret",
				optional: true,
			}),
		},
	},
	// El sitio no usa sesiones. Sin esto el adaptador de Cloudflare agrega solo un
	// binding KV `SESSION` sin namespace_id y `wrangler preview` (builds de
	// ramas) falla con "binding SESSION of type kv_namespace must have a
	// namespace_id" [code 10021]; en produccion crearia un KV que nadie usa.
	session: false,
	output: "server",
	// Vitest loads this config through getViteConfig(); the adapter's Vite plugin
	// would boot a workerd runtime for every test run, so tests run without it.
	adapter: process.env.VITEST ? undefined : cloudflare(),
});
