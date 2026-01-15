<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useDialog } from "@/composables/useDialog";
import { useI18n } from "@/composables/useI18n";
import { useImportStore } from "@/stores/import";
import {
	CpuChipIcon,
	Squares2X2Icon,
	CubeIcon,
	RectangleStackIcon,
	Cog6ToothIcon,
	UserIcon,
	DocumentArrowDownIcon,
	ArrowLeftIcon,
	CalculatorIcon,
	CheckCircleIcon,
	ExclamationTriangleIcon,
	CurrencyDollarIcon,
	MagnifyingGlassIcon,
	PencilIcon,
	TrashIcon,
	XMarkIcon,
	PlusIcon,
	ArrowDownTrayIcon,
	ArchiveBoxIcon,
	MapIcon,
} from "@heroicons/vue/24/outline";

import { useDatabase } from "@/composables/useDatabase";
import { useCostCalculator } from "@/composables/useCostCalculator";
import { useFileParser } from "@/composables/useFileParser";
import { useRouter, useRoute } from "vue-router";
import { useFileManager } from "@/composables/useFileManager";
import type { BOMItem, BOMProject } from "@/types/bom";
import { useConfirmDialog } from "@/composables/useConfirmDialog";
import { useNotifications } from "@/composables/useNotifications";
import { navigateTo } from "nuxt/app";

// Define page meta properties (using Nuxt's automatic route naming)
// name: "projects-id",
// layout: "default",

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const db = useDatabase();
const { calculateProjectCost, formatCurrency, taxRate } = useCostCalculator();
const { showConfirmation } = useDialog();
const confirmDialog = useConfirmDialog();
const { success: notifySuccess, error: notifyError, warning: notifyWarning, info: notifyInfo } = useNotifications();

// Override showConfirmation to use our custom modal dialog
const showCustomConfirmation = async (title: string, message: string, type: "info" | "warning" | "error" = "info") => {
	return await confirmDialog.showConfirmation({
		title,
		message,
		type,
	});
};

// State
const project = ref<BOMProject | null>(null);
const projectItems = ref<any[]>([]);
const allItems = ref<any[]>([]);
const searchQuery = ref("");
const addItemSearchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = 10;
const showAddItemModal = ref(false);
const showEditItemModal = ref(false);
const editingItem = ref<any>(null);
const costBreakdown = ref<any>(null);
const showGerberVisualizer = ref(false);
const highlightedRef = ref<string>("");

const { getFileByName } = useFileManager();
const thumbUrl = ref<string | null>(null);

const loadThumb = async () => {
	if (project.value?.thumb) {
		if (project.value.thumb.startsWith("http") || project.value.thumb.startsWith("data:")) {
			thumbUrl.value = project.value.thumb;
			return;
		}

		try {
			const fileUrl = await getFileByName(project.value.thumb);
			if (fileUrl) {
				thumbUrl.value = fileUrl;
			}
		} catch (error) {
			console.error("Error loading project thumb:", error);
		}
	} else {
		thumbUrl.value = null;
	}
};

// Confirm Modal State
// const showConfirmModal = ref(false);
// const confirmModalTitle = ref("");
// const confirmModalMessage = ref("");
// const confirmModalConfirmText = ref("");
// const itemToDelete = ref<string | null>(null);

// Toast State

// Import Modal State
const importStore = useImportStore();
const showImportModal = computed(() => importStore.showImportModal);

// Computed
const filteredItems = computed(() => {
	if (!searchQuery.value) return projectItems.value;

	const query = searchQuery.value.toLowerCase().trim();
	if (!query) return projectItems.value;

	// Dividir la consulta en palabras individuales
	const searchTerms = query.split(/\s+/).filter((term: string) => term.length > 0);

	return projectItems.value.filter((item: any) => {
		// Verificar si todas las palabras de búsqueda coinciden en algún campo
		return searchTerms.every(
			(term: string) =>
				item.name?.toLowerCase().includes(term) ||
				item.description?.toLowerCase().includes(term) ||
				item.category?.toLowerCase().includes(term) ||
				item.supplier?.toLowerCase().includes(term) ||
				item.part_number?.toLowerCase().includes(term) ||
				item.lcsc_part?.toLowerCase().includes(term) ||
				item.notes?.toLowerCase().includes(term),
		);
	});
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
	return projectItems.value.filter((item: any) => item.in_stock >= (item.min_stock || 0)).length;
});

