<template>
	<!-- Main Content -->
	<main class="min-h-screen">
		<!-- Header -->
		<header class="h-20 px-8 flex items-center justify-between bg-background-light border-b border-gray-200">
			<div>
				<h1 class="text-2xl font-semibold text-text-main-light">Gestión de Proyectos</h1>
			</div>
			<div class="flex items-center gap-4">
				<button
					@click="showAddProjectModal = true"
					class="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors">
					<PlusIcon class="w-5 h-5" />
					<span>Nuevo Proyecto</span>
				</button>
			</div>
		</header>

		<!-- Projects Content -->
		<div class="p-8 pt-4">
			<!-- Stats Row -->
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
				<div class="bg-card-light rounded-2xl p-6 shadow-sm">
					<div class="flex items-center gap-4">
						<div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
							<RectangleStackIcon class="w-6 h-6 text-purple-600" />
						</div>
						<div>
							<p class="text-xs text-text-muted-light">Total Proyectos</p>
							<p class="text-3xl font-bold text-text-main-light">
								{{ projects.length }}
							</p>
						</div>
					</div>
				</div>

				<div class="bg-card-light rounded-2xl p-6 shadow-sm">
					<div class="flex items-center gap-4">
						<div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
							<CheckCircleIcon class="w-6 h-6 text-green-600" />
						</div>
						<div>
							<p class="text-xs text-text-muted-light">Proyectos Activos</p>
							<p class="text-3xl font-bold text-text-main-light">
								{{ projects.length }}
							</p>
						</div>
					</div>
				</div>

				<div class="bg-card-light rounded-2xl p-6 shadow-sm">
					<div class="flex items-center gap-4">
						<div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
							<CurrencyDollarIcon class="w-6 h-6 text-blue-600" />
						</div>
						<div>
							<p class="text-xs text-text-muted-light">Valor Total</p>
							<p class="text-3xl font-bold text-text-main-light">$0.00</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Search Bar -->
			<div class="bg-card-light rounded-2xl p-6 shadow-sm mb-6">
				<div class="relative">
					<MagnifyingGlassIcon
						class="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
					<input
						v-model="searchQuery"
						type="text"
						placeholder="Buscar proyectos..."
						class="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light" />
				</div>
			</div>

			<!-- Projects Grid -->
			<div v-if="filteredProjects.length === 0" class="bg-card-light rounded-2xl p-12 shadow-sm text-center">
				<RectangleStackIcon class="w-16 h-16 mx-auto mb-4 text-gray-300" />
				<h3 class="text-lg font-semibold text-text-main-light mb-2">No hay proyectos</h3>
				<p class="text-text-muted-light mb-6">Comienza creando tu primer proyecto</p>
				<button
					@click="showAddProjectModal = true"
					class="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors">
					<PlusIcon class="w-5 h-5" />
					<span>Crear Proyecto</span>
				</button>
			</div>

			<div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				<div
					v-for="project in filteredProjects"
					:key="project.id"
					class="bg-card-light rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-primary/50"
					@click="viewProject(project.id)">
					<div class="flex items-start justify-between mb-4">
						<div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
							<RectangleStackIcon class="w-6 h-6 text-primary" />
						</div>
						<div class="flex gap-2">
							<button
								@click.stop="editProject(project)"
								class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
								<PencilIcon class="w-4 h-4 text-blue-600" />
							</button>
							<button
								@click.stop="deleteProjectConfirm(project.id)"
								class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
								<TrashIcon class="w-4 h-4 text-red-600" />
							</button>
						</div>
					</div>

					<h3 class="text-lg font-semibold text-text-main-light mb-2">
						{{ project.name }}
					</h3>
					<p class="text-sm text-text-muted-light mb-4 line-clamp-2">
						{{ project.description || "Sin descripción" }}
					</p>

					<div class="flex items-center justify-between text-xs text-text-muted-light">
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
	<ProjectModal
		:show="showAddProjectModal"
		:editing-project="editingProject"
		@close="closeModal"
		@save="handleSaveProject" />
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
import { useDatabase } from "@/composables/useDatabase";
import { useRouter } from "vue-router";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import ProjectModal from "@/components/ProjectModal.vue";

definePageMeta({
	name: "projects",
	layout: "default",
});

const db = useDatabase();
const router = useRouter();

// State
const projects = ref<any[]>([]);
const searchQuery = ref("");
const showAddProjectModal = ref(false);
const editingProject = ref<any>(null);

// Computed
const filteredProjects = computed(() => {
	if (!searchQuery.value) return projects.value;

	const query = searchQuery.value.toLowerCase();
	return projects.value.filter(
		(project) => project.name?.toLowerCase().includes(query) || project.description?.toLowerCase().includes(query),
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

const handleSaveProject = async (projectData: any) => {
	try {
		if (editingProject.value) {
			await db.updateProject(editingProject.value.id, projectData);
		} else {
			await db.createProject(projectData);
		}

		await loadProjects();
		closeModal();
	} catch (error) {
		console.error("Error guardando proyecto:", error);
	}
};

const editProject = (project: any) => {
	editingProject.value = project;
	showAddProjectModal.value = true;
};

const deleteProjectConfirm = async (id: string) => {
	if (confirm("¿Estás seguro de eliminar este proyecto?")) {
		await db.deleteProject(id);
		await loadProjects();
	}
};

const viewProject = (id: string) => {
	router.push(`/projects/${id}`);
};

const closeModal = () => {
	showAddProjectModal.value = false;
	editingProject.value = null;
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
/* Otros estilos movidos a assets/css/app.css */
</style>
