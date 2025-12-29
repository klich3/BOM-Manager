<template>
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
		<div
			class="bg-card-light rounded-2xl shadow-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-hidden flex flex-col">
			<!-- Header -->
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-xl font-semibold text-text-main-light">Importar Archivo BOM</h2>
				<button @click="$emit('close')" class="p-1 hover:bg-gray-100 rounded-lg transition-colors">
					<XMarkIcon class="w-6 h-6 text-text-muted-light" />
				</button>
			</div>

			<!-- Progress indicator -->
			<div class="mb-6">
				<div class="flex justify-between items-center mb-2">
					<span class="text-primary text-sm font-bold uppercase tracking-wider">Paso {{ step }} de 3</span>
					<span class="text-text-main-light text-sm font-medium">{{ getStepTitle() }}</span>
				</div>
				<div class="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
					<div
						class="absolute top-0 left-0 h-full bg-primary rounded-full"
						:style="{ width: getProgressWidth() }"></div>
				</div>
				<div class="flex justify-between text-xs text-text-muted-light font-medium mt-1">
					<span>Upload</span>
					<span class="text-text-main-light">Mapping</span>
					<span>Validation</span>
				</div>
			</div>

			<!-- Content based on step -->
			<div class="flex-1 overflow-auto">
				<div v-if="step === 1">
					<!-- Step 1: File Upload -->
					<div class="space-y-4">
						<FileUpload @file-selected="handleFileImport" @error="handleImportError" />

						<div v-if="selectedFile" class="mt-6 p-4 bg-gray-50 rounded-xl">
							<div class="flex items-center justify-between">
								<div>
									<p class="font-medium text-gray-900">
										{{ selectedFile.name }}
									</p>
									<p class="text-sm text-gray-500">
										{{ formatFileSize(selectedFile?.size || 0) }} •
										{{ selectedFile?.type || "Archivo" }}
									</p>
								</div>
								<button
									@click="resetImport"
									class="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
									Cambiar archivo
								</button>
							</div>
						</div>
					</div>
				</div>

				<div v-if="step === 2">
					<!-- Step 2: Data Mapping -->
					<div class="mb-6">
						<h3 class="text-lg font-medium text-gray-900 mb-4">Mapeo de columnas</h3>
						<p class="text-gray-600 mb-4">Mapea las columnas del archivo con los campos del esquema:</p>

						<!-- Column mapping table -->
						<div class="mb-6 overflow-x-auto">
							<div class="grid grid-cols-2 gap-4">
								<div
									class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border">
									Columna del archivo
								</div>
								<div
									class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border">
									Mapear a campo
								</div>
								<template v-for="(header, headerIndex) in originalHeaders" :key="headerIndex">
									<div class="px-3 py-2 font-mono text-sm bg-gray-50 border-t">
										{{ header }}
									</div>
									<div class="px-3 py-2 border-t">
										<select
											:value="columnMapping[header] || ''"
											@change="(e: Event) => updateColumnMapping(header, (e.target as HTMLSelectElement).value)"
											class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
											<option value="">Seleccionar campo...</option>
											<optgroup label="Campos requeridos">
												<option value="name">Nombre</option>
												<option value="quantity">Cantidad</option>
											</optgroup>
											<optgroup label="Campos opcionales">
												<option value="description">Descripción</option>
												<option value="category">Categoría</option>
												<option value="supplier">Proveedor</option>
												<option value="partNumber">Número de parte</option>
												<option value="lcscPart">Referencia LCSC</option>
												<option value="price">Precio</option>
												<option value="minStock">Stock mínimo</option>
												<option value="notes">Notas</option>
												<option value="manufacturer">Fabricante</option>
												<option value="customerNo">Número de Cliente</option>
												<option value="package">Empaquetado</option>
												<option value="rohs">RoHS</option>
												<option value="extPrice">Precio Extendido</option>
												<option value="leadTime">Tiempo de Entrega</option>
												<option value="dateCodeLotNo">Código de Fecha/Número de Lote</option>
												<option value="status">Estado</option>
											</optgroup>
										</select>
									</div>
								</template>
							</div>
						</div>

						<!-- Preview of final table -->
						<div>
							<h3 class="text-lg font-medium text-gray-900 mb-4">Vista previa de la tabla final</h3>
							<div class="overflow-x-auto">
								<table class="min-w-full divide-y divide-gray-200">
									<thead class="bg-gray-50">
										<tr>
											<th
												v-for="(header, headerIndex) in originalHeaders"
												:key="'preview-header-' + headerIndex"
												class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												{{ header }}
												<span v-if="columnMapping[header]" class="block text-xs text-gray-500">
													→ {{ getFieldName(columnMapping[header]) }}
												</span>
											</th>
										</tr>
									</thead>
									<tbody class="bg-white divide-y divide-gray-200">
										<tr v-for="(row, rowIndex) in sampleData?.rows?.slice(0, 5)" :key="rowIndex">
											<td
												v-for="(cell, cellIndex) in row"
												:key="'preview-cell-' + rowIndex + '-' + cellIndex"
												class="px-3 py-2 text-sm text-gray-900">
												{{ cell }}
											</td>
										</tr>
										<tr v-if="sampleData && sampleData.rows && sampleData.rows.length > 5">
											<td
												:colspan="originalHeaders.length"
												class="px-3 py-2 text-sm text-center text-gray-500">
												+ {{ sampleData ? sampleData.rows.length - 5 : 0 }} filas más...
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>

				<div v-if="step === 3">
					<!-- Step 3: Import Preview -->
					<div class="mb-6">
						<h3 class="text-lg font-medium text-gray-900 mb-4">Revisión de importación</h3>
						<p class="text-gray-600 mb-4">Se importarán {{ parsedItems.length }} items.</p>

						<!-- Selección de destino de importación -->
						<div class="mb-4 p-4 bg-gray-50 rounded-lg">
							<label class="block text-sm font-medium text-gray-700 mb-2">Destino de importación</label>
							<div class="flex gap-4">
								<div class="flex items-center">
									<input
										type="radio"
										v-model="importDestination"
										value="global"
										class="h-4 w-4 text-primary focus:ring-primary border-gray-300" />
									<label class="ml-2 block text-sm text-gray-700">Inventario Global</label>
								</div>
								<div v-if="projects.length > 0" class="flex items-center">
									<input
										type="radio"
										v-model="importDestination"
										value="project"
										class="h-4 w-4 text-primary focus:ring-primary border-gray-300" />
									<label class="ml-2 block text-sm text-gray-700">Proyecto específico</label>
								</div>
							</div>

							<div v-if="importDestination === 'project' && projects.length > 0" class="mt-3">
								<select
									v-model="selectedProjectId"
									class="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
									<option value="">Selecciona un proyecto...</option>
									<option v-for="project in projects" :key="project.id" :value="project.id">
										{{ project.name }}
									</option>
								</select>
							</div>
							<div
								v-else-if="importDestination === 'project' && projects.length === 0"
								class="mt-2 text-sm text-amber-600">
								No hay proyectos disponibles. Crea un proyecto primero.
							</div>
						</div>

						<div v-if="parseResult.errors.length > 0" class="mb-4">
							<h4 class="font-medium text-red-600 mb-2">Errores detectados:</h4>
							<ul class="list-disc list-inside text-red-600 text-sm space-y-1">
								<li v-for="(error, index) in parseResult.errors" :key="index">
									{{ error }}
								</li>
							</ul>
						</div>

						<div v-if="parseResult.warnings.length > 0" class="mb-4">
							<h4 class="font-medium text-amber-600 mb-2">Advertencias:</h4>
							<ul class="list-disc list-inside text-amber-600 text-sm space-y-1">
								<li v-for="(warning, index) in parseResult.warnings" :key="index">
									{{ warning }}
								</li>
							</ul>
						</div>

						<div v-if="parsedItems.length > 0" class="overflow-x-auto">
							<table class="min-w-full divide-y divide-gray-200">
								<thead class="bg-gray-50">
									<tr>
										<th
											class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Nombre
										</th>
										<th
											class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Cantidad
										</th>
										<th
											class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Proveedor
										</th>
										<th
											class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Precio
										</th>
										<th
											class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Empaquetado
										</th>
										<th
											class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Fabricante
										</th>
										<th
											class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Precio Ext.
										</th>
										<th
											class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											RoHS
										</th>
									</tr>
								</thead>
								<tbody class="bg-white divide-y divide-gray-200">
									<tr v-for="(item, index) in parsedItems.slice(0, 10)" :key="index">
										<td class="px-3 py-2 text-sm text-gray-900">
											{{ item.name }}
										</td>
										<td class="px-3 py-2 text-sm text-gray-900">
											{{ item.quantity }}
										</td>
										<td class="px-3 py-2 text-sm text-gray-900">
											{{ item.supplier || "-" }}
										</td>
										<td class="px-3 py-2 text-sm text-gray-900">
											{{ item.price ? `$${item.price}` : "-" }}
										</td>
										<td class="px-3 py-2 text-sm text-gray-900">
											{{ item.package || "-" }}
										</td>
										<td class="px-3 py-2 text-sm text-gray-900">
											{{ item.manufacturer || "-" }}
										</td>
										<td class="px-3 py-2 text-sm text-gray-900">
											{{ item.extPrice ? `$${item.extPrice}` : "-" }}
										</td>
										<td class="px-3 py-2 text-sm text-gray-900">
											{{ item.rohs || "-" }}
										</td>
									</tr>
									<tr v-if="parsedItems.length > 10">
										<td :colspan="8" class="px-3 py-2 text-sm text-center text-gray-500">
											+ {{ parsedItems.length - 10 }} items más...
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>

			<!-- Action buttons -->
			<div class="flex justify-end items-center gap-4 mt-6 pt-6 border-t border-gray-200">
				<button
					@click="$emit('close')"
					class="px-6 py-2.5 rounded-lg border border-gray-300 text-text-main-light font-medium hover:bg-gray-100 transition-colors">
					Cancelar
				</button>
				<button
					v-if="step > 1"
					@click="previousStep"
					class="px-6 py-2.5 rounded-lg border border-gray-300 text-text-main-light font-medium hover:bg-gray-100 transition-colors">
					Anterior
				</button>
				<button
					v-if="step < 3 && !isProcessing"
					@click="nextStep"
					:disabled="!canProceed"
					class="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
					<span>{{ step === 1 ? "Procesar archivo" : "Siguiente" }}</span>
					<ArrowRightIcon class="w-5 h-5" v-if="step < 3" />
				</button>
				<button
					v-if="step === 3 && !isProcessing"
					@click="confirmImport"
					class="px-6 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold transition-all flex items-center gap-2">
					<span>Importar datos</span>
				</button>
				<div v-if="isProcessing" class="flex items-center gap-2 text-gray-600">
					<div class="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
					<span>Procesando...</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { XMarkIcon, ArrowRightIcon } from "@heroicons/vue/24/outline";
