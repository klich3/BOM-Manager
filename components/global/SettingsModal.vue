<template>
	<div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
		<div
			class="bg-card-light rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-hidden flex flex-col">
			<!-- Header -->
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-xl font-semibold text-text-main-light">Configuración</h2>
				<button @click="closeModal" class="p-1 hover:bg-gray-100 rounded-lg transition-colors">
					<XMarkIcon class="w-6 h-6 text-text-muted-light" />
				</button>
			</div>

			<!-- Content -->
			<div class="flex-1 overflow-auto">
				<div class="space-y-6">
					<!-- Currency Selection -->
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Moneda</label>
						<select
							v-model="localSettings.currency"
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
							<option value="USD">USD ($)</option>
							<option value="EUR">EUR (€)</option>
							<option value="GBP">GBP (£)</option>
							<option value="JPY">JPY (¥)</option>
							<option value="CNY">CNY (¥)</option>
						</select>
					</div>

					<!-- Items per page -->
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Elementos por página</label>
						<select
							v-model="localSettings.items_per_page"
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
							<option value="10">10</option>
							<option value="20">20</option>
							<option value="50">50</option>
							<option value="100">100</option>
						</select>
					</div>

					<!-- Language -->
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Idioma</label>
						<select
							v-model="localSettings.language"
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
							<option value="es">Español</option>
							<option value="en">English</option>
							<option value="fr">Français</option>
							<option value="de">Deutsch</option>
						</select>
					</div>
				</div>
			</div>

			<!-- Action buttons -->
			<div class="flex justify-end items-center gap-4 mt-6 pt-6 border-t border-gray-200">
				<button
					@click="closeModal"
					class="px-6 py-2.5 rounded-lg border border-gray-300 text-text-main-light font-medium hover:bg-gray-100 transition-colors">
					Cancelar
				</button>
				<button
					@click="saveSettings"
					class="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold transition-all">
					Guardar configuración
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { XMarkIcon } from "@heroicons/vue/24/outline";
import { ref, watch } from "vue";
import { useSettingsStore } from "@/stores/settings";

interface Props {
	show: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
	close: [];
}>();

const settingsStore = useSettingsStore();
const localSettings = ref({
	currency: settingsStore.settings.currency,
	items_per_page: settingsStore.settings.items_per_page,
	language: settingsStore.settings.language,
});

// Actualizar los valores locales cuando cambien los de la tienda
watch(
	() => settingsStore.settings,
	(newSettings) => {
		localSettings.value = {
			currency: newSettings.currency,
			items_per_page: newSettings.items_per_page,
			language: newSettings.language,
		};
	},
	{ deep: true },
);

const closeModal = () => {
	emit("close");
};

const saveSettings = () => {
	settingsStore.updateCurrency(localSettings.value.currency);
	settingsStore.updateItemsPerPage(localSettings.value.items_per_page);
	settingsStore.updateLanguage(localSettings.value.language);
	emit("close");
};
</script>
