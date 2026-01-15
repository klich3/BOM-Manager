<template>
	<!-- Main Content -->
	<main class="min-h-screen">
		<!-- Header -->
		<header class="h-20 px-8 flex items-center justify-between bg-background-light border-b border-gray-200">
			<div>
				<h1 class="text-2xl font-semibold text-text-main-light">{{ t("component_inventory") }}</h1>
			</div>
			<div class="flex items-center gap-4">
				<button
					@click="updateLcscPrices"
					:disabled="isUpdatingPrices"
					class="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-amber-700 disabled:bg-gray-400 transition-colors">
					<ArrowPathIcon v-if="!isUpdatingPrices" class="w-5 h-5" />
					<div
						v-else
						class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
					<span>{{ isUpdatingPrices ? t("updating") : t("update_lcsc_prices") }}</span>
				</button>
				<button
					@click="showImportModal = true"
					class="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors">
					<DocumentArrowUpIcon class="w-5 h-5" />
					<span>{{ t("import") }}</span>
				</button>
				<button
					@click="createListFromSelection"
					class="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-purple-700 transition-colors">
					<ClipboardDocumentListIcon class="w-5 h-5" />
					<span>{{ t("create_list") }}</span>
				</button>
				<button
					@click="exportInventory"
					class="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
					<DocumentArrowDownIcon class="w-5 h-5" />
					<span>{{ t("export") }}</span>
				</button>
				<button
					@click="showAddModal = true"
					class="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors">
					<PlusIcon class="w-5 h-5" />
					<span>{{ t("add_item") }}</span>
				</button>
			</div>
		</header>

		<!-- Inventory Content -->
		<div class="p-8 pt-4">
			<!-- Stats Row -->
			<div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
				<div class="bg-card-light rounded-2xl p-4 shadow-sm">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
							<CubeIcon class="w-5 h-5 text-blue-600" />
						</div>
						<div>
							<p class="text-xs text-text-muted-light">{{ t("total_items") }}</p>
							<p class="text-2xl font-bold text-text-main-light">
								{{ filteredItems.length }}
							</p>
						</div>
					</div>
				</div>

				<div class="bg-card-light rounded-2xl p-4 shadow-sm">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
							<CheckCircleIcon class="w-5 h-5 text-green-600" />
						</div>
						<div>
							<p class="text-xs text-text-muted-light">{{ t("stock_ok") }}</p>
							<p class="text-2xl font-bold text-text-main-light">
								{{ stockOK }}
							</p>
						</div>
					</div>
				</div>

				<div class="bg-card-light rounded-2xl p-4 shadow-sm border border-amber-200">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
							<ExclamationTriangleIcon class="w-5 h-5 text-amber-600" />
						</div>
						<div>
							<p class="text-xs text-text-muted-light">{{ t("low_stock") }}</p>
							<p class="text-2xl font-bold text-amber-600">
								{{ lowStockCount }}
							</p>
						</div>
					</div>
				</div>

				<div class="bg-card-light rounded-2xl p-4 shadow-sm">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
							<CurrencyDollarIcon class="w-5 h-5 text-purple-600" />
						</div>
						<div>
							<p class="text-xs text-text-muted-light">{{ t("total_value") }}</p>
							<p class="text-2xl font-bold text-text-main-light">${{ totalValue }}</p>
						</div>
					</div>
				</div>
			</div>

			<!-- List Management Section -->
			<div class="bg-card-light rounded-2xl p-6 shadow-sm mb-6">
				<div class="flex justify-between items-center mb-4">
					<h3 class="text-lg font-semibold text-text-main-light">{{ t("list_management") }}</h3>
					<button
						@click="showListsManagement = true"
						class="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
						{{ t("manage_lists") }}
					</button>
				</div>
				<p class="text-text-muted-light text-sm">{{ t("saved_lists_count", { count: lists.listCount.value }) }}</p>
			</div>

			<!-- Search and Filters -->
			<div class="bg-card-light rounded-2xl p-6 shadow-sm mb-6">
				<div class="flex flex-col md:flex-row gap-4">
					<div class="flex-1 relative">
						<MagnifyingGlassIcon
							class="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
						<input
							v-model="searchQuery"
							type="text"
							:placeholder="t('search')"
							class="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light" />
					</div>

					<!-- List Selector -->
					<select
						v-model="selectedListId"
						class="px-4 py-2 bg-purple-50 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-purple-700 font-medium">
						<option value="">{{ t("global_inventory") }}</option>
						<optgroup :label="t('my_saved_lists')">
							<option v-for="list in lists.lists.value" :key="list.id" :value="list.id">
								{{ list.name }}
							</option>
						</optgroup>
					</select>

					<select
						v-model="filterCategory"
						class="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light">
						<option value="">{{ t("all_categories") }}</option>
						<option v-for="cat in categories" :key="cat" :value="cat">
							{{ cat }}
						</option>
					</select>
					<select
						v-model="filterStock"
						class="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light">
						<option value="all">{{ t("all") }}</option>
						<option value="ok">{{ t("stock_ok") }}</option>
						<option value="low">{{ t("low_stock") }}</option>
					</select>
				</div>
			</div>

			<!-- Items Table -->
			<InventoryTable
				ref="inventoryTableRef"
				:items="paginatedItems"
				@edit-item="editItem"
				@delete-item="deleteItemConfirm"
				@delete-selected-items="deleteSelectedItemsConfirm"
				@open-lcsc-preview="openLcscPreview"
				@open-lcsc-purchase="openLcscPurchase"
				@add-first-item="showAddModal = true"
				@items-assigned-to-project="loadItems" />

			<!-- Pagination -->
			<div v-if="totalPages > 1" class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
				<p class="text-sm text-text-muted-light">
					{{ t("showing") }} {{ (currentPage - 1) * itemsPerPage + 1 }} {{ t("to") }}
					{{ Math.min(currentPage * itemsPerPage, filteredItems.length) }}
					{{ t("of") }} {{ filteredItems.length }} items
				</p>
				<div class="flex gap-2">
					<button
						@click="currentPage--"
						:disabled="currentPage === 1"
						class="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors">
						{{ t("previous") }}
					</button>
					<button
						@click="currentPage++"
						:disabled="currentPage === totalPages"
						class="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors">
						{{ t("next") }}
					</button>
				</div>
			</div>
		</div>
	</main>

	<!-- LCSC Preview Modal -->
	<LCSCPreview
		:show="showLCSCPreview"
		:partNumber="lcscPartNumber"
		:itemId="lcscItemId"
		@close="showLCSCPreview = false" />

	<!-- Add/Edit Item Modal -->
	<AddItemToInventoryModal
		:show="showAddModal"
		:editing-item="editingItem"
		@close="closeItemModal"
		@save="handleSaveItem" />

	<!-- Import Modal -->
	<ImportModal
		v-if="showImportModal"
		@close="showImportModal = false"
		@file-selected="handleFileImport"
		@error="handleImportError"
		@import-completed="handleImportCompleted" />

	<!-- List Manager Modal -->
	<ListManager v-if="showListManager" v-model="showListManager" :items="selectedItemsForList" @saved="saveList" />

	<!-- Lists Management Modal -->
	<ListsManagementModal
		v-if="showListsManagement"
		:lists="lists.lists.value"
		@close="showListsManagement = false"
		@merge-lists="handleMergeLists"
		@create-group="handleCreateGroup" />

	<!-- Toast Notification -->
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useDialog } from "@/composables/useDialog";
import { useI18n } from "@/composables/useI18n";
import {
	CpuChipIcon,
	Squares2X2Icon,
	CubeIcon,
	RectangleStackIcon,
	Cog6ToothIcon,
	UserIcon,
	DocumentArrowUpIcon,
	DocumentArrowDownIcon,
	PlusIcon,
	CheckCircleIcon,
	ExclamationTriangleIcon,
	CurrencyDollarIcon,
	MagnifyingGlassIcon,
	PencilIcon,
	TrashIcon,
	XMarkIcon,
	ClipboardDocumentListIcon,
	GlobeAltIcon,
	ArrowPathIcon,
} from "@heroicons/vue/24/outline";
import { useDatabase } from "@/composables/useDatabase";
import { useExport } from "@/composables/useExport";
import { useExternalLink } from "@/composables/useExternalLink";
import { useFileParser } from "@/composables/useFileParser";
import { useLists } from "@/composables/useLists";
import { useLCSC } from "@/composables/useLCSC";
import { useNotifications } from "@/composables/useNotifications";
import FileUpload from "@/components/FileUpload.vue";
import ListManager from "@/components/ListManager.vue";
import LCSCPreview from "@/components/LCSCPreview.vue";
import AddItemToInventoryModal from "@/components/AddItemToInventoryModal.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import ImportModal from "@/components/ImportModal.vue";
import ListsManagementModal from "@/components/ListsManagementModal.vue";
import InventoryTable from "@/components/inventory/InventoryTable.vue";

