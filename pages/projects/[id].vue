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
			<div class="bg-card-light rounded-2xl shadow-sm overflow-hidden mb-6">
				<div
					class="p-6 border-b border-gray-200 flex items-center justify-between"
				>
					<h2 class="text-lg font-semibold text-text-main-light">
						Items del Proyecto
					</h2>
					<div class="flex items-center gap-3">
						<div class="relative">
							<MagnifyingGlassIcon
								class="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
							/>
							<input
								v-model="searchQuery"
								type="text"
								placeholder="Buscar items..."
								class="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light"
							/>
						</div>
						<button
							@click="showAddItemModal = true"
							class="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
						>
							<PlusIcon class="w-4 h-4" />
							<span>Agregar Item</span>
						</button>
					</div>
				</div>

				<div class="overflow-x-auto">
					<table class="w-full">
						<thead class="bg-gray-50">
							<tr>
								<th
									class="px-6 py-4 text-left text-xs font-semibold text-text-muted-light uppercase"
								>
									Componente
								</th>
								<th
									class="px-6 py-4 text-left text-xs font-semibold text-text-muted-light uppercase"
								>
									Categoría
								</th>
								<th
									class="px-6 py-4 text-left text-xs font-semibold text-text-muted-light uppercase"
								>
									Cantidad
								</th>
								<th
									class="px-6 py-4 text-left text-xs font-semibold text-text-muted-light uppercase"
								>
									Stock
								</th>
								<th
									class="px-6 py-4 text-left text-xs font-semibold text-text-muted-light uppercase"
								>
									Precio
								</th>
								<th
									class="px-6 py-4 text-left text-xs font-semibold text-text-muted-light uppercase"
								>
									Total
								</th>
								<th
									class="px-6 py-4 text-left text-xs font-semibold text-text-muted-light uppercase"
								>
									Acciones
								</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200">
							<tr v-if="filteredItems.length === 0">
								<td colspan="7" class="px-6 py-12 text-center">
									<CubeIcon class="w-12 h-12 mx-auto mb-4 text-gray-300" />
									<p class="text-text-muted-light">
										No hay items en este proyecto
									</p>
									<button
										@click="showAddItemModal = true"
										class="mt-4 text-primary hover:underline text-sm font-medium"
									>
										Agregar primer item
									</button>
								</td>
							</tr>
							<tr
								v-for="item in paginatedItems"
								:key="item.id"
								class="hover:bg-gray-50 transition-colors"
							>
								<td class="px-6 py-4">
									<div>
										<p class="text-sm font-semibold text-text-main-light">
											{{ item.name }}
										</p>
										<p class="text-xs text-text-muted-light">
											{{ item.part_number || "N/A" }}
										</p>
									</div>
								</td>
								<td class="px-6 py-4">
									<span
										class="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs font-medium"
									>
										{{ item.category || "Sin categoría" }}
									</span>
								</td>
								<td class="px-6 py-4">
									<div class="flex items-center gap-2">
										<input
											v-model.number="item.quantity"
											type="number"
											min="1"
											step="1"
											@change="updateItemQuantity(item.id, item.quantity)"
											class="w-20 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light text-sm"
										/>
									</div>
								</td>
								<td class="px-6 py-4">
									<div class="flex items-center gap-2">
										<div
											class="w-2 h-2 rounded-full"
											:class="
												item.in_stock < (item.min_stock || 0)
													? 'bg-amber-500'
													: 'bg-green-500'
											"
										></div>
										<span class="text-sm text-text-main-light">
											{{ item.in_stock }} {{ item.unit }}
										</span>
									</div>
								</td>
								<td class="px-6 py-4 text-sm font-medium text-text-main-light">
									${{ (item.price || 0).toFixed(2) }}
								</td>
								<td class="px-6 py-4 text-sm font-medium text-text-main-light">
									${{ calculateItemTotal(item).toFixed(2) }}
								</td>
								<td class="px-6 py-4">
									<div class="flex items-center gap-2">
										<button
											@click="removeItemFromProject(item.id)"
											class="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
										>
											<TrashIcon class="w-4 h-4 text-red-600" />
										</button>
									</div>
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				<!-- Pagination -->
				<div
					v-if="totalPages > 1"
					class="px-6 py-4 border-t border-gray-200 flex items-center justify-between"
				>
					<p class="text-sm text-text-muted-light">
						Mostrando {{ (currentPage - 1) * itemsPerPage + 1 }} a
						{{ Math.min(currentPage * itemsPerPage, filteredItems.length) }}
						de {{ filteredItems.length }} items
					</p>
					<div class="flex gap-2">
						<button
							@click="currentPage--"
							:disabled="currentPage === 1"
							class="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
						>
							Anterior
						</button>
						<button
							@click="currentPage++"
							:disabled="currentPage === totalPages"
							class="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
						>
							Siguiente
						</button>
					</div>
				</div>
			</div>

			<!-- Cost Breakdown -->
			<div v-if="costBreakdown" class="bg-card-light rounded-2xl p-6 shadow-sm">
				<h2 class="text-lg font-semibold text-text-main-light mb-4">
					Desglose de Costos
				</h2>

				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
					<div class="bg-gray-50 rounded-xl p-4">
						<p class="text-sm text-text-muted-light">Subtotal</p>
						<p class="text-xl font-bold text-text-main-light">
							{{ formatCurrency(costBreakdown.summary.subtotal) }}
						</p>
					</div>
					<div class="bg-gray-50 rounded-xl p-4">
						<p class="text-sm text-text-muted-light">
							Impuestos ({{ (taxRate * 100).toFixed(0) }}%)
						</p>
						<p class="text-xl font-bold text-text-main-light">
							{{ formatCurrency(costBreakdown.summary.tax) }}
						</p>
					</div>
					<div class="bg-gray-50 rounded-xl p-4">
						<p class="text-sm text-text-muted-light">Envío</p>
						<p class="text-xl font-bold text-text-main-light">
							{{ formatCurrency(costBreakdown.summary.shipping) }}
						</p>
					</div>
					<div class="bg-primary/10 rounded-xl p-4">
						<p class="text-sm text-text-muted-light">Total</p>
						<p class="text-xl font-bold text-primary">
							{{ formatCurrency(costBreakdown.summary.total) }}
						</p>
					</div>
				</div>

				<div class="overflow-x-auto">
					<table class="w-full">
						<thead class="bg-gray-50">
							<tr>
								<th
									class="px-4 py-3 text-left text-xs font-semibold text-text-muted-light uppercase"
								>
									Componente
								</th>
								<th
									class="px-4 py-3 text-left text-xs font-semibold text-text-muted-light uppercase"
								>
									Cantidad
								</th>
								<th
									class="px-4 py-3 text-left text-xs font-semibold text-text-muted-light uppercase"
								>
									Costo Unitario
								</th>
								<th
									class="px-4 py-3 text-left text-xs font-semibold text-text-muted-light uppercase"
								>
									Total
								</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200">
							<tr
								v-for="itemCost in costBreakdown.items"
								:key="itemCost.item.id"
							>
								<td class="px-4 py-3 text-sm text-text-main-light">
									{{ itemCost.item.name }}
								</td>
								<td class="px-4 py-3 text-sm text-text-main-light">
									{{ itemCost.quantity }}
								</td>
								<td class="px-4 py-3 text-sm text-text-main-light">
									{{ formatCurrency(itemCost.unitCost) }}
								</td>
								<td class="px-4 py-3 text-sm font-medium text-text-main-light">
									{{ formatCurrency(itemCost.totalCost) }}
								</td>
							</tr>
						</tbody>
					</table>
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

const goBack = () => {
	router.push("/projects");
};

const handleAddItemSearch = (query: string) => {
	// Lógica para manejar la búsqueda en el modal de agregar item
	console.log("Búsqueda de items:", query);
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
