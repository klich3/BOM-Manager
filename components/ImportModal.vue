<template>
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
		<div class="bg-card-light rounded-2xl shadow-xl max-w-lg w-full p-6">
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-xl font-semibold text-text-main-light">Importar Archivo BOM</h2>
				<button @click="$emit('close')" class="p-1 hover:bg-gray-100 rounded-lg transition-colors">
					<XMarkIcon class="w-6 h-6 text-text-muted-light" />
				</button>
			</div>

			<div class="space-y-4">
				<FileUpload @file-selected="handleFileImport" @error="handleImportError" />

				<div class="flex gap-3 pt-4">
					<button
						@click="$emit('close')"
						class="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-text-main-light hover:bg-gray-50 transition-colors">
						Cancelar
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { XMarkIcon } from "@heroicons/vue/24/outline";
import FileUpload from "@/components/FileUpload.vue";

// Definir los eventos que emite este componente
const emit = defineEmits<{
	close: [];
	"file-selected": [file: File];
	error: [error: string];
}>();

// Definir las props si es necesario
interface Props {
	show?: boolean;
}
defineProps<Props>();

// Funciones para manejar eventos
const handleFileImport = (file: File) => {
	// Emitir el evento de archivo seleccionado
	emit("file-selected", file);
};

const handleImportError = (error: string) => {
	// Emitir el evento de error
	emit("error", error);
};
</script>