const db = useDatabase();
const { t } = useI18n();
const { exportAllInventory } = useExport();
const { parseFile } = useFileParser();
const lists = useLists();
const { showConfirmation } = useDialog();
const { massUpdatePrices } = useLCSC();
const { success: notifySuccess, error: notifyError, warning: notifyWarning, info: notifyInfo } = useNotifications();

// State
const items = ref<any[]>([]);
const inventoryTableRef = ref<any>(null);
const searchQuery = ref("");
const filterCategory = ref("");
const filterStock = ref("all");
const selectedListId = ref("");
const currentPage = ref(1);
const itemsPerPage = 100; //TODO: hacer un selector para que user pueda poner cantidad por pagina
const showAddModal = ref(false);
const showImportModal = ref(false);
const showListManager = ref(false);
const selectedItemsForList = ref<any[]>([]);
const showListsManagement = ref(false);
const isUpdatingPrices = ref(false);
const selectedListsForMerge = ref<string[]>([]);
const mergeListName = ref("");
const editingItem = ref<any>(null);

// Item form state for add/edit modal
const itemForm = ref({
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

// LCSC Preview State
const showLCSCPreview = ref(false);
const lcscPartNumber = ref<string>("");
const lcscItemId = ref<string>("");

// Toast State - Eliminated
// const showToast = ref(false);
// const toastMessage = ref("");
// const toastType = ref<"success" | "error" | "warning" | "info">("info");

// Computed
const categories = computed(() => {
	const cats = new Set(items.value.map((item) => item.category).filter(Boolean));
	return Array.from(cats);
});

const filteredItems = computed(() => {
	let filtered = items.value;

	// Filter by selected list
	if (selectedListId.value) {
		const selectedList = lists.getListById(selectedListId.value);
		if (selectedList) {
			const listItemIds = selectedList.items.map((i: any) => i.id);
			filtered = filtered.filter((item) => listItemIds.includes(item.id));
		}
	}

	// Search filter
	if (searchQuery.value) {
		const query = searchQuery.value.toLowerCase().trim();
		if (query) {
			// Dividir la consulta en palabras individuales
			const searchTerms = query.split(/\s+/).filter((term) => term.length > 0);

			filtered = filtered.filter((item) => {
				// Verificar si todas las palabras de búsqueda coinciden en algún campo
				return searchTerms.every(
					(term) =>
						item.name?.toLowerCase().includes(term) ||
						item.description?.toLowerCase().includes(term) ||
						item.category?.toLowerCase().includes(term) ||
						item.supplier?.toLowerCase().includes(term) ||
						item.part_number?.toLowerCase().includes(term) ||
						item.lcsc_part?.toLowerCase().includes(term) ||
						item.notes?.toLowerCase().includes(term),
				);
			});
		}
	}

	// Category filter
	if (filterCategory.value) {
		filtered = filtered.filter((item) => item.category === filterCategory.value);
	}

	// Stock filter
	if (filterStock.value === "low") {
		filtered = filtered.filter((item) => item.in_stock < (item.min_stock || 0));
	} else if (filterStock.value === "ok") {
		filtered = filtered.filter((item) => item.in_stock >= (item.min_stock || 0));
	}

	return filtered;
});

const paginatedItems = computed(() => {
	const start = (currentPage.value - 1) * itemsPerPage;
	const end = start + itemsPerPage;
	return filteredItems.value.slice(start, end);
});

const totalPages = computed(() => {
	return Math.ceil(filteredItems.value.length / itemsPerPage);
});

const stockOK = computed(() => {
	return items.value.filter((item) => item.in_stock >= (item.min_stock || 0)).length;
});

const lowStockCount = computed(() => {
	return items.value.filter((item) => item.in_stock < (item.min_stock || 0)).length;
});

const totalValue = computed(() => {
	//TOOD: en settings poenr el decimal
	return items.value
		.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0)
		.toLocaleString("es-ES", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		});
});

