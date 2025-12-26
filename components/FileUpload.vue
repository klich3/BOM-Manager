<template>
	<div
		@drop.prevent="handleDrop"
		@dragover.prevent="isDragging = true"
		@dragleave.prevent="isDragging = false"
		:class="[
			'relative border-2 border-dashed rounded-2xl p-8 transition-all duration-200',
			isDragging
				? 'border-primary bg-primary/5 scale-[1.02]'
				: 'border-gray-300 hover:border-primary/50',
		]"
	>
		<!-- Upload Icon and Text -->
		<div class="flex flex-col items-center justify-center text-center">
			<div
				:class="[
					'w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors',
					isDragging ? 'bg-primary/20' : 'bg-gray-100',
				]"
			>
				<DocumentArrowUpIcon
					:class="[
						'w-8 h-8 transition-colors',
						isDragging ? 'text-primary' : 'text-gray-400',
					]"
				/>
			</div>

			<h3 class="text-lg font-semibold text-text-main-light mb-2">
				{{ isDragging ? "Suelta el archivo aquí" : "Importar archivo BOM" }}
			</h3>

			<p class="text-sm text-text-muted-light mb-4">
				Arrastra y suelta o haz clic para seleccionar
			</p>

			<div class="flex items-center gap-2 mb-4">
				<span
					class="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium"
				>
					CSV
				</span>
				<span
					class="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium"
				>
					XLSX
				</span>
				<span
					class="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-medium"
				>
					XLS
				</span>
			</div>

			<!-- Hidden File Input -->
			<input
				ref="fileInput"
				type="file"
				accept=".csv,.xlsx,.xls"
				@change="handleFileSelect"
				class="hidden"
			/>

			<!-- Upload Button -->
			<button
				@click="fileInput?.click()"
				class="px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium text-sm"
			>
				Seleccionar Archivo
			</button>

			<!-- File Info -->
			<div v-if="selectedFile" class="mt-6 w-full">
				<div
					class="bg-gray-50 rounded-xl p-4 flex items-center justify-between"
				>
					<div class="flex items-center gap-3">
						<div
							class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center"
						>
							<DocumentTextIcon class="w-5 h-5 text-primary" />
						</div>
						<div class="text-left">
							<p class="text-sm font-medium text-text-main-light">
								{{ selectedFile.name }}
							</p>
							<p class="text-xs text-text-muted-light">
								{{ formatFileSize(selectedFile.size) }}
							</p>
						</div>
					</div>
					<button
						@click="clearFile"
						class="p-2 hover:bg-gray-200 rounded-lg transition-colors"
					>
						<XMarkIcon class="w-5 h-5 text-gray-500" />
					</button>
				</div>
			</div>

			<!-- Error Message -->
			<div v-if="error" class="mt-4 w-full">
				<div
					class="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
				>
					<ExclamationTriangleIcon
						class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
					/>
					<div class="text-left">
						<p class="text-sm font-medium text-red-600">Error</p>
						<p class="text-xs text-red-600/80 mt-1">
							{{ error }}
						</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Processing State -->
		<div
			v-if="isProcessing"
			class="absolute inset-0 bg-white/90 rounded-2xl flex items-center justify-center backdrop-blur-sm"
		>
			<div class="text-center">
				<div
					class="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"
				></div>
				<p class="text-sm font-medium text-text-main-light">
					Procesando archivo...
				</p>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
	DocumentArrowUpIcon,
	DocumentTextIcon,
	XMarkIcon,
	ExclamationTriangleIcon,
} from "@heroicons/vue/24/outline";

// Props
interface Props {
	maxSize?: number; // in MB
}

const props = withDefaults(defineProps<Props>(), {
	maxSize: 10,
});

// Emits
const emit = defineEmits<{
	fileSelected: [file: File];
	error: [message: string];
}>();

// State
const isDragging = ref(false);
const selectedFile = ref<File | null>(null);
const isProcessing = ref(false);
const error = ref("");
const fileInput = ref<HTMLInputElement | null>(null);

// Methods
const validateFile = (file: File): boolean => {
	error.value = "";

	// Check file type
	const validTypes = [
		"text/csv",
		"application/vnd.ms-excel",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	];

	const validExtensions = [".csv", ".xlsx", ".xls"];
	const hasValidExtension = validExtensions.some((ext) =>
		file.name.toLowerCase().endsWith(ext)
	);

	if (!validTypes.includes(file.type) && !hasValidExtension) {
		error.value =
			"Tipo de archivo no válido. Solo se aceptan archivos CSV, XLSX o XLS.";
		emit("error", error.value);
		return false;
	}

	// Check file size
	const maxSizeBytes = props.maxSize * 1024 * 1024;
	if (file.size > maxSizeBytes) {
		error.value = `El archivo es demasiado grande. Tamaño máximo: ${props.maxSize}MB`;
		emit("error", error.value);
		return false;
	}

	return true;
};

const handleDrop = (e: DragEvent) => {
	isDragging.value = false;

	const files = e.dataTransfer?.files;
	if (!files || files.length === 0) return;

	const file = files[0];
	if (file) {
		processFile(file);
	}
};

const handleFileSelect = (e: Event) => {
	const target = e.target as HTMLInputElement;
	const files = target.files;

	if (!files || files.length === 0) return;

	const file = files[0];
	if (file) {
		processFile(file);
	}
};

const processFile = (file: File) => {
	if (!validateFile(file)) {
		selectedFile.value = null;
		return;
	}

	selectedFile.value = file;
	emit("fileSelected", file);
};

const clearFile = () => {
	selectedFile.value = null;
	error.value = "";
	if (fileInput.value) {
		fileInput.value.value = "";
	}
};

const formatFileSize = (bytes: number): string => {
	if (bytes === 0) return "0 Bytes";

	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

// Expose methods for parent component
defineExpose({
	clearFile,
	setProcessing: (value: boolean) => {
		isProcessing.value = value;
	},
});
</script>

<style scoped>
.text-text-main-light {
	color: #1f2937;
}

.dark .text-text-main-dark {
	color: #f9fafb;
}

.text-text-muted-light {
	color: #6b7280;
}

.dark .text-text-muted-dark {
	color: #9ca3af;
}

.bg-primary {
	background-color: #10b981;
}
</style>
