import { useDatabaseAdapter } from '@/composables/useDatabaseAdapter';

export interface Tag {
    id: string;
    name: string;
    color: string;
    created_at: string;
}

export const useTagsDatabase = () => {
    const { getDatabase } = useDatabaseAdapter();

    const getAllTags = async (): Promise<Tag[]> => {
        const database = await getDatabase();
        if (!database) return [];
        try {
            return await database.select<Tag[]>('SELECT * FROM tags ORDER BY name ASC');
        } catch (error) {
            console.error('Error getting tags:', error);
            return [];
        }
    };

    const createTag = async (name: string, color: string = '#3B82F6'): Promise<string | null> => {
        const database = await getDatabase();
        if (!database) return null;

        const id = `tag_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        const now = new Date().toISOString();

        try {
            await database.execute(
                'INSERT INTO tags (id, name, color, created_at) VALUES (?, ?, ?, ?)',
                [id, name, color, now]
            );
            return id;
        } catch (error) {
            console.error('Error creating tag:', error);
            return null;
        }
    };

    const addItemTag = async (itemId: string, tagId: string) => {
        const database = await getDatabase();
        if (!database) return false;
        try {
            await database.execute(
                'INSERT OR IGNORE INTO item_tags (item_id, tag_id) VALUES (?, ?)',
                [itemId, tagId]
            );
            return true;
        } catch (error) {
            console.error('Error adding item tag:', error);
            return false;
        }
    };

    const removeItemTag = async (itemId: string, tagId: string) => {
        const database = await getDatabase();
        if (!database) return false;
        try {
            await database.execute(
                'DELETE FROM item_tags WHERE item_id = ? AND tag_id = ?',
                [itemId, tagId]
            );
            return true;
        } catch (error) {
            console.error('Error removing item tag:', error);
            return false;
        }
    };

    const getItemTags = async (itemId: string): Promise<Tag[]> => {
        const database = await getDatabase();
        if (!database) return [];
        try {
            return await database.select<Tag[]>(
                `SELECT t.* FROM tags t 
                 JOIN item_tags it ON t.id = it.tag_id 
                 WHERE it.item_id = ?`,
                [itemId]
            );
        } catch (error) {
            console.error('Error getting item tags:', error);
            return [];
        }
    };

    const getItemsByTag = async (tagId: string) => {
        const database = await getDatabase();
        if (!database) return [];
        try {
            return await database.select<any[]>(
                'SELECT item_id FROM item_tags WHERE tag_id = ?',
                [tagId]
            );
        } catch (error) {
            console.error('Error getting items by tag:', error);
            return [];
        }
    };

    return {
        getAllTags,
        createTag,
        addItemTag,
        removeItemTag,
        getItemTags,
        getItemsByTag
    };
};
