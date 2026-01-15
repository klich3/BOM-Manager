<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "@/composables/useI18n";
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
import { unref } from "vue";
import { useDatabase } from "@/composables/useDatabase";
import { useProjectItemsDatabase } from "@/composables/useProjectItemsDatabase";
import { useRouter } from "vue-router";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useDialog } from "@/composables/useDialog";
import type { BOMItem, BOMProject } from "@/types/bom";
import ProjectModal from "@/components/project/ProjectModal.vue";
import ProjectCard from "@/components/project/ProjectCard.vue";
import { navigateTo } from "nuxt/app";

const db = useDatabase();
const projectItemsDb = useProjectItemsDatabase();
const { showConfirmation } = useDialog();

// Definir metadatos de la página
// Esta macro está disponible globalmente en Nuxt 3
const router = useRouter();
const { t, lang } = useI18n();

// State
const projects = ref<any[]>([]);
const searchQuery = ref("");
const showAddProjectModal = ref(false);
const editingProject = ref<any>(null);

// Computed
const totalValue = computed(() => {
	return projects.value.reduce((sum: number, project: any) => sum + (project.totalValue || 0), 0);
});

// Computed
const filteredProjects = computed(() => {
	if (!searchQuery.value) return projects.value;

	const query = searchQuery.value.toLowerCase();
	return projects.value.filter(
		(project: any) =>
			project.name?.toLowerCase().includes(query) || project.description?.toLowerCase().includes(query),
	);
});

// Methods
const loadProjects = async () => {
	try {
		const allProjects = (await db.getAllProjects()) as BOMProject[];
		// Calcular el valor total y obtener thumbnail para cada proyecto
		const projectsWithExtras = await Promise.all(
			allProjects.map(async (project: BOMProject) => {
				const itemsValue = await projectItemsDb.getProjectTotalValue(project.id);
				const pcbFabricationCost = (project.pcbQuantity || 1) * (project.pcbCost || 0);
				const projectFiles = await db.getFilesByProjectId(project.id);
				const thumbFile = projectFiles.find((f: any) => f.filename.startsWith("thumb-prj-"));

				return {
					...project,
					totalValue: itemsValue + pcbFabricationCost,
					thumb: thumbFile ? thumbFile.filename : null,
				};
			}),
		);
		projects.value = projectsWithExtras;
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
	const confirmed = await showConfirmation(
		"Eliminar Proyecto",
		"¿Estás seguro de eliminar este proyecto? Esta acción no se puede deshacer.",
	);

	if (confirmed) {
		try {
			await db.deleteProject(id);
			await loadProjects();
		} catch (error) {
			console.error("Error eliminando proyecto:", error);
		}
	}
};

const viewProject = async (id: string) => {
	await navigateTo({ name: "projects-id", params: { id } });
};

const closeModal = () => {
	showAddProjectModal.value = false;
	editingProject.value = null;
};

const formatDate = (dateString: string) => {
	try {
		return format(new Date(dateString), "dd MMM yyyy", {
			locale: lang.value === "es" ? es : undefined,
		});
	} catch {
		return dateString;
	}
};

const formatValue = (value: number | string) => {
	let v = typeof value === "string" ? parseFloat(value) : value;

	return v.toLocaleString("es-ES", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
};

// Lifecycle
onMounted(async () => {
	await loadProjects();
});
</script>

<template>
	<!-- Main Content -->
	<main class="min-h-screen">
		<!-- Header -->
		<header class="h-20 px-8 flex items-center justify-between bg-background-light border-b border-gray-200">
			<div>
				<h1 class="text-2xl font-semibold text-text-main-light">{{ t("project_management") }}</h1>
			</div>
			<div class="flex items-center gap-4">
				<button
					@click="showAddProjectModal = true"
					class="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors">
					<PlusIcon class="w-5 h-5" />
					<span>{{ t("new_project") }}</span>
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
							<p class="text-xs text-text-muted-light">{{ t("total_projects") }}</p>
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
							<p class="text-xs text-text-muted-light">{{ t("active_projects") }}</p>
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
							<p class="text-xs text-text-muted-light">{{ t("total_value") }}</p>
							<p class="text-3xl font-bold text-text-main-light">{{ formatValue(totalValue) }}</p>
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
						:placeholder="t('search_projects')"
						class="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light" />
				</div>
			</div>

			<!-- Projects Grid -->
			<div v-if="filteredProjects.length === 0" class="bg-card-light rounded-2xl p-12 shadow-sm text-center">
				<RectangleStackIcon class="w-16 h-16 mx-auto mb-4 text-gray-300" />
				<h3 class="text-lg font-semibold text-text-main-light mb-2">{{ t("no_projects") }}</h3>
				<p class="text-text-muted-light mb-6">{{ t("start_creating_project") }}</p>
				<button
					@click="showAddProjectModal = true"
					class="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors">
					<PlusIcon class="w-5 h-5" />
					<span>{{ t("create_project") }}</span>
				</button>
			</div>

			<TransitionGroup
				tag="div"
				class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
				enter-active-class="transition-all duration-300"
				enter-from-class="opacity-0 scale-95"
				enter-to-class="opacity-100 scale-100"
				leave-active-class="transition-all duration-300"
				leave-from-class="opacity-100 scale-100"
				leave-to-class="opacity-0 scale-95"
				mode="out-in">
				<ProjectCard
					v-for="(project, index) in filteredProjects"
					:key="project.id || `project-${index}`"
					:project="project"
					@view-project="viewProject"
					@edit-project="editProject"
					@delete-project="deleteProjectConfirm" />
			</TransitionGroup>
		</div>
	</main>

	<!-- Add Project Modal -->
	<ProjectModal
		:show="showAddProjectModal"
		:editing-project="editingProject"
		@close="closeModal"
		@save="handleSaveProject" />
</template>

<style scoped>
/* Otros estilos movidos a assets/css/app.css */
</style>
