import { ref } from 'vue';
import { FileRecord } from '@/composables/useFilesDatabase';

const isTauri = typeof window !== "undefined" && !!(window as any).__TAURI_INTERNALS__;

// Función para eliminar archivos en Tauri
const deleteTauriFile = async (filePath: string) => {
    if (!isTauri) return;

    // Verificar si es una ruta de archivo real o una Data URL
    if (filePath.startsWith('data:')) {
        // Si es una Data URL, no hay archivo físico que eliminar, solo registrar
        console.debug('Data URL en Tauri marcada para eliminación (no hay archivo físico):', filePath);
    } else {
        // Si es una ruta de archivo real, intentar eliminar usando el plugin de sistema de archivos
        // Si el plugin está disponible, lo usamos; de lo contrario, solo registramos la intención
        try {
            // Intentar importar dinámicamente el plugin de Tauri
            const fsModule = await import('@tauri-apps/plugin-fs');

            // Usar la función remove si existe
            if ('remove' in fsModule && typeof fsModule.remove === 'function') {
                await fsModule.remove(filePath);
                console.log('Archivo eliminado de Tauri:', filePath);
            } else {
                console.debug('Función de eliminación no disponible en el plugin de Tauri, registrando eliminación:', filePath);
            }
        } catch (error) {
            console.debug('Plugin de sistema de archivos de Tauri no disponible, registrando eliminación:', filePath, error);
            // Si el plugin no está disponible, solo registramos la intención de eliminación
        }
    }
};

export interface FileInfo {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
    createdAt: Date;
}

