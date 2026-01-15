<template>
	<!-- Main Content -->
	<main class="min-h-screen">
		<!-- Header -->
		<header class="h-20 px-8 flex items-center justify-between bg-background-light border-b border-gray-200">
			<div>
				<h1 class="text-2xl font-semibold text-text-main-light">{{ t("component_monitoring") }}</h1>
			</div>
			<div class="flex items-center gap-4">
				<button
					class="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
					<BellIcon class="w-5 h-5" />
					<span
						v-if="stats.lowStock > 0 || unreadNotificationsCount > 0"
						class="bg-red-500 text-white text-xs font-bold px-1.5 rounded-full"
						>{{ stats.lowStock + unreadNotificationsCount }}</span
					>
					<span>{{ t("alerts") }}</span>
				</button>
			</div>
		</header>

		<!-- Dashboard Content -->
		<div class="p-8 pt-4">
			<div v-if="loading" class="flex justify-center items-center h-64">
				<div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
			</div>
			<div v-else class="grid grid-cols-12 gap-6">
				<!-- Left Column -->
				<div class="col-span-12 lg:col-span-5 flex flex-col gap-6">
					<!-- Stats Grid -->
					<div class="grid grid-cols-2 gap-4">
						<StockHealthIndicator
							:percentage="stockHealthPercentage"
							:title="t('stock_health')"
							:status-text="t('inventory_optimal')" />

						<StatCard
							:title="t('inventory')"
							:value="stats.totalItems"
							:subtitle="t('total_items')"
							value-type="number">
							<template #title>{{ t("inventory") }}</template>
							<template #subtitle>{{ t("total_items") }}</template>
						</StatCard>

						<StatCard
							:title="t('projects')"
							:value="stats.projects"
							:subtitle="t('active_projects')"
							value-type="number">
							<template #title>{{ t("projects") }}</template>
							<template #subtitle>{{ t("active_projects") }}</template>
						</StatCard>

						<StatCard
							:title="t('total_value')"
							:value="stats.totalValue"
							:subtitle="t('inventory_investment')"
							value-type="currency"
							:format-value="formatValue">
							<template #title>{{ t("total_value") }}</template>
							<template #subtitle>{{ t("inventory_investment") }}</template>
						</StatCard>
					</div>

					<!-- Quick Actions -->
					<div class="grid grid-cols-3 gap-4">
						<button
							@click="showImportModal = true"
							class="bg-card-light rounded-3xl p-4 shadow-sm hover:shadow-md transition-shadow w-full">
							<div class="flex justify-between items-start mb-2">
								<DocumentArrowUpIcon class="w-5 h-5 text-text-muted-light" />
							</div>
							<div class="text-xs text-text-muted-light">{{ t("import") }}</div>
							<div class="text-sm font-bold text-text-main-light mt-1">{{ t("import_csv_xlsx") }}</div>
						</button>

						<NuxtLink :to="{ name: 'inventory' }" class="block">
							<button
								class="bg-card-light rounded-3xl p-4 shadow-sm hover:shadow-md transition-shadow w-full">
								<div class="flex justify-between items-start mb-2">
									<CubeIcon class="w-5 h-5 text-text-muted-light" />
								</div>
								<div class="text-xs text-text-muted-light">{{ t("view") }}</div>
								<div class="text-sm font-bold text-text-main-light mt-1">{{ t("inventory") }}</div>
							</button>
						</NuxtLink>

						<NuxtLink :to="{ name: 'projects' }" class="block">
							<button
								class="bg-card-light rounded-3xl p-4 shadow-sm hover:shadow-md transition-shadow w-full">
								<div class="flex justify-between items-start mb-2">
									<RectangleStackIcon class="w-5 h-5 text-text-muted-light" />
								</div>
								<div class="text-xs text-text-muted-light">{{ t("manage") }}</div>
								<div class="text-sm font-bold text-text-main-light mt-1">{{ t("projects") }}</div>
							</button>
						</NuxtLink>
					</div>
				</div>

				<!-- Right Column -->
				<div class="col-span-12 lg:col-span-7 flex flex-col gap-6">
					<div v-if="lowStockItems.length > 0">
						<h3 class="text-xl font-semibold text-text-main-light mb-4 flex items-center gap-2">
							<ExclamationTriangleIcon class="w-6 h-6 text-amber-500" />
							{{ t("low_stock") }}
						</h3>
						<div class="bg-card-light rounded-3xl p-6 shadow-sm border border-amber-100">
							<div class="space-y-4">
								<div
									v-for="item in lowStockItems.slice(0, 5)"
									:key="item.id"
									class="flex items-center justify-between">
									<div class="flex flex-col">
										<span class="text-sm font-medium text-text-main-light">{{ item.name }}</span>
										<span class="text-xs text-text-muted-light">{{
											item.part_number || item.lcsc_part || "Sin ref"
										}}</span>
									</div>
									<div class="flex items-center gap-4">
										<div class="text-right">
											<p class="text-xs text-text-muted-light">Stock</p>
											<p class="text-sm font-bold text-amber-600">
												{{ item.in_stock || 0 }} / {{ item.min_stock }}
											</p>
										</div>
										<NuxtLink :to="{ name: 'inventory', query: { search: item.name } }">
											<button class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
												<ShoppingCartIcon class="w-4 h-4 text-primary" />
											</button>
										</NuxtLink>
									</div>
								</div>
								<div v-if="lowStockItems.length > 5" class="text-center pt-2">
									<NuxtLink
										:to="{ name: 'inventory' }"
										class="text-sm text-primary font-medium hover:underline">
										{{ t("see_all") }} ({{ lowStockItems.length }})
									</NuxtLink>
								</div>
							</div>
						</div>
					</div>

					<div class="flex justify-between items-center">
						<h3 class="text-xl font-semibold text-text-main-light">{{ t("recent_activity") }}</h3>
					</div>

					<div class="bg-card-light rounded-3xl p-6 shadow-sm">
						<div v-if="recentActivity.length > 0">
							<!-- Mostrar actividad reciente si hay datos -->
							<div
								v-for="activity in recentActivity"
								:key="activity.id"
								class="py-2 border-b border-gray-100 last:border-b-0">
								<div class="flex items-center justify-between">
									<div class="flex items-center gap-3">
										<div class="w-2 h-2 rounded-full bg-green-500"></div>
										<span class="text-sm">{{ activity.description }}</span>
									</div>
									<span class="text-xs text-text-muted-light">{{ activity.date }}</span>
								</div>
							</div>
						</div>
						<div v-else class="text-center py-12 text-text-muted-light">
							<CubeIcon class="w-12 h-12 mx-auto mb-4 opacity-50" />
							<p class="text-sm">{{ t("no_recent_activity") }}</p>
							<p class="text-xs mt-2">{{ t("start_importing_bom") }}</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</main>

	<!-- Import Modal -->
	<ImportModal
		v-if="showImportModal"
		@close="showImportModal = false"
		@import-completed="handleImportCompleted"
		@error="handleImportError" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useDatabase } from "@/composables/useDatabase";
