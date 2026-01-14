import { useDatabaseAdapter } from '@/composables/useDatabaseAdapter';
import { useActivityDatabase } from '@/composables/useActivityDatabase';

export const useSettingsDatabase = () => {
    const { getDatabase } = useDatabaseAdapter();
    const { logActivity } = useActivityDatabase();

    // Obtener la configuración
    const getSetting = async (id: string) => {
        const database = await getDatabase();
        if (!database) return null;

        try {
            const result = await database.select<any[]>('SELECT * FROM settings WHERE id = ?', [id]);
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error('Error obteniendo configuración:', error);
            return null;
        }
    };

    // Crear configuración
    const createSetting = async (setting: any) => {
        const database = await getDatabase();
        if (!database) return null;

        try {
            const now = new Date().toISOString();
            await database.execute(
                'INSERT INTO settings (id, currency, items_per_page, language, decimals, theme, country, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    setting.id,
                    setting.currency || 'USD',
                    setting.items_per_page || 20,
                    setting.language || 'es',
                    setting.decimals || 2,
                    setting.theme || 'light',
                    setting.country || 'ES',
                    setting.created_at || now,
                    setting.updated_at || now
                ]
            );

            // Registrar actividad
            await logActivity('CREATE', 'settings', setting.id, `Configuración '${setting.id}' creada`);

            return setting.id;
        } catch (error) {
            console.error('Error creando configuración:', error);
            return null;
        }
    };

    // Actualizar configuración
    const updateSetting = async (id: string, setting: any) => {
        const database = await getDatabase();
        if (!database) return false;

        try {
            const now = new Date().toISOString();
            await database.execute(
                'UPDATE settings SET currency = ?, items_per_page = ?, language = ?, decimals = ?, theme = ?, country = ?, updated_at = ? WHERE id = ?',
                [
                    setting.currency,
                    setting.items_per_page,
                    setting.language,
                    setting.decimals,
                    setting.theme,
                    setting.country,
                    now,
                    id
                ]
            );

            // Registrar actividad
            await logActivity('UPDATE', 'settings', id, `Configuración '${id}' actualizada`);

            return true;
        } catch (error) {
            console.error('Error actualizando configuración:', error);
            return false;
        }
    };

    // Crear configuración por defecto si no existe
    const ensureDefaultSettings = async () => {
        const database = await getDatabase();
        if (!database) return;

        try {
            // Verificar si ya existen las configuraciones
            const existing = await getSetting('main_settings');
            if (!existing) {
                // Crear configuraciones por defecto
                const defaultSettings = {
                    id: 'main_settings',
                    currency: 'USD',
                    items_per_page: 20,
                    language: 'es',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                };

                await createSetting(defaultSettings);
            }
        } catch (error) {
            console.error('Error asegurando configuraciones por defecto:', error);
        }
    };

    return {
        getSetting,
        createSetting,
        updateSetting,
        ensureDefaultSettings
    };
};