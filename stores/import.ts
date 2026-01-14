import { defineStore } from 'pinia';
import type { BOMItem } from '@/types/bom';
import type { ParseResult } from '@/composables/useFileParser';
import { useActivityDatabase } from '@/composables/useActivityDatabase';
import { convertSnakeToCamel } from '@/composables/useDatabaseUtils';

export type ImportAction = 'create' | 'update_stock' | 'merge' | 'ignore';
export type StockType = 'existing' | 'to_order';

export interface ImportItem extends Partial<BOMItem> {
    importStatus: 'new' | 'exists' | 'conflict';
    existingItem?: any | null;
    selectedAction: ImportAction;
    selectedStockType: StockType;
}

export interface ImportState {
    step: number;
    selectedFile: File | null;
    sampleData: {
        headers: string[];
        rows: any[][];
    } | null;
    parseResult: ParseResult;
    parsedItems: ImportItem[];
    isProcessing: boolean;
    columnMapping: Record<string, string>;
    projects: any[];
    importDestination: 'global' | 'project' | 'new_project';
    selectedProjectId: string;
    newProjectName: string;
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
        newProjectName: '',
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
            { key: "quantity", label: "Cantidad" }, //cantidad de items
        ],
        optionalFields: () => [
            { key: "description", label: "Descripción" },
            { key: "category", label: "Categoría" },
            { key: "supplier", label: "Proveedor" },
            { key: "partNumber", label: "Número de parte" },
            { key: "lcscPart", label: "Referencia LCSC" }, // numero LSSC referencia del item
            { key: "price", label: "Precio" }, // precio por item
            { key: "inStock", label: "Stock actual" }, // stock actual

            { key: "minStock", label: "Stock mínimo" }, // cantidad minima de stock para poner alarma
            { key: "notes", label: "Notas" },
            { key: "manufacturer", label: "Fabricante" },
            { key: "package", label: "Empaquetado" }, // Empaquetado del componente

            //{ key: "customerNo", label: "Número de Cliente" },
            //{ key: "rohs", label: "RoHS" },
            //{ key: "extPrice", label: "Precio Extendido" },
            //{ key: "leadTime", label: "Tiempo de Entrega" },
            //{ key: "dateCodeLotNo", label: "Código de Fecha/Número de Lote" },
            { key: "status", label: "Estado" },
            { key: "pcbDesignation", label: "Designación PCB" },
            { key: "itemImage", label: "Imagen del Item" },
            //{ key: "createdAt", label: "Fecha de Creación" },
            //{ key: "updatedAt", label: "Fecha de Actualización" },
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

        setParsedItems(items: any[]) {
            this.parsedItems = items.map(item => ({
                ...item,
                importStatus: item.importStatus || 'new',
                selectedAction: item.selectedAction || 'create',
                selectedStockType: item.selectedStockType || 'existing'
            }));
        },

        updateImportItem(index: number, updates: Partial<ImportItem>) {
            if (this.parsedItems[index]) {
                this.parsedItems[index] = { ...this.parsedItems[index], ...updates };
            }
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

        setImportDestination(destination: 'global' | 'project' | 'new_project') {
            this.importDestination = destination;
        },

        setSelectedProjectId(projectId: string) {
            this.selectedProjectId = projectId;
        },

        setNewProjectName(name: string) {
            this.newProjectName = name;
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

            // Set the selected file first
            this.setSelectedFile(file);

            try {
                const result = await parseFile(file);

                this.setParseResult(result);
                this.setParsedItems(result.items as Partial<BOMItem>[]);

                if (result.success && result.items.length > 0) {
                    // Get original headers from the parsed data
                    // Now we can use the original headers from the parser result
                    const originalHeaders = result.fields || Object.keys(result.items[0] || {});

                    const sampleData = {
                        headers: originalHeaders,
                        rows: result.dataValues ? result.dataValues.slice(0, 50).map((item: any) => {
                            if (item && typeof item === "object") {
                                // Ensure we're extracting values in the same order as headers
                                return originalHeaders.map((header) => {
                                    const value = item[header];
                                    return value !== undefined && value !== null ? value : "";
                                });
                            } else {
                                return [];
                            }
                        }) : result.items.slice(0, 50).map((item: any) => {
                            if (item && typeof item === "object") {
                                // Ensure we're extracting values in the same order as headers
                                return originalHeaders.map((header) => {
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
                    if (originalHeaders.length > 0) {
                        const autoMapping = detectColumnMapping(originalHeaders);
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

        async compareWithInventory(db: any) {
            this.setIsProcessing(true);
            try {
                const itemsWithComparison: ImportItem[] = [];

                for (const item of this.parsedItems) {
                    const existing = await db.findItemByReference(item.partNumber, item.lcscPart);

                    if (existing) {
                        const existingCamel = convertSnakeToCamel(existing);

                        itemsWithComparison.push({
                            ...item,
                            importStatus: 'exists',
                            existingItem: existingCamel,
                            selectedAction: 'update_stock',
                            selectedStockType: 'existing'
                        });
                    } else {
                        itemsWithComparison.push({
                            ...item,
                            importStatus: 'new',
                            existingItem: null,
                            selectedAction: 'create',
                            selectedStockType: 'existing'
                        });
                    }
                }

                this.parsedItems = itemsWithComparison;
            } catch (error) {
                console.error("Error al comparar con el inventario:", error);
            } finally {
                this.setIsProcessing(false);
            }
        },

        async confirmImport(db: any, selectedFile: File | null, importDestination: 'global' | 'project' | 'new_project', selectedProjectId: string, parseFile: (file: File) => Promise<ParseResult>) {
            this.setIsProcessing(true);
            const activityDb = useActivityDatabase();

            try {
                const itemsToImport = this.parsedItems;
                let destinationProjectId = selectedProjectId;

                if (importDestination === 'new_project') {
                    const newProjId = await db.createProject({
                        name: this.newProjectName || `Importación ${new Date().toLocaleDateString()}`,
                        description: `Proyecto creado desde importación de ${selectedFile?.name || 'archivo'}`
                    });
                    if (newProjId) {
                        destinationProjectId = newProjId;
                    } else {
                        throw new Error("No se pudo crear el nuevo proyecto");
                    }
                }

                if (itemsToImport.length > 0) {
                    let importedCount = 0;
                    const errors: string[] = [];

                    for (const importItem of itemsToImport) {
                        if (importItem.selectedAction === 'ignore') continue;

                        let itemId = '';
                        let isNew = false;

                        if (importItem.selectedAction === 'create' || !importItem.existingItem) {
                            const result = await db.createItem(importItem);
                            if (result) {
                                itemId = result;
                                isNew = true;
                                importedCount++;
                            } else {
                                errors.push(`Error al crear item ${importItem.name}`);
                                continue;
                            }
                        } else if (importItem.selectedAction === 'update_stock' || importItem.selectedAction === 'merge') {
                            itemId = importItem.existingItem.id;
                            const existingStock = importItem.existingItem.inStock || 0;
                            const newQuantity = importItem.quantity || 0;

                            if (importItem.selectedAction === 'update_stock') {
                                await db.updateItemStock(itemId, existingStock + newQuantity);
                            } else if (importItem.selectedAction === 'merge') {
                                const mergedData = {
                                    ...importItem.existingItem,
                                    ...importItem,
                                    inStock: existingStock + newQuantity,
                                    id: itemId
                                };
                                await db.updateItem(itemId, mergedData);
                            }
                            importedCount++;
                        }

                        if ((importDestination === 'project' || importDestination === 'new_project') && destinationProjectId && itemId) {
                            const success = await db.addItemToProject(destinationProjectId, itemId, importItem.quantity || 1);
                            if (!success) {
                                errors.push(`Error al asignar item ${importItem.name} al proyecto`);
                            }
                        }

                        await activityDb.logActivity(
                            isNew ? 'CREATE' : 'UPDATE',
                            'bom_items',
                            itemId,
                            `Item ${importItem.name} ${isNew ? 'creado' : 'actualizado'} desde importación`,
                            'system'
                        );
                    }

                    return { importedCount, errors, projectId: destinationProjectId };
                } else {
                    throw new Error("No hay items para importar");
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