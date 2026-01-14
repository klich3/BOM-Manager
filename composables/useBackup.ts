import { useDatabase } from '@/composables/useDatabase';
import { useLists } from '@/composables/useLists';
import { useFileManager } from '@/composables/useFileManager';
import { useDatabaseAdapter } from '@/composables/useDatabaseAdapter';
import JSZip from 'jszip';

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

    // Exportar la copia de seguridad completa con archivos (ZIP)
    const exportBackupZip = async () => {
        try {
            const zip = new JSZip();
            const { getDatabase } = useDatabaseAdapter();
            const dbInstance = await getDatabase();
            const { isTauri } = useFileManager();

            if (!dbInstance) throw new Error('No se pudo conectar a la base de datos');

            // 1. Exportar datos de todas las tablas como JSON
            const tablesResult = await dbInstance.select<{ name: string }[]>(
                "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
            );
            const tables = tablesResult.map((t: any) => t.name);
            const dbData: Record<string, any[]> = {};

            for (const table of tables) {
                dbData[table] = await dbInstance.select(`SELECT * FROM ${table}`);
            }

            zip.file('database.json', JSON.stringify(dbData, null, 2));

            // 2. Exportar archivos físicos
            const fileRecords = dbData['files'] || [];
            const filesFolder = zip.folder('files');

            if (filesFolder) {
                for (const fileRec of fileRecords) {
                    try {
                        // Intentar obtener el archivo según el entorno
                        let fileBlob: Blob | null = null;

                        if (isTauri) {
                            // En Tauri, si es una data URL, convertir a blob
                            if (fileRec.filepath.startsWith('data:')) {
                                const response = await fetch(fileRec.filepath);
                                fileBlob = await response.blob();
                            } else {
                                // TODO: En Tauri con archivos persistentes, leer del disco
                                console.warn('Lectura de archivos físicos en Tauri no implementada para backup');
                            }
                        } else {
                            // En Web/OPFS
                            const opfsRoot = await navigator.storage.getDirectory();
                            try {
                                const fileHandle = await opfsRoot.getFileHandle(fileRec.filename);
                                const file = await fileHandle.getFile();
                                fileBlob = file;
                            } catch (e) {
                                console.warn(`Archivo no encontrado en OPFS: ${fileRec.filename}`);
                            }
                        }

                        if (fileBlob) {
                            filesFolder.file(fileRec.filename, fileBlob);
                        }
                    } catch (err) {
                        console.error(`Error agregando archivo ${fileRec.filename} al ZIP:`, err);
                    }
                }
            }

            // Generar el ZIP
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(zipBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `bom_backup_full_${new Date().toISOString().slice(0, 10)}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            return true;
        } catch (error) {
            console.error('Error exporting full backup ZIP:', error);
            throw error;
        }
    };

    // Importar una copia de seguridad completa (ZIP)
    const importBackupZip = async (file: File): Promise<boolean> => {
        try {
            const zip = new JSZip();
            const contents = await zip.loadAsync(file);
            const { getDatabase } = useDatabaseAdapter();
            const dbInstance = await getDatabase();
            const { saveFile, isTauri } = useFileManager();

            if (!dbInstance) throw new Error('No se pudo conectar a la base de datos');

            // 1. Importar Base de Datos
            const dbJsonFile = contents.file('database.json');
            if (!dbJsonFile) throw new Error('El ZIP no contiene database.json');

            const dbJsonContent = await dbJsonFile.async('text');
            const dbData = JSON.parse(dbJsonContent);

            // Limpiar y rellenar tablas (solo las que están en el JSON)
            for (const table of Object.keys(dbData)) {
                try {
                    await dbInstance.execute(`DELETE FROM ${table}`);
                    const rows = dbData[table];
                    for (const row of rows) {
                        const columns = Object.keys(row);
                        const placeholders = columns.map(() => '?').join(', ');
                        const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
                        await dbInstance.execute(query, columns.map(c => row[c]));
                    }
                } catch (e) {
                    console.warn(`Error importando tabla ${table}:`, e);
                }
            }

            // 2. Importar Archivos
            const filesFolder = contents.folder('files');
            if (filesFolder) {
                const files = Object.keys(filesFolder.files).filter(path => !filesFolder.files[path].dir);
                for (const filePath of files) {
                    const zipFile = filesFolder.file(filePath);
                    if (zipFile) {
                        const fileName = filePath.split('/').pop() || filePath;
                        const fileBlob = await zipFile.async('blob');
                        const newFile = new File([fileBlob], fileName, { type: 'application/octet-stream' });

                        // Guardar en el sistema de archivos local
                        await saveFile(newFile, fileName);
                    }
                }
            }

            return true;
        } catch (error) {
            console.error('Error importing full backup ZIP:', error);
            throw error;
        }
    };

    return {
        createBackup,
        exportBackup,
        importBackup,
        exportBackupZip,
        importBackupZip
    };
};