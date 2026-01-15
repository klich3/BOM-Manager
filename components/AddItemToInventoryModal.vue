<script setup lang="ts">
import { ref, watch } from "vue";
import { XMarkIcon } from "@heroicons/vue/24/outline";
import { useI18n } from "@/composables/useI18n";

const { t } = useI18n();

interface InventoryItem {
	id?: string;
	name: string;
	description?: string;
	quantity: number;
	unit: string;
	category?: string;
	supplier?: string;
	part_number?: string;
	lcsc_part?: string;
	price: number;
	in_stock: number;
	min_stock: number;
	notes?: string;
}

interface AddItemToInventoryModalProps {
	show: boolean;
	editingItem?: InventoryItem | null;
}

interface ItemForm {
	name: string;
	description: string;
	quantity: number;
	unit: string;
	category: string;
	supplier: string;
	partNumber: string;
	lcscPart: string;
	price: number;
	inStock: number;
	minStock: number;
	notes: string;
}

const props = withDefaults(defineProps<AddItemToInventoryModalProps>(), {
	editingItem: null,
});

const emit = defineEmits<{
	close: [];
	save: [item: ItemForm];
}>();

const itemForm = ref<ItemForm>({
	name: "",
	description: "",
	quantity: 0,
	unit: "pcs",
	category: "",
	supplier: "",
	partNumber: "",
	lcscPart: "",
	price: 0,
	inStock: 0,
	minStock: 0,
	notes: "",
});

// Watch para actualizar el formulario cuando cambia editingItem
watch(
	() => props.editingItem,
	(newEditingItem) => {
		if (newEditingItem) {
			itemForm.value = {
				name: newEditingItem.name,
				description: newEditingItem.description || "",
				quantity: newEditingItem.quantity || 0,
				unit: newEditingItem.unit || "pcs",
				category: newEditingItem.category || "",
				supplier: newEditingItem.supplier || "",
				partNumber: newEditingItem.part_number || "",
				lcscPart: newEditingItem.lcsc_part || "",
				price: newEditingItem.price || 0,
				inStock: newEditingItem.in_stock || 0,
				minStock: newEditingItem.min_stock || 0,
				notes: newEditingItem.notes || "",
			};
		} else {
			// Reiniciar formulario si no hay edición
			itemForm.value = {
				name: "",
				description: "",
				quantity: 0,
				unit: "pcs",
				category: "",
				supplier: "",
				partNumber: "",
				lcscPart: "",
				price: 0,
				inStock: 0,
				minStock: 0,
				notes: "",
			};
		}
	},
	{ immediate: true },
);

const closeModal = () => {
	emit("close");
};

const saveItem = () => {
	emit("save", { ...itemForm.value });
	// No reiniciar el formulario aquí porque el padre controla el estado
};
</script>

<template>
	<div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
		<div class="bg-card-light rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
			<div class="flex items-center justify-between mb-6 p-6 pb-4">
				<h2 class="text-xl font-semibold text-text-main-light">
					{{ editingItem ? t("edit_component") : t("add_component") }}
				</h2>
				<button @click="closeModal" class="p-1 hover:bg-gray-100 rounded-lg transition-colors">
					<XMarkIcon class="w-6 h-6 text-text-muted-light" />
				</button>
			</div>

			<form @submit.prevent="saveItem" class="px-6 pb-6 space-y-4">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label class="block text-sm font-medium text-text-main-light mb-2">
							{{ t("component_name") }} *
						</label>
						<input
							v-model="itemForm.name"
							type="text"
							required
							class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light"
							:placeholder="t('placeholder_name')" />
					</div>

					<div>
						<label class="block text-sm font-medium text-text-main-light mb-2"> {{ t("unit") }} * </label>
						<input
							v-model="itemForm.unit"
							type="text"
							required
							class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light"
							:placeholder="t('placeholder_unit')" />
					</div>

					<div>
						<label class="block text-sm font-medium text-text-main-light mb-2">
							{{ t("category") }}
						</label>
						<input
							v-model="itemForm.category"
							type="text"
							class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light"
							:placeholder="t('placeholder_category')" />
					</div>

					<div>
						<label class="block text-sm font-medium text-text-main-light mb-2">
							{{ t("supplier") }}
						</label>
						<input
							v-model="itemForm.supplier"
							type="text"
							class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light"
							:placeholder="t('placeholder_supplier')" />
					</div>

					<div>
						<label class="block text-sm font-medium text-text-main-light mb-2">
							{{ t("part_number") }}
						</label>
						<input
							v-model="itemForm.partNumber"
							type="text"
							class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light"
							:placeholder="t('placeholder_part_number')" />
					</div>

					<div>
						<label class="block text-sm font-medium text-text-main-light mb-2">
							{{ t("lcsc_part") }}
						</label>
						<input
							v-model="itemForm.lcscPart"
							type="text"
							class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light"
							placeholder="ej. C12345" />
					</div>

					<div>
						<label class="block text-sm font-medium text-text-main-light mb-2">
							{{ t("quantity") }}
						</label>
						<input
							v-model.number="itemForm.quantity"
							type="number"
							min="0"
							step="0.1"
							class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light"
							placeholder="0" />
					</div>

					<div>
						<label class="block text-sm font-medium text-text-main-light mb-2">
							{{ t("price") }} ($)
						</label>
						<input
							v-model.number="itemForm.price"
							type="number"
							min="0"
							step="0.01"
							class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light"
							placeholder="0.00" />
					</div>

					<div>
						<label class="block text-sm font-medium text-text-main-light mb-2">
							{{ t("current_stock") }}
						</label>
						<input
							v-model.number="itemForm.inStock"
							type="number"
							min="0"
							step="0.1"
							class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light"
							placeholder="0" />
					</div>

					<div>
						<label class="block text-sm font-medium text-text-main-light mb-2">
							{{ t("min_stock_header") }}
						</label>
						<input
							v-model.number="itemForm.minStock"
							type="number"
							min="0"
							step="0.1"
							class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light"
							placeholder="0" />
					</div>
				</div>

				<div>
					<label class="block text-sm font-medium text-text-main-light mb-2">
						{{ t("description") }}
					</label>
					<textarea
						v-model="itemForm.description"
						rows="3"
						class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light resize-none"
						:placeholder="t('placeholder_description')"></textarea>
				</div>

				<div>
					<label class="block text-sm font-medium text-text-main-light mb-2">
						{{ t("notes") }}
					</label>
					<textarea
						v-model="itemForm.notes"
						rows="2"
						class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light resize-none"
						:placeholder="t('placeholder_notes')"></textarea>
				</div>

				<div class="flex gap-3 pt-4">
					<button
						type="button"
						@click="closeModal"
						class="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-text-main-light hover:bg-gray-50 transition-colors">
						{{ t("cancel") }}
					</button>
					<button
						type="submit"
						class="flex-1 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium">
						{{ editingItem ? t("save") : t("add") }}
					</button>
				</div>
			</form>
		</div>
	</div>
</template>
