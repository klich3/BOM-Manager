<template>
	<div
		v-if="isOpen"
		class="fixed inset-0 z-50 flex items-center justify-center p-4"
	>
		<!-- Backdrop -->
		<div class="absolute inset-0 bg-black/50" @click="closeModal"></div>

		<!-- Modal Content -->
		<div
			class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
			@click.stop
		>
			<!-- Header -->
			<div
				class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700"
			>
				<h2 class="text-xl font-semibold text-gray-900 dark:text-white">
					Importar archivo BOM
				</h2>
				<button
					@click="closeModal"
					class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
				>
					<XMarkIcon class="w-5 h-5 text-gray-500" />
				</button>
			</div>

			<!-- Content -->
			<div class="flex-1 overflow-auto p-6">
				<div v-if="step === 1">
					<!-- Step 1: File Upload -->
					<div class="mb-6">
						<h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
							Selecciona tu archivo
						</h3>
						<FileUpload
							@file-selected="handleFileSelected"
							@error="handleFileError"
						/>
					</div>

					<div
						v-if="selectedFile"
						class="mt-6 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl"
					>
						<div class="flex items-center justify-between">
							<div>
								<p class="font-medium text-gray-900 dark:text-white">
									{{ selectedFile.name }}
								</p>
								<p class="text-sm text-gray-500 dark:text-gray-400">
									{{ formatFileSize(selectedFile.size) }} •
									{{ selectedFile.type || "Archivo" }}
								</p>
							</div>
							<button
								@click="resetImport"
								class="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
							>
								Cambiar archivo
							</button>
						</div>
					</div>
				</div>

				<div v-if="step === 2">
					<!-- Step 2: Column Mapping -->
					<div class="mb-6">
						<h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
							Mapeo de columnas
						</h3>
						<p class="text-gray-600 dark:text-gray-400 mb-4">
							Selecciona las columnas correspondientes a cada campo del BOM:
						</p>

						<div
							v-if="
								sampleData &&
								sampleData.headers &&
								sampleData.headers.length > 0
							"
							class="space-y-4"
						>
							<!-- Column mapping options -->
							<div
								v-for="requiredField in requiredFields"
								:key="requiredField.key"
								class="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
							>
								<label
									class="w-32 font-medium text-gray-700 dark:text-gray-300"
								>
									{{ requiredField.label }} <span class="text-red-500">*</span>
								</label>
								<select
									v-model="columnMapping[requiredField.key]"
									class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
								>
									<option value="">Seleccionar columna...</option>
									<option
										v-for="header in sampleData.headers"
										:key="header"
										:value="header"
									>
										{{ header }}
									</option>
								</select>
							</div>

							<!-- Optional fields -->
							<div
								v-for="optionalField in optionalFields"
								:key="optionalField.key"
								class="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
							>
								<label
									class="w-32 font-medium text-gray-700 dark:text-gray-300"
								>
									{{ optionalField.label }}
								</label>
								<select
									v-model="columnMapping[optionalField.key]"
									class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
								>
									<option value="">Seleccionar columna...</option>
									<option
										v-for="header in sampleData.headers"
										:key="header"
										:value="header"
									>
										{{ header }}
									</option>
								</select>
							</div>
						</div>
					</div>

					<!-- Data Preview -->
					<div
						v-if="sampleData && sampleData.rows && sampleData.rows.length > 0"
					>
						<h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
							Vista previa de datos
						</h3>
						<div class="overflow-x-auto">
							<table
								class="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
							>
								<thead class="bg-gray-50 dark:bg-gray-700">
									<tr>
										<th
											v-for="header in sampleData.headers"
											:key="header"
											class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
										>
											{{ header }}
											<span
												v-if="getColumnMappingLabel(header)"
												class="inline-block ml-2 px-2 py-1 text-xs bg-primary/10 text-primary rounded"
											>
												{{ getColumnMappingLabel(header) }}
											</span>
										</th>
									</tr>
								</thead>
								<tbody
									class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
								>
									<tr
										v-for="(row, index) in sampleData.rows.slice(0, 5)"
										:key="index"
									>
										<td
											v-for="(cell, cellIndex) in row"
											:key="cellIndex"
											class="px-4 py-3 text-sm text-gray-900 dark:text-gray-300 whitespace-nowrap"
										>
											{{ cell }}
										</td>
									</tr>
									<tr v-if="sampleData.rows.length > 5">
										<td
											:colspan="sampleData.headers.length"
											class="px-4 py-3 text-sm text-center text-gray-500 dark:text-gray-400"
										>
											+ {{ sampleData.rows.length - 5 }} filas más...
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>

				<div v-if="step === 3">
					<!-- Step 3: Import Preview -->
					<div class="mb-6">
						<h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
							Revisión de importación
						</h3>
						<p class="text-gray-600 dark:text-gray-400 mb-4">
							Se importarán {{ parsedItems.length }} items a tu inventario.
						</p>

						<div v-if="parseResult.errors.length > 0" class="mb-4">
							<h4 class="font-medium text-red-600 dark:text-red-400 mb-2">
								Errores detectados:
							</h4>
							<ul
								class="list-disc list-inside text-red-600 dark:text-red-400 text-sm space-y-1"
							>
								<li v-for="(error, index) in parseResult.errors" :key="index">
									{{ error }}
								</li>
							</ul>
						</div>

						<div v-if="parseResult.warnings.length > 0" class="mb-4">
							<h4 class="font-medium text-amber-600 dark:text-amber-400 mb-2">
								Advertencias:
							</h4>
							<ul
								class="list-disc list-inside text-amber-600 dark:text-amber-400 text-sm space-y-1"
							>
								<li
									v-for="(warning, index) in parseResult.warnings"
									:key="index"
								>
									{{ warning }}
								</li>
							</ul>
						</div>

						<div v-if="parsedItems.length > 0" class="overflow-x-auto">
							<table
								class="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
							>
								<thead class="bg-gray-50 dark:bg-gray-700">
									<tr>
										<th
											class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
										>
											Nombre
										</th>
										<th
											class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
										>
											Cantidad
										</th>
										<th
											class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
										>
											Unidad
										</th>
										<th
											class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
										>
											Proveedor
										</th>
										<th
											class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
										>
											Precio
										</th>
									</tr>
								</thead>
								<tbody
									class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
								>
									<tr
										v-for="(item, index) in parsedItems.slice(0, 10)"
										:key="index"
									>
										<td
											class="px-4 py-3 text-sm text-gray-900 dark:text-gray-300"
										>
											{{ item.name }}
										</td>
										<td
											class="px-4 py-3 text-sm text-gray-900 dark:text-gray-300"
										>
											{{ item.quantity }}
										</td>
										<td
											class="px-4 py-3 text-sm text-gray-900 dark:text-gray-300"
										>
											{{ item.unit }}
										</td>
										<td
											class="px-4 py-3 text-sm text-gray-900 dark:text-gray-300"
										>
											{{ item.supplier || "-" }}
										</td>
										<td
											class="px-4 py-3 text-sm text-gray-900 dark:text-gray-300"
										>
											{{ item.price ? `$${item.price}` : "-" }}
										</td>
									</tr>
									<tr v-if="parsedItems.length > 10">
										<td
											:colspan="5"
											class="px-4 py-3 text-sm text-center text-gray-500 dark:text-gray-400"
										>
											+ {{ parsedItems.length - 10 }} items más...
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>

			<!-- Footer -->
			<div
				class="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700"
			>
				<div class="text-sm text-gray-500 dark:text-gray-400">
					Paso {{ step }} de 3
				</div>
				<div class="flex gap-3">
					<button
						v-if="step > 1"
						@click="previousStep"
						class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
					>
						Anterior
					</button>
					<button
						v-if="step < 3 && !isProcessing"
						@click="nextStep"
						:disabled="!canProceed"
						class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{{ step === 1 ? "Procesar archivo" : "Siguiente" }}
					</button>
					<button
						v-if="step === 3 && !isProcessing"
						@click="confirmImport"
						class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
					>
						Importar datos
					</button>
					<div v-if="isProcessing" class="flex items-center">
						<div
							class="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin mr-2"
						></div>
						<span class="text-gray-600 dark:text-gray-400">Procesando...</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { XMarkIcon } from "@heroicons/vue/24/outline";
