import type { Database } from '@/types/database';

// Variable global para mantener la instancia de la base de datos
let dbInstance: any = null;

// Función para inicializar SQLite WASM con worker usando la API oficial
const initSqliteWasm = async () => {
    if (dbInstance) {
        return dbInstance;
    }

    console.log('Inicializando SQLite WASM con worker oficial y OPFS');

    try {
        // Importar dinámicamente sqlite-wasm usando el worker promiser oficial
        const { sqlite3Worker1Promiser } = await import('@sqlite.org/sqlite-wasm');

        console.log('Módulo SQLite WASM oficial importado, creando worker promiser');

        // Crear el promiser para interactuar con SQLite a través del worker
        const promiser: any = await new Promise((resolve) => {
            const _promiser = sqlite3Worker1Promiser({
                onready: () => {
                    console.log('SQLite WASM worker oficial ready');
                    resolve(_promiser);
                },
            });
        });

        // Abrir la base de datos con OPFS
        const response = await promiser('open', {
            filename: 'file:bom_manager.db?vfs=opfs'
        });

        const dbId = response.dbId as string;
        console.log('Base de datos abierta con OPFS, dbId:', dbId);

        // Ejecutar configuración inicial de la base de datos
        await promiser('exec', {
            dbId,
            sql: 'PRAGMA journal_mode = WAL; PRAGMA synchronous = NORMAL; PRAGMA foreign_keys = ON;'
        });

        // Devolver un objeto que encapsula las operaciones del worker oficial
        dbInstance = {
            dbId,
            promiser,
            select: async <T = any[]>(query: string, params?: any[]): Promise<T> => {
                console.log('Ejecutando consulta SELECT con worker oficial:', query, params);

                try {
                    // Para consultas SELECT, obtener los resultados
                    const result = await promiser('exec', {
                        dbId,
                        sql: query,
                        bind: params || [],
                        returnValue: 'resultRows' // Devolver las filas obtenidas
                    });

                    console.log('Resultado de SELECT con worker oficial:', result);

                    // El resultado puede tener diferentes formatos, dependiendo de la implementación
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
                } catch (error) {
                    console.error('Error en consulta SELECT con worker oficial:', error);
                    throw error;
                }
            },
            execute: async (query: string, params?: any[]): Promise<any> => {
                console.log('Ejecutando consulta EXECUTE con worker oficial:', query, params);

                try {
                    const result = await promiser('exec', {
                        dbId,
                        sql: query,
                        bind: params || [],
                        returnValue: 'this' // Para operaciones de modificación
                    });

                    console.log('Resultado de EXECUTE con worker oficial:', result);

                    // Devolvemos un objeto indicando éxito
                    return { rowsAffected: 1, lastInsertRowid: null }; // Valor por defecto para operaciones de modificación
                } catch (error) {
                    console.error('Error en consulta EXECUTE con worker oficial:', error);
                    throw error;
                }
            }
        };

        return dbInstance;
    } catch (error) {
        console.error('Error inicializando SQLite WASM con worker oficial:', error);
        throw error;
    }
};

// Función para crear una base de datos web con SQLite WASM
const createWebDatabase = async (): Promise<Database> => {
    try {
        const db = await initSqliteWasm();

        // Crear el objeto de base de datos con las mismas funciones que Tauri
        const database: Database = {
            select: db.select,
            execute: db.execute
        };

        // Verificar que el objeto de base de datos no sea null
        if (!database) {
            console.error('La base de datos es null después de la creación');
            throw new Error('La creación de la base de datos falló, objeto de base de datos es null');
        }

        // Verificar que las funciones select y execute estén presentes
        if (!database.select || !database.execute) {
            console.error('Las funciones select o execute no están presentes en la base de datos');
            throw new Error('La base de datos no tiene las funciones select o execute');
        }

        return database;
    } catch (error) {
        console.error('Error inicializando base de datos web con SQLite WASM oficial:', error);
        throw error;
    }
};

export const useWebDatabase = () => {
    let db: Database | null = null;
    let initPromise: Promise<Database> | null = null; // Para manejar la inicialización única

    const initDatabase = async () => {
        if (db) return db;

        // Si ya hay una promesa de inicialización en curso, esperarla
        if (initPromise) {
            return await initPromise;
        }

        // Crear una promesa de inicialización para evitar inicializaciones múltiples
        initPromise = (async () => {
            try {
                console.log('Llamando a createWebDatabase con worker oficial');
                const createdDb = await createWebDatabase();

                console.log('createWebDatabase con worker oficial completado, verificando resultado');
                if (!createdDb) {
                    throw new Error('createWebDatabase retornó null o undefined');
                }

                db = createdDb;

                console.log('Base de datos con worker oficial creada exitosamente, creando tablas');

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

                console.log('Tablas creadas exitosamente con worker oficial');

                return db;
            } catch (error) {
                console.error('Error inicializando base de datos web con SQLite WASM oficial:', error);
                initPromise = null; // Resetear la promesa en caso de error
                throw error;
            }
        })();

        return await initPromise;
    };

    const getDatabase = async () => {
        if (!db) {
            console.log('getDatabase: inicializando base de datos con worker oficial');
            await initDatabase();
        }
        return db;
    };

    return {
        initDatabase,
        getDatabase,
    };
};