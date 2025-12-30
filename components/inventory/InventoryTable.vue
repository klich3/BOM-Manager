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
							Nombre
						</th>
						<th class="px-6 py-3 text-left text-xs font-semibold text-text-muted-light uppercase">
							Descripción
						</th>
						<th class="px-6 py-3 text-left text-xs font-semibold text-text-muted-light uppercase">
							Categoría
						</th>
						<th class="px-6 py-3 text-left text-xs font-semibold text-text-muted-light uppercase">
							Proveedor
						</th>
						<th class="px-6 py-3 text-left text-xs font-semibold text-text-muted-light uppercase">LCSC</th>
						<th class="px-6 py-3 text-left text-xs font-semibold text-text-muted-light uppercase">
							Precio
						</th>
						<th class="px-6 py-3 text-left text-xs font-semibold text-text-muted-light uppercase">Total</th>
						<th class="px-6 py-3 text-left text-xs font-semibold text-text-muted-light uppercase">
							Cantidad Inicial
						</th>
						<th class="px-6 py-3 text-left text-xs font-semibold text-text-muted-light uppercase">
							Stock Actual
						</th>
						<th class="px-6 py-3 text-left text-xs font-semibold text-text-muted-light uppercase">
							Min Stock
						</th>
						<th class="px-6 py-3 text-left text-xs font-semibold text-text-muted-light uppercase">
							Proyecto
						</th>
						<th class="px-6 py-3 text-left text-xs font-semibold text-text-muted-light uppercase">
							Acciones
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200">
					<tr v-for="item in items" :key="item.id" class="hover:bg-gray-50 transition-colors">
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
								<span
									v-if="item.lcsc_part"
									class="px-2 py-1 bg-green-100 text-green-600 rounded text-xs font-medium">
									{{ item.lcsc_part }}
								</span>
								<span v-else class="text-sm text-text-muted-light">-</span>
								<button
									v-if="item.lcsc_part"
									@click="openLcscPreview(item.lcsc_part)"
									class="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors">
									<GlobeAltIcon class="w-4 h-4" />
								</button>
								<button
									v-if="item.lcsc_part"
									@click="openLcscPurchase(item.lcsc_part)"
									class="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors">
									<ShoppingCartIcon class="w-4 h-4" />
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
									@click="$emit('remove-item', item.id)"
									class="p-1 text-red-600 hover:bg-red-100 rounded transition-colors">
									<TrashIcon class="w-4 h-4" />
								</button>
							</div>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>

<script setup lang="ts">
import {
	CubeIcon,
	PencilIcon,
	TrashIcon,
	GlobeAltIcon,
	ShoppingCartIcon,
	ArrowDownTrayIcon,
} from "@heroicons/vue/24/outline";
import { ref, watch } from "vue";
import { useNotifications } from "@/composables/useNotifications";

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
	"open-lcsc-preview": [partNumber: string];
	"open-lcsc-purchase": [partNumber: string];
	"add-first-item": [];
}>();

const selectedItems = ref<string[]>([]);
const selectAll = ref(false);

const toggleSelectAll = () => {
	if (selectAll.value) {
		selectedItems.value = props.items.map((item) => item.id);
	} else {
		selectedItems.value = [];
	}
};

const toggleSelect = (id: string) => {
	if (selectedItems.value.includes(id)) {
		selectedItems.value = selectedItems.value.filter((i) => i !== id);
	} else {
		selectedItems.value = [...selectedItems.value, id];
	}
};

const deleteSelectedItems = () => {
	// Emitir un evento para que el componente padre maneje la eliminación de múltiples items
	const itemsToDelete = [...selectedItems.value];
	selectedItems.value = [];
	selectAll.value = false;
	emit("remove-items", itemsToDelete);
};

const openLcscPreview = (partNumber: string) => {
	emit("open-lcsc-preview", partNumber);
};

const openLcscPurchase = (partNumber: string) => {
	emit("open-lcsc-purchase", partNumber);
};

// Initialize notifications composable
const { success, error: showError, warning, info } = useNotifications();

const copyToClipboard = (value: string) => {
	navigator.clipboard.writeText(value).then(
		() => {
			info("Copiado", "LCSC Part Number copiado al portapapeles");
		},
		(err) => {
			console.error("Failed to copy: ", err);
			showError("Error", "No se pudo copiar al portapapeles");
		},
	);
};

// Actualizar selectAll cuando cambia el número de elementos seleccionados
watch(
	selectedItems,
	(newSelected, oldSelected) => {
		selectAll.value = newSelected.length === props.items.length && props.items.length > 0;
	},
	{ immediate: true },
);

// Por ahora la prop para mostrar checkboxes siempre está en true, si cambiamos este valor no muestra nada.
const showSelect = ref(true);
</script>
