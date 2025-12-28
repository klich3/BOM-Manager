import { useDatabaseAdapter } from '@/composables/useDatabaseAdapter';
import { useActivityDatabase } from '@/composables/useActivityDatabase';
import { useNotificationsDatabase } from '@/composables/useNotificationsDatabase';
import type { Database } from '@/types/database';

export const useDatabaseMain = () => {
    const { getDatabase, isTauri } = useDatabaseAdapter();
    const activityDb = useActivityDatabase();
    const notificationsDb = useNotificationsDatabase();

    return {
        getDatabase,
        isTauri,
        ...activityDb,
        ...notificationsDb
    };
};