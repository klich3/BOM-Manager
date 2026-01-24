import { defineNuxtConfig } from 'nuxt/config';
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  ssr: false,
  css: ["@/assets/css/app.css"],
  modules: ["@nuxtjs/tailwindcss", "@pinia/nuxt"],

  router: {
    options: {
      linkActiveClass: "menu-active",
      linkExactActiveClass: "exact-active",
    },
  },

  devServer: {
    port: 8211
  },

  vite: {
    clearScreen: false,
    envPrefix: ["VITE_", "TAURI_"],

    server: {
      strictPort: true,

      hmr: {
        overlay: false,
      },

      headers: {
        "Cross-Origin-Embedder-Policy": "require-corp",
        "Cross-Origin-Opener-Policy": "same-origin",
      },
    },

    optimizeDeps: {
      include: ["@tauri-apps/plugin-sql"],
      exclude: ['@sqlite.org/sqlite-wasm'],
    },

    plugins: [
      wasm(),
      topLevelAwait()
    ],
  },

  nitro: {
    preset: "static",
    routeRules: {
      '**': {
        headers: {
          'Cross-Origin-Embedder-Policy': 'require-corp',
          'Cross-Origin-Opener-Policy': 'same-origin',
        },
      },
    },
  },

  experimental: {
    watcher: "parcel", // 'chokidar' or 'parcel' are also options
    defaults: {
      nuxtLink: {
        trailingSlash: "remove", // 'append | remove' según tu preferencia quito o pone slash al final de la url
      },
    },
  },
});