<template>
	<!-- Main Content -->
	<main class="min-h-screen">
		<!-- Header -->
		<header class="h-20 px-8 flex items-center justify-between bg-background-light border-b border-gray-200">
			<div>
				<h1 class="text-2xl font-semibold text-text-main-light">Component Monitoring</h1>
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
					<span>Alertas</span>
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
							:title="'Stock Health'"
							:status-text="'Inventario en niveles óptimos'" />

						<StatCard title="Items" :value="stats.totalItems" subtitle="Total" value-type="number">
							<template #title>Items</template>
							<template #subtitle>Total</template>
						</StatCard>

						<StatCard
							title="Proyectos"
							:value="stats.projects"
							subtitle="Proyectos activos"
							value-type="number">
							<template #title>Proyectos</template>
							<template #subtitle>Proyectos activos</template>
						</StatCard>

						<StatCard
							title="Valor Total"
							:value="formatValue(stats.totalValue)"
							subtitle="Inversión en inventario"
							value-type="currency">
							<template #title>Valor Total</template>
							<template #subtitle>Inversión en inventario</template>
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
							<div class="text-xs text-text-muted-light">Importar</div>
							<div class="text-sm font-bold text-text-main-light mt-1">CSV/XLSX</div>
						</button>

						<NuxtLink :to="{ name: 'inventory' }" class="block">
							<button
								class="bg-card-light rounded-3xl p-4 shadow-sm hover:shadow-md transition-shadow w-full">
								<div class="flex justify-between items-start mb-2">
									<CubeIcon class="w-5 h-5 text-text-muted-light" />
								</div>
								<div class="text-xs text-text-muted-light">Ver</div>
								<div class="text-sm font-bold text-text-main-light mt-1">Inventario</div>
							</button>
						</NuxtLink>

						<NuxtLink :to="{ name: 'projects' }" class="block">
							<button
								class="bg-card-light rounded-3xl p-4 shadow-sm hover:shadow-md transition-shadow w-full">
								<div class="flex justify-between items-start mb-2">
									<RectangleStackIcon class="w-5 h-5 text-text-muted-light" />
								</div>
								<div class="text-xs text-text-muted-light">Gestionar</div>
								<div class="text-sm font-bold text-text-main-light mt-1">Proyectos</div>
							</button>
						</NuxtLink>
					</div>
				</div>

				<!-- Right Column -->
				<div class="col-span-12 lg:col-span-7 flex flex-col gap-6">
					<div class="flex justify-between items-center">
						<h3 class="text-xl font-semibold text-text-main-light">Actividad Reciente</h3>
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
							<p class="text-sm">No hay actividad reciente</p>
							<p class="text-xs mt-2">Comienza importando tu primer archivo BOM</p>
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
import {
	CpuChipIcon,
	Squares2X2Icon,
	CubeIcon,
	RectangleStackIcon,
	Cog6ToothIcon,
	UserIcon,
	BellIcon,
	BuildingOfficeIcon,
	CheckCircleIcon,
	CurrencyDollarIcon,
	ExclamationTriangleIcon,
	DocumentArrowUpIcon,
} from "@heroicons/vue/24/outline";
import { useDatabase } from "@/composables/useDatabase";
import { useRouter } from "vue-router";
import StockHealthIndicator from "@/components/dashboard/StockHealthIndicator.vue";
import StatCard from "@/components/dashboard/StatCard.vue";
import ImportModal from "@/components/ImportModal.vue";

definePageMeta({
	name: "home",
	layout: "default",
});

const db = useDatabase();
const router = useRouter();

const loading = ref(true);
const showImportModal = ref(false);
const stats = ref({
	totalItems: 0,
	projects: 0,
	lowStock: 0,
	totalValue: 0,
});

// Variable para contar notificaciones no leídas
const unreadNotificationsCount = ref(0);

// Nueva variable para la actividad reciente
const recentActivity = ref<{ id: string; description: string; date: string }[]>([]);

const currentDate = computed(() => {
	const now = new Date();
	return now.toLocaleDateString("es-ES", {
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

const formatValue = (value: number | String) => {
	let v = value instanceof String ? parseFloat(value) : value;

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

		// Calcular stock bajo - antes usábamos in_stock pero ahora usamos quantity
		// Ahora calculamos cuántos items tienen quantity menor que min_stock
		stats.value.lowStock = items.filter(
			(item) => (item.quantity || 0) < (item.min_stock || 0) && (item.min_stock || 0) > 0,
		).length;

		// Calcular valor total - antes usábamos in_stock pero ahora no existe
		// Ahora calculamos el valor total basado en price y quantity
		stats.value.totalValue = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);

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

const handleImportCompleted = async () => {
	// Actualizar las estadísticas después de la importación
	await loadStats();
	showToastMessage("Items importados exitosamente", "success");
};

const handleImportError = (message: string) => {
	console.error("Error de importación:", message);
	showToastMessage(`Error en la importación: ${message}`, "error");
};

// Función para mostrar mensajes de toast (si no existe)
const showToastMessage = (message: string, type: "success" | "error" | "warning" | "info" = "info") => {
	// Aquí podríamos usar un sistema de notificaciones real
	console.log(`${type}: ${message}`);
};

const formatDate = (date: Date) => {
	return date.toLocaleDateString("es-ES", {
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
