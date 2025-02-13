import node from "@astrojs/node";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";

export default defineConfig({
  integrations: [tailwind(), react()],
  compressHTML: true,
  prefetch: true,
  devToolbar: {
    enabled: false,
  },
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
  i18n: {
    defaultLocale: "es", // Idioma por defecto
    locales: ["es", "en", "fr"], // Idiomas soportados
    routing: {
      prefixDefaultLocale: true, // Añade el prefijo del idioma por defecto
    },
  },
});