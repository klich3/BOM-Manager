<template>
	<div class="overflow-x-auto">
		<table class="w-full">
			<thead class="bg-gray-50">
				<th class="px-6 py-4 text-left text-xs font-semibold text-text-muted-light uppercase">Componente</th>
				<th class="px-6 py-4 text-left text-xs font-semibold text-text-muted-light uppercase">Categoría</th>
				<th class="px-6 py-4 text-left text-xs font-semibold text-text-muted-light uppercase">Cantidad</th>
				<th class="px-6 py-4 text-left text-xs font-semibold text-text-muted-light uppercase">Stock</th>
				<th class="px-6 py-4 text-left text-xs font-semibold text-text-muted-light uppercase">Proveedor</th>
				<th class="px-6 py-4 text-left text-xs font-semibold text-text-muted-light uppercase">Precio</th>
				<th class="px-6 py-4 text-left text-xs font-semibold text-text-muted-light uppercase">Empaquetado</th>
				<th class="px-6 py-4 text-left text-xs font-semibold text-text-muted-light uppercase">Fabricante</th>
				<th class="px-6 py-4 text-left text-xs font-semibold text-text-muted-light uppercase">Precio Ext.</th>
				<th class="px-6 py-4 text-left text-xs font-semibold text-text-muted-light uppercase">RoHS</th>
				<th class="px-6 py-4 text-left text-xs font-semibold text-text-muted-light uppercase">Acciones</th>
			</thead>
			<tbody class="divide-y divide-gray-200">
				<tr v-if="items.length === 0">
					<td colspan="11" class="px-6 py-12 text-center">
						<CubeIcon class="w-12 h-12 mx-auto mb-4 text-gray-300" />
						<p class="text-text-muted-light">No hay componentes en el proyecto</p>
					</td>
				</tr>
				<tr v-for="item in items" :key="item.id" class="hover:bg-gray-50 transition-colors">
					<td class="px-6 py-4">
						<div>
							<p class="text-sm font-semibold text-text-main-light">
								{{ item.name }}
							</p>
							<p class="text-xs text-text-muted-light">
								{{ item.part_number || "N/A" }}
							</p>
						</div>
					</td>
					<td class="px-6 py-4">
						<span class="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs font-medium">
							{{ item.category || "Sin categoría" }}
						</span>
					</td>
					<td class="px-6 py-4 text-sm text-text-main-light">
						{{ item.quantity || 1 }}
					</td>
					<td class="px-6 py-4">
						<div class="flex items-center gap-2">
							<div
								class="w-2 h-2 rounded-full"
								:class="
									(item.in_stock || 0) < (item.min_stock || 0) ? 'bg-amber-500' : 'bg-green-500'
								"></div>
							<span class="text-sm text-text-main-light"> {{ item.in_stock }} {{ item.unit }} </span>
						</div>
					</td>
					<td class="px-6 py-4 text-sm text-text-muted-light">
						{{ item.supplier || "N/A" }}
					</td>
					<td class="px-6 py-4 text-sm font-medium text-text-main-light">
						${{ (item.price || 0).toFixed(2) }}
					</td>
					<td class="px-6 py-4 text-sm text-text-muted-light">
						{{ item.package || "N/A" }}
					</td>
					<td class="px-6 py-4 text-sm text-text-muted-light">
						{{ item.manufacturer || "N/A" }}
					</td>
					<td class="px-6 py-4 text-sm font-medium text-text-main-light">
						${{ (item.ext_price || 0).toFixed(2) }}
					</td>
					<td class="px-6 py-4 text-sm text-text-muted-light">
						{{ item.rohs || "N/A" }}
					</td>
					<td class="px-6 py-4">
						<div class="flex items-center gap-2">
							<button
								@click="editItem(item)"
								class="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
								<PencilIcon class="w-4 h-4 text-blue-600" />
							</button>
							<button
								@click="removeItem(item.id)"
								class="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
								<TrashIcon class="w-4 h-4 text-red-600" />
							</button>
						</div>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
	<div class="flex justify-center items-center mt-4 mb-10">
		<button
			@click="showImportModal = true"
			class="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors">
			<ArrowDownTrayIcon class="w-4 h-4" />
			<span>Importar Componentes</span>
		</button>
	</div>

	<!-- Modal de importación -->
	<Teleport to="body">
		<div v-if="showImportModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
			<div class="bg-card-light rounded-2xl shadow-xl max-w-lg w-full p-6">
				<div class="flex items-center justify-between mb-6">
					<h2 class="text-xl font-semibold text-text-main-light">Importar Componentes</h2>
					<button @click="showImportModal = false" class="p-1 hover:bg-gray-100 rounded-lg transition-colors">
						<XMarkIcon class="w-6 h-6 text-text-muted-light" />
					</button>
				</div>

				<div class="space-y-4">
					<div
						@click="selectedImportType = 'easyeda'"
						:class="{
							'bg-primary/10 border border-primary': selectedImportType === 'easyeda',
							'bg-gray-50 border border-gray-200': selectedImportType !== 'easyeda',
						}"
						class="p-4 rounded-xl cursor-pointer transition-colors">
						<div class="flex items-center gap-3">
							<div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
								<CodeBracketIcon class="w-5 h-5 text-blue-600" />
							</div>
							<div>
								<h4 class="font-medium text-text-main-light">EasyEDA</h4>
								<p class="text-sm text-text-muted-light">Importar desde proyecto EasyEDA</p>
							</div>
						</div>
					</div>

					<div
						@click="selectedImportType = 'csv'"
						:class="{
							'bg-primary/10 border border-primary': selectedImportType === 'csv',
							'bg-gray-50 border border-gray-200': selectedImportType !== 'csv',
						}"
						class="p-4 rounded-xl cursor-pointer transition-colors">
						<div class="flex items-center gap-3">
							<div class="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
								<DocumentTextIcon class="w-5 h-5 text-green-600" />
							</div>
							<div>
								<h4 class="font-medium text-text-main-light">CSV</h4>
								<p class="text-sm text-text-muted-light">Importar desde archivo CSV</p>
							</div>
						</div>
					</div>

					<div
						@click="selectedImportType = 'json'"
						:class="{
							'bg-primary/10 border border-primary': selectedImportType === 'json',
							'bg-gray-50 border border-gray-200': selectedImportType !== 'json',
						}"
						class="p-4 rounded-xl cursor-pointer transition-colors">
						<div class="flex items-center gap-3">
							<div class="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
								<CodeBracketSquareIcon class="w-5 h-5 text-purple-600" />
							</div>
							<div>
								<h4 class="font-medium text-text-main-light">JSON</h4>
								<p class="text-sm text-text-muted-light">Importar desde archivo JSON</p>
							</div>
						</div>
					</div>

					<div class="flex gap-3 pt-4">
						<button
							@click="showImportModal = false"
							class="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-text-main-light hover:bg-gray-50 transition-colors">
							Cancelar
						</button>
						<button
							@click="confirmImport"
							class="flex-1 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium">
							Importar
						</button>
					</div>
				</div>
			</div>
		</div>
	</Teleport>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
	CubeIcon,
	PencilIcon,
	TrashIcon,
	ArrowDownTrayIcon,
	XMarkIcon,
	CodeBracketIcon,
	DocumentTextIcon,
	CodeBracketSquareIcon,
} from "@heroicons/vue/24/outline";

interface ProjectItem {
	id: string;
	name: string;
	part_number?: string;
	category?: string;
	quantity?: number;
	in_stock?: number;
	min_stock?: number;
	price?: number;
	unit?: string;
	supplier?: string;
	description?: string;
	manufacturer?: string;
	customer_no?: string;
	package?: string;
	rohs?: string;
	ext_price?: number;
	lead_time?: number;
	date_code_lot_no?: string;
	status?: string;
}

const props = defineProps<{
	items: ProjectItem[];
}>();

const emit = defineEmits(["edit-item", "remove-item", "import-components"]);

const showImportModal = ref(false);
const selectedImportType = ref("easyeda");

const editItem = (item: ProjectItem) => {
	emit("edit-item", item);
};

const removeItem = (id: string) => {
	emit("remove-item", id);
};

const confirmImport = () => {
	emit("import-components", { type: selectedImportType.value });
	showImportModal.value = false;
};
</script>
