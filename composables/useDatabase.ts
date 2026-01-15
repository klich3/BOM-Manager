import { useItemsDatabase } from "@/composables/useItemsDatabase";
import { useProjectsDatabase } from "@/composables/useProjectsDatabase";
import { useProjectItemsDatabase } from "@/composables/useProjectItemsDatabase";
import { useActivityDatabase } from "@/composables/useActivityDatabase";
import { useNotificationsDatabase } from "@/composables/useNotificationsDatabase";
import { useSettingsDatabase } from "@/composables/useSettingsDatabase";
import { useFilesDatabase } from "@/composables/useFilesDatabase";
import { useDatabaseAdapter } from "@/composables/useDatabaseAdapter";
import { useDatabaseSchema } from "@/composables/useDatabaseSchema";
import { useTagsDatabase } from "@/composables/useTagsDatabase";
import { useStockMovementsDatabase } from "@/composables/useStockMovementsDatabase";

export const initDatabase = async () => {
	const itemsDb = useItemsDatabase();
	const projectsDb = useProjectsDatabase();
	const projectItemsDb = useProjectItemsDatabase();
	const { getDatabase } = useDatabaseAdapter();
	const { syncSchema } = await useDatabaseSchema();

	// Asegurarse de que las bases de datos estén listas
	try {
		const database = await getDatabase();
		if (database) {
			console.log("Sincronizando esquema de base de datos...");
			await syncSchema(database);
		}

		// Intentar una operación simple para asegurar que la base de datos esté lista
		await itemsDb.getAllItems();
		await projectsDb.getAllProjects();
		await projectItemsDb.getProjectItems("dummy");
	} catch (error) {
		console.error("Error al sincronizar esquema o inicializar tablas:", error);
		console.log("Base de datos aún no completamente inicializada, se hará cuando se necesite");
	}
};

export const useDatabase = () => {
	const itemsDb = useItemsDatabase();
	const projectsDb = useProjectsDatabase();
	const projectItemsDb = useProjectItemsDatabase();
	const activityDb = useActivityDatabase();
	const notificationsDb = useNotificationsDatabase();
	const settingsDb = useSettingsDatabase();
	const filesDb = useFilesDatabase();
	const tagsDb = useTagsDatabase();
	const stockDb = useStockMovementsDatabase();

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
		findItemByReference: itemsDb.findItemByReference,

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
		checkLowStockAndNotify: projectItemsDb.checkLowStockAndNotify,

		// Métodos para actividad
		logActivity: activityDb.logActivity,
		getActivityByTable: activityDb.getActivityByTable,
		getAllActivity: activityDb.getAllActivity,
		getActivityByAction: activityDb.getActivityByAction,

		// Métodos para notificaciones
		createNotification: notificationsDb.createNotification,
		getUnreadNotifications: notificationsDb.getUnreadNotifications,
		getAllNotifications: notificationsDb.getAllNotifications,
		markNotificationAsRead: notificationsDb.markNotificationAsRead,
		markAllNotificationsAsRead: notificationsDb.markAllNotificationsAsRead,
		deleteNotification: notificationsDb.deleteNotification,
		getUnreadNotificationsCount: notificationsDb.getUnreadNotificationsCount,

		// Métodos para configuración
		getSetting: settingsDb.getSetting,
		createSetting: settingsDb.createSetting,
		updateSetting: settingsDb.updateSetting,
		ensureDefaultSettings: settingsDb.ensureDefaultSettings,

		// Métodos para archivos
		createFile: filesDb.createFile,
		getFileById: filesDb.getFileById,
		getFilesByProjectId: filesDb.getFilesByProjectId,
		updateFile: filesDb.updateFile,
		deleteFile: filesDb.deleteFile,
		deleteFilesByProjectId: filesDb.deleteFilesByProjectId,

		// Métodos para etiquetas
		getAllTags: tagsDb.getAllTags,
		createTag: tagsDb.createTag,
		addItemTag: tagsDb.addItemTag,
		removeItemTag: tagsDb.removeItemTag,
		getItemTags: tagsDb.getItemTags,
		getItemsByTag: tagsDb.getItemsByTag,

		// Métodos para movimientos de stock
		logStockMovement: stockDb.logMovement,
		getStockMovements: stockDb.getMovementsByItem,
	};
};
