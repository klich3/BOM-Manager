import Database from '@tauri-apps/plugin-sql';
import type { BOMItem, BOMProject } from '../types/bom';

export const useDatabase = () => {
  let db: Database | null = null;

  const initDatabase = async () => {
    if (db) return db;

    try {
      db = await Database.load('sqlite:bom_manager.db');

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

      return db;
    } catch (error) {
      console.error('Error inicializando base de datos:', error);
      throw error;
    }
  };

  const getDatabase = async () => {
    if (!db) {
      await initDatabase();
    }
    return db;
  };

  // Métodos para items
  const getAllItems = async () => {
    const database = await getDatabase();
    if (!database) return [];

    try {
      const result = await database.select<any[]>('SELECT * FROM bom_items ORDER BY created_at DESC');
      return result;
    } catch (error) {
      console.error('Error obteniendo items:', error);
      return [];
    }
  };

  const getItemById = async (id: string) => {
    const database = await getDatabase();
    if (!database) return null;

    try {
      const result = await database.select<any[]>('SELECT * FROM bom_items WHERE id = ?', [id]);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error obteniendo item:', error);
      return null;
    }
  };

  const createItem = async (item: Partial<BOMItem>) => {
    const database = await getDatabase();
    if (!database) return null;

    try {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();

      await database.execute(
        `INSERT INTO bom_items (id, name, description, quantity, unit, category, supplier, 
         part_number, lcsc_part, price, in_stock, min_stock, notes, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          item.name || '',
          item.description || null,
          item.quantity || 0,
          item.unit || '',
          item.category || null,
          item.supplier || null,
          item.partNumber || null,
          item.lcscPart || null,
          item.price || null,
          item.inStock || 0,
          item.minStock || null,
          item.notes || null,
          now,
          now
        ]
      );

      return id;
    } catch (error) {
      console.error('Error creando item:', error);
      return null;
    }
  };

  const updateItem = async (id: string, item: Partial<BOMItem>) => {
    const database = await getDatabase();
    if (!database) return false;

    try {
      const now = new Date().toISOString();

      await database.execute(
        `UPDATE bom_items SET name = ?, description = ?, quantity = ?, unit = ?, category = ?,
         supplier = ?, part_number = ?, lcsc_part = ?, price = ?, in_stock = ?, min_stock = ?,
         notes = ?, updated_at = ? WHERE id = ?`,
        [
          item.name,
          item.description,
          item.quantity,
          item.unit,
          item.category,
          item.supplier,
          item.partNumber,
          item.lcscPart,
          item.price,
          item.inStock,
          item.minStock,
          item.notes,
          now,
          id
        ]
      );

      return true;
    } catch (error) {
      console.error('Error actualizando item:', error);
      return false;
    }
  };

  const deleteItem = async (id: string) => {
    const database = await getDatabase();
    if (!database) return false;

    try {
      await database.execute('DELETE FROM bom_items WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error('Error eliminando item:', error);
      return false;
    }
  };

  // Métodos para proyectos
  const getAllProjects = async () => {
    const database = await getDatabase();
    if (!database) return [];

    try {
      const result = await database.select<any[]>('SELECT * FROM projects ORDER BY created_at DESC');
      return result;
    } catch (error) {
      console.error('Error obteniendo proyectos:', error);
      return [];
    }
  };

  const getProjectById = async (id: string) => {
    const database = await getDatabase();
    if (!database) return null;

    try {
      const result = await database.select<any[]>('SELECT * FROM projects WHERE id = ?', [id]);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error obteniendo proyecto:', error);
      return null;
    }
  };

  const createProject = async (project: Partial<BOMProject>) => {
    const database = await getDatabase();
    if (!database) return null;

    try {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();

      await database.execute(
        'INSERT INTO projects (id, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
        [id, project.name || '', project.description || null, now, now]
      );

      return id;
    } catch (error) {
      console.error('Error creando proyecto:', error);
      return null;
    }
  };

  const updateProject = async (id: string, project: Partial<BOMProject>) => {
    const database = await getDatabase();
    if (!database) return false;

    try {
      const now = new Date().toISOString();

      await database.execute(
        'UPDATE projects SET name = ?, description = ?, updated_at = ? WHERE id = ?',
        [project.name, project.description, now, id]
      );

      return true;
    } catch (error) {
      console.error('Error actualizando proyecto:', error);
      return false;
    }
  };

  const deleteProject = async (id: string) => {
    const database = await getDatabase();
    if (!database) return false;

    try {
      await database.execute('DELETE FROM projects WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error('Error eliminando proyecto:', error);
      return false;
    }
  };

  return {
    initDatabase,
    getDatabase,
    getAllItems,
    getItemById,
    createItem,
    updateItem,
    deleteItem,
    getAllProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject
  };
};
