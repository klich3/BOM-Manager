<script setup lang="ts">
import { XMarkIcon } from "@heroicons/vue/24/outline";
import { ref, watch } from "vue";
import { useI18n } from "@/composables/useI18n";

const { t } = useI18n();

// Definir los eventos que emite este componente
const emit = defineEmits<{
	close: [];
	save: [item: any];
}>();

// Definir las props
interface Props {
	show: boolean;
	item?: any;
}
const props = defineProps<Props>();

// Reactive state
const form = ref({
	name: "",
	description: "",
	quantity: 1,
	category: "",
	supplier: "",
	partNumber: "",
	lcscPart: "",
	price: 0,
	inStock: 0,
	minStock: 0,
	notes: "",
	manufacturer: "",
});

// Methods
const resetForm = () => {
	form.value = {
		name: "",
		description: "",
		quantity: 1,
		category: "",
		supplier: "",
		partNumber: "",
		lcscPart: "",
		price: 0,
		inStock: 0,
		minStock: 0,
		notes: "",
		manufacturer: "",
	};
};

const closeModal = () => {
	emit("close");
};

const saveItem = () => {
	emit("save", {
		...props.item, // Keep original item properties
		...form.value, // Override with form values
		// Convert field names to snake_case for database consistency
		part_number: form.value.partNumber,
		lcsc_part: form.value.lcscPart,
		in_stock: form.value.inStock,
		min_stock: form.value.minStock,
	});
	closeModal();
};

// Watch for changes in props.item to update form
watch(
	() => props.item,
	(newItem) => {
		if (newItem) {
			form.value = {
				name: newItem.name || "",
				description: newItem.description || "",
				quantity: newItem.quantity || 1,
				category: newItem.category || "",
				supplier: newItem.supplier || "",
				partNumber: newItem.part_number || newItem.partNumber || "",
				lcscPart: newItem.lcsc_part || newItem.lcscPart || "",
				price: newItem.price || 0,
				inStock: newItem.in_stock || newItem.inStock || 0,
				minStock: newItem.min_stock || newItem.minStock || 0,
				notes: newItem.notes || "",
				manufacturer: newItem.manufacturer || "",
			};
		} else {
			// Reset form if no item is provided
			resetForm();
		}
	},
	{ immediate: true },
);
</script>

<template>
	<div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
		<div class="bg-card-light rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-auto">
			<!-- Header -->
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-xl font-semibold text-text-main-light">{{ t("edit_component") }}</h2>
				<button @click="closeModal" class="p-1 hover:bg-gray-100 rounded-lg transition-colors">
					<XMarkIcon class="w-6 h-6 text-text-muted-light" />
				</button>
			</div>

			<!-- Form -->
			<form @submit.prevent="saveItem" class="space-y-4">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label class="block text-sm font-medium text-text-main-light mb-1">{{ t("name") }} *</label>
						<input
							v-model="form.name"
							type="text"
							required
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
							:placeholder="t('placeholder_name')" />
					</div>

					<div>
						<label class="block text-sm font-medium text-text-main-light mb-1">{{ t("quantity") }} *</label>
						<input
							v-model.number="form.quantity"
							type="number"
							required
							min="1"
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
							:placeholder="t('quantity')" />
					</div>

					<div>
						<label class="block text-sm font-medium text-text-main-light mb-1">{{ t("category") }}</label>
						<input
							v-model="form.category"
							type="text"
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
							:placeholder="t('category')" />
					</div>

					<div>
						<label class="block text-sm font-medium text-text-main-light mb-1">{{ t("supplier") }}</label>
						<input
							v-model="form.supplier"
							type="text"
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
							:placeholder="t('supplier')" />
					</div>

					<div>
						<label class="block text-sm font-medium text-text-main-light mb-1">{{
							t("part_number")
						}}</label>
						<input
							v-model="form.partNumber"
							type="text"
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
							:placeholder="t('part_number')" />
					</div>

					<div>
						<label class="block text-sm font-medium text-text-main-light mb-1">{{ t("lcsc_part") }}</label>
						<input
							v-model="form.lcscPart"
							type="text"
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
							:placeholder="t('lcsc_part')" />
					</div>

					<div>
						<label class="block text-sm font-medium text-text-main-light mb-1">{{ t("unit_price") }}</label>
						<input
							v-model.number="form.price"
							type="number"
							step="0.0001"
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
							:placeholder="t('price')" />
					</div>

					<div>
						<label class="block text-sm font-medium text-text-main-light mb-1">{{
							t("current_stock")
						}}</label>
						<input
							v-model.number="form.inStock"
							type="number"
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
							:placeholder="t('current_stock')" />
					</div>

					<div>
						<label class="block text-sm font-medium text-text-main-light mb-1">{{
							t("min_stock_header")
						}}</label>
						<input
							v-model.number="form.minStock"
							type="number"
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
							:placeholder="t('min_stock_header')" />
					</div>

					<div>
						<label class="block text-sm font-medium text-text-main-light mb-1">{{
							t("manufacturer")
						}}</label>
						<input
							v-model="form.manufacturer"
							type="text"
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
							:placeholder="t('manufacturer')" />
					</div>

					<div class="md:col-span-2">
						<label class="block text-sm font-medium text-text-main-light mb-1">{{
							t("description")
						}}</label>
						<textarea
							v-model="form.description"
							rows="3"
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
							:placeholder="t('placeholder_description')"></textarea>
					</div>

					<div class="md:col-span-2">
						<label class="block text-sm font-medium text-text-main-light mb-1">{{ t("notes") }}</label>
						<textarea
							v-model="form.notes"
							rows="2"
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
							:placeholder="t('placeholder_notes')"></textarea>
					</div>
				</div>

				<!-- Action buttons -->
				<div class="flex justify-end items-center gap-4 mt-6 pt-6 border-t border-gray-200">
					<button
						type="button"
						@click="closeModal"
						class="px-6 py-2.5 rounded-lg border border-gray-300 text-text-main-light font-medium hover:bg-gray-100 transition-colors">
						{{ t("cancel") }}
					</button>
					<button
						type="submit"
						class="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold transition-all">
						{{ t("save_changes") }}
					</button>
				</div>
			</form>
		</div>
	</div>
</template>
