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
						{{ project?.name || "Detalles del Proyecto" }}
					</h1>
					<p class="text-sm text-text-muted-light mt-1">
						{{ project?.description || "Proyecto sin descripción" }}
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
					<span>Mapa PCB</span>
				</button>
				<button
					@click="handleImportComponents"
					class="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors">
					<ArrowDownTrayIcon class="w-4 h-4" />
					<span>Importar Componentes</span>
				</button>
				<button
					@click="consumeProjectStock"
					class="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-amber-700 transition-colors">
					<ArchiveBoxIcon class="w-5 h-5" />
					<span>Consumir Stock</span>
				</button>
				<button
					@click="exportProject"
					class="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
					<DocumentArrowDownIcon class="w-5 h-5" />
					<span>Exportar</span>
				</button>
				<button
					@click="goBack"
					class="flex items-center gap-2 bg-gray-100 text-text-main-light px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors">
					<ArrowLeftIcon class="w-5 h-5" />
					<span>Volver</span>
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
							<p class="text-xs text-text-muted-light">Total Items</p>
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
							<p class="text-xs text-text-muted-light">Valor Componentes</p>
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
								Total Proyecto ({{ project?.pcbQuantity || 1 }} PCBs)
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
							<p class="text-xs text-text-muted-light">Coste por PCB</p>
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
						@file-selected-to-project="handleImportToProject" />
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
		@notification="(data) => notifyInfo(data.message)"
		@file-selected-to-project="handleImportToProject"
		@import-completed="handleImportCompleted" />

	<!-- Gerber/XY Visualizer Overlay -->
	<div v-if="showGerberVisualizer" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
		<div class="w-full h-full">
			<GerberVisualizer
				:project-id="String(route.params.id)"
				@close="showGerberVisualizer = false" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useDialog } from "@/composables/useDialog";
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
import AddItemToProjectModal from "@/components/AddItemToProjectModal.vue";
import EditItemInProjectModal from "@/components/EditItemInProjectModal.vue";
import ProjectItemsTable from "@/components/project/ProjectItemsTable.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import ConfirmDialog from "@/components/global/ConfirmDialog.vue";
import { useConfirmDialog } from "@/composables/useConfirmDialog";
import ImportModal from "@/components/ImportModal.vue";
import GerberVisualizer from "@/components/project/GerberVisualizer.vue";
import { useNotifications } from "@/composables/useNotifications";
import { navigateTo } from "nuxt/app";

// Define page meta properties (using Nuxt's automatic route naming)
// name: "projects-id",
// layout: "default",

const router = useRouter();
const route = useRoute();
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
	const searchTerms = query.split(/\s+/).filter((term) => term.length > 0);

	return projectItems.value.filter((item) => {
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
	return projectItems.value.filter((item) => item.in_stock >= (item.min_stock || 0)).length;
});

const lowStockCount = computed(() => {
	return projectItems.value.filter((item) => item.in_stock < (item.min_stock || 0)).length;
});