import FileUpload from "@/components/FileUpload.vue";
import { useFileParser, type ParseResult } from "@/composables/useFileParser";
import type { BOMItem } from "@/types/bom";
import { computed, ref, watch } from "vue";
import { useDatabase } from "@/composables/useDatabase";
import { useImportStore } from "@/stores/import";
import { storeToRefs } from "pinia";
import { useNotifications } from "@/composables/useNotifications";

// Definir los eventos que emite este componente
const emit = defineEmits<{
	close: [];
	"file-selected": [file: File];
	"file-selected-to-project": [data: { file: File; projectId: string }];
	error: [error: string];
	notification: [data: { message: string; type: "success" | "error" | "warning" | "info" }];
	"import-completed": [data: { importedCount: number; errors: string[] }];
}>();

// Definir las props si es necesario
interface Props {
	show?: boolean;
	projectId?: string; // ID del proyecto actual si se está importando desde una página de proyecto
}
const props = defineProps<Props>();

// State
const { parseFile, detectColumnMapping } = useFileParser();
const db = useDatabase();
const importStore = useImportStore();

// Access state from store using storeToRefs
const {
	step,
	selectedFile,
	sampleData,
	parseResult,
	parsedItems,
	isProcessing,
	columnMapping,
	projects,
	importDestination,
	selectedProjectId,
} = storeToRefs(importStore);

