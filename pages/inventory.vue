<template>
	<!-- Main Content -->
	<main class="min-h-screen">
		<!-- Header -->
		<header class="h-20 px-8 flex items-center justify-between bg-background-light border-b border-gray-200">
			<div>
				<h1 class="text-2xl font-semibold text-text-main-light">Inventario de Componentes</h1>
			</div>
			<div class="flex items-center gap-4">
				<button
					@click="showImportModal = true"
					class="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors">
					<DocumentArrowUpIcon class="w-5 h-5" />
					<span>Importar</span>
				</button>
				<button
					@click="createListFromSelection"
					class="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-purple-700 transition-colors">
					<ClipboardDocumentListIcon class="w-5 h-5" />
					<span>Crear Lista</span>
				</button>
				<button
					@click="exportInventory"
					class="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
					<DocumentArrowDownIcon class="w-5 h-5" />
					<span>Exportar</span>
				</button>
				<button
					@click="showAddModal = true"
					class="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors">
					<PlusIcon class="w-5 h-5" />
					<span>Agregar Item</span>
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
							<p class="text-xs text-text-muted-light">Total Items</p>
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
							<p class="text-xs text-text-muted-light">Stock OK</p>
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
							<p class="text-xs text-text-muted-light">Stock Bajo</p>
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
							<p class="text-xs text-text-muted-light">Valor Total</p>
							<p class="text-2xl font-bold text-text-main-light">${{ totalValue }}</p>
						</div>
					</div>
				</div>
			</div>

			<!-- List Management Section -->
			<div class="bg-card-light rounded-2xl p-6 shadow-sm mb-6">
				<div class="flex justify-between items-center mb-4">
					<h3 class="text-lg font-semibold text-text-main-light">Gestión de Listas</h3>
					<button
						@click="showListsManagement = true"
						class="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
						Gestionar Listas
					</button>
				</div>
				<p class="text-text-muted-light text-sm">Tienes {{ lists.listCount }} listas guardadas</p>
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
							placeholder="Buscar por nombre, categoría, proveedor..."
							class="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light" />
					</div>
					<select
						v-model="filterCategory"
						class="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light">
						<option value="">Todas las categorías</option>
						<option v-for="cat in categories" :key="cat" :value="cat">
							{{ cat }}
						</option>
					</select>
					<select
						v-model="filterStock"
						class="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light">
						<option value="all">Todos</option>
						<option value="ok">Stock OK</option>
						<option value="low">Stock Bajo</option>
					</select>
				</div>
			</div>

			<!-- Items Table -->
			<InventoryTable
				:items="paginatedItems"
				@edit-item="editItem"
				@delete-item="deleteItemConfirm"
				@delete-selected-items="deleteSelectedItemsConfirm"
				@open-lcsc-preview="openLcscPreview"
				@open-lcsc-purchase="openLcscPurchase"
				@add-first-item="showAddModal = true" />

			<!-- Pagination -->
			<div v-if="totalPages > 1" class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
				<p class="text-sm text-text-muted-light">
					Mostrando {{ (currentPage - 1) * itemsPerPage + 1 }} a
					{{ Math.min(currentPage * itemsPerPage, filteredItems.length) }}
					de {{ filteredItems.length }} items
				</p>
				<div class="flex gap-2">
					<button
						@click="currentPage--"
						:disabled="currentPage === 1"
						class="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors">
						Anterior
					</button>
					<button
						@click="currentPage++"
						:disabled="currentPage === totalPages"
						class="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors">
						Siguiente
					</button>
				</div>
			</div>
		</div>
	</main>

	<!-- LCSC Preview Modal -->
	<LCSCPreview :show="showLCSCPreview" :part-number="lcscPartNumber" @close="showLCSCPreview = false" />

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
	<ListManager v-if="showListManager" v-model="showListManager" :items="[]" @saved="saveList" />

	<!-- Lists Management Modal -->
	<ListsManagementModal
		v-if="showListsManagement"
		:lists="lists.lists.value"
		@close="showListsManagement = false"
		@merge-lists="handleMergeLists" />

	<!-- Toast Notification -->
	<Toast :show="showToast" :message="toastMessage" :type="toastType" @close="showToast = false" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useDialog } from "@/composables/useDialog";
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
	ShoppingCartIcon,
} from "@heroicons/vue/24/outline";
import { useDatabase } from "@/composables/useDatabase";
import { useExport } from "@/composables/useExport";
import { useFileParser } from "@/composables/useFileParser";
import { useLists } from "@/composables/useLists";
import { useLCSC } from "@/composables/useLCSC";
import FileUpload from "@/components/FileUpload.vue";
import ListManager from "@/components/ListManager.vue";
import LCSCPreview from "@/components/LCSCPreview.vue";
import AddItemToInventoryModal from "@/components/AddItemToInventoryModal.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import Toast from "@/components/Toast.vue";
import ImportModal from "@/components/ImportModal.vue";
import ListsManagementModal from "@/components/ListsManagementModal.vue";
import InventoryTable from "@/components/inventory/InventoryTable.vue";

definePageMeta({
	name: "inventory",
	layout: "default",
});

const db = useDatabase();
const { exportAllInventory } = useExport();
const { parseFile } = useFileParser();
const lists = useLists();
const { showConfirmation } = useDialog();

