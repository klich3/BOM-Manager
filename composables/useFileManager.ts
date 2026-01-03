import { ref } from 'vue';

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
            // En Tauri, guardamos como Data URL para simplicidad
            // En producción, se podría usar tauri-plugin-fs para guardar en directorio específico
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    resolve(e.target?.result as string);
                };
                reader.readAsDataURL(file);
            });
        } catch (error) {
            console.error('Error saving file in Tauri:', error);
            throw new Error('No se pudo guardar el archivo');
        }
    };

    const saveFile = async (file: File, fileName: string): Promise<string> => {
        if (isTauri) {
            return await saveFileToTauri(file, fileName);
        } else {
            return await saveFileToOPFS(file, fileName);
        }
    };

    const deleteFile = async (fileUrl: string): Promise<void> => {
        try {
            // Liberar el objeto URL
            URL.revokeObjectURL(fileUrl);

            if (!isTauri) {
                // @ts-ignore - OPFS support
                const opfsRoot = await navigator.storage.getDirectory();

                // Obtener el nombre del archivo del mapa
                const fileName = fileUrlMap.get(fileUrl);

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
                    console.warn('No se encontró el nombre del archivo para la URL:', fileUrl);
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

    return {
        saveFile,
        deleteFile,
        getStorageInfo,
        isOPFSAvailable,
        isTauri
    };
};