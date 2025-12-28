<template>
	<!-- Main Content -->
	<main class="min-h-screen">
		<!-- Header -->
		<header
			class="h-20 px-8 flex items-center justify-between bg-background-light border-b border-gray-200"
		>
			<div>
				<h1 class="text-2xl font-semibold text-text-main-light">
					{{ project?.name || "Detalles del Proyecto" }}
				</h1>
				<p class="text-sm text-text-muted-light mt-1">
					{{ project?.description || "Proyecto sin descripción" }}
				</p>
			</div>
			<div class="flex items-center gap-4">
				<button
					@click="calculateProjectCostMethod"
					class="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
				>
					<CalculatorIcon class="w-5 h-5" />
					<span>Calcular Costos</span>
				</button>
				<button
					@click="exportProject"
					class="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
				>
					<DocumentArrowDownIcon class="w-5 h-5" />
					<span>Exportar</span>
				</button>
				<button
					@click="goBack"
					class="flex items-center gap-2 bg-gray-100 text-text-main-light px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
				>
					<ArrowLeftIcon class="w-5 h-5" />
					<span>Volver</span>
				</button>
			</div>
		</header>

		<!-- Project Content -->
		<div class="p-8 pt-4">
			<!-- Project Stats -->
			<div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
				<div class="bg-card-light rounded-2xl p-6 shadow-sm">
					<div class="flex items-center gap-4">
						<div
							class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center"
						>
							<CubeIcon class="w-6 h-6 text-blue-600" />
						</div>
						<div>
							<p class="text-xs text-text-muted-light">Total Items</p>
							<p class="text-3xl font-bold text-text-main-light">
								{{ projectItems.length }}
							</p>
						</div>
					</div>
				</div>

				<div class="bg-card-light rounded-2xl p-6 shadow-sm">
					<div class="flex items-center gap-4">
						<div
							class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center"
						>
							<CheckCircleIcon class="w-6 h-6 text-green-600" />
						</div>
						<div>
							<p class="text-xs text-text-muted-light">Stock OK</p>
							<p class="text-3xl font-bold text-text-main-light">
								{{ stockOK }}
							</p>
						</div>
					</div>
				</div>

				<div
					class="bg-card-light rounded-2xl p-6 shadow-sm border border-amber-200"
				>
					<div class="flex items-center gap-4">
						<div
							class="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center"
						>
							<ExclamationTriangleIcon class="w-6 h-6 text-amber-600" />
						</div>
						<div>
							<p class="text-xs text-text-muted-light">Stock Bajo</p>
							<p class="text-3xl font-bold text-amber-600">
								{{ lowStockCount }}
							</p>
						</div>
					</div>
				</div>

				<div class="bg-card-light rounded-2xl p-6 shadow-sm">
					<div class="flex items-center gap-4">
						<div
							class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center"
						>
							<CurrencyDollarIcon class="w-6 h-6 text-purple-600" />
						</div>
						<div>
							<p class="text-xs text-text-muted-light">Valor Total</p>
							<p class="text-3xl font-bold text-text-main-light">
								${{ totalValue }}
							</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Project Items Table -->
			<ProjectItemsTable :items="projectItems" @import-components="handleImportComponents" />
		</div>
	</main>

	<!-- Add Item to Project Modal -->
	<AddItemToProjectModal
		:show="showAddItemModal"
		:items="availableItems"
		@close="closeAddItemModal"
		@add="addItemToProject"
		@search="handleAddItemSearch"
	/>

</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
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
	PlusIcon,
	TrashIcon,
	XMarkIcon,
} from "@heroicons/vue/24/outline";
import { useDatabase } from "@/composables/useDatabase";
import { useCostCalculator } from "@/composables/useCostCalculator";
import { useRouter, useRoute } from "vue-router";
import type { BOMItem, BOMProject } from "@/types/bom";
import AddItemToProjectModal from "@/components/AddItemToProjectModal.vue";
import ProjectItemsTable from "@/components/project/ProjectItemsTable.vue";
import { navigateTo } from "nuxt/app";

definePageMeta({
	name: "projects-id",
	layout: "default",
});

const router = useRouter();
const route = useRoute();
const db = useDatabase();
const { calculateProjectCost, formatCurrency, taxRate } = useCostCalculator();

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

	if (confirm("¿Estás seguro de remover este item del proyecto?")) {
		try {
			const success = await db.removeItemFromProject(projectId, itemId);
			if (success) {
				const index = projectItems.value.findIndex((i) => i.id === itemId);
				if (index !== -1) {
					projectItems.value.splice(index, 1);
					// Recalcular costos
					calculateProjectCostMethod();
				}
			}
		} catch (error) {
			console.error("Error removiendo item del proyecto:", error);
		}
	}
};

const addItemToProject = async (item: any) => {
	const projectId = route.params.id as string;

	try {
		// Verificar si el item ya está en el proyecto
		const existingItem = projectItems.value.find((i) => i.id === item.id);
		if (existingItem) {
			alert("Este item ya está en el proyecto");
			return;
		}

		// Agregar item al proyecto con cantidad por defecto de 1
		const success = await db.addItemToProject(projectId, item.id, 1);
		if (success) {
			const itemToAdd = { ...item, quantity: 1 };
			projectItems.value.push(itemToAdd);
			closeAddItemModal();
			calculateProjectCostMethod();
		}
	} catch (error) {
		console.error("Error agregando item al proyecto:", error);
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
	alert("Funcionalidad de exportación del proyecto");
	// TODO: Implementar exportación del proyecto
};

const goBack = async() => {
	await navigateTo({name:"projects"});
};

const handleAddItemSearch = (query: string) => {
	// Lógica para manejar la búsqueda en el modal de agregar item
	console.log("Búsqueda de items:", query);
};

const handleImportComponents = (importData: { type: string }) => {
	console.log('Importing components:', importData);
	// Aquí se implementaría la lógica para importar componentes
	// dependiendo del tipo de importación (EasyEDA, CSV, JSON)
	switch(importData.type) {
		case 'easyeda':
			// Implementar lógica para importar desde EasyEDA
			console.log('Importing from EasyEDA');
			break;
		case 'csv':
			// Implementar lógica para importar desde CSV
			console.log('Importing from CSV');
			break;
		case 'json':
			// Implementar lógica para importar desde JSON
			console.log('Importing from JSON');
			break;
		default:
			console.log('Unknown import type');
	}
};

// Lifecycle
onMounted(async () => {
	await loadProject();
	calculateProjectCostMethod();
});
</script>

<style scoped>
/* Estilos movidos a assets/css/app.css */
</style>
