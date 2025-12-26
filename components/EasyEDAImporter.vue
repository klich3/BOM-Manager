<template>
	<div
		class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
	>
		<div
			class="bg-card-light dark:bg-card-dark rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
		>
			<div class="flex items-center justify-between mb-6 p-6 pb-4">
				<h2
					class="text-xl font-semibold text-text-main-light dark:text-text-main-dark"
				>
					Importar Template de EasyEDA
				</h2>
				<button
					@click="closeImporter"
					class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
				>
					<svg
						class="w-6 h-6 text-text-muted-light dark:text-text-muted-dark"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						></path>
					</svg>
				</button>
			</div>

			<div class="px-6 pb-6">
				<!-- Upload Section -->
				<div class="mb-6">
					<label
						class="block text-sm font-medium text-text-main-light dark:text-text-main-dark mb-2"
					>
						Seleccionar archivo de template de EasyEDA
					</label>
					<div
						@dragover.prevent="handleDragOver"
						@drop.prevent="handleDrop"
						@dragenter.prevent="handleDragEnter"
						@dragleave.prevent="handleDragLeave"
						class="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors"
						:class="dragActive ? 'border-primary bg-primary/10' : ''"
						@click="triggerFileInput"
					>
						<input
							ref="fileInputRef"
							type="file"
							accept=".json"
							class="hidden"
							@change="handleFileSelect"
						/>
						<div class="flex flex-col items-center justify-center">
							<svg
								class="w-12 h-12 text-gray-400 mb-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
								></path>
							</svg>
							<p class="text-text-main-light dark:text-text-main-dark">
								<span class="font-medium text-primary">Click para subir</span> o
								arrastra un archivo JSON aquí
							</p>
							<p
								class="text-sm text-text-muted-light dark:text-text-muted-dark mt-1"
							>
								Solo archivos .json de EasyEDA
							</p>
						</div>
					</div>
				</div>

				<!-- Loading State -->
				<div
					v-if="isLoading"
					class="flex flex-col items-center justify-center py-12"
				>
					<div
						class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"
					></div>
					<p class="text-text-main-light dark:text-text-main-dark">
						Procesando template...
					</p>
				</div>

				<!-- Error State -->
				<div v-else-if="error" class="mb-6">
					<div
						class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
					>
						<p class="text-red-700 dark:text-red-300">{{ error }}</p>
					</div>
				</div>

				<!-- Success State with Preview -->
				<div v-else-if="importResult && importResult.success">
					<div
						class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6"
					>
						<p class="text-green-700 dark:text-green-300">
							{{ importResult.message }}
						</p>
					</div>

					<!-- Metadata -->
					<div class="mb-6">
						<h3
							class="text-lg font-medium text-text-main-light dark:text-text-main-dark mb-3"
						>
							Metadatos del Template
						</h3>
						<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<p
									class="text-sm text-text-muted-light dark:text-text-muted-dark"
								>
									Título
								</p>
								<p class="text-text-main-light dark:text-text-main-dark">
									{{ importResult.metadata.title || "N/A" }}
								</p>
							</div>
							<div>
								<p
									class="text-sm text-text-muted-light dark:text-text-muted-dark"
								>
									Autor
								</p>
								<p class="text-text-main-light dark:text-text-main-dark">
									{{ importResult.metadata.author || "N/A" }}
								</p>
							</div>
							<div>
								<p
									class="text-sm text-text-muted-light dark:text-text-muted-dark"
								>
									Componentes
								</p>
								<p class="text-text-main-light dark:text-text-main-dark">
									{{ importResult.metadata.componentCount }}
								</p>
							</div>
						</div>
					</div>

					<!-- Components Preview -->
					<div class="mb-6">
						<h3
							class="text-lg font-medium text-text-main-light dark:text-text-main-dark mb-3"
						>
							Vista Previa de Componentes
						</h3>
						<div
							class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
						>
							<table class="w-full">
								<thead class="bg-gray-50 dark:bg-gray-800">
									<tr>
										<th
											class="px-4 py-3 text-left text-xs font-semibold text-text-muted-light dark:text-text-muted-dark uppercase"
										>
											Nombre
										</th>
										<th
											class="px-4 py-3 text-left text-xs font-semibold text-text-muted-light dark:text-text-muted-dark uppercase"
										>
											Categoría
										</th>
										<th
											class="px-4 py-3 text-left text-xs font-semibold text-text-muted-light dark:text-text-muted-dark uppercase"
										>
											Part Number
										</th>
										<th
											class="px-4 py-3 text-left text-xs font-semibold text-text-muted-light dark:text-text-muted-dark uppercase"
										>
											LCSC
										</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-gray-200 dark:divide-gray-700">
									<tr
										v-for="(component, index) in importResult.components.slice(
											0,
											10
										)"
										:key="index"
									>
										<td
											class="px-4 py-3 text-sm text-text-main-light dark:text-text-main-dark"
										>
											{{ component.name || "N/A" }}
										</td>
										<td
											class="px-4 py-3 text-sm text-text-main-light dark:text-text-main-dark"
										>
											{{ component.category || "N/A" }}
										</td>
										<td
											class="px-4 py-3 text-sm text-text-main-light dark:text-text-main-dark"
										>
											{{ component.part_number || "N/A" }}
										</td>
										<td
											class="px-4 py-3 text-sm text-text-main-light dark:text-text-main-dark"
										>
											{{ component.lcsc_part || "N/A" }}
										</td>
									</tr>
									<tr v-if="importResult.components.length > 10">
										<td
											colspan="4"
											class="px-4 py-3 text-sm text-center text-text-muted-light dark:text-text-muted-dark"
										>
											... y
											{{ importResult.components.length - 10 }} componentes más
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>

					<!-- Import Options -->
					<div class="flex justify-end gap-3">
						<button
							@click="closeImporter"
							class="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-text-main-light dark:text-text-main-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
						>
							Cancelar
						</button>
						<button
							@click="confirmImport"
							class="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium"
						>
							Importar Componentes
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useEasyEDAImporter } from "~/composables/useEasyEDAImporter";

