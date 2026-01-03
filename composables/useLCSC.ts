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
    const { createFile } = useFilesDatabase();
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    // Función para buscar un componente por número de parte
    const searchComponent = async (partNumber: string, itemId?: string): Promise<LCSCComponent | null> => {
        isLoading.value = true;
        error.value = null;

        try {
            // Esta es una implementación simulada ya que necesitamos una clave API real para acceder a LCSC
            // En la implementación real, usaríamos la API oficial de LCSC
            console.log(`Buscando componente LCSC: ${partNumber}`);

            // Simulación de respuesta de la API
            // En la implementación real, haríamos una llamada a la API de LCSC
            const response = await simulateLCSCAPI(partNumber, itemId);

            return response;
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

                        // Registrar en la tabla files
                        await createFile({
                            filename: fileName,
                            filepath: localUrl,
                            file_type: 'image/jpeg',
                            size: file.size,
                            title: `Imagen LCSC para ${partNumber}`,
                            description: `Imagen del componente LCSC ${partNumber}`,
                        });
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

    // Simulación de la API de LCSC para desarrollo
    const simulateLCSCAPI = async (partNumber: string, itemId?: string): Promise<LCSCComponent> => {
        // Simulación de un retraso de red
        await new Promise(resolve => setTimeout(resolve, 500));

        // Obtener datos del item de la base de datos si se proporciona el ID
        let itemData = { description: `Descripción del componente ${partNumber} desde LCSC`, manufacturer: '-', category: '-', package: '-', tolerance: '-', voltage: '-' };
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

        // Obtener imágenes y guardarlas localmente
        const images = await getComponentImages(partNumber, itemId);

        // Obtener y guardar el PDF del datasheet localmente
        let datasheetUrl = `https://datasheet.lcsc.com/${partNumber}.pdf`;
        try {
            // Intentar descargar y guardar el PDF localmente
            const pdfResponse = await fetch(datasheetUrl);
            if (pdfResponse.ok) {
                const pdfBlob = await pdfResponse.blob();
                const fileName = itemId ? `lcsc-datasheet-${partNumber}-${itemId}.pdf` : `lcsc-datasheet-${partNumber}.pdf`;
                const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });

                // Guardar PDF localmente
                const localPdfUrl = await saveFile(pdfFile, fileName);
                datasheetUrl = localPdfUrl;

                // Registrar en la tabla files
                await createFile({
                    filename: fileName,
                    filepath: localPdfUrl,
                    file_type: 'application/pdf',
                    size: pdfFile.size,
                    title: `Datasheet LCSC para ${partNumber}`,
                    description: `Datasheet del componente LCSC ${partNumber}`,
                });
            }
        } catch (pdfError) {
            console.error('Error descargando PDF del datasheet:', pdfError);
            // Si falla la descarga/local, mantener la URL original
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