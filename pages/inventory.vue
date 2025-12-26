<template>
	<div
		class="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300"
	>
		<!-- Sidebar -->
		<aside
			class="fixed w-20 lg:w-24 h-screen flex flex-col items-center py-6 bg-card-light dark:bg-card-dark border-r border-gray-200 dark:border-gray-800 z-10"
		>
			<div class="mb-8">
				<div
					class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/30"
				>
					<CpuChipIcon class="w-6 h-6" />
				</div>
			</div>

			<nav class="flex-1 w-full flex flex-col items-center gap-4 px-2">
				<NuxtLink
					to="/"
					class="w-12 h-12 text-text-muted-light dark:text-text-muted-dark hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl flex items-center justify-center transition-colors"
				>
					<Squares2X2Icon class="w-6 h-6" />
				</NuxtLink>
				<NuxtLink
					to="/inventory"
					class="w-12 h-12 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-105"
				>
					<CubeIcon class="w-6 h-6" />
				</NuxtLink>
				<NuxtLink
					to="/projects"
					class="w-12 h-12 text-text-muted-light dark:text-text-muted-dark hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl flex items-center justify-center transition-colors"
				>
					<RectangleStackIcon class="w-6 h-6" />
				</NuxtLink>
			</nav>

			<div class="mt-auto flex flex-col items-center gap-4">
				<button
					class="w-12 h-12 text-text-muted-light dark:text-text-muted-dark hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl flex items-center justify-center transition-colors"
				>
					<Cog6ToothIcon class="w-6 h-6" />
				</button>
				<div
					class="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 overflow-hidden border-2 border-white dark:border-gray-700"
				>
					<div
						class="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600"
					>
						<UserIcon class="w-6 h-6" />
					</div>
				</div>
			</div>
		</aside>

		<!-- Main Content -->
		<main class="ml-20 lg:ml-24 min-h-screen">
			<!-- Header -->
			<header
				class="h-20 px-8 flex items-center justify-between bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-gray-800"
			>
				<div>
					<h1
						class="text-2xl font-semibold text-text-main-light dark:text-text-main-dark"
					>
						Inventario de Componentes
					</h1>
				</div>
				<div class="flex items-center gap-4">
					<button
						@click="showImportModal = true"
						class="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
					>
						<DocumentArrowUpIcon class="w-5 h-5" />
						<span>Importar</span>
					</button>
					<button
						@click="exportInventory"
						class="flex items-center gap-2 bg-gray-900 dark:bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
					>
						<DocumentArrowDownIcon class="w-5 h-5" />
						<span>Exportar</span>
					</button>
					<button
						@click="showAddModal = true"
						class="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
					>
						<PlusIcon class="w-5 h-5" />
						<span>Agregar Item</span>
					</button>
				</div>
			</header>

			<!-- Inventory Content -->
			<div class="p-8 pt-4">
				<!-- Stats Row -->
				<div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
					<div
						class="bg-card-light dark:bg-card-dark rounded-2xl p-4 shadow-sm"
					>
						<div class="flex items-center gap-3">
							<div
								class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center"
							>
								<CubeIcon class="w-5 h-5 text-blue-600 dark:text-blue-400" />
							</div>
							<div>
								<p
									class="text-xs text-text-muted-light dark:text-text-muted-dark"
								>
									Total Items
								</p>
								<p
									class="text-2xl font-bold text-text-main-light dark:text-text-main-dark"
								>
									{{ filteredItems.length }}
								</p>
							</div>
						</div>
					</div>

					<div
						class="bg-card-light dark:bg-card-dark rounded-2xl p-4 shadow-sm"
					>
						<div class="flex items-center gap-3">
							<div
								class="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center"
							>
								<CheckCircleIcon
									class="w-5 h-5 text-green-600 dark:text-green-400"
								/>
							</div>
							<div>
								<p
									class="text-xs text-text-muted-light dark:text-text-muted-dark"
								>
									Stock OK
								</p>
								<p
									class="text-2xl font-bold text-text-main-light dark:text-text-main-dark"
								>
									{{ stockOK }}
								</p>
							</div>
						</div>
					</div>

					<div
						class="bg-card-light dark:bg-card-dark rounded-2xl p-4 shadow-sm border border-amber-200 dark:border-amber-900/50"
					>
						<div class="flex items-center gap-3">
							<div
								class="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center"
							>
								<ExclamationTriangleIcon
									class="w-5 h-5 text-amber-600 dark:text-amber-400"
								/>
							</div>
							<div>
								<p
									class="text-xs text-text-muted-light dark:text-text-muted-dark"
								>
									Stock Bajo
								</p>
								<p
									class="text-2xl font-bold text-amber-600 dark:text-amber-400"
								>
									{{ lowStockCount }}
								</p>
							</div>
						</div>
					</div>

					<div
						class="bg-card-light dark:bg-card-dark rounded-2xl p-4 shadow-sm"
					>
						<div class="flex items-center gap-3">
							<div
								class="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center"
							>
								<CurrencyDollarIcon
									class="w-5 h-5 text-purple-600 dark:text-purple-400"
								/>
							</div>
							<div>
								<p
									class="text-xs text-text-muted-light dark:text-text-muted-dark"
								>
									Valor Total
								</p>
								<p
									class="text-2xl font-bold text-text-main-light dark:text-text-main-dark"
								>
									${{ totalValue }}
								</p>
							</div>
						</div>
					</div>
				</div>

				<!-- Search and Filters -->
				<div
					class="bg-card-light dark:bg-card-dark rounded-2xl p-6 shadow-sm mb-6"
				>
					<div class="flex flex-col md:flex-row gap-4">
						<div class="flex-1 relative">
							<MagnifyingGlassIcon
								class="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
							/>
							<input
								v-model="searchQuery"
								type="text"
								placeholder="Buscar por nombre, categoría, proveedor..."
								class="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light dark:text-text-main-dark"
							/>
						</div>
						<select
							v-model="filterCategory"
							class="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light dark:text-text-main-dark"
						>
							<option value="">Todas las categorías</option>
							<option v-for="cat in categories" :key="cat" :value="cat">
								{{ cat }}
							</option>
						</select>
						<select
							v-model="filterStock"
							class="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light dark:text-text-main-dark"
						>
							<option value="all">Todos</option>
							<option value="ok">Stock OK</option>
							<option value="low">Stock Bajo</option>
						</select>
					</div>
				</div>

				<!-- Items Table -->
				<div
					class="bg-card-light dark:bg-card-dark rounded-2xl shadow-sm overflow-hidden"
				>
					<div class="overflow-x-auto">
						<table class="w-full">
							<thead class="bg-gray-50 dark:bg-gray-800">
								<tr>
									<th
										class="px-6 py-4 text-left text-xs font-semibold text-text-muted-light dark:text-text-muted-dark uppercase"
									>
										Componente
									</th>
									<th
										class="px-6 py-4 text-left text-xs font-semibold text-text-muted-light dark:text-text-muted-dark uppercase"
									>
										Categoría
									</th>
									<th
										class="px-6 py-4 text-left text-xs font-semibold text-text-muted-light dark:text-text-muted-dark uppercase"
									>
										Stock
									</th>
									<th
										class="px-6 py-4 text-left text-xs font-semibold text-text-muted-light dark:text-text-muted-dark uppercase"
									>
										Proveedor
									</th>
									<th
										class="px-6 py-4 text-left text-xs font-semibold text-text-muted-light dark:text-text-muted-dark uppercase"
									>
										Precio
									</th>
									<th
										class="px-6 py-4 text-left text-xs font-semibold text-text-muted-light dark:text-text-muted-dark uppercase"
									>
										LCSC
									</th>
									<th
										class="px-6 py-4 text-left text-xs font-semibold text-text-muted-light dark:text-text-muted-dark uppercase"
									>
										Acciones
									</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-gray-200 dark:divide-gray-700">
								<tr v-if="filteredItems.length === 0">
									<td colspan="6" class="px-6 py-12 text-center">
										<CubeIcon
											class="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600"
										/>
										<p class="text-text-muted-light dark:text-text-muted-dark">
											No hay componentes en el inventario
										</p>
										<button
											@click="showAddModal = true"
											class="mt-4 text-primary hover:underline text-sm font-medium"
										>
											Agregar primer componente
										</button>
									</td>
								</tr>
								<tr
									v-for="item in paginatedItems"
									:key="item.id"
									class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
								>
									<td class="px-6 py-4">
										<div>
											<p
												class="text-sm font-semibold text-text-main-light dark:text-text-main-dark"
											>
												{{ item.name }}
											</p>
											<p
												class="text-xs text-text-muted-light dark:text-text-muted-dark"
											>
												{{ item.part_number || "N/A" }}
											</p>
										</div>
									</td>
									<td class="px-6 py-4">
										<span
											class="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-xs font-medium"
										>
											{{ item.category || "Sin categoría" }}
										</span>
									</td>
									<td class="px-6 py-4">
										<div class="flex items-center gap-2">
											<div
												class="w-2 h-2 rounded-full"
												:class="
													item.in_stock < (item.min_stock || 0)
														? 'bg-amber-500'
														: 'bg-green-500'
												"
											></div>
											<span
												class="text-sm text-text-main-light dark:text-text-main-dark"
											>
												{{ item.in_stock }} {{ item.unit }}
											</span>
										</div>
									</td>
									<td
										class="px-6 py-4 text-sm text-text-muted-light dark:text-text-muted-dark"
									>
										{{ item.supplier || "N/A" }}
									</td>
									<td
										class="px-6 py-4 text-sm font-medium text-text-main-light dark:text-text-main-dark"
									>
										${{ (item.price || 0).toFixed(2) }}
									</td>
									<td class="px-6 py-4">
										<div class="flex items-center gap-2">
											<span
												v-if="item.lcsc_part"
												class="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded text-xs font-medium"
											>
												{{ item.lcsc_part }}
											</span>
											<button
												v-if="item.lcsc_part"
												@click="openLcscPreview(item.lcsc_part)"
												class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
												title="Ver en LCSC"
											>
												<GlobeAltIcon
													class="w-4 h-4 text-blue-600 dark:text-blue-400"
												/>
											</button>
											<span
												v-else
												class="text-xs text-text-muted-light dark:text-text-muted-dark"
											>
												N/A
											</span>
										</div>
									</td>
									<td class="px-6 py-4">
										<div class="flex items-center gap-2">
											<button
												@click="editItem(item)"
												class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
											>
												<PencilIcon
													class="w-4 h-4 text-blue-600 dark:text-blue-400"
												/>
											</button>
											<button
												@click="deleteItemConfirm(item.id)"
												class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
											>
												<TrashIcon
													class="w-4 h-4 text-red-600 dark:text-red-400"
												/>
											</button>
										</div>
									</td>
								</tr>
							</tbody>
						</table>
					</div>

					<!-- Pagination -->
					<div
						v-if="totalPages > 1"
						class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between"
					>
						<p class="text-sm text-text-muted-light dark:text-text-muted-dark">
							Mostrando {{ (currentPage - 1) * itemsPerPage + 1 }} a
							{{
								Math.min(currentPage * itemsPerPage, filteredItems.length)
							}}
							de {{ filteredItems.length }} items
						</p>
						<div class="flex gap-2">
							<button
								@click="currentPage--"
								:disabled="currentPage === 1"
								class="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
							>
								Anterior
							</button>
							<button
								@click="currentPage++"
								:disabled="currentPage === totalPages"
								class="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
							>
								Siguiente
							</button>
						</div>
					</div>
				</div>
			</div>
		</main>

		<!-- Add/Edit Item Modal -->
		<div
			v-if="showAddModal"
			class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
		>
			<div
				class="bg-card-light dark:bg-card-dark rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
			>
				<div class="flex items-center justify-between mb-6 p-6 pb-4">
					<h2
						class="text-xl font-semibold text-text-main-light dark:text-text-main-dark"
					>
						{{ editingItem ? "Editar Componente" : "Agregar Componente" }}
					</h2>
					<button
						@click="closeItemModal"
						class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
					>
						<XMarkIcon
							class="w-6 h-6 text-text-muted-light dark:text-text-muted-dark"
						/>
					</button>
				</div>

				<form @submit.prevent="saveItem" class="px-6 pb-6 space-y-4">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label
								class="block text-sm font-medium text-text-main-light dark:text-text-main-dark mb-2"
							>
								Nombre del Componente *
							</label>
							<input
								v-model="itemForm.name"
								type="text"
								required
								class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light dark:text-text-main-dark"
								placeholder="ej. Resistor 10k Ohm"
							/>
						</div>

						<div>
							<label
								class="block text-sm font-medium text-text-main-light dark:text-text-main-dark mb-2"
							>
								Unidad *
							</label>
							<input
								v-model="itemForm.unit"
								type="text"
								required
								class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light dark:text-text-main-dark"
								placeholder="ej. pcs, sets, reels"
							/>
						</div>

						<div>
							<label
								class="block text-sm font-medium text-text-main-light dark:text-text-main-dark mb-2"
							>
								Categoría
							</label>
							<input
								v-model="itemForm.category"
								type="text"
								class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light dark:text-text-main-dark"
								placeholder="ej. Resistores, Capacitores"
							/>
						</div>

						<div>
							<label
								class="block text-sm font-medium text-text-main-light dark:text-text-main-dark mb-2"
							>
								Proveedor
							</label>
							<input
								v-model="itemForm.supplier"
								type="text"
								class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light dark:text-text-main-dark"
								placeholder="ej. LCSC, Mouser, Digikey"
							/>
						</div>

						<div>
							<label
								class="block text-sm font-medium text-text-main-light dark:text-text-main-dark mb-2"
							>
								Número de Parte
							</label>
							<input
								v-model="itemForm.partNumber"
								type="text"
								class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light dark:text-text-main-dark"
								placeholder="ej. RC0805FR-0710KL"
							/>
						</div>

						<div>
							<label
								class="block text-sm font-medium text-text-main-light dark:text-text-main-dark mb-2"
							>
								Parte LCSC
							</label>
							<input
								v-model="itemForm.lcscPart"
								type="text"
								class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light dark:text-text-main-dark"
								placeholder="ej. C12345"
							/>
						</div>

						<div>
							<label
								class="block text-sm font-medium text-text-main-light dark:text-text-main-dark mb-2"
							>
								Cantidad
							</label>
							<input
								v-model.number="itemForm.quantity"
								type="number"
								min="0"
								step="0.1"
								class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light dark:text-text-main-dark"
								placeholder="0"
							/>
						</div>

						<div>
							<label
								class="block text-sm font-medium text-text-main-light dark:text-text-main-dark mb-2"
							>
								Precio ($)
							</label>
							<input
								v-model.number="itemForm.price"
								type="number"
								min="0"
								step="0.01"
								class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light dark:text-text-main-dark"
								placeholder="0.00"
							/>
						</div>

						<div>
							<label
								class="block text-sm font-medium text-text-main-light dark:text-text-main-dark mb-2"
							>
								Stock Actual
							</label>
							<input
								v-model.number="itemForm.inStock"
								type="number"
								min="0"
								step="0.1"
								class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light dark:text-text-main-dark"
								placeholder="0"
							/>
						</div>

						<div>
							<label
								class="block text-sm font-medium text-text-main-light dark:text-text-main-dark mb-2"
							>
								Stock Mínimo
							</label>
							<input
								v-model.number="itemForm.minStock"
								type="number"
								min="0"
								step="0.1"
								class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light dark:text-text-main-dark"
								placeholder="0"
							/>
						</div>
					</div>

					<div>
						<label
							class="block text-sm font-medium text-text-main-light dark:text-text-main-dark mb-2"
						>
							Descripción
						</label>
						<textarea
							v-model="itemForm.description"
							rows="3"
							class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light dark:text-text-main-dark resize-none"
							placeholder="Descripción del componente..."
						></textarea>
					</div>

					<div>
						<label
							class="block text-sm font-medium text-text-main-light dark:text-text-main-dark mb-2"
						>
							Notas
						</label>
						<textarea
							v-model="itemForm.notes"
							rows="2"
							class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light dark:text-text-main-dark resize-none"
							placeholder="Notas adicionales..."
						></textarea>
					</div>

					<div class="flex gap-3 pt-4">
						<button
							type="button"
							@click="closeItemModal"
							class="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-text-main-light dark:text-text-main-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
						>
							Cancelar
						</button>
						<button
							type="submit"
							class="flex-1 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium"
						>
							{{ editingItem ? "Guardar" : "Agregar" }}
						</button>
					</div>
				</form>
			</div>
		</div>

		<!-- Import Modal -->
		<div
			v-if="showImportModal"
			class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
		>
			<div
				class="bg-card-light dark:bg-card-dark rounded-2xl shadow-xl max-w-lg w-full p-6"
			>
				<div class="flex items-center justify-between mb-6">
					<h2
						class="text-xl font-semibold text-text-main-light dark:text-text-main-dark"
					>
						Importar Archivo BOM
					</h2>
					<button
						@click="showImportModal = false"
						class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
					>
						<XMarkIcon
							class="w-6 h-6 text-text-muted-light dark:text-text-muted-dark"
						/>
					</button>
				</div>

				<div class="space-y-4">
					<FileUpload
						@file-selected="handleFileImport"
						@error="handleImportError"
					/>

					<div class="flex gap-3 pt-4">
						<button
							@click="showImportModal = false"
							class="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-text-main-light dark:text-text-main-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
						>
							Cancelar
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
	CpuChipIcon,
	Squares2X2Icon,
	CubeIcon,
	RectangleStackIcon,
	Cog6ToothIcon,
	UserIcon,
	DocumentArrowUpIcon,
	DocumentArrowDownIcon,
	PlusIcon,
	CheckCircleIcon,
	ExclamationTriangleIcon,
	CurrencyDollarIcon,
	MagnifyingGlassIcon,
	PencilIcon,
	TrashIcon,
	XMarkIcon,
	GlobeAltIcon,
} from "@heroicons/vue/24/outline";
import { useDatabase } from "../composables/useDatabase";
import { useExport } from "../composables/useExport";
import { useFileParser } from "../composables/useFileParser";
import FileUpload from "../components/FileUpload.vue";