// Methods
const loadItems = async () => {
	try {
		items.value = await db.getAllItems();
	} catch (error) {
		console.error("Error cargando items:", error);
	}
};

const editItem = (item: any) => {
	editingItem.value = item;
	itemForm.value = {
		name: item.name,
		description: item.description || "",
		quantity: item.quantity || 0,
		unit: item.unit || "pcs",
		category: item.category || "",
		supplier: item.supplier || "",
		partNumber: item.part_number || "",
		lcscPart: item.lcsc_part || "",
		price: item.price || 0,
		inStock: item.in_stock || 0,
		minStock: item.min_stock || 0,
		notes: item.notes || "",
	};
	showAddModal.value = true;
};

const deleteItemConfirm = async (id: string) => {
	const confirmed = await showConfirmation(
		t("inventory_mgmt.delete_item_title"),
		t("inventory_mgmt.delete_item_desc"),
	);

	if (confirmed) {
		try {
			await db.deleteItem(id);
			await loadItems();
			notifySuccess(t("global.success"), t("inventory_mgmt.delete_success"));
		} catch (error) {
			console.error("Error eliminando componente:", error);
			notifyError(t("global.error"), t("inventory_mgmt.delete_error"));
		}
	}
};

const exportInventory = () => {
	exportAllInventory("xlsx");
};

