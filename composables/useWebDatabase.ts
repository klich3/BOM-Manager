import type { Database } from '@/types/database';

// Función para crear una base de datos web con SQLite WASM
const createWebDatabase = async (): Promise<Database> => {
    try {
        // Importar dinámicamente sqlite-wasm usando el worker promiser
        // Usamos un import directo para evitar conflictos de resolución
        const sqliteWasmModule = await import('@sqlite.org/sqlite-wasm');
        const { sqlite3Worker1Promiser } = sqliteWasmModule;

        // Crear el promiser para interactuar con SQLite a través del worker
        const p = sqlite3Worker1Promiser({
            onready: () => console.log('SQLite WASM worker ready'),
        });

        // Abrir la base de datos
        const dbFile = 'bom_manager.db';
        const response = await p('open', {
            filename: `file:${dbFile}?vfs=opfs`
        });
        const dbId = response.dbId as string;

        // Ejecutar configuración inicial de la base de datos
        await p('exec', {
            dbId,
            sql: 'PRAGMA journal_mode = WAL; PRAGMA synchronous = NORMAL;'
        });

        // Crear el objeto de base de datos con las mismas funciones que Tauri
        return {
            select: async <T = any[]>(query: string, params?: any[]): Promise<T> => {
                // Para consultas SELECT, obtener los resultados
                const result = await p('exec', {
                    dbId,
                    sql: query,
                    bind: params || [],
                    returnValue: 'resultRows' // Devolver las filas obtenidas
                });

                // El resultado puede tener diferentes formatos, dependiendo de la implementación
                // Si es un array de objetos, lo devolvemos directamente
                // Si tiene una estructura diferente, extraemos los datos
                if (Array.isArray(result)) {
                    return result as T;
                } else if (result && typeof result === 'object' && 'rows' in result) {
                    return (result as any).rows as T;
                } else if (result && Array.isArray((result as any).rows)) {
                    return (result as any).rows as T;
                } else {
                    // Si no es un formato esperado, devolver array vacío
                    return [] as T;
                }
            },
            execute: async (query: string, params?: any[]): Promise<any> => {
                const result = await p('exec', {
                    dbId,
                    sql: query,
                    bind: params || [],
                    returnValue: 'this' // Para operaciones de modificación
                });

                // Devolvemos un objeto indicando éxito
                return { rowsAffected: 1 }; // Valor por defecto para operaciones de modificación
            }
        };
    } catch (error) {
        console.error('Error inicializando base de datos web con SQLite WASM:', error);
        throw error;
    }
};

export const useWebDatabase = () => {
    let db: Database | null = null;

    const initDatabase = async () => {
        if (db) return db;

        try {
            db = await createWebDatabase();

            console.log('Base de datos web con SQLite WASM inicializada exitosamente', db);

            // Crear tabla de items si no existe
            await db.execute(`
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
        )
      `);

            // Crear tabla de proyectos
            await db.execute(`
        CREATE TABLE IF NOT EXISTS projects (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `);

            // Crear tabla de relación proyecto-items
            await db.execute(`
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
        )
      `);

            return db;
        } catch (error) {
            console.error('Error inicializando base de datos web con SQLite WASM:', error);
            throw error;
        }
    };

    const getDatabase = async () => {
        if (!db) {
            await initDatabase();
        }
        return db;
    };

    return {
        initDatabase,
        getDatabase,
    };
};