const db = useDatabase();
const { exportAllInventory } = useExport();
const { parseFile } = useFileParser();

// State
const items = ref<any[]>([]);
const searchQuery = ref("");
const filterCategory = ref("");
const filterStock = ref("all");
const currentPage = ref(1);
const itemsPerPage = 10;
const showAddModal = ref(false);
const showImportModal = ref(false);
const editingItem = ref<any>(null);
const itemForm = ref({
	name: "",
	description: "",
	quantity: 0,
	unit: "pcs",
	category: "",
	supplier: "",
	partNumber: "",
	lcscPart: "",
	price: 0,
	inStock: 0,
	minStock: 0,
	notes: "",
});

// Computed
const categories = computed(() => {
	const cats = new Set(
		items.value.map((item) => item.category).filter(Boolean)
	);
	return Array.from(cats);
});

const filteredItems = computed(() => {
	let filtered = items.value;

	// Search filter
	if (searchQuery.value) {
		const query = searchQuery.value.toLowerCase();
		filtered = filtered.filter(
			(item) =>
				item.name?.toLowerCase().includes(query) ||
				item.category?.toLowerCase().includes(query) ||
				item.supplier?.toLowerCase().includes(query) ||
				item.part_number?.toLowerCase().includes(query)
		);
	}

	// Category filter
	if (filterCategory.value) {
		filtered = filtered.filter(
			(item) => item.category === filterCategory.value
		);
	}

	// Stock filter
	if (filterStock.value === "low") {
		filtered = filtered.filter((item) => item.in_stock < (item.min_stock || 0));
	} else if (filterStock.value === "ok") {
		filtered = filtered.filter(
			(item) => item.in_stock >= (item.min_stock || 0)
		);
	}

	return filtered;
});

