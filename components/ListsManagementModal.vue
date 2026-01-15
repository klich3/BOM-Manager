<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { XMarkIcon, CheckIcon, ArrowDownTrayIcon } from "@heroicons/vue/24/outline";
import { useDatabase } from "@/composables/useDatabase";
import { useExport } from "@/composables/useExport";
import { useNotifications } from "@/composables/useNotifications";
import { useI18n } from "@/composables/useI18n";

// Definir los eventos que emite este componente
const emit = defineEmits<{
	close: [];
	"merge-lists": [listIds: string[], newListName: string];
	"create-group": [items: any[], newListName: string];
}>();

const db = useDatabase();
const { exportShoppingList: exportShoppingListUtil } = useExport();
const { success: notifySuccess, error: notifyError } = useNotifications();
const { t } = useI18n();

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
const activeTab = ref<"merge" | "group" | "check">("merge");
const selectedListsForMerge = ref<string[]>([]);
const mergeListName = ref("");

const selectedItemsForGrouping = ref<ComponentItem[]>([]);
const groupListName = ref("");

const selectedListsForCheck = ref<string[]>([]);
const allInventoryItems = ref<any[]>([]);

const loadInventory = async () => {
	try {
		allInventoryItems.value = await db.getAllItems();
	} catch (error) {
		console.error("Error cargando inventario para comprobación:", error);
	}
};

onMounted(() => {
	loadInventory();
});

// Computed para el informe de stock
const stockReport = computed(() => {
	if (selectedListsForCheck.value.length === 0) return [];

	const totals: Record<string, any> = {};

	// Sumar items de las listas seleccionadas
	selectedListsForCheck.value.forEach((listId: string) => {
		const list = props.lists.find((l: List) => l.id === listId);
		if (list) {
			list.items.forEach((item: ComponentItem) => {
				if (!totals[item.id]) {
					const invItem = allInventoryItems.value.find((i: any) => i.id === item.id);
					totals[item.id] = {
						id: item.id,
						name: item.name,
						part_number: item.part_number,
						lcsc_part: item.lcsc_part,
						needed: 0,
						inStock: invItem ? invItem.in_stock || 0 : 0,
					};
				}
				totals[item.id].needed += item.quantity;
			});
		}
	});

	return Object.values(totals).sort((a, b) => {
		// Poner los que faltan arriba
		const missingA = a.needed > a.inStock;
		const missingB = b.needed > b.inStock;
		if (missingA && !missingB) return -1;
		if (!missingA && missingB) return 1;
		return a.name.localeCompare(b.name);
	});
});

const missingItems = computed(() => {
	return stockReport.value.filter((item: any) => item.needed > item.inStock);
});

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

// Funciones para Comprobación de Stock
const toggleListSelectionForCheck = (id: string) => {
	const index = selectedListsForCheck.value.indexOf(id);
	if (index === -1) {
		selectedListsForCheck.value.push(id);
	} else {
		selectedListsForCheck.value.splice(index, 1);
	}
};

const exportShoppingList = () => {
	if (missingItems.value.length === 0) return;

	try {
		const itemsToOrder = missingItems.value.map((item: any) => ({
			name: item.name,
			partNumber: item.part_number,
			lcscPart: item.lcsc_part,
			needed: item.needed,
			available: item.inStock,
			toOrder: item.needed - item.inStock,
		}));

		const csv = exportShoppingListUtil(itemsToOrder);
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
		const link = document.createElement("a");
		const url = URL.createObjectURL(blob);
		link.setAttribute("href", url);
		link.setAttribute("download", `lista_de_compra_${new Date().toISOString().split("T")[0]}.csv`);
		link.style.visibility = "hidden";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		notifySuccess(t("global.success"), t("lists_mgmt.success_export"));
	} catch (error) {
		console.error("Error al exportar lista de compra:", error);
		notifyError(t("global.error"), t("lists_mgmt.error_export"));
	}
};
</script>