// Initialize notifications composable
const { success, error: showError, warning, info } = useNotifications();

// Reactive variables for component matching
const rowComponentMatches = ref<Record<number, string>>({});
const columnComponentMatches = ref<Record<number, string>>({});
const existingComponents = ref<any[]>([]);
const originalHeaders = ref<string[]>([]);

// Load existing components from database
const loadExistingComponents = async () => {
	try {
		const allItems = await db.getAllItems();
		existingComponents.value = allItems;
	} catch (error) {
		console.error("Error loading existing components:", error);
		showError("Error", "Error al cargar componentes existentes");
	}
};

// Load existing components when sample data is available
watch(
	() => sampleData.value,
	async (newSampleData) => {
		if (newSampleData && newSampleData.rows.length > 0) {
			await loadExistingComponents();
			// Set original headers from sample data
			if (newSampleData.headers && newSampleData.headers.length > 0) {
				originalHeaders.value = [...newSampleData.headers];
			}
		}
	},
	{ immediate: true },
);

// Cargar proyectos cuando se inicialice el componente
const loadProjects = async () => {
	try {
		await importStore.loadProjects(db);
	} catch (error) {
		console.error("Error al cargar los proyectos:", error);
		emit("error", `Error al cargar los proyectos: ${(error as Error).message}`);
	}
};

