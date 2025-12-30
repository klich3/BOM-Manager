import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { z } from 'zod';
import type { BOMItem } from '@/types/bom';

// Schema de validación para items BOM
const BOMItemSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    description: z.string().optional(),
    quantity: z.number().min(0, 'La cantidad debe ser mayor o igual a 0'),
    category: z.string().optional(),
    supplier: z.string().optional(),
    partNumber: z.string().optional(),
    lcscPart: z.string().optional(),
    price: z.number().min(0).optional(),
    minStock: z.number().min(0).optional(),
    notes: z.string().optional(),
    manufacturer: z.string().optional(),
    package: z.string().optional(),


    unit: z.string().optional(), // Cambiado a opcional ya que se eliminó la columna
    // inStock: z.number().min(0).default(0), // Eliminado porque ya no se usa
    customerNo: z.string().optional(),
    rohs: z.string().optional(),
    extPrice: z.number().optional(),
    leadTime: z.number().optional(),
    dateCodeLotNo: z.string().optional(),
    status: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional()
});

export interface ParseResult {
    success: boolean;
    items: Partial<BOMItem>[];
    errors: string[];
    warnings: string[];
}

export interface ColumnMapping {
    [key: string]: keyof BOMItem | null;
}

export const useFileParser = () => {
    /**
     * Detecta automáticamente el mapeo de columnas basándose en nombres comunes
     */
    const detectColumnMapping = (headers: string[]): ColumnMapping => {
        const mapping: ColumnMapping = {};

        const patterns: Record<string, string[]> = {
            name: ['name', 'nombre', 'component', 'componente', 'part', 'parte', 'item'],
            description: ['description', 'descripcion', 'desc', 'details', 'detalles'],
            quantity: ['quantity', 'cantidad', 'qty', 'cant', 'amount', 'quantity'],
            unit: ['unit', 'unidad', 'units', 'unidades', 'uom'], // Restaurado para detección automática, pero no requerido
            category: ['category', 'categoria', 'type', 'tipo', 'class', 'clase'],
            supplier: ['supplier', 'proveedor', 'vendor', 'manufacturer', 'fabricante'],
            partNumber: ['part_number', 'partnumber', 'part number', 'numero de parte', 'mpn', 'p/n', 'sku', 'manufacture part number'],
            lcscPart: ['lcsc', 'lcsc_part', 'lcsc part', 'lcsc_number', 'lcsc part number'],
            price: ['price', 'precio', 'cost', 'costo', 'unit_price', 'precio_unitario', 'unit price'],
            // inStock: ['in_stock', 'instock', 'stock', 'inventory', 'inventario', 'on_hand'], // Eliminado porque ya no se usa
            minStock: ['min_stock', 'minstock', 'minimum', 'minimo', 'reorder', 'reorder_point'],
            notes: ['notes', 'notas', 'comments', 'comentarios', 'remarks', 'observaciones'],
            manufacturer: ['manufacturer', 'fabricante', 'maker', 'producer'],
            customerNo: ['customer_no', 'customer no', 'customer number', 'numero cliente', 'cliente no', 'customer id', 'customer no.'],
            package: ['package', 'packaging', 'empaquetado', 'housing', 'case', 'encapsulado'],
            rohs: ['rohs', 'rohs_compliant', 'rohs compliant', 'environmental', 'ecological'],
            extPrice: ['ext_price', 'ext price', 'extended price', 'total_price', 'precio_total', 'precio ext', 'ext.price($)', 'ext.price'],
            leadTime: ['lead_time', 'lead time', 'delivery_time', 'tiempo_entrega', 'delivery', 'plazo', 'estimated lead time'],
            dateCodeLotNo: [
                'date_code_lot_no',
                'date code lot no',
                'date_code',
                'lot_no',
                'date code',
                'lote',
                'codigo_fecha',
                'date code / lot no.',
                'date code / lot no'
            ],
            status: ['status', 'estado', 'state', 'condition', 'situacion']
        };

        headers.forEach(header => {
            const normalized = header.toLowerCase().trim();

            for (const [field, keywords] of Object.entries(patterns)) {
                if (keywords.some(keyword => normalized.includes(keyword))) {
                    mapping[header] = field as keyof BOMItem;
                    break;
                }
            }

            // Si no se encontró coincidencia, marcarlo como null
            if (!mapping[header]) {
                mapping[header] = null;
            }
        });

        return mapping;
    };

    /**
     * Parsea un archivo CSV
     * @param file 
     * @returns 
     * @Sample
    parseResult -> {
        "success": true,
        "items": [
            {
                "name": "HGC0402R5106M100NTEJ",
                "description": "10uF ±20% 10V Ceramic Capacitor X5R 0402",
                "quantity": 200,
                "supplier": "Chinocera",
                "price": 1.26,
                "package": "402",
                "unit": "0.0063",
                "customerNo": "C7472949",
                "rohs": "YES",
                "dateCodeLotNo": "null",
                "status": "-"
            }...
        ],
        "errors": [],
        "warnings": []
    }

    results.data -> [
    {
        "LCSC Part Number": "C7472949",
        "Manufacture Part Number": "HGC0402R5106M100NTEJ",
        "Manufacturer": "Chinocera",
        "Customer NO.": "C7472949",
        "Package": 402,
        "Description": "10uF ±20% 10V Ceramic Capacitor X5R 0402",
        "RoHS": "YES",
        "Quantity": 200,
        "Unit Price($)": 0.0063,
        "Ext.Price($)": 1.26,
        "Estimated lead time (business days)": null,
        "Date Code / Lot No.": null,
        "Status": "-"
    }...]

    results.meta.fields -> [
        "LCSC Part Number",
        "Manufacture Part Number",
        "Manufacturer",
        "Customer NO.",
        "Package",
        "Description",
        "RoHS",
        "Quantity",
        "Unit Price($)",
        "Ext.Price($)",
        "Estimated lead time (business days)",
        "Date Code / Lot No.",
        "Status"
    ]
     */
    const parseCSV = (file: File): Promise<ParseResult> => {
        return new Promise((resolve) => {
            Papa.parse(file, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const parseResult = processData(results.data as any[], results.meta.fields || []);

                    /*
                    console.log("--->", results)
                    console.log("--->2", results.data)
                    console.log("--->2", results.meta.fields)
                    */

                    resolve(parseResult);
                },
                error: (error) => {
                    resolve({
                        success: false,
                        items: [],
                        errors: [`Error al parsear CSV: ${error.message}`],
                        warnings: []
                    });
                }
            });
        });
    };

    /**
     * Parsea un archivo Excel (XLSX/XLS)
     */
    const parseExcel = (file: File): Promise<ParseResult> => {
        return new Promise((resolve) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = e.target?.result;
                    const workbook = XLSX.read(data, { type: 'binary' });

                    // Tomar la primera hoja
                    const firstSheetName = workbook.SheetNames[0];
                    if (!firstSheetName) {
                        resolve({
                            success: false,
                            items: [],
                            errors: ['El archivo Excel no contiene hojas'],
                            warnings: []
                        });
                        return;
                    }
                    const worksheet = workbook.Sheets[firstSheetName];
                    if (!worksheet) {
                        resolve({
                            success: false,
                            items: [],
                            errors: ['No se pudo leer la hoja del archivo'],
                            warnings: []
                        });
                        return;
                    }

                    // Convertir a JSON
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

                    // Obtener headers
                    const headers = Object.keys(jsonData[0] || {});

                    const parseResult = processData(jsonData as any[], headers);
                    resolve(parseResult);
                } catch (error: any) {
                    resolve({
                        success: false,
                        items: [],
                        errors: [`Error al parsear Excel: ${error.message}`],
                        warnings: []
                    });
                }
            };

            reader.onerror = () => {
                resolve({
                    success: false,
                    items: [],
                    errors: ['Error al leer el archivo'],
                    warnings: []
                });
            };

            reader.readAsBinaryString(file);
        });
    };

    /**
     * Procesa los datos parseados y los mapea a items BOM
     */
    const processData = (data: any[], headers: string[]): ParseResult => {
        const result: ParseResult = {
            success: true,
            items: [],
            errors: [],
            warnings: []
        };

        if (!data || data.length === 0) {
            result.success = false;
            result.errors.push('El archivo está vacío');
            return result;
        }

        // Detectar mapeo de columnas
        const mapping = detectColumnMapping(headers);

        // Verificar que al menos tengamos los campos esenciales
        const hasName = Object.values(mapping).includes('name');
        const hasQuantity = Object.values(mapping).includes('quantity');
        // No verificamos unidad ya que ya no es requerida
        // const hasUnit = Object.values(mapping).includes('unit');

        if (!hasName) {
            result.warnings.push('No se detectó una columna de "nombre". Verifica el mapeo.');
        }
        if (!hasQuantity) {
            result.warnings.push('No se detectó una columna de "cantidad". Se usará 0 por defecto.');
        }
        // No mostramos advertencia para unidad ya que ya no es requerida
        // if (!hasUnit) {
        //     result.warnings.push('No se detectó una columna de "unidad". Se usará "pcs" por defecto.');
        // }

        // Procesar cada fila
        data.forEach((row, index) => {
            try {
                const item: any = {
                    quantity: 0,
                    // No inicializamos unidad ya que ya no es requerida
                    // inStock: 0 // Eliminado porque ya no se usa
                };

                // Mapear datos según el mapping detectado
                Object.entries(mapping).forEach(([header, field]) => {
                    if (field && row[header] !== undefined && row[header] !== '') {
                        const value = row[header];

                        // Convertir valores numéricos
                        const numericFields = ['quantity', 'price', 'minStock', 'extPrice', 'leadTime']; // inStock eliminado porque ya no se usa
                        if (numericFields.includes(field)) {
                            const numValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, ''));
                            item[field] = isNaN(numValue) ? (field === 'leadTime' || field === 'extPrice' ? undefined : 0) : numValue;
                        } else {
                            item[field] = String(value).trim();
                        }
                    }
                });

                // Validar con Zod
                const validation = BOMItemSchema.safeParse(item);

                if (validation.success) {
                    // Convertir strings de fecha a objetos Date si están presentes
                    const itemWithDates = {
                        ...validation.data,
                        createdAt: validation.data.createdAt ? new Date(validation.data.createdAt) : undefined,
                        updatedAt: validation.data.updatedAt ? new Date(validation.data.updatedAt) : undefined,
                    };
                    result.items.push(itemWithDates);
                } else {
                    const errorMessages = validation.error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`);
                    result.errors.push(`Fila ${index + 2}: ${errorMessages.join(', ')}`);
                }
            } catch (error: any) {
                result.errors.push(`Fila ${index + 2}: ${error.message}`);
            }
        });

        // Si hay errores pero también items válidos, considerarlo éxito parcial
        if (result.items.length > 0 && result.errors.length > 0) {
            result.warnings.push(`Se procesaron ${result.items.length} items correctamente, pero ${result.errors.length} filas tuvieron errores.`);
        }

        // Si no hay items válidos, marcar como fallo
        if (result.items.length === 0) {
            result.success = false;
            if (result.errors.length === 0) {
                result.errors.push('No se pudo procesar ningún item válido del archivo');
            }
        }

        return result;
    };

    /**
     * Función principal que detecta el tipo de archivo y lo parsea
     */
    const parseFile = async (file: File): Promise<ParseResult> => {
        const extension = file.name.split('.').pop()?.toLowerCase();

        switch (extension) {
            case 'csv':
                return parseCSV(file);
            case 'xlsx':
            case 'xls':
                return parseExcel(file);
            default:
                return {
                    success: false,
                    items: [],
                    errors: ['Formato de archivo no soportado'],
                    warnings: []
                };
        }
    };

    /**
     * Valida un item BOM individual
     */
    const validateItem = (item: any): { valid: boolean; errors: string[] } => {
        const validation = BOMItemSchema.safeParse(item);

        if (validation.success) {
            return { valid: true, errors: [] };
        }

        return {
            valid: false,
            errors: validation.error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`)
        };
    };

    return {
        parseFile,
        parseCSV,
        parseExcel,
        validateItem,
        detectColumnMapping
    };
};
