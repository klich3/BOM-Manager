import { useDatabaseAdapter } from '@/composables/useDatabaseAdapter';

export interface StockMovement {
    id: string;
    item_id: string;
    type: 'IN' | 'OUT' | 'ADJUST';
    quantity: number;
    previous_stock: number;
    new_stock: number;
    reason?: string;
    created_at: string;
}

export const useStockMovementsDatabase = () => {
    const { getDatabase } = useDatabaseAdapter();

    const logMovement = async (movement: Omit<StockMovement, 'id' | 'created_at'>) => {
        const database = await getDatabase();
        if (!database) return null;

        const id = `mov_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();

        try {
            await database.execute(
                'INSERT INTO stock_movements (id, item_id, type, quantity, previous_stock, new_stock, reason, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    id,
                    movement.item_id,
                    movement.type,
                    movement.quantity,
                    movement.previous_stock,
                    movement.new_stock,
                    movement.reason || null,
                    now
                ]
            );
            return id;
        } catch (error) {
            console.error('Error logging stock movement:', error);
            return null;
        }
    };

    const getMovementsByItem = async (itemId: string): Promise<StockMovement[]> => {
        const database = await getDatabase();
        if (!database) return [];

        try {
            return await database.select<StockMovement[]>(
                'SELECT * FROM stock_movements WHERE item_id = ? ORDER BY created_at DESC',
                [itemId]
            );
        } catch (error) {
            console.error('Error getting movements by item:', error);
            return [];
        }
    };

    return {
        logMovement,
        getMovementsByItem
    };
};
