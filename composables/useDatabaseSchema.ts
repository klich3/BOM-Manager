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
                await db.execute(table.definition);
            } else {
                // Si la tabla existe, comprobar si coincide con el esquema
                const currentDefinition = await getCurrentTableDefinition(db, table.name);

                if (currentDefinition !== table.definition) {
                    // Si la definición no coincide, actualizar la tabla
                    console.log(`Updating table ${table.name} to match schema`);
                    await updateTable(db, table.name, table.definition);
                }
            }
        }
    }

    return {
        loadSchema,
        createTables,
        getTableDefinition,
        syncSchema
    };
}