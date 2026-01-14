<template>
	<div
		class="bg-card-light rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-primary/50 overflow-hidden"
		@click="onViewProject">
		<div class="flex items-start justify-between mb-4">
			<div class="flex items-center gap-3">
				<div
					class="relative w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center overflow-hidden">
					<img v-if="thumbUrl" :src="thumbUrl" class="w-full h-full object-cover" />
					<RectangleStackIcon v-else class="w-6 h-6 text-primary" />
				</div>
				<div v-if="project.status" class="flex items-center">
					<span
						:class="statusClass"
						class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
						{{ statusLabel }}
					</span>
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
				<span>{{ formatDate(project.createdAt) }}</span>
				<div class="flex flex-col items-end gap-1">
					<div class="flex items-center gap-2">
						<div class="flex items-center gap-1">
							<CubeIcon class="w-4 h-4" />
							<span>{{ project.itemCount || 0 }} items</span>
						</div>
						<div class="flex items-center gap-1">
							<CurrencyDollarIcon class="w-4 h-4 text-green-600" />
							<span class="font-medium" title="Valor Total Proyecto">{{
								formatValue(project.totalValue || 0)
							}}</span>
						</div>
					</div>
					<div
						v-if="project.pcbQuantity && project.pcbQuantity > 0"
						class="flex items-center gap-1 text-primary font-semibold">
						<span>{{ formatValue(costPerPcb) }} / PCB</span>
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
import { computed, ref, onMounted, watch } from "vue";

interface Project {
	id: string;
	name: string;
	description?: string;
	status?: string;
	createdAt: string;
	itemCount?: number;
	totalValue?: number;
	git?: string;
	web?: string;
	thumb?: string; // Nombre del archivo de imagen
	pcbQuantity?: number;
	pcbCost?: number;
}

const props = defineProps<{
	project: Project;
}>();

const emit = defineEmits<{
	viewProject: [id: string];
	editProject: [project: Project];
	deleteProject: [id: string];
}>();

const { getFileByName } = useFileManager();
const thumbUrl = ref<string | null>(null);

const costPerPcb = computed(() => {
	const itemsValue = props.project.totalValue || 0;
	const pcbQty = props.project.pcbQuantity || 1;
	const pcbCost = props.project.pcbCost || 0;
	return itemsValue / pcbQty + pcbCost;
});

const statusLabel = computed(() => {
	const labels: Record<string, string> = {
		Draft: "Borrador",
		Prototype: "Prototipo",
		Production: "Producción",
		Archived: "Archivado",
	};
	return labels[props.project.status || "Draft"] || props.project.status;
});

const statusClass = computed(() => {
	const classes: Record<string, string> = {
		Draft: "bg-gray-100 text-gray-600",
		Prototype: "bg-blue-100 text-blue-600",
		Production: "bg-green-100 text-green-600",
		Archived: "bg-red-100 text-red-600",
	};
	return classes[props.project.status || "Draft"] || "bg-gray-100 text-gray-600";
});

const loadThumb = async () => {
	if (props.project.thumb) {
		// Si es una URL completa o base64, usarla directamente
		if (props.project.thumb.startsWith("http") || props.project.thumb.startsWith("data:")) {
			thumbUrl.value = props.project.thumb;
			return;
		}

		// Si es un nombre de archivo, buscarlo
		try {
			const fileUrl = await getFileByName(props.project.thumb);
			if (fileUrl) {
				thumbUrl.value = fileUrl;
			}
		} catch (error) {
			console.error("Error loading project thumb:", error);
		}
	} else {
		thumbUrl.value = null;
	}
};

onMounted(loadThumb);
watch(() => props.project.thumb, loadThumb);

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