export const useFileManager = () => {
    const isTauri = typeof window !== "undefined" && !!(window as any).__TAURI_INTERNALS__;

    // Mapa para rastrear nombres de archivo por URL (solo para web/OPFS)
    const fileUrlMap = new Map<string, string>();

    // Para web: usar OPFS (Origin Private File System)
    const saveFileToOPFS = async (file: File, fileName: string): Promise<string> => {
        try {
            // @ts-ignore - OPFS support
            const opfsRoot = await navigator.storage.getDirectory();
            const fileHandle = await opfsRoot.getFileHandle(fileName, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(file);
            await writable.close();

            // Retornar URL para acceder al archivo
            const fileData = await fileHandle.getFile();
            const url = URL.createObjectURL(fileData);

            // Guardar mapeo URL -> nombre de archivo para eliminación posterior
            fileUrlMap.set(url, fileName);

            return url;
        } catch (error) {
            console.error('Error saving file to OPFS:', error);
            throw new Error('No se pudo guardar el archivo localmente');
        }
    };

    // Para Tauri: usar sistema de archivos del sistema operativo
    const saveFileToTauri = async (file: File, fileName: string): Promise<string> => {
        try {
            // Intentar usar el plugin de sistema de archivos de Tauri
            const fsModule = await import('@tauri-apps/plugin-fs');

            // Convertir el archivo a texto si es posible
            const textContent = await file.text();

            // Verificar si la función writeTextFile existe
            if ('writeTextFile' in fsModule && typeof fsModule.writeTextFile === 'function') {
                await fsModule.writeTextFile(fileName, textContent);
            } else if ('writeFile' in fsModule && typeof fsModule.writeFile === 'function') {
                // Convertir el contenido a ArrayBuffer si writeTextFile no está disponible
                const encoder = new TextEncoder();
                const data = encoder.encode(textContent);
                await fsModule.writeFile(fileName, data);
            } else {
                // Si ninguna función está disponible, lanzar un error para usar el fallback
                throw new Error('Funciones de escritura no disponibles en el plugin de Tauri');
            }

            // Devolver la ruta del archivo guardado
            return fileName;
        } catch (error) {
            console.error('Error saving file in Tauri:', error);
            // Si el plugin no está disponible o no se puede leer como texto, usar Data URL como fallback
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    resolve(e.target?.result as string);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const saveFile = async (file: File, fileName: string): Promise<string> => {
        if (isTauri) {
            return await saveFileToTauri(file, fileName);
        } else {
            return await saveFileToOPFS(file, fileName);
        }
    };

    const deleteFile = async (fileInfo: string | FileRecord): Promise<void> => {
        try {
            // Determinar la URL o filepath a partir del parámetro
            let fileUrl: string;
            let fileNameToUse: string | undefined;

            if (typeof fileInfo === 'string') {
                fileUrl = fileInfo;
            } else {
                // Si es un objeto FileRecord, determinar qué usar basado en si filepath es blob o no
                if (fileInfo.filepath.startsWith('blob:')) {
                    // Si filepath es una URL blob, usamos filepath para buscar en el mapa y filename para eliminar
                    fileUrl = fileInfo.filepath;
                    fileNameToUse = fileInfo.filename;
                } else {
                    // Si filepath no es blob, usamos filepath normalmente
                    fileUrl = fileInfo.filepath;
                }
            }

            // Liberar el objeto URL
            URL.revokeObjectURL(fileUrl);

            if (isTauri) {
                // En Tauri, para eliminar archivos temporales, usamos la función específica
                // Solo liberamos la URL ya que los archivos en Tauri se manejan como Data URLs
                // y no se almacenan en el sistema de archivos como en web/OPFS
                await deleteTauriFile(fileUrl);
            } else {
                // @ts-ignore - OPFS support
                const opfsRoot = await navigator.storage.getDirectory();

                // Obtener el nombre del archivo del mapa
                const fileName = fileUrlMap.get(fileUrl) || fileNameToUse;

                if (fileName) {
                    try {
                        await opfsRoot.removeEntry(fileName);
                        // Eliminar del mapa
                        fileUrlMap.delete(fileUrl);
                        console.log('Archivo eliminado de OPFS:', fileName);
                    } catch (error) {
                        // Archivo puede no existir, ignorar
                        console.debug('File not found in OPFS:', fileName);
                        // Limpiar el mapa igualmente
                        fileUrlMap.delete(fileUrl);
                    }
                } else {
                    // Si no encontramos el nombre en el mapa, intentar encontrarlo por coincidencia
                    // Esto es útil cuando se recibe una URL blob directamente
                    console.debug('No se encontró el nombre del archivo para la URL:', fileUrl);

                    // Intentar encontrar el archivo por su nombre en el mapa buscando coincidencias
                    for (const [url, name] of fileUrlMap.entries()) {
                        if (url === fileUrl) {
                            try {
                                await opfsRoot.removeEntry(name);
                                // Eliminar del mapa
                                fileUrlMap.delete(url);
                                console.log('Archivo eliminado de OPFS (por coincidencia):', name);
                                break;
                            } catch (error) {
                                console.debug('File not found in OPFS (by name):', name);
                                // Limpiar el mapa igualmente
                                fileUrlMap.delete(url);
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    };

    // Obtener información de almacenamiento disponible
    const getStorageInfo = async (): Promise<{
        quota: number;
        usage: number;
        available: number
    } | null> => {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            try {
                const estimate = await navigator.storage.estimate();
                return {
                    quota: estimate.quota || 0,
                    usage: estimate.usage || 0,
                    available: (estimate.quota || 0) - (estimate.usage || 0)
                };
            } catch (error) {
                console.error('Error getting storage estimate:', error);
                return null;
            }
        }
        return null;
    };

    // Verificar si OPFS está disponible
    const isOPFSAvailable = (): boolean => {
        return 'storage' in navigator && 'getDirectory' in navigator.storage;
    };

    // Función para obtener un archivo por su nombre
    const getFileByName = async (fileName: string): Promise<string | null> => {
        if (isTauri) {
            // En Tauri, no podemos recuperar archivos por nombre ya que se convierten a Data URLs
            // Esta funcionalidad dependerá de cómo se implemente el almacenamiento persistente en Tauri
            console.warn('getFileByName no está completamente implementado para Tauri');
            return null;
        } else {
            // En web con OPFS, intentamos recuperar el archivo por nombre
            // Pero primero verificamos si fileName es una URL blob o una ruta, y extraemos solo el nombre real
            try {
                // Extraer el nombre real del archivo si fileName es una ruta completa o URL
                const cleanFileName = fileName.split('/').pop()?.split('\\').pop() || fileName;

                // @ts-ignore - OPFS support
                const opfsRoot = await navigator.storage.getDirectory();
                const fileHandle = await opfsRoot.getFileHandle(cleanFileName);
                const file = await fileHandle.getFile();
                const url = URL.createObjectURL(file);

                // Guardar mapeo URL -> nombre de archivo para futuras referencias
                fileUrlMap.set(url, cleanFileName);

                return url;
            } catch (error) {
                console.error('Error getting file by name from OPFS:', error);
                return null;
            }
        }
    };

    // Función para limpiar archivos huérfanos
    const cleanupOrphanFiles = async (validFileNames: string[]) => {
        if (isTauri) {
            console.warn('cleanupOrphanFiles no está implementado para Tauri todavía');
            return { success: false, message: 'No implementado para Tauri' };
        }

        try {
            // @ts-ignore - OPFS support
            const opfsRoot = await navigator.storage.getDirectory();
            let count = 0;

            // @ts-ignore
            for await (const entry of opfsRoot.values()) {
                if (entry.kind === 'file') {
                    if (!validFileNames.includes(entry.name)) {
                        console.log(`Eliminando archivo huérfano: ${entry.name}`);
                        await opfsRoot.removeEntry(entry.name);
                        count++;
                    }
                }
            }

            return { success: true, count };
        } catch (error) {
            console.error('Error durante la limpieza de archivos huérfanos:', error);
            return { success: false, error };
        }
    };

    return {
        saveFile,
        deleteFile,
        getStorageInfo,
        isOPFSAvailable,
        isTauri,
        getFileByName,
        cleanupOrphanFiles
    };
};