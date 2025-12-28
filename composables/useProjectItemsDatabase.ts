import { useDatabaseAdapter } from '@/composables/useDatabaseAdapter';
import { useActivityDatabase } from '@/composables/useActivityDatabase';
import type { Database } from '@/types/database';

// Función para generar IDs únicos
const generateId = (): string => {
    return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9);
};

export const useProjectItemsDatabase = () => {
    const { getDatabase } = useDatabaseAdapter();
    const { logActivity } = useActivityDatabase();

    // Métodos para la relación proyecto-items
    const getProjectItems = async (projectId: string) => {
        const database = await getDatabase();
        if (!database) return [];

        try {
            const result = await database.select<any[]>(`
        SELECT pi.*, bi.*, pi.quantity as project_quantity
        FROM project_items pi
        JOIN bom_items bi ON pi.item_id = bi.id
        WHERE pi.project_id = ?
        ORDER BY pi.created_at DESC
      `, [projectId]);
            return result;
        } catch (error) {
            console.error('Error obteniendo items del proyecto:', error);
            return [];
        }
    };

    const addItemToProject = async (projectId: string, itemId: string, quantity: number = 1) => {
        const database = await getDatabase();
        if (!database) return false;

        try {
            const id = generateId();
            const now = new Date().toISOString();

            await database.execute(
                'INSERT OR REPLACE INTO project_items (id, project_id, item_id, quantity, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
                [id, projectId, itemId, quantity, now, now]
            );

            // Registrar actividad
            await logActivity('CREATE', 'project_items', id, `Item agregado al proyecto ${projectId}`);

            return true;
        } catch (error) {
            console.error('Error agregando item al proyecto:', error);
            return false;
        }
    };

    const removeItemFromProject = async (projectId: string, itemId: string) => {
        const database = await getDatabase();
        if (!database) return false;

        try {
            // Registrar actividad antes de eliminar
            await database.execute(
                'DELETE FROM project_items WHERE project_id = ? AND item_id = ?',
                [projectId, itemId]
            );

            // Registrar actividad
            await logActivity('DELETE', 'project_items', `${projectId}-${itemId}`, `Item ${itemId} removido del proyecto ${projectId}`);

            return true;
        } catch (error) {
            console.error('Error removiendo item del proyecto:', error);
            return false;
        }
    };

    const updateProjectItemQuantity = async (projectId: string, itemId: string, quantity: number) => {
        const database = await getDatabase();
        if (!database) return false;

        try {
            const now = new Date().toISOString();

            await database.execute(
                'UPDATE project_items SET quantity = ?, updated_at = ? WHERE project_id = ? AND item_id = ?',
                [quantity, now, projectId, itemId]
            );

            // Registrar actividad
            await logActivity('UPDATE', 'project_items', `${projectId}-${itemId}`, `Cantidad actualizada para item ${itemId} en proyecto ${projectId}`);

            return true;
        } catch (error) {
            console.error('Error actualizando cantidad de item en proyecto:', error);
            return false;
        }
    };

    // Método para verificar stock y notificar items bajos
    const checkLowStockAndNotify = async () => {
        const database = await getDatabase();
        if (!database) return [];

        try {
            const result = await database.select<any[]>(
                'SELECT * FROM bom_items WHERE in_stock < (min_stock || 0) OR (min_stock IS NOT NULL AND in_stock <= min_stock)'
            );
            return result;
        } catch (error) {
            console.error('Error obteniendo items con bajo stock:', error);
            return [];
        }
    };

    return {
        getProjectItems,
        addItemToProject,
        removeItemFromProject,
        updateProjectItemQuantity,
        checkLowStockAndNotify
    };
};