const paginatedItems = computed(() => {
	const start = (currentPage.value - 1) * itemsPerPage;
	const end = start + itemsPerPage;
	return filteredItems.value.slice(start, end);
});

const totalPages = computed(() => {
	return Math.ceil(filteredItems.value.length / itemsPerPage);
});

const stockOK = computed(() => {
	return items.value.filter((item) => item.in_stock >= (item.min_stock || 0))
		.length;
});

const lowStockCount = computed(() => {
	return items.value.filter((item) => item.in_stock < (item.min_stock || 0))
		.length;
});

const totalValue = computed(() => {
	return items.value
		.reduce((sum, item) => sum + (item.price || 0) * item.in_stock, 0)
		.toFixed(2);
});

// Methods
const loadItems = async () => {
	try {
		items.value = await db.getAllItems();
	} catch (error) {
		console.error("Error cargando items:", error);
	}
};

const editItem = (item: any) => {
	editingItem.value = item;
	itemForm.value = {
		name: item.name,
		description: item.description || "",
		quantity: item.quantity || 0,
		unit: item.unit || "pcs",
		category: item.category || "",
		supplier: item.supplier || "",
		partNumber: item.part_number || "",
		lcscPart: item.lcsc_part || "",
		price: item.price || 0,
		inStock: item.in_stock || 0,
		minStock: item.min_stock || 0,
		notes: item.notes || "",
	};
	showAddModal.value = true;
};

