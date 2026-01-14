import { computed } from 'vue';
import { useSettingsStore } from '@/stores/settings';

const translations = {
    es: {
        dashboard: 'Panel de Control',
        inventory: 'Inventario',
        projects: 'Proyectos',
        settings: 'Configuración',
        search: 'Buscar...',
        add_item: 'Agregar Item',
        create_project: 'Crear Proyecto',
        total_items: 'Total Items',
        low_stock: 'Stock Bajo',
        stock_ok: 'Stock OK',
        total_value: 'Valor Total',
        language: 'Idioma',
        currency: 'Moneda',
        theme: 'Tema',
        dark: 'Oscuro',
        light: 'Claro',
        save: 'Guardar',
        cancel: 'Cancelar',
        edit: 'Editar',
        delete: 'Eliminar',
        import: 'Importar',
        export: 'Exportar',
        name: 'Nombre',
        description: 'Descripción',
        quantity: 'Cantidad',
        price: 'Precio',
        category: 'Categoría',
        supplier: 'Proveedor',
        status: 'Estado',
        draft: 'Borrador',
        prototype: 'Prototipo',
        production: 'Producción',
        archived: 'Archivado'
    },
    en: {
        dashboard: 'Dashboard',
        inventory: 'Inventory',
        projects: 'Projects',
        settings: 'Settings',
        search: 'Search...',
        add_item: 'Add Item',
        create_project: 'Create Project',
        total_items: 'Total Items',
        low_stock: 'Low Stock',
        stock_ok: 'Stock OK',
        total_value: 'Total Value',
        language: 'Language',
        currency: 'Currency',
        theme: 'Theme',
        dark: 'Dark',
        light: 'Light',
        save: 'Save',
        cancel: 'Cancel',
        edit: 'Edit',
        delete: 'Delete',
        import: 'Import',
        export: 'Export',
        name: 'Name',
        description: 'Description',
        quantity: 'Quantity',
        price: 'Price',
        category: 'Category',
        supplier: 'Supplier',
        status: 'Status',
        draft: 'Draft',
        prototype: 'Prototype',
        production: 'Production',
        archived: 'Archived'
    }
};

export const useI18n = () => {
    const settingsStore = useSettingsStore();
    const lang = computed(() => settingsStore.settings.language as keyof typeof translations || 'es');

    const t = (key: string): string => {
        const langData = translations[lang.value] || translations.es;
        return (langData as any)[key] || key;
    };

    return {
        t,
        lang
    };
};
