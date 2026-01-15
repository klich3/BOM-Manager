<template>
	<div v-if="items.length > 0" class="overflow-x-auto">
		<table class="min-w-full divide-y divide-gray-200">
			<thead class="bg-gray-50">
				<tr>
					<th
						class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
						{{ t("import_status") }}
					</th>
					<th
						class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
						{{ t("name") }}
					</th>
					<th
						class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">
						{{ t("quantity") }}
					</th>
					<th
						class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
						{{ t("description") }}
					</th>
					<th
						class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
						{{ t("category") }}
					</th>
					<th
						class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
						{{ t("supplier") }}
					</th>
					<th
						class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
						{{ t("part_number") || "Part Number" }}
					</th>
					<th
						class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
						LCSC
					</th>
					<th
						class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">
						{{ t("unit_price") }}
					</th>
					<th
						class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">
						{{ t("current_stock") }}
					</th>
					<th
						class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">
						{{ t("min_stock_header") }}
					</th>
					<th
						class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
						{{ t("notes") || "Notas" }}
					</th>
					<th
						class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
						{{ t("manufacturer") }}
					</th>
					<th
						class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
						{{ t("package") }}
					</th>
					<th
						class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">
						{{ t("status") }}
					</th>
					<th
						class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
						{{ t("customer_no") || "Customer No" }}
					</th>
					<th
						class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[60px]">
						RoHS
					</th>
					<th
						class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">
						{{ t("ext_price") || "Price Ext." }}
					</th>
					<th
						class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
						{{ t("lead_time") || "Lead Time" }}
					</th>
					<th
						class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
						{{ t("date_code_lot_no") || "Date Code" }}
					</th>
				</tr>
			</thead>
			<tbody class="bg-white divide-y divide-gray-200">
				<tr v-for="(item, index) in items" :key="index" :class="getRowClass(item)">
					<td class="px-3 py-2 text-sm text-gray-900 min-w-[150px]">
						<div class="flex flex-col gap-2">
							<span
								:class="getStatusBadgeClass(item)"
								class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium">
								{{ getStatusLabel(item) }}
							</span>
							<select
								v-model="item.selectedAction"
								@change="
									$emit('update-item', { index, field: 'selectedAction', value: item.selectedAction })
								"
								class="block w-full text-xs border-gray-300 rounded-md focus:ring-primary focus:border-primary">
								<option value="create">{{ t("action_create") }}</option>
								<option v-if="item.importStatus === 'exists'" value="update_stock">
									{{ t("action_update_stock") }}
								</option>
								<option v-if="item.importStatus === 'exists'" value="consume_stock">
									{{ t("action_consume_stock") }}
								</option>
								<option v-if="item.importStatus === 'exists'" value="merge">{{ t("action_merge") }}</option>
								<option value="ignore">{{ t("action_ignore") }}</option>
							</select>
							<select
								v-model="item.selectedStockType"
								@change="
									$emit('update-item', {
										index,
										field: 'selectedStockType',
										value: item.selectedStockType,
									})
								"
								class="block w-full text-xs border-gray-300 rounded-md focus:ring-primary focus:border-primary">
								<option value="existing">{{ t("stock_type_available") }}</option>
								<option value="to_order">{{ t("stock_type_to_order") }}</option>
							</select>
						</div>
					</td>
					<td class="px-3 py-2 text-sm text-gray-900 min-w-[120px]">
						<input
							v-if="editable && !isFieldMapped('name')"
							type="text"
							v-model="item.name"
							class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
							@input="$emit('update-item', { index, field: 'name', value: item.name })" />
						<span v-else>{{ item.name }}</span>
					</td>
					<td class="px-3 py-2 text-sm text-gray-900 min-w-[80px]">
						<input
							v-if="editable && !isFieldMapped('quantity')"
							type="number"
							v-model="item.quantity"
							class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
							@input="
								$emit('update-item', { index, field: 'quantity', value: parseInt(item.quantity) || 0 })
							" />
						<span v-else>{{ item.quantity || 0 }}</span>
					</td>
					<td class="px-3 py-2 text-sm text-gray-900 min-w-[150px]">
						<input
							v-if="editable && !isFieldMapped('description')"
							type="text"
							v-model="item.description"
							class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
							@input="$emit('update-item', { index, field: 'description', value: item.description })" />
						<span v-else>{{ item.description || "-" }}</span>
					</td>
					<td class="px-3 py-2 text-sm text-gray-900 min-w-[120px]">
						<input
							v-if="editable && !isFieldMapped('category')"
							type="text"
							v-model="item.category"
							class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
							@input="$emit('update-item', { index, field: 'category', value: item.category })" />
						<span v-else>{{ item.category || "-" }}</span>
					</td>
					<td class="px-3 py-2 text-sm text-gray-900 min-w-[120px]">
						<input
							v-if="editable && !isFieldMapped('supplier')"
							type="text"
							v-model="item.supplier"
							class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
							@input="$emit('update-item', { index, field: 'supplier', value: item.supplier })" />
						<span v-else>{{ item.supplier || "-" }}</span>
					</td>
					<td class="px-3 py-2 text-sm text-gray-900 min-w-[120px]">
						<input
							v-if="editable && !isFieldMapped('partNumber')"
							type="text"
							v-model="item.partNumber"
							class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
							@input="$emit('update-item', { index, field: 'partNumber', value: item.partNumber })" />
						<span v-else>{{ item.partNumber || "-" }}</span>
					</td>
					<td class="px-3 py-2 text-sm text-gray-900 min-w-[100px]">
						<input
							v-if="editable && !isFieldMapped('lcscPart')"
							type="text"
							v-model="item.lcscPart"
							class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
							@input="$emit('update-item', { index, field: 'lcscPart', value: item.lcscPart })" />
						<span v-else>{{ item.lcscPart || "-" }}</span>
					</td>
					<td class="px-3 py-2 text-sm text-gray-900 min-w-[80px]">
						<input
							v-if="editable && !isFieldMapped('price')"
							type="number"
							v-model="item.price"
							class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
							@input="
								$emit('update-item', { index, field: 'price', value: parseFloat(item.price) || 0 })
							" />
						<span v-else>{{ item.price ? `$${item.price}` : "-" }}</span>
					</td>
					<td class="px-3 py-2 text-sm text-gray-900 min-w-[80px]">
						<div class="flex flex-col">
							<span
								:class="
									(item.existingItem?.inStock || 0) < (item.quantity || 0)
										? 'text-red-600 font-bold'
										: 'text-green-600 font-medium'
								">
								{{ item.existingItem?.inStock || 0 }}
							</span>
							<span class="text-[10px] text-gray-400">{{ t("in_inventory") }}</span>
						</div>
					</td>
					<td class="px-3 py-2 text-sm text-gray-900 min-w-[80px]">
						<input
							v-if="editable && !isFieldMapped('minStock')"
							type="number"
							v-model="item.minStock"
							class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
							@input="
								$emit('update-item', { index, field: 'minStock', value: parseInt(item.minStock) || 0 })
							" />
						<span v-else>{{ item.minStock || 0 }}</span>
					</td>
					<td class="px-3 py-2 text-sm text-gray-900 min-w-[120px]">
						<input
							v-if="editable && !isFieldMapped('notes')"
							type="text"
							v-model="item.notes"
							class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
							@input="$emit('update-item', { index, field: 'notes', value: item.notes })" />
						<span v-else>{{ item.notes || "-" }}</span>
					</td>
					<td class="px-3 py-2 text-sm text-gray-900 min-w-[120px]">
						<input
							v-if="editable && !isFieldMapped('manufacturer')"
							type="text"
							v-model="item.manufacturer"
							class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
							@input="$emit('update-item', { index, field: 'manufacturer', value: item.manufacturer })" />
						<span v-else>{{ item.manufacturer || "-" }}</span>
					</td>
					<td class="px-3 py-2 text-sm text-gray-900 min-w-[100px]">
						<input
							v-if="editable && !isFieldMapped('package')"
							type="text"
							v-model="item.package"
							class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
							@input="$emit('update-item', { index, field: 'package', value: item.package })" />
						<span v-else>{{ item.package || "-" }}</span>
					</td>
					<td class="px-3 py-2 text-sm text-gray-900 min-w-[80px]">
						<input
							v-if="editable && !isFieldMapped('status')"
							type="text"
							v-model="item.status"
							class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
							@input="$emit('update-item', { index, field: 'status', value: item.status })" />
						<span v-else>{{ item.status || "-" }}</span>
					</td>
					<td class="px-3 py-2 text-sm text-gray-900 min-w-[100px]">
						<input
							v-if="editable && !isFieldMapped('customerNo')"
							type="text"
							v-model="item.customerNo"
							class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
							@input="$emit('update-item', { index, field: 'customerNo', value: item.customerNo })" />
						<span v-else>{{ item.customerNo || "-" }}</span>
					</td>
					<td class="px-3 py-2 text-sm text-gray-900 min-w-[60px]">
						<input
							v-if="editable && !isFieldMapped('rohs')"
							type="text"
							v-model="item.rohs"
							class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
							@input="$emit('update-item', { index, field: 'rohs', value: item.rohs })" />
						<span v-else>{{ item.rohs || "-" }}</span>
					</td>
					<td class="px-3 py-2 text-sm text-gray-900 min-w-[80px]">
						<input
							v-if="editable && !isFieldMapped('extPrice')"
							type="number"
							v-model="item.extPrice"
							class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
							@input="
								$emit('update-item', {
									index,
									field: 'extPrice',
									value: parseFloat(item.extPrice) || 0,
								})
							" />
						<span v-else>{{ item.extPrice ? `$${item.extPrice}` : "-" }}</span>
					</td>
					<td class="px-3 py-2 text-sm text-gray-900 min-w-[100px]">
						<input
							v-if="editable && !isFieldMapped('leadTime')"
							type="number"
							v-model="item.leadTime"
							class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
							@input="
								$emit('update-item', { index, field: 'leadTime', value: parseInt(item.leadTime) || 0 })
							" />
						<span v-else>{{ item.leadTime || "-" }}</span>
					</td>
					<td class="px-3 py-2 text-sm text-gray-900 min-w-[120px]">
						<input
							v-if="editable && !isFieldMapped('dateCodeLotNo')"
							type="text"
							v-model="item.dateCodeLotNo"
							class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
							@input="
								$emit('update-item', { index, field: 'dateCodeLotNo', value: item.dateCodeLotNo })
							" />
						<span v-else>{{ item.dateCodeLotNo || "-" }}</span>
					</td>
				</tr>
				<!-- Se eliminó el límite de 10 items para mostrar todos los registros -->
			</tbody>
		</table>
	</div>
	<div v-else class="text-center py-8 text-gray-500">
		<p>{{ t("no_items_to_show") }}</p>
	</div>
