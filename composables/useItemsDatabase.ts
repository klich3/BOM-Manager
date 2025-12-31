import { useDatabaseAdapter } from '@/composables/useDatabaseAdapter';
import { useActivityDatabase } from '@/composables/useActivityDatabase';
import type { BOMItem } from '@/types/bom';
import type { Database } from '@/types/database';
import { convertBomItemToSnake } from '@/composables/useDatabaseUtils';

// Función para generar IDs únicos
const generateId = (): string => {
    return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9);
};

export const useItemsDatabase = () => {
    const { getDatabase } = useDatabaseAdapter();
    const { logActivity } = useActivityDatabase();

    // Métodos para items
    const getAllItems = async () => {
        const database = await getDatabase();
        if (!database) return [];

        try {
            const result = await database.select<any[]>(`
                SELECT 
                    bi.*, 
                    p.name as project_name
                FROM bom_items bi
                LEFT JOIN project_items pi ON bi.id = pi.item_id
                LEFT JOIN projects p ON pi.project_id = p.id
                ORDER BY bi.created_at DESC
            `);
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

            // Convertir los campos de camelCase a snake_case para la base de datos
            const itemForDb = convertBomItemToSnake(item);

            await database.execute(
                `INSERT INTO bom_items (id, name, description, quantity, category, supplier, 
         part_number, lcsc_part, price, in_stock, min_stock, notes, created_at, updated_at, manufacturer, 
         customer_no, package, rohs, ext_price, lead_time, date_code_lot_no, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
                ,
                [
                    id,
                    itemForDb.name || '',
                    itemForDb.description || null,
                    itemForDb.quantity || 0,
                    itemForDb.category || null,
                    itemForDb.supplier || null,
                    itemForDb.part_number || null,
                    itemForDb.lcsc_part || null,
                    itemForDb.price || null,
                    itemForDb.in_stock !== undefined && itemForDb.in_stock !== null ? itemForDb.in_stock : 0,
                    itemForDb.min_stock || null,
                    itemForDb.notes || null,
                    now,
                    now,
                    itemForDb.manufacturer || null,
                    itemForDb.customer_no || null,
                    itemForDb.package || null,
                    itemForDb.rohs || null,
                    itemForDb.ext_price || null,
                    itemForDb.lead_time || null,
                    itemForDb.date_code_lot_no || null,
                    itemForDb.status || null
                ]
            );

            // Registrar actividad
            await logActivity('CREATE', 'bom_items', id, `Item '${item.name || 'sin nombre'}' creado`);

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

            // Convertir los campos de camelCase a snake_case para la base de datos
            const itemForDb = convertBomItemToSnake(item);

            await database.execute(
                `UPDATE bom_items SET name = ?, description = ?, quantity = ?, category = ?,
         supplier = ?, part_number = ?, lcsc_part = ?, price = ?, in_stock = ?, min_stock = ?,
         notes = ?, updated_at = ?, manufacturer = ?, customer_no = ?, package = ?,
         rohs = ?, ext_price = ?, lead_time = ?, date_code_lot_no = ?, status = ? WHERE id = ?`,
                [
                    itemForDb.name,
                    itemForDb.description,
                    itemForDb.quantity,
                    itemForDb.category,
                    itemForDb.supplier,
                    itemForDb.part_number,
                    itemForDb.lcsc_part,
                    itemForDb.price,
                    itemForDb.in_stock,
                    itemForDb.min_stock,
                    itemForDb.notes,
                    now,
                    itemForDb.manufacturer,
                    itemForDb.customer_no,
                    itemForDb.package,
                    itemForDb.rohs,
                    itemForDb.ext_price,
                    itemForDb.lead_time,
                    itemForDb.date_code_lot_no,
                    itemForDb.status,
                    id
                ]
            );

            // Registrar actividad
            await logActivity('UPDATE', 'bom_items', id, `Item '${item.name || 'sin nombre'}' actualizado`);

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
            // Registrar actividad antes de eliminar
            const item = await getItemById(id);
            await database.execute('DELETE FROM bom_items WHERE id = ?', [id]);

            // Registrar actividad
            await logActivity('DELETE', 'bom_items', id, `Item '${item?.name || 'sin nombre'}' eliminado`);

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

            // Obtener el nombre del item para registrar la actividad
            const item = await getItemById(id);
            await logActivity('UPDATE', 'bom_items', id, `Stock de ${item?.name || 'item'} actualizado a ${newStock}`);

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
                // Obtener el item
                const currentItem = await getItemById(bomItem.id);
                if (!currentItem) {
                    errors.push(`Item con ID ${bomItem.id} no encontrado`);
                    continue;
                }

                // Descontar la cantidad requerida del stock actual
                const newStock = (currentItem.in_stock || 0) - bomItem.quantity;
                if (newStock < 0) {
                    errors.push(`Stock insuficiente para ${currentItem.name}. Requerido: ${bomItem.quantity}, Disponible: ${currentItem.in_stock || 0}`);
                    continue;
                }

                await database.execute(
                    'UPDATE bom_items SET in_stock = ?, updated_at = ? WHERE id = ?',
                    [newStock, now, bomItem.id]
                );

                // Registrar actividad
                await logActivity('UPDATE', 'bom_items', bomItem.id, `Stock de ${currentItem.name} actualizado de ${(currentItem.in_stock || 0)} a ${newStock}`);
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
                // Obtener el item
                const currentItem = await getItemById(update.id);
                if (!currentItem) {
                    errors.push(`Item con ID ${update.id} no encontrado`);
                    continue;
                }

                // Agregar la cantidad al stock actual
                const currentStock = (currentItem.in_stock || 0);
                const newStock = currentStock + update.quantity;

                await database.execute(
                    'UPDATE bom_items SET in_stock = ?, updated_at = ? WHERE id = ?',
                    [newStock, now, update.id]
                );

                // Registrar actividad
                await logActivity('UPDATE', 'bom_items', update.id, `Stock de ${currentItem.name} actualizado de ${currentStock} a ${newStock}`);
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
            // Devolver items donde el stock actual es menor o igual al stock mínimo
            const result = await database.select<any[]>(
                'SELECT * FROM bom_items WHERE in_stock IS NOT NULL AND min_stock IS NOT NULL AND in_stock <= min_stock'
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