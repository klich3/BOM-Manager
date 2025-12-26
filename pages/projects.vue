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
					class="w-12 h-12 text-text-muted-light dark:text-text-muted-dark hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl flex items-center justify-center transition-colors"
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
					class="w-12 h-12 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-105"
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
						Gestión de Proyectos
					</h1>
				</div>
				<div class="flex items-center gap-4">
					<button
						@click="showAddProjectModal = true"
						class="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
					>
						<PlusIcon class="w-5 h-5" />
						<span>Nuevo Proyecto</span>
					</button>
				</div>
			</header>

			<!-- Projects Content -->
			<div class="p-8 pt-4">
				<!-- Stats Row -->
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
					<div
						class="bg-card-light dark:bg-card-dark rounded-2xl p-6 shadow-sm"
					>
						<div class="flex items-center gap-4">
							<div
								class="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center"
							>
								<RectangleStackIcon
									class="w-6 h-6 text-purple-600 dark:text-purple-400"
								/>
							</div>
							<div>
								<p
									class="text-xs text-text-muted-light dark:text-text-muted-dark"
								>
									Total Proyectos
								</p>
								<p
									class="text-3xl font-bold text-text-main-light dark:text-text-main-dark"
								>
									{{ projects.length }}
								</p>
							</div>
						</div>
					</div>

					<div
						class="bg-card-light dark:bg-card-dark rounded-2xl p-6 shadow-sm"
					>
						<div class="flex items-center gap-4">
							<div
								class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center"
							>
								<CheckCircleIcon
									class="w-6 h-6 text-green-600 dark:text-green-400"
								/>
							</div>
							<div>
								<p
									class="text-xs text-text-muted-light dark:text-text-muted-dark"
								>
									Proyectos Activos
								</p>
								<p
									class="text-3xl font-bold text-text-main-light dark:text-text-main-dark"
								>
									{{ projects.length }}
								</p>
							</div>
						</div>
					</div>

					<div
						class="bg-card-light dark:bg-card-dark rounded-2xl p-6 shadow-sm"
					>
						<div class="flex items-center gap-4">
							<div
								class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center"
							>
								<CurrencyDollarIcon
									class="w-6 h-6 text-blue-600 dark:text-blue-400"
								/>
							</div>
							<div>
								<p
									class="text-xs text-text-muted-light dark:text-text-muted-dark"
								>
									Valor Total
								</p>
								<p
									class="text-3xl font-bold text-text-main-light dark:text-text-main-dark"
								>
									$0.00
								</p>
							</div>
						</div>
					</div>
				</div>

				<!-- Search Bar -->
				<div
					class="bg-card-light dark:bg-card-dark rounded-2xl p-6 shadow-sm mb-6"
				>
					<div class="relative">
						<MagnifyingGlassIcon
							class="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
						/>
						<input
							v-model="searchQuery"
							type="text"
							placeholder="Buscar proyectos..."
							class="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light dark:text-text-main-dark"
						/>
					</div>
				</div>

				<!-- Projects Grid -->
				<div
					v-if="filteredProjects.length === 0"
					class="bg-card-light dark:bg-card-dark rounded-2xl p-12 shadow-sm text-center"
				>
					<RectangleStackIcon
						class="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600"
					/>
					<h3
						class="text-lg font-semibold text-text-main-light dark:text-text-main-dark mb-2"
					>
						No hay proyectos
					</h3>
					<p class="text-text-muted-light dark:text-text-muted-dark mb-6">
						Comienza creando tu primer proyecto
					</p>
					<button
						@click="showAddProjectModal = true"
						class="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
					>
						<PlusIcon class="w-5 h-5" />
						<span>Crear Proyecto</span>
					</button>
				</div>

				<div
					v-else
					class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
				>
					<div
						v-for="project in filteredProjects"
						:key="project.id"
						class="bg-card-light dark:bg-card-dark rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-primary/50"
						@click="viewProject(project.id)"
					>
						<div class="flex items-start justify-between mb-4">
							<div
								class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center"
							>
								<RectangleStackIcon class="w-6 h-6 text-primary" />
							</div>
							<div class="flex gap-2">
								<button
									@click.stop="editProject(project)"
									class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
								>
									<PencilIcon
										class="w-4 h-4 text-blue-600 dark:text-blue-400"
									/>
								</button>
								<button
									@click.stop="deleteProjectConfirm(project.id)"
									class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
								>
									<TrashIcon class="w-4 h-4 text-red-600 dark:text-red-400" />
								</button>
							</div>
						</div>

						<h3
							class="text-lg font-semibold text-text-main-light dark:text-text-main-dark mb-2"
						>
							{{ project.name }}
						</h3>
						<p
							class="text-sm text-text-muted-light dark:text-text-muted-dark mb-4 line-clamp-2"
						>
							{{ project.description || "Sin descripción" }}
						</p>

						<div
							class="flex items-center justify-between text-xs text-text-muted-light dark:text-text-muted-dark"
						>
							<span>{{ formatDate(project.created_at) }}</span>
							<div class="flex items-center gap-1">
								<CubeIcon class="w-4 h-4" />
								<span>0 items</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</main>

		<!-- Add Project Modal -->
		<div
			v-if="showAddProjectModal"
			class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
		>
			<div
				class="bg-card-light dark:bg-card-dark rounded-2xl shadow-xl max-w-lg w-full p-6"
			>
				<div class="flex items-center justify-between mb-6">
					<h2
						class="text-xl font-semibold text-text-main-light dark:text-text-main-dark"
					>
						{{ editingProject ? "Editar Proyecto" : "Nuevo Proyecto" }}
					</h2>
					<button
						@click="closeModal"
						class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
					>
						<XMarkIcon
							class="w-6 h-6 text-text-muted-light dark:text-text-muted-dark"
						/>
					</button>
				</div>

				<form @submit.prevent="saveProject" class="space-y-4">
					<div>
						<label
							class="block text-sm font-medium text-text-main-light dark:text-text-main-dark mb-2"
						>
							Nombre del Proyecto *
						</label>
						<input
							v-model="projectForm.name"
							type="text"
							required
							class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light dark:text-text-main-dark"
							placeholder="ej. PCB Main Controller v2.4"
						/>
					</div>

					<div>
						<label
							class="block text-sm font-medium text-text-main-light dark:text-text-main-dark mb-2"
						>
							Descripción
						</label>
						<textarea
							v-model="projectForm.description"
							rows="4"
							class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light dark:text-text-main-dark resize-none"
							placeholder="Describe el proyecto..."
						></textarea>
					</div>

					<div class="flex gap-3 pt-4">
						<button
							type="button"
							@click="closeModal"
							class="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-text-main-light dark:text-text-main-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
						>
							Cancelar
						</button>
						<button
							type="submit"
							class="flex-1 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium"
						>
							{{ editingProject ? "Guardar" : "Crear" }}
						</button>
					</div>
				</form>
			</div>
		</div>
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
	PlusIcon,
	CheckCircleIcon,
	CurrencyDollarIcon,
	MagnifyingGlassIcon,
	PencilIcon,
	TrashIcon,
	XMarkIcon,
} from "@heroicons/vue/24/outline";
import { useDatabase } from "../composables/useDatabase";
import { useRouter } from "vue-router";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const db = useDatabase();
const router = useRouter();

