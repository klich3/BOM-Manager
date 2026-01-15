<script setup lang="ts">
import {
	CubeIcon,
	PencilIcon,
	TrashIcon,
	GlobeAltIcon,
	ShoppingCartIcon,
	ArrowDownTrayIcon,
	DocumentTextIcon,
} from "@heroicons/vue/24/outline";
import { ref, watch } from "vue";
import { useNotifications } from "@/composables/useNotifications";
import { useI18n } from "@/composables/useI18n";

interface InventoryItem {
	id: string;
	name: string;
	description?: string;
	quantity?: number; // Cantidad comprada inicial
	unit?: string;
	category?: string;
	in_stock?: number; // Stock actual
	min_stock?: number;
	supplier?: string;
	part_number?: string;
	lcsc_part?: string;
	price?: number;
	notes?: string;
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
	project_name?: string;
}

interface Props {
	items: InventoryItem[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
	"edit-item": [item: InventoryItem];
	"remove-item": [id: string];
	"remove-items": [ids: string[]];
	"open-lcsc-preview": [partNumber: string, itemId?: string];
	"open-lcsc-purchase": [partNumber: string];
	"add-first-item": [];
	"delete-item": [id: string];
	"delete-selected-items": [ids: string[]];
	"items-assigned-to-project": [projectId: string];
}>();

const { t } = useI18n();
const selectedItems = ref<string[]>([]);
const selectAll = ref(false);
const showAssignProjectModal = ref(false);

const toggleSelectAll = () => {
	selectAll.value = !selectAll.value;
	if (selectAll.value) {
		selectedItems.value = props.items.map((item: InventoryItem) => item.id);
	} else {
		selectedItems.value = [];
	}
};

const toggleSelect = (id: string) => {
	if (selectedItems.value.includes(id)) {
		selectedItems.value = selectedItems.value.filter((i: string) => i !== id);
	} else {
		selectedItems.value = [...selectedItems.value, id];
	}

	// Actualizar el estado de selectAll según la selección actual
	selectAll.value = selectedItems.value.length === props.items.length && props.items.length > 0;
};

const clearSelection = () => {
	selectedItems.value = [];
	selectAll.value = false;
};

const deleteSelectedItems = () => {
	// Emitir un evento para que el componente padre maneje la eliminación de múltiples items
	const itemsToDelete = [...selectedItems.value];
	selectedItems.value = [];
	selectAll.value = false;
	emit("remove-items", itemsToDelete);
	emit("delete-selected-items", itemsToDelete);
};

const onItemsAssignedToProject = (projectId: string) => {
	showAssignProjectModal.value = false;
	// Mostrar notificación de éxito
	const { success } = useNotifications();
	success("Éxito", `Items asignados al proyecto`);
	// Limpiar selección después de asignar
	selectedItems.value = [];
	selectAll.value = false;
	// Emitir evento para que el componente padre actualice los datos
	emit("items-assigned-to-project", projectId);
};

const openLcscPreview = (item: InventoryItem) => {
	if (item.lcsc_part) {
		emit("open-lcsc-preview", item.lcsc_part, item.id);
	}
};

const openLcscPurchase = (partNumber: string) => {
	emit("open-lcsc-purchase", partNumber);
};

// Initialize notifications composable
const { success, error: showError, warning, info } = useNotifications();

const copyToClipboard = (value: string) => {
	navigator.clipboard.writeText(value).then(
		() => {
			info(t("copied_to_clipboard"), "LCSC Part Number");
		},
		(err) => {
			console.error("Failed to copy: ", err);
			showError(t("error"), "No se pudo copiar al portapapeles");
		},
	);
};

// Actualizar selectAll cuando cambia el número de elementos seleccionados
watch(
	() => selectedItems.value,
	(newSelected: string[]) => {
		// Esta lógica ahora está en toggleSelect
	},
	{ immediate: true },
);

// Exponer para que el padre pueda acceder a los seleccionados
defineExpose({
	selectedItems,
	clearSelection,
});

// Función para obtener clase de color según estado de stock
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

// Por ahora la prop para mostrar checkboxes siempre está en true, si cambiamos este valor no muestra nada.
const showSelect = ref(true);
</script>

<template>
	<div class="bg-card-light rounded-2xl shadow-sm overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead class="bg-gray-50">
					<tr>
						<th v-if="showSelect" class="w-12 px-6 py-3">
							<input
								type="checkbox"
								:checked="selectAll"
								@change="toggleSelectAll"
								class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
						</th>
						<th class="px-6 py-3 text-left text-xs font-semibold text-text-muted-light uppercase">
							{{ t("name") }}
						</th>
						<th class="px-6 py-3 text-left text-xs font-semibold text-text-muted-light uppercase">
							{{ t("description") }}
						</th>
						<th class="px-6 py-3 text-left text-xs font-semibold text-text-muted-light uppercase">
							{{ t("category") }}
						</th>
						<th class="px-6 py-3 text-left text-xs font-semibold text-text-muted-light uppercase">
							{{ t("supplier") }}
						</th>
						<th class="px-6 py-3 text-left text-xs font-semibold text-text-muted-light uppercase">LCSC</th>
						<th class="px-6 py-3 text-left text-xs font-semibold text-text-muted-light uppercase">
							{{ t("unit_price") }}
						</th>
						<th class="px-6 py-3 text-left text-xs font-semibold text-text-muted-light uppercase">Total</th>
						<th class="px-6 py-3 text-left text-xs font-semibold text-text-muted-light uppercase">
							{{ t("initial_quantity") }}
						</th>
						<th class="px-6 py-3 text-left text-xs font-semibold text-text-muted-light uppercase">
							{{ t("current_stock") }}
						</th>
						<th class="px-6 py-3 text-left text-xs font-semibold text-text-muted-light uppercase">
							{{ t("min_stock_header") }}
						</th>
						<th class="px-6 py-3 text-left text-xs font-semibold text-text-muted-light uppercase">
							{{ t("project") }}
						</th>
						<th class="px-6 py-3 text-left text-xs font-semibold text-text-muted-light uppercase">
							{{ t("actions") }}
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200">
					<tr
						v-for="item in items"
						:key="item.id"
						:class="[
							'transition-colors',
							getStockRowClass(item.in_stock, item.min_stock),
							'hover:bg-opacity-80',
						]">
						<td v-if="showSelect" class="px-6 py-4">
							<input
								type="checkbox"
								:checked="selectedItems.includes(item.id)"
								@change="toggleSelect(item.id)"
								class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
						</td>
						<td class="px-6 py-4">
							<div class="text-sm font-medium text-text-main-light">{{ item.name }}</div>
						</td>
						<td class="px-6 py-4 text-sm text-text-muted-light">
							{{ item.description || "-" }}
						</td>
						<td class="px-6 py-4 text-sm text-text-main-light">
							{{ item.category || "-" }}
						</td>
						<td class="px-6 py-4 text-sm text-text-main-light">
							{{ item.supplier || "-" }}
						</td>
						<td class="px-6 py-4">
							<div class="flex items-center gap-2">
								<button
									v-if="item.lcsc_part"
									@click="copyToClipboard(item.lcsc_part)"
									class="px-2 py-1 bg-green-100 text-green-600 rounded text-xs font-medium hover:bg-green-200 transition-colors"
									:title="t('copy_to_clipboard')">
									{{ item.lcsc_part }}
								</button>
								<span v-else class="text-sm text-text-muted-light">-</span>
								<button
									v-if="item.lcsc_part"
									@click="openLcscPreview(item)"
									class="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors">
									<DocumentTextIcon class="w-4 h-4" />
								</button>
								<button
									v-if="item.lcsc_part"
									@click="openLcscPurchase(item.lcsc_part)"
									class="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors">
									<GlobeAltIcon class="w-4 h-4" />
								</button>
							</div>
						</td>
						<td class="px-6 py-4 text-sm text-text-main-light">
							{{ item.price ? `$${item.price}` : "-" }}
						</td>
						<td class="px-6 py-4 text-sm font-medium text-text-main-light">
							{{
								item.price && item.quantity ? `$${(item.price * (item.quantity || 0)).toFixed(2)}` : "-"
							}}
						</td>
						<td class="px-6 py-4 text-sm text-text-main-light">
							{{ item.quantity || 0 }}
						</td>
						<td class="px-6 py-4">
							<div class="flex items-center gap-2">
								<div
									class="w-2 h-2 rounded-full"
									:class="
										item.min_stock && item.in_stock !== undefined && item.in_stock <= item.min_stock
											? 'bg-amber-500'
											: item.in_stock !== undefined && item.in_stock > (item.min_stock || 0)
											? 'bg-green-500'
											: 'bg-gray-300'
									"></div>
								<span class="text-sm text-text-main-light">{{ item.in_stock || 0 }}</span>
							</div>
						</td>
						<td class="px-6 py-4 text-sm text-text-main-light">
							{{ item.min_stock || 0 }}
						</td>
						<td class="px-6 py-4 text-sm text-text-main-light">
							{{ item.project_name || "-" }}
						</td>
						<td class="px-6 py-4 text-sm font-medium">
							<div class="flex items-center gap-2">
								<button
									@click="$emit('edit-item', item)"
									class="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors">
									<PencilIcon class="w-4 h-4" />
								</button>
								<button
									@click="$emit('delete-item', item.id)"
									class="p-1 text-red-600 hover:bg-red-100 rounded transition-colors">
									<TrashIcon class="w-4 h-4" />
								</button>
							</div>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
		<div v-if="selectedItems.length > 0" class="border-t border-gray-200 p-4 bg-gray-50">
			<div class="flex justify-end gap-3">
				<button
					@click="deleteSelectedItems"
					class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none">
					{{ t("delete_selected") }}
				</button>
				<button
					@click="showAssignProjectModal = true"
					class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none">
					{{ t("assign_to_project") }}
				</button>
			</div>
		</div>
	</div>

	<!-- Modal para asignar a proyecto -->
	<AssignProjectModal
		v-if="showAssignProjectModal"
		:show="showAssignProjectModal"
		:selected-items="selectedItems"
		@close="showAssignProjectModal = false"
		@assigned="onItemsAssignedToProject" />
</template>