const totalComponentsValue = computed(() => {
	return projectItems.value.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0).toFixed(2);
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
		return allItems.value.filter((item) => !projectItems.value.some((pi) => pi.id === item.id));

	const query = addItemSearchQuery.value.toLowerCase().trim();
	if (!query) return allItems.value.filter((item) => !projectItems.value.some((pi) => pi.id === item.id));

	// Dividir la consulta en palabras individuales
	const searchTerms = query.split(/\s+/).filter((term) => term.length > 0);

	return allItems.value.filter((item) => {
		// Verificar que el item no esté ya en el proyecto
		const notInProject = !projectItems.value.some((pi) => pi.id === item.id);

		// Verificar si todas las palabras de búsqueda coinciden en algún campo
		const matchesSearch = searchTerms.every(
			(term) =>
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
			const item = projectItems.value.find((i) => i.id === itemId);
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
		"Remover Componente",
		"¿Estás seguro de remover este componente del proyecto? Esta acción no se puede deshacer.",
		"warning",
	);

	if (confirmed) {
		try {
			const success = await db.removeItemFromProject(projectId, itemId);
			if (success) {
				const index = projectItems.value.findIndex((i) => i.id === itemId);
				if (index !== -1) {
					projectItems.value.splice(index, 1);
					// Recalcular costos
					calculateProjectCostMethod();
					notifySuccess("Componente removido", "Componente removido del proyecto exitosamente");
				}
			}
		} catch (error) {
			console.error("Error removiendo item del proyecto:", error);
			notifyError("Error", "Error al remover el componente del proyecto");
		}
	}
};

const removeSelectedItemsFromProject = async (ids: string[]) => {
	const confirmed = await showCustomConfirmation(
		"Remover Componentes",
		`¿Estás seguro de remover ${ids.length} componentes seleccionados del proyecto? Esta acción no se puede deshacer.`,
		"warning",
	);

	if (confirmed) {
		try {
			const projectId = route.params.id as string;
			let removedCount = 0;
			for (const id of ids) {
				const success = await db.removeItemFromProject(projectId, id);
				if (success) {
					const index = projectItems.value.findIndex((i) => i.id === id);
					if (index !== -1) {
						projectItems.value.splice(index, 1);
						removedCount++;
					}
				}
			}
			// Recalcular costos
			calculateProjectCostMethod();
			notifySuccess("Componentes removidos", `${removedCount} componentes removidos del proyecto exitosamente`);
		} catch (error) {
			console.error("Error removiendo items del proyecto:", error);
			notifyError("Error", "Error al remover los componentes del proyecto");
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

		notifySuccess("Éxito", "Componente actualizado exitosamente");
		showEditItemModal.value = false;
		editingItem.value = null;
	} catch (error) {
		console.error("Error actualizando componente:", error);
		notifyError("Error", "Error al actualizar el componente");
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
		const existingItem = projectItems.value.find((i) => i.id === item.id);
		if (existingItem) {
			notifyWarning("Advertencia", "Este item ya está en el proyecto");
			return;
		}

		// Agregar item al proyecto con cantidad por defecto de 1
		const success = await db.addItemToProject(projectId, item.id, 1);
		if (success) {
			const itemToAdd = { ...item, quantity: 1 };
			projectItems.value.push(itemToAdd);
			closeAddItemModal();
			calculateProjectCostMethod();
			notifySuccess("Éxito", "Componente agregado al proyecto exitosamente");
		}
	} catch (error) {
		console.error("Error agregando item al proyecto:", error);
		notifyError("Error", "Error al agregar el componente al proyecto");
	}
};

const closeAddItemModal = () => {
	showAddItemModal.value = false;
	addItemSearchQuery.value = "";
};

const calculateProjectCostMethod = () => {
	if (projectItems.value.length > 0) {
		const quantities = projectItems.value.reduce((acc, item) => {
			acc[item.id] = item.quantity || 1;
			return acc;
		}, {} as Record<string, number>);

		costBreakdown.value = calculateProjectCost(projectItems.value, quantities);
	}
};

const exportProject = () => {
	notifyInfo("Información", "Funcionalidad de exportación del proyecto en desarrollo");
	// TODO: Implementar exportación del proyecto
};

const consumeProjectStock = async () => {
	const confirmed = await showCustomConfirmation(
		"Consumir Stock",
		"¿Estás seguro de descontar las cantidades de este proyecto del inventario global? Esta acción afectará el stock real disponible.",
		"warning",
	);

	if (confirmed) {
		try {
			const itemsToConsume = projectItems.value.map((item) => ({
				id: item.id,
				quantity: item.quantity || 1,
			}));

			await db.consumeStockFromBOM(itemsToConsume);
			await loadProject();
			notifySuccess("Éxito", "Stock consumido exitosamente");
		} catch (error) {
			console.error("Error al consumir stock:", error);
			notifyError("Error", "Error al consumir stock");
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

			let message = `Importación completada: ${importedCount} items agregados al proyecto.`;
			if (errors.length > 0) {
				message += ` Errores: ${errors.length}.`;
				console.error("Errores durante la importación:", errors);
			}

			if (importedCount > 0) {
				notifySuccess("Importación completada", message);
			} else {
				notifyError("Error en la importación", message);
			}
		} else {
			notifyError("Error en la importación", result.errors.join(", "));
		}
	} catch (error) {
		console.error("Error al importar archivo al proyecto:", error);
		notifyError("Error", "Error al importar archivo al proyecto");
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
		let message = `Importación completada: ${data.importedCount} items agregados al proyecto.`;
		if (data.errors.length > 0) {
			message += ` Errores: ${data.errors.length}.`;
		}

		if (data.importedCount > 0) {
			notifySuccess("Importación completada", message);
		} else {
			notifyError("Error en la importación", message);
		}
	} else {
		notifySuccess("Éxito", "Items importados exitosamente");
	}
};

// Lifecycle
onMounted(async () => {
	await loadProject();
	calculateProjectCostMethod();
	// Asegurar que el modal de importación esté cerrado al cargar la página
	importStore.setShowImportModal(false);
});
</script>

<style scoped>
/* Estilos movidos a assets/css/app.css */
</style>
