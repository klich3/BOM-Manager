<script setup lang="ts">
import { XMarkIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, ExclamationTriangleIcon } from "@heroicons/vue/24/outline";
import { ref, watch, computed } from "vue";
import { useSettingsStore } from "@/stores/settings";
import { useDatabaseAdapter } from "@/composables/useDatabaseAdapter";
import { useDatabaseSchema } from "@/composables/useDatabaseSchema";
import { useNotifications } from "@/composables/useNotifications";
import { useDialog } from "@/composables/useDialog";
import { useBackup } from "@/composables/useBackup";
import { useGitSync } from "@/composables/useGitSync";
import { useFileManager } from "@/composables/useFileManager";
import { ArrowPathIcon } from "@heroicons/vue/24/outline";

import { useI18n } from "@/composables/useI18n";

interface Props {
	show: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
	close: [];
}>();

const { t } = useI18n();
const settingsStore = useSettingsStore();
const localSettings = ref({
	currency: settingsStore.settings.currency,
	items_per_page: settingsStore.settings.items_per_page,
	language: settingsStore.settings.language,
	decimals: settingsStore.settings.decimals,
});

// Database export/import refs
const fileInputRef = ref<HTMLInputElement | null>(null);
const selectedFileName = ref<string>("");
const selectedFile = ref<File | null>(null);
const isExportingZip = ref(false);
const isExportingJson = ref(false);
const isImporting = ref(false);

const isAnyProcessing = computed(
	() => isExportingZip.value || isExportingJson.value || isImporting.value || isSyncing.value,
);
const zipFileInputRef = ref<HTMLInputElement | null>(null);

const { success, error: showError } = useNotifications();
const { showConfirmation, showMessage } = useDialog();
const { exportBackupZip, importBackupZip } = useBackup();
const { isSyncing, lastSync, setupRemote, sync } = useGitSync();
const { isTauri } = useFileManager();

const gitRemoteUrl = ref("");

