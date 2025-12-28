import { useTauriDatabase } from '@/composables/useTauriDatabase';
import { useWebDatabase } from '@/composables/useWebDatabase';

import type { Database } from '@/types/database';

export const useDatabaseAdapter = () => {
    // Detectar entorno y usar la base de datos adecuada
    const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

    const { getDatabase: getTauriDatabase } = useTauriDatabase();
    const { select, execute } = useWebDatabase();

    const getDatabase = async () => {
        if (isTauri) {
            return await getTauriDatabase();
        } else {
            // Para entorno web, retornamos un objeto compatible con la interfaz Database
            return {
                select,
                execute
            };
        }
    };

    return {
        getDatabase,
        isTauri
    };
};