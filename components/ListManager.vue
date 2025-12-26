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
					{{
						editingList ? "Editar Lista de Componentes" : "Crear Nueva Lista"
					}}
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

			<div class="px-6 pb-6">
				<!-- Formulario para crear/editar lista -->
				<div class="mb-6">
					<div class="mb-4">
						<label
							class="block text-sm font-medium text-text-main-light dark:text-text-main-dark mb-2"
						>
							Nombre de la Lista
						</label>
						<input
							v-model="listForm.name"
							type="text"
							class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light dark:text-text-main-dark"
							placeholder="Nombre de la lista..."
						/>
					</div>

					<div class="mb-4">
						<label
							class="block text-sm font-medium text-text-main-light dark:text-text-main-dark mb-2"
						>
							Descripción
						</label>
						<textarea
							v-model="listForm.description"
							rows="3"
							class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light dark:text-text-main-dark resize-none"
							placeholder="Descripción de la lista..."
						></textarea>
					</div>
				</div>

				<!-- Componentes seleccionados -->
				<div class="mb-6">
					<div class="flex justify-between items-center mb-4">
						<h3
							class="text-lg font-medium text-text-main-light dark:text-text-main-dark"
						>
							Componentes en la Lista
						</h3>
						<span
							class="text-sm text-text-muted-light dark:text-text-muted-dark"
						>
							{{ listForm.items.length }} componentes
						</span>
					</div>

					<div
						v-if="listForm.items.length === 0"
						class="text-center py-8 text-text-muted-light dark:text-text-muted-dark"
					>
						No hay componentes en esta lista
					</div>

					<div class="flex justify-between items-center mb-4">
						<div>
							<h4
								class="text-md font-medium text-text-main-light dark:text-text-main-dark"
							>
								Componentes en la Lista
							</h4>
							<p
								class="text-sm text-text-muted-light dark:text-text-muted-dark"
							>
								{{ listForm.items.length }} componentes
							</p>
						</div>
						<div class="flex gap-2">
							<button
								@click="sortItemsByName"
								class="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-text-main-light dark:text-text-main-dark rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
							>
								Ordenar A-Z
							</button>
							<button
								@click="sortItemsByQuantity"
								class="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-text-main-light dark:text-text-main-dark rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
							>
								Ordenar Cantidad
							</button>
						</div>
					</div>

					<div
						v-if="listForm.items.length === 0"
						class="text-center py-8 text-text-muted-light dark:text-text-muted-dark"
					>
						No hay componentes en esta lista
					</div>

					<div v-else class="overflow-x-auto">
						<table class="w-full">
							<thead class="bg-gray-50 dark:bg-gray-800">
								<tr>
									<th
										class="px-4 py-3 text-left text-xs font-semibold text-text-muted-light dark:text-text-muted-dark uppercase"
									>
										Componente
									</th>
									<th
										class="px-4 py-3 text-left text-xs font-semibold text-text-muted-light dark:text-text-muted-dark uppercase"
									>
										Cantidad
									</th>
									<th
										class="px-4 py-3 text-left text-xs font-semibold text-text-muted-light dark:text-text-muted-dark uppercase"
									>
										Unidad
									</th>
									<th
										class="px-4 py-3 text-left text-xs font-semibold text-text-muted-light dark:text-text-muted-dark uppercase"
									>
										Acciones
									</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-gray-200 dark:divide-gray-700">
								<tr v-for="(item, index) in listForm.items" :key="index">
									<td class="px-4 py-3">
										<div>
											<p
												class="font-medium text-text-main-light dark:text-text-main-dark"
											>
												{{ item.name }}
											</p>
											<p
												class="text-sm text-text-muted-light dark:text-text-muted-dark"
											>
												{{ item.lcsc_part || item.part_number || "N/A" }}
											</p>
										</div>
									</td>
									<td class="px-4 py-3">
										<input
											v-model.number="item.quantity"
											type="number"
											min="1"
											class="w-20 px-2 py-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light dark:text-text-main-dark"
										/>
									</td>
									<td
										class="px-4 py-3 text-text-main-light dark:text-text-main-dark"
									>
										{{ item.unit }}
									</td>
									<td class="px-4 py-3">
										<button
											@click="removeItem(index)"
											class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
										>
											<TrashIcon
												class="w-4 h-4 text-red-600 dark:text-red-400"
											/>
										</button>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>

				<!-- Botones de acción -->
				<div class="flex gap-3">
					<button
						@click="closeModal"
						class="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-text-main-light dark:text-text-main-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
					>
						Cancelar
					</button>
					<button
						@click="saveList"
						class="flex-1 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium"
					>
						{{ editingList ? "Guardar Cambios" : "Guardar Lista" }}
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { XMarkIcon, TrashIcon } from "@heroicons/vue/24/outline";

// Definición de tipos
interface ComponentItem {
	id: string;
	name: string;
	part_number?: string;
	lcsc_part?: string;
	unit: string;
	quantity: number;
}

interface List {
	id: string;
	name: string;
	description?: string;
	items: ComponentItem[];
	createdAt: Date;
	updatedAt: Date;
}

// Props y Emits
interface Props {
	modelValue: boolean;
	items?: ComponentItem[];
}

interface Emits {
	(e: "update:modelValue", value: boolean): void;
	(e: "saved", list: List): void;
}

const props = withDefaults(defineProps<Props>(), {
	items: () => [],
});
const emit = defineEmits<Emits>();

// Estado
const isOpen = defineModel<boolean>("modelValue", { required: true });
const editingList = ref<List | null>(null);
const listForm = ref({
	name: "",
	description: "",
	items: [] as ComponentItem[],
});

// Métodos
const closeModal = () => {
	isOpen.value = false;
	resetForm();
};

const resetForm = () => {
	editingList.value = null;
	listForm.value = {
		name: "",
		description: "",
		items: [],
	};
};

const openModal = (list?: List) => {
	if (list) {
		editingList.value = list;
		listForm.value = {
			name: list.name,
			description: list.description || "",
			items: [...list.items],
		};
	} else {
		resetForm();
	}
	isOpen.value = true;
};

const saveList = () => {
	if (!listForm.value.name.trim()) {
		alert("Por favor, ingresa un nombre para la lista");
		return;
	}

	if (listForm.value.items.length === 0) {
		alert("La lista debe contener al menos un componente");
		return;
	}

	const list: List = {
		id: editingList.value?.id || crypto.randomUUID(),
		name: listForm.value.name,
		description: listForm.value.description,
		items: listForm.value.items,
		createdAt: editingList.value?.createdAt || new Date(),
		updatedAt: new Date(),
	};

	emit("saved", list);
	closeModal();
};

const addItems = (items: ComponentItem[]) => {
	items.forEach((item) => {
		// Verificar si el item ya está en la lista
		const existingIndex = listForm.value.items.findIndex(
			(i) => i.id === item.id
		);
		if (existingIndex === -1) {
			listForm.value.items.push({
				...item,
				quantity: item.quantity || 1,
			});
		}
	});
};

const removeItem = (index: number) => {
	listForm.value.items.splice(index, 1);
};

const sortItemsByName = () => {
	listForm.value.items.sort((a, b) => a.name.localeCompare(b.name));
};

const sortItemsByQuantity = () => {
	listForm.value.items.sort((a, b) => b.quantity - a.quantity);
};

// Exponer métodos para que el componente padre pueda usarlos
defineExpose({
	openModal,
	addItems,
});

// Cargar items iniciales si se proporcionan
onMounted(() => {
	if (props.items && props.items.length > 0) {
		addItems(props.items);
	}
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
