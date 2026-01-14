<template>
	<div
		class="flex flex-col h-full bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
		<!-- Toolbar -->
		<div
			class="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between">
			<div class="flex items-center gap-4">
				<h3 class="font-semibold text-gray-900 dark:text-white">Visualizador de Componentes (Centroid/XY)</h3>
				<span
					v-if="components.length"
					class="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full">
					{{ components.length }} componentes detectados
				</span>
			</div>
			<div class="flex items-center gap-2">
				<button
					@click="resetView"
					class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500"
					title="Resetear Vista">
					<ArrowPathIcon class="w-5 h-5" />
				</button>
				<button @click="close" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500">
					<XMarkIcon class="w-5 h-5" />
				</button>
			</div>
		</div>

		<!-- Main Canvas Area -->
		<div
			class="flex-1 relative overflow-hidden cursor-move"
			@mousedown="startPan"
			@mousemove="doPan"
			@mouseup="endPan"
			@mouseleave="endPan"
			@wheel="handleZoom">
			<div v-if="!components.length" class="absolute inset-0 flex items-center justify-center p-8 text-center">
				<div class="max-w-xs">
					<div
						class="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
						<DocumentArrowUpIcon class="w-8 h-8 text-gray-400" />
					</div>
					<h4 class="text-gray-900 dark:text-white font-medium mb-1">Cargar Archivo de Ubicación</h4>
					<p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
						Sube un archivo .csv o .txt con coordenadas XY (Centroid) para visualizar la posición de los
						componentes.
					</p>
					<label
						class="px-4 py-2 bg-primary text-white rounded-lg font-bold cursor-pointer hover:bg-primary/90 transition-all inline-block">
						Seleccionar Archivo
						<input type="file" class="hidden" @change="handleFileUpload" accept=".csv,.txt,.pos" />
					</label>
				</div>
			</div>

			<!-- Canvas Drawing (Simplified with SVG for zoom/pan) -->
			<svg v-else class="w-full h-full" :viewBox="viewBox">
				<!-- Grid (Optional) -->
				<defs>
					<pattern id="grid" width="10" height="10" patternUnits="userSpaceOnAdd">
						<path
							d="M 10 0 L 0 0 0 10"
							fill="none"
							stroke="currentColor"
							stroke-width="0.1"
							class="text-gray-200 dark:text-gray-700" />
					</pattern>
				</defs>
				<rect width="2000" height="2000" x="-1000" y="-1000" fill="url(#grid)" />

				<!-- Components -->
				<g v-for="(comp, index) in components" :key="index">
					<circle
						:cx="comp.x"
						:cy="-comp.y"
						:r="hoveredIndex === index ? 1.5 : 0.8"
						:class="[
							'transition-all duration-200 cursor-pointer',
							hoveredIndex === index ? 'fill-primary' : 'fill-blue-500 dark:fill-blue-400',
						]"
						@mouseenter="hoveredIndex = index"
						@mouseleave="hoveredIndex = -1" />
					<text
						v-if="zoom < 2 && hoveredIndex === index"
						:x="comp.x + 2"
						:y="-comp.y"
						class="text-[3px] fill-gray-900 dark:fill-white font-bold pointer-events-none">
						{{ comp.ref }} ({{ comp.val }})
					</text>
				</g>
			</svg>

			<!-- Overlay Info -->
			<div
				v-if="hoveredIndex !== -1"
				class="absolute bottom-4 left-4 bg-white dark:bg-gray-900 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 pointer-events-none">
				<p class="text-xs font-bold text-primary">{{ components[hoveredIndex].ref }}</p>
				<p class="text-sm text-gray-900 dark:text-white">{{ components[hoveredIndex].val }}</p>
				<p class="text-[10px] text-gray-500">
					X: {{ components[hoveredIndex].x }}mm, Y: {{ components[hoveredIndex].y }}mm
				</p>
			</div>

			<!-- Zoom Controls -->
			<div class="absolute bottom-4 right-4 flex flex-col gap-2">
				<button
					@click="adjustZoom(0.8)"
					class="p-2 bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50">
					<PlusIcon class="w-5 h-5" />
				</button>
				<button
					@click="adjustZoom(1.2)"
					class="p-2 bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50">
					<MinusIcon class="w-5 h-5" />
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { XMarkIcon, ArrowPathIcon, DocumentArrowUpIcon, PlusIcon, MinusIcon } from "@heroicons/vue/24/outline";

