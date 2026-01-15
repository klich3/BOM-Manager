<script setup lang="ts">
import {
	CheckCircleIcon,
	ExclamationTriangleIcon,
	XCircleIcon,
	InformationCircleIcon,
	XMarkIcon,
} from "@heroicons/vue/24/outline";
import { useNotifications } from "../composables/useNotifications";

const { notifications, removeNotification } = useNotifications();

const getNotificationClasses = (type: string) => {
	switch (type) {
		case "success":
			return "border-green-200";
		case "error":
			return "border-red-200";
		case "warning":
			return "border-amber-200";
		case "info":
			return "border-blue-200";
		default:
			return "border-gray-200";
	}
};

const getIconColor = (type: string) => {
	switch (type) {
		case "success":
			return "text-green-600";
		case "error":
			return "text-red-600";
		case "warning":
			return "text-amber-600";
		case "info":
			return "text-blue-600";
		default:
			return "text-gray-600";
	}
};

const getProgressBarColor = (type: string) => {
	switch (type) {
		case "success":
			return "bg-green-600";
		case "error":
			return "bg-red-600";
		case "warning":
			return "bg-amber-600";
		case "info":
			return "bg-blue-600";
		default:
			return "bg-gray-600";
	}
};
</script>

<template>
	<div class="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm">
		<TransitionGroup name="toast">
			<div
				v-for="notification in notifications"
				:key="notification.id"
				:class="[
					'bg-white rounded-xl shadow-lg border overflow-hidden',
					'transform transition-all duration-300',
					getNotificationClasses(notification.type),
				]">
				<div class="p-4 flex items-start gap-3">
					<!-- Icon -->
					<div :class="['flex-shrink-0 w-6 h-6', getIconColor(notification.type)]">
						<CheckCircleIcon v-if="notification.type === 'success'" class="w-6 h-6" />
						<ExclamationTriangleIcon v-else-if="notification.type === 'warning'" class="w-6 h-6" />
						<XCircleIcon v-else-if="notification.type === 'error'" class="w-6 h-6" />
						<InformationCircleIcon v-else class="w-6 h-6" />
					</div>

					<!-- Content -->
					<div class="flex-1 min-w-0">
						<p class="text-sm font-semibold text-gray-900">
							{{ notification.title }}
						</p>
						<p v-if="notification.message" class="mt-1 text-xs text-gray-600">
							{{ notification.message }}
						</p>
					</div>

					<!-- Close Button -->
					<button
						@click="removeNotification(notification.id)"
						class="flex-shrink-0 p-1 rounded-lg hover:bg-gray-100 transition-colors">
						<XMarkIcon class="w-4 h-4 text-gray-400" />
					</button>
				</div>

				<!-- Progress Bar -->
				<div v-if="notification.duration && notification.duration > 0" class="h-1 bg-gray-200">
					<div
						:class="['h-full transition-all', getProgressBarColor(notification.type)]"
						:style="{
							width: '100%',
							animation: `shrink ${notification.duration}ms linear`,
						}"></div>
				</div>
			</div>
		</TransitionGroup>
	</div>
</template>

<style scoped>
/* Toast Transitions */
.toast-enter-active,
.toast-leave-active {
	transition: all 0.3s ease;
}

.toast-enter-from {
	opacity: 0;
	transform: translateX(100%);
}

.toast-leave-to {
	opacity: 0;
	transform: translateX(100%);
}

/* Progress Bar Animation */
@keyframes shrink {
	from {
		width: 100%;
	}
	to {
		width: 0%;
	}
}
</style>