interface Props {
	show: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(["close", "import"]);

const { isLoading, error, importTemplate, convertToInternalFormat } =
	useEasyEDAImporter();
const fileInputRef = ref<HTMLInputElement | null>(null);
const dragActive = ref(false);
const importResult = ref<any>(null);

onMounted(() => {
	// Limpiar resultados anteriores al abrir
	if (props.show) {
		resetState();
	}
});

const resetState = () => {
	error.value = null;
	importResult.value = null;
};

const triggerFileInput = () => {
	if (fileInputRef.value) {
		fileInputRef.value.click();
	}
};

const handleFileSelect = async (event: Event) => {
	const target = event.target as HTMLInputElement;
	if (target.files && target.files.length > 0) {
		const file = target.files[0];
		if (file) {
			await processFile(file);
		}
	}
};

const handleDragOver = (event: DragEvent) => {
	event.preventDefault();
	dragActive.value = true;
};

const handleDragEnter = (event: DragEvent) => {
	event.preventDefault();
	dragActive.value = true;
};

const handleDragLeave = (event: DragEvent) => {
	event.preventDefault();
	dragActive.value = false;
};

const handleDrop = async (event: DragEvent) => {
	event.preventDefault();
	dragActive.value = false;

	if (event.dataTransfer && event.dataTransfer.files.length > 0) {
		const file = event.dataTransfer.files[0];
		if (file) {
			await processFile(file);
		}
	}
};

const processFile = async (file: File) => {
	resetState();
	importResult.value = await importTemplate(file);
};

const confirmImport = () => {
	if (importResult.value && importResult.value.success) {
		const internalComponents = convertToInternalFormat(
			importResult.value.components
		);
		emit("import", internalComponents);
		closeImporter();
	}
};

const closeImporter = () => {
	resetState();
	emit("close");
};
</script>
