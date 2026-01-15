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

				<!-- Selector de Versiones -->
				<div v-if="versions.length > 0" class="flex items-center gap-2 ml-4">
					<label class="text-xs font-medium text-gray-500">Historial:</label>
					<select
						v-model="selectedVersionId"
						@change="loadVersion"
						class="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-primary max-w-[150px]">
						<option value="">Seleccionar...</option>
						<option v-for="v in versions" :key="v.id" :value="v.id">
							{{ v.filename }}
						</option>
					</select>
				</div>
			</div>
			<div class="flex items-center gap-2">
				<button
					v-if="components.length"
					@click="autoCenter"
					class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500"
					title="Centrar Vista">
					<ArrowsPointingInIcon class="w-5 h-5" />
				</button>
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

		<div class="flex-1 flex overflow-hidden">
			<!-- Left Panel: File Explorer (only if ZIP) -->
			<div
				v-if="zipFiles.length > 0"
				class="w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-y-auto">
				<div class="p-4 border-b border-gray-100 dark:border-gray-800">
					<h4 class="text-xs font-bold text-gray-400 uppercase">Archivos en ZIP</h4>
				</div>
				<div class="divide-y divide-gray-50 dark:divide-gray-800">
					<div
						v-for="file in zipFiles"
						:key="file.name"
						class="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer group flex flex-col gap-1"
						@click="selectZipFile(file.name)">
						<div class="flex items-center justify-between">
							<span class="text-xs font-medium truncate flex-1">{{ file.name }}</span>
							<span
								v-if="coordinateFileName === file.name"
								class="text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full"
								>Activo</span
							>
						</div>
						<div class="flex gap-2">
							<button
								v-if="isCoordinateFile(file.name)"
								class="text-[10px] text-primary hover:underline"
								@click.stop="useAsCoordinates(file.name)">
								Usar Coordenadas
							</button>
							<button
								v-if="isGerberFile(file.name)"
								class="text-[10px] text-blue-500 hover:underline"
								@click.stop="toggleLayer(file.name)">
								{{ layers[file.name] ? "Ocultar Capa" : "Ver Capa" }}
							</button>
						</div>
					</div>
				</div>
			</div>

			<!-- Main Canvas Area -->
			<div
				class="flex-1 relative overflow-hidden cursor-move bg-[#1a1a1a]"
				@mousedown="startPan"
				@mousemove="doPan"
				@mouseup="endPan"
				@mouseleave="endPan"
				@wheel="handleZoom">
				<div
					v-if="!components.length && !Object.keys(layers).length"
					class="absolute inset-0 flex items-center justify-center p-8 text-center bg-gray-50">
					<div class="max-w-xs">
						<div
							class="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
							<DocumentArrowUpIcon class="w-8 h-8 text-gray-400" />
						</div>
						<h4 class="text-gray-900 dark:text-white font-medium mb-1">Cargar Archivo de Ubicación</h4>
						<p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
							Sube un archivo .csv, .txt, .pos o un .zip con archivos Gerber y coordenadas XY.
						</p>
						<label
							class="px-4 py-2 bg-primary text-white rounded-lg font-bold cursor-pointer hover:bg-primary/90 transition-all inline-block">
							Seleccionar Archivo
							<input type="file" class="hidden" @change="handleFileUpload" accept=".csv,.txt,.pos,.zip" />
						</label>
					</div>
				</div>

				<!-- Canvas Drawing -->
				<svg v-else class="w-full h-full" :viewBox="viewBox">
					<!-- Grid -->
					<defs>
						<pattern id="grid" width="10" height="10" patternUnits="userSpaceOnAdd">
							<path
								d="M 10 0 L 0 0 0 10"
								fill="none"
								stroke="currentColor"
								stroke-width="0.05"
								class="text-gray-700" />
						</pattern>
					</defs>
					<rect width="4000" height="4000" x="-2000" y="-2000" fill="url(#grid)" />

					<!-- Gerber Layers (Simplified paths) -->
					<g v-for="(layerPaths, fileName) in layers" :key="fileName">
						<path
							v-for="(p, i) in layerPaths"
							:key="i"
							:d="p.d"
							fill="none"
							stroke="currentColor"
							:stroke-width="p.w"
							:class="getLayerClass(fileName)"
							stroke-linecap="round" />
					</g>

					<!-- Components (Centroid Points) -->
					<g v-for="(comp, index) in components" :key="index">
						<circle
							:cx="comp.x"
							:cy="-comp.y"
							:r="hoveredIndex === index ? 1.5 : 0.8"
							:class="[
								'transition-all duration-200 cursor-pointer',
								hoveredIndex === index ? 'fill-primary' : 'fill-blue-500/80',
							]"
							@mouseenter="hoveredIndex = index"
							@mouseleave="hoveredIndex = -1" />
						<text
							v-if="zoom < 100 && (hoveredIndex === index || zoom < 20)"
							:x="comp.x + 1"
							:y="-comp.y - 1"
							class="text-[1.5px] fill-white font-bold pointer-events-none drop-shadow-sm">
							{{ comp.ref }}
						</text>
					</g>
				</svg>

				<!-- Overlay Info -->
				<div
					v-if="hoveredIndex !== -1"
					class="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 pointer-events-none">
					<p class="text-xs font-bold text-primary">{{ components[hoveredIndex].ref }}</p>
					<p class="text-sm text-gray-900 dark:text-white">{{ components[hoveredIndex].val }}</p>
					<p class="text-[10px] text-gray-500">
						X: {{ components[hoveredIndex].x }}mm, Y: {{ components[hoveredIndex].y }}mm
					</p>
				</div>

				<!-- Zoom & Controls -->
				<div class="absolute bottom-4 right-4 flex flex-col gap-2">
					<button
						@click="adjustZoom(0.7)"
						class="p-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur rounded-lg shadow border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50">
						<PlusIcon class="w-5 h-5" />
					</button>
					<button
						@click="adjustZoom(1.4)"
						class="p-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur rounded-lg shadow border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50">
						<MinusIcon class="w-5 h-5" />
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import {
	XMarkIcon,
	ArrowPathIcon,
	DocumentArrowUpIcon,
	PlusIcon,
	MinusIcon,
	ArrowsPointingInIcon,
} from "@heroicons/vue/24/outline";
import JSZip from "jszip";
import { useDatabase } from "@/composables/useDatabase";
import { useFileManager } from "@/composables/useFileManager";
import { useNotifications } from "@/composables/useNotifications";