const deleteItemConfirm = async (id: string) => {
	if (confirm("¿Estás seguro de eliminar este componente?")) {
		await db.deleteItem(id);
		await loadItems();
	}
};

const exportInventory = () => {
	exportAllInventory("xlsx");
};

const saveItem = async () => {
	try {
		if (editingItem.value) {
			await db.updateItem(editingItem.value.id, itemForm.value);
		} else {
			await db.createItem(itemForm.value);
		}

		await loadItems();
		closeItemModal();
	} catch (error) {
		console.error("Error guardando item:", error);
	}
};

const closeItemModal = () => {
	showAddModal.value = false;
	editingItem.value = null;
	itemForm.value = {
		name: "",
		description: "",
		quantity: 0,
		unit: "pcs",
		category: "",
		supplier: "",
		partNumber: "",
		lcscPart: "",
		price: 0,
		inStock: 0,
		minStock: 0,
		notes: "",
	};
};

const handleFileImport = async (file: File) => {
	try {
		// Parsear archivo
		const result = await parseFile(file);

		if (result.success && result.items.length > 0) {
			// Guardar items en la base de datos
			for (const item of result.items) {
				await db.createItem(item);
			}

			await loadItems();
			showImportModal.value = false;
			alert(`Importación exitosa: ${result.items.length} items agregados`);
		} else {
			alert(`Error en la importación: ${result.errors.join(", ")}`);
		}
	} catch (error) {
		console.error("Error importando archivo:", error);
		alert("Error al importar archivo");
	}
};

const handleImportError = (message: string) => {
	console.error("Error de importación:", message);
};

const openLcscPreview = (lcscPart: string) => {
	window.open(`https://lcsc.com/${lcscPart}.html`);
};

// Lifecycle
onMounted(async () => {
	await loadItems();
});
</script>

<style scoped>
.bg-background-light {
	background-color: #f3f4f6;
}

.dark .bg-background-dark {
	background-color: #111827;
}

.bg-card-light {
	background-color: #ffffff;
}

.dark .bg-card-dark {
	background-color: #1f2937;
}

.text-text-main-light {
	color: #1f2937;
}

.dark .text-text-main-dark {
	color: #f9fafb;
}

.text-text-muted-light {
	color: #6b7280;
}

.dark .text-text-muted-dark {
	color: #9ca3af;
}

.bg-primary {
	background-color: #10b981;
}

.shadow-primary\/30 {
	box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.3);
}
</style>
