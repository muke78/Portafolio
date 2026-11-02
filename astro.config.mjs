import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, envField } from "astro/config";
import compress from "astro-compress";
import { DEFAULT_LOCALE, LOCALE_META, LOCALES } from "./src/i18n/locales.ts";

// Unica fuente de la URL del sitio: canonicos, sitemap y robots.txt salen de
// aqui. Con dominio propio: define SITE_URL en las variables de build.
const SITE_URL = (
	process.env.SITE_URL ??
	"https://portafolio.erickm-gonzalez-rivera.workers.dev"
).replace(/\/+$/, "");

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
			// valor manda; al tener dominio propio, cambia aqui o en el panel.
			VITE_API_URL: envField.string({
				context: "client",
				access: "public",
				default:
					"https://backend-portafolio.erickm-gonzalez-rivera.workers.dev/api",
			}),
			// Origen publico del bucket R2 (imagenes). Con dominio propio:
			// https://media.khelde.dev. Ver src/lib/media.ts.
			PUBLIC_MEDIA_URL: envField.string({
				context: "client",
				access: "public",
				default: "https://pub-a3fda08feb4f417fa5634c34e7959461.r2.dev",
			}),
			API_SECRET_TOKEN: envField.string({
				context: "server",
				access: "secret",
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
