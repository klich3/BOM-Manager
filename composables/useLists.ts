import { ref, computed } from 'vue';
import type { BOMItem } from '../types/bom';

// Definición de tipos para las listas
export interface ComponentItem {
    id: string;
    name: string;
    part_number?: string;
    lcsc_part?: string;
    unit: string;
    quantity: number;
}

export interface ComponentList {
    id: string;
    name: string;
    description?: string;
    items: ComponentItem[];
    createdAt: Date;
    updatedAt: Date;
}

// Composable para gestionar listas de componentes
export const useLists = () => {
    // Usar localStorage para persistencia simple
    const STORAGE_KEY = 'component-lists';

    const lists = ref<ComponentList[]>([]);

    // Cargar listas desde localStorage
    const loadLists = () => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                lists.value = parsed.map((list: any) => ({
                    ...list,
                    createdAt: new Date(list.createdAt),
                    updatedAt: new Date(list.updatedAt)
                }));
            }
        } catch (error) {
            console.error('Error loading lists from storage:', error);
            lists.value = [];
        }
    };

    // Guardar listas en localStorage
    const saveLists = () => {
        try {
            const serialized = JSON.stringify(lists.value);
            localStorage.setItem(STORAGE_KEY, serialized);
        } catch (error) {
            console.error('Error saving lists to storage:', error);
        }
    };

    // Cargar listas al inicializar el composable
    loadLists();

    // Métodos CRUD
    const createList = (list: Omit<ComponentList, 'id' | 'createdAt' | 'updatedAt'>): string => {
        const newList: ComponentList = {
            id: crypto.randomUUID(),
            ...list,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        lists.value.push(newList);
        saveLists();
        return newList.id;
    };

    const updateList = (id: string, list: Partial<Omit<ComponentList, 'id' | 'createdAt'>>) => {
        const index = lists.value.findIndex(l => l.id === id);
        if (index !== -1) {
            const currentList = lists.value[index];
            if (currentList) { // Verificación adicional para evitar problemas de tipado
                lists.value[index] = {
                    ...currentList,
                    ...list,
                    name: list.name ?? currentList.name, // asegurar que name esté definido
                    items: list.items ?? currentList.items, // asegurar que items esté definido
                    id: currentList.id, // mantener el ID original
                    createdAt: currentList.createdAt, // mantener la fecha de creación
                    updatedAt: new Date() // actualizar la fecha de modificación
                };
                saveLists();
                return true;
            }
        }
        return false;
    };

    const deleteList = (id: string) => {
        const index = lists.value.findIndex(l => l.id === id);
        if (index !== -1) {
            lists.value.splice(index, 1);
            saveLists();
            return true;
        }
        return false;
    };

    const getListById = (id: string) => {
        return lists.value.find(l => l.id === id) || null;
    };

    // Computed para acceso reactivo
    const allLists = computed(() => lists.value);
    const listCount = computed(() => lists.value.length);

    // Métodos de utilidad
    const mergeLists = (listIds: string[], newName: string): string => {
        const listsToMerge = lists.value.filter(l => listIds.includes(l.id));
        if (listsToMerge.length === 0) {
            throw new Error('No se encontraron listas para mezclar');
        }

        // Combinar items de todas las listas
        const mergedItems: ComponentItem[] = [];

        for (const list of listsToMerge) {
            for (const item of list.items) {
                // Buscar si el item ya existe en mergedItems
                const existingItemIndex = mergedItems.findIndex(i => i.id === item.id);
                if (existingItemIndex !== -1 && mergedItems[existingItemIndex]) {
                    // Si existe, sumar las cantidades
                    mergedItems[existingItemIndex].quantity += item.quantity;
                } else {
                    // Si no existe, agregarlo
                    mergedItems.push({ ...item });
                }
            }
        }

        // Crear la nueva lista combinada
        const mergedList: ComponentList = {
            id: crypto.randomUUID(),
            name: newName,
            description: `Mezcla de ${listsToMerge.length} listas`,
            items: mergedItems,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        lists.value.push(mergedList);
        saveLists();
        return mergedList.id;
    };

    const reorderListItems = (listId: string, newOrder: ComponentItem[]) => {
        const index = lists.value.findIndex(l => l.id === listId);
        if (index !== -1 && lists.value[index]) {
            lists.value[index].items = newOrder;
            lists.value[index].updatedAt = new Date();
            saveLists();
            return true;
        }
        return false;
    };

    return {
        // Propiedades reactivas
        lists: allLists,
        listCount,

        // Métodos
        createList,
        updateList,
        deleteList,
        getListById,
        loadLists,
        saveLists,

        // Métodos de utilidad
        mergeLists,
        reorderListItems
    };
};