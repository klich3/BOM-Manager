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
										{{ formatFileSize(selectedFile.size) }} •
										{{ selectedFile.type || "Archivo" }}
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
					<!-- Step 2: Column Mapping -->
					<div class="mb-6">
						<h3 class="text-lg font-medium text-gray-900 mb-4">Mapeo de columnas</h3>
						<p class="text-gray-600 mb-4">Selecciona las columnas correspondientes a cada campo del BOM:</p>

						<div
							v-if="sampleData && sampleData.headers && sampleData.headers.length > 0"
							class="grid grid-cols-2 gap-3">
							<!-- Column mapping options -->
							<div
								v-for="requiredField in requiredFields"
								:key="requiredField.key"
								class="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
								<label class="w-24 text-xs font-medium text-gray-700">
									{{ requiredField.label }} <span class="text-red-500">*</span>
								</label>
								<select
									v-model="columnMapping[requiredField.key]"
									class="flex-1 px-2 py-1 text-xs border border-gray-300 rounded-md bg-white text-gray-900">
									<option value="">Seleccionar columna...</option>
									<option v-for="header in sampleData.headers" :key="header" :value="header">
										{{ header }}
									</option>
								</select>
							</div>

							<!-- Optional fields -->
							<div
								v-for="optionalField in optionalFields"
								:key="optionalField.key"
								class="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
								<label class="w-24 text-xs font-medium text-gray-700">
									{{ optionalField.label }}
								</label>
								<select
									v-model="columnMapping[optionalField.key]"
									class="flex-1 px-2 py-1 text-xs border border-gray-300 rounded-md bg-white text-gray-900">
									<option value="">Seleccionar columna...</option>
									<option v-for="header in sampleData.headers" :key="header" :value="header">
										{{ header }}
									</option>
								</select>
							</div>
						</div>
					</div>

					<!-- Data Preview -->
					<div v-if="sampleData && sampleData.rows && sampleData.rows.length > 0">
						<h3 class="text-lg font-medium text-gray-900 mb-4">Vista previa de datos</h3>
						<div class="overflow-x-auto">
							<table class="min-w-full divide-y divide-gray-200">
								<thead class="bg-gray-50">
									<tr>
										<th
											v-for="header in sampleData.headers"
											:key="header"
											class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											{{ header }}
											<span
												v-if="getColumnMappingLabel(header)"
												class="inline-block ml-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded">
												{{ getColumnMappingLabel(header) }}
											</span>
										</th>
									</tr>
								</thead>
								<tbody class="bg-white divide-y divide-gray-200">
									<tr v-for="(row, index) in sampleData.rows" :key="index">
										<td
											v-for="(cell, cellIndex) in row"
											:key="cellIndex"
											class="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">
											{{ cell }}
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
						<h3 class="text-lg font-medium text-gray-900 mb-4">Revisión de importación</h3>
						<p class="text-gray-600 mb-4">Se importarán {{ parsedItems.length }} items a tu inventario.</p>

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
											Unidad
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
											{{ item.unit }}
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
											{{ item.ext_price ? `$${item.ext_price}` : "-" }}
										</td>
										<td class="px-3 py-2 text-sm text-gray-900">
											{{ item.rohs || "-" }}
										</td>
									</tr>
									<tr v-if="parsedItems.length > 10">
										<td :colspan="9" class="px-3 py-2 text-sm text-center text-gray-500">
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
import { ref, computed } from "vue";

// Definir los eventos que emite este componente
const emit = defineEmits<{
	close: [];
	"file-selected": [file: File];
	error: [error: string];
}>();

// Definir las props si es necesario
interface Props {
	show?: boolean;
}
defineProps<Props>();

// State
const { parseFile } = useFileParser();

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
	{ key: "manufacturer", label: "Fabricante" },
	{ key: "customerNo", label: "Número de Cliente" },
	{ key: "package", label: "Empaquetado" },
	{ key: "rohs", label: "RoHS" },
	{ key: "extPrice", label: "Precio Extendido" },
	{ key: "leadTime", label: "Tiempo de Entrega" },
	{ key: "dateCodeLotNo", label: "Código de Fecha/Número de Lote" },
	{ key: "status", label: "Estado" },
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

// Funciones para manejar eventos
const handleFileImport = async (file: File) => {
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
			if (result.items[0]) {
				const headers = Object.keys(result.items[0]);
				const autoMapping = detectColumnMapping(headers);
				Object.assign(columnMapping.value, autoMapping);
			}
		}
	} catch (error) {
		console.error("Error parsing file:", error);
		emit("error", `Error al procesar el archivo: ${(error as Error).message}`);
	} finally {
		isProcessing.value = false;
	}

	// Move to next step after file is processed
	if (sampleData.value) {
		step.value = 2;
	}
};

const handleImportError = (error: string) => {
	// Emitir el evento de error
	emit("error", error);
};

// Additional methods
const resetImport = () => {
	step.value = 1;
	selectedFile.value = null;
	sampleData.value = null;
	parseResult.value = { success: false, items: [], errors: [], warnings: [] };
	parsedItems.value = [];
	columnMapping.value = {};
	isProcessing.value = false;
};

const nextStep = () => {
	if (step.value < 3 && canProceed.value) {
		step.value++;
	}
};

const previousStep = () => {
	if (step.value > 1) {
		step.value--;
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

const detectColumnMapping = (headers: string[]): Record<string, string> => {
	const mapping: Record<string, string> = {};

	const patterns: Record<string, string[]> = {
		name: ["name", "nombre", "component", "componente", "part", "parte", "item"],
		description: ["description", "descripcion", "desc", "details", "detalles"],
		quantity: ["quantity", "cantidad", "qty", "cant", "amount"],
		unit: ["unit", "unidad", "units", "unidades", "uom"],
		category: ["category", "categoria", "type", "tipo", "class", "clase"],
		supplier: ["supplier", "proveedor", "vendor", "manufacturer", "fabricante"],
		partNumber: ["part_number", "partnumber", "part number", "numero de parte", "mpn", "p/n", "sku"],
		lcscPart: ["lcsc", "lcsc_part", "lcsc part", "lcsc_number"],
		price: ["price", "precio", "cost", "costo", "unit_price", "precio_unitario"],
		inStock: ["in_stock", "instock", "stock", "inventory", "inventario", "on_hand"],
		minStock: ["min_stock", "minstock", "minimum", "minimo", "reorder", "reorder_point"],
		notes: ["notes", "notas", "comments", "comentarios", "remarks", "observaciones"],
		manufacturer: ["manufacturer", "fabricante", "maker", "producer"],
		customerNo: ["customer_no", "customer no", "customer number", "numero cliente", "cliente no", "customer id"],
		package: ["package", "packaging", "empaquetado", "housing", "case", "encapsulado"],
		rohs: ["rohs", "rohs_compliant", "rohs compliant", "environmental", "ecological"],
		extPrice: ["ext_price", "ext price", "extended price", "total_price", "precio_total", "precio ext"],
		leadTime: ["lead_time", "lead time", "delivery_time", "tiempo_entrega", "delivery", "plazo"],
		dateCodeLotNo: [
			"date_code_lot_no",
			"date code lot no",
			"date_code",
			"lot_no",
			"date code",
			"lote",
			"codigo_fecha",
		],
		status: ["status", "estado", "state", "condition", "situacion"],
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

const confirmImport = () => {
	// Emitir el evento de archivo seleccionado para que el padre maneje la importación
	emit("file-selected", selectedFile.value!);
	emit("close");
};
</script>