<template>
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
		<div class="bg-card-light rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
			<div class="flex items-center justify-between p-6 border-b border-gray-100">
				<h2 class="text-xl font-semibold text-text-main-light">{{ t("lists_mgmt.title") }}</h2>
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
						{{ t("lists_mgmt.tab_merge") }}
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
						{{ t("lists_mgmt.tab_group") }}
						<div
							v-if="activeTab === 'group'"
							class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
					</button>
					<button
						@click="activeTab = 'check'"
						:class="[
							'pb-2 px-1 text-sm font-medium transition-colors relative',
							activeTab === 'check' ? 'text-primary' : 'text-text-muted-light hover:text-text-main-light',
						]">
						{{ t("lists_mgmt.tab_check") }}
						<div
							v-if="activeTab === 'check'"
							class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
					</button>
				</div>

				<!-- Merge Lists Section -->
				<div v-if="activeTab === 'merge'" class="space-y-6">
					<div>
						<h3 class="text-lg font-medium text-text-main-light mb-4">
							{{ t("lists_mgmt.select_to_combine") }}
						</h3>
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
							{{ t("lists_mgmt.no_saved_lists") }}
						</div>
					</div>

					<div class="flex flex-col gap-4 p-4 bg-gray-50 rounded-xl">
						<label class="text-sm font-medium text-text-main-light">{{
							t("lists_mgmt.new_list_name")
						}}</label>
						<div class="flex gap-3">
							<input
								v-model="mergeListName"
								type="text"
								:placeholder="t('placeholder_merge_list')"
								class="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light" />
							<button
								@click="mergeSelectedLists"
								:disabled="selectedListsForMerge.length < 2 || !mergeListName.trim()"
								class="px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
								{{ t("lists_mgmt.merge_button") }}
							</button>
						</div>
					</div>
				</div>

				<!-- Group Items Section -->
				<div v-if="activeTab === 'group'" class="space-y-6">
					<div>
						<h3 class="text-lg font-medium text-text-main-light mb-4">
							{{ t("lists_mgmt.select_to_group") }}
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
										{{ t("lists_mgmt.select_all") }}
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
							{{ t("lists_mgmt.no_saved_lists") }}
						</div>
					</div>

					<div class="flex flex-col gap-4 p-4 bg-gray-50 rounded-xl">
						<div class="flex justify-between items-center">
							<label class="text-sm font-medium text-text-main-light">{{
								t("lists_mgmt.group_name_label")
							}}</label>
							<span class="text-xs font-medium text-primary">{{
								t("lists_mgmt.items_selected", { count: selectedItemsForGrouping.length })
							}}</span>
						</div>
						<div class="flex gap-3">
							<input
								v-model="groupListName"
								type="text"
								:placeholder="t('placeholder_group_name')"
								class="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light" />
							<button
								@click="createGroupFromSelected"
								:disabled="selectedItemsForGrouping.length === 0 || !groupListName.trim()"
								class="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
								{{ t("lists_mgmt.create_group_button") }}
							</button>
						</div>
					</div>
				</div>

				<!-- Check Stock Section -->
				<div v-if="activeTab === 'check'" class="space-y-6">
					<div>
						<h3 class="text-lg font-medium text-text-main-light mb-4">
							{{ t("lists_mgmt.select_to_check") }}
						</h3>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
							<div
								v-for="list in lists"
								:key="'check-' + list.id"
								@click="toggleListSelectionForCheck(list.id)"
								:class="[
									'p-4 rounded-xl border-2 transition-all cursor-pointer',
									selectedListsForCheck.includes(list.id)
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
											selectedListsForCheck.includes(list.id)
												? 'border-primary bg-primary text-white'
												: 'border-gray-300',
										]">
										<CheckIcon v-if="selectedListsForCheck.includes(list.id)" class="w-3 h-3" />
									</div>
								</div>
							</div>
						</div>

						<!-- Stock Report Table -->
						<div v-if="stockReport.length > 0" class="border border-gray-100 rounded-2xl overflow-hidden">
							<div
								class="bg-gray-50 px-6 py-3 border-b border-gray-100 flex justify-between items-center">
								<h4 class="font-semibold text-text-main-light">
									{{ t("lists_mgmt.availability_report") }}
								</h4>
								<button
									@click="exportShoppingList"
									v-if="missingItems.length > 0"
									class="text-xs bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg font-bold hover:bg-amber-200 transition-colors flex items-center gap-1">
									<ArrowDownTrayIcon class="w-3.5 h-3.5" />
									{{ t("lists_mgmt.export_shopping_list") }}
								</button>
							</div>
							<div class="max-h-96 overflow-y-auto">
								<table class="w-full text-sm">
									<thead class="bg-gray-50/50 text-left sticky top-0 z-10 backdrop-blur-sm">
										<tr>
											<th class="px-6 py-3 font-medium text-text-muted-light">
												{{ t("lists_mgmt.component") }}
											</th>
											<th class="px-6 py-3 font-medium text-text-muted-light text-center">
												{{ t("lists_mgmt.required") }}
											</th>
											<th class="px-6 py-3 font-medium text-text-muted-light text-center">
												{{ t("lists_mgmt.current_stock") }}
											</th>
											<th class="px-6 py-3 font-medium text-text-muted-light text-center">
												{{ t("lists_mgmt.status") }}
											</th>
										</tr>
									</thead>
									<tbody class="divide-y divide-gray-100">
										<tr v-for="item in stockReport" :key="item.id">
											<td class="px-6 py-4">
												<p class="font-medium text-text-main-light">{{ item.name }}</p>
												<p class="text-[10px] text-text-muted-light">
													{{ item.lcsc_part || item.part_number || "N/A" }}
												</p>
											</td>
											<td class="px-6 py-4 text-center">{{ item.needed }}</td>
											<td class="px-6 py-4 text-center">{{ item.inStock }}</td>
											<td class="px-6 py-4 text-center">
												<span
													v-if="item.inStock >= item.needed"
													class="px-2 py-0.5 bg-green-100 text-green-600 text-[10px] font-bold rounded-full">
													{{ t("lists_mgmt.sufficient") }}
												</span>
												<span
													v-else
													class="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full">
													{{ t("lists_mgmt.missing", { count: item.needed - item.inStock }) }}
												</span>
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>

						<div
							v-if="lists.length === 0"
							class="text-center py-8 text-text-muted-light bg-gray-50 rounded-xl">
							{{ t("lists_mgmt.no_saved_lists") }}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
