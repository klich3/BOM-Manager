import { useDatabaseAdapter } from '@/composables/useDatabaseAdapter';
import type { BOMProject } from '@/types/bom';
import type { Database } from '@/types/database';

// Función para generar IDs únicos
const generateId = (): string => {
    return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9);
};

export const useProjectsDatabase = () => {
    const { getDatabase } = useDatabaseAdapter();

    // Métodos para proyectos
    const getAllProjects = async () => {
        const database = await getDatabase();
        if (!database) return [];

        try {
            const result = await database.select<any[]>('SELECT * FROM projects ORDER BY created_at DESC');
            return result;
        } catch (error) {
            console.error('Error obteniendo proyectos:', error);
            return [];
        }
    };

    const getProjectById = async (id: string) => {
        const database = await getDatabase();
        if (!database) return null;

        try {
            const result = await database.select<any[]>('SELECT * FROM projects WHERE id = ?', [id]);
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error('Error obteniendo proyecto:', error);
            return null;
        }
    };

    const createProject = async (project: Partial<BOMProject>) => {
        const database = await getDatabase();
        if (!database) return null;

        try {
            const id = generateId();
            const now = new Date().toISOString();

            await database.execute(
                'INSERT INTO projects (id, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
                [id, project.name || '', project.description || null, now, now]
            );

            return id;
        } catch (error) {
            console.error('Error creando proyecto:', error);
            return null;
        }
    };

    const updateProject = async (id: string, project: Partial<BOMProject>) => {
        const database = await getDatabase();
        if (!database) return false;

        try {
            const now = new Date().toISOString();

            await database.execute(
                'UPDATE projects SET name = ?, description = ?, updated_at = ? WHERE id = ?',
                [project.name, project.description, now, id]
            );

            return true;
        } catch (error) {
            console.error('Error actualizando proyecto:', error);
            return false;
        }
    };

    const deleteProject = async (id: string) => {
        const database = await getDatabase();
        if (!database) return false;

        try {
            await database.execute('DELETE FROM projects WHERE id = ?', [id]);
            return true;
        } catch (error) {
            console.error('Error eliminando proyecto:', error);
            return false;
        }
    };

    return {
        getAllProjects,
        getProjectById,
        createProject,
        updateProject,
        deleteProject
    };
};