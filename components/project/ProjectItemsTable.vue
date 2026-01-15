<template>
	<div class="overflow-x-auto">
		<table class="w-full">
			<thead class="bg-gray-50">
				<tr>
					<th class="px-6 py-4 w-12">
						<input
							type="checkbox"
							v-model="selectAll"
							@change="toggleSelectAll"
							class="rounded text-primary focus:ring-primary border-gray-300" />
					</th>
					<th class="px-6 py-4 text-left text-xs font-semibold text-text-muted-light uppercase">
						{{ t("name") }}
					</th>
					<th class="px-6 py-4 text-left text-xs font-semibold text-text-muted-light uppercase">
						{{ t("package") }}
					</th>
					<th class="px-6 py-4 text-left text-xs font-semibold text-text-muted-light uppercase">
						{{ t("manufacturer") }}
					</th>
					<th class="px-6 py-4 text-left text-xs font-semibold text-text-muted-light uppercase">{{ t("category") }}</th>
					<th class="px-6 py-4 text-left text-xs font-semibold text-text-muted-light uppercase">
						{{ t("initial_quantity") }}
					</th>
					<th class="px-6 py-4 text-left text-xs font-semibold text-text-muted-light uppercase">
						{{ t("stock_status") }}
					</th>
					<th class="px-6 py-4 text-left text-xs font-semibold text-text-muted-light uppercase">{{ t("supplier") }}</th>
					<th class="px-6 py-4 text-left text-xs font-semibold text-text-muted-light uppercase">
						{{ t("unit_price") }}
					</th>
					<th class="px-6 py-4 text-left text-xs font-semibold text-text-muted-light uppercase">
						{{ t("total_price") }}
					</th>
					<th class="px-6 py-4 text-left text-xs font-semibold text-text-muted-light uppercase text-center">
						{{ t("pcb") }}
					</th>
					<th class="px-6 py-4 text-left text-xs font-semibold text-text-muted-light uppercase">{{ t("actions") }}</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-200">
				<tr v-if="items.length === 0">
					<td colspan="10" class="px-6 py-12 text-center">
						<CubeIcon class="w-12 h-12 mx-auto mb-4 text-gray-300" />
						<p class="text-text-muted-light">{{ t("no_items_project") }}</p>
					</td>
				</tr>
				<tr
					v-for="item in items"
					:key="item.id"
					:class="[
						'transition-colors',
						getStockRowClass(item.in_stock, item.min_stock),
						{ 'bg-gray-100': selectedItems.includes(item.id) },
						'hover:bg-opacity-80',
					]">
					<td class="px-6 py-4">
						<input
							type="checkbox"
							:value="item.id"
							v-model="selectedItems"
							class="rounded text-primary focus:ring-primary border-gray-300" />
					</td>
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
					<td class="px-6 py-4 text-sm text-text-muted-light">
						{{ item.package || "N/A" }}
					</td>
					<td class="px-6 py-4 text-sm text-text-muted-light">
						{{ item.manufacturer || "N/A" }}
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
								:class="getStockStatus(item.in_stock, item.min_stock)"></div>
							<span class="text-sm text-text-main-light">{{ item.in_stock || 0 }}</span>
						</div>
					</td>
					<td class="px-6 py-4 text-sm text-text-muted-light">
						{{ item.supplier || "N/A" }}
					</td>
					<td class="px-6 py-4 text-sm font-medium text-text-main-light">
						${{ (item.price || 0).toFixed(2) }}
					</td>
					<td class="px-6 py-4 text-sm font-medium text-text-main-light">${{ calculateTotalPrice(item) }}</td>
					<td class="px-6 py-4 text-center">
						<button
							v-if="item.pcb_designation"
							@click="emit('locate-pcb', item.pcb_designation)"
							class="p-1.5 hover:bg-indigo-100 rounded-lg transition-colors group"
							:title="t('locate_pcb')">
							<MapPinIcon class="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
						</button>
						<span v-else class="text-[10px] text-gray-400">N/A</span>
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
	<div class="flex justify-between items-center px-6 py-4 bg-gray-50" v-if="selectedItems.length > 0">
		<p class="text-sm text-text-main-light">{{ t("items_selected_simple", { count: selectedItems.length }) }}</p>
		<div class="flex items-center gap-2">
			<button
				@click="selectedItems = []"
				class="flex items-center gap-2 bg-gray-200 text-text-main-light px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors">
				<span>{{ t("deselect_all") }}</span>
			</button>
			<button
				@click="deleteSelectedItems"
				class="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
				<TrashIcon class="w-4 h-4" />
				<span>{{ t("delete_selected_count", { count: selectedItems.length }) }}</span>
			</button>
		</div>
	</div>
	<div class="flex justify-center items-center mt-4 mb-10" v-if="!items || items.length === 0">
		<button
			@click="emit('import-components')"
			class="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors">
			<ArrowDownTrayIcon class="w-4 h-4" />
			<span>{{ t("import_components") }}</span>
		</button>
	</div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n } from "@/composables/useI18n";
import {
	CubeIcon,
	PencilIcon,
	TrashIcon,
	ArrowDownTrayIcon,
	XMarkIcon,
	CodeBracketIcon,
	DocumentTextIcon,
	CodeBracketSquareIcon,
	MapPinIcon,
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
	pcb_designation?: string;
	item_image?: string;
}

const props = defineProps<{ items: ProjectItem[] }>();

const { t } = useI18n();

const emit = defineEmits([
	"edit-item",
	"remove-item",
	"remove-selected-items",
	"import-components",
	"file-selected-to-project",
	"locate-pcb",
]);

const selectedItems = ref<string[]>([]);
const selectAll = ref(false);

const toggleSelectAll = () => {
	if (selectAll.value) {
		selectedItems.value = props.items.map((item: ProjectItem) => item.id);
	} else {
		selectedItems.value = [];
	}
};

const deleteSelectedItems = () => {
	// Emitir un evento para que el componente padre maneje la eliminación de múltiples items
	const itemsToDelete = [...selectedItems.value];
	selectedItems.value = [];
	selectAll.value = false;
	emit("remove-selected-items", itemsToDelete);
};

// Actualizar selectAll cuando cambia el número de elementos seleccionados
watch(
	selectedItems,
	(newSelected: string[]) => {
		selectAll.value = newSelected.length === props.items.length && props.items.length > 0;
	},
	{ immediate: true },
);

const selectedImportType = ref("easyeda");

const editItem = (item: ProjectItem) => {
	emit("edit-item", item);
};

const removeItem = (id: string) => {
	emit("remove-item", id);
};

const getStockStatus = (in_stock: number | undefined, min_stock: number | undefined) => {
	const stock = in_stock || 0;
	const min = min_stock || 0;

	if (stock < min) {
		return "bg-red-500";
	} else if (stock === min) {
		return "bg-yellow-500";
	} else {
		return "bg-green-500";
	}
};

// Función para obtener clase de color de fondo según estado de stock
const getStockRowClass = (in_stock: number | undefined, min_stock: number | undefined) => {
	const stock = in_stock || 0;
	const min = min_stock || 0;

	if (stock <= 0) {
		// Agotado - rojo claro
		return "bg-red-50";
	} else if (stock <= min) {
		// Stock bajo - naranja claro
		return "bg-orange-50";
	} else {
		// Stock OK - blanco
		return "bg-white";
	}
};

const calculateTotalPrice = (item: ProjectItem) => {
	const quantity = item.quantity || 0;
	const price = item.price || 0;

	return (quantity * price).toFixed(2);
};
</script>