const props = defineProps<{
	projectId?: string;
}>();

const emit = defineEmits(["close"]);

const db = useDatabase();
const { saveFile, getFileByName } = useFileManager();
const { success: notifySuccess, error: notifyError, info: notifyInfo } = useNotifications();

interface ComponentPos {
	ref: string;
	val: string;
	x: number;
	y: number;
	layer: string;
}

const components = ref<ComponentPos[]>([]);
const hoveredIndex = ref(-1);

// PCB Versions State
const versions = ref<any[]>([]);
const selectedVersionId = ref("");

// ZIP & Layer State
const zipFiles = ref<any[]>([]);
const currentZip = ref<JSZip | null>(null);
const coordinateFileName = ref("");
const layers = ref<Record<string, any[]>>({});

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

const loadVersions = async () => {
	if (!props.projectId) return;
	try {
		const files = await db.getFilesByProjectId(props.projectId);
		versions.value = files.filter(
			(f: any) =>
				f.filename.endsWith(".zip") ||
				f.filename.endsWith(".csv") ||
				f.filename.endsWith(".txt") ||
				f.filename.endsWith(".pos") ||
				f.filename.endsWith(".json"),
		);
	} catch (error) {
		console.error("Error loading PCB versions:", error);
	}
};

const loadVersion = async () => {
	if (!selectedVersionId.value) return;
	const version = versions.value.find((v: any) => v.id === selectedVersionId.value);
	if (!version) return;

	try {
		// Intentar cargar usando filename primero, ya que filepath puede ser un blob URL caducado
		let url = await getFileByName(version.filename);
		if (!url) {
			url = await getFileByName(version.filepath);
		}

		if (!url) {
			notifyError("Error", "No se pudo recuperar el archivo guardado");
			return;
		}

		const response = await fetch(url);
		const blob = await response.blob();
		const file = new File([blob], version.filename, { type: version.file_type || "application/octet-stream" });

		await processFile(file, false);
	} catch (error) {
		console.error("Error loading version file:", error);
		notifyError("Error", "Error al cargar la versión seleccionada");
	}
};