const closeItemModal = () => {
	showAddModal.value = false;
	editingItem.value = null;
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
};

const handleSaveItem = async (itemData: any) => {
	try {
		if (editingItem.value) {
			await db.updateItem(editingItem.value.id, itemData);
		} else {
			await db.createItem(itemData);
		}

		await loadItems();
		closeItemModal();
	} catch (error) {
		console.error("Error guardando item:", error);
	}
};

const handleFileImport = async (file: File) => {
	try {
		// Parsear archivo
		const result = await parseFile(file);

		if (result.success && result.items.length > 0) {
			// Guardar items en la base de datos
			for (const item of result.items) {
				await db.createItem(item);
			}

			await loadItems();
			showImportModal.value = false;
			notifySuccess(t("import_modal.title"), t("import_modal.success_message", { count: result.items.length }));
		} else {
			notifyError(t("global.error"), result.errors.join(", "));
		}
	} catch (error) {
		console.error("Error importando archivo:", error);
		notifyError(t("global.error"), t("import_modal.error_parsing"));
	}
};

const handleImportCompleted = async (data: {
	importedCount: number;
	errors: string[];
	destination: "global" | "project";
	projectId?: string;
}) => {
	// Actualizar items solo si la importación fue al inventario global
	if (data.destination === "global") {
		await loadItems();
		// Resetear filtros y paginación para mostrar todos los items nuevos
		searchQuery.value = "";
		filterCategory.value = "";
		filterStock.value = "";
		currentPage.value = 1;
	}
	notifySuccess(t("global.success"), t("import_modal.items_imported_success"));
};

const handleImportError = (message: string) => {
	console.error("Error de importación:", message);
};

const createListFromSelection = () => {
	// Obtener los IDs seleccionados del componente InventoryTable
	const selectedIds = inventoryTableRef.value?.selectedItems || [];

	let selectedItems = [];

	if (selectedIds.length > 0) {
		// Si hay selección manual, usar esos items
		selectedItems = items.value
			.filter((item) => selectedIds.includes(item.id))
			.map((item) => ({
				id: item.id,
				name: item.name,
				part_number: item.part_number,
				lcsc_part: item.lcsc_part,
				unit: item.unit || "pcs",
				quantity: item.quantity && item.quantity > 0 ? item.quantity : 1,
			}));
	} else {
		// Si no hay selección manual, usar los items filtrados (comportamiento anterior)
		selectedItems = filteredItems.value.map((item) => ({
			id: item.id,
			name: item.name,
			part_number: item.part_number,
			lcsc_part: item.lcsc_part,
			unit: item.unit || "pcs",
			quantity: item.quantity && item.quantity > 0 ? item.quantity : 1,
		}));
	}

	if (selectedItems.length === 0) {
		notifyWarning(t("global.warning"), t("inventory_mgmt.no_items_selected_list"));
		return;
	}

	selectedItemsForList.value = selectedItems;
	showListManager.value = true;

	// Limpiar selección después de abrir el modal
	if (inventoryTableRef.value) {
		inventoryTableRef.value.clearSelection();
	}
};

