<template>
	<div v-if="show" class="fixed inset-0 bg-black/75 flex items-center justify-center z-[60] p-0 sm:p-4">
		<div class="bg-white dark:bg-gray-900 w-full h-full sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
			<!-- Header -->
			<div
				class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
				<div class="flex items-center gap-3 overflow-hidden">
					<div class="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
						<DocumentTextIcon class="w-5 h-5 text-red-600 dark:text-red-400" />
					</div>
					<h2 class="text-lg font-semibold text-gray-900 dark:text-white truncate">
						{{ title || "Visor de PDF" }}
					</h2>
				</div>
				<div class="flex items-center gap-2">
					<a
						:href="pdfUrl"
						download
						class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
						title="Descargar">
						<ArrowDownTrayIcon class="w-6 h-6" />
					</a>
					<button
						@click="closeModal"
						class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
						title="Cerrar">
						<XMarkIcon class="w-6 h-6" />
					</button>
				</div>
			</div>

			<!-- Content -->
			<div class="flex-1 bg-gray-100 dark:bg-gray-800 relative">
				<div
					v-if="isLoading"
					class="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 z-10">
					<div class="flex flex-col items-center gap-4">
						<div
							class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
						<p class="text-gray-500 dark:text-gray-400 animate-pulse">Cargando documento...</p>
					</div>
				</div>

				<iframe
					v-if="pdfUrl"
					:src="pdfUrl"
					class="w-full h-full border-none"
					@load="isLoading = false"
					@error="handleError"></iframe>

				<div
					v-if="hasError"
					class="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 z-20">
					<div class="max-w-md w-full p-6 text-center">
						<div
							class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
							<ExclamationCircleIcon class="w-10 h-10 text-red-600 dark:text-red-400" />
						</div>
						<h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Error al cargar el PDF</h3>
						<p class="text-gray-600 dark:text-gray-400 mb-6">
							No se pudo visualizar el documento directamente. Puedes intentar descargarlo o abrirlo en
							una nueva pestaña.
						</p>
						<div class="flex flex-col sm:flex-row gap-3 justify-center">
							<a
								:href="pdfUrl"
								target="_blank"
								class="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-all">
								Abrir en nueva pestaña
							</a>
							<button
								@click="closeModal"
								class="px-6 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
								Cerrar
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { XMarkIcon, DocumentTextIcon, ArrowDownTrayIcon, ExclamationCircleIcon } from "@heroicons/vue/24/outline";

interface Props {
	show: boolean;
	pdfUrl: string;
	title?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
	close: [];
}>();

const isLoading = ref(true);
const hasError = ref(false);

watch(
	() => props.show,
	(newValue) => {
		if (newValue) {
			isLoading.value = true;
			hasError.value = false;
		}
	},
);

const closeModal = () => {
	emit("close");
};

const handleError = () => {
	isLoading.value = false;
	hasError.value = true;
};
</script>
