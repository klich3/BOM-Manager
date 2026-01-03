import { useDatabaseAdapter } from '@/composables/useDatabaseAdapter';
import { useActivityDatabase } from '@/composables/useActivityDatabase';

export interface FileRecord {
    id: string;
    project_id?: string;
    filename: string;
    filepath: string;
    file_type?: string;
    size?: number;
    title?: string;
    description?: string;
    created_at: string;
}

export const useFilesDatabase = () => {
    const { getDatabase } = useDatabaseAdapter();
    const { logActivity } = useActivityDatabase();

    const createFile = async (file: Omit<FileRecord, 'id' | 'created_at'>): Promise<string> => {
        const database = await getDatabase();
        if (!database) return '';

        const id = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const createdAt = new Date().toISOString();

        const query = `
      INSERT INTO files (id, project_id, filename, filepath, file_type, size, title, description, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        await database.execute(query, [
            id,
            file.project_id,
            file.filename,
            file.filepath,
            file.file_type,
            file.size,
            file.title,
            file.description,
            createdAt
        ]);

        // Registrar actividad
        await logActivity('CREATE', 'files', id, `Archivo '${file.filename}' creado para proyecto ${file.project_id || 'general'}`);

        return id;
    };

    const getFileById = async (id: string): Promise<FileRecord | null> => {
        const database = await getDatabase();
        if (!database) return null;

        const result = await database.select<FileRecord[]>('SELECT * FROM files WHERE id = ?', [id]);

        if (result && result.length > 0) {
            return result[0];
        }

        return null;
    };

    const getFilesByProjectId = async (projectId: string): Promise<FileRecord[]> => {
        const database = await getDatabase();
        if (!database) return [];

        const result = await database.select<FileRecord[]>('SELECT * FROM files WHERE project_id = ?', [projectId]);

        if (result) {
            return result;
        }

        return [];
    };

    const updateFile = async (id: string, updates: Partial<Omit<FileRecord, 'id' | 'created_at'>>): Promise<void> => {
        const database = await getDatabase();
        if (!database) return;

        const updateFields = Object.keys(updates).filter(key => key !== 'id');
        if (updateFields.length === 0) return;

        const setClause = updateFields.map(field => `${field} = ?`).join(', ');
        const values = updateFields.map(field => (updates as any)[field]);
        values.push(id);

        const query = `UPDATE files SET ${setClause} WHERE id = ?`;
        await database.execute(query, values);

        // Registrar actividad
        await logActivity('UPDATE', 'files', id, `Archivo actualizado`);
    };

    const deleteFile = async (id: string): Promise<void> => {
        const database = await getDatabase();
        if (!database) return;

        // Obtener información del archivo antes de eliminarlo para el registro de actividad
        const file = await getFileById(id);

        await database.execute('DELETE FROM files WHERE id = ?', [id]);

        // Registrar actividad
        await logActivity('DELETE', 'files', id, `Archivo '${file?.filename || 'desconocido'}' eliminado`);
    };

    const deleteFilesByProjectId = async (projectId: string): Promise<void> => {
        const database = await getDatabase();
        if (!database) return;

        // Obtener archivos antes de eliminarlos para el registro de actividad
        const files = await getFilesByProjectId(projectId);

        await database.execute('DELETE FROM files WHERE project_id = ?', [projectId]);

        // Registrar actividad para cada archivo eliminado
        for (const file of files) {
            await logActivity('DELETE', 'files', file.id, `Archivo '${file.filename}' eliminado por eliminación en cascada del proyecto ${projectId}`);
        }
    };

    return {
        createFile,
        getFileById,
        getFilesByProjectId,
        updateFile,
        deleteFile,
        deleteFilesByProjectId
    };
};