const lowStockCount = computed(() => {
	return projectItems.value.filter((item: any) => item.in_stock < (item.min_stock || 0)).length;
});

const totalComponentsValue = computed(() => {
	return projectItems.value
		.reduce((sum: number, item: any) => sum + (item.price || 0) * (item.quantity || 1), 0)
		.toFixed(2);
});

const totalProjectValue = computed(() => {
	const componentsValue = parseFloat(totalComponentsValue.value);
	const pcbQty = project.value?.pcbQuantity || 1;
	const pcbCost = project.value?.pcbCost || 0;
	return (componentsValue + pcbQty * pcbCost).toFixed(2);
});

const costPerPcb = computed(() => {
	const total = parseFloat(totalProjectValue.value);
	const pcbQty = project.value?.pcbQuantity || 1;
	return (total / pcbQty).toFixed(2);
});

const availableItems = computed(() => {
	if (!addItemSearchQuery.value)
		return allItems.value.filter((item: any) => !projectItems.value.some((pi: any) => pi.id === item.id));

	const query = addItemSearchQuery.value.toLowerCase().trim();
	if (!query) return allItems.value.filter((item: any) => !projectItems.value.some((pi: any) => pi.id === item.id));

	// Dividir la consulta en palabras individuales
	const searchTerms = query.split(/\s+/).filter((term: string) => term.length > 0);

	return allItems.value.filter((item: any) => {
		// Verificar que el item no esté ya en el proyecto
		const notInProject = !projectItems.value.some((pi: any) => pi.id === item.id);

		// Verificar si todas las palabras de búsqueda coinciden en algún campo
		const matchesSearch = searchTerms.every(
			(term: string) =>
				item.name?.toLowerCase().includes(term) ||
				item.description?.toLowerCase().includes(term) ||
				item.category?.toLowerCase().includes(term) ||
				item.supplier?.toLowerCase().includes(term) ||
				item.part_number?.toLowerCase().includes(term) ||
				item.lcsc_part?.toLowerCase().includes(term) ||
				item.notes?.toLowerCase().includes(term),
		);

		return notInProject && matchesSearch;
	});
});

// Methods
const loadProject = async () => {
	const projectId = route.params.id as string;

	try {
		// Cargar el proyecto específico
		const projectData = await db.getProjectById(projectId);
		if (!projectData) {
			router.push("/projects");
			return;
		}

		project.value = projectData;
		await loadThumb();

		// Cargar items del proyecto
		projectItems.value = await db.getProjectItems(projectId);

		// Cargar todos los items para agregar al proyecto
		allItems.value = await db.getAllItems();
	} catch (error) {
		console.error("Error cargando proyecto:", error);
		router.push("/projects");
	}
};

const calculateItemTotal = (item: any): number => {
	return (item.price || 0) * (item.quantity || 1);
};

const updateItemQuantity = async (itemId: string, newQuantity: number) => {
	const projectId = route.params.id as string;

	try {
		const success = await db.updateProjectItemQuantity(projectId, itemId, newQuantity);
		if (success) {
			const item = projectItems.value.find((i: any) => i.id === itemId);
			if (item) {
				item.quantity = newQuantity;
				// Recalcular costos
				calculateProjectCostMethod();
			}
		}
	} catch (error) {
		console.error("Error actualizando cantidad de item:", error);
	}
};

const removeItemFromProject = async (itemId: string) => {
	const projectId = route.params.id as string;

	const confirmed = await showCustomConfirmation(
		t("project_mgmt.remove_item_title"),
		t("project_mgmt.remove_item_desc"),
		"warning",
	);

	if (confirmed) {
		try {
			const success = await db.removeItemFromProject(projectId, itemId);
			if (success) {
				const index = projectItems.value.findIndex((i: any) => i.id === itemId);
				if (index !== -1) {
					projectItems.value.splice(index, 1);
					// Recalcular costos
					calculateProjectCostMethod();
					notifySuccess(t("project_mgmt.remove_item_title"), t("project_mgmt.remove_success"));
				}
			}
		} catch (error) {
			console.error("Error removiendo item del proyecto:", error);
			notifyError(t("global.error"), t("project_mgmt.remove_error_msg") || t("global.error"));
		}
	}
};

