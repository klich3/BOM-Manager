<template>
	<div
		class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
	>
		<div
			class="bg-card-light dark:bg-card-dark rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
		>
			<div class="flex items-center justify-between mb-6 p-6 pb-4">
				<h2
					class="text-xl font-semibold text-text-main-light dark:text-text-main-dark"
				>
					Procesar BOM y Actualizar Stock
				</h2>
				<button
					@click="closeModal"
					class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
				>
					<XMarkIcon
						class="w-6 h-6 text-text-muted-light dark:text-text-muted-dark"
					/>
				</button>
			</div>

			<div class="px-6 pb-6 space-y-6">
				<!-- Sección de carga de BOM -->
				<div>
					<h3
						class="text-lg font-medium text-text-main-light dark:text-text-main-dark mb-4"
					>
						Cargar Archivo BOM
					</h3>
					<FileUpload
						@file-selected="handleFileSelected"
						@error="handleFileError"
					/>

					<div
						v-if="bomData && bomData.length > 0"
						class="mt-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl"
					>
						<div class="flex justify-between items-center mb-2">
							<h4
								class="font-medium text-text-main-light dark:text-text-main-dark"
							>
								Vista Previa del BOM
							</h4>
							<span
								class="text-sm text-text-muted-light dark:text-text-muted-dark"
							>
								{{ bomData.length }} componentes
							</span>
						</div>

						<div class="overflow-x-auto">
							<table
								class="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
							>
								<thead class="bg-gray-100 dark:bg-gray-700">
									<tr>
										<th
											class="px-4 py-3 text-left text-xs font-medium text-text-muted-light dark:text-text-muted-dark uppercase"
										>
											Componente
										</th>
										<th
											class="px-4 py-3 text-left text-xs font-medium text-text-muted-light dark:text-text-muted-dark uppercase"
										>
											Cantidad Requerida
										</th>
										<th
											class="px-4 py-3 text-left text-xs font-medium text-text-muted-light dark:text-text-muted-dark uppercase"
										>
											Stock Actual
										</th>
										<th
											class="px-4 py-3 text-left text-xs font-medium text-text-muted-light dark:text-text-muted-dark uppercase"
										>
											Disponible
										</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-gray-200 dark:divide-gray-700">
									<tr v-for="(item, index) in bomData" :key="index">
										<td class="px-4 py-3">
											<div>
												<p
													class="font-medium text-text-main-light dark:text-text-main-dark"
												>
													{{ item.name }}
												</p>
												<p
													class="text-xs text-text-muted-light dark:text-text-muted-dark"
												>
													{{ item.partNumber || "N/A" }}
												</p>
											</div>
										</td>
										<td
											class="px-4 py-3 text-text-main-light dark:text-text-main-dark"
										>
											{{ item.quantity }}
										</td>
										<td
											class="px-4 py-3 text-text-main-light dark:text-text-main-dark"
										>
											{{ item.currentStock }}
										</td>
										<td class="px-4 py-3">
											<span
												:class="[
													item.currentStock >= item.quantity
														? 'text-green-600 dark:text-green-400'
														: 'text-red-600 dark:text-red-400',
												]"
											>
												{{
													item.currentStock >= item.quantity
														? "Suficiente"
														: "Insuficiente"
												}}
											</span>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>

				<!-- Sección de resumen y confirmación -->
				<div v-if="bomData && bomData.length > 0">
					<h3
						class="text-lg font-medium text-text-main-light dark:text-text-main-dark mb-4"
					>
						Resumen de Operación
					</h3>

					<div class="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl mb-4">
						<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div class="text-center">
								<p class="text-2xl font-bold text-primary">
									{{ totalComponents }}
								</p>
								<p
									class="text-sm text-text-muted-light dark:text-text-muted-dark"
								>
									Componentes
								</p>
							</div>
							<div class="text-center">
								<p
									class="text-2xl font-bold text-green-600 dark:text-green-400"
								>
									{{ sufficientStockCount }}
								</p>
								<p
									class="text-sm text-text-muted-light dark:text-text-muted-dark"
								>
									Stock Suficiente
								</p>
							</div>
							<div class="text-center">
								<p class="text-2xl font-bold text-red-600 dark:text-red-400">
									{{ insufficientStockCount }}
								</p>
								<p
									class="text-sm text-text-muted-light dark:text-text-muted-dark"
								>
									Stock Insuficiente
								</p>
							</div>
						</div>
					</div>

					<div
						v-if="insufficientStockCount > 0"
						class="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl"
					>
						<div class="flex items-start gap-3">
							<ExclamationTriangleIcon
								class="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
							/>
							<div>
								<p class="text-sm font-medium text-red-600 dark:text-red-400">
									Advertencia
								</p>
								<p class="text-sm text-red-600/80 dark:text-red-400/80 mt-1">
									Hay {{ insufficientStockCount }} componente(s) con stock
									insuficiente. La operación no se podrá completar hasta que se
									resuelva este problema.
								</p>
							</div>
						</div>
					</div>

					<div class="flex gap-3">
						<button
							@click="closeModal"
							class="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-text-main-light dark:text-text-main-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
						>
							Cancelar
						</button>
						<button
							@click="processBOM"
							:disabled="insufficientStockCount > 0"
							class="flex-1 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Procesar BOM y Actualizar Stock
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { XMarkIcon, ExclamationTriangleIcon } from "@heroicons/vue/24/outline";
import FileUpload from "./FileUpload.vue";
import { useFileParser } from "../composables/useFileParser";
import { useDatabase } from "../composables/useDatabase";

