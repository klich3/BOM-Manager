<template>
	<div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
		<div
			class="bg-card-light rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-hidden flex flex-col">
			<!-- Header -->
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-xl font-semibold text-text-main-light">Configuración</h2>
				<button @click="closeModal" class="p-1 hover:bg-gray-100 rounded-lg transition-colors">
					<XMarkIcon class="w-6 h-6 text-text-muted-light" />
				</button>
			</div>

			<!-- Content -->
			<div class="flex-1 overflow-auto">
				<div class="space-y-6">
					<!-- Currency Selection -->
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Moneda</label>
						<select
							v-model="localSettings.currency"
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
							<option value="USD">USD ($)</option>
							<option value="EUR">EUR (€)</option>
							<option value="GBP">GBP (£)</option>
							<option value="JPY">JPY (¥)</option>
							<option value="CNY">CNY (¥)</option>
						</select>
					</div>

					<!-- Items per page -->
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Elementos por página</label>
						<select
							v-model="localSettings.items_per_page"
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
							<option value="10">10</option>
							<option value="20">20</option>
							<option value="50">50</option>
							<option value="100">100</option>
						</select>
					</div>

					<!-- Language -->
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Idioma</label>
						<select
							v-model="localSettings.language"
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
							<option value="es">Español</option>
							<option value="en">English</option>
							<option value="fr">Français</option>
							<option value="de">Deutsch</option>
						</select>
					</div>

					<!-- Database Export/Import Section -->
					<div class="border-t border-gray-200 pt-6">
						<h3 class="text-lg font-medium text-gray-900 mb-4">Base de Datos</h3>

						<!-- Export Database -->
						<div class="mb-6 border border-green-200 bg-green-50 rounded-lg p-4">
							<label class="block text-sm font-medium text-green-800 mb-3">Exportar Base de Datos</label>
							<p class="text-sm text-green-700 mb-3">
								Exporta toda la información del sistema en un archivo JSON para respaldar o transferir a
								otro dispositivo.
							</p>
							<button
								@click="exportDatabase"
								:disabled="isExporting"
								class="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors">
								<ArrowDownTrayIcon v-if="!isExporting" class="w-5 h-5 mr-2" />
								<div
									v-if="isExporting"
									class="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
								{{ isExporting ? "Exportando..." : "Exportar Base de Datos" }}
							</button>
						</div>

						<!-- Import Database -->
						<div class="border border-blue-200 bg-blue-50 rounded-lg p-4">
							<label class="block text-sm font-medium text-blue-800 mb-3">Importar Base de Datos</label>
							<p class="text-sm text-blue-700 mb-3">
								Importa toda la información desde un archivo JSON previamente exportado. Esto
								reemplazará todos los datos actuales.
							</p>

							<div class="flex items-center gap-3">
								<input
									ref="fileInputRef"
									type="file"
									accept=".json"
									@change="handleFileSelect"
									class="hidden" />
								<button
									@click="triggerFileSelect"
									class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
									<ArrowUpTrayIcon class="w-5 h-5 mr-2" />
									Seleccionar Archivo
								</button>
								<span v-if="selectedFileName" class="text-sm text-blue-700 truncate max-w-xs">
									{{ selectedFileName }}
								</span>
							</div>

							<div v-if="selectedFileName" class="mt-4 flex gap-3">
								<button
									@click="importDatabase"
									:disabled="isImporting"
									class="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors">
									<ExclamationTriangleIcon v-if="!isImporting" class="w-5 h-5 mr-2" />
									<div
										v-if="isImporting"
										class="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
									{{ isImporting ? "Importando..." : "Importar Base de Datos" }}
								</button>
								<button
									@click="cancelImport"
									class="px-4 py-2 border border-blue-300 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition-colors">
									Cancelar
								</button>
							</div>

							<!-- Warning Message -->
							<div
								v-if="selectedFileName"
								class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
								<div class="flex items-start">
									<ExclamationTriangleIcon
										class="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
									<div class="text-sm text-yellow-800">
										<strong>Advertencia:</strong> Esta acción reemplazará completamente todos los
										datos actuales del sistema. Se recomienda hacer una copia de seguridad antes de
										proceder.
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Action buttons -->
			<div class="flex justify-end items-center gap-4 mt-6 pt-6 border-t border-gray-200">
				<button
					@click="closeModal"
					class="px-6 py-2.5 rounded-lg border border-gray-300 text-text-main-light font-medium hover:bg-gray-100 transition-colors">
					Cancelar
				</button>
				<button
					@click="saveSettings"
					class="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold transition-all">
					Guardar configuración
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { XMarkIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, ExclamationTriangleIcon } from "@heroicons/vue/24/outline";
import { ref, watch } from "vue";
import { useSettingsStore } from "@/stores/settings";
import { useDatabaseAdapter } from "@/composables/useDatabaseAdapter";
import { useDatabaseSchema } from "@/composables/useDatabaseSchema";
import { useNotifications } from "@/composables/useNotifications";
import { useDialog } from "@/composables/useDialog";

interface Props {
	show: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
	close: [];
}>();

const settingsStore = useSettingsStore();
const localSettings = ref({
	currency: settingsStore.settings.currency,
	items_per_page: settingsStore.settings.items_per_page,
	language: settingsStore.settings.language,
});

// Database export/import refs
const fileInputRef = ref<HTMLInputElement | null>(null);
const selectedFileName = ref<string>("");
const selectedFile = ref<File | null>(null);
const isExporting = ref(false);
const isImporting = ref(false);

