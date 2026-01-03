// Utilidades para actualizar el esquema de base de datos
import { useDatabaseSchema } from '../composables/useDatabaseSchema';
import { useDatabaseAdapter } from '../composables/useDatabaseAdapter';

/**
 * Comando para actualizar el esquema de base de datos
 * Verifica y actualiza las tablas/columnas que no coinciden con el esquema
 */
export async function updateDatabaseSchema() {
    try {
        const { getDatabase } = useDatabaseAdapter();
        const { syncSchema, checkSchemaStatus } = await useDatabaseSchema();

        const db = await getDatabase();
        if (!db) {
            throw new Error('No se pudo obtener la conexión a la base de datos');
        }

        console.log('Checking database schema status...');
        const status = await checkSchemaStatus(db);

        // Mostrar estado actual
        console.log('Current schema status:');
        status.tables.forEach(table => {
            console.log(`  ${table.name}: ${table.status}${table.details ? ` - ${table.details}` : ''}`);
        });

        // Sincronizar esquema
        console.log('Syncing schema...');
        await syncSchema(db);

        // Verificar estado después de la sincronización
        console.log('Checking schema status after sync...');
        const newStatus = await checkSchemaStatus(db);

        console.log('Final schema status:');
        newStatus.tables.forEach(table => {
            console.log(`  ${table.name}: ${table.status}${table.details ? ` - ${table.details}` : ''}`);
        });

        return { success: true, status: newStatus };
    } catch (error) {
        console.error('Error updating database schema:', error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}

/**
 * Comando para forzar la actualización de una tabla específica
 */
export async function forceUpdateTable(tableName: string) {
    try {
        const { getDatabase } = useDatabaseAdapter();
        const { forceUpdateTable: forceUpdate } = await useDatabaseSchema();

        const db = await getDatabase();
        if (!db) {
            throw new Error('No se pudo obtener la conexión a la base de datos');
        }

        console.log(`Force updating table: ${tableName}`);
        await forceUpdate(db, tableName);

        return { success: true, message: `Table ${tableName} updated successfully` };
    } catch (error) {
        console.error(`Error force updating table ${tableName}:`, error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}

/**
 * Export para verificar el estado del esquema sin realizar cambios
 */
export async function checkDatabaseSchema() {
    try {
        const { getDatabase } = useDatabaseAdapter();
        const { checkSchemaStatus } = await useDatabaseSchema();

        const db = await getDatabase();
        if (!db) {
            throw new Error('No se pudo obtener la conexión a la base de datos');
        }

        const status = await checkSchemaStatus(db);
        return { success: true, status };
    } catch (error) {
        console.error('Error checking database schema:', error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}