import { useTauriDatabase } from '@/composables/useTauriDatabase';
import { useWebDatabase } from '@/composables/useWebDatabase';

import type { Database } from '@/types/database';

export const useDatabaseAdapter = () => {
    // Detectar entorno y usar la base de datos adecuada
    const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

    const { getDatabase: getTauriDatabase } = useTauriDatabase();
    const { getDatabase: getWebDatabase } = useWebDatabase();

    const getDatabase = async () => {
        if (isTauri) {
            return await getTauriDatabase();
        } else {
            return await getWebDatabase();
        }
    };

    return {
        getDatabase,
        isTauri
    };
};