const handleFileUpload = async (event: Event) => {
	const input = event.target as HTMLInputElement;
	if (input.files && input.files[0]) {
		const file = input.files[0];
		await processFile(file, true);
	}
};

const selectZipFile = (name: string) => {
	// Opcionalmente resaltar o mostrar info extra
	notifyInfo("Archivo seleccionado", name);
};

const isCoordinateFile = (name: string) => {
	return [".pos", ".csv", ".txt", ".json"].some((e) => name.toLowerCase().endsWith(e));
};

const isGerberFile = (name: string) => {
	return [".gtl", ".gbl", ".gts", ".gbs", ".gto", ".gbo", ".gko", ".gbr", ".art", ".pho"].some((e) =>
		name.toLowerCase().endsWith(e),
	);
};

const useAsCoordinates = async (name: string) => {
	if (!currentZip.value) return;
	const text = await currentZip.value.files[name].async("text");
	coordinateFileName.value = name;

	if (name.toLowerCase().endsWith(".json")) {
		try {
			const data = JSON.parse(text);
			if (Array.isArray(data)) parseJsonCoordinates(data);
		} catch (e) {
			console.error("Error parsing JSON coordinates:", e);
		}
	} else {
		parseCentroidFile(text);
	}
};

const toggleLayer = async (name: string) => {
	if (layers.value[name]) {
		delete layers.value[name];
		return;
	}

	if (!currentZip.value) return;
	const text = await currentZip.value.files[name].async("text");
	const paths = parseGerberToSvg(text);
	layers.value[name] = paths;

	if (paths.length > 0) {
		// autoCenter();
	}
};

const getLayerClass = (name: string) => {
	const n = name.toLowerCase();
	if (n.includes("gtl") || n.includes("top")) return "text-red-500 opacity-60";
	if (n.includes("gbl") || n.includes("bot")) return "text-blue-500 opacity-60";
	if (n.includes("gko") || n.includes("outline")) return "text-yellow-400 opacity-90";
	return "text-gray-400 opacity-40";
};

const processFile = async (file: File, shouldSave: boolean) => {
	let success = false;
	components.value = []; // Reset components list
	coordinateFileName.value = "";
	layers.value = {};
	zipFiles.value = [];
	currentZip.value = null;

	if (file.name.endsWith(".zip")) {
		try {
			const zip = new JSZip();
			const content = await zip.loadAsync(file);
			currentZip.value = content;
			zipFiles.value = Object.keys(content.files).map((name) => ({ name }));

			// Auto-select first coordinate file
			for (const name of Object.keys(content.files)) {
				if (isCoordinateFile(name)) {
					await useAsCoordinates(name);
					success = true;
					break;
				}
			}

			// Auto-enable outline if found
			for (const name of Object.keys(content.files)) {
				if (name.toLowerCase().endsWith(".gko") || name.toLowerCase().includes("outline")) {
					await toggleLayer(name);
					break;
				}
			}
		} catch (error) {
			console.error("Error leyendo ZIP:", error);
			notifyError("Error", "Error al leer el archivo ZIP");
		}
	} else {
		const text = await file.text();
		if (file.name.endsWith(".json")) {
			try {
				const data = JSON.parse(text);
				parseJsonCoordinates(data);
				success = true;
			} catch (e) {
				notifyError("Error", "Error al parsear el archivo JSON");
			}
		} else {
			parseCentroidFile(text);
			success = true;
		}
	}

	if (success && shouldSave && props.projectId) {
		try {
			await saveFile(file, file.name);
			await db.createFile({
				project_id: props.projectId,
				filename: file.name,
				filepath: file.name, // Guardamos el nombre del archivo para persistencia real en OPFS
				file_type: file.type,
				size: file.size,
				title: `Versión PCB ${new Date().toLocaleString()}`,
			});
			notifySuccess("Éxito", "Versión de PCB guardada en el proyecto");
			await loadVersions();
		} catch (error) {
			console.error("Error saving PCB version:", error);
		}
	}
};

