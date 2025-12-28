import { ref } from 'vue';

interface TableDefinition {
    name: string;
    definition: string;
}

interface Schema {
    tables: TableDefinition[];
}

const schemaData = ref<Schema | null>(null);

export async function useDatabaseSchema() {
    async function loadSchema(): Promise<Schema> {
        if (schemaData.value) {
            return schemaData.value;
        }

        // Cargar el esquema desde el archivo JSON
        const schemaModule: Schema = await import('~/data/db/schema.json').then(module => module.default || module);
        schemaData.value = schemaModule;
        return schemaData.value!;
    }

    async function createTables(db: any) {
        const schema = await loadSchema();

        for (const table of schema.tables) {
            await db.execute(table.definition);
        }
    }

    async function getTableDefinition(tableName: string): Promise<string | null> {
        const schema = await loadSchema();
        const table = schema.tables.find(t => t.name === tableName);
        return table ? table.definition : null;
    }

    return {
        loadSchema,
        createTables,
        getTableDefinition
    };
}