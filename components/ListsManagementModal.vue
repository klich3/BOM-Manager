<template>
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
		<div class="bg-card-light rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
			<div class="flex items-center justify-between p-6 border-b border-gray-100">
				<h2 class="text-xl font-semibold text-text-main-light">Gestión de Listas</h2>
				<button @click="$emit('close')" class="p-1 hover:bg-gray-100 rounded-lg transition-colors">
					<XMarkIcon class="w-6 h-6 text-text-muted-light" />
				</button>
			</div>

			<div class="flex-1 overflow-y-auto p-6">
				<!-- Tabs -->
				<div class="flex gap-4 mb-6 border-b border-gray-100">
					<button
						@click="activeTab = 'merge'"
						:class="[
							'pb-2 px-1 text-sm font-medium transition-colors relative',
							activeTab === 'merge' ? 'text-primary' : 'text-text-muted-light hover:text-text-main-light',
						]">
						Mezclar Listas
						<div
							v-if="activeTab === 'merge'"
							class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
					</button>
					<button
						@click="activeTab = 'group'"
						:class="[
							'pb-2 px-1 text-sm font-medium transition-colors relative',
							activeTab === 'group' ? 'text-primary' : 'text-text-muted-light hover:text-text-main-light',
						]">
						Agrupar Items
						<div
							v-if="activeTab === 'group'"
							class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
					</button>
				</div>

				<!-- Merge Lists Section -->
				<div v-if="activeTab === 'merge'" class="space-y-6">
					<div>
						<h3 class="text-lg font-medium text-text-main-light mb-4">Selecciona listas para combinar</h3>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div
								v-for="list in lists"
								:key="list.id"
								@click="toggleListSelectionForMerge(list.id)"
								:class="[
									'p-4 rounded-xl border-2 transition-all cursor-pointer',
									selectedListsForMerge.includes(list.id)
										? 'border-primary bg-primary/5'
										: 'border-gray-100 hover:border-gray-200',
								]">
								<div class="flex items-center justify-between">
									<div>
										<p class="font-medium text-text-main-light">{{ list.name }}</p>
										<p class="text-sm text-text-muted-light">{{ list.items.length }} items</p>
									</div>
									<div
										:class="[
											'w-5 h-5 rounded-full border-2 flex items-center justify-center',
											selectedListsForMerge.includes(list.id)
												? 'border-primary bg-primary text-white'
												: 'border-gray-300',
										]">
										<CheckIcon v-if="selectedListsForMerge.includes(list.id)" class="w-3 h-3" />
									</div>
								</div>
							</div>
						</div>
						<div
							v-if="lists.length === 0"
							class="text-center py-8 text-text-muted-light bg-gray-50 rounded-xl">
							No hay listas guardadas
						</div>
					</div>

					<div class="flex flex-col gap-4 p-4 bg-gray-50 rounded-xl">
						<label class="text-sm font-medium text-text-main-light"
							>Nombre de la nueva lista combinada</label
						>
						<div class="flex gap-3">
							<input
								v-model="mergeListName"
								type="text"
								placeholder="Ej: Kit Total Proyecto X"
								class="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light" />
							<button
								@click="mergeSelectedLists"
								:disabled="selectedListsForMerge.length < 2 || !mergeListName.trim()"
								class="px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
								Mezclar
							</button>
						</div>
					</div>
				</div>

				<!-- Group Items Section -->
				<div v-if="activeTab === 'group'" class="space-y-6">
					<div>
						<h3 class="text-lg font-medium text-text-main-light mb-4">
							Selecciona items de tus listas para agrupar
						</h3>
						<div class="space-y-4">
							<div
								v-for="list in lists"
								:key="'group-' + list.id"
								class="border border-gray-100 rounded-xl overflow-hidden">
								<div
									class="bg-gray-50 px-4 py-2 flex items-center justify-between border-b border-gray-100">
									<span class="font-medium text-text-main-light">{{ list.name }}</span>
									<button
										@click="selectAllFromList(list)"
										class="text-xs text-primary font-medium hover:underline">
										Seleccionar todos
									</button>
								</div>
								<div class="divide-y divide-gray-100 max-h-48 overflow-y-auto">
									<div
										v-for="item in list.items"
										:key="item.id"
										class="px-4 py-2 flex items-center gap-3 hover:bg-gray-50 transition-colors">
										<input
											type="checkbox"
											:id="'item-' + item.id"
											:checked="isItemSelectedForGrouping(item.id)"
											@change="toggleItemSelectionForGrouping(item)"
											class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
										<label
											:for="'item-' + item.id"
											class="flex-1 flex justify-between items-center cursor-pointer">
											<span class="text-sm text-text-main-light">{{ item.name }}</span>
											<span class="text-xs text-text-muted-light"
												>{{ item.quantity }} {{ item.unit }}</span
											>
										</label>
									</div>
								</div>
							</div>
						</div>
						<div
							v-if="lists.length === 0"
							class="text-center py-8 text-text-muted-light bg-gray-50 rounded-xl">
							No hay listas disponibles para agrupar items
						</div>
					</div>

					<div class="flex flex-col gap-4 p-4 bg-gray-50 rounded-xl">
						<div class="flex justify-between items-center">
							<label class="text-sm font-medium text-text-main-light">Nombre del nuevo grupo/lista</label>
							<span class="text-xs font-medium text-primary"
								>{{ selectedItemsForGrouping.length }} items seleccionados</span
							>
						</div>
						<div class="flex gap-3">
							<input
								v-model="groupListName"
								type="text"
								placeholder="Ej: Grupo de Resistencias"
								class="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light" />
							<button
								@click="createGroupFromSelected"
								:disabled="selectedItemsForGrouping.length === 0 || !groupListName.trim()"
								class="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
								Crear Grupo
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { XMarkIcon, CheckIcon } from "@heroicons/vue/24/outline";

