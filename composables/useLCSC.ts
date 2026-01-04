import { ref } from 'vue';
import { useFileManager } from '@/composables/useFileManager';
import { useFilesDatabase } from '@/composables/useFilesDatabase';
import { useItemsDatabase } from '@/composables/useItemsDatabase';

interface LCSCComponent {
    partNumber: string;
    name?: string;
    description?: string;
    image?: string;
    images?: string[];
    datasheet?: string;
    price?: number;
    stock?: number;
    manufacturer?: string;
    category?: string;
    parameters?: Record<string, any>;
}

export const useLCSC = () => {
    const { saveFile } = useFileManager();
    const { createFileForItem } = useFilesDatabase();
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    // Función para buscar un componente por número de parte
    const searchComponent = async (partNumber: string, itemId?: string): Promise<LCSCComponent | null> => {
        isLoading.value = true;
        error.value = null;

        try {
            let itemData = {
                description: `Descripción del componente ${partNumber} desde LCSC`,
                manufacturer: '-', category: '-', package: '-', tolerance: '-', voltage: '-'
            };

            if (itemId) {
                try {
                    const { getItemById } = useItemsDatabase();
                    const item = await getItemById(itemId);
                    if (item) {
                        itemData = {
                            description: item.description || `Descripción del componente ${partNumber} desde LCSC`,
                            manufacturer: item.manufacturer || '-',
                            category: item.category || '-',
                            package: item.package || '-',
                            tolerance: item.tolerance || '-',
                            voltage: item.voltage || '-'
                        };
                    }
                } catch (error) {
                    console.error('Error obteniendo datos del item:', error);
                }
            }

            // Primero intentar obtener imágenes guardadas localmente desde la base de datos
            let images: string[] = [];
            if (itemId) {
                try {
                    const { getFilesByItem } = useItemsDatabase();
                    const itemFiles = await getFilesByItem(itemId);

                    // Filtrar solo las imágenes LCSC para este componente
                    const existingLCSCImages = itemFiles.filter(file =>
                        file.filename.startsWith(`lcsc-image-${partNumber}`) &&
                        file.file_type?.startsWith('image/')
                    );

                    // Agregar las URLs/nombres de archivo de las imágenes existentes
                    for (const file of existingLCSCImages) {
                        // Verificar si la imagen está disponible localmente
                        try {
                            // Si el filepath es un blob o una URL local, usar directamente
                            if (file.filepath.startsWith('data:')) {
                                images.push(file.filepath);
                            } else {
                                // Si es un nombre de archivo, intentar obtenerlo del OPFS
                                const { getFileByName } = useFileManager();
                                const localUrl = await getFileByName(file.filename);

                                if (localUrl) {
                                    images.push(localUrl);
                                } else {
                                    // Si no se puede obtener del OPFS, usar el filepath almacenado
                                    images.push(file.filepath);
                                }
                            }
                        } catch (fileError) {
                            console.error('Error obteniendo imagen local:', fileError);
                            // Si falla al obtener la imagen local, usar el filepath almacenado
                            images.push(file.filepath);
                        }
                    }
                } catch (error) {
                    console.error('Error obteniendo imágenes guardadas:', error);
                }
            }

            // Si no hay imágenes guardadas, obtener nuevas imágenes
            if (!images.length) {
                images = await getComponentImages(partNumber, itemId);
            }

            // Primero intentar obtener PDF del datasheet guardado localmente
            let datasheetUrl = `https://datasheet.lcsc.com/${partNumber}.pdf`;

            if (itemId) {
                try {
                    const { getPdfFilesByItem } = useItemsDatabase();
                    const itemPdfFiles = await getPdfFilesByItem(itemId);

                    console.log("---<1", itemPdfFiles)

                    // Filtrar solo el PDF del datasheet LCSC para este componente
                    const existingLCSCDatasheet = itemPdfFiles.find(file => {
                        const basePattern = `lcsc-datasheet-${partNumber}`;
                        const fullPatternWithId = itemId ? `${basePattern}-${itemId}.pdf` : null;
                        return file.filename.startsWith(basePattern) &&
                            (file.filename === `${basePattern}.pdf` || (fullPatternWithId && file.filename.startsWith(fullPatternWithId.replace('.pdf', ''))));
                    });

                    // Si encontramos un PDF existente, verificar si está disponible localmente
                    if (existingLCSCDatasheet) {
                        try {
                            if (existingLCSCDatasheet.filepath.startsWith('data:')) {
                                datasheetUrl = existingLCSCDatasheet.filepath;
                            } else {
                                // Si es un nombre de archivo, intentar obtenerlo del OPFS
                                const { getFileByName } = useFileManager();
                                const localUrl = await getFileByName(existingLCSCDatasheet.filename);
                                if (localUrl) {
                                    datasheetUrl = localUrl;
                                } else {
                                    // Si no se puede obtener del OPFS, usar el filepath almacenado
                                    datasheetUrl = existingLCSCDatasheet.filepath;
                                }
                            }
                        } catch (fileError) {
                            console.error('Error obteniendo PDF local:', fileError);
                            // Si falla al obtener el PDF local, usar el filepath almacenado
                            datasheetUrl = existingLCSCDatasheet.filepath;
                        }
                    }
                } catch (error) {
                    console.error('Error obteniendo PDF guardado:', error);
                }
            }

            // Si no hay PDF guardado localmente, descargar y guardar uno nuevo
            if (datasheetUrl.startsWith('https://')) {
                // Verificar si estamos en Tauri para usar métodos nativos
                const isTauri = typeof window !== "undefined" && !!(window as any).__TAURI_INTERNALS__;

                // En ambos entornos (Tauri y web), usar el FileManager para manejar correctamente los archivos
                try {
                    // Descargar el PDF
                    const response = await fetch(`https://datasheet.lcsc.com/${partNumber}.pdf`);
                    if (response.ok) {
                        const arrayBuffer = await response.arrayBuffer();
                        const fileName = itemId ? `lcsc-datasheet-${partNumber}-${itemId}.pdf` : `lcsc-datasheet-${partNumber}.pdf`;

                        // Crear un File para usar con el FileManager
                        const file = new File([arrayBuffer], fileName, { type: 'application/pdf' });

                        // Usar el FileManager para guardar el archivo (esto lo guarda en OPFS o en Tauri según el entorno)
                        const localUrl = await saveFile(file, fileName);

                        datasheetUrl = localUrl;

                        // Registrar en la tabla files
                        if (itemId) {
                            try {
                                await createFileForItem({
                                    filename: fileName,
                                    filepath: localUrl,
                                    file_type: 'application/pdf',
                                    size: arrayBuffer.byteLength,
                                    title: `Datasheet LCSC para ${partNumber}`,
                                    description: `Datasheet del componente LCSC ${partNumber}`,
                                }, itemId);
                            } catch (error) {
                                console.error("Error creando registro de archivo:", error);
                            }
                        }
                    }
                } catch (pdfError) {
                    console.error('Error descargando PDF del datasheet:', pdfError);

                    // Si falla la descarga directa, usar el endpoint proxy como fallback
                    try {
                        const serverResponse: { localUrl?: string, filename?: string, size?: number, error?: string } = await $fetch('/api/proxy-file', {
                            method: 'POST',
                            body: {
                                url: `https://datasheet.lcsc.com/${partNumber}.pdf`,
                                filename: itemId ? `lcsc-datasheet-${partNumber}-${itemId}.pdf` : `lcsc-datasheet-${partNumber}.pdf`,
                                type: 'application/pdf'
                            }
                        });

                        if (serverResponse && serverResponse.localUrl && serverResponse.filename && serverResponse.size) {
                            // El proxy devuelve base64, necesitamos convertirlo a blob y guardarlo con FileManager
                            const base64Data = serverResponse.localUrl.split(',')[1]; // Extraer datos base64
                            const binaryString = atob(base64Data);
                            const bytes = new Uint8Array(binaryString.length);
                            for (let i = 0; i < binaryString.length; i++) {
                                bytes[i] = binaryString.charCodeAt(i);
                            }

                            // Crear File desde el ArrayBuffer
                            const file = new File([bytes], serverResponse.filename, { type: 'application/pdf' });

                            // Guardar usando FileManager (OPFS/Tauri)
                            const localUrl = await saveFile(file, serverResponse.filename);

                            datasheetUrl = localUrl;

                            // Registrar en la tabla files
                            if (itemId) {
                                try {
                                    await createFileForItem({
                                        filename: serverResponse.filename,
                                        filepath: localUrl,
                                        file_type: 'application/pdf',
                                        size: serverResponse.size,
                                        title: `Datasheet LCSC para ${partNumber}`,
                                        description: `Datasheet del componente LCSC ${partNumber}`,
                                    }, itemId);
                                } catch (error) {
                                    console.error("Error creando registro de archivo:", error);
                                }
                            }
                        }
                    } catch (proxyError) {
                        console.error('Error usando proxy para descargar PDF:', proxyError);
                    }
                }
            }

            // Datos simulados para el componente
            return {
                partNumber,
                name: `Componente ${partNumber}`,
                description: itemData.description,
                image: '', // Placeholder for single image
                images,
                datasheet: datasheetUrl,
                price: Math.random() * 10, // Precio aleatorio para simulación
                stock: Math.floor(Math.random() * 1000), // Stock aleatorio para simulación
                manufacturer: itemData.manufacturer,
                category: itemData.category,
                parameters: {
                    tolerance: itemData.tolerance,
                    package: itemData.package,
                    voltage: itemData.voltage
                }
            };
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Error desconocido al buscar el componente';
            return null;
        } finally {
            isLoading.value = false;
        }
    };

    /**
     * Función para obtener las URLs de las imágenes del componente
     * @param partNumber 
     * @returns Promise<string[]> array de URLs de imágenes
     * 
     */
    const getComponentImages = async (partNumber: string, itemId?: string): Promise<string[]> => {
        // En la implementación real, estas URLs vendrían de la API de LCSC
        try {
            const result: { count: number, images: string[] } = await $fetch('/api/images', {
                query: { url: `https://lcsc.com/product-detail/${partNumber}.html` },
            });

            if (result && result.images) {
                // Guardar imágenes localmente y registrar en la tabla files
                const localImageUrls: string[] = [];

                for (let i = 0; i < result.images.length; i++) {
                    const imageUrl = result.images[i];
                    try {
                        // Crear nombre de archivo único para cada imagen
                        // Incluimos índice para identificar cada imagen individualmente
                        const imageIndex = i + 1;
                        const fileName = itemId ?
                            `lcsc-image-${partNumber}-${itemId}-${imageIndex}.jpg` :
                            `lcsc-image-${partNumber}-${imageIndex}.jpg`;

                        // Descargar la imagen
                        const response = await fetch(imageUrl);
                        const blob = await response.blob();
                        const file = new File([blob], fileName, { type: 'image/jpeg' });

                        // Guardar imagen localmente
                        const localUrl = await saveFile(file, fileName);
                        localImageUrls.push(localUrl);

                        if (itemId) {
                            try {
                                console.log('Guardando imagen localmente:', fileName, itemId);

                                // Registrar en la tabla files
                                await createFileForItem({
                                    filename: fileName,
                                    filepath: localUrl,
                                    file_type: 'image/jpeg',
                                    size: file.size,
                                    title: `Imagen LCSC para ${partNumber}`,
                                    description: `Imagen del componente LCSC ${partNumber}`,
                                }, itemId);
                            } catch (error) {
                                console.error("Error creando registro de archivo:", error);
                            }
                        }
                    } catch (downloadError) {
                        console.error('Error descargando imagen:', downloadError);
                        // Si falla la descarga/local, usar la URL original
                        localImageUrls.push(imageUrl);
                    }
                }

                return localImageUrls;
            }
            return [];
        } catch (err) {
            console.error('Error fetching component images:', err);
            return [];
        }
    };

    // Función para obtener el link de compra directa
    const getPurchaseLink = (partNumber: string): string => {
        return `https://lcsc.com/product-detail/${partNumber}.html`;
    };

    // Función para validar si un número de parte LCSC es válido
    const validatePartNumber = (partNumber: string): boolean => {
        // Los números de parte LCSC típicamente siguen patrones específicos
        // Por ejemplo: C123456, R123456, etc.
        const lcscPattern = /^[A-Z]\d{6,}$/i;
        return lcscPattern.test(partNumber);
    };

    return {
        isLoading,
        error,
        searchComponent,
        getComponentImages,
        getPurchaseLink,
        validatePartNumber
    };
};