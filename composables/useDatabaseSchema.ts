import { ref } from 'vue';

interface TableDefinition {
    name: string;
    definition: string;
}

interface Schema {
    tables: TableDefinition[];
}

const schemaData = ref<Schema | null>(null);

export async function useDatabaseSchema() {
    async function loadSchema(): Promise<Schema> {
        if (schemaData.value) {
            return schemaData.value;
        }

        // Cargar el esquema desde el archivo JSON
        const schemaModule: Schema = await import('~/data/db/schema.json').then(module => module.default || module);
        schemaData.value = schemaModule;
        return schemaData.value!;
    }

    async function createTables(db: any) {
        const schema = await loadSchema();

        for (const table of schema.tables) {
            await db.execute(table.definition);
        }
    }

    async function getTableDefinition(tableName: string): Promise<string | null> {
        const schema = await loadSchema();
        const table = schema.tables.find(t => t.name === tableName);
        return table ? table.definition : null;
    }

    // Función para comprobar si una tabla existe en la base de datos
    async function tableExists(db: any, tableName: string): Promise<boolean> {
        try {
            // Consultar información sobre las tablas en SQLite
            const result = await db.select(
                "SELECT name FROM sqlite_master WHERE type='table' AND name = ?",
                [tableName]
            );
            return result.length > 0;
        } catch (error) {
            console.error(`Error checking if table exists: ${tableName}`, error);
            return false;
        }
    }

    // Función para obtener la definición actual de una tabla en la base de datos
    async function getCurrentTableDefinition(db: any, tableName: string): Promise<string | null> {
        try {
            // Obtener la sentencia SQL que creó la tabla
            const result = await db.select(
                "SELECT sql FROM sqlite_master WHERE type='table' AND name = ?",
                [tableName]
            );
            return result.length > 0 ? result[0].sql : null;
        } catch (error) {
            console.error(`Error getting current table definition: ${tableName}`, error);
            return null;
        }
    }

    // Función para obtener información detallada de las columnas de una tabla
    async function getTableColumnInfo(db: any, tableName: string): Promise<Array<{ name: string, type: string, notnull: number, dflt_value: any, pk: number }> | null> {
        try {
            const result = await db.select(
                `PRAGMA table_info(${tableName})`
            );
            return result;
        } catch (error) {
            console.error(`Error getting table column info: ${tableName}`, error);
            return null;
        }
    }

    // Función para comparar columnas entre el esquema y la base de datos
    function compareColumns(schemaColumns: string[], dbColumns: Array<{ name: string }>): { missing: string[], extra: string[] } {
        const schemaColumnNames = schemaColumns.map(c => c.toLowerCase());
        const dbColumnNames = dbColumns.map(c => c.name.toLowerCase());

        const missing = schemaColumnNames.filter(col => !dbColumnNames.includes(col));
        const extra = dbColumnNames.filter(col => !schemaColumnNames.includes(col));

        return { missing, extra };
    }

    // Función para extraer definiciones de columnas individuales del esquema
    function extractColumnDefinitions(tableDefinition: string): Record<string, string> {
        const columnDefs: Record<string, string> = {};

        // Extraer las columnas entre paréntesis
        const match = tableDefinition.match(/\(([^)]+)\)/s);
        if (!match) return columnDefs;

        const columnsDef = match[1];
        // Separar por comas, pero respetando los paréntesis anidados
        const columns = columnsDef.split(/,(?![^(]*\))/g);

        for (const columnLine of columns) {
            const trimmedLine = columnLine.trim();
            // Saltar líneas que no son definiciones de columnas (constraints, etc.)
            if (trimmedLine.toUpperCase().startsWith('PRIMARY') ||
                trimmedLine.toUpperCase().startsWith('FOREIGN') ||
                trimmedLine.toUpperCase().startsWith('UNIQUE') ||
                trimmedLine.toUpperCase().startsWith('CONSTRAINT')) {
                continue;
            }

            // Extraer el nombre de la columna (primera palabra)
            const columnNameMatch = trimmedLine.match(/^([a-zA-Z_][a-zA-Z0-9_]*)/);
            if (columnNameMatch) {
                const columnName = columnNameMatch[1];
                columnDefs[columnName.toLowerCase()] = trimmedLine;
            }
        }

        return columnDefs;
    }

    // Función para añadir columnas faltantes a una tabla existente
    async function addMissingColumns(db: any, tableName: string, missingColumns: string[], schemaDefinition: string) {
        const columnDefinitions = extractColumnDefinitions(schemaDefinition);

        for (const columnName of missingColumns) {
            const columnDef = columnDefinitions[columnName.toLowerCase()];
            if (columnDef) {
                try {
                    console.log(`Adding column ${columnName} to table ${tableName}`);
                    await db.execute(`ALTER TABLE ${tableName} ADD COLUMN ${columnDef};`);
                } catch (error) {
                    console.error(`Error adding column ${columnName}:`, error);
                }
            }
        }
    }

    // Función para actualizar una tabla existente si no coincide con el esquema
    async function updateTable(db: any, tableName: string, newDefinition: string) {
        try {
            // Renombrar la tabla actual
            const tempTableName = `${tableName}_temp`;
            const currentDefinition = await getCurrentTableDefinition(db, tableName);

            if (currentDefinition) {
                // Renombrar la tabla actual
                await db.execute(`ALTER TABLE ${tableName} RENAME TO ${tempTableName};`);

                // Crear la nueva tabla con la definición actualizada
                await db.execute(newDefinition);

                // Obtener las columnas comunes para transferir los datos
                const currentColumns = extractColumnNames(currentDefinition);
                const newColumns = extractColumnNames(newDefinition);

                // Encontrar columnas comunes
                const commonColumns = currentColumns.filter(col => newColumns.includes(col));

                if (commonColumns.length > 0) {
                    // Copiar los datos desde la tabla temporal a la nueva tabla
                    const columnsStr = commonColumns.join(', ');
                    await db.execute(
                        `INSERT INTO ${tableName} (${columnsStr}) SELECT ${columnsStr} FROM ${tempTableName};`
                    );
                }

                // Eliminar la tabla temporal
                await db.execute(`DROP TABLE ${tempTableName};`);
            }
        } catch (error) {
            console.error(`Error updating table: ${tableName}`, error);
            throw error;
        }
    }

    // Función auxiliar para extraer nombres de columnas de una definición de tabla
    function extractColumnNames(tableDefinition: string): string[] {
        // Extraer las columnas entre paréntesis
        const match = tableDefinition.match(/\((.|\n)*?\)/);
        if (!match) return [];

        const columnsDef = match[1];
        // Separar por comas, pero respetando los paréntesis anidados
        const columns = columnsDef.split(/,(?![^(]*\))/g);

        return columns
            .map(col => col.trim())
            .filter(col => {
                // Eliminar palabras clave como PRIMARY KEY, FOREIGN KEY, etc.
                const cleanCol = col.replace(/\s+.*/, '').replace(/[^a-zA-Z0-9_]/g, '');
                return cleanCol && !['PRIMARY', 'FOREIGN', 'UNIQUE', 'CONSTRAINT'].includes(cleanCol);
            });
    }

    // Función para sincronizar el esquema con la base de datos
    async function syncSchema(db: any) {
        const schema = await loadSchema();

        for (const table of schema.tables) {
            const exists = await tableExists(db, table.name);

            if (!exists) {
                // Si la tabla no existe, crearla
                console.log(`Creating table ${table.name}`);
                await db.execute(table.definition);
            } else {
                // Si la tabla existe, comprobar columnas individuales
                const dbColumnInfo = await getTableColumnInfo(db, table.name);
                if (dbColumnInfo) {
                    // Extraer columnas del esquema
                    const schemaColumns = extractColumnNames(table.definition);
                    const dbColumns = dbColumnInfo.map(col => ({ name: col.name }));

                    // Comparar columnas
                    const comparison = compareColumns(schemaColumns, dbColumns);

                    if (comparison.missing.length > 0) {
                        console.log(`Table ${table.name} is missing columns:`, comparison.missing);
                        // Añadir columnas faltantes
                        await addMissingColumns(db, table.name, comparison.missing, table.definition);
                    }

                    if (comparison.extra.length > 0) {
                        console.log(`Table ${table.name} has extra columns:`, comparison.extra);
                        // Opcional: podríamos eliminar columnas extra, pero por seguridad mejor avisar
                    }
                }
            }
        }
    }

    // Función para forzar la actualización completa de una tabla (recreación)
    async function forceUpdateTable(db: any, tableName: string) {
        const schema = await loadSchema();
        const table = schema.tables.find(t => t.name === tableName);

        if (!table) {
            throw new Error(`Table ${tableName} not found in schema`);
        }

        console.log(`Force updating table ${tableName}`);
        await updateTable(db, tableName, table.definition);
    }

    // Función para verificar el estado del esquema
    async function checkSchemaStatus(db: any): Promise<{ tables: Array<{ name: string, status: 'ok' | 'missing' | 'outdated', details?: string }> }> {
        const schema = await loadSchema();
        const results: Array<{ name: string, status: 'ok' | 'missing' | 'outdated', details?: string }> = [];

        for (const table of schema.tables) {
            const exists = await tableExists(db, table.name);

            if (!exists) {
                results.push({
                    name: table.name,
                    status: 'missing',
                    details: 'Table does not exist'
                });
            } else {
                const dbColumnInfo = await getTableColumnInfo(db, table.name);
                if (dbColumnInfo) {
                    const schemaColumns = extractColumnNames(table.definition);
                    const dbColumns = dbColumnInfo.map(col => ({ name: col.name }));
                    const comparison = compareColumns(schemaColumns, dbColumns);

                    if (comparison.missing.length > 0 || comparison.extra.length > 0) {
                        results.push({
                            name: table.name,
                            status: 'outdated',
                            details: `Missing: ${comparison.missing.join(', ')}. Extra: ${comparison.extra.join(', ')}`
                        });
                    } else {
                        results.push({
                            name: table.name,
                            status: 'ok'
                        });
                    }
                }
            }
        }

        return { tables: results };
    }

    return {
        loadSchema,
        createTables,
        getTableDefinition,
        syncSchema,
        forceUpdateTable,
        checkSchemaStatus,
        tableExists,
        getTableColumnInfo,
        compareColumns
    };
}