// Actualizar los valores locales cuando cambien los de la tienda
watch(
	() => settingsStore.settings,
	(newSettings: any) => {
		localSettings.value = {
			currency: newSettings.currency,
			items_per_page: newSettings.items_per_page,
			language: newSettings.language,
			decimals: newSettings.decimals,
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
	settingsStore.updateDecimals(localSettings.value.decimals);
	emit("close");
};

// Database export functions
const exportDatabase = async () => {
	isExportingJson.value = true;
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
		isExportingJson.value = false;
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

const exportFullBackup = async () => {
	isExportingZip.value = true;
	try {
		await exportBackupZip();
		success("Exportación completada", "Respaldo completo (ZIP) exportado correctamente");
	} catch (error) {
		console.error("Error exporting ZIP backup:", error);
		showError("Error", "No se pudo exportar el respaldo completo");
	} finally {
		isExportingZip.value = false;
	}
};

const triggerZipFileSelect = () => {
	if (zipFileInputRef.value) {
		zipFileInputRef.value.click();
	}
};

const handleZipFileSelect = async (event: Event) => {
	const input = event.target as HTMLInputElement;
	if (input.files && input.files.length > 0) {
		const file = input.files[0];
		const confirmed = await showConfirmation(
			"Importar Respaldo Completo",
			`¿Estás seguro que deseas importar "${file.name}"?\n\n` +
				"Esta acción reemplazará TODOS los datos y archivos actuales. No se puede deshacer.",
		);

		if (confirmed) {
			isImporting.value = true;
			try {
				await importBackupZip(file);
				success("Importación completada", "Los datos y archivos se han restaurado correctamente");
				setTimeout(() => location.reload(), 2000);
			} catch (error) {
				console.error("Error importing ZIP backup:", error);
				showError("Error", "No se pudo importar el archivo ZIP");
			} finally {
				isImporting.value = false;
			}
		}
	}
};

const handleGitSetup = async () => {
	if (!gitRemoteUrl.value.trim()) {
		showError("Error", "Por favor ingresa una URL de repositorio válida");
		return;
	}

	try {
		await setupRemote(gitRemoteUrl.value.trim());
		success("Git Configurado", "El repositorio remoto se ha configurado correctamente");
	} catch (error) {
		showError("Error", "No se pudo configurar el repositorio Git");
	}
};

const handleGitSync = async () => {
	try {
		const result = await sync();
		if (result.success) {
			success("Sincronización Exitosa", "La base de datos se ha sincronizado con Git");
		} else {
			showError("Error de Sincronización", result.error || "Ocurrió un fallo en el proceso de Git");
		}
	} catch (error) {
		showError("Error Crítico", "Fallo al ejecutar la sincronización Git");
	}
};
</script>

<template>
	<div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
		<div
			class="bg-card-light rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-hidden flex flex-col">
			<!-- Header -->
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-xl font-semibold text-text-main-light">{{ t("settings") }}</h2>
				<button @click="closeModal" class="p-1 hover:bg-gray-100 rounded-lg transition-colors">
					<XMarkIcon class="w-6 h-6 text-text-muted-light" />
				</button>
			</div>

			<!-- Content -->
			<div class="flex-1 overflow-auto">
				<div class="space-y-6">
					<!-- Currency Selection -->
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">{{ t("currency") }}</label>
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
						<label class="block text-sm font-medium text-gray-700 mb-2">{{ t("items_per_page") }}</label>
						<select
							v-model="localSettings.items_per_page"
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
							<option :value="10">10</option>
							<option :value="20">20</option>
							<option :value="50">50</option>
							<option :value="100">100</option>
						</select>
					</div>

					<!-- Decimals -->
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">{{ t("price_decimals") }}</label>
						<select
							v-model="localSettings.decimals"
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
							<option :value="0">0</option>
							<option :value="1">1</option>
							<option :value="2">2</option>
							<option :value="3">3</option>
							<option :value="4">4</option>
						</select>
					</div>

					<!-- Language -->
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">{{ t("language") }}</label>
						<select
							v-model="localSettings.language"
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
							<option value="ru">{{ t("languages.ru") }}</option>
							<option value="es">{{ t("languages.es") }}</option>
							<option value="en">{{ t("languages.en") }}</option>
							<option value="fr">{{ t("languages.fr") }}</option>
							<option value="de">{{ t("languages.de") }}</option>
						</select>
					</div>

					<!-- Database Export/Import Section -->
					<div class="border-t border-gray-200 pt-6">
						<h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
							{{ t("database_and_files") }}
						</h3>

						<!-- Full Backup (ZIP) -->
						<div
							class="mb-6 border border-purple-200 bg-purple-50 dark:bg-purple-900/10 dark:border-purple-800 rounded-lg p-4">
							<label class="block text-sm font-medium text-purple-800 dark:text-purple-300 mb-3">{{
								t("full_backup_zip")
							}}</label>
							<p class="text-sm text-purple-700 dark:text-purple-400 mb-3">
								{{ t("export_all_zip_desc") }}
							</p>
							<div class="flex flex-wrap gap-3">
								<button
									@click="exportFullBackup"
									:disabled="isAnyProcessing"
									class="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors">
									<ArrowDownTrayIcon v-if="!isExportingZip" class="w-5 h-5 mr-2" />
									<div
										v-if="isExportingZip"
										class="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
									{{ isExportingZip ? t("exporting_zip") : t("export_all_zip") }}
								</button>

								<button
									@click="triggerZipFileSelect"
									:disabled="isAnyProcessing"
									class="inline-flex items-center px-4 py-2 border border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 disabled:border-gray-300 disabled:text-gray-300 font-medium rounded-lg transition-colors">
									<ArrowUpTrayIcon class="w-5 h-5 mr-2" />
									{{ t("import_all_zip") }}
								</button>
								<input
									ref="zipFileInputRef"
									type="file"
									accept=".zip"
									@change="handleZipFileSelect"
									class="hidden" />
							</div>
						</div>

						<!-- Export Database -->
						<div
							class="mb-6 border border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800 rounded-lg p-4">
							<label class="block text-sm font-medium text-green-800 dark:text-green-300 mb-3">{{
								t("export_db_json")
							}}</label>
							<p class="text-sm text-green-700 dark:text-green-400 mb-3">
								{{ t("export_db_json_desc") }}
							</p>
							<button
								@click="exportDatabase"
								:disabled="isAnyProcessing"
								class="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors">
								<ArrowDownTrayIcon v-if="!isExportingJson" class="w-5 h-5 mr-2" />
								<div
									v-if="isExportingJson"
									class="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
								{{ isExportingJson ? t("exporting") : t("export_json") }}
							</button>
						</div>

						<!-- Git Sync Section (Desktop only) -->
						<div
							v-if="isTauri"
							class="mb-6 border border-indigo-200 bg-indigo-50 dark:bg-indigo-900/10 dark:border-indigo-800 rounded-lg p-4">
							<label class="block text-sm font-medium text-indigo-800 dark:text-indigo-300 mb-3">{{
								t("git_sync")
							}}</label>
							<p class="text-sm text-indigo-700 dark:text-indigo-400 mb-3">
								{{ t("git_sync_desc") }}
							</p>

							<div class="space-y-4">
								<div>
									<input
										v-model="gitRemoteUrl"
										type="text"
										:placeholder="t('git_remote_placeholder')"
										class="w-full px-3 py-2 border border-indigo-200 dark:border-indigo-800 rounded-lg bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
								</div>

								<div class="flex flex-wrap gap-3">
									<button
										@click="handleGitSetup"
										:disabled="isAnyProcessing"
										class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition-colors">
										{{ t("setup_remote") }}
									</button>
									<button
										@click="handleGitSync"
										:disabled="isAnyProcessing"
										class="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-900 border border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 disabled:border-gray-200 disabled:text-gray-300 text-sm font-medium rounded-lg transition-colors">
										<ArrowPathIcon v-if="!isSyncing" class="w-4 h-4 mr-2" />
										<div
											v-else
											class="w-4 h-4 mr-2 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
										{{ isSyncing ? t("syncing") : t("sync_now") }}
									</button>
								</div>

								<p v-if="lastSync" class="text-[10px] text-indigo-500">
									{{ t("last_sync", { date: lastSync }) }}
								</p>
							</div>
						</div>

						<!-- Import Database -->
						<div class="border border-blue-200 bg-blue-50 rounded-lg p-4">
							<label class="block text-sm font-medium text-blue-800 mb-3">{{ t("import_db") }}</label>
							<p class="text-sm text-blue-700 mb-3">
								{{ t("import_db_desc") }}
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
									:disabled="isAnyProcessing"
									class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors">
									<ArrowUpTrayIcon class="w-5 h-5 mr-2" />
									{{ t("select_file") }}
								</button>
								<span v-if="selectedFileName" class="text-sm text-blue-700 truncate max-w-xs">
									{{ selectedFileName }}
								</span>
							</div>

							<div v-if="selectedFileName" class="mt-4 flex gap-3">
								<button
									@click="importDatabase"
									:disabled="isAnyProcessing"
									class="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors">
									<ExclamationTriangleIcon v-if="!isImporting" class="w-5 h-5 mr-2" />
									<div
										v-if="isImporting"
										class="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
									{{ isImporting ? t("importing") : t("import_db") }}
								</button>
								<button
									@click="cancelImport"
									class="px-4 py-2 border border-blue-300 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition-colors">
									{{ t("cancel_import") }}
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
										<strong>{{ t("import_warning_title") }}:</strong> {{ t("import_warning_desc") }}
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
					:disabled="isAnyProcessing"
					class="px-6 py-2.5 rounded-lg border border-gray-300 text-text-main-light font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
					{{ t("cancel") }}
				</button>
				<button
					@click="saveSettings"
					:disabled="isAnyProcessing"
					class="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary/90 disabled:bg-gray-300 text-white font-bold transition-all">
					{{ t("save") }}
				</button>
			</div>
		</div>
	</div>
</template>
