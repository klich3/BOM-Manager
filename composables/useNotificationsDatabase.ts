import { useDatabaseAdapter } from '@/composables/useDatabaseAdapter';
import type { Database } from '@/types/database';

// Función para generar IDs únicos
const generateId = (): string => {
    return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9);
};

export const useNotificationsDatabase = () => {
    const { getDatabase } = useDatabaseAdapter();

    // Métodos para notificaciones
    const createNotification = async (title: string, message: string, type: string = 'info') => {
        const database = await getDatabase();
        if (!database) return null;

        try {
            const id = generateId();
            const now = new Date().toISOString();

            await database.execute(
                'INSERT INTO notifications (id, title, message, type, created_at) VALUES (?, ?, ?, ?, ?)',
                [id, title, message, type, now]
            );

            return id;
        } catch (error) {
            console.error('Error creando notificación:', error);
            return null;
        }
    };

    const getUnreadNotifications = async () => {
        const database = await getDatabase();
        if (!database) return [];

        try {
            const result = await database.select<any[]>(
                'SELECT * FROM notifications WHERE is_read = 0 ORDER BY created_at DESC'
            );
            return result;
        } catch (error) {
            console.error('Error obteniendo notificaciones no leídas:', error);
            return [];
        }
    };

    const getAllNotifications = async (limit: number = 50) => {
        const database = await getDatabase();
        if (!database) return [];

        try {
            const result = await database.select<any[]>(
                'SELECT * FROM notifications ORDER BY created_at DESC LIMIT ?',
                [limit]
            );
            return result;
        } catch (error) {
            console.error('Error obteniendo notificaciones:', error);
            return [];
        }
    };

    const markNotificationAsRead = async (id: string) => {
        const database = await getDatabase();
        if (!database) return false;

        try {
            await database.execute(
                'UPDATE notifications SET is_read = 1 WHERE id = ?',
                [id]
            );

            return true;
        } catch (error) {
            console.error('Error marcando notificación como leída:', error);
            return false;
        }
    };

    const markAllNotificationsAsRead = async () => {
        const database = await getDatabase();
        if (!database) return false;

        try {
            await database.execute(
                'UPDATE notifications SET is_read = 1 WHERE is_read = 0'
            );

            return true;
        } catch (error) {
            console.error('Error marcando todas las notificaciones como leídas:', error);
            return false;
        }
    };

    const deleteNotification = async (id: string) => {
        const database = await getDatabase();
        if (!database) return false;

        try {
            await database.execute(
                'DELETE FROM notifications WHERE id = ?',
                [id]
            );

            return true;
        } catch (error) {
            console.error('Error eliminando notificación:', error);
            return false;
        }
    };

    const getUnreadNotificationsCount = async () => {
        const database = await getDatabase();
        if (!database) return 0;

        try {
            const result = await database.select<any[]>(
                'SELECT COUNT(*) as count FROM notifications WHERE is_read = 0'
            );
            return result[0]?.count || 0;
        } catch (error) {
            console.error('Error contando notificaciones no leídas:', error);
            return 0;
        }
    };

    return {
        createNotification,
        getUnreadNotifications,
        getAllNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        getUnreadNotificationsCount
    };
};