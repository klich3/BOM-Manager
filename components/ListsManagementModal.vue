<template>
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
		<div class="bg-card-light rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
			<div class="flex items-center justify-between mb-6 p-6 pb-4">
				<h2 class="text-xl font-semibold text-text-main-light">Gestión de Listas</h2>
				<button @click="$emit('close')" class="p-1 hover:bg-gray-100 rounded-lg transition-colors">
					<XMarkIcon class="w-6 h-6 text-text-muted-light" />
				</button>
			</div>

			<div class="px-6 pb-6">
				<!-- Merge Lists Section -->
				<div class="mb-6">
					<h3 class="text-lg font-medium text-text-main-light mb-4">Mezclar Listas</h3>
					<div class="space-y-4">
						<div v-for="list in lists" :key="list.id" class="flex items-center">
							<input
								v-model="selectedListsForMerge"
								:value="list.id"
								type="checkbox"
								:id="`list-${list.id}`"
								class="mr-3 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
							<label :for="`list-${list.id}`" class="flex-1">
								<div>
									<p class="font-medium text-text-main-light">
										{{ list.name }}
									</p>
									<p class="text-sm text-text-muted-light">{{ list.items.length }} componentes</p>
								</div>
							</label>
						</div>
						<div v-if="lists.length === 0" class="text-center py-4 text-text-muted-light">
							No hay listas para mezclar
						</div>
					</div>
					<div class="mt-4 flex gap-3">
						<input
							v-model="mergeListName"
							type="text"
							placeholder="Nombre de la lista combinada"
							class="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light" />
						<button
							@click="mergeSelectedLists"
							:disabled="selectedListsForMerge.length < 2"
							class="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">
							Mezclar Listas
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { XMarkIcon } from "@heroicons/vue/24/outline";

// Definir los eventos que emite este componente
const emit = defineEmits<{
	close: [];
	"merge-lists": [listIds: string[], newListName: string];
}>();

// Definir las props
interface List {
	id: string;
	name: string;
	items: any[];
}

interface Props {
	show?: boolean;
	lists?: List[];
}
const props = withDefaults(defineProps<Props>(), {
	show: false,
	lists: () => [],
});

// Estados locales
const selectedListsForMerge = ref<string[]>([]);
const mergeListName = ref("");

// Funciones para manejar eventos
const mergeSelectedLists = () => {
	if (selectedListsForMerge.value.length >= 2 && mergeListName.value.trim()) {
		emit("merge-lists", selectedListsForMerge.value, mergeListName.value.trim());
		// Resetear valores después de emitir
		selectedListsForMerge.value = [];
		mergeListName.value = "";
	}
};
</script>
