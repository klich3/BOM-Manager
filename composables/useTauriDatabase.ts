import { invoke } from '@tauri-apps/api/core';

import type { Database } from '@/types/database';

// Función para crear una base de datos con Tauri
const createTauriDatabase = async (): Promise<Database> => {
    try {
        // Importar dinámicamente el plugin de SQL
        const { default: Database } = await import('@tauri-apps/plugin-sql');
        const db = await Database.load('sqlite:bom_manager.db');

        return {
            select: <T = any[]>(query: string, params?: any[]): Promise<T> => {
                return db.select(query, params || []);
            },
            execute: (query: string, params?: any[]): Promise<any> => {
                return db.execute(query, params || []);
            }
        };
    } catch (error) {
        console.error('Error inicializando base de datos de Tauri:', error);
        throw error;
    }
};

export const useTauriDatabase = () => {
    let db: Database | null = null;

    const initDatabase = async () => {
        if (db) return db;

        try {
            db = await createTauriDatabase();

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
            console.error('Error inicializando base de datos de Tauri:', error);
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