import FileUpload from "./FileUpload.vue";
import { useFileParser, type ParseResult } from "../composables/useFileParser";
import type { BOMItem } from "../types/bom";
import { useDatabase } from "../composables/useDatabase";
import { useNotifications } from "../composables/useNotifications";

// Props
interface Props {
	modelValue: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
	"update:modelValue": [value: boolean];
}>();

// State
const { parseFile } = useFileParser();
const { createItem } = useDatabase();
const { success, error: showError, warning } = useNotifications();

const isOpen = computed({
	get: () => props.modelValue,
	set: (value) => emit("update:modelValue", value),
});

const step = ref(1);
const selectedFile = ref<File | null>(null);
const sampleData = ref<any>(null);
const parseResult = ref<ParseResult>({
	success: false,
	items: [],
	errors: [],
	warnings: [],
});
const parsedItems = ref<Partial<BOMItem>[]>([]);
const isProcessing = ref(false);
const columnMapping = ref<Record<string, string>>({});

// Required and optional fields for mapping
const requiredFields = [
	{ key: "name", label: "Nombre" },
	{ key: "quantity", label: "Cantidad" },
	{ key: "unit", label: "Unidad" },
];

const optionalFields = [
	{ key: "description", label: "Descripción" },
	{ key: "category", label: "Categoría" },
	{ key: "supplier", label: "Proveedor" },
	{ key: "partNumber", label: "Número de parte" },
	{ key: "lcscPart", label: "Referencia LCSC" },
	{ key: "price", label: "Precio" },
	{ key: "inStock", label: "Stock actual" },
	{ key: "minStock", label: "Stock mínimo" },
	{ key: "notes", label: "Notas" },
];

