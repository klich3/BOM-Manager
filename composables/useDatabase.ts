import { invoke } from '@tauri-apps/api/core';
import type { BOMItem, BOMProject } from '../types/bom';

// Tipos para la base de datos
interface Database {
  select<T = any[]>(query: string, params?: any[]): Promise<T>;
  execute(query: string, params?: any[]): Promise<any>;
}

// Función para crear una base de datos simulada para entornos no Tauri
const createMockDatabase = (): Database => {
  // Simular una base de datos en memoria para entornos de desarrollo web
  const mockData: Record<string, any[]> = {
    'bom_items': [],
    'projects': []
  };

  return {
    select: <T = any[]>(query: string, params?: any[]): Promise<T> => {
      // Simular la ejecución de consultas SELECT
      console.log('Consulta simulada:', query, params);
      // Esta es una implementación básica que se puede mejorar según sea necesario
      if (query.includes('SELECT * FROM bom_items')) {
        return Promise.resolve(mockData['bom_items'] as unknown as T);
      }
      return Promise.resolve([] as T);
    },
    execute: (query: string, params?: any[]): Promise<any> => {
      // Simular la ejecución de consultas
      console.log('Ejecución simulada:', query, params);
      // Esta es una implementación básica que se puede mejorar según sea necesario
      if (query.includes('CREATE TABLE')) {
        // Simular creación de tabla
        if (query.includes('bom_items') && !mockData['bom_items']) {
          mockData['bom_items'] = [];
        } else if (query.includes('projects') && !mockData['projects']) {
          mockData['projects'] = [];
        }
      } else if (query.includes('INSERT')) {
        // Simular inserción de datos
        if (query.includes('bom_items')) {
          // Extraer valores simulados
          const newItem = { id: 'mock-' + Date.now(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
          if (mockData['bom_items']) {
            mockData['bom_items'].push(newItem);
          }
        }
      }
      return Promise.resolve({ rowsAffected: 1 });
    }
  };
};

// Función para generar IDs únicos
const generateId = (): string => {
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9);
};

export const useDatabase = () => {
  let db: Database | null = null;

  const initDatabase = async () => {
    if (db) return db;

    try {
      // Verificar si estamos en un entorno Tauri de forma más robusta
      const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

      if (isTauri) {
        try {
          // Importar dinámicamente el plugin de SQL solo si estamos en Tauri
          const { default: Database } = await import('@tauri-apps/plugin-sql');
          db = await Database.load('sqlite:bom_manager.db');
        } catch (pluginError) {
          console.warn('Error al cargar el plugin de Tauri, usando base de datos simulada:', pluginError);
          db = createMockDatabase();
        }
      } else {
        // En entornos no Tauri, usar una implementación simulada o alternativa
        console.warn('Ejecutando en modo simulado - Tauri no disponible');
        db = createMockDatabase();
      }

      // Verificar que la base de datos no sea nula antes de continuar
      if (!db) {
        throw new Error('No se pudo inicializar la base de datos');
      }

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
      const id = generateId();
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
      const id = generateId();
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

  // Método para actualizar stock de items
  const updateItemStock = async (id: string, newStock: number) => {
    const database = await getDatabase();
    if (!database) return false;

    try {
      const now = new Date().toISOString();
      await database.execute(
        'UPDATE bom_items SET in_stock = ?, updated_at = ? WHERE id = ?',
        [newStock, now, id]
      );
      return true;
    } catch (error) {
      console.error('Error actualizando stock de item:', error);
      return false;
    }
  };

  // Método para descontar stock de items basado en un BOM
  const consumeStockFromBOM = async (bomItems: { id: string; quantity: number }[]) => {
    const database = await getDatabase();
    if (!database) return { success: false, message: 'No se pudo acceder a la base de datos' };

    try {
      // Comenzar transacción
      await database.execute('BEGIN TRANSACTION');

      const errors: string[] = [];
      const now = new Date().toISOString();

      for (const bomItem of bomItems) {
        // Obtener el stock actual del item
        const currentItem = await getItemById(bomItem.id);
        if (!currentItem) {
          errors.push(`Item con ID ${bomItem.id} no encontrado`);
          continue;
        }

        const currentStock = currentItem.in_stock || 0;
        const newStock = currentStock - bomItem.quantity;

        if (newStock < 0) {
          errors.push(`Stock insuficiente para ${currentItem.name}. Requerido: ${bomItem.quantity}, Disponible: ${currentStock}`);
          continue;
        }

        // Actualizar el stock
        await database.execute(
          'UPDATE bom_items SET in_stock = ?, updated_at = ? WHERE id = ?',
          [newStock, now, bomItem.id]
        );
      }

      if (errors.length > 0) {
        // Si hay errores, hacer rollback
        await database.execute('ROLLBACK');
        return { success: false, message: errors.join('; ') };
      } else {
        // Si no hay errores, hacer commit
        await database.execute('COMMIT');
        return { success: true, message: 'Stock actualizado correctamente' };
      }
    } catch (error) {
      // En caso de error, hacer rollback
      await database.execute('ROLLBACK');
      console.error('Error descontando stock:', error);
      return { success: false, message: `Error al descontar stock: ${(error as Error).message}` };
    }
  };

  // Método para agregar stock a items
  const addStockToItems = async (stockUpdates: { id: string; quantity: number }[]) => {
    const database = await getDatabase();
    if (!database) return { success: false, message: 'No se pudo acceder a la base de datos' };

    try {
      // Comenzar transacción
      await database.execute('BEGIN TRANSACTION');

      const errors: string[] = [];
      const now = new Date().toISOString();

      for (const update of stockUpdates) {
        // Obtener el stock actual del item
        const currentItem = await getItemById(update.id);
        if (!currentItem) {
          errors.push(`Item con ID ${update.id} no encontrado`);
          continue;
        }

        const currentStock = currentItem.in_stock || 0;
        const newStock = currentStock + update.quantity;

        // Actualizar el stock
        await database.execute(
          'UPDATE bom_items SET in_stock = ?, updated_at = ? WHERE id = ?',
          [newStock, now, update.id]
        );
      }

      if (errors.length > 0) {
        // Si hay errores, hacer rollback
        await database.execute('ROLLBACK');
        return { success: false, message: errors.join('; ') };
      } else {
        // Si no hay errores, hacer commit
        await database.execute('COMMIT');
        return { success: true, message: 'Stock actualizado correctamente' };
      }
    } catch (error) {
      // En caso de error, hacer rollback
      await database.execute('ROLLBACK');
      console.error('Error agregando stock:', error);
      return { success: false, message: `Error al agregar stock: ${(error as Error).message}` };
    }
  };

  // Método para obtener items con bajo stock
  const getLowStockItems = async () => {
    const database = await getDatabase();
    if (!database) return [];

    try {
      const result = await database.select<any[]>(
        'SELECT * FROM bom_items WHERE in_stock < (min_stock || 0) OR (min_stock IS NOT NULL AND in_stock <= min_stock)'
      );
      return result;
    } catch (error) {
      console.error('Error obteniendo items con bajo stock:', error);
      return [];
    }
  };

  // Método para verificar stock y notificar items bajos
  const checkLowStockAndNotify = async () => {
    const lowStockItems = await getLowStockItems();

    // Aquí se podría integrar con el sistema de notificaciones
    // Por ahora, retornamos la lista de items con bajo stock
    return lowStockItems;
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
    deleteProject,
    updateItemStock,
    consumeStockFromBOM,
    addStockToItems,
    getLowStockItems,
    checkLowStockAndNotify
  };
};