import { useI18n } from "@/composables/useI18n";
import { useNotifications } from "@/composables/useNotifications";
import {
	CubeIcon,
	DocumentArrowUpIcon,
	RectangleStackIcon,
	BellIcon,
	Squares2X2Icon,
	ExclamationTriangleIcon,
	ShoppingCartIcon,
} from "@heroicons/vue/24/outline";
import StatCard from "@/components/dashboard/StatCard.vue";
import StockHealthIndicator from "@/components/dashboard/StockHealthIndicator.vue";
import ImportModal from "@/components/ImportModal.vue";

// Definir metadatos de la página
definePageMeta({
	name: "home",
	layout: "default",
});

// State
const db = useDatabase();
const { t, lang } = useI18n();
const { success, error: notifyError } = useNotifications();

const showImportModal = ref(false);
const unreadNotificationsCount = ref(0);
const recentActivity = ref<any[]>([]);
const loading = ref(true);
const lowStockItems = ref<any[]>([]);

const stats = ref({
	totalItems: 0,
	lowStock: 0,
	totalValue: 0,
	projects: 0,
});

const currentDate = computed(() => {
	const now = new Date();
	return now.toLocaleDateString(lang.value === "es" ? "es-ES" : "en-US", {
		weekday: "short",
		day: "numeric",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
});

const stockHealthPercentage = computed(() => {
	if (stats.value.totalItems === 0) return 100;
	const healthyItems = stats.value.totalItems - stats.value.lowStock;
	return Math.round((healthyItems / stats.value.totalItems) * 100);
});

const formatValue = (value: number | string) => {
	let v = typeof value === "string" ? parseFloat(value) : value;

	return v.toLocaleString("es-ES", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
};

const loadStats = async () => {
	try {
		// Cargar total de items
		const items = await db.getAllItems();
		stats.value.totalItems = items.length;

		// Items con stock bajo
		lowStockItems.value = items.filter(
			(item) =>
				(item.in_stock !== undefined && item.in_stock !== null ? item.in_stock : 0) < (item.min_stock || 0) &&
				(item.min_stock || 0) > 0,
		);

		// Calcular stock bajo usando in_stock
		stats.value.lowStock = items.filter(
			(item) =>
				(item.in_stock !== undefined && item.in_stock !== null ? item.in_stock : 0) < (item.min_stock || 0) &&
				(item.min_stock || 0) > 0,
		).length;

		// Calcular valor total basado en price e in_stock (valor actual del inventario)
		stats.value.totalValue = items.reduce((sum, item) => sum + (item.price || 0) * (item.in_stock || 0), 0);

		// Cargar proyectos
		const projects = await db.getAllProjects();
		stats.value.projects = projects.length;
	} catch (error) {
		console.error("Error cargando estadísticas:", error);
	}
};

const loadUnreadNotificationsCount = async () => {
	try {
		unreadNotificationsCount.value = await db.getUnreadNotificationsCount();
	} catch (error) {
		console.error("Error cargando conteo de notificaciones:", error);
		unreadNotificationsCount.value = 0;
	}
};

const loadRecentActivity = async () => {
	try {
		const activity = await db.getAllActivity(10); // Obtener las últimas 10 actividades
		recentActivity.value = activity.map((item: any) => ({
			id: item.id,
			description: item.description,
			date: formatDate(new Date(item.created_at)),
		}));
	} catch (error) {
		console.error("Error cargando actividad reciente:", error);
		recentActivity.value = [];
	}
};

const handleImportCompleted = async (data: {
	importedCount: number;
	errors: string[];
	destination: "global" | "project";
	projectId?: string;
}) => {
	// Actualizar las estadísticas después de la importación si fue al inventario global
	if (data.destination === "global") {
		await loadStats();
		await loadRecentActivity(); // Refrescar también la actividad reciente
	}
	// Si fue a un proyecto específico, podríamos refrescar esa información también
	success(t("import"), t("import_modal.items_imported_success"));
};

const handleImportError = (message: string) => {
	console.error("Error de importación:", message);
	notifyError(t("import"), t("import_modal.import_error_msg", { message }));
};

const formatDate = (date: Date) => {
	return date.toLocaleDateString(lang.value === "es" ? "es-ES" : "en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};

onMounted(async () => {
	try {
		await loadStats();
		await loadUnreadNotificationsCount();
		await loadRecentActivity();
	} catch (error) {
		console.error("Error en mounted:", error);
	} finally {
		loading.value = false;
	}
});
</script>

<style scoped>
/* Estilos movidos a assets/css/app.css */
</style>
