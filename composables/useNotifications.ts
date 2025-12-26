import { ref, computed } from 'vue';

export interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    duration?: number;
    timestamp: number;
}

const notifications = ref<Notification[]>([]);
const maxNotifications = 5;

export const useNotifications = () => {
    /**
     * Añade una notificación
     */
    const addNotification = (
        type: Notification['type'],
        title: string,
        message: string,
        duration: number = 5000
    ) => {
        const id = crypto.randomUUID();
        const notification: Notification = {
            id,
            type,
            title,
            message,
            duration,
            timestamp: Date.now()
        };

        // Añadir notificación al principio
        notifications.value.unshift(notification);

        // Mantener solo las últimas N notificaciones
        if (notifications.value.length > maxNotifications) {
            notifications.value = notifications.value.slice(0, maxNotifications);
        }

        // Auto-eliminar después de la duración especificada
        if (duration > 0) {
            setTimeout(() => {
                removeNotification(id);
            }, duration);
        }

        return id;
    };

    /**
     * Elimina una notificación por ID
     */
    const removeNotification = (id: string) => {
        const index = notifications.value.findIndex(n => n.id === id);
        if (index !== -1) {
            notifications.value.splice(index, 1);
        }
    };

    /**
     * Limpia todas las notificaciones
     */
    const clearAll = () => {
        notifications.value = [];
    };

    /**
     * Notificación de éxito
     */
    const success = (title: string, message: string = '', duration?: number) => {
        return addNotification('success', title, message, duration);
    };

    /**
     * Notificación de error
     */
    const error = (title: string, message: string = '', duration?: number) => {
        return addNotification('error', title, message, duration || 7000);
    };

    /**
     * Notificación de advertencia
     */
    const warning = (title: string, message: string = '', duration?: number) => {
        return addNotification('warning', title, message, duration || 6000);
    };

    /**
     * Notificación informativa
     */
    const info = (title: string, message: string = '', duration?: number) => {
        return addNotification('info', title, message, duration);
    };

    /**
     * Notificación de stock bajo
     */
    const lowStockAlert = (itemName: string, currentStock: number, minStock: number) => {
        return warning(
            'Stock Bajo',
            `${itemName} tiene solo ${currentStock} unidades (mínimo: ${minStock})`,
            0 // No auto-cerrar
        );
    };

    return {
        notifications: computed(() => notifications.value),
        addNotification,
        removeNotification,
        clearAll,
        success,
        error,
        warning,
        info,
        lowStockAlert
    };
};
