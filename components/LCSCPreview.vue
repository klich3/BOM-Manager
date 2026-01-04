<template>
	<div v-if="showPreview" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
		<div class="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
			<div class="flex items-center justify-between mb-4 p-6 pb-4">
				<h2 class="text-xl font-semibold text-gray-900">
					Vista Previa - {{ lcscData?.partNumber || "Componente LCSC" }}
				</h2>
				<button @click="closePreview" class="text-gray-500 hover:text-gray-700">
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"></path>
					</svg>
				</button>
			</div>

			<div v-if="isLoading" class="flex items-center justify-center p-8">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
			</div>

			<div v-else-if="error" class="p-6">
				<div class="bg-red-50 border border-red-200 rounded-lg p-4">
					<p class="text-red-700 d">{{ error }}</p>
				</div>
			</div>

			<div v-else-if="lcscData" class="p-6">
				<div class="flex flex-col md:flex-row gap-6">
					<div class="md:w-1/3 flex flex-col items-center">
						<!-- Mostrar múltiples imágenes si existen -->
						<div v-if="lcscData.images && lcscData.images.length > 0" class="flex flex-col gap-2">
							<img
								v-for="(img, index) in lcscData.images"
								:key="`img-${index}`"
								:src="img"
								:alt="`${lcscData.name || lcscData.partNumber} - Imagen ${Number(index) + 1}`"
								class="max-h-48 object-contain"
								@error="handleImageError(index as number)"
								:class="{ 'opacity-50': imageErrorIndexes.includes(index as number) }" />
						</div>
						<!-- Mostrar imagen única si no hay múltiples imágenes -->
						<img
							v-else-if="lcscData.image"
							:src="lcscData.image"
							:alt="lcscData.name || lcscData.partNumber"
							class="max-h-48 object-contain"
							@error="imageError = true" />
						<!-- Mostrar placeholder si no hay imágenes -->
						<div
							v-else-if="!lcscData.image && (!lcscData.images || lcscData.images.length === 0)"
							class="bg-gray-200 border-2 border-dashed rounded-xl w-48 h-48 flex items-center justify-center text-gray-500">
							Sin imagen
						</div>
					</div>

					<div class="md:w-2/3">
						<div class="mb-4">
							<h3 class="text-lg font-medium text-gray-900">
								{{ lcscData.name }}
							</h3>
							<p class="text-sm text-gray-500">
								{{ lcscData.partNumber }}
							</p>
						</div>

						<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
							<div>
								<p class="text-sm font-medium text-gray-700">Fabricante</p>
								<p class="text-sm text-gray-900">
									{{ lcscData.manufacturer || "N/A" }}
								</p>
							</div>

							<div>
								<p class="text-sm font-medium text-gray-700">Categoría</p>
								<p class="text-sm text-gray-900">
									{{ lcscData.category || "N/A" }}
								</p>
							</div>

							<div>
								<p class="text-sm font-medium text-gray-700">Precio</p>
								<p class="text-sm text-gray-900">
									{{ lcscData.price ? `$${lcscData.price.toFixed(4)}` : "N/A" }}
								</p>
							</div>

							<div>
								<p class="text-sm font-medium text-gray-700">Stock</p>
								<p class="text-sm text-gray-900">
									{{ lcscData.stock || "N/A" }}
								</p>
							</div>
						</div>

						<div v-if="lcscData.parameters" class="mb-4">
							<p class="text-sm font-medium text-gray-700 mb-2">Parámetros</p>
							<div class="grid grid-cols-2 gap-2">
								<div v-for="(value, key) in lcscData.parameters" :key="key">
									<span class="text-xs text-gray-500">{{ key }}:</span>
									<span class="text-sm text-gray-900 ml-1">{{ value }}</span>
								</div>
							</div>
						</div>

						<div class="mb-4">
							<p class="text-sm font-medium text-gray-700">Descripción</p>
							<p class="text-sm text-gray-900">
								{{ lcscData.description || "No disponible" }}
							</p>
						</div>

						<div class="flex flex-wrap gap-2">
							<a
								v-if="lcscData.datasheet"
								href="#"
								@click.prevent="openExternalLink(lcscData.datasheet)"
								class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
								<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
								</svg>
								Datasheet
							</a>

							<a
								:href="getPurchaseLink(lcscData.partNumber)"
								@click.prevent="openExternalLink(getPurchaseLink(lcscData.partNumber))"
								class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
								<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 10-4 0v4.01"></path>
								</svg>
								Ir al Sitio web
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useLCSC } from "~/composables/useLCSC";
import { useExternalLink } from "~/composables/useExternalLink";

interface Props {
	partNumber: string;
	show: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(["close"]);

const imageError = ref(false);
const imageErrorIndexes = ref<number[]>([]);
const { isLoading, error, searchComponent, getPurchaseLink } = useLCSC();
const lcscData = ref<any>(null);

const showPreview = ref(false);

const { openExternalLink } = useExternalLink();

watch(
	() => props.show,
	async (newShow) => {
		showPreview.value = newShow;

		if (newShow && props.partNumber) {
			imageError.value = false;
			lcscData.value = await searchComponent(props.partNumber);
		}
	},
);

const closePreview = () => {
	showPreview.value = false;
	emit("close");
};

const handleImageError = (index: number) => {
	imageErrorIndexes.value.push(index);
};
</script>