const emit = defineEmits(["close"]);

interface ComponentPos {
	ref: string;
	val: string;
	x: number;
	y: number;
	layer: string;
}

const components = ref<ComponentPos[]>([]);
const hoveredIndex = ref(-1);

// Pan & Zoom State
const zoom = ref(100); // viewBox width/height multiplier
const panX = ref(0);
const panY = ref(0);
const isPanning = ref(false);
const startX = ref(0);
const startY = ref(0);

const viewBox = computed(() => {
	const size = zoom.value;
	return `${panX.value - size / 2} ${panY.value - size / 2} ${size} ${size}`;
});

const handleFileUpload = async (event: Event) => {
	const input = event.target as HTMLInputElement;
	if (input.files && input.files[0]) {
		const file = input.files[0];
		const text = await file.text();
		parseCentroidFile(text);
	}
};

const parseCentroidFile = (content: string) => {
	const lines = content.split("\n");
	const detected: ComponentPos[] = [];

	// Basic regex patterns for CSV/Tab formats
	// Common format: Ref,Val,Package,X,Y,Rotation,Layer
	lines.forEach((line) => {
		if (line.startsWith("#") || !line.trim()) return;

		const parts = line.split(/[,\t\s]+/).map((p) => p.trim());
		if (parts.length >= 4) {
			// Intento básico de identificar columnas (esto es heurístico)
			// Buscamos algo que parezca una referencia (R1, C1, U1...) y coordenadas numéricas
			const ref = parts[0];
			const x = parseFloat(parts.find((p) => !isNaN(parseFloat(p)) && p.includes(".")) || "0");
			const y = parseFloat(parts.filter((p) => !isNaN(parseFloat(p)) && p.includes(".")).reverse()[0] || "0");

			if (ref && !isNaN(x) && !isNaN(y) && /^[A-Z]+\d+/.test(ref)) {
				detected.push({
					ref,
					val: parts[1] || "Unknown",
					x,
					y,
					layer: parts.includes("top") ? "top" : "bottom",
				});
			}
		}
	});

	if (detected.length > 0) {
		components.value = detected;
		autoCenter();
	}
};

const autoCenter = () => {
	if (!components.value.length) return;

	const minX = Math.min(...components.value.map((c) => c.x));
	const maxX = Math.max(...components.value.map((c) => c.x));
	const minY = Math.min(...components.value.map((c) => c.y));
	const maxY = Math.max(...components.value.map((c) => c.y));

	panX.value = (minX + maxX) / 2;
	panY.value = -(minY + maxY) / 2;

	const width = maxX - minX;
	const height = maxY - minY;
	zoom.value = Math.max(width, height) * 1.5 || 100;
};

const handleZoom = (e: WheelEvent) => {
	e.preventDefault();
	const delta = e.deltaY > 0 ? 1.1 : 0.9;
	zoom.value *= delta;
};

const adjustZoom = (factor: number) => {
	zoom.value *= factor;
};

const startPan = (e: MouseEvent) => {
	isPanning.value = true;
	startX.value = e.clientX;
	startY.value = e.clientY;
};

const doPan = (e: MouseEvent) => {
	if (!isPanning.value) return;

	const dx = (e.clientX - startX.value) * (zoom.value / 500);
	const dy = (e.clientY - startY.value) * (zoom.value / 500);

	panX.value -= dx;
	panY.value -= dy;

	startX.value = e.clientX;
	startY.value = e.clientY;
};

const endPan = () => {
	isPanning.value = false;
};

const resetView = () => {
	autoCenter();
};

const close = () => {
	emit("close");
};
</script>
