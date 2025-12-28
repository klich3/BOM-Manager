<template>
	<div
		class="bg-card-light rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col h-[calc(100vh-220px)]">
		<div
			class="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col lg:flex-row gap-4 justify-between items-center">
			<div class="relative w-full lg:w-96 group">
				<span
					class="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors"
					>search</span
				>
				<input
					v-model="searchQuery"
					class="w-full bg-background-light dark:bg-gray-800 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary dark:text-white placeholder-gray-400 transition-all"
					placeholder="Search components by MPN, description..."
					type="text" />
			</div>
			<div class="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
				<button
					@click="showImportModal = true"
					class="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-medium text-text-main-light dark:text-text-main-dark hover:bg-gray-200 dark:hover:bg-gray-700 whitespace-nowrap transition-colors">
					<span class="material-symbols-outlined text-[18px]">upload</span>
					Import
				</button>
				<button
					@click="showAddComponentModal = true"
					class="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium whitespace-nowrap border border-primary/20">
					<span class="material-symbols-outlined text-[18px]">add</span>
					Add Component
				</button>
				<div class="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
				<button
					:class="{
						'px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium whitespace-nowrap border border-primary/20':
							activeFilter === 'all',
						'px-4 py-2 rounded-lg bg-transparent text-text-muted-light dark:text-text-muted-dark hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium whitespace-nowrap transition-colors':
							activeFilter !== 'all',
					}"
					@click="setFilter('all')">
					All Components
				</button>
				<button
					:class="{
						'px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium whitespace-nowrap border border-primary/20':
							activeFilter === 'capacitors',
						'px-4 py-2 rounded-lg bg-transparent text-text-muted-light dark:text-text-muted-dark hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium whitespace-nowrap transition-colors':
							activeFilter !== 'capacitors',
					}"
					@click="setFilter('capacitors')">
					Capacitors
				</button>
				<button
					:class="{
						'px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium whitespace-nowrap border border-primary/20':
							activeFilter === 'resistors',
						'px-4 py-2 rounded-lg bg-transparent text-text-muted-light dark:text-text-muted-dark hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium whitespace-nowrap transition-colors':
							activeFilter !== 'resistors',
					}"
					@click="setFilter('resistors')">
					Resistors
				</button>
				<button
					:class="{
						'px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium whitespace-nowrap border border-primary/20':
							activeFilter === 'ics',
						'px-4 py-2 rounded-lg bg-transparent text-text-muted-light dark:text-text-muted-dark hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium whitespace-nowrap transition-colors':
							activeFilter !== 'ics',
					}"
					@click="setFilter('ics')">
					ICs
				</button>
				<button
					:class="{
						'px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium whitespace-nowrap border border-primary/20':
							activeFilter === 'connectors',
						'px-4 py-2 rounded-lg bg-transparent text-text-muted-light dark:text-text-muted-dark hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium whitespace-nowrap transition-colors':
							activeFilter !== 'connectors',
					}"
					@click="setFilter('connectors')">
					Connectors
				</button>
			</div>
		</div>

		<div
			class="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50/50 dark:bg-gray-800/50 text-xs font-semibold text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
			<div class="col-span-4 lg:col-span-3">Component / MPN</div>
			<div class="col-span-2 hidden lg:block">Manufacturer</div>
			<div class="col-span-2 hidden lg:block">Package</div>
			<div class="col-span-2 lg:col-span-1 text-center">Qty / Board</div>
			<div class="col-span-2 lg:col-span-1 text-center">Total Req.</div>
			<div class="col-span-2 lg:col-span-2 text-right">Stock Status</div>
			<div class="col-span-2 lg:col-span-1 text-right">Actions</div>
		</div>

		<div class="flex-1 overflow-y-auto no-scrollbar divide-y divide-gray-100 dark:divide-gray-800">
			<div v-if="filteredItems.length === 0" class="p-12 text-center">
				<div
					class="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
					<span class="material-symbols-outlined text-gray-400 text-2xl">inventory_2</span>
				</div>
				<h3 class="text-lg font-semibold text-text-main-light dark:text-text-main-dark mb-2">
					No components found
				</h3>
				<p class="text-text-muted-light dark:text-text-muted-dark mb-6">
					Import your BOM from EasyEDA or add components manually
				</p>
				<div class="flex justify-center gap-4">
					<button
						@click="showImportModal = true"
						class="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors">
						<span class="material-symbols-outlined">upload</span>
						<span>Import BOM</span>
					</button>
					<button
						@click="showAddComponentModal = true"
						class="inline-flex items-center gap-2 bg-gray-100 text-text-main-light dark:bg-gray-800 dark:text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
						<span class="material-symbols-outlined">add</span>
						<span>Add Manually</span>
					</button>
				</div>
			</div>

			<div
				v-else
				class="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
				v-for="item in paginatedItems"
				:key="item.id">
				<div class="col-span-4 lg:col-span-3 flex items-center gap-3">
					<div
						class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
						<span class="material-symbols-outlined">memory</span>
					</div>
					<div>
						<h4 class="text-sm font-semibold text-text-main-light dark:text-text-main-dark">
							{{ item.name }}
						</h4>
						<p class="text-xs text-text-muted-light dark:text-text-muted-dark">
							{{ item.part_number || "N/A" }}
						</p>
					</div>
				</div>
				<div class="col-span-2 hidden lg:block text-sm text-text-main-light dark:text-text-main-dark">
					{{ item.manufacturer || "N/A" }}
				</div>
				<div class="col-span-2 hidden lg:block">
					<span
						class="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-medium text-text-muted-light dark:text-text-muted-dark"
						>{{ item.package || "N/A" }}</span
					>
				</div>
				<div
					class="col-span-2 lg:col-span-1 text-center text-sm font-medium text-text-main-light dark:text-text-main-dark">
					{{ item.quantity || 1 }}
				</div>
				<div
					class="col-span-2 lg:col-span-1 text-center text-sm font-medium text-text-main-light dark:text-text-main-dark">
					{{ (item.quantity || 1) * (item.quantity_per_board || 1) }}
				</div>
				<div class="col-span-2 lg:col-span-2 flex justify-end">
					<div class="flex flex-col items-end gap-1">
						<div class="flex items-center gap-2">
							<span
								class="w-2 h-2 rounded-full"
								:class="{
									'bg-green-500': (item.in_stock || 0) >= (item.min_stock || 0),
									'bg-amber-500':
										(item.in_stock || 0) < (item.min_stock || 0) && (item.in_stock || 0) > 0,
									'bg-red-500': (item.in_stock || 0) === 0,
								}"></span>
							<span
								class="text-sm font-medium"
								:class="{
									'text-green-600 dark:text-green-400': (item.in_stock || 0) >= (item.min_stock || 0),
									'text-amber-600 dark:text-amber-400':
										(item.in_stock || 0) < (item.min_stock || 0) && (item.in_stock || 0) > 0,
									'text-red-600 dark:text-red-400': (item.in_stock || 0) === 0,
								}">
								{{ (item.in_stock || 0) > 0 ? "In Stock" : "Out of Stock" }}
							</span>
						</div>
						<span class="text-xs text-text-muted-light dark:text-text-muted-dark"
							>{{ item.in_stock }} available</span
						>
					</div>
				</div>
				<div
					class="col-span-2 lg:col-span-1 flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
					<button
						class="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-text-muted-light dark:text-text-muted-dark transition-colors">
						<span class="material-symbols-outlined text-lg">edit</span>
					</button>
					<button
						class="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-text-muted-light dark:text-text-muted-dark transition-colors">
						<span class="material-symbols-outlined text-lg">more_vert</span>
					</button>
				</div>
			</div>
		</div>

		<div
			class="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/30 dark:bg-gray-800/30"
			v-if="totalPages > 1">
			<span class="text-sm text-text-muted-light dark:text-text-muted-dark">
				Showing
				<span class="font-medium text-text-main-light dark:text-text-main-dark">{{
					(currentPage - 1) * itemsPerPage + 1
				}}</span>
				to
				<span class="font-medium text-text-main-light dark:text-text-main-dark">{{
					Math.min(currentPage * itemsPerPage, filteredItems.length)
				}}</span>
				of
				<span class="font-medium text-text-main-light dark:text-text-main-dark">{{
					filteredItems.length
				}}</span>
				components
			</span>
			<div class="flex gap-2">
				<button
					@click="currentPage--"
					:disabled="currentPage === 1"
					class="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-text-muted-light dark:text-text-muted-dark hover:bg-white dark:hover:bg-gray-700 disabled:opacity-50 transition-colors">
					Previous
				</button>
				<button
					@click="currentPage++"
					:disabled="currentPage === totalPages"
					class="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-text-muted-light dark:text-text-muted-dark hover:bg-white dark:hover:bg-gray-700 transition-colors">
					Next
				</button>
			</div>
		</div>
	</div>

	<!-- Import Modal -->
	<Teleport to="body">
		<div
			v-if="showImportModal"
			class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div class="bg-white rounded-2xl shadow-xl w-full max-w-md">
				<div class="p-6">
					<div class="flex justify-between items-center mb-4">
						<h3 class="text-lg font-semibold text-text-main-light">Import Components</h3>
						<button @click="showImportModal = false" class="p-1 rounded-full hover:bg-gray-100">
							<span class="material-symbols-outlined">close</span>
						</button>
					</div>

					<div class="space-y-4">
						<div
							@click="importType = 'easyeda'"
							:class="{
								'bg-primary/10 border border-primary': importType === 'easyeda',
								'bg-gray-50 border border-gray-200': importType !== 'easyeda',
							}"
							class="p-4 rounded-xl cursor-pointer transition-colors">
							<div class="flex items-center gap-3">
								<div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
									<span class="material-symbols-outlined text-blue-600">design_services</span>
								</div>
								<div>
									<h4 class="font-medium text-text-main-light">EasyEDA</h4>
									<p class="text-sm text-text-muted-light">Import from EasyEDA project</p>
								</div>
							</div>
						</div>

						<div
							@click="importType = 'csv'"
							:class="{
								'bg-primary/10 border border-primary': importType === 'csv',
								'bg-gray-50 border border-gray-200': importType !== 'csv',
							}"
							class="p-4 rounded-xl cursor-pointer transition-colors">
							<div class="flex items-center gap-3">
								<div class="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
									<span class="material-symbols-outlined text-green-600">insert_drive_file</span>
								</div>
								<div>
									<h4 class="font-medium text-text-main-light">CSV File</h4>
									<p class="text-sm text-text-muted-light">Upload BOM from CSV</p>
								</div>
							</div>
						</div>

						<div
							@click="importType = 'json'"
							:class="{
								'bg-primary/10 border border-primary': importType === 'json',
								'bg-gray-50 border border-gray-200': importType !== 'json',
							}"
							class="p-4 rounded-xl cursor-pointer transition-colors">
							<div class="flex items-center gap-3">
								<div class="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
									<span class="material-symbols-outlined text-purple-600">code</span>
								</div>
								<div>
									<h4 class="font-medium text-text-main-light">JSON File</h4>
									<p class="text-sm text-text-muted-light">Upload BOM from JSON</p>
								</div>
							</div>
						</div>
					</div>

					<div class="mt-6 flex justify-end gap-3">
						<button
							@click="showImportModal = false"
							class="px-4 py-2 rounded-lg text-text-main-light font-medium hover:bg-gray-100">
							Cancel
						</button>
						<button
							@click="confirmImport"
							class="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90">
							Continue
						</button>
					</div>
				</div>
			</div>
		</div>
	</Teleport>

	<!-- Add Component Modal -->
	<Teleport to="body">
		<div
			v-if="showAddComponentModal"
			class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
				<div class="p-6">
					<div class="flex justify-between items-center mb-4">
						<h3 class="text-lg font-semibold text-text-main-light">Add Component Manually</h3>
						<button @click="showAddComponentModal = false" class="p-1 rounded-full hover:bg-gray-100">
							<span class="material-symbols-outlined">close</span>
						</button>
					</div>

					<form class="space-y-4">
						<div>
							<label class="block text-sm font-medium text-text-main-light mb-1">Component Name *</label>
							<input
								type="text"
								class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
								placeholder="e.g. STM32F405RGT6"
								v-model="newComponent.name" />
						</div>

						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label class="block text-sm font-medium text-text-main-light mb-1"
									>MPN/Part Number</label
								>
								<input
									type="text"
									class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
									placeholder="Manufacturer Part Number"
									v-model="newComponent.part_number" />
							</div>

							<div>
								<label class="block text-sm font-medium text-text-main-light mb-1">Category</label>
								<input
									type="text"
									class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
									placeholder="e.g. Microcontroller"
									v-model="newComponent.category" />
							</div>
						</div>

						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label class="block text-sm font-medium text-text-main-light mb-1">Manufacturer</label>
								<input
									type="text"
									class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
									placeholder="e.g. STMicroelectronics"
									v-model="newComponent.manufacturer" />
							</div>

							<div>
								<label class="block text-sm font-medium text-text-main-light mb-1">Package</label>
								<input
									type="text"
									class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
									placeholder="e.g. LQFP-64"
									v-model="newComponent.package" />
							</div>
						</div>

						<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<label class="block text-sm font-medium text-text-main-light mb-1"
									>Quantity per Board</label
								>
								<input
									type="number"
									min="1"
									class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
									v-model="newComponent.quantity_per_board" />
							</div>

							<div>
								<label class="block text-sm font-medium text-text-main-light mb-1">Current Stock</label>
								<input
									type="number"
									min="0"
									class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
									v-model="newComponent.in_stock" />
							</div>

							<div>
								<label class="block text-sm font-medium text-text-main-light mb-1"
									>Min Stock Level</label
								>
								<input
									type="number"
									min="0"
									class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
									v-model="newComponent.min_stock" />
							</div>
						</div>

						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label class="block text-sm font-medium text-text-main-light mb-1"
									>Unit Price ($)</label
								>
								<input
									type="number"
									step="0.01"
									min="0"
									class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
									v-model="newComponent.price" />
							</div>

							<div>
								<label class="block text-sm font-medium text-text-main-light mb-1">Unit</label>
								<input
									type="text"
									class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
									placeholder="e.g. pieces"
									v-model="newComponent.unit" />
							</div>
						</div>

						<div>
							<label class="block text-sm font-medium text-text-main-light mb-1">Description</label>
							<textarea
								class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
								placeholder="Component description"
								v-model="newComponent.description"
								rows="3"></textarea>
						</div>
					</form>

					<div class="mt-6 flex justify-end gap-3">
						<button
							@click="showAddComponentModal = false"
							class="px-4 py-2 rounded-lg text-text-main-light font-medium hover:bg-gray-100">
							Cancel
						</button>
						<button
							@click="addComponent"
							class="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90">
							Add Component
						</button>
					</div>
				</div>
			</div>
		</div>
	</Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

