<template>
	<div
		class="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300"
	>
		<!-- Sidebar -->
		<aside
			class="fixed w-20 lg:w-24 h-screen flex flex-col items-center py-6 bg-card-light dark:bg-card-dark border-r border-gray-200 dark:border-gray-800 z-10"
		>
			<div class="mb-8">
				<div
					class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/30"
				>
					<CpuChipIcon class="w-6 h-6" />
				</div>
			</div>

			<nav class="flex-1 w-full flex flex-col items-center gap-4 px-2">
				<NuxtLink
					to="/"
					class="w-12 h-12 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-105"
				>
					<Squares2X2Icon class="w-6 h-6" />
				</NuxtLink>
				<NuxtLink
					to="/inventory"
					class="w-12 h-12 text-text-muted-light dark:text-text-muted-dark hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl flex items-center justify-center transition-colors"
				>
					<CubeIcon class="w-6 h-6" />
				</NuxtLink>
				<NuxtLink
					to="/projects"
					class="w-12 h-12 text-text-muted-light dark:text-text-muted-dark hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl flex items-center justify-center transition-colors"
				>
					<RectangleStackIcon class="w-6 h-6" />
				</NuxtLink>
			</nav>

			<div class="mt-auto flex flex-col items-center gap-4">
				<button
					class="w-12 h-12 text-text-muted-light dark:text-text-muted-dark hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl flex items-center justify-center transition-colors"
				>
					<Cog6ToothIcon class="w-6 h-6" />
				</button>
				<div
					class="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 overflow-hidden border-2 border-white dark:border-gray-700"
				>
					<div
						class="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600"
					>
						<UserIcon class="w-6 h-6" />
					</div>
				</div>
			</div>
		</aside>

		<!-- Main Content -->
		<main class="ml-20 lg:ml-24 min-h-screen">
			<!-- Header -->
			<header
				class="h-20 px-8 flex items-center justify-between bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-gray-800"
			>
				<div>
					<h1
						class="text-2xl font-semibold text-text-main-light dark:text-text-main-dark"
					>
						Component Monitoring
					</h1>
				</div>
				<div class="flex items-center gap-4">
					<button
						class="flex items-center gap-2 bg-gray-900 dark:bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
					>
						<BellIcon class="w-5 h-5" />
						<span
							v-if="stats.lowStock > 0"
							class="bg-red-500 text-white text-xs font-bold px-1.5 rounded-full"
							>{{ stats.lowStock }}</span
						>
						<span>Alertas</span>
					</button>
					<div
						class="flex items-center gap-3 bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-full text-sm font-medium"
					>
						<span class="text-text-muted-light dark:text-text-muted-dark"
							>Proyecto:</span
						>
						<span class="text-text-main-light dark:text-text-main-dark"
							>BOM Manager</span
						>
					</div>
				</div>
			</header>

			<!-- Dashboard Content -->
			<div class="p-8 pt-4">
				<div class="grid grid-cols-12 gap-6">
					<!-- Left Column -->
					<div class="col-span-12 lg:col-span-5 flex flex-col gap-6">
						<!-- Main Status Card -->
						<div
							class="bg-card-light dark:bg-card-dark rounded-3xl p-6 shadow-sm h-[380px] relative overflow-hidden group"
						>
							<div class="flex justify-between items-start z-10 relative">
								<div>
									<div
										class="flex items-center gap-2 text-text-muted-light dark:text-text-muted-dark text-sm mb-1"
									>
										<BuildingOfficeIcon class="w-5 h-5" />
										<span>Sistema de Inventario</span>
									</div>
									<h2
										class="text-4xl font-bold text-text-main-light dark:text-text-main-dark mt-2"
									>
										Activo
									</h2>
									<div class="flex items-center gap-2 mt-3">
										<CheckCircleIcon class="w-5 h-5 text-green-500" />
										<span class="text-sm font-medium">Sistema Operativo</span>
									</div>
									<div
										class="text-xs text-text-muted-light dark:text-text-muted-dark mt-1"
									>
										{{ currentDate }}
									</div>
								</div>
							</div>

							<div class="absolute bottom-6 right-6 z-10">
								<div
									class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 w-48"
								>
									<div class="flex justify-between items-start mb-2">
										<div
											class="bg-gray-900 text-white text-[10px] px-2 py-0.5 rounded"
										>
											ITEMS
										</div>
										<div class="w-2 h-2 rounded-full bg-green-500"></div>
									</div>
									<div class="text-center">
										<div
											class="text-xs font-bold text-text-main-light dark:text-text-main-dark"
										>
											{{ stats.totalItems }}
										</div>
										<div
											class="text-[10px] text-text-muted-light dark:text-text-muted-dark"
										>
											Total Componentes
										</div>
									</div>
								</div>
							</div>
						</div>

						<!-- Stats Grid -->
						<div class="grid grid-cols-2 gap-4">
							<div
								class="bg-primary rounded-3xl p-5 text-white flex flex-col justify-between shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow cursor-pointer relative overflow-hidden"
							>
								<div class="absolute top-0 right-0 p-4 opacity-20">
									<CheckCircleIcon class="w-16 h-16" />
								</div>
								<div class="flex justify-between items-start z-10">
									<div class="flex items-center gap-2">
										<CubeIcon class="w-5 h-5" />
										<span class="text-sm font-medium">Stock Health</span>
									</div>
								</div>
								<div class="z-10">
									<div class="flex items-end gap-2">
										<span class="text-4xl font-bold"
											>{{ stockHealthPercentage }}%</span
										>
									</div>
									<p class="text-xs opacity-80 mt-2">
										Inventario en niveles óptimos
									</p>
								</div>
							</div>

							<div
								class="bg-card-light dark:bg-card-dark rounded-3xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow cursor-pointer"
							>
								<div class="flex justify-between items-start">
									<div
										class="flex items-center gap-2 text-text-muted-light dark:text-text-muted-dark"
									>
										<RectangleStackIcon class="w-5 h-5" />
										<span class="text-sm font-medium">Proyectos</span>
									</div>
								</div>
								<div>
									<span
										class="text-4xl font-bold text-text-main-light dark:text-text-main-dark"
										>{{ stats.projects }}</span
									>
									<p
										class="text-xs text-text-muted-light dark:text-text-muted-dark mt-2"
									>
										Proyectos activos
									</p>
								</div>
							</div>

							<div
								class="bg-card-light dark:bg-card-dark rounded-3xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow cursor-pointer"
							>
								<div class="flex justify-between items-start">
									<div
										class="flex items-center gap-2 text-text-muted-light dark:text-text-muted-dark"
									>
										<CurrencyDollarIcon class="w-5 h-5" />
										<span class="text-sm font-medium">Valor Total</span>
									</div>
								</div>
								<div>
									<span
										class="text-4xl font-bold text-text-main-light dark:text-text-main-dark"
										>${{ formatValue(stats.totalValue) }}</span
									>
									<p
										class="text-xs text-text-muted-light dark:text-text-muted-dark mt-2"
									>
										Inversión en inventario
									</p>
								</div>
							</div>

							<div
								class="bg-card-light dark:bg-card-dark rounded-3xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow cursor-pointer border"
								:class="
									stats.lowStock > 0
										? 'border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-900/10'
										: 'border-transparent'
								"
							>
								<div class="flex justify-between items-start">
									<div
										class="flex items-center gap-2 text-text-muted-light dark:text-text-muted-dark"
									>
										<ExclamationTriangleIcon
											class="w-5 h-5"
											:class="stats.lowStock > 0 ? 'text-amber-500' : ''"
										/>
										<span class="text-sm font-medium">Alertas</span>
									</div>
								</div>
								<div>
									<span
										class="text-4xl font-bold"
										:class="
											stats.lowStock > 0
												? 'text-amber-600 dark:text-amber-400'
												: 'text-text-main-light dark:text-text-main-dark'
										"
										>{{ stats.lowStock }}</span
									>
									<p
										class="text-xs text-text-muted-light dark:text-text-muted-dark mt-2"
									>
										Stock bajo
									</p>
								</div>
							</div>
						</div>

						<!-- Quick Actions -->
						<div class="grid grid-cols-3 gap-4">
							<button
								@click="router.push('/inventory')"
								class="bg-card-light dark:bg-card-dark rounded-3xl p-4 shadow-sm hover:shadow-md transition-shadow"
							>
								<div class="flex justify-between items-start mb-2">
									<DocumentArrowUpIcon
										class="w-5 h-5 text-text-muted-light dark:text-text-muted-dark"
									/>
								</div>
								<div
									class="text-xs text-text-muted-light dark:text-text-muted-dark"
								>
									Importar
								</div>
								<div
									class="text-sm font-bold text-text-main-light dark:text-text-main-dark mt-1"
								>
									CSV/XLSX
								</div>
							</button>

							<button
								@click="router.push('/inventory')"
								class="bg-card-light dark:bg-card-dark rounded-3xl p-4 shadow-sm hover:shadow-md transition-shadow"
							>
								<div class="flex justify-between items-start mb-2">
									<CubeIcon
										class="w-5 h-5 text-text-muted-light dark:text-text-muted-dark"
									/>
								</div>
								<div
									class="text-xs text-text-muted-light dark:text-text-muted-dark"
								>
									Ver
								</div>
								<div
									class="text-sm font-bold text-text-main-light dark:text-text-main-dark mt-1"
								>
									Inventario
								</div>
							</button>

							<button
								@click="router.push('/projects')"
								class="bg-card-light dark:bg-card-dark rounded-3xl p-4 shadow-sm hover:shadow-md transition-shadow"
							>
								<div class="flex justify-between items-start mb-2">
									<RectangleStackIcon
										class="w-5 h-5 text-text-muted-light dark:text-text-muted-dark"
									/>
								</div>
								<div
									class="text-xs text-text-muted-light dark:text-text-muted-dark"
								>
									Gestionar
								</div>
								<div
									class="text-sm font-bold text-text-main-light dark:text-text-main-dark mt-1"
								>
									Proyectos
								</div>
							</button>
						</div>
					</div>

					<!-- Right Column -->
					<div class="col-span-12 lg:col-span-7 flex flex-col gap-6">
						<div class="flex justify-between items-center">
							<h3
								class="text-xl font-semibold text-text-main-light dark:text-text-main-dark"
							>
								Actividad Reciente
							</h3>
						</div>

						<div
							class="bg-card-light dark:bg-card-dark rounded-3xl p-6 shadow-sm"
						>
							<div
								class="text-center py-12 text-text-muted-light dark:text-text-muted-dark"
							>
								<CubeIcon class="w-12 h-12 mx-auto mb-4 opacity-50" />
								<p class="text-sm">No hay actividad reciente</p>
								<p class="text-xs mt-2">
									Comienza importando tu primer archivo BOM
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</main>
	</div>
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
import { useDatabase } from "../composables/useDatabase";
import { useRouter } from "vue-router";

