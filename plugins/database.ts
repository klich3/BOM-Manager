import { defineNuxtPlugin } from 'nuxt/app';
import { initDatabase } from '@/composables/useDatabase';

export default defineNuxtPlugin(async (nuxtApp) => {
  // Inicializar la base de datos cuando la app arranca
  if (typeof window !== 'undefined') {
    try {
      await initDatabase();
      console.log('Base de datos inicializada correctamente');
    } catch (error) {
      console.error('Error al inicializar la base de datos:', error);
    }
  }
});