const parseGerberToSvg = (content: string) => {
	const paths: any[] = [];
	const lines = content.split("\n");
	let currentX = 0;
	let currentY = 0;
	let d = "";
	let strokeWidth = 0.2;

	// Gerber State
	let unitFactor = 1; // 1 for mm, 25.4 for inches
	let formatX = { int: 2, dec: 4 };
	let formatY = { int: 2, dec: 4 };
	let zeroSuppression = "leading"; // "leading" or "trailing"

	const parseCoordinate = (coord: string, format: { int: number; dec: number }) => {
		if (!coord) return 0;
		const isNegative = coord.startsWith("-");
		let val = coord.replace(/[-+]/, "");

		if (zeroSuppression === "leading") {
			// Add leading zeros if necessary
			val = val.padStart(format.int + format.dec, "0");
		} else {
			// Add trailing zeros if necessary
			val = val.padEnd(format.int + format.dec, "0");
		}

		// Insert decimal point
		const splitPos = val.length - format.dec;
		const result = parseFloat(val.slice(0, splitPos) + "." + val.slice(splitPos));
		return (isNegative ? -result : result) * unitFactor;
	};

	lines.forEach((line) => {
		line = line.trim();
		if (!line) return;

		// 1. Units
		if (line.includes("G70") || line.includes("%MOIN*%")) {
			unitFactor = 25.4;
			return;
		}
		if (line.includes("G71") || line.includes("%MOMM*%")) {
			unitFactor = 1;
			return;
		}

		// 2. Format Statement (%FSLAX24Y24*%)
		const fsMatch = line.match(/%FS([LT])A?X(\d)(\d)Y(\d)(\d)/);
		if (fsMatch) {
			zeroSuppression = fsMatch[1] === "L" ? "leading" : "trailing";
			formatX = { int: parseInt(fsMatch[2]), dec: parseInt(fsMatch[3]) };
			formatY = { int: parseInt(fsMatch[4]), dec: parseInt(fsMatch[5]) };
			return;
		}

		// 3. Coordinate commands
		const xMatch = line.match(/X([-+]?\d+)/);
		const yMatch = line.match(/Y([-+]?\d+)/);

		if (xMatch || yMatch) {
			const x = xMatch ? parseCoordinate(xMatch[1], formatX) : currentX;
			const y = yMatch ? parseCoordinate(yMatch[1], formatY) : currentY;

			if (line.includes("D02") || (line.startsWith("G00") && !line.includes("D01"))) {
				// Move to (Exposure off)
				d += ` M ${x} ${-y}`;
			} else if (line.includes("D01") || line.includes("G01") || line.includes("L")) {
				// Line to (Exposure on)
				if (!d.includes("M")) d = `M ${currentX} ${-currentY}` + d;
				d += ` L ${x} ${-y}`;
			}

			currentX = x;
			currentY = y;
		}

		// End of command or flash
		if (line.includes("*") || line.includes("D03")) {
			if (d) {
				paths.push({ d, w: strokeWidth });
				d = "";
			}
		}
	});

	return paths;
};

const parseJsonCoordinates = (data: any[]) => {
	const detected: ComponentPos[] = [];
	data.forEach((item) => {
		const ref = item.Ref || item.ref || item.Reference || item.designator;
		const val = item.Val || item.val || item.Value || "Unknown";
		const x = parseFloat(item.PosX || item.posX || item.x || item.X || 0);
		const y = parseFloat(item.PosY || item.posY || item.y || item.Y || 0);
		const layer = (item.Layer || item.layer || item.Side || item.side || "top").toLowerCase();

		if (ref && !isNaN(x) && !isNaN(y)) {
			detected.push({
				ref,
				val,
				x,
				y,
				layer: layer.includes("bot") ? "bottom" : "top",
			});
		}
	});

	if (detected.length > 0) {
		components.value = detected;
		autoCenter();
	}
};

