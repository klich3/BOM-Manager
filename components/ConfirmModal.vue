<script setup lang="ts">
import { XMarkIcon } from "@heroicons/vue/24/outline";
import { useI18n } from "@/composables/useI18n";

const { t } = useI18n();

interface Props {
	show: boolean;
	title: string;
	message: string;
	confirmText: string;
}

interface Emits {
	(e: "confirm"): void;
	(e: "close"): void;
}

const props = withDefaults(defineProps<Props>(), {
	title: "",
	message: "",
	confirmText: "",
});

const emit = defineEmits<Emits>();

const closeModal = () => {
	emit("close");
};

const confirmAction = () => {
	emit("confirm");
	closeModal();
};
</script>

<template>
	<Teleport to="body">
		<div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div class="bg-white rounded-2xl shadow-xl w-full max-w-md">
				<div class="p-6">
					<div class="flex justify-between items-center mb-4">
						<h3 class="text-lg font-semibold text-text-main-light">{{ title }}</h3>
						<button @click="closeModal" class="p-1 rounded-full hover:bg-gray-100">
							<XMarkIcon class="w-5 h-5 text-text-muted-light" />
						</button>
					</div>

					<p class="text-text-main-light mb-6">{{ message }}</p>

					<div class="flex justify-end gap-3">
						<button
							@click="closeModal"
							class="px-4 py-2 rounded-lg text-text-main-light font-medium hover:bg-gray-100">
							{{ t("cancel") }}
						</button>
						<button
							@click="confirmAction"
							class="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">
							{{ confirmText }}
						</button>
					</div>
				</div>
			</div>
		</div>
	</Teleport>
</template>