interface ProjectItem {
	id: string;
	name: string;
	part_number?: string;
	category?: string;
	manufacturer?: string;
	package?: string;
	quantity?: number;
	quantity_per_board?: number;
	in_stock?: number;
	min_stock?: number;
	price?: number;
	unit?: string;
	description?: string;
}

const props = defineProps<{
	items: ProjectItem[];
}>();

const searchQuery = ref("");
const activeFilter = ref("all");
const currentPage = ref(1);
const itemsPerPage = 10;
const showImportModal = ref(false);
const showAddComponentModal = ref(false);
const importType = ref("easyeda");
const newComponent = ref<Partial<ProjectItem>>({
	quantity_per_board: 1,
	in_stock: 0,
	min_stock: 0,
	price: 0,
	unit: "pieces",
});

const filteredItems = computed(() => {
	let result = props.items;

	// Apply search filter
	if (searchQuery.value) {
		const query = searchQuery.value.toLowerCase();
		result = result.filter(
			(item) =>
				(item.name && item.name.toLowerCase().includes(query)) ||
				(item.part_number && item.part_number.toLowerCase().includes(query)) ||
				(item.description && item.description.toLowerCase().includes(query)) ||
				(item.manufacturer && item.manufacturer.toLowerCase().includes(query)),
		);
	}

	// Apply category filter
	if (activeFilter.value !== "all") {
		result = result.filter((item) => {
			if (!item.category) return false;
			const category = item.category.toLowerCase();
			switch (activeFilter.value) {
				case "capacitors":
					return category.includes("capacitor") || category.includes("condensador");
				case "resistors":
					return category.includes("resistor") || category.includes("resistencia");
				case "ics":
					return category.includes("ic") || category.includes("micro") || category.includes("chip");
				case "connectors":
					return category.includes("connector") || category.includes("conector") || category.includes("jack");
				default:
					return true;
			}
		});
	}

	return result;
});