// Definición de tipos
interface BOMItem {
	id: string;
	name: string;
	partNumber?: string;
	quantity: number;
	currentStock: number;
	available: boolean;
}

interface Props {
	modelValue: boolean;
}

interface Emits {
	(e: "update:modelValue", value: boolean): void;
	(e: "processed", result: any): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Composables
const { parseFile } = useFileParser();
const db = useDatabase();

// Refs
const isOpen = defineModel<boolean>("modelValue", { required: true });
const bomData = ref<BOMItem[]>([]);
const isProcessing = ref(false);

// Computed properties
const totalComponents = computed(() => bomData.value.length);
const sufficientStockCount = computed(
	() => bomData.value.filter((item) => item.available).length
);
const insufficientStockCount = computed(
	() => bomData.value.filter((item) => !item.available).length
);

// Methods
const closeModal = () => {
	isOpen.value = false;
	resetData();
};

const resetData = () => {
	bomData.value = [];
};

const handleFileSelected = async (file: File) => {
	try {
		isProcessing.value = true;

		// Parsear el archivo BOM
		const result = await parseFile(file);

		if (!result.success && result.items.length === 0) {
			alert(`Error al parsear el archivo: ${result.errors.join(", ")}`);
			return;
		}

		// Mapear los items del BOM con información de stock actual
		const mappedBOMData: BOMItem[] = [];

		for (const item of result.items) {
			// Buscar el item en la base de datos por nombre o número de parte
			let dbItem = null;

			// Primero intentar buscar por número de parte si está disponible
			if (item.partNumber) {
				const allItems = await db.getAllItems();
				dbItem = allItems.find(
					(dbItem) =>
						dbItem.part_number === item.partNumber ||
						dbItem.part_number === (item.partNumber || "").toString()
				);
			}

			// Si no se encontró por número de parte, buscar por nombre
			if (!dbItem) {
				const allItems = await db.getAllItems();
				dbItem = allItems.find(
					(dbItem) =>
						dbItem.name
							.toLowerCase()
							.includes((item.name || "").toLowerCase()) ||
						(item.name || "").toLowerCase().includes(dbItem.name.toLowerCase())
				);
			}

			if (dbItem) {
				const currentStock = dbItem.in_stock || 0;
				const requiredQuantity = item.quantity || 1;
				const available = currentStock >= requiredQuantity;

				mappedBOMData.push({
					id: dbItem.id,
					name: dbItem.name,
					partNumber: dbItem.part_number,
					quantity: requiredQuantity,
					currentStock,
					available,
				});
			} else {
				// Si no se encuentra el item en la base de datos, marcarlo como no disponible
				mappedBOMData.push({
					id: "",
					name: item.name || "Componente desconocido",
					partNumber: item.partNumber,
					quantity: item.quantity || 1,
					currentStock: 0,
					available: false,
				});
			}
		}

		bomData.value = mappedBOMData;
	} catch (error) {
		console.error("Error procesando archivo BOM:", error);
		alert(`Error al procesar el archivo BOM: ${(error as Error).message}`);
	} finally {
		isProcessing.value = false;
	}
};

const handleFileError = (message: string) => {
	console.error("Error en carga de archivo:", message);
	alert(`Error en la carga del archivo: ${message}`);
};

const processBOM = async () => {
	if (insufficientStockCount.value > 0) {
		alert(
			"No se puede procesar el BOM: hay componentes con stock insuficiente."
		);
		return;
	}

	try {
		isProcessing.value = true;

		// Preparar los items para descontar stock
		const itemsToConsume = bomData.value.map((item) => ({
			id: item.id,
			quantity: item.quantity,
		}));

		// Descontar el stock usando el método de la base de datos
		const result = await db.consumeStockFromBOM(itemsToConsume);

		if (result.success) {
			alert("BOM procesado exitosamente. Stock actualizado.");
			emit("processed", result);
			closeModal();
		} else {
			alert(`Error al procesar BOM: ${result.message}`);
		}
	} catch (error) {
		console.error("Error procesando BOM:", error);
		alert(`Error al procesar el BOM: ${(error as Error).message}`);
	} finally {
		isProcessing.value = false;
	}
};

// Exponer métodos si es necesario
defineExpose({
	processBOM,
});
</script>

<style scoped>
.bg-card-light {
	background-color: #ffffff;
}

.dark .bg-card-dark {
	background-color: #1f2937;
}

.text-text-main-light {
	color: #1f2937;
}

.dark .text-text-main-dark {
	color: #f9fafb;
}

.text-text-muted-light {
	color: #6b7280;
}

.dark .text-text-muted-dark {
	color: #9ca3af;
}

.bg-primary {
	background-color: #10b981;
}
</style>
