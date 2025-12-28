<template>
	<div
		:class="[
			'rounded-3xl p-5 text-white flex flex-col justify-between shadow-lg transition-all cursor-pointer relative overflow-hidden',
			backgroundClass,
			shadowClass,
			'hover:' + hoverShadowClass,
		]">
		<div class="absolute top-0 right-0 p-4 opacity-20">
			<CheckCircleIcon class="w-16 h-16" />
		</div>
		<div class="flex justify-between items-start z-10">
			<div class="flex items-center gap-2">
				<CubeIcon class="w-5 h-5" />
				<span class="text-sm font-medium">{{ title }}</span>
			</div>
		</div>
		<div class="z-10">
			<div class="flex items-end gap-2">
				<span class="text-4xl font-bold">{{ percentage }}%</span>
			</div>
			<p class="text-xs opacity-80 mt-2">{{ statusText }}</p>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { CheckCircleIcon, CubeIcon } from "@heroicons/vue/24/outline";

interface Props {
	percentage: number;
	title?: string;
	statusText?: string;
}

const props = withDefaults(defineProps<Props>(), {
	title: "Stock Health",
	statusText: "Inventario en niveles óptimos",
});

const backgroundClass = computed(() => {
	if (props.percentage >= 80) {
		return "bg-primary"; // Verde (bueno al 100%)
	} else if (props.percentage >= 50) {
		return "bg-amber-500"; // Amarillo (advertencia)
	} else {
		return "bg-red-500"; // Rojo (problemas)
	}
});

const shadowClass = computed(() => {
	if (props.percentage >= 80) {
		return "shadow-primary/20";
	} else if (props.percentage >= 50) {
		return "shadow-amber-500/20";
	} else {
		return "shadow-red-500/20";
	}
});

const hoverShadowClass = computed(() => {
	if (props.percentage >= 80) {
		return "shadow-primary/40";
	} else if (props.percentage >= 50) {
		return "shadow-amber-500/40";
	} else {
		return "shadow-red-500/40";
	}
});
</script>
