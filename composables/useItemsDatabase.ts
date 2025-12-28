import { useDatabaseAdapter } from '@/composables/useDatabaseAdapter';
import type { BOMItem } from '@/types/bom';
import type { Database } from '@/types/database';

// Función para generar IDs únicos
const generateId = (): string => {
    return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9);
};

export const useItemsDatabase = () => {
    const { getDatabase } = useDatabaseAdapter();

    // Métodos para items
    const getAllItems = async () => {
        const database = await getDatabase();
        if (!database) return [];

        try {
            const result = await database.select<any[]>('SELECT * FROM bom_items ORDER BY created_at DESC');
            return result;
        } catch (error) {
            console.error('Error obteniendo items:', error);
            return [];
        }
    };

    const getItemById = async (id: string) => {
        const database = await getDatabase();
        if (!database) return null;

        try {
            const result = await database.select<any[]>('SELECT * FROM bom_items WHERE id = ?', [id]);
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error('Error obteniendo item:', error);
            return null;
        }
    };

    const createItem = async (item: Partial<BOMItem>) => {
        const database = await getDatabase();
        if (!database) return null;

        try {
            const id = generateId();
            const now = new Date().toISOString();

            await database.execute(
                `INSERT INTO bom_items (id, name, description, quantity, unit, category, supplier, 
         part_number, lcsc_part, price, in_stock, min_stock, notes, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    id,
                    item.name || '',
                    item.description || null,
                    item.quantity || 0,
                    item.unit || '',
                    item.category || null,
                    item.supplier || null,
                    item.partNumber || null,
                    item.lcscPart || null,
                    item.price || null,
                    item.inStock || 0,
                    item.minStock || null,
                    item.notes || null,
                    now,
                    now
                ]
            );

            return id;
        } catch (error) {
            console.error('Error creando item:', error);
            return null;
        }
    };

    const updateItem = async (id: string, item: Partial<BOMItem>) => {
        const database = await getDatabase();
        if (!database) return false;

        try {
            const now = new Date().toISOString();

            await database.execute(
                `UPDATE bom_items SET name = ?, description = ?, quantity = ?, unit = ?, category = ?,
         supplier = ?, part_number = ?, lcsc_part = ?, price = ?, in_stock = ?, min_stock = ?,
         notes = ?, updated_at = ? WHERE id = ?`,
                [
                    item.name,
                    item.description,
                    item.quantity,
                    item.unit,
                    item.category,
                    item.supplier,
                    item.partNumber,
                    item.lcscPart,
                    item.price,
                    item.inStock,
                    item.minStock,
                    item.notes,
                    now,
                    id
                ]
            );

            return true;
        } catch (error) {
            console.error('Error actualizando item:', error);
            return false;
        }
    };

    const deleteItem = async (id: string) => {
        const database = await getDatabase();
        if (!database) return false;

        try {
            await database.execute('DELETE FROM bom_items WHERE id = ?', [id]);
            return true;
        } catch (error) {
            console.error('Error eliminando item:', error);
            return false;
        }
    };

    // Método para actualizar stock de items
    const updateItemStock = async (id: string, newStock: number) => {
        const database = await getDatabase();
        if (!database) return false;

        try {
            const now = new Date().toISOString();
            await database.execute(
                'UPDATE bom_items SET in_stock = ?, updated_at = ? WHERE id = ?',
                [newStock, now, id]
            );
            return true;
        } catch (error) {
            console.error('Error actualizando stock de item:', error);
            return false;
        }
    };

    // Método para descontar stock de items basado en un BOM
    const consumeStockFromBOM = async (bomItems: { id: string; quantity: number }[]) => {
        const database = await getDatabase();
        if (!database) return { success: false, message: 'No se pudo acceder a la base de datos' };

        try {
            // Comenzar transacción
            await database.execute('BEGIN TRANSACTION');

            const errors: string[] = [];
            const now = new Date().toISOString();

            for (const bomItem of bomItems) {
                // Obtener el stock actual del item
                const currentItem = await getItemById(bomItem.id);
                if (!currentItem) {
                    errors.push(`Item con ID ${bomItem.id} no encontrado`);
                    continue;
                }

                const currentStock = currentItem.in_stock || 0;
                const newStock = currentStock - bomItem.quantity;

                if (newStock < 0) {
                    errors.push(`Stock insuficiente para ${currentItem.name}. Requerido: ${bomItem.quantity}, Disponible: ${currentStock}`);
                    continue;
                }

                // Actualizar el stock
                await database.execute(
                    'UPDATE bom_items SET in_stock = ?, updated_at = ? WHERE id = ?',
                    [newStock, now, bomItem.id]
                );
            }

            if (errors.length > 0) {
                // Si hay errores, hacer rollback
                await database.execute('ROLLBACK');
                return { success: false, message: errors.join('; ') };
            } else {
                // Si no hay errores, hacer commit
                await database.execute('COMMIT');
                return { success: true, message: 'Stock actualizado correctamente' };
            }
        } catch (error) {
            // En caso de error, hacer rollback
            await database.execute('ROLLBACK');
            console.error('Error descontando stock:', error);
            return { success: false, message: `Error al descontar stock: ${(error as Error).message}` };
        }
    };

    // Método para agregar stock a items
    const addStockToItems = async (stockUpdates: { id: string; quantity: number }[]) => {
        const database = await getDatabase();
        if (!database) return { success: false, message: 'No se pudo acceder a la base de datos' };

        try {
            // Comenzar transacción
            await database.execute('BEGIN TRANSACTION');

            const errors: string[] = [];
            const now = new Date().toISOString();

            for (const update of stockUpdates) {
                // Obtener el stock actual del item
                const currentItem = await getItemById(update.id);
                if (!currentItem) {
                    errors.push(`Item con ID ${update.id} no encontrado`);
                    continue;
                }

                const currentStock = currentItem.in_stock || 0;
                const newStock = currentStock + update.quantity;

                // Actualizar el stock
                await database.execute(
                    'UPDATE bom_items SET in_stock = ?, updated_at = ? WHERE id = ?',
                    [newStock, now, update.id]
                );
            }

            if (errors.length > 0) {
                // Si hay errores, hacer rollback
                await database.execute('ROLLBACK');
                return { success: false, message: errors.join('; ') };
            } else {
                // Si no hay errores, hacer commit
                await database.execute('COMMIT');
                return { success: true, message: 'Stock actualizado correctamente' };
            }
        } catch (error) {
            // En caso de error, hacer rollback
            await database.execute('ROLLBACK');
            console.error('Error agregando stock:', error);
            return { success: false, message: `Error al agregar stock: ${(error as Error).message}` };
        }
    };

    // Método para obtener items con bajo stock
    const getLowStockItems = async () => {
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
        getAllItems,
        getItemById,
        createItem,
        updateItem,
        deleteItem,
        updateItemStock,
        consumeStockFromBOM,
        addStockToItems,
        getLowStockItems
    };
};