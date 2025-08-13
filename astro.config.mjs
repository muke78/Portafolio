import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import compress from "astro-compress";
import { defineConfig, envField } from "astro/config";

export default defineConfig({
  site: "https://khelde.vercel.app",
  integrations: [
    react({
      include: ["**/react/*", "**/components/**/*"],
      experimentalReactChildren: false,
    }),
    sitemap({
      i18n: {
        defaultLocale: "es",
        locales: {
          en: "en-US",
          es: "es-ES",
          fr: "fr-CA",
        },
      },
    }),
    compress({
      CSS: true,
      HTML: true,
      Image: false,
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
    defaultLocale: "es",
    locales: ["es", "en", "fr"],
    routing: {
      prefixDefaultLocale: true,
    },
  },
  vite: {
    define: {
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV || "development",
      ),
    },
    build: {
      minify: "esbuild",
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react", "react-dom"],
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
      VITE_BOT_TOKEN: envField.string({ context: "client", access: "public" }),
      VITE_CHAT_ID: envField.string({ context: "client", access: "public" }),
      TURSO_DATABASE_URL: envField.string({
        context: "client",
        access: "public",
      }),
      TURSO_AUTH_TOKEN: envField.string({
        context: "client",
        access: "public",
      }),
    },
  },
});
