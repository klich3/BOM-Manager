import { defineStore } from 'pinia';
import { useDatabase } from '@/composables/useDatabase';
import type { BOMItem, BOMProject } from '@/types/bom';

interface DatabaseState {
    items: BOMItem[];
    projects: BOMProject[];
    projectItems: any[]; // Podríamos definir un tipo más específico si es necesario
    loading: boolean;
    error: string | null;
}

export const useDatabaseStore = defineStore('database', {
    state: (): DatabaseState => ({
        items: [],
        projects: [],
        projectItems: [],
        loading: false,
        error: null,
    }),

    actions: {
        async loadItems() {
            this.loading = true;
            try {
                const db = useDatabase();
                this.items = await db.getAllItems();
                this.error = null;
            } catch (error) {
                this.error = error instanceof Error ? error.message : 'Error al cargar los items';
                console.error('Error al cargar los items:', error);
            } finally {
                this.loading = false;
            }
        },

        async loadProjects() {
            this.loading = true;
            try {
                const db = useDatabase();
                this.projects = await db.getAllProjects();
                this.error = null;
            } catch (error) {
                this.error = error instanceof Error ? error.message : 'Error al cargar los proyectos';
                console.error('Error al cargar los proyectos:', error);
            } finally {
                this.loading = false;
            }
        },

        async addItem(item: Partial<BOMItem>) {
            this.loading = true;
            try {
                const db = useDatabase();
                const id = await db.createItem(item);
                if (id) {
                    await this.loadItems(); // Recargar la lista
                }
                this.error = null;
                return id;
            } catch (error) {
                this.error = error instanceof Error ? error.message : 'Error al crear el item';
                console.error('Error al crear el item:', error);
                return null;
            } finally {
                this.loading = false;
            }
        },

        async updateItem(id: string, item: Partial<BOMItem>) {
            this.loading = true;
            try {
                const db = useDatabase();
                const success = await db.updateItem(id, item);
                if (success) {
                    await this.loadItems(); // Recargar la lista
                }
                this.error = null;
                return success;
            } catch (error) {
                this.error = error instanceof Error ? error.message : 'Error al actualizar el item';
                console.error('Error al actualizar el item:', error);
                return false;
            } finally {
                this.loading = false;
            }
        },

        async deleteItem(id: string) {
            this.loading = true;
            try {
                const db = useDatabase();
                const success = await db.deleteItem(id);
                if (success) {
                    await this.loadItems(); // Recargar la lista
                }
                this.error = null;
                return success;
            } catch (error) {
                this.error = error instanceof Error ? error.message : 'Error al eliminar el item';
                console.error('Error al eliminar el item:', error);
                return false;
            } finally {
                this.loading = false;
            }
        },

        async addProject(project: Partial<BOMProject>) {
            this.loading = true;
            try {
                const db = useDatabase();
                const id = await db.createProject(project);
                if (id) {
                    await this.loadProjects(); // Recargar la lista
                }
                this.error = null;
                return id;
            } catch (error) {
                this.error = error instanceof Error ? error.message : 'Error al crear el proyecto';
                console.error('Error al crear el proyecto:', error);
                return null;
            } finally {
                this.loading = false;
            }
        },

        async updateProject(id: string, project: Partial<BOMProject>) {
            this.loading = true;
            try {
                const db = useDatabase();
                const success = await db.updateProject(id, project);
                if (success) {
                    await this.loadProjects(); // Recargar la lista
                }
                this.error = null;
                return success;
            } catch (error) {
                this.error = error instanceof Error ? error.message : 'Error al actualizar el proyecto';
                console.error('Error al actualizar el proyecto:', error);
                return false;
            } finally {
                this.loading = false;
            }
        },

        async deleteProject(id: string) {
            this.loading = true;
            try {
                const db = useDatabase();
                const success = await db.deleteProject(id);
                if (success) {
                    await this.loadProjects(); // Recargar la lista
                }
                this.error = null;
                return success;
            } catch (error) {
                this.error = error instanceof Error ? error.message : 'Error al eliminar el proyecto';
                console.error('Error al eliminar el proyecto:', error);
                return false;
            } finally {
                this.loading = false;
            }
        },

        async addProjectItem(projectId: string, itemId: string, quantity: number = 1) {
            this.loading = true;
            try {
                const db = useDatabase();
                const success = await db.addItemToProject(projectId, itemId, quantity);
                if (success) {
                    await this.loadProjectItems(projectId); // Recargar la lista
                }
                this.error = null;
                return success;
            } catch (error) {
                this.error = error instanceof Error ? error.message : 'Error al agregar item al proyecto';
                console.error('Error al agregar item al proyecto:', error);
                return false;
            } finally {
                this.loading = false;
            }
        },

        async loadProjectItems(projectId: string) {
            this.loading = true;
            try {
                const db = useDatabase();
                this.projectItems = await db.getProjectItems(projectId);
                this.error = null;
            } catch (error) {
                this.error = error instanceof Error ? error.message : 'Error al cargar los items del proyecto';
                console.error('Error al cargar los items del proyecto:', error);
            } finally {
                this.loading = false;
            }
        },
    },
});