// Definir los eventos que emite este componente
const emit = defineEmits<{
	close: [];
	"merge-lists": [listIds: string[], newListName: string];
	"create-group": [items: any[], newListName: string];
}>();

// Definir las props
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
	items: ComponentItem[];
}

interface Props {
	show?: boolean;
	lists?: List[];
}
const props = withDefaults(defineProps<Props>(), {
	show: false,
	lists: () => [],
});

// Estados locales
const activeTab = ref<"merge" | "group">("merge");
const selectedListsForMerge = ref<string[]>([]);
const mergeListName = ref("");

const selectedItemsForGrouping = ref<ComponentItem[]>([]);
const groupListName = ref("");

// Funciones para Mezcla
const toggleListSelectionForMerge = (id: string) => {
	const index = selectedListsForMerge.value.indexOf(id);
	if (index === -1) {
		selectedListsForMerge.value.push(id);
	} else {
		selectedListsForMerge.value.splice(index, 1);
	}
};

const mergeSelectedLists = () => {
	if (selectedListsForMerge.value.length >= 2 && mergeListName.value.trim()) {
		emit("merge-lists", selectedListsForMerge.value, mergeListName.value.trim());
		// Resetear valores después de emitir
		selectedListsForMerge.value = [];
		mergeListName.value = "";
	}
};

// Funciones para Agrupación
const isItemSelectedForGrouping = (id: string) => {
	return selectedItemsForGrouping.value.some((item: ComponentItem) => item.id === id);
};

const toggleItemSelectionForGrouping = (item: ComponentItem) => {
	const index = selectedItemsForGrouping.value.findIndex((i: ComponentItem) => i.id === item.id);
	if (index === -1) {
		selectedItemsForGrouping.value.push({ ...item });
	} else {
		selectedItemsForGrouping.value.splice(index, 1);
	}
};

const selectAllFromList = (list: List) => {
	list.items.forEach((item) => {
		if (!isItemSelectedForGrouping(item.id)) {
			selectedItemsForGrouping.value.push({ ...item });
		}
	});
};

const createGroupFromSelected = () => {
	if (selectedItemsForGrouping.value.length > 0 && groupListName.value.trim()) {
		// Emitir evento para crear grupo (que es básicamente una nueva lista)
		// Podemos reutilizar la lógica de creación de listas en el componente padre
		emit("create-group", selectedItemsForGrouping.value, groupListName.value.trim());

		// Resetear
		selectedItemsForGrouping.value = [];
		groupListName.value = "";
	}
};
</script>
