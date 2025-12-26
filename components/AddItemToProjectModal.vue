<template>
	<div
		v-if="show"
		class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
	>
		<div
			class="bg-card-light rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
		>
			<div class="flex items-center justify-between mb-6 p-6 pb-4">
				<h2 class="text-xl font-semibold text-text-main-light">
					Agregar Item al Proyecto
				</h2>
				<button
					@click="closeModal"
					class="p-1 hover:bg-gray-100 rounded-lg transition-colors"
				>
					<XMarkIcon class="w-6 h-6 text-text-muted-light" />
				</button>
			</div>

			<div class="px-6 pb-6">
				<div class="mb-6">
					<div class="relative">
						<MagnifyingGlassIcon
							class="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
						/>
						<input
							v-model="searchQuery"
							type="text"
							placeholder="Buscar componentes disponibles..."
							class="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light"
						/>
					</div>
				</div>

				<div class="space-y-3 max-h-96 overflow-y-auto">
					<div
						v-for="item in items"
						:key="item.id"
						class="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
					>
						<div>
							<p class="font-medium text-text-main-light">
								{{ item.name }}
							</p>
							<p class="text-sm text-text-muted-light">
								{{ item.category || "Sin categoría" }}
							</p>
						</div>
						<div class="flex items-center gap-3">
							<span class="text-sm font-medium text-text-main-light">
								${{ (item.price || 0).toFixed(2) }}
							</span>
							<button
								@click="addItem(item)"
								class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
							>
								Agregar
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
import { XMarkIcon, MagnifyingGlassIcon } from "@heroicons/vue/24/outline";

interface ProjectItem {
	id: string;
	name: string;
	category?: string;
	price?: number;
	// Agregar otras propiedades según sea necesario
}

interface AddItemToProjectModalProps {
	show: boolean;
	items: ProjectItem[];
}

const props = defineProps<AddItemToProjectModalProps>();
const emit = defineEmits<{
	close: [];
	add: [item: ProjectItem];
	search: [query: string];
}>();

const searchQuery = ref("");

// Watch para detectar cambios en la búsqueda
watch(searchQuery, (newQuery) => {
	emit("search", newQuery);
});

const closeModal = () => {
	searchQuery.value = "";
	emit("close");
};

const addItem = (item: ProjectItem) => {
	emit("add", item);
	searchQuery.value = "";
};
</script>