const db = useDatabase();
const router = useRouter();

const stats = ref({
	totalItems: 0,
	projects: 0,
	lowStock: 0,
	totalValue: 0,
});

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

const formatValue = (value: number) => {
	return value.toLocaleString("es-ES", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
};

const loadStats = async () => {
	try {
		// Cargar total de items
		const items = await db.getAllItems();
		stats.value.totalItems = items.length;

		// Calcular stock bajo
		stats.value.lowStock = items.filter(
			(item) => item.in_stock < (item.min_stock || 0)
		).length;

		// Calcular valor total
		stats.value.totalValue = items.reduce(
			(sum, item) => sum + (item.price || 0) * item.in_stock,
			0
		);

		// Cargar proyectos
		const projects = await db.getAllProjects();
		stats.value.projects = projects.length;
	} catch (error) {
		console.error("Error cargando estadísticas:", error);
	}
};

onMounted(async () => {
	await loadStats();
});
</script>

<style scoped>
.bg-background-light {
	background-color: #f3f4f6;
}

.dark .bg-background-dark {
	background-color: #111827;
}

.bg-card-light {
	background-color: #ffffff;
}

.dark .bg-card-dark {
	background-color: #1f2937;
}

.text-text-main-light {
	color: #1f2937;
}

.dark .text-text-main-dark {
	color: #f9fafb;
}

.text-text-muted-light {
	color: #6b7280;
}

.dark .text-text-muted-dark {
	color: #9ca3af;
}

.bg-primary {
	background-color: #10b981;
}

.shadow-primary\/20 {
	box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2);
}

.shadow-primary\/40 {
	box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.4);
}
</style>
