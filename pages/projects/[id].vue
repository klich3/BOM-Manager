<template>
	<!-- Main Content -->
	<main class="min-h-screen">
		<!-- Header -->
		<header class="h-20 px-8 flex items-center justify-between bg-background-light border-b border-gray-200">
			<div>
				<h1 class="text-2xl font-semibold text-text-main-light">
					{{ project?.name || "Detalles del Proyecto" }}
				</h1>
				<p class="text-sm text-text-muted-light mt-1">
					{{ project?.description || "Proyecto sin descripción" }}
				</p>
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
			@click="handleImportComponents"
			class="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors">
			<ArrowDownTrayIcon class="w-4 h-4" />
			<span>Importar Componentes</span>
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
							<p class="text-xs text-text-muted-light">Valor Total</p>
							<p class="text-2xl font-bold text-text-main-light">
								${{ totalValue }}
							</p>
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

	<!-- Toast Notification -->
	<Toast :show="showToast" :message="toastMessage" :type="toastType" @close="showToast = false" />

	<!-- Import Modal -->
	<ImportModal
		v-if="showImportModal"
		:show="showImportModal"
		:projectId="route.params.id as string"
		@close="showImportModal = false"
		@notification="(data) => showToastMessage(data.message, data.type)"
		@file-selected-to-project="handleImportToProject" />
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
} from "@heroicons/vue/24/outline";

import { useDatabase } from "@/composables/useDatabase";
import { useCostCalculator } from "@/composables/useCostCalculator";
import { useFileParser } from "@/composables/useFileParser";
import { useRouter, useRoute } from "vue-router";
import type { BOMItem, BOMProject } from "@/types/bom";
import AddItemToProjectModal from "@/components/AddItemToProjectModal.vue";
import ProjectItemsTable from "@/components/project/ProjectItemsTable.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import Toast from "@/components/Toast.vue";
import ImportModal from "@/components/ImportModal.vue";
import { navigateTo } from "nuxt/app";

// Define page meta properties (using Nuxt's automatic route naming)
// name: "projects-id",
// layout: "default",

const router = useRouter();
const route = useRoute();
const db = useDatabase();
const { calculateProjectCost, formatCurrency, taxRate } = useCostCalculator();
const { showConfirmation } = useDialog();

// State
const project = ref<BOMProject | null>(null);
const projectItems = ref<any[]>([]);
const allItems = ref<any[]>([]);
const searchQuery = ref("");
const addItemSearchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = 10;
const showAddItemModal = ref(false);
const costBreakdown = ref<any>(null);

// Confirm Modal State
// const showConfirmModal = ref(false);
// const confirmModalTitle = ref("");
// const confirmModalMessage = ref("");
// const confirmModalConfirmText = ref("");
// const itemToDelete = ref<string | null>(null);

// Toast State
const showToast = ref(false);
const toastMessage = ref("");
const toastType = ref<"success" | "error" | "warning" | "info">("info");

// Import Modal State
const showImportModal = ref(false);

// Computed
const filteredItems = computed(() => {
	if (!searchQuery.value) return projectItems.value;

	const query = searchQuery.value.toLowerCase();
	return projectItems.value.filter(
		(item) =>
			item.name?.toLowerCase().includes(query) ||
			item.category?.toLowerCase().includes(query) ||
			item.part_number?.toLowerCase().includes(query)
	);
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
	return projectItems.value.filter(
		(item) => item.in_stock >= (item.min_stock || 0)
	).length;
});

const lowStockCount = computed(() => {
	return projectItems.value.filter(
		(item) => item.in_stock < (item.min_stock || 0)
	).length;
});

const totalValue = computed(() => {
	return projectItems.value
		.reduce((sum, item) => sum + (item.price || 0) * item.in_stock, 0)
		.toFixed(2);
});

