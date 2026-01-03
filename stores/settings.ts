import { defineStore } from 'pinia';
import { useDatabase } from '@/composables/useDatabase';

export interface Settings {
    id: string;
    currency: string;
    items_per_page: number;
    language: string;
    created_at: string;
    updated_at: string;
}

export const useSettingsStore = defineStore('settings', {
    state: () => ({
        settings: {
            id: 'main_settings',
            currency: 'USD',
            items_per_page: 20,
            language: 'es',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        } as Settings,
        loaded: false,
    }),

    actions: {
        async loadSettings() {
            try {
                const db = useDatabase();
                let settings = await db.getSetting('main_settings');

                if (!settings) {
                    // Si no existen configuraciones, crearlas con valores por defecto
                    settings = {
                        id: 'main_settings',
                        currency: 'USD',
                        items_per_page: 20,
                        language: 'es',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    };

                    await db.createSetting(settings);
                    settings = await db.getSetting('main_settings');
                }

                if (settings) {
                    this.settings = settings;
                }
                this.loaded = true;
            } catch (error) {
                console.error('Error loading settings:', error);
                // Usar valores por defecto si hay un error
                this.settings = {
                    id: 'main_settings',
                    currency: 'USD',
                    items_per_page: 20,
                    language: 'es',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                };
                this.loaded = true;
            }
        },

        async saveSettings() {
            try {
                const db = useDatabase();
                const now = new Date().toISOString();

                // Actualizar la fecha de modificación
                this.settings.updated_at = now;

                // Guardar en la base de datos
                await db.updateSetting(this.settings.id, {
                    ...this.settings,
                    updated_at: now,
                });
            } catch (error) {
                console.error('Error saving settings:', error);
            }
        },

        updateCurrency(currency: string) {
            this.settings.currency = currency;
            this.saveSettings();
        },

        updateItemsPerPage(itemsPerPage: number) {
            this.settings.items_per_page = itemsPerPage;
            this.saveSettings();
        },

        updateLanguage(language: string) {
            this.settings.language = language;
            this.saveSettings();
        },
    },
});