const parseCentroidFile = (content: string) => {
	const lines = content.split("\n");
	const detected: ComponentPos[] = [];

	let headers: string[] = [];
	let dataLines = lines.filter((l) => l.trim() && !l.startsWith("#"));

	const headerIndex = dataLines.findIndex(
		(l) => l.toLowerCase().includes("ref") && (l.toLowerCase().includes("posx") || l.toLowerCase().includes("x")),
	);

	if (headerIndex !== -1) {
		headers = dataLines[headerIndex].split(/[,\t\s]+/).map((h) => h.trim().toLowerCase());
		dataLines = dataLines.slice(headerIndex + 1);
	}

	dataLines.forEach((line) => {
		const parts = line.split(/[,\t\s]+/).map((p) => p.trim());

		if (headers.length > 0) {
			const refIdx = headers.findIndex((h) => h.includes("ref"));
			const valIdx = headers.findIndex((h) => h.includes("val"));
			const xIdx = headers.findIndex((h) => h.includes("posx") || h === "x");
			const yIdx = headers.findIndex((h) => h.includes("posy") || h === "y");

			if (refIdx !== -1 && xIdx !== -1 && yIdx !== -1) {
				const ref = parts[refIdx];
				const x = parseFloat(parts[xIdx]);
				const y = parseFloat(parts[yIdx]);

				if (ref && !isNaN(x) && !isNaN(y)) {
					detected.push({
						ref,
						val: valIdx !== -1 ? parts[valIdx] : "Unknown",
						x,
						y,
						layer: line.toLowerCase().includes("bot") ? "bottom" : "top",
					});
				}
				return;
			}
		}

		if (parts.length >= 3) {
			const refCandidate = parts[0];
			const numericParts = parts.map((p) => ({ val: parseFloat(p), original: p })).filter((p) => !isNaN(p.val));

			if (numericParts.length >= 2 && /^[A-Z]+\d+/.test(refCandidate)) {
				const x = numericParts[0].val;
				const y = numericParts[1].val;

				detected.push({
					ref: refCandidate,
					val: parts[1] || "Unknown",
					x,
					y,
					layer: line.toLowerCase().includes("bot") ? "bottom" : "top",
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
	let minX = Infinity,
		maxX = -Infinity,
		minY = Infinity,
		maxY = -Infinity;

	if (components.value.length > 0) {
		components.value.forEach((c: ComponentPos) => {
			minX = Math.min(minX, c.x);
			maxX = Math.max(maxX, c.x);
			minY = Math.min(minY, c.y);
			maxY = Math.max(maxY, c.y);
		});
	}

	// Also consider layer bounds
	Object.values(layers.value).forEach((paths: any) => {
		paths.forEach((p: any) => {
			// Extract coordinates from SVG path string "M x -y L x -y"
			const coords = p.d.match(/[-+]?\d+\.?\d*/g);
			if (coords) {
				for (let i = 0; i < coords.length; i += 2) {
					const x = parseFloat(coords[i]);
					const y = -parseFloat(coords[i + 1]); // Convert back from SVG Y
					minX = Math.min(minX, x);
					maxX = Math.max(maxX, x);
					minY = Math.min(minY, y);
					maxY = Math.max(maxY, y);
				}
			}
		});
	});

	if (minX === Infinity) {
		panX.value = 0;
		panY.value = 0;
		zoom.value = 100;
		return;
	}

	panX.value = (minX + maxX) / 2;
	panY.value = -(minY + maxY) / 2;

	const width = maxX - minX;
	const height = maxY - minY;
	zoom.value = Math.max(width, height, 10) * 1.5;
};

const handleZoom = (e: WheelEvent) => {
	e.preventDefault();
	const delta = e.deltaY > 0 ? 1.2 : 0.8;
	const newZoom = zoom.value * delta;
	zoom.value = Math.min(Math.max(newZoom, 5), 2000);
};

const adjustZoom = (factor: number) => {
	const newZoom = zoom.value * factor;
	zoom.value = Math.min(Math.max(newZoom, 5), 2000);
};

const startPan = (e: MouseEvent) => {
	isPanning.value = true;
	startX.value = e.clientX;
	startY.value = e.clientY;
};

const doPan = (e: MouseEvent) => {
	if (!isPanning.value) return;

	const dx = (e.clientX - startX.value) * (zoom.value / 600);
	const dy = (e.clientY - startY.value) * (zoom.value / 600);

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

onMounted(() => {
	loadVersions();
});

watch(
	() => props.projectId,
	() => {
		loadVersions();
	},
);
</script>

<style scoped>
.cursor-move {
	cursor: grab;
}
.cursor-move:active {
	cursor: grabbing;
}
</style>
