import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, envField } from "astro/config";
import compress from "astro-compress";
import { DEFAULT_LOCALE, LOCALE_META, LOCALES } from "./src/i18n/locales.ts";

const SITE_URL = "https://khelde.vercel.app";

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
			VITE_API_URL: envField.string({
				context: "client",
				access: "public",
			}),
			API_SECRET_TOKEN: envField.string({
				context: "server",
				access: "secret",
			}),
		},
	},
	output: "server",
	adapter: vercel(),
});
