export default defineNuxtPlugin(async () => {
  // Inicializar la base de datos cuando la app arranca
  if (process.client) {
    try {
      const { initDatabase } = useDatabase();
      await initDatabase();
      console.log('Base de datos inicializada correctamente');
    } catch (error) {
      console.error('Error al inicializar la base de datos:', error);
    }
  }
});
