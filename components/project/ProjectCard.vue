<template>
	<div
		class="bg-card-light rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-primary/50 overflow-hidden"
		@click="onViewProject">
		<!-- Thumbnail with gradient overlay -->
		<div
			v-if="projectThumbUrl"
			class="relative mb-4 -mx-6 -mt-6 rounded-t-2xl overflow-hidden"
			style="height: 120px">
			<img :src="projectThumbUrl" :alt="project.name" class="w-full h-full object-cover" />
			<div class="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent"></div>
			<div class="absolute inset-0 flex items-start justify-between p-4">
				<div class="flex gap-2">
					<button
						@click.stop="onEditProject"
						class="p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg transition-colors">
						<PencilIcon class="w-4 h-4 text-white" />
					</button>
					<button
						@click.stop="onDeleteProject"
						class="p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg transition-colors">
						<TrashIcon class="w-4 h-4 text-white" />
					</button>
				</div>
				<div class="flex gap-2">
					<div v-if="project.pdf" class="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
						<DocumentTextIcon class="w-4 h-4 text-white" />
					</div>
					<div v-if="project.git" class="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
						<CodeBracketIcon class="w-4 h-4 text-white" />
					</div>
					<div v-if="project.web" class="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
						<GlobeAltIcon class="w-4 h-4 text-white" />
					</div>
				</div>
			</div>
		</div>
		<div v-else class="flex items-start justify-between mb-4">
			<div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
				<RectangleStackIcon class="w-6 h-6 text-primary" />
			</div>
			<div class="flex gap-2">
				<button @click.stop="onEditProject" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
					<PencilIcon class="w-4 h-4 text-blue-600" />
				</button>
				<button @click.stop="onDeleteProject" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
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
			<div class="flex items-center gap-2">
				<div class="flex items-center gap-1">
					<CubeIcon class="w-4 h-4" />
					<span>{{ project.itemCount || 0 }} items</span>
				</div>
				<div class="flex items-center gap-1">
					<CurrencyDollarIcon class="w-4 h-4 text-green-600" />
					<span class="font-medium">{{ formatValue(project.totalValue || 0) }}</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import {
	RectangleStackIcon,
	PencilIcon,
	TrashIcon,
	CubeIcon,
	CurrencyDollarIcon,
	DocumentTextIcon,
	CodeBracketIcon,
	GlobeAltIcon,
} from "@heroicons/vue/24/outline";
import { useFileManager } from "@/composables/useFileManager";
import { computed } from "vue";

interface Project {
	id: string;
	name: string;
	description?: string;
	created_at: string;
	itemCount?: number;
	totalValue?: number;
	thumb?: string;
	git?: string;
	web?: string;
	pdf?: string;
}

const props = defineProps<{
	project: Project;
}>();

// Computed para manejar la URL de la imagen según el entorno
const projectThumbUrl = computed(() => {
	if (!props.project.thumb) return null;

	// En Tauri, las imágenes ya vienen como data URLs
	if (useFileManager().isTauri) {
		return props.project.thumb;
	}

	// En web, verificar si es una URL de OPFS o necesita reconstruirse
	if (props.project.thumb.startsWith("blob:")) {
		return props.project.thumb;
	}

	// Para otros casos, retornar tal cual (podría ser una URL externa)
	return props.project.thumb;
});

const emit = defineEmits<{
	viewProject: [id: string];
	editProject: [project: Project];
	deleteProject: [id: string];
}>();

const onViewProject = () => {
	emit("viewProject", props.project.id);
};

const onEditProject = () => {
	emit("editProject", props.project);
};

const onDeleteProject = () => {
	emit("deleteProject", props.project.id);
};

const formatDate = (dateString: string) => {
	const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" };
	return new Date(dateString).toLocaleDateString(undefined, options);
};

const formatValue = (value: number | string) => {
	let v = typeof value === "string" ? parseFloat(value) : value;

	return v.toLocaleString("es-ES", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
};
</script>