const removeSelectedItemsFromProject = async (ids: string[]) => {
	const confirmed = await showCustomConfirmation(
		t("project_mgmt.remove_selected_title"),
		t("project_mgmt.remove_selected_desc", { count: ids.length }),
		"warning",
	);

	if (confirmed) {
		try {
			const projectId = route.params.id as string;
			let removedCount = 0;
			for (const id of ids) {
				const success = await db.removeItemFromProject(projectId, id);
				if (success) {
					const index = projectItems.value.findIndex((i: any) => i.id === id);
					if (index !== -1) {
						projectItems.value.splice(index, 1);
						removedCount++;
					}
				}
			}
			// Recalcular costos
			calculateProjectCostMethod();
			notifySuccess(
				t("project_mgmt.remove_selected_title"),
				t("project_mgmt.remove_selected_success", { count: removedCount }),
			);
		} catch (error) {
			console.error("Error removiendo items del proyecto:", error);
			notifyError(t("global.error"), t("project_mgmt.remove_error_msg") || t("global.error"));
		}
	}
};

const editItem = (item: any) => {
	// En la vista de proyecto, ahora se permite editar items directamente
	editingItem.value = item;
	showEditItemModal.value = true;
};

const handleEditItemSave = async (itemData: any) => {
	try {
		// Actualizar el item en el inventario global
		await db.updateItem(editingItem.value.id, itemData);

		// Recargar los items del proyecto para reflejar los cambios
		await loadProject();
		calculateProjectCostMethod();

		notifySuccess(t("global.success"), t("project_mgmt.update_success"));
		showEditItemModal.value = false;
		editingItem.value = null;
	} catch (error) {
		console.error("Error actualizando componente:", error);
		notifyError(t("global.error"), t("global.error"));
	}
};

const handleEditItemClose = () => {
	showEditItemModal.value = false;
	editingItem.value = null;
};

const addItemToProject = async (item: any) => {
	const projectId = route.params.id as string;

	try {
		// Verificar si el item ya está en el proyecto
		const existingItem = projectItems.value.find((i: any) => i.id === item.id);
		if (existingItem) {
			notifyWarning(t("global.warning"), t("project_mgmt.already_in_project"));
			return;
		}

		// Agregar item al proyecto con cantidad por defecto de 1
		const success = await db.addItemToProject(projectId, item.id, 1);
		if (success) {
			const itemToAdd = { ...item, quantity: 1 };
			projectItems.value.push(itemToAdd);
			closeAddItemModal();
			calculateProjectCostMethod();
			notifySuccess(t("global.success"), t("project_mgmt.add_success"));
		}
	} catch (error) {
		console.error("Error agregando item al proyecto:", error);
		notifyError(t("global.error"), t("global.error"));
	}
};

const closeAddItemModal = () => {
	showAddItemModal.value = false;
	addItemSearchQuery.value = "";
};

const calculateProjectCostMethod = () => {
	if (projectItems.value.length > 0) {
		const quantities = projectItems.value.reduce((acc: Record<string, number>, item: any) => {
			acc[item.id] = item.quantity || 1;
			return acc;
		}, {} as Record<string, number>);

		costBreakdown.value = calculateProjectCost(projectItems.value, quantities);
	}
};

const exportProject = () => {
	notifyInfo(t("global.warning"), t("project_mgmt.export_in_development"));
	// TODO: Implementar exportación del proyecto
};

const consumeProjectStock = async () => {
	const confirmed = await showCustomConfirmation(
		t("project_mgmt.consume_stock_title"),
		t("project_mgmt.consume_stock_desc"),
		"warning",
	);

	if (confirmed) {
		try {
			const itemsToConsume = projectItems.value.map((item: any) => ({
				id: item.id,
				quantity: item.quantity || 1,
			}));

			await db.consumeStockFromBOM(itemsToConsume);
			await loadProject();
			notifySuccess(t("global.success"), t("project_mgmt.consume_stock_success"));
		} catch (error) {
			console.error("Error al consumir stock:", error);
			notifyError(t("global.error"), t("global.error"));
		}
	}
};

const goBack = async () => {
	await navigateTo({ name: "projects" });
};

const handleAddItemSearch = (query: string) => {
	// Lógica para manejar la búsqueda en el modal de agregar item
	addItemSearchQuery.value = query;
};

