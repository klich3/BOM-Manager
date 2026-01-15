<script setup>
const props = defineProps({
	isOpen: Boolean,
	options: Object,
});

const emit = defineEmits(["confirm", "cancel"]);

const handleConfirm = () => {
	emit("confirm", true);
};

const handleCancel = () => {
	emit("cancel", false);
};
</script>

<template>
	<div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<!-- Backdrop -->
		<div class="absolute inset-0 bg-black/50" @click="handleCancel"></div>

		<!-- Dialog -->
		<div class="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 transform transition-all">
			<div class="p-6">
				<div class="flex items-center gap-3 mb-4">
					<div
						v-if="options.type === 'warning'"
						class="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="w-6 h-6 text-amber-600"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
						</svg>
					</div>
					<div
						v-else-if="options.type === 'error'"
						class="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="w-6 h-6 text-red-600"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
					<div v-else class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="w-6 h-6 text-blue-600"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>

					<div>
						<h3 class="text-lg font-semibold text-gray-900">{{ options.title }}</h3>
					</div>
				</div>

				<p class="text-gray-600 mb-6 leading-relaxed">{{ options.message }}</p>

				<div class="flex gap-3 justify-end">
					<button
						@click="handleCancel"
						class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">
						{{ options.cancelText }}
					</button>
					<button
						@click="handleConfirm"
						:class="[
							'px-4 py-2 rounded-lg font-medium transition-colors',
							options.type === 'warning'
								? 'bg-amber-600 hover:bg-amber-700 text-white'
								: options.type === 'error'
								? 'bg-red-600 hover:bg-red-700 text-white'
								: 'bg-primary hover:bg-primary/90 text-white',
						]">
						{{ options.confirmText }}
					</button>
				</div>
			</div>
		</div>
	</div>
</template>