// Ejecutar al inicio
loadProjects();

// Si se proporciona un projectId, seleccionar automáticamente el proyecto
if (props.projectId && !selectedProjectId.value) {
	importStore.setSelectedProjectId(props.projectId);
}

// Required and optional fields for mapping
const requiredFields = [
	{ key: "name", label: "Nombre" },
	{ key: "quantity", label: "Cantidad" },
	//{ key: "unit", label: "Unidad" },
];

const optionalFields = [
	{ key: "description", label: "Descripción" },
	{ key: "category", label: "Categoría" },
	{ key: "supplier", label: "Proveedor" },
	{ key: "partNumber", label: "Número de parte" },
	{ key: "lcscPart", label: "Referencia LCSC" },
	{ key: "price", label: "Precio" },
	//{ key: "inStock", label: "Stock actual" },
	{ key: "minStock", label: "Stock mínimo" },
	{ key: "notes", label: "Notas" },
	{ key: "manufacturer", label: "Fabricante" },
	//{ key: "customerNo", label: "Número de Cliente" },
	{ key: "package", label: "Empaquetado" },
	//{ key: "rohs", label: "RoHS" },
	//{ key: "extPrice", label: "Precio Extendido" },
	//{ key: "leadTime", label: "Tiempo de Entrega" },
	//{ key: "dateCodeLotNo", label: "Código de Fecha/Número de Lote" },
	//{ key: "status", label: "Estado" },
	//{ key: "createdAt", label: "Fecha de Creación" },
	//{ key: "updatedAt", label: "Fecha de Actualización" },
];

// Computed properties
const canProceed = computed(() => {
	if (importStore.step === 1) {
		return !!importStore.selectedFile;
	} else if (importStore.step === 2) {
		// For step 2, ensure required fields are mapped
		const requiredFields = ["name", "quantity"];
		return requiredFields.every((field) => Object.values(importStore.columnMapping).includes(field));
	}
	return true;
});

// Funciones para manejar eventos
const handleFileImport = async (file: File) => {
	try {
		// Process the file using the store
		await importStore.processFile(file, parseFile, detectColumnMapping);
	} catch (error) {
		console.error("Error parsing file:", error);
		emit("error", `Error al procesar el archivo: ${(error as Error).message}`);
	}
};

const handleImportError = (error: string) => {
	// Emitir el evento de error
	emit("error", error);
};

// Additional methods
const resetImport = () => {
	importStore.resetImport();
};