const handleLocatePcb = (refDes: string) => {
	highlightedRef.value = refDes;
	showGerberVisualizer.value = true;
};

const closeGerberVisualizer = () => {
	showGerberVisualizer.value = false;
	highlightedRef.value = "";
};

const handleImportComponents = () => {
	importStore.setShowImportModal(true);
};

const handleImportToProject = async (data: { file: File; projectId: string }) => {
	try {
		// Parsear el archivo usando el composable useFileParser
		const { parseFile } = useFileParser();
		const result = await parseFile(data.file);

		if (result.success && result.items.length > 0) {
			let importedCount = 0;
			const errors: string[] = [];

			// Agregar cada item parseado al proyecto
			for (const item of result.items) {
				// Crear o actualizar el item en el inventario global
				const itemId = await db.createItem(item);

				if (itemId) {
					// Agregar el item al proyecto
					const success = await db.addItemToProject(data.projectId, itemId, item.quantity || 1);
					if (success) {
						importedCount++;
					} else {
						errors.push(`Error al agregar item ${item.name || "desconocido"} al proyecto`);
					}
				} else {
					errors.push(`Error al crear item ${item.name || "desconocido"} en el inventario`);
				}
			}

			// Recargar los items del proyecto
			await loadProject();
			calculateProjectCostMethod();

			let message = t("project_mgmt.import_to_project_success", { count: importedCount });
			if (errors.length > 0) {
				message += t("project_mgmt.import_errors", { count: errors.length });
				console.error("Errores durante la importación:", errors);
			}

			if (importedCount > 0) {
				notifySuccess(t("import_modal.items_imported_success"), message);
			} else {
				notifyError(t("import_modal.import_failed"), message);
			}
		} else {
			notifyError(t("import_modal.import_failed"), result.errors.join(", "));
		}
	} catch (error) {
		console.error("Error al importar archivo al proyecto:", error);
		notifyError(t("global.error"), t("global.error"));
	}
};

const handleImportCompleted = async (data: {
	importedCount: number;
	errors: string[];
	destination: "global" | "project";
	projectId?: string;
}) => {
	// Actualizar items del proyecto si la importación fue a este proyecto específico
	if (data.destination === "project" && data.projectId === route.params.id) {
		await loadProject();
		calculateProjectCostMethod();
		// Mostrar mensaje específico para importación a proyecto
		let message = t("project_mgmt.import_to_project_success", { count: data.importedCount });
		if (data.errors.length > 0) {
			message += t("project_mgmt.import_errors", { count: data.errors.length });
		}

		if (data.importedCount > 0) {
			notifySuccess(t("import_modal.items_imported_success"), message);
		} else {
			notifyError(t("import_modal.import_failed"), message);
		}
	} else {
		notifySuccess(t("global.success"), t("import_modal.items_imported_success"));
	}
};

const handleNotification = (data: any) => {
	notifyInfo(data.message);
};

// Lifecycle
onMounted(async () => {
	await loadProject();
	calculateProjectCostMethod();
	// Asegurar que el modal de importación esté cerrado al cargar la página
	importStore.setShowImportModal(false);
});
</script>

