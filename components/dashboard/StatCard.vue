<template>
	<div
		:class="[
			'bg-card-light rounded-3xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow cursor-pointer',
			borderClass,
		]">
		<div class="flex justify-between items-start">
			<div class="flex items-center gap-2 text-text-muted-light">
				<component :is="iconComponent" class="w-5 h-5" :class="iconColorClass" />
				<span class="text-sm font-medium"
					><slot name="title">{{ title }}</slot></span
				>
			</div>
		</div>
		<div>
			<span :class="['text-4xl font-bold', valueColorClass]">{{ formattedValue }}</span>
			<p class="text-xs text-text-muted-light mt-2">
				<slot name="subtitle">{{ subtitle }}</slot>
			</p>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { RectangleStackIcon, CurrencyDollarIcon, ExclamationTriangleIcon } from "@heroicons/vue/24/outline";

interface Props {
	title?: string;
	value: number | string;
	subtitle?: string;
	valueType?: "number" | "currency";
	hasAlert?: boolean;
	formatValue?: (value: number) => string;
}

const props = withDefaults(defineProps<Props>(), {
	valueType: "number",
	hasAlert: false,
	formatValue: (value: number) => value.toString(),
});

const iconComponent = computed(() => {
	if (
		props.title &&
		(props.title.toLowerCase().includes("proyect") || props.title.toLowerCase().includes("project"))
	) {
		return RectangleStackIcon;
	} else if (
		props.title &&
		(props.title.toLowerCase().includes("total") || props.title.toLowerCase().includes("valor"))
	) {
		return CurrencyDollarIcon;
	} else if (
		props.title &&
		(props.title.toLowerCase().includes("alert") || props.title.toLowerCase().includes("stock bajo"))
	) {
		return ExclamationTriangleIcon;
	}
	return RectangleStackIcon; // default icon
});

const formattedValue = computed(() => {
	if (props.valueType === "currency") {
		return `$${props.formatValue(Number(props.value))}`;
	}
	return props.value;
});

const borderClass = computed(() => {
	if (props.hasAlert && Number(props.value) > 0) {
		return "border border-amber-200 bg-amber-50/50";
	}
	return "";
});

const iconColorClass = computed(() => {
	if (props.hasAlert && Number(props.value) > 0) {
		return "text-amber-500";
	}
	return "";
});

const valueColorClass = computed(() => {
	if (props.hasAlert && Number(props.value) > 0) {
		return "text-amber-600";
	}
	return "text-text-main-light";
});
</script>