</template>

<script setup lang="ts">
import { useI18n } from "@/composables/useI18n";

const { t } = useI18n();

interface Props {
	items: any[];
	editable?: boolean;
	fieldMappings?: Record<string, string>;
	selectedRows?: Record<number, boolean>;
}

const props = withDefaults(defineProps<Props>(), {
	editable: true,
	fieldMappings: () => ({}),
});

// Define the emit
const emit = defineEmits<{
	"update-item": [data: { index: number; field: string; value: any }];
}>();

// Función para verificar si un campo está mapeado
const isFieldMapped = (field: string): boolean => {
	if (!props.fieldMappings || Object.keys(props.fieldMappings).length === 0) {
		return false;
	}

	// Buscar si este campo específico está mapeado
	// El fieldMappings podría tener la estructura { 'Nombre Original': 'nombre_campo' }
	const mappedFields = Object.values(props.fieldMappings);
	return mappedFields.includes(field);
};

// Función para verificar si una columna está seleccionada para importar
const isColumnSelected = (field: string): boolean => {
	// En ImportPreviewTable no tenemos información sobre selección de columnas
	// Por lo tanto, devolvemos true por defecto
	return true;
};

const getRowClass = (item: any) => {
	if (item.selectedAction === "ignore") return "bg-gray-100 opacity-60";

	// Lógica de marcado según stock para "por pedir"
	if (item.selectedStockType === "to_order") {
		const inStock = item.existingItem?.inStock || 0;
		const needed = item.quantity || 0;

		if (inStock >= needed) {
			return "bg-green-50 border-l-4 border-green-500"; // Tenemos todo
		} else if (inStock > 0) {
			return "bg-amber-50 border-l-4 border-amber-500"; // Tenemos algo
		} else {
			return "bg-red-50 border-l-4 border-red-500"; // Hay que comprar todo
		}
	}

	if (item.importStatus === "exists") return "bg-amber-50";
	return "";
};

const getStatusBadgeClass = (item: any) => {
	if (item.importStatus === "exists") return "bg-blue-100 text-blue-800";
	return "bg-green-100 text-green-800";
};

const getStatusLabel = (item: any) => {
	if (item.importStatus === "exists") return t("matched_found");
	return t("new_item");
};
</script>
