import { defineStore } from 'pinia';
import type { BOMItem } from '@/types/bom';
import type { ParseResult } from '@/composables/useFileParser';

export interface ImportState {
    step: number;
    selectedFile: File | null;
    sampleData: {
        headers: string[];
        rows: any[][];
    } | null;
    parseResult: ParseResult;
    parsedItems: Partial<BOMItem>[];
    isProcessing: boolean;
    columnMapping: Record<string, string>;
    projects: any[];
    importDestination: 'global' | 'project';
    selectedProjectId: string;
    showImportModal: boolean;
}

export const useImportStore = defineStore('import', {
    state: (): ImportState => ({
        step: 1,
        selectedFile: null,
        sampleData: null,
        parseResult: {
            success: false,
            items: [],
            errors: [],
            warnings: [],
        },
        parsedItems: [],
        isProcessing: false,
        columnMapping: {},
        projects: [],
        importDestination: 'global',
        selectedProjectId: '',
        showImportModal: false,
    }),

    getters: {
        canProceed: (state) => {
            if (state.step === 1) {
                return !!state.selectedFile;
            } else if (state.step === 2) {
                // Check if required fields are mapped
                const requiredFields = [
                    { key: "name", label: "Nombre" },
                    { key: "quantity", label: "Cantidad" },
                    { key: "unit", label: "Unidad" },
                ];
                return requiredFields.every((field) => {
                    const mappedValue = state.columnMapping[field.key];
                    return mappedValue && typeof mappedValue === "string" && mappedValue.trim() !== "";
                });
            }
            return true;
        },
        requiredFields: () => [
            { key: "name", label: "Nombre" },
            { key: "quantity", label: "Cantidad" },
            { key: "unit", label: "Unidad" },
        ],
        optionalFields: () => [
            { key: "description", label: "Descripción" },
            { key: "category", label: "Categoría" },
            { key: "supplier", label: "Proveedor" },
            { key: "partNumber", label: "Número de parte" },
            { key: "lcscPart", label: "Referencia LCSC" },
            { key: "price", label: "Precio" },
            { key: "inStock", label: "Stock actual" },
            { key: "minStock", label: "Stock mínimo" },
            { key: "notes", label: "Notas" },
            { key: "manufacturer", label: "Fabricante" },
            { key: "customerNo", label: "Número de Cliente" },
            { key: "package", label: "Empaquetado" },
            { key: "rohs", label: "RoHS" },
            { key: "extPrice", label: "Precio Extendido" },
            { key: "leadTime", label: "Tiempo de Entrega" },
            { key: "dateCodeLotNo", label: "Código de Fecha/Número de Lote" },
            { key: "status", label: "Estado" },
            { key: "createdAt", label: "Fecha de Creación" },
            { key: "updatedAt", label: "Fecha de Actualización" },
        ],
    },

    actions: {
        setStep(step: number) {
            this.step = step;
        },

        setSelectedFile(file: File | null) {
            this.selectedFile = file;
        },

        setSampleData(data: ImportState['sampleData']) {
            this.sampleData = data;
        },

        setParseResult(result: ParseResult) {
            this.parseResult = result;
        },

        setParsedItems(items: Partial<BOMItem>[]) {
            this.parsedItems = items;
        },

        setIsProcessing(processing: boolean) {
            this.isProcessing = processing;
        },

        setColumnMapping(mapping: Record<string, string>) {
            this.columnMapping = mapping;
        },

        setProjects(projects: any[]) {
            this.projects = projects;
        },

        setImportDestination(destination: 'global' | 'project') {
            this.importDestination = destination;
        },

        setSelectedProjectId(projectId: string) {
            this.selectedProjectId = projectId;
        },

        setShowImportModal(show: boolean) {
            this.showImportModal = show;
        },

        resetImport() {
            this.step = 1;
            this.selectedFile = null;
            this.sampleData = null;
            this.parseResult = {
                success: false,
                items: [],
                errors: [],
                warnings: [],
            };
            this.parsedItems = [];
            this.isProcessing = false;
            this.columnMapping = {};
        },

        goToStep(step: number) {
            if (step >= 1 && step <= 3) {
                this.step = step;
            }
        },

        goToNextStep() {
            if (this.step < 3) {
                this.step++;
            }
        },

        goToPreviousStep() {
            if (this.step > 1) {
                this.step--;
            }
        },

        canProceedToNextStep() {
            if (this.step === 1) {
                return !!this.selectedFile;
            } else if (this.step === 2) {
                // Check if required fields are mapped
                const requiredFields = [
                    { key: "name", label: "Nombre" },
                    { key: "quantity", label: "Cantidad" },
                    { key: "unit", label: "Unidad" },
                ];
                return requiredFields.every((field) => {
                    const mappedValue = this.columnMapping[field.key];
                    return mappedValue && typeof mappedValue === "string" && mappedValue.trim() !== "";
                });
            }
            return true;
        },

        async loadProjects(db: any) {
            try {
                this.projects = await db.getAllProjects();
            } catch (error) {
                console.error("Error al cargar los proyectos:", error);
                throw error;
            }
        },

        async processFile(file: File, parseFile: (file: File) => Promise<ParseResult>, detectColumnMapping: (headers: string[]) => Record<string, string | null>) {
            this.setIsProcessing(true);

            try {
                const result = await parseFile(file);

                this.setParseResult(result);
                this.setParsedItems(result.items as Partial<BOMItem>[]);

                if (result.success && result.items.length > 0) {
                    // Get sample data for preview (show more rows for better preview)
                    const firstItem = result.items[0];
                    const headers = Object.keys(firstItem);

                    const sampleData = {
                        headers: headers,
                        rows: result.items.slice(0, 50).map((item: any) => {
                            if (item && typeof item === "object") {
                                // Ensure we're extracting values in the same order as headers
                                return headers.map((header) => {
                                    const value = item[header];
                                    return value !== undefined && value !== null ? value : "";
                                });
                            } else {
                                return [];
                            }
                        }),
                    };

                    this.setSampleData(sampleData);

                    // Initialize column mapping with auto-detected values
                    if (headers.length > 0) {
                        const autoMapping = detectColumnMapping(headers);
                        // Filtrar los valores nulos antes de asignarlos
                        const filteredMapping: Record<string, string> = {};
                        for (const [key, value] of Object.entries(autoMapping)) {
                            if (value !== null && typeof value === 'string') {
                                filteredMapping[key] = value;
                            }
                        }
                        this.setColumnMapping(filteredMapping);
                    }

                    // Move to next step after file is processed
                    this.setStep(2);
                }
            } catch (error) {
                console.error("Error parsing file:", error);
                throw error;
            } finally {
                this.setIsProcessing(false);
            }
        },

        async confirmImport(db: any, selectedFile: File | null, importDestination: 'global' | 'project', selectedProjectId: string, parseFile: (file: File) => Promise<ParseResult>) {
            this.setIsProcessing(true);

            try {
                // Parsear el archivo
                if (!selectedFile) {
                    throw new Error('No hay archivo seleccionado para importar');
                }
                const result = await parseFile(selectedFile);

                if (result.success && result.items.length > 0) {
                    let importedCount = 0;
                    const errors: string[] = [];

                    // Dependiendo del destino seleccionado, importar de manera diferente
                    if (importDestination === 'global') {
                        // Importar al inventario global
                        for (const item of result.items) {
                            const success = await db.createItem(item);
                            if (success) {
                                importedCount++;
                            } else {
                                errors.push(`Error al crear item ${item.name || "desconocido"} en el inventario`);
                            }
                        }
                    } else if (importDestination === 'project' && selectedProjectId) {
                        // Importar a un proyecto específico
                        for (const item of result.items) {
                            // Crear o actualizar el item en el inventario global
                            const itemId = await db.createItem(item);

                            if (itemId) {
                                // Agregar el item al proyecto
                                const success = await db.addItemToProject(selectedProjectId, itemId, item.quantity || 1);
                                if (success) {
                                    importedCount++;
                                } else {
                                    errors.push(`Error al agregar item ${item.name || "desconocido"} al proyecto`);
                                }
                            } else {
                                errors.push(`Error al crear item ${item.name || "desconocido"} en el inventario`);
                            }
                        }
                    } else {
                        throw new Error("Por favor selecciona un destino de importación válido.");
                    }

                    return { importedCount, errors };
                } else {
                    throw new Error(`Error en la importación: ${result.errors.join(", ")}`);
                }
            } catch (error) {
                console.error("Error al procesar la importación:", error);
                throw error;
            } finally {
                this.setIsProcessing(false);
            }
        },
    },
});