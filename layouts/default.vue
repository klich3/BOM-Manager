<template>
	<div class="min-h-screen bg-background-light transition-colors duration-300">
		<!-- Sidebar -->
		<aside
			class="fixed w-20 lg:w-24 h-screen flex flex-col items-center py-6 bg-card-light border-r border-gray-200 z-10">
			<div class="mb-8">
				<div
					class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/30">
					<CpuChipIcon class="w-6 h-6" />
				</div>
			</div>

			<nav class="flex-1 w-full flex flex-col items-center gap-4 px-2">
				<NuxtLink
					:to="{ name: 'home' }"
					active-class="bg-gray-900 text-white"
					class="w-12 h-12 text-text-muted-light hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors">
					<Squares2X2Icon class="w-6 h-6" />
				</NuxtLink>
				<NuxtLink
					:to="{ name: 'inventory' }"
					active-class="bg-gray-900 text-white"
					class="w-12 h-12 text-text-muted-light hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors">
					<CubeIcon class="w-6 h-6" />
				</NuxtLink>
				<NuxtLink
					:to="{ name: 'projects' }"
					active-class="bg-gray-900 text-white"
					class="w-12 h-12 text-text-muted-light hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors">
					<RectangleStackIcon class="w-6 h-6" />
				</NuxtLink>
			</nav>

			<div class="mt-auto flex flex-col items-center gap-4">
				<button
					class="w-12 h-12 text-text-muted-light hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors">
					<Cog6ToothIcon class="w-6 h-6" />
				</button>
				<div
					class="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 overflow-hidden border-2 border-white">
					<div class="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600">
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
