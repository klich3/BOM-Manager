<template>
	<div class="bg-card-light rounded-2xl shadow-sm overflow-hidden">
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
							Componente
						</th>
						<th class="px-6 py-4 text-left text-xs font-semibold text-text-muted-light uppercase">
							Categoría
						</th>
						<th class="px-6 py-4 text-left text-xs font-semibold text-text-muted-light uppercase">Stock</th>
						<th class="px-6 py-4 text-left text-xs font-semibold text-text-muted-light uppercase">
							Proveedor
						</th>
						<th class="px-6 py-4 text-left text-xs font-semibold text-text-muted-light uppercase">
							Precio
						</th>
						<th class="px-6 py-4 text-left text-xs font-semibold text-text-muted-light uppercase">LCSC</th>
						<th class="px-6 py-4 text-left text-xs font-semibold text-text-muted-light uppercase">
							Empaquetado
						</th>
						<th class="px-6 py-4 text-left text-xs font-semibold text-text-muted-light uppercase">
							Fabricante
						</th>
						<th class="px-6 py-4 text-left text-xs font-semibold text-text-muted-light uppercase">
							Precio Ext.
						</th>
						<th class="px-6 py-4 text-left text-xs font-semibold text-text-muted-light uppercase">RoHS</th>
						<th class="px-6 py-4 text-left text-xs font-semibold text-text-muted-light uppercase">
							Proyecto
						</th>
						<th class="px-6 py-4 text-left text-xs font-semibold text-text-muted-light uppercase">
							Acciones
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200">
					<tr v-if="items.length === 0">
						<td colspan="13" class="px-6 py-12 text-center">
							<CubeIcon class="w-12 h-12 mx-auto mb-4 text-gray-300" />
							<p class="text-text-muted-light">No hay componentes en el inventario</p>
						</td>
					</tr>
					<tr
						v-for="(item, index) in items"
						:key="item.id"
						class="hover:bg-gray-50 transition-colors"
						:class="{ 'bg-gray-50': selectedItems.includes(item.id) }">
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
						<td class="px-6 py-4">
							<span class="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs font-medium">
								{{ item.category || "Sin categoría" }}
							</span>
						</td>
						<td class="px-6 py-4">
							<div class="flex items-center gap-2">
								<div
									class="w-2 h-2 rounded-full"
									:class="(item.min_stock || 0) > 0 ? 'bg-green-500' : 'bg-gray-300'"></div>
								<span class="text-sm text-text-main-light"> -- </span>
							</div>
						</td>
						<td class="px-6 py-4 text-sm text-text-muted-light">
							{{ item.supplier || "N/A" }}
						</td>
						<td class="px-6 py-4 text-sm font-medium text-text-main-light">
							${{ (item.price || 0).toFixed(2) }}
						</td>
						<td class="px-6 py-4">
							<div class="flex items-center gap-2">
								<span
									v-if="item.lcsc_part"
									class="px-2 py-1 bg-green-100 text-green-600 rounded text-xs font-medium">
									{{ item.lcsc_part }}
								</span>
								<button
									v-if="item.lcsc_part"
									@click="$emit('open-lcsc-preview', item.lcsc_part)"
									class="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
									title="Ver en LCSC">
									<GlobeAltIcon class="w-4 h-4 text-blue-600" />
								</button>
								<button
									v-if="item.lcsc_part"
									@click="$emit('open-lcsc-purchase', item.lcsc_part)"
									class="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
									title="Comprar en LCSC">
									<ShoppingCartIcon class="w-4 h-4 text-green-600" />
								</button>
								<span v-else class="text-xs text-text-muted-light"> N/A </span>
							</div>
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
						<td class="px-6 py-4 text-sm text-text-muted-light">
							{{ item.project_name || "N/A" }}
						</td>
						<td class="px-6 py-4">
							<div class="flex items-center gap-2">
								<button
									@click="$emit('edit-item', item)"
									class="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
									<PencilIcon class="w-4 h-4 text-blue-600" />
								</button>
								<button
									@click="$emit('delete-item', item.id)"
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
			<p class="text-sm text-text-main-light">{{ selectedItems.length }} items seleccionados</p>
			<button
				@click="deleteSelectedItems"
				class="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
				<TrashIcon class="w-4 h-4" />
				<span>Eliminar seleccionados ({{ selectedItems.length }})</span>
			</button>
		</div>
		<div class="flex justify-center items-center mt-4 mb-10" v-if="items.length === 0">
			<button
				@click="$emit('add-first-item')"
				class="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors">
				<ArrowDownTrayIcon class="w-4 h-4" />
				<span>Agregar primer componente</span>
			</button>
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

interface InventoryItem {
	id: string;
	name: string;
	part_number?: string;
	category?: string;
	// in_stock?: number; // Eliminado porque ya no se usa
	min_stock?: number;
	supplier?: string;
	price?: number;
	unit?: string;
	lcsc_part?: string;
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
	"delete-item": [id: string];
	"delete-selected-items": [ids: string[]];
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

const deleteSelectedItems = () => {
	// Emitir un evento para que el componente padre maneje la eliminación de múltiples items
	const itemsToDelete = [...selectedItems.value];
	selectedItems.value = [];
	selectAll.value = false;
	emit("delete-selected-items", itemsToDelete);
};

// Actualizar selectAll cuando cambia el número de elementos seleccionados
watch(
	selectedItems,
	(newSelected, oldSelected) => {
		selectAll.value = newSelected.length === props.items.length && props.items.length > 0;
	},
	{ immediate: true },
);
</script>
