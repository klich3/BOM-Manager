<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useDatabase } from "@/composables/useDatabase";
import { useActivityDatabase } from "@/composables/useActivityDatabase";
import { useI18n } from "@/composables/useI18n";

const { t } = useI18n();

interface Props {
	show: boolean;
	selectedItems: string[]; // IDs de los items seleccionados
}

interface Project {
	id: string;
	name: string;
	description?: string;
}

const props = defineProps<Props>();
const emit = defineEmits(["close", "assigned"]);

const projects = ref<Project[]>([]);
const selectedProjectId = ref<string>("");
const isLoading = ref(false);
const error = ref<string | null>(null);

const { getAllProjects, updateItem, addItemToProject } = useDatabase();
const { logActivity } = useActivityDatabase();

const closeModal = () => {
	emit("close");
};

const loadProjects = async () => {
	isLoading.value = true;
	error.value = null;

	try {
		projects.value = await getAllProjects();
	} catch (err) {
		error.value = err instanceof Error ? err.message : "Error al cargar los proyectos";
		console.error("Error loading projects:", err);
	} finally {
		isLoading.value = false;
	}
};

const getProjectName = (projectId: string) => {
	const project = projects.value.find((p) => p.id === projectId);
	return project ? project.name : "";
};

const assignToProject = async () => {
	if (!selectedProjectId.value) return;

	isLoading.value = true;

	try {
		// Añadir cada item seleccionado al proyecto
		for (const itemId of props.selectedItems) {
			await addItemToProject(selectedProjectId.value, itemId);
			// Registrar actividad para cada item
			await logActivity(
				"ASSIGN_TO_PROJECT",
				"project_items",
				itemId,
				`Asignado al proyecto ${getProjectName(selectedProjectId.value)}`,
			);
		}

		emit("assigned", selectedProjectId.value);
		closeModal();
	} catch (err) {
		error.value = err instanceof Error ? err.message : "Error al asignar al proyecto";
		console.error("Error assigning to project:", err);
	} finally {
		isLoading.value = false;
	}
};

onMounted(() => {
	loadProjects();
});

// Reset selectedProjectId when modal opens
watch(
	() => props.show,
	(newValue) => {
		if (newValue) {
			selectedProjectId.value = "";
		}
	},
);
</script>

<template>
	<div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
		<div class="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
			<div class="flex items-center justify-between mb-4 p-6 pb-4">
				<h2 class="text-xl font-semibold text-gray-900">{{ t("assign_to_project") }}</h2>
				<button @click="closeModal" class="text-gray-500 hover:text-gray-700">
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"></path>
					</svg>
				</button>
			</div>

			<div class="p-6">
				<div v-if="isLoading" class="flex items-center justify-center p-8">
					<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
				</div>

				<div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
					<p class="text-red-700">{{ error }}</p>
				</div>

				<div v-else>
					<div class="mb-4">
						<label class="block text-sm font-medium text-gray-700 mb-2">{{ t("select_a_project") }}</label>
						<select
							v-model="selectedProjectId"
							class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
							<option value="">{{ t("select_a_project") }}</option>
							<option v-for="project in projects" :key="project.id" :value="project.id">
								{{ project.name }}
							</option>
						</select>
					</div>

					<div class="mb-4">
						<p class="text-sm text-gray-600">
							{{ t("items_will_be_assigned", { count: selectedItems.length }) }}
							<span class="font-semibold" v-if="selectedProjectId">{{
								getProjectName(selectedProjectId)
							}}</span>
						</p>
					</div>
				</div>
			</div>

			<div class="flex justify-end gap-3 p-6 pt-0">
				<button
					@click="closeModal"
					class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none">
					{{ t("cancel") }}
				</button>
				<button
					:disabled="!selectedProjectId || isLoading"
					@click="assignToProject"
					class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed">
					{{ t("assign") }}
				</button>
			</div>
		</div>
	</div>
</template>
