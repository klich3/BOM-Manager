<template>
	<Teleport to="body">
		<div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
			<div class="bg-card-light rounded-2xl shadow-xl max-w-lg w-full p-6">
				<div class="flex items-center justify-between mb-6">
					<h2 class="text-xl font-semibold text-text-main-light">{{ title }}</h2>
					<button @click="closeModal" class="p-1 hover:bg-gray-100 rounded-lg transition-colors">
						<XMarkIcon class="w-6 h-6 text-text-muted-light" />
					</button>
				</div>

				<div class="space-y-4">
					<div
						v-for="option in importOptions"
						:key="option.type"
						@click="selectImportType(option.type)"
						:class="{
							'bg-primary/10 border border-primary': selectedType === option.type,
							'bg-gray-50 border border-gray-200': selectedType !== option.type,
						}"
						class="p-4 rounded-xl cursor-pointer transition-colors">
						<div class="flex items-center gap-3">
							<div
								class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"
								:class="option.bgClass">
								<component :is="option.icon" class="w-5 h-5" :class="option.iconClass" />
							</div>
							<div>
								<h4 class="font-medium text-text-main-light">{{ option.title }}</h4>
								<p class="text-sm text-text-muted-light">{{ option.description }}</p>
							</div>
						</div>
					</div>

					<div class="flex gap-3 pt-4">
						<button
							@click="closeModal"
							class="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-text-main-light hover:bg-gray-50 transition-colors">
							Cancelar
						</button>
						<button
							@click="confirmImport"
							class="flex-1 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium">
							{{ confirmText }}
						</button>
					</div>
				</div>
			</div>
		</div>
	</Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { XMarkIcon, CodeBracketIcon, DocumentTextIcon, CodeBracketSquareIcon } from "@heroicons/vue/24/outline";

interface ImportOption {
	type: string;
	title: string;
	description: string;
	icon: any;
	bgClass: string;
	iconClass: string;
}

interface Props {
	show: boolean;
	title?: string;
	confirmText?: string;
	importOptions?: ImportOption[];
}

const props = withDefaults(defineProps<Props>(), {
	title: "Importar Componentes",
	confirmText: "Importar",
	importOptions: () => [
		{
			type: "easyeda",
			title: "EasyEDA",
			description: "Importar desde proyecto EasyEDA",
			icon: CodeBracketIcon,
			bgClass: "bg-blue-100",
			iconClass: "text-blue-600",
		},
		{
			type: "csv",
			title: "CSV",
			description: "Importar desde archivo CSV",
			icon: DocumentTextIcon,
			bgClass: "bg-green-100",
			iconClass: "text-green-600",
		},
		{
			type: "json",
			title: "JSON",
			description: "Importar desde archivo JSON",
			icon: CodeBracketSquareIcon,
			bgClass: "bg-purple-100",
			iconClass: "text-purple-600",
		},
	],
});

const emit = defineEmits<{
	close: [];
	confirm: [type: string];
}>();

const selectedType = ref(props.importOptions[0]?.type || "");

// Actualizar selectedType cuando cambian las props
watch(
	() => props.importOptions,
	(newOptions) => {
		if (newOptions.length > 0 && !newOptions.some((opt) => opt.type === selectedType.value)) {
			selectedType.value = newOptions[0].type;
		}
	},
);

const selectImportType = (type: string) => {
	selectedType.value = type;
};

const closeModal = () => {
	emit("close");
};

const confirmImport = () => {
	emit("confirm", selectedType.value);
};
</script>
