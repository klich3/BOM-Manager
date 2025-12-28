import { useDatabaseAdapter } from '@/composables/useDatabaseAdapter';
import type { Database } from '@/types/database';

// Función para generar IDs únicos
const generateId = (): string => {
    return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9);
};

export const useActivityDatabase = () => {
    const { getDatabase } = useDatabaseAdapter();

    // Métodos para actividad
    const logActivity = async (action: string, tableName: string, recordId: string, description?: string, userId?: string) => {
        const database = await getDatabase();
        if (!database) return false;

        try {
            const id = generateId();
            const now = new Date().toISOString();

            await database.execute(
                'INSERT INTO activity (id, action, table_name, record_id, user_id, description, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [id, action, tableName, recordId, userId || null, description || null, now]
            );

            return true;
        } catch (error) {
            console.error('Error registrando actividad:', error);
            return false;
        }
    };

    const getActivityByTable = async (tableName: string, recordId: string) => {
        const database = await getDatabase();
        if (!database) return [];

        try {
            const result = await database.select<any[]>(
                'SELECT * FROM activity WHERE table_name = ? AND record_id = ? ORDER BY created_at DESC',
                [tableName, recordId]
            );
            return result;
        } catch (error) {
            console.error('Error obteniendo actividad:', error);
            return [];
        }
    };

    const getAllActivity = async (limit: number = 50) => {
        const database = await getDatabase();
        if (!database) return [];

        try {
            const result = await database.select<any[]>(
                'SELECT * FROM activity ORDER BY created_at DESC LIMIT ?',
                [limit]
            );
            return result;
        } catch (error) {
            console.error('Error obteniendo actividad:', error);
            return [];
        }
    };

    const getActivityByAction = async (action: string) => {
        const database = await getDatabase();
        if (!database) return [];

        try {
            const result = await database.select<any[]>(
                'SELECT * FROM activity WHERE action = ? ORDER BY created_at DESC',
                [action]
            );
            return result;
        } catch (error) {
            console.error('Error obteniendo actividad por acción:', error);
            return [];
        }
    };

    return {
        logActivity,
        getActivityByTable,
        getAllActivity,
        getActivityByAction
    };
};