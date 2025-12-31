/**
 * Utilidades para la conversión de campos entre camelCase y snake_case
 * para la base de datos
 */

/**
 * Convierte un objeto de camelCase a snake_case
 * @param obj - Objeto con campos en camelCase
 * @returns Objeto con campos convertidos a snake_case
 */
export function convertCamelToSnake(obj: any): any {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => convertCamelToSnake(item));
    }

    const snakeObj: any = {};

    for (const [key, value] of Object.entries(obj)) {
        // Convertir el nombre del campo de camelCase a snake_case
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

        // Convertir valores anidados recursivamente
        snakeObj[snakeKey] = convertCamelToSnake(value);
    }

    return snakeObj;
}

/**
 * Convierte un objeto de snake_case a camelCase
 * @param obj - Objeto con campos en snake_case
 * @returns Objeto con campos convertidos a camelCase
 */
export function convertSnakeToCamel(obj: any): any {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => convertSnakeToCamel(item));
    }

    const camelObj: any = {};

    for (const [key, value] of Object.entries(obj)) {
        // Convertir el nombre del campo de snake_case a camelCase
        const camelKey = key.replace(/_([a-z])/g, g => g[1].toUpperCase());

        // Convertir valores anidados recursivamente
        camelObj[camelKey] = convertSnakeToCamel(value);
    }

    return camelObj;
}

// Mapeo específico de campos para BOMItem
export const BOM_ITEM_FIELD_MAPPING = {
    // camelCase a snake_case
    name: 'name',
    description: 'description',
    quantity: 'quantity',
    category: 'category',
    supplier: 'supplier',
    partNumber: 'part_number',
    lcscPart: 'lcsc_part',
    price: 'price',
    inStock: 'in_stock',
    minStock: 'min_stock',
    notes: 'notes',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    manufacturer: 'manufacturer',
    package: 'package',
    customerNo: 'customer_no',
    rohs: 'rohs',
    extPrice: 'ext_price',
    leadTime: 'lead_time',
    dateCodeLotNo: 'date_code_lot_no',
    status: 'status',
} as const;

/**
 * Convierte campos específicos de BOMItem de camelCase a snake_case
 * @param obj - Objeto con campos en camelCase
 * @returns Objeto con campos convertidos a snake_case usando el mapeo específico
 */
export function convertBomItemToSnake(obj: any): any {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => convertBomItemToSnake(item));
    }

    const snakeObj: any = {};

    for (const [key, value] of Object.entries(obj)) {
        // Usar el mapeo específico para campos conocidos
        const snakeKey = (BOM_ITEM_FIELD_MAPPING as any)[key] || key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        snakeObj[snakeKey] = value; // No convertimos el valor, solo el nombre del campo
    }

    return snakeObj;
}

/**
 * Convierte campos específicos de BOMItem de snake_case a camelCase
 * @param obj - Objeto con campos en snake_case
 * @returns Objeto con campos convertidos a camelCase usando el mapeo específico
 */
export function convertBomItemToCamel(obj: any): any {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => convertBomItemToCamel(item));
    }

    const camelObj: any = {};
    // Invertir el mapeo de BOM_ITEM_FIELD_MAPPING para snake_case a camelCase
    const invertedMapping: Record<string, string> = {};
    Object.entries(BOM_ITEM_FIELD_MAPPING).forEach(([camelKey, snakeKey]) => {
        invertedMapping[snakeKey as string] = camelKey;
    });

    for (const [key, value] of Object.entries(obj)) {
        // Usar el mapeo invertido para campos conocidos
        const camelKey = invertedMapping[key] || key.replace(/_([a-z])/g, g => g[1].toUpperCase());
        camelObj[camelKey] = value; // No convertimos el valor, solo el nombre del campo
    }

    return camelObj;
}