<template>
	<!-- Main Content -->
	<main class="min-h-screen">
		<!-- Header -->
		<header class="h-24 px-8 flex items-center justify-between bg-background-light border-b border-gray-200">
			<div class="flex items-center gap-4">
				<div
					class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100 shadow-sm">
					<img v-if="thumbUrl" :src="thumbUrl" class="w-full h-full object-cover" />
					<RectangleStackIcon v-else class="w-8 h-8 text-primary" />
				</div>
				<div>
					<h1 class="text-2xl font-semibold text-text-main-light">
						{{ project?.name || t("project_details") }}
					</h1>
					<p class="text-sm text-text-muted-light mt-1">
						{{ project?.description || t("no_description") }}
					</p>
				</div>
			</div>
			<div class="flex items-center gap-4">
				<!--
					<button
					@click="calculateProjectCostMethod"
					class="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors">
					<CalculatorIcon class="w-5 h-5" />
					<span>Calcular Costos</span>
				</button>
				-->
				<button
					@click="showGerberVisualizer = true"
					class="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-700 transition-colors">
					<MapIcon class="w-5 h-5" />
					<span>{{ t("pcb_map") }}</span>
				</button>
				<button
					@click="handleImportComponents"
					class="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors">
					<ArrowDownTrayIcon class="w-4 h-4" />
					<span>{{ t("import_components") }}</span>
				</button>
				<button
					@click="consumeProjectStock"
					class="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-amber-700 transition-colors">
					<ArchiveBoxIcon class="w-5 h-5" />
					<span>{{ t("consume_stock") }}</span>
				</button>
				<button
					@click="exportProject"
					class="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
					<DocumentArrowDownIcon class="w-5 h-5" />
					<span>{{ t("export") }}</span>
				</button>
				<button
					@click="goBack"
					class="flex items-center gap-2 bg-gray-100 text-text-main-light px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors">
					<ArrowLeftIcon class="w-5 h-5" />
					<span>{{ t("back") }}</span>
				</button>
			</div>
		</header>

		<!-- Project Content -->
		<div class="p-8 pt-4">
			<!-- Project Stats -->
			<div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
				<div class="bg-card-light rounded-2xl p-4 shadow-sm">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
							<CubeIcon class="w-5 h-5 text-blue-600" />
						</div>
						<div>
							<p class="text-xs text-text-muted-light">{{ t("total_items") }}</p>
							<p class="text-2xl font-bold text-text-main-light">
								{{ projectItems.length }}
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
							<p class="text-xs text-text-muted-light">{{ t("component_value") }}</p>
							<p class="text-2xl font-bold text-text-main-light">${{ totalComponentsValue }}</p>
						</div>
					</div>
				</div>

				<div class="bg-card-light rounded-2xl p-4 shadow-sm border border-primary/20">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
							<RectangleStackIcon class="w-5 h-5 text-primary" />
						</div>
						<div>
							<p class="text-xs text-text-muted-light">
								{{ t("total_project") }} ({{ project?.pcbQuantity || 1 }} {{ t("pcbs") }})
							</p>
							<p class="text-2xl font-bold text-primary">${{ totalProjectValue }}</p>
						</div>
					</div>
				</div>

				<div class="bg-card-light rounded-2xl p-4 shadow-sm border border-green-200">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
							<CurrencyDollarIcon class="w-5 h-5 text-green-600" />
						</div>
						<div>
							<p class="text-xs text-text-muted-light">{{ t("cost_per_pcb") }}</p>
							<p class="text-2xl font-bold text-green-600">${{ costPerPcb }}</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Project Items Table -->
			<div class="bg-card-light rounded-2xl shadow-sm overflow-hidden">
				<div class="overflow-x-auto">
					<ProjectItemsTable
						:items="projectItems"
						@edit-item="editItem"
						@remove-item="removeItemFromProject"
						@remove-selected-items="removeSelectedItemsFromProject"
						@import-components="handleImportComponents"
						@file-selected-to-project="handleImportToProject"
						@locate-pcb="handleLocatePcb" />
				</div>
			</div>
		</div>
	</main>

	<!-- Add Item to Project Modal -->
	<AddItemToProjectModal
		:show="showAddItemModal"
		:items="availableItems"
		@close="closeAddItemModal"
		@add="addItemToProject"
		@search="handleAddItemSearch" />

	<!-- Edit Item in Project Modal -->
	<EditItemInProjectModal
		:show="showEditItemModal"
		:item="editingItem"
		@close="handleEditItemClose"
		@save="handleEditItemSave" />

	<!-- Confirm Dialog Modal -->
	<ConfirmDialog
		:is-open="confirmDialog.isOpen.value"
		:options="confirmDialog.options.value"
		@confirm="confirmDialog.handleConfirm"
		@cancel="confirmDialog.handleCancel" />

	<!-- Import Modal -->
	<ImportModal
		v-if="showImportModal"
		:show="showImportModal"
		:projectId="String(route.params.id)"
		@close="importStore.setShowImportModal(false)"
		@notification="handleNotification"
		@file-selected-to-project="handleImportToProject"
		@import-completed="handleImportCompleted" />

	<!-- Gerber/XY Visualizer Overlay -->
	<div v-if="showGerberVisualizer" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
		<div class="w-full h-full">
			<GerberVisualizer
				:project-id="String(route.params.id)"
				:selected-ref="highlightedRef"
				@close="closeGerberVisualizer" />
		</div>
	</div>
</template>

<style scoped>
/* Estilos movidos a assets/css/app.css */
</style>
