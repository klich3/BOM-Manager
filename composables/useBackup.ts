import { useDatabase } from './useDatabase';
import { useLists } from './useLists';
import { invoke } from '@tauri-apps/api/core';

// Definición de la estructura de respaldo
export interface BackupData {
    items: any[];
    projects: any[];
    lists: any[];
    createdAt: Date;
    version: string;
}

export const useBackup = () => {
    const db = useDatabase();
    const lists = useLists();

    // Crear una copia de seguridad completa
    const createBackup = async (): Promise<BackupData> => {
        try {
            const items = await db.getAllItems();
            const projects = await db.getAllProjects();
            const allLists = lists.lists; // Acceder a las listas desde el composable

            return {
                items,
                projects,
                lists: allLists ? allLists.value : [], // Extraer valor del ref
                createdAt: new Date(),
                version: '1.0.0'
            };
        } catch (error) {
            console.error('Error creating backup:', error);
            throw error;
        }
    };

    // Exportar la copia de seguridad como archivo
    const exportBackup = async () => {
        try {
            const backupData = await createBackup();
            const content = JSON.stringify(backupData, null, 2);

            // Usar invoke para llamar a una función de Rust que maneje el guardado de archivos
            // Por ahora, usaremos un enfoque más simple con download

            // Crear un Blob con los datos
            const blob = new Blob([content], { type: 'application/json' });

            // Crear un enlace temporal para descargar el archivo
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `bom_backup_${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            return true;
        } catch (error) {
            console.error('Error exporting backup:', error);
            throw error;
        }
    };

    // Importar una copia de seguridad
    const importBackup = async (file: File): Promise<boolean> => {
        try {
            const content = await file.text();
            const backupData: BackupData = JSON.parse(content);

            // Validar estructura de respaldo
            if (!backupData.items || !backupData.projects || !backupData.lists || !backupData.version) {
                throw new Error('Archivo de respaldo inválido');
            }

            // Importar items
            for (const item of backupData.items) {
                // Usar el ID existente o crear uno nuevo
                const itemId = item.id;
                const existingItem = await db.getItemById(itemId);

                if (existingItem) {
                    // Actualizar item existente
                    await db.updateItem(itemId, item);
                } else {
                    // Crear nuevo item (ajustando la estructura si es necesario)
                    await db.createItem(item);
                }
            }

            // Importar proyectos
            for (const project of backupData.projects) {
                const projectId = project.id;
                const existingProject = await db.getProjectById(projectId);

                if (existingProject) {
                    // Actualizar proyecto existente
                    await db.updateProject(projectId, project);
                } else {
                    // Crear nuevo proyecto
                    await db.createProject(project);
                }
            }

            // Importar listas
            for (const list of backupData.lists) {
                // Usar el composable de listas para crear la lista
                lists.createList({
                    name: list.name,
                    description: list.description,
                    items: list.items
                });
            }

            return true;
        } catch (error) {
            console.error('Error importing backup:', error);
            throw error;
        }
    };

    return {
        createBackup,
        exportBackup,
        importBackup
    };
};