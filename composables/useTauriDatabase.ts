import { invoke } from '@tauri-apps/api/core';

import type { Database } from '@/types/database';
import { useDatabaseSchema } from './useDatabaseSchema';

const createTauriDatabase = async (): Promise<Database> => {
    try {
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

            const { createTables } = await useDatabaseSchema();
            await createTables(db);

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