const availableItems = computed(() => {
	if (!addItemSearchQuery.value)
		return allItems.value.filter(
			(item) => !projectItems.value.some((pi) => pi.id === item.id)
		);

	const query = addItemSearchQuery.value.toLowerCase();
	return allItems.value.filter(
		(item) =>
			!projectItems.value.some((pi) => pi.id === item.id) &&
			(item.name?.toLowerCase().includes(query) ||
				item.category?.toLowerCase().includes(query) ||
				item.part_number?.toLowerCase().includes(query))
	);
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
		const success = await db.updateProjectItemQuantity(
			projectId,
			itemId,
			newQuantity
		);
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

	const confirmed = await showConfirmation(
		"Remover Componente",
		"¿Estás seguro de remover este componente del proyecto? Esta acción no se puede deshacer.",
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
					showToastMessage("Componente removido del proyecto exitosamente", "success");
				}
			}
		} catch (error) {
			console.error("Error removiendo item del proyecto:", error);
			showToastMessage("Error al remover el componente del proyecto", "error");
		}
	}
};

const removeSelectedItemsFromProject = async (ids: string[]) => {
	const confirmed = await showConfirmation(
		"Remover Componentes",
		`¿Estás seguro de remover ${ids.length} componentes seleccionados del proyecto? Esta acción no se puede deshacer.`,
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
			showToastMessage(`${removedCount} componentes removidos del proyecto exitosamente`, "success");
		} catch (error) {
			console.error("Error removiendo items del proyecto:", error);
			showToastMessage("Error al remover los componentes del proyecto", "error");
		}
	}
};

const editItem = (item: any) => {
	// En la vista de proyecto, no hay edición directa de items
	// La edición se hace en el inventario general
	showToastMessage("La edición de componentes se realiza en el inventario general", "info");
};

const addItemToProject = async (item: any) => {
	const projectId = route.params.id as string;

	try {
		// Verificar si el item ya está en el proyecto
		const existingItem = projectItems.value.find((i) => i.id === item.id);
		if (existingItem) {
			showToastMessage("Este item ya está en el proyecto", "warning");
			return;
		}

		// Agregar item al proyecto con cantidad por defecto de 1
		const success = await db.addItemToProject(projectId, item.id, 1);
		if (success) {
			const itemToAdd = { ...item, quantity: 1 };
			projectItems.value.push(itemToAdd);
			closeAddItemModal();
			calculateProjectCostMethod();
			showToastMessage("Componente agregado al proyecto exitosamente", "success");
		}
	} catch (error) {
		console.error("Error agregando item al proyecto:", error);
		showToastMessage("Error al agregar el componente al proyecto", "error");
	}
};

const closeAddItemModal = () => {
	showAddItemModal.value = false;
	addItemSearchQuery.value = "";
};

const calculateProjectCostMethod = () => {
	if (projectItems.value.length > 0) {
		const quantities = projectItems.value.reduce(
			(acc, item) => {
				acc[item.id] = item.quantity || 1;
				return acc;
			},
			{} as Record<string, number>
		);

		costBreakdown.value = calculateProjectCost(projectItems.value, quantities);
	}
};

const exportProject = () => {
	showToastMessage("Funcionalidad de exportación del proyecto en desarrollo", "info");
	// TODO: Implementar exportación del proyecto
};

const goBack = async() => {
	await navigateTo({name:"projects"});
};

const handleAddItemSearch = (query: string) => {
	// Lógica para manejar la búsqueda en el modal de agregar item
	addItemSearchQuery.value = query;
};

const handleImportComponents = () => {
	showImportModal.value = true;
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
						errors.push(`Error al agregar item ${item.name || 'desconocido'} al proyecto`);
					}
				} else {
					errors.push(`Error al crear item ${item.name || 'desconocido'} en el inventario`);
				}
			}

			// Recargar los items del proyecto
			await loadProject();
			calculateProjectCostMethod();
			
			let message = `Importación completada: ${importedCount} items agregados al proyecto.`;
			if (errors.length > 0) {
				message += ` Errores: ${errors.length}.`;
				console.error('Errores durante la importación:', errors);
			}
			showToastMessage(message, importedCount > 0 ? "success" : "error");
		} else {
			showToastMessage(`Error en la importación: ${result.errors.join(", ")}`, "error");
		}
	} catch (error) {
		console.error("Error al importar archivo al proyecto:", error);
		showToastMessage("Error al importar archivo al proyecto", "error");
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

// Lifecycle
onMounted(async () => {
	await loadProject();
	calculateProjectCostMethod();
	// Asegurar que el modal de importación esté cerrado al cargar la página
	showImportModal.value = false;
});
</script>

<style scoped>
/* Estilos movidos a assets/css/app.css */
</style>