// State
const projects = ref<any[]>([]);
const searchQuery = ref("");
const showAddProjectModal = ref(false);
const editingProject = ref<any>(null);
const projectForm = ref({
	name: "",
	description: "",
});

// Computed
const filteredProjects = computed(() => {
	if (!searchQuery.value) return projects.value;

	const query = searchQuery.value.toLowerCase();
	return projects.value.filter(
		(project) =>
			project.name?.toLowerCase().includes(query) ||
			project.description?.toLowerCase().includes(query)
	);
});

// Methods
const loadProjects = async () => {
	try {
		projects.value = await db.getAllProjects();
	} catch (error) {
		console.error("Error cargando proyectos:", error);
	}
};

const saveProject = async () => {
	try {
		if (editingProject.value) {
			await db.updateProject(editingProject.value.id, projectForm.value);
		} else {
			await db.createProject(projectForm.value);
		}

		await loadProjects();
		closeModal();
	} catch (error) {
		console.error("Error guardando proyecto:", error);
	}
};

const editProject = (project: any) => {
	editingProject.value = project;
	projectForm.value = {
		name: project.name,
		description: project.description || "",
	};
	showAddProjectModal.value = true;
};

const deleteProjectConfirm = async (id: string) => {
	if (confirm("¿Estás seguro de eliminar este proyecto?")) {
		await db.deleteProject(id);
		await loadProjects();
	}
};

const viewProject = (id: string) => {
	// TODO: Navegar a la vista de detalle del proyecto
	console.log("Ver proyecto:", id);
};

const closeModal = () => {
	showAddProjectModal.value = false;
	editingProject.value = null;
	projectForm.value = {
		name: "",
		description: "",
	};
};

const formatDate = (dateString: string) => {
	try {
		return format(new Date(dateString), "dd MMM yyyy", { locale: es });
	} catch {
		return dateString;
	}
};

// Lifecycle
onMounted(async () => {
	await loadProjects();
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

.shadow-primary\/30 {
	box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.3);
}

.line-clamp-2 {
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}
</style>