const saveList = (list: any) => {
	lists.createList({
		name: list.name,
		description: list.description,
		items: list.items,
	});
	showListManager.value = false;
	notifySuccess(t("global.success"), t("inventory_mgmt.list_created", { name: list.name }));
};

const openLcscPreview = (partNumber: string, itemId?: string) => {
	lcscPartNumber.value = partNumber;
	if (itemId) {
		lcscItemId.value = itemId;
	} else {
		lcscItemId.value = "";
	}
	showLCSCPreview.value = true;
};

const { openExternalLink } = useExternalLink();

const openLcscPurchase = (lcscPart: string) => {
	openExternalLink(`https://lcsc.com/product-detail/${lcscPart}.html`);
};

const mergeSelectedLists = () => {
	if (selectedListsForMerge.value.length < 2) {
		notifyWarning("Advertencia", "Selecciona al menos 2 listas para mezclar");
		return;
	}

	if (!mergeListName.value.trim()) {
		notifyWarning("Advertencia", "Ingresa un nombre para la lista combinada");
		return;
	}

	try {
		lists.mergeLists(selectedListsForMerge.value, mergeListName.value);
		showListsManagement.value = false;
		selectedListsForMerge.value = [];
		mergeListName.value = "";
		notifySuccess("Éxito", "Listas combinadas exitosamente");
	} catch (error: any) {
		console.error("Error al mezclar listas:", error);
		notifyError("Error", "Error al mezclar las listas: " + error.message);
	}
};

const handleMergeLists = (listIds: string[], newListName: string) => {
	try {
		lists.mergeLists(listIds, newListName);
		showListsManagement.value = false;
		selectedListsForMerge.value = [];
		mergeListName.value = "";
		notifySuccess(t("global.success"), t("inventory_mgmt.merge_success"));
	} catch (error: any) {
		console.error("Error al mezclar listas:", error);
		notifyError(t("global.error"), t("global.error") + ": " + error.message);
	}
};

const handleCreateGroup = (items: any[], newListName: string) => {
	try {
		lists.createList({
			name: newListName,
			description: `Grupo creado desde gestión de listas`,
			items: items,
		});
		notifySuccess(t("global.success"), t("inventory_mgmt.group_created", { name: newListName }));
	} catch (error: any) {
		console.error("Error al crear grupo:", error);
		notifyError(t("global.error"), t("global.error") + ": " + error.message);
	}
};

const deleteSelectedItemsConfirm = async (ids: string[]) => {
	const confirmed = await showConfirmation(
		t("inventory_mgmt.delete_selected_title"),
		t("inventory_mgmt.delete_selected_desc", { count: ids.length }),
	);

	if (confirmed) {
		try {
			for (const id of ids) {
				await db.deleteItem(id);
			}
			await loadItems();
			notifySuccess(t("global.success"), t("inventory_mgmt.delete_selected_success", { count: ids.length }));
		} catch (error) {
			console.error("Error eliminando componentes:", error);
			notifyError(t("global.error"), t("inventory_mgmt.delete_error"));
		}
	}
};

const updateLcscPrices = async () => {
	const itemsWithLcsc = items.value
		.filter((item) => item.lcsc_part)
		.map((item) => ({ id: item.id, lcsc_part: item.lcsc_part }));

	if (itemsWithLcsc.length === 0) {
		notifyWarning(t("global.warning"), t("inventory_mgmt.no_lcsc_items"));
		return;
	}

	const confirmed = await showConfirmation(
		t("inventory_mgmt.update_lcsc_title"),
		t("inventory_mgmt.update_lcsc_desc", { count: itemsWithLcsc.length }),
	);

	if (confirmed) {
		isUpdatingPrices.value = true;
		try {
			const updatedCount = await massUpdatePrices(itemsWithLcsc);
			await loadItems();
			notifySuccess(t("global.success"), t("inventory_mgmt.update_lcsc_success", { count: updatedCount }));
		} catch (error) {
			console.error("Error al actualizar precios:", error);
			notifyError(t("global.error"), t("global.error"));
		} finally {
			isUpdatingPrices.value = false;
		}
	}
};

// Lifecycle
onMounted(async () => {
	await loadItems();
});
</script>

<style scoped>
/* Estilos movidos a assets/css/app.css */
</style>
