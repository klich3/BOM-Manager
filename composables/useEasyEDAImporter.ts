import { ref } from 'vue';

export const useEasyEDAImporter = () => {
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    // Función para importar un template de EasyEDA desde un archivo JSON
    const importTemplate = async (file: File): Promise<any> => {
        isLoading.value = true;
        error.value = null;

        try {
            // Verificar que el archivo sea JSON
            if (!file.name.endsWith('.json')) {
                throw new Error('El archivo debe ser un archivo JSON válido');
            }

            // Leer el contenido del archivo
            const content = await readFileAsText(file);

            // Parsear el JSON
            const jsonData = JSON.parse(content);

            // Validar que sea un formato de EasyEDA válido
            if (!isValidEasyEDATemplate(jsonData)) {
                throw new Error('El archivo no contiene un formato de EasyEDA válido');
            }

            // Procesar el template y extraer componentes
            const components = extractComponentsFromTemplate(jsonData);

            return {
                success: true,
                components,
                metadata: extractMetadata(jsonData),
                message: `Template importado exitosamente: ${components.length} componentes encontrados`
            };
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Error desconocido al importar el template';
            return {
                success: false,
                components: [],
                message: error.value
            };
        } finally {
            isLoading.value = false;
        }
    };

    // Función para leer archivo como texto
    const readFileAsText = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error('Error al leer el archivo'));
            reader.readAsText(file);
        });
    };

    // Función para validar si es un template de EasyEDA válido
    const isValidEasyEDATemplate = (data: any): boolean => {
        // Verificar si tiene las propiedades mínimas de un archivo de EasyEDA
        return (
            (data.hasOwnProperty('head') || data.hasOwnProperty('type') || data.hasOwnProperty('modules')) &&
            (typeof data === 'object')
        );
    };

    // Función para extraer componentes del template
    const extractComponentsFromTemplate = (jsonData: any): any[] => {
        const components: any[] = [];

        // Buscar componentes en diferentes posibles ubicaciones del archivo JSON
        if (jsonData.head && jsonData.head.symbols) {
            // Formato de esquemático
            for (const [id, symbol] of Object.entries(jsonData.head.symbols)) {
                if (typeof symbol === 'object' && symbol !== null) {
                    components.push({
                        id,
                        ...symbol,
                        type: 'symbol'
                    });
                } else {
                    components.push({
                        id,
                        data: symbol,
                        type: 'symbol'
                    });
                }
            }
        }

        if (jsonData.modules && jsonData.modules.symbols) {
            // Otro formato posible
            for (const [id, symbol] of Object.entries(jsonData.modules.symbols)) {
                if (typeof symbol === 'object' && symbol !== null) {
                    components.push({
                        id,
                        ...symbol,
                        type: 'symbol'
                    });
                } else {
                    components.push({
                        id,
                        data: symbol,
                        type: 'symbol'
                    });
                }
            }
        }

        // Buscar componentes en el campo 'shapes' o 'parts'
        if (jsonData.shapes) {
            for (const shape of jsonData.shapes) {
                if (shape.type === 'lib') { // Componentes de librería
                    components.push({
                        id: shape.id || shape.gId,
                        name: shape.title || shape.name || 'Componente sin nombre',
                        type: 'component',
                        properties: shape
                    });
                }
            }
        }

        if (jsonData.parts) {
            for (const part of jsonData.parts) {
                components.push({
                    id: part.id || part.partID,
                    name: part.name || part.title || 'Componente sin nombre',
                    type: 'part',
                    properties: part
                });
            }
        }

        return components;
    };

    // Función para extraer metadatos del template
    const extractMetadata = (jsonData: any): any => {
        const metadata: any = {};

        if (jsonData.head) {
            metadata.title = jsonData.head.title || jsonData.head.name;
            metadata.author = jsonData.head.author;
            metadata.created = jsonData.head.created;
            metadata.modified = jsonData.head.modified;
        }

        if (jsonData.modules && jsonData.modules.title) {
            metadata.title = metadata.title || jsonData.modules.title;
        }

        metadata.componentCount = extractComponentsFromTemplate(jsonData).length;

        return metadata;
    };

    // Función para convertir componentes de EasyEDA a nuestro formato interno
    const convertToInternalFormat = (components: any[]): any[] => {
        return components.map(component => {
            // Mapear propiedades de EasyEDA a nuestro formato interno
            return {
                name: component.name || component.title || 'Componente sin nombre',
                description: component.properties?.description || component.properties?.desc || '',
                category: component.properties?.category || 'Electrónico',
                supplier: 'EasyEDA',
                part_number: component.properties?.partNumber || component.properties?.lcsc || '',
                lcsc_part: component.properties?.lcsc || component.properties?.partNumber || '',
                price: 0, // No disponible en el template
                in_stock: 0, // No disponible en el template
                min_stock: 0, // No disponible en el template
                unit: component.properties?.unit || 'pcs',
                quantity: component.properties?.quantity || 1,
                notes: `Importado desde EasyEDA template. Tipo: ${component.type}`
            };
        });
    };

    return {
        isLoading,
        error,
        importTemplate,
        convertToInternalFormat
    };
};