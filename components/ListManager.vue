<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import {
	XMarkIcon,
	TrashIcon,
	PlusIcon,
	MagnifyingGlassIcon,
	ClipboardDocumentListIcon,
	ArrowsUpDownIcon,
} from "@heroicons/vue/24/outline";
import { useDatabase } from "@/composables/useDatabase";

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

const db = useDatabase();

// Estado
const isOpen = defineModel<boolean>("modelValue", { required: true });
const editingList = ref<List | null>(null);
const listForm = ref({
	name: "",
	description: "",
	items: [] as ComponentItem[],
});

// Selection State
const projects = ref<any[]>([]);
const selectedProjectId = ref("");
const projectItemsResults = ref<any[]>([]);
const inventorySearchQuery = ref("");
const allInventoryItems = ref<any[]>([]);

// Computed Search Results
const searchResults = computed(() => {
	if (!inventorySearchQuery.value.trim()) return [];
	const q = inventorySearchQuery.value.toLowerCase();
	return allInventoryItems.value
		.filter(
			(item: any) =>
				(item.name || "").toLowerCase().includes(q) ||
				(item.part_number || "").toLowerCase().includes(q) ||
				(item.lcsc_part || "").toLowerCase().includes(q) ||
				(item.category || "").toLowerCase().includes(q) ||
				(item.description || "").toLowerCase().includes(q),
		)
		.slice(0, 15);
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
	selectedProjectId.value = "";
	inventorySearchQuery.value = "";
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

const addItemToList = (item: any) => {
	const existing = listForm.value.items.find((i: ComponentItem) => i.id === item.id);
	if (!existing) {
		listForm.value.items.push({
			id: item.id,
			name: item.name,
			part_number: item.part_number,
			lcsc_part: item.lcsc_part,
			unit: item.unit || "pcs",
			quantity: item.quantity && item.quantity > 0 ? item.quantity : 1,
		});
	}
};

const addItems = (items: ComponentItem[]) => {
	items.forEach((item: ComponentItem) => {
		const existingIndex = listForm.value.items.findIndex((i: ComponentItem) => i.id === item.id);
		if (existingIndex === -1) {
			listForm.value.items.push({
				...item,
				quantity: item.quantity && item.quantity > 0 ? item.quantity : 1,
			});
		}
	});
};

const loadProjectItems = async () => {
	if (!selectedProjectId.value) {
		projectItemsResults.value = [];
		return;
	}
	try {
		const projectItems = await db.getProjectItems(selectedProjectId.value);
		projectItemsResults.value = projectItems.map((item: any) => ({
			id: item.id,
			name: item.name,
			part_number: item.part_number,
			lcsc_part: item.lcsc_part,
			unit: item.unit || "pcs",
			quantity: item.project_quantity || item.quantity || 1,
		}));
	} catch (error) {
		console.error("Error loading project items:", error);
		projectItemsResults.value = [];
	}
};

const addAllProjectItems = () => {
	addItems(projectItemsResults.value);
	projectItemsResults.value = [];
	selectedProjectId.value = "";
};

const removeItem = (index: number) => {
	listForm.value.items.splice(index, 1);
};

const sortItemsByName = () => {
	listForm.value.items.sort((a: ComponentItem, b: ComponentItem) => a.name.localeCompare(b.name));
};

const sortItemsByQuantity = () => {
	listForm.value.items.sort((a: ComponentItem, b: ComponentItem) => b.quantity - a.quantity);
};

// Exponer métodos
defineExpose({
	openModal,
	addItems,
});

// Cargar datos iniciales
onMounted(async () => {
	if (props.items && props.items.length > 0) {
		addItems(props.items);
	}

	try {
		projects.value = await db.getAllProjects();
		allInventoryItems.value = await db.getAllItems();
	} catch (error) {
		console.error("Error loading initial data for ListManager:", error);
	}
});

// Watch for props items changes (if modal is already open)
watch(
	() => props.items,
	(newItems: ComponentItem[]) => {
		if (newItems && newItems.length > 0) {
			addItems(newItems);
		}
	},
	{ deep: true },
);
</script>

<template>
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
		<div class="bg-card-light rounded-2xl shadow-xl w-full h-full flex flex-col overflow-hidden">
			<!-- Header -->
			<div class="flex items-center justify-between p-6 border-b border-gray-100">
				<h2 class="text-xl font-semibold text-text-main-light">
					{{ editingList ? "Editar Lista de Componentes" : "Crear Nueva Lista" }}
				</h2>
				<button @click="closeModal" class="p-1 hover:bg-gray-100 rounded-lg transition-colors">
					<XMarkIcon class="w-6 h-6 text-text-muted-light" />
				</button>
			</div>

			<div class="flex flex-1 overflow-hidden">
				<!-- Left Panel: Form & Search -->
				<div class="w-1/3 border-r border-gray-100 p-6 overflow-y-auto bg-gray-50/50">
					<!-- Formulario para crear/editar lista -->
					<div class="mb-6">
						<div class="mb-4">
							<label class="block text-sm font-medium text-text-main-light mb-2">
								Nombre de la Lista
							</label>
							<input
								v-model="listForm.name"
								type="text"
								class="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light"
								placeholder="Nombre de la lista..." />
						</div>

						<div class="mb-4">
							<label class="block text-sm font-medium text-text-main-light mb-2"> Descripción </label>
							<textarea
								v-model="listForm.description"
								rows="2"
								class="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light resize-none"
								placeholder="Descripción de la lista..."></textarea>
						</div>
					</div>

					<div class="border-t border-gray-100 pt-6">
						<h3 class="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
							Añadir Componentes
						</h3>

						<!-- Project Selection -->
						<div class="mb-4">
							<label class="block text-xs font-medium text-gray-500 mb-2 uppercase">Desde Proyecto</label>
							<select
								v-model="selectedProjectId"
								@change="loadProjectItems"
								class="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none">
								<option value="">Seleccionar proyecto...</option>
								<option v-for="proj in projects" :key="proj.id" :value="proj.id">
									{{ proj.name }}
								</option>
							</select>

							<!-- Project Items List -->
							<div v-if="projectItemsResults.length > 0" class="mt-3 space-y-2">
								<div class="flex items-center justify-between mb-1">
									<span class="text-[10px] font-bold text-gray-400 uppercase"
										>Items del Proyecto</span
									>
									<button
										@click="addAllProjectItems"
										class="text-[10px] text-primary font-bold hover:underline">
										Añadir Todos
									</button>
								</div>
								<div class="max-h-48 overflow-y-auto space-y-1 pr-1">
									<div
										v-for="item in projectItemsResults"
										:key="item.id"
										class="p-2 border border-gray-50 bg-white rounded-lg flex items-center justify-between group hover:border-primary transition-colors">
										<div class="min-w-0">
											<p class="text-[10px] font-medium text-gray-900 truncate">
												{{ item.name }}
											</p>
										</div>
										<button
											@click="addItemToList(item)"
											class="p-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
											<PlusIcon class="w-3 h-3" />
										</button>
									</div>
								</div>
							</div>
						</div>

						<!-- Search Inventory -->
						<div>
							<label class="block text-xs font-medium text-gray-500 mb-2 uppercase"
								>Buscar en Inventario</label
							>
							<div class="relative mb-3">
								<MagnifyingGlassIcon
									class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
								<input
									v-model="inventorySearchQuery"
									type="text"
									placeholder="Buscar componentes..."
									class="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none" />
							</div>

							<!-- Search Results -->
							<div v-if="searchResults.length > 0" class="space-y-2 max-h-64 overflow-y-auto pr-1">
								<div
									v-for="item in searchResults"
									:key="item.id"
									class="p-2 border border-gray-100 bg-white rounded-lg flex items-center justify-between group hover:border-primary transition-colors">
									<div class="min-w-0">
										<p class="text-xs font-medium text-gray-900 truncate">{{ item.name }}</p>
										<p class="text-[10px] text-gray-500">
											{{ item.lcsc_part || item.part_number || "N/A" }}
										</p>
									</div>
									<button
										@click="addItemToList(item)"
										class="p-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
										<PlusIcon class="w-4 h-4" />
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Right Panel: Items List (The scrollable part) -->
				<div class="flex-1 flex flex-col">
					<div class="flex items-center justify-between p-6 border-b border-gray-100">
						<div>
							<h3 class="text-lg font-medium text-text-main-light">Componentes en la Lista</h3>
							<p class="text-sm text-text-muted-light">
								{{ listForm.items.length }} componentes seleccionados
							</p>
						</div>
						<div class="flex gap-2">
							<button
								v-if="listForm.items.length"
								@click="sortItemsByName"
								class="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors flex items-center gap-1">
								<ArrowsUpDownIcon class="w-3 h-3" />
								A-Z
							</button>
							<button
								v-if="listForm.items.length"
								@click="listForm.items = []"
								class="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors">
								Limpiar todo
							</button>
						</div>
					</div>

					<!-- Items Table Container (Scrollable) -->
					<div class="flex-1 overflow-y-auto p-6 pt-0">
						<div
							v-if="listForm.items.length === 0"
							class="flex flex-col items-center justify-center h-full text-text-muted-light py-20">
							<div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
								<ClipboardDocumentListIcon class="w-8 h-8 text-gray-300" />
							</div>
							<p>No hay componentes en esta lista</p>
							<p class="text-sm">Agrega componentes desde el panel izquierdo o desde el inventario.</p>
						</div>

						<div v-else class="mt-4">
							<table class="w-full">
								<thead class="sticky top-0 bg-white z-10">
									<tr class="text-left border-b border-gray-100">
										<th class="pb-3 text-xs font-semibold text-gray-400 uppercase">Componente</th>
										<th class="pb-3 text-xs font-semibold text-gray-400 uppercase text-center w-24">
											Cantidad
										</th>
										<th class="pb-3 text-xs font-semibold text-gray-400 uppercase w-20 text-center">
											Unidad
										</th>
										<th class="pb-3 text-xs font-semibold text-gray-400 uppercase w-12"></th>
									</tr>
								</thead>
								<tbody class="divide-y divide-gray-50">
									<tr v-for="(item, index) in listForm.items" :key="item.id || index" class="group">
										<td class="py-4">
											<p class="font-medium text-sm text-gray-900">{{ item.name }}</p>
											<p class="text-xs text-gray-500">
												{{ item.lcsc_part || item.part_number || "N/A" }}
											</p>
										</td>
										<td class="py-4 text-center">
											<div class="flex items-center justify-center gap-2">
												<button
													@click="item.quantity = Math.max(1, item.quantity - 1)"
													class="p-1 hover:bg-gray-100 rounded">
													-
												</button>
												<input
													v-model.number="item.quantity"
													type="number"
													min="1"
													class="w-12 text-center py-1 bg-gray-50 border border-transparent rounded focus:border-primary focus:bg-white text-sm outline-none" />
												<button @click="item.quantity++" class="p-1 hover:bg-gray-100 rounded">
													+
												</button>
											</div>
										</td>
										<td class="py-4 text-center text-sm text-gray-500">
											{{ item.unit || "pcs" }}
										</td>
										<td class="py-4 text-right">
											<button
												@click="removeItem(index)"
												class="p-1.5 text-gray-300 hover:text-red-500 transition-colors">
												<TrashIcon class="w-4 h-4" />
											</button>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>

					<!-- Footer -->
					<div class="p-6 border-t border-gray-100 bg-gray-50/30 flex gap-3">
						<button
							@click="closeModal"
							class="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors">
							Cancelar
						</button>
						<button
							@click="saveList"
							class="flex-1 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-semibold shadow-sm shadow-primary/20">
							{{ editingList ? "Guardar Cambios" : "Guardar Lista" }}
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.bg-card-light {
	background-color: #ffffff;
}

.bg-primary {
	background-color: #10b981;
}

/* Custom scrollbar for better appearance */
::-webkit-scrollbar {
	width: 6px;
}

::-webkit-scrollbar-track {
	background: transparent;
}

::-webkit-scrollbar-thumb {
	background: #e5e7eb;
	border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
	background: #d1d5db;
}
</style>
// ... rest of existing styles if any ...