const paginatedItems = computed(() => {
	const start = (currentPage.value - 1) * itemsPerPage;
	const end = start + itemsPerPage;
	return filteredItems.value.slice(start, end);
});

const totalPages = computed(() => {
	return Math.ceil(filteredItems.value.length / itemsPerPage);
});

const setFilter = (filter: string) => {
	activeFilter.value = filter;
	currentPage.value = 1;
};

const emit = defineEmits(["import-components"]);

const confirmImport = () => {
	console.log(`Importing using ${importType.value} method`);
	// Here we would implement the actual import logic
	showImportModal.value = false;

	// For now, we'll emit an event to handle the import in the parent component
	emit("import-components", { type: importType.value });
};

const addComponent = () => {
	console.log("Adding component:", newComponent.value);
	// Here we would implement the actual add logic
	showAddComponentModal.value = false;
	// Reset form
	newComponent.value = {
		quantity_per_board: 1,
		in_stock: 0,
		min_stock: 0,
		price: 0,
		unit: "pieces",
	};
};

// Import event handler
const handleImport = (importData: { type: string }) => {
	console.log("Importing components:", importData);
	// In a real implementation, this would trigger the import process
	// For now, we'll just show an alert
	alert(`Import functionality for ${importData.type} would be implemented here`);
};
</script>

<style scoped>
.material-symbols-outlined {
	font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24;
}

.no-scrollbar::-webkit-scrollbar {
	display: none;
}

.no-scrollbar {
	-ms-overflow-style: none;
	scrollbar-width: none;
}
</style>
