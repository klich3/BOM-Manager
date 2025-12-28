import { ref } from 'vue';
import type { Database } from '@/types/database';

// Configuración de la base de datos
const databaseConfig = {
    filename: 'file:mydb.sqlite3?vfs=opfs',
    tables: {
        bom_items: {
            name: 'bom_items',
            schema: `
        CREATE TABLE IF NOT EXISTS bom_items (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          quantity REAL NOT NULL,
          unit TEXT NOT NULL,
          category TEXT,
          supplier TEXT,
          part_number TEXT,
          lcsc_part TEXT,
          price REAL,
          in_stock REAL NOT NULL DEFAULT 0,
          min_stock REAL,
          notes TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `,
        },
        projects: {
            name: 'projects',
            schema: `
        CREATE TABLE IF NOT EXISTS projects (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `,
        },
        project_items: {
            name: 'project_items',
            schema: `
        CREATE TABLE IF NOT EXISTS project_items (
          id TEXT PRIMARY KEY,
          project_id TEXT NOT NULL,
          item_id TEXT NOT NULL,
          quantity REAL NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
          FOREIGN KEY (item_id) REFERENCES bom_items(id) ON DELETE CASCADE,
          UNIQUE(project_id, item_id)
        );
      `,
        },
    },
} as const;

// Estado a nivel de módulo para asegurar una única instancia de base de datos
const isInitialized = ref(false);
let sqlite3Module: any = null;
let dbInstance: any = null;

