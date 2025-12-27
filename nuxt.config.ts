// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss'],

  ssr: false,

  css: ['@/assets/css/app.css'],

  vite: {
    clearScreen: false,
    envPrefix: ['VITE_', 'TAURI_'],
    server: {
      strictPort: true,
      hmr: {
        overlay: false
      }
    },
    optimizeDeps: {
      include: ['@tauri-apps/plugin-sql']
    }
  },

  nitro: {
    wasm: false
  },

  experimental: {
    inlineSSRStyles: true,

    watcher: "parcel", // 'chokidar' or 'parcel' are also options
    defaults: {
      nuxtLink: {
        trailingSlash: "remove", // 'append | remove' según tu preferencia quito o pone slash al final de la url
      },
    },
  },
})
