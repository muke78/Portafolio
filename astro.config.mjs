import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import compress from "astro-compress";
import { defineConfig, envField } from "astro/config";

export default defineConfig({
  site: "https://khelde.vercel.app/es/home",
  integrations: [
    tailwind(),
    react(),
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
      JavaScript: true,
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
    build: {
      minify: true,
    },
  },
  env: {
    schema: {
      VITE_BOT_TOKEN: envField.string({ context: "client", access: "public" }),
      VITE_CHAT_ID: envField.string({ context: "client", access: "public" }),
    },
  },
});