// State
const items = ref<any[]>([]);
const searchQuery = ref("");
const filterCategory = ref("");
const filterStock = ref("all");
const currentPage = ref(1);
const itemsPerPage = 10;
const showAddModal = ref(false);
const showImportModal = ref(false);
const showListManager = ref(false);
const showListsManagement = ref(false);
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
const lcscPartNumber = ref("");

// Toast State
const showToast = ref(false);
const toastMessage = ref("");
const toastType = ref<"success" | "error" | "warning" | "info">("info");

// Computed
const categories = computed(() => {
	const cats = new Set(items.value.map((item) => item.category).filter(Boolean));
	return Array.from(cats);
});

const filteredItems = computed(() => {
	let filtered = items.value;

	// Search filter
	if (searchQuery.value) {
		const query = searchQuery.value.toLowerCase();
		filtered = filtered.filter(
			(item) =>
				item.name?.toLowerCase().includes(query) ||
				item.category?.toLowerCase().includes(query) ||
				item.supplier?.toLowerCase().includes(query) ||
				item.part_number?.toLowerCase().includes(query),
		);
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
	return items.value.reduce((sum, item) => sum + (item.price || 0) * item.in_stock, 0).toFixed(2);
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
		"Eliminar Componente",
		"¿Estás seguro de eliminar este componente? Esta acción no se puede deshacer.",
	);

	if (confirmed) {
		try {
			await db.deleteItem(id);
			await loadItems();
			showToastMessage("Componente eliminado exitosamente", "success");
		} catch (error) {
			console.error("Error eliminando componente:", error);
			showToastMessage("Error al eliminar el componente", "error");
		}
	}
};

const showToastMessage = (message: string, type: "success" | "error" | "warning" | "info" = "info") => {
	toastMessage.value = message;
	toastType.value = type;
	showToast.value = true;

	// Auto-hide after 3 seconds
	setTimeout(() => {
		showToast.value = false;
	}, 3000);
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
			showToastMessage(`Importación exitosa: ${result.items.length} items agregados`, "success");
		} else {
			showToastMessage(`Error en la importación: ${result.errors.join(", ")}`, "error");
		}
	} catch (error) {
		console.error("Error importando archivo:", error);
		showToastMessage("Error al importar archivo", "error");
	}
};

const handleImportCompleted = async () => {
	await loadItems();
	showToastMessage("Items importados exitosamente", "success");
};

const handleImportError = (message: string) => {
	console.error("Error de importación:", message);
};

const createListFromSelection = () => {
	// Crear una nueva lista con los items filtrados
	const selectedItems = filteredItems.value.map((item) => ({
		id: item.id,
		name: item.name,
		part_number: item.part_number,
		lcsc_part: item.lcsc_part,
		unit: item.unit,
		quantity: item.quantity || 1,
	}));

	if (selectedItems.length === 0) {
		showToastMessage("No hay items para agregar a la lista", "warning");
		return;
	}

	showListManager.value = true;
	// Usar nextTick para asegurar que el componente esté montado
	setTimeout(() => {
		const listManager = document.querySelector("list-manager");
		if (listManager && (listManager as any).addItems) {
			(listManager as any).addItems(selectedItems);
		}
	}, 100);
};

const saveList = (list: any) => {
	lists.createList({
		name: list.name,
		description: list.description,
		items: list.items,
	});
	showListManager.value = false;
	showToastMessage(`Lista "${list.name}" guardada exitosamente`, "success");
};

const openLcscPreview = (lcscPart: string) => {
	lcscPartNumber.value = lcscPart;
	showLCSCPreview.value = true;
};

const openLcscPurchase = (lcscPart: string) => {
	window.open(`https://lcsc.com/product-detail/${lcscPart}.html`, "_blank");
};

const mergeSelectedLists = () => {
	if (selectedListsForMerge.value.length < 2) {
		showToastMessage("Selecciona al menos 2 listas para mezclar", "warning");
		return;
	}

	if (!mergeListName.value.trim()) {
		showToastMessage("Ingresa un nombre para la lista combinada", "warning");
		return;
	}

	try {
		lists.mergeLists(selectedListsForMerge.value, mergeListName.value);
		showListsManagement.value = false;
		selectedListsForMerge.value = [];
		mergeListName.value = "";
		showToastMessage("Listas combinadas exitosamente", "success");
	} catch (error: any) {
		console.error("Error al mezclar listas:", error);
		showToastMessage("Error al mezclar las listas: " + error.message, "error");
	}
};

const handleMergeLists = (listIds: string[], newListName: string) => {
	try {
		lists.mergeLists(listIds, newListName);
		showListsManagement.value = false;
		selectedListsForMerge.value = [];
		mergeListName.value = "";
		showToastMessage("Listas combinadas exitosamente", "success");
	} catch (error: any) {
		console.error("Error al mezclar listas:", error);
		showToastMessage("Error al mezclar las listas: " + error.message, "error");
	}
};

const deleteSelectedItemsConfirm = async (ids: string[]) => {
	const confirmed = await showConfirmation(
		"Eliminar Componentes",
		`¿Estás seguro de eliminar ${ids.length} componentes seleccionados? Esta acción no se puede deshacer.`,
	);

	if (confirmed) {
		try {
			for (const id of ids) {
				await db.deleteItem(id);
			}
			await loadItems();
			showToastMessage(`${ids.length} componentes eliminados exitosamente`, "success");
		} catch (error) {
			console.error("Error eliminando componentes:", error);
			showToastMessage("Error al eliminar los componentes", "error");
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