export function useWebDatabase() {
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    // eslint-disable-next-line no-console
    const log = (...args: unknown[]) => console.log(...args);

    const initializeSQLite = async () => {
        if (!sqlite3Module) {
            try {
                // Cargar el módulo sqlite-wasm con el patrón correcto para la web
                const sqlite3InitModule = (await import('@sqlite.org/sqlite-wasm')).default;

                sqlite3Module = await new Promise((resolve, reject) => {
                    try {
                        sqlite3InitModule({
                            print: console.log,
                            printErr: console.error,
                        }).then(resolve).catch(reject);
                    } catch (err) {
                        reject(err);
                    }
                });
            } catch (err) {
                console.error('Error loading @sqlite.org/sqlite-wasm:', err);
                throw err;
            }
        }
    };

    const initialize = async () => {
        if (isInitialized.value) return true;

        isLoading.value = true;
        error.value = null;

        try {
            log('Initializing SQLite database with @sqlite.org/sqlite-wasm...');
            await initializeSQLite();

            // Crear una base de datos usando la API OO1 de SQLite
            // Crear el wrapper para evitar problemas de modo estricto
            const promiser: any = await new Promise((resolve, reject) => {
                try {
                    // Crear un callback protegido
                    const callback = (readyPromiser: any) => {
                        try {
                            resolve(readyPromiser);
                        } catch (resolveError) {
                            reject(resolveError);
                        }
                    };

                    // Configurar el callback para evitar problemas de modo estricto
                    Object.defineProperty(callback, 'caller', {
                        value: null,
                        writable: false,
                        configurable: false
                    });
                    Object.defineProperty(callback, 'callee', {
                        value: null,
                        writable: false,
                        configurable: false
                    });
                    Object.defineProperty(callback, 'arguments', {
                        value: null,
                        writable: false,
                        configurable: false
                    });

                    // Inicializar SQLite con el callback protegido
                    sqlite3Module(callback);
                } catch (error) {
                    reject(error);
                }
            });

            // Abrir la base de datos
            const response: any = await promiser('open', { filename: databaseConfig.filename });
            const dbId = response.dbId;

            // Asignar la instancia de la base de datos
            dbInstance = { promiser, dbId };

            log('Database opened successfully with ID:', dbId);

            // Crear las tablas necesarias
            await promiser('exec', {
                dbId,
                sql: databaseConfig.tables.bom_items.schema,
            });
            await promiser('exec', {
                dbId,
                sql: databaseConfig.tables.projects.schema,
            });
            await promiser('exec', {
                dbId,
                sql: databaseConfig.tables.project_items.schema,
            });

            isInitialized.value = true;
            return true;
        } catch (err) {
            error.value = err instanceof Error
                ? `Failed to initialize SQLite database: ${err.message}`
                : 'Failed to initialize SQLite database';
            console.error('SQLite initialization error:', err);
            throw error.value;
        } finally {
            isLoading.value = false;
        }
    };

    const executeQuery = async (sql: string, params: unknown[] = []) => {
        if (!dbInstance) await initialize();

        isLoading.value = true;
        error.value = null;

        try {
            log('Executing query:', sql, 'with params:', params);

            // Para consultas SELECT, recoger filas
            const resultRows: any[] = [];

            await dbInstance.promiser('exec', {
                dbId: dbInstance.dbId,
                sql,
                bind: params,
                rowMode: 'object',
                callback: (result: any) => {
                    if (result.row) {
                        resultRows.push(result.row);
                    }
                },
            } as any);

            log('Query result rows:', resultRows);

            // Devolver en un formato compatible con el código existente
            return {
                result: {
                    resultRows,
                },
            };
        } catch (err) {
            error.value = err instanceof Error
                ? `Query execution failed: ${err.message}`
                : 'Query execution failed';
            console.error('Query execution error:', err);
            throw error.value;
        } finally {
            isLoading.value = false;
        }
    };

    const importCSV = async (file: File, tableName: string, columns: string[]) => {
        if (!dbInstance) await initialize();

        isLoading.value = true;
        error.value = null;

        try {
            log('Importing CSV file:', file.name, 'into table:', tableName);
            const text = await file.text();
            const lines = text.split('\n').filter(line => line.trim());

            // Saltar fila de encabezado (asumiendo que el CSV tiene encabezados)
            const dataLines = lines.slice(1);

            // Comenzar transacción para mejor rendimiento
            await dbInstance.promiser('exec', {
                dbId: dbInstance.dbId,
                sql: 'BEGIN TRANSACTION',
            });

            try {
                for (const line of dataLines) {
                    // Análisis básico de CSV (para CSV simples sin comas entrecomilladas)
                    const values = line.split(',').map(v => v.trim());

                    // Crear placeholders para consulta parametrizada
                    const placeholders = columns.map(() => '?').join(', ');
                    const sql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;

                    await dbInstance.promiser('exec', {
                        dbId: dbInstance.dbId,
                        sql,
                        bind: values,
                    });
                }

                // Confirmar la transacción
                await dbInstance.promiser('exec', {
                    dbId: dbInstance.dbId,
                    sql: 'COMMIT',
                });

                log(`Successfully imported ${dataLines.length} rows into ${tableName}`);
                return { success: true, rowCount: dataLines.length };
            } catch (insertErr) {
                // Hacer rollback en caso de error
                try {
                    await dbInstance.promiser('exec', {
                        dbId: dbInstance.dbId,
                        sql: 'ROLLBACK',
                    });
                } catch (rollbackErr) {
                    log('Rollback failed:', rollbackErr);
                }
                throw insertErr;
            }
        } catch (err) {
            error.value = err instanceof Error
                ? `CSV import failed: ${err.message}`
                : 'CSV import failed';
            console.error('CSV import error:', err);
            throw error.value;
        } finally {
            isLoading.value = false;
        }
    };

    // Función para ejecutar consultas de selección
    const select = async <T = any[]>(query: string, params?: any[]): Promise<T> => {
        if (!dbInstance) await initialize();

        try {
            const result = await executeQuery(query, params || []);
            return result.result.resultRows as T;
        } catch (err) {
            console.error('Select error:', err);
            return [] as T;
        }
    };

    // Función para ejecutar consultas de modificación
    const execute = async (query: string, params?: any[]): Promise<any> => {
        if (!dbInstance) await initialize();

        try {
            const result = await dbInstance.promiser('exec', {
                dbId: dbInstance.dbId,
                sql: query,
                bind: params || [],
            });

            // Contar filas afectadas
            const rowsAffected = result?.rowsAffected || 0;

            return { rowsAffected };
        } catch (err) {
            console.error('Execute error:', err);
            return { rowsAffected: 0 };
        }
    };

    return {
        isLoading,
        error,
        isInitialized,
        initialize,
        executeQuery,
        importCSV,
        select,
        execute,
    };
}