import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import compress from "astro-compress";
import { defineConfig, envField } from "astro/config";
import { DEFAULT_LOCALE, LOCALE_META, LOCALES } from "./src/i18n/locales.ts";

const bcp47s = Object.fromEntries(
  LOCALES.map((locale) => [locale, LOCALE_META[locale].bcp47]),
);

export default defineConfig({
  site: "https://khelde.vercel.app",
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
    // "manual": routes outside [lang]/* (like /admin, /api/*) used to get
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
      ADMIN_PASSWORD: envField.string({
        context: "server",
        access: "secret",
      }),
      ADMIN_SESSION_SECRET: envField.string({
        context: "server",
        access: "secret",
      }),
    },
  },
  output: "server",
  adapter: vercel(),
});
