import { useItemsDatabase } from '@/composables/useItemsDatabase';
import { useProjectsDatabase } from '@/composables/useProjectsDatabase';
import { useProjectItemsDatabase } from '@/composables/useProjectItemsDatabase';

export const initDatabase = async () => {
  const itemsDb = useItemsDatabase();
  const projectsDb = useProjectsDatabase();
  const projectItemsDb = useProjectItemsDatabase();

  // Asegurarse de que las bases de datos estén listas
  try {
    // Intentar una operación simple para asegurar que la base de datos esté lista
    await itemsDb.getAllItems();
    await projectsDb.getAllProjects();
    await projectItemsDb.getProjectItems('dummy');
  } catch (error) {
    console.log('Base de datos aún no completamente inicializada, se hará cuando se necesite');
  }
};

export const useDatabase = () => {
  const itemsDb = useItemsDatabase();
  const projectsDb = useProjectsDatabase();
  const projectItemsDb = useProjectItemsDatabase();

  return {
    // Métodos para items
    getAllItems: itemsDb.getAllItems,
    getItemById: itemsDb.getItemById,
    createItem: itemsDb.createItem,
    updateItem: itemsDb.updateItem,
    deleteItem: itemsDb.deleteItem,
    updateItemStock: itemsDb.updateItemStock,
    consumeStockFromBOM: itemsDb.consumeStockFromBOM,
    addStockToItems: itemsDb.addStockToItems,
    getLowStockItems: itemsDb.getLowStockItems,

    // Métodos para proyectos
    getAllProjects: projectsDb.getAllProjects,
    getProjectById: projectsDb.getProjectById,
    createProject: projectsDb.createProject,
    updateProject: projectsDb.updateProject,
    deleteProject: projectsDb.deleteProject,

    // Métodos para la relación proyecto-items
    getProjectItems: projectItemsDb.getProjectItems,
    addItemToProject: projectItemsDb.addItemToProject,
    removeItemFromProject: projectItemsDb.removeItemFromProject,
    updateProjectItemQuantity: projectItemsDb.updateProjectItemQuantity,
    checkLowStockAndNotify: projectItemsDb.checkLowStockAndNotify
  };
};