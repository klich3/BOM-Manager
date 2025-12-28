import { useDatabase } from '@/composables/useDatabase';
import { useNotifications } from '@/composables/useNotifications';

export const useLowStock = () => {
    const db = useDatabase();
    const { lowStockAlert } = useNotifications();

    // Verificar items con bajo stock y enviar notificaciones
    const checkAndNotifyLowStock = async () => {
        try {
            const lowStockItems = await db.getLowStockItems();

            // Para cada item con bajo stock, enviar una notificación
            lowStockItems.forEach(item => {
                const itemName = item.name || 'Item desconocido';
                const currentStock = item.in_stock || 0;
                const minStock = item.min_stock || 0;

                // Enviar notificación de stock bajo
                lowStockAlert(itemName, currentStock, minStock);
            });

            return {
                success: true,
                lowStockItems,
                message: `Se encontraron ${lowStockItems.length} items con bajo stock`
            };
        } catch (error) {
            console.error('Error verificando stock bajo:', error);
            return {
                success: false,
                lowStockItems: [],
                message: 'Error al verificar stock bajo'
            };
        }
    };

    // Obtener solo los items con bajo stock sin enviar notificaciones
    const getLowStockItems = async () => {
        return await db.getLowStockItems();
    };

    // Método para verificar si un item específico está por debajo del stock mínimo
    const isItemLowStock = (item: any) => {
        const currentStock = item.in_stock || 0;
        const minStock = item.min_stock || 0;
        return currentStock < minStock;
    };

    // Método para actualizar el stock mínimo de un item
    const updateMinStock = async (id: string, minStock: number) => {
        const item = await db.getItemById(id);
        if (!item) {
            return { success: false, message: 'Item no encontrado' };
        }

        // Actualizar el item con el nuevo stock mínimo
        const updatedItem = {
            ...item,
            min_stock: minStock
        };

        const result = await db.updateItem(id, updatedItem);
        if (result) {
            // Si el stock actual es menor al nuevo stock mínimo, enviar notificación
            if ((item.in_stock || 0) < minStock) {
                lowStockAlert(item.name, item.in_stock || 0, minStock);
            }

            return { success: true, message: 'Stock mínimo actualizado' };
        } else {
            return { success: false, message: 'Error al actualizar stock mínimo' };
        }
    };

    return {
        checkAndNotifyLowStock,
        getLowStockItems,
        isItemLowStock,
        updateMinStock
    };
};