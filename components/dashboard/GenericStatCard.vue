<template>
	<StatCard
		:title="title"
		:value="getValue()"
		:subtitle="subtitle"
		:value-type="valueType"
		:format-value="formatValue"
		:has-alert="hasAlert()">
		<template #title>{{ title }}</template>
		<template #subtitle>{{ subtitle }}</template>
	</StatCard>
</template>

<script setup lang="ts">
import StatCard from "@/components/dashboard/StatCard.vue";
import { computed } from "vue";

interface Stats {
	projects?: number;
	totalValue?: number;
	lowStock?: number;
}

interface Props {
	stats: Stats;
	type: "projects" | "totalValue" | "lowStock";
	title?: string;
	subtitle?: string;
	valueType?: "number" | "currency";
	formatValue?: (value: number) => string;
}

const props = withDefaults(defineProps<Props>(), {
	valueType: "number",
	formatValue: (value: number) => value.toString(),
});

const getValue = () => {
	switch (props.type) {
		case "projects":
			return (props.stats && props.stats.projects) || 0;
		case "totalValue":
			return props.valueType === "currency"
				? props.formatValue(Number(props.stats?.totalValue) || 0)
				: Number(props.stats?.totalValue) || 0;
		case "lowStock":
			return (props.stats && props.stats.lowStock) || 0;
		default:
			return 0;
	}
};

const hasAlert = () => {
	if (props.type === "lowStock") {
		return (props.stats.lowStock || 0) > 0;
	}
	return false;
};
</script>