// Additional methods
const nextStep = () => {
	if (importStore.canProceed) {
		importStore.goToNextStep();
	}
};

const previousStep = () => {
	if (importStore.step > 1) {
		importStore.goToPreviousStep();
	}
};

const getStepTitle = () => {
	switch (step.value) {
		case 1:
			return "Upload";
		case 2:
			return "Mapping Columns";
		case 3:
			return "Validation";
		default:
			return "Upload";
	}
};

const getProgressWidth = () => {
	const width = (step.value - 1) * 50; // 50% por paso
	return `${width}%`;
};

// Si se proporciona un projectId, establecerlo como destino por defecto
if (props.projectId) {
	importStore.setImportDestination("project");
	importStore.setSelectedProjectId(props.projectId);
}

const formatFileSize = (bytes: number): string => {
	if (bytes === 0) return "0 Bytes";

	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

const getColumnMappingLabel = (header: string): string | null => {
	if (!header || typeof header !== "string") {
		return null;
	}

	for (const [fieldKey, fieldLabel] of Object.entries({
		...Object.fromEntries(importStore.requiredFields.map((f) => [f.key, f.label])),
		...Object.fromEntries(importStore.optionalFields.map((f) => [f.key, f.label])),
	})) {
		if (columnMapping.value[fieldKey] === header) {
			return fieldLabel;
		}
	}
	return null;
};

const showToastMessage = (message: string, type: "success" | "error" | "warning" | "info" = "info") => {
	// Usar el composable de notificaciones
	switch (type) {
		case "success":
			success("Éxito", message);
			break;
		case "error":
			showError("Error", message);
			break;
		case "warning":
			warning("Advertencia", message);
			break;
		case "info":
		default:
			info("Información", message);
			break;
	}
};

// Función para actualizar el mapeo de columnas
const updateColumnMapping = (header: string, field: string) => {
	importStore.columnMapping = {
		...importStore.columnMapping,
		[header]: field,
	};
};

// Función para obtener el nombre legible de un campo
const getFieldName = (field: string): string => {
	const fieldLabels: Record<string, string> = {
		name: "Nombre",
		quantity: "Cantidad",
		description: "Descripción",
		category: "Categoría",
		supplier: "Proveedor",
		partNumber: "Número de parte",
		lcscPart: "Referencia LCSC",
		price: "Precio",
		minStock: "Stock mínimo",
		notes: "Notas",
		manufacturer: "Fabricante",
		customerNo: "Número de Cliente",
		package: "Empaquetado",
		rohs: "RoHS",
		extPrice: "Precio Extendido",
		leadTime: "Tiempo de Entrega",
		dateCodeLotNo: "Código de Fecha/Número de Lote",
		status: "Estado",
	};
	return fieldLabels[field] || field;
};

const confirmImport = async () => {
	console.log("1", importStore.selectedFile);
	// Verificar que hay un archivo seleccionado antes de proceder
	if (!importStore.selectedFile) {
		showToastMessage("No hay archivo seleccionado para importar", "error");
		return;
	}

	console.log("2");
	importStore.setIsProcessing(true);
	console.log("3");

	try {
		// Parsear el archivo usando el composable useFileParser
		const result = await importStore.confirmImport(
			db,
			importStore.selectedFile,
			importStore.importDestination,
			importStore.selectedProjectId,
			parseFile,
		);

		console.log("4", result);

		let message = `Importación completada: ${result.importedCount} items procesados.`;
		if (result.errors.length > 0) {
			message += ` Errores: ${result.errors.length}.`;
			console.error("Errores durante la importación:", result.errors);
		}
		// Emitir evento de importación completada para que el componente padre pueda actualizar la vista
		emit("import-completed", { importedCount: result.importedCount, errors: result.errors });
		emit("close");
		showToastMessage(message, result.importedCount > 0 ? "success" : "error");
	} catch (error) {
		console.error("Error al procesar la importación:", error);
		emit("error", "Error al procesar la importación");
	} finally {
		importStore.setIsProcessing(false);
	}
};
</script>
