<template>
	<div
		class="bg-card-light rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-primary/50 overflow-hidden"
		@click="onViewProject">
		<div class="flex items-start justify-between mb-4">
			<div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
				<div>
					<RectangleStackIcon class="w-6 h-6 text-primary" />
				</div>
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

		<!-- Content area with consistent layout -->
		<div class="mt-4">
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
import { useFilesDatabase } from "@/composables/useFilesDatabase";
import { computed } from "vue";

interface Project {
	id: string;
	name: string;
	description?: string;
	created_at: string;
	itemCount?: number;
	totalValue?: number;
	git?: string;
	web?: string;
}

const props = defineProps<{
	project: Project;
}>();

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
