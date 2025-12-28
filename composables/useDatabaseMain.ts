import { useDatabaseAdapter } from '@/composables/useDatabaseAdapter';

import type { Database } from '@/types/database';

export const useDatabaseMain = () => {
    const { getDatabase, isTauri } = useDatabaseAdapter();

    return {
        getDatabase,
        isTauri
    };
};