const { success, error: showError } = useNotifications();
const { showConfirmation, showMessage } = useDialog();

// Actualizar los valores locales cuando cambien los de la tienda
watch(
	() => settingsStore.settings,
	(newSettings) => {
		localSettings.value = {
			currency: newSettings.currency,
			items_per_page: newSettings.items_per_page,
			language: newSettings.language,
		};
	},
	{ deep: true },
);

const closeModal = () => {
	emit("close");
};

const saveSettings = () => {
	settingsStore.updateCurrency(localSettings.value.currency);
	settingsStore.updateItemsPerPage(localSettings.value.items_per_page);
	settingsStore.updateLanguage(localSettings.value.language);
	emit("close");
};

// Database export functions
const exportDatabase = async () => {
	isExporting.value = true;
	try {
		const { getDatabase } = useDatabaseAdapter();
		const db = await getDatabase();

		if (!db) {
			throw new Error("No se pudo obtener la conexión a la base de datos");
		}

		// Obtener todas las tablas
		const tablesResult = await db.select<{ name: string }[]>(
			"SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != '__diesel_schema_migrations'",
		);

		const tables = tablesResult.map((row) => row.name);
		const exportData: Record<string, any[]> = {};

		// Exportar datos de cada tabla
		for (const tableName of tables) {
			try {
				const tableData = await db.select(`SELECT * FROM ${tableName}`);
				exportData[tableName] = tableData;
			} catch (error) {
				console.warn(`Error exporting table ${tableName}:`, error);
				exportData[tableName] = [];
			}
		}

		// Agregar metadata
		(exportData as any).__metadata = {
			exportedAt: new Date().toISOString(),
			version: "1.0.0",
			tables: tables,
		};

		// Crear y descargar archivo
		const jsonData = JSON.stringify(exportData, null, 2);
		const blob = new Blob([jsonData], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `bom_database_export_${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);

		success("Exportación completada", `Base de datos exportada correctamente (${tables.length} tablas)`);
	} catch (error) {
		console.error("Error exporting database:", error);
		showError("Error en exportación", "No se pudo exportar la base de datos");
	} finally {
		isExporting.value = false;
	}
};

// Database import functions
const triggerFileSelect = () => {
	if (fileInputRef.value) {
		fileInputRef.value.click();
	}
};

const handleFileSelect = async (event: Event) => {
	const input = event.target as HTMLInputElement;
	if (input.files && input.files.length > 0) {
		selectedFile.value = input.files[0];
		selectedFileName.value = input.files[0].name;

		// Mostrar advertencia usando el sistema de diálogos
		await showMessage(
			"Advertencia Importante",
			"Esta acción reemplazará completamente todos los datos actuales del sistema. Se recomienda hacer una copia de seguridad antes de proceder.",
			"warning",
		);
	} else {
		selectedFile.value = null;
		selectedFileName.value = "";
	}
};

const cancelImport = () => {
	selectedFile.value = null;
	selectedFileName.value = "";
	if (fileInputRef.value) {
		fileInputRef.value.value = "";
	}
};

const importDatabase = async () => {
	if (!selectedFile.value) return;

	isImporting.value = true;
	try {
		// Leer el archivo
		const content = await selectedFile.value.text();
		const importData = JSON.parse(content);

		// Validar estructura
		if (!importData.__metadata) {
			throw new Error("Archivo de importación inválido: falta metadata");
		}

		const { getDatabase } = useDatabaseAdapter();
		const db = await getDatabase();

		if (!db) {
			throw new Error("No se pudo obtener la conexión a la base de datos");
		}

		// Confirmar acción destructiva
		const confirmed = await showConfirmation(
			"Importar Base de Datos",
			"¿Está seguro que desea importar esta base de datos?\n\n" +
				"Esta acción reemplazará completamente todos los datos actuales del sistema.\n" +
				"Se recomienda tener una copia de seguridad antes de continuar.\n\n" +
				"¿Desea continuar?",
		);

		if (!confirmed) {
			return;
		}

		// Eliminar datos existentes (excepto tablas del sistema)
		const tablesToDelete = importData.__metadata.tables;
		for (const tableName of tablesToDelete) {
			try {
				await db.execute(`DELETE FROM ${tableName}`);
			} catch (error) {
				console.warn(`Error clearing table ${tableName}:`, error);
			}
		}

		// Importar datos
		let importedTables = 0;
		for (const tableName of tablesToDelete) {
			if (importData[tableName] && Array.isArray(importData[tableName])) {
				const tableData = importData[tableName];
				for (const row of tableData) {
					try {
						// Construir consulta INSERT dinámica
						const columns = Object.keys(row);
						const values = columns.map(() => "?");
						const insertQuery = `INSERT INTO ${tableName} (${columns.join(", ")}) VALUES (${values.join(
							", ",
						)})`;

						const params = columns.map((col) => row[col]);
						await db.execute(insertQuery, params);
					} catch (error) {
						console.warn(`Error importing row to ${tableName}:`, error);
					}
				}
				importedTables++;
			}
		}

		success("Importación completada", `Base de datos importada correctamente (${importedTables} tablas)`);

		// Limpiar selección
		cancelImport();

		// Recargar la aplicación
		setTimeout(() => {
			location.reload();
		}, 2000);
	} catch (error) {
		console.error("Error importing database:", error);
		showError(
			"Error en importación",
			error instanceof Error ? error.message : "No se pudo importar la base de datos",
		);
	} finally {
		isImporting.value = false;
	}
};
</script>
