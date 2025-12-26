<template>
	<div
		v-if="show"
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
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { XMarkIcon } from "@heroicons/vue/24/outline";

interface Project {
	id?: string;
	name: string;
	description?: string;
	createdAt?: string;
	updatedAt?: string;
}

interface ProjectModalProps {
	show: boolean;
	editingProject?: Project | null;
}

const props = withDefaults(defineProps<ProjectModalProps>(), {
	editingProject: null,
});

const emit = defineEmits<{
	close: [];
	save: [project: Project];
}>();

const projectForm = ref({
	name: "",
	description: "",
});

// Watch para actualizar el formulario cuando cambia editingProject
watch(
	() => props.editingProject,
	(newEditingProject) => {
		if (newEditingProject) {
			projectForm.value = {
				name: newEditingProject.name,
				description: newEditingProject.description || "",
			};
		} else {
			// Reiniciar formulario si no hay edición
			projectForm.value = {
				name: "",
				description: "",
			};
		}
	},
	{ immediate: true }
);

const closeModal = () => {
	emit("close");
};

const saveProject = () => {
	emit("save", { ...projectForm.value });
};
</script>
