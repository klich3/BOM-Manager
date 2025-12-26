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
					class="w-12 h-12 text-text-muted-light dark:text-text-muted-dark hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl flex items-center justify-center transition-colors"
				>
					<CubeIcon class="w-6 h-6" />
				</NuxtLink>
				<NuxtLink
					to="/projects"
					class="w-12 h-12 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-105"
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
			<slot />
		</main>
	</div>
</template>

<script setup lang="ts">
import {
	CpuChipIcon,
	Squares2X2Icon,
	CubeIcon,
	RectangleStackIcon,
	Cog6ToothIcon,
	UserIcon,
} from "@heroicons/vue/24/outline";
</script>