// Computed properties
const canProceed = computed(() => {
	if (step.value === 1) {
		return !!selectedFile.value;
	} else if (step.value === 2) {
		// Check if required fields are mapped
		return requiredFields.every((field) => columnMapping.value[field.key]);
	}
	return true;
});

// Methods
const closeModal = () => {
	isOpen.value = false;
	resetImport();
};

const resetImport = () => {
	step.value = 1;
	selectedFile.value = null;
	sampleData.value = null;
	parseResult.value = { success: false, items: [], errors: [], warnings: [] };
	parsedItems.value = [];
	columnMapping.value = {};
	isProcessing.value = false;
};

const handleFileSelected = async (file: File) => {
	selectedFile.value = file;
	isProcessing.value = true;

	try {
		// Parse the file
		const result = await parseFile(file);
		parseResult.value = result;
		parsedItems.value = result.items as Partial<BOMItem>[];

		if (result.success || result.items.length > 0) {
			// Get sample data for preview
			sampleData.value = {
				headers: Object.keys(result.items[0] || {}),
				rows: result.items.slice(0, 10).map((item: any) => Object.values(item)),
			};

			// Initialize column mapping with auto-detected values
			const autoMapping = result.items[0]
				? detectColumnMapping(Object.keys(result.items[0]))
				: {};
			Object.assign(columnMapping.value, autoMapping);
		}
	} catch (error) {
		console.error("Error parsing file:", error);
		showError(
			"Error",
			`Error al procesar el archivo: ${(error as Error).message}`
		);
	} finally {
		isProcessing.value = false;
	}
};

const detectColumnMapping = (headers: string[]): Record<string, string> => {
	const mapping: Record<string, string> = {};

	const patterns: Record<string, string[]> = {
		name: [
			"name",
			"nombre",
			"component",
			"componente",
			"part",
			"parte",
			"item",
		],
		description: ["description", "descripcion", "desc", "details", "detalles"],
		quantity: ["quantity", "cantidad", "qty", "cant", "amount"],
		unit: ["unit", "unidad", "units", "unidades", "uom"],
		category: ["category", "categoria", "type", "tipo", "class", "clase"],
		supplier: ["supplier", "proveedor", "vendor", "manufacturer", "fabricante"],
		partNumber: [
			"part_number",
			"partnumber",
			"part number",
			"numero de parte",
			"mpn",
			"p/n",
			"sku",
		],
		lcscPart: ["lcsc", "lcsc_part", "lcsc part", "lcsc_number"],
		price: [
			"price",
			"precio",
			"cost",
			"costo",
			"unit_price",
			"precio_unitario",
		],
		inStock: [
			"in_stock",
			"instock",
			"stock",
			"inventory",
			"inventario",
			"on_hand",
		],
		minStock: [
			"min_stock",
			"minstock",
			"minimum",
			"minimo",
			"reorder",
			"reorder_point",
		],
		notes: [
			"notes",
			"notas",
			"comments",
			"comentarios",
			"remarks",
			"observaciones",
		],
	};

	headers.forEach((header) => {
		const normalized = header.toLowerCase().trim();

		for (const [field, keywords] of Object.entries(patterns)) {
			if (keywords.some((keyword) => normalized.includes(keyword))) {
				mapping[field] = header;
				break;
			}
		}
	});

	return mapping;
};

const handleFileError = (message: string) => {
	console.error("File error:", message);
	showError("Error", message);
};

const nextStep = () => {
	if (step.value < 3) {
		step.value++;
	}
};

const previousStep = () => {
	if (step.value > 1) {
		step.value--;
	}
};

const confirmImport = async () => {
	isProcessing.value = true;

	try {
		let successCount = 0;
		let errorCount = 0;

		// Import items to database
		for (const item of parsedItems.value) {
			// Ensure required fields have values
			if (!item.name || item.quantity === undefined || !item.unit) {
				errorCount++;
				continue;
			}

			// Add timestamps
			const itemWithTimestamps = {
				...item,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const result = await createItem(itemWithTimestamps);
			if (result) {
				successCount++;
			} else {
				errorCount++;
			}
		}

		if (successCount > 0) {
			success("Éxito", `Se importaron ${successCount} items correctamente`);
		}

		if (errorCount > 0) {
			warning("Advertencia", `No se pudieron importar ${errorCount} items`);
		}

		closeModal();
	} catch (error) {
		console.error("Error importing items:", error);
		showError(
			"Error",
			`Error al importar los items: ${(error as Error).message}`
		);
	} finally {
		isProcessing.value = false;
	}
};

const formatFileSize = (bytes: number): string => {
	if (bytes === 0) return "0 Bytes";

	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

const getColumnMappingLabel = (header: string): string | null => {
	for (const [fieldKey, fieldLabel] of Object.entries({
		...Object.fromEntries(requiredFields.map((f) => [f.key, f.label])),
		...Object.fromEntries(optionalFields.map((f) => [f.key, f.label])),
	})) {
		if (columnMapping.value[fieldKey] === header) {
			return fieldLabel;
		}
	}
	return null;
};
</script>
