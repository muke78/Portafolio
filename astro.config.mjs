import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
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
