import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import swup from "@swup/astro";
import compress from "astro-compress";
import { defineConfig } from "astro/config";

export default defineConfig({
  integrations: [
    tailwind(),
    react(),
    swup({ theme: false }),
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
  site: "https://khelde.vercel.app/",
});
